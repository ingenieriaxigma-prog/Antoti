import 'package:flutter/foundation.dart';

class SupabaseConfig {
  SupabaseConfig._();

  static const String _rawUrl = String.fromEnvironment('SUPABASE_URL');
  static const String _rawViteUrl = String.fromEnvironment('VITE_SUPABASE_URL');
  static const String _rawAnonKey = String.fromEnvironment('SUPABASE_ANON_KEY');
  static const String _rawViteAnonKey =
      String.fromEnvironment('VITE_SUPABASE_ANON_KEY');
  static const String authFunctionPath = '/functions/v1/make-server-727b50c3';
  static const String oauthRedirectUrl = String.fromEnvironment(
    'SUPABASE_OAUTH_REDIRECT_URL',
    defaultValue: 'io.antoti.mobile://login-callback',
  );

  static String get url => _firstNonEmpty(_rawUrl, _rawViteUrl);
  static String get anonKey => _firstNonEmpty(_rawAnonKey, _rawViteAnonKey);
  static bool get isConfigured => url.isNotEmpty && anonKey.isNotEmpty;
  static String get functionsBaseUrl => '$url$authFunctionPath';
  static int get anonKeyLength => anonKey.length;
  static int get anonKeyDotCount => '.'.allMatches(anonKey).length;
  static bool get hasAnonKey => anonKey.isNotEmpty;

  static String? get mobileRedirectUrl {
    if (kIsWeb || oauthRedirectUrl.isEmpty) {
      return null;
    }

    return oauthRedirectUrl;
  }

  static String _sanitizeEnvValue(String value) {
    final trimmed = value.trim();
    final withoutLineBreaks = trimmed.replaceAll(RegExp(r'[\r\n\t]'), '');

    if (withoutLineBreaks.length >= 2) {
      final hasDoubleQuotes =
          withoutLineBreaks.startsWith('"') && withoutLineBreaks.endsWith('"');
      final hasSingleQuotes =
          withoutLineBreaks.startsWith("'") && withoutLineBreaks.endsWith("'");

      if (hasDoubleQuotes || hasSingleQuotes) {
        return _normalizeTokenCandidate(
          withoutLineBreaks.substring(1, withoutLineBreaks.length - 1).trim(),
        );
      }
    }

    return _normalizeTokenCandidate(withoutLineBreaks);
  }

  static String _firstNonEmpty(String primary, String fallback) {
    final normalizedPrimary = _sanitizeEnvValue(primary);
    if (normalizedPrimary.isNotEmpty) {
      return normalizedPrimary;
    }

    return _sanitizeEnvValue(fallback);
  }

  static String _normalizeTokenCandidate(String value) {
    final normalizedBearer = value.replaceFirst(
      RegExp(r'^Bearer\s+', caseSensitive: false),
      '',
    );

    return normalizedBearer.trim();
  }
}
