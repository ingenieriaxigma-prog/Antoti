import 'package:flutter_riverpod/flutter_riverpod.dart';

import '../domain/budget.dart';
import '../domain/budget_repository.dart';
import 'budget_state.dart';

class BudgetController extends StateNotifier<BudgetState> {
  BudgetController(this._repository) : super(const BudgetState());

  final BudgetRepository _repository;

  Future<void> loadBudgets() async {
    state = state.copyWith(isLoading: true, clearErrorMessage: true);

    try {
      final budgets = await _repository.getBudgets();
      state = state.copyWith(
        budgets: budgets,
        isLoading: false,
        clearErrorMessage: true,
      );
    } catch (_) {
      state = state.copyWith(
        isLoading: false,
        errorMessage: 'Unable to load budgets.',
      );
    }
  }

  Future<void> addBudget({
    required String categoryId,
    required double limitAmount,
  }) async {
    final budget = Budget(
      id: DateTime.now().microsecondsSinceEpoch.toString(),
      categoryId: categoryId,
      limitAmount: limitAmount,
      period: BudgetPeriod.monthly,
      createdAt: DateTime.now(),
    );

    await _repository.addBudget(budget);
    final budgets = await _repository.getBudgets();

    state = state.copyWith(
      budgets: budgets,
      clearErrorMessage: true,
    );
  }
}
