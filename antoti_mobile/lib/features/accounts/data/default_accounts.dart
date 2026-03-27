import '../domain/account.dart';

const String defaultCashAccountId = 'ac111111-0000-4000-a000-000000000001';

const List<Account> defaultAccounts = <Account>[
  Account(
    id: defaultCashAccountId,
    name: 'Efectivo',
    type: AccountType.cash,
    icon: 'wallet',
    color: '#10b981',
  ),
  Account(
    id: 'ac111111-0000-4000-a000-000000000002',
    name: 'Bancolombia',
    type: AccountType.bank,
    icon: 'building-2',
    color: '#FFDE00',
  ),
  Account(
    id: 'ac111111-0000-4000-a000-000000000005',
    name: 'Nequi',
    type: AccountType.digital,
    icon: 'smartphone',
    color: '#FF006B',
  ),
  Account(
    id: 'ac111111-0000-4000-a000-000000000007',
    name: 'Tarjeta de Crédito',
    type: AccountType.credit,
    icon: 'credit-card',
    color: '#ef4444',
  ),
];
