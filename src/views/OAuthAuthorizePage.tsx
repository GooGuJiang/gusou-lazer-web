import React, { useEffect, useState } from 'react';
import { Link, useLocation, useNavigate, useSearchParams } from 'react-router-dom';
import { Trans, useTranslation } from 'react-i18next';
import { FiAlertCircle, FiCheck, FiExternalLink, FiKey } from 'react-icons/fi';
import toast from 'react-hot-toast';
import { useAuth } from '../contexts/AuthContext';
import { oauthAPI, userAPI } from '../utils/api';
import type { OAuthApp, User } from '../types';
import LoadingSpinner from '../components/UI/LoadingSpinner';
import UserLink from '../components/UI/UserLink';

// 合法 scope，与服务端 CODE_SCOPES 保持一致
const VALID_SCOPES = [
  'chat.read',
  'chat.write',
  'chat.write_manage',
  'forum.write',
  'forum.write_manage',
  'friends.read',
  'identify',
  'multiplayer.write_manage',
  'public',
] as const;

type PageState =
  | { status: 'loading' }
  | { status: 'error'; code: 400 | 404; message: string }
  | { status: 'ready'; app: OAuthApp; scopes: string[] };

const OAuthAuthorizePage: React.FC = () => {
  const { t } = useTranslation();
  const { isAuthenticated, isLoading: isAuthLoading } = useAuth();
  const [searchParams] = useSearchParams();
  const location = useLocation();
  const navigate = useNavigate();

  const [pageState, setPageState] = useState<PageState>({ status: 'loading' });
  const [owner, setOwner] = useState<User | null>(null);
  const [isAuthorizing, setIsAuthorizing] = useState(false);

  const clientIdParam = searchParams.get('client_id');
  const redirectUri = searchParams.get('redirect_uri');
  const stateParam = searchParams.get('state');

  // 未登录时跳转登录页，登录成功后携带 redirect 回跳
  useEffect(() => {
    if (isAuthLoading || isAuthenticated) return;
    const currentUrl = `${location.pathname}${location.search}`;
    navigate(`/login?redirect=${encodeURIComponent(currentUrl)}`, { replace: true });
  }, [isAuthLoading, isAuthenticated, location, navigate]);

  useEffect(() => {
    if (isAuthLoading || !isAuthenticated) return;

    const fail = (code: 400 | 404, message: string) =>
      setPageState({ status: 'error', code, message });

    const responseType = searchParams.get('response_type');
    const scopeParam = searchParams.get('scope');

    if (!clientIdParam) {
      fail(400, t('oauth.authorize.errors.missingClientId'));
      return;
    }
    const clientId = Number(clientIdParam);
    if (!Number.isInteger(clientId) || clientId <= 0) {
      fail(400, t('oauth.authorize.errors.invalidClientId'));
      return;
    }
    if (responseType !== 'code') {
      fail(400, t('oauth.authorize.errors.invalidResponseType'));
      return;
    }
    if (!redirectUri) {
      fail(400, t('oauth.authorize.errors.missingRedirectUri'));
      return;
    }
    if (!scopeParam?.trim()) {
      fail(400, t('oauth.authorize.errors.missingScope'));
      return;
    }

    let cancelled = false;

    const load = async () => {
      let app: OAuthApp;
      try {
        app = await oauthAPI.get(clientId);
      } catch (error) {
        if (cancelled) return;
        const status = (error as { response?: { status?: number } }).response?.status;
        fail(
          status === 404 ? 404 : 400,
          t(
            status === 404
              ? 'oauth.authorize.errors.appNotFoundDescription'
              : 'oauth.authorize.errors.loadFailed'
          )
        );
        return;
      }

      if (!app.redirect_uris.includes(redirectUri)) {
        if (!cancelled) fail(400, t('oauth.authorize.errors.redirectUriNotAllowed'));
        return;
      }

      // query 中的 `+` 会被解码为空格，按空白分割兼容 `+` 与 `%20` 两种写法
      const requestedScopes = [...new Set(scopeParam.split(/\s+/).filter(Boolean))];
      const invalidScopes = requestedScopes.filter(
        (scope) => !(VALID_SCOPES as readonly string[]).includes(scope)
      );
      if (invalidScopes.length > 0) {
        if (!cancelled)
          fail(400, t('oauth.authorize.errors.invalidScopes', { scopes: invalidScopes.join(', ') }));
        return;
      }

      // 无论请求什么权限，都附带 identify（已包含则不重复）
      const scopes = requestedScopes.includes('identify')
        ? requestedScopes
        : ['identify', ...requestedScopes];

      if (!cancelled) setPageState({ status: 'ready', app, scopes });

      try {
        const ownerUser = await userAPI.getUser(app.owner_id);
        if (!cancelled) setOwner(ownerUser);
      } catch {
        // 所有者信息加载失败时降级为显示 #id
      }
    };

    load();
    return () => {
      cancelled = true;
    };
  }, [isAuthLoading, isAuthenticated, searchParams, clientIdParam, redirectUri, t]);

  const appendQuery = (base: string, params: Record<string, string | undefined>) => {
    try {
      const url = new URL(base);
      for (const [key, value] of Object.entries(params)) {
        if (value != null) url.searchParams.set(key, value);
      }
      return url.toString();
    } catch {
      const query = new URLSearchParams();
      for (const [key, value] of Object.entries(params)) {
        if (value != null) query.set(key, value);
      }
      const separator = base.includes('?') ? '&' : '?';
      return `${base}${separator}${query.toString()}`;
    }
  };

  const handleAuthorize = async () => {
    if (pageState.status !== 'ready' || !redirectUri || isAuthorizing) return;
    setIsAuthorizing(true);
    try {
      const response = await oauthAPI.generateCode(pageState.app.client_id, {
        redirect_uri: redirectUri,
        scopes: pageState.scopes,
      });
      window.location.href = appendQuery(response.redirect_uri || redirectUri, {
        code: response.code,
        state: stateParam ?? undefined,
      });
    } catch (error) {
      console.error('生成授权码失败:', error);
      toast.error(t('oauth.authorize.errors.codeFailed'));
      setIsAuthorizing(false);
    }
  };

  const handleDeny = () => {
    if (!redirectUri) return;
    window.location.href = appendQuery(redirectUri, {
      error: 'access_denied',
      state: stateParam ?? undefined,
    });
  };

  if (isAuthLoading || pageState.status === 'loading') {
    return (
      <div className="min-h-[calc(100vh-56px)] md:min-h-[calc(100vh-80px)] flex items-center justify-center px-4">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  if (pageState.status === 'error') {
    return (
      <div className="min-h-[calc(100vh-56px)] md:min-h-[calc(100vh-80px)] flex items-center justify-center px-4 sm:px-6 lg:px-8 py-8">
        <div className="w-full max-w-md">
          <div className="bg-card py-6 px-6 shadow-sm rounded-lg border border-default text-center">
            <div
              className="w-12 h-12 mx-auto rounded-full flex items-center justify-center mb-3"
              style={{ background: 'rgba(239, 68, 68, 0.12)' }}
            >
              <FiAlertCircle className="w-6 h-6" style={{ color: '#ef4444' }} />
            </div>
            <h2 className="text-lg font-bold text-text-primary mb-1">
              {pageState.code} ·{' '}
              {pageState.code === 404
                ? t('oauth.authorize.errors.appNotFound')
                : t('oauth.authorize.errors.invalidRequest')}
            </h2>
            <p className="text-sm text-text-secondary mb-6">{pageState.message}</p>
            <Link
              to="/"
              className="inline-flex justify-center py-2 px-6 rounded-md shadow-sm text-sm font-medium text-text-secondary bg-card border border-default hover:bg-card-hover transition-colors duration-200"
            >
              {t('oauth.authorize.errors.backHome')}
            </Link>
          </div>
        </div>
      </div>
    );
  }

  const { app, scopes } = pageState;

  return (
    <div className="min-h-[calc(100vh-56px)] md:min-h-[calc(100vh-80px)] flex items-center justify-center px-4 sm:px-6 lg:px-8 py-8">
      <div className="max-w-md w-full space-y-3">
        <div className="text-center">
          <h2 className="text-xl font-bold text-text-primary">{t('oauth.authorize.title')}</h2>
        </div>

        <div className="bg-card py-4 px-6 shadow-sm rounded-lg border border-default space-y-4">
          {/* 应用信息 */}
          <div className="flex items-center gap-3">
            <div
              className="w-12 h-12 min-w-12 rounded-xl flex items-center justify-center"
              style={{ background: 'var(--bg-accent-medium)' }}
            >
              <FiKey className="w-6 h-6 text-osu-pink" />
            </div>
            <div className="min-w-0">
              <h3 className="text-base font-bold text-text-primary truncate">{app.name}</h3>
              <p className="text-sm text-text-secondary">
                {owner ? (
                  <Trans
                    i18nKey="oauth.authorize.by"
                    values={{ username: owner.username }}
                    components={{
                      avatar: (
                        <img
                          src={owner.avatar_url || userAPI.getAvatarUrl(owner.id)}
                          alt={owner.username}
                          className="w-5 h-5 rounded-full object-cover inline-block align-middle"
                          onError={(e) => {
                            e.currentTarget.style.display = 'none';
                          }}
                        />
                      ),
                      userLink: (
                        <UserLink userId={owner.id} username={owner.username} className="font-medium" />
                      ),
                    }}
                  />
                ) : (
                  t('oauth.authorize.byFallback', { username: `#${app.owner_id}` })
                )}
              </p>
            </div>
          </div>

          {/* 应用描述 */}
          {app.description?.trim() && (
            <p className="text-sm text-text-secondary">{app.description}</p>
          )}

          {/* 权限列表 */}
          <div className="border-t border-default pt-4">
            <h4 className="text-sm font-medium text-text-primary mb-2">
              {t('oauth.authorize.scopesTitle')}
            </h4>
            <ul className="space-y-2">
              {scopes.map((scope) => (
                <li key={scope} className="flex items-start gap-2 text-sm text-text-secondary">
                  <FiCheck className="w-4 h-4 mt-0.5 min-w-4 text-green-500" />
                  <span>{t(`oauth.authorize.scopes.${scope}`)}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* 重定向提示 */}
          <p className="text-xs text-text-muted flex items-start gap-1 border-t border-default pt-4">
            <FiExternalLink className="w-3.5 h-3.5 mt-0.5 min-w-3.5" />
            <span>
              {t('oauth.authorize.redirectNotice')}{' '}
              <span className="text-osu-pink font-medium break-all">{redirectUri}</span>
            </span>
          </p>

          {/* 操作按钮 */}
          <div className="flex gap-3 pt-1">
            <button
              type="button"
              onClick={handleAuthorize}
              disabled={isAuthorizing}
              className="flex-1 flex justify-center items-center py-2 px-4 rounded-md shadow-sm text-sm font-medium text-white bg-osu-pink hover:bg-osu-pink/90 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-osu-pink disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-200"
            >
              {isAuthorizing ? <LoadingSpinner size="sm" /> : t('oauth.authorize.approve')}
            </button>
            <button
              type="button"
              onClick={handleDeny}
              disabled={isAuthorizing}
              className="flex-1 py-2 px-4 rounded-md shadow-sm text-sm font-medium text-text-secondary bg-card border border-default hover:bg-card-hover focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-osu-pink disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-200"
            >
              {t('oauth.authorize.deny')}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default OAuthAuthorizePage;
