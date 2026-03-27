import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';

import '../../accounts/accounts_providers.dart';
import '../../accounts/domain/account.dart';
import '../../categories/categories_providers.dart';
import '../../categories/domain/category.dart';
import '../../categories/domain/subcategory.dart';
import '../../transactions/domain/transaction.dart';
import '../../transactions/transactions_providers.dart';

class DashboardScreen extends ConsumerWidget {
  const DashboardScreen({super.key});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final state = ref.watch(transactionControllerProvider);
    final accounts = ref.watch(seededAccountsProvider);
    final categories = ref.watch(seededCategoriesProvider);

    return Scaffold(
      appBar: AppBar(
        title: const Text('Dashboard'),
      ),
      body: ListView(
        padding: const EdgeInsets.all(20),
        children: <Widget>[
          _SummaryCard(
            title: 'Total Balance',
            value: _formatAmount(state.balance),
            valueColor: state.balance >= 0
                ? Theme.of(context).colorScheme.primary
                : Theme.of(context).colorScheme.error,
          ),
          const SizedBox(height: 16),
          Row(
            children: <Widget>[
              Expanded(
                child: _SummaryCard(
                  title: 'Income',
                  value: _formatAmount(state.totalIncome),
                  valueColor: Theme.of(context).colorScheme.primary,
                ),
              ),
              const SizedBox(width: 12),
              Expanded(
                child: _SummaryCard(
                  title: 'Expense',
                  value: _formatAmount(state.totalExpense),
                  valueColor: Theme.of(context).colorScheme.error,
                ),
              ),
            ],
          ),
          const SizedBox(height: 24),
          Text(
            'Transactions',
            style: Theme.of(context).textTheme.headlineMedium?.copyWith(
                  fontSize: 22,
                ),
          ),
          const SizedBox(height: 12),
          if (state.transactions.isEmpty)
            const _EmptyTransactionsView()
          else
            ...state.transactions.map(
              (Transaction transaction) => Padding(
                padding: const EdgeInsets.only(bottom: 12),
                child: _TransactionListTile(
                  transaction: transaction,
                  accounts: accounts,
                  categories: categories,
                  formattedAmount: _formatAmount(transaction.amount),
                ),
              ),
            ),
        ],
      ),
    );
  }

  String _formatAmount(double value) {
    return value.toStringAsFixed(2);
  }
}

class _SummaryCard extends StatelessWidget {
  const _SummaryCard({
    required this.title,
    required this.value,
    required this.valueColor,
  });

  final String title;
  final String value;
  final Color valueColor;

  @override
  Widget build(BuildContext context) {
    return Card(
      child: Padding(
        padding: const EdgeInsets.all(16),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: <Widget>[
            Text(title),
            const SizedBox(height: 8),
            Text(
              value,
              style: Theme.of(context).textTheme.headlineMedium?.copyWith(
                    color: valueColor,
                    fontSize: 24,
                  ),
            ),
          ],
        ),
      ),
    );
  }
}

class _TransactionListTile extends StatelessWidget {
  const _TransactionListTile({
    required this.transaction,
    required this.accounts,
    required this.categories,
    required this.formattedAmount,
  });

  final Transaction transaction;
  final List<Account> accounts;
  final List<Category> categories;
  final String formattedAmount;

  @override
  Widget build(BuildContext context) {
    final isIncome = transaction.type == TransactionType.income;
    final isTransfer = transaction.type == TransactionType.transfer;
    final colorScheme = Theme.of(context).colorScheme;
    final category = _findCategory();
    final subcategory = _findSubcategory(category);
    final fromAccount = _findAccount(transaction.fromAccountId ?? transaction.accountId);
    final toAccount = _findAccount(transaction.toAccountId);
    final title = isTransfer ? 'Transfer' : (category?.name ?? 'Uncategorized');
    final subtitle = isTransfer
        ? <String>[
            if (fromAccount != null && toAccount != null)
              '${fromAccount.name} → ${toAccount.name}',
            if (transaction.note.isNotEmpty) transaction.note,
          ].join(' • ')
        : <String>[
            if (subcategory != null) subcategory.name,
            if (transaction.note.isNotEmpty) transaction.note,
          ].join(' • ');

    return Card(
      child: ListTile(
        leading: CircleAvatar(
          backgroundColor: isTransfer
              ? colorScheme.secondary.withValues(alpha: 0.12)
              : isIncome
                  ? colorScheme.primary.withValues(alpha: 0.12)
                  : colorScheme.error.withValues(alpha: 0.12),
          child: Icon(
            isTransfer
                ? Icons.swap_horiz_rounded
                : isIncome
                    ? Icons.arrow_downward_rounded
                    : Icons.arrow_upward_rounded,
            color: isTransfer
                ? colorScheme.secondary
                : isIncome
                    ? colorScheme.primary
                    : colorScheme.error,
          ),
        ),
        title: Text(title),
        subtitle: Text(
          subtitle.isEmpty ? 'No note' : subtitle,
        ),
        trailing: Text(
          isTransfer ? formattedAmount : '${isIncome ? '+' : '-'}$formattedAmount',
          style: TextStyle(
            color: isTransfer
                ? colorScheme.secondary
                : isIncome
                    ? colorScheme.primary
                    : colorScheme.error,
            fontWeight: FontWeight.w600,
          ),
        ),
      ),
    );
  }

  Category? _findCategory() {
    for (final Category category in categories) {
      if (category.id == transaction.categoryId) {
        return category;
      }
    }

    return null;
  }

  Subcategory? _findSubcategory(Category? category) {
    if (category == null) {
      return null;
    }

    for (final Subcategory subcategory in category.subcategories) {
      if (subcategory.id == transaction.subcategoryId) {
        return subcategory;
      }
    }

    return null;
  }

  Account? _findAccount(String? accountId) {
    if (accountId == null) {
      return null;
    }

    for (final Account account in accounts) {
      if (account.id == accountId) {
        return account;
      }
    }

    return null;
  }
}

class _EmptyTransactionsView extends StatelessWidget {
  const _EmptyTransactionsView();

  @override
  Widget build(BuildContext context) {
    return Card(
      child: Padding(
        padding: const EdgeInsets.all(20),
        child: Text(
          'No transactions yet. Create your first one from Home.',
          style: Theme.of(context).textTheme.bodyLarge,
        ),
      ),
    );
  }
}
