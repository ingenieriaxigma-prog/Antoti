import 'package:flutter_riverpod/flutter_riverpod.dart';

import 'data/budget_repository_impl.dart';
import 'domain/budget_repository.dart';
import 'presentation/budget_controller.dart';
import 'presentation/budget_state.dart';

final budgetRepositoryProvider = Provider<BudgetRepository>((Ref ref) {
  return BudgetRepositoryImpl();
});

final budgetControllerProvider =
    StateNotifierProvider<BudgetController, BudgetState>((Ref ref) {
      final repository = ref.watch(budgetRepositoryProvider);
      return BudgetController(repository)..loadBudgets();
    });
