import 'package:flutter/material.dart';

class AuthScaffold extends StatelessWidget {
  const AuthScaffold({
    required this.title,
    required this.subtitle,
    required this.primaryAction,
    required this.secondaryAction,
    required this.footerPrompt,
    required this.footerActionLabel,
    required this.onFooterTap,
    this.statusBanner,
    super.key,
  });

  final String title;
  final String subtitle;
  final Widget primaryAction;
  final Widget secondaryAction;
  final String footerPrompt;
  final String footerActionLabel;
  final VoidCallback onFooterTap;
  final Widget? statusBanner;

  @override
  Widget build(BuildContext context) {
    final colorScheme = Theme.of(context).colorScheme;
    final textTheme = Theme.of(context).textTheme;

    return Scaffold(
      body: DecoratedBox(
        decoration: BoxDecoration(
          gradient: LinearGradient(
            begin: Alignment.topCenter,
            end: Alignment.bottomCenter,
            colors: <Color>[
              colorScheme.surface,
              const Color(0xFFEAF2F4),
            ],
          ),
        ),
        child: SafeArea(
          child: Center(
            child: SingleChildScrollView(
              padding: const EdgeInsets.symmetric(horizontal: 24, vertical: 32),
              child: ConstrainedBox(
                constraints: const BoxConstraints(maxWidth: 420),
                child: DecoratedBox(
                  decoration: BoxDecoration(
                    color: Colors.white,
                    borderRadius: BorderRadius.circular(32),
                    boxShadow: <BoxShadow>[
                      BoxShadow(
                        color: colorScheme.shadow.withValues(alpha: 0.08),
                        blurRadius: 32,
                        offset: const Offset(0, 16),
                      ),
                    ],
                  ),
                  child: Padding(
                    padding: const EdgeInsets.all(28),
                    child: Column(
                      mainAxisSize: MainAxisSize.min,
                      crossAxisAlignment: CrossAxisAlignment.stretch,
                      children: <Widget>[
                        Container(
                          width: 72,
                          height: 72,
                          decoration: BoxDecoration(
                            color: colorScheme.primary,
                            borderRadius: BorderRadius.circular(24),
                          ),
                          alignment: Alignment.center,
                          child: Text(
                            'A',
                            style: textTheme.headlineMedium?.copyWith(
                              color: colorScheme.onPrimary,
                            ),
                          ),
                        ),
                        const SizedBox(height: 24),
                        Text(title, style: textTheme.headlineMedium),
                        const SizedBox(height: 12),
                        Text(
                          subtitle,
                          style: textTheme.bodyLarge,
                        ),
                        const SizedBox(height: 28),
                        primaryAction,
                        const SizedBox(height: 14),
                        _DividerLabel(colorScheme: colorScheme),
                        const SizedBox(height: 14),
                        secondaryAction,
                        if (statusBanner != null) ...<Widget>[
                          const SizedBox(height: 20),
                          statusBanner!,
                        ],
                        const SizedBox(height: 24),
                        Wrap(
                          alignment: WrapAlignment.center,
                          crossAxisAlignment: WrapCrossAlignment.center,
                          spacing: 4,
                          children: <Widget>[
                            Text(
                              footerPrompt,
                              textAlign: TextAlign.center,
                              style: textTheme.bodyLarge,
                            ),
                            TextButton(
                              onPressed: onFooterTap,
                              child: Text(footerActionLabel),
                            ),
                          ],
                        ),
                      ],
                    ),
                  ),
                ),
              ),
            ),
          ),
        ),
      ),
    );
  }
}

class _DividerLabel extends StatelessWidget {
  const _DividerLabel({required this.colorScheme});

  final ColorScheme colorScheme;

  @override
  Widget build(BuildContext context) {
    return Row(
      children: <Widget>[
        Expanded(child: Divider(color: colorScheme.outlineVariant)),
        Padding(
          padding: const EdgeInsets.symmetric(horizontal: 12),
          child: Text(
            'or continue with email',
            style: Theme.of(context).textTheme.bodyLarge?.copyWith(
              fontSize: 14,
            ),
          ),
        ),
        Expanded(child: Divider(color: colorScheme.outlineVariant)),
      ],
    );
  }
}
