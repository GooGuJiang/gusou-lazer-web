import React, { useEffect, useState } from 'react';
import { Link, useLocation, useNavigate, useSearchParams } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { FiAlertCircle, FiCheckCircle, FiShield, FiXCircle } from 'react-icons/fi';
import { useAuth } from '../contexts/AuthContext';
import { deviceAPI } from '../utils/api';
import { isVerificationError } from '../utils/api/verification';
import LoadingSpinner from '../components/UI/LoadingSpinner';

type Outcome = 'confirm' | 'allowed' | 'denied';

const pageContainerClass =
  'min-h-[calc(100vh-56px)] md:min-h-[calc(100vh-80px)] flex items-center justify-center px-4 sm:px-6 lg:px-8 py-8';

const ClientVerificationPage: React.FC = () => {
  const { t } = useTranslation();
  const { isAuthenticated, isLoading: isAuthLoading } = useAuth();
  const [searchParams] = useSearchParams();
  const location = useLocation();
  const navigate = useNavigate();

  const deviceHash = (searchParams.get('ch') ?? '').trim();

  const [outcome, setOutcome] = useState<Outcome>('confirm');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // 未登录时先跳转登录页，登录成功后携带 redirect 回到原链接继续验证
  useEffect(() => {
    if (isAuthLoading || isAuthenticated || !deviceHash) return;
    const currentUrl = `${location.pathname}${location.search}`;
    navigate(`/login?redirect=${encodeURIComponent(currentUrl)}`, { replace: true });
  }, [isAuthLoading, isAuthenticated, deviceHash, location, navigate]);

  const handleAllow = async () => {
    if (!deviceHash || isSubmitting) return;
    setIsSubmitting(true);
    setErrorMessage(null);
    try {
      await deviceAPI.verifyStableClient(deviceHash);
      setOutcome('allowed');
    } catch (error) {
      // 会话本身未验证时，全局处理器会弹出验证框，验证完成后刷新页面保留本次链接
      if (!isVerificationError(error)) {
        setErrorMessage(t('clientVerification.errors.verifyFailed'));
        console.error('允许 stable 客户端登录失败:', error);
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isAuthLoading) {
    return (
      <div className={pageContainerClass}>
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  if (!deviceHash) {
    return (
      <div className={pageContainerClass}>
        <div className="w-full max-w-md">
          <div className="bg-card py-6 px-6 shadow-sm rounded-lg border border-default text-center">
            <div
              className="w-12 h-12 mx-auto rounded-full flex items-center justify-center mb-3"
              style={{ background: 'rgba(239, 68, 68, 0.12)' }}
            >
              <FiAlertCircle className="w-6 h-6" style={{ color: '#ef4444' }} />
            </div>
            <h2 className="text-lg font-bold text-text-primary mb-1">
              {t('clientVerification.errors.invalidRequest')}
            </h2>
            <p className="text-sm text-text-secondary mb-6">
              {t('clientVerification.errors.missingDeviceHash')}
            </p>
            <Link
              to="/"
              className="inline-flex justify-center py-2 px-6 rounded-md shadow-sm text-sm font-medium text-text-secondary bg-card border border-default hover:bg-card-hover transition-colors duration-200"
            >
              {t('clientVerification.backHome')}
            </Link>
          </div>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return (
      <div className={pageContainerClass}>
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  if (outcome === 'allowed') {
    return (
      <div className={pageContainerClass}>
        <div className="w-full max-w-md">
          <div className="bg-card py-6 px-6 shadow-sm rounded-lg border border-default text-center">
            <div
              className="w-12 h-12 mx-auto rounded-full flex items-center justify-center mb-3"
              style={{ background: 'rgba(34, 197, 94, 0.12)' }}
            >
              <FiCheckCircle className="w-6 h-6" style={{ color: '#22c55e' }} />
            </div>
            <h2 className="text-lg font-bold text-text-primary mb-1">
              {t('clientVerification.allowedTitle')}
            </h2>
            <p className="text-sm text-text-secondary mb-6">
              {t('clientVerification.allowedDescription')}
            </p>
            <Link
              to="/"
              className="inline-flex justify-center py-2 px-6 rounded-md shadow-sm text-sm font-medium text-text-secondary bg-card border border-default hover:bg-card-hover transition-colors duration-200"
            >
              {t('clientVerification.backHome')}
            </Link>
          </div>
        </div>
      </div>
    );
  }

  if (outcome === 'denied') {
    return (
      <div className={pageContainerClass}>
        <div className="w-full max-w-md">
          <div className="bg-card py-6 px-6 shadow-sm rounded-lg border border-default text-center">
            <div
              className="w-12 h-12 mx-auto rounded-full flex items-center justify-center mb-3"
              style={{ background: 'var(--bg-accent-medium)' }}
            >
              <FiXCircle className="w-6 h-6 text-text-secondary" />
            </div>
            <h2 className="text-lg font-bold text-text-primary mb-1">
              {t('clientVerification.deniedTitle')}
            </h2>
            <p className="text-sm text-text-secondary mb-6">
              {t('clientVerification.deniedDescription')}
            </p>
            <Link
              to="/"
              className="inline-flex justify-center py-2 px-6 rounded-md shadow-sm text-sm font-medium text-text-secondary bg-card border border-default hover:bg-card-hover transition-colors duration-200"
            >
              {t('clientVerification.backHome')}
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={pageContainerClass}>
      <div className="w-full max-w-md">
        <div className="bg-card py-6 px-6 shadow-sm rounded-lg border border-default">
          <div
            className="w-12 h-12 mx-auto rounded-full flex items-center justify-center mb-3"
            style={{ background: 'var(--bg-accent-medium)' }}
          >
            <FiShield className="w-6 h-6 text-osu-pink" />
          </div>
          <h2 className="text-lg font-bold text-text-primary text-center mb-1">
            {t('clientVerification.title')}
          </h2>
          <p className="text-sm text-text-secondary text-center mb-6">
            {t('clientVerification.description')}
          </p>

          {errorMessage && (
            <p
              className="text-sm text-center mb-4 flex items-center justify-center gap-1.5"
              style={{ color: '#ef4444' }}
            >
              <FiAlertCircle className="w-4 h-4 shrink-0" />
              <span>{errorMessage}</span>
            </p>
          )}

          <div className="flex gap-3">
            <button
              type="button"
              onClick={handleAllow}
              disabled={isSubmitting}
              className="flex-1 flex justify-center items-center py-2 px-4 rounded-md shadow-sm text-sm font-medium text-white bg-osu-pink hover:bg-osu-pink/90 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-osu-pink disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-200"
            >
              {isSubmitting ? <LoadingSpinner size="sm" /> : t('clientVerification.allow')}
            </button>
            <button
              type="button"
              onClick={() => setOutcome('denied')}
              disabled={isSubmitting}
              className="flex-1 py-2 px-4 rounded-md shadow-sm text-sm font-medium text-text-secondary bg-card border border-default hover:bg-card-hover focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-osu-pink disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-200"
            >
              {t('clientVerification.deny')}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ClientVerificationPage;
