import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAdminAuth } from '../context/AdminAuthContext';
import { ShieldCheck, ChefHat } from 'lucide-react';

const AdminProtectedRoute = ({ children }) => {
  const { isAuthenticated, loading } = useAdminAuth();

  if (loading) {
    return (
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          minHeight: '100vh',
          backgroundColor: '#070D18',
          backgroundImage: `
            radial-gradient(circle at 50% 35%, rgba(16, 185, 129, 0.15) 0%, transparent 60%),
            radial-gradient(circle at 80% 80%, rgba(59, 130, 246, 0.08) 0%, transparent 50%)
          `,
          position: 'relative',
          overflow: 'hidden',
          fontFamily: "'Plus Jakarta Sans', system-ui, sans-serif",
        }}
      >
        {/* Subtle Ambient Grid Background */}
        <div
          style={{
            position: 'absolute',
            inset: 0,
            backgroundImage: `linear-gradient(rgba(255, 255, 255, 0.02) 1px, transparent 1px), linear-gradient(90deg, rgba(255, 255, 255, 0.02) 1px, transparent 1px)`,
            backgroundSize: '40px 40px',
            pointerEvents: 'none',
          }}
        />

        {/* Central Glassmorphic Loader Card */}
        <div
          style={{
            position: 'relative',
            zIndex: 1,
            backgroundColor: 'rgba(15, 23, 42, 0.85)',
            backdropFilter: 'blur(20px)',
            WebkitBackdropFilter: 'blur(20px)',
            border: '1px solid rgba(255, 255, 255, 0.1)',
            borderRadius: '24px',
            padding: '2.75rem 3.25rem',
            textAlign: 'center',
            maxWidth: '440px',
            width: '90%',
            boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.7), 0 0 50px rgba(16, 185, 129, 0.15)',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
          }}
        >
          {/* Animated Glowing Dual-Ring Badge */}
          <div style={{ position: 'relative', width: '84px', height: '84px', marginBottom: '1.75rem' }}>
            {/* Outer spinning ring */}
            <div
              style={{
                position: 'absolute',
                inset: 0,
                borderRadius: '50%',
                border: '3px solid transparent',
                borderTopColor: '#10B981',
                borderRightColor: '#059669',
                animation: 'adminSpin 1.4s cubic-bezier(0.68, -0.55, 0.27, 1.55) infinite',
              }}
            />
            {/* Inner reverse ring */}
            <div
              style={{
                position: 'absolute',
                inset: '6px',
                borderRadius: '50%',
                border: '2px dashed rgba(52, 211, 153, 0.4)',
                animation: 'adminSpinReverse 3s linear infinite',
              }}
            />
            {/* Center Monogram Logo */}
            <div
              style={{
                position: 'absolute',
                inset: '12px',
                borderRadius: '16px',
                background: 'linear-gradient(135deg, #10B981 0%, #047857 100%)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#FFFFFF',
                boxShadow: '0 4px 15px rgba(16, 185, 129, 0.4)',
              }}
            >
              <ChefHat size={28} color="#FFFFFF" />
            </div>
          </div>

          {/* Title & Brand */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '0.35rem' }}>
            <span style={{ fontSize: '1.25rem', fontWeight: 800, color: '#F8FAFC', letterSpacing: '-0.02em' }}>
              Spice Garden
            </span>
            <span
              style={{
                fontSize: '0.68rem',
                fontWeight: 800,
                color: '#34D399',
                backgroundColor: 'rgba(16, 185, 129, 0.15)',
                padding: '2px 8px',
                borderRadius: '6px',
                letterSpacing: '0.05em',
              }}
            >
              ENTERPRISE
            </span>
          </div>

          <p style={{ color: '#94A3B8', fontSize: '0.88rem', fontWeight: 500, marginBottom: '1.75rem' }}>
            Verifying administrative credentials & security handshake...
          </p>

          {/* Smooth Linear Progress Bar */}
          <div
            style={{
              width: '100%',
              height: '4px',
              backgroundColor: 'rgba(255, 255, 255, 0.08)',
              borderRadius: '999px',
              overflow: 'hidden',
              position: 'relative',
              marginBottom: '1.5rem',
            }}
          >
            <div
              style={{
                position: 'absolute',
                top: 0,
                bottom: 0,
                width: '45%',
                borderRadius: '999px',
                background: 'linear-gradient(90deg, #10B981, #34D399)',
                boxShadow: '0 0 12px #10B981',
                animation: 'adminProgress 1.6s ease-in-out infinite',
              }}
            />
          </div>

          {/* Secure Handshake Chip */}
          <div
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '6px',
              padding: '0.4rem 0.85rem',
              borderRadius: '999px',
              backgroundColor: 'rgba(255, 255, 255, 0.04)',
              border: '1px solid rgba(255, 255, 255, 0.08)',
              color: '#64748B',
              fontSize: '0.74rem',
              fontWeight: 600,
            }}
          >
            <ShieldCheck size={14} color="#10B981" />
            <span>Secure Admin Authentication</span>
          </div>
        </div>

        {/* Global Keyframe Styles */}
        <style>{`
          @keyframes adminSpin {
            0% { transform: rotate(0deg); }
            100% { transform: rotate(360deg); }
          }
          @keyframes adminSpinReverse {
            0% { transform: rotate(360deg); }
            100% { transform: rotate(0deg); }
          }
          @keyframes adminProgress {
            0% { left: -45%; }
            50% { left: 40%; width: 55%; }
            100% { left: 105%; }
          }
        `}</style>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  return children;
};

export default AdminProtectedRoute;
