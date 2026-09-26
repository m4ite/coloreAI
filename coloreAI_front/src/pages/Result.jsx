import { useState } from 'react';
import Sidebar from '../components/Sidebar';
import ImageCard from '../components/ImageCard';
import MetricIndicator, {
  qualityFromPsnr,
  qualityFromSsim,
} from '../components/MetricIndicator';
import ConfidenceMapToggle from '../components/ConfidenceMapToggle';

const VARIATION_IDS = [
  '1506794778202-cad84cf45f1d',
  '1518791841217-8f162f1912da',
  '1542992015-3a0f71d36cdb',
];

export default function ResultPage({
  user,
  sessions,
  session,
  uploadedImage,
  currentView,
  navigate,
  onSelectSession,
  onNewColorization,
  onLogout,
}) {
  const [viewMode, setViewMode] = useState('slider');
  const [activeVariation, setActiveVariation] = useState(0);

  const imageId = session?.imageId || VARIATION_IDS[0];

  const originalUrl =
    uploadedImage ||
    `https://images.unsplash.com/photo-${imageId}?w=900&h=600&fit=crop&auto=format`;

  const colorizedUrl = `https://images.unsplash.com/photo-${VARIATION_IDS[activeVariation]}?w=900&h=600&fit=crop&auto=format`;

  const psnr = session?.psnr ?? 32.4;
  const ssim = session?.ssim ?? 0.87;

  function formatDate(d) {
    if (!d) return '';

    return new Date(d + 'T00:00:00').toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
    });
  }

  return (
    <div className="flex h-full bg-bg overflow-hidden">
      <Sidebar
        user={user}
        sessions={sessions}
        currentView={currentView}
        navigate={navigate}
        onSelectSession={onSelectSession}
        onNewColorization={onNewColorization}
        onLogout={onLogout}
      />

      <main className="flex-1 overflow-y-auto">
        <div className="max-w-4xl mx-auto px-8 py-8">

          {/* Header row */}
          <div className="flex items-start justify-between mb-6">
            <div>
              <button
                onClick={onNewColorization}
                className="flex items-center gap-1.5 text-sm text-fg-muted hover:text-fg transition-colors mb-2"
              >
                <svg
                  width="14"
                  height="14"
                  viewBox="0 0 14 14"
                  fill="none"
                >
                  <path
                    d="M9 2L4 7l5 5"
                    stroke="currentColor"
                    strokeWidth="1.6"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>

                Nova colorização
              </button>

              <h1 className="text-2xl font-semibold text-fg tracking-tight">
                {session?.subject ?? 'Resultado da colorização'}
              </h1>

              {session?.date && (
                <p className="text-sm text-fg-muted mt-1">
                  {formatDate(session.date)}
                </p>
              )}
            </div>

            <div className="flex items-center gap-3">

              {/* View mode toggle */}
              <div className="flex items-center bg-surface border border-border rounded-xl p-1 gap-0.5">
                {['slider', 'split'].map((m) => (
                  <button
                    key={m}
                    onClick={() => setViewMode(m)}
                    className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                      viewMode === m
                        ? 'bg-card text-fg shadow-sm'
                        : 'text-fg-subtle hover:text-fg-muted'
                    }`}
                  >
                    {m === 'slider' ? (
                      <>
                        <svg
                          width="12"
                          height="12"
                          viewBox="0 0 12 12"
                          fill="none"
                        >
                          <path
                            d="M6 1v10M3 4L1 6l2 2M9 4l2 2-2 2"
                            stroke="currentColor"
                            strokeWidth="1.4"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                          />
                        </svg>

                        Slider
                      </>
                    ) : (
                      <>
                        <svg
                          width="12"
                          height="12"
                          viewBox="0 0 12 12"
                          fill="none"
                        >
                          <rect
                            x="1"
                            y="1"
                            width="4.5"
                            height="10"
                            rx="1"
                            stroke="currentColor"
                            strokeWidth="1.3"
                          />

                          <rect
                            x="6.5"
                            y="1"
                            width="4.5"
                            height="10"
                            rx="1"
                            stroke="currentColor"
                            strokeWidth="1.3"
                          />
                        </svg>

                        Lado a lado
                      </>
                    )}
                  </button>
                ))}
              </div>

              {/* Download */}
              <a
                href={colorizedUrl}
                download="colorized.jpg"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 bg-accent hover:bg-accent/90 text-white text-sm font-medium px-4 py-2 rounded-xl transition-colors shadow-sm shadow-accent/20"
              >
                <svg
                  width="14"
                  height="14"
                  viewBox="0 0 14 14"
                  fill="none"
                >
                  <path
                    d="M7 2v8M4 7l3 3 3-3"
                    stroke="currentColor"
                    strokeWidth="1.8"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />

                  <path
                    d="M2 12h10"
                    stroke="currentColor"
                    strokeWidth="1.8"
                    strokeLinecap="round"
                  />
                </svg>

                Baixar
              </a>
            </div>
          </div>

          {/* Comparison view */}
          <div className="mb-5">
            <ImageCard
              originalUrl={originalUrl}
              colorizedUrl={colorizedUrl}
              mode={viewMode}
            />

            {viewMode === 'slider' && (
              <p className="text-xs text-fg-subtle text-center mt-2">
                Arraste o divisor para comparar as versões
              </p>
            )}
          </div>

          {/* Metrics + confidence + variations */}
          <div className="grid grid-cols-3 gap-4">

            {/* Metrics card */}
            <div className="bg-card border border-border rounded-2xl p-5 col-span-1">
              <div className="flex items-center justify-between mb-4">
                <p className="text-sm font-semibold text-fg">
                  Métricas
                </p>

                <div className="flex items-center gap-1.5">
                  <div className="w-1.5 h-1.5 rounded-full bg-success" />

                  <span className="text-[10px] text-fg-subtle font-medium uppercase tracking-wider">
                    Com referência
                  </span>
                </div>
              </div>

              <div className="flex flex-col gap-5">
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

              <p className="text-[11px] text-fg-subtle mt-4 leading-relaxed">
                PSNR ≥ 31 dB e SSIM ≥ 0,85 indicam alta fidelidade cromática.
              </p>
            </div>

            {/* Confidence map card */}
            <div className="bg-card border border-border rounded-2xl p-5 col-span-2">
              <ConfidenceMapToggle imageUrl={colorizedUrl} />
            </div>
          </div>

          {/* Variations */}
          <div className="mt-4 bg-card border border-border rounded-2xl p-5">
            <div className="flex items-center justify-between mb-1">
              <p className="text-sm font-semibold text-fg">
                Outras variações
              </p>

              <span className="text-xs text-fg-subtle">
                {VARIATION_IDS.length} alternativas geradas
              </span>
            </div>

            <p className="text-xs text-fg-muted mb-4">
              O modelo produziu distribuições de cor alternativas. Clique
              em uma variação para substituir o resultado principal.
            </p>

            <div className="grid grid-cols-3 gap-3">
              {VARIATION_IDS.map((id, i) => (
                <button
                  key={id}
                  onClick={() => setActiveVariation(i)}
                  className={`relative group rounded-xl overflow-hidden bg-muted-bg transition-all ${
                    activeVariation === i
                      ? 'ring-2 ring-accent shadow-lg shadow-accent/15 scale-[1.02]'
                      : 'opacity-55 hover:opacity-80 hover:scale-[1.01]'
                  }`}
                  style={{ aspectRatio: '16/9' }}
                >
                  <img
                    src={`https://images.unsplash.com/photo-${id}?w=320&h=180&fit=crop&auto=format`}
                    alt={`Variação ${i + 1}`}
                    className="w-full h-full object-cover"
                  />

                  <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent" />

                  <div className="absolute bottom-2 left-2.5 text-white text-xs font-semibold">
                    Variação {i + 1}
                  </div>

                  {activeVariation === i && (
                    <div className="absolute top-2 right-2 bg-accent rounded-full w-5 h-5 flex items-center justify-center">
                      <svg
                        width="10"
                        height="10"
                        viewBox="0 0 10 10"
                        fill="none"
                      >
                        <path
                          d="M2 5l2.5 2.5 3.5-4"
                          stroke="white"
                          strokeWidth="1.5"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        />
                      </svg>
                    </div>
                  )}
                </button>
              ))}
            </div>
          </div>

        </div>
      </main>
    </div>
  );
}