# Reliability

## Integration-Point Audit
| Dependency | Type | Failure Mode | Mitigation / Fallback | Steady-State Cleanup | Status |
|---|---|---|---|---|---|
| `expo-sqlite` | Local Storage | File lock / disk full | Fresh connection retry in `withDb`; WAL journaling | SQLite auto-checkpoints WAL file | Active & Verified |
| `expo-sharing` | Native Share Sheet | Share intent unavailable | Fallback to React Native text-based `Share.share` | N/A | Active & Verified |
| `expo-file-system` | Cache Storage | Cache write failure | Falls back to system text share; deletes prior export before write | Explicit `file.delete()` on existing cache file | Active & Verified |
| Outbound Network APIs | Remote Calls | Network timeout / DNS | N/A — Zero external network dependencies (100% offline-first) | N/A | N/A (Offline by Design) |

## Query & Resource Findings
- **Bounded Daily Queries:** `getCheckInsForDay` and `getCheckInsForDateRange` query bounded time slices rather than unbounded tables.
- **Data Volume Sizing:** At 4 check-ins/day, 1 year of data is ~1,460 rows (< 1 MB SQLite payload). Queries execute well within the mobile 60fps frame budget (< 5ms).
- **Recommended Schema Hardening:** Add a timestamp index (`CREATE INDEX IF NOT EXISTS idx_check_ins_timestamp ON check_ins(timestamp);`) when database grows beyond 5,000 entries.

## Health Checks & Metrics
- **Storage Initialization Check:** `initDatabase` executes on startup and validates `PRAGMA journal_mode = WAL`.
- **Descriptive Diagnostics:** Database connection re-attempts log diagnostic warnings rather than crashing silent threads.
- **Crash Prevention:** Corrupted JSON row parsing is protected by `safeParseJsonArray()`, preventing malformed records from bricking the home screen.

## Deploy vs Release
- **Local Schema Evolution (Expand-Contract):** App updates must never execute destructive schema drops. New fields must be added with nullable defaults (`ALTER TABLE ... ADD COLUMN ...`).
- **Release Verification:** Build and verify release APK via `npx expo run:android --variant release`.
