import 'package:flutter/material.dart';

import '../../shell/presentation/shell_placeholder_view.dart';

class ChatScreen extends StatelessWidget {
  const ChatScreen({super.key});

  @override
  Widget build(BuildContext context) {
    return const ShellPlaceholderView(
      title: 'Chat',
      subtitle: 'Your conversational finance assistant will appear here.',
      icon: Icons.chat_bubble_rounded,
    );
  }
}
