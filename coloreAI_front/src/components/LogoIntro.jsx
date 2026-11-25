import { useEffect, useEffectEvent, useRef } from 'react';
import LogoSvg from './LogoSvg';
import { createLogoDrawer, splitState, SPLIT_MS } from './logoMotion';
import { markIntroPlayed } from './logoIntroState';

// Abertura do login: a esfera se divide no logo, no próprio lugar e tamanho dele.
export default function LogoIntro({ style, onDone }) {
  const svgRef = useRef(null);
  const finish = useEffectEvent(() => onDone());

  useEffect(() => {
    markIntroPlayed();
    const draw = createLogoDrawer(svgRef.current);
    const t0 = performance.now();
    let raf = 0;

    const tick = (now) => {
      const t = now - t0;
      draw(splitState(t));
      if (t < SPLIT_MS) raf = requestAnimationFrame(tick);
      else finish();
    };
    raf = requestAnimationFrame(tick);

    return () => cancelAnimationFrame(raf);
  }, []);

  return (
    <span className="block shrink-0" style={style} aria-hidden="true">
      <LogoSvg ref={svgRef} />
    </span>
  );
}
