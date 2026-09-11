# Portfolio

A high-performance personal portfolio for **Madhav Dhaval Nawab**, featuring a single-page React architecture with dynamic per-page theming, GSAP-powered animations, and a custom interactive cursor system.

## Tech Stack

- **Frontend:** React 19, React Router 7, Vite 8
- **Animations:** GSAP 3.15 (`@gsap/react`, `SplitText`, `ScrambleTextPlugin`)
- **Styling:** Plain CSS with custom properties and theme variants

## Key Features

- **Dynamic Theming:** Each route (`/`, `/about`, `/projects`, `/contact`) triggers a full-viewport theme shift affecting background colors, borders, and accent highlights.
- **Interactive Cursor:** A site-wide custom cursor with an auto-inverting dot, a route-specific accent halo, and a trailing tail effect on the Home page.
- **Advanced Animations:** 
  - Coordinated entrance animations for typography and imagery on every route change.
  - A per-line scramble text effect on the About page.
  - Distance-based quadratic glow effects on headings and navigation links.

## Getting Started

### Installation & Development

```bash
npm install
npm run dev
```

### Production Build

```bash
npm run build
npm run preview
```

## Project Structure

```
src/
├── components/    Reusable UI (Nav, SiteCursor, Hero components)
├── pages/        Route-specific views (Home, About, Projects, Contact)
├── assets/       Static imagery and icons
├── App.jsx       Routing and layout configuration
└── App.css       Global styles and theme definitions
```

## Route Theme Map

| Route | Background | Accent |
| --- | --- | --- |
| `/` | `#ffffff` | `#5b8def` (Blue) |
| `/about` | `#0F172A` | `#F59E0B` (Amber) |
| `/projects` | `#0a0a0f` | `#2ecc71` (Green) |
| `/contact` | `#ffffff` | `#5b8def` (Blue) |
