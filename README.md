# Samarth Thosar — Portfolio ("Signal / Flow")

An Awwwards-level, dark-themed 3D portfolio for Samarth Thosar — AI & full-stack
engineer, systems thinker, No.8 playmaker.

## Concept
**Signal / Flow** — a single morphing WebGL "constellation of disciplines" (AI, full-stack,
product, cognitive science, HCI) that reorganizes from an idea-cloud sphere into a
structured lattice as you scroll. Premium dark palette, one warm amber accent, bold
expressive type, and subtle football / marathon / yoga motifs.

## Stack
- **React + Vite**
- **three / @react-three/fiber / @react-three/drei** — WebGL scene
- **GSAP** (+ ScrollTrigger) — timelines & scroll animation
- **Lenis** — smooth scroll
- Fonts: **Clash Display** + **General Sans** (Fontshare) + **JetBrains Mono**

## Run
```bash
npm install
npm run dev      # local dev server
npm run build    # production build → dist/
npm run preview  # preview the build
```

## Structure
```
src/
  data/links.js        # single source of truth for all links (from the CV)
  lib/lenis.js         # smooth scroll + scroll progress store
  lib/interactions.js  # magnetic buttons + reveal-on-scroll
  three/Scene.jsx      # fixed full-viewport WebGL canvas
  three/SignalObject.jsx  # the morphing constellation (shader points)
  sections/Hero.jsx    # hero section
  App.jsx              # nav + hero + scroll runway + footer
  styles/tokens.css    # design tokens (palette, type, motion)
  styles/global.css    # reset + helpers + grain/vignette
```

## Status — Milestone 1
Hero prototype: hero + morphing object (sphere → lattice). Remaining sections
(About, Work, Projects, Publications, Beyond the screen, Freelance, Contact, hidden
Console) land in later milestones. Real/AI-generated imagery drops into `public/images/`.

## Accessibility & performance
- Full `prefers-reduced-motion` support (smooth scroll + WebGL animation soften/stop).
- Particle count and pixel ratio scale down on small / touch screens.
