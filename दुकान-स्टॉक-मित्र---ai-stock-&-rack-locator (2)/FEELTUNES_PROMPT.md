# 🎧 FeelTunes — Standing Project Context & Living Document

> **"An Android/iOS Flutter app that listens to nearby speech, detects emotional context from what people say, and automatically plays a matching local song from a personalized library — no wake words, no assistants, just intuitive, feeling-responsive music."**

*Last updated: 2026-11-01*

---

## 🎯 Core Vision & Philosophy
- **Empathetic Companion**: The app feels like it *gets* the user: when they sigh, laugh, frown, or speak honestly, it responds with music that matches the mood (~60–70% relevance target to feel intuitive rather than uncanny).
- **Zero Friction**: No wake words ("Hey Siri", "OK Google"), no commands to memorize, no bot personality to manage. Just passive, gentle emotional resonance.
- **Offline-First & Privacy Sovereign**: All processing occurs strictly on-device. No audio ever leaves the user's phone without explicit opt-in.
- **Seamless & Quiet**: Feels like a quiet friend in the room who knows the perfect record to put on.

---

## 🛠️ Current Progress (as of 2026-11-01)
- **Project Structure**: Flutter project named `feel_tunes` set up in VS Code.
- **Current MVP in `lib/main.dart`**:
  - Pulsing microphone visualizer UI with state transitions (idle, listening, analyzing, playing).
  - Simulated "listening" loop (cycles every 3s with test phrases like *"I feel so happy today!"*, *"I am so stressed with work"*).
  - Keyword & pattern mood detection covering 9 emotional states:
    - `happy`
    - `sad`
    - `frustrated`
    - `calm`
    - `hopeful`
    - `nostalgic`
    - `romantic`
    - `energetic`
    - `focused`
  - Audio playback via `just_audio` targeting local audio assets in `assets/audio/`.
  - Android & iOS microphone permissions handled via `permission_handler`.
- **Assets Configured**: Test audio files (e.g. `happy_song.mp3`) mapped and enabled in `pubspec.yaml`.
- **Run Status**: Builds and runs on real Android devices. Tapping "Start Listening" triggers the analysis cycle and plays the matched track.

---

## 🧰 Tech Stack & Tools
| Category | Technology |
| :--- | :--- |
| **Framework** | Flutter (Dart 3+) |
| **Development Environment** | VS Code + Flutter & Dart Extensions |
| **Audio Playback** | `just_audio` |
| **Permissions** | `permission_handler` |
| **Audio Session Management** | `audio_session` |
| **Target Platform** | Android (primary focus), iOS |

---

## 🚀 Future Roadmap & Planned Milestones
1. **Real Offline Speech-to-Text (STT)**:
   - Phase 1: `speech_to_text` plugin for device-native STT engine.
   - Phase 2: Vosk offline STT model integration for 100% zero-network speech recognition.
2. **On-Device Emotion Classification**:
   - Upgrade from keyword heuristics to on-device TensorFlow Lite (`tflite_flutter`) sentiment/emotion model.
3. **Music Library & Fallbacks**:
   - User-customizable mood-to-song mapping UI.
   - Device media store scanner (reading user's local MP3/FLAC music).
   - Optional fallback search (e.g. YouTube / streaming audio if local song is missing).
   - Starter pack of 50+ relatable royalty-free tracks spanning mixed genres, moods, and eras.
4. **System Integration**:
   - Android Foreground Service for background ambient listening without app closure.
   - Home screen widget for one-tap listening toggle and current mood display.

---

## 🤝 Collaboration Agreement & Guidelines
When we collaborate on FeelTunes:
1. **Context Memory**: This document represents our standing foundation. We jump straight to building and refining.
2. **Flutter / VS Code Default**: All suggestions assume Flutter/Dart in VS Code targeting Android unless explicitly redirected.
3. **Copy-Paste Ready**: Code snippets (e.g. `main.dart`, `pubspec.yaml`, `AndroidManifest.xml`) must be complete, formatted, and ready to paste without placeholder gaps.
4. **Explain the 'Why'**: Architectural choices and audio/permission lifecycle details are clearly explained.
5. **Cadence & Pace**: Incremental, manageable steps. Celebrate small technical and sensory wins.
6. **Clarify Before Guessing**: When facing ambiguous technical trade-offs, ask one focused question.
7. **Strict Privacy Boundary**: No hidden recordings, no background uploads, zero telemetry compromises.

---

## 💬 Conversation Starter
Whenever you're ready to pick up:
> *"Hey, let's work on FeelTunes."*
