import { useState, useEffect, useCallback } from 'react';
import { SESSIONS } from './data';
import { api, getToken, setToken, setUnauthorizedHandler } from './api';
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

// Links de recuperação de senha abrem a aplicação com ?token=...
const hasResetLink = () =>
  new URLSearchParams(window.location.search).has('token');

export default function App() {
  const [view, setView] = useState('login');
  const [user, setUser] = useState(null);
  const [session, setSession] = useState(null);
  const [uploadedImage, setUploadedImage] = useState(null);
  const [sessions] = useState(SESSIONS);
  // Enquanto valida o token salvo, não mostra a tela de login.
  const [restoring, setRestoring] = useState(
    () => Boolean(getToken()) && !hasResetLink()
  );

  const isMobile = useIsMobile();

  const navigate = (v) => setView(v);

  const handleLogin = (user) => {
    setUser(user);
    if (user.role === 'admin') {
      navigate('admin-overview');
    } else {
      navigate('home');
    }
  };

  const handleLogout = useCallback(() => {
    setToken(null);
    localStorage.removeItem('user');
    localStorage.removeItem('session');

    setUser(null);
    setSession(null);
    setUploadedImage(null);
    setView('login');
  }, []);

  // Token expirado/inválido em qualquer chamada → volta para o login.
  useEffect(() => {
    setUnauthorizedHandler(handleLogout);
    return () => setUnauthorizedHandler(null);
  }, [handleLogout]);

  // Restaura a sessão ao recarregar: o papel vem do servidor, nunca do storage.
  useEffect(() => {
    if (!restoring) return;
    let cancelled = false;
    api('/api/auth/me')
      .then(({ user }) => {
        if (cancelled) return;
        if (!user.active) return handleLogout();
        handleLogin(user);
      })
      .catch(() => {
        if (!cancelled) handleLogout();
      })
      .finally(() => {
        if (!cancelled) setRestoring(false);
      });
    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

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

  if (restoring) {
    return (
      <div className="h-full flex items-center justify-center bg-bg text-sm text-fg-muted">
        Carregando…
      </div>
    );
  }

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

  // Telas de admin só para admin. A proteção real dos dados está no backend
  // (requireAdmin); aqui só evitamos renderizar o painel para quem não pode.
  if (ADMIN_VIEWS.includes(view) && user.role === 'admin') {
    return <AdminPage {...sharedProps} />;
  }

  return (
    <HomePage
      {...sharedProps}
      onResult={handleResult}
    />
  );
}
