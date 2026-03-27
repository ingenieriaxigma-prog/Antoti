import 'package:flutter_test/flutter_test.dart';

import 'package:antoti_mobile/features/auth/domain/auth_repository.dart';
import 'package:antoti_mobile/features/auth/presentation/controllers/auth_controller.dart';
import 'package:antoti_mobile/features/auth/presentation/controllers/auth_state.dart';

class TestAuthRepository implements AuthRepository {
  TestAuthRepository({
    required this.restoreSessionHandler,
    required this.signInWithEmailHandler,
    required this.signUpWithEmailHandler,
    required this.signInWithGoogleHandler,
    required this.refreshSessionHandler,
    required this.requestPasswordResetHandler,
    required this.resetPasswordHandler,
    required this.signOutHandler,
    required this.completeSessionHandler,
  });

  Future<AuthActionResult> Function() restoreSessionHandler;
  Future<AuthActionResult> Function({
    required String email,
    required String password,
  }) signInWithEmailHandler;
  Future<AuthActionResult> Function({
    required String email,
    required String password,
    required String name,
  }) signUpWithEmailHandler;
  Future<AuthActionResult> Function() signInWithGoogleHandler;
  Future<void> Function() refreshSessionHandler;
  Future<AuthActionResult> Function({
    required String email,
  }) requestPasswordResetHandler;
  Future<AuthActionResult> Function({
    required String recoveryToken,
    required String newPassword,
  }) resetPasswordHandler;
  Future<void> Function() signOutHandler;
  Future<AuthActionResult> Function(AuthSession session) completeSessionHandler;

  @override
  Future<AuthActionResult> completeSession(AuthSession session) {
    return completeSessionHandler(session);
  }

  @override
  Future<void> refreshSession() {
    return refreshSessionHandler();
  }

  @override
  Future<AuthActionResult> requestPasswordReset({required String email}) {
    return requestPasswordResetHandler(email: email);
  }

  @override
  Future<AuthActionResult> resetPassword({
    required String recoveryToken,
    required String newPassword,
  }) {
    return resetPasswordHandler(
      recoveryToken: recoveryToken,
      newPassword: newPassword,
    );
  }

  @override
  Future<AuthActionResult> restoreSession() {
    return restoreSessionHandler();
  }

  @override
  Future<AuthActionResult> signInWithEmail({
    required String email,
    required String password,
  }) {
    return signInWithEmailHandler(email: email, password: password);
  }

  @override
  Future<AuthActionResult> signInWithGoogle() {
    return signInWithGoogleHandler();
  }

  @override
  Future<void> signOut() {
    return signOutHandler();
  }

  @override
  Future<AuthActionResult> signUpWithEmail({
    required String email,
    required String password,
    required String name,
  }) {
    return signUpWithEmailHandler(
      email: email,
      password: password,
      name: name,
    );
  }
}

void main() {
  const authUser = AuthUser(
    id: 'user-1',
    email: 'user@example.com',
    name: 'Antoti User',
  );

  late TestAuthRepository repository;
  late AuthController controller;

  setUp(() {
    repository = TestAuthRepository(
      restoreSessionHandler: () async => const AuthActionResult(),
      signInWithEmailHandler: ({
        required String email,
        required String password,
      }) async =>
          const AuthActionResult(),
      signUpWithEmailHandler: ({
        required String email,
        required String password,
        required String name,
      }) async =>
          const AuthActionResult(),
      signInWithGoogleHandler: () async => const AuthActionResult(),
      refreshSessionHandler: () async {},
      requestPasswordResetHandler: ({
        required String email,
      }) async =>
          const AuthActionResult(),
      resetPasswordHandler: ({
        required String recoveryToken,
        required String newPassword,
      }) async =>
          const AuthActionResult(),
      signOutHandler: () async {},
      completeSessionHandler: (AuthSession session) async => const AuthActionResult(),
    );
    controller = AuthController(repository, autoRestore: false);
  });

  test('login success authenticates after completeSession', () async {
    repository.signInWithEmailHandler = ({
      required String email,
      required String password,
    }) async =>
        const AuthActionResult(
          session: AuthSession(
            accessToken: 'access-token',
            refreshToken: 'refresh-token',
          ),
        );
    repository.completeSessionHandler = (AuthSession session) async => const AuthActionResult(
          isAuthenticated: true,
          user: authUser,
          session: AuthSession(
            accessToken: 'access-token',
            refreshToken: 'refresh-token',
            user: authUser,
          ),
        );

    await controller.signInWithEmail(
      email: 'user@example.com',
      password: 'secret',
    );

    expect(controller.state.status, AuthStatus.authenticated);
    expect(controller.state.user?.email, 'user@example.com');
  });

  test('signup requiresVerification updates state accordingly', () async {
    repository.signUpWithEmailHandler = ({
      required String email,
      required String password,
      required String name,
    }) async =>
        const AuthActionResult(
          requiresVerification: true,
          message: 'Check your email.',
        );

    await controller.signUpWithEmail(
      email: 'new@example.com',
      password: 'secret123',
      name: 'New User',
    );

    expect(controller.state.status, AuthStatus.requiresVerification);
    expect(controller.state.message, 'Check your email.');
  });

  test('restoreSession success authenticates user', () async {
    repository.restoreSessionHandler = () async => const AuthActionResult(
          isAuthenticated: true,
          user: authUser,
          session: AuthSession(
            accessToken: 'access-token',
            refreshToken: 'refresh-token',
            user: authUser,
          ),
        );

    await controller.restoreSession();

    expect(controller.state.status, AuthStatus.authenticated);
    expect(controller.state.user?.name, 'Antoti User');
  });

  test('restoreSession failure produces error state', () async {
    repository.restoreSessionHandler = () async {
      throw const AuthRepositoryException('Session failed.');
    };

    await controller.restoreSession();

    expect(controller.state.status, AuthStatus.error);
    expect(controller.state.errorMessage, 'Session failed.');
  });

  test('forgot-password propagates backend message', () async {
    repository.requestPasswordResetHandler = ({
      required String email,
    }) async =>
        const AuthActionResult(
          message: 'Recovery email sent.',
        );

    await controller.requestPasswordReset('user@example.com');

    expect(controller.state.status, AuthStatus.unauthenticated);
    expect(controller.state.message, 'Recovery email sent.');
  });

  test('reset-password propagates backend message', () async {
    repository.resetPasswordHandler = ({
      required String recoveryToken,
      required String newPassword,
    }) async =>
        const AuthActionResult(
          message: 'Password updated successfully.',
        );

    await controller.resetPassword(
      recoveryToken: 'recovery-token',
      newPassword: 'secret123',
    );

    expect(controller.state.status, AuthStatus.unauthenticated);
    expect(controller.state.message, 'Password updated successfully.');
  });

  test('signOut ends in unauthenticated state', () async {
    await controller.signOut();

    expect(controller.state.status, AuthStatus.unauthenticated);
    expect(controller.state.user, isNull);
  });
}
