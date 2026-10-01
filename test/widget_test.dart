import 'package:flutter_test/flutter_test.dart';
import 'package:app/main.dart';

void main() {
  testWidgets('Spice Garden Dashboard smoke test', (WidgetTester tester) async {
    await tester.pumpWidget(const MyApp());
    expect(find.text('Spice Garden'), findsWidgets);
    expect(find.text('Most Loved Dishes in Bangalore'), findsOneWidget);
  });
}
