import 'package:flutter/widgets.dart';
import 'package:flutter/foundation.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:supabase_flutter/supabase_flutter.dart';

import 'app/antoti_app.dart';
import 'core/config/supabase_config.dart';
import 'core/session/session_storage.dart';

Future<void> bootstrap() async {
  WidgetsFlutterBinding.ensureInitialized();
  await SessionStorage.initialize();

  if (kDebugMode) {
    debugPrint('=== ANTOTI SUPABASE CONFIG DEBUG ===');
    debugPrint('SUPABASE URL PRESENT: ${SupabaseConfig.url.isNotEmpty}');
    debugPrint('SUPABASE ANON KEY PRESENT: ${SupabaseConfig.hasAnonKey}');
    debugPrint('SUPABASE ANON KEY LENGTH: ${SupabaseConfig.anonKeyLength}');
    debugPrint('SUPABASE ANON KEY DOT COUNT: ${SupabaseConfig.anonKeyDotCount}');
    debugPrint('===================================');
  }

  if (SupabaseConfig.isConfigured) {
    await Supabase.initialize(
      url: SupabaseConfig.url,
      anonKey: SupabaseConfig.anonKey,
    );
  }

  runApp(
    const ProviderScope(
      child: AntotiApp(),
    ),
  );
}
