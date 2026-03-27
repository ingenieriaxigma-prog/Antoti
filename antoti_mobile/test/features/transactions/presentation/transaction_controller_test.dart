import 'package:flutter_test/flutter_test.dart';

import 'package:antoti_mobile/features/accounts/data/default_accounts.dart';
import 'package:antoti_mobile/features/transactions/domain/transaction.dart';
import 'package:antoti_mobile/features/transactions/domain/transaction_repository.dart';
import 'package:antoti_mobile/features/transactions/presentation/transaction_controller.dart';
import 'package:antoti_mobile/features/transactions/presentation/transaction_state.dart';

class FakeTransactionRepository implements TransactionRepository {
  FakeTransactionRepository({
    List<Transaction>? initialTransactions,
    this.shouldFailGetTransactions = false,
  }) : _transactions = List<Transaction>.from(initialTransactions ?? const <Transaction>[]);

  final List<Transaction> _transactions;
  final bool shouldFailGetTransactions;

  @override
  Future<void> addTransaction(Transaction transaction) async {
    _transactions.insert(0, transaction);
  }

  @override
  Future<List<Transaction>> getTransactions() async {
    if (shouldFailGetTransactions) {
      throw Exception('Repository failure');
    }

    return List<Transaction>.unmodifiable(_transactions);
  }
}

void main() {
  final seedTransaction = Transaction(
    id: 'seed-1',
    type: TransactionType.expense,
    amount: 89.90,
    accountId: defaultCashAccountId,
    categoryId: '22222222-2222-4222-a222-222222222224',
    subcategoryId: '22222222-2222-4222-a222-222222222402',
    note: 'Dinner',
    createdAt: DateTime(2026, 3, 21),
  );

  test('loadTransactions initializes state with repository data', () async {
    final repository = FakeTransactionRepository(
      initialTransactions: <Transaction>[seedTransaction],
    );
    final controller = TransactionController(repository);

    await controller.loadTransactions();

    expect(controller.state.isLoading, isFalse);
    expect(controller.state.errorMessage, isNull);
    expect(controller.state.transactions, hasLength(1));
    expect(controller.state.transactions.first.id, 'seed-1');
  });

  test('addTransaction updates state totals and list', () async {
    final repository = FakeTransactionRepository(
      initialTransactions: <Transaction>[seedTransaction],
    );
    final controller = TransactionController(repository);

    await controller.loadTransactions();
    await controller.addTransaction(
      type: TransactionType.income,
      amount: 500,
      accountId: 'ac111111-0000-4000-a000-000000000002',
      categoryId: '11111111-1111-4111-a111-111111111111',
      subcategoryId: '11111111-1111-4111-a111-111111111101',
      note: 'Weekly payment',
    );

    expect(controller.state.transactions, hasLength(2));
    expect(
      controller.state.transactions.first.categoryId,
      '11111111-1111-4111-a111-111111111111',
    );
    expect(
      controller.state.transactions.first.accountId,
      'ac111111-0000-4000-a000-000000000002',
    );
    expect(controller.state.transactions.first.note, 'Weekly payment');
    expect(controller.state.totalIncome, 500);
    expect(controller.state.totalExpense, 89.90);
    expect(controller.state.balance, 410.10);
  });

  test('addTransaction leaves the created transaction reflected in state', () async {
    final repository = FakeTransactionRepository();
    final controller = TransactionController(repository);

    await controller.addTransaction(
      type: TransactionType.expense,
      amount: 25.75,
      accountId: 'ac111111-0000-4000-a000-000000000005',
      categoryId: '22222222-2222-4222-a222-222222222225',
      subcategoryId: '22222222-2222-4222-a222-222222222503',
      note: 'Taxi',
    );

    final savedTransaction = controller.state.transactions.single;

    expect(savedTransaction.type, TransactionType.expense);
    expect(savedTransaction.amount, 25.75);
    expect(savedTransaction.accountId, 'ac111111-0000-4000-a000-000000000005');
    expect(savedTransaction.categoryId, '22222222-2222-4222-a222-222222222225');
    expect(
      savedTransaction.subcategoryId,
      '22222222-2222-4222-a222-222222222503',
    );
    expect(savedTransaction.note, 'Taxi');
  });

  test('loadTransactions exposes repository failure as error state', () async {
    final repository = FakeTransactionRepository(
      shouldFailGetTransactions: true,
    );
    final controller = TransactionController(repository);

    await controller.loadTransactions();

    expect(controller.state, isA<TransactionState>());
    expect(controller.state.isLoading, isFalse);
    expect(controller.state.transactions, isEmpty);
    expect(controller.state.errorMessage, 'Unable to load transactions.');
  });

  test('addTransaction falls back to Efectivo when account is not selected', () async {
    final repository = FakeTransactionRepository();
    final controller = TransactionController(repository);

    await controller.addTransaction(
      type: TransactionType.expense,
      amount: 18,
      categoryId: '22222222-2222-4222-a222-222222222224',
      subcategoryId: '22222222-2222-4222-a222-222222222403',
      note: 'Coffee',
    );

    expect(controller.state.transactions.single.accountId, defaultCashAccountId);
  });

  test('addTransaction stores transfer with origin and destination accounts', () async {
    final repository = FakeTransactionRepository();
    final controller = TransactionController(repository);

    await controller.addTransaction(
      type: TransactionType.transfer,
      amount: 90,
      fromAccountId: 'ac111111-0000-4000-a000-000000000002',
      toAccountId: 'ac111111-0000-4000-a000-000000000005',
      note: 'Savings move',
    );

    final savedTransaction = controller.state.transactions.single;

    expect(savedTransaction.type, TransactionType.transfer);
    expect(savedTransaction.accountId, isNull);
    expect(savedTransaction.fromAccountId, 'ac111111-0000-4000-a000-000000000002');
    expect(savedTransaction.toAccountId, 'ac111111-0000-4000-a000-000000000005');
    expect(savedTransaction.categoryId, isNull);
    expect(savedTransaction.subcategoryId, isNull);
  });
}
