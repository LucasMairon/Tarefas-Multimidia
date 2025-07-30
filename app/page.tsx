"use client";

import { useRef, useState, useEffect } from "react";
import {
  FaPause,
  FaPlay,
  FaBackward,
  FaForward,
  FaVolumeUp,
  FaVolumeMute,
} from "react-icons/fa";

const videoList = [
  {
    file: "/assets/videos/Sons_De_Cidade.mp4",
    title: "Sons de Cidade",
    icon: "/assets/images/imagem_cidade.jpg",
  },
  {
    file: "/assets/videos/Demon Slayer - Opening 1 _ 4K _ 60FPS _ Creditless _.mp4",
    title: "Demon Slayer OP 1",
    icon: "/assets/images/demon_slayer.jpg",
  },
];

export default function Home() {
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const [currentVideoIndex, setCurrentVideoIndex] = useState(0);
  const [playing, setPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [volume, setVolume] = useState(1);
  const [isMuted, setIsMuted] = useState(false);
  const [isVideoReady, setIsVideoReady] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const currentVideo = videoList[currentVideoIndex];

  // Troca de vídeo: sempre que currentVideoIndex mudar, carrega o novo vídeo
  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    // Remove event listeners antigos para evitar leaks
    const cleanup = () => {
      video.removeEventListener("loadedmetadata", handleLoadedMetadata);
      video.removeEventListener("timeupdate", handleTimeUpdate);
      video.removeEventListener("canplay", handleCanPlay);
      video.removeEventListener("ended", handleEnded);
      video.removeEventListener("error", handleError);
    };

    // Handlers
    function handleLoadedMetadata() {
      setDuration(video.duration);
      setIsVideoReady(true);
      setError(null);
    }
    function handleTimeUpdate() {
      setCurrentTime(video.currentTime);
    }
    function handleCanPlay() {
      setIsVideoReady(true);
      setError(null);
    }
    function handleError() {
      setError("Erro ao carregar vídeo");
      setIsVideoReady(false);
      // video.error pode ser null
      if (video.error) console.error("Video error:", video.error);
    }
    function handleEnded() {
      // Troca para o próximo vídeo
      const nextIndex = (currentVideoIndex + 1) % videoList.length;
      setCurrentVideoIndex(nextIndex);
      setPlaying(true); // Garante autoplay do próximo vídeo
    }

    // Limpa listeners antigos
    cleanup();
    // Adiciona listeners
    video.addEventListener("loadedmetadata", handleLoadedMetadata);
    video.addEventListener("timeupdate", handleTimeUpdate);
    video.addEventListener("canplay", handleCanPlay);
    video.addEventListener("ended", handleEnded);
    video.addEventListener("error", handleError);

    // Troca o src e carrega
    video.src = currentVideo.file;
    video.load();

    // Autoplay se playing=true
    if (playing) {
      video.play().then(() => setPlaying(true)).catch((err) => {
        setPlaying(false);
        setError("Falha ao reproduzir automaticamente");
        console.error("Autoplay failed:", err);
      });
    } else {
      setPlaying(false);
    }

    // Limpeza
    return cleanup;
    // eslint-disable-next-line
  }, [currentVideoIndex, currentVideo.file]);

  // Controle de play/pause externo (quando o usuário clica no botão)
  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;
    if (!isVideoReady) return;
    if (playing) {
      video.play().catch((err) => {
        setPlaying(false);
        setError("Falha ao reproduzir vídeo");
        console.error("Play error:", err);
      });
    } else {
      video.pause();
    }
  }, [playing, isVideoReady]);

  // Volume e mute
  useEffect(() => {
    if (videoRef.current) {
      videoRef.current.volume = volume;
      videoRef.current.muted = isMuted;
    }
  }, [volume, isMuted]);

  const formatTime = (time: number) => {
    if (!isFinite(time) || isNaN(time)) return "0:00";
    const min = Math.floor(time / 60);
    const sec = Math.floor(time % 60);
    return `${min}:${sec < 10 ? "0" : ""}${sec}`;
  };

  const handleSelectVideo = (index: number) => {
    if (index !== currentVideoIndex) {
      setCurrentVideoIndex(index);
      setPlaying(true); // Autoplay ao selecionar
    }
  };

  const playPause = () => {
    if (!isVideoReady) return;
    setPlaying((prev) => !prev);
  };

  const seekBackward = () => {
    if (videoRef.current) {
      videoRef.current.currentTime = Math.max(videoRef.current.currentTime - 10, 0);
    }
  };

  const seekForward = () => {
    if (videoRef.current && duration) {
      videoRef.current.currentTime = Math.min(
        videoRef.current.currentTime + 10,
        duration
      );
    }
  };

  const toggleMute = () => {
    const video = videoRef.current;
    if (!video) return;
    const newMuted = !isMuted;
    setIsMuted(newMuted);
    if (!newMuted && volume === 0) {
      setVolume(0.5);
      video.volume = 0.5;
    }
  };

  const handleVolumeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newVol = parseFloat(e.target.value);
    setVolume(newVol);
    if (videoRef.current) {
      videoRef.current.volume = newVol;
      videoRef.current.muted = newVol === 0;
      setIsMuted(newVol === 0);
    }
  };

  const handleProgressClick = (e: React.MouseEvent<HTMLDivElement, MouseEvent>) => {
    const video = videoRef.current;
    if (!video || !duration) return;
    const bar = e.currentTarget;
    const clickX = e.clientX - bar.getBoundingClientRect().left;
    const width = bar.offsetWidth;
    const newTime = (clickX / width) * duration;
    video.currentTime = newTime;
    setCurrentTime(newTime);
  };

  const progressPercent = duration > 0 ? Math.min((currentTime / duration) * 100, 100) : 0;

  return (
    <div style={{ maxWidth: "800px", margin: "0 auto" }}>
      {error && <div style={{ color: "red", padding: "10px" }}>{error}</div>}
      <video
        ref={videoRef}
        onClick={playPause}
        playsInline
        style={{ width: "100%", height: "auto", backgroundColor: "#000" }}
      />
      <div style={{ display: "flex", justifyContent: "center", gap: "20px", padding: "10px" }}>
        <button onClick={seekBackward} style={{ fontSize: "20px" }}>
          <FaBackward />
        </button>
        <button onClick={playPause} style={{ fontSize: "20px" }}>
          {playing ? <FaPause /> : <FaPlay />}
        </button>
        <button onClick={seekForward} style={{ fontSize: "20px" }}>
          <FaForward />
        </button>
      </div>
      <div style={{ display: "flex", alignItems: "center", gap: "10px", padding: "0 10px" }}>
        <span style={{ minWidth: "50px" }}>{formatTime(currentTime)}</span>
        <div
          onClick={handleProgressClick}
          style={{
            flexGrow: 1,
            height: "10px",
            backgroundColor: "#ddd",
            borderRadius: "5px",
            cursor: "pointer",
            position: "relative"
          }}
        >
          <div
            style={{
              position: "absolute",
              top: 0,
              left: 0,
              height: "100%",
              backgroundColor: "#f00",
              width: `${progressPercent}%`,
              borderRadius: "5px"
            }}
          />
        </div>
        <span style={{ minWidth: "50px" }}>{formatTime(duration)}</span>
      </div>
      <div style={{ display: "flex", alignItems: "center", gap: "10px", padding: "10px" }}>
        <button onClick={toggleMute} style={{ fontSize: "20px" }}>
          {isMuted ? <FaVolumeMute /> : <FaVolumeUp />}
        </button>
        <input
          type="range"
          min="0"
          max="1"
          step="0.01"
          value={volume}
          onChange={handleVolumeChange}
          style={{ flexGrow: 1 }}
        />
      </div>
      <div style={{ display: "flex", gap: "10px", padding: "10px", overflowX: "auto" }}>
        {videoList.map((video, index) => (
          <button
            key={index}
            onClick={() => handleSelectVideo(index)}
            style={{
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              padding: "5px",
              background: index === currentVideoIndex ? "#ddd" : "transparent",
              border: "1px solid #ccc",
              borderRadius: "5px",
              minWidth: "100px"
            }}
          >
            <img
              src={video.icon}
              alt={video.title}
              style={{ width: "60px", height: "60px", objectFit: "cover" }}
            />
            <span style={{ marginTop: "5px" }}>{video.title}</span>
          </button>
        ))}
      </div>
    </div>
  );
}