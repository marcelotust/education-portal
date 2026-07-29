# 0003 — Anyone can host, and the Host is player 1 of 6

**Status:** Accepted — 2026-07-24

## Context

The blueprint originally described the Host as "the teacher" and the room as
holding six players, which reads as a teacher supervising six students — seven
people. (That wording is what this ADR argued against; it was removed from the
blueprint later — see the note at the end.)

## Decision

There is no teacher account and no privileged role: **anyone who opens `/host`
creates a room**, and whoever creates it **takes seat 1 of the 6** and plays.
So a full room is the Host plus five others.

"Host" is a position in a room, not an identity: it is whoever owns that row.

## Consequences

- In STOP, the Host judges answers that include their own. Acceptable for a
  classroom party game — the same trade-off Jackbox-style games make — but it is
  a real conflict of interest, not an oversight.
- The role is decided by `rooms.host_id`, never by what a client claims. A
  Client that forges `role: 'HOST'` in its presence payload is still rendered
  and treated as a Client, and RLS refuses its writes regardless. There is a
  test for exactly this.
- With no accounts, a Host who loses their `localStorage` loses the room for
  good — nobody can take it over. See
  [#1](https://github.com/marcelotust/education-portal/issues/1).

## Update — 2026-07-29

This decision was only half-applied: the model dropped the teacher, but every
screen and document kept saying "teacher" and "student". The vocabulary is now
settled as **Host** and **Player** everywhere, and the role literal `'CLIENT'`
became `'PLAYER'` — so read "Client" above as "Player". See
[#23](https://github.com/marcelotust/education-portal/issues/23).

The reasoning above is left as written, including the quoted "teacher" wording:
it is the record of what was argued and why.
