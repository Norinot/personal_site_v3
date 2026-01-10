import styles from "./Hobbies.module.scss";
import SectionTitle from "@/components/SectionTitle/SectionTitle.component";
import ChamferBox from "@/components/CamferBox/ChamferBox.component";
import { Pause, SkipForward, SkipBack, Volume2 } from "lucide-react";
import { useTranslation } from "react-i18next";

const Hobbies = () => {
  const { t } = useTranslation();

  return (
    <section id="hobbies">
      <SectionTitle
        title={t("hobbies.title")}
        subtitle={t("hobbies.subtitle")}
      />

      <ChamferBox cutSize={30} borderColor="rgba(255,255,255,0.05)" noPadding>
        <div className={styles.playerLayout}>
          <div className={styles.albumArtContainer}>
            <img
              src="https://images.unsplash.com/photo-1614613535308-eb5fbd3d2c17?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80"
              alt="Album Art"
              className={styles.albumImage}
            />
            <div className={styles.albumGradient}></div>
            <div className={styles.albumInfo}>
              <h3 className={styles.albumTitle}>Neon Nights</h3>
              <p className={styles.albumSubtitle}>Synthwave Mix Vol. 4</p>
            </div>
          </div>

          <div className={styles.playerControlsContainer}>
            <div className={styles.trackList}>
              {[
                {
                  title: "Cyberpunk City",
                  artist: "Synth Masters",
                  active: true,
                },
                {
                  title: "Midnight Code",
                  artist: "Dev Beats",
                  active: false,
                },
                {
                  title: "Neural Link",
                  artist: "The Algorithms",
                  active: false,
                },
                {
                  title: "System Failure",
                  artist: "Glitch Mob",
                  active: false,
                },
              ].map((track, i) => (
                <div
                  key={i}
                  className={`${styles.trackRow} ${track.active ? styles.trackActive : ""} group`}
                >
                  <div className={styles.trackInfoLeft}>
                    <div
                      className={`${styles.trackIndex} ${track.active ? styles.active : ""}`}
                    >
                      0{i + 1}
                    </div>
                    <div>
                      <div
                        className={`${styles.trackTitle} ${track.active ? styles.active : ""}`}
                      >
                        {track.title}
                      </div>
                      <div className={styles.trackArtist}>{track.artist}</div>
                    </div>
                  </div>
                  {track.active && (
                    <div className={styles.trackIndicator}></div>
                  )}
                </div>
              ))}
            </div>

            <div className={styles.controlBox}>
              <div className={styles.timeBar}>
                <div className={styles.timeStamp}>01:24</div>
                <div className={styles.progressBar}>
                  <div className={styles.progressFill}></div>
                </div>
                <div className={styles.timeStamp}>03:45</div>
              </div>

              <div className={styles.btnRow}>
                <div className={styles.mediaBtns}>
                  <SkipBack size={20} className={styles.skipBtn} />
                  <button className={styles.playBtn}>
                    <Pause size={18} fill="black" />
                  </button>
                  <SkipForward size={20} className={styles.skipBtn} />
                </div>

                <div className={styles.volumeControls}>
                  <Volume2 size={16} className="text-gray-400" />
                  <div className={styles.volumeBar}>
                    <div className={styles.volumeFill}></div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </ChamferBox>
    </section>
  );
};

export default Hobbies;
