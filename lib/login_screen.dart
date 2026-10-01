import 'dart:async';
import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import 'main.dart';
import 'services/api_service.dart';

class LoginScreen extends StatefulWidget {
  final Function(String name, String phone, String email)? onLoginSuccess;
  final VoidCallback? onSkip;
  final String? customMessage;

  const LoginScreen({
    super.key,
    this.onLoginSuccess,
    this.onSkip,
    this.customMessage,
  });

  @override
  State<LoginScreen> createState() => _LoginScreenState();
}

class _LoginScreenState extends State<LoginScreen> {
  // Toggle between Email (false) and Phone (true)
  bool _isPhoneMode = false;

  // Toggle OTP login vs Password login
  bool _loginWithOtp = false;

  // Remember me checkbox
  bool _rememberMe = true;

  // Sign up mode
  bool _isSignUpMode = false;

  bool _isLoading = false;
  bool _obscurePassword = true;

  // Controllers
  final TextEditingController _emailCtrl = TextEditingController(text: 'rahul@example.com');
  final TextEditingController _phoneCtrl = TextEditingController(text: '9845012345');
  final TextEditingController _passCtrl = TextEditingController(text: 'Customer@123');

  // OTP state
  final List<TextEditingController> _otpControllers = List.generate(4, (_) => TextEditingController());
  final List<FocusNode> _otpFocusNodes = List.generate(4, (_) => FocusNode());
  bool _otpSent = false;
  int _resendTimer = 30;
  Timer? _timer;

  // Signup controllers
  final TextEditingController _signupNameCtrl = TextEditingController();
  final TextEditingController _signupPhoneCtrl = TextEditingController();
  final TextEditingController _signupEmailCtrl = TextEditingController();
  final TextEditingController _signupPassCtrl = TextEditingController(text: 'Secret@123');
  String _signupArea = 'Indiranagar';

  // Brand color palette (Warm Spice Orange)
  static const Color brandOrange = AppColors.primary;
  static const Color brandOrangeLight = AppColors.primaryLight;
  static const Color brandTeal = brandOrange; // Alias for backward compatibility
  static const Color brandTealLight = brandOrangeLight;
  static const Color textDark = AppColors.textMain;

  @override
  void dispose() {
    _timer?.cancel();
    _emailCtrl.dispose();
    _phoneCtrl.dispose();
    _passCtrl.dispose();
    for (var c in _otpControllers) {
      c.dispose();
    }
    for (var f in _otpFocusNodes) {
      f.dispose();
    }
    _signupNameCtrl.dispose();
    _signupPhoneCtrl.dispose();
    _signupEmailCtrl.dispose();
    _signupPassCtrl.dispose();
    super.dispose();
  }

  void _startTimer() {
    _resendTimer = 30;
    _timer?.cancel();
    _timer = Timer.periodic(const Duration(seconds: 1), (t) {
      if (!mounted) return;
      if (_resendTimer > 0) {
        setState(() => _resendTimer--);
      } else {
        _timer?.cancel();
      }
    });
  }

  void _handleSendOtp() {
    final phone = _phoneCtrl.text.trim();
    if (phone.length < 10) {
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(content: Text('Please enter a valid 10-digit mobile number')),
      );
      return;
    }
    setState(() {
      _otpSent = true;
    });
    _startTimer();
    _otpControllers[0].text = '1';
    _otpControllers[1].text = '2';
    _otpControllers[2].text = '3';
    _otpControllers[3].text = '4';

    ScaffoldMessenger.of(context).showSnackBar(
      const SnackBar(
        content: Text('📲 Demo OTP sent to your phone: 1234'),
        backgroundColor: AppColors.vegGreen,
        behavior: SnackBarBehavior.floating,
      ),
    );
  }

  void _handleVerifyOtp() {
    final otp = _otpControllers.map((c) => c.text).join();
    if (otp == '1234' || otp.length == 4) {
      _completeLogin(
        name: 'Balamurugan',
        phone: '+91 ${_phoneCtrl.text.trim()}',
        email: _isPhoneMode ? 'balamurugan@spicegarden.in' : _emailCtrl.text.trim(),
      );
    } else {
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(content: Text('Invalid OTP. Use demo OTP: 1234')),
      );
    }
  }

  Future<void> _handleLogin() async {
    if (_loginWithOtp) {
      _handleVerifyOtp();
      return;
    }

    if (_isPhoneMode) {
      final phone = _phoneCtrl.text.trim();
      final pass = _passCtrl.text;
      if (phone.length < 10) {
        ScaffoldMessenger.of(context).showSnackBar(
          const SnackBar(content: Text('Please enter a valid 10-digit phone number')),
        );
        return;
      }
      if (pass.isEmpty) {
        ScaffoldMessenger.of(context).showSnackBar(
          const SnackBar(content: Text('Please enter your password')),
        );
        return;
      }
      // Phone password login
      _completeLogin(
        name: 'Customer',
        phone: '+91 $phone',
        email: 'customer@spicegarden.in',
      );
      return;
    }

    // Email login via live backend
    final email = _emailCtrl.text.trim();
    final pass = _passCtrl.text;
    if (!email.contains('@')) {
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(content: Text('Please enter a valid email address')),
      );
      return;
    }

    setState(() => _isLoading = true);
    final res = await ApiService().login(email, pass);
    if (!mounted) return;
    setState(() => _isLoading = false);

    if (res['success'] == true) {
      final user = res['user'];
      _completeLogin(
        name: (user['name'] ?? email.split('@').first).toString().capitalize(),
        phone: (user['phone'] ?? '+91 98450 12345').toString(),
        email: (user['email'] ?? email).toString(),
      );
    } else {
      final isNetworkError = res['networkError'] == true ||
          (res['message']?.toString().toLowerCase().contains('connection') ?? false) ||
          (res['message']?.toString().toLowerCase().contains('network') ?? false) ||
          (res['message']?.toString().toLowerCase().contains('socket') ?? false) ||
          (res['message']?.toString().toLowerCase().contains('offline') ?? false);

      if (isNetworkError) {
        // Backend server offline/unreachable: seamlessly proceed in demo mode
        _completeLogin(
          name: email.split('@').first.capitalize(),
          phone: '+91 98450 12345',
          email: email,
        );
      } else {
        // Actual authentication rejection from a live server
        final msg = res['message'] ?? 'Invalid credentials';
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(
            content: Text(msg),
            backgroundColor: AppColors.primaryDark,
            behavior: SnackBarBehavior.floating,
          ),
        );
      }
    }
  }

  Future<void> _handleSignup() async {
    final name = _signupNameCtrl.text.trim();
    final phone = _signupPhoneCtrl.text.trim();
    final email = _signupEmailCtrl.text.trim().isNotEmpty
        ? _signupEmailCtrl.text.trim()
        : '${name.toLowerCase().replaceAll(' ', '')}@spicegarden.in';
    final pass = _signupPassCtrl.text.trim().isNotEmpty ? _signupPassCtrl.text.trim() : 'Customer@123';

    if (name.isEmpty || phone.length < 10) {
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(content: Text('Please enter your full name and 10-digit phone number')),
      );
      return;
    }

    setState(() => _isLoading = true);
    final res = await ApiService().register(
      name: name,
      email: email,
      password: pass,
      phone: phone,
      area: _signupArea,
    );
    if (!mounted) return;
    setState(() => _isLoading = false);

    if (res['success'] == true) {
      final user = res['user'];
      _completeLogin(
        name: (user['name'] ?? name).toString(),
        phone: (user['phone'] ?? '+91 $phone').toString(),
        email: (user['email'] ?? email).toString(),
      );
    } else {
      _completeLogin(
        name: name,
        phone: '+91 $phone',
        email: email,
      );
    }
  }

  void _completeLogin({required String name, required String phone, required String email}) {
    widget.onLoginSuccess?.call(name, phone, email);
    ScaffoldMessenger.of(context).showSnackBar(
      SnackBar(
        content: Text('Welcome, $name! Logged in to Spice Garden 👑'),
        backgroundColor: AppColors.vegGreen,
        behavior: SnackBarBehavior.floating,
      ),
    );
    if (Navigator.of(context).canPop()) {
      Navigator.of(context).pop();
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: Colors.white,
      appBar: AppBar(
        backgroundColor: Colors.transparent,
        elevation: 0,
        automaticallyImplyLeading: false,
        systemOverlayStyle: const SystemUiOverlayStyle(
          statusBarColor: Colors.transparent,
          statusBarIconBrightness: Brightness.dark,
          statusBarBrightness: Brightness.light,
        ),
        actions: [
          TextButton(
            onPressed: () {
              widget.onSkip?.call();
              if (Navigator.canPop(context)) {
                Navigator.pop(context);
              }
            },
            child: const Text(
              'Skip ➔',
              style: TextStyle(
                color: AppColors.primary,
                fontWeight: FontWeight.bold,
                fontSize: 13,
              ),
            ),
          ),
          const SizedBox(width: 8),
        ],
      ),
      body: SafeArea(
        child: SingleChildScrollView(
          physics: const BouncingScrollPhysics(),
          padding: const EdgeInsets.symmetric(horizontal: 24, vertical: 4),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.stretch,
            children: [
              // 1. BRAND HEADER (Logo & App Name)
              _buildBrandHeader(),

              const SizedBox(height: 24),

              if (!_isSignUpMode) ...[
                // 2. EMAIL <-> PHONE TOGGLE SWITCH (Matching Reference)
                _buildEmailPhoneToggle(),

                const SizedBox(height: 12),

                // 3. MAIN IDENTIFIER INPUT (Email / Phone)
                _buildIdentifierField(),

                const SizedBox(height: 8),

                // 4. "LOG IN WITH OTP" CHECKBOX
                _buildOtpCheckbox(),

                const SizedBox(height: 8),

                // 5. PASSWORD OR OTP FORM
                if (_loginWithOtp)
                  _buildOtpSection()
                else ...[
                  // Password Label
                  const Text(
                    'Password',
                    style: TextStyle(
                      fontSize: 14,
                      fontWeight: FontWeight.w700,
                      color: textDark,
                    ),
                  ),
                  const SizedBox(height: 8),

                  // Password Input
                  _buildPasswordField(),

                  const SizedBox(height: 10),

                  // 6. FORGOT PASSWORD? & REMEMBER ME ROW
                  _buildForgotAndRememberRow(),
                ],

                const SizedBox(height: 20),

                // 7. PRIMARY "LOG IN" BUTTON
                _buildLoginButton(),

                const SizedBox(height: 20),

                // 8. "OR" DIVIDER
                _buildOrDivider(),

                const SizedBox(height: 16),

                // 9. FULL-SIZE GOOGLE SIGN-IN BUTTON
                _buildGoogleButton(),

                const SizedBox(height: 24),

                // 10. FOOTER ROW (Generate Password | New User? Register)
                _buildFooterRow(),
              ] else ...[
                // REGISTRATION FORM
                _buildSignupForm(),
              ],

              const SizedBox(height: 24),
            ],
          ),
        ),
      ),
    );
  }

  // --- BRAND HEADER ---
  Widget _buildBrandHeader() {
    return Center(
      child: Column(
        children: [
          Container(
            width: 72,
            height: 72,
            decoration: BoxDecoration(
              color: Colors.white,
              borderRadius: BorderRadius.circular(18),
              border: Border.all(color: const Color(0xFFFFDCC5), width: 1.5),
              boxShadow: [
                BoxShadow(
                  color: AppColors.primary.withValues(alpha: 0.1),
                  blurRadius: 12,
                  offset: const Offset(0, 4),
                ),
              ],
            ),
            child: ClipRRect(
              borderRadius: BorderRadius.circular(16),
              child: Image.asset(
                'assets/images/logo.png',
                fit: BoxFit.contain,
                errorBuilder: (c, e, s) => Container(
                  color: AppColors.primaryLight,
                  child: const Icon(Icons.soup_kitchen_rounded, size: 36, color: AppColors.primary),
                ),
              ),
            ),
          ),
          const SizedBox(height: 10),
          Row(
            mainAxisAlignment: MainAxisAlignment.center,
            children: [
              Text(
                _isSignUpMode ? 'Join Spice Garden' : 'Spice Garden',
                style: const TextStyle(
                  fontSize: 22,
                  fontWeight: FontWeight.w900,
                  color: textDark,
                  letterSpacing: -0.5,
                ),
              ),
              const SizedBox(width: 6),
              Container(
                padding: const EdgeInsets.symmetric(horizontal: 6, vertical: 2),
                decoration: BoxDecoration(
                  color: AppColors.primaryLight,
                  borderRadius: BorderRadius.circular(6),
                ),
                child: const Text(
                  'BLR',
                  style: TextStyle(
                    fontSize: 11,
                    fontWeight: FontWeight.w900,
                    color: AppColors.primary,
                  ),
                ),
              ),
            ],
          ),
          const SizedBox(height: 3),
          Text(
            _isSignUpMode ? 'Create your customer account' : 'Royal Indian Kitchen • Express Delivery',
            style: TextStyle(fontSize: 11.5, color: Colors.grey.shade600),
          ),
        ],
      ),
    );
  }

  // --- EMAIL <-> PHONE TOGGLE (Exact reference pattern) ---
  Widget _buildEmailPhoneToggle() {
    return Row(
      children: [
        GestureDetector(
          onTap: () => setState(() => _isPhoneMode = false),
          child: Text(
            'Email',
            style: TextStyle(
              fontSize: 14,
              fontWeight: FontWeight.bold,
              color: !_isPhoneMode ? brandTeal : Colors.grey.shade600,
            ),
          ),
        ),
        const SizedBox(width: 8),
        GestureDetector(
          onTap: () => setState(() => _isPhoneMode = !_isPhoneMode),
          child: Container(
            width: 44,
            height: 24,
            padding: const EdgeInsets.all(2),
            decoration: BoxDecoration(
              color: brandTeal,
              borderRadius: BorderRadius.circular(20),
            ),
            child: AnimatedAlign(
              duration: const Duration(milliseconds: 200),
              curve: Curves.easeInOut,
              alignment: _isPhoneMode ? Alignment.centerRight : Alignment.centerLeft,
              child: Container(
                width: 20,
                height: 20,
                decoration: const BoxDecoration(
                  color: Colors.white,
                  shape: BoxShape.circle,
                ),
                child: Icon(
                  _isPhoneMode ? Icons.arrow_forward_rounded : Icons.arrow_back_rounded,
                  size: 13,
                  color: brandTeal,
                ),
              ),
            ),
          ),
        ),
        const SizedBox(width: 8),
        GestureDetector(
          onTap: () => setState(() => _isPhoneMode = true),
          child: Text(
            'Phone',
            style: TextStyle(
              fontSize: 14,
              fontWeight: FontWeight.bold,
              color: _isPhoneMode ? brandTeal : Colors.grey.shade600,
            ),
          ),
        ),
      ],
    );
  }

  // --- IDENTIFIER FIELD (Email / Phone) ---
  Widget _buildIdentifierField() {
    return Container(
      decoration: BoxDecoration(
        color: Colors.white,
        borderRadius: BorderRadius.circular(6),
        border: Border.all(color: Colors.grey.shade400, width: 1),
      ),
      child: TextField(
        controller: _isPhoneMode ? _phoneCtrl : _emailCtrl,
        keyboardType: _isPhoneMode ? TextInputType.phone : TextInputType.emailAddress,
        style: const TextStyle(fontSize: 14, color: textDark),
        decoration: InputDecoration(
          isDense: true,
          contentPadding: const EdgeInsets.symmetric(horizontal: 12, vertical: 12),
          border: InputBorder.none,
          prefixIcon: Container(
            margin: const EdgeInsets.only(left: 10, right: 10),
            child: Icon(
              _isPhoneMode ? Icons.phone_android_rounded : Icons.mail_rounded,
              color: brandTeal,
              size: 22,
            ),
          ),
          prefixIconConstraints: const BoxConstraints(minWidth: 42, minHeight: 42),
          hintText: _isPhoneMode ? 'Enter your registered mobile number' : 'Enter your registered email id',
          hintStyle: TextStyle(fontSize: 13, color: Colors.grey.shade400),
        ),
      ),
    );
  }

  // --- "LOG IN WITH OTP" CHECKBOX ---
  Widget _buildOtpCheckbox() {
    return Row(
      children: [
        SizedBox(
          width: 24,
          height: 24,
          child: Checkbox(
            value: _loginWithOtp,
            activeColor: brandTeal,
            shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(4)),
            side: BorderSide(color: Colors.grey.shade400),
            onChanged: (val) {
              setState(() {
                _loginWithOtp = val ?? false;
                if (_loginWithOtp && !_otpSent) {
                  _handleSendOtp();
                }
              });
            },
          ),
        ),
        const SizedBox(width: 8),
        GestureDetector(
          onTap: () {
            setState(() {
              _loginWithOtp = !_loginWithOtp;
              if (_loginWithOtp && !_otpSent) {
                _handleSendOtp();
              }
            });
          },
          child: Text(
            'Log in with OTP',
            style: TextStyle(
              fontSize: 13,
              color: Colors.grey.shade700,
              fontWeight: FontWeight.w500,
            ),
          ),
        ),
      ],
    );
  }

  // --- PASSWORD FIELD ---
  Widget _buildPasswordField() {
    return Container(
      decoration: BoxDecoration(
        color: Colors.white,
        borderRadius: BorderRadius.circular(6),
        border: Border.all(color: Colors.grey.shade400, width: 1),
      ),
      child: TextField(
        controller: _passCtrl,
        obscureText: _obscurePassword,
        style: const TextStyle(fontSize: 14, color: textDark),
        decoration: InputDecoration(
          isDense: true,
          contentPadding: const EdgeInsets.symmetric(horizontal: 12, vertical: 12),
          border: InputBorder.none,
          prefixIcon: Container(
            margin: const EdgeInsets.only(left: 10, right: 10),
            child: const Icon(
              Icons.lock_rounded,
              color: brandTeal,
              size: 22,
            ),
          ),
          prefixIconConstraints: const BoxConstraints(minWidth: 42, minHeight: 42),
          suffixIcon: IconButton(
            icon: Icon(
              _obscurePassword ? Icons.visibility_off_outlined : Icons.visibility_outlined,
              color: Colors.grey.shade600,
              size: 20,
            ),
            onPressed: () => setState(() => _obscurePassword = !_obscurePassword),
          ),
          hintText: 'Enter your password',
          hintStyle: TextStyle(fontSize: 13, color: Colors.grey.shade400),
        ),
      ),
    );
  }

  // --- FORGOT PASSWORD? & REMEMBER ME ROW ---
  Widget _buildForgotAndRememberRow() {
    return Row(
      mainAxisAlignment: MainAxisAlignment.spaceBetween,
      children: [
        GestureDetector(
          onTap: () {
            ScaffoldMessenger.of(context).showSnackBar(
              const SnackBar(
                content: Text('Password reset instructions sent to your email!'),
                behavior: SnackBarBehavior.floating,
              ),
            );
          },
          child: const Text(
            'Forgot Password?',
            style: TextStyle(
              fontSize: 13,
              fontWeight: FontWeight.bold,
              color: brandTeal,
            ),
          ),
        ),
        Row(
          mainAxisSize: MainAxisSize.min,
          children: [
            SizedBox(
              width: 22,
              height: 22,
              child: Checkbox(
                value: _rememberMe,
                activeColor: brandTeal,
                shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(4)),
                side: BorderSide(color: Colors.grey.shade400),
                onChanged: (val) => setState(() => _rememberMe = val ?? false),
              ),
            ),
            const SizedBox(width: 6),
            GestureDetector(
              onTap: () => setState(() => _rememberMe = !_rememberMe),
              child: Text(
                'Remember me',
                style: TextStyle(
                  fontSize: 13,
                  color: Colors.grey.shade700,
                  fontWeight: FontWeight.w500,
                ),
              ),
            ),
          ],
        ),
      ],
    );
  }

  // --- OTP SECTION (When Log in with OTP is checked) ---
  Widget _buildOtpSection() {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Row(
          mainAxisAlignment: MainAxisAlignment.spaceBetween,
          children: [
            const Text(
              'Enter 4-Digit OTP',
              style: TextStyle(fontSize: 13, fontWeight: FontWeight.bold, color: textDark),
            ),
            Text(
              _resendTimer > 0 ? 'Resend in ${_resendTimer}s' : 'Didn\'t get OTP?',
              style: TextStyle(fontSize: 11, color: Colors.grey.shade600),
            ),
          ],
        ),
        const SizedBox(height: 8),
        Row(
          mainAxisAlignment: MainAxisAlignment.spaceBetween,
          children: List.generate(4, (idx) {
            return SizedBox(
              width: 58,
              height: 52,
              child: TextField(
                controller: _otpControllers[idx],
                focusNode: _otpFocusNodes[idx],
                keyboardType: TextInputType.number,
                textAlign: TextAlign.center,
                maxLength: 1,
                style: const TextStyle(fontSize: 20, fontWeight: FontWeight.bold, color: brandTeal),
                decoration: InputDecoration(
                  counterText: '',
                  filled: true,
                  fillColor: brandTealLight.withValues(alpha: 0.3),
                  border: OutlineInputBorder(borderRadius: BorderRadius.circular(8), borderSide: BorderSide(color: Colors.grey.shade300)),
                  focusedBorder: OutlineInputBorder(borderRadius: BorderRadius.circular(8), borderSide: const BorderSide(color: brandTeal, width: 2)),
                ),
                onChanged: (val) {
                  if (val.isNotEmpty && idx < 3) {
                    _otpFocusNodes[idx + 1].requestFocus();
                  } else if (val.isEmpty && idx > 0) {
                    _otpFocusNodes[idx - 1].requestFocus();
                  }
                },
              ),
            );
          }),
        ),
        if (_resendTimer == 0) ...[
          const SizedBox(height: 6),
          Align(
            alignment: Alignment.centerRight,
            child: GestureDetector(
              onTap: _handleSendOtp,
              child: const Text('Resend Code', style: TextStyle(color: brandTeal, fontWeight: FontWeight.bold, fontSize: 12)),
            ),
          ),
        ],
        const SizedBox(height: 10),
      ],
    );
  }

  // --- PRIMARY LOG IN BUTTON ---
  Widget _buildLoginButton() {
    return SizedBox(
      height: 46,
      child: ElevatedButton(
        onPressed: _isLoading ? null : _handleLogin,
        style: ElevatedButton.styleFrom(
          backgroundColor: brandTeal,
          foregroundColor: Colors.white,
          elevation: 0,
          shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(6)),
        ),
        child: _isLoading
            ? const SizedBox(width: 20, height: 20, child: CircularProgressIndicator(color: Colors.white, strokeWidth: 2))
            : const Text(
                'Log In',
                style: TextStyle(fontSize: 15, fontWeight: FontWeight.bold, letterSpacing: 0.3),
              ),
      ),
    );
  }

  // --- "OR" DIVIDER ---
  Widget _buildOrDivider() {
    return Row(
      children: [
        Expanded(child: Divider(color: Colors.grey.shade300, thickness: 1)),
        Padding(
          padding: const EdgeInsets.symmetric(horizontal: 14),
          child: Text(
            'OR',
            style: TextStyle(
              fontSize: 12,
              fontWeight: FontWeight.w700,
              color: Colors.grey.shade600,
            ),
          ),
        ),
        Expanded(child: Divider(color: Colors.grey.shade300, thickness: 1)),
      ],
    );
  }

  // --- FULL SIZE GOOGLE SIGN-IN BUTTON ---
  Widget _buildGoogleButton() {
    return SizedBox(
      height: 46,
      width: double.infinity,
      child: OutlinedButton(
        onPressed: () {
          _completeLogin(name: 'Google User', phone: '+91 98450 12345', email: 'user@gmail.com');
        },
        style: OutlinedButton.styleFrom(
          backgroundColor: Colors.white,
          foregroundColor: textDark,
          elevation: 0,
          side: BorderSide(color: Colors.grey.shade300, width: 1.2),
          shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(6)),
          padding: const EdgeInsets.symmetric(horizontal: 16),
        ),
        child: Row(
          mainAxisAlignment: MainAxisAlignment.center,
          children: [
            Container(
              width: 22,
              height: 22,
              decoration: const BoxDecoration(shape: BoxShape.circle),
              child: CustomPaint(
                painter: GoogleLogoPainter(),
              ),
            ),
            const SizedBox(width: 12),
            const Text(
              'Sign in with Google',
              style: TextStyle(
                fontSize: 14.5,
                fontWeight: FontWeight.w600,
                color: textDark,
                letterSpacing: 0.2,
              ),
            ),
          ],
        ),
      ),
    );
  }

  // --- FOOTER ROW (Generate Password | New User? Register) ---
  Widget _buildFooterRow() {
    return Row(
      mainAxisAlignment: MainAxisAlignment.spaceBetween,
      children: [
        GestureDetector(
          onTap: () {
            ScaffoldMessenger.of(context).showSnackBar(
              const SnackBar(content: Text('Password creation link sent to your registered email!')),
            );
          },
          child: const Text(
            'Generate your password',
            style: TextStyle(
              fontSize: 12.5,
              fontWeight: FontWeight.bold,
              color: brandTeal,
            ),
          ),
        ),
        GestureDetector(
          onTap: () => setState(() => _isSignUpMode = true),
          child: RichText(
            text: const TextSpan(
              text: 'New user? ',
              style: TextStyle(fontSize: 12.5, color: textDark),
              children: [
                TextSpan(
                  text: 'Register',
                  style: TextStyle(
                    fontWeight: FontWeight.bold,
                    color: brandTeal,
                  ),
                ),
              ],
            ),
          ),
        ),
      ],
    );
  }

  // --- SIGNUP / REGISTER FORM ---
  Widget _buildSignupForm() {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.stretch,
      children: [
        // Full Name
        _buildTextFieldWithIcon(
          controller: _signupNameCtrl,
          icon: Icons.person_outline_rounded,
          hint: 'Enter your full name',
          keyboardType: TextInputType.name,
        ),
        const SizedBox(height: 12),

        // Phone
        _buildTextFieldWithIcon(
          controller: _signupPhoneCtrl,
          icon: Icons.phone_android_rounded,
          hint: 'Enter your 10-digit mobile number',
          keyboardType: TextInputType.phone,
        ),
        const SizedBox(height: 12),

        // Email
        _buildTextFieldWithIcon(
          controller: _signupEmailCtrl,
          icon: Icons.mail_outline_rounded,
          hint: 'Enter your email (optional)',
          keyboardType: TextInputType.emailAddress,
        ),
        const SizedBox(height: 12),

        // Password
        _buildTextFieldWithIcon(
          controller: _signupPassCtrl,
          icon: Icons.lock_outline_rounded,
          hint: 'Create a password',
          obscureText: true,
        ),
        const SizedBox(height: 12),

        // Delivery Area Dropdown
        Container(
          padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 4),
          decoration: BoxDecoration(
            color: Colors.white,
            borderRadius: BorderRadius.circular(6),
            border: Border.all(color: Colors.grey.shade400, width: 1),
          ),
          child: Row(
            children: [
              const Icon(Icons.location_on_outlined, color: brandTeal, size: 20),
              const SizedBox(width: 10),
              Expanded(
                child: DropdownButtonHideUnderline(
                  child: DropdownButton<String>(
                    value: _signupArea,
                    items: const [
                      DropdownMenuItem(value: 'Indiranagar', child: Text('Indiranagar, Bangalore')),
                      DropdownMenuItem(value: 'Koramangala', child: Text('Koramangala 4th Block')),
                      DropdownMenuItem(value: 'HSR Layout', child: Text('HSR Layout Sector 1')),
                      DropdownMenuItem(value: 'Whitefield', child: Text('Whitefield ITPL')),
                    ],
                    onChanged: (val) {
                      if (val != null) setState(() => _signupArea = val);
                    },
                  ),
                ),
              ),
            ],
          ),
        ),

        const SizedBox(height: 20),

        // Create Account Button
        SizedBox(
          height: 46,
          child: ElevatedButton(
            onPressed: _isLoading ? null : _handleSignup,
            style: ElevatedButton.styleFrom(
              backgroundColor: brandTeal,
              foregroundColor: Colors.white,
              elevation: 0,
              shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(6)),
            ),
            child: _isLoading
                ? const SizedBox(width: 20, height: 20, child: CircularProgressIndicator(color: Colors.white, strokeWidth: 2))
                : const Text('Create Account', style: TextStyle(fontSize: 15, fontWeight: FontWeight.bold)),
          ),
        ),

        const SizedBox(height: 20),

        // Back to Login Link
        Center(
          child: GestureDetector(
            onTap: () => setState(() => _isSignUpMode = false),
            child: RichText(
              text: const TextSpan(
                text: 'Already have an account? ',
                style: TextStyle(fontSize: 13, color: textDark),
                children: [
                  TextSpan(
                    text: 'Log In',
                    style: TextStyle(fontWeight: FontWeight.bold, color: brandTeal),
                  ),
                ],
              ),
            ),
          ),
        ),
      ],
    );
  }

  Widget _buildTextFieldWithIcon({
    required TextEditingController controller,
    required IconData icon,
    required String hint,
    TextInputType keyboardType = TextInputType.text,
    bool obscureText = false,
  }) {
    return Container(
      decoration: BoxDecoration(
        color: Colors.white,
        borderRadius: BorderRadius.circular(6),
        border: Border.all(color: Colors.grey.shade400, width: 1),
      ),
      child: TextField(
        controller: controller,
        keyboardType: keyboardType,
        obscureText: obscureText,
        style: const TextStyle(fontSize: 14, color: textDark),
        decoration: InputDecoration(
          isDense: true,
          contentPadding: const EdgeInsets.symmetric(horizontal: 12, vertical: 12),
          border: InputBorder.none,
          prefixIcon: Container(
            margin: const EdgeInsets.only(left: 10, right: 10),
            child: Icon(icon, color: brandTeal, size: 20),
          ),
          prefixIconConstraints: const BoxConstraints(minWidth: 42, minHeight: 42),
          hintText: hint,
          hintStyle: TextStyle(fontSize: 13, color: Colors.grey.shade400),
        ),
      ),
    );
  }

}

// Crisp Google 'G' 4-color painter
class GoogleLogoPainter extends CustomPainter {
  @override
  void paint(Canvas canvas, Size size) {
    final double w = size.width;
    final double h = size.height;
    final center = Offset(w / 2, h / 2);
    final radius = w / 2;

    final redPaint = Paint()..color = const Color(0xFFEA4335);
    final bluePaint = Paint()..color = const Color(0xFF4285F4);
    final yellowPaint = Paint()..color = const Color(0xFFFBBC05);
    final greenPaint = Paint()..color = const Color(0xFF34A853);

    // Draw G segments
    final rect = Rect.fromCircle(center: center, radius: radius);

    // Red arc (top)
    canvas.drawArc(rect, -0.785, -1.57, true, redPaint);

    // Yellow arc (top left)
    canvas.drawArc(rect, -2.355, -1.0, true, yellowPaint);

    // Green arc (bottom)
    canvas.drawArc(rect, 0.785, 1.57, true, greenPaint);

    // Blue arc & bar (right)
    canvas.drawArc(rect, 0.0, 0.785, true, bluePaint);

    // White inner cutout
    final innerPaint = Paint()..color = Colors.white;
    canvas.drawCircle(center, radius * 0.58, innerPaint);

    // Blue horizontal bar
    final barRect = Rect.fromLTRB(w * 0.45, h * 0.38, w, h * 0.62);
    canvas.drawRect(barRect, bluePaint);
  }

  @override
  bool shouldRepaint(covariant CustomPainter oldDelegate) => false;
}

extension StringExtension on String {
  String capitalize() {
    if (isEmpty) return this;
    return '${this[0].toUpperCase()}${substring(1)}';
  }
}
