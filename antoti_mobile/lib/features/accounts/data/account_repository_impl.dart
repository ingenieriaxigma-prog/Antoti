import '../domain/account.dart';
import '../domain/account_repository.dart';

class AccountRepositoryImpl implements AccountRepository {
  const AccountRepositoryImpl({
    this.accounts = const <Account>[],
  });

  final List<Account> accounts;

  @override
  List<Account> getAccounts() {
    return List<Account>.unmodifiable(accounts);
  }
}
