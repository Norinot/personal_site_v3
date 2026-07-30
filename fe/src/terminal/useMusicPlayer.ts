import { useCallback, useEffect, useRef, useState } from "react";
import { fetchSongs, type Song } from "@/content/music";

export interface MusicPlayerState {
  songs: Song[];
  activeId: string | null;
  activeSong: Song | undefined;
  playing: boolean;
  currentTime: number;
  duration: number;
  volume: number;
  analyser: AnalyserNode | null;
  audioRef: React.RefObject<HTMLAudioElement | null>;
  playTrack: (id: string) => void;
  togglePlay: () => void;
  stop: () => void;
  skip: (direction: "next" | "prev") => void;
  setVolume: (v: number) => void;
  seekTo: (time: number) => void;
  refresh: () => Promise<void>;
}

export function useMusicPlayer(): MusicPlayerState {
  const [songs, setSongs] = useState<Song[]>([]);
  const [activeId, setActiveId] = useState<string | null>(null);
  const [playing, setPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [volume, setVolumeState] = useState(1);
  const [analyser, setAnalyser] = useState<AnalyserNode | null>(null);

  const audioRef = useRef<HTMLAudioElement>(null);
  const audioCtxRef = useRef<AudioContext | null>(null);

  const refresh = useCallback(async () => {
    try {
      setSongs(await fetchSongs());
    } catch (error) {
      console.error("Failed to fetch music:", error);
      setSongs([]);
    }
  }, []);

  useEffect(() => {
    refresh();
  }, [refresh]);

  const playTrack = useCallback((id: string) => {
    setActiveId(id);
    setPlaying(true);
  }, []);

  useEffect(() => {
    const audio = audioRef.current;
    if (!activeId || !audio) return;
    audio.src = `/stream/${activeId}`;
    audio.play().catch(() => {});
    setPlaying(true);

    if (!audioCtxRef.current) {
      try {
        const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
        const ctx = new AudioCtx();
        const node = ctx.createAnalyser();
        node.fftSize = 64;
        ctx.createMediaElementSource(audio).connect(node);
        node.connect(ctx.destination);
        audioCtxRef.current = ctx;
        setAnalyser(node);
      } catch {
        setAnalyser(null);
      }
    }
  }, [activeId]);

  const togglePlay = useCallback(() => {
    const audio = audioRef.current;
    if (!audio) return;
    if (!activeId) {
      if (songs.length === 0) return;
      playTrack(songs[0].id);
      return;
    }
    if (playing) audio.pause();
    else audio.play().catch(() => {});
    setPlaying((p) => !p);
  }, [activeId, playing, songs, playTrack]);

  const skip = useCallback(
    (direction: "next" | "prev") => {
      if (!activeId || songs.length === 0) return;
      const currentIndex = songs.findIndex((s) => s.id === activeId);
      let newIndex = direction === "next" ? currentIndex + 1 : currentIndex - 1;
      if (newIndex >= songs.length) newIndex = 0;
      if (newIndex < 0) newIndex = songs.length - 1;
      playTrack(songs[newIndex].id);
    },
    [activeId, songs, playTrack],
  );

  const stop = useCallback(() => {
    audioRef.current?.pause();
    setPlaying(false);
    setActiveId(null);
  }, []);

  const setVolume = useCallback((v: number) => {
    const clamped = Math.max(0, Math.min(1, v));
    setVolumeState(clamped);
    if (audioRef.current) audioRef.current.volume = clamped;
  }, []);

  const seekTo = useCallback((time: number) => {
    if (audioRef.current) audioRef.current.currentTime = time;
    setCurrentTime(time);
  }, []);

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;
    const onTimeUpdate = () => {
      setCurrentTime(audio.currentTime);
      if (audio.duration && audio.duration !== duration) setDuration(audio.duration);
    };
    const onEnded = () => skip("next");
    audio.addEventListener("timeupdate", onTimeUpdate);
    audio.addEventListener("ended", onEnded);
    return () => {
      audio.removeEventListener("timeupdate", onTimeUpdate);
      audio.removeEventListener("ended", onEnded);
    };
  }, [skip, duration]);

  return {
    songs,
    activeId,
    activeSong: songs.find((s) => s.id === activeId),
    playing,
    currentTime,
    duration,
    volume,
    analyser,
    audioRef,
    playTrack,
    togglePlay,
    stop,
    skip,
    setVolume,
    seekTo,
    refresh,
  };
}
