import 'budget.dart';

abstract class BudgetRepository {
  Future<List<Budget>> getBudgets();

  Future<void> addBudget(Budget budget);
}
