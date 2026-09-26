import { useState, useEffect } from 'react';
import { SESSIONS } from './data';
import AuthPages from './pages/Auth';
import HomePage from './pages/home';
import ResultPage from './pages/Result';
import HistoryPage from './pages/History';
import AdminPage from './pages/Admin';
import MobilePages from './pages/Mobile';

function useIsMobile() {
  const [mobile, setMobile] = useState(() => window.innerWidth < 768);

  useEffect(() => {
    const mq = window.matchMedia('(max-width: 768px)');

    const handler = (e) => setMobile(e.matches);

    mq.addEventListener('change', handler);

    return () => mq.removeEventListener('change', handler);
  }, []);

  return mobile;
}

const ADMIN_VIEWS = [
  'admin-overview',
  'admin-users',
  'admin-monitoring',
];

export default function App() {
  const [view, setView] = useState('login');
  const [user, setUser] = useState(null);
  const [session, setSession] = useState(null);
  const [uploadedImage, setUploadedImage] = useState(null);
  const [sessions] = useState(SESSIONS);

  const isMobile = useIsMobile();

  const navigate = (v) => setView(v);

  const handleLogin = (email) => {
    const isAdmin = email.startsWith('admin');

    setUser({
      name: isAdmin ? 'Bruno Lima' : 'Ana Souza',
      email,
      role: isAdmin ? 'admin' : 'user',
    });

    navigate('home');
  };

  const handleLogout = () => {
    setUser(null);
    setSession(null);
    setUploadedImage(null);
    navigate('login');
  };

  const handleResult = (img) => {
    setUploadedImage(img);
    setSession(sessions[0]);
    navigate('result');
  };

  const handleSelectSession = (s) => {
    setSession(s);
    setUploadedImage(null);
    navigate('result');
  };

  const handleNewColorization = () => {
    setSession(null);
    setUploadedImage(null);
    navigate('home');
  };

  const isAuthView =
    !user ||
    ['login', 'register', 'forgot-email', 'forgot-newpass'].includes(view);

  if (isAuthView) {
    return (
      <AuthPages
        view={view}
        navigate={navigate}
        onLogin={handleLogin}
      />
    );
  }

  if (view === 'edit-profile') {
    return isMobile ? (
      <MobilePages
        user={user}
        sessions={sessions}
        session={session}
        uploadedImage={uploadedImage}
        view={view}
        navigate={navigate}
        onSelectSession={handleSelectSession}
        onResult={handleResult}
        onLogout={handleLogout}
      />
    ) : (
      <AuthPages
        view={view}
        navigate={navigate}
        onLogin={handleLogin}
        user={user}
        onLogout={handleLogout}
      />
    );
  }

  const sharedProps = {
    user,
    sessions,
    session,
    uploadedImage,
    currentView: view,
    navigate,
    onSelectSession: handleSelectSession,
    onNewColorization: handleNewColorization,
    onLogout: handleLogout,
  };

  if (isMobile) {
    return (
      <MobilePages
        {...sharedProps}
        view={view}
        onResult={handleResult}
      />
    );
  }

  if (view === 'result') {
    return <ResultPage {...sharedProps} />;
  }

  if (view === 'history') {
    return <HistoryPage {...sharedProps} />;
  }

  if (ADMIN_VIEWS.includes(view)) {
    return <AdminPage {...sharedProps} />;
  }

  return (
    <HomePage
      {...sharedProps}
      onResult={handleResult}
    />
  );
}