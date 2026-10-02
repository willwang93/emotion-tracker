# Architecture

## System Context
- **Product:** Offline-first mobile emotion tracker on Android 14 (Google Pixel 5).
- **Runtime:** React Native 0.86.3, Expo SDK 57, TypeScript.
- **Traffic / Load:** Single-user on-device deployment (0 QPS, zero external network services).
- **Core Principle:** Strict local-first privacy. User emotions, journals, and reflections never leave the physical device unless explicitly exported via the Android system share sheet.

## Layer Map & Dependency Rule
| Layer | Components | Inward Dependencies | Outward Dependencies (Violations) | Status |
|---|---|---|---|---|
| **1. Domain Entities** | `src/types/index.ts`, `src/constants/moodMeter.ts` | None | None | Compliant (100% pure) |
| **2. Use Cases & Rules** | `formatCheckInsToMarkdown` (export formatting), serialization helpers | Domain Types | None | Compliant |
| **3. Interface Adapters** | `src/services/db.ts` (SQLite repository), `src/services/export.ts` (share orchestrator), UI Primitives (`src/components/ui/`) | Domain Entities, Use Cases | `expo-sqlite`, `expo-file-system`, `expo-sharing` | Compliant |
| **4. Frameworks & Drivers** | Expo SDK 57, React Native 0.86, Android 14 SQLite, Android Share Sheet | External packages | None | Compliant |

### Boundary Audit & Findings
| Violation / Coupling | Location | Fix | Status |
|---|---|---|---|
| Co-location of pure Markdown formatter with native file sharing | `src/services/export.ts` | Pure formatter tested independently; keep co-located until new formats (JSON/CSV) are added | Tracked (Low Risk) |
| Direct binding to `expo-sqlite` without swappable repository interface | `src/services/db.ts` | Acceptable for offline-only app; introduce `CheckInRepository` interface if remote sync is added | Documented in Decision Log |

## Data & Storage Decisions
- **Datastore Choice:** Single embedded SQLite 3 database (`emotion_tracker.db`) managed via `expo-sqlite`. Single system of record on-device.
- **Journal Mode & Isolation:** Configured with `PRAGMA journal_mode = WAL;` (Write-Ahead Logging). SQLite provides Snapshot Isolation in WAL mode.
- **Concurrency & Locking:**
  - Multiple concurrent readers are supported without reader-writer contention.
  - SQLite enforces single-writer serialization at the file level.
  - Zero write skew risk: check-in operations are idempotent or single-row primary key mutations with no shared balance/counter invariants.
- **Durability Guarantee:** Writes are committed to the WAL ring on transaction completion and checkpointed to disk automatically by the OS SQLite engine.
- **Access Pattern Optimization:** Primary workload is time-series range scanning (`timestamp >= ? AND timestamp <= ?`). Data volume (~1,500 rows/year) remains well within SQLite in-memory page cache capacities.

## Decision Log
| Date | Decision | Rationale |
|---|---|---|
| 2026-10-02 | Keep `src/services/db.ts` as primary local SQLite repository | Single-user local-first app does not require swappable multi-database repositories; simplicity over artificial layers. |
| 2026-10-02 | Isolate native Expo modules behind adapter mocks in unit tests | Allows testing business rules in fast Node.js runtime without launching an Android emulator. |
| 2026-10-02 | Pure domain logic in `src/types/` and `src/constants/` must have zero native dependencies | Ensures emotion taxonomy and types can be reused anywhere without framework coupling. |
| 2026-10-02 | WAL Mode & Single-Writer Serialization | Write-Ahead Logging prevents UI read queries from locking on writes, guaranteeing smooth 60fps animations during check-in saves. |
