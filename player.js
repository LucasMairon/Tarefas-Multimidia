"use client";

import { useRef, useState, useEffect, useCallback } from "react";
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
  const videoRef = useRef(null);
  const [currentVideoIndex, setCurrentVideoIndex] = useState(0);
  const [playing, setPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [volume, setVolume] = useState(1);
  const [isMuted, setIsMuted] = useState(false);
  const [isVideoReady, setIsVideoReady] = useState(false);
  const [error, setError] = useState(null);
  const [isLoading, setIsLoading] = useState(false);

  const currentVideo = videoList[currentVideoIndex];

  // Função para ir para o próximo vídeo
  const goToNextVideo = useCallback(() => {
    const nextIndex = (currentVideoIndex + 1) % videoList.length;
    console.log(`Mudando para o próximo vídeo: ${nextIndex}`);
    setCurrentVideoIndex(nextIndex);
    setCurrentTime(0);
    setError(null);
    setIsVideoReady(false);
    setIsLoading(true);
  }, [currentVideoIndex]);

  // Função para ir para o vídeo anterior
  const goToPreviousVideo = useCallback(() => {
    const prevIndex = currentVideoIndex === 0 ? videoList.length - 1 : currentVideoIndex - 1;
    console.log(`Mudando para o vídeo anterior: ${prevIndex}`);
    setCurrentVideoIndex(prevIndex);
    setCurrentTime(0);
    setError(null);
    setIsVideoReady(false);
    setIsLoading(true);
  }, [currentVideoIndex]);

  // Effect principal para gerenciar o vídeo
  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    let isMounted = true;

    const handleLoadStart = () => {
      if (!isMounted) return;
      console.log('Carregamento do vídeo iniciado');
      setIsLoading(true);
      setError(null);
    };

    const handleLoadedMetadata = () => {
      if (!isMounted) return;
      console.log('Metadados carregados:', video.duration);
      setDuration(video.duration || 0);
      setIsLoading(false);
    };

    const handleCanPlayThrough = () => {
      if (!isMounted) return;
      console.log('Vídeo pronto para reproduzir');
      setIsVideoReady(true);
      setIsLoading(false);
      setError(null);
      
      // Se estava reproduzindo antes, continua reproduzindo
      if (playing) {
        video.play()
          .then(() => {
            if (isMounted) setPlaying(true);
          })
          .catch(err => {
            if (isMounted) {
              console.error("Erro ao reproduzir automaticamente:", err);
              setPlaying(false);
              setError("Falha na reprodução automática");
            }
          });
      }
    };

    const handleTimeUpdate = () => {
      if (!isMounted) return;
      setCurrentTime(video.currentTime || 0);
    };

    const handleEnded = () => {
      if (!isMounted) return;
      console.log('Vídeo terminou, indo para o próximo');
      setPlaying(false);
      // Pequeno delay para garantir que o estado seja atualizado
      setTimeout(() => {
        if (isMounted) {
          goToNextVideo();
        }
      }, 100);
    };

    const handleError = (e) => {
      if (!isMounted) return;
      console.error("Erro no vídeo:", e, video.error);
      setError(`Erro ao carregar o vídeo: ${video.error?.message || 'Erro desconhecido'}`);
      setIsVideoReady(false);
      setIsLoading(false);
      setPlaying(false);
    };

    const handleWaiting = () => {
      if (!isMounted) return;
      console.log('Vídeo aguardando dados');
      setIsLoading(true);
    };

    const handleCanPlay = () => {
      if (!isMounted) return;
      console.log('Vídeo pode reproduzir');
      setIsLoading(false);
    };

    const handleStalled = () => {
      if (!isMounted) return;
      console.log('Vídeo travado');
      setIsLoading(true);
    };

    const handleProgress = () => {
      if (!isMounted) return;
      setIsLoading(false);
    };

    // Adiciona todos os event listeners
    video.addEventListener("loadstart", handleLoadStart);
    video.addEventListener("loadedmetadata", handleLoadedMetadata);
    video.addEventListener("canplaythrough", handleCanPlayThrough);
    video.addEventListener("timeupdate", handleTimeUpdate);
    video.addEventListener("ended", handleEnded);
    video.addEventListener("error", handleError);
    video.addEventListener("waiting", handleWaiting);
    video.addEventListener("canplay", handleCanPlay);
    video.addEventListener("stalled", handleStalled);
    video.addEventListener("progress", handleProgress);

    // Carrega o vídeo atual
    console.log('Carregando vídeo:', currentVideo.file);
    video.src = currentVideo.file;
    video.load();

    // Cleanup
    return () => {
      isMounted = false;
      video.removeEventListener("loadstart", handleLoadStart);
      video.removeEventListener("loadedmetadata", handleLoadedMetadata);
      video.removeEventListener("canplaythrough", handleCanPlayThrough);
      video.removeEventListener("timeupdate", handleTimeUpdate);
      video.removeEventListener("ended", handleEnded);
      video.removeEventListener("error", handleError);
      video.removeEventListener("waiting", handleWaiting);
      video.removeEventListener("canplay", handleCanPlay);
      video.removeEventListener("stalled", handleStalled);
      video.removeEventListener("progress", handleProgress);
    };
  }, [currentVideoIndex, currentVideo.file, playing, goToNextVideo]);

  // Effect para controlar volume e mute
  useEffect(() => {
    if (videoRef.current) {
      videoRef.current.volume = volume;
      videoRef.current.muted = isMuted;
    }
  }, [volume, isMuted]);

  const formatTime = (time) => {
    if (!isFinite(time) || isNaN(time) || time < 0) return "0:00";
    const min = Math.floor(time / 60);
    const sec = Math.floor(time % 60);
    return `${min}:${sec < 10 ? "0" : ""}${sec}`;
  };

  const handleSelectVideo = (index) => {
    if (index !== currentVideoIndex && index >= 0 && index < videoList.length) {
      console.log(`Selecionando vídeo: ${index}`);
      setCurrentVideoIndex(index);
      setCurrentTime(0);
      setError(null);
      setIsVideoReady(false);
      setIsLoading(true);
      // Mantém o estado de reprodução
    }
  };

  const playPause = () => {
    const video = videoRef.current;
    if (!video || !isVideoReady || isLoading) return;
    
    if (playing) {
      video.pause();
      setPlaying(false);
    } else {
      video.play()
        .then(() => setPlaying(true))
        .catch(err => {
          setPlaying(false);
          setError("Falha ao reproduzir o vídeo");
          console.error("Erro ao reproduzir:", err);
        });
    }
  };

  const seekBackward = () => {
    if (videoRef.current && isVideoReady) {
      const newTime = Math.max(videoRef.current.currentTime - 10, 0);
      videoRef.current.currentTime = newTime;
      setCurrentTime(newTime);
    }
  };

  const seekForward = () => {
    if (videoRef.current && isVideoReady && duration) {
      const newTime = Math.min(videoRef.current.currentTime + 10, duration);
      videoRef.current.currentTime = newTime;
      setCurrentTime(newTime);
    }
  };

  const toggleMute = () => {
    const video = videoRef.current;
    if (!video) return;
    
    const newMuted = !isMuted;
    setIsMuted(newMuted);
    
    if (!newMuted && volume === 0) {
      setVolume(0.5);
    }
  };

  const handleVolumeChange = (e) => {
    const newVol = parseFloat(e.target.value);
    setVolume(newVol);
    setIsMuted(newVol === 0);
  };

  const handleProgressClick = (e) => {
    const video = videoRef.current;
    if (!video || !duration || !isVideoReady) return;
    
    const bar = e.currentTarget;
    const rect = bar.getBoundingClientRect();
    const clickX = e.clientX - rect.left;
    const width = rect.width;
    const newTime = (clickX / width) * duration;
    
    video.currentTime = newTime;
    setCurrentTime(newTime);
  };

  const progressPercent = duration > 0 ? Math.min((currentTime / duration) * 100, 100) : 0;

  return (
    <div style={{ maxWidth: "800px", margin: "0 auto", padding: "20px" }}>
      {error && (
        <div style={{ 
          color: "red", 
          padding: "10px", 
          backgroundColor: "#ffebee", 
          borderRadius: "5px", 
          marginBottom: "10px",
          border: "1px solid #f44336"
        }}>
          {error}
        </div>
      )}
      
      <div style={{ position: "relative", backgroundColor: "#000", borderRadius: "8px", overflow: "hidden" }}>
        <video
          ref={videoRef}
          onClick={playPause}
          playsInline
          preload="metadata"
          style={{ 
            width: "100%", 
            height: "auto", 
            display: "block",
            minHeight: "300px"
          }}
        />
        
        {isLoading && (
          <div style={{
            position: "absolute",
            top: "50%",
            left: "50%",
            transform: "translate(-50%, -50%)",
            color: "white",
            fontSize: "18px",
            backgroundColor: "rgba(0,0,0,0.7)",
            padding: "10px 20px",
            borderRadius: "5px"
          }}>
            Carregando...
          </div>
        )}
      </div>
      
      {/* Título do vídeo atual */}
      <div style={{ 
        padding: "10px 0", 
        fontSize: "18px", 
        fontWeight: "bold",
        textAlign: "center",
        borderBottom: "1px solid #eee",
        marginBottom: "10px"
      }}>
        {currentVideo.title}
      </div>
      
      {/* Controles de reprodução */}
      <div style={{ 
        display: "flex", 
        justifyContent: "center", 
        alignItems: "center",
        gap: "20px", 
        padding: "15px",
        backgroundColor: "#f5f5f5",
        borderRadius: "8px",
        marginBottom: "10px"
      }}>
        <button 
          onClick={goToPreviousVideo} 
          style={{ 
            fontSize: "20px", 
            padding: "10px", 
            border: "none", 
            background: "transparent", 
            cursor: "pointer",
            borderRadius: "50%",
            display: "flex",
            alignItems: "center",
            justifyContent: "center"
          }}
          title="Vídeo anterior"
        >
          ⏮️
        </button>
        
        <button 
          onClick={seekBackward} 
          style={{ 
            fontSize: "20px", 
            padding: "10px", 
            border: "none", 
            background: "transparent", 
            cursor: "pointer" 
          }}
          disabled={!isVideoReady}
          title="Voltar 10s"
        >
          <FaBackward />
        </button>
        
        <button 
          onClick={playPause} 
          style={{ 
            fontSize: "24px", 
            padding: "15px", 
            border: "none", 
            background: isVideoReady ? "#007bff" : "#ccc", 
            color: "white",
            borderRadius: "50%",
            cursor: isVideoReady ? "pointer" : "not-allowed",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            minWidth: "50px",
            minHeight: "50px"
          }}
          disabled={!isVideoReady || isLoading}
        >
          {playing ? <FaPause /> : <FaPlay />}
        </button>
        
        <button 
          onClick={seekForward} 
          style={{ 
            fontSize: "20px", 
            padding: "10px", 
            border: "none", 
            background: "transparent", 
            cursor: "pointer" 
          }}
          disabled={!isVideoReady}
          title="Avançar 10s"
        >
          <FaForward />
        </button>
        
        <button 
          onClick={goToNextVideo} 
          style={{ 
            fontSize: "20px", 
            padding: "10px", 
            border: "none", 
            background: "transparent", 
            cursor: "pointer",
            borderRadius: "50%",
            display: "flex",
            alignItems: "center",
            justifyContent: "center"
          }}
          title="Próximo vídeo"
        >
          ⏭️
        </button>
      </div>
      
      {/* Barra de progresso */}
      <div style={{ 
        display: "flex", 
        alignItems: "center", 
        gap: "10px", 
        padding: "10px",
        backgroundColor: "#f9f9f9",
        borderRadius: "8px",
        marginBottom: "10px"
      }}>
        <span style={{ minWidth: "50px", fontSize: "14px" }}>
          {formatTime(currentTime)}
        </span>
        
        <div 
          onClick={handleProgressClick}
          style={{
            flexGrow: 1,
            height: "8px",
            backgroundColor: "#ddd",
            borderRadius: "4px",
            cursor: isVideoReady ? "pointer" : "not-allowed",
            position: "relative",
            overflow: "hidden"
          }}
        >
          <div 
            style={{
              position: "absolute",
              top: 0,
              left: 0,
              height: "100%",
              backgroundColor: "#007bff",
              width: `${progressPercent}%`,
              borderRadius: "4px",
              transition: "width 0.1s ease"
            }} 
          />
        </div>
        
        <span style={{ minWidth: "50px", fontSize: "14px" }}>
          {formatTime(duration)}
        </span>
      </div>
      
      {/* Controles de volume */}
      <div style={{ 
        display: "flex", 
        alignItems: "center", 
        gap: "10px", 
        padding: "10px",
        backgroundColor: "#f9f9f9",
        borderRadius: "8px",
        marginBottom: "15px"
      }}>
        <button 
          onClick={toggleMute} 
          style={{ 
            fontSize: "20px", 
            padding: "8px", 
            border: "none", 
            background: "transparent", 
            cursor: "pointer" 
          }}
          title={isMuted ? "Desativar mudo" : "Ativar mudo"}
        >
          {isMuted ? <FaVolumeMute /> : <FaVolumeUp />}
        </button>
        
        <input
          type="range"
          min="0"
          max="1"
          step="0.01"
          value={isMuted ? 0 : volume}
          onChange={handleVolumeChange}
          style={{ 
            flexGrow: 1,
            height: "6px",
            appearance: "none",
            backgroundColor: "#ddd",
            borderRadius: "3px",
            outline: "none"
          }}
        />
        
        <span style={{ minWidth: "40px", fontSize: "14px" }}>
          {Math.round((isMuted ? 0 : volume) * 100)}%
        </span>
      </div>
      
      {/* Lista de vídeos */}
      <div style={{ 
        display: "grid", 
        gridTemplateColumns: "repeat(auto-fit, minmax(150px, 1fr))",
        gap: "15px", 
        padding: "15px",
        backgroundColor: "#f9f9f9",
        borderRadius: "8px"
      }}>
        {videoList.map((video, index) => (
          <button
            key={index}
            onClick={() => handleSelectVideo(index)}
            style={{
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              padding: "12px",
              background: index === currentVideoIndex ? "#007bff" : "white",
              color: index === currentVideoIndex ? "white" : "black",
              border: "2px solid",
              borderColor: index === currentVideoIndex ? "#007bff" : "#ddd",
              borderRadius: "8px",
              cursor: "pointer",
              transition: "all 0.3s ease",
              minHeight: "120px"
            }}
            onMouseEnter={(e) => {
              if (index !== currentVideoIndex) {
                e.target.style.borderColor = "#007bff";
                e.target.style.backgroundColor = "#f0f8ff";
              }
            }}
            onMouseLeave={(e) => {
              if (index !== currentVideoIndex) {
                e.target.style.borderColor = "#ddd";
                e.target.style.backgroundColor = "white";
              }
            }}
          >
            <img 
              src={video.icon} 
              alt={video.title} 
              style={{ 
                width: "60px", 
                height: "60px", 
                objectFit: "cover", 
                borderRadius: "4px",
                marginBottom: "8px"
              }} 
              onError={(e) => {
                e.target.style.display = "none";
              }}
            />
            <span style={{ 
              fontSize: "12px", 
              textAlign: "center", 
              lineHeight: "1.2",
              fontWeight: index === currentVideoIndex ? "bold" : "normal"
            }}>
              {video.title}
            </span>
            {index === currentVideoIndex && (
              <div style={{ 
                marginTop: "4px", 
                fontSize: "10px", 
                opacity: 0.8 
              }}>
                {playing ? "▶️ Reproduzindo" : "⏸️ Pausado"}
              </div>
            )}
          </button>
        ))}
      </div>
    </div>
  );
}