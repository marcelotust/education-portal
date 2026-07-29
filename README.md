# EduParty

A gamified, arcade-themed portal for online classes. The **Host** creates a persistent room and
**Players** join with a 4-letter PIN. The Host loads game "cartridges" without ever dropping the
room.

Status: **MVP complete** — a round of STOP plays end to end against a live Supabase project:
create or join by PIN, lobby, ad break, timed typing, Host validation and scoreboard. Open work is
tracked in GitHub issues.

## Stack

Vite · React 19 · strict TypeScript · Tailwind CSS · React Router · Vitest + React Testing Library
· Supabase (Postgres, Realtime, Anonymous Auth) · deployed on Vercel with Web Analytics

## Getting started

Node 22 (see `.nvmrc`; Vite 8 needs 20.19+ or 22.12+).

```bash
npm install
cp .env.example .env.local
```

`.env.local` is gitignored and starts with the Supabase URL already filled in. You still need the
**anon key**: ask a maintainer, or take it from the Supabase dashboard under Project Settings →
API Keys if you have access to the project. It is a public key by design — it ends up in the client
bundle either way — but the `service_role` key must never go in a `VITE_` variable.

```bash
npm run dev
```

Then open `/host` to create a room and `/play` to join one.

### Testing with two players

Two tabs of the same browser share one `localStorage`, therefore one anonymous identity, therefore
**one seat**. Joining your own room from `/play` no longer pretends otherwise: the room row says you
are the Host, so that tab walks back into the Host view instead of seating a second, phantom player.
To have a Host and a Player at the same time, use a private window, another browser, or a second
origin:

```bash
npm run dev -- --host 127.0.0.1 --port 5174   # a different origin, so a separate identity
```

### Working on the database

Schema and the expiry job live in `supabase/migrations/`. Applying them needs access to the
Supabase project and the database password:

```bash
npx supabase login
npx supabase link --project-ref <project-ref>
npx supabase db push
npx supabase gen types typescript --linked --schema public > src/types/supabase.generated.ts
```

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

- `/host` — Host view (flow controls)
- `/play` — Player view (read-only)

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
`RoomProvider` drops them whenever the local participant is a Player, and RLS refuses the write
regardless of what the client sends.

Seats come from Realtime Presence, the FSM from the `rooms` row, and answers from Broadcast. Note
that two tabs of the same browser share one anonymous identity, so testing Host and Player together
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
