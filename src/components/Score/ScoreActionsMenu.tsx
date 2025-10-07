import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { FaEllipsisV, FaThumbtack, FaDownload } from 'react-icons/fa';
import { scoreAPI, handleApiError } from '../../utils/api';
import toast from 'react-hot-toast';
import {
  useFloating,
  autoUpdate,
  offset,
  flip,
  shift,
  useClick,
  useDismiss,
  useRole,
  useInteractions,
  FloatingPortal,
  FloatingFocusManager,
} from '@floating-ui/react';

interface ScoreActionsMenuProps {
  scoreId: number;
  isPinned?: boolean;
  hasReplay?: boolean;
  onPinChange?: () => void;
  onPinnedListChange?: () => void; // 置顶列表刷新回调
  className?: string;
}

const ScoreActionsMenu: React.FC<ScoreActionsMenuProps> = ({
  scoreId,
  isPinned = false,
  hasReplay = false,
  onPinChange,
  onPinnedListChange,
  className = '',
}) => {
  const { t } = useTranslation();
  const [isOpen, setIsOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const { refs, floatingStyles, context } = useFloating({
    open: isOpen,
    onOpenChange: setIsOpen,
    middleware: [
      offset(8),
      flip({ padding: 8 }),
      shift({ padding: 8 }),
    ],
    whileElementsMounted: autoUpdate,
    placement: 'bottom-end',
  });

  const click = useClick(context);
  const dismiss = useDismiss(context);
  const role = useRole(context, { role: 'menu' });

  const { getReferenceProps, getFloatingProps } = useInteractions([
    click,
    dismiss,
    role,
  ]);

  const handleTogglePin = async () => {
    setIsLoading(true);
    try {
      if (isPinned) {
        await scoreAPI.unpinScore(scoreId);
        toast.success(t('profile.bestScores.actions.unpinSuccess'));
      } else {
        await scoreAPI.pinScore(scoreId);
        toast.success(t('profile.bestScores.actions.pinSuccess'));
      }
      onPinChange?.();
      onPinnedListChange?.(); // 同时刷新置顶列表
    } catch (error) {
      handleApiError(error);
    } finally {
      setIsLoading(false);
      setIsOpen(false);
    }
  };

  const handleDownloadReplay = async () => {
    setIsLoading(true);
    try {
      const blob = await scoreAPI.downloadReplay(scoreId);
      
      // 创建下载链接
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `replay_${scoreId}.osr`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
      
      toast.success(t('profile.bestScores.actions.downloadSuccess'));
    } catch (error) {
      handleApiError(error);
    } finally {
      setIsLoading(false);
      setIsOpen(false);
    }
  };

  return (
    <>
      <button
        ref={refs.setReference}
        {...getReferenceProps()}
        className={`w-8 h-8 rounded-full hover:bg-gray-200 dark:hover:bg-gray-700 flex items-center justify-center transition-colors text-gray-600 dark:text-gray-400 ${className}`}
        aria-label={t('profile.bestScores.actions.more')}
      >
        <FaEllipsisV className="w-3 h-3" />
      </button>

      {isOpen && (
        <FloatingPortal>
          <FloatingFocusManager context={context} modal={false}>
            <div
              ref={refs.setFloating}
              style={floatingStyles}
              {...getFloatingProps()}
              className="w-48 bg-white dark:bg-gray-800 rounded-lg shadow-xl border border-gray-200 dark:border-gray-700 overflow-hidden z-[9999]"
            >
              <button
                onClick={handleTogglePin}
                disabled={isLoading}
                className="w-full px-4 py-3 text-left hover:bg-gray-100 dark:hover:bg-gray-700 flex items-center gap-3 text-sm text-gray-700 dark:text-gray-300 disabled:opacity-50 transition-colors"
              >
                <FaThumbtack className={`w-4 h-4 ${isPinned ? 'text-osu-pink' : ''}`} />
                <span>
                  {isPinned
                    ? t('profile.bestScores.actions.unpin')
                    : t('profile.bestScores.actions.pin')}
                </span>
              </button>

              {hasReplay && (
                <button
                  onClick={handleDownloadReplay}
                  disabled={isLoading}
                  className="w-full px-4 py-3 text-left hover:bg-gray-100 dark:hover:bg-gray-700 flex items-center gap-3 text-sm text-gray-700 dark:text-gray-300 disabled:opacity-50 border-t border-gray-200 dark:border-gray-700 transition-colors"
                >
                  <FaDownload className="w-4 h-4" />
                  <span>{t('profile.bestScores.actions.downloadReplay')}</span>
                </button>
              )}
            </div>
          </FloatingFocusManager>
        </FloatingPortal>
      )}
    </>
  );
};

export default ScoreActionsMenu;

