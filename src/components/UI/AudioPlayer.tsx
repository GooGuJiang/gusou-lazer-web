import React, { createContext, useContext, useEffect, useRef, useState, useCallback } from 'react';
import { motion, useSpring, useTransform, AnimatePresence } from 'framer-motion';
import { Play, Pause, Volume2, VolumeX, RotateCcw } from 'lucide-react';

interface AudioState {
  isPlaying: boolean;
  currentTime: number;
  duration: number;
  volume: number;
  isMuted: boolean;
  isLoading: boolean;
  currentUrl?: string;
}

interface AudioContextType extends AudioState {
  play: (url: string) => void;
  pause: () => void;
  stop: () => void;
  seek: (time: number) => void;
  setVolume: (volume: number) => void;
  toggleMute: () => void;
  audioElement: HTMLAudioElement | null;
}

const AudioContext = createContext<AudioContextType | null>(null);

export const useAudio = () => {
  const context = useContext(AudioContext);
  if (!context) {
    throw new Error('useAudio must be used within an AudioProvider');
  }
  return context;
};

interface AudioProviderProps {
  children: React.ReactNode;
}

export const AudioProvider: React.FC<AudioProviderProps> = ({ children }) => {
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const [state, setState] = useState<AudioState>({
    isPlaying: false,
    currentTime: 0,
    duration: 0,
    volume: 0.7,
    isMuted: false,
    isLoading: false,
    currentUrl: undefined,
  });

  useEffect(() => {
    const audio = new Audio();
    audioRef.current = audio;

    // Set initial volume
    audio.volume = state.volume;

    const handleLoadStart = () => {
      setState(prev => ({ ...prev, isLoading: true }));
    };

    const handleCanPlay = () => {
      setState(prev => ({ ...prev, isLoading: false }));
    };

    const handlePlay = () => {
      setState(prev => ({ ...prev, isPlaying: true }));
    };

    const handlePause = () => {
      setState(prev => ({ ...prev, isPlaying: false }));
    };

    const handleTimeUpdate = () => {
      setState(prev => ({
        ...prev,
        currentTime: audio.currentTime,
        duration: audio.duration || 0,
      }));
    };

    const handleEnded = () => {
      setState(prev => ({
        ...prev,
        isPlaying: false,
        currentTime: 0,
      }));
    };

    const handleVolumeChange = () => {
      setState(prev => ({
        ...prev,
        volume: audio.volume,
        isMuted: audio.muted,
      }));
    };

    const handleError = () => {
      setState(prev => ({
        ...prev,
        isLoading: false,
        isPlaying: false,
      }));
      console.error('Audio playback error');
    };

    audio.addEventListener('loadstart', handleLoadStart);
    audio.addEventListener('canplay', handleCanPlay);
    audio.addEventListener('play', handlePlay);
    audio.addEventListener('pause', handlePause);
    audio.addEventListener('timeupdate', handleTimeUpdate);
    audio.addEventListener('ended', handleEnded);
    audio.addEventListener('volumechange', handleVolumeChange);
    audio.addEventListener('error', handleError);

    return () => {
      audio.removeEventListener('loadstart', handleLoadStart);
      audio.removeEventListener('canplay', handleCanPlay);
      audio.removeEventListener('play', handlePlay);
      audio.removeEventListener('pause', handlePause);
      audio.removeEventListener('timeupdate', handleTimeUpdate);
      audio.removeEventListener('ended', handleEnded);
      audio.removeEventListener('volumechange', handleVolumeChange);
      audio.removeEventListener('error', handleError);
      audio.pause();
      audio.src = '';
    };
  }, []);

  const play = useCallback((url: string) => {
    const audio = audioRef.current;
    if (!audio) return;

    if (state.currentUrl !== url) {
      audio.src = url;
      setState(prev => ({ ...prev, currentUrl: url, currentTime: 0 }));
    }

    audio.play().catch(console.error);
  }, [state.currentUrl]);

  const pause = useCallback(() => {
    const audio = audioRef.current;
    if (!audio) return;
    audio.pause();
  }, []);

  const stop = useCallback(() => {
    const audio = audioRef.current;
    if (!audio) return;
    audio.pause();
    audio.currentTime = 0;
    setState(prev => ({ ...prev, currentTime: 0 }));
  }, []);

  const seek = useCallback((time: number) => {
    const audio = audioRef.current;
    if (!audio) return;
    audio.currentTime = time;
  }, []);

  const setVolume = useCallback((volume: number) => {
    const audio = audioRef.current;
    if (!audio) return;
    audio.volume = Math.max(0, Math.min(1, volume));
  }, []);

  const toggleMute = useCallback(() => {
    const audio = audioRef.current;
    if (!audio) return;
    audio.muted = !audio.muted;
  }, []);

  const contextValue: AudioContextType = {
    ...state,
    play,
    pause,
    stop,
    seek,
    setVolume,
    toggleMute,
    audioElement: audioRef.current,
  };

  return (
    <AudioContext.Provider value={contextValue}>
      {children}
    </AudioContext.Provider>
  );
};

// 播放按钮组件（类似 osu-web 的设计）
interface AudioPlayButtonProps {
  audioUrl: string;
  className?: string;
  size?: 'sm' | 'md' | 'lg';
  showProgress?: boolean;
}

export const AudioPlayButton: React.FC<AudioPlayButtonProps> = ({
  audioUrl,
  className = '',
  size = 'md',
  showProgress = false,
}) => {
  const { play, pause, stop, isPlaying, currentUrl, currentTime, duration, isLoading } = useAudio();
  
  const isCurrentTrack = currentUrl === audioUrl;
  const isCurrentlyPlaying = isCurrentTrack && isPlaying;
  
  const progress = isCurrentTrack && duration > 0 ? (currentTime / duration) * 100 : 0;

  const sizeClasses = {
    sm: 'w-8 h-8',
    md: 'w-12 h-12',
    lg: 'w-16 h-16',
  };

  const iconSizes = {
    sm: 16,
    md: 20,
    lg: 24,
  };

  const handleClick = () => {
    if (isCurrentlyPlaying) {
      pause();
    } else if (isCurrentTrack) {
      play(audioUrl);
    } else {
      stop();
      play(audioUrl);
    }
  };

  return (
    <motion.button
      onClick={handleClick}
      className={`
        relative flex items-center justify-center rounded-full
        bg-osu-pink hover:bg-osu-pink/80 text-white shadow-lg
        transition-colors duration-200
        ${sizeClasses[size]} ${className}
      `}
      disabled={isLoading}
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.95 }}
      transition={{ type: "spring", stiffness: 400, damping: 17 }}
    >
      {/* 进度环 */}
      {showProgress && isCurrentTrack && (
        <motion.svg
          className="absolute inset-0 w-full h-full transform -rotate-90"
          viewBox="0 0 36 36"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.3 }}
        >
          <path
            className="text-white/20"
            stroke="currentColor"
            strokeWidth="2"
            fill="none"
            d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
          />
          <motion.path
            className="text-white"
            stroke="currentColor"
            strokeWidth="2"
            fill="none"
            strokeDasharray={`${progress}, 100`}
            d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
            initial={{ strokeDasharray: "0, 100" }}
            animate={{ strokeDasharray: `${progress}, 100` }}
            transition={{ duration: 0.3, ease: "easeOut" }}
          />
        </motion.svg>
      )}
      
      {/* 播放/暂停图标 */}
      <div className="relative z-10">
        <AnimatePresence mode="wait">
          {isLoading && isCurrentTrack ? (
            <motion.div
              key="loading"
              initial={{ opacity: 0, rotate: -180 }}
              animate={{ opacity: 1, rotate: 0 }}
              exit={{ opacity: 0, rotate: 180 }}
              transition={{ duration: 0.2 }}
            >
              <RotateCcw size={iconSizes[size]} className="animate-spin" />
            </motion.div>
          ) : (
            <motion.div
              key={isCurrentlyPlaying ? 'pause' : 'play'}
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.8 }}
              transition={{ duration: 0.15 }}
            >
              {isCurrentlyPlaying ? (
                <Pause size={iconSizes[size]} />
              ) : (
                <Play size={iconSizes[size]} className="ml-0.5" />
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </motion.button>
  );
};

// 完整的音频播放器控制栏（类似 osu-web 的主播放器）
interface AudioPlayerControlsProps {
  className?: string;
}

export const AudioPlayerControls: React.FC<AudioPlayerControlsProps> = ({ className = '' }) => {
  const {
    isPlaying,
    currentTime,
    duration,
    volume,
    isMuted,
    currentUrl,
    play,
    pause,
    seek,
    setVolume,
    toggleMute,
  } = useAudio();

  const progressRef = useRef<HTMLDivElement>(null);
  const volumeRef = useRef<HTMLDivElement>(null);
  const [isDraggingProgress, setIsDraggingProgress] = useState(false);
  const [isDraggingVolume, setIsDraggingVolume] = useState(false);

  // 使用 framer-motion 的 useSpring 来创建平滑的递增动画
  const progress = duration > 0 ? (currentTime / duration) * 100 : 0;
  const volumeProgress = volume * 100;
  
  const animatedProgress = useSpring(progress, {
    stiffness: 100,
    damping: 30,
    mass: 0.8
  });
  
  const animatedVolumeProgress = useSpring(volumeProgress, {
    stiffness: 150,
    damping: 25,
    mass: 0.5
  });

  // 将 useTransform 移到组件顶层
  const progressWidth = useTransform(animatedProgress, (value) => `${value}%`);
  const volumeWidth = useTransform(animatedVolumeProgress, (value) => `${value}%`);

  const formatTime = (time: number) => {
    const minutes = Math.floor(time / 60);
    const seconds = Math.floor(time % 60);
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  };

  // 进度条拖动处理
  const updateProgressFromMouse = (e: MouseEvent | React.MouseEvent) => {
    if (!progressRef.current || !duration) return;
    
    const rect = progressRef.current.getBoundingClientRect();
    const progress = Math.max(0, Math.min(1, (e.clientX - rect.left) / rect.width));
    seek(progress * duration);
  };

  const handleProgressMouseDown = (e: React.MouseEvent) => {
    e.preventDefault();
    setIsDraggingProgress(true);
    updateProgressFromMouse(e);
  };

  const handleProgressClick = (e: React.MouseEvent) => {
    if (!isDraggingProgress) {
      updateProgressFromMouse(e);
    }
  };

  // 音量条拖动处理
  const updateVolumeFromMouse = (e: MouseEvent | React.MouseEvent) => {
    if (!volumeRef.current) return;
    
    const rect = volumeRef.current.getBoundingClientRect();
    const volume = Math.max(0, Math.min(1, (e.clientX - rect.left) / rect.width));
    setVolume(volume);
  };

  const handleVolumeMouseDown = (e: React.MouseEvent) => {
    e.preventDefault();
    setIsDraggingVolume(true);
    updateVolumeFromMouse(e);
  };

  const handleVolumeClick = (e: React.MouseEvent) => {
    if (!isDraggingVolume) {
      updateVolumeFromMouse(e);
    }
  };

  // 全局鼠标事件处理
  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (isDraggingProgress) {
        updateProgressFromMouse(e);
      }
      if (isDraggingVolume) {
        updateVolumeFromMouse(e);
      }
    };

    const handleMouseUp = () => {
      setIsDraggingProgress(false);
      setIsDraggingVolume(false);
    };

    if (isDraggingProgress || isDraggingVolume) {
      document.addEventListener('mousemove', handleMouseMove);
      document.addEventListener('mouseup', handleMouseUp);
      document.body.style.userSelect = 'none'; // 防止拖动时选中文本
    }

    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
      document.body.style.userSelect = '';
    };
  }, [isDraggingProgress, isDraggingVolume, duration]);

  if (!currentUrl) return null;

  return (
    <div className={`
      fixed bottom-0 left-0 right-0 z-50
      bg-white dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700
      px-4 py-3 flex items-center gap-4
      ${className}
    `}>
      {/* 播放/暂停按钮 */}
      <motion.button
        onClick={isPlaying ? pause : () => currentUrl && play(currentUrl)}
        className="flex items-center justify-center w-10 h-10 rounded-full bg-osu-pink hover:bg-osu-pink/80 text-white transition-colors shadow-lg"
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        transition={{ type: "spring", stiffness: 400, damping: 17 }}
      >
        <AnimatePresence mode="wait">
          <motion.div
            key={isPlaying ? 'pause' : 'play'}
            initial={{ opacity: 0, rotate: -90 }}
            animate={{ opacity: 1, rotate: 0 }}
            exit={{ opacity: 0, rotate: 90 }}
            transition={{ duration: 0.15 }}
          >
            {isPlaying ? <Pause size={20} /> : <Play size={20} className="ml-0.5" />}
          </motion.div>
        </AnimatePresence>
      </motion.button>

      {/* 进度条 */}
      <div className="flex-1 flex items-center gap-3">
        <span className="text-sm text-gray-600 dark:text-gray-400 min-w-[40px]">
          {formatTime(currentTime)}
        </span>
        
        <motion.div
          ref={progressRef}
          onClick={handleProgressClick}
          onMouseDown={handleProgressMouseDown}
          className={`flex-1 h-3 bg-gray-200 dark:bg-gray-700 rounded-full cursor-pointer group overflow-hidden ${
            isDraggingProgress ? 'cursor-grabbing' : 'cursor-pointer'
          }`}
          whileHover={{ height: 12 }}
          transition={{ duration: 0.2 }}
        >
          <motion.div
            className="h-full bg-osu-pink rounded-full relative group-hover:bg-osu-pink/90 shadow-sm"
            style={{ 
              width: progressWidth,
              transformOrigin: "left"
            }}
            initial={{ scaleX: 0 }}
            animate={{ scaleX: 1 }}
            transition={{ duration: 0.3, ease: "easeOut" }}
          >
            {/* 进度条光泽效果 */}
            <motion.div
              className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent rounded-full"
              animate={{ x: ['-100%', '100%'] }}
              transition={{
                duration: 2,
                repeat: Infinity,
                ease: "easeInOut",
                repeatDelay: 1
              }}
            />
            
            {/* 悬停时的拖拽点 */}
            <motion.div 
              className="absolute right-0 top-1/2 -translate-y-1/2 w-4 h-4 bg-osu-pink rounded-full shadow-lg border-2 border-white"
              initial={{ opacity: 0, scale: 0 }}
              whileHover={{ opacity: 1, scale: 1 }}
              transition={{ type: "spring", stiffness: 400, damping: 25 }}
            />
          </motion.div>
        </motion.div>
        
        <span className="text-sm text-gray-600 dark:text-gray-400 min-w-[40px]">
          {formatTime(duration)}
        </span>
      </div>

      {/* 音量控制 */}
      <div className="flex items-center gap-2">
        <motion.button
          onClick={toggleMute}
          className="p-2 text-gray-600 dark:text-gray-400 hover:text-osu-pink transition-colors rounded-lg"
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.9 }}
          transition={{ type: "spring", stiffness: 400, damping: 17 }}
        >
          <AnimatePresence mode="wait">
            <motion.div
              key={isMuted || volume === 0 ? 'muted' : 'unmuted'}
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.8 }}
              transition={{ duration: 0.15 }}
            >
              {isMuted || volume === 0 ? <VolumeX size={20} /> : <Volume2 size={20} />}
            </motion.div>
          </AnimatePresence>
        </motion.button>
        
        <motion.div
          ref={volumeRef}
          onClick={handleVolumeClick}
          onMouseDown={handleVolumeMouseDown}
          className={`w-20 h-2 bg-gray-200 dark:bg-gray-700 rounded-full group overflow-hidden ${
            isDraggingVolume ? 'cursor-grabbing' : 'cursor-pointer'
          }`}
          whileHover={{ height: 8 }}
          transition={{ duration: 0.2 }}
        >
          <motion.div
            className="h-full bg-osu-pink rounded-full relative group-hover:bg-osu-pink/90"
            style={{ 
              width: volumeWidth,
              transformOrigin: "left"
            }}
            initial={{ scaleX: 0 }}
            animate={{ scaleX: 1 }}
            transition={{ duration: 0.3, ease: "easeOut" }}
          >
            <motion.div 
              className="absolute right-0 top-1/2 -translate-y-1/2 w-3 h-3 bg-osu-pink rounded-full shadow-md border border-white"
              initial={{ opacity: 0, scale: 0 }}
              whileHover={{ opacity: 1, scale: 1 }}
              transition={{ type: "spring", stiffness: 400, damping: 25 }}
            />
          </motion.div>
        </motion.div>
      </div>
    </div>
  );
};
