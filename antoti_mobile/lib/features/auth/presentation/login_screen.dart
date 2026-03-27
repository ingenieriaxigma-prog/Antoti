import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';

import 'auth_scaffold.dart';
import 'controllers/auth_controller.dart';
import 'controllers/auth_state.dart';

class LoginScreen extends ConsumerStatefulWidget {
  const LoginScreen({super.key});

  @override
  ConsumerState<LoginScreen> createState() => _LoginScreenState();
}

class _LoginScreenState extends ConsumerState<LoginScreen> {
  late final TextEditingController _emailController;
  late final TextEditingController _passwordController;

  @override
  void initState() {
    super.initState();
    _emailController = TextEditingController();
    _passwordController = TextEditingController();
  }

  @override
  void dispose() {
    _emailController.dispose();
    _passwordController.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    ref.listen<AuthState>(authControllerProvider, (AuthState? previous, AuthState next) {
      if (previous?.status != next.status &&
          next.status == AuthStatus.authenticated) {
        context.go('/home');
        ref.read(authControllerProvider.notifier).clearFeedback();
        return;
      }

      if (next.errorMessage != null && previous?.errorMessage != next.errorMessage) {
        _showMessage(next.errorMessage!, isError: true);
        ref.read(authControllerProvider.notifier).clearFeedback();
      } else if (next.message != null &&
          previous?.message != next.message) {
        _showMessage(next.message!);
        ref.read(authControllerProvider.notifier).clearFeedback();
      }
    });

    final state = ref.watch(authControllerProvider);

    return AuthScaffold(
      title: 'Welcome to ANTOTI',
      subtitle:
          'Start with Google for the fastest setup, or continue with email.',
      primaryAction: FilledButton.icon(
        onPressed: state.isLoading
            ? null
            : () => ref.read(authControllerProvider.notifier).signInWithGoogle(),
        style: FilledButton.styleFrom(
          minimumSize: const Size.fromHeight(56),
        ),
        icon: const Icon(Icons.g_mobiledata_rounded, size: 28),
        label: Text(state.isLoading ? 'Please wait...' : 'Continue with Google'),
      ),
      secondaryAction: Column(
        crossAxisAlignment: CrossAxisAlignment.stretch,
        children: <Widget>[
          TextField(
            controller: _emailController,
            keyboardType: TextInputType.emailAddress,
            autofillHints: const <String>[AutofillHints.email],
            decoration: const InputDecoration(
              labelText: 'Email',
              hintText: 'you@example.com',
            ),
          ),
          const SizedBox(height: 14),
          TextField(
            controller: _passwordController,
            obscureText: true,
            autofillHints: const <String>[AutofillHints.password],
            decoration: const InputDecoration(
              labelText: 'Password',
            ),
          ),
          const SizedBox(height: 16),
          OutlinedButton.icon(
            onPressed: state.isLoading
                ? null
                : () => ref.read(authControllerProvider.notifier).signInWithEmail(
                      email: _emailController.text,
                      password: _passwordController.text,
                    ),
            style: OutlinedButton.styleFrom(
              minimumSize: const Size.fromHeight(56),
            ),
            icon: const Icon(Icons.mail_outline_rounded),
            label: Text(state.isLoading ? 'Please wait...' : 'Continue with Email'),
          ),
        ],
      ),
      statusBanner: state.isLoading
          ? const LinearProgressIndicator(minHeight: 3)
          : null,
      footerPrompt: 'Need an account?',
      footerActionLabel: 'Register',
      onFooterTap: () => context.go('/auth/register'),
    );
  }

  void _showMessage(String message, {bool isError = false}) {
    final colorScheme = Theme.of(context).colorScheme;

    ScaffoldMessenger.of(context)
      ..hideCurrentSnackBar()
      ..showSnackBar(
        SnackBar(
          content: Text(message),
          backgroundColor: isError ? colorScheme.error : null,
        ),
      );
  }
}
