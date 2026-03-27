import 'dart:async';
import 'dart:convert';

import 'package:flutter/foundation.dart';
import 'package:http/http.dart' as http;
import 'package:supabase_flutter/supabase_flutter.dart' as sb;

import '../../../core/config/supabase_config.dart';
import '../../../core/session/session_storage.dart';
import '../domain/auth_repository.dart';

class AuthRepositoryImpl implements AuthRepository {
  AuthRepositoryImpl(
    this._supabaseClient, {
    http.Client? httpClient,
    String? baseUrl,
  })  : _httpClient = httpClient ?? http.Client(),
        _baseUrl = baseUrl ?? SupabaseConfig.functionsBaseUrl;

  final sb.SupabaseClient? _supabaseClient;
  final http.Client _httpClient;
  final String _baseUrl;

  @override
  Future<AuthActionResult> restoreSession() async {
    final storedSession = await SessionStorage.readSession();

    if (storedSession != null) {
      try {
        return await completeSession(
          AuthSession(
            accessToken: storedSession.accessToken,
            refreshToken: storedSession.refreshToken,
          ),
        );
      } on AuthRepositoryException {
        await SessionStorage.clearSession();
      }
    }

    final currentSession = _supabaseClient?.auth.currentSession;

    if (currentSession == null ||
        currentSession.accessToken.isEmpty ||
        (currentSession.refreshToken ?? '').isEmpty) {
      return const AuthActionResult();
    }

    return completeSession(
      AuthSession(
        accessToken: currentSession.accessToken,
        refreshToken: currentSession.refreshToken!,
      ),
    );
  }

  @override
  Future<AuthActionResult> completeSession(AuthSession session) async {
    await SessionStorage.saveSession(
      accessToken: session.accessToken,
      refreshToken: session.refreshToken,
    );

    final sessionResponse = await _sendRequest(
      path: '/session',
      method: 'GET',
      accessToken: session.accessToken,
      fallbackMessage: 'Unable to verify your session.',
    );

    if (sessionResponse.statusCode == 401) {
      return _recoverExpiredSession(session.refreshToken);
    }

    _ensureSuccess(sessionResponse);

    final user = _parseUser(sessionResponse.jsonBody['user']);

    return AuthActionResult(
      isAuthenticated: true,
      user: user,
      session: AuthSession(
        accessToken: session.accessToken,
        refreshToken: session.refreshToken,
        user: user,
      ),
    );
  }

  @override
  Future<AuthActionResult> signInWithEmail({
    required String email,
    required String password,
  }) async {
    final response = await _sendRequest(
      path: '/login',
      payload: <String, dynamic>{
        'email': email.trim(),
        'password': password,
      },
      useAnonAuth: true,
      fallbackMessage: 'Unable to sign in right now.',
    );

    _ensureSuccess(response);

    return AuthActionResult(
      session: _parseSession(response.jsonBody),
      message: _extractMessage(response.jsonBody),
    );
  }

  @override
  Future<AuthActionResult> signUpWithEmail({
    required String email,
    required String password,
    required String name,
  }) async {
    final response = await _sendRequest(
      path: '/signup',
      payload: <String, dynamic>{
        'email': email.trim(),
        'password': password,
        'name': name.trim(),
      },
      useAnonAuth: true,
      fallbackMessage: 'Unable to create your account right now.',
    );

    _ensureSuccess(response);

    final requiresVerification = response.jsonBody['requiresVerification'] == true;

    if (requiresVerification) {
      return AuthActionResult(
        requiresVerification: true,
        message: _extractMessage(response.jsonBody),
      );
    }

    return AuthActionResult(
      session: _parseSession(response.jsonBody),
      message: _extractMessage(response.jsonBody),
    );
  }

  @override
  Future<AuthActionResult> signInWithGoogle() async {
    final supabaseClient = _supabaseClient;

    if (supabaseClient == null) {
      throw const AuthRepositoryException(
        'Google sign-in is not configured for this build.',
      );
    }

    try {
      await supabaseClient.auth.signInWithOAuth(
        sb.OAuthProvider.google,
        redirectTo: SupabaseConfig.mobileRedirectUrl,
        queryParams: const <String, String>{
          'access_type': 'offline',
          'prompt': 'consent',
        },
      );

      return const AuthActionResult(
        message: 'Google sign-in started. Complete the browser flow to continue.',
      );
    } on sb.AuthException catch (error) {
      throw AuthRepositoryException(error.message);
    } catch (_) {
      throw const AuthRepositoryException(
        'Unable to start Google sign-in right now. Please try again.',
      );
    }
  }

  @override
  Future<void> refreshSession() async {
    final storedSession = await SessionStorage.readSession();

    if (storedSession == null) {
      throw const AuthRepositoryException('No active session to refresh.');
    }

    await _recoverExpiredSession(storedSession.refreshToken);
  }

  @override
  Future<AuthActionResult> requestPasswordReset({
    required String email,
  }) async {
    final response = await _sendRequest(
      path: '/forgot-password',
      payload: <String, dynamic>{
        'email': email.trim(),
      },
      useAnonAuth: true,
      fallbackMessage: 'Unable to send the recovery email right now.',
    );

    _ensureSuccess(response);

    return AuthActionResult(
      message: _extractMessage(response.jsonBody),
    );
  }

  @override
  Future<AuthActionResult> resetPassword({
    required String recoveryToken,
    required String newPassword,
  }) async {
    final response = await _sendRequest(
      path: '/reset-password',
      payload: <String, dynamic>{
        'newPassword': newPassword,
      },
      accessToken: recoveryToken,
      fallbackMessage: 'Unable to update your password right now.',
    );

    _ensureSuccess(response);

    return AuthActionResult(
      message: _extractMessage(response.jsonBody),
    );
  }

  @override
  Future<void> signOut() async {
    await SessionStorage.clearSession();

    try {
      await _supabaseClient?.auth.signOut();
    } catch (_) {
      // Local session cleanup is canonical for mobile logout.
    }
  }

  Future<AuthActionResult> _recoverExpiredSession(String refreshToken) async {
    final response = await _sendRequest(
      path: '/refresh-token',
      payload: <String, dynamic>{
        'refresh_token': refreshToken,
      },
      fallbackMessage: 'Your session expired. Please sign in again.',
    );

    _ensureSuccess(response);

    final refreshedSession = _parseSession(response.jsonBody);

    return completeSession(refreshedSession);
  }

  AuthSession _parseSession(Map<String, dynamic> jsonBody) {
    final accessToken = jsonBody['access_token'] as String?;
    final refreshToken = jsonBody['refresh_token'] as String?;

    if (accessToken == null || refreshToken == null) {
      throw AuthRepositoryException(
        _extractMessage(
          jsonBody,
          fallbackMessage: 'The authentication response is incomplete.',
        ),
      );
    }

    final userJson = jsonBody['user'];

    return AuthSession(
      accessToken: accessToken,
      refreshToken: refreshToken,
      user: userJson is Map<String, dynamic> ? _parseUser(userJson) : null,
    );
  }

  AuthUser _parseUser(Map<String, dynamic> jsonBody) {
    return AuthUser(
      id: jsonBody['id'] as String? ?? '',
      email: jsonBody['email'] as String? ?? '',
      name: jsonBody['name'] as String? ?? '',
      photoUrl: jsonBody['photoUrl'] as String?,
    );
  }

  Future<_BackendResponse> _sendRequest({
    required String path,
    String method = 'POST',
    Map<String, dynamic>? payload,
    String? accessToken,
    bool useAnonAuth = false,
    required String fallbackMessage,
  }) async {
    final resolvedBaseUrl = _baseUrl;
    final uri = Uri.parse('$resolvedBaseUrl$path');
    final headers = <String, String>{
      'Content-Type': 'application/json',
    };

    if (useAnonAuth) {
      headers['Authorization'] = 'Bearer ${SupabaseConfig.anonKey}';
    } else if (accessToken != null && accessToken.isNotEmpty) {
      headers['Authorization'] = 'Bearer $accessToken';
    }

    _logRequestDebug(
      uri: uri,
      method: method,
      headers: headers,
      payload: payload,
      useAnonAuth: useAnonAuth,
    );

    try {
      late final http.Response response;

      switch (method) {
        case 'GET':
          response = await _httpClient
              .get(uri, headers: headers)
              .timeout(const Duration(seconds: 15));
        case 'POST':
          response = await _httpClient
              .post(
                uri,
                headers: headers,
                body: payload == null ? null : jsonEncode(payload),
              )
              .timeout(const Duration(seconds: 15));
        default:
          throw const AuthRepositoryException('Unsupported HTTP method.');
      }

      return _BackendResponse.fromHttpResponse(
        response,
        fallbackMessage: fallbackMessage,
      );
    } on TimeoutException {
      throw const AuthRepositoryException(
        'The request timed out. Please try again.',
      );
    } on AuthRepositoryException {
      rethrow;
    } catch (_) {
      throw const AuthRepositoryException(
        'Connection error. Check your internet and try again.',
      );
    }
  }

  void _ensureSuccess(_BackendResponse response) {
    if (response.statusCode >= 200 && response.statusCode < 300) {
      return;
    }

    throw AuthRepositoryException(
      _extractMessage(
        response.jsonBody,
        fallbackMessage: response.fallbackMessage,
      ),
    );
  }

  String _extractMessage(
    Map<String, dynamic> jsonBody, {
    String fallbackMessage = 'Something went wrong. Please try again.',
  }) {
    final error = jsonBody['error'];
    if (error is String && error.trim().isNotEmpty) {
      return error;
    }

    final message = jsonBody['message'];
    if (message is String && message.trim().isNotEmpty) {
      return message;
    }

    return fallbackMessage;
  }

  void _logRequestDebug({
    required Uri uri,
    required String method,
    required Map<String, String> headers,
    required Map<String, dynamic>? payload,
    required bool useAnonAuth,
  }) {
    if (!kDebugMode) {
      return;
    }

    final authHeader = headers['Authorization'];
    final token =
        authHeader?.replaceFirst(RegExp(r'^Bearer\s+', caseSensitive: false), '');

    final maskedAuthHeader = authHeader == null
        ? null
        : 'Bearer ${_maskToken(token!)}';

    debugPrint('=== ANTOTI AUTH HTTP DEBUG ===');
    debugPrint('URL: $uri');
    debugPrint('METHOD: $method');
    final debugHeaders = <String, String>{...headers};
    if (maskedAuthHeader != null) {
      debugHeaders['Authorization'] = maskedAuthHeader;
    }

    debugPrint('HEADERS: ${jsonEncode(debugHeaders)}');
    debugPrint('BODY: ${payload == null ? 'null' : jsonEncode(payload)}');

    if (token != null) {
      debugPrint('AUTH TOKEN LENGTH: ${token.length}');
      debugPrint('AUTH TOKEN PREFIX: ${_tokenPrefix(token)}');
      debugPrint('AUTH TOKEN SUFFIX: ${_tokenSuffix(token)}');
      debugPrint('AUTH TOKEN HAS_QUOTES: ${token.contains('"') || token.contains("'")}');
      debugPrint('AUTH TOKEN HAS_WHITESPACE: ${RegExp(r'\s').hasMatch(token)}');
      debugPrint('AUTH TOKEN DOT COUNT: ${'.'.allMatches(token).length}');
      debugPrint('AUTH TOKEN IS_ANON_HEADER: $useAnonAuth');
    }

    debugPrint('==============================');
  }

  String _maskToken(String token) {
    if (token.length <= 12) {
      return token;
    }

    return '${_tokenPrefix(token)}...${_tokenSuffix(token)}';
  }

  String _tokenPrefix(String token) {
    return token.substring(0, token.length < 16 ? token.length : 16);
  }

  String _tokenSuffix(String token) {
    if (token.length <= 16) {
      return token;
    }

    return token.substring(token.length - 16);
  }
}

class UnconfiguredAuthRepository implements AuthRepository {
  const UnconfiguredAuthRepository();

  static const String _message =
      'Supabase is not configured. Run the app with '
      'SUPABASE_URL and SUPABASE_ANON_KEY.';

  @override
  Future<AuthActionResult> completeSession(AuthSession session) async {
    throw const AuthRepositoryException(_message);
  }

  @override
  Future<void> refreshSession() async {
    throw const AuthRepositoryException(_message);
  }

  @override
  Future<AuthActionResult> requestPasswordReset({required String email}) async {
    throw const AuthRepositoryException(_message);
  }

  @override
  Future<AuthActionResult> resetPassword({
    required String recoveryToken,
    required String newPassword,
  }) async {
    throw const AuthRepositoryException(_message);
  }

  @override
  Future<AuthActionResult> restoreSession() async {
    return const AuthActionResult();
  }

  @override
  Future<AuthActionResult> signInWithEmail({
    required String email,
    required String password,
  }) async {
    throw const AuthRepositoryException(_message);
  }

  @override
  Future<AuthActionResult> signInWithGoogle() async {
    throw const AuthRepositoryException(_message);
  }

  @override
  Future<void> signOut() async {
    await SessionStorage.clearSession();
  }

  @override
  Future<AuthActionResult> signUpWithEmail({
    required String email,
    required String password,
    required String name,
  }) async {
    throw const AuthRepositoryException(_message);
  }
}

class _BackendResponse {
  const _BackendResponse({
    required this.statusCode,
    required this.jsonBody,
    required this.fallbackMessage,
  });

  factory _BackendResponse.fromHttpResponse(
    http.Response response, {
    required String fallbackMessage,
  }) {
    if (response.body.isEmpty) {
      return _BackendResponse(
        statusCode: response.statusCode,
        jsonBody: const <String, dynamic>{},
        fallbackMessage: fallbackMessage,
      );
    }

    try {
      final decoded = jsonDecode(response.body);

      if (decoded is Map<String, dynamic>) {
        return _BackendResponse(
          statusCode: response.statusCode,
          jsonBody: decoded,
          fallbackMessage: fallbackMessage,
        );
      }
    } catch (_) {
      throw AuthRepositoryException(fallbackMessage);
    }

    throw AuthRepositoryException(fallbackMessage);
  }

  final int statusCode;
  final Map<String, dynamic> jsonBody;
  final String fallbackMessage;
}
