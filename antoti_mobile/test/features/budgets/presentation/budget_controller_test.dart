import 'package:flutter_test/flutter_test.dart';

import 'package:antoti_mobile/features/budgets/domain/budget.dart';
import 'package:antoti_mobile/features/budgets/domain/budget_repository.dart';
import 'package:antoti_mobile/features/budgets/presentation/budget_controller.dart';
import 'package:antoti_mobile/features/budgets/presentation/budget_state.dart';

class FakeBudgetRepository implements BudgetRepository {
  FakeBudgetRepository({
    List<Budget>? initialBudgets,
    this.shouldFailGetBudgets = false,
  }) : _budgets = List<Budget>.from(initialBudgets ?? const <Budget>[]);

  final List<Budget> _budgets;
  final bool shouldFailGetBudgets;

  @override
  Future<void> addBudget(Budget budget) async {
    _budgets.insert(0, budget);
  }

  @override
  Future<List<Budget>> getBudgets() async {
    if (shouldFailGetBudgets) {
      throw Exception('Repository failure');
    }

    return List<Budget>.unmodifiable(_budgets);
  }
}

void main() {
  final seedBudget = Budget(
    id: 'budget-1',
    categoryId: 'food',
    limitAmount: 200,
    period: BudgetPeriod.monthly,
    createdAt: DateTime(2026, 3, 21),
  );

  test('loadBudgets initializes state with repository data', () async {
    final repository = FakeBudgetRepository(
      initialBudgets: <Budget>[seedBudget],
    );
    final controller = BudgetController(repository);

    await controller.loadBudgets();

    expect(controller.state.isLoading, isFalse);
    expect(controller.state.errorMessage, isNull);
    expect(controller.state.budgets, hasLength(1));
    expect(controller.state.budgets.first.id, 'budget-1');
  });

  test('addBudget updates state with new budget', () async {
    final repository = FakeBudgetRepository();
    final controller = BudgetController(repository);

    await controller.addBudget(
      categoryId: 'transport',
      limitAmount: 180,
    );

    expect(controller.state.budgets, hasLength(1));
    expect(controller.state.budgets.single.categoryId, 'transport');
    expect(controller.state.budgets.single.limitAmount, 180);
  });

  test('loadBudgets exposes repository failure as error state', () async {
    final repository = FakeBudgetRepository(
      shouldFailGetBudgets: true,
    );
    final controller = BudgetController(repository);

    await controller.loadBudgets();

    expect(controller.state, isA<BudgetState>());
    expect(controller.state.isLoading, isFalse);
    expect(controller.state.budgets, isEmpty);
    expect(controller.state.errorMessage, 'Unable to load budgets.');
  });
}
