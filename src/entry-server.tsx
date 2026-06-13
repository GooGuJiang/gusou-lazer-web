import { StrictMode } from 'react';
import { renderToString } from 'react-dom/server';
import { StaticRouter } from 'react-router-dom/server';
import App from './App';
import { AuthProvider } from './contexts/AuthContext';
import { AudioProvider } from './components/UI/AudioPlayer';
import { VerificationProvider } from './contexts/VerificationContext';
import { ProfileColorProvider } from './contexts/ProfileColorContext';
import './i18n';
import {
  fetchUserPageSsrPayload,
  injectUserPageSsrPayload,
  setServerUserPageSsrPayload,
} from './utils/userPageSsr';

export const render = (url: string): string =>
  renderToString(
    <StrictMode>
      <AuthProvider>
        <ProfileColorProvider>
          <VerificationProvider>
            <AudioProvider>
              <StaticRouter location={url}>
                <App router="static" />
              </StaticRouter>
            </AudioProvider>
          </VerificationProvider>
        </ProfileColorProvider>
      </AuthProvider>
    </StrictMode>
  );

export const renderPage = async (url: string, template: string): Promise<string> => {
  const payload = await fetchUserPageSsrPayload(url);
  setServerUserPageSsrPayload(payload && 'user' in payload ? payload : null);

  try {
    const appHtml = render(url);
    return injectUserPageSsrPayload(
      template.replace('<div id="root"></div>', `<div id="root">${appHtml}</div>`),
      payload
    );
  } finally {
    setServerUserPageSsrPayload(null);
  }
};
