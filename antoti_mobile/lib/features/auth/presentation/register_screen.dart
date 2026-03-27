import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';

import 'auth_scaffold.dart';
import 'controllers/auth_controller.dart';
import 'controllers/auth_state.dart';

class RegisterScreen extends ConsumerStatefulWidget {
  const RegisterScreen({super.key});

  @override
  ConsumerState<RegisterScreen> createState() => _RegisterScreenState();
}

class _RegisterScreenState extends ConsumerState<RegisterScreen> {
  late final TextEditingController _nameController;
  late final TextEditingController _emailController;
  late final TextEditingController _passwordController;

  @override
  void initState() {
    super.initState();
    _nameController = TextEditingController();
    _emailController = TextEditingController();
    _passwordController = TextEditingController();
  }

  @override
  void dispose() {
    _nameController.dispose();
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
      title: 'Create your ANTOTI account',
      subtitle:
          'Use Google to get started quickly, or register with email and password.',
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
            controller: _nameController,
            textCapitalization: TextCapitalization.words,
            decoration: const InputDecoration(
              labelText: 'Name',
              hintText: 'Your name',
            ),
          ),
          const SizedBox(height: 14),
          TextField(
            controller: _emailController,
            keyboardType: TextInputType.emailAddress,
            autofillHints: const <String>[AutofillHints.newUsername],
            decoration: const InputDecoration(
              labelText: 'Email',
              hintText: 'you@example.com',
            ),
          ),
          const SizedBox(height: 14),
          TextField(
            controller: _passwordController,
            obscureText: true,
            autofillHints: const <String>[AutofillHints.newPassword],
            decoration: const InputDecoration(
              labelText: 'Password',
              helperText: 'Use at least 6 characters.',
            ),
          ),
          const SizedBox(height: 16),
          OutlinedButton.icon(
            onPressed: state.isLoading
                ? null
                : () => ref.read(authControllerProvider.notifier).signUpWithEmail(
                      name: _nameController.text,
                      email: _emailController.text,
                      password: _passwordController.text,
                    ),
            style: OutlinedButton.styleFrom(
              minimumSize: const Size.fromHeight(56),
            ),
            icon: const Icon(Icons.alternate_email_rounded),
            label: Text(state.isLoading ? 'Please wait...' : 'Continue with Email'),
          ),
        ],
      ),
      statusBanner: state.isLoading
          ? const LinearProgressIndicator(minHeight: 3)
          : null,
      footerPrompt: 'Already have an account?',
      footerActionLabel: 'Login',
      onFooterTap: () => context.go('/auth/login'),
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
