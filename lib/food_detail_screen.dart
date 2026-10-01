import 'package:flutter/material.dart';
import 'food_data.dart';
import 'main.dart';

class FoodDetailScreen extends StatefulWidget {
  final FoodItem item;
  final int initialQuantity;
  final Function(FoodItem) onAddToCart;
  final Function(FoodItem) onRemoveFromCart;
  final VoidCallback onOpenCart;
  final bool pureVegMode;

  const FoodDetailScreen({
    super.key,
    required this.item,
    required this.initialQuantity,
    required this.onAddToCart,
    required this.onRemoveFromCart,
    required this.onOpenCart,
    this.pureVegMode = false,
  });

  @override
  State<FoodDetailScreen> createState() => _FoodDetailScreenState();
}

class _FoodDetailScreenState extends State<FoodDetailScreen> {
  late int _quantity;
  bool _isFavorite = false;
  String _selectedSpiceLevel = 'Authentic';
  final TextEditingController _instructionCtrl = TextEditingController();

  final List<String> _spiceLevels = ['Mild', 'Medium', 'Authentic'];

  @override
  void initState() {
    super.initState();
    _quantity = widget.initialQuantity;
    if (_quantity == 0) {
      _quantity = 1;
    }
  }

  @override
  void dispose() {
    _instructionCtrl.dispose();
    super.dispose();
  }

  void _increment() {
    setState(() => _quantity++);
  }

  void _decrement() {
    if (_quantity > 1) {
      setState(() => _quantity--);
    }
  }

  void _handleAddToCart() {
    for (int i = 0; i < _quantity; i++) {
      widget.onAddToCart(widget.item);
    }
    Navigator.pop(context);
  }

  @override
  Widget build(BuildContext context) {
    final item = widget.item;
    final int savings = (item.originalPrice - item.price).toInt();
    final double discountPercent = ((item.originalPrice - item.price) / item.originalPrice * 100).roundToDouble();

    // Related pairing suggestions
    final pairingPool = widget.pureVegMode ? allFoodItems.where((f) => f.isVeg).toList() : allFoodItems;
    final pairings = pairingPool
        .where((f) => f.id != item.id && (f.category == 'Starters' || f.category == 'Desserts' || f.category == 'Main Course'))
        .take(3)
        .toList();

    return Scaffold(
      backgroundColor: AppColors.bg,
      body: CustomScrollView(
        physics: const BouncingScrollPhysics(),
        slivers: [
          // 1. Sliver Hero Image Bar
          SliverAppBar(
            expandedHeight: 320,
            pinned: true,
            backgroundColor: AppColors.darkCardBg,
            elevation: 0,
            leading: Padding(
              padding: const EdgeInsets.all(8.0),
              child: CircleAvatar(
                backgroundColor: Colors.black54,
                child: IconButton(
                  icon: const Icon(Icons.arrow_back_rounded, color: Colors.white, size: 20),
                  onPressed: () => Navigator.pop(context),
                ),
              ),
            ),
            actions: [
              Padding(
                padding: const EdgeInsets.only(right: 4.0),
                child: CircleAvatar(
                  backgroundColor: Colors.black54,
                  child: IconButton(
                    icon: Icon(
                      _isFavorite ? Icons.favorite_rounded : Icons.favorite_border_rounded,
                      color: _isFavorite ? Colors.redAccent : Colors.white,
                      size: 20,
                    ),
                    onPressed: () {
                      setState(() => _isFavorite = !_isFavorite);
                      ScaffoldMessenger.of(context).showSnackBar(
                        SnackBar(
                          content: Text(_isFavorite ? 'Saved to your favorites ❤️' : 'Removed from favorites'),
                          duration: const Duration(milliseconds: 900),
                          behavior: SnackBarBehavior.floating,
                        ),
                      );
                    },
                  ),
                ),
              ),
              Padding(
                padding: const EdgeInsets.only(right: 12.0),
                child: CircleAvatar(
                  backgroundColor: Colors.black54,
                  child: IconButton(
                    icon: const Icon(Icons.share_rounded, color: Colors.white, size: 20),
                    onPressed: () {
                      ScaffoldMessenger.of(context).showSnackBar(
                        const SnackBar(
                          content: Text('Link copied! Share this royal recipe with friends.'),
                          duration: Duration(milliseconds: 900),
                          behavior: SnackBarBehavior.floating,
                        ),
                      );
                    },
                  ),
                ),
              ),
            ],
            flexibleSpace: FlexibleSpaceBar(
              background: Stack(
                fit: StackFit.expand,
                children: [
                  Image.asset(
                    item.imagePath,
                    fit: BoxFit.cover,
                    errorBuilder: (ctx, err, stack) => Container(
                      color: const Color(0xFF2C1810),
                      child: const Center(
                        child: Icon(Icons.restaurant_rounded, color: Colors.white54, size: 64),
                      ),
                    ),
                  ),
                  // Atmospheric gradient scrim
                  Container(
                    decoration: BoxDecoration(
                      gradient: LinearGradient(
                        begin: Alignment.topCenter,
                        end: Alignment.bottomCenter,
                        colors: [
                          Colors.black54,
                          Colors.transparent,
                          Colors.black.withValues(alpha: 0.85),
                        ],
                        stops: const [0.0, 0.45, 1.0],
                      ),
                    ),
                  ),
                  // Bottom overlay label on photo
                  Positioned(
                    bottom: 16,
                    left: 16,
                    right: 16,
                    child: Row(
                      mainAxisAlignment: MainAxisAlignment.spaceBetween,
                      children: [
                        Container(
                          padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 5),
                          decoration: BoxDecoration(
                            color: Colors.black87,
                            borderRadius: BorderRadius.circular(20),
                            border: Border.all(color: Colors.white24),
                          ),
                          child: Row(
                            mainAxisSize: MainAxisSize.min,
                            children: [
                              Icon(
                                item.isVeg ? Icons.circle : Icons.stop,
                                color: item.isVeg ? AppColors.vegGreen : AppColors.nonVegRed,
                                size: 10,
                              ),
                              const SizedBox(width: 6),
                              Text(
                                item.isVeg ? '100% PURE VEG' : 'AUTHENTIC NON-VEG',
                                style: const TextStyle(
                                  color: Colors.white,
                                  fontSize: 10,
                                  fontWeight: FontWeight.w900,
                                  letterSpacing: 0.5,
                                ),
                              ),
                            ],
                          ),
                        ),
                        Container(
                          padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 5),
                          decoration: BoxDecoration(
                            color: AppColors.primary,
                            borderRadius: BorderRadius.circular(20),
                          ),
                          child: Row(
                            mainAxisSize: MainAxisSize.min,
                            children: [
                              const Icon(Icons.star_rounded, color: Colors.white, size: 14),
                              const SizedBox(width: 3),
                              Text(
                                '${item.rating} (${item.reviews}+ ratings)',
                                style: const TextStyle(color: Colors.white, fontSize: 11, fontWeight: FontWeight.bold),
                              ),
                            ],
                          ),
                        ),
                      ],
                    ),
                  ),
                ],
              ),
            ),
          ),

          // 2. Dish Content Body
          SliverToBoxAdapter(
            child: Padding(
              padding: const EdgeInsets.fromLTRB(16, 20, 16, 120),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  // Category & Prep Time Badges
                  Row(
                    children: [
                      Container(
                        padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 4),
                        decoration: BoxDecoration(
                          color: AppColors.primaryLight,
                          borderRadius: BorderRadius.circular(8),
                          border: Border.all(color: AppColors.primary.withValues(alpha: 0.3)),
                        ),
                        child: Text(
                          item.category.toUpperCase(),
                          style: const TextStyle(color: AppColors.primaryDark, fontSize: 11, fontWeight: FontWeight.bold),
                        ),
                      ),
                      const SizedBox(width: 8),
                      Container(
                        padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 4),
                        decoration: BoxDecoration(
                          color: Colors.grey.shade100,
                          borderRadius: BorderRadius.circular(8),
                        ),
                        child: Row(
                          children: [
                            const Icon(Icons.timer_outlined, size: 13, color: AppColors.textSecondary),
                            const SizedBox(width: 4),
                            Text(
                              item.prepTime,
                              style: const TextStyle(fontSize: 11, fontWeight: FontWeight.w600, color: AppColors.textSecondary),
                            ),
                          ],
                        ),
                      ),
                      if (item.isSpicy) ...[
                        const SizedBox(width: 8),
                        Container(
                          padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 4),
                          decoration: BoxDecoration(
                            color: const Color(0xFFFEF2F2),
                            borderRadius: BorderRadius.circular(8),
                          ),
                          child: const Row(
                            children: [
                              Text('🌶️', style: TextStyle(fontSize: 11)),
                              SizedBox(width: 4),
                              Text('Fiery Spiced', style: TextStyle(fontSize: 11, fontWeight: FontWeight.bold, color: Colors.red)),
                            ],
                          ),
                        ),
                      ],
                    ],
                  ),

                  const SizedBox(height: 12),

                  // Dish Title
                  Text(
                    item.name,
                    style: const TextStyle(
                      fontSize: 24,
                      fontWeight: FontWeight.w900,
                      color: AppColors.textMain,
                      height: 1.2,
                    ),
                  ),

                  const SizedBox(height: 8),

                  // Price & Discount Block
                  Row(
                    crossAxisAlignment: CrossAxisAlignment.center,
                    children: [
                      Text(
                        '₹${item.price.toInt()}',
                        style: const TextStyle(
                          fontSize: 24,
                          fontWeight: FontWeight.w900,
                          color: AppColors.primary,
                        ),
                      ),
                      const SizedBox(width: 8),
                      Text(
                        '₹${item.originalPrice.toInt()}',
                        style: TextStyle(
                          fontSize: 15,
                          color: Colors.grey.shade500,
                          decoration: TextDecoration.lineThrough,
                        ),
                      ),
                      const SizedBox(width: 10),
                      Container(
                        padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 3),
                        decoration: BoxDecoration(
                          color: AppColors.vegGreen.withValues(alpha: 0.12),
                          borderRadius: BorderRadius.circular(6),
                        ),
                        child: Text(
                          '$discountPercent% OFF (SAVE ₹$savings)',
                          style: const TextStyle(
                            color: AppColors.vegGreen,
                            fontSize: 11,
                            fontWeight: FontWeight.w900,
                          ),
                        ),
                      ),
                    ],
                  ),

                  const SizedBox(height: 16),
                  const Divider(height: 1),
                  const SizedBox(height: 16),

                  // Detailed Description
                  const Text(
                    'About this Dish',
                    style: TextStyle(fontSize: 16, fontWeight: FontWeight.bold, color: AppColors.textMain),
                  ),
                  const SizedBox(height: 8),
                  Text(
                    item.description,
                    style: const TextStyle(
                      fontSize: 14,
                      color: AppColors.textSecondary,
                      height: 1.5,
                    ),
                  ),

                  const SizedBox(height: 20),

                  // 3. Authenticity Guarantee Cards (Desi Ghee, Zero Preservatives)
                  Container(
                    padding: const EdgeInsets.all(14),
                    decoration: BoxDecoration(
                      color: Colors.white,
                      borderRadius: BorderRadius.circular(16),
                      border: Border.all(color: Colors.orange.shade100),
                      boxShadow: [
                        BoxShadow(
                          color: Colors.black.withValues(alpha: 0.03),
                          blurRadius: 10,
                          offset: const Offset(0, 3),
                        ),
                      ],
                    ),
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        const Row(
                          children: [
                            Icon(Icons.verified_rounded, color: AppColors.primary, size: 18),
                            SizedBox(width: 6),
                            Text(
                              'Spice Garden Royal Standards',
                              style: TextStyle(fontSize: 13, fontWeight: FontWeight.w800, color: AppColors.textMain),
                            ),
                          ],
                        ),
                        const SizedBox(height: 12),
                        _buildStandardItem(Icons.soup_kitchen_rounded, 'Pure Clarified Desi Ghee', 'Slow-cooked without compromise in aroma or taste.'),
                        const SizedBox(height: 8),
                        _buildStandardItem(Icons.grain_rounded, 'Fresh Stone-Ground Spices', 'Prepared every morning from single-origin Malabar spices.'),
                        const SizedBox(height: 8),
                        _buildStandardItem(Icons.local_fire_department_rounded, 'Cooked to Order', 'Simmered fresh upon receiving your order ticket.'),
                      ],
                    ),
                  ),

                  const SizedBox(height: 22),

                  // 4. Customization: Spice Level Preference
                  const Text(
                    'Customize Your Spice Level',
                    style: TextStyle(fontSize: 15, fontWeight: FontWeight.bold, color: AppColors.textMain),
                  ),
                  const SizedBox(height: 10),
                  Row(
                    children: _spiceLevels.map((lvl) {
                      final isSelected = _selectedSpiceLevel == lvl;
                      return Expanded(
                        child: GestureDetector(
                          onTap: () => setState(() => _selectedSpiceLevel = lvl),
                          child: Container(
                            margin: const EdgeInsets.only(right: 8),
                            padding: const EdgeInsets.symmetric(vertical: 10),
                            decoration: BoxDecoration(
                              color: isSelected ? AppColors.primaryLight : Colors.white,
                              borderRadius: BorderRadius.circular(12),
                              border: Border.all(
                                color: isSelected ? AppColors.primary : Colors.grey.shade300,
                                width: isSelected ? 1.5 : 1,
                              ),
                            ),
                            child: Column(
                              children: [
                                Text(
                                  lvl == 'Mild' ? '🌶️' : (lvl == 'Medium' ? '🌶️🌶️' : '🌶️🌶️🌶️'),
                                  style: const TextStyle(fontSize: 12),
                                ),
                                const SizedBox(height: 4),
                                Text(
                                  lvl,
                                  style: TextStyle(
                                    fontSize: 12,
                                    fontWeight: isSelected ? FontWeight.bold : FontWeight.w500,
                                    color: isSelected ? AppColors.primary : AppColors.textMain,
                                  ),
                                ),
                              ],
                            ),
                          ),
                        ),
                      );
                    }).toList(),
                  ),

                  const SizedBox(height: 22),

                  // 5. Cooking Note / Instruction for Chef
                  const Text(
                    'Special Cooking Request (Optional)',
                    style: TextStyle(fontSize: 15, fontWeight: FontWeight.bold, color: AppColors.textMain),
                  ),
                  const SizedBox(height: 8),
                  Container(
                    decoration: BoxDecoration(
                      color: Colors.white,
                      borderRadius: BorderRadius.circular(12),
                      border: Border.all(color: AppColors.cardBorder, width: 1.2),
                    ),
                    child: TextField(
                      controller: _instructionCtrl,
                      maxLines: 2,
                      decoration: const InputDecoration(
                        hintText: 'e.g. Extra gravy, less butter, cutlery not needed...',
                        hintStyle: TextStyle(fontSize: 12, color: Colors.grey),
                        contentPadding: EdgeInsets.all(12),
                        border: InputBorder.none,
                      ),
                    ),
                  ),

                  const SizedBox(height: 24),

                  // 6. Perfect Pairings
                  const Text(
                    'Frequently Ordered Together',
                    style: TextStyle(fontSize: 16, fontWeight: FontWeight.bold, color: AppColors.textMain),
                  ),
                  const SizedBox(height: 12),
                  SizedBox(
                    height: 110,
                    child: ListView.builder(
                      scrollDirection: Axis.horizontal,
                      itemCount: pairings.length,
                      itemBuilder: (ctx, idx) {
                        final p = pairings[idx];
                        return Container(
                          width: 220,
                          margin: const EdgeInsets.only(right: 12),
                          padding: const EdgeInsets.all(8),
                          decoration: BoxDecoration(
                            color: Colors.white,
                            borderRadius: BorderRadius.circular(14),
                            border: Border.all(color: AppColors.cardBorder, width: 1.2),
                          ),
                          child: Row(
                            children: [
                              ClipRRect(
                                borderRadius: BorderRadius.circular(10),
                                child: Image.asset(
                                  p.imagePath,
                                  width: 60,
                                  height: 80,
                                  fit: BoxFit.cover,
                                  errorBuilder: (c, e, s) => Container(
                                    width: 60,
                                    height: 80,
                                    color: Colors.grey.shade200,
                                    child: const Icon(Icons.restaurant, size: 20),
                                  ),
                                ),
                              ),
                              const SizedBox(width: 10),
                              Expanded(
                                child: Column(
                                  crossAxisAlignment: CrossAxisAlignment.start,
                                  mainAxisAlignment: MainAxisAlignment.center,
                                  children: [
                                    Text(
                                      p.name,
                                      maxLines: 1,
                                      overflow: TextOverflow.ellipsis,
                                      style: const TextStyle(fontWeight: FontWeight.bold, fontSize: 12),
                                    ),
                                    const SizedBox(height: 2),
                                    Text('₹${p.price.toInt()}', style: const TextStyle(color: AppColors.primary, fontWeight: FontWeight.w900, fontSize: 12)),
                                    const SizedBox(height: 6),
                                    InkWell(
                                      onTap: () {
                                        widget.onAddToCart(p);
                                      },
                                      child: Container(
                                        padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 3),
                                        decoration: BoxDecoration(
                                          color: AppColors.primaryLight,
                                          borderRadius: BorderRadius.circular(6),
                                          border: Border.all(color: AppColors.primary.withValues(alpha: 0.3)),
                                        ),
                                        child: const Text(
                                          '+ ADD',
                                          style: TextStyle(color: AppColors.primary, fontSize: 10, fontWeight: FontWeight.bold),
                                        ),
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
                  ),
                ],
              ),
            ),
          ),
        ],
      ),

      // 3. Sticky Bottom Checkout / Add to Cart Bar
      bottomNavigationBar: Container(
        padding: const EdgeInsets.fromLTRB(16, 12, 16, 24),
        decoration: BoxDecoration(
          color: Colors.white,
          boxShadow: [
            BoxShadow(
              color: Colors.black.withValues(alpha: 0.08),
              blurRadius: 16,
              offset: const Offset(0, -4),
            ),
          ],
        ),
        child: SafeArea(
          top: false,
          child: Row(
            children: [
              // Quantity Selector
              Container(
                decoration: BoxDecoration(
                  color: Colors.grey.shade100,
                  borderRadius: BorderRadius.circular(12),
                  border: Border.all(color: AppColors.cardBorder, width: 1.2),
                ),
                child: Row(
                  children: [
                    IconButton(
                      icon: const Icon(Icons.remove, size: 16),
                      onPressed: _decrement,
                    ),
                    Text(
                      '$_quantity',
                      style: const TextStyle(fontSize: 16, fontWeight: FontWeight.bold),
                    ),
                    IconButton(
                      icon: const Icon(Icons.add, size: 16, color: AppColors.primary),
                      onPressed: _increment,
                    ),
                  ],
                ),
              ),

              const SizedBox(width: 12),

              // Big Primary CTA Button
              Expanded(
                child: ElevatedButton(
                  onPressed: _handleAddToCart,
                  style: ElevatedButton.styleFrom(
                    backgroundColor: AppColors.primary,
                    foregroundColor: Colors.white,
                    padding: const EdgeInsets.symmetric(vertical: 14),
                    shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(14)),
                    elevation: 0,
                  ),
                  child: Row(
                    mainAxisAlignment: MainAxisAlignment.center,
                    children: [
                      const Icon(Icons.shopping_bag_rounded, size: 18),
                      const SizedBox(width: 8),
                      Text(
                        'Add to Cart • ₹${(item.price * _quantity).toInt()}',
                        style: const TextStyle(fontSize: 14, fontWeight: FontWeight.bold),
                      ),
                    ],
                  ),
                ),
              ),
            ],
          ),
        ),
      ),
    );
  }

  Widget _buildStandardItem(IconData icon, String title, String subtitle) {
    return Row(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Icon(icon, size: 16, color: AppColors.primary),
        const SizedBox(width: 8),
        Expanded(
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Text(title, style: const TextStyle(fontWeight: FontWeight.bold, fontSize: 12, color: AppColors.textMain)),
              Text(subtitle, style: const TextStyle(fontSize: 11, color: AppColors.textSecondary)),
            ],
          ),
        ),
      ],
    );
  }
}
