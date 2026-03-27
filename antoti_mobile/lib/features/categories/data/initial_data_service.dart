import '../domain/category.dart';
import 'default_categories.dart';

class InitialDataService {
  const InitialDataService();

  List<Category> seedCategoriesIfEmpty(List<Category> categories) {
    if (categories.isNotEmpty) {
      return categories;
    }

    return List<Category>.unmodifiable(defaultCategories);
  }
}
