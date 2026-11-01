# 🎧 FeelTunes Flutter Quickstart Guide (VS Code)

This directory contains the production-ready source code for the **FeelTunes MVP** in Flutter.

## 📁 Directory Structure
```
feel_tunes/
├── pubspec.yaml                 # Dependencies (just_audio, permission_handler, etc.)
├── android/
│   └── app/src/main/
│       └── AndroidManifest.xml  # RECORD_AUDIO & Foreground permissions
├── assets/
│   └── audio/                   # Drop your MP3s here
│       ├── happy_song.mp3
│       ├── sad_song.mp3
│       ├── calm_song.mp3
│       ├── energetic_song.mp3
│       ├── romantic_song.mp3
│       └── nostalgic_song.mp3
└── lib/
    └── main.dart                # Complete MVP with animated mic, emotion engine & player
```

## 🚀 How to Run in VS Code

1. **Open the project in VS Code**:
   ```bash
   cd feel_tunes
   flutter pub get
   ```

2. **Add audio files**:
   Place at least one test MP3 in `assets/audio/happy_song.mp3` (or any of the listed tracks).

3. **Connect your Android device** (or start an emulator with audio input enabled).

4. **Press `F5`** or run:
   ```bash
   flutter run
   ```

5. **Test the flow**:
   - Tap the central glowing mic button.
   - Accept the microphone permission dialog.
   - The app cycles speech phrases every 4 seconds, detects emotional sentiment, highlights the matched mood, and triggers the mapped track with live progress!
