// Filename is a holdover from a retired scroll-driven concept that used the
// Lenis smooth-scroll library; this is the only export that survived, and the
// game's store.js is its one live consumer.
export const prefersReducedMotion = () =>
  typeof window !== 'undefined' &&
  window.matchMedia('(prefers-reduced-motion: reduce)').matches
