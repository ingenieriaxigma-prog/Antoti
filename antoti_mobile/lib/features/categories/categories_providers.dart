import 'package:flutter_riverpod/flutter_riverpod.dart';

import 'data/initial_data_service.dart';
import 'domain/category.dart';

final initialDataServiceProvider = Provider<InitialDataService>((Ref ref) {
  return const InitialDataService();
});

final seededCategoriesProvider = Provider<List<Category>>((Ref ref) {
  final service = ref.watch(initialDataServiceProvider);
  return service.seedCategoriesIfEmpty(const <Category>[]);
});
