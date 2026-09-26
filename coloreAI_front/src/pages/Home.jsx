import { useState, useRef, useCallback } from 'react';
import Sidebar from '../components/Sidebar';
import UploadAlert from '../components/UploadAlert';
import { Spinner } from '../components/ui';

const SAMPLE_IDS = [
  '1506794778202-cad84cf45f1d',
  '1477959858617-67f85cf4f1df',
  '1500534314209-a25ddb2bd429',
  '1487958449943-2429e8be8625',
  '1518791841217-8f162f1912da',
  '1542992015-3a0f71d36cdb',
];

const PROCESSING_STEPS = [
  { pct: 12, label: 'Lendo imagem…' },
  { pct: 28, label: 'Pré-processando…' },
  { pct: 52, label: 'Estimando cores…' },
  { pct: 74, label: 'Refinando detalhes…' },
  { pct: 90, label: 'Finalizando…' },
  { pct: 100, label: 'Concluído!' },
];

export default function HomePage({
  user,
  sessions,
  currentView,
  navigate,
  onSelectSession,
  onResult,
  onLogout,
}) {
  const [dragState, setDragState] = useState('idle');
  const [uploadState, setUploadState] = useState('idle');
  const [previewUrl, setPreviewUrl] = useState(null);
  const [alert, setAlert] = useState(null);
  const [progress, setProgress] = useState(0);
  const [progressLabel, setProgressLabel] = useState('');

  const fileInputRef = useRef(null);

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
      setAlert(null);
    };

    reader.readAsDataURL(file);
  }, []);

  const handleDrop = (e) => {
    e.preventDefault();
    setDragState('idle');

    const file = e.dataTransfer.files[0];

    if (file) {
      processFile(file);
    }
  };

  const handleFileChange = (e) => {
    const file = e.target.files?.[0];

    if (file) {
      processFile(file);
    }

    e.target.value = '';
  };

  const handleColorize = async () => {
    setUploadState('processing');
    setProgress(0);

    for (const step of PROCESSING_STEPS) {
      await new Promise((r) => setTimeout(r, 400));

      setProgress(step.pct);
      setProgressLabel(step.label);
    }

    await new Promise((r) => setTimeout(r, 200));

    onResult(
      previewUrl ||
        `https://images.unsplash.com/photo-${SAMPLE_IDS[0]}?w=900&h=600&fit=crop&auto=format`
    );
  };

  const reset = () => {
    setUploadState('idle');
    setPreviewUrl(null);
    setAlert(null);
  };

  return (
    <div className="flex h-full bg-bg overflow-hidden">
      <Sidebar
        user={user}
        sessions={sessions}
        currentView={currentView}
        navigate={navigate}
        onSelectSession={onSelectSession}
        onNewColorization={reset}
        onLogout={onLogout}
      />

      <main className="flex-1 overflow-y-auto">
        <div className="max-w-2xl mx-auto px-8 py-10">

          {/* Header */}
          <div className="mb-8">
            <h1 className="text-2xl font-semibold text-fg tracking-tight">
              Nova colorização
            </h1>

            <p className="text-fg-muted mt-1.5">
              Envie uma foto em preto e branco para colorir com deep learning
            </p>
          </div>

          {/* Alert */}
          {alert && (
            <div className="mb-5">
              <UploadAlert
                type={alert}
                onDismiss={() => {
                  setAlert(null);

                  if (alert !== 'already-colored') {
                    setPreviewUrl(null);
                    setUploadState('idle');
                  }
                }}
                onRetry={() => setAlert(null)}
                onProceed={handleColorize}
              />
            </div>
          )}

          {/* Upload zone */}
          {uploadState === 'idle' && (
            <div
              onDragOver={(e) => {
                e.preventDefault();
                setDragState('over');
              }}
              onDragLeave={() => setDragState('idle')}
              onDrop={handleDrop}
              onClick={() => fileInputRef.current?.click()}
              className={`relative flex flex-col items-center justify-center rounded-2xl py-16 px-8 cursor-pointer transition-all duration-200 ${
                dragState === 'over'
                  ? 'border-2 border-accent bg-accent/5 scale-[1.005] shadow-lg shadow-accent/10'
                  : 'border-2 border-dashed border-border hover:border-fg-subtle/40 hover:bg-muted-bg/15'
              }`}
            >
              <input
                ref={fileInputRef}
                type="file"
                className="hidden"
                accept="image/jpeg,image/png"
                onChange={handleFileChange}
              />

              {/* Upload icon */}
              <div
                className={`w-18 h-18 rounded-2xl flex items-center justify-center mb-5 transition-colors ${
                  dragState === 'over'
                    ? 'bg-accent/15'
                    : 'bg-muted-bg'
                }`}
                style={{ width: 72, height: 72 }}
              >
                {dragState === 'over' ? (
                  <svg
                    width="32"
                    height="32"
                    viewBox="0 0 32 32"
                    fill="none"
                    className="text-accent"
                  >
                    <path
                      d="M16 6v18M8 14l8-8 8 8"
                      stroke="currentColor"
                      strokeWidth="2.5"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                ) : (
                  <svg
                    width="32"
                    height="32"
                    viewBox="0 0 32 32"
                    fill="none"
                    className="text-fg-muted"
                  >
                    <path
                      d="M6 22l6-6 4 4 5-7 5 9M26 6v8M22 10h8"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />

                    <rect
                      x="2"
                      y="2"
                      width="28"
                      height="28"
                      rx="5"
                      stroke="currentColor"
                      strokeWidth="2"
                    />
                  </svg>
                )}
              </div>

              <p className="text-base font-medium text-fg">
                {dragState === 'over'
                  ? 'Solte a imagem aqui'
                  : 'Arraste uma foto P&B ou clique para selecionar'}
              </p>

              <p className="text-sm text-fg-muted mt-2">
                JPG · PNG · máximo 10 MB
              </p>

              {dragState === 'over' && (
                <div className="absolute inset-0 rounded-2xl border-2 border-accent pointer-events-none" />
              )}
            </div>
          )}

          {/* Preview state */}
          {uploadState === 'preview' && previewUrl && (
            <div className="border border-border rounded-2xl overflow-hidden bg-card">
              <div className="relative bg-muted-bg">
                <img
                  src={previewUrl}
                  alt="Preview"
                  className="w-full object-contain"
                  style={{
                    filter: 'grayscale(1)',
                    maxHeight: 340,
                  }}
                />

                <div className="absolute top-3 left-3 bg-black/60 text-white text-xs font-medium px-2.5 py-1 rounded-full backdrop-blur-sm">
                  Pré-visualização P&B
                </div>

                <button
                  onClick={reset}
                  className="absolute top-3 right-3 w-8 h-8 rounded-full bg-black/60 hover:bg-black/80 text-white flex items-center justify-center transition-colors"
                >
                  <svg
                    width="12"
                    height="12"
                    viewBox="0 0 12 12"
                    fill="none"
                  >
                    <path
                      d="M1 1l10 10M11 1L1 11"
                      stroke="currentColor"
                      strokeWidth="1.8"
                      strokeLinecap="round"
                    />
                  </svg>
                </button>
              </div>

              <div className="p-5 flex items-center justify-between">
                <div>
                  <p className="font-medium text-fg">
                    Imagem pronta
                  </p>

                  <p className="text-sm text-fg-muted mt-0.5">
                    Clique em "Colorizar" para continuar
                  </p>
                </div>

                <div className="flex gap-3">
                  <button
                    onClick={reset}
                    className="text-sm text-fg-muted border border-border hover:border-fg-subtle/50 hover:text-fg px-4 py-2 rounded-xl transition-colors"
                  >
                    Trocar
                  </button>

                  <button
                    onClick={handleColorize}
                    className="bg-accent hover:bg-accent/90 text-white font-medium text-sm px-5 py-2 rounded-xl transition-colors flex items-center gap-2 shadow-sm shadow-accent/25"
                  >
                    <svg
                      width="13"
                      height="13"
                      viewBox="0 0 13 13"
                      fill="none"
                    >
                      <path
                        d="M6.5 1.5a5 5 0 100 10 5 5 0 000-10z"
                        stroke="currentColor"
                        strokeWidth="1.4"
                      />

                      <path
                        d="M4.5 6.5l1.5 1.5 2.5-3"
                        stroke="currentColor"
                        strokeWidth="1.4"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                    </svg>

                    Colorizar com IA
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Processing state */}
          {uploadState === 'processing' && (
            <div className="border border-border rounded-2xl p-10 flex flex-col items-center gap-6 bg-card">
              {previewUrl && (
                <div className="relative">
                  <img
                    src={previewUrl}
                    alt=""
                    className="w-44 h-32 object-cover rounded-xl opacity-30"
                    style={{ filter: 'grayscale(1)' }}
                  />

                  <div className="absolute inset-0 flex items-center justify-center">
                    <Spinner size="lg" />
                  </div>
                </div>
              )}

              <div className="w-full max-w-sm text-center">
                <p className="text-sm font-medium text-fg mb-1">
                  {progressLabel}
                </p>

                <p className="text-xs text-fg-subtle mb-4">
                  Modelo de deep learning em execução
                </p>

                <div className="h-1.5 bg-muted-bg rounded-full overflow-hidden">
                  <div
                    className="h-full bg-accent rounded-full transition-all duration-500"
                    style={{ width: `${progress}%` }}
                  />
                </div>

                <p className="text-xs text-fg-subtle mt-2 font-mono">
                  {progress}%
                </p>
              </div>
            </div>
          )}

          {/* Error demo panel */}
          {uploadState === 'idle' && !alert && (
            <div className="mt-5 p-4 bg-surface rounded-2xl border border-border">
              <p className="text-[11px] text-fg-subtle mb-3 font-semibold uppercase tracking-widest">
                Demonstrar estados de erro
              </p>

              <div className="flex flex-wrap gap-2">
                {[
                  {
                    type: 'invalid-format',
                    label: 'Formato inválido',
                    icon: '⚠️',
                  },
                  {
                    type: 'too-large',
                    label: 'Arquivo muito grande',
                    icon: '📦',
                  },
                  {
                    type: 'already-colored',
                    label: 'Imagem já colorida',
                    icon: '🎨',
                  },
                  {
                    type: 'upload-failed',
                    label: 'Falha de conexão',
                    icon: '🔌',
                  },
                ].map((err) => (
                  <button
                    key={err.type}
                    onClick={() => setAlert(err.type)}
                    className="flex items-center gap-1.5 text-xs text-fg-muted border border-border hover:border-fg-subtle/50 hover:text-fg hover:bg-muted-bg/30 rounded-lg px-3 py-1.5 transition-all"
                  >
                    <span>{err.icon}</span>
                    {err.label}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Sample gallery */}
          {uploadState === 'idle' && (
            <div className="mt-8">
              <div className="flex items-center justify-between mb-3">
                <p className="text-xs text-fg-subtle uppercase tracking-widest font-semibold">
                  Exemplos coloridos
                </p>

                <button
                  onClick={() => navigate('history')}
                  className="text-xs text-accent-light hover:underline"
                >
                  Ver histórico completo →
                </button>
              </div>

              <div className="grid grid-cols-3 gap-3">
                {SAMPLE_IDS.slice(0, 6).map((id) => (
                  <div
                    key={id}
                    className="group relative aspect-[4/3] rounded-xl overflow-hidden bg-muted-bg cursor-pointer"
                    onClick={() => navigate('history')}
                  >
                    <img
                      src={`https://images.unsplash.com/photo-${id}?w=240&h=180&fit=crop&auto=format`}
                      alt="Exemplo"
                      className="w-full h-full object-cover grayscale group-hover:grayscale-0 transition-all duration-500"
                    />

                    <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity bg-black/20 flex items-center justify-center">
                      <div className="bg-black/60 text-white text-xs px-2.5 py-1 rounded-full backdrop-blur-sm font-medium">
                        Ver resultado
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              <p className="text-[11px] text-fg-subtle mt-2 text-center">
                Passe o mouse para ver a versão colorizada
              </p>
            </div>
          )}

        </div>
      </main>
    </div>
  );
}