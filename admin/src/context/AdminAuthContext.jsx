import React, { createContext, useContext, useState, useEffect } from 'react';
import adminApi from '../api/adminApi';

const AdminAuthContext = createContext();

export const AdminAuthProvider = ({ children }) => {
  const [adminUser, setAdminUser] = useState(() => {
    try {
      const stored = localStorage.getItem('admin_user');
      return stored ? JSON.parse(stored) : null;
    } catch {
      return null;
    }
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const verifySession = async () => {
      const token = localStorage.getItem('admin_token');
      if (!token) {
        setAdminUser(null);
        setLoading(false);
        return;
      }
      try {
        const res = await adminApi.get('/auth/me');
        const user = res.data.data || res.data;
        if (user && user.role === 'admin') {
          setAdminUser(user);
          localStorage.setItem('admin_user', JSON.stringify(user));
        } else {
          logout();
        }
      } catch (err) {
        logout();
      } finally {
        setLoading(false);
      }
    };

    verifySession();
  }, []);

  const login = async (email, password) => {
    const res = await adminApi.post('/auth/login', { email, password });
    const user = res.data.data || res.data;
    if (!user || user.role !== 'admin') {
      throw new Error('Access denied. This portal is restricted to Administrator personnel.');
    }
    localStorage.setItem('admin_token', user.token);
    localStorage.setItem('admin_user', JSON.stringify(user));
    setAdminUser(user);
    return user;
  };

  const logout = () => {
    localStorage.removeItem('admin_token');
    localStorage.removeItem('admin_user');
    setAdminUser(null);
  };

  return (
    <AdminAuthContext.Provider
      value={{
        adminUser,
        isAuthenticated: !!adminUser && adminUser.role === 'admin',
        loading,
        login,
        logout,
      }}
    >
      {children}
    </AdminAuthContext.Provider>
  );
};

export const useAdminAuth = () => {
  const context = useContext(AdminAuthContext);
  if (!context) {
    throw new Error('useAdminAuth must be used within an AdminAuthProvider');
  }
  return context;
};
