# Improve Code Quality Plan

## Context
- **Product:** Privacy-first mobile emotion tracker (Yale Mood Meter taxonomy, 48 emotions, 4 quadrants) built with React Native / Expo SDK 57 for Android 14 (Google Pixel 5).
- **Core User Risk:** Losing or corrupting personal emotional check-in history, reflection notes, or export files.
- **Starting Module:** `src/services/db.ts` (SQLite data persistence) & `src/services/export.ts` (markdown export formatting).
- **Deployment & Architecture:** 100% offline, local-first single-user application. SQLite storage with WAL mode. Zero backend servers or external API dependencies.
- **Date Started:** 2026-10-01

## Phase Status
| Phase | Skill | Status | Artifact | Date |
|---|---|---|---|---|
| 1 — Build the safety net | working-with-legacy-code | done | TESTING.md + TECH-DEBT.md (GATE) | 2026-10-01 |
| 2 — Make the code readable | clean-code | done | TECH-DEBT.md | 2026-10-02 |
| 3 — Apply named refactorings | refactoring-patterns | done | TECH-DEBT.md | 2026-10-02 |
| 4 — Reduce complexity | software-design-philosophy | done | TECH-DEBT.md | 2026-10-02 |
| 5 — Draw the architecture boundary | clean-architecture | done | ARCHITECTURE.md | 2026-10-02 |
| 6 — Lock in the habits | pragmatic-programmer | done | TECH-DEBT.md | 2026-10-02 |
| 7 — Make it survive production | release-it | done | RELIABILITY.md | 2026-10-02 |
| 8 — Size for real load | system-design | skipped: local-first offline mobile app (no backend server or web traffic) | ARCHITECTURE.md + RELIABILITY.md | 2026-10-01 |
| 9 — Get the data layer right | ddia-systems | done | ARCHITECTURE.md | 2026-10-02 |
| Optional — Domain language | domain-driven-design | skipped: Yale Mood Meter domain model is already encapsulated in constants | ARCHITECTURE.md | 2026-10-02 |

Statuses: pending · in-progress · awaiting-evidence · done · deferred: <reason> · skipped: <reason>

## Key Decisions
| Date | Phase | Decision | Rationale |
|---|---|---|---|
| 2026-10-01 | Intake | Priority starting target is the persistence layer (`src/services/db.ts`) | Protecting user emotional journal entries from corruption or loss is the highest product risk. |
| 2026-10-01 | Intake | Skip Phase 8 (high-scale server system design) | App runs strictly on-device with no remote servers or web traffic load. |
| 2026-10-01 | Intake | Set up automated testing framework for Phase 1 | Establishes a verifiable safety net before making any code modifications. |
| 2026-10-01 | Phase 1 | Pin existing quirks and log to Debt Ledger rather than silent fixes | Changing subtle behavior without caller alignment risks unexpected side effects. |
| 2026-10-01 | Phase 1 | Execute using built-in Phase 1 Brief | Incorporates Michael Feathers' legacy code characterization methodology directly with zero extra dependencies. |
| 2026-10-02 | Phase 2 | Deploy crash-prevention parser (`safeParseJsonArray`) in `db.ts` | Prevents corrupted storage data from crashing the app; fails safely to `[]`. |
| 2026-10-02 | Phase 2 | Formalize quality & error conventions in `docs/TECH-DEBT.md` | Ensures future features maintain safe fallbacks, single responsibility, and contextual errors. |
| 2026-10-02 | Phase 3 | Extract `serializeCheckInFields`, add domain constants & `RawCheckInRow` | Eliminates duplicated SQL parameter mapping across insert and update; adds compile-time type safety. |
| 2026-10-02 | Phase 4 | Hide DB connection lifecycle inside `db.ts` (eliminate `getDatabase` in `App.tsx`) | Prevents information leakage and temporal coupling; keeps service interfaces deep and self-managing. |
| 2026-10-02 | Phase 5 | Create `docs/ARCHITECTURE.md` and verify pure domain isolation | Guarantees core emotion taxonomy and formatting rules remain 100% independent of native device plugins. |
| 2026-10-02 | Phase 6 | Establish 15-20% debt budget and broken-windows policy in `docs/TECH-DEBT.md` | Prevents codebase decay by requiring all quirks to be tracked and reserving continuous maintenance capacity. |
| 2026-10-02 | Phase 7 | Create `docs/RELIABILITY.md` auditing SQLite WAL, cache cleanup, and share fallbacks | Hardens device resilience under low-storage, locked-file, and offline scenarios. |
| 2026-10-02 | Phase 9 | Document SQLite WAL mode snapshot isolation & single-writer concurrency in `docs/ARCHITECTURE.md` | Guarantees zero write-skew risk and durable single-source-of-truth storage. |

## Next Actions
- [x] Set up Jest test harness for TypeScript (Antigravity, 2026-10-01)
- [x] Write characterization tests for `src/services/export.ts` and `src/services/db.ts` (Antigravity, 2026-10-01)
- [x] Create `docs/TESTING.md` and `docs/TECH-DEBT.md` (Antigravity, 2026-10-01)
- [x] Harden database parser against corrupted JSON & fix day boundary math (Antigravity, 2026-10-02)
- [x] Apply named structural refactorings to parameter serialization & typed row mapping (Antigravity, 2026-10-02)
- [x] Encapsulate database initialization to eliminate UI layer connection leakage (Antigravity, 2026-10-02)
- [x] Audit Clean Architecture layers and publish `docs/ARCHITECTURE.md` (Antigravity, 2026-10-02)
- [x] Sweep for untracked TODOs and formalize quality policies (Antigravity, 2026-10-02)
- [x] Audit device reliability, fallbacks, and storage hygiene in `docs/RELIABILITY.md` (Antigravity, 2026-10-02)
- [x] Complete Phase 9 data layer concurrency audit and finalize tracker (Antigravity, 2026-10-02)
