import { useState } from 'react';

export default function ConfidenceMapToggle({
  imageUrl,
  alt = 'Imagem colorizada',
}) {
  const [showMap, setShowMap] = useState(false);

  return (
    <div className="flex flex-col gap-3">
      <div className="flex items-center justify-between">
        <p className="text-sm text-fg-muted">Mapa de confiança</p>

        <button
          onClick={() => setShowMap(!showMap)}
          className={`relative inline-flex h-5 w-9 items-center rounded-full transition-colors ${
            showMap ? 'bg-accent' : 'bg-muted-bg'
          }`}
          aria-label="Toggle mapa de confiança"
        >
          <span
            className={`inline-block h-3.5 w-3.5 rounded-full bg-white shadow transition-transform ${
              showMap ? 'translate-x-4' : 'translate-x-0.5'
            }`}
          />
        </button>
      </div>

      <div className="relative rounded-xl overflow-hidden bg-muted-bg">
        <img
          src={imageUrl}
          alt={alt}
          className="w-full h-auto block"
        />

        {showMap && (
          <svg
            className="absolute inset-0 w-full h-full"
            viewBox="0 0 100 100"
            preserveAspectRatio="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <defs>
              <radialGradient id="cm1" cx="25%" cy="35%" r="28%">
                <stop offset="0%" stopColor="#EF4444" stopOpacity="0.65" />
                <stop offset="100%" stopColor="#EF4444" stopOpacity="0" />
              </radialGradient>

              <radialGradient id="cm2" cx="70%" cy="60%" r="22%">
                <stop offset="0%" stopColor="#EAB308" stopOpacity="0.55" />
                <stop offset="100%" stopColor="#EAB308" stopOpacity="0" />
              </radialGradient>

              <radialGradient id="cm3" cx="85%" cy="20%" r="18%">
                <stop offset="0%" stopColor="#EF4444" stopOpacity="0.50" />
                <stop offset="100%" stopColor="#EF4444" stopOpacity="0" />
              </radialGradient>

              <radialGradient id="cm4" cx="40%" cy="80%" r="20%">
                <stop offset="0%" stopColor="#EAB308" stopOpacity="0.45" />
                <stop offset="100%" stopColor="#EAB308" stopOpacity="0" />
              </radialGradient>
            </defs>

            <rect width="100" height="100" fill="url(#cm1)" />
            <rect width="100" height="100" fill="url(#cm2)" />
            <rect width="100" height="100" fill="url(#cm3)" />
            <rect width="100" height="100" fill="url(#cm4)" />
          </svg>
        )}

        {showMap && (
          <div className="absolute bottom-2 right-2 flex items-center gap-2 bg-black/70 rounded-lg px-3 py-1.5">
            <div className="flex items-center gap-1">
              <div className="w-2 h-2 rounded-full bg-error" />
              <span className="text-xs text-fg-muted">Baixa</span>
            </div>

            <div className="flex items-center gap-1">
              <div className="w-2 h-2 rounded-full bg-warning" />
              <span className="text-xs text-fg-muted">Média</span>
            </div>
          </div>
        )}
      </div>

      {showMap && (
        <p className="text-xs text-fg-subtle leading-relaxed">
          As regiões destacadas indicam áreas onde o modelo teve menor certeza
          na estimativa de cor — verifique especialmente bordas e detalhes de
          textura.
        </p>
      )}
    </div>
  );
}