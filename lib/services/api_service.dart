import 'dart:async';
import 'dart:convert';
import 'package:http/http.dart' as http;
import 'package:shared_preferences/shared_preferences.dart';

class ApiService {
  static final ApiService _instance = ApiService._internal();
  factory ApiService() => _instance;
  ApiService._internal();

  static const String _keyBaseUrl = 'sg_api_base_url';
  static const String _keyToken = 'sg_auth_token';
  static const String _keyUser = 'sg_user_data';

  String? _cachedToken;
  Map<String, dynamic>? _cachedUser;
  String? _customBaseUrl;

  // Auto-detect best default URL based on target platform
  static String get defaultBaseUrl {
    // Permanent cloud backend on Render (works worldwide on 4G/5G/Wi-Fi)
    return 'https://spice-garden-app-q7bs.onrender.com/api';
  }

  // Pre-configured common URLs for easy 1-tap switching in UI
  static const List<String> commonUrls = [
    'https://spice-garden-app-q7bs.onrender.com/api', // Cloud Backend (Production - 24/7)
    'https://spicegarden-api.loca.lt/api',            // Public Tunnel (Local fallback)
    'http://192.168.0.129:5000/api',                  // Local Wi-Fi (Home network)
    'http://10.0.2.2:5000/api',                       // Android Emulator
    'http://localhost:5000/api',                      // Windows / Web / Mac
  ];

  String get baseUrl => _customBaseUrl ?? defaultBaseUrl;

  Future<void> init() async {
    final prefs = await SharedPreferences.getInstance();
    _customBaseUrl = prefs.getString(_keyBaseUrl);
    _cachedToken = prefs.getString(_keyToken);
    final userJson = prefs.getString(_keyUser);
    if (userJson != null) {
      try {
        _cachedUser = jsonDecode(userJson) as Map<String, dynamic>;
      } catch (_) {}
    }

    // Auto-detect and cache active working backend URL
    unawaited(getWorkingBaseUrl().then((_) {
      ensureAuthenticated();
      fetchFoods();
    }));
  }

  Future<void> setBaseUrl(String url) async {
    _customBaseUrl = url.trim().replaceAll(RegExp(r'/+$'), '');
    final prefs = await SharedPreferences.getInstance();
    await prefs.setString(_keyBaseUrl, _customBaseUrl!);
  }

  final Map<String, String> foodIdMap = {};

  String? resolveMongoId(String foodName) {
    return foodIdMap[foodName.toLowerCase().trim()];
  }

  String? get token => _cachedToken;
  Map<String, dynamic>? get currentUser => _cachedUser;
  bool get isAuthenticated => _cachedToken != null && _cachedToken!.isNotEmpty;

  Map<String, String> _headers({bool needsAuth = false}) {
    final headers = {
      'Content-Type': 'application/json',
      'Accept': 'application/json',
      'bypass-tunnel-reminder': 'true',
    };
    if (needsAuth && _cachedToken != null) {
      headers['Authorization'] = 'Bearer $_cachedToken';
    }
    return headers;
  }

  // ==========================================
  // 1. HEALTH CHECK & MULTI-HOST PROBE
  // ==========================================
  Future<bool> checkHealth([String? targetUrl]) async {
    try {
      final url = targetUrl ?? baseUrl;
      final uri = Uri.parse('$url/health');
      final res = await http.get(
        uri,
        headers: {'bypass-tunnel-reminder': 'true'},
      ).timeout(const Duration(milliseconds: 3000));
      if (res.statusCode == 200) {
        final body = jsonDecode(res.body);
        return body['status'] == 'online';
      }
      return false;
    } catch (_) {
      return false;
    }
  }

  Future<String> getWorkingBaseUrl() async {
    // 1. First prioritize primary Render cloud backend (shared by mobile and Vercel admin)
    const productionUrl = 'https://spice-garden-app-q7bs.onrender.com/api';
    if (await checkHealth(productionUrl)) {
      _customBaseUrl = productionUrl;
      final prefs = await SharedPreferences.getInstance();
      await prefs.setString(_keyBaseUrl, productionUrl);
      return productionUrl;
    }

    // 2. If current URL is already working, use it
    if (await checkHealth()) return baseUrl;

    // 3. Probe common fallback candidates
    for (final candidate in commonUrls) {
      if (candidate == baseUrl) continue;
      if (await checkHealth(candidate)) {
        _customBaseUrl = candidate;
        final prefs = await SharedPreferences.getInstance();
        await prefs.setString(_keyBaseUrl, candidate);
        return candidate;
      }
    }
    return baseUrl;
  }

  // ==========================================
  // 2. AUTHENTICATION
  // ==========================================
  Future<Map<String, dynamic>> login(String email, String password) async {
    try {
      final uri = Uri.parse('$baseUrl/auth/login');
      final res = await http
          .post(
            uri,
            headers: _headers(),
            body: jsonEncode({'email': email, 'password': password}),
          )
          .timeout(const Duration(seconds: 3));

      final data = jsonDecode(res.body);
      if (res.statusCode == 200 && data['success'] == true) {
        final token = data['data']['token'] as String;
        final user = data['data']['user'] as Map<String, dynamic>;
        await _saveAuth(token, user);
        return {'success': true, 'user': user, 'token': token};
      }
      return {'success': false, 'networkError': false, 'message': data['message'] ?? 'Login failed'};
    } catch (_) {
      return {'success': false, 'networkError': true, 'message': 'Backend server offline'};
    }
  }

  Future<Map<String, dynamic>> register({
    required String name,
    required String email,
    required String password,
    required String phone,
    String? street,
    String? area,
    String? pincode,
  }) async {
    try {
      final uri = Uri.parse('$baseUrl/auth/register');
      final addressObj = {
        'street': street ?? '100 Feet Road',
        'area': area ?? 'Indiranagar',
        'landmark': '',
        'city': 'Bangalore',
        'pincode': pincode ?? '560038',
      };
      final body = {
        'name': name,
        'email': email,
        'password': password,
        'phone': phone,
        'address': addressObj,
      };

      final res = await http
          .post(uri, headers: _headers(), body: jsonEncode(body))
          .timeout(const Duration(seconds: 3));

      final data = jsonDecode(res.body);
      if (res.statusCode == 201 && data['success'] == true) {
        final token = data['data']['token'] as String;
        final user = data['data']['user'] as Map<String, dynamic>;
        await _saveAuth(token, user);
        return {'success': true, 'user': user, 'token': token};
      }
      return {'success': false, 'networkError': false, 'message': data['message'] ?? 'Registration failed'};
    } catch (_) {
      return {'success': false, 'networkError': true, 'message': 'Backend server offline'};
    }
  }

  Future<void> _saveAuth(String token, Map<String, dynamic> user) async {
    _cachedToken = token;
    _cachedUser = user;
    final prefs = await SharedPreferences.getInstance();
    await prefs.setString(_keyToken, token);
    await prefs.setString(_keyUser, jsonEncode(user));
  }

  Future<void> logout() async {
    _cachedToken = null;
    _cachedUser = null;
    final prefs = await SharedPreferences.getInstance();
    await prefs.remove(_keyToken);
    await prefs.remove(_keyUser);
  }

  // ==========================================
  // 3. FOODS & CATEGORIES
  // ==========================================
  Future<List<Map<String, dynamic>>?> fetchFoods() async {
    try {
      final uri = Uri.parse('$baseUrl/foods');
      final res = await http.get(uri, headers: _headers()).timeout(const Duration(seconds: 8));
      if (res.statusCode == 200) {
        final body = jsonDecode(res.body);
        if (body['success'] == true && body['data'] is List) {
          final list = List<Map<String, dynamic>>.from(body['data']);
          for (final f in list) {
            if (f['name'] != null && f['_id'] != null) {
              foodIdMap[f['name'].toString().toLowerCase().trim()] = f['_id'].toString();
            }
          }
          return list;
        }
      }
    } catch (e) {
      // Backend unavailable; callers can fallback to local assets
    }
    return null;
  }

  Future<List<Map<String, dynamic>>?> fetchCategories() async {
    try {
      final uri = Uri.parse('$baseUrl/foods/categories');
      final res = await http.get(uri, headers: _headers()).timeout(const Duration(seconds: 8));
      if (res.statusCode == 200) {
        final body = jsonDecode(res.body);
        if (body['success'] == true && body['data'] is List) {
          return List<Map<String, dynamic>>.from(body['data']);
        }
      }
    } catch (_) {}
    return null;
  }

  Future<bool> ensureAuthenticated() async {
    if (_cachedToken != null && _cachedToken!.isNotEmpty) return true;
    try {
      final res = await login('rahul@example.com', 'Customer@123');
      if (res['success'] == true) return true;

      final regRes = await register(
        name: 'Rahul Sharma',
        email: 'rahul@example.com',
        password: 'Customer@123',
        phone: '9845012345',
      );
      return regRes['success'] == true;
    } catch (_) {
      return false;
    }
  }

  // ==========================================
  // 4. ORDERS (Live MongoDB & Admin sync)
  // ==========================================
  Future<Map<String, dynamic>> createOrder({
    required List<Map<String, dynamic>> items,
    required Map<String, dynamic> deliveryAddress,
    required String paymentMethod,
    String? couponCode,
  }) async {
    await getWorkingBaseUrl();
    if (_cachedToken == null) {
      await ensureAuthenticated();
    }
    if (_cachedToken == null) {
      return {'success': false, 'message': 'Authentication required. Please log in first.'};
    }

    try {
      final uri = Uri.parse('$baseUrl/orders');
      final body = {
        'items': items,
        'deliveryAddress': deliveryAddress,
        'paymentMethod': paymentMethod,
        if (couponCode != null && couponCode.isNotEmpty) 'couponCode': couponCode,
      };

      final res = await http
          .post(uri, headers: _headers(needsAuth: true), body: jsonEncode(body))
          .timeout(const Duration(seconds: 12));

      final data = jsonDecode(res.body);
      if (res.statusCode == 201 && data['success'] == true) {
        return {'success': true, 'data': data['data']};
      }
      return {'success': false, 'message': data['message'] ?? 'Failed to place order'};
    } catch (e) {
      return {'success': false, 'networkError': true, 'message': 'Backend server offline'};
    }
  }

  Future<List<Map<String, dynamic>>?> fetchMyOrders() async {
    if (_cachedToken == null) return null;
    try {
      final uri = Uri.parse('$baseUrl/orders/my-orders');
      final res = await http.get(uri, headers: _headers(needsAuth: true)).timeout(const Duration(seconds: 8));
      if (res.statusCode == 200) {
        final body = jsonDecode(res.body);
        if (body['success'] == true && body['data'] is List) {
          return List<Map<String, dynamic>>.from(body['data']);
        }
      }
    } catch (_) {}
    return null;
  }

  Future<Map<String, dynamic>?> fetchOrderDetails(String orderId) async {
    if (_cachedToken == null) return null;
    try {
      final uri = Uri.parse('$baseUrl/orders/$orderId');
      final res = await http.get(uri, headers: _headers(needsAuth: true)).timeout(const Duration(seconds: 8));
      if (res.statusCode == 200) {
        final body = jsonDecode(res.body);
        if (body['success'] == true) {
          return body['data'];
        }
      }
    } catch (_) {}
    return null;
  }

  // ==========================================
  // 5. REVIEWS & RATINGS
  // ==========================================
  Future<List<Map<String, dynamic>>?> fetchReviews() async {
    try {
      final uri = Uri.parse('$baseUrl/reviews');
      final res = await http.get(uri, headers: _headers()).timeout(const Duration(seconds: 6));
      if (res.statusCode == 200) {
        final body = jsonDecode(res.body);
        if (body['success'] == true && body['data'] is List) {
          return List<Map<String, dynamic>>.from(body['data']);
        }
      }
    } catch (_) {}
    return null;
  }

  Future<Map<String, dynamic>> submitReview({
    required String foodId,
    required int rating,
    required String comment,
  }) async {
    if (_cachedToken == null) {
      return {'success': false, 'message': 'Please log in to submit a review'};
    }

    try {
      final uri = Uri.parse('$baseUrl/reviews');
      final body = {
        'foodId': foodId,
        'rating': rating,
        'comment': comment,
      };

      final res = await http
          .post(uri, headers: _headers(needsAuth: true), body: jsonEncode(body))
          .timeout(const Duration(seconds: 8));

      final data = jsonDecode(res.body);
      return data;
    } catch (e) {
      return {'success': false, 'message': 'Network error: $e'};
    }
  }
}
