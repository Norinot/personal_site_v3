import { useEffect, useMemo, useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import { Play, Pause, SkipBack, SkipForward, Square, Volume2, VolumeX } from "lucide-react";
import styles from "./Terminal.module.scss";
import { PROFILE } from "@/content/profile";
import { Banner, About, SkillsSection, ExperienceLog, AppsListing, ServicesGrid, HelpTable } from "./commands";
import { ProjectsGrid, ProjectDetail } from "./Projects";
import { findProject } from "./findProject";
import { MusicView } from "./MusicView";
import { ContactInfo, MessageForm } from "./ContactPanel";
import { Cv } from "./Cv";
import { HIRE_STEPS, buildMailtoHref } from "./hireWizard";
import { useMusicPlayer } from "./useMusicPlayer";
import { MiniVisualizer } from "./graphics";
import SwitchButton from "@/ui-switch/SwitchButton.component";

const THEMES = ["phosphor", "emerald", "ice", "paper"] as const;
type Theme = (typeof THEMES)[number];

const NAV_COMMANDS = [
  "about",
  "skills",
  "projects",
  "experience",
  "apps",
  "services",
  "music",
  "contact",
  "hire",
  "cv",
] as const;

const COMMAND_KEYS = [
  "help",
  "about",
  "whoami",
  "banner",
  "skills",
  "experience",
  "exp",
  "apps",
  "services",
  "contact",
  "message",
  "music",
  "cv",
  "theme",
  "clear",
  "hire",
  "play",
  "stop",
  "projects",
] as const;

const ALIASES: Record<string, string> = { man: "help", resume: "cv", email: "contact" };

type ViewDescriptor =
  | { type: "banner" }
  | { type: "about" }
  | { type: "skills" }
  | { type: "projects" }
  | { type: "project"; id: string }
  | { type: "experience" }
  | { type: "apps" }
  | { type: "services" }
  | { type: "music" }
  | { type: "contact" }
  | { type: "message" }
  | { type: "cv" }
  | { type: "help" }
  | { type: "themeChanged"; theme: string }
  | { type: "ready" }
  | { type: "wizardIntro" }
  | { type: "wizardStep"; question: string; hint: string }
  | { type: "wizardAnswer"; value: string }
  | { type: "wizardCancelled" }
  | { type: "wizardReady"; data: Record<string, string> };

type EntryInput =
  | { kind: "echo"; text: string }
  | { kind: "error"; text: string }
  | { kind: "view"; view: ViewDescriptor };

type Entry = EntryInput & { id: number };

interface WizardState {
  step: number;
  data: Record<string, string>;
}

interface TerminalProps {
  onSwitchToClassic?: () => void;
}

const Terminal = ({ onSwitchToClassic }: TerminalProps) => {
  const { t, i18n } = useTranslation();
  const player = useMusicPlayer();

  const [theme, setThemeState] = useState<Theme>(() => {
    const saved = localStorage.getItem("terminal-theme");
    return (THEMES as readonly string[]).includes(saved ?? "") ? (saved as Theme) : "phosphor";
  });
  const [crtOn, setCrtOn] = useState(() => localStorage.getItem("terminal-crt") !== "off");
  const [entries, setEntries] = useState<Entry[]>([]);
  const [cmdValue, setCmdValue] = useState("");
  const [wizard, setWizard] = useState<WizardState | null>(null);
  const [uptime, setUptime] = useState("00:00:00");
  const [clock, setClock] = useState("");

  const idRef = useRef(0);
  const historyRef = useRef<string[]>([]);
  const [historyIndex, setHistoryIndex] = useState(0);
  const busyRef = useRef(false);
  const outRef = useRef<HTMLDivElement>(null);
  const termRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const bootedRef = useRef(false);

  const reduced = useMemo(() => matchMedia("(prefers-reduced-motion: reduce)").matches, []);

  const canRoute = useMemo(() => {
    try {
      history.replaceState(null, "", location.href);
      return true;
    } catch {
      return false;
    }
  }, []);

  function pushEntry(entry: EntryInput) {
    setEntries((prev) => [...prev, { ...entry, id: idRef.current++ }]);
  }

  function scrollToBottom() {
    requestAnimationFrame(() => {
      if (termRef.current) termRef.current.scrollTop = termRef.current.scrollHeight;
    });
  }

  useEffect(scrollToBottom, [entries]);

  function setTheme(next: Theme) {
    setThemeState(next);
    localStorage.setItem("terminal-theme", next);
  }

  function toggleCrt() {
    setCrtOn((on) => {
      const next = !on;
      localStorage.setItem("terminal-crt", next ? "on" : "off");
      return next;
    });
  }

  function updateHash(key: string, args: string[]) {
    if (!canRoute) return;
    if (["clear", "theme", "play", "stop"].includes(key)) return;
    const frag = [key].concat(args).join("/");
    try {
      history.replaceState(null, "", "#" + frag);
    } catch {
      /* ignore */
    }
  }

  function startWizard() {
    setWizard({ step: 0, data: {} });
    pushEntry({ kind: "view", view: { type: "wizardIntro" } });
    askStep(0);
  }

  function askStep(step: number) {
    const s = HIRE_STEPS[step];
    pushEntry({ kind: "view", view: { type: "wizardStep", question: t(s.questionKey), hint: t(s.hintKey) } });
    inputRef.current?.setAttribute("placeholder", t(s.hintKey));
  }

  function processWizardInput(value: string) {
    if (value.toLowerCase() === "cancel") {
      setWizard(null);
      inputRef.current?.setAttribute("placeholder", "help");
      pushEntry({ kind: "view", view: { type: "wizardCancelled" } });
      return;
    }
    if (!value) {
      askStep(wizard!.step);
      return;
    }
    pushEntry({ kind: "view", view: { type: "wizardAnswer", value } });
    const key = HIRE_STEPS[wizard!.step].key;
    const nextData = { ...wizard!.data, [key]: value };
    const nextStep = wizard!.step + 1;
    if (nextStep < HIRE_STEPS.length) {
      setWizard({ step: nextStep, data: nextData });
      askStep(nextStep);
    } else {
      setWizard(null);
      inputRef.current?.setAttribute("placeholder", "help");
      pushEntry({ kind: "view", view: { type: "wizardReady", data: nextData } });
    }
  }

  function executeCommand(key: string, args: string[]) {
    switch (key) {
      case "help":
        pushEntry({ kind: "view", view: { type: "help" } });
        break;
      case "about":
      case "whoami":
        pushEntry({ kind: "view", view: { type: "about" } });
        break;
      case "banner":
        pushEntry({ kind: "view", view: { type: "banner" } });
        break;
      case "skills":
        pushEntry({ kind: "view", view: { type: "skills" } });
        break;
      case "experience":
      case "exp":
        pushEntry({ kind: "view", view: { type: "experience" } });
        break;
      case "apps":
        pushEntry({ kind: "view", view: { type: "apps" } });
        break;
      case "services":
        pushEntry({ kind: "view", view: { type: "services" } });
        break;
      case "contact":
        pushEntry({ kind: "view", view: { type: "contact" } });
        break;
      case "message":
        pushEntry({ kind: "view", view: { type: "message" } });
        break;
      case "music":
        pushEntry({ kind: "view", view: { type: "music" } });
        break;
      case "cv":
        pushEntry({ kind: "view", view: { type: "cv" } });
        break;
      case "clear":
        setEntries([]);
        break;
      case "hire":
        startWizard();
        break;
      case "theme": {
        const requested = args[0];
        if (requested && !(THEMES as readonly string[]).includes(requested)) {
          pushEntry({ kind: "error", text: `${t("terminal.errors.unknownTheme")} "${requested}" · ${THEMES.join(", ")}` });
          break;
        }
        const next = (requested as Theme) || THEMES[(THEMES.indexOf(theme) + 1) % THEMES.length];
        setTheme(next);
        pushEntry({ kind: "view", view: { type: "themeChanged", theme: next } });
        break;
      }
      case "play": {
        const i = args.length ? parseInt(args[0], 10) - 1 : 0;
        if (isNaN(i) || i < 0 || i >= player.songs.length) {
          pushEntry({ kind: "error", text: `${t("terminal.errors.trackRange")} (1–${player.songs.length})` });
          break;
        }
        player.playTrack(player.songs[i].id);
        break;
      }
      case "stop":
        player.stop();
        break;
      case "projects": {
        if (!args.length) {
          pushEntry({ kind: "view", view: { type: "projects" } });
          break;
        }
        const query = args.join(" ");
        const found = findProject(query);
        if (found) pushEntry({ kind: "view", view: { type: "project", id: found.id } });
        else pushEntry({ kind: "error", text: `${t("terminal.errors.noProject")} "${query}"` });
        break;
      }
      default:
        pushEntry({ kind: "error", text: `${t("terminal.errors.notFound")} ${key}` });
    }
  }

  function runCommand(raw: string) {
    const trimmed = raw.trim();
    if (wizard) {
      pushEntry({ kind: "echo", text: trimmed || "—" });
      processWizardInput(trimmed);
      return;
    }
    if (!trimmed) return;
    pushEntry({ kind: "echo", text: trimmed });
    historyRef.current.push(trimmed);
    setHistoryIndex(historyRef.current.length);
    const [head, ...args] = trimmed.split(/\s+/);
    const key = ALIASES[head.toLowerCase()] ?? head.toLowerCase();
    executeCommand(key, args);
    updateHash(key, args);
  }

  function typeThenRun(text: string) {
    if (busyRef.current) return;
    busyRef.current = true;
    setCmdValue("");
    inputRef.current?.focus();
    if (reduced) {
      setCmdValue(text);
      setTimeout(() => {
        runCommand(text);
        setCmdValue("");
        busyRef.current = false;
      }, 60);
      return;
    }
    let i = 0;
    const tick = () => {
      i++;
      setCmdValue(text.slice(0, i));
      if (i < text.length) setTimeout(tick, 34);
      else
        setTimeout(() => {
          runCommand(text);
          setCmdValue("");
          busyRef.current = false;
        }, 190);
    };
    tick();
  }

  function openDeepLink() {
    if (!canRoute) return;
    let frag = "";
    try {
      frag = decodeURIComponent(location.hash.replace(/^#/, "")).trim();
    } catch {
      return;
    }
    if (!frag) return;
    const parts = frag.split("/").filter(Boolean);
    if (!parts.length) return;
    const key = ALIASES[parts[0].toLowerCase()] ?? parts[0].toLowerCase();
    if (!(COMMAND_KEYS as readonly string[]).includes(key)) return;
    setTimeout(() => typeThenRun(parts.join(" ")), 60);
  }

  // Boot once on mount: banner + ready line, then honour any deep link hash.
  useEffect(() => {
    if (bootedRef.current) return;
    bootedRef.current = true;
    pushEntry({ kind: "view", view: { type: "banner" } });
    pushEntry({ kind: "view", view: { type: "ready" } });
    inputRef.current?.focus();
    openDeepLink();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    const start = Date.now();
    const tick = () => {
      const s = Math.floor((Date.now() - start) / 1000);
      setUptime(
        [s / 3600, (s / 60) % 60, s % 60].map((v) => String(Math.floor(v)).padStart(2, "0")).join(":"),
      );
      setClock(new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }));
    };
    tick();
    const id = setInterval(tick, 1000);
    return () => clearInterval(id);
  }, []);

  // Stop any playing audio when the terminal unmounts (e.g. switching UIs away).
  useEffect(() => {
    return () => {
      player.audioRef.current?.pause();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  function handleKeyDown(e: React.KeyboardEvent<HTMLInputElement>) {
    if (e.key === "Enter") {
      runCommand(cmdValue);
      setCmdValue("");
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      if (historyIndex > 0) {
        const idx = historyIndex - 1;
        setHistoryIndex(idx);
        setCmdValue(historyRef.current[idx] ?? "");
      }
    } else if (e.key === "ArrowDown") {
      e.preventDefault();
      if (historyIndex < historyRef.current.length) {
        const idx = historyIndex + 1;
        setHistoryIndex(idx);
        setCmdValue(historyRef.current[idx] ?? "");
      }
    } else if (e.key === "Tab") {
      e.preventDefault();
      const stub = cmdValue.trim().toLowerCase();
      if (!stub) return;
      const matches = COMMAND_KEYS.filter((k) => k.startsWith(stub));
      if (matches.length === 1) setCmdValue(matches[0] + " ");
      else if (matches.length > 1) pushEntry({ kind: "error", text: matches.join("  ") });
    } else if (e.key === "l" && e.ctrlKey) {
      e.preventDefault();
      setEntries([]);
    }
  }

  return (
    <div className={styles.root} data-terminal-theme={theme}>
      <audio ref={player.audioRef} />
      <div className={`${styles.crt} ${crtOn ? styles.crtOn : ""}`} aria-hidden="true" />

      <div className={styles.win}>
        <header className={styles.titlebar}>
          <span className={styles.dots} aria-hidden="true">
            <i />
            <i />
            <i />
          </span>
          <span className={styles.tbTitle}>
            {PROFILE.handle}@budapest: <b>~/portfolio</b>
          </span>
          <div className={styles.tbRight}>
            <button type="button" className={styles.chip} aria-pressed={crtOn} onClick={toggleCrt}>
              <span className={styles.chipFace}>scanlines</span>
            </button>
            <button
              type="button"
              className={styles.chip}
              onClick={() => setTheme(THEMES[(THEMES.indexOf(theme) + 1) % THEMES.length])}
            >
              <span className={styles.chipFace}>theme: {theme}</span>
            </button>
            <button
              type="button"
              className={styles.chip}
              onClick={() => i18n.changeLanguage(i18n.language === "hu" ? "en" : "hu")}
            >
              <span className={styles.chipFace}>lang: {(i18n.language || "en").toUpperCase()}</span>
            </button>
            {onSwitchToClassic && <SwitchButton label="RETURN TO SITE" onActivate={onSwitchToClassic} />}
          </div>
        </header>

        <nav className={styles.mobileNav} aria-label="Sections (mobile)">
          {NAV_COMMANDS.map((cmd) => (
            <button key={cmd} type="button" className={styles.chip} onClick={() => typeThenRun(cmd)}>
              <span className={styles.chipFace}>{cmd}</span>
            </button>
          ))}
        </nav>

        <div className={styles.split}>
          <main className={styles.term} ref={termRef}>
            <div className={styles.out} ref={outRef} role="log" aria-live="polite" aria-label="Terminal output">
              {entries.map((entry) => (
                <div key={entry.id} className={`${styles.blk} ${reduced ? "" : styles.stagger}`}>
                  {entry.kind === "echo" && (
                    <div className={styles.echo}>
                      <span className={styles.ps1}>visitor@norinot:~$</span> <b>{entry.text}</b>
                    </div>
                  )}
                  {entry.kind === "error" && <div className={`${styles.ln} ${styles.e}`}>{entry.text}</div>}
                  {entry.kind === "view" && <ViewRenderer view={entry.view} player={player} theme={theme} />}
                </div>
              ))}
            </div>

            <div className={styles.promptline}>
              <label className={styles.sr} htmlFor="terminal-cmd">
                Type a command
              </label>
              <span className={styles.ps1}>
                <span className={styles.at}>visitor@norinot</span>:~$
              </span>
              <input
                id="terminal-cmd"
                ref={inputRef}
                className={styles.cmd}
                autoComplete="off"
                autoCapitalize="off"
                autoCorrect="off"
                spellCheck={false}
                placeholder="type help"
                value={cmdValue}
                onChange={(e) => setCmdValue(e.target.value)}
                onKeyDown={handleKeyDown}
              />
              <span className={styles.caret} aria-hidden="true" />
            </div>
          </main>

          <aside className={styles.aside} aria-label="Session panel">
            <div>
              <h2>{t("terminal.session.sessionHeading")}</h2>
              <dl>
                <div className={styles.row}>
                  <dt>{t("terminal.session.user")}</dt>
                  <dd>visitor</dd>
                </div>
                <div className={styles.row}>
                  <dt>{t("terminal.session.host")}</dt>
                  <dd>norinot.hu</dd>
                </div>
                <div className={styles.row}>
                  <dt>{t("terminal.session.shell")}</dt>
                  <dd>norsh 2.0</dd>
                </div>
                <div className={styles.row}>
                  <dt>{t("terminal.session.uptime")}</dt>
                  <dd>{uptime}</dd>
                </div>
              </dl>
            </div>

            <nav aria-label="Sections">
              <h2>{t("terminal.session.commandsHeading")}</h2>
              <div className={styles.navlist}>
                {[...NAV_COMMANDS, "help"].map((cmd) => (
                  <button key={cmd} type="button" onClick={() => typeThenRun(cmd)}>
                    {cmd}
                  </button>
                ))}
              </div>
            </nav>

            <div className={styles.player}>
              <h2>{t("terminal.session.nowPlayingHeading")}</h2>
              <div className={styles.tracks}>
                {player.songs.map((song) => (
                  <button
                    key={song.id}
                    type="button"
                    aria-current={song.id === player.activeId}
                    onClick={() => player.playTrack(song.id)}
                  >
                    <span className={styles.no}>{song.id === player.activeId ? "▶" : "—"}</span>
                    <span>{song.title}</span>
                  </button>
                ))}
              </div>
              <div className={styles.transport}>
                <button type="button" aria-label={t("terminal.music.prev")} onClick={() => player.skip("prev")}>
                  <SkipBack size={14} />
                </button>
                <button
                  type="button"
                  className={styles.playBtn}
                  aria-label={player.playing ? t("terminal.music.pause") : t("terminal.music.play")}
                  onClick={player.togglePlay}
                >
                  {player.playing ? <Pause size={14} /> : <Play size={14} />}
                </button>
                <button type="button" aria-label={t("terminal.music.next")} onClick={() => player.skip("next")}>
                  <SkipForward size={14} />
                </button>
                <button type="button" aria-label={t("terminal.music.stop")} onClick={player.stop}>
                  <Square size={12} />
                </button>
              </div>
              <div className={styles.volumeRow}>
                <button
                  type="button"
                  aria-label={player.volume === 0 ? t("terminal.music.play") : t("terminal.music.volume")}
                  onClick={() => player.setVolume(player.volume === 0 ? 1 : 0)}
                >
                  {player.volume === 0 ? <VolumeX size={14} /> : <Volume2 size={14} />}
                </button>
                <input
                  type="range"
                  className={styles.volumeSlider}
                  aria-label={t("terminal.music.volume")}
                  min={0}
                  max={100}
                  value={Math.round(player.volume * 100)}
                  onChange={(e) => player.setVolume(Number(e.target.value) / 100)}
                />
              </div>
              <MiniVisualizer analyser={player.analyser} playing={player.playing} />
            </div>
          </aside>
        </div>

        <footer className={styles.status}>
          <span className={styles.mode}>NORSH</span>
          <span className={styles.seg}>utf-8</span>
          <span className={styles.seg}>{theme}</span>
          <span className={styles.right}>
            <span className={`${styles.seg} ${styles.nowplaying}`}>
              {player.activeSong ? `♪ ${player.activeSong.title}` : "—"}
            </span>
            <span className={styles.seg}>{clock}</span>
          </span>
        </footer>
      </div>
    </div>
  );
};

function ViewRenderer({
  view,
  player,
  theme,
}: {
  view: ViewDescriptor;
  player: ReturnType<typeof useMusicPlayer>;
  theme: string;
}) {
  const { t } = useTranslation();
  switch (view.type) {
    case "banner":
      return <Banner />;
    case "about":
      return <About />;
    case "skills":
      return <SkillsSection />;
    case "projects":
      return <ProjectsGrid />;
    case "project": {
      const project = findProject(view.id);
      return project ? <ProjectDetail project={project} /> : null;
    }
    case "experience":
      return <ExperienceLog />;
    case "apps":
      return <AppsListing />;
    case "services":
      return <ServicesGrid />;
    case "music":
      return <MusicView player={player} />;
    case "contact":
      return <ContactInfo />;
    case "message":
      return <MessageForm />;
    case "cv":
      return <Cv />;
    case "help":
      return <HelpTable />;
    case "ready":
      return <div className={styles.ln}>{t("terminal.boot.ready")}</div>;
    case "themeChanged":
      return (
        <div className={styles.ln}>
          {t("terminal.status.themeChanged")} <span className={styles.s}>{theme}</span>
        </div>
      );
    case "wizardIntro":
      return <div className={`${styles.ln} ${styles.c}`}>{t("terminal.wizard.intro")}</div>;
    case "wizardStep":
      return (
        <div className={styles.wiz}>
          <div className={styles.q}>{view.question}</div>
          <div className={styles.hintq}>{view.hint}</div>
        </div>
      );
    case "wizardAnswer":
      return (
        <div className={styles.ln}>
          <span className={styles.c}>└</span> <span className={styles.ans}>{view.value}</span>
        </div>
      );
    case "wizardCancelled":
      return <div className={`${styles.ln} ${styles.c}`}>{t("terminal.wizard.cancelled")}</div>;
    case "wizardReady": {
      const href = buildMailtoHref(view.data, t("terminal.wizard.subjectPrefix"));
      return (
        <div className={styles.case} style={{ maxWidth: 520 }}>
          <h3>{t("terminal.wizard.readyTitle")}</h3>
          <div className={styles.meta}>
            {view.data.kind || "general"} · {view.data.name || ""}
          </div>
          <p className={styles.lead}>{t("terminal.wizard.readyLead")}</p>
          <div style={{ marginTop: 12 }}>
            <a className={styles.f} href={href} style={{ textDecoration: "none" }}>
              {t("terminal.wizard.openEmail")}
            </a>
          </div>
        </div>
      );
    }
    default:
      return null;
  }
}

export default Terminal;
