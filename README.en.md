# Zymuk Page

> **English** | [Tiếng Việt](README.md)

> A personal portfolio plus a suite of online tools by **Trần Thế Ngọc** (QA Engineer), running entirely client-side (static SPA), deployed on **GitHub Pages**.

Zymuk Page is a single-page application (SPA) built with **React 19** and **Create React App**. It works both as an online CV/portfolio and as a collection of everyday utilities (calculator, notes, encoding, save web, numerology, and more). The key point: **there is no backend at all** — data is managed via `localStorage` and static JSON files in the `public/` folder, alongside an integrated admin panel to edit content.

## Key Features

| Area | Path | Description |
|---|---|---|
| **Public page** | `/` | 10 sections: Hero, About (typewriter effect), Experience (timeline), Education, Certifications, Skills, Projects, Features, Animations, Contact — full-screen slide scrolling (scroll-snap) with a floating theme switcher at the bottom-left (Default/Midnight/Sunset change the background color; Harvard Clean redesigns everything into an academic résumé style) |
| **Tools** | `/features/calculator`, `/features/notes`, `/features/numerology-name`, `/features/text-encoder-decoder`, `/features/save-web`, `/features/encrypt-decrypt`, `/features/json-formatter`, `/features/reminders`, `/features/image-editor` | Scientific calculator, rich-text notes, numerology, URL encoding, bookmark manager, text encrypt/decrypt, JSON format/validate, reminders, **white-background removal + image cropping** |
| **Animations** | `/animations`, `/animations/dragon-cursor`, `/animations/generative-lines`, `/animations/lightbeams`, `/animations/blend-overlay`, `/animations/aizawa-attractor`, `/animations/explosive-attraction` | Six animation demos embedded directly into the codebase: an SVG dragon that follows the cursor (Dragon Cursor), generative line art on canvas, glowing particle text beams (Lightbeams), a background image plus a continuously shifting color overlay using CSS `mix-blend-mode` (Blend Overlay), a holographic 3D Aizawa attractor built with Three.js (Aizawa Attractor), and a particle explosion that scatters and attracts back to the cursor (Explosive Attraction) |
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

- **Animations are web-sourced demos embedded directly into the codebase** — the source code (SVG dragon following the cursor, generative lines, lightbeams, the CSS `mix-blend-mode` snippet from the "threejs-interactive-web-project-13" demo, the Aizawa attractor Three.js demo, and the particle burst from the "explosive-attraction-threejs-animation" demo) is left untouched in `src/site/pages/animations/`, runs 100% client-side, and does not call any runtime CDN. Note: CodeTap's project-13 demo claims to be Three.js, but the actual source **is only CSS** (background image + color-blend overlay animated via keyframes) — this port keeps that spirit, with the background image stored locally in `public/` instead of an external URL. Likewise, the "explosive-attraction-threejs-animation" demo also claims Three.js but the real source **is plain Canvas 2D** (200 particles that chase the cursor, burst apart near the center point, and leave fading trails via a translucent `fillRect`) — the port keeps it, only switching from `window.inner*` coordinates to the stage size. In contrast, the "3d-aizawa-attractor-threejs" demo **really uses Three.js**, so `three` is added to `package.json`; the intro tweens that originally used GSAP are replaced with plain JS + CSS, and the Google Fonts are dropped to keep the page offline-safe.
- **Admin authentication is only simulated** — the session uses a random 128-bit token that expires after 24h (`src/utils/auth.js`), but the password is still plaintext in `public/data.json` and anyone can set their own token via DevTools; do not use it for sensitive data.
- **The Contact form works via `mailto:`** — the Send button opens the email client with pre-filled content (no backend, nothing is sent over the web).
- **Reminders use a best-effort timer** — when the tab is closed, the Service Worker only sends OS notifications at the correct relative time; for absolutely accurate reminders while the browser is closed you would need Web Push + a server (GitHub Pages is static and cannot host one).
- **i18n only applies to the admin panel** — the public page uses hard-coded English/Vietnamese content from the config JSON.

## License

© 2025 Zymuk Trần — All rights reserved.