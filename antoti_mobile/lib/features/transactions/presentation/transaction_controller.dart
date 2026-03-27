import 'package:flutter_riverpod/flutter_riverpod.dart';

import '../../accounts/data/default_accounts.dart';
import '../domain/transaction.dart';
import '../domain/transaction_repository.dart';
import 'transaction_state.dart';

class TransactionController extends StateNotifier<TransactionState> {
  TransactionController(this._repository) : super(const TransactionState());

  final TransactionRepository _repository;

  Future<void> loadTransactions() async {
    state = state.copyWith(isLoading: true, clearErrorMessage: true);

    try {
      final transactions = await _repository.getTransactions();
      state = state.copyWith(
        transactions: transactions,
        isLoading: false,
        clearErrorMessage: true,
      );
    } catch (_) {
      state = state.copyWith(
        isLoading: false,
        errorMessage: 'Unable to load transactions.',
      );
    }
  }

  Future<void> addTransaction({
    required TransactionType type,
    required double amount,
    String? accountId,
    String? fromAccountId,
    String? toAccountId,
    String? categoryId,
    String? subcategoryId,
    required String note,
  }) async {
    final transaction = Transaction(
      id: DateTime.now().microsecondsSinceEpoch.toString(),
      type: type,
      amount: amount,
      accountId: type == TransactionType.transfer
          ? null
          : (accountId ?? defaultCashAccountId),
      fromAccountId: type == TransactionType.transfer ? fromAccountId : null,
      toAccountId: type == TransactionType.transfer ? toAccountId : null,
      categoryId: type == TransactionType.transfer ? null : categoryId,
      subcategoryId: type == TransactionType.transfer ? null : subcategoryId,
      note: note.trim(),
      createdAt: DateTime.now(),
    );

    await _repository.addTransaction(transaction);
    final transactions = await _repository.getTransactions();

    state = state.copyWith(
      transactions: transactions,
      clearErrorMessage: true,
    );
  }
}
