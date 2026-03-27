import '../../domain/auth_repository.dart';

enum AuthStatus {
  loading,
  unauthenticated,
  authenticated,
  requiresVerification,
  error,
}

class AuthState {
  const AuthState({
    required this.status,
    this.user,
    this.accessToken,
    this.refreshToken,
    this.message,
    this.errorMessage,
  });

  const AuthState.loading()
      : status = AuthStatus.loading,
        user = null,
        accessToken = null,
        refreshToken = null,
        message = null,
        errorMessage = null;

  const AuthState.unauthenticated({
    this.user,
    this.accessToken,
    this.refreshToken,
    this.message,
    this.errorMessage,
  }) : status = AuthStatus.unauthenticated;

  const AuthState.authenticated({
    required this.user,
    this.accessToken,
    this.refreshToken,
    this.message,
  })  : status = AuthStatus.authenticated,
        errorMessage = null;

  const AuthState.requiresVerification({
    this.message,
  })  : status = AuthStatus.requiresVerification,
        user = null,
        accessToken = null,
        refreshToken = null,
        errorMessage = null;

  const AuthState.error(this.errorMessage)
      : status = AuthStatus.error,
        user = null,
        accessToken = null,
        refreshToken = null,
        message = null;

  final AuthStatus status;
  final AuthUser? user;
  final String? accessToken;
  final String? refreshToken;
  final String? message;
  final String? errorMessage;

  bool get isLoading => status == AuthStatus.loading;
  bool get isAuthenticated => status == AuthStatus.authenticated;
}
