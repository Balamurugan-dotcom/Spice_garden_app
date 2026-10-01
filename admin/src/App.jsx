import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AdminAuthProvider } from './context/AdminAuthContext';
import AdminProtectedRoute from './components/AdminProtectedRoute';
import AdminLayout from './components/AdminLayout';
import AdminLoginPage from './pages/AdminLoginPage';
import AdminDashboardPage from './pages/AdminDashboardPage';
import AdminFoodsPage from './pages/AdminFoodsPage';
import AdminOrdersPage from './pages/AdminOrdersPage';
import AdminReviewsPage from './pages/AdminReviewsPage';
import AdminCustomersPage from './pages/AdminCustomersPage';
import AdminStaffPage from './pages/AdminStaffPage';
import AdminReportPage from './pages/AdminReportPage';
import AdminPaymentPage from './pages/AdminPaymentPage';
import AdminSettingPage from './pages/AdminSettingPage';

function App() {
  return (
    <AdminAuthProvider>
      <Router>
        <Routes>
          {/* Public Authentication Route */}
          <Route path="/login" element={<AdminLoginPage />} />

          {/* Protected Admin Portal Shell */}
          <Route
            element={
              <AdminProtectedRoute>
                <AdminLayout />
              </AdminProtectedRoute>
            }
          >
            <Route path="/" element={<AdminDashboardPage />} />
            <Route path="/dashboard" element={<AdminDashboardPage />} />
            <Route path="/orders" element={<AdminOrdersPage />} />
            <Route path="/menu" element={<AdminFoodsPage />} />
            <Route path="/foods" element={<AdminFoodsPage />} />
            <Route path="/customers" element={<AdminCustomersPage />} />
            <Route path="/staff" element={<AdminStaffPage />} />
            <Route path="/report" element={<AdminReportPage />} />
            <Route path="/reports" element={<AdminReportPage />} />
            <Route path="/payment" element={<AdminPaymentPage />} />
            <Route path="/payments" element={<AdminPaymentPage />} />
            <Route path="/setting" element={<AdminSettingPage />} />
            <Route path="/settings" element={<AdminSettingPage />} />
            <Route path="/reviews" element={<AdminReviewsPage />} />
          </Route>

          {/* Fallback */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </Router>
    </AdminAuthProvider>
  );
}

export default App;
