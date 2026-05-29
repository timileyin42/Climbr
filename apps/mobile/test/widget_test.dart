import 'package:flutter_test/flutter_test.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:climbr/main.dart';

void main() {
  testWidgets('ClimbrApp renders without crashing', (WidgetTester tester) async {
    await tester.pumpWidget(const ProviderScope(child: ClimbrApp()));
    expect(find.byType(ClimbrApp), findsOneWidget);
  });
}
