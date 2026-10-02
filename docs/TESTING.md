# Testing

## Test Strategy
- Unit & Characterization testing using Jest + `ts-jest` for TypeScript.
- "Green" gates all pull requests, code edits, and refactorings before deployment to the Google Pixel 5 Android build.
- Test runner executes in Node.js environment with native Expo plugins mocked at boundaries.

## Safety Net Map
| Module | Pinned behaviors | Test files | Gaps |
|---|---|---|---|
| `src/services/db.ts` | Table creation (WAL mode), check-in insertion & parameter serialization, updates, deserialization from raw SQL rows to CheckIn domain entities, single day / date range / month queries, deletion | `src/services/__tests__/db.test.ts` | Corrupted JSON in SQLite rows (syntax error handling), DST 23h/25h boundary discrepancy |
| `src/services/export.ts` | Semantic Markdown generation, empty list handling, ascending timestamp sorting, full metadata rendering | `src/services/__tests__/export.test.ts` | File system writing error recovery (native Share fallback) |

## Characterization Backlog
- [ ] `src/components/MicroCheckInModal.tsx` — 5-step wizard validation, step transitions, intensity slider (Risk: High, Priority: P1)
- [ ] `src/components/TimelineCard.tsx` — Time formatting, quadrant color accenting, empty notes collapsing (Risk: Medium, Priority: P2)
- [ ] `App.tsx` — Calendar day navigation state & month query triggers (Risk: Medium, Priority: P2)

## CI Gates
- `npm test` (Jest unit & characterization test suite must be 100% green)
- `npx tsc --noEmit` (TypeScript strict mode compilation must have 0 errors)
