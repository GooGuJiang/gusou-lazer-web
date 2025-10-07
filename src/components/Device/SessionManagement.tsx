import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { FiMonitor, FiSmartphone, FiTablet, FiTrash2, FiClock, FiMapPin, FiCheckCircle, FiXCircle } from 'react-icons/fi';
import { useTranslation } from 'react-i18next';
import toast from 'react-hot-toast';
import { deviceAPI } from '../../utils/api';
import type { Session, SessionsResponse } from '../../types/device';
import RemoveDeviceModal from './RemoveDeviceModal';

interface SessionManagementProps {
  className?: string;
}

const SessionManagement: React.FC<SessionManagementProps> = ({ className = '' }) => {
  const { t, i18n } = useTranslation();
  const [sessionsData, setSessionsData] = useState<SessionsResponse | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [revokingSessionId, setRevokingSessionId] = useState<number | null>(null);
  const [showRevokeModal, setShowRevokeModal] = useState(false);
  const [sessionToRevoke, setSessionToRevoke] = useState<Session | null>(null);

  // 获取会话列表
  const fetchSessions = async () => {
    try {
      setIsLoading(true);
      const data = await deviceAPI.getUserSessions();
      setSessionsData(data);
    } catch (error) {
      console.error('获取登录会话失败:', error);
      toast.error(t('settings.device.sessions.loadError'));
    } finally {
      setIsLoading(false);
    }
  };

  // 打开注销会话弹窗
  const handleShowRevokeModal = (session: Session) => {
    setSessionToRevoke(session);
    setShowRevokeModal(true);
  };

  // 关闭注销会话弹窗
  const handleCloseRevokeModal = () => {
    if (revokingSessionId) return;
    setShowRevokeModal(false);
    setSessionToRevoke(null);
  };

  // 确认注销会话
  const handleConfirmRevoke = async () => {
    if (!sessionToRevoke || revokingSessionId) return;

    try {
      setRevokingSessionId(sessionToRevoke.id);
      await deviceAPI.deleteSession(sessionToRevoke.id);
      toast.success(t('settings.device.sessions.revokeSuccess'));
      
      // 关闭弹窗
      setShowRevokeModal(false);
      setSessionToRevoke(null);
      
      // 重新获取会话列表
      await fetchSessions();
    } catch (error) {
      console.error('注销会话失败:', error);
      toast.error(t('settings.device.sessions.revokeError'));
    } finally {
      setRevokingSessionId(null);
    }
  };

  // 获取设备类型图标
  const getDeviceIcon = (session: Session) => {
    const { user_agent_info } = session;
    
    if (user_agent_info.is_mobile) {
      return <FiSmartphone className="w-5 h-5" />;
    } else if (user_agent_info.is_tablet) {
      return <FiTablet className="w-5 h-5" />;
    } else {
      return <FiMonitor className="w-5 h-5" />;
    }
  };

  // 获取设备显示名称
  const getDeviceDisplayName = (session: Session) => {
    const { user_agent_info } = session;
    
    if (user_agent_info.is_client) {
      return 'osu!lazer';
    }
    
    if (user_agent_info.browser && user_agent_info.browser !== 'Unknown') {
      return `${user_agent_info.browser}${user_agent_info.version ? ` ${user_agent_info.version}` : ''}`;
    }
    
    return t('settings.device.browsers.unknown');
  };

  // 获取设备类型名称
  const getDeviceTypeName = (session: Session) => {
    const { user_agent_info } = session;
    
    if (user_agent_info.is_client) {
      return t('settings.device.deviceTypes.app');
    } else if (user_agent_info.is_mobile) {
      return t('settings.device.deviceTypes.mobile');
    } else if (user_agent_info.is_tablet) {
      return t('settings.device.deviceTypes.tablet');
    } else if (user_agent_info.is_pc) {
      return t('settings.device.deviceTypes.desktop');
    } else {
      return t('settings.device.deviceTypes.unknown');
    }
  };

  // 格式化位置信息
  const formatLocation = (session: Session) => {
    const { location } = session;
    
    if (!location.country && !location.city) {
      return t('settings.device.sessions.localhost');
    }
    
    const parts = [];
    if (location.city) parts.push(location.city);
    if (location.country) parts.push(location.country);
    
    return parts.join(', ') || t('settings.device.sessions.localhost');
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

  // 判断是否为当前会话
  const isCurrentSession = (session: Session) => {
    return sessionsData?.current === session.id;
  };

  useEffect(() => {
    fetchSessions();
  }, []);

  return (
    <div className={className}>
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-medium text-gray-900 dark:text-white">
          {t('settings.device.sessions.title')}
        </h3>
        {sessionsData && (
          <span className="text-sm text-gray-500 dark:text-gray-400">
            {t('settings.device.sessions.totalSessions', { count: sessionsData.total })}
          </span>
        )}
      </div>

      {isLoading ? (
        <div className="flex items-center justify-center py-8">
          <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-osu-pink"></div>
          <span className="ml-3 text-gray-500 dark:text-gray-400">
            {t('settings.device.sessions.loading')}
          </span>
        </div>
      ) : !sessionsData || sessionsData.sessions.length === 0 ? (
        <div className="text-center py-8">
          <div className="text-4xl mb-3">🔒</div>
          <p className="text-gray-500 dark:text-gray-400">
            {t('settings.device.sessions.noSessions')}
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {sessionsData.sessions.map((session, index) => {
            const isCurrent = isCurrentSession(session);
            
            return (
              <motion.div
                key={session.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
                className={`flex items-center justify-between p-4 rounded-lg border ${
                  isCurrent
                    ? 'border-green-200 dark:border-green-700 bg-green-50 dark:bg-green-900/10'
                    : 'border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800/50'
                }`}
              >
                <div className="flex items-center gap-3 flex-1">
                  <div className={`p-2 rounded-lg ${
                    isCurrent
                      ? 'bg-green-100 dark:bg-green-800 text-green-600 dark:text-green-400'
                      : 'bg-gray-100 dark:bg-gray-600 text-gray-600 dark:text-gray-400'
                  }`}>
                    {getDeviceIcon(session)}
                  </div>
                  
                  <div className="flex-1">
                    <div className="flex items-center gap-2 flex-wrap">
                      <h4 className="font-medium text-gray-900 dark:text-white">
                        {getDeviceDisplayName(session)}
                      </h4>
                      {isCurrent && (
                        <span className="px-2 py-0.5 bg-green-100 dark:bg-green-800 text-green-700 dark:text-green-300 text-xs rounded-full font-medium">
                          {t('settings.device.sessions.current')}
                        </span>
                      )}
                      {session.is_verified ? (
                        <FiCheckCircle className="w-4 h-4 text-green-500" title={t('settings.device.sessions.verified')} />
                      ) : (
                        <FiXCircle className="w-4 h-4 text-yellow-500" title={t('settings.device.sessions.unverified')} />
                      )}
                    </div>
                    
                    <div className="flex items-center gap-3 text-sm text-gray-600 dark:text-gray-400 mt-1 flex-wrap">
                      <span>{getDeviceTypeName(session)}</span>
                      {session.user_agent_info.os && (
                        <>
                          <span>•</span>
                          <span>{session.user_agent_info.os}</span>
                        </>
                      )}
                      <span>•</span>
                      <div className="flex items-center gap-1">
                        <FiMapPin className="w-3 h-3" />
                        <span>{formatLocation(session)}</span>
                      </div>
                      <span>•</span>
                      <div className="flex items-center gap-1">
                        <FiClock className="w-3 h-3" />
                        <span>{formatDate(session.created_at)}</span>
                      </div>
                    </div>
                  </div>
                </div>
                
                {!isCurrent && (
                  <button
                    onClick={() => handleShowRevokeModal(session)}
                    disabled={revokingSessionId === session.id}
                    className="flex items-center gap-2 px-3 py-2 text-sm text-red-600 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed ml-3"
                  >
                    {revokingSessionId === session.id ? (
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-red-600"></div>
                    ) : (
                      <FiTrash2 className="w-4 h-4" />
                    )}
                    <span className="hidden sm:inline">{t('settings.device.sessions.revoke')}</span>
                  </button>
                )}
              </motion.div>
            );
          })}
        </div>
      )}

      {/* 注销会话确认弹窗 */}
      {sessionToRevoke && (
        <RemoveDeviceModal
          isOpen={showRevokeModal}
          isRemoving={revokingSessionId === sessionToRevoke.id}
          deviceName={getDeviceDisplayName(sessionToRevoke)}
          onClose={handleCloseRevokeModal}
          onConfirm={handleConfirmRevoke}
          title={t('settings.device.sessions.revokeTitle')}
          confirmText={t('settings.device.sessions.revoke')}
          warningText={t('settings.device.sessions.revokeWarning')}
        />
      )}
    </div>
  );
};

export default SessionManagement;

