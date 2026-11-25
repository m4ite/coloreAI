import { prefersReducedMotion } from './logoMotion';

// Em memória: volta a tocar a cada refresh e após logout (resetIntro),
// mas não ao alternar entre as telas de login e cadastro.
let played = false;

export function shouldPlayIntro() {
  return !played && !prefersReducedMotion();
}

export function markIntroPlayed() {
  played = true;
}

export function resetIntro() {
  played = false;
}
