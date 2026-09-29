import { useState } from 'react';
import { Button, Input } from '../components/ui';

function LogoMark({ size = 20 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 20 20" fill="none">
      <circle cx="10" cy="10" r="8" stroke="white" strokeWidth="1.8" />
      <path
        d="M7 10c0-1.657 1.343-3 3-3s3 1.343 3 3"
        stroke="white"
        strokeWidth="1.8"
        strokeLinecap="round"
      />
      <path
        d="M10 7V4.5M7.5 8L5.5 6M12.5 8L14.5 6"
        stroke="white"
        strokeWidth="1.5"
        strokeLinecap="round"
      />
    </svg>
  );
}

function BrandPanel() {
  return (
    <div className="hidden lg:flex flex-col justify-between flex-1 p-14 bg-surface border-r border-border relative overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-br from-accent/8 via-transparent to-transparent pointer-events-none" />
      <div className="absolute -bottom-40 -left-40 w-[600px] h-[600px] rounded-full bg-accent/4 blur-3xl pointer-events-none" />
      <div className="absolute top-20 right-0 w-64 h-64 rounded-full bg-accent/4 blur-3xl pointer-events-none" />

      {/* Logo */}
      <div className="relative z-10 flex items-center gap-3">
        <div className="w-9 h-9 rounded-xl bg-accent flex items-center justify-center shadow-lg shadow-accent/25">
          <LogoMark size={18} />
        </div>
        <span className="text-lg font-semibold text-fg tracking-tight">
          ColoreAI
        </span>
      </div>

      {/* Headline */}
      <div className="relative z-10 max-w-sm">
        <h2 className="text-[2.6rem] font-bold text-fg leading-[1.15] mb-5">
          Reviva suas
          <br />
          memórias <span className="text-accent-light">em cores</span>
        </h2>

        <p className="text-fg-muted leading-relaxed text-base mb-10">
          Inteligência artificial de última geração para colorir fotos
          históricas com fidelidade cromática e naturalidade preservando cada
          detalhe.
        </p>

        {/* Before / after preview */}
        <div className="flex items-center gap-4">
          <div className="rounded-2xl overflow-hidden shadow-2xl ring-1 ring-white/5 shrink-0">
            <img
              src="https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=180&h=120&fit=crop&auto=format"
              alt="Original P&B"
              className="w-40 h-[106px] object-cover"
              style={{ filter: 'grayscale(1)' }}
            />
          </div>

          <div className="flex flex-col items-center gap-1.5 shrink-0">
            <div className="w-9 h-9 rounded-full bg-accent/15 border border-accent/25 flex items-center justify-center">
              <svg width="15" height="15" viewBox="0 0 15 15" fill="none">
                <path
                  d="M2 7.5h11M9 3l4 4.5-4 4.5"
                  stroke="#A78BFA"
                  strokeWidth="1.6"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </div>

            <span className="text-[10px] text-accent-light font-medium tracking-wider uppercase">
              IA
            </span>
          </div>

          <div className="rounded-2xl overflow-hidden shadow-2xl ring-2 ring-accent/20 shrink-0">
            <img
              src="https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=180&h=120&fit=crop&auto=format"
              alt="Colorida"
              className="w-40 h-[106px] object-cover"
            />
          </div>
        </div>
      </div>

      {/* Stats footer */}
      <div className="relative z-10 flex gap-8">
        {[
          { value: '28.493', label: 'fotos coloridas' },
          { value: '31.8 dB', label: 'PSNR médio' },
          { value: '0,87', label: 'SSIM médio' },
        ].map((s) => (
          <div key={s.label}>
            <p className="text-sm font-semibold font-mono text-fg">
              {s.value}
            </p>
            <p className="text-xs text-fg-subtle mt-0.5">
              {s.label}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
}

function FormPanel({ title, subtitle, children }) {
  return (
    <div className="flex-1 lg:flex-none lg:w-[480px] flex items-center justify-center px-6 py-10 lg:p-14">
      <div className="w-full max-w-[360px]">
        {/* Mobile-only logo */}
        <div className="flex justify-center mb-8 lg:hidden">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-accent flex items-center justify-center">
              <LogoMark size={16} />
            </div>
            <span className="font-semibold text-fg">ColorizeAI</span>
          </div>
        </div>

        <div className="mb-7">
          <h1 className="text-2xl font-semibold text-fg">{title}</h1>

          {subtitle && (
            <p className="text-sm text-fg-muted mt-1.5 leading-relaxed">
              {subtitle}
            </p>
          )}
        </div>

        {children}
      </div>
    </div>
  );
}

function AuthLayout({ title, subtitle, children }) {
  return (
    <div className="min-h-full bg-bg flex">
      <BrandPanel />

      <FormPanel title={title} subtitle={subtitle}>
        {children}
      </FormPanel>
    </div>
  );
}

/* ─── Login ─── */
function LoginPage({ navigate, onLogin }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    await new Promise((r) => setTimeout(r, 700));

    const ok =
      (email === 'user@colorize.ai' && password === 'demo123') ||
      (email === 'admin@colorize.ai' && password === 'demo123');

    if (ok) {
      onLogin(email);
    } else {
      setError(
        'E-mail ou senha inválidos. Verifique suas credenciais e tente novamente.'
      );
    }

    setLoading(false);
  };

  return (
    <AuthLayout
      title="Bem-vindo de volta"
      subtitle="Entre na sua conta para continuar"
    >
      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        <Input
          label="E-mail"
          type="email"
          placeholder="voce@exemplo.com"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />

        <div className="flex flex-col gap-1.5">
          <Input
            label="Senha"
            type="password"
            placeholder="••••••••"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />

          <div className="flex justify-end">
            <button
              type="button"
              onClick={() => navigate('forgot-email')}
              className="text-xs text-accent-light hover:underline"
            >
              Esqueci minha senha
            </button>
          </div>
        </div>

        {error && (
          <div className="bg-error/8 border border-error/25 rounded-xl px-4 py-3">
            <p className="text-sm text-error leading-relaxed">{error}</p>
          </div>
        )}

        <Button
          type="submit"
          size="lg"
          className="w-full"
          disabled={loading}
        >
          {loading ? 'Entrando…' : 'Entrar'}
        </Button>
      </form>

      <p className="text-center text-sm text-fg-muted mt-6">
        Não tem uma conta?{' '}
        <button
          onClick={() => navigate('register')}
          className="text-accent-light hover:underline font-medium"
        >
          Criar conta
        </button>
      </p>

      {/* Demo credentials */}
      <div className="mt-6 pt-5 border-t border-border">
        <p className="text-xs text-fg-subtle text-center mb-3">
          Credenciais de demonstração
        </p>

        <div className="flex flex-col gap-2">
          {[
            {
              role: 'Usuário',
              email: 'user@colorize.ai',
              badge: 'Usuário',
            },
            {
              role: 'Administrador',
              email: 'admin@colorize.ai',
              badge: 'Admin',
            },
          ].map((d) => (
            <button
              key={d.email}
              type="button"
              onClick={() => {
                setEmail(d.email);
                setPassword('demo123');
                setError('');
              }}
              className="flex items-center justify-between bg-muted-bg/50 hover:bg-muted-bg border border-border/60 rounded-xl px-3.5 py-2.5 transition-colors"
            >
              <div className="flex items-center gap-2.5">
                <div className="w-6 h-6 rounded-full bg-accent/15 flex items-center justify-center">
                  <span className="text-[10px] font-bold text-accent-light">
                    {d.role[0]}
                  </span>
                </div>

                <span className="text-xs font-medium text-fg-muted">
                  {d.role}
                </span>
              </div>

              <span className="text-[11px] font-mono text-fg-subtle">
                {d.email}
              </span>
            </button>
          ))}
        </div>

        <p className="text-[11px] text-fg-subtle text-center mt-2">
          Senha: <span className="font-mono">demo123</span>
        </p>
      </div>
    </AuthLayout>
  );
}

/* ─── Register ─── */
function RegisterPage({ navigate }) {
  const [form, setForm] = useState({
    name: '',
    email: '',
    password: '',
    confirm: '',
  });

  const [success, setSuccess] = useState(false);
  const [loading, setLoading] = useState(false);

  const set = (k) => (e) =>
    setForm((f) => ({
      ...f,
      [k]: e.target.value,
    }));

  const handleSubmit = async (ev) => {
    ev.preventDefault();
    setLoading(true);

    await new Promise((r) => setTimeout(r, 800));

    setLoading(false);
    setSuccess(true);
  };

  if (success) {
    return (
      <AuthLayout title="Conta criada!">
        <div className="text-center py-4">
          <div className="w-16 h-16 rounded-full bg-success/10 border border-success/20 flex items-center justify-center mx-auto mb-5">
            <svg width="28" height="28" viewBox="0 0 28 28" fill="none">
              <path
                d="M6 14l6 6 10-12"
                stroke="#22C55E"
                strokeWidth="2.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </div>

          <p className="text-fg font-medium mb-1">
            Conta criada com sucesso!
          </p>

          <p className="text-sm text-fg-muted mb-7">
            Você já pode entrar com suas credenciais.
          </p>

          <Button
            className="w-full"
            size="lg"
            onClick={() => navigate('login')}
          >
            Fazer login
          </Button>
        </div>
      </AuthLayout>
    );
  }

  return (
    <AuthLayout
      title="Criar conta"
      subtitle="Comece a colorir suas fotos gratuitamente"
    >
      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        <Input
          label="Nome completo"
          placeholder="Seu nome"
          value={form.name}
          onChange={set('name')}
          required
        />

        <Input
          label="E-mail"
          type="email"
          placeholder="voce@exemplo.com"
          value={form.email}
          onChange={set('email')}
          required
        />

        <Input
          label="Senha"
          type="password"
          placeholder="Mínimo 8 caracteres"
          value={form.password}
          onChange={set('password')}
          required
          minLength={8}
        />

        <Input
          label="Confirmar senha"
          type="password"
          placeholder="Repita a senha"
          value={form.confirm}
          onChange={set('confirm')}
          required
          error={
            form.confirm && form.confirm !== form.password
              ? 'As senhas não conferem'
              : undefined
          }
        />

        <Button
          type="submit"
          size="lg"
          className="w-full mt-1"
          disabled={
            loading ||
            (!!form.confirm && form.confirm !== form.password)
          }
        >
          {loading ? 'Criando conta…' : 'Criar conta'}
        </Button>
      </form>

      <p className="text-center text-sm text-fg-muted mt-6">
        Já tem conta?{' '}
        <button
          onClick={() => navigate('login')}
          className="text-accent-light hover:underline font-medium"
        >
          Entrar
        </button>
      </p>
    </AuthLayout>
  );
}

/* ─── Forgot password – step 1 ─── */
function ForgotEmailPage({ navigate }) {
  const [email, setEmail] = useState('');
  const [sent, setSent] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    await new Promise((r) => setTimeout(r, 600));

    setLoading(false);
    setSent(true);
  };

  return (
    <AuthLayout
      title="Recuperar senha"
      subtitle={
        sent
          ? undefined
          : 'Enviaremos um link de redefinição para seu e-mail'
      }
    >
      {sent ? (
        <div className="text-center py-2">
          <div className="w-16 h-16 rounded-full bg-accent/10 border border-accent/20 flex items-center justify-center mx-auto mb-5">
            <span className="text-3xl">✉️</span>
          </div>

          <p className="text-fg font-medium mb-1">
            E-mail enviado!
          </p>

          <p className="text-sm text-fg-muted mb-1">
            Link de recuperação enviado para
          </p>

          <p className="text-sm font-medium text-fg mb-7">
            {email}
          </p>

          <Button
            className="w-full"
            size="lg"
            onClick={() => navigate('forgot-newpass')}
          >
            Já tenho o link → Criar nova senha
          </Button>

          <p className="text-xs text-fg-subtle mt-3">
            (Protótipo: clique acima para continuar o fluxo)
          </p>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <Input
            label="E-mail da conta"
            type="email"
            placeholder="voce@exemplo.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />

          <Button
            type="submit"
            size="lg"
            className="w-full"
            disabled={loading}
          >
            {loading ? 'Enviando…' : 'Enviar link de recuperação'}
          </Button>
        </form>
      )}

      <div className="mt-6 text-center">
        <button
          onClick={() => navigate('login')}
          className="text-sm text-fg-muted hover:text-fg transition-colors"
        >
          ← Voltar ao login
        </button>
      </div>
    </AuthLayout>
  );
}

/* ─── Forgot password – step 2 ─── */
function ForgotNewPassPage({ navigate }) {
  const [form, setForm] = useState({
    password: '',
    confirm: '',
  });

  const [done, setDone] = useState(false);
  const [loading, setLoading] = useState(false);

  const set = (k) => (e) =>
    setForm((f) => ({
      ...f,
      [k]: e.target.value,
    }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    await new Promise((r) => setTimeout(r, 600));

    setLoading(false);
    setDone(true);
  };

  if (done) {
    return (
      <AuthLayout title="Senha redefinida!">
        <div className="text-center py-4">
          <div className="w-16 h-16 rounded-full bg-success/10 border border-success/20 flex items-center justify-center mx-auto mb-5">
            <svg width="28" height="28" viewBox="0 0 28 28" fill="none">
              <path
                d="M6 14l6 6 10-12"
                stroke="#22C55E"
                strokeWidth="2.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </div>

          <p className="text-fg font-medium mb-1">
            Senha redefinida com sucesso
          </p>

          <p className="text-sm text-fg-muted mb-7">
            Você já pode entrar com a nova senha.
          </p>

          <Button
            className="w-full"
            size="lg"
            onClick={() => navigate('login')}
          >
            Fazer login
          </Button>
        </div>
      </AuthLayout>
    );
  }

  return (
    <AuthLayout
      title="Nova senha"
      subtitle="Crie uma senha forte para proteger sua conta"
    >
      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        <Input
          label="Nova senha"
          type="password"
          placeholder="Mínimo 8 caracteres"
          value={form.password}
          onChange={set('password')}
          required
          minLength={8}
        />

        <Input
          label="Confirmar nova senha"
          type="password"
          placeholder="Repita a nova senha"
          value={form.confirm}
          onChange={set('confirm')}
          required
          error={
            form.confirm && form.confirm !== form.password
              ? 'As senhas não conferem'
              : undefined
          }
        />

        <Button
          type="submit"
          size="lg"
          className="w-full mt-1"
          disabled={
            loading ||
            (!!form.confirm && form.confirm !== form.password)
          }
        >
          {loading ? 'Redefinindo…' : 'Redefinir senha'}
        </Button>
      </form>
    </AuthLayout>
  );
}

/* ─── Edit profile ─── */
function EditProfilePage({ navigate, user, onLogout }) {
  const [name, setName] = useState(user.name);
  const [email, setEmail] = useState(user.email);
  const [changePwd, setChangePwd] = useState(false);

  const [pwd, setPwd] = useState({
    current: '',
    next: '',
    confirm: '',
  });

  const [saved, setSaved] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSave = async (e) => {
    e.preventDefault();
    setLoading(true);

    await new Promise((r) => setTimeout(r, 500));

    setLoading(false);
    setSaved(true);

    setTimeout(() => setSaved(false), 2500);
  };

  return (
    <AuthLayout
      title="Editar perfil"
      subtitle="Atualize seus dados de conta"
    >
      <div className="flex items-center gap-4 mb-6 p-4 bg-muted-bg/50 rounded-xl border border-border">
        <div className="w-12 h-12 rounded-full bg-accent/20 flex items-center justify-center shrink-0">
          <span className="text-xl font-semibold text-accent-light">
            {name[0] || '?'}
          </span>
        </div>

        <div>
          <p className="font-medium text-fg">{name}</p>
          <p className="text-sm text-fg-muted">{email}</p>

          <span className="inline-flex items-center px-2 py-0.5 mt-1 rounded-full text-xs font-medium bg-accent/10 text-accent-light">
            {user.role === 'admin' ? 'Administrador' : 'Usuário'}
          </span>
        </div>
      </div>

      <form onSubmit={handleSave} className="flex flex-col gap-4">
        <Input
          label="Nome"
          value={name}
          onChange={(e) => setName(e.target.value)}
          required
        />

        <Input
          label="E-mail"
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />

        <div>
          <button
            type="button"
            onClick={() => setChangePwd(!changePwd)}
            className="text-sm text-accent-light hover:underline flex items-center gap-1.5"
          >
            <svg
              width="13"
              height="13"
              viewBox="0 0 13 13"
              fill="none"
            >
              <rect
                x="2"
                y="6"
                width="9"
                height="6"
                rx="1.5"
                stroke="currentColor"
                strokeWidth="1.3"
              />
              <path
                d="M4.5 6V4a2 2 0 014 0v2"
                stroke="currentColor"
                strokeWidth="1.3"
                strokeLinecap="round"
              />
            </svg>

            {changePwd
              ? 'Cancelar troca de senha'
              : 'Trocar senha'}
          </button>
        </div>

        {changePwd && (
          <div className="flex flex-col gap-3 p-4 bg-muted-bg/40 rounded-xl border border-border">
            <Input
              label="Senha atual"
              type="password"
              placeholder="••••••••"
              value={pwd.current}
              onChange={(e) =>
                setPwd((p) => ({
                  ...p,
                  current: e.target.value,
                }))
              }
            />

            <Input
              label="Nova senha"
              type="password"
              placeholder="Mínimo 8 caracteres"
              value={pwd.next}
              onChange={(e) =>
                setPwd((p) => ({
                  ...p,
                  next: e.target.value,
                }))
              }
              minLength={8}
            />

            <Input
              label="Confirmar nova senha"
              type="password"
              placeholder="Repita"
              value={pwd.confirm}
              onChange={(e) =>
                setPwd((p) => ({
                  ...p,
                  confirm: e.target.value,
                }))
              }
              error={
                pwd.confirm && pwd.confirm !== pwd.next
                  ? 'As senhas não conferem'
                  : undefined
              }
            />
          </div>
        )}

        {saved && (
          <div className="flex items-center gap-2 bg-success/8 border border-success/20 rounded-xl px-4 py-3">
            <svg
              width="16"
              height="16"
              viewBox="0 0 16 16"
              fill="none"
            >
              <path
                d="M3 8l4 4 6-7"
                stroke="#22C55E"
                strokeWidth="1.8"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>

            <p className="text-sm text-success">
              Alterações salvas com sucesso.
            </p>
          </div>
        )}

        <Button
          type="submit"
          size="lg"
          className="w-full mt-1"
          disabled={loading}
        >
          {loading ? 'Salvando…' : 'Salvar alterações'}
        </Button>
      </form>

      <div className="mt-5 pt-5 border-t border-border flex items-center justify-between">
        <button
          onClick={() => navigate('home')}
          className="text-sm text-fg-muted hover:text-fg transition-colors"
        >
          ← Voltar
        </button>

        <button
          onClick={onLogout}
          className="text-sm text-error hover:text-error/80 transition-colors flex items-center gap-1.5"
        >
          <svg
            width="14"
            height="14"
            viewBox="0 0 14 14"
            fill="none"
          >
            <path
              d="M5 7h7M9 4l3 3-3 3M5 2H3a1 1 0 00-1 1v8a1 1 0 001 1h2"
              stroke="currentColor"
              strokeWidth="1.4"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>

          Sair da conta
        </button>
      </div>
    </AuthLayout>
  );
}

export default function AuthPages({
  view,
  navigate,
  onLogin,
  user,
  onLogout,
}) {
  if (view === 'register') {
    return <RegisterPage navigate={navigate} />;
  }

  if (view === 'forgot-email') {
    return <ForgotEmailPage navigate={navigate} />;
  }

  if (view === 'forgot-newpass') {
    return <ForgotNewPassPage navigate={navigate} />;
  }

  if (view === 'edit-profile' && user && onLogout) {
    return (
      <EditProfilePage
        navigate={navigate}
        user={user}
        onLogout={onLogout}
      />
    );
  }

  return <LoginPage navigate={navigate} onLogin={onLogin} />;
}