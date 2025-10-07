import React from 'react';
import { motion, useSpring, useTransform } from 'framer-motion';

interface ProgressBarProps {
  progress: number;
  color?: string;
  height?: string;
  showLabel?: boolean;
  animated?: boolean;
  className?: string;
  showGlow?: boolean;
  springConfig?: {
    stiffness?: number;
    damping?: number;
    mass?: number;
  };
}

const ProgressBar: React.FC<ProgressBarProps> = ({
  progress,
  color = 'var(--profile-color, #ED8EA6)', // 默认使用动态 profile color
  height = 'h-3',
  showLabel = false,
  animated = true,
  className = '',
  showGlow = false,
  springConfig = {
    stiffness: 100,
    damping: 30,
    mass: 0.8
  }
}) => {
  // 确保进度值在0-100之间
  const clampedProgress = Math.min(100, Math.max(0, progress));

  // 使用 framer-motion 的 useSpring 来创建平滑的递增动画
  const animatedProgress = useSpring(clampedProgress, springConfig);

  return (
    <div className={`w-full ${className}`}>
      <motion.div 
        className={`w-full bg-gray-200 dark:bg-gray-700 rounded-full ${height} overflow-hidden shadow-inner`}
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.3 }}
      >
        <motion.div
          className={`${height} rounded-full relative ${showGlow ? 'shadow-lg' : ''}`}
          style={{ 
            backgroundColor: color,
            width: useTransform(animatedProgress, (value) => `${value}%`),
            boxShadow: showGlow ? `0 0 10px ${color}40` : 'none',
            transformOrigin: "left"
          }}
          initial={{ scaleX: 0 }}
          animate={{ scaleX: 1 }}
          transition={{ duration: 0.5, ease: "easeOut" }}
        >
          {/* 光泽效果 */}
          {animated && (
            <motion.div
              className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent rounded-full"
              animate={{ x: ['-100%', '100%'] }}
              transition={{
                duration: 2,
                repeat: Infinity,
                ease: "easeInOut",
                repeatDelay: 1.5
              }}
            />
          )}
        </motion.div>
      </motion.div>
      
      {showLabel && (
        <motion.div 
          className="flex justify-between text-sm text-gray-500 dark:text-gray-400 mt-2"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.2 }}
        >
          <span>进度: {clampedProgress.toFixed(1)}%</span>
          <span>剩余: {(100 - clampedProgress).toFixed(1)}%</span>
        </motion.div>
      )}
    </div>
  );
};

export default ProgressBar;
