// 60 Authentic Food Items with Local Image Assets for Spice Garden
class FoodItem {
  final String id;
  final String? backendId;
  final String name;
  final String category;
  final double price;
  final double originalPrice;
  final String description;
  final String imagePath;
  final bool isVeg;
  final bool isSpicy;
  final double rating;
  final String reviews;
  final String prepTime;

  const FoodItem({
    required this.id,
    this.backendId,
    required this.name,
    required this.category,
    required this.price,
    required this.originalPrice,
    required this.description,
    required this.imagePath,
    required this.isVeg,
    required this.isSpicy,
    required this.rating,
    required this.reviews,
    required this.prepTime,
  });

  FoodItem copyWith({
    String? id,
    String? backendId,
    String? name,
    String? category,
    double? price,
    double? originalPrice,
    String? description,
    String? imagePath,
    bool? isVeg,
    bool? isSpicy,
    double? rating,
    String? reviews,
    String? prepTime,
  }) {
    return FoodItem(
      id: id ?? this.id,
      backendId: backendId ?? this.backendId,
      name: name ?? this.name,
      category: category ?? this.category,
      price: price ?? this.price,
      originalPrice: originalPrice ?? this.originalPrice,
      description: description ?? this.description,
      imagePath: imagePath ?? this.imagePath,
      isVeg: isVeg ?? this.isVeg,
      isSpicy: isSpicy ?? this.isSpicy,
      rating: rating ?? this.rating,
      reviews: reviews ?? this.reviews,
      prepTime: prepTime ?? this.prepTime,
    );
  }

  factory FoodItem.fromBackendJson(Map<String, dynamic> json) {
    final name = (json['name'] ?? '').toString();
    FoodItem? localMatch;
    for (final f in allFoodItems) {
      if (f.name.toLowerCase().trim() == name.toLowerCase().trim()) {
        localMatch = f;
        break;
      }
    }

    final double priceVal = (json['price'] as num?)?.toDouble() ?? 250.0;
    final double origPrice = localMatch != null ? localMatch.originalPrice : (priceVal * 1.25);

    return FoodItem(
      id: (json['_id'] ?? json['id'] ?? '').toString(),
      backendId: (json['_id'] ?? '').toString(),
      name: name,
      category: (json['category'] ?? (localMatch?.category ?? 'Main Course')).toString(),
      price: priceVal,
      originalPrice: origPrice,
      description: (json['description'] ?? (localMatch?.description ?? '')).toString(),
      imagePath: localMatch != null ? localMatch.imagePath : (json['image'] ?? 'assets/images/foods/chicken-biryani.jpg').toString(),
      isVeg: json['isVeg'] == true,
      isSpicy: json['spiceLevel'] == 'Spicy' || json['spiceLevel'] == 'Extra Spicy' || (localMatch?.isSpicy ?? false),
      rating: (json['rating'] as num?)?.toDouble() ?? (localMatch?.rating ?? 4.7),
      reviews: localMatch?.reviews ?? '120+',
      prepTime: localMatch?.prepTime ?? '20 mins',
    );
  }
}

const List<FoodItem> allFoodItems = [
  FoodItem(
    id: '1',
    name: "Chicken Ghee Roast",
    category: "Starters",
    price: 340.0,
    originalPrice: 430.0,
    description: "Legendary Mangalorean delicacy cooked in pure clarified ghee with fiery red Byadgi chillies and whole spices.",
    imagePath: "assets/images/foods/chicken-ghee-roast.jpg",
    isVeg: false,
    isSpicy: true,
    rating: 4.9,
    reviews: '2171',
    prepTime: '15 mins',
  ),
  FoodItem(
    id: '2',
    name: "Paneer Tikka Angara",
    category: "Starters",
    price: 260.0,
    originalPrice: 330.0,
    description: "Cubes of fresh cottage cheese marinated in hung curd, Kashmiri paprika, and smoked to perfection in clay oven.",
    imagePath: "assets/images/foods/paneer-tikka-angara.jpg",
    isVeg: true,
    isSpicy: false,
    rating: 4.8,
    reviews: '2231',
    prepTime: '20 mins',
  ),
  FoodItem(
    id: '3',
    name: "Crispy Corn Pepper Salt",
    category: "Starters",
    price: 210.0,
    originalPrice: 260.0,
    description: "Golden sweet corn kernels tossed with crushed black peppercorns, scallions, garlic, and fresh green chillies.",
    imagePath: "assets/images/foods/crispy-corn-pepper-salt.jpg",
    isVeg: true,
    isSpicy: false,
    rating: 4.5,
    reviews: '2386',
    prepTime: '25 mins',
  ),
  FoodItem(
    id: '4',
    name: "Tandoori Murgh (Half)",
    category: "Starters",
    price: 280.0,
    originalPrice: 350.0,
    description: "Classic spring chicken tenderized in aromatic mustard oil and roasted over charcoal in an earthen tandoor.",
    imagePath: "assets/images/foods/tandoori-murgh-half.jpg",
    isVeg: false,
    isSpicy: false,
    rating: 4.7,
    reviews: '850',
    prepTime: '30 mins',
  ),
  FoodItem(
    id: '5',
    name: "Hara Bhara Kebab",
    category: "Starters",
    price: 220.0,
    originalPrice: 280.0,
    description: "Crispy pan-seared patties of spinach, green peas, mashed potatoes, and roasted gram flour filled with cashew.",
    imagePath: "assets/images/foods/hara-bhara-kebab.jpg",
    isVeg: true,
    isSpicy: false,
    rating: 4.6,
    reviews: '1955',
    prepTime: '15 mins',
  ),
  FoodItem(
    id: '6',
    name: "Mutton Galouti Kebab",
    category: "Starters",
    price: 380.0,
    originalPrice: 480.0,
    description: "Melt-in-mouth royal Lucknowi minced lamb kebabs infused with 24 aromatic pot spices and smoked with cloves.",
    imagePath: "assets/images/foods/mutton-galouti-kebab.jpg",
    isVeg: false,
    isSpicy: false,
    rating: 4.9,
    reviews: '2278',
    prepTime: '20 mins',
  ),
  FoodItem(
    id: '7',
    name: "Dahi Ke Kebab",
    category: "Starters",
    price: 240.0,
    originalPrice: 300.0,
    description: "Silky hung yogurt patties stuffed with chopped bell peppers, fresh coriander, and mint, pan-fried to crisp perfection.",
    imagePath: "assets/images/foods/dahi-ke-kebab.jpg",
    isVeg: true,
    isSpicy: false,
    rating: 4.7,
    reviews: '493',
    prepTime: '25 mins',
  ),
  FoodItem(
    id: '8',
    name: "Fish Amritsari Fry",
    category: "Starters",
    price: 360.0,
    originalPrice: 450.0,
    description: "Crispy boneless sole fish fillets coated in carom seed (ajwain) spiced gram flour batter and deep fried to golden crunch.",
    imagePath: "assets/images/foods/fish-amritsari-fry.jpg",
    isVeg: false,
    isSpicy: true,
    rating: 4.8,
    reviews: '2189',
    prepTime: '30 mins',
  ),
  FoodItem(
    id: '9',
    name: "Tandoori Malai Broccoli",
    category: "Starters",
    price: 270.0,
    originalPrice: 340.0,
    description: "Tender broccoli florets marinated in cardamom cream, melted cheese, and hung curd, gently chargrilled.",
    imagePath: "assets/images/foods/tandoori-malai-broccoli.jpg",
    isVeg: true,
    isSpicy: false,
    rating: 4.6,
    reviews: '1388',
    prepTime: '15 mins',
  ),
  FoodItem(
    id: '10',
    name: "Chicken 65 Bangalore Style",
    category: "Starters",
    price: 290.0,
    originalPrice: 360.0,
    description: "Crisp chicken bites tossed with tempered curry leaves, slit green chillies, crushed garlic, and tangy curd masala.",
    imagePath: "assets/images/foods/chicken-65-bangalore-style.jpg",
    isVeg: false,
    isSpicy: true,
    rating: 4.8,
    reviews: '1783',
    prepTime: '20 mins',
  ),
  FoodItem(
    id: '11',
    name: "Mushroom Kurkure",
    category: "Starters",
    price: 230.0,
    originalPrice: 290.0,
    description: "Whole button mushrooms stuffed with spiced cheese, herb mix, coated in crunchy papad crumb and crisp fried.",
    imagePath: "assets/images/foods/mushroom-kurkure.jpg",
    isVeg: true,
    isSpicy: false,
    rating: 4.6,
    reviews: '412',
    prepTime: '25 mins',
  ),
  FoodItem(
    id: '12',
    name: "Old Delhi Butter Chicken",
    category: "Main Course",
    price: 360.0,
    originalPrice: 450.0,
    description: "Smoked tandoori chicken cooked in a velvety, buttery tomato gravy infused with dried fenugreek leaves (kasoori methi).",
    imagePath: "assets/images/foods/old-delhi-butter-chicken.jpg",
    isVeg: false,
    isSpicy: false,
    rating: 4.9,
    reviews: '1666',
    prepTime: '30 mins',
  ),
  FoodItem(
    id: '13',
    name: "Paneer Butter Masala",
    category: "Main Course",
    price: 310.0,
    originalPrice: 390.0,
    description: "Soft cottage cheese simmered in a luscious cashew-onion-tomato makhani gravy enriched with butter and cream.",
    imagePath: "assets/images/foods/paneer-butter-masala.jpg",
    isVeg: true,
    isSpicy: false,
    rating: 4.8,
    reviews: '2237',
    prepTime: '15 mins',
  ),
  FoodItem(
    id: '14',
    name: "Bangalore Mutton Sukka Curry",
    category: "Main Course",
    price: 420.0,
    originalPrice: 530.0,
    description: "Tender lamb chunks slow-cooked with fresh roasted coconut paste, curry leaves, and regional Bangalore spices.",
    imagePath: "assets/images/foods/bangalore-mutton-sukka-curry.jpg",
    isVeg: false,
    isSpicy: true,
    rating: 4.9,
    reviews: '400',
    prepTime: '20 mins',
  ),
  FoodItem(
    id: '15',
    name: "Dal Makhani Royal",
    category: "Main Course",
    price: 250.0,
    originalPrice: 310.0,
    description: "Overnight slow-cooked black lentils and kidney beans enriched with white butter, cream, and subtle smoky aroma.",
    imagePath: "assets/images/foods/dal-makhani-royal.jpg",
    isVeg: true,
    isSpicy: false,
    rating: 4.7,
    reviews: '2045',
    prepTime: '25 mins',
  ),
  FoodItem(
    id: '16',
    name: "Butter Garlic Naan (2 pcs)",
    category: "Main Course",
    price: 90.0,
    originalPrice: 110.0,
    description: "Leavened soft flatbread baked on tandoor walls, generously brushed with salted butter and minced fresh garlic.",
    imagePath: "assets/images/foods/butter-garlic-naan-2-pcs.jpg",
    isVeg: true,
    isSpicy: false,
    rating: 4.8,
    reviews: '1211',
    prepTime: '30 mins',
  ),
  FoodItem(
    id: '17',
    name: "Kadhai Paneer Dhaba Style",
    category: "Main Course",
    price: 290.0,
    originalPrice: 360.0,
    description: "Cottage cheese cubes and crunchy bell peppers tossed in an iron wok with freshly pounded coriander seeds and red chillies.",
    imagePath: "assets/images/foods/kadhai-paneer-dhaba-style.jpg",
    isVeg: true,
    isSpicy: true,
    rating: 4.7,
    reviews: '2365',
    prepTime: '15 mins',
  ),
  FoodItem(
    id: '18',
    name: "Chicken Tikka Masala",
    category: "Main Course",
    price: 350.0,
    originalPrice: 440.0,
    description: "Charcoal-grilled juicy boneless chicken tikka simmered in a robust, spiced tomato-onion and cream gravy.",
    imagePath: "assets/images/foods/chicken-tikka-masala.jpg",
    isVeg: false,
    isSpicy: false,
    rating: 4.9,
    reviews: '1570',
    prepTime: '20 mins',
  ),
  FoodItem(
    id: '19',
    name: "Malai Kofta Imperial",
    category: "Main Course",
    price: 310.0,
    originalPrice: 390.0,
    description: "Velvety cottage cheese and dry fruit dumplings swimming in a smooth cashew-saffron reduction with rose water hints.",
    imagePath: "assets/images/foods/malai-kofta-imperial.jpg",
    isVeg: true,
    isSpicy: false,
    rating: 4.8,
    reviews: '1148',
    prepTime: '25 mins',
  ),
  FoodItem(
    id: '20',
    name: "Mutton Rogan Josh",
    category: "Main Course",
    price: 430.0,
    originalPrice: 540.0,
    description: "Authentic Kashmiri braised lamb simmered in gravy flavored with aromatic shallots, fennel seeds, ginger, and Kashmiri chillies.",
    imagePath: "assets/images/foods/mutton-rogan-josh.jpg",
    isVeg: false,
    isSpicy: false,
    rating: 4.9,
    reviews: '978',
    prepTime: '30 mins',
  ),
  FoodItem(
    id: '21',
    name: "Yellow Dal Tadka Double Chaunk",
    category: "Main Course",
    price: 210.0,
    originalPrice: 260.0,
    description: "Home-style yellow toor lentils tempered twice with clarified desi ghee, hing, cumin seeds, garlic, and dry Kashmiri chillies.",
    imagePath: "assets/images/foods/yellow-dal-tadka-double-chaunk.jpg",
    isVeg: true,
    isSpicy: false,
    rating: 4.6,
    reviews: '570',
    prepTime: '15 mins',
  ),
  FoodItem(
    id: '22',
    name: "Palak Paneer Lahsuni",
    category: "Main Course",
    price: 280.0,
    originalPrice: 350.0,
    description: "Fresh organic spinach purée simmered with tender paneer cubes and finished with golden crispy garlic flakes.",
    imagePath: "assets/images/foods/palak-paneer-lahsuni.jpg",
    isVeg: true,
    isSpicy: false,
    rating: 4.7,
    reviews: '2036',
    prepTime: '20 mins',
  ),
  FoodItem(
    id: '23',
    name: "Amritsari Kulcha with Chole",
    category: "Main Course",
    price: 240.0,
    originalPrice: 300.0,
    description: "Spiced potato and paneer stuffed crusty tandoor flatbread served with slow-simmered Punjabi pindi chole and pickle.",
    imagePath: "assets/images/foods/amritsari-kulcha-with-chole.jpg",
    isVeg: true,
    isSpicy: false,
    rating: 4.8,
    reviews: '508',
    prepTime: '25 mins',
  ),
  FoodItem(
    id: '24',
    name: "Hyderabadi Dum Chicken Biryani",
    category: "Biryani",
    price: 320.0,
    originalPrice: 400.0,
    description: "Fragrant long-grain aged Basmati rice layered with spiced marinated chicken, saffron milk, fried onions, and fresh mint.",
    imagePath: "assets/images/foods/hyderabadi-dum-chicken-biryani.jpg",
    isVeg: false,
    isSpicy: false,
    rating: 4.9,
    reviews: '1187',
    prepTime: '30 mins',
  ),
  FoodItem(
    id: '25',
    name: "Royal Mutton Dum Biryani",
    category: "Biryani",
    price: 410.0,
    originalPrice: 510.0,
    description: "Tender baby lamb cuts cooked in traditional earthenware handi with Basmati rice, kewra water, and whole pot spices.",
    imagePath: "assets/images/foods/royal-mutton-dum-biryani.jpg",
    isVeg: false,
    isSpicy: false,
    rating: 4.9,
    reviews: '652',
    prepTime: '15 mins',
  ),
  FoodItem(
    id: '26',
    name: "Lucknowi Paneer & Veg Biryani",
    category: "Biryani",
    price: 250.0,
    originalPrice: 310.0,
    description: "Garden fresh vegetables, paneer cubes, and saffron rice cooked in Awadhi dum style served with cool cucumber raita.",
    imagePath: "assets/images/foods/lucknowi-paneer-veg-biryani.jpg",
    isVeg: true,
    isSpicy: false,
    rating: 4.6,
    reviews: '910',
    prepTime: '20 mins',
  ),
  FoodItem(
    id: '27',
    name: "Egg Dum Biryani",
    category: "Biryani",
    price: 260.0,
    originalPrice: 330.0,
    description: "Golden fried boiled eggs nestled in layered spicy biryani rice with caramelized shallots and mint leaves.",
    imagePath: "assets/images/foods/egg-dum-biryani.jpg",
    isVeg: false,
    isSpicy: false,
    rating: 4.5,
    reviews: '1944',
    prepTime: '25 mins',
  ),
  FoodItem(
    id: '28',
    name: "Kolkata Chicken Biryani with Potato & Egg",
    category: "Biryani",
    price: 330.0,
    originalPrice: 410.0,
    description: "Aromatic light Basmati rice subtly flavored with meetha attar and saffron, accompanied by soft spiced potato and boiled egg.",
    imagePath: "assets/images/foods/kolkata-chicken-biryani-with-potato-egg.jpg",
    isVeg: false,
    isSpicy: false,
    rating: 4.8,
    reviews: '1762',
    prepTime: '30 mins',
  ),
  FoodItem(
    id: '29',
    name: "Ambur Star Mutton Biryani",
    category: "Biryani",
    price: 420.0,
    originalPrice: 530.0,
    description: "Traditional Tamil-Karnataka style biryani cooked with fragrant Seeraga Samba short rice, tender lamb, and curd masala.",
    imagePath: "assets/images/foods/ambur-star-mutton-biryani.jpg",
    isVeg: false,
    isSpicy: true,
    rating: 4.9,
    reviews: '1734',
    prepTime: '15 mins',
  ),
  FoodItem(
    id: '30',
    name: "Chettinad Chicken Biryani",
    category: "Biryani",
    price: 340.0,
    originalPrice: 430.0,
    description: "Fiery South Indian biryani infused with star anise, stone flower (kalpasi), black pepper, and bone-in countryside chicken.",
    imagePath: "assets/images/foods/chettinad-chicken-biryani.jpg",
    isVeg: false,
    isSpicy: true,
    rating: 4.8,
    reviews: '531',
    prepTime: '20 mins',
  ),
  FoodItem(
    id: '31',
    name: "Mushroom & Green Peas Dum Biryani",
    category: "Biryani",
    price: 260.0,
    originalPrice: 330.0,
    description: "Button mushrooms and fresh sweet peas cooked with caramelized onions, aromatic mint, and basmati rice.",
    imagePath: "assets/images/foods/mushroom-green-peas-dum-biryani.jpg",
    isVeg: true,
    isSpicy: false,
    rating: 4.6,
    reviews: '921',
    prepTime: '25 mins',
  ),
  FoodItem(
    id: '32',
    name: "Tawa Chicken Tikka Biryani",
    category: "Biryani",
    price: 310.0,
    originalPrice: 390.0,
    description: "Street-style spicy tawa-tossed Basmati rice with shredded tandoori tikka, fresh lime juice, and chaat masala.",
    imagePath: "assets/images/foods/tawa-chicken-tikka-biryani.jpg",
    isVeg: false,
    isSpicy: true,
    rating: 4.7,
    reviews: '1719',
    prepTime: '30 mins',
  ),
  FoodItem(
    id: '33',
    name: "Saffron Jeera Rice with Dal Makhani",
    category: "Biryani",
    price: 240.0,
    originalPrice: 300.0,
    description: "Aromatic aged Basmati rice tossed with roasted cumin seeds and desi ghee, paired with slow-simmered rich black dal.",
    imagePath: "assets/images/foods/saffron-jeera-rice-with-dal-makhani.jpg",
    isVeg: true,
    isSpicy: false,
    rating: 4.7,
    reviews: '1635',
    prepTime: '15 mins',
  ),
  FoodItem(
    id: '34',
    name: "Dragon Chicken Bangalore Style",
    category: "Chinese",
    price: 310.0,
    originalPrice: 390.0,
    description: "Crispy fried chicken strips tossed with cashew nuts, dried red chillies, dark soya sauce, and sweet chilli glaze.",
    imagePath: "assets/images/foods/dragon-chicken-bangalore-style.jpg",
    isVeg: false,
    isSpicy: true,
    rating: 4.8,
    reviews: '937',
    prepTime: '20 mins',
  ),
  FoodItem(
    id: '35',
    name: "Gobi Manchurian Dry",
    category: "Chinese",
    price: 210.0,
    originalPrice: 260.0,
    description: "Bangalore street classic: batter-fried cauliflower florets wok-tossed with ginger, garlic, green chillies, and cilantro.",
    imagePath: "assets/images/foods/gobi-manchurian-dry.jpg",
    isVeg: true,
    isSpicy: false,
    rating: 4.7,
    reviews: '1060',
    prepTime: '25 mins',
  ),
  FoodItem(
    id: '36',
    name: "Chilli Garlic Veg Hakka Noodles",
    category: "Chinese",
    price: 230.0,
    originalPrice: 290.0,
    description: "Thin wheat noodles wok-tossed on high flame with shredded bell peppers, cabbage, burnt garlic, and spicy scallion oil.",
    imagePath: "assets/images/foods/chilli-garlic-veg-hakka-noodles.jpg",
    isVeg: true,
    isSpicy: false,
    rating: 4.6,
    reviews: '1223',
    prepTime: '30 mins',
  ),
  FoodItem(
    id: '37',
    name: "Schezwan Chicken Fried Rice",
    category: "Chinese",
    price: 260.0,
    originalPrice: 330.0,
    description: "Aromatic jasmine rice tossed in house-made fiery Sichuan pepper paste with diced tender chicken, eggs, and spring onion.",
    imagePath: "assets/images/foods/schezwan-chicken-fried-rice.jpg",
    isVeg: false,
    isSpicy: true,
    rating: 4.7,
    reviews: '538',
    prepTime: '15 mins',
  ),
  FoodItem(
    id: '38',
    name: "Chilli Paneer Gravy",
    category: "Chinese",
    price: 250.0,
    originalPrice: 310.0,
    description: "Crisp-coated cottage cheese cubes simmered in a dark soya, green chilli, and garlic gravy with bell pepper chunks.",
    imagePath: "assets/images/foods/chilli-paneer-gravy.jpg",
    isVeg: true,
    isSpicy: true,
    rating: 4.7,
    reviews: '1783',
    prepTime: '20 mins',
  ),
  FoodItem(
    id: '39',
    name: "Chicken Manchurian Gravy",
    category: "Chinese",
    price: 280.0,
    originalPrice: 350.0,
    description: "Minced spiced chicken meatballs braised in a savory ginger, garlic, coriander stem, and soya broth.",
    imagePath: "assets/images/foods/chicken-manchurian-gravy.jpg",
    isVeg: false,
    isSpicy: false,
    rating: 4.8,
    reviews: '551',
    prepTime: '25 mins',
  ),
  FoodItem(
    id: '40',
    name: "Veg Triple Schezwan Fried Rice",
    category: "Chinese",
    price: 260.0,
    originalPrice: 330.0,
    description: "Wholesome platter of fiery Schezwan fried rice, crisp fried noodles, and hot Schezwan vegetable gravy.",
    imagePath: "assets/images/foods/veg-triple-schezwan-fried-rice.jpg",
    isVeg: true,
    isSpicy: true,
    rating: 4.7,
    reviews: '1886',
    prepTime: '30 mins',
  ),
  FoodItem(
    id: '41',
    name: "Crispy Honey Chilli Potatoes",
    category: "Chinese",
    price: 200.0,
    originalPrice: 250.0,
    description: "Double-fried potato batons tossed in a sweet-and-spicy honey chilli sauce, garnished with toasted white sesame seeds.",
    imagePath: "assets/images/foods/crispy-honey-chilli-potatoes.jpg",
    isVeg: true,
    isSpicy: false,
    rating: 4.6,
    reviews: '709',
    prepTime: '15 mins',
  ),
  FoodItem(
    id: '42',
    name: "Chicken Hakka Noodles Special",
    category: "Chinese",
    price: 260.0,
    originalPrice: 330.0,
    description: "Street-style wok-tossed noodles with chicken shreds, fried egg ribbons, crunchy carrots, and light soya vinegar dressing.",
    imagePath: "assets/images/foods/chicken-hakka-noodles-special.jpg",
    isVeg: false,
    isSpicy: false,
    rating: 4.8,
    reviews: '944',
    prepTime: '20 mins',
  ),
  FoodItem(
    id: '43',
    name: "Crispy Veg Spring Rolls (6 Pcs)",
    category: "Chinese",
    price: 210.0,
    originalPrice: 260.0,
    description: "Delicate pastry sheets hand-rolled with julienned Asian vegetables and glass noodles, served with sweet chilli dip.",
    imagePath: "assets/images/foods/crispy-veg-spring-rolls-6-pcs.jpg",
    isVeg: true,
    isSpicy: false,
    rating: 4.5,
    reviews: '2123',
    prepTime: '25 mins',
  ),
  FoodItem(
    id: '44',
    name: "Gulab Jamun with Shahi Rabdi",
    category: "Desserts",
    price: 150.0,
    originalPrice: 190.0,
    description: "Warm, soft mawa dumplings soaked in cardamom sugar syrup, served over a bed of chilled reduced saffron milk.",
    imagePath: "assets/images/foods/gulab-jamun-with-shahi-rabdi.jpg",
    isVeg: true,
    isSpicy: false,
    rating: 4.9,
    reviews: '1848',
    prepTime: '30 mins',
  ),
  FoodItem(
    id: '45',
    name: "Kesari Rasmalai (2 Pcs)",
    category: "Desserts",
    price: 160.0,
    originalPrice: 200.0,
    description: "Delicate cottage cheese patties steeped in creamy saffron and pistachio-infused whole milk.",
    imagePath: "assets/images/foods/kesari-rasmalai-2-pcs.jpg",
    isVeg: true,
    isSpicy: false,
    rating: 4.8,
    reviews: '687',
    prepTime: '15 mins',
  ),
  FoodItem(
    id: '46',
    name: "Gajar Ka Halwa Pure Desi Ghee",
    category: "Desserts",
    price: 150.0,
    originalPrice: 190.0,
    description: "Slow-simmered winter red carrots with khoya, crushed almonds, pistachios, and pure cow ghee.",
    imagePath: "assets/images/foods/gajar-ka-halwa-pure-desi-ghee.jpg",
    isVeg: true,
    isSpicy: false,
    rating: 4.7,
    reviews: '536',
    prepTime: '20 mins',
  ),
  FoodItem(
    id: '47',
    name: "Shahi Tukda Royal Oudh",
    category: "Desserts",
    price: 160.0,
    originalPrice: 200.0,
    description: "Crisp ghee-fried bread triangles dipped in saffron syrup, coated with condensed rabdi, silver varq, and pistachios.",
    imagePath: "assets/images/foods/shahi-tukda-royal-oudh.jpg",
    isVeg: true,
    isSpicy: false,
    rating: 4.8,
    reviews: '1851',
    prepTime: '25 mins',
  ),
  FoodItem(
    id: '48',
    name: "Moong Dal Halwa Desi Ghee",
    category: "Desserts",
    price: 170.0,
    originalPrice: 210.0,
    description: "Rich, golden yellow split green gram pudding slow-roasted in pure cow ghee and fragrant green cardamom.",
    imagePath: "assets/images/foods/moong-dal-halwa-desi-ghee.jpg",
    isVeg: true,
    isSpicy: false,
    rating: 4.9,
    reviews: '1364',
    prepTime: '30 mins',
  ),
  FoodItem(
    id: '49',
    name: "Kulfi Falooda Delight",
    category: "Desserts",
    price: 150.0,
    originalPrice: 190.0,
    description: "Authentic malai kulfi slices topped with sweet basil seeds, cornstarch vermicelli, and pure rose water syrup.",
    imagePath: "assets/images/foods/kulfi-falooda-delight.jpg",
    isVeg: true,
    isSpicy: false,
    rating: 4.8,
    reviews: '1602',
    prepTime: '15 mins',
  ),
  FoodItem(
    id: '50',
    name: "Matka Phirni Chilled",
    category: "Desserts",
    price: 130.0,
    originalPrice: 160.0,
    description: "Creamy ground basmati rice pudding slow-simmered in milk, set in an earthenware matka and chilled with slivered nuts.",
    imagePath: "assets/images/foods/matka-phirni-chilled.jpg",
    isVeg: true,
    isSpicy: false,
    rating: 4.7,
    reviews: '2175',
    prepTime: '20 mins',
  ),
  FoodItem(
    id: '51',
    name: "Hot Chocolate Brownie with Fudge",
    category: "Desserts",
    price: 180.0,
    originalPrice: 230.0,
    description: "Warm walnut chocolate brownie smothered with hot dark chocolate ganache and chocolate chips.",
    imagePath: "assets/images/foods/hot-chocolate-brownie-with-fudge.jpg",
    isVeg: true,
    isSpicy: false,
    rating: 4.8,
    reviews: '2156',
    prepTime: '25 mins',
  ),
  FoodItem(
    id: '52',
    name: "Bangalore Degree Filter Coffee",
    category: "Beverages",
    price: 70.0,
    originalPrice: 90.0,
    description: "Traditional decoction brewed with freshly roasted Chikmagalur coffee beans, frothed with hot rich milk in brass dabarah.",
    imagePath: "assets/images/foods/bangalore-degree-filter-coffee.jpg",
    isVeg: true,
    isSpicy: false,
    rating: 4.9,
    reviews: '1540',
    prepTime: '30 mins',
  ),
  FoodItem(
    id: '53',
    name: "Alphonso Mango Malai Lassi",
    category: "Beverages",
    price: 120.0,
    originalPrice: 150.0,
    description: "Thick, creamy churned curd blended with Ratnagiri Alphonso mango pulp and topped with saffron strands and pistachios.",
    imagePath: "assets/images/foods/alphonso-mango-malai-lassi.jpg",
    isVeg: true,
    isSpicy: false,
    rating: 4.8,
    reviews: '1197',
    prepTime: '15 mins',
  ),
  FoodItem(
    id: '54',
    name: "Fresh Nimbu Soda (Sweet & Salt)",
    category: "Beverages",
    price: 80.0,
    originalPrice: 100.0,
    description: "Freshly squeezed Indian lemon juice with crushed ice and sparkling soda, balanced with rock salt and mint.",
    imagePath: "assets/images/foods/fresh-nimbu-soda-sweet-salt.jpg",
    isVeg: true,
    isSpicy: false,
    rating: 4.5,
    reviews: '1762',
    prepTime: '20 mins',
  ),
  FoodItem(
    id: '55',
    name: "Masala Chai Cutting Kulhad",
    category: "Beverages",
    price: 60.0,
    originalPrice: 80.0,
    description: "Strong, fragrant roadside tea brewed with freshly crushed ginger, green cardamom, cinnamon, and cloves in earthen kulhad.",
    imagePath: "assets/images/foods/masala-chai-cutting-kulhad.jpg",
    isVeg: true,
    isSpicy: false,
    rating: 4.9,
    reviews: '592',
    prepTime: '25 mins',
  ),
  FoodItem(
    id: '56',
    name: "Classic Sweet Punjabi Lassi",
    category: "Beverages",
    price: 100.0,
    originalPrice: 130.0,
    description: "Thick churned creamy curd served in a tall glass topped with a rich layer of fresh malai and crushed almonds.",
    imagePath: "assets/images/foods/classic-sweet-punjabi-lassi.jpg",
    isVeg: true,
    isSpicy: false,
    rating: 4.8,
    reviews: '433',
    prepTime: '30 mins',
  ),
  FoodItem(
    id: '57',
    name: "Spiced Butter Milk (Masala Chaas)",
    category: "Beverages",
    price: 60.0,
    originalPrice: 80.0,
    description: "Cool refreshing buttermilk tempered with ginger, green chillies, fresh coriander, curry leaves, and roasted cumin.",
    imagePath: "assets/images/foods/spiced-butter-milk-masala-chaas.jpg",
    isVeg: true,
    isSpicy: false,
    rating: 4.7,
    reviews: '2127',
    prepTime: '15 mins',
  ),
  FoodItem(
    id: '58',
    name: "Cold Badam Milk with Kesar",
    category: "Beverages",
    price: 110.0,
    originalPrice: 140.0,
    description: "Chilled rich dairy milk blended with California almond paste, Kashmiri saffron strands, and crushed pistachios.",
    imagePath: "assets/images/foods/cold-badam-milk-with-kesar.jpg",
    isVeg: true,
    isSpicy: false,
    rating: 4.8,
    reviews: '1790',
    prepTime: '20 mins',
  ),
  FoodItem(
    id: '59',
    name: "Virgin Mojito Cooler",
    category: "Beverages",
    price: 110.0,
    originalPrice: 140.0,
    description: "Zesty lime wedges and garden-fresh mint leaves muddled with cane sugar, crushed ice, and sparkling lemon soda.",
    imagePath: "assets/images/foods/virgin-mojito-cooler.jpg",
    isVeg: true,
    isSpicy: false,
    rating: 4.6,
    reviews: '1271',
    prepTime: '25 mins',
  ),
  FoodItem(
    id: '60',
    name: "Kashmiri Kahwa Green Tea",
    category: "Beverages",
    price: 90.0,
    originalPrice: 110.0,
    description: "Exotic traditional green tea slow-simmered with whole saffron, green cardamom pods, cinnamon, and slivered almonds.",
    imagePath: "assets/images/foods/kashmiri-kahwa-green-tea.jpg",
    isVeg: true,
    isSpicy: false,
    rating: 4.7,
    reviews: '829',
    prepTime: '30 mins',
  ),
];

// ==========================================
// SMART SEARCH ALGORITHM (Exact + Relevant + Related Matches)
// ==========================================
List<FoodItem> searchFoodItems(List<FoodItem> items, String query, {bool fallbackToBestsellers = true}) {
  final rawQuery = query.trim().toLowerCase();
  if (rawQuery.isEmpty) return [];

  final cleanQuery = rawQuery
      .replaceAll(RegExp(r'[^\w\s]'), ' ')
      .replaceAll(RegExp(r'\s+'), ' ')
      .trim();
  if (cleanQuery.isEmpty) return [];

  final tokens = cleanQuery.split(' ').where((t) => t.isNotEmpty).toList();
  if (tokens.isEmpty) return [];

  final isNonVegQuery = cleanQuery == 'non veg' ||
      cleanQuery == 'nonveg' ||
      cleanQuery == 'non vegetarian' ||
      cleanQuery == 'nonvegetarian';
  final isPureVegQuery = cleanQuery == 'veg' ||
      cleanQuery == 'vegetarian' ||
      cleanQuery == 'pure veg' ||
      cleanQuery == 'pure vegetarian';

  // Rich semantic concept & synonym dictionary
  const conceptMap = <String, List<String>>{
    // Breads
    'roti': ['naan', 'kulcha', 'bread', 'roti'],
    'naan': ['naan', 'kulcha', 'bread'],
    'kulcha': ['kulcha', 'naan', 'chole'],
    'bread': ['naan', 'kulcha'],
    'paratha': ['naan', 'kulcha'],
    'chapati': ['naan', 'kulcha'],

    // Rice & Biryani
    'biryani': ['biryani'],
    'biriyani': ['biryani'],
    'briyani': ['biryani'],
    'rice': ['biryani', 'fried rice', 'jeera rice', 'rice'],
    'pulao': ['biryani', 'jeera rice'],
    'dum': ['dum', 'biryani'],

    // Meats & Seafood
    'chicken': ['chicken', 'murgh'],
    'chiken': ['chicken', 'murgh'],
    'murgh': ['chicken', 'murgh'],
    'mutton': ['mutton', 'lamb', 'gosht', 'sukka', 'rogan josh'],
    'lamb': ['mutton', 'lamb', 'gosht'],
    'gosht': ['mutton', 'rogan josh'],
    'meat': ['mutton', 'chicken'],
    'fish': ['fish', 'amritsari'],
    'prawn': ['fish', 'coastal'],
    'prawns': ['fish', 'coastal'],
    'seafood': ['fish', 'ghee roast'],

    // Vegetarian proteins & vegetables
    'paneer': ['paneer'],
    'panir': ['paneer'],
    'cheese': ['paneer', 'cheese', 'broccoli'],
    'tofu': ['paneer'],
    'mushroom': ['mushroom'],
    'gobi': ['gobi', 'manchurian'],
    'cauliflower': ['gobi'],
    'aloo': ['potatoes', 'chilli potatoes', 'kulcha'],
    'potato': ['potatoes', 'chilli potatoes'],
    'corn': ['corn'],

    // Gravy & Curries
    'curry': ['curry', 'gravy', 'masala', 'makhani', 'kofta', 'rogan josh', 'tadka', 'palak', 'kadhai'],
    'gravy': ['gravy', 'curry', 'makhani', 'masala'],
    'dal': ['dal', 'lentil', 'tadka', 'makhani'],
    'dhal': ['dal', 'tadka'],
    'daal': ['dal', 'tadka'],
    'sabzi': ['paneer', 'dal', 'kofta'],
    'main': ['main course'],
    'dinner': ['biryani', 'main course', 'curry'],
    'lunch': ['biryani', 'main course', 'curry'],
    'meal': ['biryani', 'main course', 'curry'],
    'thali': ['biryani', 'main course', 'dal', 'naan'],

    // Starters & Snacks
    'starter': ['starters'],
    'starters': ['starters'],
    'snack': ['starters', 'chinese'],
    'snacks': ['starters', 'chinese'],
    'appetizer': ['starters'],
    'appetizers': ['starters'],
    'kebab': ['kebab', 'tikka'],
    'kabab': ['kebab', 'tikka'],
    'tikka': ['tikka', 'kebab'],
    'tandoori': ['tandoori', 'tikka', 'kebab'],
    'roast': ['ghee roast', 'roast', 'sukka'],
    'fried': ['fry', 'fried', 'crispy'],
    'crispy': ['crispy', 'kurkure', 'fry'],

    // Chinese & Asian
    'chinese': ['chinese', 'noodles', 'fried rice', 'manchurian'],
    'noodles': ['noodles', 'hakka'],
    'noodle': ['noodles', 'hakka'],
    'hakka': ['noodles', 'hakka'],
    'schezwan': ['schezwan'],
    'manchurian': ['manchurian'],
    'chilli': ['chilli'],
    'rolls': ['spring rolls'],
    'roll': ['spring rolls'],

    // Sweets & Desserts
    'sweet': ['desserts', 'sweet', 'halwa', 'jamun', 'rasmalai', 'kulfi', 'brownie', 'phirni'],
    'sweets': ['desserts', 'sweet', 'halwa', 'jamun', 'rasmalai', 'kulfi', 'brownie', 'phirni'],
    'dessert': ['desserts'],
    'desserts': ['desserts'],
    'mithai': ['desserts', 'halwa', 'jamun', 'rasmalai'],
    'halwa': ['halwa'],
    'jamun': ['gulab jamun'],
    'rasmalai': ['rasmalai'],
    'ice cream': ['kulfi', 'falooda', 'brownie', 'desserts'],
    'icecream': ['kulfi', 'falooda', 'brownie', 'desserts'],
    'kulfi': ['kulfi', 'falooda'],
    'brownie': ['brownie', 'chocolate'],
    'chocolate': ['brownie', 'fudge'],
    'cake': ['brownie', 'desserts'],
    'pastry': ['brownie', 'desserts'],

    // Drinks & Beverages
    'drink': ['beverages', 'lassi', 'coffee', 'chai', 'soda', 'mojito'],
    'drinks': ['beverages', 'lassi', 'coffee', 'chai', 'soda', 'mojito'],
    'beverage': ['beverages'],
    'beverages': ['beverages'],
    'coffee': ['coffee'],
    'tea': ['chai', 'tea', 'kahwa'],
    'chai': ['chai', 'tea'],
    'lassi': ['lassi'],
    'chaas': ['butter milk', 'chaas'],
    'buttermilk': ['butter milk', 'chaas'],
    'soda': ['nimbu soda'],
    'lemonade': ['nimbu soda'],
    'mojito': ['mojito', 'cooler'],
    'cooler': ['mojito', 'nimbu soda'],
    'badam': ['badam milk'],
    'milk': ['badam milk', 'butter milk', 'lassi'],
    'juice': ['nimbu soda', 'virgin mojito', 'mango'],

    // Fast food & Regional cross-matches
    'burger': ['chicken 65', 'spring rolls', 'crispy corn', 'mushroom kurkure'],
    'pizza': ['paneer tikka', 'butter garlic naan', 'crispy corn', 'chilli paneer'],
    'sandwich': ['spring rolls', 'paneer tikka', 'kebab'],
    'pasta': ['hakka noodles', 'schezwan noodles'],
    'dosa': ['chicken ghee roast', 'bangalore degree filter coffee', 'bangalore mutton sukka curry'],
    'idli': ['bangalore degree filter coffee', 'chicken ghee roast'],
    'south indian': ['chicken ghee roast', 'bangalore degree filter coffee', 'bangalore mutton sukka curry', 'chettinad chicken biryani'],
    'spicy': ['spicy', 'angara', 'sukka', 'schezwan', 'chilli', 'chettinad'],
    'hot': ['spicy', 'angara', 'schezwan', 'chilli'],
  };

  // Collect related target terms from concepts
  final relatedTerms = <String>{};
  for (final token in tokens) {
    if (conceptMap.containsKey(token)) {
      relatedTerms.addAll(conceptMap[token]!);
    }
  }
  if (conceptMap.containsKey(cleanQuery)) {
    relatedTerms.addAll(conceptMap[cleanQuery]!);
  }

  final scored = <MapEntry<FoodItem, int>>[];

  for (final dish in items) {
    final name = dish.name.toLowerCase();
    final category = dish.category.toLowerCase();
    final description = dish.description.toLowerCase();
    int score = 0;

    // 1. Dietary filter handling
    if (isNonVegQuery) {
      if (!dish.isVeg) {
        score += 100;
      } else {
        continue;
      }
    } else if (isPureVegQuery) {
      if (dish.isVeg) {
        score += 100;
      } else {
        continue;
      }
    }

    // 2. Direct exact whole-query matches (Highest Priority)
    if (name == cleanQuery) {
      score += 300;
    } else if (name.startsWith(cleanQuery)) {
      score += 200;
    } else if (name.contains(cleanQuery)) {
      score += 150;
    }

    // 3. Category whole match
    if (category == cleanQuery) {
      score += 120;
    } else if (category.contains(cleanQuery)) {
      score += 80;
    }

    // 4. Token matches in name, category, and description
    int tokenMatchesInName = 0;
    for (final token in tokens) {
      if (isNonVegQuery && token == 'veg') continue;

      if (name == token) {
        score += 100;
        tokenMatchesInName++;
      } else if (name.split(RegExp(r'\s+')).any((w) => w == token)) {
        score += 80;
        tokenMatchesInName++;
      } else if (name.contains(token)) {
        score += 45;
        tokenMatchesInName++;
      }

      if (category.contains(token)) {
        score += 35;
      }
      if (description.contains(token)) {
        score += 15;
      }

      // Prefix match for partial words (min 3 chars)
      if (token.length >= 3) {
        if (name.split(' ').any((w) => w.startsWith(token))) {
          score += 30;
        }
      }
    }

    // Multi-token name boost
    if (tokens.length > 1 && tokenMatchesInName == tokens.length) {
      score += 120;
    }

    // 5. Concept & Synonym matching
    for (final term in relatedTerms) {
      if (name.contains(term)) {
        score += 70;
      } else if (category.contains(term)) {
        score += 40;
      } else if (description.contains(term)) {
        score += 25;
      }
    }

    // 6. Spicy flag matches
    if ((tokens.contains('spicy') || tokens.contains('hot')) && dish.isSpicy) {
      score += 40;
    }

    if (score > 0) {
      scored.add(MapEntry(dish, score));
    }
  }

  // Sort by score descending, tie break with rating descending
  scored.sort((a, b) {
    final cmp = b.value.compareTo(a.value);
    if (cmp != 0) return cmp;
    return b.key.rating.compareTo(a.key.rating);
  });

  if (scored.isNotEmpty) {
    return scored.map((e) => e.key).toList();
  }

  // If no matches found and fallback is requested, return top-rated bestsellers
  if (fallbackToBestsellers) {
    final fallback = List<FoodItem>.from(items);
    fallback.sort((a, b) => b.rating.compareTo(a.rating));
    return fallback.take(6).toList();
  }

  return [];
}
