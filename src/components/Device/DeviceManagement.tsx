import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { FiMonitor, FiSmartphone, FiTablet, FiTrash2, FiClock } from 'react-icons/fi';
import { useTranslation } from 'react-i18next';
import toast from 'react-hot-toast';
import { deviceAPI } from '../../utils/api';
import type { DeviceSession } from '../../types/device';
import RevokeSessionModal from './RevokeSessionModal';

const DeviceManagement: React.FC = () => {
  const { t, i18n } = useTranslation();
  const [sessions, setSessions] = useState<DeviceSession[]>([]);
  const [isLoadingSessions, setIsLoadingSessions] = useState(true);
  const [revokingSessionId, setRevokingSessionId] = useState<number | null>(null);
  const [showRevokeModal, setShowRevokeModal] = useState(false);
  const [sessionToRevoke, setSessionToRevoke] = useState<DeviceSession | null>(null);

  // 获取设备会话列表
  const fetchSessions = async () => {
    try {
      setIsLoadingSessions(true);
      const sessionsData = await deviceAPI.getSessions();
      setSessions(sessionsData);
    } catch (error) {
      console.error('获取设备会话失败:', error);
      toast.error(t('settings.device.sessions.loadError', 'Failed to load sessions'));
    } finally {
      setIsLoadingSessions(false);
    }
  };


  // 打开撤销会话模态框
  const handleShowRevokeModal = (session: DeviceSession) => {
    setSessionToRevoke(session);
    setShowRevokeModal(true);
  };

  // 关闭撤销会话模态框
  const handleCloseRevokeModal = () => {
    if (revokingSessionId) return; // 如果正在撤销中，不允许关闭
    setShowRevokeModal(false);
    setSessionToRevoke(null);
  };

  // 确认撤销会话
  const handleConfirmRevoke = async () => {
    if (!sessionToRevoke) return;

    try {
      setRevokingSessionId(sessionToRevoke.id);
      await deviceAPI.revokeSession(sessionToRevoke.id);
      toast.success(t('settings.device.sessions.revokeSuccess'));
      
      // 关闭模态框
      setShowRevokeModal(false);
      setSessionToRevoke(null);
      
      // 重新获取会话列表
      await fetchSessions();
    } catch (error) {
      console.error('撤销会话失败:', error);
      toast.error(t('settings.device.sessions.revokeError'));
    } finally {
      setRevokingSessionId(null);
    }
  };

  // 获取设备类型图标
  const getDeviceIcon = (deviceType: string) => {
    const type = deviceType.toLowerCase();
    if (type.includes('mobile') || type.includes('phone')) {
      return <FiSmartphone className="w-5 h-5" />;
    } else if (type.includes('tablet') || type.includes('ipad')) {
      return <FiTablet className="w-5 h-5" />;
    } else {
      return <FiMonitor className="w-5 h-5" />;
    }
  };

  // 获取设备类型显示名称
  const getDeviceTypeName = (session: DeviceSession) => {
    // 如果是 osu!lazer 客户端，显示为桌面应用
    if (session.user_agent === 'osu!' || session.user_agent.toLowerCase().includes('osu!')) {
      return t('settings.device.deviceTypes.app');
    }
    
    const type = session.device_type.toLowerCase();
    if (type === 'osu_web') {
      return 'Web 浏览器';
    } else if (type.includes('mobile') || type.includes('phone')) {
      return t('settings.device.deviceTypes.mobile');
    } else if (type.includes('tablet') || type.includes('ipad')) {
      return t('settings.device.deviceTypes.tablet');
    } else if (type.includes('desktop') || type.includes('computer')) {
      return t('settings.device.deviceTypes.desktop');
    } else {
      return t('settings.device.deviceTypes.unknown');
    }
  };

  // 获取客户端显示名称
  const getClientDisplayName = (session: DeviceSession) => {
    // 检查是否是 osu!lazer 客户端
    if (session.user_agent === 'osu!' || session.user_agent.toLowerCase().includes('osu!')) {
      return 'osu!lazer';
    }
    
    // 如果有自定义显示名称，优先使用
    if (session.client_display_name && session.client_display_name !== 'osu! web') {
      return session.client_display_name;
    }
    
    // 根据设备类型返回合适的名称
    if (session.device_type === 'osu_web') {
      return 'osu! web';
    }
    
    // 否则根据User Agent解析浏览器名称
    const ua = session.user_agent.toLowerCase();
    if (ua.includes('edge')) {
      return 'Microsoft Edge';
    } else if (ua.includes('chrome') && !ua.includes('edge')) {
      return 'Google Chrome';
    } else if (ua.includes('firefox')) {
      return 'Mozilla Firefox';
    } else if (ua.includes('safari') && !ua.includes('chrome')) {
      return 'Safari';
    } else if (ua.includes('opera')) {
      return 'Opera';
    } else {
      return t('settings.device.browsers.unknown');
    }
  };

  // 格式化日期
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString(i18n.language === 'zh' ? 'zh-CN' : 'en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  // 初始化时获取数据
  useEffect(() => {
    fetchSessions();
  }, []);

  return (
    <div>
      {/* 活跃会话列表 */}
      <div>

        {isLoadingSessions ? (
          <div className="flex items-center justify-center py-8">
            <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-osu-pink"></div>
            <span className="ml-3 text-gray-500 dark:text-gray-400">
              {t('settings.device.sessions.loading')}
            </span>
          </div>
        ) : sessions.length === 0 ? (
          <div className="text-center py-8">
            <div className="text-4xl mb-3">🔒</div>
            <p className="text-gray-500 dark:text-gray-400">
              {t('settings.device.sessions.noSessions')}
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {sessions
              .sort((a, b) => {
                // 当前设备排在最前面
                if (a.is_current && !b.is_current) return -1;
                if (!a.is_current && b.is_current) return 1;
                // 其他按最后使用时间排序（最新的在前）
                return new Date(b.last_used_at).getTime() - new Date(a.last_used_at).getTime();
              })
              .map((session, index) => (
              <motion.div
                key={session.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
                className={`flex items-center justify-between p-4 rounded-lg border ${
                  session.is_current
                    ? 'border-green-200 dark:border-green-700 bg-green-50 dark:bg-green-900/10'
                    : 'border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800/50'
                }`}
              >
                <div className="flex items-center gap-3">
                  <div className={`p-2 rounded-lg ${
                    session.is_current
                      ? 'bg-green-100 dark:bg-green-800 text-green-600 dark:text-green-400'
                      : 'bg-gray-100 dark:bg-gray-600 text-gray-600 dark:text-gray-400'
                  }`}>
                    {getDeviceIcon(session.device_type)}
                  </div>
                  
                  <div>
                    <div className="flex items-center gap-2">
                      <h4 className="font-medium text-gray-900 dark:text-white">
                        {getClientDisplayName(session)}
                      </h4>
                      {session.is_current && (
                        <span className="px-2 py-1 bg-green-100 dark:bg-green-800 text-green-700 dark:text-green-300 text-xs rounded-full font-medium">
                          {t('settings.device.sessions.current')}
                        </span>
                      )}
                    </div>
                    
                    <div className="flex items-center gap-4 text-sm text-gray-600 dark:text-gray-400 mt-1">
                      <span>{getDeviceTypeName(session)}</span>
                      {session.location && !session.location.startsWith('IP:') && (
                        <>
                          <span>•</span>
                          <span>{session.location}</span>
                        </>
                      )}
                      <span>•</span>
                      <div className="flex items-center gap-1">
                        <FiClock className="w-3 h-3" />
                        <span>{formatDate(session.last_used_at)}</span>
                      </div>
                    </div>
                  </div>
                </div>
                
                {!session.is_current && (
                  <button
                    onClick={() => handleShowRevokeModal(session)}
                    disabled={revokingSessionId === session.id}
                    className="flex items-center gap-2 px-3 py-2 text-sm text-red-600 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {revokingSessionId === session.id ? (
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-red-600"></div>
                    ) : (
                      <FiTrash2 className="w-4 h-4" />
                    )}
                    <span>{t('settings.device.sessions.revoke')}</span>
                  </button>
                )}
              </motion.div>
            ))}
          </div>
        )}
      </div>

      {/* 撤销会话确认模态框 */}
      <RevokeSessionModal
        isOpen={showRevokeModal}
        session={sessionToRevoke}
        isRevoking={revokingSessionId === sessionToRevoke?.id}
        onClose={handleCloseRevokeModal}
        onConfirm={handleConfirmRevoke}
      />
    </div>
  );
};

export default DeviceManagement;
