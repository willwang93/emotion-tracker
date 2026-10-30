# Technical Debt

## Debt Ledger
| Item | Location | Type | Risk | Effort | Priority | Status |
|---|---|---|---|---|---|---|
| Corrupted JSON crash in row mapper | `src/services/db.ts:92-94` | Resilience | High | Low | P1 | Fixed & Verified (test in `db.test.ts`) |
| Daylight Saving Time 24-hr day boundary math | `src/services/db.ts:183` | Correctness | Low | Low | P2 | Fixed & Verified |
| Silent failure on non-existent ID update/delete | `src/services/db.ts:131,208` | Error Handling | Low | Low | P3 | Open |
| Native file share fallback lacks error reporting | `src/services/export.ts:141` | Observability | Low | Low | P3 | Open |
| Daily mood dot tie-breaker picks earliest entry instead of most recent entry (`entries[entries.length - 1]` on DESC list) | `App.tsx:76` | Product Quirk | Low | Low | P3 | Fixed & Verified (test in `App.test.ts`) |
| Creating a new entry while viewing a past day saves to Today and resets calendar to Today | `App.tsx:136-138` | Product Quirk | Low | Low | P3 | Closed (By Design — confirmed with PM) |
| Editing a legacy entry migrates `urgeNote` into `triggerNote` and drops `urgeNote` | `src/components/MicroCheckInModal.tsx:188-190` | Data Compatibility | Low | Low | P3 | Open |

## Smell Inventory
| Smell | Location | Refactoring | Status |
|---|---|---|---|
| Duplicated parameter serialization across insert and update | `src/services/db.ts:187-200,224-237` | Extract Method (`serializeCheckInFields`) | Done |
| Magic default literals ('green', 5, 'Peaceful') | `src/services/db.ts:127-131` | Replace Magic Literal with Symbolic Constant | Done |
| Untyped raw row mapping (`row: any`) | `src/services/db.ts:159` | Introduce Type Interface (`RawCheckInRow`) | Done |
| Magic numbers in UI & wizard logic (`7`, `8`, `3`, `12`, `17`, `[[1..5],[6..10]]`) | `MicroCheckInModal.tsx`, `App.tsx` | Replace Magic Number with Symbolic Constant (`DEFAULT_INTENSITY`, `HIGH_QUADRANT_SCORE`, `MORNING_END_HOUR`, etc.) | Done |
| Monolithic 300-line multi-step JSX render block | `src/components/MicroCheckInModal.tsx:312-547` | Extract Method (`renderStep1QuadrantPicker` .. `renderStep5ReflectionNote`) | Done |
| Raw `TextInput` bypassing design-system primitive in Step 5 | `src/components/MicroCheckInModal.tsx:537` | Substitute Component with UI Primitive (`AppTextInput`) | Done |
| Information leakage: UI screen (`App.tsx`) managing DB connection warming | `App.tsx:69` | Encapsulate connection management inside deep service functions | Done |
| Module depth: `src/services/export.ts` formatting and share coordination | `src/services/export.ts` | Kept consolidated (formatting + share orchestration without shallow wrappers) | Verified Deep |
| Global state pollution (`globalThis.__app_sqlite_*`) | `src/services/db.ts:7-10` | Encapsulate in dedicated DB connection manager | Planned |
| Catch-all retry loops for non-connection errors | `src/services/db.ts:50` | Filter retries strictly for dead connection errors | Planned |
| Silent non-operation on non-existent ID | `src/services/db.ts:131,208` | Return boolean result indicating rows modified | Planned |

## Sprout / Wrap Register
Code added beside legacy (to fold back in later).

## Debt Budget & Broken-Windows Policy
- **15–20% Capacity Budget:** Every feature cycle reserves 15% to 20% of capacity for tech debt reduction and test maintenance. P1 risks must be resolved before adding new features to an affected module.
- **Zero Untracked Hacks ("Broken Windows"):** No `// TODO` or temporary workaround may exist in production code without being logged in the `Debt Ledger` with an owner, priority, and risk assessment.
- **Single Source of Truth (DRY):** Emotion taxonomy and quadrant types must strictly reference `src/types/index.ts` and `src/constants/moodMeter.ts`.
- **Token-Locked Design:** Components must strictly consume design tokens via `useAppTheme().theme`. Zero raw inline hex values are permitted in JSX.

## Adopted Conventions
- **Safe Storage First:** Storage reading/parsing must never crash the app; always fall back gracefully to empty collections or default values.
- **Explicit Day Boundaries:** Use standard calendar boundaries (`new Date(y, m, d, 23, 59, 59, 999)`), avoiding naive millisecond addition.
- **Single-Purpose Functions:** Functions must do one job clearly at one level of abstraction with 0-2 parameters.
- **Contextual Error Handling:** Catch specific error types and carry user/operation context rather than returning empty strings.
- **Deep Modules:** Keep modules deep with simple public interfaces; never leak low-level database connection warming to UI layers.
