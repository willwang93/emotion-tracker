# AGENTS.md

Privacy-first mobile emotion tracker built with React Native and Expo SDK 57 for Android 14 (Google Pixel 5). Inspired by Yale's *How We Feel*, featuring Yale Mood Meter check-ins and SQLite persistence.

## Stack
- **Framework:** Expo SDK 57 (`~57.0.20`), React 19.2.3, React Native 0.86.3
- **Language & Runtime:** TypeScript ~6.0.3 (`strict: true`), Node.js (npm)
- **Local Storage:** `expo-sqlite` (~57.0.2) via modern async/sync SQLite API
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
├── components/          # UI components (MicroCheckInModal, TimelineCard)
│   └── ui/              # Token-locked design primitives (AppText, AppButton, AppCard, AppChip, AppTextInput, AppModalLayout)
├── constants/
│   └── moodMeter.ts     # Yale Mood Meter taxonomy (48 emotions with definitions)
├── services/
│   └── db.ts            # expo-sqlite database initialization, CRUD queries, migrations
├── theme/
│   ├── ThemeContext.tsx # React Context provider & useAppTheme hook
│   └── index.ts         # Theme color tokens (editorial cream)
└── types/
    └── index.ts         # TypeScript interfaces (CheckIn, QuadrantType, EmotionItem)
stitch/                  # Google Stitch design system tokens, HTML mockups, screen exports
android/                 # Prebuilt native Android project (configured for SDK 34/Android 14)
```

## Development Rules & Boundaries

### Always
- **Prototype and Build Using `src/components/ui/` Primitives:** Whenever creating, modifying, or prototyping screens, assemble using `AppText`, `AppButton`, `AppCard`, `AppChip`, `AppTextInput`, and `AppModalLayout`.
- **Strictly Consume Theme Tokens:** Always get colors from `useAppTheme().theme` (e.g. `theme.text`, `theme.background`, `theme.quadrants[q].*`).
- **Target Expo SDK 57 APIs:** Consult [Expo v57 docs](https://docs.expo.dev/versions/v57.0.0/) before modifying native integrations. Do not use legacy Expo APIs (e.g. deprecated `SQLite.openDatabase()`; use `openDatabaseAsync()` or `openDatabaseSync()`).
- **Run Type Checks:** Always verify TypeScript compilation with `npx tsc --noEmit` before concluding work.
- **Maintain Editorial Design Consistency:** App features an editorial cream aesthetic (`#FEF9EE`, `#FFFFFF`, `#1D1C15`) with Plus Jakarta Sans typography and Mood Meter quadrant accent colors (`#EF4444`, `#F59E0B`, `#3B82F6`, `#61AD7B`).
- **Preserve Local-First Architecture:** Store all check-ins and reflections locally in SQLite (`emotion_tracker.db`).

### Ask First
- Adding third-party external dependencies or native libraries.
- Modifying Android native config (`android/` directory or native permissions in `app.json`).
- Changing database schema or altering `check_ins` column definitions.
- Introducing cloud backends, remote sync, or third-party tracking services.

### Never
- **Never Hardcode Inline Hex Colors:** Never write raw color strings (e.g. `#...` or `rgba(...)`) inside component JSX or `StyleSheet.create`. Always use `theme.*`.
- **Never Use Custom Font Families or Unapproved Weights:** Never use system fonts or arbitrary font weights. Use `AppText` variants or `fonts.*`.
- **Never Add Haptics/Vibrations:** The user explicitly requested NO vibrations/haptics in this app.
- Never check in API keys or hardcode secrets into source files.
- Never write temporary scratch scripts or build output folders (`dist/`, `deploy/`) to the repo root.
- Never use unversioned or outdated Expo docs (Expo 57 introduces breaking changes over SDK 50/51).
- Never break the offline-first guarantee; user emotion logs must remain private and on-device.
