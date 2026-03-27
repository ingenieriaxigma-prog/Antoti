enum TransactionType {
  expense,
  income,
  transfer,
}

class Transaction {
  const Transaction({
    required this.id,
    required this.type,
    required this.amount,
    this.accountId,
    this.fromAccountId,
    this.toAccountId,
    this.categoryId,
    this.subcategoryId,
    required this.note,
    required this.createdAt,
  });

  final String id;
  final TransactionType type;
  final double amount;
  final String? accountId;
  final String? fromAccountId;
  final String? toAccountId;
  final String? categoryId;
  final String? subcategoryId;
  final String note;
  final DateTime createdAt;
}
