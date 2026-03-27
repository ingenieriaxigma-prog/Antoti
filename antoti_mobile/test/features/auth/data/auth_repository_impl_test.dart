import 'dart:convert';

import 'package:flutter_test/flutter_test.dart';
import 'package:http/http.dart' as http;
import 'package:http/testing.dart';
import 'package:mocktail/mocktail.dart';
import 'package:shared_preferences/shared_preferences.dart';
import 'package:supabase_flutter/supabase_flutter.dart' as sb;

import 'package:antoti_mobile/core/session/session_storage.dart';
import 'package:antoti_mobile/features/auth/data/auth_repository_impl.dart';
import 'package:antoti_mobile/features/auth/domain/auth_repository.dart';

class MockSupabaseClient extends Mock implements sb.SupabaseClient {}

class MockGoTrueClient extends Mock implements sb.GoTrueClient {}

void main() {
  TestWidgetsFlutterBinding.ensureInitialized();

  late MockSupabaseClient supabaseClient;
  late MockGoTrueClient goTrueClient;

  setUp(() {
    SharedPreferences.setMockInitialValues(<String, Object>{});
    SessionStorage.resetForTest();
    supabaseClient = MockSupabaseClient();
    goTrueClient = MockGoTrueClient();
    when(() => supabaseClient.auth).thenReturn(goTrueClient);
    when(() => goTrueClient.currentSession).thenReturn(null);
  });

  AuthRepositoryImpl buildRepository(
    Future<http.Response> Function(http.Request request) handler,
  ) {
    return AuthRepositoryImpl(
      supabaseClient,
      httpClient: MockClient(handler),
      baseUrl: 'https://example.com/functions/v1/make-server-727b50c3',
    );
  }

  test('login success returns session and backend message', () async {
    final repository = buildRepository((http.Request request) async {
      expect(request.url.path, '/functions/v1/make-server-727b50c3/login');
      expect(request.method, 'POST');
      expect(
        request.headers['Authorization'],
        startsWith('Bearer '),
      );
      expect(
        jsonDecode(request.body),
        <String, dynamic>{
          'email': 'user@example.com',
          'password': 'secret',
        },
      );

      return http.Response(
        jsonEncode(<String, dynamic>{
          'user': <String, dynamic>{
            'id': 'user-1',
            'email': 'user@example.com',
            'name': 'Antoti User',
            'photoUrl': null,
          },
          'access_token': 'access-token',
          'refresh_token': 'refresh-token',
          'message': 'Welcome back',
        }),
        200,
      );
    });

    final result = await repository.signInWithEmail(
      email: 'user@example.com',
      password: 'secret',
    );

    expect(result.session, isNotNull);
    expect(result.session?.accessToken, 'access-token');
    expect(result.session?.refreshToken, 'refresh-token');
    expect(result.message, 'Welcome back');
  });

  test('signup success returns session', () async {
    final repository = buildRepository((http.Request request) async {
      expect(request.url.path, '/functions/v1/make-server-727b50c3/signup');

      return http.Response(
        jsonEncode(<String, dynamic>{
          'user': <String, dynamic>{
            'id': 'user-2',
            'email': 'new@example.com',
            'name': 'New User',
            'photoUrl': null,
          },
          'access_token': 'signup-access',
          'refresh_token': 'signup-refresh',
        }),
        200,
      );
    });

    final result = await repository.signUpWithEmail(
      email: 'new@example.com',
      password: 'secret123',
      name: 'New User',
    );

    expect(result.requiresVerification, isFalse);
    expect(result.session?.accessToken, 'signup-access');
    expect(result.session?.refreshToken, 'signup-refresh');
  });

  test('signup requiresVerification returns message without session', () async {
    final repository = buildRepository((http.Request request) async {
      return http.Response(
        jsonEncode(<String, dynamic>{
          'requiresVerification': true,
          'message': 'Check your email to continue.',
        }),
        200,
      );
    });

    final result = await repository.signUpWithEmail(
      email: 'pending@example.com',
      password: 'secret123',
      name: 'Pending User',
    );

    expect(result.requiresVerification, isTrue);
    expect(result.session, isNull);
    expect(result.message, 'Check your email to continue.');
  });

  test('session success validates canonical user and saves session', () async {
    final repository = buildRepository((http.Request request) async {
      expect(request.method, 'GET');
      expect(request.url.path, '/functions/v1/make-server-727b50c3/session');
      expect(request.headers['Authorization'], 'Bearer access-token');

      return http.Response(
        jsonEncode(<String, dynamic>{
          'user': <String, dynamic>{
            'id': 'user-3',
            'email': 'session@example.com',
            'name': 'Session User',
            'photoUrl': 'https://example.com/photo.png',
          },
        }),
        200,
      );
    });

    final result = await repository.completeSession(
      const AuthSession(
        accessToken: 'access-token',
        refreshToken: 'refresh-token',
      ),
    );

    expect(result.isAuthenticated, isTrue);
    expect(result.user?.email, 'session@example.com');
    expect(result.user?.photoUrl, 'https://example.com/photo.png');

    final storedSession = await SessionStorage.readSession();
    expect(storedSession?.accessToken, 'access-token');
    expect(storedSession?.refreshToken, 'refresh-token');
  });

  test('session 401 triggers refresh and retries session', () async {
    var sessionHits = 0;

    final repository = buildRepository((http.Request request) async {
      if (request.url.path.endsWith('/session')) {
        sessionHits += 1;

        if (sessionHits == 1) {
          return http.Response(
            jsonEncode(<String, dynamic>{'error': 'Sesión inválida'}),
            401,
          );
        }

        expect(request.headers['Authorization'], 'Bearer refreshed-access');
        return http.Response(
          jsonEncode(<String, dynamic>{
            'user': <String, dynamic>{
              'id': 'user-4',
              'email': 'refresh@example.com',
              'name': 'Refresh User',
              'photoUrl': null,
            },
          }),
          200,
        );
      }

      expect(request.url.path, '/functions/v1/make-server-727b50c3/refresh-token');
      expect(jsonDecode(request.body), <String, dynamic>{
        'refresh_token': 'stale-refresh',
      });

      return http.Response(
        jsonEncode(<String, dynamic>{
          'access_token': 'refreshed-access',
          'refresh_token': 'refreshed-refresh',
          'user': <String, dynamic>{
            'id': 'user-4',
            'email': 'refresh@example.com',
            'name': 'Refresh User',
          },
        }),
        200,
      );
    });

    final result = await repository.completeSession(
      const AuthSession(
        accessToken: 'stale-access',
        refreshToken: 'stale-refresh',
      ),
    );

    expect(result.isAuthenticated, isTrue);
    expect(result.session?.accessToken, 'refreshed-access');
    expect(result.session?.refreshToken, 'refreshed-refresh');
    expect(result.user?.name, 'Refresh User');
  });

  test('forgot-password returns backend message', () async {
    final repository = buildRepository((http.Request request) async {
      expect(request.url.path, '/functions/v1/make-server-727b50c3/forgot-password');

      return http.Response(
        jsonEncode(<String, dynamic>{
          'message': 'Recovery email sent.',
        }),
        200,
      );
    });

    final result = await repository.requestPasswordReset(
      email: 'forgot@example.com',
    );

    expect(result.message, 'Recovery email sent.');
  });

  test('reset-password returns backend message', () async {
    final repository = buildRepository((http.Request request) async {
      expect(request.url.path, '/functions/v1/make-server-727b50c3/reset-password');
      expect(request.headers['Authorization'], 'Bearer recovery-token');

      return http.Response(
        jsonEncode(<String, dynamic>{
          'message': 'Password updated successfully.',
        }),
        200,
      );
    });

    final result = await repository.resetPassword(
      recoveryToken: 'recovery-token',
      newPassword: 'new-secret',
    );

    expect(result.message, 'Password updated successfully.');
  });

  test('logout clears session even when Supabase signOut fails', () async {
    await SessionStorage.saveSession(
      accessToken: 'access-token',
      refreshToken: 'refresh-token',
    );

    when(() => goTrueClient.signOut()).thenThrow(Exception('signOut failed'));

    final repository = buildRepository((http.Request request) async {
      throw UnimplementedError('HTTP should not be called during signOut.');
    });

    await repository.signOut();

    expect(await SessionStorage.readSession(), isNull);
  });

  test('empty body on login yields incomplete authentication response error', () async {
    final repository = buildRepository((http.Request request) async {
      return http.Response('', 200);
    });

    expect(
      () => repository.signInWithEmail(
        email: 'user@example.com',
        password: 'secret',
      ),
      throwsA(
        isA<AuthRepositoryException>().having(
          (AuthRepositoryException error) => error.message,
          'message',
          'The authentication response is incomplete.',
        ),
      ),
    );
  });

  test('non parseable body uses request fallback message', () async {
    final repository = buildRepository((http.Request request) async {
      return http.Response('this is not json', 500);
    });

    expect(
      () => repository.signInWithEmail(
        email: 'user@example.com',
        password: 'secret',
      ),
      throwsA(
        isA<AuthRepositoryException>().having(
          (AuthRepositoryException error) => error.message,
          'message',
          'Unable to sign in right now.',
        ),
      ),
    );
  });

  test('error takes precedence over message and fallback', () async {
    final repository = buildRepository((http.Request request) async {
      return http.Response(
        jsonEncode(<String, dynamic>{
          'error': 'Primary backend error',
          'message': 'Secondary backend message',
        }),
        401,
      );
    });

    expect(
      () => repository.signInWithEmail(
        email: 'user@example.com',
        password: 'secret',
      ),
      throwsA(
        isA<AuthRepositoryException>().having(
          (AuthRepositoryException error) => error.message,
          'message',
          'Primary backend error',
        ),
      ),
    );
  });

  test('message is used when error is absent', () async {
    final repository = buildRepository((http.Request request) async {
      return http.Response(
        jsonEncode(<String, dynamic>{
          'message': 'Backend-only message',
        }),
        401,
      );
    });

    expect(
      () => repository.signInWithEmail(
        email: 'user@example.com',
        password: 'secret',
      ),
      throwsA(
        isA<AuthRepositoryException>().having(
          (AuthRepositoryException error) => error.message,
          'message',
          'Backend-only message',
        ),
      ),
    );
  });
}
