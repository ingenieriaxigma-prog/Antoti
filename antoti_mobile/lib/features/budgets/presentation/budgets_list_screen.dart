import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';

import '../../categories/categories_providers.dart';
import '../../categories/domain/category.dart';
import '../../transactions/transactions_providers.dart';
import '../budgets_providers.dart';
import '../domain/budget.dart';
import 'budget_state.dart';

class BudgetsListScreen extends ConsumerWidget {
  const BudgetsListScreen({super.key});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final budgetState = ref.watch(budgetControllerProvider);
    final transactionState = ref.watch(transactionControllerProvider);
    final categories = ref.watch(seededCategoriesProvider);

    return Scaffold(
      appBar: AppBar(
        title: const Text('Budgets'),
      ),
      floatingActionButton: FloatingActionButton.extended(
        onPressed: () => context.go('/budgets/create'),
        icon: const Icon(Icons.add_rounded),
        label: const Text('Create'),
      ),
      body: ListView(
        padding: const EdgeInsets.all(20),
        children: <Widget>[
          if (budgetState.budgets.isEmpty)
            const _EmptyBudgetView()
          else
            ...budgetState.budgets.map(
              (Budget budget) {
                final category = _findCategory(categories, budget.categoryId);
                final progress = budgetState.progressForBudget(
                  budget,
                  transactionState.transactions,
                );

                return Padding(
                  padding: const EdgeInsets.only(bottom: 16),
                  child: _BudgetCard(
                    budget: budget,
                    category: category,
                    progress: progress,
                  ),
                );
              },
            ),
        ],
      ),
    );
  }

  Category? _findCategory(List<Category> categories, String categoryId) {
    for (final Category category in categories) {
      if (category.id == categoryId) {
        return category;
      }
    }

    return null;
  }
}

class _BudgetCard extends StatelessWidget {
  const _BudgetCard({
    required this.budget,
    required this.category,
    required this.progress,
  });

  final Budget budget;
  final Category? category;
  final BudgetProgress progress;

  @override
  Widget build(BuildContext context) {
    final colorScheme = Theme.of(context).colorScheme;
    final bool isOverBudget = progress.spentAmount > budget.limitAmount;
    final double clampedProgress = progress.usedPercentage.clamp(0, 1).toDouble();

    return Card(
      child: Padding(
        padding: const EdgeInsets.all(16),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: <Widget>[
            Text(
              '${category?.emoji ?? ''} ${category?.name ?? 'Unknown category'}'.trim(),
              style: Theme.of(context).textTheme.titleMedium,
            ),
            const SizedBox(height: 8),
            Text('Limit: ${budget.limitAmount.toStringAsFixed(2)}'),
            Text('Spent: ${progress.spentAmount.toStringAsFixed(2)}'),
            Text(
              'Remaining: ${progress.remainingAmount.toStringAsFixed(2)}',
              style: TextStyle(
                color: isOverBudget ? colorScheme.error : null,
              ),
            ),
            const SizedBox(height: 12),
            LinearProgressIndicator(
              value: clampedProgress,
              minHeight: 8,
              color: isOverBudget ? colorScheme.error : colorScheme.primary,
              backgroundColor: colorScheme.surfaceContainerHighest,
            ),
          ],
        ),
      ),
    );
  }
}

class _EmptyBudgetView extends StatelessWidget {
  const _EmptyBudgetView();

  @override
  Widget build(BuildContext context) {
    return Card(
      child: Padding(
        padding: const EdgeInsets.all(20),
        child: Text(
          'No budgets yet. Create one to track category spending.',
          style: Theme.of(context).textTheme.bodyLarge,
        ),
      ),
    );
  }
}
