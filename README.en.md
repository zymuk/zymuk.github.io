# Zymuk Page

> **English** | [Tiếng Việt](README.md)

> A personal portfolio plus a suite of online tools by **Trần Thế Ngọc** (QA Engineer), running entirely client-side (static SPA), deployed on **GitHub Pages**.

Zymuk Page is a single-page application (SPA) built with **React 19** and **Create React App**. It works both as an online CV/portfolio and as a collection of everyday utilities (calculator, notes, encoding, save web, numerology, and more). The key point: **there is no backend at all** — data is managed via `localStorage` and static JSON files in the `public/` folder, alongside an integrated admin panel to edit content.

## Key Features

| Area | Path | Description |
|---|---|---|
| **Public page** | `/` | 10 sections: Hero, About (typewriter effect), Experience (timeline), Education, Certifications, Skills, Projects, Features, Animations, Contact — full-screen slide scrolling (scroll-snap) with a floating theme switcher at the bottom-left (Default/Midnight/Sunset change the background color; Harvard Clean redesigns everything into an academic résumé style) |
| **Tools** | `/features/calculator`, `/features/notes`, `/features/numerology-name`, `/features/text-encoder-decoder`, `/features/save-web`, `/features/encrypt-decrypt`, `/features/json-formatter`, `/features/reminders`, `/features/image-editor` | Scientific calculator, rich-text notes, numerology, URL encoding, bookmark manager, text encrypt/decrypt, JSON format/validate, reminders, **white-background removal + image cropping** |
| **Animations** | `/animations`, `/animations/dragon-cursor`, `/animations/generative-lines`, `/animations/lightbeams`, `/animations/blend-overlay`, `/animations/aizawa-attractor`, `/animations/explosive-attraction`, `/animations/3d-rowing-boat`, `/animations/not-comets`, `/animations/fireworks`, `/animations/celestial-transmutation`, `/animations/fly-in-cave` | Eleven animation demos embedded directly into the codebase: an SVG dragon that follows the cursor (Dragon Cursor), generative line art on canvas, glowing particle text beams (Lightbeams), a background image plus a continuously shifting color overlay using CSS `mix-blend-mode` (Blend Overlay), a holographic 3D Aizawa attractor built with Three.js (Aizawa Attractor), a particle explosion that scatters and attracts back to the cursor (Explosive Attraction), a 3D rowing boat gliding across animated water with a rowing figure, moving oars, lily pads, a wake and water ripples (3D Rowing Boat), a drifting starfield around a glowing crystal terrain with self-growing comet trails rendered on plain Canvas 2D (Not Comets), a WebGL fireworks show with point-particle bursts exploding over a rippling wireframe ground, auto-launching forever (Fireworks), a WebGL scene where the eight planets of the solar system, surfaced with real planetary maps (Solar System Scope / NASA, CC BY 4.0), morph into one another through a phase-surge scan, with per-planet facts and spin, a true-size toggle, orbital controls, bloom and auto-cycling (Celestial Transmutation), and a 3D cave flight simulation: terrain tunnel generated from noise with dynamic lighting and adjustable speed (Fly In Cave) |
| **Admin Panel** | `/admin/...` | Dashboard, per-section CRUD, user management (Users CRUD), homepage settings (color/title/image), EN/VI language switch, JSON data export |

## Technologies Used

- **React 19** + **ReactDOM 19** with `StrictMode`
- **React Router DOM v7** (`react-router-dom@^7.4.0`) — uses `BrowserRouter` with clean URLs (no `#`) for better SEO, combined with a `404.html` file for the static GitHub Pages host
- **Create React App 5** (`react-scripts@^5.0.1`)
- **Font Awesome 6** (via CDN in `public/index.html`)
- **cross-env** (synchronizes environment variables on Windows)
- **gh-pages** (deploys the build to GitHub Pages)
- **Jest + React Testing Library** — automated test suite
- **Web Crypto API**, `localStorage`, `navigator.clipboard`, **Canvas 2D API**, **SVG animation**, **CSS `mix-blend-mode`**, **WebGL (Three.js)** — browser Web APIs/techniques

## Quick Start

Requirements: **Node.js ≥ 16** and **Yarn 1.x** (or npm).

```bash
# 1. Install dependencies
yarn install

# 2. Run development (http://localhost:3000)
yarn start

# 3. Build production into the build/ folder
yarn build

# 4. Run the test suite
yarn test --watchAll=false
```

## Testing

The project ships with an automated test suite written in **Jest + React Testing Library**, located in the `test/` folder (mirroring the `src/` tree). The tests cover the most logic-heavy parts: the tools (calculator, 16-algorithm encoder, notes, save web, numerology, JSON formatter...), the `localStorage` ↔ JSON file data flow, and the admin panel (login, user CRUD, data export). Current status: **all tests pass**.

## Notes & Known Limitations

Documentation is honest about the current state of the code. During analysis I found a few points worth noting:

- **Animations are web-sourced demos embedded directly into the codebase** — all the code (SVG dragon, generative lines, lightbeams, CSS blend overlay, Aizawa attractor, particle burst, 3D rowing boat, comets, fireworks, planets, cave flight) lives under `src/site/pages/animations/`, runs 100% client-side, and calls no runtime CDN. Note: several CodeTap demos claim to be Three.js but are really pure CSS or Canvas 2D (Blend Overlay, Explosive Attraction, Not Comets) — the port keeps them, only dropping external assets; Aizawa Attractor, 3D Rowing Boat, Fireworks, Celestial Transmutation and Fly In Cave **really use Three.js**, so `three@0.160` is added to the dependencies, GSAP is replaced with plain JS/CSS, dat.GUI/simplex-noise/Google Fonts are removed, each page is ported to React and cleans up resources (requestAnimationFrame, listeners) on unmount. Celestial Transmutation stands apart from the template: a dot-arc planet picker, real fact lines (diameter, moons, spin, orbit), per-planet surface spin at true relative speeds, and a toggle that shows planets at their true relative sizes while the camera re-frames itself.
- **Admin authentication is only simulated** — the session uses a random 128-bit token that expires after 24h (`src/utils/auth.js`), but the password is still plaintext in `public/data.json` and anyone can set their own token via DevTools; do not use it for sensitive data.
- **The Contact form works via `mailto:`** — the Send button opens the email client with pre-filled content (no backend, nothing is sent over the web).
- **Reminders use a best-effort timer** — when the tab is closed, the Service Worker only sends OS notifications at the correct relative time; for absolutely accurate reminders while the browser is closed you would need Web Push + a server (GitHub Pages is static and cannot host one).
- **i18n only applies to the admin panel** — the public page uses hard-coded English/Vietnamese content from the config JSON.

## License

© 2025 Zymuk Trần — All rights reserved.