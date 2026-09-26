import { useState, useRef, useCallback } from 'react';
import BottomNav from '../components/BottomNav';
import UploadAlert from '../components/UploadAlert';
import HistoryItem from '../components/HistoryItem';
import MetricIndicator, {
  qualityFromPsnr,
  qualityFromSsim,
} from '../components/MetricIndicator';
import ConfidenceMapToggle from '../components/ConfidenceMapToggle';
import { Modal, Button, Input, Spinner } from '../components/ui';

const COLORIZED_URL =
  'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=600&h=400&fit=crop&auto=format';

function MobileHome({
  user,
  sessions,
  navigate,
  onResult,
  onSelectSession,
}) {
  const [alert, setAlert] = useState(null);
  const [uploadState, setUploadState] = useState('idle');
  const [previewUrl, setPreviewUrl] = useState(null);
  const [progress, setProgress] = useState(0);
  const fileRef = useRef(null);

  const processFile = useCallback((file) => {
    if (!['image/jpeg', 'image/png'].includes(file.type)) {
      setAlert('invalid-format');
      return;
    }

    if (file.size > 10 * 1024 * 1024) {
      setAlert('too-large');
      return;
    }

    const reader = new FileReader();

    reader.onload = (e) => {
      setPreviewUrl(e.target?.result);
      setUploadState('preview');
    };

    reader.readAsDataURL(file);
  }, []);

  const handleColorize = async () => {
    setUploadState('processing');
    setProgress(0);

    for (const p of [20, 45, 68, 85, 100]) {
      await new Promise((r) => setTimeout(r, 350));
      setProgress(p);
    }

    onResult(previewUrl || '');
  };

  return (
    <div className="flex flex-col h-full bg-bg pb-16">
      {/* Header */}
      <div className="flex items-center justify-between px-5 pt-12 pb-4">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-lg bg-accent flex items-center justify-center">
            <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
              <circle
                cx="7"
                cy="7"
                r="5.5"
                stroke="white"
                strokeWidth="1.4"
              />
              <path
                d="M5 7c0-1.1.9-2 2-2s2 .9 2 2"
                stroke="white"
                strokeWidth="1.4"
                strokeLinecap="round"
              />
            </svg>
          </div>

          <span className="font-semibold text-fg">ColorizeAI</span>
        </div>

        <div className="w-8 h-8 rounded-full bg-accent/20 flex items-center justify-center">
          <span className="text-sm font-semibold text-accent-light">
            {user.name[0]}
          </span>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto px-5 pb-4">
        {alert && (
          <div className="mb-4">
            <UploadAlert
              type={alert}
              onDismiss={() => {
                setAlert(null);
                setUploadState('idle');
                setPreviewUrl(null);
              }}
              onRetry={() => setAlert(null)}
              onProceed={handleColorize}
            />
          </div>
        )}

        {uploadState === 'idle' && (
          <button
            onClick={() => fileRef.current?.click()}
            className="w-full border-2 border-dashed border-border hover:border-accent/50 rounded-2xl py-10 flex flex-col items-center gap-3 transition-all active:scale-[0.98] mb-6"
          >
            <div className="w-14 h-14 rounded-2xl bg-muted-bg flex items-center justify-center">
              <svg
                width="24"
                height="24"
                viewBox="0 0 24 24"
                fill="none"
                className="text-fg-muted"
              >
                <path
                  d="M12 4v14M5 10l7-6 7 6"
                  stroke="currentColor"
                  strokeWidth="1.8"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
                <path
                  d="M3 20h18"
                  stroke="currentColor"
                  strokeWidth="1.8"
                  strokeLinecap="round"
                />
              </svg>
            </div>

            <div className="text-center">
              <p className="text-fg font-medium">
                Selecionar foto P&B
              </p>
              <p className="text-fg-subtle text-sm mt-0.5">
                Câmera ou galeria · JPG, PNG · máx 10 MB
              </p>
            </div>
          </button>
        )}

        <input
          ref={fileRef}
          type="file"
          className="hidden"
          accept="image/jpeg,image/png"
          onChange={(e) => {
            const f = e.target.files?.[0];

            if (f) {
              processFile(f);
            }

            e.target.value = '';
          }}
        />

        {uploadState === 'preview' && previewUrl && (
          <div className="border border-border rounded-2xl overflow-hidden mb-6">
            <div className="relative">
              <img
                src={previewUrl}
                alt="Preview"
                className="w-full max-h-56 object-contain bg-muted-bg"
                style={{ filter: 'grayscale(1)' }}
              />

              <button
                onClick={() => {
                  setUploadState('idle');
                  setPreviewUrl(null);
                }}
                className="absolute top-2 right-2 w-8 h-8 rounded-full bg-black/60 text-white flex items-center justify-center"
              >
                ✕
              </button>
            </div>

            <div className="p-4 flex gap-3">
              <Button
                variant="outline"
                className="flex-1"
                onClick={() => {
                  setUploadState('idle');
                  setPreviewUrl(null);
                }}
              >
                Trocar
              </Button>

              <Button
                className="flex-1"
                onClick={handleColorize}
              >
                Colorizar →
              </Button>
            </div>
          </div>
        )}

        {uploadState === 'processing' && (
          <div className="border border-border rounded-2xl p-6 flex flex-col items-center gap-4 mb-6">
            {previewUrl && (
              <img
                src={previewUrl}
                alt=""
                className="w-28 h-20 object-cover rounded-xl opacity-40"
                style={{ filter: 'grayscale(1)' }}
              />
            )}

            <Spinner size="md" />

            <div className="w-full">
              <div className="flex justify-between text-xs text-fg-muted mb-1.5">
                <span>Processando…</span>
                <span>{progress}%</span>
              </div>

              <div className="h-1.5 bg-muted-bg rounded-full overflow-hidden">
                <div
                  className="h-full bg-accent rounded-full transition-all duration-300"
                  style={{ width: `${progress}%` }}
                />
              </div>
            </div>
          </div>
        )}

        {/* Recent */}
        {sessions.length > 0 && uploadState === 'idle' && (
          <div>
            <p className="text-xs text-fg-subtle uppercase tracking-wider font-medium mb-3">
              Colorizações recentes
            </p>

            <div className="flex flex-col gap-2">
              {sessions.slice(0, 4).map((s) => (
                <HistoryItem
                  key={s.id}
                  session={s}
                  compact
                  onClick={() => onSelectSession(s)}
                />
              ))}
            </div>

            <button
              onClick={() => navigate('history')}
              className="w-full text-center text-sm text-accent-light hover:underline mt-3 py-2"
            >
              Ver todo o histórico →
            </button>
          </div>
        )}
      </div>

      <BottomNav currentView="home" navigate={navigate} />
    </div>
  );
}

function MobileResult({
  user,
  session,
  uploadedImage,
  navigate,
  onResult,
}) {
  const [tab, setTab] = useState('result');

  const originalUrl =
    uploadedImage ||
    `https://images.unsplash.com/photo-${
      session?.imageId ?? '1506794778202-cad84cf45f1d'
    }?w=600&h=400&fit=crop&auto=format`;

  const colorizedUrl = COLORIZED_URL;
  const psnr = session?.psnr ?? 32.4;
  const ssim = session?.ssim ?? 0.87;

  return (
    <div className="flex flex-col h-full bg-bg pb-16">
      {/* Header */}
      <div className="flex items-center gap-3 px-5 pt-12 pb-3">
        <button
          onClick={() => navigate('home')}
          className="text-fg-muted hover:text-fg text-xl"
        >
          ←
        </button>

        <h1 className="text-lg font-semibold text-fg flex-1 truncate">
          {session?.subject ?? 'Resultado'}
        </h1>

        <a
          href={colorizedUrl}
          download="colorized.jpg"
          target="_blank"
          rel="noopener noreferrer"
          className="bg-accent text-white text-sm font-medium px-3 py-1.5 rounded-xl"
        >
          Baixar
        </a>
      </div>

      {/* Tabs */}
      <div className="flex px-5 gap-1 mb-3">
        {['result', 'metrics', 'confidence'].map((t) => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className={`flex-1 py-2 rounded-lg text-xs font-medium transition-all ${
              tab === t
                ? 'bg-card text-fg border border-border'
                : 'text-fg-subtle'
            }`}
          >
            {t === 'result'
              ? 'Comparação'
              : t === 'metrics'
                ? 'Métricas'
                : 'Confiança'}
          </button>
        ))}
      </div>

      <div className="flex-1 overflow-y-auto px-5 pb-4">
        {tab === 'result' && (
          <div className="flex flex-col gap-4">
            <div>
              <p className="text-xs text-fg-subtle mb-2 uppercase tracking-wider font-medium">
                Original P&B
              </p>

              <img
                src={originalUrl}
                alt="Original"
                className="w-full rounded-xl object-cover"
                style={{
                  filter: 'grayscale(1)',
                  maxHeight: 220,
                }}
              />
            </div>

            <div>
              <p className="text-xs text-fg-subtle mb-2 uppercase tracking-wider font-medium">
                Colorizada IA
              </p>

              <img
                src={colorizedUrl}
                alt="Colorizada"
                className="w-full rounded-xl object-cover"
                style={{ maxHeight: 220 }}
              />
            </div>

            {/* Variations */}
            <div>
              <p className="text-xs text-fg-subtle uppercase tracking-wider font-medium mb-2">
                Variações
              </p>

              <div className="grid grid-cols-3 gap-2">
                {[
                  '1506794778202-cad84cf45f1d',
                  '1518791841217-8f162f1912da',
                  '1542992015-3a0f71d36cdb',
                ].map((id, i) => (
                  <div
                    key={id}
                    className="aspect-square rounded-xl overflow-hidden bg-muted-bg"
                  >
                    <img
                      src={`https://images.unsplash.com/photo-${id}?w=120&h=120&fit=crop&auto=format`}
                      alt={`V${i + 1}`}
                      className="w-full h-full object-cover"
                    />
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {tab === 'metrics' && (
          <div className="flex flex-col gap-4">
            <div className="bg-card border border-border rounded-xl p-5 flex flex-col gap-5">
              <MetricIndicator
                label="PSNR"
                value={psnr.toFixed(1)}
                unit="dB"
                quality={qualityFromPsnr(psnr)}
              />

              <MetricIndicator
                label="SSIM"
                value={ssim.toFixed(2)}
                quality={qualityFromSsim(ssim)}
              />
            </div>

            <p className="text-xs text-fg-subtle leading-relaxed">
              Métricas calculadas em relação à imagem de referência
              colorida. PSNR ≥ 31 dB e SSIM ≥ 0,85 indicam alta
              fidelidade cromática.
            </p>
          </div>
        )}

        {tab === 'confidence' && (
          <ConfidenceMapToggle imageUrl={colorizedUrl} />
        )}
      </div>

      <BottomNav currentView="home" navigate={navigate} />
    </div>
  );
}

function MobileHistory({
  sessions: initSessions,
  navigate,
  onSelectSession,
}) {
  const [sessions, setSessions] = useState(initSessions);
  const [toDelete, setToDelete] = useState(null);

  return (
    <div className="flex flex-col h-full bg-bg pb-16">
      <div className="px-5 pt-12 pb-4">
        <h1 className="text-2xl font-semibold text-fg">
          Histórico
        </h1>

        <p className="text-fg-muted text-sm mt-1">
          {sessions.length} colorizações
        </p>
      </div>

      <div className="flex-1 overflow-y-auto px-5">
        {sessions.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 text-center">
            <span className="text-4xl mb-3">🕐</span>

            <p className="text-fg font-medium">
              Nenhuma colorização
            </p>

            <button
              onClick={() => navigate('home')}
              className="mt-4 text-sm text-accent-light hover:underline"
            >
              + Nova colorização
            </button>
          </div>
        ) : (
          <div className="flex flex-col gap-2">
            {sessions.map((s) => (
              <div
                key={s.id}
                className="flex items-center gap-2"
              >
                <div className="flex-1">
                  <HistoryItem
                    session={s}
                    compact
                    onClick={() => onSelectSession(s)}
                  />
                </div>

                <button
                  onClick={() => setToDelete(s)}
                  className="w-8 h-8 flex items-center justify-center text-fg-subtle hover:text-error transition-colors shrink-0"
                >
                  🗑
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      <Modal
        open={!!toDelete}
        onClose={() => setToDelete(null)}
        title="Excluir colorização"
      >
        <p className="text-sm text-fg-muted mb-5">
          Excluir{' '}
          <strong className="text-fg">
            "{toDelete?.subject}"
          </strong>
          ? Esta ação não pode ser desfeita.
        </p>

        <div className="flex gap-3">
          <Button
            variant="ghost"
            className="flex-1"
            onClick={() => setToDelete(null)}
          >
            Cancelar
          </Button>

          <Button
            variant="danger"
            className="flex-1"
            onClick={() => {
              setSessions((s) =>
                s.filter((i) => i.id !== toDelete?.id)
              );
              setToDelete(null);
            }}
          >
            Excluir
          </Button>
        </div>
      </Modal>

      <BottomNav currentView="history" navigate={navigate} />
    </div>
  );
}

function MobileProfile({ user, navigate, onLogout }) {
  const [name, setName] = useState(user.name);
  const [email, setEmail] = useState(user.email);
  const [saved, setSaved] = useState(false);

  const handleSave = async (e) => {
    e.preventDefault();

    await new Promise((r) => setTimeout(r, 400));

    setSaved(true);

    setTimeout(() => setSaved(false), 2000);
  };

  return (
    <div className="flex flex-col h-full bg-bg pb-16">
      <div className="px-5 pt-12 pb-6">
        <h1 className="text-2xl font-semibold text-fg">
          Perfil
        </h1>
      </div>

      <div className="flex-1 overflow-y-auto px-5">
        {/* Avatar */}
        <div className="flex justify-center mb-6">
          <div className="w-20 h-20 rounded-full bg-accent/20 flex items-center justify-center">
            <span className="text-3xl font-semibold text-accent-light">
              {name[0]}
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

          <Button
            type="submit"
            size="lg"
            className="w-full"
          >
            {saved ? '✓ Salvo!' : 'Salvar'}
          </Button>
        </form>

        <div className="mt-8 flex flex-col gap-3">
          <button
            onClick={() => navigate('forgot-email')}
            className="w-full text-center py-3 text-sm text-fg-muted border border-border rounded-xl hover:border-fg-subtle/50 transition-colors"
          >
            🔒 Trocar senha
          </button>

          <button
            onClick={onLogout}
            className="w-full text-center py-3 text-sm text-error border border-error/20 rounded-xl hover:bg-error/5 transition-colors"
          >
            Sair da conta
          </button>
        </div>
      </div>

      <BottomNav
        currentView="edit-profile"
        navigate={navigate}
      />
    </div>
  );
}

export default function MobilePages(props) {
  const { view } = props;

  if (view === 'result') {
    return <MobileResult {...props} />;
  }

  if (view === 'history') {
    return <MobileHistory {...props} />;
  }

  if (view === 'edit-profile') {
    return <MobileProfile {...props} />;
  }

  return <MobileHome {...props} />;
}