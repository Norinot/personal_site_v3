import { useState } from "react";
import { useTranslation } from "react-i18next";
import { useUser, useAuth } from "@clerk/clerk-react";
import styles from "./Terminal.module.scss";
import { PROFILE } from "@/content/profile";
import { Oscilloscope } from "./graphics";
import type { MusicPlayerState } from "./useMusicPlayer";

function UploadForm({ onDone, onUploaded }: { onDone: () => void; onUploaded: () => void }) {
  const { t } = useTranslation();
  const { getToken } = useAuth();
  const [file, setFile] = useState<File | null>(null);
  const [title, setTitle] = useState("");
  const [artist, setArtist] = useState("");
  const [backlink, setBacklink] = useState("");
  const [description, setDescription] = useState("");
  const [busy, setBusy] = useState(false);

  const handleUpload = async () => {
    if (!file) return;
    setBusy(true);
    try {
      const token = await getToken();
      const formData = new FormData();
      formData.append("music_file", file);
      formData.append("title", title);
      formData.append("artist", artist);
      formData.append("description", description);
      formData.append("backlink", backlink);
      const response = await fetch("/upload", {
        method: "POST",
        headers: { Authorization: `Bearer ${token}` },
        body: formData,
      });
      if (!response.ok) throw new Error("Upload failed");
      onUploaded();
      onDone();
    } catch (error) {
      console.error(error);
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className={styles.case} style={{ maxWidth: 460 }}>
      <h3>{t("terminal.upload.title")}</h3>
      <div className={styles.field}>
        <label htmlFor="terminal-upload-file">{t("terminal.upload.file")}</label>
        <input
          id="terminal-upload-file"
          type="file"
          accept=".mp3"
          onChange={(e) => setFile(e.target.files?.[0] ?? null)}
        />
      </div>
      <div className={styles.field}>
        <label htmlFor="terminal-upload-title">{t("terminal.upload.titleLabel")}</label>
        <input id="terminal-upload-title" value={title} onChange={(e) => setTitle(e.target.value)} />
      </div>
      <div className={styles.field}>
        <label htmlFor="terminal-upload-artist">{t("terminal.upload.artistLabel")}</label>
        <input id="terminal-upload-artist" value={artist} onChange={(e) => setArtist(e.target.value)} />
      </div>
      <div className={styles.field}>
        <label htmlFor="terminal-upload-backlink">{t("terminal.upload.backlinkLabel")}</label>
        <input id="terminal-upload-backlink" value={backlink} onChange={(e) => setBacklink(e.target.value)} />
      </div>
      <div className={styles.field}>
        <label htmlFor="terminal-upload-description">{t("terminal.upload.descriptionLabel")}</label>
        <textarea
          id="terminal-upload-description"
          rows={3}
          value={description}
          onChange={(e) => setDescription(e.target.value)}
        />
      </div>
      <div className={styles.formActions}>
        <button type="button" className={styles.btn} disabled={!file || busy} onClick={handleUpload}>
          {busy ? t("terminal.upload.uploading") : t("terminal.upload.submit")}
        </button>
        <button type="button" className={styles.btnGhost} onClick={onDone}>
          {t("terminal.upload.cancel")}
        </button>
      </div>
    </div>
  );
}

export function MusicView({ player }: { player: MusicPlayerState }) {
  const { t } = useTranslation();
  const { user } = useUser();
  const isAdmin = user?.primaryEmailAddress?.emailAddress === PROFILE.email;
  const [uploadOpen, setUploadOpen] = useState(false);

  return (
    <>
      <div className={`${styles.ln} ${styles.c}`} style={{ marginBottom: 14 }}>
        {t("terminal.music.intro")}
      </div>
      <figure className={styles.fig}>
        <Oscilloscope analyser={player.analyser} playing={player.playing} />
        <figcaption>{t("terminal.music.scopeCaption")}</figcaption>
      </figure>

      {isAdmin && !uploadOpen && (
        <div style={{ marginTop: 14 }}>
          <button type="button" className={styles.btnGhost} onClick={() => setUploadOpen(true)}>
            {t("terminal.music.addTrack")}
          </button>
        </div>
      )}
      {isAdmin && uploadOpen && (
        <div style={{ marginTop: 14 }}>
          <UploadForm onDone={() => setUploadOpen(false)} onUploaded={player.refresh} />
        </div>
      )}

      {player.songs.length === 0 ? (
        <div className={`${styles.ln} ${styles.c}`} style={{ marginTop: 16 }}>
          {t("terminal.music.empty")}
        </div>
      ) : (
        <div className={styles.grid} style={{ marginTop: 16 }}>
          {player.songs.map((song, i) => (
            <article key={song.id} className={styles.card}>
              <h3>{song.title}</h3>
              <p style={{ marginBottom: 0 }}>
                <span className={styles.c}>{String(i + 1).padStart(2, "0")}</span> · {song.artist}
              </p>
              <a href="#" onClick={(e) => { e.preventDefault(); player.playTrack(song.id); }}>
                play ▸
              </a>
            </article>
          ))}
        </div>
      )}
      <div className={`${styles.ln} ${styles.c}`} style={{ marginTop: 12 }}>
        <span className={styles.f}>play &lt;n&gt;</span> {t("terminal.music.playHint")}
      </div>
    </>
  );
}
