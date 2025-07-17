"use client"

import { useRef, useState, useEffect } from "react";
import { FaPause, FaPlay, FaBackward, FaForward, FaVolumeUp, FaTiktok } from "react-icons/fa";

export default function Home() {
  const [playing, setPlaying] = useState<boolean>(false);
  const [currentTime, setCurrentTime] = useState<number>(0);
  const [duration, setDuration] = useState<number>(0);
  const [videoTitle, setVideoTitle] = useState<string>("Carregando...");
  const videoRef = useRef<HTMLVideoElement>(null);

  const formatTime = (timeInSeconds: number): string => {
    if (isNaN(timeInSeconds)) {
        return "0:00";
    }
    const minutes = Math.floor(timeInSeconds / 60);
    const seconds = Math.floor(timeInSeconds % 60);
    return `${minutes}:${seconds < 10 ? '0' : ''}${seconds}`;
  };

  const playPause = () => {
    const video = videoRef.current;
    if (!video) return;

    if (playing) {
      video.pause();
    } else {
      video.play();
    }
    setPlaying(!playing);
  };

  useEffect(() => {
    const video = videoRef.current;
    if (video) {
      const handleLoadedMetadata = () => {
        setDuration(video.duration);
        const videoFileName = video.src.split('/').pop()?.replace('.mp4', '') || "Vídeo sem título";
        setVideoTitle(videoFileName);
      };

      const handleTimeUpdate = () => {
        setCurrentTime(video.currentTime);
      };

      const handleVideoEnd = () => {
        setPlaying(false);
        if (videoRef.current) {
            videoRef.current.currentTime = 0;
        }
      };

      if (video.readyState >= 1) {
          handleLoadedMetadata();
      }

      video.addEventListener('loadedmetadata', handleLoadedMetadata);
      video.addEventListener('timeupdate', handleTimeUpdate);
      video.addEventListener('ended', handleVideoEnd);

      return () => {
        video.removeEventListener('loadedmetadata', handleLoadedMetadata);
        video.removeEventListener('timeupdate', handleTimeUpdate);
        video.removeEventListener('ended', handleVideoEnd);
      };
    }
  }, []); 

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
            src="/assets/Sons_De_Cidade.mp4"
          ></video>
        </div>

        <div className="text-center mb-[25px]">
          <h2 className="text-[24px] m-0 font-bold text-white capitalize">{videoTitle}</h2>
          <p className="text-[16px] text-[#b0b0b0] mt-[5px]">Vídeo Oficial</p>
        </div>

        <div className="flex items-center w-full mb-[30px]">
          <span className="text-[14px] text-[#b0b0b0] w-[40px] text-center">{formatTime(currentTime)}</span>
          <div onClick={handleProgressClick} className="flex-grow h-[4px] bg-[#333] rounded-[2px] mx-[10px] relative cursor-pointer">
            <div id="progressBar" className="h-full bg-[#e0e0e0] rounded-[2px]" style={{ width: `${(currentTime / duration) * 100 || 0}%` }}></div>
          </div>
          <span className="text-[14px] text-[#b0b0b0] w-[40px] text-center">{formatTime(duration)}</span>
        </div>

        <div className="flex justify-between items-center w-[80%] max-w-[280px] mx-auto">
          <FaBackward className="text-[24px] text-[#b0b0b0] cursor-pointer" />
          <div onClick={playPause} className="w-[60px] h-[60px] bg-[#ff0050] rounded-full flex justify-center items-center cursor-pointer shadow-xl shadow-red-500/40">
            {playing ?
              <FaPause className="text-[28px] text-white ml-0" />
              :
              <FaPlay className="text-[28px] text-white ml-[4px]" />
            }
          </div>
          <FaForward className="text-[24px] text-[#b0b0b0] cursor-pointer" />
          <FaVolumeUp className="text-[24px] text-[#b0b0b0] cursor-pointer" />
        </div>
      </div>
    </div>
  );
}