import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';

import '../../accounts/accounts_providers.dart';
import '../../accounts/domain/account.dart';
import '../../categories/categories_providers.dart';
import '../../categories/domain/category.dart';
import '../../categories/domain/subcategory.dart';
import '../transactions_providers.dart';
import '../domain/transaction.dart';

class CreateTransactionScreen extends ConsumerStatefulWidget {
  const CreateTransactionScreen({super.key});

  @override
  ConsumerState<CreateTransactionScreen> createState() =>
      _CreateTransactionScreenState();
}

class _CreateTransactionScreenState
    extends ConsumerState<CreateTransactionScreen> {
  late final TextEditingController _amountController;
  late final TextEditingController _noteController;
  TransactionType _selectedType = TransactionType.expense;
  String? _selectedAccountId;
  String? _selectedFromAccountId;
  String? _selectedToAccountId;
  String? _selectedCategoryId;
  String? _selectedSubcategoryId;

  @override
  void initState() {
    super.initState();
    _amountController = TextEditingController();
    _noteController = TextEditingController();
  }

  @override
  void dispose() {
    _amountController.dispose();
    _noteController.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    final accounts = ref.watch(seededAccountsProvider);
    final allCategories = ref.watch(seededCategoriesProvider);
    final categoryType = _selectedType == TransactionType.income
        ? CategoryType.income
        : CategoryType.expense;
    final availableCategories = allCategories
        .where((Category category) => category.type == categoryType)
        .toList(growable: false);
    final selectedCategory = availableCategories.cast<Category?>().firstWhere(
          (Category? category) => category?.id == _selectedCategoryId,
          orElse: () => null,
        );
    final availableSubcategories =
        selectedCategory?.subcategories ?? const <Subcategory>[];
    final isTransfer = _selectedType == TransactionType.transfer;

    return Scaffold(
      appBar: AppBar(
        title: const Text('Create Transaction'),
      ),
      body: ListView(
        padding: const EdgeInsets.all(20),
        children: <Widget>[
          SegmentedButton<TransactionType>(
            segments: const <ButtonSegment<TransactionType>>[
              ButtonSegment<TransactionType>(
                value: TransactionType.expense,
                label: Text('Expense'),
                icon: Icon(Icons.arrow_upward_rounded),
              ),
              ButtonSegment<TransactionType>(
                value: TransactionType.income,
                label: Text('Income'),
                icon: Icon(Icons.arrow_downward_rounded),
              ),
              ButtonSegment<TransactionType>(
                value: TransactionType.transfer,
                label: Text('Transfer'),
                icon: Icon(Icons.swap_horiz_rounded),
              ),
            ],
            selected: <TransactionType>{_selectedType},
            onSelectionChanged: (Set<TransactionType> value) {
              setState(() {
                _selectedType = value.first;
                _selectedAccountId = null;
                _selectedFromAccountId = null;
                _selectedToAccountId = null;
                _selectedCategoryId = null;
                _selectedSubcategoryId = null;
              });
            },
          ),
          const SizedBox(height: 20),
          TextField(
            controller: _amountController,
            keyboardType: const TextInputType.numberWithOptions(decimal: true),
            decoration: const InputDecoration(
              labelText: 'Amount',
              hintText: '0.00',
            ),
          ),
          const SizedBox(height: 16),
          if (!isTransfer) ...<Widget>[
            DropdownButtonFormField<String>(
              key: ValueKey<String>(
                'account-${_selectedType.name}-${_selectedAccountId ?? 'default'}',
              ),
              initialValue: _selectedAccountId ?? '',
              decoration: const InputDecoration(
                labelText: 'Account',
              ),
              items: <DropdownMenuItem<String>>[
                const DropdownMenuItem<String>(
                  value: '',
                  child: Text('Use default (Efectivo)'),
                ),
                ...accounts.map(
                  (Account account) => DropdownMenuItem<String>(
                    value: account.id,
                    child: Text(account.name),
                  ),
                ),
              ],
              onChanged: (String? value) {
                setState(() {
                  _selectedAccountId = value == '' ? null : value;
                });
              },
            ),
            const SizedBox(height: 16),
            DropdownButtonFormField<String>(
              key: ValueKey<String>(
                'category-${_selectedType.name}-${_selectedCategoryId ?? 'none'}',
              ),
              initialValue: _selectedCategoryId,
              decoration: const InputDecoration(
                labelText: 'Category',
              ),
              items: availableCategories
                  .map(
                    (Category category) => DropdownMenuItem<String>(
                      value: category.id,
                      child: Text(
                        '${category.emoji ?? ''} ${category.name}'.trim(),
                      ),
                    ),
                  )
                  .toList(growable: false),
              onChanged: (String? value) {
                setState(() {
                  _selectedCategoryId = value;
                  _selectedSubcategoryId = null;
                });
              },
            ),
            if (availableSubcategories.isNotEmpty) ...<Widget>[
              const SizedBox(height: 16),
              DropdownButtonFormField<String>(
                key: ValueKey<String>(
                  'subcategory-${_selectedCategoryId ?? 'none'}-${_selectedSubcategoryId ?? 'none'}',
                ),
                initialValue: _selectedSubcategoryId ?? '',
                decoration: const InputDecoration(
                  labelText: 'Subcategory',
                ),
                items: <DropdownMenuItem<String>>[
                  const DropdownMenuItem<String>(
                    value: '',
                    child: Text('No subcategory'),
                  ),
                  ...availableSubcategories.map(
                    (Subcategory subcategory) => DropdownMenuItem<String>(
                      value: subcategory.id,
                      child: Text(
                        '${subcategory.emoji ?? ''} ${subcategory.name}'.trim(),
                      ),
                    ),
                  ),
                ],
                onChanged: (String? value) {
                  setState(() {
                    _selectedSubcategoryId = value == '' ? null : value;
                  });
                },
              ),
            ],
          ] else ...<Widget>[
            DropdownButtonFormField<String>(
              key: ValueKey<String>(
                'from-account-${_selectedFromAccountId ?? 'none'}',
              ),
              initialValue: _selectedFromAccountId,
              decoration: const InputDecoration(
                labelText: 'From account',
              ),
              items: accounts
                  .map(
                    (Account account) => DropdownMenuItem<String>(
                      value: account.id,
                      child: Text(account.name),
                    ),
                  )
                  .toList(growable: false),
              onChanged: (String? value) {
                setState(() {
                  _selectedFromAccountId = value;
                });
              },
            ),
            const SizedBox(height: 16),
            DropdownButtonFormField<String>(
              key: ValueKey<String>(
                'to-account-${_selectedToAccountId ?? 'none'}',
              ),
              initialValue: _selectedToAccountId,
              decoration: const InputDecoration(
                labelText: 'To account',
              ),
              items: accounts
                  .map(
                    (Account account) => DropdownMenuItem<String>(
                      value: account.id,
                      child: Text(account.name),
                    ),
                  )
                  .toList(growable: false),
              onChanged: (String? value) {
                setState(() {
                  _selectedToAccountId = value;
                });
              },
            ),
          ],
          const SizedBox(height: 16),
          TextField(
            controller: _noteController,
            decoration: const InputDecoration(
              labelText: 'Note',
              hintText: 'Optional note',
            ),
            maxLines: 3,
          ),
          const SizedBox(height: 24),
          FilledButton(
            onPressed: _saveTransaction,
            child: const Text('Save'),
          ),
        ],
      ),
    );
  }

  Future<void> _saveTransaction() async {
    final amount = double.tryParse(_amountController.text.trim());
    final note = _noteController.text.trim();

    if (amount == null || amount <= 0) {
      _showMessage('Enter a valid amount.');
      return;
    }

    if (isTransfer) {
      if (_selectedFromAccountId == null || _selectedToAccountId == null) {
        _showMessage('Select both origin and destination accounts.');
        return;
      }

      if (_selectedFromAccountId == _selectedToAccountId) {
        _showMessage('Origin and destination accounts must be different.');
        return;
      }
    }

    if (!isTransfer && _selectedCategoryId == null) {
      _showMessage('Select a category.');
      return;
    }

    await ref.read(transactionControllerProvider.notifier).addTransaction(
          type: _selectedType,
          amount: amount,
          accountId: _selectedAccountId,
          fromAccountId: _selectedFromAccountId,
          toAccountId: _selectedToAccountId,
          categoryId: _selectedCategoryId,
          subcategoryId: _selectedSubcategoryId,
          note: note,
        );

    if (!mounted) {
      return;
    }

    context.go('/dashboard');
  }

  void _showMessage(String message) {
    ScaffoldMessenger.of(context)
      ..hideCurrentSnackBar()
      ..showSnackBar(
        SnackBar(content: Text(message)),
      );
  }

  bool get isTransfer => _selectedType == TransactionType.transfer;
}
