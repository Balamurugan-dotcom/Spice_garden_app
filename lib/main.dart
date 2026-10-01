import 'dart:async';
import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import 'food_data.dart';
import 'food_detail_screen.dart';
import 'cart_view.dart';
import 'account_view.dart';
import 'ask_us_view.dart';
import 'login_screen.dart';
import 'services/api_service.dart';

void main() async {
  WidgetsFlutterBinding.ensureInitialized();
  SystemChrome.setSystemUIOverlayStyle(
    const SystemUiOverlayStyle(
      statusBarColor: Colors.transparent,
      statusBarIconBrightness: Brightness.dark, // Black icons, clock, Wi-Fi, battery on Android
      statusBarBrightness: Brightness.light,    // Black icons on iOS
      systemNavigationBarColor: Colors.white,
      systemNavigationBarIconBrightness: Brightness.dark,
    ),
  );
  try {
    await ApiService().init().timeout(const Duration(seconds: 1));
  } catch (_) {}
  runApp(const MyApp());
}

// ----------------- COLOR SYSTEM -----------------
class AppColors {
  static const Color primary = Color(0xFFEA580C); // Warm Saffron Terracotta
  static const Color primaryLight = Color(0xFFFFF7ED); // Creamy Peach Glow
  static const Color primaryDark = Color(0xFF9A3412); // Deep Spice Ember
  static const Color bg = Color(0xFFFAF7F2); // Sophisticated warm ivory / soft cream background
  static const Color surface = Colors.white;
  static const Color surfaceMuted = Color(0xFFF5EFEB);
  static const Color cardBorder = Color(0xFFDEC19C); // Warm Saffron Gold Luxury Border
  static const Color textMain = Color(0xFF1C1917); // Deep Charcoal Espresso
  static const Color textSecondary = Color(0xFF78716C); // Elegant stone grey
  static const Color textMuted = Color(0xFFA8A29E); // Subtle grey
  static const Color vegGreen = Color(0xFF15803D);
  static const Color nonVegRed = Color(0xFFDC2626);
  static const Color starGold = Color(0xFFF59E0B);
  static const Color darkCardBg = Color(0xFF1C1917);
}

// ----------------- MODELS -----------------
class OrderItemRecord {
  final FoodItem food;
  final int quantity;

  const OrderItemRecord({required this.food, required this.quantity});
}

class PlacedOrder {
  final String orderId;
  final DateTime orderTime;
  final List<OrderItemRecord> items;
  final double subtotal;
  final double deliveryFee;
  final double packagingFee;
  final double tax;
  final double total;
  final String deliveryAddress;
  final String paymentMethod;
  int statusIndex; // 0: Placed, 1: Kitchen, 2: Out for Delivery, 3: Delivered

  PlacedOrder({
    required this.orderId,
    required this.orderTime,
    required this.items,
    required this.subtotal,
    required this.deliveryFee,
    required this.packagingFee,
    required this.tax,
    required this.total,
    required this.deliveryAddress,
    required this.paymentMethod,
    this.statusIndex = 1,
  });

  String get statusTitle {
    switch (statusIndex) {
      case 0:
        return 'Order Received';
      case 1:
        return 'Simmering in Kitchen';
      case 2:
        return 'Out for Delivery';
      case 3:
        return 'Delivered';
      default:
        return 'Processing';
    }
  }

  factory PlacedOrder.fromBackendJson(Map<String, dynamic> json) {
    int sIdx = 0;
    final statusStr = (json['orderStatus'] ?? '').toString();
    switch (statusStr) {
      case 'Order Placed':
        sIdx = 0;
        break;
      case 'Preparing':
        sIdx = 1;
        break;
      case 'Out for Delivery':
        sIdx = 2;
        break;
      case 'Delivered':
        sIdx = 3;
        break;
      default:
        sIdx = 0;
    }

    final itemsList = <OrderItemRecord>[];
    if (json['items'] is List) {
      for (final it in json['items']) {
        final name = (it['name'] ?? '').toString();
        final qty = (it['quantity'] as num?)?.toInt() ?? 1;
        final foodMatch = allFoodItems.firstWhere(
          (f) => f.name.toLowerCase().trim() == name.toLowerCase().trim(),
          orElse: () => allFoodItems[0],
        );
        itemsList.add(OrderItemRecord(food: foodMatch, quantity: qty));
      }
    }

    final addr = json['deliveryAddress'];
    String addressStr = '100 Feet Road, Indiranagar';
    if (addr is Map) {
      addressStr = '${addr['street'] ?? ''}, ${addr['area'] ?? ''}'.trim().replaceAll(RegExp(r'^,\s*'), '');
      if (addressStr.isEmpty) addressStr = 'Indiranagar, Bangalore';
    }

    final double sub = (json['subtotal'] as num?)?.toDouble() ?? 300.0;
    final double del = (json['deliveryCharge'] as num?)?.toDouble() ?? 40.0;
    final double grand = (json['totalAmount'] as num?)?.toDouble() ?? (sub + del);

    DateTime parsedTime = DateTime.now();
    if (json['createdAt'] != null) {
      try {
        parsedTime = DateTime.parse(json['createdAt'].toString());
      } catch (_) {}
    }

    return PlacedOrder(
      orderId: (json['orderId'] ?? 'SG-${json['_id']?.toString().substring(0, 6)}').toString(),
      orderTime: parsedTime,
      items: itemsList.isNotEmpty ? itemsList : [OrderItemRecord(food: allFoodItems[0], quantity: 1)],
      subtotal: sub,
      deliveryFee: del,
      packagingFee: 20.0,
      tax: sub * 0.05,
      total: grand,
      deliveryAddress: addressStr,
      paymentMethod: (json['paymentMethod'] ?? 'UPI').toString(),
      statusIndex: sIdx,
    );
  }
}

class CustomerReview {
  final String id;
  final String name;
  final String location;
  final double rating;
  final String comment;
  final List<String> lovedDishes;
  final String date;
  final Color avatarBg;

  const CustomerReview({
    required this.id,
    required this.name,
    required this.location,
    required this.rating,
    required this.comment,
    required this.lovedDishes,
    required this.date,
    required this.avatarBg,
  });
}

// Initial customer reviews
final List<CustomerReview> initialReviews = [
  const CustomerReview(
    id: 'r1',
    name: 'Priya Sundaram',
    location: 'Indiranagar 100ft Road',
    rating: 5.0,
    comment:
        'The Hyderabadi Dum Biryani was sensational! Ultra tender meat, aromatic aged basmati rice, and zero greasy aftertaste. Delivered piping hot in 24 minutes in heavy-duty thermal packing.',
    lovedDishes: ['Hyderabadi Dum Chicken Biryani', 'Kesari Rasmalai'],
    date: 'Yesterday',
    avatarBg: Color(0xFFEA580C),
  ),
  const CustomerReview(
    id: 'r2',
    name: 'Arjun Nambiar',
    location: 'Koramangala 4th Block',
    rating: 5.0,
    comment:
        'Hands down the best Chicken Ghee Roast in Bangalore. The Byadgi chilli paste and pure ghee glaze reminded me of traditional coastal home feasts. Absolute 10/10 perfection!',
    lovedDishes: ['Chicken Ghee Roast', 'Amritsari Kulcha with Chole'],
    date: '2 days ago',
    avatarBg: Color(0xFFC2410C),
  ),
  const CustomerReview(
    id: 'r3',
    name: 'Meera Kulkarni',
    location: 'HSR Layout Sector 2',
    rating: 5.0,
    comment:
        'Ordered Bangalore Mutton Sukka Curry and Dal Makhani for an anniversary family dinner. Melt-in-mouth lamb chunks and rich royal flavours that everyone praised wholeheartedly.',
    lovedDishes: ['Bangalore Mutton Sukka', 'Gulab Jamun with Shahi Rabdi'],
    date: '4 days ago',
    avatarBg: Color(0xFF9A3412),
  ),
];

// ----------------- ROOT APP -----------------
class MyApp extends StatelessWidget {
  const MyApp({super.key});

  @override
  Widget build(BuildContext context) {
    return MaterialApp(
      title: 'Spice Garden',
      debugShowCheckedModeBanner: false,
      theme: ThemeData(
        useMaterial3: true,
        fontFamily: 'Roboto',
        scaffoldBackgroundColor: AppColors.bg,
        appBarTheme: const AppBarTheme(
          systemOverlayStyle: SystemUiOverlayStyle(
            statusBarColor: Colors.transparent,
            statusBarIconBrightness: Brightness.dark,
            statusBarBrightness: Brightness.light,
            systemNavigationBarColor: Colors.white,
            systemNavigationBarIconBrightness: Brightness.dark,
          ),
        ),
        colorScheme: ColorScheme.fromSeed(
          seedColor: AppColors.primary,
          primary: AppColors.primary,
          surface: AppColors.surface,
        ),
      ),
      home: const MainTabScreen(),
    );
  }
}

// ----------------- MAIN APP CONTROLLER -----------------
class MainTabScreen extends StatefulWidget {
  const MainTabScreen({super.key});

  @override
  State<MainTabScreen> createState() => _MainTabScreenState();
}

class _MainTabScreenState extends State<MainTabScreen> {
  int _activeTabIndex = 0; // 0: Home, 1: Menu, 2: Orders, 3: Reviews
  String _menuSelectedCategory = 'All';
  String _menuSearchQuery = '';
  bool _autoFocusMenuSearch = false;
  final Map<String, int> _cart = {}; // dishId -> qty
  late List<CustomerReview> _reviewsList;
  final List<PlacedOrder> _ordersList = [];

  bool _isLoggedIn = false;
  String _userName = 'Guest Foodie';
  String _userPhone = '';
  String _userEmail = '';
  bool _pureVegMode = false;
  bool _isBackendConnected = false;
  Timer? _orderSyncTimer;

  Future<void> _checkBackendConnection() async {
    final ok = await ApiService().checkHealth();
    if (mounted) {
      setState(() => _isBackendConnected = ok);
    }
    if (ok) {
      // Fetch latest dishes from MongoDB and map food names to Mongo IDs
      await ApiService().fetchFoods();
      // If user is authenticated, sync live orders from MongoDB Atlas
      if (ApiService().isAuthenticated) {
        await _syncMyOrders();
      }
    }
  }

  Future<void> _syncMyOrders() async {
    if (!ApiService().isAuthenticated) return;
    final backendOrders = await ApiService().fetchMyOrders();
    if (backendOrders != null && backendOrders.isNotEmpty && mounted) {
      setState(() {
        for (final bo in backendOrders) {
          final mapped = PlacedOrder.fromBackendJson(bo);
          final existingIdx = _ordersList.indexWhere((o) => o.orderId == mapped.orderId);
          if (existingIdx >= 0) {
            _ordersList[existingIdx] = mapped;
          } else {
            _ordersList.insert(0, mapped);
          }
        }
      });
    }
  }

  Future<void> _openLoginModal({String? message, VoidCallback? onAfterSuccess}) async {
    await Navigator.push(
      context,
      MaterialPageRoute(
        builder: (ctx) => LoginScreen(
          customMessage: message,
          onLoginSuccess: (name, phone, email) {
            setState(() {
              _isLoggedIn = true;
              _userName = name;
              _userPhone = phone;
              _userEmail = email;
            });
            _syncMyOrders();
            onAfterSuccess?.call();
          },
          onSkip: () {},
        ),
      ),
    );
    if (mounted) {
      setState(() {});
    }
  }

  void _handleLogout() {
    ApiService().logout();
    setState(() {
      _isLoggedIn = false;
      _userName = 'Guest Foodie';
      _userPhone = '';
      _userEmail = '';
    });
    ScaffoldMessenger.of(context).showSnackBar(
      const SnackBar(
        content: Text('Logged out. You are now browsing as Guest.'),
        behavior: SnackBarBehavior.floating,
      ),
    );
  }

  String _currentZone = '100 Feet Road, Indiranagar';

  @override
  void initState() {
    super.initState();
    _reviewsList = List.from(initialReviews);

    // Auto-restore authenticated user session from shared_preferences
    if (ApiService().isAuthenticated && ApiService().currentUser != null) {
      final u = ApiService().currentUser!;
      _isLoggedIn = true;
      _userName = (u['name'] ?? 'Rahul Sharma').toString();
      _userEmail = (u['email'] ?? '').toString();
      _userPhone = (u['phone'] ?? '+91 98450 12345').toString();
    }

    // Check backend connection & sync catalog
    _checkBackendConnection();

    // Continuous background heartbeat: always connect and stay synced with backend
    Timer.periodic(const Duration(seconds: 10), (_) {
      if (mounted) {
        _checkBackendConnection();
      }
    });

    // Start background sync timer for active orders every 8 seconds
    _orderSyncTimer = Timer.periodic(const Duration(seconds: 8), (_) {
      if (mounted && _ordersList.any((o) => o.statusIndex < 3)) {
        _syncMyOrders();
      }
    });

    // Pre-seed demo active order so Orders tab has instant working data
    _ordersList.add(
      PlacedOrder(
        orderId: 'SG-2026-8942',
        orderTime: DateTime.now().subtract(const Duration(minutes: 12)),
        items: [
          OrderItemRecord(food: allFoodItems[0], quantity: 1), // Chicken Ghee Roast
          OrderItemRecord(food: allFoodItems[10], quantity: 1), // Old Delhi Butter Chicken
          OrderItemRecord(food: allFoodItems[22], quantity: 1), // Hyderabadi Dum Biryani
        ],
        subtotal: 990,
        deliveryFee: 0,
        packagingFee: 20,
        tax: 49.5,
        total: 1059.5,
        deliveryAddress: '100 Feet Road, Indiranagar',
        paymentMethod: 'UPI (Google Pay)',
        statusIndex: 1, // Simmering in Kitchen
      ),
    );

    // If app is newly opened and user is not logged in, redirect to Login Page!
    WidgetsBinding.instance.addPostFrameCallback((_) {
      if (!_isLoggedIn && mounted) {
        _openLoginModal(
          message: 'Welcome! Please log in to get royal discounts & track your orders live.',
        );
      }
    });
  }

  @override
  void dispose() {
    _orderSyncTimer?.cancel();
    super.dispose();
  }

  int get _cartItemCount => _cart.values.fold(0, (sum, q) => sum + q);

  double get _cartTotal {
    double total = 0;
    _cart.forEach((id, qty) {
      final item = allFoodItems.firstWhere((f) => f.id == id);
      total += item.price * qty;
    });
    return total;
  }

  void _addToCart(FoodItem item) {
    setState(() {
      _cart[item.id] = (_cart[item.id] ?? 0) + 1;
    });
    ScaffoldMessenger.of(context).showSnackBar(
      SnackBar(
        content: Text('Added "${item.name}" to cart'),
        duration: const Duration(milliseconds: 700),
        behavior: SnackBarBehavior.floating,
        backgroundColor: AppColors.primary,
      ),
    );
  }

  void _removeFromCart(FoodItem item) {
    setState(() {
      if (_cart.containsKey(item.id)) {
        if (_cart[item.id]! > 1) {
          _cart[item.id] = _cart[item.id]! - 1;
        } else {
          _cart.remove(item.id);
        }
      }
    });
  }

  void _reorderItems(PlacedOrder order) {
    setState(() {
      for (var record in order.items) {
        _cart[record.food.id] = (_cart[record.food.id] ?? 0) + record.quantity;
      }
    });
    _openCheckoutModal();
  }

  void _addNewReview(CustomerReview newReview) {
    setState(() {
      _reviewsList.insert(0, newReview);
    });
    ScaffoldMessenger.of(context).showSnackBar(
      const SnackBar(
        content: Text('Thank you! Your verified review has been published.'),
        backgroundColor: AppColors.vegGreen,
        behavior: SnackBarBehavior.floating,
      ),
    );
  }

  void _openFoodDetails(FoodItem item) {
    Navigator.push(
      context,
      MaterialPageRoute(
        builder: (ctx) => FoodDetailScreen(
          item: item,
          initialQuantity: _cart[item.id] ?? 1,
          onAddToCart: _addToCart,
          onRemoveFromCart: _removeFromCart,
          onOpenCart: _openCheckoutModal,
          pureVegMode: _pureVegMode,
        ),
      ),
    );
  }

  // Complete Order Placement Flow
  void _openCheckoutModal() {
    if (_cart.isEmpty) {
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(content: Text('Your cart is empty. Add some royal dishes!')),
      );
      return;
    }

    String selectedPayment = 'UPI (Instant)';
    final List<String> paymentOptions = ['UPI (Instant)', 'Cash on Delivery (COD)', 'Credit / Debit Card'];
    final List<String> zones = [
      '100 Feet Road, Indiranagar',
      'Koramangala 4th Block',
      'HSR Layout Sector 1',
      'Whitefield ITPL Main Rd',
      'Malleshwaram 8th Cross',
    ];

    showModalBottomSheet(
      context: context,
      isScrollControlled: true,
      backgroundColor: Colors.white,
      shape: const RoundedRectangleBorder(
        borderRadius: BorderRadius.vertical(top: Radius.circular(24)),
      ),
      builder: (ctx) {
        return StatefulBuilder(
          builder: (ctx, setSheetState) {
            final double subtotal = _cartTotal;
            final double deliveryFee = subtotal >= 500 ? 0 : 40;
            const double packaging = 20;
            final double tax = subtotal * 0.05;
            final double grandTotal = subtotal + deliveryFee + packaging + tax;

            return Padding(
              padding: EdgeInsets.only(
                left: 20,
                right: 20,
                top: 20,
                bottom: MediaQuery.of(ctx).viewInsets.bottom + 24,
              ),
              child: SingleChildScrollView(
                child: Column(
                  mainAxisSize: MainAxisSize.min,
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Row(
                      mainAxisAlignment: MainAxisAlignment.spaceBetween,
                      children: [
                        const Row(
                          children: [
                            Icon(Icons.shopping_bag_outlined, color: AppColors.primary),
                            SizedBox(width: 8),
                            Text('Confirm Your Order', style: TextStyle(fontSize: 18, fontWeight: FontWeight.bold)),
                          ],
                        ),
                        IconButton(icon: const Icon(Icons.close), onPressed: () => Navigator.pop(ctx)),
                      ],
                    ),
                    const Divider(),

                    // Items Summary
                    const Text('Order Items', style: TextStyle(fontSize: 13, fontWeight: FontWeight.bold)),
                    const SizedBox(height: 6),
                    ConstrainedBox(
                      constraints: const BoxConstraints(maxHeight: 180),
                      child: ListView(
                        shrinkWrap: true,
                        children: _cart.entries.map((entry) {
                          final item = allFoodItems.firstWhere((f) => f.id == entry.key);
                          return Padding(
                            padding: const EdgeInsets.symmetric(vertical: 4),
                            child: Row(
                              children: [
                                Icon(Icons.circle, size: 8, color: item.isVeg ? AppColors.vegGreen : AppColors.nonVegRed),
                                const SizedBox(width: 8),
                                Expanded(child: Text('${item.name} x ${entry.value}', style: const TextStyle(fontSize: 12, fontWeight: FontWeight.w600))),
                                Text('₹${(item.price * entry.value).toInt()}', style: const TextStyle(fontWeight: FontWeight.bold, fontSize: 13)),
                              ],
                            ),
                          );
                        }).toList(),
                      ),
                    ),
                    const SizedBox(height: 12),

                    // Delivery Zone Selector
                    const Text('Delivery Location (Bangalore)', style: TextStyle(fontSize: 13, fontWeight: FontWeight.bold)),
                    const SizedBox(height: 4),
                    Container(
                      padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 4),
                      decoration: BoxDecoration(
                        border: Border.all(color: Colors.grey.shade300),
                        borderRadius: BorderRadius.circular(10),
                      ),
                      child: DropdownButtonHideUnderline(
                        child: DropdownButton<String>(
                          value: _currentZone,
                          isExpanded: true,
                          items: zones.map((z) => DropdownMenuItem(value: z, child: Text(z, style: const TextStyle(fontSize: 13)))).toList(),
                          onChanged: (val) {
                            if (val != null) {
                              setSheetState(() => _currentZone = val);
                              setState(() => _currentZone = val);
                            }
                          },
                        ),
                      ),
                    ),
                    const SizedBox(height: 12),

                    // Payment Method Selector
                    const Text('Payment Method', style: TextStyle(fontSize: 13, fontWeight: FontWeight.bold)),
                    const SizedBox(height: 4),
                    Row(
                      children: paymentOptions.map((opt) {
                        final isSel = selectedPayment == opt;
                        return Expanded(
                          child: GestureDetector(
                            onTap: () => setSheetState(() => selectedPayment = opt),
                            child: Container(
                              margin: const EdgeInsets.symmetric(horizontal: 2),
                              padding: const EdgeInsets.symmetric(vertical: 8, horizontal: 4),
                              decoration: BoxDecoration(
                                color: isSel ? AppColors.primaryLight : Colors.white,
                                borderRadius: BorderRadius.circular(8),
                                border: Border.all(color: isSel ? AppColors.primary : Colors.grey.shade300),
                              ),
                              child: Text(
                                opt.split(' ')[0],
                                textAlign: TextAlign.center,
                                style: TextStyle(
                                  fontSize: 11,
                                  fontWeight: isSel ? FontWeight.bold : FontWeight.normal,
                                  color: isSel ? AppColors.primary : AppColors.textMain,
                                ),
                              ),
                            ),
                          ),
                        );
                      }).toList(),
                    ),
                    const SizedBox(height: 14),

                    // Bill Breakdown
                    Container(
                      padding: const EdgeInsets.all(12),
                      decoration: BoxDecoration(color: Colors.grey.shade50, borderRadius: BorderRadius.circular(12)),
                      child: Column(
                        children: [
                          _buildSummaryRow('Item Total', '₹${subtotal.toInt()}'),
                          _buildSummaryRow('Delivery Partner Fee', deliveryFee == 0 ? 'FREE' : '₹${deliveryFee.toInt()}'),
                          _buildSummaryRow('Restaurant Packaging', '₹${packaging.toInt()}'),
                          _buildSummaryRow('GST (5%)', '₹${tax.toInt()}'),
                          const Divider(),
                          Row(
                            mainAxisAlignment: MainAxisAlignment.spaceBetween,
                            children: [
                              const Text('To Pay', style: TextStyle(fontSize: 15, fontWeight: FontWeight.bold)),
                              Text('₹${grandTotal.toInt()}', style: const TextStyle(fontSize: 18, fontWeight: FontWeight.w900, color: AppColors.primary)),
                            ],
                          ),
                        ],
                      ),
                    ),
                    const SizedBox(height: 16),

                    // Place Order CTA
                    SizedBox(
                      width: double.infinity,
                      height: 50,
                      child: ElevatedButton(
                        style: ElevatedButton.styleFrom(
                          backgroundColor: AppColors.primary,
                          foregroundColor: Colors.white,
                          shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(14)),
                          elevation: 2,
                        ),
                        onPressed: () {
                          // Create PlacedOrder Record
                          final tempId = 'SG-2026-${(1000 + _ordersList.length * 123 + DateTime.now().millisecond % 900)}';
                          final newOrder = PlacedOrder(
                            orderId: tempId,
                            orderTime: DateTime.now(),
                            items: _cart.entries.map((e) {
                              return OrderItemRecord(
                                food: allFoodItems.firstWhere((f) => f.id == e.key),
                                quantity: e.value,
                              );
                            }).toList(),
                            subtotal: subtotal,
                            deliveryFee: deliveryFee,
                            packagingFee: packaging,
                            tax: tax,
                            total: grandTotal,
                            deliveryAddress: _currentZone,
                            paymentMethod: selectedPayment,
                            statusIndex: 1, // In Kitchen
                          );

                          // Trigger async sync with backend
                          final itemsPayload = _cart.entries.map((e) {
                            final item = allFoodItems.firstWhere((f) => f.id == e.key);
                            final mongoId = item.backendId ?? ApiService().resolveMongoId(item.name) ?? item.id;
                            return {
                              'food': mongoId,
                              'name': item.name,
                              'price': item.price,
                              'quantity': e.value,
                            };
                          }).toList();

                          ApiService().createOrder(
                            items: itemsPayload,
                            deliveryAddress: {
                              'street': _currentZone,
                              'area': 'Indiranagar',
                              'pincode': '560038',
                            },
                            paymentMethod: selectedPayment.contains('Cash') ? 'COD' : 'UPI',
                          ).then((res) {
                            if (res['success'] == true && res['data'] != null && mounted) {
                              final serverOrder = PlacedOrder.fromBackendJson(res['data']);
                              setState(() {
                                final idx = _ordersList.indexWhere((o) => o.orderId == tempId);
                                if (idx >= 0) {
                                  _ordersList[idx] = serverOrder;
                                }
                              });
                            }
                          });

                          Navigator.pop(ctx);
                          setState(() {
                            _ordersList.insert(0, newOrder);
                            _cart.clear();
                            _activeTabIndex = 4; // Jump directly to Account/Orders tab!
                          });

                          ScaffoldMessenger.of(context).showSnackBar(
                            SnackBar(
                              content: Text('🎉 Order #${newOrder.orderId} Placed! Synced with Kitchen & Admin.'),
                              backgroundColor: AppColors.vegGreen,
                              behavior: SnackBarBehavior.floating,
                            ),
                          );
                        },
                        child: Text('PAY ₹${grandTotal.toInt()} • PLACE ORDER', style: const TextStyle(fontWeight: FontWeight.bold, fontSize: 13, letterSpacing: 0.5)),
                      ),
                    ),
                  ],
                ),
              ),
            );
          },
        );
      },
    );
  }

  Widget _buildSummaryRow(String title, String val) {
    return Padding(
      padding: const EdgeInsets.symmetric(vertical: 2),
      child: Row(
        mainAxisAlignment: MainAxisAlignment.spaceBetween,
        children: [
          Text(title, style: const TextStyle(fontSize: 11, color: AppColors.textSecondary)),
          Text(val, style: const TextStyle(fontSize: 11, fontWeight: FontWeight.bold)),
        ],
      ),
    );
  }

  @override
  Widget build(BuildContext context) {
    return AnnotatedRegion<SystemUiOverlayStyle>(
      value: const SystemUiOverlayStyle(
        statusBarColor: Colors.transparent,
        statusBarIconBrightness: Brightness.dark, // Crisp black icons for clock, battery, wifi over light header
        statusBarBrightness: Brightness.light,    // Black icons for iOS
        systemNavigationBarColor: Colors.white,
        systemNavigationBarIconBrightness: Brightness.dark,
      ),
      child: Scaffold(
        backgroundColor: AppColors.bg,
        body: SafeArea(
          bottom: false,
          child: Container(
            color: AppColors.bg,
            child: Stack(
              children: [
                Column(
                  children: [
                  // Top Global Header with Logo & Cart
                  _buildTopHeader(),

                  // Main Active View (Home, Menu, Orders, or Reviews)
                  Expanded(
                    child: IndexedStack(
                      index: _activeTabIndex,
                    children: [
                      // TAB 0: HOME (Full Rich Restaurant Home Dashboard)
                      HomeView(
                        isActiveTab: _activeTabIndex == 0,
                        pureVegMode: _pureVegMode,
                        onGoToMenu: () => setState(() {
                          _menuSelectedCategory = 'All';
                          _menuSearchQuery = '';
                          _autoFocusMenuSearch = true;
                          _activeTabIndex = 1;
                        }),
                        onSelectCategory: (cat) => setState(() {
                          _menuSelectedCategory = cat;
                          _menuSearchQuery = '';
                          _autoFocusMenuSearch = false;
                          _activeTabIndex = 1;
                        }),
                        onSearch: (q) => setState(() {
                          _menuSearchQuery = q;
                          _menuSelectedCategory = 'All';
                          _autoFocusMenuSearch = false;
                          _activeTabIndex = 1;
                        }),
                        onGoToOrders: () => setState(() => _activeTabIndex = 4),
                        onGoToReviews: () => setState(() => _activeTabIndex = 3),
                        cart: _cart,
                        onAddToCart: _addToCart,
                        onRemoveFromCart: _removeFromCart,
                        onOpenFoodDetails: _openFoodDetails,
                        activeOrder: _ordersList.isNotEmpty ? _ordersList.first : null,
                        featuredReview: _reviewsList.isNotEmpty ? _reviewsList.first : null,
                      ),

                      // TAB 1: MENU (60 Dishes, Search, Filters, Categories)
                      MenuView(
                        pureVegMode: _pureVegMode,
                        initialCategory: _menuSelectedCategory,
                        initialSearchQuery: _menuSearchQuery,
                        autoFocusSearch: _autoFocusMenuSearch,
                        onCategoryChanged: (cat) => setState(() => _menuSelectedCategory = cat),
                        onSearchChanged: (q) => setState(() => _menuSearchQuery = q),
                        cart: _cart,
                        onAddToCart: _addToCart,
                        onRemoveFromCart: _removeFromCart,
                        onOpenFoodDetails: _openFoodDetails,
                      ),

                      // TAB 2: CART (Dedicated Cart & Checkout Tab)
                      CartView(
                        cart: _cart,
                        onAddToCart: _addToCart,
                        onRemoveFromCart: _removeFromCart,
                        isLoggedIn: _isLoggedIn,
                        onRequireLogin: () => _openLoginModal(
                          message: '🔒 Please log in or sign up to complete and place your order.',
                        ),
                        onOrderPlaced: (order) {
                          setState(() {
                            _ordersList.insert(0, order);
                            _cart.clear();
                            _activeTabIndex = 4; // Switch to Account to view the order!
                          });
                          ScaffoldMessenger.of(context).showSnackBar(
                            SnackBar(
                              content: Text('🎉 Order #${order.orderId} Placed Successfully!'),
                              backgroundColor: AppColors.vegGreen,
                              behavior: SnackBarBehavior.floating,
                              duration: const Duration(seconds: 3),
                            ),
                          );
                        },
                        onExploreMenu: () => setState(() => _activeTabIndex = 1),
                      ),

                      // TAB 3: ASK US (Concierge, Culinary FAQ, Live Support & Reviews)
                      AskUsView(
                        reviews: _reviewsList,
                        onAddReview: _addNewReview,
                        onExploreMenu: () => setState(() => _activeTabIndex = 1),
                      ),

                      // TAB 4: ACCOUNT (User Profile with Orders & Live Tracking inside!)
                      AccountView(
                        orders: _ordersList,
                        onReorder: _reorderItems,
                        onUpdateOrderStatus: (order, nextStatus) {
                          setState(() => order.statusIndex = nextStatus);
                        },
                        onGoToReviews: () => setState(() => _activeTabIndex = 3),
                        onGoToMenu: () => setState(() => _activeTabIndex = 1),
                        userName: _userName,
                        userPhone: _userPhone,
                        userEmail: _userEmail,
                        isLoggedIn: _isLoggedIn,
                        onLoginPressed: _openLoginModal,
                        onLogout: _handleLogout,
                        pureVegMode: _pureVegMode,
                        onTogglePureVegMode: (val) {
                          setState(() {
                            _pureVegMode = val;
                          });
                        },
                        isBackendConnected: _isBackendConnected,
                        onRefreshBackend: _checkBackendConnection,
                      ),
                    ],
                  ),
                ),
              ],
            ),

            // Floating Cart Pill (Visible when cart has items and not on Cart tab)
            if (_cartItemCount > 0 && _activeTabIndex != 2)
              Positioned(
                bottom: 16,
                left: 16,
                right: 16,
                child: _buildFloatingCartPill(),
              ),
          ],
        ),
      ),
      ),
      bottomNavigationBar: SafeArea(
        top: false,
        child: _buildCapsuleNavBar(),
      ),
    ),
  );
}

  // --- FLOATING CAPSULE NAVIGATION BAR (Airtel-Style Reference Design) ---
  Widget _buildCapsuleNavBar() {
    return Container(
      color: Colors.transparent,
      padding: const EdgeInsets.fromLTRB(14, 2, 14, 6),
      child: Container(
        padding: const EdgeInsets.symmetric(horizontal: 4, vertical: 5),
        decoration: BoxDecoration(
          color: Colors.white,
          borderRadius: BorderRadius.circular(36),
          border: Border.all(color: const Color(0xFFE2E8F0), width: 1.2),
          boxShadow: [
            BoxShadow(
              color: Colors.black.withValues(alpha: 0.08),
              blurRadius: 18,
              offset: const Offset(0, 4),
            ),
          ],
        ),
        child: Row(
          mainAxisAlignment: MainAxisAlignment.spaceAround,
          children: [
            _buildCapsuleNavItem(
              index: 0,
              icon: Icons.home_rounded,
              label: 'Home',
            ),
            _buildCapsuleNavItem(
              index: 1,
              icon: Icons.restaurant_menu_rounded,
              label: 'Menu',
            ),
            _buildCapsuleNavItem(
              index: 2,
              icon: Icons.shopping_bag_rounded,
              label: 'Cart',
              badgeCount: _cartItemCount,
            ),
            _buildCapsuleNavItem(
              index: 3,
              icon: Icons.headset_mic_rounded,
              label: 'Ask Us',
            ),
            _buildCapsuleNavItem(
              index: 4,
              icon: Icons.person_rounded,
              label: 'Account',
              badgeCount: _ordersList.length,
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildCapsuleNavItem({
    required int index,
    required IconData icon,
    required String label,
    int? badgeCount,
  }) {
    final isSelected = _activeTabIndex == index;

    return GestureDetector(
      onTap: () {
        setState(() {
          _activeTabIndex = index;
          _autoFocusMenuSearch = false;
        });
      },
      behavior: HitTestBehavior.opaque,
      child: AnimatedContainer(
        duration: const Duration(milliseconds: 200),
        curve: Curves.easeInOut,
        padding: isSelected
            ? const EdgeInsets.symmetric(horizontal: 14, vertical: 6)
            : const EdgeInsets.symmetric(horizontal: 10, vertical: 6),
        decoration: BoxDecoration(
          color: isSelected ? const Color(0xFFF1F5F9) : Colors.transparent,
          borderRadius: BorderRadius.circular(24),
          border: isSelected
              ? Border.all(color: const Color(0xFFE2E8F0), width: 1.0)
              : Border.all(color: Colors.transparent, width: 1.0),
        ),
        child: Column(
          mainAxisSize: MainAxisSize.min,
          children: [
            if (badgeCount != null && badgeCount > 0)
              Badge(
                isLabelVisible: true,
                label: Text(
                  '$badgeCount',
                  style: const TextStyle(fontSize: 9, fontWeight: FontWeight.bold),
                ),
                backgroundColor: AppColors.primary,
                textColor: Colors.white,
                child: Icon(
                  icon,
                  size: 22,
                  color: isSelected ? AppColors.primary : const Color(0xFF0F172A),
                ),
              )
            else
              Icon(
                icon,
                size: 22,
                color: isSelected ? AppColors.primary : const Color(0xFF0F172A),
              ),
            const SizedBox(height: 3),
            Text(
              label,
              style: TextStyle(
                fontSize: 10.5,
                fontWeight: isSelected ? FontWeight.w800 : FontWeight.w600,
                color: isSelected ? AppColors.primary : const Color(0xFF0F172A),
                letterSpacing: 0.1,
              ),
            ),
          ],
        ),
      ),
    );
  }

  // Top Header with clean, uncrowded luxury branding
  Widget _buildTopHeader() {
    return Container(
      decoration: const BoxDecoration(
        color: Colors.white,
        border: Border(
          bottom: BorderSide(color: AppColors.cardBorder, width: 1.5),
        ),
        boxShadow: [
          BoxShadow(
            color: Color(0x061C1917),
            blurRadius: 10,
            offset: Offset(0, 2),
          ),
        ],
      ),
      padding: const EdgeInsets.fromLTRB(16, 12, 16, 12),
      child: Row(
        children: [
          // 1. Restaurant Emblem Logo
          Container(
            width: 40,
            height: 40,
            padding: const EdgeInsets.all(2),
            decoration: BoxDecoration(
              color: Colors.white,
              borderRadius: BorderRadius.circular(12),
              border: Border.all(color: AppColors.cardBorder, width: 1.2),
              boxShadow: [
                BoxShadow(
                  color: Colors.black.withValues(alpha: 0.04),
                  blurRadius: 6,
                  offset: const Offset(0, 2),
                ),
              ],
            ),
            child: ClipRRect(
              borderRadius: BorderRadius.circular(9),
              child: Image.asset(
                'assets/images/logo.png',
                fit: BoxFit.contain,
                errorBuilder: (context, error, stackTrace) => Container(
                  color: AppColors.primary,
                  child: const Icon(Icons.restaurant, color: Colors.white, size: 20),
                ),
              ),
            ),
          ),
          const SizedBox(width: 10),

          // 2. Brand Title & Location (Flexible to never overflow)
          Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              mainAxisSize: MainAxisSize.min,
              children: [
                Row(
                  mainAxisSize: MainAxisSize.min,
                  children: [
                    const Flexible(
                      child: Text(
                        'Spice Garden',
                        style: TextStyle(
                          fontSize: 16,
                          fontWeight: FontWeight.w900,
                          color: AppColors.textMain,
                          letterSpacing: -0.3,
                        ),
                        overflow: TextOverflow.ellipsis,
                        maxLines: 1,
                      ),
                    ),
                    const SizedBox(width: 5),
                    Container(
                      padding: const EdgeInsets.symmetric(horizontal: 5, vertical: 1.2),
                      decoration: BoxDecoration(
                        color: AppColors.primaryLight,
                        borderRadius: BorderRadius.circular(5),
                        border: Border.all(color: AppColors.primary.withValues(alpha: 0.25), width: 0.8),
                      ),
                      child: const Text(
                        'BLR',
                        style: TextStyle(
                          fontSize: 9,
                          fontWeight: FontWeight.w900,
                          color: AppColors.primary,
                          letterSpacing: 0.4,
                        ),
                      ),
                    ),
                    if (_isBackendConnected) ...[
                      const SizedBox(width: 4),
                      Container(
                        padding: const EdgeInsets.symmetric(horizontal: 5, vertical: 1.2),
                        decoration: BoxDecoration(
                          color: AppColors.vegGreen.withValues(alpha: 0.12),
                          borderRadius: BorderRadius.circular(5),
                          border: Border.all(color: AppColors.vegGreen.withValues(alpha: 0.35), width: 0.8),
                        ),
                        child: Row(
                          mainAxisSize: MainAxisSize.min,
                          children: [
                            Container(width: 5, height: 5, decoration: const BoxDecoration(color: AppColors.vegGreen, shape: BoxShape.circle)),
                            const SizedBox(width: 3),
                            Text(
                              ApiService().baseUrl.contains('render') ? 'CLOUD LIVE' : 'ONLINE',
                              style: const TextStyle(
                                fontSize: 8.5,
                                fontWeight: FontWeight.w900,
                                color: AppColors.vegGreen,
                                letterSpacing: 0.2,
                              ),
                            ),
                          ],
                        ),
                      ),
                    ],
                    if (_pureVegMode) ...[
                      const SizedBox(width: 5),
                      Container(
                        padding: const EdgeInsets.symmetric(horizontal: 5, vertical: 1.2),
                        decoration: BoxDecoration(
                          color: AppColors.vegGreen.withValues(alpha: 0.12),
                          borderRadius: BorderRadius.circular(5),
                          border: Border.all(color: AppColors.vegGreen.withValues(alpha: 0.35), width: 0.8),
                        ),
                        child: const Row(
                          mainAxisSize: MainAxisSize.min,
                          children: [
                            Icon(Icons.eco_rounded, size: 9, color: AppColors.vegGreen),
                            SizedBox(width: 2),
                            Text(
                              'PURE VEG',
                              style: TextStyle(
                                fontSize: 8.5,
                                fontWeight: FontWeight.w900,
                                color: AppColors.vegGreen,
                                letterSpacing: 0.3,
                              ),
                            ),
                          ],
                        ),
                      ),
                    ],
                  ],
                ),
                const SizedBox(height: 2),
                const Row(
                  children: [
                    Icon(Icons.location_on_rounded, size: 12, color: AppColors.primary),
                    SizedBox(width: 3),
                    Flexible(
                      child: Text(
                        'Indiranagar • Express 25m',
                        style: TextStyle(
                          fontSize: 11,
                          color: AppColors.textSecondary,
                          fontWeight: FontWeight.w600,
                        ),
                        overflow: TextOverflow.ellipsis,
                        maxLines: 1,
                      ),
                    ),
                  ],
                ),
              ],
            ),
          ),
          const SizedBox(width: 8),

          // 3. User Login / Profile Pill (Constrained width to avoid pushing boundary)
          GestureDetector(
            onTap: _isLoggedIn ? () => setState(() => _activeTabIndex = 4) : _openLoginModal,
            child: Container(
              padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 6),
              decoration: BoxDecoration(
                color: AppColors.primaryLight,
                borderRadius: BorderRadius.circular(20),
                border: Border.all(color: AppColors.cardBorder, width: 1.2),
                boxShadow: [
                  BoxShadow(
                    color: Colors.black.withValues(alpha: 0.03),
                    blurRadius: 4,
                    offset: const Offset(0, 1),
                  ),
                ],
              ),
              child: Row(
                mainAxisSize: MainAxisSize.min,
                children: [
                  Icon(
                    _isLoggedIn ? Icons.account_circle_rounded : Icons.login_rounded,
                    color: AppColors.primary,
                    size: 15,
                  ),
                  const SizedBox(width: 4),
                  ConstrainedBox(
                    constraints: const BoxConstraints(maxWidth: 82),
                    child: Text(
                      _isLoggedIn ? (_userName.split(' ').first) : 'Log In',
                      style: const TextStyle(
                        color: AppColors.primaryDark,
                        fontSize: 11,
                        fontWeight: FontWeight.w800,
                      ),
                      overflow: TextOverflow.ellipsis,
                      maxLines: 1,
                    ),
                  ),
                ],
              ),
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildFloatingCartPill() {
    return GestureDetector(
      onTap: () => setState(() => _activeTabIndex = 2),
      child: Container(
        padding: const EdgeInsets.symmetric(horizontal: 18, vertical: 13),
        decoration: BoxDecoration(
          color: AppColors.primary,
          borderRadius: BorderRadius.circular(20),
          boxShadow: [
            BoxShadow(
              color: AppColors.primary.withValues(alpha: 0.35),
              blurRadius: 18,
              offset: const Offset(0, 6),
            ),
          ],
        ),
        child: Row(
          mainAxisAlignment: MainAxisAlignment.spaceBetween,
          children: [
            Row(
              children: [
                const Icon(Icons.shopping_bag_rounded, color: Colors.white, size: 20),
                const SizedBox(width: 10),
                Text(
                  '$_cartItemCount Items  |  ₹${_cartTotal.toInt()}',
                  style: const TextStyle(color: Colors.white, fontWeight: FontWeight.bold, fontSize: 14),
                ),
              ],
            ),
            const Row(
              children: [
                Text('PLACE ORDER', style: TextStyle(color: Colors.white, fontWeight: FontWeight.w900, fontSize: 12, letterSpacing: 0.5)),
                SizedBox(width: 4),
                Icon(Icons.arrow_forward_ios_rounded, color: Colors.white, size: 12),
              ],
            ),
          ],
        ),
      ),
    );
  }
}

// ==========================================
// 1. HOME VIEW FUNCTION (Full-Page Dashboard)
// ==========================================
class HomeView extends StatefulWidget {
  final bool isActiveTab;
  final VoidCallback onGoToMenu;
  final ValueChanged<String> onSelectCategory;
  final ValueChanged<String> onSearch;
  final VoidCallback onGoToOrders;
  final VoidCallback onGoToReviews;
  final Map<String, int> cart;
  final Function(FoodItem) onAddToCart;
  final Function(FoodItem) onRemoveFromCart;
  final Function(FoodItem) onOpenFoodDetails;
  final PlacedOrder? activeOrder;
  final CustomerReview? featuredReview;
  final bool pureVegMode;

  const HomeView({
    super.key,
    this.isActiveTab = true,
    required this.onGoToMenu,
    required this.onSelectCategory,
    required this.onSearch,
    required this.onGoToOrders,
    required this.onGoToReviews,
    required this.cart,
    required this.onAddToCart,
    required this.onRemoveFromCart,
    required this.onOpenFoodDetails,
    this.activeOrder,
    this.featuredReview,
    this.pureVegMode = false,
  });

  @override
  State<HomeView> createState() => _HomeViewState();
}

class _HomeViewState extends State<HomeView> {
  final TextEditingController _homeSearchCtrl = TextEditingController();
  String _homeSearchQuery = '';
  late final PageController _heroSlideCtrl;
  Timer? _heroSlideTimer;
  int _currentHeroSlide = 0;
  late List<Map<String, dynamic>> _heroSlideData;

  List<Map<String, dynamic>> _buildHeroSlideData(bool vegOnly) {
    if (vegOnly) {
      return [
        {
          'dish': allFoodItems.firstWhere((f) => f.isVeg && f.category == 'Biryani', orElse: () => allFoodItems[23]),
          'tag': 'ROYAL VEG BIRYANI',
          'subtitle': 'Aged basmati rice, handi garden veggies & saffron',
          'delivery': '25–30 mins',
        },
        {
          'dish': allFoodItems.firstWhere((f) => f.isVeg && f.name.contains('Tikka'), orElse: () => allFoodItems[1]),
          'tag': 'CLAY OVEN TANDOOR',
          'subtitle': 'Charred malai paneer with mint coriander chutney',
          'delivery': '20–25 mins',
        },
        {
          'dish': allFoodItems.firstWhere((f) => f.isVeg && (f.name.contains('Dal') || f.name.contains('Makhani')), orElse: () => allFoodItems[11]),
          'tag': 'SLOW-COOKED HERITAGE',
          'subtitle': 'Overnight simmered black lentils & white butter',
          'delivery': '20–25 mins',
        },
        {
          'dish': allFoodItems.firstWhere((f) => f.isVeg && f.name.contains('Crispy Corn'), orElse: () => allFoodItems[2]),
          'tag': 'CRISPY SIZZLER',
          'subtitle': 'Golden sweet corn tossed with cracked pepper & herbs',
          'delivery': '15–20 mins',
        },
        {
          'dish': allFoodItems.firstWhere((f) => f.isVeg && f.category == 'Desserts', orElse: () => allFoodItems[40]),
          'tag': 'ROYAL SWEET ENDING',
          'subtitle': 'Soft cottage cheese patties in saffron rabdi',
          'delivery': '15–20 mins',
        },
      ];
    }
    return [
      {
        'dish': allFoodItems.firstWhere((f) => f.category == 'Biryani'), // Royal Dum Biryani is #1!
        'tag': 'ROYAL SIGNATURE',
        'subtitle': 'Aged basmati rice, tender meat & saffron aroma',
        'delivery': '25–30 mins',
      },
      {
        'dish': allFoodItems.firstWhere((f) => f.name.contains('Ghee Roast'), orElse: () => allFoodItems[0]),
        'tag': 'COASTAL LEGEND',
        'subtitle': 'Slow-roasted Byadgi chilli & pure desi ghee',
        'delivery': '30–35 mins',
      },
      {
        'dish': allFoodItems.firstWhere((f) => f.name.contains('Butter Chicken'), orElse: () => allFoodItems[10]),
        'tag': 'OLD DELHI HERITAGE',
        'subtitle': 'Cashew tomato cream & tandoori-charred chicken',
        'delivery': '25–30 mins',
      },
      {
        'dish': allFoodItems.firstWhere((f) => f.name.contains('Tikka'), orElse: () => allFoodItems[1]),
        'tag': 'CLAY OVEN TANDOOR',
        'subtitle': 'Charred malai paneer with mint coriander chutney',
        'delivery': '20–25 mins',
      },
      {
        'dish': allFoodItems.firstWhere((f) => f.category == 'Desserts'),
        'tag': 'ROYAL SWEET ENDING',
        'subtitle': 'Soft cottage cheese patties in saffron rabdi',
        'delivery': '15–20 mins',
      },
    ];
  }

  @override
  void initState() {
    super.initState();
    _heroSlideData = _buildHeroSlideData(widget.pureVegMode);
    _heroSlideCtrl = PageController(initialPage: 0);
    _startAutoSlideTimer();
  }

  @override
  void didUpdateWidget(covariant HomeView oldWidget) {
    super.didUpdateWidget(oldWidget);
    if (widget.pureVegMode != oldWidget.pureVegMode) {
      setState(() {
        _heroSlideData = _buildHeroSlideData(widget.pureVegMode);
        _currentHeroSlide = 0;
        if (_heroSlideCtrl.hasClients) {
          _heroSlideCtrl.jumpToPage(0);
        }
      });
    }
    if (widget.isActiveTab && !oldWidget.isActiveTab) {
      _startAutoSlideTimer();
    } else if (!widget.isActiveTab && oldWidget.isActiveTab) {
      _heroSlideTimer?.cancel();
    }
  }

  void _startAutoSlideTimer() {
    _heroSlideTimer?.cancel();
    _heroSlideTimer = Timer.periodic(const Duration(milliseconds: 3500), (timer) async {
      if (!mounted) {
        timer.cancel();
        return;
      }
      if (!widget.isActiveTab) return;

      final modal = ModalRoute.of(context);
      if (modal != null && !modal.isCurrent) return;

      if (!TickerMode.of(context)) return;

      if (!_heroSlideCtrl.hasClients) return;

      try {
        final position = _heroSlideCtrl.position;
        if (!position.hasViewportDimension || position.viewportDimension <= 0) return;

        final currentPos = _heroSlideCtrl.page?.round() ?? _currentHeroSlide;
        final next = (currentPos + 1) % _heroSlideData.length;

        await _heroSlideCtrl.animateToPage(
          next,
          duration: const Duration(milliseconds: 650),
          curve: Curves.easeInOutCubic,
        );
      } catch (_) {}
    });
  }

  void _onSlideChanged(int idx) {
    if (_currentHeroSlide != idx) {
      setState(() => _currentHeroSlide = idx);
    }
    _startAutoSlideTimer();
  }

  @override
  void dispose() {
    _heroSlideTimer?.cancel();
    _heroSlideCtrl.dispose();
    _homeSearchCtrl.dispose();
    super.dispose();
  }

  void _triggerSearch(String query) {
    if (query.trim().isNotEmpty) {
      widget.onSearch(query.trim());
    }
  }

  @override
  Widget build(BuildContext context) {
    if (widget.isActiveTab && (_heroSlideTimer == null || !_heroSlideTimer!.isActive)) {
      _startAutoSlideTimer();
    }

    final dishPool = widget.pureVegMode ? allFoodItems.where((f) => f.isVeg).toList() : allFoodItems;

    final bestSellers = dishPool.where((f) => f.rating >= 4.8).take(6).toList();
    final biryaniSpecials = dishPool.where((f) => f.category == 'Biryani').take(4).toList();
    final starterSpecials = dishPool.where((f) => f.category == 'Starters').take(5).toList();
    final sweetAndDrinks = dishPool.where((f) => f.category == 'Desserts' || f.category == 'Beverages').take(5).toList();

    final categoriesList = [
      {'name': 'Biryani', 'subtitle': '${dishPool.where((f) => f.category == 'Biryani').length} dishes', 'icon': Icons.rice_bowl_rounded, 'color': const Color(0xFFD97706)},
      {'name': 'Starters', 'subtitle': '${dishPool.where((f) => f.category == 'Starters').length} dishes', 'icon': Icons.local_fire_department_rounded, 'color': const Color(0xFFEA580C)},
      {'name': 'Main Course', 'subtitle': '${dishPool.where((f) => f.category == 'Main Course').length} dishes', 'icon': Icons.dinner_dining_rounded, 'color': const Color(0xFFB45309)},
      {'name': 'Chinese', 'subtitle': '${dishPool.where((f) => f.category == 'Chinese').length} dishes', 'icon': Icons.ramen_dining_rounded, 'color': const Color(0xFFDC2626)},
      {'name': 'Desserts', 'subtitle': '${dishPool.where((f) => f.category == 'Desserts').length} dishes', 'icon': Icons.icecream_rounded, 'color': const Color(0xFFDB2777)},
      {'name': 'Beverages', 'subtitle': '${dishPool.where((f) => f.category == 'Beverages').length} dishes', 'icon': Icons.local_cafe_rounded, 'color': const Color(0xFF2563EB)},
    ];

    return SingleChildScrollView(
      physics: const BouncingScrollPhysics(),
      padding: EdgeInsets.only(bottom: widget.cart.isNotEmpty ? 76 : 16),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          // 1. Large Modern Search Bar with 20px corners & subtle shadow (Redirects into Menu page)
          Padding(
            padding: const EdgeInsets.fromLTRB(16, 12, 16, 8),
            child: Material(
              color: Colors.transparent,
              child: InkWell(
                borderRadius: BorderRadius.circular(20),
                onTap: widget.onGoToMenu,
                child: Container(
                  height: 52,
                  decoration: BoxDecoration(
                    color: Colors.white,
                    borderRadius: BorderRadius.circular(20),
                    border: Border.all(
                      color: AppColors.cardBorder,
                      width: 1.2,
                    ),
                    boxShadow: [
                      BoxShadow(
                        color: const Color(0xFF1C1917).withValues(alpha: 0.04),
                        blurRadius: 14,
                        offset: const Offset(0, 4),
                      ),
                    ],
                  ),
                  child: const Row(
                    children: [
                      Padding(
                        padding: EdgeInsets.symmetric(horizontal: 16),
                        child: Icon(Icons.search_rounded, color: AppColors.primary, size: 22),
                      ),
                      Expanded(
                        child: Text(
                          'Search dishes, biryani, starters...',
                          style: TextStyle(
                            fontSize: 13.5,
                            color: AppColors.textMuted,
                            fontWeight: FontWeight.normal,
                          ),
                          overflow: TextOverflow.ellipsis,
                        ),
                      ),
                    ],
                  ),
                ),
              ),
            ),
          ),

          // Pure Veg Mode Banner Indicator
          if (widget.pureVegMode)
            Padding(
              padding: const EdgeInsets.fromLTRB(16, 0, 16, 8),
              child: Container(
                padding: const EdgeInsets.symmetric(horizontal: 14, vertical: 8),
                decoration: BoxDecoration(
                  color: AppColors.vegGreen.withValues(alpha: 0.08),
                  borderRadius: BorderRadius.circular(14),
                  border: Border.all(color: AppColors.vegGreen.withValues(alpha: 0.25), width: 1.0),
                ),
                child: const Row(
                  children: [
                    Icon(Icons.eco_rounded, color: AppColors.vegGreen, size: 16),
                    SizedBox(width: 8),
                    Expanded(
                      child: Text(
                        'Pure Veg Mode Active • Showing 100% vegetarian & eggless delicacies',
                        style: TextStyle(
                          fontSize: 11,
                          fontWeight: FontWeight.w700,
                          color: AppColors.vegGreen,
                        ),
                      ),
                    ),
                  ],
                ),
              ),
            ),

          // Quick Search Keyword Chips
          SingleChildScrollView(
            scrollDirection: Axis.horizontal,
            physics: const BouncingScrollPhysics(),
            padding: const EdgeInsets.symmetric(horizontal: 16),
            child: Row(
              children: (widget.pureVegMode
                      ? ['Subz Biryani', 'Paneer Tikka', 'Dal Makhani', 'Crispy Corn', 'Rasmalai']
                      : ['Dum Biryani', 'Chicken Ghee Roast', 'Butter Chicken', 'Paneer Tikka', 'Rasmalai'])
                  .map((chip) => _buildSearchChip(chip))
                  .toList(),
            ),
          ),

          // IF SEARCHING: Show Live Instant Search Results
          if (_homeSearchQuery.isNotEmpty) ...[
            _buildLiveSearchResultsSection(dishPool),
          ] else ...[
            // 2. Featured Biryani / Hero Moving Slides Carousel
            Padding(
              padding: const EdgeInsets.fromLTRB(16, 14, 16, 0),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Row(
                    mainAxisAlignment: MainAxisAlignment.spaceBetween,
                    children: [
                      const Text(
                        'Featured Specialties ✨',
                        style: TextStyle(
                          fontSize: 17,
                          fontWeight: FontWeight.w900,
                          color: AppColors.textMain,
                          letterSpacing: -0.3,
                        ),
                      ),
                      TextButton(
                        onPressed: widget.onGoToMenu,
                        style: TextButton.styleFrom(
                          padding: EdgeInsets.zero,
                          minimumSize: Size.zero,
                          tapTargetSize: MaterialTapTargetSize.shrinkWrap,
                        ),
                        child: const Text('Full Menu ➔', style: TextStyle(color: AppColors.primary, fontWeight: FontWeight.w700, fontSize: 12)),
                      ),
                    ],
                  ),
                  _buildMovingHeroSlides(),
                ],
              ),
            ),

            // 3. Special Offers & Promo Banners Carousel
            SizedBox(
              height: 116,
              child: ListView(
                scrollDirection: Axis.horizontal,
                physics: const BouncingScrollPhysics(),
                padding: const EdgeInsets.symmetric(horizontal: 14),
                children: [
                  _buildPromoCard(
                    badge: 'FLAT ₹150 OFF',
                    title: 'ROYAL FEAST OFFER',
                    subtitle: 'Use code SPICE150 on orders above ₹499',
                    cta: 'APPLY NOW',
                    icon: Icons.local_offer_rounded,
                    startColor: const Color(0xFF9A3412),
                    endColor: const Color(0xFFEA580C),
                    onTap: () {
                      ScaffoldMessenger.of(context).showSnackBar(
                        const SnackBar(
                          content: Text('Coupon code SPICE150 copied! Applied at checkout.'),
                          backgroundColor: AppColors.primary,
                          behavior: SnackBarBehavior.floating,
                        ),
                      );
                    },
                  ),
                  _buildPromoCard(
                    badge: 'FREE DESSERT',
                    title: 'ROYAL DUM FEST',
                    subtitle: 'Free Kesari Phirni with any Dum Biryani Handi',
                    cta: 'EXPLORE',
                    icon: Icons.rice_bowl_rounded,
                    startColor: const Color(0xFF78350F),
                    endColor: const Color(0xFFD97706),
                    onTap: () => widget.onSelectCategory('Biryani'),
                  ),
                  _buildPromoCard(
                    badge: '100% PURE GHEE',
                    title: 'COASTAL SPECIALS',
                    subtitle: 'Authentic Byadgi chilli & coastal spices',
                    cta: 'DISCOVER',
                    icon: Icons.soup_kitchen_rounded,
                    startColor: const Color(0xFF1C1917),
                    endColor: const Color(0xFF292524),
                    onTap: () => widget.onSelectCategory('Starters'),
                  ),
                ],
              ),
            ),

            // 4. Explore by Category Section
            Padding(
              padding: const EdgeInsets.fromLTRB(16, 22, 16, 12),
              child: Row(
                mainAxisAlignment: MainAxisAlignment.spaceBetween,
                children: [
                  const Text(
                    'Explore Categories',
                    style: TextStyle(
                      fontSize: 17,
                      fontWeight: FontWeight.w900,
                      color: AppColors.textMain,
                      letterSpacing: -0.3,
                    ),
                  ),
                  TextButton(
                    onPressed: widget.onGoToMenu,
                    style: TextButton.styleFrom(
                      padding: EdgeInsets.zero,
                      minimumSize: Size.zero,
                      tapTargetSize: MaterialTapTargetSize.shrinkWrap,
                    ),
                    child: Text(
                      widget.pureVegMode ? 'All Veg Dishes (${dishPool.length}) ➔' : 'All Dishes (60) ➔',
                      style: const TextStyle(fontWeight: FontWeight.w700, fontSize: 12, color: AppColors.primary),
                    ),
                  ),
                ],
              ),
            ),
            SizedBox(
              height: 118,
              child: ListView.builder(
                scrollDirection: Axis.horizontal,
                physics: const BouncingScrollPhysics(),
                padding: const EdgeInsets.symmetric(horizontal: 12),
                itemCount: categoriesList.length,
                itemBuilder: (ctx, i) {
                  final cat = categoriesList[i];
                  final name = cat['name'] as String;
                  final sampleDish = dishPool.firstWhere((f) => f.category == name, orElse: () => dishPool[0]);

                  return GestureDetector(
                    onTap: () => widget.onSelectCategory(name),
                    child: Container(
                      width: 82,
                      margin: const EdgeInsets.symmetric(horizontal: 4),
                      child: Column(
                        mainAxisSize: MainAxisSize.min,
                        children: [
                          Container(
                            width: 66,
                            height: 66,
                            decoration: BoxDecoration(
                              shape: BoxShape.circle,
                              border: Border.all(color: AppColors.cardBorder, width: 1.5),
                              boxShadow: [
                                BoxShadow(
                                  color: const Color(0xFF1C1917).withValues(alpha: 0.05),
                                  blurRadius: 8,
                                  offset: const Offset(0, 3),
                                ),
                              ],
                            ),
                            child: ClipOval(
                              child: Image.asset(
                                sampleDish.imagePath,
                                fit: BoxFit.cover,
                                errorBuilder: (c, e, s) => Container(
                                  color: AppColors.primaryLight,
                                  child: Icon(cat['icon'] as IconData, color: cat['color'] as Color, size: 26),
                                ),
                              ),
                            ),
                          ),
                          const SizedBox(height: 7),
                          Text(
                            name,
                            style: const TextStyle(
                              fontSize: 12,
                              fontWeight: FontWeight.w700,
                              color: AppColors.textMain,
                            ),
                            maxLines: 1,
                            overflow: TextOverflow.ellipsis,
                            textAlign: TextAlign.center,
                          ),
                          const SizedBox(height: 1),
                          Text(
                            cat['subtitle'] as String,
                            style: const TextStyle(
                              fontSize: 10,
                              color: AppColors.textSecondary,
                              fontWeight: FontWeight.w500,
                            ),
                          ),
                        ],
                      ),
                    ),
                  );
                },
              ),
            ),

            const SizedBox(height: 16),

            // 5. Today's Bestsellers Section
            Padding(
              padding: const EdgeInsets.fromLTRB(16, 8, 16, 8),
              child: Row(
                mainAxisAlignment: MainAxisAlignment.spaceBetween,
                children: [
                  const Text(
                    'Today\'s Bestsellers 🔥',
                    style: TextStyle(
                      fontSize: 17,
                      fontWeight: FontWeight.w900,
                      color: AppColors.textMain,
                      letterSpacing: -0.3,
                    ),
                  ),
                  TextButton(
                    onPressed: widget.onGoToMenu,
                    style: TextButton.styleFrom(
                      padding: EdgeInsets.zero,
                      minimumSize: Size.zero,
                      tapTargetSize: MaterialTapTargetSize.shrinkWrap,
                    ),
                    child: const Text('See All ➔', style: TextStyle(fontWeight: FontWeight.w700, fontSize: 12, color: AppColors.primary)),
                  ),
                ],
              ),
            ),
            _buildHorizontalDishList(bestSellers),

            const SizedBox(height: 20),

            // 6. Royal Dum Biryani Handis Section
            Padding(
              padding: const EdgeInsets.fromLTRB(16, 8, 16, 8),
              child: Row(
                mainAxisAlignment: MainAxisAlignment.spaceBetween,
                children: [
                  Text(
                    widget.pureVegMode ? 'Royal Handi Veg Biryanis 🍲' : 'Royal Dum Biryanis 🍲',
                    style: const TextStyle(
                      fontSize: 17,
                      fontWeight: FontWeight.w900,
                      color: AppColors.textMain,
                      letterSpacing: -0.3,
                    ),
                  ),
                  TextButton(
                    onPressed: () => widget.onSelectCategory('Biryani'),
                    style: TextButton.styleFrom(
                      padding: EdgeInsets.zero,
                      minimumSize: Size.zero,
                      tapTargetSize: MaterialTapTargetSize.shrinkWrap,
                    ),
                    child: const Text('View All ➔', style: TextStyle(fontWeight: FontWeight.w700, fontSize: 12, color: AppColors.primary)),
                  ),
                ],
              ),
            ),
            _buildHorizontalDishList(biryaniSpecials),

            const SizedBox(height: 20),

            // 7. Chef's Sizzling Starters Section
            Padding(
              padding: const EdgeInsets.fromLTRB(16, 8, 16, 8),
              child: Row(
                mainAxisAlignment: MainAxisAlignment.spaceBetween,
                children: [
                  Text(
                    widget.pureVegMode ? 'Chef\'s Crispy Veg Starters 🥗' : 'Chef\'s Sizzling Starters 🍗',
                    style: const TextStyle(
                      fontSize: 17,
                      fontWeight: FontWeight.w900,
                      color: AppColors.textMain,
                      letterSpacing: -0.3,
                    ),
                  ),
                  TextButton(
                    onPressed: () => widget.onSelectCategory('Starters'),
                    style: TextButton.styleFrom(
                      padding: EdgeInsets.zero,
                      minimumSize: Size.zero,
                      tapTargetSize: MaterialTapTargetSize.shrinkWrap,
                    ),
                    child: const Text('View All ➔', style: TextStyle(fontWeight: FontWeight.w700, fontSize: 12, color: AppColors.primary)),
                  ),
                ],
              ),
            ),
            _buildHorizontalDishList(starterSpecials),

            const SizedBox(height: 20),

            // 8. Royal Desserts & Refreshers Section
            Padding(
              padding: const EdgeInsets.fromLTRB(16, 8, 16, 8),
              child: Row(
                mainAxisAlignment: MainAxisAlignment.spaceBetween,
                children: [
                  const Text(
                    'Desserts & Refreshers 🍨',
                    style: TextStyle(
                      fontSize: 17,
                      fontWeight: FontWeight.w900,
                      color: AppColors.textMain,
                      letterSpacing: -0.3,
                    ),
                  ),
                  TextButton(
                    onPressed: () => widget.onSelectCategory('Desserts'),
                    style: TextButton.styleFrom(
                      padding: EdgeInsets.zero,
                      minimumSize: Size.zero,
                      tapTargetSize: MaterialTapTargetSize.shrinkWrap,
                    ),
                    child: const Text('View All ➔', style: TextStyle(fontWeight: FontWeight.w700, fontSize: 12, color: AppColors.primary)),
                  ),
                ],
              ),
            ),
            _buildHorizontalDishList(sweetAndDrinks),

            const SizedBox(height: 24),

            // 9. Trust Badges
            Container(
              margin: const EdgeInsets.symmetric(horizontal: 16),
              padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 14),
              decoration: BoxDecoration(
                color: Colors.white,
                borderRadius: BorderRadius.circular(20),
                border: Border.all(color: AppColors.cardBorder, width: 1.2),
                boxShadow: [
                  BoxShadow(
                    color: const Color(0xFF1C1917).withValues(alpha: 0.03),
                    blurRadius: 10,
                    offset: const Offset(0, 3),
                  ),
                ],
              ),
              child: Row(
                children: [
                  _buildFeelGoodPill(Icons.soup_kitchen_rounded, '100% Desi Ghee', 'Pure butter'),
                  _buildFeelGoodPill(Icons.bolt_rounded, 'Express 25m', 'Insulated hot'),
                  _buildFeelGoodPill(Icons.verified_user_rounded, '5★ Hygiene', 'FSSAI certified'),
                  _buildFeelGoodPill(Icons.eco_rounded, 'Pure Spices', 'Stone-ground'),
                ],
              ),
            ),
          ],
        ],
      ),
    );
  }

  Widget _buildFeelGoodPill(IconData icon, String title, String sub) {
    return Expanded(
      child: Column(
        mainAxisSize: MainAxisSize.min,
        children: [
          Container(
            padding: const EdgeInsets.all(8),
            decoration: const BoxDecoration(
              color: AppColors.primaryLight,
              shape: BoxShape.circle,
            ),
            child: Icon(icon, color: AppColors.primary, size: 18),
          ),
          const SizedBox(height: 6),
          Text(
            title,
            style: const TextStyle(fontWeight: FontWeight.bold, fontSize: 10, color: AppColors.textMain),
            textAlign: TextAlign.center,
            maxLines: 1,
            overflow: TextOverflow.ellipsis,
          ),
          Text(
            sub,
            style: const TextStyle(fontSize: 8.5, color: AppColors.textSecondary),
            textAlign: TextAlign.center,
            maxLines: 1,
            overflow: TextOverflow.ellipsis,
          ),
        ],
      ),
    );
  }

  Widget _buildMovingHeroSlides() {
    return Container(
      margin: const EdgeInsets.symmetric(vertical: 14),
      height: 236,
      decoration: BoxDecoration(
        borderRadius: BorderRadius.circular(22),
        border: Border.all(color: AppColors.cardBorder, width: 1.2),
        boxShadow: [
          BoxShadow(
            color: const Color(0xFF1C1917).withValues(alpha: 0.12),
            blurRadius: 20,
            offset: const Offset(0, 8),
          ),
        ],
      ),
      child: ClipRRect(
        borderRadius: BorderRadius.circular(22),
        child: Stack(
          children: [
            PageView.builder(
              controller: _heroSlideCtrl,
              itemCount: _heroSlideData.length,
              physics: const BouncingScrollPhysics(),
              onPageChanged: _onSlideChanged,
              itemBuilder: (ctx, i) {
                final item = _heroSlideData[i];
                final dish = item['dish'] as FoodItem;
                final qty = widget.cart[dish.id] ?? 0;

                return GestureDetector(
                  behavior: HitTestBehavior.opaque,
                  onTap: () => widget.onOpenFoodDetails(dish),
                  child: Stack(
                    fit: StackFit.expand,
                    children: [
                      // Food Image
                      Image.asset(
                        dish.imagePath,
                        fit: BoxFit.cover,
                        errorBuilder: (c, e, s) => Container(
                          color: const Color(0xFF1C1917),
                          child: const Icon(Icons.restaurant, color: Colors.white, size: 40),
                        ),
                      ),
                      // Dark transparent gradient overlay for luxury contrast
                      Container(
                        decoration: BoxDecoration(
                          gradient: LinearGradient(
                            begin: Alignment.topCenter,
                            end: Alignment.bottomCenter,
                            colors: [
                              Colors.black.withValues(alpha: 0.38),
                              Colors.transparent,
                              Colors.black.withValues(alpha: 0.88),
                            ],
                            stops: const [0.0, 0.42, 1.0],
                          ),
                        ),
                      ),

                      // Top Row: Delivery Time Badge (Left) & Tag Badge (Right)
                      Positioned(
                        top: 14,
                        left: 14,
                        right: 14,
                        child: Row(
                          mainAxisAlignment: MainAxisAlignment.spaceBetween,
                          children: [
                            // Delivery Time Badge
                            Container(
                              padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 5),
                              decoration: BoxDecoration(
                                color: Colors.black.withValues(alpha: 0.55),
                                borderRadius: BorderRadius.circular(16),
                                border: Border.all(color: Colors.white.withValues(alpha: 0.2), width: 0.8),
                              ),
                              child: Row(
                                mainAxisSize: MainAxisSize.min,
                                children: [
                                  const Icon(Icons.access_time_rounded, size: 12, color: Color(0xFFFDBA74)),
                                  const SizedBox(width: 4),
                                  Text(
                                    item['delivery'] as String,
                                    style: const TextStyle(
                                      color: Colors.white,
                                      fontSize: 10,
                                      fontWeight: FontWeight.w700,
                                      letterSpacing: 0.3,
                                    ),
                                  ),
                                ],
                              ),
                            ),
                            // Tag Badge
                            Container(
                              padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 5),
                              decoration: BoxDecoration(
                                color: AppColors.primary,
                                borderRadius: BorderRadius.circular(16),
                                boxShadow: [
                                  BoxShadow(
                                    color: AppColors.primary.withValues(alpha: 0.4),
                                    blurRadius: 6,
                                  ),
                                ],
                              ),
                              child: Text(
                                item['tag'] as String,
                                style: const TextStyle(
                                  color: Colors.white,
                                  fontSize: 9.5,
                                  fontWeight: FontWeight.w900,
                                  letterSpacing: 0.5,
                                ),
                              ),
                            ),
                          ],
                        ),
                      ),

                      // Bottom Content: Title, Price, Add Button
                      Positioned(
                        bottom: 16,
                        left: 14,
                        right: 14,
                        child: Row(
                          crossAxisAlignment: CrossAxisAlignment.end,
                          children: [
                            // Text & Price block
                            Expanded(
                              child: Column(
                                crossAxisAlignment: CrossAxisAlignment.start,
                                mainAxisSize: MainAxisSize.min,
                                children: [
                                  Text(
                                    dish.name,
                                    style: const TextStyle(
                                      color: Colors.white,
                                      fontSize: 17,
                                      fontWeight: FontWeight.w900,
                                      letterSpacing: -0.3,
                                    ),
                                    maxLines: 1,
                                    overflow: TextOverflow.ellipsis,
                                  ),
                                  const SizedBox(height: 2),
                                  Text(
                                    item['subtitle'] as String,
                                    style: TextStyle(
                                      color: Colors.white.withValues(alpha: 0.82),
                                      fontSize: 11,
                                      fontWeight: FontWeight.w400,
                                    ),
                                    maxLines: 1,
                                    overflow: TextOverflow.ellipsis,
                                  ),
                                  const SizedBox(height: 6),
                                  Row(
                                    children: [
                                      Text(
                                        '₹${dish.price.toInt()}',
                                        style: const TextStyle(
                                          color: Colors.white,
                                          fontSize: 17,
                                          fontWeight: FontWeight.w900,
                                        ),
                                      ),
                                      const SizedBox(width: 6),
                                      Text(
                                        '₹${dish.originalPrice.toInt()}',
                                        style: TextStyle(
                                          color: Colors.white.withValues(alpha: 0.55),
                                          fontSize: 12,
                                          decoration: TextDecoration.lineThrough,
                                        ),
                                      ),
                                    ],
                                  ),
                                ],
                              ),
                            ),
                            const SizedBox(width: 10),

                            // Add Button / Counter
                            qty == 0
                                ? GestureDetector(
                                    onTap: () => widget.onAddToCart(dish),
                                    child: Container(
                                      padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 8),
                                      decoration: BoxDecoration(
                                        color: AppColors.primary,
                                        borderRadius: BorderRadius.circular(14),
                                        boxShadow: [
                                          BoxShadow(
                                            color: AppColors.primary.withValues(alpha: 0.4),
                                            blurRadius: 8,
                                            offset: const Offset(0, 2),
                                          ),
                                        ],
                                      ),
                                      child: const Row(
                                        mainAxisSize: MainAxisSize.min,
                                        children: [
                                          Icon(Icons.add_rounded, color: Colors.white, size: 16),
                                          SizedBox(width: 4),
                                          Text(
                                            'ADD',
                                            style: TextStyle(
                                              color: Colors.white,
                                              fontSize: 12,
                                              fontWeight: FontWeight.w900,
                                              letterSpacing: 0.5,
                                            ),
                                          ),
                                        ],
                                      ),
                                    ),
                                  )
                                : Container(
                                    height: 32,
                                    decoration: BoxDecoration(
                                      color: AppColors.primary,
                                      borderRadius: BorderRadius.circular(12),
                                      boxShadow: [
                                        BoxShadow(
                                          color: AppColors.primary.withValues(alpha: 0.4),
                                          blurRadius: 8,
                                          offset: const Offset(0, 2),
                                        ),
                                      ],
                                    ),
                                    child: Row(
                                      mainAxisSize: MainAxisSize.min,
                                      children: [
                                        InkWell(
                                          onTap: () => widget.onRemoveFromCart(dish),
                                          borderRadius: const BorderRadius.horizontal(left: Radius.circular(12)),
                                          child: const Padding(
                                            padding: EdgeInsets.symmetric(horizontal: 8, vertical: 6),
                                            child: Icon(Icons.remove, size: 14, color: Colors.white),
                                          ),
                                        ),
                                        Padding(
                                          padding: const EdgeInsets.symmetric(horizontal: 4),
                                          child: Text('$qty', style: const TextStyle(color: Colors.white, fontWeight: FontWeight.w900, fontSize: 13)),
                                        ),
                                        InkWell(
                                          onTap: () => widget.onAddToCart(dish),
                                          borderRadius: const BorderRadius.horizontal(right: Radius.circular(12)),
                                          child: const Padding(
                                            padding: EdgeInsets.symmetric(horizontal: 8, vertical: 6),
                                            child: Icon(Icons.add, size: 14, color: Colors.white),
                                          ),
                                        ),
                                      ],
                                    ),
                                  ),
                          ],
                        ),
                      ),
                    ],
                  ),
                );
              },
            ),

            // Slide Indicators at Bottom-Center
            Positioned(
              bottom: 4,
              left: 0,
              right: 0,
              child: Center(
                child: Row(
                  mainAxisSize: MainAxisSize.min,
                  children: List.generate(_heroSlideData.length, (idx) {
                    final isActive = _currentHeroSlide == idx;
                    return GestureDetector(
                      onTap: () {
                        _heroSlideCtrl.animateToPage(
                          idx,
                          duration: const Duration(milliseconds: 400),
                          curve: Curves.easeInOut,
                        ).catchError((_) {});
                        _onSlideChanged(idx);
                      },
                      child: AnimatedContainer(
                        duration: const Duration(milliseconds: 300),
                        curve: Curves.easeOut,
                        margin: const EdgeInsets.symmetric(horizontal: 2.5),
                        width: isActive ? 20 : 6,
                        height: 5,
                        decoration: BoxDecoration(
                          color: isActive ? AppColors.primary : Colors.white.withValues(alpha: 0.45),
                          borderRadius: BorderRadius.circular(3),
                        ),
                      ),
                    );
                  }),
                ),
              ),
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildSearchChip(String keyword) {
    return GestureDetector(
      onTap: () => widget.onSearch(keyword),
      child: Container(
        margin: const EdgeInsets.only(right: 8),
        padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 6),
        decoration: BoxDecoration(
          color: Colors.white,
          borderRadius: BorderRadius.circular(16),
          border: Border.all(
            color: AppColors.cardBorder,
            width: 1.2,
          ),
          boxShadow: [
            BoxShadow(
              color: const Color(0xFF1C1917).withValues(alpha: 0.02),
              blurRadius: 4,
              offset: const Offset(0, 1),
            ),
          ],
        ),
        child: Text(
          keyword,
          style: const TextStyle(
            fontSize: 11,
            color: AppColors.textMain,
            fontWeight: FontWeight.w600,
          ),
        ),
      ),
    );
  }

  Widget _buildLiveSearchResultsSection(List<FoodItem> activeDishPool) {
    final directMatches = searchFoodItems(activeDishPool, _homeSearchQuery, fallbackToBestsellers: false);
    final isFallback = directMatches.isEmpty;
    final results = isFallback
        ? searchFoodItems(activeDishPool, _homeSearchQuery, fallbackToBestsellers: true)
        : directMatches;

    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Padding(
          padding: const EdgeInsets.fromLTRB(16, 12, 16, 8),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Row(
                mainAxisAlignment: MainAxisAlignment.spaceBetween,
                children: [
                  Expanded(
                    child: Row(
                      children: [
                        Icon(
                          isFallback ? Icons.auto_awesome : Icons.check_circle_rounded,
                          size: 16,
                          color: isFallback ? AppColors.starGold : AppColors.vegGreen,
                        ),
                        const SizedBox(width: 6),
                        Expanded(
                          child: Text(
                            isFallback
                                ? 'No direct match for "$_homeSearchQuery" • Top Picks'
                                : 'Found ${results.length} dishes for "$_homeSearchQuery"',
                            style: const TextStyle(fontWeight: FontWeight.w900, fontSize: 13.5, color: AppColors.textMain),
                            maxLines: 1,
                            overflow: TextOverflow.ellipsis,
                          ),
                        ),
                      ],
                    ),
                  ),
                  Row(
                    mainAxisSize: MainAxisSize.min,
                    children: [
                      TextButton(
                        onPressed: () {
                          _triggerSearch(_homeSearchQuery);
                        },
                        style: TextButton.styleFrom(
                          padding: const EdgeInsets.symmetric(horizontal: 6),
                          minimumSize: Size.zero,
                          tapTargetSize: MaterialTapTargetSize.shrinkWrap,
                        ),
                        child: const Text('Menu Tab ➔', style: TextStyle(color: AppColors.primary, fontWeight: FontWeight.bold, fontSize: 11)),
                      ),
                      const SizedBox(width: 6),
                      TextButton(
                        onPressed: () {
                          _homeSearchCtrl.clear();
                          setState(() => _homeSearchQuery = '');
                        },
                        style: TextButton.styleFrom(
                          padding: EdgeInsets.zero,
                          minimumSize: Size.zero,
                          tapTargetSize: MaterialTapTargetSize.shrinkWrap,
                        ),
                        child: const Text('Clear ✕', style: TextStyle(color: AppColors.textSecondary, fontWeight: FontWeight.bold, fontSize: 11)),
                      ),
                    ],
                  ),
                ],
              ),
              if (isFallback)
                const Padding(
                  padding: EdgeInsets.only(top: 4),
                  child: Text(
                    'Showing delicious recommendations you might love instead:',
                    style: TextStyle(fontSize: 11, color: AppColors.textSecondary),
                  ),
                ),
            ],
          ),
        ),
        ...results.map((dish) => _buildLiveDishCard(dish)),
      ],
    );
  }

  Widget _buildLiveDishCard(FoodItem dish) {
    final qty = widget.cart[dish.id] ?? 0;
    return GestureDetector(
      onTap: () => widget.onOpenFoodDetails(dish),
      child: Container(
        margin: const EdgeInsets.symmetric(horizontal: 16, vertical: 5),
        padding: const EdgeInsets.all(12),
        decoration: BoxDecoration(
          color: Colors.white,
          borderRadius: BorderRadius.circular(18),
          border: Border.all(color: AppColors.cardBorder, width: 1.2),
          boxShadow: [
            BoxShadow(color: const Color(0xFF1C1917).withValues(alpha: 0.03), blurRadius: 8, offset: const Offset(0, 2)),
          ],
        ),
        child: Row(
          children: [
            ClipRRect(
              borderRadius: BorderRadius.circular(14),
              child: SizedBox(
                width: 82,
                height: 82,
                child: Image.asset(
                  dish.imagePath,
                  fit: BoxFit.cover,
                  errorBuilder: (c, e, s) => Container(
                    color: AppColors.primaryLight,
                    child: const Icon(Icons.restaurant, color: AppColors.primary),
                  ),
                ),
              ),
            ),
            const SizedBox(width: 12),
            Expanded(
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Row(
                    children: [
                      Icon(Icons.circle, size: 7, color: dish.isVeg ? AppColors.vegGreen : AppColors.nonVegRed),
                      const SizedBox(width: 4),
                      Text(
                        '${dish.rating} ★',
                        style: const TextStyle(fontSize: 10, fontWeight: FontWeight.bold, color: AppColors.starGold),
                      ),
                      const SizedBox(width: 6),
                      Text(
                        '• ${dish.category} • ${dish.prepTime}',
                        style: const TextStyle(fontSize: 10, color: AppColors.textSecondary),
                      ),
                    ],
                  ),
                  const SizedBox(height: 3),
                  Text(
                    dish.name,
                    style: const TextStyle(fontSize: 14, fontWeight: FontWeight.bold, color: AppColors.textMain),
                    maxLines: 1,
                    overflow: TextOverflow.ellipsis,
                  ),
                  const SizedBox(height: 2),
                  Text(
                    dish.description,
                    style: const TextStyle(fontSize: 11, color: AppColors.textSecondary, height: 1.2),
                    maxLines: 1,
                    overflow: TextOverflow.ellipsis,
                  ),
                  const SizedBox(height: 6),
                  Row(
                    mainAxisAlignment: MainAxisAlignment.spaceBetween,
                    children: [
                      Row(
                        children: [
                          Text('₹${dish.price.toInt()}', style: const TextStyle(fontSize: 14, fontWeight: FontWeight.w900, color: AppColors.primaryDark)),
                          const SizedBox(width: 6),
                          Text('₹${dish.originalPrice.toInt()}', style: const TextStyle(fontSize: 11, color: AppColors.textMuted, decoration: TextDecoration.lineThrough)),
                        ],
                      ),
                      qty == 0
                          ? ElevatedButton(
                              onPressed: () => widget.onAddToCart(dish),
                              style: ElevatedButton.styleFrom(
                                backgroundColor: AppColors.primary,
                                foregroundColor: Colors.white,
                                padding: const EdgeInsets.symmetric(horizontal: 14, vertical: 2),
                                minimumSize: const Size(60, 28),
                                shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(10)),
                                elevation: 0,
                              ),
                              child: const Text('+ ADD', style: TextStyle(fontSize: 10, fontWeight: FontWeight.bold)),
                            )
                          : Container(
                              height: 26,
                              decoration: BoxDecoration(color: AppColors.primary, borderRadius: BorderRadius.circular(8)),
                              child: Row(
                                mainAxisSize: MainAxisSize.min,
                                children: [
                                  InkWell(
                                    onTap: () => widget.onRemoveFromCart(dish),
                                    borderRadius: const BorderRadius.horizontal(left: Radius.circular(8)),
                                    child: const Padding(
                                      padding: EdgeInsets.symmetric(horizontal: 6, vertical: 4),
                                      child: Icon(Icons.remove, size: 12, color: Colors.white),
                                    ),
                                  ),
                                  Padding(
                                    padding: const EdgeInsets.symmetric(horizontal: 3),
                                    child: Text('$qty', style: const TextStyle(color: Colors.white, fontWeight: FontWeight.bold, fontSize: 11)),
                                  ),
                                  InkWell(
                                    onTap: () => widget.onAddToCart(dish),
                                    borderRadius: const BorderRadius.horizontal(right: Radius.circular(8)),
                                    child: const Padding(
                                      padding: EdgeInsets.symmetric(horizontal: 6, vertical: 4),
                                      child: Icon(Icons.add, size: 12, color: Colors.white),
                                    ),
                                  ),
                                ],
                              ),
                            ),
                    ],
                  ),
                ],
              ),
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildPromoCard({
    required String badge,
    required String title,
    required String subtitle,
    required String cta,
    required IconData icon,
    required Color startColor,
    required Color endColor,
    required VoidCallback onTap,
  }) {
    return GestureDetector(
      onTap: onTap,
      child: Container(
        width: 260,
        margin: const EdgeInsets.symmetric(horizontal: 5),
        padding: const EdgeInsets.all(14),
        decoration: BoxDecoration(
          gradient: LinearGradient(
            colors: [startColor, endColor],
            begin: Alignment.topLeft,
            end: Alignment.bottomRight,
          ),
          borderRadius: BorderRadius.circular(20),
          border: Border.all(color: AppColors.cardBorder.withValues(alpha: 0.5), width: 1.0),
          boxShadow: [
            BoxShadow(
              color: endColor.withValues(alpha: 0.28),
              blurRadius: 10,
              offset: const Offset(0, 4),
            ),
          ],
        ),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          mainAxisAlignment: MainAxisAlignment.spaceBetween,
          children: [
            Row(
              mainAxisAlignment: MainAxisAlignment.spaceBetween,
              children: [
                Container(
                  padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 3),
                  decoration: BoxDecoration(
                    color: Colors.white.withValues(alpha: 0.22),
                    borderRadius: BorderRadius.circular(8),
                    border: Border.all(color: Colors.white.withValues(alpha: 0.3), width: 0.8),
                  ),
                  child: Text(
                    badge,
                    style: const TextStyle(
                      color: Colors.white,
                      fontSize: 9.5,
                      fontWeight: FontWeight.w900,
                      letterSpacing: 0.4,
                    ),
                  ),
                ),
                Icon(icon, color: Colors.white.withValues(alpha: 0.85), size: 18),
              ],
            ),
            Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(
                  title,
                  style: const TextStyle(
                    color: Colors.white,
                    fontSize: 13.5,
                    fontWeight: FontWeight.w900,
                    letterSpacing: -0.2,
                  ),
                ),
                const SizedBox(height: 2),
                Text(
                  subtitle,
                  style: TextStyle(
                    color: Colors.white.withValues(alpha: 0.82),
                    fontSize: 10,
                  ),
                  maxLines: 1,
                  overflow: TextOverflow.ellipsis,
                ),
              ],
            ),
            Row(
              mainAxisAlignment: MainAxisAlignment.end,
              children: [
                Container(
                  padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 3.5),
                  decoration: BoxDecoration(
                    color: Colors.white,
                    borderRadius: BorderRadius.circular(12),
                  ),
                  child: Row(
                    mainAxisSize: MainAxisSize.min,
                    children: [
                      Text(
                        cta,
                        style: TextStyle(
                          color: startColor,
                          fontSize: 9.5,
                          fontWeight: FontWeight.w900,
                          letterSpacing: 0.4,
                        ),
                      ),
                      const SizedBox(width: 3),
                      Icon(Icons.arrow_forward_rounded, size: 10, color: startColor),
                    ],
                  ),
                ),
              ],
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildHorizontalDishList(List<FoodItem> dishes) {
    return SizedBox(
      height: 260,
      child: ListView.builder(
        scrollDirection: Axis.horizontal,
        physics: const BouncingScrollPhysics(),
        padding: const EdgeInsets.symmetric(horizontal: 14),
        itemCount: dishes.length,
        itemBuilder: (ctx, i) {
          final dish = dishes[i];
          final qty = widget.cart[dish.id] ?? 0;
          return GestureDetector(
            onTap: () => widget.onOpenFoodDetails(dish),
            child: Container(
              width: 184,
              margin: const EdgeInsets.symmetric(horizontal: 5, vertical: 4),
              padding: const EdgeInsets.all(10),
              decoration: BoxDecoration(
                color: Colors.white,
                borderRadius: BorderRadius.circular(20),
                border: Border.all(color: AppColors.cardBorder, width: 1.2),
                boxShadow: [
                  BoxShadow(
                    color: const Color(0xFF1C1917).withValues(alpha: 0.04),
                    blurRadius: 10,
                    offset: const Offset(0, 4),
                  ),
                ],
              ),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  // Food Image with Veg/Non-Veg & Rating Badges
                  Stack(
                    children: [
                      ClipRRect(
                        borderRadius: BorderRadius.circular(14),
                        child: SizedBox(
                          height: 110,
                          width: double.infinity,
                          child: Image.asset(
                            dish.imagePath,
                            fit: BoxFit.cover,
                            errorBuilder: (c, e, s) => Container(
                              color: AppColors.primaryLight,
                              child: const Icon(Icons.restaurant, color: AppColors.primary),
                            ),
                          ),
                        ),
                      ),
                      // Top Left: Veg / Non-Veg Indicator
                      Positioned(
                        top: 6,
                        left: 6,
                        child: Container(
                          padding: const EdgeInsets.symmetric(horizontal: 5, vertical: 2.5),
                          decoration: BoxDecoration(
                            color: Colors.white.withValues(alpha: 0.95),
                            borderRadius: BorderRadius.circular(6),
                            boxShadow: [
                              BoxShadow(color: Colors.black.withValues(alpha: 0.1), blurRadius: 4),
                            ],
                          ),
                          child: Row(
                            mainAxisSize: MainAxisSize.min,
                            children: [
                              Icon(Icons.circle, size: 6, color: dish.isVeg ? AppColors.vegGreen : AppColors.nonVegRed),
                              const SizedBox(width: 3),
                              Text(
                                dish.isVeg ? 'VEG' : 'NON-VEG',
                                style: TextStyle(
                                  color: dish.isVeg ? AppColors.vegGreen : AppColors.nonVegRed,
                                  fontSize: 8,
                                  fontWeight: FontWeight.w900,
                                ),
                              ),
                            ],
                          ),
                        ),
                      ),
                      // Top Right: Rating Chip
                      Positioned(
                        top: 6,
                        right: 6,
                        child: Container(
                          padding: const EdgeInsets.symmetric(horizontal: 6, vertical: 2.5),
                          decoration: BoxDecoration(
                            color: Colors.black.withValues(alpha: 0.72),
                            borderRadius: BorderRadius.circular(8),
                          ),
                          child: Row(
                            mainAxisSize: MainAxisSize.min,
                            children: [
                              const Icon(Icons.star_rounded, size: 10, color: AppColors.starGold),
                              const SizedBox(width: 2),
                              Text(
                                '${dish.rating}',
                                style: const TextStyle(
                                  color: Colors.white,
                                  fontSize: 9,
                                  fontWeight: FontWeight.w800,
                                ),
                              ),
                            ],
                          ),
                        ),
                      ),
                    ],
                  ),
                  const SizedBox(height: 8),

                  // Title
                  Text(
                    dish.name,
                    maxLines: 1,
                    overflow: TextOverflow.ellipsis,
                    style: const TextStyle(
                      fontWeight: FontWeight.w800,
                      fontSize: 13.5,
                      color: AppColors.textMain,
                      letterSpacing: -0.2,
                    ),
                  ),
                  const SizedBox(height: 2),

                  // Category & Prep Time
                  Text(
                    '${dish.prepTime} • ${dish.category}',
                    style: const TextStyle(
                      fontSize: 10,
                      color: AppColors.textSecondary,
                      fontWeight: FontWeight.w500,
                    ),
                    maxLines: 1,
                    overflow: TextOverflow.ellipsis,
                  ),
                  const SizedBox(height: 4),

                  // Dish Description (filling blank space with authentic mouth-watering detail)
                  Text(
                    dish.description,
                    maxLines: 2,
                    overflow: TextOverflow.ellipsis,
                    style: const TextStyle(
                      fontSize: 10,
                      color: AppColors.textSecondary,
                      height: 1.25,
                    ),
                  ),

                  const Spacer(),

                  // Price & Add CTA (Overflow-Proof)
                  Row(
                    mainAxisAlignment: MainAxisAlignment.spaceBetween,
                    children: [
                      Flexible(
                        child: Row(
                          mainAxisSize: MainAxisSize.min,
                          crossAxisAlignment: CrossAxisAlignment.baseline,
                          textBaseline: TextBaseline.alphabetic,
                          children: [
                            Text(
                              '₹${dish.price.toInt()}',
                              style: const TextStyle(
                                fontWeight: FontWeight.w900,
                                fontSize: 14,
                                color: AppColors.primary,
                              ),
                            ),
                            const SizedBox(width: 3),
                            Text(
                              '₹${dish.originalPrice.toInt()}',
                              style: const TextStyle(
                                fontSize: 9.5,
                                color: AppColors.textMuted,
                                decoration: TextDecoration.lineThrough,
                              ),
                            ),
                          ],
                        ),
                      ),
                      const SizedBox(width: 4),
                      qty == 0
                          ? InkWell(
                              onTap: () => widget.onAddToCart(dish),
                              borderRadius: BorderRadius.circular(9),
                              child: Container(
                                padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 5),
                                decoration: BoxDecoration(
                                  color: AppColors.primaryLight,
                                  borderRadius: BorderRadius.circular(9),
                                  border: Border.all(color: AppColors.primary.withValues(alpha: 0.35), width: 1.0),
                                ),
                                child: const Text(
                                  '+ ADD',
                                  style: TextStyle(
                                    color: AppColors.primary,
                                    fontSize: 10.5,
                                    fontWeight: FontWeight.w900,
                                  ),
                                ),
                              ),
                            )
                          : Container(
                              height: 26,
                              decoration: BoxDecoration(
                                color: AppColors.primary,
                                borderRadius: BorderRadius.circular(8),
                              ),
                              child: Row(
                                mainAxisSize: MainAxisSize.min,
                                children: [
                                  InkWell(
                                    onTap: () => widget.onRemoveFromCart(dish),
                                    borderRadius: const BorderRadius.horizontal(left: Radius.circular(8)),
                                    child: const Padding(
                                      padding: EdgeInsets.symmetric(horizontal: 6, vertical: 4),
                                      child: Icon(Icons.remove, size: 12, color: Colors.white),
                                    ),
                                  ),
                                  Padding(
                                    padding: const EdgeInsets.symmetric(horizontal: 3),
                                    child: Text(
                                      '$qty',
                                      style: const TextStyle(
                                        fontWeight: FontWeight.w900,
                                        fontSize: 11,
                                        color: Colors.white,
                                      ),
                                    ),
                                  ),
                                  InkWell(
                                    onTap: () => widget.onAddToCart(dish),
                                    borderRadius: const BorderRadius.horizontal(right: Radius.circular(8)),
                                    child: const Padding(
                                      padding: EdgeInsets.symmetric(horizontal: 6, vertical: 4),
                                      child: Icon(Icons.add, size: 12, color: Colors.white),
                                    ),
                                  ),
                                ],
                              ),
                            ),
                    ],
                  ),
                ],
              ),
            ),
          );
        },
      ),
    );
  }
}

// ==========================================
// 2. MENU VIEW FUNCTION (60 Dishes, Search, Categories)
// ==========================================
class MenuView extends StatefulWidget {
  final Map<String, int> cart;
  final Function(FoodItem) onAddToCart;
  final Function(FoodItem) onRemoveFromCart;
  final Function(FoodItem) onOpenFoodDetails;
  final String initialCategory;
  final String initialSearchQuery;
  final ValueChanged<String>? onCategoryChanged;
  final ValueChanged<String>? onSearchChanged;
  final bool autoFocusSearch;
  final bool pureVegMode;

  const MenuView({
    super.key,
    required this.cart,
    required this.onAddToCart,
    required this.onRemoveFromCart,
    required this.onOpenFoodDetails,
    this.initialCategory = 'All',
    this.initialSearchQuery = '',
    this.onCategoryChanged,
    this.onSearchChanged,
    this.autoFocusSearch = false,
    this.pureVegMode = false,
  });

  @override
  State<MenuView> createState() => _MenuViewState();
}

class _MenuViewState extends State<MenuView> {
  late String _selectedCategory;
  bool _filterVegOnly = false;
  bool _filterSpicyOnly = false;
  late String _searchQuery;
  late final TextEditingController _searchController;
  late final FocusNode _searchFocusNode;

  final List<String> _categories = [
    'All',
    'Starters',
    'Main Course',
    'Biryani',
    'Chinese',
    'Desserts',
    'Beverages',
  ];

  @override
  void initState() {
    super.initState();
    _selectedCategory = widget.initialCategory;
    _searchQuery = widget.initialSearchQuery;
    _searchController = TextEditingController(text: _searchQuery);
    _searchFocusNode = FocusNode();
    if (widget.autoFocusSearch) {
      WidgetsBinding.instance.addPostFrameCallback((_) {
        if (mounted) _searchFocusNode.requestFocus();
      });
    }
  }

  @override
  void didUpdateWidget(covariant MenuView oldWidget) {
    super.didUpdateWidget(oldWidget);
    if (widget.initialCategory != oldWidget.initialCategory) {
      setState(() => _selectedCategory = widget.initialCategory);
    }
    if (widget.initialSearchQuery != oldWidget.initialSearchQuery) {
      setState(() {
        _searchQuery = widget.initialSearchQuery;
        _searchController.text = widget.initialSearchQuery;
      });
    }
    if (widget.autoFocusSearch && !oldWidget.autoFocusSearch) {
      WidgetsBinding.instance.addPostFrameCallback((_) {
        if (mounted) _searchFocusNode.requestFocus();
      });
    }
  }

  @override
  void dispose() {
    _searchFocusNode.dispose();
    _searchController.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    final baseFoodItems = widget.pureVegMode ? allFoodItems.where((f) => f.isVeg).toList() : allFoodItems;
    List<FoodItem> sourceDishes = baseFoodItems;
    if (_searchQuery.trim().isNotEmpty) {
      sourceDishes = searchFoodItems(baseFoodItems, _searchQuery.trim());
    }

    // If searching and selected category has 0 matches, auto fallback to All so matching dishes are displayed!
    final categoryMatches = sourceDishes.where((d) => _selectedCategory == 'All' || d.category == _selectedCategory).toList();
    final activeCategory = (_searchQuery.trim().isNotEmpty && categoryMatches.isEmpty) ? 'All' : _selectedCategory;

    final filteredDishes = sourceDishes.where((dish) {
      if (activeCategory != 'All' && dish.category != activeCategory) return false;
      if (_filterVegOnly && !dish.isVeg) return false;
      if (_filterSpicyOnly && !dish.isSpicy) return false;
      return true;
    }).toList();

    return Column(
      children: [
        // Search Field
        Padding(
          padding: const EdgeInsets.fromLTRB(16, 12, 16, 8),
          child: Container(
            decoration: BoxDecoration(
              color: Colors.white,
              borderRadius: BorderRadius.circular(14),
              border: Border.all(color: AppColors.cardBorder, width: 1.2),
              boxShadow: [
                BoxShadow(color: Colors.black.withValues(alpha: 0.03), blurRadius: 6, offset: const Offset(0, 2)),
              ],
            ),
            child: TextField(
              controller: _searchController,
              focusNode: _searchFocusNode,
              onChanged: (val) {
                setState(() => _searchQuery = val);
                widget.onSearchChanged?.call(val);
              },
              onSubmitted: (val) => FocusScope.of(context).unfocus(),
              textInputAction: TextInputAction.search,
              decoration: InputDecoration(
                hintText: widget.pureVegMode
                    ? 'Search vegetarian dishes ("Biryani", "Paneer", "Dal")...'
                    : 'Search 60+ dishes ("Biryani", "Paneer", "Ghee Roast")...',
                hintStyle: TextStyle(fontSize: 12, color: Colors.grey.shade400),
                prefixIcon: const Icon(Icons.search_rounded, color: AppColors.primary, size: 20),
                suffixIcon: _searchQuery.isNotEmpty
                    ? IconButton(
                        icon: const Icon(Icons.clear, size: 16),
                        onPressed: () {
                          _searchController.clear();
                          setState(() => _searchQuery = '');
                          widget.onSearchChanged?.call('');
                        },
                      )
                    : null,
                border: InputBorder.none,
                contentPadding: const EdgeInsets.symmetric(horizontal: 14, vertical: 12),
              ),
            ),
          ),
        ),

        // Pure Veg Mode Banner Indicator on Menu
        if (widget.pureVegMode)
          Padding(
            padding: const EdgeInsets.fromLTRB(16, 0, 16, 6),
            child: Container(
              padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 7),
              decoration: BoxDecoration(
                color: AppColors.vegGreen.withValues(alpha: 0.08),
                borderRadius: BorderRadius.circular(10),
                border: Border.all(color: AppColors.vegGreen.withValues(alpha: 0.25), width: 1.0),
              ),
              child: const Row(
                children: [
                  Icon(Icons.eco_rounded, color: AppColors.vegGreen, size: 15),
                  SizedBox(width: 8),
                  Expanded(
                    child: Text(
                      'Pure Veg Mode Active • Showing 100% vegetarian & eggless delicacies',
                      style: TextStyle(
                        fontSize: 11,
                        fontWeight: FontWeight.w700,
                        color: AppColors.vegGreen,
                      ),
                    ),
                  ),
                ],
              ),
            ),
          ),

        // Category Selector Chips
        SizedBox(
          height: 42,
          child: ListView.builder(
            scrollDirection: Axis.horizontal,
            padding: const EdgeInsets.symmetric(horizontal: 14),
            itemCount: _categories.length,
            itemBuilder: (ctx, i) {
              final cat = _categories[i];
              final isSelected = activeCategory == cat;
              final count = cat == 'All' ? sourceDishes.length : sourceDishes.where((f) => f.category == cat).length;
              return Padding(
                padding: const EdgeInsets.symmetric(horizontal: 4),
                child: ChoiceChip(
                  label: Text('$cat ($count)'),
                  selected: isSelected,
                  selectedColor: AppColors.primary,
                  labelStyle: TextStyle(
                    fontSize: 11,
                    fontWeight: FontWeight.bold,
                    color: isSelected ? Colors.white : AppColors.textMain,
                  ),
                  backgroundColor: Colors.white,
                  side: BorderSide(color: isSelected ? AppColors.primary : AppColors.cardBorder, width: 1.0),
                  onSelected: (val) => setState(() => _selectedCategory = cat),
                ),
              );
            },
          ),
        ),

        // Dietary Filter Toggles
        Padding(
          padding: const EdgeInsets.fromLTRB(16, 6, 16, 6),
          child: Row(
            children: [
              FilterChip(
                label: const Row(
                  mainAxisSize: MainAxisSize.min,
                  children: [
                    Icon(Icons.circle, size: 8, color: AppColors.vegGreen),
                    SizedBox(width: 4),
                    Text('Pure Veg', style: TextStyle(fontSize: 11, fontWeight: FontWeight.bold)),
                  ],
                ),
                selected: widget.pureVegMode ? true : _filterVegOnly,
                selectedColor: AppColors.vegGreen.withValues(alpha: 0.15),
                backgroundColor: Colors.white,
                side: BorderSide(color: (widget.pureVegMode || _filterVegOnly) ? AppColors.vegGreen : AppColors.cardBorder),
                onSelected: widget.pureVegMode ? null : (val) => setState(() => _filterVegOnly = val),
              ),
              const SizedBox(width: 8),
              FilterChip(
                label: const Row(
                  mainAxisSize: MainAxisSize.min,
                  children: [
                    Icon(Icons.local_fire_department, size: 12, color: AppColors.primary),
                    SizedBox(width: 4),
                    Text('Spicy 🌶️', style: TextStyle(fontSize: 11, fontWeight: FontWeight.bold)),
                  ],
                ),
                selected: _filterSpicyOnly,
                selectedColor: AppColors.primary.withValues(alpha: 0.15),
                backgroundColor: Colors.white,
                side: BorderSide(color: _filterSpicyOnly ? AppColors.primary : AppColors.cardBorder),
                onSelected: (val) => setState(() => _filterSpicyOnly = val),
              ),
            ],
          ),
        ),

        // Dishes List
        Expanded(
          child: filteredDishes.isEmpty
              ? Center(
                  child: Padding(
                    padding: const EdgeInsets.all(24),
                    child: Column(
                      mainAxisAlignment: MainAxisAlignment.center,
                      children: [
                        const Icon(Icons.search_off_rounded, size: 52, color: Colors.grey),
                        const SizedBox(height: 12),
                        Text(
                          'No dishes found matching "$_searchQuery"',
                          style: const TextStyle(fontWeight: FontWeight.bold, fontSize: 15, color: AppColors.textMain),
                          textAlign: TextAlign.center,
                        ),
                        const SizedBox(height: 6),
                        const Text(
                          'Try searching for "Biryani", "Paneer", "Butter Chicken", or reset filters.',
                          style: TextStyle(fontSize: 12, color: AppColors.textSecondary),
                          textAlign: TextAlign.center,
                        ),
                        const SizedBox(height: 16),
                        ElevatedButton.icon(
                          onPressed: () {
                            _searchController.clear();
                            setState(() {
                              _searchQuery = '';
                              _selectedCategory = 'All';
                              _filterVegOnly = false;
                              _filterSpicyOnly = false;
                            });
                            widget.onSearchChanged?.call('');
                          },
                          icon: const Icon(Icons.refresh_rounded, size: 16),
                          label: const Text('Show All 60 Dishes'),
                          style: ElevatedButton.styleFrom(
                            backgroundColor: AppColors.primary,
                            foregroundColor: Colors.white,
                            padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 10),
                            shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(10)),
                          ),
                        ),
                      ],
                    ),
                  ),
                )
              : ListView.builder(
                  physics: const BouncingScrollPhysics(),
                  padding: const EdgeInsets.fromLTRB(16, 4, 16, 90),
                  itemCount: filteredDishes.length,
                  itemBuilder: (ctx, i) {
                    final dish = filteredDishes[i];
                    final qty = widget.cart[dish.id] ?? 0;
                    return GestureDetector(
                      onTap: () => widget.onOpenFoodDetails(dish),
                      child: Container(
                        margin: const EdgeInsets.only(bottom: 10),
                        padding: const EdgeInsets.all(12),
                        decoration: BoxDecoration(
                          color: Colors.white,
                          borderRadius: BorderRadius.circular(16),
                          border: Border.all(color: AppColors.cardBorder, width: 1.2),
                          boxShadow: [
                            BoxShadow(color: Colors.black.withValues(alpha: 0.02), blurRadius: 6, offset: const Offset(0, 2)),
                          ],
                        ),
                        child: Row(
                          crossAxisAlignment: CrossAxisAlignment.start,
                          children: [
                            ClipRRect(
                              borderRadius: BorderRadius.circular(12),
                              child: SizedBox(
                                width: 80,
                                height: 80,
                                child: Image.asset(
                                  dish.imagePath,
                                  fit: BoxFit.cover,
                                  errorBuilder: (c, e, s) => Container(color: Colors.grey.shade100, child: const Icon(Icons.restaurant)),
                                ),
                              ),
                            ),
                            const SizedBox(width: 12),
                            Expanded(
                              child: Column(
                                crossAxisAlignment: CrossAxisAlignment.start,
                                children: [
                                  Row(
                                    children: [
                                      Icon(Icons.circle, size: 8, color: dish.isVeg ? AppColors.vegGreen : AppColors.nonVegRed),
                                      const SizedBox(width: 4),
                                      Text('${dish.rating} ★ (${dish.reviews})',
                                          style: const TextStyle(fontSize: 10, fontWeight: FontWeight.bold, color: AppColors.starGold)),
                                      const SizedBox(width: 6),
                                      Text('• ${dish.category}',
                                          style: const TextStyle(fontSize: 10, color: AppColors.textSecondary, fontWeight: FontWeight.w600)),
                                    ],
                                  ),
                                  const SizedBox(height: 3),
                                  Text(dish.name, style: const TextStyle(fontSize: 14, fontWeight: FontWeight.bold, color: AppColors.textMain)),
                                  const SizedBox(height: 2),
                                  Text(
                                    dish.description,
                                    maxLines: 2,
                                    overflow: TextOverflow.ellipsis,
                                    style: const TextStyle(fontSize: 11, color: AppColors.textSecondary, height: 1.2),
                                  ),
                                  const SizedBox(height: 6),
                                  Row(
                                    mainAxisAlignment: MainAxisAlignment.spaceBetween,
                                    children: [
                                      Row(
                                        children: [
                                          Text('₹${dish.price.toInt()}', style: const TextStyle(fontSize: 15, fontWeight: FontWeight.w900)),
                                          const SizedBox(width: 6),
                                          Text('₹${dish.originalPrice.toInt()}',
                                              style: const TextStyle(fontSize: 11, color: Colors.grey, decoration: TextDecoration.lineThrough)),
                                        ],
                                      ),
                                      qty == 0
                                          ? ElevatedButton(
                                              onPressed: () => widget.onAddToCart(dish),
                                              style: ElevatedButton.styleFrom(
                                                backgroundColor: AppColors.primary,
                                                foregroundColor: Colors.white,
                                                padding: const EdgeInsets.symmetric(horizontal: 14, vertical: 2),
                                                minimumSize: const Size(64, 28),
                                                shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(8)),
                                                elevation: 0,
                                              ),
                                              child: const Text('ADD +', style: TextStyle(fontSize: 11, fontWeight: FontWeight.bold)),
                                            )
                                          : Container(
                                              height: 28,
                                              decoration: BoxDecoration(color: AppColors.primary, borderRadius: BorderRadius.circular(8)),
                                              child: Row(
                                                mainAxisSize: MainAxisSize.min,
                                                children: [
                                                  InkWell(
                                                    onTap: () => widget.onRemoveFromCart(dish),
                                                    borderRadius: const BorderRadius.horizontal(left: Radius.circular(8)),
                                                    child: const Padding(
                                                      padding: EdgeInsets.symmetric(horizontal: 7, vertical: 4),
                                                      child: Icon(Icons.remove, size: 13, color: Colors.white),
                                                    ),
                                                  ),
                                                  Padding(
                                                    padding: const EdgeInsets.symmetric(horizontal: 4),
                                                    child: Text('$qty', style: const TextStyle(color: Colors.white, fontWeight: FontWeight.bold, fontSize: 12)),
                                                  ),
                                                  InkWell(
                                                    onTap: () => widget.onAddToCart(dish),
                                                    borderRadius: const BorderRadius.horizontal(right: Radius.circular(8)),
                                                    child: const Padding(
                                                      padding: EdgeInsets.symmetric(horizontal: 7, vertical: 4),
                                                      child: Icon(Icons.add, size: 13, color: Colors.white),
                                                    ),
                                                  ),
                                                ],
                                              ),
                                            ),
                                    ],
                                  ),
                                ],
                              ),
                            ),
                          ],
                        ),
                      ),
                    );
                  },
                ),
        ),
      ],
    );
  }
}

// ==========================================
// 3. ORDERS VIEW FUNCTION (Live Tracker & History)
// ==========================================
class OrdersView extends StatelessWidget {
  final List<PlacedOrder> orders;
  final Function(PlacedOrder) onReorder;
  final Function(PlacedOrder, int) onUpdateOrderStatus;

  const OrdersView({
    super.key,
    required this.orders,
    required this.onReorder,
    required this.onUpdateOrderStatus,
  });

  @override
  Widget build(BuildContext context) {
    if (orders.isEmpty) {
      return const Center(
        child: Padding(
          padding: EdgeInsets.all(32),
          child: Column(
            mainAxisAlignment: MainAxisAlignment.center,
            children: [
              Icon(Icons.moped_outlined, size: 64, color: Colors.grey),
              SizedBox(height: 12),
              Text('No Orders Yet', style: TextStyle(fontSize: 17, fontWeight: FontWeight.bold, color: AppColors.textMain)),
              SizedBox(height: 6),
              Text('Explore our 60+ authentic Bangalore dishes and place an order!', textAlign: TextAlign.center, style: TextStyle(fontSize: 12, color: AppColors.textSecondary)),
            ],
          ),
        ),
      );
    }

    final activeOrder = orders.first;
    final pastOrders = orders.skip(1).toList();

    return SingleChildScrollView(
      physics: const BouncingScrollPhysics(),
      padding: const EdgeInsets.fromLTRB(16, 14, 16, 90),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          // ACTIVE ORDER CARD
          Row(
            mainAxisAlignment: MainAxisAlignment.spaceBetween,
            children: [
              const Text('Active Order', style: TextStyle(fontSize: 17, fontWeight: FontWeight.w900, color: AppColors.textMain)),
              Container(
                padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 3),
                decoration: BoxDecoration(color: AppColors.primaryLight, borderRadius: BorderRadius.circular(6)),
                child: Text('Order #${activeOrder.orderId}', style: const TextStyle(fontSize: 10, fontWeight: FontWeight.bold, color: AppColors.primary)),
              ),
            ],
          ),
          const SizedBox(height: 10),

          // Active Order Live Tracker Card
          Container(
            padding: const EdgeInsets.all(18),
            decoration: BoxDecoration(
              color: Colors.white,
              borderRadius: BorderRadius.circular(20),
              boxShadow: [
                BoxShadow(color: Colors.black.withValues(alpha: 0.03), blurRadius: 10, offset: const Offset(0, 3)),
              ],
            ),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Row(
                  mainAxisAlignment: MainAxisAlignment.spaceBetween,
                  children: [
                    Expanded(
                      child: Column(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          Text(activeOrder.statusTitle, style: const TextStyle(fontSize: 16, fontWeight: FontWeight.w900, color: AppColors.primary), overflow: TextOverflow.ellipsis),
                          Text('Estimated Arrival: ~22 mins', style: TextStyle(fontSize: 11, color: Colors.grey.shade600)),
                        ],
                      ),
                    ),
                    const SizedBox(width: 8),
                    const Icon(Icons.delivery_dining, size: 36, color: AppColors.primary),
                  ],
                ),
                const SizedBox(height: 16),

                // Live Timeline Progress Steps
                _buildTimelineStep(
                  'Order Confirmed',
                  'Spice Garden Kitchen (Indiranagar)',
                  isCompleted: activeOrder.statusIndex >= 0,
                  isActive: activeOrder.statusIndex == 0,
                ),
                _buildTimelineStep(
                  'Simmering in Kitchen',
                  'Chef is preparing your dishes with pure desi ghee',
                  isCompleted: activeOrder.statusIndex >= 1,
                  isActive: activeOrder.statusIndex == 1,
                ),
                _buildTimelineStep(
                  'Out for Delivery',
                  'Ramesh Kumar (Express Partner ⭐ 4.9) on bike',
                  isCompleted: activeOrder.statusIndex >= 2,
                  isActive: activeOrder.statusIndex == 2,
                ),
                _buildTimelineStep(
                  'Delivered to Doorstep',
                  activeOrder.deliveryAddress,
                  isCompleted: activeOrder.statusIndex >= 3,
                  isActive: activeOrder.statusIndex == 3,
                  isLast: true,
                ),

                const SizedBox(height: 14),
                const Divider(),

                // Items list preview
                ...activeOrder.items.map((it) {
                  return Padding(
                    padding: const EdgeInsets.symmetric(vertical: 3),
                    child: Row(
                      mainAxisAlignment: MainAxisAlignment.spaceBetween,
                      children: [
                        Text('${it.food.name} x ${it.quantity}', style: const TextStyle(fontSize: 12, fontWeight: FontWeight.w600)),
                        Text('₹${(it.food.price * it.quantity).toInt()}', style: const TextStyle(fontSize: 12, fontWeight: FontWeight.bold)),
                      ],
                    ),
                  );
                }),
                const Divider(),
                Row(
                  mainAxisAlignment: MainAxisAlignment.spaceBetween,
                  children: [
                    const Text('Total Paid (UPI)', style: TextStyle(fontWeight: FontWeight.bold, fontSize: 13)),
                    Text('₹${activeOrder.total.toInt()}', style: const TextStyle(fontWeight: FontWeight.w900, fontSize: 16, color: AppColors.primary)),
                  ],
                ),
                const SizedBox(height: 12),

                // Live Status Advancer (Simulation Button)
                Align(
                  alignment: Alignment.centerRight,
                  child: TextButton.icon(
                    onPressed: () {
                      final next = (activeOrder.statusIndex + 1) % 4;
                      onUpdateOrderStatus(activeOrder, next);
                    },
                    icon: const Icon(Icons.sync_rounded, size: 14),
                    label: const Text('Simulate Next Status', style: TextStyle(fontSize: 11, fontWeight: FontWeight.bold)),
                    style: TextButton.styleFrom(
                      foregroundColor: AppColors.primary,
                      backgroundColor: AppColors.primaryLight,
                      shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(8)),
                    ),
                  ),
                ),
              ],
            ),
          ),

          const SizedBox(height: 24),

          // PAST ORDERS SECTION
          if (pastOrders.isNotEmpty) ...[
            const Text('Past Orders', style: TextStyle(fontSize: 17, fontWeight: FontWeight.w900, color: AppColors.textMain)),
            const SizedBox(height: 10),
            ...pastOrders.map((ord) {
              return Container(
                margin: const EdgeInsets.only(bottom: 12),
                padding: const EdgeInsets.all(14),
                decoration: BoxDecoration(
                  color: Colors.white,
                  borderRadius: BorderRadius.circular(16),
                  border: Border.all(color: AppColors.cardBorder, width: 1.2),
                ),
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Row(
                      mainAxisAlignment: MainAxisAlignment.spaceBetween,
                      children: [
                        Text('Order #${ord.orderId}', style: const TextStyle(fontWeight: FontWeight.bold, fontSize: 13)),
                        const Text('Delivered ✓', style: TextStyle(color: AppColors.vegGreen, fontSize: 11, fontWeight: FontWeight.bold)),
                      ],
                    ),
                    const SizedBox(height: 4),
                    Text(
                      ord.items.map((i) => '${i.food.name} (${i.quantity})').join(', '),
                      maxLines: 1,
                      overflow: TextOverflow.ellipsis,
                      style: const TextStyle(fontSize: 11, color: AppColors.textSecondary),
                    ),
                    const SizedBox(height: 8),
                    Row(
                      mainAxisAlignment: MainAxisAlignment.spaceBetween,
                      children: [
                        Text('₹${ord.total.toInt()}', style: const TextStyle(fontWeight: FontWeight.w900, fontSize: 14)),
                        ElevatedButton.icon(
                          onPressed: () => onReorder(ord),
                          icon: const Icon(Icons.replay_rounded, size: 14),
                          label: const Text('Reorder', style: TextStyle(fontSize: 11, fontWeight: FontWeight.bold)),
                          style: ElevatedButton.styleFrom(
                            backgroundColor: AppColors.primary,
                            foregroundColor: Colors.white,
                            padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 2),
                            minimumSize: const Size(60, 28),
                            shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(8)),
                            elevation: 0,
                          ),
                        ),
                      ],
                    ),
                  ],
                ),
              );
            }),
          ],
        ],
      ),
    );
  }

  Widget _buildTimelineStep(
    String title,
    String subtitle, {
    required bool isCompleted,
    required bool isActive,
    bool isLast = false,
  }) {
    final color = isActive
        ? AppColors.primary
        : isCompleted
            ? AppColors.vegGreen
            : Colors.grey.shade300;

    return Row(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Column(
          children: [
            Container(
              width: 20,
              height: 20,
              decoration: BoxDecoration(color: color, shape: BoxShape.circle),
              child: Icon(
                isCompleted ? Icons.check : Icons.circle,
                size: 12,
                color: Colors.white,
              ),
            ),
            if (!isLast)
              Container(
                width: 2,
                height: 38,
                color: isCompleted ? AppColors.vegGreen : Colors.grey.shade200,
              ),
          ],
        ),
        const SizedBox(width: 12),
        Expanded(
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Text(
                title,
                style: TextStyle(
                  fontWeight: FontWeight.bold,
                  fontSize: 13,
                  color: isActive ? AppColors.primary : AppColors.textMain,
                ),
              ),
              Text(subtitle, style: const TextStyle(fontSize: 11, color: AppColors.textSecondary)),
              const SizedBox(height: 12),
            ],
          ),
        ),
      ],
    );
  }
}
