# Emotion Tracker

A minimalist, privacy-first mobile emotion tracking application built with React Native and Expo SDK 57, designed specifically for Android 14 (Google Pixel 5).

Inspired by the Yale Center for Emotional Intelligence's Mood Meter (*How We Feel*), the app provides a quiet, intentional space to label emotions with granular precision, track somatic sensations, and build emotional awareness throughout the day.

---

## Key Features

* **Yale Mood Meter Taxonomy:**
  * 4 Quadrants: High/Low Energy × Pleasant/Unpleasant (Red, Yellow, Blue, Green).
  * 48 granular emotion words complete with definitions (e.g., *Anxious, Enraged, Exuberant, Serene, Melancholy, Peaceful*).
* **Somatic & Contextual Awareness:**
  * Quick-select body sensations (chest tightness, clenched jaw, racing heart, relaxed, warm, etc.).
  * Context tagging (*Who:* Alone, Partner, Coworker, Friend, Family; *Where:* Home, Office, Transit, Outdoors).
* **Literary Editorial Design:**
  * Minimalist, magazine-inspired aesthetic with serif typography and clean layouts.
  * Native dual-theme support: Warm editorial cream (`#FBF9F5`) and dark slate (`#0F1115`).
  * Chronological journal timeline displaying quote reflections, emotion badges, and somatic markers.
* **100% Private & Offline-First:**
  * All check-ins and reflections are stored strictly on-device in a local SQLite database (`emotion_tracker.db`).
  * Zero third-party telemetry, tracking, or cloud dependencies. Your emotional life remains entirely on your device.
* **Smart Notification Nudges:**
  * Configurable local notification reminders (Android 14 exact alarm scheduling) to encourage regular emotional check-ins throughout the day.

---

## Tech Stack

| Component | Technology | Version |
| :--- | :--- | :--- |
| **Framework** | Expo SDK | `~57.0.20` |
| **Runtime** | React Native / React | `0.86.3` / `19.2.3` |
| **Language** | TypeScript (Strict) | `~6.0.3` |
| **Local Storage** | `expo-sqlite` | `~57.0.2` |
| **Notifications & Haptics** | `expo-notifications` / `expo-haptics` | `~57.0.17` / `~57.0.2` |
| **Target Platform** | Android 14 (Google Pixel 5) | `com.willwang.emotiontracker` |

---

## Getting Started

### Prerequisites
* Node.js (v18 or higher recommended) & npm
* Android device connected via USB with USB Debugging enabled, or an Android emulator

### Installation
```bash
# Clone the repository
git clone https://github.com/willwang93/emotion-tracker.git
cd emotion-tracker

# Install dependencies
npm install
```

### Running Locally
```bash
# Start the Metro bundler
npx expo start

# Run the app directly on your connected Android device
npx expo run:android

# Run TypeScript type check
npx tsc --noEmit
```

---

## Project Structure

```
├── App.tsx                  # Root layout, date navigation, timeline feed, state orchestration
├── app.json                 # Expo project configuration & native Android permissions
├── src/
│   ├── components/          # UI Components
│   │   ├── MicroCheckInModal.tsx  # Multi-step check-in wizard (Mood Meter -> Nuance -> Context -> Intensity -> Note)
│   │   ├── ReminderModal.tsx      # Reminder settings & time scheduling
│   │   └── TimelineCard.tsx       # Editorial journal cards with emotion badges & notes
│   ├── constants/
│   │   └── moodMeter.ts     # Yale Mood Meter taxonomy (48 emotions with granular definitions)
│   ├── services/
│   │   ├── db.ts            # expo-sqlite initialization, CRUD queries, database migrations
│   │   └── notifications.ts # Local notification scheduling with Android 14 permissions
│   ├── theme/
│   │   ├── ThemeContext.tsx # React Context provider & useAppTheme hook
│   │   └── index.ts         # Theme tokens (warm editorial cream & dark slate)
│   └── types/
│       └── index.ts         # TypeScript interfaces (CheckIn, QuadrantType, EmotionItem, etc.)
├── stitch/                  # Google Stitch design prototype exports, tokens, and screen mockups
└── android/                 # Prebuilt native Android project (SDK 34 / Android 14)
```

---

## License
MIT
