# Emotion Tracker App — Project Specification & Architecture

## Overview
A custom, privacy-first mobile emotion tracking application tailored for a **Google Pixel 5 running Android 14**. Inspired by Yale's *How We Feel*, but with custom behavioral/somatic tracking, peak–valley retrospective flows to counteract recency bias, and **LLM/AI-powered analysis of free-text reflections and voice memos**.

---

## Target Environment
* **Device:** Google Pixel 5
* **OS:** Android 14 (Security Patch: Nov 5, 2023)
* **Directory:** `/Users/willwang/Documents/emotion-tracker-app`
* **Stack Recommendation:** React Native + Expo (runs via Expo Go on device or as standalone APK; local SQLite database; native notifications & audio APIs). Alternative: Progressive Web App (PWA) with React/Vite.

---

## Core Feature Requirements

### 1. Real-Time Micro Check-In (< 30 seconds)
* **Yale Mood Meter Quadrant Picker:**
  * High vs. Low Energy × Pleasant vs. Unpleasant.
  * Granular emotion vocabulary chips (e.g., ecstatic, anxious, numb, peaceful).
  * Intensity slider (1–10).
* **Somatic / Body Mapping:**
  * Quick-select chips: chest tightness, clenched jaw, racing heart, gut flutter, fatigue, relaxed, etc.
* **Context Tags:**
  * *Who:* Alone, Partner, Coworker, Friend, Family.
  * *What:* Work, Meeting, Commute, Chores, Exercise, Relaxing.
  * *Where:* Home, Office, Transit, Outdoors.
* **Deep Context Prompts (Free-Text & Voice):**
  * *What is triggering it?*
  * *What behaviors / urges does this make me want to do?*
  * Voice memo recording with auto-transcription.

### 2. End-of-Day Retrospective (Peak–Valley–Baseline)
* Chronological visual timeline of all check-ins for the day.
* **Peak:** Identifies/prompts for the highest-intensity positive event.
* **Valley:** Identifies/prompts for the lowest or most distressing event to unpack somatic/urge patterns.
* **Baseline:** Captures the background emotional hum of the day.

### 3. AI / LLM Analysis of Free-Text Notes (Key Differentiator)
* **In-the-Moment Reflection:** Immediate 1–2 sentence compassionate reflection or CBT reframing (detecting cognitive distortions, urging vs. acting).
* **Longitudinal Trends:** Weekly/monthly semantic synthesis (e.g., identifying recurring triggers, correlation between physical tension and specific work situations).
* **Privacy:** Direct client-side API calls using user-owned API key (e.g., Gemini Flash or Claude/OpenAI). No third-party data broker.

### 4. Notifications & Storage
* Gentle, configurable check-in nudges (e.g., morning, mid-day, evening).
* Local-first storage (SQLite on device) with JSON/CSV export.

---

## Next Steps When Opening the New Workspace
1. Select `/Users/willwang/Documents/emotion-tracker-app` as the workspace in Antigravity.
2. Confirm framework: Initialize with `npx create-expo-app` (React Native/Expo) or PWA setup.
3. Scaffold SQLite schema and emotion taxonomy models.
