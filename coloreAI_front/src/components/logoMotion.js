// Geometria e movimento do logo animado. Coordenadas do desenho original (viewBox do favicon).
export const ART_ORIGIN = 180;
export const ART_SIZE = 720;

// O desenho ocupa 4..96 de um quadro 0..100; a margem do viewBox é para a sombra do filtro.
export const FRAME_INSET = 4;
export const FRAME_SIZE = 92;
export const VIEWBOX = '-10 -10 120 120';

export const R = 250;
export const GAP = 20;
export const P1 = [445, 445]; // círculo prata (atrás)
export const P2 = [635, 635]; // círculo colorido (frente)
const MID = [(P1[0] + P2[0]) / 2, (P1[1] + P2[1]) / 2];

const clamp = (v) => Math.min(1, Math.max(0, v));
const seg = (t, a, b) => clamp((t - a) / (b - a));
const easeOutBack = (p) => 1 + 2.7 * (p - 1) ** 3 + 1.7 * (p - 1) ** 2;
const easeOutCubic = (p) => 1 - (1 - p) ** 3;
const lerp = (a, b, t) => [a[0] + (b[0] - a[0]) * t, a[1] + (b[1] - a[1]) * t];

// "Divisão": a esfera no centro se separa nos dois círculos.
export const SPLIT_MS = 2000;

export function splitState(t) {
  const e = easeOutBack(seg(t, 0.1 * SPLIT_MS, SPLIT_MS));
  return {
    p1: lerp(MID, P1, e),
    p2: lerp(MID, P2, e),
    scale: 0.9 + 0.1 * easeOutCubic(seg(t, 0, 0.4 * SPLIT_MS)),
    alpha: easeOutCubic(seg(t, 0, 0.25 * SPLIT_MS)),
  };
}

// Altera os atributos do SVG de LogoSvg direto, sem setState, para não re-renderizar a cada quadro.
export function createLogoDrawer(svg) {
  const q = (name) => svg.querySelector(`[data-el="${name}"]`);
  const el = {
    root: q('root'), back: q('back'), front: q('front'), lens: q('lens'),
    maskBack: q('maskBack'), maskFront: q('maskFront'), clipLens: q('clipLens'),
  };
  const setCenter = (node, p) => {
    node.setAttribute('cx', p[0].toFixed(2));
    node.setAttribute('cy', p[1].toFixed(2));
  };

  return function draw({ p1 = P1, p2 = P2, scale = 1, alpha = 1 }) {
    setCenter(el.back, p1); setCenter(el.maskFront, p1); setCenter(el.clipLens, p1);
    setCenter(el.front, p2); setCenter(el.maskBack, p2); setCenter(el.lens, p2);
    el.root.setAttribute(
      'transform',
      `translate(${MID[0]} ${MID[1]}) scale(${scale.toFixed(4)}) translate(${-MID[0]} ${-MID[1]})`,
    );
    el.root.setAttribute('opacity', alpha.toFixed(3));
  };
}

export const prefersReducedMotion = () =>
  Boolean(window.matchMedia?.('(prefers-reduced-motion: reduce)').matches);
