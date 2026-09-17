# AGENTS.md

Privacy-first mobile emotion tracker built with React Native and Expo SDK 57 for Android 14 (Google Pixel 5). Inspired by Yale's *How We Feel*, featuring Yale Mood Meter check-ins, SQLite persistence, and local notifications.

## Stack
- **Framework:** Expo SDK 57 (`~57.0.20`), React 19.2.3, React Native 0.86.3
- **Language & Runtime:** TypeScript ~6.0.3 (`strict: true`), Node.js (npm)
- **Local Storage:** `expo-sqlite` (~57.0.2) via modern async/sync SQLite API
- **Notifications & Haptics:** `expo-notifications` (~57.0.17), `expo-haptics` (~57.0.2)
- **Target Platform:** Android 14 (Pixel 5, `com.willwang.emotiontracker`)

## Setup & Commands

Always run commands from repository root (`/Users/willwang/Documents/emotion-tracker-app`).

```bash
# Install dependencies
npm install

# Start Metro bundler (Expo dev server)
npx expo start

# Run on Android connected device or emulator (Pixel 5)
npx expo run:android

# Type check (Run before finishing any changes)
npx tsc --noEmit

# Check Expo dependency compatibility
npx expo install --check
```

## Architecture & Code Map

```
App.tsx                  # Root app layout, day navigation, state orchestration
src/
├── components/          # UI components (QuadrantSelector, MicroCheckInModal,
│                        # TimelineCard, ReminderModal)
├── constants/
│   └── moodMeter.ts     # Yale Mood Meter taxonomy (4 quadrants, 48 emotions, somatic chips)
├── services/
│   ├── db.ts            # expo-sqlite database initialization, CRUD queries, migrations
│   └── notifications.ts # expo-notifications scheduling with Android 14 permissions
├── theme/
│   ├── ThemeContext.tsx # React Context provider & useAppTheme hook
│   └── index.ts         # Dual theme color tokens (light editorial cream & dark slate)
└── types/
    └── index.ts         # TypeScript interfaces (CheckIn, QuadrantType, EmotionItem, etc.)
android/                 # Prebuilt native Android project (configured for SDK 34/Android 14)
```

## Development Rules & Boundaries

### Always
- **Target Expo SDK 57 APIs:** Consult [Expo v57 docs](https://docs.expo.dev/versions/v57.0.0/) before modifying native integrations. Do not use legacy Expo APIs (e.g. deprecated `SQLite.openDatabase()`; use `openDatabaseAsync()` or `openDatabaseSync()`).
- **Guard Native Modules for Expo Go:** Modules requiring native code like Android `expo-notifications` must be guarded with `isRunningInExpoGo()` or `requireOptionalNativeModule` to prevent crashes when previewing in Expo Go.
- **Run Type Checks:** Always verify TypeScript compilation with `npx tsc --noEmit` before concluding work.
- **Maintain Editorial Design Consistency:** App supports dual themes—editorial cream (`#FBF9F5`, `#FFFFFF`, `#2D2A26`) and dark slate (`#0F1115`, `#181B22`, `#F3F0EA`)—with serif headings and Mood Meter quadrant accent colors (`#EF4444`, `#F59E0B`, `#3B82F6`, `#10B981`).
- **Preserve Local-First Architecture:** Store all check-ins, reflections, and settings locally in SQLite (`emotion_tracker.db`).

### Ask First
- Adding third-party external dependencies or native libraries.
- Modifying Android native config (`android/` directory or native permissions in `app.json`).
- Changing database schema or altering `check_ins` column definitions.
- Introducing cloud backends, remote sync, or third-party tracking services.

### Never
- Never check in API keys or hardcode secrets into source files.
- Never write temporary scratch scripts or build output folders (`dist/`, `deploy/`) to the repo root.
- Never use unversioned or outdated Expo docs (Expo 57 introduces breaking changes over SDK 50/51).
- Never break the offline-first guarantee; user emotion logs must remain private and on-device.
