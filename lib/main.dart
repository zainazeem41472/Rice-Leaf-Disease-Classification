import 'package:flutter/material.dart';
import 'package:image_picker/image_picker.dart';
import 'package:http/http.dart' as http;
import 'dart:convert';
import 'dart:typed_data';

void main() {
  runApp(const RiceVisionApp());
}

class RiceVisionApp extends StatelessWidget {
  const RiceVisionApp({super.key});

  @override
  Widget build(BuildContext context) {
    return MaterialApp(
      debugShowCheckedModeBanner: false,
      theme: ThemeData(primarySwatch: Colors.green),
      home: const HomePage(),
    );
  }
}

class HomePage extends StatefulWidget {
  const HomePage({super.key});

  @override
  State<HomePage> createState() => _HomePageState();
}

class _HomePageState extends State<HomePage> {
  XFile? _selectedXFile;
  Uint8List? _imageBytes;
  final picker = ImagePicker();
  bool _isLoading = false;

  // ──────────────────────────────────────────────────────
  // ⚠️  BACKEND URL
  //  Flutter Web (browser)      →  http://localhost:5000  ✅
  //  Android Emulator           →  http://10.0.2.2:5000
  //  Real Android Phone (WiFi)  →  http://192.168.X.X:5000
  // ──────────────────────────────────────────────────────
  static const String _backendUrl = 'http://localhost:5000';

  Future<void> getImage() async {
    final pickedFile = await picker.pickImage(source: ImageSource.gallery);
    if (pickedFile != null) {
      final bytes = await pickedFile.readAsBytes();
      setState(() {
        _selectedXFile = pickedFile;
        _imageBytes = bytes;
      });
    }
  }

  Future<void> _predictDisease() async {
    if (_selectedXFile == null || _imageBytes == null) {
      _showSnack('Please select an image first!', Colors.orange);
      return;
    }

    setState(() => _isLoading = true);

    try {
      final request = http.MultipartRequest(
        'POST',
        Uri.parse('$_backendUrl/api/disease/upload'),
      );

      request.files.add(
        http.MultipartFile.fromBytes(
          'image',
          _imageBytes!,
          filename: _selectedXFile!.name,
        ),
      );

      final streamedResponse = await request.send().timeout(
        const Duration(seconds: 60),
        onTimeout: () => throw Exception('timeout'),
      );

      final response = await http.Response.fromStream(streamedResponse);
      if (!mounted) return;

      // ✅ 200 aur 201 dono success hain
      if (response.statusCode == 200 || response.statusCode == 201) {
        final data = jsonDecode(response.body);
        if (data['success'] == true && data['data'] != null) {
          final record = data['data'];
          Navigator.push(
            context,
            MaterialPageRoute(
              builder: (_) => ResultPage(
                imageBytes: _imageBytes!,
                diseaseName: record['diseaseName'] ?? 'Unknown',
                confidence: record['confidence']?.toString() ?? '0',
                description: record['description'] ?? '',
                treatment: record['treatment'] ?? '',
              ),
            ),
          );
        } else {
          _showSnack('Server response error', Colors.red);
        }
      } else {
        try {
          final data = jsonDecode(response.body);
          _showSnack(
              data['message'] ?? 'Server error: ${response.statusCode}',
              Colors.red);
        } catch (_) {
          _showSnack('Server error: ${response.statusCode}', Colors.red);
        }
      }
    } catch (e) {
      if (e.toString().contains('timeout')) {
        _showSnack('Timeout — dobara try karo.', Colors.orange, duration: 4);
      } else if (e.toString().contains('Failed host lookup') ||
          e.toString().contains('Connection refused')) {
        _showSnack(
            'Connection failed! Backend chal raha hai?\nURL: $_backendUrl',
            Colors.red,
            duration: 5);
      } else {
        _showSnack('Error: ${e.toString()}', Colors.red, duration: 4);
      }
    } finally {
      if (mounted) setState(() => _isLoading = false);
    }
  }

  void _showSnack(String msg, Color color, {int duration = 3}) {
    ScaffoldMessenger.of(context).showSnackBar(
      SnackBar(
        content: Text(msg),
        backgroundColor: color,
        duration: Duration(seconds: duration),
      ),
    );
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: const Text("Rice Vision 🌿",
            style: TextStyle(color: Colors.white)),
        backgroundColor: Colors.green[800],
      ),
      body: Stack(
        children: [
          // 1. BACKGROUND IMAGE
          Opacity(
            opacity: 0.3,
            child: Image.asset(
              'assets/img.jpeg',
              height: double.infinity,
              width: double.infinity,
              fit: BoxFit.cover,
            ),
          ),

          // 2. MAIN CONTENT
          SingleChildScrollView(
            child: Column(
              children: [
                const SizedBox(height: 30),
                const Text(
                  "Classify Rice Diseases",
                  style: TextStyle(
                      fontSize: 22, fontWeight: FontWeight.bold),
                ),

                // Image Preview
                Container(
                  height: 250,
                  width: double.infinity,
                  margin: const EdgeInsets.all(20),
                  decoration: BoxDecoration(
                    color: Colors.white.withOpacity(0.8),
                    border: Border.all(color: Colors.green),
                    borderRadius: BorderRadius.circular(15),
                  ),
                  child: _imageBytes == null
                      ? const Center(
                          child: Text("No Image Selected From Gallery"))
                      : ClipRRect(
                          borderRadius: BorderRadius.circular(15),
                          child: Image.memory(_imageBytes!, fit: BoxFit.cover),
                        ),
                ),

                // Buttons
                Padding(
                  padding: const EdgeInsets.symmetric(horizontal: 20),
                  child: Column(
                    children: [
                      ElevatedButton.icon(
                        onPressed: _isLoading ? null : getImage,
                        icon: const Icon(Icons.photo_library),
                        label: const Text("Select from Gallery"),
                        style: ElevatedButton.styleFrom(
                          minimumSize: const Size(double.infinity, 50),
                        ),
                      ),
                      const SizedBox(height: 10),
                      ElevatedButton(
                        onPressed: _isLoading ? null : _predictDisease,
                        style: ElevatedButton.styleFrom(
                          backgroundColor: Colors.green[700],
                          foregroundColor: Colors.white,
                          minimumSize: const Size(double.infinity, 50),
                        ),
                        child: _isLoading
                            ? const SizedBox(
                                height: 22,
                                width: 22,
                                child: CircularProgressIndicator(
                                  strokeWidth: 2.5,
                                  color: Colors.white,
                                ),
                              )
                            : const Text("Predict Disease"),
                      ),
                    ],
                  ),
                ),
                const SizedBox(height: 30),
              ],
            ),
          ),
        ],
      ),
    );
  }
}

// ─────────────────────────────────────────────
//  RESULT PAGE
// ─────────────────────────────────────────────
class ResultPage extends StatelessWidget {
  final Uint8List imageBytes;
  final String diseaseName;
  final String confidence;
  final String description;
  final String treatment;

  const ResultPage({
    super.key,
    required this.imageBytes,
    required this.diseaseName,
    required this.confidence,
    required this.description,
    required this.treatment,
  });

  @override
  Widget build(BuildContext context) {
    final double confValue = double.tryParse(
          confidence.replaceAll('%', '').trim(),
        ) ??
        0;

    return Scaffold(
      appBar: AppBar(
        title: const Text("Prediction Result 🌾",
            style: TextStyle(color: Colors.white)),
        backgroundColor: Colors.green[800],
        iconTheme: const IconThemeData(color: Colors.white),
      ),
      backgroundColor: const Color(0xFFF0FDF4),
      body: SingleChildScrollView(
        padding: const EdgeInsets.all(20),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.stretch,
          children: [
            ClipRRect(
              borderRadius: BorderRadius.circular(16),
              child: Image.memory(imageBytes, height: 220, fit: BoxFit.cover),
            ),
            const SizedBox(height: 20),
            Text(
              diseaseName,
              textAlign: TextAlign.center,
              style: const TextStyle(
                  fontSize: 22,
                  fontWeight: FontWeight.bold,
                  color: Color(0xFF1F2937)),
            ),
            const SizedBox(height: 6),
            Text(
              'Confidence: $confidence',
              textAlign: TextAlign.center,
              style:
                  const TextStyle(fontSize: 15, color: Color(0xFF6B7280)),
            ),
            const SizedBox(height: 16),
            ClipRRect(
              borderRadius: BorderRadius.circular(8),
              child: LinearProgressIndicator(
                value: confValue / 100,
                minHeight: 12,
                backgroundColor: const Color(0xFFE5E7EB),
                valueColor: AlwaysStoppedAnimation<Color>(
                  confValue > 80
                      ? Colors.green
                      : confValue > 50
                          ? Colors.orange
                          : Colors.red,
                ),
              ),
            ),
            const SizedBox(height: 20),
            if (description.isNotEmpty)
              _InfoCard(
                icon: '📋',
                title: 'Description',
                content: description,
                borderColor: Colors.blue,
                bgColor: const Color(0xFFEFF6FF),
              ),
            if (description.isNotEmpty) const SizedBox(height: 14),
            if (treatment.isNotEmpty)
              _InfoCard(
                icon: '💊',
                title: 'Treatment',
                content: treatment,
                borderColor: Colors.green,
                bgColor: const Color(0xFFF0FDF4),
              ),
            const SizedBox(height: 28),
            ElevatedButton(
              onPressed: () => Navigator.pop(context),
              style: ElevatedButton.styleFrom(
                backgroundColor: Colors.green[700],
                foregroundColor: Colors.white,
                minimumSize: const Size(double.infinity, 50),
                shape: RoundedRectangleBorder(
                    borderRadius: BorderRadius.circular(12)),
              ),
              child: const Text('Try Again',
                  style: TextStyle(
                      fontSize: 16, fontWeight: FontWeight.w600)),
            ),
          ],
        ),
      ),
    );
  }
}

class _InfoCard extends StatelessWidget {
  final String icon;
  final String title;
  final String content;
  final Color borderColor;
  final Color bgColor;

  const _InfoCard({
    required this.icon,
    required this.title,
    required this.content,
    required this.borderColor,
    required this.bgColor,
  });

  @override
  Widget build(BuildContext context) {
    return Container(
      padding: const EdgeInsets.all(16),
      decoration: BoxDecoration(
        color: bgColor,
        borderRadius: BorderRadius.circular(12),
        border: Border(left: BorderSide(color: borderColor, width: 4)),
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Text('$icon  $title',
              style: const TextStyle(
                  fontSize: 14,
                  fontWeight: FontWeight.bold,
                  color: Color(0xFF1F2937))),
          const SizedBox(height: 8),
          Text(content,
              style: const TextStyle(
                  fontSize: 14, color: Color(0xFF374151), height: 1.5)),
        ],
      ),
    );
  }
}