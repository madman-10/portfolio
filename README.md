# Portfolio

A personal portfolio site for **Madhav Dhaval Nawab**, built as a single-page React app with per-page theming, GSAP entrance animations, a per-line scramble effect on the About page, and a custom site-wide cursor with a per-page accent halo.

## Tech stack

- **Vite 8** with `@vitejs/plugin-react` — dev server, HMR, production build.
- **React 19** + **React Router 7** — SPA with client-side routing.
- **GSAP 3.15** with **`@gsap/react`** (`useGSAP` hook) — entrance animations.
- **`SplitText`** and **`ScrambleTextPlugin`** — per-line scramble effect on the About page.
- Plain CSS (no framework) — custom properties, per-page theme variants, and a layered cursor/glow system.

## Features

- **Four routes** — Home (`/`), About (`/about`), Projects (`/projects`), Contact (`/contact`). Each renders a full-viewport `.hero` panel with a different background, border, and accent color.
- **Entrance animations** — portrait, heading, and nav links fade/slide in on every route change.
- **Per-line scramble** on the About page — the paragraph is split into per-line overlay spans that scramble through random lowercase glyphs before settling on the final text, following the [GreenSock CodePen pattern](https://codepen.io/GreenSock/pen/jOjaoYJ).
- **Custom site-wide cursor** — a small black/white dot (auto-inverts based on the surface luminance) plus a soft accent-colored ripple that follows the cursor, and a 7-dot trailing tail rendered only on the Home page.
- **Distance-based glow on the heading and nav links** — `--glow-strength` is set on every `pointermove` and ramps up quadratically as the cursor approaches, then fades out as it leaves.
- **Cursor-following glow on nav buttons** — a soft 35%-opacity accent halo that follows the cursor inside each button.
- **Per-page accent** — Home/Contact use blue (`#5b8def`), About uses green (`#2ecc71`), and Projects uses amber (`#F59E0B`). The cursor halo, text glows, and nav hover text all switch to match the page.

## Getting started

### Prerequisites

- Node.js 18 or newer.
- npm (or pnpm / yarn — the lockfile is npm).

### Install

```bash
npm install
```

### Develop

```bash
npm run dev
```

Vite serves the app at the URL printed in the terminal (default `http://localhost:5173`).

### Build

```bash
npm run build
```

Outputs a static bundle to `dist/`. The build is fully self-contained and can be served from any static host.

### Preview the production build

```bash
npm run preview
```

### Lint

```bash
npm run lint
```

Runs ESLint over the source using the flat config in `eslint.config.js`.

## Project structure

```
portfolio/
├── public/                      Static assets served at the site root
│   ├── favicon.svg              Browser tab icon
│   └── icons.svg                 Symbol sprite (bluesky, discord, etc.)
│
├── src/                         Application source
│   ├── main.jsx                 React entry point (BrowserRouter, ThemeProvider, App)
│   ├── App.jsx                  Routes, page components, and the SiteCursor
│   ├── App.css                  All styles (per-page theme variants, cursor, glow)
│   ├── index.css                Minimal global reset / body baseline
│   ├── theme-context.jsx        Theme provider (light/dark) + localStorage persistence
│   ├── use-theme.js             Hook for consuming the theme context
│   └── assets/                  Image assets used by the app
│       ├── rocket_ship.jpg      Hero portrait (referenced from App.jsx)
│       ├── hero.png              (reserved for future use)
│       ├── react.svg             Vite/React boilerplate asset
│       └── vite.svg              Vite boilerplate asset
│
├── index.html                   Vite entry HTML
├── vite.config.js               Vite configuration
├── eslint.config.js             Flat ESLint config (eslint, react-hooks, react-refresh)
├── package.json                 Dependencies and scripts
├── package-lock.json            Locked dependency tree
├── LICENSE                      MIT License (© 2026 Madhav Nawab)
└── README.md                    This file
```

## How the route theming works

Each route renders a `.hero` panel with a modifier class that swaps the page's accent:

| Route | Class | Background | Border | Accent |
| --- | --- | --- | --- | --- |
| `/` | `.hero` | `#ffffff` | `var(--cert-border)` (soft blue) | `#5b8def` blue |
| `/about` | `.hero.hero--about` | `#0a0a0f` | `#2ecc71` | `#2ecc71` green |
| `/projects` | `.hero.hero--projects` | `#0F172A` | `#F59E0B` | `#F59E0B` amber |
| `/contact` | `.hero` | `#ffffff` | `var(--cert-border)` | `#5b8def` blue |

The `SiteCursor` component reads the current route via `useLocation()` and uses a static `ROUTE_ACCENT` map to set the cursor ripple/trail color and the text-glow variables on every route change.

## License

MIT — see [LICENSE](./LICENSE).
