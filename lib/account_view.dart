import 'package:flutter/material.dart';
import 'main.dart';

class AccountView extends StatefulWidget {
  final List<PlacedOrder> orders;
  final Function(PlacedOrder) onReorder;
  final Function(PlacedOrder, int) onUpdateOrderStatus;
  final VoidCallback onGoToReviews;
  final VoidCallback onGoToMenu;
  final String userName;
  final String userPhone;
  final String userEmail;
  final bool isLoggedIn;
  final VoidCallback onLoginPressed;
  final VoidCallback onLogout;
  final bool pureVegMode;
  final ValueChanged<bool>? onTogglePureVegMode;
  final bool isBackendConnected;
  final VoidCallback? onRefreshBackend;

  const AccountView({
    super.key,
    required this.orders,
    required this.onReorder,
    required this.onUpdateOrderStatus,
    required this.onGoToReviews,
    required this.onGoToMenu,
    this.userName = 'Balamurugan',
    this.userPhone = '+91 98450 12345',
    this.userEmail = 'balamurugan@spicegarden.in',
    this.isLoggedIn = true,
    required this.onLoginPressed,
    required this.onLogout,
    this.pureVegMode = false,
    this.onTogglePureVegMode,
    this.isBackendConnected = true,
    this.onRefreshBackend,
  });

  @override
  State<AccountView> createState() => _AccountViewState();
}

class _AccountViewState extends State<AccountView> {
  bool _showingOrdersView = false;

  @override
  Widget build(BuildContext context) {
    if (_showingOrdersView) {
      return Column(
        children: [
          Container(
            padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 10),
            color: Colors.white,
            child: Row(
              children: [
                IconButton(
                  icon: const Icon(Icons.arrow_back_rounded, color: AppColors.textMain),
                  onPressed: () => setState(() => _showingOrdersView = false),
                ),
                const SizedBox(width: 4),
                const Text(
                  'My Orders & Live Tracking',
                  style: TextStyle(fontSize: 16, fontWeight: FontWeight.bold, color: AppColors.textMain),
                ),
              ],
            ),
          ),
          Expanded(
            child: OrdersView(
              orders: widget.orders,
              onReorder: widget.onReorder,
              onUpdateOrderStatus: widget.onUpdateOrderStatus,
            ),
          ),
        ],
      );
    }

    final activeOrder = widget.orders.isNotEmpty ? widget.orders.first : null;

    return SingleChildScrollView(
      physics: const BouncingScrollPhysics(),
      padding: const EdgeInsets.fromLTRB(16, 14, 16, 100),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          // 1. Profile Header Card (Dynamic for Logged In / Guest)
          if (widget.isLoggedIn)
            Container(
              padding: const EdgeInsets.all(16),
              decoration: BoxDecoration(
                gradient: const LinearGradient(
                  colors: [Color(0xFF1E130B), Color(0xFF2C1810)],
                  begin: Alignment.topLeft,
                  end: Alignment.bottomRight,
                ),
                borderRadius: BorderRadius.circular(20),
                border: Border.all(color: AppColors.cardBorder.withValues(alpha: 0.5), width: 1.2),
                boxShadow: [
                  BoxShadow(
                    color: Colors.black.withValues(alpha: 0.1),
                    blurRadius: 12,
                    offset: const Offset(0, 4),
                  ),
                ],
              ),
              child: Row(
                children: [
                  Container(
                    width: 58,
                    height: 58,
                    decoration: BoxDecoration(
                      color: AppColors.primary,
                      shape: BoxShape.circle,
                      border: Border.all(color: Colors.white, width: 2),
                    ),
                    child: Center(
                      child: Text(
                        widget.userName.isNotEmpty ? widget.userName[0].toUpperCase() : 'B',
                        style: const TextStyle(color: Colors.white, fontSize: 24, fontWeight: FontWeight.w900),
                      ),
                    ),
                  ),
                  const SizedBox(width: 14),
                  Expanded(
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        Row(
                          children: [
                            Text(
                              widget.userName,
                              style: const TextStyle(color: Colors.white, fontSize: 17, fontWeight: FontWeight.bold),
                            ),
                            const SizedBox(width: 6),
                            Container(
                              padding: const EdgeInsets.symmetric(horizontal: 6, vertical: 2),
                              decoration: BoxDecoration(
                                color: const Color(0xFFFBBF24),
                                borderRadius: BorderRadius.circular(6),
                              ),
                              child: const Text(
                                '👑 ROYAL',
                                style: TextStyle(color: Colors.black, fontSize: 9, fontWeight: FontWeight.w900),
                              ),
                            ),
                          ],
                        ),
                        const SizedBox(height: 3),
                        Text(
                          '${widget.userPhone} • Indiranagar, BLR',
                          style: const TextStyle(color: Colors.white70, fontSize: 11),
                        ),
                      ],
                    ),
                  ),
                  IconButton(
                    icon: const Icon(Icons.edit_note_rounded, color: Colors.white70),
                    tooltip: 'Switch Account / Log In',
                    onPressed: widget.onLoginPressed,
                  ),
                ],
              ),
            )
          else
            Container(
              padding: const EdgeInsets.all(18),
              decoration: BoxDecoration(
                color: Colors.white,
                borderRadius: BorderRadius.circular(20),
                border: Border.all(color: AppColors.primary.withValues(alpha: 0.3)),
                boxShadow: [
                  BoxShadow(color: AppColors.primary.withValues(alpha: 0.08), blurRadius: 12, offset: const Offset(0, 4)),
                ],
              ),
              child: Column(
                children: [
                  Row(
                    children: [
                      Container(
                        width: 50,
                        height: 50,
                        decoration: const BoxDecoration(color: AppColors.primaryLight, shape: BoxShape.circle),
                        child: const Icon(Icons.person_outline_rounded, color: AppColors.primary, size: 28),
                      ),
                      const SizedBox(width: 14),
                      const Expanded(
                        child: Column(
                          crossAxisAlignment: CrossAxisAlignment.start,
                          children: [
                            Text('Welcome, Foodie! 🍲', style: TextStyle(fontWeight: FontWeight.bold, fontSize: 16, color: AppColors.textMain)),
                            SizedBox(height: 2),
                            Text('Sign in for live order tracking & 450 royal coins', style: TextStyle(fontSize: 11, color: AppColors.textSecondary)),
                          ],
                        ),
                      ),
                    ],
                  ),
                  const SizedBox(height: 14),
                  SizedBox(
                    width: double.infinity,
                    child: ElevatedButton.icon(
                      onPressed: widget.onLoginPressed,
                      icon: const Icon(Icons.login_rounded, size: 16),
                      label: const Text('Log In / Register ➔', style: TextStyle(fontWeight: FontWeight.bold, fontSize: 13)),
                      style: ElevatedButton.styleFrom(
                        backgroundColor: AppColors.primary,
                        foregroundColor: Colors.white,
                        padding: const EdgeInsets.symmetric(vertical: 12),
                        shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
                        elevation: 0,
                      ),
                    ),
                  ),
                ],
              ),
            ),

          const SizedBox(height: 16),

          // 2. PRIMARY BUTTON: MY ORDERS & LIVE TRACKING (Highlighted feature)
          GestureDetector(
            onTap: () => setState(() => _showingOrdersView = true),
            child: Container(
              padding: const EdgeInsets.all(16),
              decoration: BoxDecoration(
                color: Colors.white,
                borderRadius: BorderRadius.circular(18),
                border: Border.all(color: AppColors.primary.withValues(alpha: 0.35), width: 1.5),
                boxShadow: [
                  BoxShadow(
                    color: AppColors.primary.withValues(alpha: 0.08),
                    blurRadius: 12,
                    offset: const Offset(0, 4),
                  ),
                ],
              ),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Row(
                    children: [
                      Container(
                        padding: const EdgeInsets.all(10),
                        decoration: BoxDecoration(
                          color: AppColors.primary,
                          borderRadius: BorderRadius.circular(12),
                        ),
                        child: const Icon(Icons.moped_rounded, color: Colors.white, size: 22),
                      ),
                      const SizedBox(width: 12),
                      Expanded(
                        child: Column(
                          crossAxisAlignment: CrossAxisAlignment.start,
                          children: [
                            Row(
                              children: [
                                const Text(
                                  'My Orders & Tracking',
                                  style: TextStyle(fontSize: 16, fontWeight: FontWeight.w900, color: AppColors.textMain),
                                ),
                                const SizedBox(width: 8),
                                Container(
                                  padding: const EdgeInsets.symmetric(horizontal: 7, vertical: 2),
                                  decoration: BoxDecoration(
                                    color: AppColors.primaryLight,
                                    borderRadius: BorderRadius.circular(8),
                                  ),
                                  child: Text(
                                    '${widget.orders.length} Orders',
                                    style: const TextStyle(color: AppColors.primaryDark, fontSize: 10, fontWeight: FontWeight.bold),
                                  ),
                                ),
                              ],
                            ),
                            const SizedBox(height: 2),
                            Text(
                              activeOrder != null
                                  ? 'Active: Order #${activeOrder.orderId} • ${activeOrder.statusTitle}'
                                  : 'View past orders and repeat order with 1 tap',
                              style: TextStyle(
                                fontSize: 11,
                                color: activeOrder != null ? AppColors.primaryDark : AppColors.textSecondary,
                                fontWeight: activeOrder != null ? FontWeight.bold : FontWeight.normal,
                              ),
                              maxLines: 1,
                              overflow: TextOverflow.ellipsis,
                            ),
                          ],
                        ),
                      ),
                      const Icon(Icons.arrow_forward_ios_rounded, color: AppColors.primary, size: 16),
                    ],
                  ),

                  // If active order exists, show mini timeline shortcut inside Account
                  if (activeOrder != null) ...[
                    const SizedBox(height: 14),
                    const Divider(height: 1),
                    const SizedBox(height: 12),
                    Row(
                      mainAxisAlignment: MainAxisAlignment.spaceBetween,
                      children: [
                        Row(
                          children: [
                            Container(
                              width: 8,
                              height: 8,
                              decoration: const BoxDecoration(color: AppColors.vegGreen, shape: BoxShape.circle),
                            ),
                            const SizedBox(width: 6),
                            Text(
                              activeOrder.statusTitle,
                              style: const TextStyle(fontWeight: FontWeight.bold, fontSize: 12, color: AppColors.textMain),
                            ),
                          ],
                        ),
                        Text(
                          'Track Live ➔',
                          style: TextStyle(color: AppColors.primary, fontWeight: FontWeight.bold, fontSize: 12),
                        ),
                      ],
                    ),
                  ],
                ],
              ),
            ),
          ),

          const SizedBox(height: 16),

          // 3. Loyalty & Royal Rewards Card
          Container(
            padding: const EdgeInsets.all(14),
            decoration: BoxDecoration(
              color: const Color(0xFFFEF3C7),
              borderRadius: BorderRadius.circular(16),
              border: Border.all(color: AppColors.cardBorder, width: 1.2),
            ),
            child: Row(
              children: [
                const Text('🪙', style: TextStyle(fontSize: 28)),
                const SizedBox(width: 12),
                const Expanded(
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Text(
                        'Spice Garden Club: 450 Coins',
                        style: TextStyle(fontWeight: FontWeight.bold, fontSize: 13, color: Color(0xFF92400E)),
                      ),
                      Text(
                        'Use coins for ₹45 off on your next royal handi order.',
                        style: TextStyle(fontSize: 11, color: Color(0xFFB45309)),
                      ),
                    ],
                  ),
                ),
                TextButton(
                  onPressed: widget.onGoToMenu,
                  child: const Text('Redeem', style: TextStyle(fontWeight: FontWeight.bold, color: Color(0xFF92400E), fontSize: 12)),
                ),
              ],
            ),
          ),

          const SizedBox(height: 20),

          // 4. Account Settings & Details
          const Text('Settings & Preferences', style: TextStyle(fontSize: 15, fontWeight: FontWeight.bold, color: AppColors.textMain)),
          const SizedBox(height: 10),

          Container(
            decoration: BoxDecoration(
              color: Colors.white,
              borderRadius: BorderRadius.circular(16),
              border: Border.all(color: AppColors.cardBorder, width: 1.2),
              boxShadow: [
                BoxShadow(color: Colors.black.withValues(alpha: 0.02), blurRadius: 8, offset: const Offset(0, 2)),
              ],
            ),
            child: Column(
              children: [
                // Saved Addresses
                _buildAccountTile(
                  icon: Icons.location_on_outlined,
                  title: 'Saved Delivery Addresses',
                  subtitle: '100 Feet Rd, Indiranagar • Koramangala 4th Block',
                  onTap: () {
                    ScaffoldMessenger.of(context).showSnackBar(
                      const SnackBar(content: Text('Primary Address: 100 Feet Road, Indiranagar, Bangalore')),
                    );
                  },
                ),
                const Divider(height: 1, indent: 56),

                // Pure Veg Toggle
                SwitchListTile(
                  secondary: Container(
                    padding: const EdgeInsets.all(8),
                    decoration: BoxDecoration(color: AppColors.vegGreen.withValues(alpha: 0.1), borderRadius: BorderRadius.circular(8)),
                    child: const Icon(Icons.eco_rounded, color: AppColors.vegGreen, size: 20),
                  ),
                  title: const Text('Pure Veg Only Mode', style: TextStyle(fontWeight: FontWeight.w600, fontSize: 13)),
                  subtitle: const Text('Hide all non-veg and egg dishes', style: TextStyle(fontSize: 11, color: AppColors.textSecondary)),
                  value: widget.pureVegMode,
                  activeThumbColor: AppColors.vegGreen,
                  activeTrackColor: AppColors.vegGreen.withValues(alpha: 0.35),
                  onChanged: (val) {
                    widget.onTogglePureVegMode?.call(val);
                    ScaffoldMessenger.of(context).showSnackBar(
                      SnackBar(
                        content: Row(
                          children: [
                            Icon(val ? Icons.eco_rounded : Icons.restaurant_rounded, color: Colors.white, size: 18),
                            const SizedBox(width: 8),
                            Expanded(
                              child: Text(
                                val
                                    ? '🌱 Pure Veg Mode Enabled: Only 100% vegetarian dishes are shown across Spice Garden.'
                                    : '✨ Full Menu Restored: Showing all authentic specialties (Veg & Non-Veg).',
                                style: const TextStyle(fontSize: 12.5, fontWeight: FontWeight.w600),
                              ),
                            ),
                          ],
                        ),
                        backgroundColor: val ? AppColors.vegGreen : AppColors.primary,
                        behavior: SnackBarBehavior.floating,
                        duration: const Duration(seconds: 3),
                      ),
                    );
                  },
                ),
                const Divider(height: 1, indent: 56),

                // Ask Us & Concierge Shortcut
                _buildAccountTile(
                  icon: Icons.chat_bubble_outline_rounded,
                  title: 'Ask Us & Concierge Help',
                  subtitle: 'Live kitchen support, FAQs & culinary reviews',
                  onTap: widget.onGoToReviews,
                ),
                const Divider(height: 1, indent: 56),

                // Kitchen Support
                _buildAccountTile(
                  icon: Icons.phone_in_talk_outlined,
                  title: 'Kitchen Help & Support',
                  subtitle: 'Direct line to Indiranagar Chef (+91 98450 12345)',
                  onTap: () {
                    ScaffoldMessenger.of(context).showSnackBar(
                      const SnackBar(content: Text('📞 Calling Spice Garden Express Kitchen...')),
                    );
                  },
                ),
              ],
            ),
          ),

          const SizedBox(height: 24),

          // Log Out / Version Info
          Center(
            child: Column(
              children: [
                if (widget.isLoggedIn)
                  Container(
                    width: double.infinity,
                    height: 48,
                    decoration: BoxDecoration(
                      color: const Color(0xFFFEF2F2),
                      borderRadius: BorderRadius.circular(14),
                      border: Border.all(color: const Color(0xFFFCA5A5), width: 1.2),
                      boxShadow: [
                        BoxShadow(
                          color: const Color(0xFFDC2626).withValues(alpha: 0.08),
                          blurRadius: 8,
                          offset: const Offset(0, 2),
                        ),
                      ],
                    ),
                    child: Material(
                      color: Colors.transparent,
                      child: InkWell(
                        borderRadius: BorderRadius.circular(14),
                        onTap: widget.onLogout,
                        child: const Row(
                          mainAxisAlignment: MainAxisAlignment.center,
                          children: [
                            Icon(Icons.logout_rounded, size: 18, color: Color(0xFFDC2626)),
                            SizedBox(width: 8),
                            Text(
                              'Log Out',
                              style: TextStyle(
                                color: Color(0xFFDC2626),
                                fontSize: 14,
                                fontWeight: FontWeight.bold,
                                letterSpacing: 0.2,
                              ),
                            ),
                          ],
                        ),
                      ),
                    ),
                  )
                else
                  Container(
                    width: double.infinity,
                    height: 48,
                    decoration: BoxDecoration(
                      color: AppColors.primaryLight,
                      borderRadius: BorderRadius.circular(14),
                      border: Border.all(color: AppColors.primary.withValues(alpha: 0.3), width: 1.2),
                    ),
                    child: Material(
                      color: Colors.transparent,
                      child: InkWell(
                        borderRadius: BorderRadius.circular(14),
                        onTap: widget.onLoginPressed,
                        child: const Row(
                          mainAxisAlignment: MainAxisAlignment.center,
                          children: [
                            Icon(Icons.login_rounded, size: 18, color: AppColors.primary),
                            SizedBox(width: 8),
                            Text(
                              'Log In / Create Account',
                              style: TextStyle(
                                color: AppColors.primary,
                                fontSize: 14,
                                fontWeight: FontWeight.bold,
                              ),
                            ),
                          ],
                        ),
                      ),
                    ),
                  ),
                const SizedBox(height: 12),
                const Text(
                  'Spice Garden BLR • v2.4.0 (Authentic Desi Ghee Kitchen)',
                  style: TextStyle(fontSize: 10, color: Colors.grey),
                ),
              ],
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildAccountTile({
    required IconData icon,
    required String title,
    required String subtitle,
    required VoidCallback onTap,
  }) {
    return ListTile(
      onTap: onTap,
      leading: Container(
        padding: const EdgeInsets.all(8),
        decoration: BoxDecoration(color: AppColors.primaryLight, borderRadius: BorderRadius.circular(8)),
        child: Icon(icon, color: AppColors.primary, size: 20),
      ),
      title: Text(title, style: const TextStyle(fontWeight: FontWeight.w600, fontSize: 13, color: AppColors.textMain)),
      subtitle: Text(subtitle, style: const TextStyle(fontSize: 11, color: AppColors.textSecondary)),
      trailing: const Icon(Icons.arrow_forward_ios_rounded, size: 14, color: Colors.grey),
    );
  }
}
