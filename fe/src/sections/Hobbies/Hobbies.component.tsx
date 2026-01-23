import styles from "./Hobbies.module.scss";
import SectionTitle from "@/components/SectionTitle/SectionTitle.component";
import ChamferBox from "@/components/CamferBox/ChamferBox.component";
import {
  Pause,
  SkipForward,
  SkipBack,
  Volume2,
  Plus,
  Play,
  VolumeX,
  Maximize2,
  ExternalLink,
} from "lucide-react";
import { useTranslation } from "react-i18next";
import { useCallback, useEffect, useRef, useState } from "react";
import UploadModal from "@/components/UploadModal/UploadModal.component";
import { useUser } from "@clerk/clerk-react";
import { EMAIL_CLIENT_CHECK } from "@/AdminLogin";

interface Song {
  artist: string;
  description: string;
  duration: number;
  id: string;
  title: string;
  backlink?: string;
}

const Hobbies = () => {
  const { user } = useUser();
  const userEmail = user?.primaryEmailAddress?.emailAddress;
  const { t } = useTranslation();

  const [music, setMusic] = useState<Song[]>([]);
  const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);

  const [activeTrack, setActiveTrack] = useState<string | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [volume, setVolume] = useState(1);

  // Dragging States
  const [isDraggingVolume, setIsDraggingVolume] = useState(false);
  const [isDraggingProgress, setIsDraggingProgress] = useState(false);

  // Animation Refs
  const discRef = useRef<HTMLDivElement>(null);
  const stickyDiscRef = useRef<HTMLDivElement>(null);
  const rotationRef = useRef(0);
  const velocityRef = useRef(0);
  const isPlayingRef = useRef(isPlaying);

  const [isMainPlayerVisible, setIsMainPlayerVisible] = useState(true);

  const audioRef = useRef<HTMLAudioElement>(null);
  const progressBarRef = useRef<HTMLDivElement>(null);
  const stickyProgressBarRef = useRef<HTMLDivElement>(null);

  const volumeBarRef = useRef<HTMLDivElement>(null);
  const stickyVolumeBarRef = useRef<HTMLDivElement>(null);

  const playAnimationRef = useRef<number>(null);
  const mainContainerRef = useRef<HTMLElement>(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        setIsMainPlayerVisible(entry.isIntersecting);
      },
      { threshold: 0.2 },
    );

    if (mainContainerRef.current) {
      observer.observe(mainContainerRef.current);
    }

    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    isPlayingRef.current = isPlaying;
    if (isPlaying) {
      cancelAnimationFrame(playAnimationRef.current!);
      playAnimationRef.current = requestAnimationFrame(animate);
    }
  }, [isPlaying]);

  useEffect(() => {
    const fetchSongs = async () => {
      try {
        const response = await fetch("/songs");
        if (!response.ok) throw new Error("Network response was not ok!");
        const data = await response.json();
        setMusic(data || []);
      } catch (error) {
        console.error("Failed to fetch music:", error);
        setMusic([]);
      }
    };
    fetchSongs();
  }, []);

  const animate = useCallback(() => {
    if (audioRef.current && !isDraggingProgress) {
      setCurrentTime(audioRef.current.currentTime);
    }

    const targetSpeed = isPlayingRef.current ? 0.5 : 0;
    velocityRef.current += (targetSpeed - velocityRef.current) * 0.005;
    rotationRef.current += velocityRef.current;

    if (discRef.current) {
      discRef.current.style.transform = `rotate(${rotationRef.current}deg)`;
    }
    if (stickyDiscRef.current) {
      stickyDiscRef.current.style.transform = `rotate(${rotationRef.current}deg)`;
    }

    if (isPlayingRef.current || Math.abs(velocityRef.current) > 0.01) {
      playAnimationRef.current = requestAnimationFrame(animate);
    }
  }, [isDraggingProgress]);

  useEffect(() => {
    if (isPlaying) {
      playAnimationRef.current = requestAnimationFrame(animate);
    } else {
      if (playAnimationRef.current)
        cancelAnimationFrame(playAnimationRef.current);
    }
    return () => {
      if (playAnimationRef.current)
        cancelAnimationFrame(playAnimationRef.current);
    };
  }, [isPlaying, animate]);

  useEffect(() => {
    if (isDraggingVolume) {
      const handleGlobalMouseMove = (e: MouseEvent) => {
        let rect: DOMRect | undefined;
        if (isMainPlayerVisible && volumeBarRef.current) {
          rect = volumeBarRef.current.getBoundingClientRect();
        } else if (stickyVolumeBarRef.current) {
          rect = stickyVolumeBarRef.current.getBoundingClientRect();
        }

        if (!rect || !audioRef.current) return;

        const offsetX = e.clientX - rect.left;
        let newVolume = offsetX / rect.width;
        if (newVolume < 0) newVolume = 0;
        if (newVolume > 1) newVolume = 1;
        setVolume(newVolume);
        audioRef.current.volume = newVolume;
      };
      const handleGlobalMouseUp = () => setIsDraggingVolume(false);
      window.addEventListener("mousemove", handleGlobalMouseMove);
      window.addEventListener("mouseup", handleGlobalMouseUp);
      return () => {
        window.removeEventListener("mousemove", handleGlobalMouseMove);
        window.removeEventListener("mouseup", handleGlobalMouseUp);
      };
    }
  }, [isDraggingVolume, isMainPlayerVisible]);

  useEffect(() => {
    if (isDraggingProgress) {
      const handleProgressMove = (e: MouseEvent) => {
        if (!audioRef.current) return;

        let rect: DOMRect | undefined;
        if (isMainPlayerVisible && progressBarRef.current) {
          rect = progressBarRef.current.getBoundingClientRect();
        } else if (stickyProgressBarRef.current) {
          rect = stickyProgressBarRef.current.getBoundingClientRect();
        }

        if (!rect) return;

        const clickX = e.clientX - rect.left;
        const width = rect.width;
        let percentage = clickX / width;

        // Clamp
        if (percentage < 0) percentage = 0;
        if (percentage > 1) percentage = 1;

        const newTime = percentage * duration;
        setCurrentTime(newTime);
      };

      const handleProgressUp = () => {
        if (audioRef.current) {
          audioRef.current.currentTime = currentTime;
        }
        setIsDraggingProgress(false);
      };

      window.addEventListener("mousemove", handleProgressMove);
      window.addEventListener("mouseup", handleProgressUp);
      return () => {
        window.removeEventListener("mousemove", handleProgressMove);
        window.removeEventListener("mouseup", handleProgressUp);
      };
    }
  }, [isDraggingProgress, duration, isMainPlayerVisible, currentTime]);

  const playSelectedTrack = (id: string) => {
    if (activeTrack === id) {
      togglePlay();
    } else {
      setActiveTrack(id);
      setIsPlaying(true);
    }
  };

  useEffect(() => {
    if (activeTrack && audioRef.current) {
      audioRef.current.src = `/stream/${activeTrack}`;
      audioRef.current.play();
      setIsPlaying(true);
    }
  }, [activeTrack]);

  const togglePlay = () => {
    if (!audioRef.current) return;

    if (!activeTrack) {
      if (music.length === 0) return;
      setActiveTrack(music[0].id);
      return;
    }

    if (isPlaying) audioRef.current.pause();
    else audioRef.current.play();

    setIsPlaying(!isPlaying);
  };

  const onTimeUpdate = () => {
    if (audioRef.current && !isDraggingProgress) {
      setCurrentTime(audioRef.current.currentTime);
      setDuration(audioRef.current.duration || 0);
    }
  };

  const handleSeekClick = (
    e: React.MouseEvent<HTMLDivElement>,
    ref: React.RefObject<HTMLDivElement | null>,
  ) => {
    if (!ref.current || !audioRef.current) return;
    const rect = ref.current.getBoundingClientRect();
    const clickX = e.clientX - rect.left;
    const width = rect.width;
    const percentage = clickX / width;
    audioRef.current.currentTime = percentage * duration;
    setCurrentTime(percentage * duration);
  };

  const formatTime = (time: number) => {
    if (isNaN(time)) return "00:00";
    const minutes = Math.floor(time / 60);
    const seconds = Math.floor(time % 60);
    return `${minutes < 10 ? "0" : ""}${minutes}:${seconds < 10 ? "0" : ""}${seconds}`;
  };

  const handleSkip = (direction: "next" | "prev") => {
    if (!activeTrack) return;
    const currentIndex = music.findIndex((m) => m.id === activeTrack);
    let newIndex = direction === "next" ? currentIndex + 1 : currentIndex - 1;
    if (newIndex >= music.length) newIndex = 0;
    if (newIndex < 0) newIndex = music.length - 1;
    playSelectedTrack(music[newIndex].id);
  };

  const scrollToPlayer = () => {
    mainContainerRef.current?.scrollIntoView({
      behavior: "smooth",
      block: "center",
    });
  };

  const openLink = (song: Song) => {
    if (!song.backlink) return;

    window.open(song.backlink, "_blank", "noopener,noreferrer");
  };

  const progressPercent = duration ? (currentTime / duration) * 100 : 0;
  const currentSong = music.find((m) => m.id === activeTrack);

  return (
    <>
      <section id="hobbies" ref={mainContainerRef}>
        <SectionTitle
          title={t("hobbies.title")}
          subtitle={t("hobbies.subtitle")}
        />

        <audio
          ref={audioRef}
          onTimeUpdate={onTimeUpdate}
          onEnded={() => handleSkip("next")}
        />

        <ChamferBox cutSize={30} borderColor="rgba(255,255,255,0.05)" noPadding>
          <div className={styles.playerLayout}>
            <div className={styles.albumArtContainer}>
              {currentSong?.backlink && (
                <button
                  className={styles.openMusic}
                  onClick={() => {
                    openLink(currentSong);
                  }}
                >
                  <ExternalLink />
                </button>
              )}
              <div className={styles.vinylRecord} ref={discRef}>
                <div className={styles.vinylLabel}>
                  <img
                    src="https://images.unsplash.com/photo-1614613535308-eb5fbd3d2c17?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80"
                    alt="Album Art"
                  />
                </div>
                <div className={styles.spindleHole}></div>
              </div>

              <div className={styles.albumInfo}>
                <h3 className={styles.albumTitle}>
                  {activeTrack ? currentSong?.title : "Select a Track"}
                </h3>
                <p className={styles.albumSubtitle}>
                  {activeTrack ? currentSong?.artist : "..."}
                </p>
              </div>
            </div>
            <div className={styles.playerControlsContainer}>
              {userEmail == EMAIL_CLIENT_CHECK && (
                <div className={styles.header}>
                  <h4 className={styles.title}>{t("hobbies.que")}</h4>
                  <button
                    onClick={() => setIsUploadModalOpen(true)}
                    className={styles.addButton}
                  >
                    <Plus size={20} className={styles.icon} />
                  </button>
                </div>
              )}

              <div className={styles.trackList}>
                {music?.map((track, i) => (
                  <div
                    onClick={() => playSelectedTrack(track.id)}
                    key={track.id}
                    className={`${styles.trackRow} ${track.id === activeTrack ? styles.trackActive : ""} group`}
                  >
                    <div className={styles.trackInfoLeft}>
                      <div
                        className={`${styles.trackIndex} ${track.id === activeTrack ? styles.active : ""}`}
                      >
                        0{i + 1}
                      </div>
                      <div>
                        <div
                          className={`${styles.trackTitle} ${track.id === activeTrack ? styles.active : ""}`}
                        >
                          {track.title}
                        </div>
                        <div className={styles.trackArtist}>{track.artist}</div>
                      </div>
                    </div>
                    {track.id === activeTrack && (
                      <div className={styles.trackIndicator}></div>
                    )}
                  </div>
                ))}
              </div>

              <div className={styles.controlBox}>
                <div className={styles.timeBar}>
                  <div className={styles.timeStamp}>
                    {formatTime(currentTime)}
                  </div>
                  <div
                    className={styles.progressBar}
                    ref={progressBarRef}
                    onMouseDown={(e) => {
                      handleSeekClick(e, progressBarRef);
                      setIsDraggingProgress(true);
                    }}
                  >
                    <div
                      className={styles.progressFill}
                      style={{ width: `${progressPercent}%` }}
                    >
                      <div className={styles.progressHandle}></div>
                    </div>
                  </div>
                  <div className={styles.timeStamp}>{formatTime(duration)}</div>
                </div>

                <div className={styles.btnRow}>
                  <div className={styles.mediaBtns}>
                    <button
                      className={styles.skipBtn}
                      onClick={() => handleSkip("prev")}
                    >
                      <SkipBack size={20} />
                    </button>
                    <button className={styles.playBtn} onClick={togglePlay}>
                      {isPlaying ? (
                        <Pause size={18} fill="black" />
                      ) : (
                        <Play size={18} fill="black" />
                      )}
                    </button>
                    <button
                      className={styles.skipBtn}
                      onClick={() => handleSkip("next")}
                    >
                      <SkipForward size={20} />
                    </button>
                  </div>

                  <div className={styles.volumeControls}>
                    <button
                      onClick={() => {
                        const newVol = volume === 0 ? 1 : 0;
                        setVolume(newVol);
                        if (audioRef.current) audioRef.current.volume = newVol;
                      }}
                      className={styles.none}
                    >
                      {volume === 0 ? (
                        <VolumeX size={16} className="text-gray-400" />
                      ) : (
                        <Volume2 size={16} className="text-gray-400" />
                      )}
                    </button>
                    <div
                      className={styles.volumeBar}
                      ref={volumeBarRef}
                      onMouseDown={(e) => {
                        setIsDraggingVolume(true);
                        if (!volumeBarRef.current || !audioRef.current) return;
                        const rect =
                          volumeBarRef.current.getBoundingClientRect();
                        const newVol = Math.max(
                          0,
                          Math.min(1, (e.clientX - rect.left) / rect.width),
                        );
                        setVolume(newVol);
                        audioRef.current.volume = newVol;
                      }}
                    >
                      <div
                        className={styles.volumeFill}
                        style={{ width: `${volume * 100}%` }}
                      >
                        <div className={styles.volumeHandle}></div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </ChamferBox>
      </section>

      <div
        className={`${styles.stickyPlayer} ${!isMainPlayerVisible && isPlaying ? styles.visible : ""}`}
      >
        <div
          className={styles.stickyProgressContainer}
          ref={stickyProgressBarRef}
          onMouseDown={(e) => {
            handleSeekClick(e, stickyProgressBarRef);
            setIsDraggingProgress(true);
          }}
        >
          <div
            className={styles.stickyProgressFill}
            style={{ width: `${progressPercent}%` }}
          ></div>
        </div>

        <div className={styles.stickyContent}>
          <div className={styles.stickyInfo}>
            {currentSong?.backlink && (
              <button
                className={styles.openMusicSmall}
                onClick={() => {
                  openLink(currentSong);
                }}
              >
                <ExternalLink />
              </button>
            )}
            <div className={styles.miniVinyl} ref={stickyDiscRef}>
              <img
                src="https://images.unsplash.com/photo-1614613535308-eb5fbd3d2c17?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80"
                alt="Album Art"
              />
            </div>

            {currentSong && (
              <div className={styles.stickyText}>
                <span className={styles.stickyTitle}>{currentSong.title}</span>
                <span className={styles.stickyArtist}>
                  {currentSong.artist}
                </span>
                <span className={styles.stickyDuration}>
                  {formatTime(currentTime)} / {formatTime(duration)}
                </span>
              </div>
            )}
          </div>

          <div className={styles.stickyControls}>
            <button
              className={styles.stickySkip}
              onClick={() => handleSkip("prev")}
            >
              <SkipBack size={18} />
            </button>
            <button className={styles.stickyPlay} onClick={togglePlay}>
              {isPlaying ? (
                <Pause size={18} fill="black" />
              ) : (
                <Play size={18} fill="black" />
              )}
            </button>
            <button
              className={styles.stickySkip}
              onClick={() => handleSkip("next")}
            >
              <SkipForward size={18} />
            </button>
          </div>

          <div className={styles.stickyActions}>
            <div className={styles.stickyVolumeBox}>
              <div
                className={styles.volumeBar}
                style={{ width: "60px" }}
                ref={stickyVolumeBarRef}
                onMouseDown={(e) => {
                  setIsDraggingVolume(true);
                  if (!stickyVolumeBarRef.current || !audioRef.current) return;
                  const rect =
                    stickyVolumeBarRef.current.getBoundingClientRect();
                  const newVol = Math.max(
                    0,
                    Math.min(1, (e.clientX - rect.left) / rect.width),
                  );
                  setVolume(newVol);
                  audioRef.current.volume = newVol;
                }}
              >
                <div
                  className={styles.volumeFill}
                  style={{ width: `${volume * 100}%` }}
                >
                  <div className={styles.volumeHandle}></div>
                </div>
              </div>
            </div>

            <button
              className={styles.stickyBtn}
              onClick={scrollToPlayer}
              title="Scroll to Player"
            >
              <Maximize2 size={18} />
            </button>
          </div>
        </div>
      </div>

      <UploadModal
        isOpen={isUploadModalOpen}
        onClose={() => {
          setIsUploadModalOpen(false);
        }}
      />
    </>
  );
};

export default Hobbies;
