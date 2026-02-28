# vibe-client — Browser Client for the Vibe Platform

**Type**: Browser Application | **Port**: 5173 (dev) / 30107 (deployed) | **Stack**: React 19, Phaser 3, TypeScript strict, Vite, Zustand

## What This Is

The browser-side experience of the Vibe Platform. Users open a URL, enter a 2D spatial environment (the Vibe Cafe), see each other as avatars, chat, and see speech bubbles from voice transcription. React handles UI overlays; Phaser handles the spatial canvas.

## Architecture

```
React 19 (UI layer)
  ├── Identity flow (name + avatar photo)
  ├── Chat panel (React overlay)
  ├── Mute toggle, presence list
  └── Zustand state management

Phaser 3 (spatial layer)
  ├── 2D scene with background image
  ├── Avatar rendering (profile photo circles)
  ├── Movement (WASD/arrows)
  ├── Zone boundaries
  └── Speech bubbles

WebSocket (vibe-server connection)
  ├── MessagePack encoding
  ├── Position updates (5-10 Hz)
  ├── Chat messages
  ├── Audio chunks → transcription → speech bubbles
  └── Zone join/leave
```

## Quality Gates

```bash
pnpm run typecheck    # TypeScript strict
pnpm run lint         # ESLint 10 + Prettier
pnpm run test         # Vitest + jsdom
pnpm audit --audit-level=high
```

## Key Files

| File | Purpose |
|------|---------|
| `src/App.tsx` | Root component |
| `src/main.tsx` | Entry point |
| `eslint.config.js` | ESLint 10 flat config |
| `vitest.config.ts` | Test config (jsdom) |
| `vite.config.ts` | Build + dev server |

## Development

```bash
pnpm dev              # Dev server at :5173
pnpm build            # Production build
pnpm test             # Run tests
pnpm lint:fix         # Auto-fix lint + format
```

## Conventions

- **TypeScript strict** with `noUncheckedIndexedAccess`
- **React 19** — function components, hooks only
- **Phaser 3.90** — Canvas/WebGL rendering (Phaser 4 RC6 available but not yet stable)
- **Zustand** for state management (no Redux)
- **Co-located tests** — `*.test.tsx` next to source files
- **husky + lint-staged** pre-commit hooks
