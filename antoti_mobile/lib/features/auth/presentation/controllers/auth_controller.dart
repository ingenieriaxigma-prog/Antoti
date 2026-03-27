import 'dart:async';

import 'package:flutter_riverpod/flutter_riverpod.dart';

import '../../../../core/providers/auth_providers.dart';
import '../../domain/auth_repository.dart';
import 'auth_state.dart';

final authControllerProvider =
    StateNotifierProvider<AuthController, AuthState>((Ref ref) {
      final repository = ref.watch(authRepositoryProvider);
      return AuthController(repository);
    });

class AuthController extends StateNotifier<AuthState> {
  AuthController(
    this._repository, {
    bool autoRestore = true,
  }) : super(const AuthState.loading()) {
    if (autoRestore) {
      unawaited(restoreSession());
    }
  }

  final AuthRepository _repository;

  Future<void> restoreSession() async {
    state = const AuthState.loading();

    try {
      final result = await _repository.restoreSession();
      _applyResult(result);
    } catch (error) {
      state = AuthState.error(_mapError(error));
    }
  }

  Future<void> signInWithEmail({
    required String email,
    required String password,
  }) async {
    final normalizedEmail = email.trim();

    if (!_isValidEmail(normalizedEmail)) {
      state = const AuthState.error('Enter a valid email address.');
      return;
    }

    if (password.isEmpty) {
      state = const AuthState.error('Enter your password.');
      return;
    }

    state = const AuthState.loading();

    try {
      final signInResult = await _repository.signInWithEmail(
        email: normalizedEmail,
        password: password,
      );

      final session = signInResult.session;

      if (session == null) {
        _applyResult(signInResult);
        return;
      }

      final authenticatedResult = await _repository.completeSession(session);
      _applyResult(authenticatedResult);
    } catch (error) {
      state = AuthState.error(_mapError(error));
    }
  }

  Future<void> signUpWithEmail({
    required String email,
    required String password,
    required String name,
  }) async {
    final normalizedEmail = email.trim();
    final normalizedName = name.trim();

    if (normalizedName.isEmpty) {
      state = const AuthState.error('Enter your name.');
      return;
    }

    if (!_isValidEmail(normalizedEmail)) {
      state = const AuthState.error('Enter a valid email address.');
      return;
    }

    if (password.length < 6) {
      state = const AuthState.error('Password must be at least 6 characters long.');
      return;
    }

    state = const AuthState.loading();

    try {
      final signUpResult = await _repository.signUpWithEmail(
        email: normalizedEmail,
        password: password,
        name: normalizedName,
      );

      if (signUpResult.requiresVerification) {
        _applyResult(signUpResult);
        return;
      }

      final session = signUpResult.session;

      if (session == null) {
        _applyResult(signUpResult);
        return;
      }

      final authenticatedResult = await _repository.completeSession(session);
      _applyResult(authenticatedResult);
    } catch (error) {
      state = AuthState.error(_mapError(error));
    }
  }

  Future<void> signInWithGoogle() async {
    state = const AuthState.loading();

    try {
      final result = await _repository.signInWithGoogle();
      _applyResult(result);
    } catch (error) {
      state = AuthState.error(_mapError(error));
    }
  }

  Future<void> requestPasswordReset(String email) async {
    final normalizedEmail = email.trim();

    if (!_isValidEmail(normalizedEmail)) {
      state = const AuthState.error('Enter a valid email address.');
      return;
    }

    state = const AuthState.loading();

    try {
      final result = await _repository.requestPasswordReset(email: normalizedEmail);
      state = AuthState.unauthenticated(
        message: result.message,
      );
    } catch (error) {
      state = AuthState.error(_mapError(error));
    }
  }

  Future<void> resetPassword({
    required String recoveryToken,
    required String newPassword,
  }) async {
    if (newPassword.length < 6) {
      state = const AuthState.error('Password must be at least 6 characters long.');
      return;
    }

    state = const AuthState.loading();

    try {
      final result = await _repository.resetPassword(
        recoveryToken: recoveryToken,
        newPassword: newPassword,
      );
      state = AuthState.unauthenticated(
        message: result.message,
      );
    } catch (error) {
      state = AuthState.error(_mapError(error));
    }
  }

  Future<void> signOut() async {
    await _repository.signOut();
    state = const AuthState.unauthenticated();
  }

  void clearFeedback() {
    final user = state.user;

    if (user != null) {
      state = AuthState.authenticated(
        user: user,
        accessToken: state.accessToken,
        refreshToken: state.refreshToken,
      );
      return;
    }

    state = const AuthState.unauthenticated();
  }

  void _applyResult(AuthActionResult result) {
    final accessToken = result.session?.accessToken;
    final refreshToken = result.session?.refreshToken;

    if (result.isAuthenticated && result.user != null) {
      state = AuthState.authenticated(
        user: result.user!,
        accessToken: accessToken,
        refreshToken: refreshToken,
        message: result.message,
      );
      return;
    }

    if (result.requiresVerification) {
      state = AuthState.requiresVerification(
        message: result.message,
      );
      return;
    }

    state = AuthState.unauthenticated(
      user: result.user,
      accessToken: accessToken,
      refreshToken: refreshToken,
      message: result.message,
    );
  }

  bool _isValidEmail(String value) {
    return value.contains('@') && value.contains('.');
  }

  String _mapError(Object error) {
    if (error is AuthRepositoryException) {
      return error.message;
    }

    return 'Something went wrong. Please try again.';
  }
}
