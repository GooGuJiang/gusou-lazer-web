
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import { ChatProvider } from './contexts/ChatContext';
import Layout from './components/Layout/Layout';
import HomePage from './pages/HomePage';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import ProfilePage from './pages/ProfilePage';
import UserPage from './pages/UserPage';
import SettingsPage from './pages/SettingsPage';
import RankingsPage from './pages/RankingsPage';
import TeamsPage from './pages/TeamsPage';
import TeamDetailPage from './pages/TeamDetailPage';
import CreateTeamPage from './pages/CreateTeamPage';

function App() {
  return (
    <AuthProvider>
      <ChatProvider>
        <Router>
          <Routes>
            <Route path="/" element={<Layout />}>
              <Route index element={<HomePage />} />
              <Route path="login" element={<LoginPage />} />
              <Route path="register" element={<RegisterPage />} />
              <Route path="profile" element={<ProfilePage />} />
              <Route path="users/:userId" element={<UserPage />} />
              <Route path="settings" element={<SettingsPage />} />
              <Route path="rankings" element={<RankingsPage />} />
              <Route path="teams" element={<TeamsPage />} />
              <Route path="teams/create" element={<CreateTeamPage />} />
              <Route path="teams/:teamId" element={<TeamDetailPage />} />
              <Route path="teams/:teamId/edit" element={<CreateTeamPage />} />
              <Route
                path="beatmaps"
                element={
                  <div className="flex items-center justify-center h-screen">
                    <h1 className="text-2xl font-bold">谱面（即将推出）</h1>
                  </div>
                }
              />
              <Route
                path="*"
                element={
                  <div className="flex items-center justify-center h-screen">
                    <h1 className="text-2xl font-bold">404 - 页面未找到</h1>
                  </div>
                }
              />
            </Route>
          </Routes>
        </Router>
      </ChatProvider>
    </AuthProvider>
  );
}

export default App;
