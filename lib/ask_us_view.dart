import 'package:flutter/material.dart';
import 'main.dart';

class AskUsView extends StatefulWidget {
  final List<CustomerReview> reviews;
  final Function(CustomerReview) onAddReview;
  final VoidCallback? onExploreMenu;

  const AskUsView({
    super.key,
    required this.reviews,
    required this.onAddReview,
    this.onExploreMenu,
  });

  @override
  State<AskUsView> createState() => _AskUsViewState();
}

class _AskUsViewState extends State<AskUsView> {
  final TextEditingController _questionCtrl = TextEditingController();
  final ScrollController _chatScrollCtrl = ScrollController();
  int? _expandedFaqIndex;

  final List<Map<String, String>> _messages = [
    {
      'from': 'chef',
      'text': 'Namaskara! Welcome to Spice Garden Concierge. How can our kitchen team assist your royal dining experience today?',
      'time': 'Just now',
    },
  ];

  final List<Map<String, String>> _faqs = [
    {
      'q': 'Is all your chicken and meat 100% Halal?',
      'a': 'Yes, absolutely. All poultry and lamb at Spice Garden are 100% certified Halal, sourced fresh each morning, and slow-cooked in traditional dum handis.',
    },
    {
      'q': 'What are your recommended Jain and Pure Veg options?',
      'a': 'Our top picks include Paneer Tikka Royale, Dal Makhani, Kesari Rasmalai, and Subz Handi Biryani (can be prepared without onion/garlic upon request). Separate cookware is strictly maintained.',
    },
    {
      'q': 'Can I request mild spice or less oil?',
      'a': 'Yes! You can specify your preference when ordering or contact the kitchen directly. Our chefs gladly adjust spice and oil levels to your taste.',
    },
    {
      'q': 'How does Express 25m delivery work in Bangalore?',
      'a': 'Freshly prepared orders are packed in thermal-insulated, spill-proof containers that retain pipe-hot temperature and dispatched via priority delivery partners.',
    },
    {
      'q': 'Do you use pure coastal Desi Ghee?',
      'a': 'Yes! 100% pure desi ghee is slow-roasted into our Chicken Ghee Roast, Dal Makhani, and biryani dum sealing with zero palm oil or preservatives.',
    },
    {
      'q': 'Do you cater for family gatherings and corporate parties?',
      'a': 'Yes! We cater for intimate gatherings of 10 up to grand banquets of 500+ guests. Call our Kitchen Manager for customized group menu pricing.',
    },
  ];

  final List<String> _quickChips = [
    'Is Dum Biryani Halal?',
    'Best Jain / Veg dishes?',
    'Can I request mild spice?',
    'Do you use pure Desi Ghee?',
    'How fast is delivery?',
    'Bulk party catering?',
  ];

  void _sendMessage(String query) {
    if (query.trim().isEmpty) return;
    final text = query.trim();
    _questionCtrl.clear();

    String reply = 'Thank you for asking! Our Indiranagar culinary team is at your service.';
    final lower = text.toLowerCase();

    if (lower.contains('halal') || lower.contains('meat') || lower.contains('chicken') || lower.contains('mutton')) {
      reply = 'Yes! 100% of our chicken and lamb is certified Halal and freshly procured daily.';
    } else if (lower.contains('jain') || lower.contains('pure veg') || lower.contains('veg') || lower.contains('paneer')) {
      reply = 'We maintain dedicated vegetarian cookware and tandoors. Our Paneer Tikka, Dal Makhani, and Subz Biryani are Bangalore favorites!';
    } else if (lower.contains('spice') || lower.contains('chilli') || lower.contains('mild') || lower.contains('spicy') || lower.contains('oil')) {
      reply = 'Our rich flavors come from authentic Byadgi chillies and whole spices. We can prepare your dish Mild, Medium, or Royal Extra Spicy on request.';
    } else if (lower.contains('delivery') || lower.contains('time') || lower.contains('fast') || lower.contains('address') || lower.contains('express')) {
      reply = 'Express deliveries take 25–35 minutes across Indiranagar, Koramangala, and HSR Layout in heat-retaining insulated packaging.';
    } else if (lower.contains('ghee') || lower.contains('butter') || lower.contains('ingredient')) {
      reply = 'We use 100% pure coastal Desi Ghee and dairy butter without artificial colors, aginomoto, or chemical enhancers.';
    } else if (lower.contains('cater') || lower.contains('party') || lower.contains('bulk') || lower.contains('event')) {
      reply = 'We provide full royal handi catering for private and corporate gatherings! Call our kitchen at +91 98450 12345 for custom menus.';
    } else {
      reply = 'Thanks for reaching out! We have noted: "$text". Our executive chef and kitchen staff will take special care of your request.';
    }

    setState(() {
      _messages.add({
        'from': 'user',
        'text': text,
        'time': 'Just now',
      });
      _messages.add({
        'from': 'chef',
        'text': reply,
        'time': 'Just now',
      });
    });

    Future.delayed(const Duration(milliseconds: 100), () {
      if (_chatScrollCtrl.hasClients) {
        _chatScrollCtrl.animateTo(
          _chatScrollCtrl.position.maxScrollExtent,
          duration: const Duration(milliseconds: 300),
          curve: Curves.easeOut,
        );
      }
    });
  }

  void _openWriteReviewModal(BuildContext context) {
    double selectedStars = 5.0;
    final nameCtrl = TextEditingController();
    final locationCtrl = TextEditingController(text: 'Indiranagar, Bangalore');
    final commentCtrl = TextEditingController();
    final lovedDishCtrl = TextEditingController();

    showModalBottomSheet(
      context: context,
      isScrollControlled: true,
      backgroundColor: Colors.white,
      shape: const RoundedRectangleBorder(
        borderRadius: BorderRadius.vertical(top: Radius.circular(24)),
      ),
      builder: (ctx) {
        return StatefulBuilder(
          builder: (ctx, setModalState) {
            return Padding(
              padding: EdgeInsets.only(
                left: 20,
                right: 20,
                top: 20,
                bottom: MediaQuery.of(ctx).viewInsets.bottom + 20,
              ),
              child: SingleChildScrollView(
                child: Column(
                  mainAxisSize: MainAxisSize.min,
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Row(
                      mainAxisAlignment: MainAxisAlignment.spaceBetween,
                      children: [
                        const Text('Write a Food Review', style: TextStyle(fontSize: 16, fontWeight: FontWeight.bold)),
                        IconButton(icon: const Icon(Icons.close), onPressed: () => Navigator.pop(ctx)),
                      ],
                    ),
                    const Divider(),
                    const SizedBox(height: 6),
                    const Text('Rating', style: TextStyle(fontSize: 12, fontWeight: FontWeight.bold)),
                    Row(
                      children: List.generate(5, (index) {
                        final star = index + 1;
                        return IconButton(
                          icon: Icon(
                            star <= selectedStars ? Icons.star_rounded : Icons.star_border_rounded,
                            color: AppColors.starGold,
                            size: 32,
                          ),
                          onPressed: () => setModalState(() => selectedStars = star.toDouble()),
                        );
                      }),
                    ),
                    TextField(
                      controller: nameCtrl,
                      decoration: const InputDecoration(labelText: 'Your Name (e.g. Ramesh K.)', isDense: true),
                    ),
                    const SizedBox(height: 8),
                    TextField(
                      controller: locationCtrl,
                      decoration: const InputDecoration(labelText: 'Bangalore Area (e.g. Indiranagar)', isDense: true),
                    ),
                    const SizedBox(height: 8),
                    TextField(
                      controller: lovedDishCtrl,
                      decoration: const InputDecoration(labelText: 'Favorite Dish (e.g. Hyderabadi Dum Biryani)', isDense: true),
                    ),
                    const SizedBox(height: 8),
                    TextField(
                      controller: commentCtrl,
                      maxLines: 3,
                      decoration: const InputDecoration(labelText: 'Your Experience & Taste Feedback', isDense: true),
                    ),
                    const SizedBox(height: 18),
                    SizedBox(
                      width: double.infinity,
                      height: 48,
                      child: ElevatedButton(
                        style: ElevatedButton.styleFrom(
                          backgroundColor: AppColors.primary,
                          foregroundColor: Colors.white,
                          shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
                        ),
                        onPressed: () {
                          if (nameCtrl.text.trim().isEmpty || commentCtrl.text.trim().isEmpty) {
                            ScaffoldMessenger.of(context).showSnackBar(
                              const SnackBar(content: Text('Please enter your name and comment!')),
                            );
                            return;
                          }
                          final rev = CustomerReview(
                            id: DateTime.now().millisecondsSinceEpoch.toString(),
                            name: nameCtrl.text.trim(),
                            location: locationCtrl.text.trim(),
                            rating: selectedStars,
                            comment: commentCtrl.text.trim(),
                            lovedDishes: [lovedDishCtrl.text.trim().isEmpty ? 'Hyderabadi Dum Biryani' : lovedDishCtrl.text.trim()],
                            date: 'Just now',
                            avatarBg: AppColors.primary,
                          );
                          Navigator.pop(ctx);
                          widget.onAddReview(rev);
                        },
                        child: const Text('SUBMIT FEEDBACK', style: TextStyle(fontWeight: FontWeight.bold)),
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

  @override
  void dispose() {
    _questionCtrl.dispose();
    _chatScrollCtrl.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    return SingleChildScrollView(
      physics: const BouncingScrollPhysics(),
      padding: const EdgeInsets.fromLTRB(16, 14, 16, 96),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          // 1. Concierge Header Card
          Container(
            padding: const EdgeInsets.all(18),
            decoration: BoxDecoration(
              gradient: const LinearGradient(
                colors: [
                  Color(0xFFFFFBEB),
                  Color(0xFFFFF7ED),
                  Color(0xFFFFEDD5),
                ],
                begin: Alignment.topLeft,
                end: Alignment.bottomRight,
              ),
              borderRadius: BorderRadius.circular(22),
              border: Border.all(color: const Color(0xFFFED7AA), width: 1.0),
              boxShadow: [
                BoxShadow(
                  color: const Color(0xFF1C1917).withValues(alpha: 0.04),
                  blurRadius: 12,
                  offset: const Offset(0, 4),
                ),
              ],
            ),
            child: Row(
              children: [
                Container(
                  width: 48,
                  height: 48,
                  decoration: BoxDecoration(
                    color: Colors.white,
                    shape: BoxShape.circle,
                    border: Border.all(color: const Color(0xFFFDBA74), width: 1.2),
                    boxShadow: [
                      BoxShadow(
                        color: AppColors.primary.withValues(alpha: 0.15),
                        blurRadius: 8,
                      ),
                    ],
                  ),
                  child: const Icon(Icons.support_agent_rounded, color: AppColors.primary, size: 26),
                ),
                const SizedBox(width: 14),
                const Expanded(
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Text(
                        'Spice Garden Concierge',
                        style: TextStyle(
                          fontSize: 16,
                          fontWeight: FontWeight.w900,
                          color: AppColors.textMain,
                          letterSpacing: -0.3,
                        ),
                      ),
                      SizedBox(height: 3),
                      Text(
                        'Ask us anything about dishes, ingredients, custom spice levels, or live order assistance.',
                        style: TextStyle(
                          fontSize: 11,
                          color: AppColors.textSecondary,
                          height: 1.3,
                        ),
                      ),
                    ],
                  ),
                ),
              ],
            ),
          ),

          const SizedBox(height: 14),

          // 2. Direct Contact Action Row
          Row(
            children: [
              _buildContactAction(
                icon: Icons.phone_in_talk_rounded,
                title: 'Call Kitchen',
                subtitle: '+91 98450 12345',
                color: const Color(0xFF15803D),
                onTap: () {
                  ScaffoldMessenger.of(context).showSnackBar(
                    const SnackBar(
                      content: Text('📞 Connecting to Spice Garden Indiranagar Kitchen Desk...'),
                      backgroundColor: AppColors.primary,
                      behavior: SnackBarBehavior.floating,
                    ),
                  );
                },
              ),
              const SizedBox(width: 8),
              _buildContactAction(
                icon: Icons.chat_rounded,
                title: 'WhatsApp Chef',
                subtitle: 'Instant Chat',
                color: const Color(0xFF2563EB),
                onTap: () {
                  ScaffoldMessenger.of(context).showSnackBar(
                    const SnackBar(
                      content: Text('💬 Opening WhatsApp Chat with Executive Chef...'),
                      backgroundColor: AppColors.primary,
                      behavior: SnackBarBehavior.floating,
                    ),
                  );
                },
              ),
              const SizedBox(width: 8),
              _buildContactAction(
                icon: Icons.storefront_rounded,
                title: 'Visit Dining',
                subtitle: 'Indiranagar 100ft',
                color: const Color(0xFFB45309),
                onTap: () {
                  ScaffoldMessenger.of(context).showSnackBar(
                    const SnackBar(
                      content: Text('📍 100 Feet Road, Indiranagar • Open 11:00 AM – 11:30 PM'),
                      backgroundColor: AppColors.primary,
                      behavior: SnackBarBehavior.floating,
                    ),
                  );
                },
              ),
            ],
          ),

          const SizedBox(height: 20),

          // 3. Interactive Live Q&A Section
          const Text(
            'Live Kitchen Q&A ✨',
            style: TextStyle(
              fontSize: 16.5,
              fontWeight: FontWeight.w900,
              color: AppColors.textMain,
              letterSpacing: -0.3,
            ),
          ),
          const SizedBox(height: 8),

          // Quick Question Suggestion Chips
          SingleChildScrollView(
            scrollDirection: Axis.horizontal,
            physics: const BouncingScrollPhysics(),
            child: Row(
              children: _quickChips.map((q) {
                return GestureDetector(
                  onTap: () => _sendMessage(q),
                  child: Container(
                    margin: const EdgeInsets.only(right: 8, bottom: 6),
                    padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 6),
                    decoration: BoxDecoration(
                      color: Colors.white,
                      borderRadius: BorderRadius.circular(16),
                      border: Border.all(color: AppColors.cardBorder, width: 1.0),
                      boxShadow: [
                        BoxShadow(
                          color: const Color(0xFF1C1917).withValues(alpha: 0.02),
                          blurRadius: 4,
                          offset: const Offset(0, 1),
                        ),
                      ],
                    ),
                    child: Row(
                      mainAxisSize: MainAxisSize.min,
                      children: [
                        const Icon(Icons.help_outline_rounded, size: 12, color: AppColors.primary),
                        const SizedBox(width: 5),
                        Text(
                          q,
                          style: const TextStyle(
                            fontSize: 11,
                            fontWeight: FontWeight.w600,
                            color: AppColors.textMain,
                          ),
                        ),
                      ],
                    ),
                  ),
                );
              }).toList(),
            ),
          ),

          const SizedBox(height: 8),

          // Live Chat Messages Container
          Container(
            padding: const EdgeInsets.all(14),
            decoration: BoxDecoration(
              color: Colors.white,
              borderRadius: BorderRadius.circular(20),
              border: Border.all(color: AppColors.cardBorder, width: 1.0),
              boxShadow: [
                BoxShadow(
                  color: const Color(0xFF1C1917).withValues(alpha: 0.03),
                  blurRadius: 10,
                  offset: const Offset(0, 3),
                ),
              ],
            ),
            child: Column(
              children: [
                ConstrainedBox(
                  constraints: const BoxConstraints(maxHeight: 220),
                  child: ListView.builder(
                    controller: _chatScrollCtrl,
                    shrinkWrap: true,
                    physics: const BouncingScrollPhysics(),
                    itemCount: _messages.length,
                    itemBuilder: (ctx, idx) {
                      final m = _messages[idx];
                      final isUser = m['from'] == 'user';
                      return Padding(
                        padding: const EdgeInsets.symmetric(vertical: 4),
                        child: Align(
                          alignment: isUser ? Alignment.centerRight : Alignment.centerLeft,
                          child: Container(
                            constraints: BoxConstraints(maxWidth: MediaQuery.of(context).size.width * 0.75),
                            padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 8),
                            decoration: BoxDecoration(
                              color: isUser ? AppColors.primary : const Color(0xFFFBF9F5),
                              borderRadius: BorderRadius.circular(14),
                              border: Border.all(
                                color: isUser ? AppColors.primary : AppColors.cardBorder,
                                width: 0.8,
                              ),
                            ),
                            child: Column(
                              crossAxisAlignment: isUser ? CrossAxisAlignment.end : CrossAxisAlignment.start,
                              children: [
                                if (!isUser)
                                  const Padding(
                                    padding: EdgeInsets.only(bottom: 2),
                                    child: Text(
                                      '👨‍🍳 Chef Desk',
                                      style: TextStyle(
                                        fontSize: 9.5,
                                        fontWeight: FontWeight.w900,
                                        color: AppColors.primary,
                                      ),
                                    ),
                                  ),
                                Text(
                                  m['text']!,
                                  style: TextStyle(
                                    fontSize: 11.5,
                                    color: isUser ? Colors.white : AppColors.textMain,
                                    height: 1.3,
                                  ),
                                ),
                              ],
                            ),
                          ),
                        ),
                      );
                    },
                  ),
                ),
                const SizedBox(height: 10),
                const Divider(height: 1),
                const SizedBox(height: 10),
                // Input Row
                Row(
                  children: [
                    Expanded(
                      child: Container(
                        padding: const EdgeInsets.symmetric(horizontal: 12),
                        decoration: BoxDecoration(
                          color: const Color(0xFFFAF7F2),
                          borderRadius: BorderRadius.circular(16),
                          border: Border.all(color: AppColors.cardBorder),
                        ),
                        child: TextField(
                          controller: _questionCtrl,
                          onSubmitted: _sendMessage,
                          style: const TextStyle(fontSize: 12, color: AppColors.textMain),
                          decoration: const InputDecoration(
                            hintText: 'Type your question here...',
                            hintStyle: TextStyle(fontSize: 11.5, color: AppColors.textMuted),
                            border: InputBorder.none,
                            isDense: true,
                            contentPadding: EdgeInsets.symmetric(vertical: 10),
                          ),
                        ),
                      ),
                    ),
                    const SizedBox(width: 8),
                    GestureDetector(
                      onTap: () => _sendMessage(_questionCtrl.text),
                      child: Container(
                        width: 40,
                        height: 40,
                        decoration: BoxDecoration(
                          color: AppColors.primary,
                          borderRadius: BorderRadius.circular(14),
                          boxShadow: [
                            BoxShadow(
                              color: AppColors.primary.withValues(alpha: 0.35),
                              blurRadius: 6,
                              offset: const Offset(0, 2),
                            ),
                          ],
                        ),
                        child: const Icon(Icons.send_rounded, color: Colors.white, size: 18),
                      ),
                    ),
                  ],
                ),
              ],
            ),
          ),

          const SizedBox(height: 24),

          // 4. Frequently Asked Questions
          const Text(
            'Frequently Asked Questions 💡',
            style: TextStyle(
              fontSize: 16.5,
              fontWeight: FontWeight.w900,
              color: AppColors.textMain,
              letterSpacing: -0.3,
            ),
          ),
          const SizedBox(height: 10),
          ...List.generate(_faqs.length, (idx) {
            final faq = _faqs[idx];
            final isExpanded = _expandedFaqIndex == idx;
            return Container(
              margin: const EdgeInsets.only(bottom: 8),
              decoration: BoxDecoration(
                color: Colors.white,
                borderRadius: BorderRadius.circular(16),
                border: Border.all(color: AppColors.cardBorder, width: 1.0),
              ),
              child: Theme(
                data: Theme.of(context).copyWith(dividerColor: Colors.transparent),
                child: ExpansionTile(
                  key: Key('faq_$idx'),
                  initiallyExpanded: isExpanded,
                  onExpansionChanged: (val) {
                    setState(() => _expandedFaqIndex = val ? idx : null);
                  },
                  tilePadding: const EdgeInsets.symmetric(horizontal: 14, vertical: 2),
                  childrenPadding: const EdgeInsets.fromLTRB(14, 0, 14, 12),
                  leading: const Icon(Icons.help_outline_rounded, color: AppColors.primary, size: 18),
                  title: Text(
                    faq['q']!,
                    style: const TextStyle(
                      fontSize: 12.5,
                      fontWeight: FontWeight.w700,
                      color: AppColors.textMain,
                    ),
                  ),
                  children: [
                    Text(
                      faq['a']!,
                      style: const TextStyle(
                        fontSize: 11.5,
                        color: AppColors.textSecondary,
                        height: 1.35,
                      ),
                    ),
                  ],
                ),
              ),
            );
          }),

          const SizedBox(height: 24),

          // 5. Verified Diners & Community Reviews
          Row(
            mainAxisAlignment: MainAxisAlignment.spaceBetween,
            children: [
              const Text(
                'Diner Feedback & Reviews 🌟',
                style: TextStyle(
                  fontSize: 16.5,
                  fontWeight: FontWeight.w900,
                  color: AppColors.textMain,
                  letterSpacing: -0.3,
                ),
              ),
              ElevatedButton.icon(
                onPressed: () => _openWriteReviewModal(context),
                icon: const Icon(Icons.edit, size: 13),
                label: const Text('Add Review', style: TextStyle(fontWeight: FontWeight.bold, fontSize: 11.5)),
                style: ElevatedButton.styleFrom(
                  backgroundColor: AppColors.primary,
                  foregroundColor: Colors.white,
                  padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 6),
                  minimumSize: Size.zero,
                  tapTargetSize: MaterialTapTargetSize.shrinkWrap,
                  shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(10)),
                  elevation: 0,
                ),
              ),
            ],
          ),
          const SizedBox(height: 10),

          // Rating Bar Summary
          Container(
            padding: const EdgeInsets.all(16),
            decoration: BoxDecoration(
              color: Colors.white,
              borderRadius: BorderRadius.circular(20),
              border: Border.all(color: AppColors.cardBorder, width: 1.0),
              boxShadow: [
                BoxShadow(
                  color: const Color(0xFF1C1917).withValues(alpha: 0.02),
                  blurRadius: 8,
                  offset: const Offset(0, 2),
                ),
              ],
            ),
            child: Column(
              children: [
                Row(
                  mainAxisAlignment: MainAxisAlignment.spaceBetween,
                  children: [
                    const Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        Text('4.9 ★', style: TextStyle(fontSize: 28, fontWeight: FontWeight.w900, color: AppColors.primary)),
                        Text('Based on 2,800+ Verified Diners', style: TextStyle(fontSize: 10.5, color: AppColors.textSecondary)),
                      ],
                    ),
                    Container(
                      padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 4),
                      decoration: BoxDecoration(
                        color: AppColors.primaryLight,
                        borderRadius: BorderRadius.circular(12),
                      ),
                      child: const Row(
                        children: [
                          Icon(Icons.verified_rounded, size: 14, color: AppColors.vegGreen),
                          SizedBox(width: 4),
                          Text('100% Genuine', style: TextStyle(fontSize: 10.5, fontWeight: FontWeight.w800, color: AppColors.vegGreen)),
                        ],
                      ),
                    ),
                  ],
                ),
                const SizedBox(height: 12),
                const Divider(height: 1),
                const SizedBox(height: 8),
                _buildRatingBar('5 Star', 0.92, '92%'),
                _buildRatingBar('4 Star', 0.06, '6%'),
                _buildRatingBar('3 Star', 0.02, '2%'),
              ],
            ),
          ),

          const SizedBox(height: 14),

          // Reviews List
          ...widget.reviews.map((rev) {
            return Container(
              margin: const EdgeInsets.only(bottom: 10),
              padding: const EdgeInsets.all(14),
              decoration: BoxDecoration(
                color: Colors.white,
                borderRadius: BorderRadius.circular(18),
                border: Border.all(color: AppColors.cardBorder, width: 1.0),
                boxShadow: [
                  BoxShadow(color: const Color(0xFF1C1917).withValues(alpha: 0.02), blurRadius: 6, offset: const Offset(0, 2)),
                ],
              ),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Row(
                    mainAxisAlignment: MainAxisAlignment.spaceBetween,
                    children: [
                      Row(
                        children: [
                          CircleAvatar(
                            radius: 13,
                            backgroundColor: rev.avatarBg,
                            child: Text(rev.name[0], style: const TextStyle(color: Colors.white, fontSize: 11, fontWeight: FontWeight.bold)),
                          ),
                          const SizedBox(width: 8),
                          Column(
                            crossAxisAlignment: CrossAxisAlignment.start,
                            children: [
                              Text(rev.name, style: const TextStyle(fontWeight: FontWeight.bold, fontSize: 12.5), overflow: TextOverflow.ellipsis),
                              Text(rev.location, style: const TextStyle(fontSize: 9.5, color: AppColors.textSecondary), overflow: TextOverflow.ellipsis),
                            ],
                          ),
                        ],
                      ),
                      Container(
                        padding: const EdgeInsets.symmetric(horizontal: 6, vertical: 2),
                        decoration: BoxDecoration(color: AppColors.primaryLight, borderRadius: BorderRadius.circular(6)),
                        child: Text('${rev.rating} ★', style: const TextStyle(fontSize: 10.5, fontWeight: FontWeight.bold, color: AppColors.primary)),
                      ),
                    ],
                  ),
                  const SizedBox(height: 8),
                  Text('“${rev.comment}”', style: const TextStyle(fontSize: 11.5, color: AppColors.textSecondary, height: 1.3)),
                  const SizedBox(height: 6),
                  Wrap(
                    spacing: 4,
                    runSpacing: 4,
                    children: rev.lovedDishes.map((dish) {
                      return Container(
                        padding: const EdgeInsets.symmetric(horizontal: 7, vertical: 2),
                        decoration: BoxDecoration(color: AppColors.primaryLight, borderRadius: BorderRadius.circular(6)),
                        child: Text('✨ $dish', style: const TextStyle(fontSize: 9.5, fontWeight: FontWeight.bold, color: AppColors.primary)),
                      );
                    }).toList(),
                  ),
                  const SizedBox(height: 4),
                  Text(rev.date, style: const TextStyle(fontSize: 9.5, color: AppColors.textMuted)),
                ],
              ),
            );
          }),
        ],
      ),
    );
  }

  Widget _buildContactAction({
    required IconData icon,
    required String title,
    required String subtitle,
    required Color color,
    required VoidCallback onTap,
  }) {
    return Expanded(
      child: GestureDetector(
        onTap: onTap,
        child: Container(
          padding: const EdgeInsets.symmetric(vertical: 10, horizontal: 8),
          decoration: BoxDecoration(
            color: Colors.white,
            borderRadius: BorderRadius.circular(16),
            border: Border.all(color: AppColors.cardBorder, width: 1.0),
            boxShadow: [
              BoxShadow(
                color: const Color(0xFF1C1917).withValues(alpha: 0.02),
                blurRadius: 6,
                offset: const Offset(0, 2),
              ),
            ],
          ),
          child: Column(
            children: [
              Icon(icon, color: color, size: 20),
              const SizedBox(height: 4),
              Text(
                title,
                style: const TextStyle(
                  fontSize: 11,
                  fontWeight: FontWeight.w800,
                  color: AppColors.textMain,
                ),
                maxLines: 1,
                overflow: TextOverflow.ellipsis,
              ),
              Text(
                subtitle,
                style: const TextStyle(
                  fontSize: 9,
                  color: AppColors.textSecondary,
                ),
                maxLines: 1,
                overflow: TextOverflow.ellipsis,
              ),
            ],
          ),
        ),
      ),
    );
  }

  Widget _buildRatingBar(String label, double ratio, String percent) {
    return Padding(
      padding: const EdgeInsets.symmetric(vertical: 3),
      child: Row(
        children: [
          SizedBox(width: 44, child: Text(label, style: const TextStyle(fontSize: 11, color: AppColors.textSecondary))),
          Expanded(
            child: ClipRRect(
              borderRadius: BorderRadius.circular(4),
              child: LinearProgressIndicator(
                value: ratio,
                minHeight: 5,
                backgroundColor: const Color(0xFFF5EFEB),
                color: AppColors.primary,
              ),
            ),
          ),
          const SizedBox(width: 10),
          SizedBox(width: 28, child: Text(percent, style: const TextStyle(fontSize: 10, fontWeight: FontWeight.bold))),
        ],
      ),
    );
  }
}
