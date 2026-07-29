You are a Senior Front-end Engineer and Architect. Your task is to initialize the MVP for a new web application.

# [1. PROJECT CONTEXT & GOALS]

Project Name: EduParty

Description: A gamified, arcade-themed portal for online classes. The Host creates a persistent room, and Players join via a 4-letter PIN. The host selects "game cartridges" to play without the room dropping.

Core Features for MVP:

1. **Persistent Room & Presence:** Room created by Host. Max 6 players per room. Uses a 6-slot Grid "Character Select" UI for the lobby.
2. **Role-Based State Machine:** Host has write permissions (controls the game flow, clicks next, approves/rejects answers). Players are read-only state listeners who only broadcast answers.
3. **First Game (STOP):** Categories game with a timed `TYPING_PHASE` and a subsequent `VALIDATION_PHASE` where the Host judges the 6 players' answers on a single screen.

# [2. MANDATORY TECH STACK & INFRASTRUCTURE]

Frontend Build Tool: Vite
Framework: React (Functional components only)
Language: TypeScript (Strict typing enabled)
Styling: Tailwind CSS
Routing: React Router DOM
Backend/BaaS: Supabase (Postgres JSONB, Realtime Broadcast, Presence, Anonymous Auth)
Deployment Environment: Vercel optimized

_Custom Assets Setup:_ Configure Tailwind to use custom fonts: `Press Start 2P` (for headings/buttons) and `VT323` (for inputs/general text). Color palette includes Deep Black/Slate (`bg-slate-900`/`#111111`), Neon Green (`#39FF14`), Neon Pink (`#FF00FF`), Neon Cyan (`#00FFFF`), Neon Yellow (`#FFFF00`).

# [3. CODE QUALITY & ARCHITECTURE PATTERNS]

Component Style: Always use arrow functions for React components.
Linter & Formatter: ESLint + Prettier.
Strict Linter Rules You MUST configure:

- Maximum file length (max-lines set to 250).
- Strictly ONE React component per file (using eslint-plugin-react rule 'react/no-multi-comp').
  Modularization: Keep components small, highly cohesive, and loosely coupled. Organize by domain/feature, not just technical type.
  State Management: Use a custom hook/Context (`RoomProvider`) as a Finite State Machine (States: LOBBY_IDLE, CONFIGURING_GAME, PLAYING_AD, PLAYING, CALCULATING_SCORES).

# [4. TESTING HARNESS & REQUIREMENTS]

Tools: Vitest and React Testing Library (RTL).
DOM Support: Configure the environment to support DOM testing.
Testing Pattern: Use **Feature-Based Integration Testing**. Do NOT write brittle unit tests for every single UI component.
Strict SDD Protocol: You MUST write the `.spec.tsx` file for the specific **Screen/Feature** FIRST. Test the user behavior and the FSM state transitions (e.g., "When Host clicks Start, state changes to PLAYING"). Only after the behavioral spec is defined, implement the internal React components to satisfy the test.

# [5. EXECUTION PROTOCOL (EXECUTE IN THIS ORDER)]

1. Initialize the Vite project and clear all default boilerplate. Configure for Vercel deployment.
2. Set up ESLint, Prettier, and the strict rules mentioned in section [3]. Setup custom fonts and Arcade color palette in `tailwind.config.js`.
3. Set up the testing harness (Vitest + RTL).
4. Create a scalable folder structure. Use a feature-based approach for the UI: `/src/features` (e.g., `/lobby`, `/gameplay`), alongside `/src/hooks`, `/src/types`, `/src/utils`.
5. Create the initial TypeScript definition files based on the MVP features (e.g., `Player` type, `RoomState` FSM interface).
6. Apply the Strict SDD Protocol: Write the integration specs for the `Lobby` feature FIRST, simulating state transitions.
7. Implement the `AppLayout` component (centered mobile container with lateral ad spaces for desktop) and the Lobby feature to satisfy the specs. Mock data at this stage; do NOT connect to the backend yet.
8. Stop and ask for my feedback on the code structure, linter setup, test output, and initial visual implementation before proceeding to Supabase backend integration.
