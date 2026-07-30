import { useEffect, useRef } from "react";
import portrait from "@/assets/portrait.jpg";
import { SKILLS } from "@/content/skills";
import styles from "./Terminal.module.scss";

const MIN_AUDIBLE_HZ = 20;

/**
 * Maps a linear 0..1 sweep position to a frequency bin using equal space per
 * *octave* (20Hz–Nyquist), the same convention a real EQ/spectrum analyzer
 * uses — not equal space per raw FFT bin. getByteFrequencyData bins are
 * linearly spaced in Hz, so a bare bin-index curve either buries everything
 * in the first few bins (pure log against bin *count*) or gives the mostly-
 * silent top of the spectrum a whole arc (linear). Going through actual Hz
 * means the curve's shape is anchored to real acoustic octaves instead of
 * however many bins happen to exist.
 *
 * The other half of the fix is interpolating between the two nearest bins
 * rather than flooring to one — with few bins covering a wide low-frequency
 * range, a hard floor() makes many consecutive sweep positions read the
 * exact same bin, which looks like a flat "stuck" plateau rather than real
 * variation.
 */
function sampleAnalyserAt(data: Uint8Array, analyser: AnalyserNode, t: number): number {
  const sampleRate = analyser.context.sampleRate;
  const binWidth = sampleRate / analyser.fftSize;
  const octaves = Math.log2(sampleRate / 2 / MIN_AUDIBLE_HZ);
  const freq = MIN_AUDIBLE_HZ * Math.pow(2, Math.max(0, t) * octaves);
  const pos = Math.max(0, Math.min(data.length - 1, freq / binWidth));
  const lo = Math.floor(pos);
  const hi = Math.min(data.length - 1, lo + 1);
  const frac = pos - lo;
  return (data[lo] * (1 - frac) + data[hi] * frac) / 255;
}

/** Deterministic PRNG seeded from a string, so generated art stays stable per id. */
function seeded(str: string) {
  let h = 1779033703 ^ str.length;
  for (let i = 0; i < str.length; i++) {
    h = Math.imul(h ^ str.charCodeAt(i), 3432918353);
    h = (h << 13) | (h >>> 19);
  }
  return () => {
    h = Math.imul(h ^ (h >>> 16), 2246822507);
    h = Math.imul(h ^ (h >>> 13), 3266489909);
    return ((h ^= h >>> 16) >>> 0) / 4294967296;
  };
}

interface ProjectCoverProps {
  seed: string;
  width?: number;
  height?: number;
}

/** Generated circuit-trace cover art for a project card, stable per project id. */
export function ProjectCover({ seed, width = 300, height = 104 }: ProjectCoverProps) {
  const r = seeded(seed);
  const step = 13;
  const dots: React.ReactNode[] = [];
  for (let x = step / 2; x < width; x += step) {
    for (let y = step / 2; y < height; y += step) {
      dots.push(<circle key={`d${x}-${y}`} cx={x} cy={y} r={0.6} fill="var(--line)" />);
    }
  }

  const paths: React.ReactNode[] = [];
  for (let i = 0; i < 9; i++) {
    let x = 0;
    let y = Math.round(r() * (height / step)) * step + step / 2;
    let d = `M${x} ${y.toFixed(1)}`;
    while (x < width) {
      const run = (1 + Math.floor(r() * 3)) * step;
      x += run;
      d += ` H${Math.min(x, width).toFixed(1)}`;
      if (r() > 0.45 && x < width) {
        const dy = (r() > 0.5 ? 1 : -1) * step;
        if (y + dy > 4 && y + dy < height - 4) {
          y += dy;
          d += ` V${y.toFixed(1)}`;
        }
      }
    }
    const bright = r() > 0.7;
    paths.push(
      <path
        key={`p${i}`}
        d={d}
        fill="none"
        stroke={bright ? "var(--accent)" : "var(--line)"}
        strokeWidth={bright ? 1.2 : 1}
        opacity={bright ? 0.85 : 0.5}
      />,
    );
    if (bright) {
      paths.push(<circle key={`e${i}`} cx={Math.min(x, width).toFixed(1)} cy={y.toFixed(1)} r={2.4} fill="var(--accent)" />);
    }
  }

  return (
    <svg viewBox={`0 0 ${width} ${height}`} preserveAspectRatio="xMidYMid slice" aria-hidden="true">
      {dots}
      {paths}
    </svg>
  );
}

const RADAR_LEVEL: Record<string, number> = { expert: 1, advanced: 0.72, intermediate: 0.46 };

/** Skills radar — point positions come straight from proficiency tier, nothing invented. */
export function SkillsRadar() {
  const points = (["expert", "advanced", "intermediate"] as const).flatMap((tier) =>
    (SKILLS[tier] ?? []).map((skill) => ({ name: skill.name, v: RADAR_LEVEL[tier] })),
  );

  const size = 300;
  const cx = size / 2;
  const cy = size / 2 + 4;
  const R = 96;
  const n = points.length;
  const angle = (i: number) => (i / n) * Math.PI * 2 - Math.PI / 2;

  const poly = points
    .map((p, i) => `${(cx + Math.cos(angle(i)) * R * p.v).toFixed(1)},${(cy + Math.sin(angle(i)) * R * p.v).toFixed(1)}`)
    .join(" ");

  return (
    <svg viewBox={`0 0 ${size} ${size + 8}`} role="img" aria-label="Skill levels by technology">
      {[1, 0.72, 0.46, 0.22].map((f) => (
        <circle key={f} className={styles.radarRing} cx={cx} cy={cy} r={R * f} />
      ))}
      {(["expert", "advanced", "intermediate"] as const).map((tier, i) => (
        <text key={tier} className={styles.radarTick} x={cx + 3} y={cy - R * [1, 0.72, 0.46][i] + 9}>
          {tier}
        </text>
      ))}
      {points.map((_, i) => (
        <line
          key={i}
          className={styles.radarSpoke}
          x1={cx}
          y1={cy}
          x2={cx + Math.cos(angle(i)) * R}
          y2={cy + Math.sin(angle(i)) * R}
        />
      ))}
      <polygon className={styles.radarArea} points={poly} />
      {points.map((p, i) => {
        const x = cx + Math.cos(angle(i)) * R * p.v;
        const y = cy + Math.sin(angle(i)) * R * p.v;
        const lx = cx + Math.cos(angle(i)) * (R + 18);
        const ly = cy + Math.sin(angle(i)) * (R + 18);
        const anchor = Math.abs(Math.cos(angle(i))) < 0.25 ? "middle" : Math.cos(angle(i)) > 0 ? "start" : "end";
        return (
          <g key={p.name}>
            <circle className={styles.radarDot} cx={x} cy={y} r={2.6} />
            <text className={styles.radarLbl} x={lx} y={ly + 3} textAnchor={anchor}>
              {p.name}
            </text>
          </g>
        );
      })}
    </svg>
  );
}

/** Portrait rendered as a photo being "decoded" on screen — decorative overlay layers only. */
export function DecodingPortrait({ caption }: { caption: string }) {
  return (
    <figure className={styles.fig + " " + styles.photo}>
      <div className={styles.frame}>
        <img src={portrait} alt="" />
        <span className={styles.duo} />
        <span className={styles.gridO} />
        <span className={styles.sweep} />
      </div>
      <figcaption>{caption}</figcaption>
    </figure>
  );
}

/** Compact bar visualizer for the sidebar mini-player. */
export function MiniVisualizer({ analyser, playing }: { analyser: AnalyserNode | null; playing: boolean }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const rafRef = useRef<number>(0);

  useEffect(() => {
    const draw = () => {
      const c = canvasRef.current;
      if (c) {
        const dpr = Math.min(devicePixelRatio || 1, 2);
        const w = c.clientWidth || 220;
        const h = c.clientHeight || 34;
        if (c.width !== w * dpr) {
          c.width = w * dpr;
          c.height = h * dpr;
        }
        const g = c.getContext("2d")!;
        g.setTransform(dpr, 0, 0, dpr, 0, 0);
        g.clearRect(0, 0, w, h);

        const css = getComputedStyle(document.documentElement);
        g.fillStyle = (playing ? css.getPropertyValue("--accent") : css.getPropertyValue("--line")).trim() || "#5e747d";

        const bars = 28;
        const bw = w / bars;
        let data: Uint8Array | null = null;
        if (analyser && playing) {
          data = new Uint8Array(analyser.frequencyBinCount);
          analyser.getByteFrequencyData(data as Uint8Array<ArrayBuffer>);
        }
        for (let i = 0; i < bars; i++) {
          let v: number;
          if (data) v = sampleAnalyserAt(data, analyser!, i / bars);
          else if (playing) v = (Math.sin(Date.now() / 240 + i * 0.55) * 0.5 + 0.5) * (0.35 + 0.5 * Math.random());
          else v = 0.06;
          const bh = Math.max(1.5, v * (h - 4));
          g.fillRect(i * bw + 1, h - bh - 2, bw - 2, bh);
        }
      }
      rafRef.current = requestAnimationFrame(draw);
    };
    rafRef.current = requestAnimationFrame(draw);
    return () => cancelAnimationFrame(rafRef.current);
  }, [analyser, playing]);

  return <canvas ref={canvasRef} className={styles.viz} aria-hidden="true" />;
}

interface OscilloscopeProps {
  analyser: AnalyserNode | null;
  playing: boolean;
}

/** Circular signal scope — draws from the live analyser when playing, an idle pulse otherwise. */
export function Oscilloscope({ analyser, playing }: OscilloscopeProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const rafRef = useRef<number>(0);

  useEffect(() => {
    const draw = () => {
      const c = canvasRef.current;
      if (c) {
        const dpr = Math.min(devicePixelRatio || 1, 2);
        const w = c.clientWidth || 600;
        const h = c.clientHeight || 170;
        if (c.width !== w * dpr) {
          c.width = w * dpr;
          c.height = h * dpr;
        }
        const g = c.getContext("2d")!;
        g.setTransform(dpr, 0, 0, dpr, 0, 0);
        g.clearRect(0, 0, w, h);

        const css = getComputedStyle(document.documentElement);
        const accent = css.getPropertyValue("--accent").trim() || "#ffb454";
        const line = css.getPropertyValue("--line").trim() || "#1e2a30";
        const cx = w / 2;
        const cy = h / 2;
        const R = Math.min(h * 0.36, 58);
        const t = Date.now() / 900;

        let data: Uint8Array | null = null;
        if (analyser && playing) {
          data = new Uint8Array(analyser.frequencyBinCount);
          analyser.getByteFrequencyData(data as Uint8Array<ArrayBuffer>);
        }

        g.strokeStyle = line;
        g.lineWidth = 1;
        [R * 0.45, R * 0.75, R].forEach((r) => {
          g.beginPath();
          g.arc(cx, cy, r, 0, Math.PI * 2);
          g.stroke();
        });

        g.strokeStyle = accent;
        g.lineWidth = 1.6;
        g.beginPath();
        const N = 128;
        for (let i = 0; i <= N; i++) {
          const a = (i / N) * Math.PI * 2;
          let v: number;
          if (data) v = sampleAnalyserAt(data, analyser!, i / N);
          else if (playing) v = (Math.sin(a * 5 + t * 3) * 0.5 + 0.5) * 0.55 + 0.12;
          else v = 0.1 + Math.sin(a * 3 + t) * 0.03;
          const r = R * (0.55 + v * 0.62);
          const x = cx + Math.cos(a) * r;
          const y = cy + Math.sin(a) * r;
          if (i) g.lineTo(x, y);
          else g.moveTo(x, y);
        }
        g.closePath();
        g.stroke();

        g.fillStyle = accent;
        g.beginPath();
        g.arc(cx, cy, 3, 0, Math.PI * 2);
        g.fill();

        g.fillStyle = playing ? accent : line;
        for (let i = 0; i < 22; i++) {
          let v: number;
          if (data) v = sampleAnalyserAt(data, analyser!, i / 22);
          else if (playing) v = Math.abs(Math.sin(t * 2 + i * 0.4)) * 0.8;
          else v = 0.05;
          g.fillRect(w - 26, h - 12 - i * 6, Math.max(2, v * 18), 3);
        }
      }
      rafRef.current = requestAnimationFrame(draw);
    };
    rafRef.current = requestAnimationFrame(draw);
    return () => cancelAnimationFrame(rafRef.current);
  }, [analyser, playing]);

  return <canvas ref={canvasRef} className={styles.scope} aria-hidden="true" />;
}
