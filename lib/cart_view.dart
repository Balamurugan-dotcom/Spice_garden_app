import 'package:flutter/material.dart';
import 'food_data.dart';
import 'main.dart';
import 'services/api_service.dart';

class CartView extends StatefulWidget {
  final Map<String, int> cart;
  final Function(FoodItem) onAddToCart;
  final Function(FoodItem) onRemoveFromCart;
  final Function(PlacedOrder) onOrderPlaced;
  final VoidCallback onExploreMenu;
  final bool isLoggedIn;
  final VoidCallback onRequireLogin;

  const CartView({
    super.key,
    required this.cart,
    required this.onAddToCart,
    required this.onRemoveFromCart,
    required this.onOrderPlaced,
    required this.onExploreMenu,
    this.isLoggedIn = true,
    required this.onRequireLogin,
  });

  @override
  State<CartView> createState() => _CartViewState();
}

class _CartViewState extends State<CartView> {
  final TextEditingController _couponCtrl = TextEditingController();
  final TextEditingController _noteCtrl = TextEditingController();
  double _appliedDiscount = 0;
  String? _appliedCouponCode;
  String _selectedPayment = 'UPI (Instant)';
  String _selectedAddress = '100 Feet Road, Indiranagar';
  bool _isPlacingOrder = false;

  final List<String> _paymentOptions = [
    'UPI (Instant)',
    'Cash on Delivery (COD)',
    'Credit / Debit Card',
  ];

  final List<String> _addresses = [
    '100 Feet Road, Indiranagar',
    'Koramangala 4th Block',
    'HSR Layout Sector 1',
    'Whitefield ITPL Main Rd',
  ];

  @override
  void dispose() {
    _couponCtrl.dispose();
    _noteCtrl.dispose();
    super.dispose();
  }

  void _applyCoupon(String code) {
    final clean = code.trim().toUpperCase();
    if (clean == 'SPICE150') {
      if (_subtotal < 499) {
        ScaffoldMessenger.of(context).showSnackBar(
          const SnackBar(content: Text('Coupon SPICE150 requires minimum order of ₹499!')),
        );
        return;
      }
      setState(() {
        _appliedDiscount = 150;
        _appliedCouponCode = 'SPICE150';
      });
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(
          content: Text('🎉 SPICE150 applied! ₹150 OFF your royal order.'),
          backgroundColor: AppColors.vegGreen,
        ),
      );
    } else if (clean == 'ROYAL50') {
      setState(() {
        _appliedDiscount = 50;
        _appliedCouponCode = 'ROYAL50';
      });
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(
          content: Text('🎉 ROYAL50 applied! ₹50 OFF.'),
          backgroundColor: AppColors.vegGreen,
        ),
      );
    } else {
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(content: Text('Invalid coupon code. Try SPICE150 or ROYAL50')),
      );
    }
  }

  double get _subtotal {
    double total = 0;
    widget.cart.forEach((id, qty) {
      final item = allFoodItems.firstWhere((f) => f.id == id, orElse: () => allFoodItems[0]);
      total += item.price * qty;
    });
    return total;
  }

  int get _cartItemCount => widget.cart.values.fold(0, (sum, q) => sum + q);

  @override
  Widget build(BuildContext context) {
    if (widget.cart.isEmpty) {
      return Center(
        child: Padding(
          padding: const EdgeInsets.all(32),
          child: Column(
            mainAxisAlignment: MainAxisAlignment.center,
            children: [
              Container(
                padding: const EdgeInsets.all(24),
                decoration: const BoxDecoration(
                  color: AppColors.primaryLight,
                  shape: BoxShape.circle,
                ),
                child: const Icon(
                  Icons.shopping_bag_outlined,
                  size: 72,
                  color: AppColors.primary,
                ),
              ),
              const SizedBox(height: 20),
              const Text(
                'Your Cart is Hungry!',
                style: TextStyle(fontSize: 20, fontWeight: FontWeight.w900, color: AppColors.textMain),
              ),
              const SizedBox(height: 8),
              const Text(
                'Add aromatic Dum Biryanis, sizzling Mangalorean Ghee Roasts, or royal desserts to begin.',
                textAlign: TextAlign.center,
                style: TextStyle(fontSize: 13, color: AppColors.textSecondary, height: 1.4),
              ),
              const SizedBox(height: 24),
              ElevatedButton.icon(
                onPressed: widget.onExploreMenu,
                icon: const Icon(Icons.restaurant_menu_rounded, size: 18),
                label: const Text('Explore Menu (60 Dishes)', style: TextStyle(fontWeight: FontWeight.bold)),
                style: ElevatedButton.styleFrom(
                  backgroundColor: AppColors.primary,
                  foregroundColor: Colors.white,
                  padding: const EdgeInsets.symmetric(horizontal: 24, vertical: 14),
                  shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(14)),
                  elevation: 0,
                ),
              ),
            ],
          ),
        ),
      );
    }

    final double subtotal = _subtotal;
    final double deliveryFee = subtotal >= 500 ? 0 : 40;
    const double packaging = 20;
    final double tax = subtotal * 0.05;
    final double grandTotal = (subtotal - _appliedDiscount + deliveryFee + packaging + tax).clamp(0, double.infinity);

    return SingleChildScrollView(
      physics: const BouncingScrollPhysics(),
      padding: const EdgeInsets.fromLTRB(16, 12, 16, 100),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          // Header Row
          Row(
            mainAxisAlignment: MainAxisAlignment.spaceBetween,
            children: [
              Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  const Text('Your Cart', style: TextStyle(fontSize: 20, fontWeight: FontWeight.w900, color: AppColors.textMain)),
                  Text('$_cartItemCount items selected', style: const TextStyle(fontSize: 12, color: AppColors.textSecondary)),
                ],
              ),
              TextButton.icon(
                onPressed: widget.onExploreMenu,
                icon: const Icon(Icons.add_rounded, size: 16, color: AppColors.primary),
                label: const Text('Add More', style: TextStyle(fontWeight: FontWeight.bold, fontSize: 12, color: AppColors.primary)),
              ),
            ],
          ),

          const SizedBox(height: 12),

          // Delivery Address Selector Card
          Container(
            padding: const EdgeInsets.all(14),
            decoration: BoxDecoration(
              color: Colors.white,
              borderRadius: BorderRadius.circular(16),
              border: Border.all(color: AppColors.cardBorder, width: 1.2),
              boxShadow: [
                BoxShadow(color: Colors.black.withValues(alpha: 0.02), blurRadius: 8, offset: const Offset(0, 2)),
              ],
            ),
            child: Row(
              children: [
                Container(
                  padding: const EdgeInsets.all(8),
                  decoration: BoxDecoration(color: AppColors.primaryLight, borderRadius: BorderRadius.circular(10)),
                  child: const Icon(Icons.location_on_rounded, color: AppColors.primary, size: 20),
                ),
                const SizedBox(width: 12),
                Expanded(
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      const Text('Delivery Address', style: TextStyle(fontSize: 11, color: AppColors.textSecondary, fontWeight: FontWeight.w600)),
                      DropdownButtonHideUnderline(
                        child: DropdownButton<String>(
                          value: _selectedAddress,
                          isDense: true,
                          isExpanded: true,
                          style: const TextStyle(fontSize: 13, fontWeight: FontWeight.bold, color: AppColors.textMain),
                          items: _addresses.map((a) => DropdownMenuItem(value: a, child: Text(a, overflow: TextOverflow.ellipsis))).toList(),
                          onChanged: (val) {
                            if (val != null) setState(() => _selectedAddress = val);
                          },
                        ),
                      ),
                    ],
                  ),
                ),
              ],
            ),
          ),

          const SizedBox(height: 16),

          // Cart Items List Card
          Container(
            padding: const EdgeInsets.all(16),
            decoration: BoxDecoration(
              color: Colors.white,
              borderRadius: BorderRadius.circular(18),
              border: Border.all(color: AppColors.cardBorder, width: 1.2),
              boxShadow: [
                BoxShadow(color: Colors.black.withValues(alpha: 0.02), blurRadius: 10, offset: const Offset(0, 2)),
              ],
            ),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                const Text('Selected Dishes', style: TextStyle(fontSize: 15, fontWeight: FontWeight.bold, color: AppColors.textMain)),
                const SizedBox(height: 12),
                ...widget.cart.entries.map((entry) {
                  final item = allFoodItems.firstWhere((f) => f.id == entry.key, orElse: () => allFoodItems[0]);
                  final qty = entry.value;
                  return Padding(
                    padding: const EdgeInsets.only(bottom: 12),
                    child: Row(
                      crossAxisAlignment: CrossAxisAlignment.center,
                      children: [
                        ClipRRect(
                          borderRadius: BorderRadius.circular(8),
                          child: Image.asset(
                            item.imagePath,
                            width: 50,
                            height: 50,
                            fit: BoxFit.cover,
                            errorBuilder: (c, e, s) => Container(width: 50, height: 50, color: Colors.grey.shade200, child: const Icon(Icons.restaurant, size: 18)),
                          ),
                        ),
                        const SizedBox(width: 10),
                        Expanded(
                          child: Column(
                            crossAxisAlignment: CrossAxisAlignment.start,
                            children: [
                              Row(
                                children: [
                                  Icon(item.isVeg ? Icons.circle : Icons.stop, size: 8, color: item.isVeg ? AppColors.vegGreen : AppColors.nonVegRed),
                                  const SizedBox(width: 4),
                                  Expanded(
                                    child: Text(
                                      item.name,
                                      style: const TextStyle(fontWeight: FontWeight.bold, fontSize: 13, color: AppColors.textMain),
                                      maxLines: 1,
                                      overflow: TextOverflow.ellipsis,
                                    ),
                                  ),
                                ],
                              ),
                              const SizedBox(height: 2),
                              Text('₹${item.price.toInt()} each', style: const TextStyle(fontSize: 11, color: AppColors.textSecondary)),
                            ],
                          ),
                        ),
                        // Quantity Stepper
                        Container(
                          decoration: BoxDecoration(
                            color: AppColors.primaryLight,
                            borderRadius: BorderRadius.circular(8),
                            border: Border.all(color: AppColors.primary.withValues(alpha: 0.3)),
                          ),
                          child: Row(
                            children: [
                              InkWell(
                                onTap: () => widget.onRemoveFromCart(item),
                                child: const Padding(
                                  padding: EdgeInsets.symmetric(horizontal: 6, vertical: 4),
                                  child: Icon(Icons.remove, size: 14, color: AppColors.primary),
                                ),
                              ),
                              Text('$qty', style: const TextStyle(fontWeight: FontWeight.bold, fontSize: 12, color: AppColors.primaryDark)),
                              InkWell(
                                onTap: () => widget.onAddToCart(item),
                                child: const Padding(
                                  padding: EdgeInsets.symmetric(horizontal: 6, vertical: 4),
                                  child: Icon(Icons.add, size: 14, color: AppColors.primary),
                                ),
                              ),
                            ],
                          ),
                        ),
                        const SizedBox(width: 12),
                        Text(
                          '₹${(item.price * qty).toInt()}',
                          style: const TextStyle(fontWeight: FontWeight.w900, fontSize: 14, color: AppColors.textMain),
                        ),
                      ],
                    ),
                  );
                }),
              ],
            ),
          ),

          const SizedBox(height: 16),

          // Coupon Code Section
          Container(
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
                  children: [
                    const Icon(Icons.local_offer_rounded, color: AppColors.primary, size: 18),
                    const SizedBox(width: 8),
                    const Text('Coupons & Offers', style: TextStyle(fontSize: 13, fontWeight: FontWeight.bold, color: AppColors.textMain)),
                    if (_appliedCouponCode != null) ...[
                      const Spacer(),
                      Text('$_appliedCouponCode applied! (-₹${_appliedDiscount.toInt()})', style: const TextStyle(color: AppColors.vegGreen, fontWeight: FontWeight.bold, fontSize: 11)),
                    ],
                  ],
                ),
                const SizedBox(height: 10),
                Row(
                  children: [
                    Expanded(
                      child: Container(
                        padding: const EdgeInsets.symmetric(horizontal: 12),
                        decoration: BoxDecoration(
                          color: Colors.grey.shade100,
                          borderRadius: BorderRadius.circular(10),
                        ),
                        child: TextField(
                          controller: _couponCtrl,
                          textCapitalization: TextCapitalization.characters,
                          decoration: const InputDecoration(
                            hintText: 'Enter coupon code (SPICE150)',
                            hintStyle: TextStyle(fontSize: 12),
                            border: InputBorder.none,
                            isDense: true,
                            contentPadding: EdgeInsets.symmetric(vertical: 10),
                          ),
                        ),
                      ),
                    ),
                    const SizedBox(width: 8),
                    ElevatedButton(
                      onPressed: () => _applyCoupon(_couponCtrl.text),
                      style: ElevatedButton.styleFrom(
                        backgroundColor: AppColors.primary,
                        foregroundColor: Colors.white,
                        shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(10)),
                        padding: const EdgeInsets.symmetric(horizontal: 14, vertical: 10),
                        elevation: 0,
                      ),
                      child: const Text('APPLY', style: TextStyle(fontSize: 11, fontWeight: FontWeight.bold)),
                    ),
                  ],
                ),
              ],
            ),
          ),

          const SizedBox(height: 16),

          // Bill Summary Card
          Container(
            padding: const EdgeInsets.all(16),
            decoration: BoxDecoration(
              color: Colors.white,
              borderRadius: BorderRadius.circular(18),
              border: Border.all(color: AppColors.cardBorder, width: 1.2),
              boxShadow: [
                BoxShadow(color: Colors.black.withValues(alpha: 0.02), blurRadius: 10, offset: const Offset(0, 2)),
              ],
            ),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                const Text('Bill Summary', style: TextStyle(fontSize: 15, fontWeight: FontWeight.bold, color: AppColors.textMain)),
                const SizedBox(height: 10),
                _buildBillRow('Item Total', '₹${subtotal.toInt()}'),
                if (_appliedDiscount > 0)
                  _buildBillRow('Coupon Discount', '-₹${_appliedDiscount.toInt()}', isDiscount: true),
                _buildBillRow('Delivery Fee', deliveryFee == 0 ? 'FREE' : '₹${deliveryFee.toInt()}', isFree: deliveryFee == 0),
                _buildBillRow('Packaging & Handi Fee', '₹${packaging.toInt()}'),
                _buildBillRow('Govt. GST (5%)', '₹${tax.toStringAsFixed(1)}'),
                const Divider(height: 18),
                Row(
                  mainAxisAlignment: MainAxisAlignment.spaceBetween,
                  children: [
                    const Text('To Pay', style: TextStyle(fontSize: 16, fontWeight: FontWeight.w900, color: AppColors.textMain)),
                    Text(
                      '₹${grandTotal.toStringAsFixed(0)}',
                      style: const TextStyle(fontSize: 18, fontWeight: FontWeight.w900, color: AppColors.primary),
                    ),
                  ],
                ),
              ],
            ),
          ),

          const SizedBox(height: 16),

          // Payment Method Selector
          Container(
            padding: const EdgeInsets.all(14),
            decoration: BoxDecoration(
              color: Colors.white,
              borderRadius: BorderRadius.circular(16),
              border: Border.all(color: AppColors.cardBorder, width: 1.2),
            ),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                const Text('Payment Mode', style: TextStyle(fontSize: 13, fontWeight: FontWeight.bold, color: AppColors.textMain)),
                const SizedBox(height: 8),
                ..._paymentOptions.map((opt) {
                  final isSelected = _selectedPayment == opt;
                  return InkWell(
                    onTap: () => setState(() => _selectedPayment = opt),
                    child: Padding(
                      padding: const EdgeInsets.symmetric(vertical: 8),
                      child: Row(
                        children: [
                          Icon(
                            isSelected ? Icons.radio_button_checked_rounded : Icons.radio_button_unchecked_rounded,
                            color: isSelected ? AppColors.primary : Colors.grey.shade400,
                            size: 20,
                          ),
                          const SizedBox(width: 10),
                          Text(
                            opt,
                            style: TextStyle(
                              fontSize: 13,
                              fontWeight: isSelected ? FontWeight.bold : FontWeight.w500,
                              color: isSelected ? AppColors.textMain : AppColors.textSecondary,
                            ),
                          ),
                        ],
                      ),
                    ),
                  );
                }),
              ],
            ),
          ),

          const SizedBox(height: 20),

          // Guest Login Reminder Banner
          if (!widget.isLoggedIn)
            Container(
              margin: const EdgeInsets.only(bottom: 14),
              padding: const EdgeInsets.symmetric(horizontal: 14, vertical: 11),
              decoration: BoxDecoration(
                color: AppColors.primaryLight,
                borderRadius: BorderRadius.circular(14),
                border: Border.all(color: AppColors.primary.withValues(alpha: 0.3)),
              ),
              child: Row(
                children: [
                  const Icon(Icons.lock_outline_rounded, color: AppColors.primary, size: 18),
                  const SizedBox(width: 8),
                  const Expanded(
                    child: Text(
                      'Please log in to complete and place your order.',
                      style: TextStyle(color: AppColors.primaryDark, fontSize: 11.5, fontWeight: FontWeight.bold),
                    ),
                  ),
                  TextButton(
                    onPressed: widget.onRequireLogin,
                    style: TextButton.styleFrom(
                      padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 4),
                      minimumSize: Size.zero,
                      tapTargetSize: MaterialTapTargetSize.shrinkWrap,
                    ),
                    child: const Text('Log In ➔', style: TextStyle(color: AppColors.primary, fontWeight: FontWeight.bold, fontSize: 12)),
                  ),
                ],
              ),
            ),

          // Place Order Button
          SizedBox(
            width: double.infinity,
            child: ElevatedButton(
              onPressed: _isPlacingOrder
                  ? null
                  : () => _handlePlaceOrder(subtotal, deliveryFee, packaging, tax, grandTotal),
              style: ElevatedButton.styleFrom(
                backgroundColor: AppColors.primary,
                foregroundColor: Colors.white,
                padding: const EdgeInsets.symmetric(vertical: 16),
                shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(16)),
                elevation: 2,
              ),
              child: _isPlacingOrder
                  ? const SizedBox(
                      height: 22,
                      width: 22,
                      child: CircularProgressIndicator(color: Colors.white, strokeWidth: 2.5),
                    )
                  : Row(
                      mainAxisAlignment: MainAxisAlignment.center,
                      children: [
                        Icon(widget.isLoggedIn ? Icons.check_circle_rounded : Icons.lock_open_rounded, size: 20),
                        const SizedBox(width: 8),
                        Text(
                          widget.isLoggedIn
                              ? 'Place Order • ₹${grandTotal.toStringAsFixed(0)}'
                              : 'Log In to Place Order • ₹${grandTotal.toStringAsFixed(0)}',
                          style: const TextStyle(fontSize: 16, fontWeight: FontWeight.w900),
                        ),
                      ],
                    ),
            ),
          ),
        ],
      ),
    );
  }

  Future<void> _handlePlaceOrder(
    double subtotal,
    double deliveryFee,
    double packaging,
    double tax,
    double grandTotal,
  ) async {
    if (!widget.isLoggedIn) {
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(
          content: Text('🔒 Please log in first to complete and place your order!'),
          backgroundColor: AppColors.primary,
          behavior: SnackBarBehavior.floating,
        ),
      );
      widget.onRequireLogin();
      return;
    }

    if (subtotal < 200) {
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(
          content: Text('⚠️ Minimum order value is ₹200. Please add more items to your feast!'),
          backgroundColor: AppColors.primaryDark,
          behavior: SnackBarBehavior.floating,
        ),
      );
      return;
    }

    setState(() => _isPlacingOrder = true);

    // Build payload for backend MongoDB order
    final itemsPayload = <Map<String, dynamic>>[];
    for (final e in widget.cart.entries) {
      final item = allFoodItems.firstWhere((f) => f.id == e.key, orElse: () => allFoodItems[0]);
      final mongoId = item.backendId ?? ApiService().resolveMongoId(item.name) ?? item.id;
      itemsPayload.add({
        'food': mongoId,
        'name': item.name,
        'price': item.price,
        'quantity': e.value,
        'image': item.imagePath,
        'isVeg': item.isVeg,
      });
    }

    final addressParts = _selectedAddress.split(',');
    final areaPart = addressParts.length > 1 ? addressParts.last.trim() : 'Indiranagar';

    final addressPayload = {
      'street': _selectedAddress,
      'area': areaPart,
      'landmark': '',
      'city': 'Bangalore',
      'pincode': '560038',
    };

    final paymentMethodBackend = _selectedPayment.contains('Cash')
        ? 'COD'
        : (_selectedPayment.contains('UPI') ? 'UPI' : 'Card');

    final res = await ApiService().createOrder(
      items: itemsPayload,
      deliveryAddress: addressPayload,
      paymentMethod: paymentMethodBackend,
      couponCode: _appliedCouponCode,
    );

    if (!mounted) return;
    setState(() => _isPlacingOrder = false);

    String finalOrderId = 'SG-${DateTime.now().year}-${1000 + DateTime.now().second * 37}';
    double finalTotal = grandTotal;

    if (res['success'] == true && res['data'] != null) {
      final orderData = res['data'];
      finalOrderId = orderData['orderId']?.toString() ?? finalOrderId;
      finalTotal = (orderData['totalAmount'] as num?)?.toDouble() ?? grandTotal;

      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(
          content: Text('🎉 Order #$finalOrderId synced with Spice Garden Kitchen & Admin Portal!'),
          backgroundColor: AppColors.vegGreen,
          behavior: SnackBarBehavior.floating,
        ),
      );
    } else {
      final msg = res['message'] ?? 'Placed locally (Server offline)';
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(
          content: Text('$msg. Order #$finalOrderId saved locally.'),
          backgroundColor: AppColors.primary,
          behavior: SnackBarBehavior.floating,
        ),
      );
    }

    final newOrder = PlacedOrder(
      orderId: finalOrderId,
      orderTime: DateTime.now(),
      items: widget.cart.entries.map((e) {
        final item = allFoodItems.firstWhere((f) => f.id == e.key, orElse: () => allFoodItems[0]);
        return OrderItemRecord(food: item, quantity: e.value);
      }).toList(),
      subtotal: subtotal,
      deliveryFee: deliveryFee,
      packagingFee: packaging,
      tax: tax,
      total: finalTotal,
      deliveryAddress: _selectedAddress,
      paymentMethod: _selectedPayment,
      statusIndex: 0, // Order Confirmed
    );

    widget.onOrderPlaced(newOrder);
  }

  Widget _buildBillRow(String label, String value, {bool isDiscount = false, bool isFree = false}) {
    return Padding(
      padding: const EdgeInsets.only(bottom: 6),
      child: Row(
        mainAxisAlignment: MainAxisAlignment.spaceBetween,
        children: [
          Text(label, style: const TextStyle(fontSize: 12, color: AppColors.textSecondary)),
          Text(
            value,
            style: TextStyle(
              fontSize: 12,
              fontWeight: FontWeight.bold,
              color: isDiscount || isFree ? AppColors.vegGreen : AppColors.textMain,
            ),
          ),
        ],
      ),
    );
  }
}
