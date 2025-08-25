import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'motion/react';
import { useAuth } from '../../hooks/useAuth';
import ServerStatsCard from '../UI/ServerStatsCard';

const HeroSection: React.FC = () => {
  const { isAuthenticated, user } = useAuth();

  return (
    <section className="relative overflow-hidden min-h-screen flex items-center">
      {/* Background decorations */}
      <div className="absolute inset-0 bg-grid-pattern opacity-5"></div>
      <div className="absolute top-20 left-10 w-72 h-72 bg-gradient-to-r from-teal-300 to-cyan-300 rounded-full opacity-10 blur-3xl"></div>
      <div className="absolute bottom-20 right-10 w-96 h-96 bg-gradient-to-r from-pink-300 to-rose-300 rounded-full opacity-10 blur-3xl"></div>

      <div className="relative max-w-7xl mx-auto container-padding grid lg:grid-cols-2 gap-12 items-center">
        {/* Left side - Content */}
        <div className="text-center lg:text-left">
          <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8 }}>
            {/* Logo and brand */}
            <div className="flex items-center justify-center lg:justify-start mb-6">
              <div className="w-16 h-16 bg-gradient-to-r from-pink-400 to-teal-400 rounded-2xl flex items-center justify-center mr-4 shadow-lg p-2">
                <img src="/image/logo.svg" alt="Logo" className="w-full h-full object-contain" />
              </div>
              <h1 className="text-5xl md:text-6xl font-bold">
                <span className="gradient-text">咕哦！</span>
              </h1>
            </div>

            <h2 className="text-2xl md:text-3xl lg:text-4xl font-bold text-gray-800 dark:text-gray-200 mb-6 leading-tight">
              为玩家提供全模式 RX / AP 与完整 PP 生态
            </h2>

            <p className="text-lg md:text-xl text-gray-600 dark:text-gray-300 mb-8 max-w-2xl mx-auto lg:mx-0 leading-relaxed">
              标准 / 太鼓 / 接水果 / Mania 全面支持，实时计算与灵活改名，让你的节奏旅程更自由，立即连接你的客户端开始游戏。
            </p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start items-center mb-8"
          >
            {isAuthenticated ? (
              <>
                <Link to="/profile" className="btn-primary text-lg px-8 py-4 min-w-[180px]">
                  查看资料
                </Link>
                <Link to="/rankings" className="btn-secondary text-lg px-8 py-4 min-w-[180px]">
                  查看排行榜
                </Link>
              </>
            ) : (
              <>
                <Link to="/register" className="btn-primary text-lg px-8 py-4 min-w-[180px]">
                  立即加入
                </Link>
                <Link to="/login" className="btn-secondary text-lg px-8 py-4 min-w-[180px]">
                  使用 lazer 登录
                </Link>
              </>
            )}
          </motion.div>

          {/* Features badges placeholder */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.3 }}
            className="flex flex-wrap gap-3 justify-center lg:justify-start mb-8"
          />

          {isAuthenticated && user && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.8, delay: 0.4 }}
              className="p-4 bg-gradient-to-r from-pink-50 to-teal-50 dark:from-pink-900/20 dark:to-teal-900/20 border border-pink-200 dark:border-pink-700 rounded-2xl inline-block"
            >
              <p className="text-lg text-gray-700 dark:text-gray-300">
                欢迎回来，<span className="font-semibold" style={{ color: '#ED8EA6' }}>{user.username}</span>！
              </p>
            </motion.div>
          )}
        </div>

        {/* Right side - Server Stats */}
        <div className="flex items-center justify-center">
          <motion.div initial={{ opacity: 0, x: 30 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.8, delay: 0.3 }}>
            <ServerStatsCard />
          </motion.div>
        </div>
      </div>
    </section>
  );
};

export default HeroSection;
