import 'dart:async';
import 'dart:math';
import 'package:flutter/material.dart';
import 'package:just_audio/just_audio.dart';
import 'package:permission_handler/permission_handler.dart';

void main() {
  WidgetsFlutterBinding.ensureInitialized();
  runApp(const FeelTunesApp());
}

class FeelTunesApp extends StatelessWidget {
  const FeelTunesApp({super.key});

  @override
  Widget build(BuildContext context) {
    return MaterialApp(
      title: 'FeelTunes',
      debugShowCheckedModeBanner: false,
      theme: ThemeData(
        brightness: Brightness.dark,
        scaffoldBackgroundColor: const Color(0xFF0F111A),
        colorScheme: const ColorScheme.dark(
          primary: Color(0xFF8B5CF6),
          secondary: Color(0xFFEC4899),
          surface: Color(0xFF1E2235),
        ),
        fontFamily: 'Roboto',
        useMaterial3: true,
      ),
      home: const FeelTunesHomePage(),
    );
  }
}

enum AppState { idle, listening, analyzing, playing }

class MoodTrack {
  final String mood;
  final String trackTitle;
  final String assetPath;
  final Color moodColor;
  final IconData icon;

  const MoodTrack({
    required this.mood,
    required this.trackTitle,
    required this.assetPath,
    required this.moodColor,
    required this.icon,
  });
}

class FeelTunesHomePage extends StatefulWidget {
  const FeelTunesHomePage({super.key});

  @override
  State<FeelTunesHomePage> createState() => _FeelTunesHomePageState();
}

class _FeelTunesHomePageState extends State<FeelTunesHomePage>
    with SingleTickerProviderStateMixin {
  late AnimationController _pulseController;
  late Animation<double> _pulseAnimation;
  late AudioPlayer _audioPlayer;

  AppState _appState = AppState.idle;
  String _currentPhrase = '';
  String _detectedMood = 'neutral';
  MoodTrack? _currentTrack;
  Timer? _simulationTimer;
  double _playbackProgress = 0.0;
  bool _isPlayingMusic = false;

  // Personalized Mood-to-Song mapping
  final Map<String, MoodTrack> _moodLibrary = {
    'happy': const MoodTrack(
      mood: 'Happy',
      trackTitle: 'Sunlight Acoustic - Joyful Melody',
      assetPath: 'assets/audio/happy_song.mp3',
      moodColor: Color(0xFFFBBF24),
      icon: Icons.wb_sunny_rounded,
    ),
    'sad': const MoodTrack(
      mood: 'Reflective / Melancholy',
      trackTitle: 'Midnight Piano - Soft Echoes',
      assetPath: 'assets/audio/sad_song.mp3',
      moodColor: Color(0xFF60A5FA),
      icon: Icons.cloud_queue_rounded,
    ),
    'calm': const MoodTrack(
      mood: 'Calm & Peaceful',
      trackTitle: 'Deep Waters - Ambient Stream',
      assetPath: 'assets/audio/calm_song.mp3',
      moodColor: Color(0xFF34D399),
      icon: Icons.spa_rounded,
    ),
    'energetic': const MoodTrack(
      mood: 'Energetic & Pumped',
      trackTitle: 'Electric Pulse - Synthwave Beat',
      assetPath: 'assets/audio/energetic_song.mp3',
      moodColor: Color(0xFFF97316),
      icon: Icons.bolt_rounded,
    ),
    'frustrated': const MoodTrack(
      mood: 'Frustrated / Cathartic',
      trackTitle: 'Stormy Winds - Grounding Heavy Lo-Fi',
      assetPath: 'assets/audio/calm_song.mp3',
      moodColor: Color(0xFFEF4444),
      icon: Icons.air_rounded,
    ),
    'romantic': const MoodTrack(
      mood: 'Romantic & Warm',
      trackTitle: 'Velvet Strings - Candlelit Waltz',
      assetPath: 'assets/audio/romantic_song.mp3',
      moodColor: Color(0xFFEC4899),
      icon: Icons.favorite_rounded,
    ),
    'nostalgic': const MoodTrack(
      mood: 'Nostalgic',
      trackTitle: 'Old Cassette - Golden Memories',
      assetPath: 'assets/audio/nostalgic_song.mp3',
      moodColor: Color(0xFFA78BFA),
      icon: Icons.history_rounded,
    ),
    'hopeful': const MoodTrack(
      mood: 'Hopeful & Uplifting',
      trackTitle: 'Sunrise Horizon - Gentle Uplift',
      assetPath: 'assets/audio/happy_song.mp3',
      moodColor: Color(0xFF10B981),
      icon: Icons.explore_rounded,
    ),
    'focused': const MoodTrack(
      mood: 'Focused & Flow',
      trackTitle: 'Deep Focus - Alpha Brainwave Beats',
      assetPath: 'assets/audio/calm_song.mp3',
      moodColor: Color(0xFF6366F1),
      icon: Icons.psychology_rounded,
    ),
  };

  // Phrases for the speech simulation cycle
  final List<String> _samplePhrases = [
    "I feel so happy today, everything is falling into place!",
    "Ugh, I'm so stressed out and frustrated with all this work.",
    "Let's just take a deep breath and relax for a while.",
    "This reminds me so much of childhood summers back home.",
    "I'm feeling so pumped and ready for this workout!",
    "You have no idea how special you are to me.",
    "Things have been a little tough lately, but I have hope.",
    "I need absolute silence to concentrate on this code.",
  ];

  @override
  void initState() {
    super.initState();
    _pulseController = AnimationController(
      vsync: this,
      duration: const Duration(milliseconds: 1400),
    )..repeat(reverse: true);

    _pulseAnimation = Tween<double>(begin: 1.0, end: 1.25).animate(
      CurvedAnimation(parent: _pulseController, curve: Curves.easeInOut),
    );

    _audioPlayer = AudioPlayer();

    // Listen to playback states
    _audioPlayer.playerStateStream.listen((state) {
      if (mounted) {
        setState(() {
          _isPlayingMusic = state.playing;
        });
      }
    });

    _audioPlayer.positionStream.listen((pos) {
      final duration = _audioPlayer.duration ?? const Duration(seconds: 1);
      if (mounted && duration.inMilliseconds > 0) {
        setState(() {
          _playbackProgress =
              (pos.inMilliseconds / duration.inMilliseconds).clamp(0.0, 1.0);
        });
      }
    });
  }

  @override
  void dispose() {
    _simulationTimer?.cancel();
    _pulseController.dispose();
    _audioPlayer.dispose();
    super.dispose();
  }

  // Request Microphone permissions
  Future<bool> _checkMicPermission() async {
    final status = await Permission.microphone.request();
    if (status.isGranted) {
      return true;
    } else {
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          const SnackBar(
            content: Text('Microphone permission is required to listen to speech.'),
            backgroundColor: Colors.redAccent,
          ),
        );
      }
      return false;
    }
  }

  // Toggle the FeelTunes ambient listening cycle
  Future<void> _toggleListening() async {
    if (_appState == AppState.listening || _appState == AppState.analyzing) {
      // Stop listening
      _simulationTimer?.cancel();
      await _audioPlayer.stop();
      setState(() {
        _appState = AppState.idle;
        _currentPhrase = 'Listening paused';
      });
      return;
    }

    final hasPerm = await _checkMicPermission();
    if (!hasPerm) return;

    setState(() {
      _appState = AppState.listening;
      _currentPhrase = 'Ambient ear active. Listening for feelings...';
    });

    // Start simulation loop (every 4 seconds it samples a speech phrase)
    _simulationTimer?.cancel();
    _simulationTimer = Timer.periodic(const Duration(seconds: 4), (timer) {
      _processSimulatedSpeech();
    });
  }

  void _processSimulatedSpeech() {
    if (!mounted) return;

    // Pick random spoken phrase
    final random = Random();
    final phrase = _samplePhrases[random.nextInt(_samplePhrases.length)];

    setState(() {
      _appState = AppState.analyzing;
      _currentPhrase = '"$phrase"';
    });

    // Mood keyword classifier
    final moodKey = _detectEmotion(phrase);

    Timer(const Duration(milliseconds: 900), () async {
      if (!mounted) return;
      final matchedTrack = _moodLibrary[moodKey] ?? _moodLibrary['calm']!;

      setState(() {
        _detectedMood = moodKey;
        _currentTrack = matchedTrack;
        _appState = AppState.playing;
      });

      // Play matching local audio track
      await _playTrack(matchedTrack.assetPath);
    });
  }

  // Keyword-based sentiment & emotion detection
  String _detectEmotion(String text) {
    final lower = text.toLowerCase();
    if (lower.contains('happy') ||
        lower.contains('joy') ||
        lower.contains('great') ||
        lower.contains('place') ||
        lower.contains('smile')) {
      return 'happy';
    } else if (lower.contains('stressed') ||
        lower.contains('frustrated') ||
        lower.contains('angry') ||
        lower.contains('ugh')) {
      return 'frustrated';
    } else if (lower.contains('sad') ||
        lower.contains('cry') ||
        lower.contains('down') ||
        lower.contains('lonely')) {
      return 'sad';
    } else if (lower.contains('breath') ||
        lower.contains('relax') ||
        lower.contains('calm') ||
        lower.contains('peace')) {
      return 'calm';
    } else if (lower.contains('pumped') ||
        lower.contains('energetic') ||
        lower.contains('workout') ||
        lower.contains('run')) {
      return 'energetic';
    } else if (lower.contains('childhood') ||
        lower.contains('memories') ||
        lower.contains('reminds') ||
        lower.contains('nostalgic')) {
      return 'nostalgic';
    } else if (lower.contains('special') ||
        lower.contains('love') ||
        lower.contains('romantic') ||
        lower.contains('heart')) {
      return 'romantic';
    } else if (lower.contains('hope') ||
        lower.contains('tough') ||
        lower.contains('better')) {
      return 'hopeful';
    } else if (lower.contains('focus') ||
        lower.contains('silence') ||
        lower.contains('concentrate') ||
        lower.contains('code')) {
      return 'focused';
    }
    return 'calm';
  }

  Future<void> _playTrack(String assetPath) async {
    try {
      await _audioPlayer.setAsset(assetPath);
      await _audioPlayer.play();
    } catch (e) {
      // If asset file is not yet added to disk, show informative debug note
      debugPrint("FeelTunes Asset Notice: $e");
    }
  }

  @override
  Widget build(BuildContext context) {
    final activeColor = _currentTrack?.moodColor ?? const Color(0xFF8B5CF6);
    final isListening = _appState == AppState.listening ||
        _appState == AppState.analyzing ||
        _appState == AppState.playing;

    return Scaffold(
      body: SafeArea(
        child: Column(
          children: [
            // Top App Bar
            Padding(
              padding: const EdgeInsets.symmetric(horizontal: 20, vertical: 16),
              child: Row(
                mainAxisAlignment: MainAxisAlignment.spaceBetween,
                children: [
                  Row(
                    children: [
                      Container(
                        padding: const EdgeInsets.all(8),
                        decoration: BoxDecoration(
                          color: activeColor.withOpacity(0.15),
                          borderRadius: BorderRadius.circular(12),
                          border: Border.all(
                            color: activeColor.withOpacity(0.3),
                          ),
                        ),
                        child: Icon(
                          Icons.graphic_eq_rounded,
                          color: activeColor,
                          size: 24,
                        ),
                      ),
                      const SizedBox(width: 12),
                      Column(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          const Text(
                            'FeelTunes',
                            style: TextStyle(
                              fontSize: 20,
                              fontWeight: FontWeight.bold,
                              letterSpacing: 0.5,
                            ),
                          ),
                          Text(
                            isListening ? 'Ambient Ear Active' : 'Offline • Ready',
                            style: TextStyle(
                              fontSize: 12,
                              color: isListening ? Colors.greenAccent : Colors.grey,
                            ),
                          ),
                        ],
                      ),
                    ],
                  ),
                  IconButton(
                    onPressed: () {
                      _showLibraryDialog();
                    },
                    icon: const Icon(Icons.library_music_rounded),
                    tooltip: 'Mood Library',
                  ),
                ],
              ),
            ),

            const Spacer(),

            // Center Visualizer & Pulsing Mic
            Center(
              child: Stack(
                alignment: Alignment.center,
                children: [
                  // Outer Glow Rings
                  if (isListening)
                    AnimatedBuilder(
                      animation: _pulseAnimation,
                      builder: (context, child) {
                        return Container(
                          width: 200 * _pulseAnimation.value,
                          height: 200 * _pulseAnimation.value,
                          decoration: BoxDecoration(
                            shape: BoxShape.circle,
                            color: activeColor.withOpacity(0.12),
                          ),
                        );
                      },
                    ),

                  // Middle Ring
                  if (isListening)
                    Container(
                      width: 170,
                      height: 170,
                      decoration: BoxDecoration(
                        shape: BoxShape.circle,
                        color: activeColor.withOpacity(0.2),
                      ),
                    ),

                  // Core Touch Target
                  GestureDetector(
                    onTap: _toggleListening,
                    child: Container(
                      width: 130,
                      height: 130,
                      decoration: BoxDecoration(
                        shape: BoxShape.circle,
                        gradient: RadialGradient(
                          colors: [
                            activeColor,
                            activeColor.withOpacity(0.7),
                          ],
                        ),
                        boxShadow: [
                          BoxShadow(
                            color: activeColor.withOpacity(0.4),
                            blurRadius: 28,
                            spreadRadius: 4,
                          ),
                        ],
                      ),
                      child: Icon(
                        isListening
                            ? Icons.mic_rounded
                            : Icons.mic_none_rounded,
                        size: 56,
                        color: Colors.white,
                      ),
                    ),
                  ),
                ],
              ),
            ),

            const SizedBox(height: 32),

            // Speech & State Indicator
            Padding(
              padding: const EdgeInsets.symmetric(horizontal: 28),
              child: Column(
                children: [
                  Container(
                    padding: const EdgeInsets.symmetric(
                        horizontal: 16, vertical: 8),
                    decoration: BoxDecoration(
                      color: Colors.white.withOpacity(0.06),
                      borderRadius: BorderRadius.circular(20),
                    ),
                    child: Text(
                      _appState == AppState.idle
                          ? 'Tap microphone to start passive listening'
                          : _appState == AppState.analyzing
                              ? 'Analyzing emotional cadence...'
                              : _appState == AppState.playing
                                  ? 'Mood matched: ${_currentTrack?.mood ?? ""}'
                                  : 'Listening to ambient surroundings...',
                      style: TextStyle(
                        fontSize: 13,
                        color: activeColor,
                        fontWeight: FontWeight.w500,
                      ),
                    ),
                  ),
                  const SizedBox(height: 14),
                  AnimatedSwitcher(
                    duration: const Duration(milliseconds: 300),
                    child: Text(
                      _currentPhrase.isEmpty
                          ? '"Music that understands you without asking."'
                          : _currentPhrase,
                      key: ValueKey(_currentPhrase),
                      textAlign: TextAlign.center,
                      style: const TextStyle(
                        fontSize: 16,
                        fontStyle: FontStyle.italic,
                        color: Colors.white70,
                        height: 1.4,
                      ),
                    ),
                  ),
                ],
              ),
            ),

            const Spacer(),

            // Bottom Player Sheet
            if (_currentTrack != null)
              Container(
                margin: const EdgeInsets.all(16),
                padding: const EdgeInsets.all(16),
                decoration: BoxDecoration(
                  color: const Color(0xFF1E2235),
                  borderRadius: BorderRadius.circular(20),
                  border: Border.all(
                    color: activeColor.withOpacity(0.3),
                    width: 1.5,
                  ),
                ),
                child: Column(
                  children: [
                    Row(
                      children: [
                        Container(
                          width: 48,
                          height: 48,
                          decoration: BoxDecoration(
                            color: activeColor.withOpacity(0.2),
                            borderRadius: BorderRadius.circular(12),
                          ),
                          child: Icon(
                            _currentTrack!.icon,
                            color: activeColor,
                            size: 26,
                          ),
                        ),
                        const SizedBox(width: 14),
                        Expanded(
                          child: Column(
                            crossAxisAlignment: CrossAxisAlignment.start,
                            children: [
                              Text(
                                _currentTrack!.trackTitle,
                                maxLines: 1,
                                overflow: TextOverflow.ellipsis,
                                style: const TextStyle(
                                  fontWeight: FontWeight.bold,
                                  fontSize: 15,
                                ),
                              ),
                              const SizedBox(height: 3),
                              Text(
                                'Matched Mood: ${_currentTrack!.mood}',
                                style: TextStyle(
                                  fontSize: 12,
                                  color: activeColor,
                                ),
                              ),
                            ],
                          ),
                        ),
                        IconButton(
                          icon: Icon(
                            _isPlayingMusic
                                ? Icons.pause_circle_filled_rounded
                                : Icons.play_circle_fill_rounded,
                            size: 38,
                            color: activeColor,
                          ),
                          onPressed: () {
                            if (_isPlayingMusic) {
                              _audioPlayer.pause();
                            } else {
                              _audioPlayer.play();
                            }
                          },
                        ),
                      ],
                    ),
                    const SizedBox(height: 12),
                    LinearProgressIndicator(
                      value: _playbackProgress,
                      backgroundColor: Colors.white12,
                      valueColor: AlwaysStoppedAnimation<Color>(activeColor),
                      minHeight: 4,
                    ),
                  ],
                ),
              ),

            // Privacy Assurance Note
            Padding(
              padding: const EdgeInsets.only(bottom: 12),
              child: Row(
                mainAxisAlignment: MainAxisAlignment.center,
                children: const [
                  Icon(Icons.lock_outline_rounded,
                      size: 13, color: Colors.white38),
                  SizedBox(width: 6),
                  Text(
                    '100% On-Device • Audio never leaves this phone',
                    style: TextStyle(fontSize: 11, color: Colors.white38),
                  ),
                ],
              ),
            ),
          ],
        ),
      ),
    );
  }

  // Quick dialog showing available moods & mapped songs
  void _showLibraryDialog() {
    showModalBottomSheet(
      context: context,
      backgroundColor: const Color(0xFF1E2235),
      shape: const RoundedRectangleBorder(
        borderRadius: BorderRadius.vertical(top: Radius.circular(24)),
      ),
      builder: (ctx) {
        return Padding(
          padding: const EdgeInsets.all(20),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            mainAxisSize: MainAxisSize.min,
            children: [
              Row(
                mainAxisAlignment: MainAxisAlignment.spaceBetween,
                children: [
                  const Text(
                    'Mood Music Library',
                    style: TextStyle(
                      fontSize: 18,
                      fontWeight: FontWeight.bold,
                    ),
                  ),
                  Text(
                    '${_moodLibrary.length} Moods',
                    style: const TextStyle(fontSize: 12, color: Colors.white54),
                  ),
                ],
              ),
              const SizedBox(height: 16),
              Expanded(
                child: ListView(
                  children: _moodLibrary.entries.map((entry) {
                    final item = entry.value;
                    return ListTile(
                      leading: CircleAvatar(
                        backgroundColor: item.moodColor.withOpacity(0.2),
                        child: Icon(item.icon, color: item.moodColor, size: 20),
                      ),
                      title: Text(item.mood),
                      subtitle: Text(
                        item.trackTitle,
                        style: const TextStyle(fontSize: 12, color: Colors.white60),
                      ),
                      trailing: IconButton(
                        icon: const Icon(Icons.play_arrow_rounded),
                        onPressed: () {
                          Navigator.pop(ctx);
                          _playTrack(item.assetPath);
                          setState(() {
                            _currentTrack = item;
                            _detectedMood = entry.key;
                          });
                        },
                      ),
                    );
                  }).toList(),
                ),
              ),
            ],
          ),
        );
      },
    );
  }
}
