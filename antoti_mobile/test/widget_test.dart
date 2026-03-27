import 'package:flutter_test/flutter_test.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';

import 'package:antoti_mobile/app/antoti_app.dart';
import 'package:antoti_mobile/core/providers/auth_providers.dart';
import 'package:antoti_mobile/features/auth/domain/auth_repository.dart';

class _WidgetTestAuthRepository implements AuthRepository {
  const _WidgetTestAuthRepository();

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
  Future<AuthActionResult> restoreSession() async {
    return const AuthActionResult();
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
  testWidgets('navigates from splash to auth flow and switches between screens', (
    WidgetTester tester,
  ) async {
    await tester.pumpWidget(
      ProviderScope(
        overrides: <Override>[
          authRepositoryProvider.overrideWithValue(
            const _WidgetTestAuthRepository(),
          ),
        ],
        child: AntotiApp(),
      ),
    );

    expect(find.text('ANTOTI'), findsOneWidget);
    expect(find.text('Personal Finance Assistant'), findsOneWidget);

    await tester.pump(const Duration(milliseconds: 1300));
    await tester.pumpAndSettle();

    expect(find.text('Welcome to ANTOTI'), findsOneWidget);
    expect(
      find.text('Continue with Google'),
      findsOneWidget,
    );
    expect(find.text('Continue with Email'), findsOneWidget);

    await tester.ensureVisible(find.text('Register'));
    await tester.tap(find.text('Register'));
    await tester.pumpAndSettle();

    expect(find.text('Create your ANTOTI account'), findsOneWidget);
    expect(find.text('Name'), findsOneWidget);
    expect(
      find.text('Continue with Google'),
      findsOneWidget,
    );
    expect(find.text('Continue with Email'), findsOneWidget);

    await tester.ensureVisible(find.text('Login'));
    await tester.tap(find.text('Login'));
    await tester.pumpAndSettle();

    expect(find.text('Welcome to ANTOTI'), findsOneWidget);
  });
}
