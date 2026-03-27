import '../../transactions/domain/transaction.dart';
import '../domain/budget.dart';

class BudgetProgress {
  const BudgetProgress({
    required this.spentAmount,
    required this.remainingAmount,
    required this.usedPercentage,
  });

  final double spentAmount;
  final double remainingAmount;
  final double usedPercentage;
}

class BudgetState {
  const BudgetState({
    this.budgets = const <Budget>[],
    this.isLoading = false,
    this.errorMessage,
  });

  final List<Budget> budgets;
  final bool isLoading;
  final String? errorMessage;

  BudgetProgress progressForBudget(
    Budget budget,
    List<Transaction> transactions,
  ) {
    final double spentAmount = transactions
        .where(
          (Transaction transaction) =>
              transaction.type == TransactionType.expense &&
              transaction.categoryId == budget.categoryId,
        )
        .fold(0, (double total, Transaction transaction) => total + transaction.amount);

    final double remainingAmount = budget.limitAmount - spentAmount;
    final double usedPercentage = budget.limitAmount <= 0
        ? 0
        : (spentAmount / budget.limitAmount).clamp(0, 999).toDouble();

    return BudgetProgress(
      spentAmount: spentAmount,
      remainingAmount: remainingAmount,
      usedPercentage: usedPercentage,
    );
  }

  BudgetState copyWith({
    List<Budget>? budgets,
    bool? isLoading,
    String? errorMessage,
    bool clearErrorMessage = false,
  }) {
    return BudgetState(
      budgets: budgets ?? this.budgets,
      isLoading: isLoading ?? this.isLoading,
      errorMessage: clearErrorMessage ? null : (errorMessage ?? this.errorMessage),
    );
  }
}
