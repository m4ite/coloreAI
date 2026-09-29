import { useState, useRef, useCallback } from 'react';

function SliderView({ originalUrl, colorizedUrl }) {
  const [sliderX, setSliderX] = useState(50);
  const [dragging, setDragging] = useState(false);
  const containerRef = useRef(null);

  const updateSlider = useCallback((clientX) => {
    const rect = containerRef.current?.getBoundingClientRect();

    if (!rect) return;

    setSliderX(
      Math.max(
        2,
        Math.min(98, ((clientX - rect.left) / rect.width) * 100)
      )
    );
  }, []);

  const onMouseDown = (e) => {
    setDragging(true);
    updateSlider(e.clientX);
  };

  const onMouseMove = useCallback(
    (e) => {
      if (dragging) {
        updateSlider(e.clientX);
      }
    },
    [dragging, updateSlider]
  );

  const onMouseUp = () => setDragging(false);

  const onTouchMove = (e) => {
    updateSlider(e.touches[0].clientX);
  };

  return (
    <div
      ref={containerRef}
      className="relative w-full overflow-hidden rounded-2xl bg-muted-bg select-none cursor-col-resize"
      style={{ aspectRatio: '16/9' }}
      onMouseDown={onMouseDown}
      onMouseMove={onMouseMove}
      onMouseUp={onMouseUp}
      onMouseLeave={onMouseUp}
      onTouchMove={onTouchMove}
      onTouchStart={(e) => updateSlider(e.touches[0].clientX)}
    >
      {/* Colorized (base) */}
      <img
        src={colorizedUrl}
        alt="Colorida com IA"
        className="absolute inset-0 w-full h-full object-cover"
        draggable={false}
      />

      {/* Original B&W clip */}
      <div
        className="absolute inset-0 overflow-hidden"
        style={{ clipPath: `inset(0 ${100 - sliderX}% 0 0)` }}
      >
        <img
          src={originalUrl}
          alt="Original P&B"
          className="absolute inset-0 w-full h-full object-cover"
          style={{ filter: 'grayscale(1)', minWidth: '100%' }}
          draggable={false}
        />
      </div>

      {/* Divider line + handle */}
      <div
        className="absolute inset-y-0 flex items-center justify-center"
        style={{
          left: `${sliderX}%`,
          transform: 'translateX(-50%)',
        }}
      >
        <div className="w-0.5 h-full bg-white/70 shadow-lg" />

        <div className="absolute w-9 h-9 rounded-full bg-white shadow-2xl flex items-center justify-center ring-1 ring-black/10">
          <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
            <path
              d="M6 9H1M12 9h5M4 6l-3 3 3 3M14 6l3 3-3 3"
              stroke="#1a1a1a"
              strokeWidth="1.6"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </div>
      </div>

      {/* Labels */}
      <div className="absolute top-3 left-3 bg-black/55 text-white text-xs font-medium px-2.5 py-1 rounded-full backdrop-blur-sm pointer-events-none">
        Original P&B
      </div>

      <div className="absolute top-3 right-3 bg-black/55 text-white text-xs font-medium px-2.5 py-1 rounded-full backdrop-blur-sm pointer-events-none">
        Colorida com IA
      </div>
    </div>
  );
}

function SplitView({ originalUrl, colorizedUrl }) {
  return (
    <div className="grid grid-cols-2 gap-3 w-full">
      <div
        className="relative rounded-2xl overflow-hidden bg-muted-bg"
        style={{ aspectRatio: '4/3' }}
      >
        <img
          src={originalUrl}
          alt="Original P&B"
          className="w-full h-full object-cover"
          style={{ filter: 'grayscale(1)' }}
        />

        <div className="absolute top-3 left-3 bg-black/55 text-white text-xs font-medium px-2.5 py-1 rounded-full backdrop-blur-sm">
          Original P&B
        </div>
      </div>

      <div
        className="relative rounded-2xl overflow-hidden bg-muted-bg"
        style={{ aspectRatio: '4/3' }}
      >
        <img
          src={colorizedUrl}
          alt="Colorida com IA"
          className="w-full h-full object-cover"
        />

        <div className="absolute top-3 left-3 bg-black/55 text-white text-xs font-medium px-2.5 py-1 rounded-full backdrop-blur-sm">
          Colorida com IA
        </div>

        <div className="absolute top-3 right-3 bg-accent/80 text-white text-[10px] font-semibold px-2 py-0.5 rounded-full backdrop-blur-sm">
          IA ✦
        </div>
      </div>
    </div>
  );
}

export default function ImageCard({
  originalUrl,
  colorizedUrl,
  mode = 'slider',
}) {
  if (mode === 'split') {
    return (
      <SplitView
        originalUrl={originalUrl}
        colorizedUrl={colorizedUrl}
      />
    );
  }

  return (
    <SliderView
      originalUrl={originalUrl}
      colorizedUrl={colorizedUrl}
    />
  );
}