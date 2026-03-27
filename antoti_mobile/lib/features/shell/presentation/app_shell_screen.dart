import 'package:flutter/material.dart';
import 'package:go_router/go_router.dart';

class AppShellScreen extends StatelessWidget {
  const AppShellScreen({required this.child, super.key});

  final Widget child;

  static const List<String> _tabLocations = <String>[
    '/home',
    '/dashboard',
    '/chat',
  ];

  @override
  Widget build(BuildContext context) {
    final colorScheme = Theme.of(context).colorScheme;
    final currentLocation = GoRouterState.of(context).uri.path;
    final currentIndex = _resolveCurrentIndex(currentLocation);

    return Scaffold(
      body: SafeArea(child: child),
      bottomNavigationBar: BottomNavigationBar(
        currentIndex: currentIndex,
        onTap: (int index) {
          context.go(_tabLocations[index]);
        },
        type: BottomNavigationBarType.fixed,
        backgroundColor: Colors.white,
        selectedItemColor: colorScheme.primary,
        unselectedItemColor: colorScheme.onSurfaceVariant,
        items: const <BottomNavigationBarItem>[
          BottomNavigationBarItem(
            icon: Icon(Icons.home_rounded),
            label: 'Home',
          ),
          BottomNavigationBarItem(
            icon: Icon(Icons.dashboard_rounded),
            label: 'Dashboard',
          ),
          BottomNavigationBarItem(
            icon: Icon(Icons.chat_bubble_rounded),
            label: 'Chat',
          ),
        ],
      ),
    );
  }

  int _resolveCurrentIndex(String location) {
    if (location.startsWith('/dashboard')) {
      return 1;
    }

    if (location.startsWith('/chat')) {
      return 2;
    }

    return 0;
  }
}
