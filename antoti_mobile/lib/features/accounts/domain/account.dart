enum AccountType {
  cash,
  bank,
  digital,
  credit,
}

class Account {
  const Account({
    required this.id,
    required this.name,
    required this.type,
    required this.icon,
    required this.color,
  });

  final String id;
  final String name;
  final AccountType type;
  final String icon;
  final String color;
}
