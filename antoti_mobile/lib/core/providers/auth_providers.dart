import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:supabase_flutter/supabase_flutter.dart';

import '../../core/config/supabase_config.dart';
import '../../features/auth/data/auth_repository_impl.dart';
import '../../features/auth/domain/auth_repository.dart';

final authRepositoryProvider = Provider<AuthRepository>((Ref ref) {
  final supabaseClient =
      SupabaseConfig.isConfigured ? Supabase.instance.client : null;

  return AuthRepositoryImpl(supabaseClient);
});
