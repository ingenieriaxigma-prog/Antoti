import '../domain/transaction.dart';

class TransactionState {
  const TransactionState({
    this.transactions = const <Transaction>[],
    this.isLoading = false,
    this.errorMessage,
  });

  final List<Transaction> transactions;
  final bool isLoading;
  final String? errorMessage;

  double get totalIncome => transactions
      .where((Transaction transaction) => transaction.type == TransactionType.income)
      .fold(0, (double total, Transaction transaction) => total + transaction.amount);

  double get totalExpense => transactions
      .where((Transaction transaction) => transaction.type == TransactionType.expense)
      .fold(0, (double total, Transaction transaction) => total + transaction.amount);

  double get balance => totalIncome - totalExpense;

  TransactionState copyWith({
    List<Transaction>? transactions,
    bool? isLoading,
    String? errorMessage,
    bool clearErrorMessage = false,
  }) {
    return TransactionState(
      transactions: transactions ?? this.transactions,
      isLoading: isLoading ?? this.isLoading,
      errorMessage: clearErrorMessage ? null : (errorMessage ?? this.errorMessage),
    );
  }
}
