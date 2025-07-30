"use client"

import { useRef, useState, useEffect } from "react";
import { FaPause, FaPlay, FaBackward, FaForward, FaVolumeUp, FaVolumeMute, FaTiktok } from "react-icons/fa";

export default function Home() {
  const [playing, setPlaying] = useState<boolean>(false);
  const [currentTime, setCurrentTime] = useState<number>(0);
  const [duration, setDuration] = useState<number>(0);
  const [volume, setVolume] = useState<number>(1);
  const [isMuted, setIsMuted] = useState<boolean>(false);
  const videoRef = useRef<HTMLVideoElement>(null);

  // 1. Adicionar lista de vídeos e estado do índice do vídeo atual
  const videoList = [
    {
      file: "/assets/Sons_De_Cidade.mp4",
      title: "Sons de Cidade",
      icon: "/assets/images/imagem_cidade.jpg",
    },
    {
      file: "/assets/Demon Slayer - Opening 1 _ 4K _ 60FPS _ Creditless _.mp4",
      title: "Demon Slayer OP 1",
      icon: "/assets/images/demon_slayer.jpg",
    },
  ];
  const [currentVideoIndex, setCurrentVideoIndex] = useState<number>(0);

  const formatTime = (timeInSeconds: number): string => {
    if (isNaN(timeInSeconds)) {
        return "0:00";
    }
    const minutes = Math.floor(timeInSeconds / 60);
    const seconds = Math.floor(timeInSeconds % 60);
    return `${minutes}:${seconds < 10 ? '0' : ''}${seconds}`;
  };

  // 3. Atualizar playPause para garantir autoplay correto
  const playPause = () => {
    const video = videoRef.current;
    if (!video) return;
    if (playing) {
      video.pause();
      setPlaying(false);
    } else {
      video.play().then(() => setPlaying(true)).catch(() => setPlaying(false));
    }
  };

  const seekBackward = () => {
    const video = videoRef.current;
    if (video) {
        video.currentTime -= 10;
    }
  };

  const seekForward = () => {
    const video = videoRef.current;
    if (video) {
        video.currentTime += 10;
    }
  };

  const handleVolumeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newVolume = parseFloat(e.target.value);
    setVolume(newVolume);
    if (videoRef.current) {
        videoRef.current.volume = newVolume;
        if (newVolume > 0 && isMuted) {
            setIsMuted(false);
            videoRef.current.muted = false;
        } else if (newVolume === 0) {
            setIsMuted(true);
            videoRef.current.muted = true;
        }
    }
  };

  const toggleMute = () => {
    const video = videoRef.current;
    if (video) {
        const newMutedState = !isMuted;
        video.muted = newMutedState;
        setIsMuted(newMutedState);
        if (!newMutedState && volume === 0) {
            setVolume(0.5);
            video.volume = 0.5;
        }
    }
  };

  // 2. Atualizar useEffect para trocar vídeo ao terminar
  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    const handleLoadedMetadata = () => {
      setDuration(video.duration);
    };

    const handleTimeUpdate = () => {
      setCurrentTime(video.currentTime);
    };

    const handleVideoEnd = () => {
      // Troca para o próximo vídeo
      const nextIndex = (currentVideoIndex + 1) % videoList.length;
      setCurrentVideoIndex(nextIndex);
      setPlaying(true); // Garante autoplay
    };

    const handleVolumeChangeFromVideo = () => {
      setVolume(video.volume);
      setIsMuted(video.muted);
    };

    video.addEventListener('loadedmetadata', handleLoadedMetadata);
    video.addEventListener('timeupdate', handleTimeUpdate);
    video.addEventListener('ended', handleVideoEnd);
    video.addEventListener('volumechange', handleVolumeChangeFromVideo);

    // Atualiza src do vídeo
    video.src = videoList[currentVideoIndex].file;
    video.load();
    setCurrentTime(0);

    if (playing) {
      video.play().catch(() => setPlaying(false));
    } else {
      video.pause();
    }

    return () => {
      video.removeEventListener('loadedmetadata', handleLoadedMetadata);
      video.removeEventListener('timeupdate', handleTimeUpdate);
      video.removeEventListener('ended', handleVideoEnd);
      video.removeEventListener('volumechange', handleVolumeChangeFromVideo);
    };
  }, [currentVideoIndex, playing]);

  const handleProgressClick = (e: React.MouseEvent<HTMLDivElement>) => {
    const video = videoRef.current;
    if (!video) return;

    const progressContainer = e.currentTarget;
    const clickPositionX = e.clientX - progressContainer.getBoundingClientRect().left;
    const containerWidth = progressContainer.offsetWidth;
    const newTime = (clickPositionX / containerWidth) * duration;

    video.currentTime = newTime;
    setCurrentTime(newTime);
  };

  // 4. Adicionar função para selecionar vídeo manualmente
  const handleSelectVideo = (index: number) => {
    if (index !== currentVideoIndex) {
      setCurrentVideoIndex(index);
      setPlaying(true); // Autoplay ao trocar
    }
  };


  return (
    <div className="w-screen h-screen bg-[#121212] flex justify-center items-center font-sans text-white">
      <div className="bg-[#1a1a1a] rounded-[20px] p-[25px] w-[350px] shadow-lg shadow-black/50 flex flex-col items-center">
        <div className="w-full flex justify-start items-center mb-[20px]">
          <FaTiktok className="text-[24px] text-white mr-[8px]" />
          <span className="text-[16px] text-[#b0b0b0]">@animestuff</span>
        </div>

        <div className="w-full max-w-[300px] h-[168px] rounded-[10px] overflow-hidden mb-[25px] relative bg-black flex items-center justify-center">
          <video
            ref={videoRef}
            className="w-full h-full object-cover"
            onClick={playPause}
          ></video>
        </div>

        <div className="text-center mb-[25px]">
          <h2 className="text-[24px] m-0 font-bold text-white capitalize">{videoList[currentVideoIndex].title}</h2>
          <p className="text-[16px] text-[#b0b0b0] mt-[5px]">Vídeo Oficial</p>
        </div>

        {/* Barra de progresso do vídeo */}
        <div className="flex items-center w-full mb-[20px]">
          <span className="text-[14px] text-[#b0b0b0] w-[40px] text-center">{formatTime(currentTime)}</span>
          
          <div 
            onClick={handleProgressClick} 
            className="flex-grow mx-[10px] flex items-center h-[20px] cursor-pointer group"
          >
            <div className="w-full h-[4px] bg-[#333] rounded-[2px] relative group-hover:h-[6px] transition-all duration-200">
              <div id="progressBar" className="h-full bg-[#e0e0e0] rounded-[2px]" style={{ width: `${(currentTime / duration) * 100 || 0}%` }}></div>
            </div>
          </div>

          <span className="text-[14px] text-[#b0b0b0] w-[40px] text-center">{formatTime(duration)}</span>
        </div>

        {/* Controles do player */}
        <div className="flex justify-between items-center w-full max-w-[280px] mx-auto">
          <FaBackward onClick={seekBackward} className="text-[24px] text-[#b0b0b0] cursor-pointer hover:text-white transition-colors" />
          
          <div onClick={playPause} className="w-[60px] h-[60px] bg-[#ff0050] rounded-full flex justify-center items-center cursor-pointer shadow-xl shadow-red-500/40 mx-[20px] transform hover:scale-105 transition-transform">
            {playing ?
              <FaPause className="text-[28px] text-white ml-0" />
              :
              <FaPlay className="text-[28px] text-white ml-[4px]" />
            }
          </div>
          
          <FaForward onClick={seekForward} className="text-[24px] text-[#b0b0b0] cursor-pointer hover:text-white transition-colors" />

          {/* Controle de volume */}
          <div className="group relative flex items-center p-2 -m-2">
            <div onClick={toggleMute} className="cursor-pointer">
                {isMuted || volume === 0 ? 
                    <FaVolumeMute className="text-[24px] text-[#b0b0b0] group-hover:text-white transition-colors duration-200" /> : 
                    <FaVolumeUp className="text-[24px] text-[#b0b0b0] group-hover:text-white transition-colors duration-200" />
                }
            </div>
            
            {/* O painel com o slider de volume que aparece no hover */}
            <div className="absolute bottom-full left-1/2 -translate-x-1/2 invisible opacity-0 
                          group-hover:visible group-hover:opacity-100 group-hover:-translate-y-2 transition-all duration-300">
                <div className="p-3 bg-[#282828] border border-solid border-[#404040] rounded-xl shadow-lg">
                    <input 
                        type="range" 
                        min="0" 
                        max="1" 
                        step="0.01" 
                        value={isMuted ? 0 : volume}
                        onChange={handleVolumeChange}
                        className="h-24 w-2 cursor-pointer appearance-none bg-transparent 
                                  [&::-webkit-slider-runnable-track]:rounded-full [&::-webkit-slider-runnable-track]:bg-neutral-600
                                  [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:h-4 [&::-webkit-slider-thumb]:w-4 [&::-webkit-slider-thumb]:rounded-full 
                                  [&::-webkit-slider-thumb]:bg-white [&::-webkit-slider-thumb]:shadow-md"
                        style={{ writingMode: 'vertical-lr', direction: 'rtl' }}
                    />
                </div>
            </div>
          </div>
        </div>

        {/* 6. Adicionar lista de seleção de vídeos no final */}
        <div className="flex gap-2 mt-4 overflow-x-auto">
          {videoList.map((video, index) => (
            <button
              key={index}
              onClick={() => handleSelectVideo(index)}
              className={`flex flex-col items-center p-2 border rounded ${index === currentVideoIndex ? 'bg-[#333]' : 'bg-transparent'}`}
            >
              <img src={video.icon} alt={video.title} className="w-12 h-12 object-cover rounded" />
              <span className="text-xs mt-1">{video.title}</span>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}