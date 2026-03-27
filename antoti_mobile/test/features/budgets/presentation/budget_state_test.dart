import 'package:flutter_test/flutter_test.dart';

import 'package:antoti_mobile/features/budgets/domain/budget.dart';
import 'package:antoti_mobile/features/budgets/presentation/budget_state.dart';
import 'package:antoti_mobile/features/transactions/domain/transaction.dart';

void main() {
  test('progressForBudget calculates spent, remaining and percentage', () {
    final state = BudgetState(
      budgets: <Budget>[
        Budget(
          id: 'budget-1',
          categoryId: 'food',
          limitAmount: 300,
          period: BudgetPeriod.monthly,
          createdAt: DateTime(2026, 3, 21),
        ),
      ],
    );

    final progress = state.progressForBudget(
      state.budgets.single,
      <Transaction>[
        Transaction(
          id: 'tx-1',
          type: TransactionType.expense,
          amount: 120,
          categoryId: 'food',
          note: 'Lunch',
          createdAt: DateTime(2026, 3, 21),
        ),
        Transaction(
          id: 'tx-2',
          type: TransactionType.expense,
          amount: 30,
          categoryId: 'food',
          note: 'Dinner',
          createdAt: DateTime(2026, 3, 21),
        ),
        Transaction(
          id: 'tx-3',
          type: TransactionType.income,
          amount: 500,
          categoryId: 'salary',
          note: 'Salary',
          createdAt: DateTime(2026, 3, 21),
        ),
      ],
    );

    expect(progress.spentAmount, 150);
    expect(progress.remainingAmount, 150);
    expect(progress.usedPercentage, 0.5);
  });
}
