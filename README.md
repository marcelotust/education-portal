# EduParty

A gamified, arcade-themed portal for online classes. The teacher (Host) creates a persistent room
and students (Clients) join with a 4-letter PIN. The Host loads game "cartridges" without ever
dropping the room.

Status: **MVP complete** — a round of STOP plays end to end against a live Supabase project:
create or join by PIN, lobby, ad break, timed typing, Host validation and scoreboard. Open work is
tracked in GitHub issues.

## Stack

Vite · React 19 · strict TypeScript · Tailwind CSS · React Router · Vitest + React Testing Library
· Supabase (Postgres, Realtime, Anonymous Auth) · deployed on Vercel with Web Analytics

## Scripts

| Command                 | What it does                            |
| ----------------------- | --------------------------------------- |
| `npm run dev`           | Development server (Vite)               |
| `npm run build`         | Typecheck (`tsc -b`) + production build |
| `npm run preview`       | Serves the production build locally     |
| `npm test`              | Vitest suite (single run)               |
| `npm run test:watch`    | Vitest in watch mode                    |
| `npm run test:coverage` | V8 coverage report                      |
| `npm run lint`          | ESLint                                  |
| `npm run format`        | Prettier                                |

## Routes

- `/host` — teacher view (flow controls)
- `/play` — student view (read-only)

## Architecture

```
src/
  app/          routing and screen composition
  components/   layout (AppLayout, AdSlot) and shared UI
  features/     domains: lobby/, room/, gameplay/
  hooks/        RoomProvider, room state machine, Realtime hooks
  lib/          Supabase client, anonymous auth, room data access
  types/        contracts (Player, RoomState, RoomEvent, STOP)
  utils/        pure helpers
  test/         Vitest setup and mock factories
```

Room state is a finite state machine (`LOBBY_IDLE → CONFIGURING_GAME → PLAYING_AD → PLAYING →
CALCULATING_SCORES`) living in `src/hooks/roomMachine.ts`. Flow-control events are Host-only: the
`RoomProvider` drops them whenever the local participant is a Client, and RLS refuses the write
regardless of what the client sends.

Seats come from Realtime Presence, the FSM from the `rooms` row, and answers from Broadcast. Note
that two tabs of the same browser share one anonymous identity, so testing Host and Client together
needs a second origin or a private window.

## Decisions

Choices that were genuinely contested are recorded in [`docs/decisions/`](docs/decisions/), so a
reader does not have to reverse-engineer the reasoning from the code.

## Conventions

- React components are always arrow functions, **one component per file**
  (`react/no-multi-comp`), with a 250-line ceiling per file (`max-lines`).
- Feature-based integration tests (SDD): the screen `.spec.tsx` is written before the
  implementation.
- All project text — source, UI copy, docs and commit messages — is written in English.
