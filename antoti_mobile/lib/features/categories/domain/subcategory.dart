class Subcategory {
  const Subcategory({
    required this.id,
    required this.categoryId,
    required this.name,
    this.emoji,
  });

  final String id;
  final String categoryId;
  final String name;
  final String? emoji;
}
