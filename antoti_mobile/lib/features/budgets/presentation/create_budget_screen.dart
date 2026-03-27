import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';

import '../../categories/categories_providers.dart';
import '../../categories/domain/category.dart';
import '../budgets_providers.dart';

class CreateBudgetScreen extends ConsumerStatefulWidget {
  const CreateBudgetScreen({super.key});

  @override
  ConsumerState<CreateBudgetScreen> createState() => _CreateBudgetScreenState();
}

class _CreateBudgetScreenState extends ConsumerState<CreateBudgetScreen> {
  late final TextEditingController _limitController;
  String? _selectedCategoryId;

  @override
  void initState() {
    super.initState();
    _limitController = TextEditingController();
  }

  @override
  void dispose() {
    _limitController.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    final categories = ref.watch(seededCategoriesProvider).where(
          (Category category) => category.type == CategoryType.expense,
        ).toList(growable: false);

    return Scaffold(
      appBar: AppBar(
        title: const Text('Create Budget'),
      ),
      body: ListView(
        padding: const EdgeInsets.all(20),
        children: <Widget>[
          DropdownButtonFormField<String>(
            initialValue: _selectedCategoryId,
            decoration: const InputDecoration(
              labelText: 'Category',
            ),
            items: categories
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
              });
            },
          ),
          const SizedBox(height: 16),
          TextField(
            controller: _limitController,
            keyboardType: const TextInputType.numberWithOptions(decimal: true),
            decoration: const InputDecoration(
              labelText: 'Limit amount',
              hintText: '0.00',
            ),
          ),
          const SizedBox(height: 24),
          FilledButton(
            onPressed: _saveBudget,
            child: const Text('Save'),
          ),
        ],
      ),
    );
  }

  Future<void> _saveBudget() async {
    final limitAmount = double.tryParse(_limitController.text.trim());

    if (_selectedCategoryId == null) {
      _showMessage('Select a category.');
      return;
    }

    if (limitAmount == null || limitAmount <= 0) {
      _showMessage('Enter a valid limit.');
      return;
    }

    await ref.read(budgetControllerProvider.notifier).addBudget(
          categoryId: _selectedCategoryId!,
          limitAmount: limitAmount,
        );

    if (!mounted) {
      return;
    }

    context.go('/budgets');
  }

  void _showMessage(String message) {
    ScaffoldMessenger.of(context)
      ..hideCurrentSnackBar()
      ..showSnackBar(
        SnackBar(content: Text(message)),
      );
  }
}
