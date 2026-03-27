import 'dart:async';

import 'package:flutter_test/flutter_test.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';

import 'package:antoti_mobile/app/antoti_app.dart';
import 'package:antoti_mobile/app/router/app_router.dart';
import 'package:antoti_mobile/core/providers/auth_providers.dart';
import 'package:antoti_mobile/features/auth/domain/auth_repository.dart';
import 'package:antoti_mobile/features/home/presentation/home_screen.dart';

class SplashTestAuthRepository implements AuthRepository {
  SplashTestAuthRepository({
    required this.restoreSessionHandler,
  });

  Future<AuthActionResult> Function() restoreSessionHandler;

  @override
  Future<AuthActionResult> restoreSession() => restoreSessionHandler();

  @override
  Future<AuthActionResult> completeSession(AuthSession session) async {
    throw UnimplementedError();
  }

  @override
  Future<void> refreshSession() async {}

  @override
  Future<AuthActionResult> requestPasswordReset({required String email}) async {
    throw UnimplementedError();
  }

  @override
  Future<AuthActionResult> resetPassword({
    required String recoveryToken,
    required String newPassword,
  }) async {
    throw UnimplementedError();
  }

  @override
  Future<AuthActionResult> signInWithEmail({
    required String email,
    required String password,
  }) async {
    throw UnimplementedError();
  }

  @override
  Future<AuthActionResult> signInWithGoogle() async {
    throw UnimplementedError();
  }

  @override
  Future<void> signOut() async {}

  @override
  Future<AuthActionResult> signUpWithEmail({
    required String email,
    required String password,
    required String name,
  }) async {
    throw UnimplementedError();
  }
}

void main() {
  TestWidgetsFlutterBinding.ensureInitialized();

  setUp(() {
    appRouter.go('/');
  });

  testWidgets('loading does not navigate prematurely', (WidgetTester tester) async {
    final completer = Completer<AuthActionResult>();
    final repository = SplashTestAuthRepository(
      restoreSessionHandler: () => completer.future,
    );

    await tester.pumpWidget(
      ProviderScope(
        overrides: <Override>[
          authRepositoryProvider.overrideWithValue(repository),
        ],
        child: const AntotiApp(),
      ),
    );

    await tester.pump(const Duration(milliseconds: 1300));

    expect(find.text('ANTOTI'), findsOneWidget);
    expect(find.text('Welcome to ANTOTI'), findsNothing);
    expect(find.text('Home'), findsNothing);
  });

  testWidgets('authenticated session navigates to /home', (WidgetTester tester) async {
    final repository = SplashTestAuthRepository(
      restoreSessionHandler: () async => const AuthActionResult(
        isAuthenticated: true,
        user: AuthUser(
          id: 'user-1',
          email: 'user@example.com',
          name: 'Antoti User',
        ),
        session: AuthSession(
          accessToken: 'access-token',
          refreshToken: 'refresh-token',
        ),
      ),
    );

    await tester.pumpWidget(
      ProviderScope(
        overrides: <Override>[
          authRepositoryProvider.overrideWithValue(repository),
        ],
        child: const AntotiApp(),
      ),
    );

    await tester.pump(const Duration(milliseconds: 1300));
    await tester.pumpAndSettle();

    expect(find.byType(HomeScreen), findsOneWidget);
  });

  testWidgets('unauthenticated session navigates to /auth/login', (
    WidgetTester tester,
  ) async {
    final repository = SplashTestAuthRepository(
      restoreSessionHandler: () async => const AuthActionResult(),
    );

    await tester.pumpWidget(
      ProviderScope(
        overrides: <Override>[
          authRepositoryProvider.overrideWithValue(repository),
        ],
        child: const AntotiApp(),
      ),
    );

    await tester.pump(const Duration(milliseconds: 1300));
    await tester.pumpAndSettle();

    expect(appRouter.routerDelegate.currentConfiguration.uri.path, '/auth/login');
  });
}
