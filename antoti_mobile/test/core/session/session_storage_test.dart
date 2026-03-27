import 'package:flutter_test/flutter_test.dart';
import 'package:shared_preferences/shared_preferences.dart';

import 'package:antoti_mobile/core/session/session_storage.dart';

void main() {
  TestWidgetsFlutterBinding.ensureInitialized();

  setUp(() {
    SharedPreferences.setMockInitialValues(<String, Object>{});
    SessionStorage.resetForTest();
  });

  test('saveSession and readSession persist both tokens', () async {
    await SessionStorage.saveSession(
      accessToken: 'access-token',
      refreshToken: 'refresh-token',
    );

    final storedSession = await SessionStorage.readSession();

    expect(storedSession, isNotNull);
    expect(storedSession?.accessToken, 'access-token');
    expect(storedSession?.refreshToken, 'refresh-token');
  });

  test('clearSession removes persisted tokens', () async {
    await SessionStorage.saveSession(
      accessToken: 'access-token',
      refreshToken: 'refresh-token',
    );

    await SessionStorage.clearSession();

    expect(await SessionStorage.readSession(), isNull);
  });

  test('readSession returns null when only access token exists', () async {
    SharedPreferences.setMockInitialValues(<String, Object>{
      'access_token': 'access-token',
    });
    SessionStorage.resetForTest();

    expect(await SessionStorage.readSession(), isNull);
  });
}
