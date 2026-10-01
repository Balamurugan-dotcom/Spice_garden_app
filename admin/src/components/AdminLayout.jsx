import React, { useState } from 'react';
import { NavLink, Outlet, useNavigate } from 'react-router-dom';
import { useAdminAuth } from '../context/AdminAuthContext';
import {
  LayoutDashboard,
  ShoppingBag,
  UtensilsCrossed,
  UserCheck,
  Users,
  BarChart3,
  CreditCard,
  Settings,
  LogOut,
  ChefHat,
  Menu,
  X
} from 'lucide-react';

const AdminLayout = () => {
  const { adminUser, logout } = useAdminAuth();
  const [mobileOpen, setMobileOpen] = useState(false);
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const navItems = [
    { to: '/', label: 'Dashboard', icon: LayoutDashboard },
    { to: '/orders', label: 'Orders', icon: ShoppingBag },
    { to: '/menu', label: 'Menu', icon: UtensilsCrossed },
    { to: '/customers', label: 'Customers', icon: UserCheck },
    { to: '/staff', label: 'Staff', icon: Users },
    { to: '/report', label: 'Report', icon: BarChart3 },
    { to: '/payment', label: 'Payment', icon: CreditCard },
    { to: '/setting', label: 'Setting', icon: Settings },
  ];

  return (
    <div className="admin-layout-root" style={{ display: 'flex', minHeight: '100vh', backgroundColor: '#F8FAFC' }}>
      {/* Mobile Sticky Header Bar */}
      <header className="admin-mobile-header">
        <button
          type="button"
          onClick={() => setMobileOpen(true)}
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            width: '38px',
            height: '38px',
            borderRadius: '8px',
            backgroundColor: '#1E293B',
            color: '#F8FAFC',
            border: '1px solid #334155',
          }}
          aria-label="Open Admin Menu"
        >
          <Menu size={20} />
        </button>

        <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
          <div
            style={{
              width: '32px',
              height: '32px',
              borderRadius: '8px',
              background: 'linear-gradient(135deg, #059669 0%, #047857 100%)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#FFFFFF',
            }}
          >
            <ChefHat size={18} />
          </div>
          <div>
            <h2 style={{ fontSize: '0.98rem', fontWeight: 800, color: '#F8FAFC', margin: 0, lineHeight: 1.1 }}>
              Spice Garden
            </h2>
            <span style={{ fontSize: '0.64rem', color: '#10B981', fontWeight: 700, letterSpacing: '0.04em' }}>
              ADMIN CONSOLE
            </span>
          </div>
        </div>

        <button
          type="button"
          onClick={handleLogout}
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            width: '36px',
            height: '36px',
            borderRadius: '8px',
            backgroundColor: 'rgba(239, 68, 68, 0.12)',
            color: '#F87171',
            border: '1px solid rgba(239, 68, 68, 0.25)',
          }}
          title="Sign Out"
        >
          <LogOut size={16} />
        </button>
      </header>

      {/* Backdrop for Mobile Drawer */}
      {mobileOpen && (
        <div
          className="admin-sidebar-backdrop"
          onClick={() => setMobileOpen(false)}
          aria-hidden="true"
        />
      )}

      {/* Sidebar (Desktop Sticky / Mobile Drawer) */}
      <aside
        className={`admin-sidebar ${mobileOpen ? 'open' : ''}`}
        style={{
          width: '280px',
          backgroundColor: '#0F172A',
          color: '#94A3B8',
          display: 'flex',
          flexDirection: 'column',
          position: 'sticky',
          top: 0,
          height: '100vh',
          zIndex: 40,
          borderRight: '1px solid #1E293B',
        }}
      >
        {/* Brand Header */}
        <div style={{ padding: '1.25rem 1.5rem', borderBottom: '1px solid #1E293B', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <div
              style={{
                width: '38px',
                height: '38px',
                borderRadius: '10px',
                background: 'linear-gradient(135deg, #059669 0%, #047857 100%)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#FFFFFF',
                boxShadow: '0 2px 8px rgba(5, 150, 105, 0.35)',
              }}
            >
              <ChefHat size={22} />
            </div>
            <div>
              <h2 style={{ fontSize: '1.15rem', fontWeight: 800, color: '#F8FAFC', lineHeight: 1.1, margin: 0 }}>
                Spice Garden
              </h2>
              <span style={{ fontSize: '0.7rem', color: '#10B981', fontWeight: 700, letterSpacing: '0.06em' }}>
                ADMIN CONSOLE
              </span>
            </div>
          </div>

          <button
            type="button"
            onClick={() => setMobileOpen(false)}
            className="mobile-sidebar-close-btn"
            style={{
              color: '#94A3B8',
              padding: '6px',
              borderRadius: '6px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
            aria-label="Close Sidebar"
          >
            <X size={20} />
          </button>
        </div>

        {/* Navigation Items */}
        <nav style={{ flex: 1, padding: '1.25rem 0.85rem', display: 'flex', flexDirection: 'column', gap: '0.35rem', overflowY: 'auto' }}>
          {navItems.map((item) => {
            const Icon = item.icon;
            return (
              <NavLink
                key={item.to}
                to={item.to}
                end={item.to === '/'}
                onClick={() => setMobileOpen(false)}
                style={({ isActive }) => ({
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.75rem',
                  padding: '0.75rem 1rem',
                  borderRadius: '8px',
                  fontSize: '0.9rem',
                  fontWeight: isActive ? 700 : 500,
                  color: isActive ? '#FFFFFF' : '#94A3B8',
                  backgroundColor: isActive ? '#1E293B' : 'transparent',
                  borderLeft: isActive ? '3px solid #10B981' : '3px solid transparent',
                  transition: 'all 0.15s ease',
                })}
              >
                <Icon size={18} />
                <span>{item.label}</span>
              </NavLink>
            );
          })}
        </nav>

        {/* Admin Profile */}
        <div style={{ padding: '1rem', borderTop: '1px solid #1E293B', backgroundColor: '#090D16' }}>
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              gap: '0.65rem',
              padding: '0.75rem 0.85rem',
              borderRadius: '12px',
              backgroundColor: '#131D2E',
              border: '1px solid #23354E',
              boxShadow: '0 2px 6px rgba(0, 0, 0, 0.25)',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem', minWidth: 0, flex: 1 }}>
              <div style={{ position: 'relative', flexShrink: 0 }}>
                <div
                  style={{
                    width: '36px',
                    height: '36px',
                    borderRadius: '50%',
                    background: 'linear-gradient(135deg, #10B981 0%, #047857 100%)',
                    color: '#FFFFFF',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontWeight: 800,
                    fontSize: '0.9rem',
                    boxShadow: '0 2px 8px rgba(16, 185, 129, 0.35)',
                    border: '2px solid rgba(255, 255, 255, 0.12)',
                  }}
                >
                  {adminUser?.name ? adminUser.name.charAt(0).toUpperCase() : 'S'}
                </div>
                <span
                  style={{
                    position: 'absolute',
                    bottom: 0,
                    right: 0,
                    width: '9px',
                    height: '9px',
                    backgroundColor: '#10B981',
                    border: '2px solid #131D2E',
                    borderRadius: '50%',
                  }}
                />
              </div>

              <div style={{ minWidth: 0, flex: 1 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '2px' }}>
                  <p
                    style={{
                      color: '#F8FAFC',
                      fontSize: '0.84rem',
                      fontWeight: 700,
                      whiteSpace: 'nowrap',
                      margin: 0,
                    }}
                  >
                    {adminUser?.name || 'Spice Garden Admin'}
                  </p>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <span
                    style={{
                      color: '#34D399',
                      fontSize: '0.64rem',
                      fontWeight: 700,
                      backgroundColor: 'rgba(16, 185, 129, 0.15)',
                      padding: '1px 5px',
                      borderRadius: '4px',
                      textTransform: 'uppercase',
                      letterSpacing: '0.04em',
                    }}
                  >
                    Super Admin
                  </span>
                  <span
                    style={{
                      color: '#64748B',
                      fontSize: '0.68rem',
                      whiteSpace: 'nowrap',
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                    }}
                  >
                    admin@spicegarden.com
                  </span>
                </div>
              </div>
            </div>

            <button
              onClick={handleLogout}
              title="Sign Out from Admin Console"
              style={{
                backgroundColor: 'rgba(239, 68, 68, 0.1)',
                border: '1px solid rgba(239, 68, 68, 0.25)',
                color: '#F87171',
                width: '32px',
                height: '32px',
                borderRadius: '8px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                cursor: 'pointer',
                flexShrink: 0,
                transition: 'all 0.2s ease',
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.backgroundColor = '#EF4444';
                e.currentTarget.style.color = '#FFFFFF';
                e.currentTarget.style.borderColor = '#DC2626';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = 'rgba(239, 68, 68, 0.1)';
                e.currentTarget.style.color = '#F87171';
                e.currentTarget.style.borderColor = 'rgba(239, 68, 68, 0.25)';
              }}
            >
              <LogOut size={15} />
            </button>
          </div>
        </div>
      </aside>

      {/* Main Content Area */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', minWidth: 0, overflowY: 'auto' }}>
        <main className="admin-main-container" style={{ flex: 1, padding: '2rem' }}>
          <Outlet />
        </main>
      </div>

      {/* Mobile Native Bottom Navigation Bar */}
      <nav className="admin-mobile-bottom-nav">
        <NavLink
          to="/"
          end
          className={({ isActive }) => `admin-bottom-nav-link ${isActive ? 'active' : ''}`}
        >
          <LayoutDashboard size={20} />
          <span>Dashboard</span>
        </NavLink>

        <NavLink
          to="/orders"
          className={({ isActive }) => `admin-bottom-nav-link ${isActive ? 'active' : ''}`}
        >
          <ShoppingBag size={20} />
          <span>Orders</span>
        </NavLink>

        <NavLink
          to="/menu"
          className={({ isActive }) => `admin-bottom-nav-link ${isActive ? 'active' : ''}`}
        >
          <UtensilsCrossed size={20} />
          <span>Menu</span>
        </NavLink>

        <NavLink
          to="/customers"
          className={({ isActive }) => `admin-bottom-nav-link ${isActive ? 'active' : ''}`}
        >
          <UserCheck size={20} />
          <span>Diners</span>
        </NavLink>

        <button
          type="button"
          onClick={() => setMobileOpen(true)}
          className="admin-bottom-nav-link"
          aria-label="Open More Menu"
        >
          <Menu size={20} />
          <span>More</span>
        </button>
      </nav>
    </div>
  );
};

export default AdminLayout;
