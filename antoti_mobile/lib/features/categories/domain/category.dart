import 'subcategory.dart';

enum CategoryType {
  income,
  expense,
}

class Category {
  const Category({
    required this.id,
    required this.name,
    required this.type,
    required this.icon,
    required this.color,
    this.emoji,
    this.isSystem = false,
    this.subcategories = const <Subcategory>[],
  });

  final String id;
  final String name;
  final CategoryType type;
  final String icon;
  final String color;
  final String? emoji;
  final bool isSystem;
  final List<Subcategory> subcategories;
}
