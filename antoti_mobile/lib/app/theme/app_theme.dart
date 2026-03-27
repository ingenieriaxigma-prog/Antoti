import 'package:flutter/material.dart';

class AppTheme {
  AppTheme._();

  static const ColorScheme _colorScheme = ColorScheme(
    brightness: Brightness.light,
    primary: Color(0xFF1F6F78),
    onPrimary: Color(0xFFFFFFFF),
    secondary: Color(0xFF4B6470),
    onSecondary: Color(0xFFFFFFFF),
    error: Color(0xFFBA1A1A),
    onError: Color(0xFFFFFFFF),
    surface: Color(0xFFF7F9FB),
    onSurface: Color(0xFF172026),
    surfaceContainerHighest: Color(0xFFDDE5EA),
    onSurfaceVariant: Color(0xFF52606D),
    outline: Color(0xFF8A98A5),
    outlineVariant: Color(0xFFC1CBD3),
    shadow: Color(0xFF000000),
    scrim: Color(0xFF000000),
    inverseSurface: Color(0xFF2B3137),
    onInverseSurface: Color(0xFFEEF1F3),
    inversePrimary: Color(0xFF8FD3DB),
    surfaceTint: Color(0xFF1F6F78),
  );

  static ThemeData get light {
    return ThemeData(
      useMaterial3: true,
      colorScheme: _colorScheme,
      scaffoldBackgroundColor: _colorScheme.surface,
      appBarTheme: const AppBarTheme(
        elevation: 0,
        centerTitle: false,
      ),
      textTheme: const TextTheme(
        headlineMedium: TextStyle(
          fontSize: 28,
          fontWeight: FontWeight.w700,
          color: Color(0xFF172026),
        ),
        bodyLarge: TextStyle(
          fontSize: 16,
          fontWeight: FontWeight.w400,
          color: Color(0xFF52606D),
        ),
      ),
    );
  }
}
