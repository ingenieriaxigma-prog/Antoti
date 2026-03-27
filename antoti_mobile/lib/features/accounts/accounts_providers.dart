import 'package:flutter_riverpod/flutter_riverpod.dart';

import 'data/account_repository_impl.dart';
import 'data/initial_accounts_service.dart';
import 'domain/account.dart';
import 'domain/account_repository.dart';

final accountRepositoryProvider = Provider<AccountRepository>((Ref ref) {
  return const AccountRepositoryImpl();
});

final initialAccountsServiceProvider = Provider<InitialAccountsService>((Ref ref) {
  return const InitialAccountsService();
});

final seededAccountsProvider = Provider<List<Account>>((Ref ref) {
  final repository = ref.watch(accountRepositoryProvider);
  final service = ref.watch(initialAccountsServiceProvider);
  return service.seedAccountsIfEmpty(repository.getAccounts());
});
