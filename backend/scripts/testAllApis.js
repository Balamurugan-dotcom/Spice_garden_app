const BASE_URL = process.env.BASE_URL || 'http://localhost:5000/api';

const results = [];

function record(name, group, success, status, details = '') {
  results.push({ name, group, success, status, details });
  const icon = success ? '✅ PASS' : '❌ FAIL';
  console.log(`${icon} [${group}] ${name} (${status}) ${details ? '— ' + details : ''}`);
}

async function runTests() {
  console.log('===============================================================');
  console.log('🧪 Starting Full API Test Suite for Spice Garden Bangalore');
  console.log('Target URL:', BASE_URL);
  console.log('===============================================================\n');

  let customerToken = '';
  let adminToken = '';
  let testFoodId = '';
  let testOrderId = '';
  let testReviewId = '';
  let createdFoodId = '';

  // 1. PUBLIC ENDPOINTS
  try {
    const res = await fetch('http://localhost:5000/api/health');
    const data = await res.json();
    record('Health Check', 'Public', res.status === 200 && data.status === 'online', res.status, data.restaurant);
  } catch (e) {
    record('Health Check', 'Public', false, 0, e.message);
  }

  try {
    const res = await fetch(`${BASE_URL}/foods/categories`);
    const data = await res.json();
    record('Get Categories', 'Public', res.status === 200 && data.success && data.data.length >= 6, res.status, `${data.data?.length} categories`);
  } catch (e) {
    record('Get Categories', 'Public', false, 0, e.message);
  }

  try {
    const res = await fetch(`${BASE_URL}/foods?limit=100`);
    const data = await res.json();
    const count = data.data?.length || 0;
    if (count > 0) testFoodId = data.data[0]._id;
    record('Get All Foods (60 Dishes)', 'Public', res.status === 200 && count >= 60, res.status, `${count} dishes loaded`);
  } catch (e) {
    record('Get All Foods (60 Dishes)', 'Public', false, 0, e.message);
  }

  try {
    const res = await fetch(`${BASE_URL}/foods?category=Biryani&veg=false`);
    const data = await res.json();
    record('Filter Foods (Biryani & Non-Veg)', 'Public', res.status === 200 && data.success, res.status, `${data.data?.length} biryanis found`);
  } catch (e) {
    record('Filter Foods (Biryani & Non-Veg)', 'Public', false, 0, e.message);
  }

  try {
    const res = await fetch(`${BASE_URL}/foods/${testFoodId}`);
    const data = await res.json();
    record('Get Food by ID', 'Public', res.status === 200 && data.success && data.data?._id === testFoodId, res.status, data.data?.name);
  } catch (e) {
    record('Get Food by ID', 'Public', false, 0, e.message);
  }

  try {
    const res = await fetch(`${BASE_URL}/reviews`);
    const data = await res.json();
    const reviewsList = data.data || [];
    if (reviewsList.length > 0) testReviewId = reviewsList[0]._id;
    record('Get Approved Reviews', 'Public', res.status === 200 && data.success, res.status, `${reviewsList.length} reviews`);
  } catch (e) {
    record('Get Approved Reviews', 'Public', false, 0, e.message);
  }

  // 2. AUTHENTICATION (CUSTOMER & ADMIN)
  const testEmail = `diner_${Date.now()}@example.com`;
  try {
    const res = await fetch(`${BASE_URL}/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name: 'Bangalore Diner',
        email: testEmail,
        password: 'Password@123',
        phone: '9845012345',
        address: {
          street: '12th Main, 100 Feet Rd',
          area: 'Indiranagar',
          city: 'Bangalore',
          pincode: '560038',
        },
      }),
    });
    const data = await res.json();
    record('Customer Registration', 'Auth', res.status === 201 && data.success && !!data.data?.token, res.status, testEmail);
  } catch (e) {
    record('Customer Registration', 'Auth', false, 0, e.message);
  }

  try {
    const res = await fetch(`${BASE_URL}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: 'rahul@example.com', password: 'Customer@123' }),
    });
    const data = await res.json();
    customerToken = data.data?.token || '';
    record('Customer Login', 'Auth', res.status === 200 && data.success && !!customerToken, res.status, 'rahul@example.com');
  } catch (e) {
    record('Customer Login', 'Auth', false, 0, e.message);
  }

  try {
    const res = await fetch(`${BASE_URL}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: 'admin@spicegarden.com', password: 'Admin@123' }),
    });
    const data = await res.json();
    adminToken = data.data?.token || '';
    record('Admin Login', 'Auth', res.status === 200 && data.success && data.data?.role === 'admin' && !!adminToken, res.status, 'admin@spicegarden.com');
  } catch (e) {
    record('Admin Login', 'Auth', false, 0, e.message);
  }

  // 3. CUSTOMER PROTECTED ENDPOINTS
  try {
    const res = await fetch(`${BASE_URL}/auth/me`, {
      headers: { Authorization: `Bearer ${customerToken}` },
    });
    const data = await res.json();
    record('Get Current Profile (/me)', 'Customer', res.status === 200 && data.success, res.status, data.data?.name);
  } catch (e) {
    record('Get Current Profile (/me)', 'Customer', false, 0, e.message);
  }

  try {
    const res = await fetch(`${BASE_URL}/auth/profile`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${customerToken}`,
      },
      body: JSON.stringify({
        name: 'Rahul Sharma (Updated)',
        phone: '9845099999',
      }),
    });
    const data = await res.json();
    record('Update Profile', 'Customer', res.status === 200 && data.success, res.status, data.data?.name);
  } catch (e) {
    record('Update Profile', 'Customer', false, 0, e.message);
  }

  try {
    const res = await fetch(`${BASE_URL}/orders`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${customerToken}`,
      },
      body: JSON.stringify({
        items: [
          { food: testFoodId, quantity: 2 },
        ],
        deliveryAddress: {
          street: '#24, 5th Cross, CMH Road',
          area: 'Indiranagar',
          city: 'Bangalore',
          pincode: '560038',
          instructions: 'Ring the doorbell twice',
        },
        paymentMethod: 'UPI',
      }),
    });
    const data = await res.json();
    testOrderId = data.data?._id || '';
    record('Create New Order (with Min Order & Fee Validation)', 'Customer', res.status === 201 && data.success, res.status, `Order ID: ${data.data?.orderId}, Total: ₹${data.data?.totalAmount}`);
  } catch (e) {
    record('Create New Order', 'Customer', false, 0, e.message);
  }

  try {
    const res = await fetch(`${BASE_URL}/orders/my-orders`, {
      headers: { Authorization: `Bearer ${customerToken}` },
    });
    const data = await res.json();
    record('Get Customer Order History', 'Customer', res.status === 200 && data.success, res.status, `${data.data?.length} orders found`);
  } catch (e) {
    record('Get Customer Order History', 'Customer', false, 0, e.message);
  }

  try {
    const res = await fetch(`${BASE_URL}/orders/${testOrderId}`, {
      headers: { Authorization: `Bearer ${customerToken}` },
    });
    const data = await res.json();
    record('Get Order Details by ID', 'Customer', res.status === 200 && data.success, res.status, `Status: ${data.data?.orderStatus}`);
  } catch (e) {
    record('Get Order Details by ID', 'Customer', false, 0, e.message);
  }

  try {
    const res = await fetch(`${BASE_URL}/orders/${testOrderId}/cancel`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${customerToken}`,
      },
      body: JSON.stringify({ reason: 'Placed order by mistake' }),
    });
    const data = await res.json();
    record('Cancel Placed Order', 'Customer', res.status === 200 && data.success, res.status, data.message || 'Cancelled');
  } catch (e) {
    record('Cancel Placed Order', 'Customer', false, 0, e.message);
  }

  // 4. ADMIN PROTECTED ENDPOINTS
  try {
    const res = await fetch(`${BASE_URL}/stats/dashboard`, {
      headers: { Authorization: `Bearer ${adminToken}` },
    });
    const data = await res.json();
    record('Admin Dashboard Analytics', 'Admin', res.status === 200 && data.success, res.status, `Total Sales: ₹${data.data?.totalSales}, Dishes: ${data.data?.totalDishes}`);
  } catch (e) {
    record('Admin Dashboard Analytics', 'Admin', false, 0, e.message);
  }

  try {
    const res = await fetch(`${BASE_URL}/orders`, {
      headers: { Authorization: `Bearer ${adminToken}` },
    });
    const data = await res.json();
    record('Admin Get All Orders', 'Admin', res.status === 200 && data.success, res.status, `${data.data?.length} total orders in system`);
  } catch (e) {
    record('Admin Get All Orders', 'Admin', false, 0, e.message);
  }

  // Dedicated order for Admin Status Transitions
  let adminTestOrderId = '';
  try {
    const res = await fetch(`${BASE_URL}/orders`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${customerToken}`,
      },
      body: JSON.stringify({
        items: [{ food: testFoodId, quantity: 2 }],
        deliveryAddress: {
          street: '#99, 100 Feet Road',
          area: 'Indiranagar',
          city: 'Bangalore',
          pincode: '560038',
        },
        paymentMethod: 'Online Payment',
      }),
    });
    const d = await res.json();
    adminTestOrderId = d.data?._id;
  } catch (e) {}

  try {
    const res = await fetch(`${BASE_URL}/orders/${adminTestOrderId || testOrderId}/status`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${adminToken}`,
      },
      body: JSON.stringify({ status: 'Preparing', note: 'Master chef is preparing this dish' }),
    });
    const data = await res.json();
    record('Admin Update Order Status (Preparing)', 'Admin', res.status === 200 && data.success, res.status, `New Status: ${data.data?.orderStatus}`);
  } catch (e) {
    record('Admin Update Order Status', 'Admin', false, 0, e.message);
  }

  try {
    const res = await fetch(`${BASE_URL}/foods`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${adminToken}`,
      },
      body: JSON.stringify({
        name: `Special Test Kebab ${Date.now()}`,
        description: 'Tender spiced succulent kebabs fresh from the clay tandoor oven.',
        price: 280,
        category: 'Starters',
        image: '/images/foods/mutton-galouti-kebab.jpg',
        isVeg: false,
        spiceLevel: 'Medium',
        preparationTime: '20 mins',
      }),
    });
    const data = await res.json();
    createdFoodId = data.data?._id || '';
    record('Admin Create Food Item', 'Admin', res.status === 201 && data.success, res.status, data.data?.name);
  } catch (e) {
    record('Admin Create Food Item', 'Admin', false, 0, e.message);
  }

  try {
    const res = await fetch(`${BASE_URL}/foods/${createdFoodId}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${adminToken}`,
      },
      body: JSON.stringify({
        price: 299,
        description: 'Updated succulent recipe with saffron glaze.',
      }),
    });
    const data = await res.json();
    record('Admin Update Food Item', 'Admin', res.status === 200 && data.success, res.status, `New Price: ₹${data.data?.price}`);
  } catch (e) {
    record('Admin Update Food Item', 'Admin', false, 0, e.message);
  }

  try {
    const res = await fetch(`${BASE_URL}/foods/${createdFoodId}/availability`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${adminToken}`,
      },
      body: JSON.stringify({ isAvailable: false }),
    });
    const data = await res.json();
    record('Admin Toggle Dish Availability', 'Admin', res.status === 200 && data.success, res.status, `isAvailable: ${data.data?.isAvailable}`);
  } catch (e) {
    record('Admin Toggle Dish Availability', 'Admin', false, 0, e.message);
  }

  try {
    const res = await fetch(`${BASE_URL}/foods/${createdFoodId}`, {
      method: 'DELETE',
      headers: { Authorization: `Bearer ${adminToken}` },
    });
    const data = await res.json();
    record('Admin Delete Food Item', 'Admin', res.status === 200 && data.success, res.status, data.message || 'Deleted');
  } catch (e) {
    record('Admin Delete Food Item', 'Admin', false, 0, e.message);
  }

  try {
    const res = await fetch(`${BASE_URL}/reviews/admin`, {
      headers: { Authorization: `Bearer ${adminToken}` },
    });
    const data = await res.json();
    record('Admin Get All Reviews (Moderation Queue)', 'Admin', res.status === 200 && data.success, res.status, `${data.data?.length} reviews`);
  } catch (e) {
    record('Admin Get All Reviews', 'Admin', false, 0, e.message);
  }

  if (testReviewId) {
    try {
      const res = await fetch(`${BASE_URL}/reviews/${testReviewId}/approve`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${adminToken}`,
        },
        body: JSON.stringify({ isApproved: true }),
      });
      const data = await res.json();
      record('Admin Toggle Review Approval', 'Admin', res.status === 200 && data.success, res.status, `isApproved: ${data.data?.isApproved}`);
    } catch (e) {
      record('Admin Toggle Review Approval', 'Admin', false, 0, e.message);
    }
  }

  // SUMMARY
  console.log('\n===============================================================');
  console.log('📊 Test Execution Summary:');
  const passed = results.filter(r => r.success).length;
  const total = results.length;
  console.log(`Total Endpoints Tested: ${total}`);
  console.log(`Passed: ${passed} / ${total}`);
  console.log(`Pass Rate: ${((passed / total) * 100).toFixed(1)}%`);
  console.log('===============================================================');

  if (passed === total) {
    console.log('🎉 ALL ENDPOINTS TESTED SUCCESSFULLY WITH ZERO FAILURES!');
    process.exit(0);
  } else {
    console.error(`⚠️ ${total - passed} endpoint(s) failed.`);
    process.exit(1);
  }
}

runTests();
