import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:flutter_test/flutter_test.dart';
import 'package:go_router/go_router.dart';

import 'package:antoti_mobile/features/accounts/data/default_accounts.dart';
import 'package:antoti_mobile/features/transactions/domain/transaction.dart';
import 'package:antoti_mobile/features/transactions/domain/transaction_repository.dart';
import 'package:antoti_mobile/features/transactions/presentation/create_transaction_screen.dart';
import 'package:antoti_mobile/features/transactions/transactions_providers.dart';

class _FakeTransactionRepository implements TransactionRepository {
  final List<Transaction> _transactions = <Transaction>[];

  @override
  Future<void> addTransaction(Transaction transaction) async {
    _transactions.insert(0, transaction);
  }

  @override
  Future<List<Transaction>> getTransactions() async {
    return List<Transaction>.unmodifiable(_transactions);
  }
}

void main() {
  testWidgets(
    'updates subcategories, selects account and saves transaction',
    (WidgetTester tester) async {
      final repository = _FakeTransactionRepository();
      final router = GoRouter(
        initialLocation: '/create',
        routes: <RouteBase>[
          GoRoute(
            path: '/create',
            builder: (BuildContext context, GoRouterState state) {
              return const CreateTransactionScreen();
            },
          ),
          GoRoute(
            path: '/dashboard',
            builder: (BuildContext context, GoRouterState state) {
              return const Scaffold(
                body: Center(
                  child: Text('Dashboard destination'),
                ),
              );
            },
          ),
        ],
      );

      await tester.pumpWidget(
        ProviderScope(
          overrides: <Override>[
            transactionRepositoryProvider.overrideWithValue(repository),
          ],
          child: MaterialApp.router(
            routerConfig: router,
          ),
        ),
      );

      await tester.pumpAndSettle();

      expect(find.text('Create Transaction'), findsOneWidget);
      expect(find.text('Subcategory'), findsNothing);

      await tester.tap(find.byKey(const ValueKey<String>('account-expense-default')));
      await tester.pumpAndSettle();
      await tester.tap(find.text('Nequi').last);
      await tester.pumpAndSettle();

      await tester.tap(find.byKey(const ValueKey<String>('category-expense-none')));
      await tester.pumpAndSettle();
      await tester.tap(find.text('🍔 Alimentación').last);
      await tester.pumpAndSettle();

      expect(find.text('Subcategory'), findsOneWidget);

      await tester.tap(
        find.byKey(
          const ValueKey<String>(
            'subcategory-22222222-2222-4222-a222-222222222224-none',
          ),
        ),
      );
      await tester.pumpAndSettle();
      expect(find.text('🍽️ Restaurantes'), findsWidgets);
      expect(find.text('🚕 Taxi/Uber'), findsNothing);
      await tester.tap(find.text('🍽️ Restaurantes').last);
      await tester.pumpAndSettle();

      await tester.tap(
        find.byKey(
          const ValueKey<String>(
            'category-expense-22222222-2222-4222-a222-222222222224',
          ),
        ),
      );
      await tester.pumpAndSettle();
      await tester.tap(find.text('🚗 Transporte').last);
      await tester.pumpAndSettle();

      await tester.tap(
        find.byKey(
          const ValueKey<String>(
            'subcategory-22222222-2222-4222-a222-222222222225-none',
          ),
        ),
      );
      await tester.pumpAndSettle();
      expect(find.text('🚕 Taxi/Uber'), findsWidgets);
      expect(find.text('🍽️ Restaurantes'), findsNothing);
      await tester.tap(find.text('🚕 Taxi/Uber').last);
      await tester.pumpAndSettle();

      await tester.enterText(find.byType(TextField).at(0), '25.75');
      await tester.enterText(find.byType(TextField).at(1), 'Taxi to office');
      await tester.tap(find.text('Save'));
      await tester.pumpAndSettle();

      expect(find.text('Dashboard destination'), findsOneWidget);
      expect(repository.getTransactions(), completion(hasLength(1)));

      final Transaction transaction = (await repository.getTransactions()).single;
      expect(transaction.type, TransactionType.expense);
      expect(transaction.amount, 25.75);
      expect(transaction.accountId, 'ac111111-0000-4000-a000-000000000005');
      expect(transaction.categoryId, '22222222-2222-4222-a222-222222222225');
      expect(
        transaction.subcategoryId,
        '22222222-2222-4222-a222-222222222503',
      );
      expect(transaction.note, 'Taxi to office');
      expect(transaction.accountId, isNot(defaultCashAccountId));
    },
  );

  testWidgets(
    'validates transfer accounts and saves transfer without category',
    (WidgetTester tester) async {
      final repository = _FakeTransactionRepository();
      final router = GoRouter(
        initialLocation: '/create',
        routes: <RouteBase>[
          GoRoute(
            path: '/create',
            builder: (BuildContext context, GoRouterState state) {
              return const CreateTransactionScreen();
            },
          ),
          GoRoute(
            path: '/dashboard',
            builder: (BuildContext context, GoRouterState state) {
              return const Scaffold(
                body: Center(
                  child: Text('Dashboard destination'),
                ),
              );
            },
          ),
        ],
      );

      await tester.pumpWidget(
        ProviderScope(
          overrides: <Override>[
            transactionRepositoryProvider.overrideWithValue(repository),
          ],
          child: MaterialApp.router(
            routerConfig: router,
          ),
        ),
      );

      await tester.pumpAndSettle();

      await tester.tap(find.text('Transfer'));
      await tester.pumpAndSettle();

      expect(find.text('Category'), findsNothing);
      expect(find.text('Subcategory'), findsNothing);
      expect(find.text('From account'), findsOneWidget);
      expect(find.text('To account'), findsOneWidget);

      await tester.enterText(find.byType(TextField).at(0), '80');

      await tester.tap(find.byKey(const ValueKey<String>('from-account-none')));
      await tester.pumpAndSettle();
      await tester.tap(find.text('Bancolombia').last);
      await tester.pumpAndSettle();

      await tester.tap(find.byKey(const ValueKey<String>('to-account-none')));
      await tester.pumpAndSettle();
      await tester.tap(find.text('Bancolombia').last);
      await tester.pumpAndSettle();

      await tester.tap(find.text('Save'));
      await tester.pumpAndSettle();

      expect(
        find.text('Origin and destination accounts must be different.'),
        findsOneWidget,
      );
      expect(await repository.getTransactions(), isEmpty);

      await tester.tap(
        find.byKey(
          const ValueKey<String>(
            'to-account-ac111111-0000-4000-a000-000000000002',
          ),
        ),
      );
      await tester.pumpAndSettle();
      await tester.tap(find.text('Nequi').last);
      await tester.pumpAndSettle();

      await tester.enterText(find.byType(TextField).at(1), 'Move to wallet');
      await tester.tap(find.text('Save'));
      await tester.pumpAndSettle();

      expect(find.text('Dashboard destination'), findsOneWidget);

      final Transaction transaction = (await repository.getTransactions()).single;
      expect(transaction.type, TransactionType.transfer);
      expect(transaction.accountId, isNull);
      expect(transaction.fromAccountId, 'ac111111-0000-4000-a000-000000000002');
      expect(transaction.toAccountId, 'ac111111-0000-4000-a000-000000000005');
      expect(transaction.categoryId, isNull);
      expect(transaction.subcategoryId, isNull);
    },
  );
}
