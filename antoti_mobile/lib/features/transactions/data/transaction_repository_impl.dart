import '../domain/transaction.dart';
import '../domain/transaction_repository.dart';

class TransactionRepositoryImpl implements TransactionRepository {
  TransactionRepositoryImpl()
      : _transactions = <Transaction>[
          Transaction(
            id: 'seed-expense',
            type: TransactionType.expense,
            amount: 42.50,
            accountId: 'ac111111-0000-4000-a000-000000000001',
            categoryId: '22222222-2222-4222-a222-222222222224',
            subcategoryId: '22222222-2222-4222-a222-222222222402',
            note: 'Lunch',
            createdAt: DateTime.now().subtract(const Duration(hours: 3)),
          ),
          Transaction(
            id: 'seed-income',
            type: TransactionType.income,
            amount: 1200,
            accountId: 'ac111111-0000-4000-a000-000000000002',
            categoryId: '11111111-1111-4111-a111-111111111111',
            subcategoryId: '11111111-1111-4111-a111-111111111101',
            note: 'Weekly payout',
            createdAt: DateTime.now().subtract(const Duration(days: 1)),
          ),
          Transaction(
            id: 'seed-transfer',
            type: TransactionType.transfer,
            amount: 300,
            fromAccountId: 'ac111111-0000-4000-a000-000000000002',
            toAccountId: 'ac111111-0000-4000-a000-000000000005',
            note: 'Move money to Nequi',
            createdAt: DateTime.now().subtract(const Duration(days: 2)),
          ),
        ];

  final List<Transaction> _transactions;

  @override
  Future<void> addTransaction(Transaction transaction) async {
    _transactions.insert(0, transaction);
  }

  @override
  Future<List<Transaction>> getTransactions() async {
    return List<Transaction>.unmodifiable(_transactions);
  }
}
