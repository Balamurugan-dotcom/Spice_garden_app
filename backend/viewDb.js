// ==============================================================================
// Spice Garden - Live Database Inspection Script
// This script queries the running backend API and prints all database collections.
// ==============================================================================

const http = require('http');

// Helper function to make HTTP requests
const fetchData = (path, token = '') => {
  return new Promise((resolve, reject) => {
    const options = {
      host: 'localhost',
      port: 5000,
      path: path,
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      },
    };

    const req = http.request(options, (res) => {
      let data = '';
      res.on('data', (chunk) => (data += chunk));
      res.on('end', () => {
        try {
          resolve(JSON.parse(data));
        } catch (e) {
          resolve({ error: 'Failed to parse JSON', raw: data });
        }
      });
    });

    req.on('error', (err) => {
      reject(err);
    });

    req.end();
  });
};

// Post request helper (used for admin login to view protected collections)
const postData = (path, body) => {
  return new Promise((resolve, reject) => {
    const postBody = JSON.stringify(body);
    const options = {
      host: 'localhost',
      port: 5000,
      path: path,
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Content-Length': Buffer.byteLength(postBody),
      },
    };

    const req = http.request(options, (res) => {
      let data = '';
      res.on('data', (chunk) => (data += chunk));
      res.on('end', () => {
        try {
          resolve(JSON.parse(data));
        } catch (e) {
          resolve({ error: 'Failed to parse JSON', raw: data });
        }
      });
    });

    req.on('error', reject);
    req.write(postBody);
    req.end();
  });
};

async function inspectDatabase() {
  console.log('\n===============================================================');
  console.log('      🌿 SPICE GARDEN - DATABASE VIEWER & INSPECTION');
  console.log('===============================================================\n');

  try {
    // 1. Authenticate as Admin to access protected collections (Users, Orders, Stats)
    const loginRes = await postData('/api/auth/login', {
      email: 'admin@spicegarden.com',
      password: 'Admin@123',
    });

    if (!loginRes.success) {
      console.error('❌ Could not authenticate admin. Is the backend server running?');
      return;
    }

    const adminToken = loginRes.data.token;

    // 2. Query Dashboard Analytics (Totals)
    const statsRes = await fetchData('/api/stats/dashboard', adminToken);
    if (statsRes.success) {
      console.log('📊 [1] DATABASE SUMMARY & TOTAL COUNTS');
      console.log('---------------------------------------------------------------');
      console.log(`• Total Food Dishes:     ${statsRes.data.totalDishes}`);
      console.log(`• Total Registered Users: ${statsRes.data.totalCustomers}`);
      console.log(`• Total Orders Placed:   ${statsRes.data.totalOrders}`);
      console.log(`• Pending Active Orders:  ${statsRes.data.pendingOrders}`);
      console.log(`• Total Revenue (INR):    ₹${statsRes.data.totalSales}`);
      console.log(`• Today Revenue (INR):    ₹${statsRes.data.todaySales}`);
      console.log('---------------------------------------------------------------\n');
    }

    // 3. Query Food Categories Collection
    const catRes = await fetchData('/api/foods/categories');
    if (catRes.success) {
      console.log(`📂 [2] CATEGORIES COLLECTION (${catRes.data.length} categories)`);
      console.log('---------------------------------------------------------------');
      catRes.data.forEach((cat, index) => {
        console.log(`  ${index + 1}. [${cat.name}] - ${cat.description || 'Authentic dishes'}`);
      });
      console.log('\n');
    }

    // 4. Query Foods Collection (Sample 6 dishes)
    const foodsRes = await fetchData('/api/foods');
    if (foodsRes.success) {
      console.log(`🍛 [3] FOODS COLLECTION (${foodsRes.data.length} total items in DB)`);
      console.log('---------------------------------------------------------------');
      console.log('Showing first 6 dishes:');
      foodsRes.data.slice(0, 6).forEach((food) => {
        const diet = food.isVeg ? '🟢 VEG' : '🔴 NON-VEG';
        const stock = food.isAvailable ? 'IN STOCK' : 'OUT OF STOCK';
        console.log(`  • [${food.category}] ${food.name} - ₹${food.price} (${diet} | ${stock})`);
      });
      if (foodsRes.data.length > 6) {
        console.log(`    ... and ${foodsRes.data.length - 6} more dishes.`);
      }
      console.log('\n');
    }

    // 5. Query Orders Collection
    const ordersRes = await fetchData('/api/orders', adminToken);
    if (ordersRes.success) {
      console.log(`📦 [4] ORDERS COLLECTION (${ordersRes.data.length} total orders)`);
      console.log('---------------------------------------------------------------');
      if (ordersRes.data.length === 0) {
        console.log('  No orders found in database yet.');
      } else {
        ordersRes.data.slice(0, 5).forEach((order, index) => {
          console.log(`  Order #${order.orderId || order._id.slice(-6)}:`);
          console.log(`    Customer: ${order.customerDetails?.name} (${order.customerDetails?.phone})`);
          console.log(`    Delivery: ${order.deliveryAddress?.area}, Bangalore (PIN: ${order.deliveryAddress?.pincode})`);
          console.log(`    Total: ₹${order.totalAmount} | Status: ${order.orderStatus} | Payment: ${order.paymentMethod}`);
          console.log(`    Items: ${order.items?.map((i) => `${i.quantity}x ${i.name}`).join(', ')}`);
          console.log('');
        });
      }
      console.log('\n');
    }

    // 6. Query Reviews Collection
    const reviewsRes = await fetchData('/api/reviews/admin', adminToken);
    if (reviewsRes.success) {
      console.log(`⭐ [5] REVIEWS COLLECTION (${reviewsRes.data.length} reviews)`);
      console.log('---------------------------------------------------------------');
      reviewsRes.data.forEach((rev) => {
        const status = rev.isApproved ? 'APPROVED' : 'PENDING';
        console.log(`  • ${rev.customerName || 'Diner'} (${rev.rating}/5 Stars) [${status}]:`);
        console.log(`    "${rev.comment}"`);
      });
      console.log('\n');
    }

    console.log('===============================================================');
    console.log('💡 TIP: You can also view and manage all this data visually at:');
    console.log('   👉 http://localhost:5173/admin');
    console.log('===============================================================\n');
  } catch (error) {
    console.error('❌ Error inspecting database:', error.message);
    console.log('👉 Make sure the backend is running (npm run dev) on port 5000.');
  }
}

inspectDatabase();
