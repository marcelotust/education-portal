# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project

EduParty — a gamified, arcade-themed portal for online classes. The **Host** creates a persistent room; **Players** join with a 4-letter PIN. The Host loads game "cartridges" (first one is **STOP**, a categories game) without ever dropping the room.

The vocabulary is deliberate: never "teacher" or "student". Host is a position in a room, not an identity (see `docs/decisions/0003-anyone-can-host.md`), and the Host holds a seat and a score like everyone else. In code the role is `PlayerRole = 'HOST' | 'PLAYER'`.

Status: the MVP in `blueprint.md` is complete and runs against a live Supabase project. A round of STOP plays end to end: create/join by PIN, lobby, ad break, timed typing, Host validation, scoreboard. Open work lives in GitHub issues (landing page with room resume, room expiry, next cartridges).

## Decisions

Contested choices are recorded in `docs/decisions/` — read it before reversing something that looks odd. Notably: why seats, FSM and answers use three different transports; why scores live on the room and not on the player; and why rooms expire after 5 hours.

## Backend model

Two sources of truth, deliberately split:

- **Seats come from Realtime Presence** (`room:PIN` channel, `src/lib/room/presence.ts`) — ephemeral and live. Never persist a seat as authoritative: `buildSlotsFromPresence` rebuilds the whole board on every sync, which is why `scores` live on `RoomState` and not on `Player`.
- **The FSM comes from the `public.rooms` row** (`state` JSONB), pushed to everyone via `postgres_changes`. The Host is the only writer, enforced by RLS (`host_id = auth.uid()`), not just by the UI.
- **Answers travel over Broadcast** (`room-answers:PIN`), never through the table: six Players must not fight over one Host-writable row. The Host consolidates them and persists the result.

Every participant is an **anonymous Supabase user**; the session persists in `localStorage`, so a refresh keeps the same identity and score. Two tabs of the same browser share that identity — to test Host and Player together you need a second origin or a private window.

Schema, RLS and the hourly `pg_cron` sweep that deletes rooms untouched for 5 hours live in `supabase/migrations/`. `findResumableRoom` applies the same 5-hour window on read, so a stale room is never offered no matter when the sweep runs. Regenerate DB types with `npx supabase gen types typescript --linked --schema public` into `src/types/supabase.generated.ts`; `src/types/database.ts` narrows the JSONB column to the FSM state.

## Commands

| Command                           | Purpose                               |
| --------------------------------- | ------------------------------------- |
| `npm run dev`                     | Vite dev server                       |
| `npm run build`                   | `tsc -b` typecheck + production build |
| `npm test`                        | Vitest, single run                    |
| `npm run test:watch`              | Vitest watch mode                     |
| `npm run test:coverage`           | V8 coverage                           |
| `npm run lint` / `lint:fix`       | ESLint                                |
| `npm run format` / `format:check` | Prettier                              |
| `npm run typecheck`               | `tsc -b --noEmit`                     |

Run a single test file: `npx vitest run src/features/lobby/LobbyScreen.spec.tsx`
Filter by name: `npx vitest run -t "Host clicks Start"`

## Working against the live project

`npx supabase db query --linked "select pin, state->>'status' from public.rooms"` reads and writes the
remote database **without the database password** — it is the fastest way to inspect or clean up
state while testing. `npx supabase db push` is different: it connects straight to Postgres and does
prompt for the password, so applying a migration needs whoever holds it.

Driving the app in a browser leaves real rooms behind. Delete them when finished
(`delete from public.rooms`) or they sit there until the expiry sweep runs.

Verifying anything involving two participants needs two origins, because two tabs share one
anonymous identity:

```bash
npm run dev -- --host 127.0.0.1 --port 5174   # Host on :5173, Player on :5174
```

Prettier sorts Tailwind classes, so a scripted find-and-replace against a `className` string will
often silently match nothing. Check that an edit actually landed before believing a measurement of
it.

## Architecture

Room state is a **finite state machine**, the core of the app. Everything hangs off it.

- `src/hooks/roomMachine.ts` — a pure reducer (`roomReducer`). States: `LOBBY_IDLE → CONFIGURING_GAME → PLAYING_AD → PLAYING → CALCULATING_SCORES`, plus `SHOWING_ANSWER`, the reveal a QUIZ match loops back to `PLAYING` from between questions (STOP never enters it). **Invalid transitions return the exact same state object** so React bails out of re-rendering — preserve this when adding cases.
- `src/hooks/RoomProvider.tsx` — wraps the reducer in Context and enforces the role model: **control events are Host-only**. `isHostOnlyEvent` (everything except the presence, remote-state and answer events) is dropped when the local `role` is `PLAYER`. Players are read-only state listeners.
- `src/types/room.ts` — `RoomState`, the `RoomEvent` union (the FSM's alphabet), and `RoomContextValue`. Adding a feature usually means: add an event to the union, handle it in `roomReducer`, and cover the transition in a spec.
- `src/app/RoomRoute.tsx` shows the create/join screen until there is a session, then mounts the provider plus two bridges that render nothing: `RoomPresenceBridge` (seats) and `RoomStateBridge` (FSM). `/host` → `HOST`, `/play` → `PLAYER` (see `src/app/App.tsx`).
- `src/features/room/RoomStage.tsx` maps the FSM status to a screen: lobby, ad break, STOP round, validation, scoreboard.

The board is a **fixed 6-slot array** (`MAX_PLAYERS`); `null` means an open slot. The lobby renders it as a grid, with each seat carrying the session score from `RoomState.scores`.

Directory layout: `src/app` (routing/composition), `src/components` (layout + shared UI), `src/features` (domains: `lobby/`, `room/`, `gameplay/`), `src/hooks` (FSM, context, Realtime hooks), `src/lib` (Supabase client, auth, room data access), `src/types`, `src/utils`, `src/test` (Vitest setup + factories). Import via the `@/` alias (→ `src/`).

## Conventions (enforced by ESLint — see `blueprint.md` §3)

- React components are **always arrow functions**, **one component per file** (`react/no-multi-comp`), max **250 lines** per file (`max-lines`). When a component grows, split it into `components/` subfolders rather than relaxing the rule.
- **Strict SDD**: write the feature/screen `.spec.tsx` **first**, testing user behavior and FSM transitions, then implement components to satisfy it. Prefer feature-based integration tests over brittle per-component unit tests.
- TypeScript is strict (`noUncheckedIndexedAccess`, `exactOptionalPropertyTypes`, inline type-imports required). ESLint uses `recommendedTypeChecked` — keep types clean, not just non-erroring.
- All project text — source, UI copy, docs, commit messages — is in **English**.

## Styling

Tailwind with an arcade theme (`tailwind.config.js`): fonts `font-arcade` (Press Start 2P, for headings/buttons) and `font-terminal` (VT323, for inputs/text); `arcade.{black,green,pink,cyan,yellow}` colors; `shadow-neon` and `animate-blink`. Deployed on Vercel (`vercel.json` rewrites all routes to `index.html` for the SPA).
