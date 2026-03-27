import 'package:shared_preferences/shared_preferences.dart';

class StoredSession {
  const StoredSession({
    required this.accessToken,
    required this.refreshToken,
  });

  final String accessToken;
  final String refreshToken;
}

class SessionStorage {
  SessionStorage._();

  static const String _accessTokenKey = 'access_token';
  static const String _refreshTokenKey = 'refresh_token';

  static SharedPreferences? _preferences;

  static Future<void> initialize() async {
    _preferences ??= await SharedPreferences.getInstance();
  }

  static Future<SharedPreferences> _instance() async {
    await initialize();
    return _preferences!;
  }

  static Future<void> saveSession({
    required String accessToken,
    required String refreshToken,
  }) async {
    final preferences = await _instance();
    await preferences.setString(_accessTokenKey, accessToken);
    await preferences.setString(_refreshTokenKey, refreshToken);
  }

  static Future<StoredSession?> readSession() async {
    final preferences = await _instance();
    final accessToken = preferences.getString(_accessTokenKey);
    final refreshToken = preferences.getString(_refreshTokenKey);

    if (accessToken == null || refreshToken == null) {
      return null;
    }

    return StoredSession(
      accessToken: accessToken,
      refreshToken: refreshToken,
    );
  }

  static Future<void> clearSession() async {
    final preferences = await _instance();
    await preferences.remove(_accessTokenKey);
    await preferences.remove(_refreshTokenKey);
  }

  static void resetForTest() {
    _preferences = null;
  }
}
