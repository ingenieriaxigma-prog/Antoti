import 'package:flutter_test/flutter_test.dart';

import 'package:antoti_mobile/features/transactions/domain/transaction.dart';
import 'package:antoti_mobile/features/transactions/presentation/transaction_state.dart';

void main() {
  final incomeTransaction = Transaction(
    id: 'income-1',
    type: TransactionType.income,
    amount: 1500,
    accountId: 'ac111111-0000-4000-a000-000000000002',
    categoryId: '11111111-1111-4111-a111-111111111111',
    subcategoryId: '11111111-1111-4111-a111-111111111101',
    note: 'Monthly salary',
    createdAt: DateTime(2026, 3, 21),
  );

  final expenseTransaction = Transaction(
    id: 'expense-1',
    type: TransactionType.expense,
    amount: 275.50,
    accountId: 'ac111111-0000-4000-a000-000000000001',
    categoryId: '22222222-2222-4222-a222-222222222224',
    subcategoryId: '22222222-2222-4222-a222-222222222401',
    note: 'Groceries',
    createdAt: DateTime(2026, 3, 21),
  );

  test('totalIncome sums only income transactions', () {
    final state = TransactionState(
      transactions: <Transaction>[
        incomeTransaction,
        expenseTransaction,
      ],
    );

    expect(state.totalIncome, 1500);
  });

  test('totalExpense sums only expense transactions', () {
    final state = TransactionState(
      transactions: <Transaction>[
        incomeTransaction,
        expenseTransaction,
      ],
    );

    expect(state.totalExpense, 275.50);
  });

  test('balance reflects income minus expense', () {
    final state = TransactionState(
      transactions: <Transaction>[
        incomeTransaction,
        expenseTransaction,
      ],
    );

    expect(state.balance, 1224.50);
  });

  test('mixed transactions keep totals and balance consistent', () {
    final secondExpense = Transaction(
      id: 'expense-2',
      type: TransactionType.expense,
      amount: 124.50,
      accountId: 'ac111111-0000-4000-a000-000000000002',
      categoryId: '22222222-2222-4222-a222-222222222225',
      subcategoryId: '22222222-2222-4222-a222-222222222501',
      note: 'Fuel',
      createdAt: DateTime(2026, 3, 21),
    );

    final secondIncome = Transaction(
      id: 'income-2',
      type: TransactionType.income,
      amount: 200,
      accountId: 'ac111111-0000-4000-a000-000000000005',
      categoryId: '11111111-1111-4111-a111-111111111114',
      subcategoryId: '11111111-1111-4111-a111-111111111402',
      note: 'Referral bonus',
      createdAt: DateTime(2026, 3, 21),
    );

    final state = TransactionState(
      transactions: <Transaction>[
        incomeTransaction,
        expenseTransaction,
        secondExpense,
        secondIncome,
      ],
    );

    expect(state.totalIncome, 1700);
    expect(state.totalExpense, 400);
    expect(state.balance, 1300);
  });
}
