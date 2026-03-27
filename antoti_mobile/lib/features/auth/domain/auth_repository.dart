class AuthUser {
  const AuthUser({
    required this.id,
    required this.email,
    required this.name,
    this.photoUrl,
  });

  final String id;
  final String email;
  final String name;
  final String? photoUrl;
}

class AuthSession {
  const AuthSession({
    required this.accessToken,
    required this.refreshToken,
    this.user,
  });

  final String accessToken;
  final String refreshToken;
  final AuthUser? user;
}

class AuthActionResult {
  const AuthActionResult({
    this.user,
    this.session,
    this.message,
    this.requiresVerification = false,
    this.isAuthenticated = false,
  });

  final AuthUser? user;
  final AuthSession? session;
  final String? message;
  final bool requiresVerification;
  final bool isAuthenticated;
}

class AuthRepositoryException implements Exception {
  const AuthRepositoryException(this.message);

  final String message;

  @override
  String toString() => message;
}

abstract class AuthRepository {
  Future<AuthActionResult> restoreSession();

  Future<AuthActionResult> completeSession(AuthSession session);

  Future<AuthActionResult> signInWithEmail({
    required String email,
    required String password,
  });

  Future<AuthActionResult> signUpWithEmail({
    required String email,
    required String password,
    required String name,
  });

  Future<AuthActionResult> signInWithGoogle();

  Future<void> refreshSession();

  Future<AuthActionResult> requestPasswordReset({
    required String email,
  });

  Future<AuthActionResult> resetPassword({
    required String recoveryToken,
    required String newPassword,
  });

  Future<void> signOut();
}
