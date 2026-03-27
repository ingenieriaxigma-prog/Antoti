import '../domain/budget.dart';
import '../domain/budget_repository.dart';

class BudgetRepositoryImpl implements BudgetRepository {
  BudgetRepositoryImpl()
      : _budgets = <Budget>[
          Budget(
            id: 'budget-food',
            categoryId: '22222222-2222-4222-a222-222222222224',
            limitAmount: 300,
            period: BudgetPeriod.monthly,
            createdAt: DateTime.now().subtract(const Duration(days: 3)),
          ),
          Budget(
            id: 'budget-transport',
            categoryId: '22222222-2222-4222-a222-222222222225',
            limitAmount: 180,
            period: BudgetPeriod.monthly,
            createdAt: DateTime.now().subtract(const Duration(days: 2)),
          ),
        ];

  final List<Budget> _budgets;

  @override
  Future<void> addBudget(Budget budget) async {
    _budgets.insert(0, budget);
  }

  @override
  Future<List<Budget>> getBudgets() async {
    return List<Budget>.unmodifiable(_budgets);
  }
}
