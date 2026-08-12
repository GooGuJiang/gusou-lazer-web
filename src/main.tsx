import { StrictMode } from 'react';
import { createRoot, hydrateRoot } from 'react-dom/client';
import './index.css';
import './i18n';
import App from './App.tsx';
import { AuthProvider } from './contexts/AuthContext';
import { AudioProvider } from './components/UI/AudioPlayer';
import { VerificationProvider } from './contexts/VerificationContext';
import { ProfileColorProvider } from './contexts/ProfileColorContext';

const rootElement = document.getElementById('root')!;
const app = (
  <StrictMode>
    <AuthProvider>
      <ProfileColorProvider>
        <VerificationProvider>
          <AudioProvider>
            <App />
          </AudioProvider>
        </VerificationProvider>
      </ProfileColorProvider>
    </AuthProvider>
  </StrictMode>
);

if (rootElement.hasChildNodes()) {
  hydrateRoot(rootElement, app);
} else {
  createRoot(rootElement).render(app);
}
