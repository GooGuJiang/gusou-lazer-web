import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  FiPlus, FiEdit2, FiTrash2, FiCopy, FiCheck, 
  FiAlertCircle, FiRefreshCw, FiExternalLink 
} from 'react-icons/fi';
import { useTranslation } from 'react-i18next';
import toast from 'react-hot-toast';
import { oauthAPI } from '../../utils/api';
import type { OAuthApp, CreateOAuthAppResponse } from '../../types/oauth';

const OAuthAppsSection: React.FC = () => {
  const { t } = useTranslation();
  const [apps, setApps] = useState<OAuthApp[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [editingApp, setEditingApp] = useState<OAuthApp | null>(null);
  const [newAppResponse, setNewAppResponse] = useState<CreateOAuthAppResponse | null>(null);
  const [copiedField, setCopiedField] = useState<string | null>(null);
  
  // 确认对话框状态
  const [deleteConfirm, setDeleteConfirm] = useState<{ clientId: number; name: string } | null>(null);
  const [refreshConfirm, setRefreshConfirm] = useState<{ clientId: number; name: string } | null>(null);

  // 加载应用列表
  const loadApps = async () => {
    try {
      setIsLoading(true);
      const data = await oauthAPI.list();
      setApps(data);
    } catch (error) {
      console.error('加载 OAuth 应用失败:', error);
      toast.error(t('settings.oauth.errors.loadFailed'));
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadApps();
  }, []);

  // 复制到剪贴板
  const copyToClipboard = async (text: string, field: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopiedField(field);
      toast.success(t('settings.oauth.copied'));
      setTimeout(() => setCopiedField(null), 2000);
    } catch (error) {
      toast.error(t('settings.oauth.errors.copyFailed'));
    }
  };

  // 删除应用
  const handleDelete = async (clientId: number, appName: string) => {
    setDeleteConfirm({ clientId, name: appName });
  };

  // 确认删除
  const confirmDelete = async () => {
    if (!deleteConfirm) return;

    try {
      await oauthAPI.delete(deleteConfirm.clientId);
      toast.success(t('settings.oauth.deleteSuccess'));
      loadApps();
    } catch (error) {
      console.error('删除应用失败:', error);
      toast.error(t('settings.oauth.errors.deleteFailed'));
    } finally {
      setDeleteConfirm(null);
    }
  };

  // 刷新密钥
  const handleRefreshSecret = async (clientId: number, appName: string) => {
    setRefreshConfirm({ clientId, name: appName });
  };

  // 确认刷新密钥
  const confirmRefreshSecret = async () => {
    if (!refreshConfirm) return;

    try {
      const response = await oauthAPI.refreshSecret(refreshConfirm.clientId);
      setNewAppResponse({
        client_id: response.client_id,
        client_secret: response.client_secret,
        name: refreshConfirm.name,
        description: '',
        redirect_uris: [],
        created_at: new Date().toISOString(),
      });
      toast.success(t('settings.oauth.refreshSuccess'));
      loadApps();
    } catch (error) {
      console.error('刷新密钥失败:', error);
      toast.error(t('settings.oauth.errors.refreshFailed'));
    } finally {
      setRefreshConfirm(null);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-osu-pink"></div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* 创建按钮 */}
      <div className="flex justify-between items-center">
        <p className="text-sm text-gray-600 dark:text-gray-400">
          {t('settings.oauth.description')}
        </p>
        <button
          onClick={() => setShowCreateModal(true)}
          className="btn-primary !px-4 !py-2 text-sm flex items-center gap-2"
        >
          <FiPlus className="w-4 h-4" />
          {t('settings.oauth.create')}
        </button>
      </div>

      {/* 应用列表 */}
      {apps.length === 0 ? (
        <div className="text-center py-12 bg-gray-50 dark:bg-gray-800/50 rounded-lg border-2 border-dashed border-gray-300 dark:border-gray-700">
          <FiExternalLink className="w-12 h-12 mx-auto mb-4 text-gray-400" />
          <p className="text-gray-600 dark:text-gray-400 mb-4">
            {t('settings.oauth.noApps')}
          </p>
          <button
            onClick={() => setShowCreateModal(true)}
            className="btn-primary !px-6 !py-2 text-sm"
          >
            {t('settings.oauth.createFirst')}
          </button>
        </div>
      ) : (
        <div className="space-y-3">
          {apps.map((app) => (
            <OAuthAppCard
              key={app.client_id}
              app={app}
              onEdit={setEditingApp}
              onDelete={handleDelete}
              onRefreshSecret={handleRefreshSecret}
              copiedField={copiedField}
              onCopy={copyToClipboard}
            />
          ))}
        </div>
      )}

      {/* 创建/编辑模态框 */}
      <CreateEditModal
        isOpen={showCreateModal || editingApp !== null}
        onClose={() => {
          setShowCreateModal(false);
          setEditingApp(null);
        }}
        app={editingApp}
        onSuccess={(response) => {
          setShowCreateModal(false);
          setEditingApp(null);
          if (response) {
            setNewAppResponse(response);
          }
          loadApps();
        }}
      />

      {/* 新应用密钥显示模态框 */}
      <SecretModal
        isOpen={newAppResponse !== null}
        onClose={() => setNewAppResponse(null)}
        response={newAppResponse}
        copiedField={copiedField}
        onCopy={copyToClipboard}
      />

      {/* 删除确认模态框 */}
      <ConfirmModal
        isOpen={deleteConfirm !== null}
        onClose={() => setDeleteConfirm(null)}
        onConfirm={confirmDelete}
        title={t('settings.oauth.deleteTitle')}
        message={t('settings.oauth.confirmDelete', { name: deleteConfirm?.name || '' })}
        confirmText={t('settings.oauth.confirmDeleteButton')}
        type="danger"
      />

      {/* 刷新密钥确认模态框 */}
      <ConfirmModal
        isOpen={refreshConfirm !== null}
        onClose={() => setRefreshConfirm(null)}
        onConfirm={confirmRefreshSecret}
        title={t('settings.oauth.refreshTitle')}
        message={t('settings.oauth.confirmRefresh', { name: refreshConfirm?.name || '' })}
        confirmText={t('settings.oauth.confirmRefreshButton')}
        type="warning"
      />
    </div>
  );
};

// OAuth 应用卡片组件
interface OAuthAppCardProps {
  app: OAuthApp;
  onEdit: (app: OAuthApp) => void;
  onDelete: (clientId: number, appName: string) => void;
  onRefreshSecret: (clientId: number, appName: string) => void;
  copiedField: string | null;
  onCopy: (text: string, field: string) => void;
}

const OAuthAppCard: React.FC<OAuthAppCardProps> = ({
  app,
  onEdit,
  onDelete,
  onRefreshSecret,
  copiedField,
  onCopy,
}) => {
  const { t, i18n } = useTranslation();
  const [isExpanded, setIsExpanded] = useState(false);

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-4 hover:shadow-md transition-shadow"
    >
      <div className="flex items-start justify-between gap-4">
        <div className="flex-1 min-w-0">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-1">
            {app.name}
          </h3>
          {app.description && (
            <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">
              {app.description}
            </p>
          )}
          <div className="flex items-center gap-4 text-xs text-gray-500 dark:text-gray-400">
            <div className="flex items-center gap-1">
              <span className="font-medium">{t('settings.oauth.clientId')}:</span>
              <button
                onClick={() => onCopy(app.client_id.toString(), `client_id_${app.client_id}`)}
                className="font-mono hover:text-osu-pink transition-colors flex items-center gap-1"
              >
                {app.client_id}
                {copiedField === `client_id_${app.client_id}` ? (
                  <FiCheck className="w-3 h-3 text-green-500" />
                ) : (
                  <FiCopy className="w-3 h-3" />
                )}
              </button>
            </div>
            <span>
              {t('settings.oauth.created')}: {new Date(app.created_at).toLocaleDateString(i18n.language === 'zh' ? 'zh-CN' : 'en-US')}
            </span>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setIsExpanded(!isExpanded)}
            className="text-sm text-osu-pink hover:text-osu-pink/80 transition-colors"
          >
            {isExpanded ? t('settings.oauth.collapse') : t('settings.oauth.expand')}
          </button>
          <button
            onClick={() => onEdit(app)}
            className="p-2 text-gray-600 dark:text-gray-400 hover:text-osu-pink dark:hover:text-osu-pink transition-colors"
            title={t('settings.oauth.edit')}
          >
            <FiEdit2 className="w-4 h-4" />
          </button>
          <button
            onClick={() => onRefreshSecret(app.client_id, app.name)}
            className="p-2 text-gray-600 dark:text-gray-400 hover:text-blue-500 dark:hover:text-blue-400 transition-colors"
            title={t('settings.oauth.refreshSecret')}
          >
            <FiRefreshCw className="w-4 h-4" />
          </button>
          <button
            onClick={() => onDelete(app.client_id, app.name)}
            className="p-2 text-gray-600 dark:text-gray-400 hover:text-red-500 dark:hover:text-red-400 transition-colors"
            title={t('settings.oauth.delete')}
          >
            <FiTrash2 className="w-4 h-4" />
          </button>
        </div>
      </div>

      <AnimatePresence>
        {isExpanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700 overflow-hidden"
          >
            <div className="space-y-3">
              <div>
                <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">
                  {t('settings.oauth.redirectUris')}
                </label>
                <div className="space-y-1">
                  {app.redirect_uris.map((uri, index) => (
                    <div
                      key={index}
                      className="text-sm font-mono text-gray-600 dark:text-gray-400 bg-gray-50 dark:bg-gray-900 px-3 py-2 rounded"
                    >
                      {uri}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
};

// 创建/编辑模态框组件
interface CreateEditModalProps {
  isOpen: boolean;
  onClose: () => void;
  app: OAuthApp | null;
  onSuccess: (response?: CreateOAuthAppResponse) => void;
}

const CreateEditModal: React.FC<CreateEditModalProps> = ({
  isOpen,
  onClose,
  app,
  onSuccess,
}) => {
  const { t } = useTranslation();
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [redirectUris, setRedirectUris] = useState<string[]>(['']);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (app) {
      setName(app.name);
      setDescription(app.description || '');
      setRedirectUris(app.redirect_uris.length > 0 ? app.redirect_uris : ['']);
    } else {
      setName('');
      setDescription('');
      setRedirectUris(['']);
    }
  }, [app, isOpen]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const validUris = redirectUris.filter((uri) => uri.trim());
    if (validUris.length === 0) {
      toast.error(t('settings.oauth.errors.noRedirectUri'));
      return;
    }

    setIsSubmitting(true);
    try {
      if (app) {
        // 更新
        await oauthAPI.update(app.client_id, {
          name: name.trim(),
          description: description.trim(),
          redirect_uris: validUris,
        });
        toast.success(t('settings.oauth.updateSuccess'));
        onSuccess();
      } else {
        // 创建
        const response = await oauthAPI.create({
          name: name.trim(),
          description: description.trim(),
          redirect_uris: validUris,
        });
        toast.success(t('settings.oauth.createSuccess'));
        onSuccess(response);
      }
    } catch (error) {
      console.error('操作失败:', error);
      toast.error(
        app
          ? t('settings.oauth.errors.updateFailed')
          : t('settings.oauth.errors.createFailed')
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        className="bg-white dark:bg-gray-800 rounded-xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto"
      >
        <div className="p-6">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">
            {app ? t('settings.oauth.editApp') : t('settings.oauth.createApp')}
          </h2>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                {t('settings.oauth.appName')} *
              </label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
                className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-osu-pink focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                placeholder={t('settings.oauth.appNamePlaceholder')}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                {t('settings.oauth.appDescription')}
              </label>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                rows={3}
                className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-osu-pink focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                placeholder={t('settings.oauth.appDescriptionPlaceholder')}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                {t('settings.oauth.redirectUris')} *
              </label>
              <div className="space-y-2">
                {redirectUris.map((uri, index) => (
                  <div key={index} className="flex gap-2">
                    <input
                      type="url"
                      value={uri}
                      onChange={(e) => {
                        const newUris = [...redirectUris];
                        newUris[index] = e.target.value;
                        setRedirectUris(newUris);
                      }}
                      className="flex-1 px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-osu-pink focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                      placeholder="https://example.com/callback"
                    />
                    {redirectUris.length > 1 && (
                      <button
                        type="button"
                        onClick={() =>
                          setRedirectUris(redirectUris.filter((_, i) => i !== index))
                        }
                        className="px-3 py-2 text-red-600 hover:text-red-700 dark:text-red-400 dark:hover:text-red-300"
                      >
                        <FiTrash2 className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                ))}
              </div>
              <button
                type="button"
                onClick={() => setRedirectUris([...redirectUris, ''])}
                className="mt-2 text-sm text-osu-pink hover:text-osu-pink/80 flex items-center gap-1"
              >
                <FiPlus className="w-4 h-4" />
                {t('settings.oauth.addRedirectUri')}
              </button>
            </div>

            <div className="flex justify-end gap-3 pt-4">
              <button
                type="button"
                onClick={onClose}
                disabled={isSubmitting}
                className="btn-secondary !px-6 !py-2"
              >
                {t('settings.oauth.cancel')}
              </button>
              <button
                type="submit"
                disabled={isSubmitting}
                className="btn-primary !px-6 !py-2 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isSubmitting
                  ? t('settings.oauth.saving')
                  : app
                  ? t('settings.oauth.update')
                  : t('settings.oauth.create')}
              </button>
            </div>
          </form>
        </div>
      </motion.div>
    </div>
  );
};

// 密钥显示模态框
interface SecretModalProps {
  isOpen: boolean;
  onClose: () => void;
  response: CreateOAuthAppResponse | null;
  copiedField: string | null;
  onCopy: (text: string, field: string) => void;
}

const SecretModal: React.FC<SecretModalProps> = ({
  isOpen,
  onClose,
  response,
  copiedField,
  onCopy,
}) => {
  const { t } = useTranslation();

  if (!isOpen || !response) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="bg-white dark:bg-gray-800 rounded-xl shadow-2xl max-w-2xl w-full"
      >
        <div className="p-6">
          <div className="flex items-start gap-3 mb-6">
            <FiAlertCircle className="w-6 h-6 text-yellow-500 flex-shrink-0 mt-1" />
            <div>
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
                {t('settings.oauth.secretTitle')}
              </h2>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                {t('settings.oauth.secretWarning')}
              </p>
            </div>
          </div>

          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                {t('settings.oauth.clientId')}
              </label>
              <div className="flex items-center gap-2 bg-gray-50 dark:bg-gray-900 px-4 py-3 rounded-lg">
                <code className="flex-1 font-mono text-sm text-gray-900 dark:text-white">
                  {response.client_id}
                </code>
                <button
                  onClick={() => onCopy(response.client_id.toString(), 'new_client_id')}
                  className="text-gray-600 dark:text-gray-400 hover:text-osu-pink transition-colors"
                >
                  {copiedField === 'new_client_id' ? (
                    <FiCheck className="w-5 h-5 text-green-500" />
                  ) : (
                    <FiCopy className="w-5 h-5" />
                  )}
                </button>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                {t('settings.oauth.clientSecret')}
              </label>
              <div className="flex items-center gap-2 bg-yellow-50 dark:bg-yellow-900/20 px-4 py-3 rounded-lg border-2 border-yellow-200 dark:border-yellow-800">
                <code className="flex-1 font-mono text-sm text-gray-900 dark:text-white break-all">
                  {response.client_secret}
                </code>
                <button
                  onClick={() => onCopy(response.client_secret, 'new_client_secret')}
                  className="text-gray-600 dark:text-gray-400 hover:text-osu-pink transition-colors flex-shrink-0"
                >
                  {copiedField === 'new_client_secret' ? (
                    <FiCheck className="w-5 h-5 text-green-500" />
                  ) : (
                    <FiCopy className="w-5 h-5" />
                  )}
                </button>
              </div>
            </div>
          </div>

          <div className="flex justify-end pt-6">
            <button onClick={onClose} className="btn-primary !px-6 !py-2">
              {t('settings.oauth.confirm')}
            </button>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

// 确认对话框组件
interface ConfirmModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  message: string;
  confirmText: string;
  type?: 'danger' | 'warning';
}

const ConfirmModal: React.FC<ConfirmModalProps> = ({
  isOpen,
  onClose,
  onConfirm,
  title,
  message,
  confirmText,
  type = 'danger',
}) => {
  const { t } = useTranslation();
  
  if (!isOpen) return null;

  const handleConfirm = () => {
    onConfirm();
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        className="bg-white dark:bg-gray-800 rounded-xl shadow-2xl max-w-md w-full"
      >
        <div className="p-6">
          <div className="flex items-start gap-4 mb-6">
            <div className={`flex-shrink-0 w-12 h-12 rounded-full flex items-center justify-center ${
              type === 'danger' 
                ? 'bg-red-100 dark:bg-red-900/20' 
                : 'bg-yellow-100 dark:bg-yellow-900/20'
            }`}>
              <FiAlertCircle className={`w-6 h-6 ${
                type === 'danger' 
                  ? 'text-red-600 dark:text-red-400' 
                  : 'text-yellow-600 dark:text-yellow-400'
              }`} />
            </div>
            <div className="flex-1">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                {title}
              </h3>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                {message}
              </p>
            </div>
          </div>

          <div className="flex justify-end gap-3">
            <button
              onClick={onClose}
              className="btn-secondary !px-6 !py-2"
            >
              {t('settings.oauth.cancel')}
            </button>
            <button
              onClick={handleConfirm}
              className={`${
                type === 'danger'
                  ? 'bg-red-600 hover:bg-red-700 dark:bg-red-500 dark:hover:bg-red-600'
                  : 'bg-yellow-600 hover:bg-yellow-700 dark:bg-yellow-500 dark:hover:bg-yellow-600'
              } text-white font-medium py-2 px-6 rounded-lg transition-colors`}
            >
              {confirmText}
            </button>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default OAuthAppsSection;
