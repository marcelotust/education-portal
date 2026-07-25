# Decision log

Short records of choices that were genuinely contested — where a reasonable
person would have picked differently, and where the reasoning is not visible
from the code alone.

The point is not ceremony. It is so that six months from now nobody re-litigates
a settled question, and nobody "fixes" something that was deliberate.

One file per decision, numbered. A decision that gets reversed is not deleted:
its record is marked superseded and the new one links back to it.

| #                                    | Decision                                                       | Status   |
| ------------------------------------ | -------------------------------------------------------------- | -------- |
| [0001](0001-room-state-transport.md) | Seats from Presence, FSM from the row, answers from Broadcast  | Accepted |
| [0002](0002-scores-live-on-room.md)  | Scores live on the room, not on the player                     | Accepted |
| [0003](0003-anyone-can-host.md)      | Anyone can host, and the Host is player 1 of 6                 | Accepted |
| [0004](0004-room-expiry.md)          | Rooms expire after 5 hours, swept hourly                       | Accepted |
| [0005](0005-cartridge-shape.md)      | Cartridges are a discriminated union, not a shared round shape | Accepted |
