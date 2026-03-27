import 'package:flutter_riverpod/flutter_riverpod.dart';

import 'data/transaction_repository_impl.dart';
import 'domain/transaction_repository.dart';
import 'presentation/transaction_controller.dart';
import 'presentation/transaction_state.dart';

final transactionRepositoryProvider = Provider<TransactionRepository>((Ref ref) {
  return TransactionRepositoryImpl();
});

final transactionControllerProvider =
    StateNotifierProvider<TransactionController, TransactionState>((Ref ref) {
      final repository = ref.watch(transactionRepositoryProvider);
      return TransactionController(repository)..loadTransactions();
    });
