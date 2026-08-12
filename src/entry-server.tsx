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
import {
  injectBeatmapsetsSsrPayload,
  setServerBeatmapsetsSsrPayload,
} from './utils/beatmapsetsSsr';
import { fetchBeatmapsetsSsrPayload } from './utils/beatmapsetsSsrServer';

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

export const renderPage = async (
  url: string,
  template: string,
  authorization?: string
): Promise<string> => {
  const [userPayload, beatmapsetsPayload] = await Promise.all([
    fetchUserPageSsrPayload(url),
    fetchBeatmapsetsSsrPayload(url, authorization),
  ]);
  setServerUserPageSsrPayload(userPayload && 'user' in userPayload ? userPayload : null);
  setServerBeatmapsetsSsrPayload(
    beatmapsetsPayload && 'response' in beatmapsetsPayload ? beatmapsetsPayload : null
  );

  try {
    const appHtml = render(url);
    const html = template.replace('<div id="root"></div>', `<div id="root">${appHtml}</div>`);
    return injectBeatmapsetsSsrPayload(
      injectUserPageSsrPayload(html, userPayload),
      beatmapsetsPayload
    );
  } finally {
    setServerUserPageSsrPayload(null);
    setServerBeatmapsetsSsrPayload(null);
  }
};
