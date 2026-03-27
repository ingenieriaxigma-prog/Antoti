enum BudgetPeriod {
  monthly,
}

class Budget {
  const Budget({
    required this.id,
    required this.categoryId,
    required this.limitAmount,
    required this.period,
    required this.createdAt,
  });

  final String id;
  final String categoryId;
  final double limitAmount;
  final BudgetPeriod period;
  final DateTime createdAt;
}
