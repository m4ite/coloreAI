import { useId } from 'react';
import {
  R, GAP, P1, P2, ART_ORIGIN, ART_SIZE, FRAME_INSET, FRAME_SIZE, VIEWBOX,
} from './logoMotion';

const ART_TO_FRAME =
  `translate(${FRAME_INSET} ${FRAME_INSET}) scale(${FRAME_SIZE / ART_SIZE}) translate(${-ART_ORIGIN} ${-ART_ORIGIN})`;

// Logo com volume. Os círculos podem ser movidos quadro a quadro (ver createLogoDrawer).
// Os PNGs em public/ são gerados a partir deste desenho: se as cores mudarem, gere-os de novo.
export default function LogoSvg({ ref, className }) {
  const id = `logo${useId()}`;
  const u = (name) => `url(#${id}-${name})`;

  return (
    <svg ref={ref} className={className} viewBox={VIEWBOX} width="100%" height="100%" overflow="visible" aria-hidden="true">
      <defs>
        <linearGradient id={`${id}-gb`} x1="195" y1="195" x2="695" y2="695" gradientUnits="userSpaceOnUse">
          <stop offset="0" stopColor="#E4E4E7" />
          <stop offset=".45" stopColor="#A1A1AA" />
          <stop offset="1" stopColor="#52525B" />
        </linearGradient>

        {/* var() só funciona via style, não no atributo stopColor */}
        <linearGradient id={`${id}-gf`} x1="840" y1="400" x2="470" y2="880" gradientUnits="userSpaceOnUse">
          <stop offset="0" style={{ stopColor: 'var(--color-accent-light)' }} />
          <stop offset=".45" style={{ stopColor: 'var(--color-accent)' }} />
          <stop offset=".8" stopColor="#6D28D9" />
          <stop offset="1" stopColor="#EC4899" />
        </linearGradient>

        <linearGradient id={`${id}-gl`} x1="420" y1="420" x2="660" y2="660" gradientUnits="userSpaceOnUse">
          <stop offset="0" stopColor="#DDD6FE" />
          <stop offset=".5" stopColor="#F5D0FE" />
          <stop offset="1" stopColor="#A5F3FC" />
        </linearGradient>

        {/* volume: relevo, luz difusa, brilho (.35), halo (20%) e sombra (30%) */}
        <filter id={`${id}-soft`} x="-40%" y="-40%" width="180%" height="180%" colorInterpolationFilters="sRGB">
          <feGaussianBlur in="SourceAlpha" stdDeviation="4" result="b" />
          <feDiffuseLighting in="b" surfaceScale="3" diffuseConstant="1.04" lightingColor="#fff" result="d">
            <feDistantLight azimuth="225" elevation="60" />
          </feDiffuseLighting>
          <feComposite in="SourceGraphic" in2="d" operator="arithmetic" k1="1" k2="0.1" k3="0" k4="0" result="lit" />
          <feComposite in="lit" in2="SourceAlpha" operator="in" result="litIn" />
          <feSpecularLighting in="b" surfaceScale="3" specularConstant=".5" specularExponent="18" lightingColor="#fff" result="s">
            <fePointLight x="24" y="14" z="80" />
          </feSpecularLighting>
          <feComposite in="s" in2="SourceAlpha" operator="in" result="sIn" />
          <feComposite in="sIn" in2="litIn" operator="arithmetic" k1="0" k2=".35" k3="1" k4="0" result="gl2" />
          <feGaussianBlur in="SourceGraphic" stdDeviation="6" result="g0" />
          <feComponentTransfer in="g0" result="glow">
            <feFuncA type="linear" slope=".2" />
          </feComponentTransfer>
          <feGaussianBlur in="SourceAlpha" stdDeviation="4" result="sb" />
          <feOffset in="sb" dy="4" result="so" />
          <feFlood floodColor="#000" floodOpacity=".3" />
          <feComposite in2="so" operator="in" result="sh" />
          <feMerge>
            <feMergeNode in="glow" />
            <feMergeNode in="sh" />
            <feMergeNode in="gl2" />
          </feMerge>
        </filter>

        {/* máscaras grandes para valerem com os círculos em movimento */}
        <mask id={`${id}-mb`} maskUnits="userSpaceOnUse" x="-3000" y="-3000" width="7000" height="7000">
          <rect x="-3000" y="-3000" width="7000" height="7000" fill="#fff" />
          <circle data-el="maskBack" cx={P2[0]} cy={P2[1]} r={R + GAP} fill="#000" />
        </mask>
        <mask id={`${id}-mf`} maskUnits="userSpaceOnUse" x="-3000" y="-3000" width="7000" height="7000">
          <rect x="-3000" y="-3000" width="7000" height="7000" fill="#fff" />
          <circle data-el="maskFront" cx={P1[0]} cy={P1[1]} r={R + GAP} fill="#000" />
        </mask>
        <clipPath id={`${id}-cl`}>
          <circle data-el="clipLens" cx={P1[0]} cy={P1[1]} r={R - GAP} />
        </clipPath>
      </defs>

      <g filter={u('soft')}>
        <g transform={ART_TO_FRAME}>
          <g data-el="root">
            <circle data-el="back" cx={P1[0]} cy={P1[1]} r={R} fill={u('gb')} mask={u('mb')} />
            <circle data-el="front" cx={P2[0]} cy={P2[1]} r={R} fill={u('gf')} mask={u('mf')} />
            <circle data-el="lens" cx={P2[0]} cy={P2[1]} r={R - GAP} fill={u('gl')} clipPath={u('cl')} />
          </g>
        </g>
      </g>
    </svg>
  );
}
