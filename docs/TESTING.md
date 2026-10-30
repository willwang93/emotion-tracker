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
| `src/components/MicroCheckInModal.tsx` | 5-step wizard gate rules (`canProceedStep`), new vs. edit form state initialization (`deriveInitialFormState`), payload construction & trimming (`buildCheckInPayload`) | `src/components/__tests__/MicroCheckInModal.test.ts` | Native Android hardware back button listener & touch gestures |
| `src/components/TimelineCard.tsx` | Timestamp display formatting (`formatCardTime`), note priority resolution (`resolveCardNote`), quadrant headshot resolution (`resolveQuadrantHeadshot`) | `src/components/__tests__/TimelineCard.test.ts` | Native PanResponder swipe-to-delete animation |
| `App.tsx` | Monday-Sunday 7-day calendar ribbon calculation (`getWeekDates`), time-of-day greeting boundaries (`getGreeting`), daily dominant mood dot calculation & tie-breaking (`computeWeekMoodMap`) | `src/components/__tests__/App.test.ts` | Native font loading & top-level React component lifecycle |

## Characterization Backlog
- [x] `src/components/MicroCheckInModal.tsx` — 5-step wizard validation, step transitions, intensity defaults, payload construction (Risk: High, Priority: P1)
- [x] `src/components/TimelineCard.tsx` — Time formatting, quadrant headshot mapping, note resolution (Risk: Medium, Priority: P2)
- [x] `App.tsx` — Calendar day navigation state, greeting logic & dominant mood dot calculation (Risk: Medium, Priority: P2)
- [ ] `src/components/ExportModal.tsx` — Date range preset selection (Today / Last 7 Days / This Month / All Time) (Risk: Low, Priority: P3)

## CI Gates
- `npm test` (Jest unit & characterization test suite must be 100% green across all 5 gated modules: `db.ts`, `export.ts`, `MicroCheckInModal.tsx`, `TimelineCard.tsx`, and `App.tsx`)
- `npx tsc --noEmit` (TypeScript strict mode compilation must have 0 errors)
