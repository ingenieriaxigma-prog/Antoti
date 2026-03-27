import '../domain/account.dart';
import 'default_accounts.dart';

class InitialAccountsService {
  const InitialAccountsService();

  List<Account> seedAccountsIfEmpty(List<Account> accounts) {
    if (accounts.isNotEmpty) {
      return accounts;
    }

    return List<Account>.unmodifiable(defaultAccounts);
  }
}
