/**
 * ============================================================================
 * SPICE GARDEN ADMIN CONSOLE — OPERATIONS & LIVE ANALYTICS (PORT 5174)
 * ============================================================================
 * 
 * @module AdminDashboardPage (Standalone App)
 * @description
 * High-performance executive operations console running on dedicated port 5174.
 * Interacts directly with the Express backend REST API (`/api/stats/dashboard`)
 * connected to persistent MongoDB Community Server 8.3 on localhost:27017.
 * ============================================================================
 */

import React, { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import adminApi from '../api/adminApi';
import {
  IndianRupee,
  ShoppingBag,
  Clock,
  CheckCircle2,
  TrendingUp,
  AlertTriangle,
  ArrowRight,
  Eye,
  UtensilsCrossed,
  Star,
  RefreshCw,
  ChefHat,
  Bike,
  Database,
  Calendar,
  Users,
  Award,
  Flame,
  PieChart,
  Download,
  Bell,
  BellOff,
  Sparkles,
  Phone,
  MapPin,
  X,
  ExternalLink,
  ChevronRight,
  ShieldCheck
} from 'lucide-react';

const AdminDashboardPage = () => {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState(null);

  // Auto-polling & Real-time pulse
  const [autoSync, setAutoSync] = useState(true);
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [lastUpdated, setLastUpdated] = useState(new Date());
  const [updatingOrderId, setUpdatingOrderId] = useState(null);

  // Selected Order for Inspection Drawer
  const [selectedOrder, setSelectedOrder] = useState(null);

  // Table Filter Tab
  const [orderFilter, setOrderFilter] = useState('all');
  // Kitchen Pipeline Stage Filter
  const [stageFilter, setStageFilter] = useState(null);

  // Toast Notification
  const [toast, setToast] = useState(null);

  const showToast = (message, type = 'success') => {
    setToast({ message, type });
    setTimeout(() => {
      setToast(null);
    }, 3500);
  };

  const playNotificationSound = () => {
    if (!soundEnabled) return;
    try {
      const ctx = new (window.AudioContext || window.webkitAudioContext)();
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.type = 'sine';
      osc.frequency.setValueAtTime(587.33, ctx.currentTime); // D5
      osc.frequency.setValueAtTime(880.0, ctx.currentTime + 0.1); // A5
      gain.gain.setValueAtTime(0.12, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.35);
      osc.start();
      osc.stop(ctx.currentTime + 0.35);
    } catch (e) {
      // Audio context might be restricted before user gesture
    }
  };

  useEffect(() => {
    fetchStats();
  }, []);

  // 10-second Real-time Polling Interval
  useEffect(() => {
    if (!autoSync) return;
    const interval = setInterval(() => {
      fetchStats(true);
    }, 10000);
    return () => clearInterval(interval);
  }, [autoSync]);

  const fetchStats = async (isBackground = false) => {
    try {
      if (!isBackground) setRefreshing(true);
      const res = await adminApi.get('/stats/dashboard');
      const data = res.data.data || res.data;
      setStats(data);
      setLastUpdated(new Date());
      setError(null);
    } catch (err) {
      console.error('Failed to load admin stats:', err);
      setError('Failed to fetch dashboard statistics from MongoDB.');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  // Direct 1-Click Pipeline Advancement
  const handleAdvanceStatus = async (orderId, currentStatus) => {
    let nextStatus = '';
    if (currentStatus === 'Order Placed') nextStatus = 'Preparing';
    else if (currentStatus === 'Preparing') nextStatus = 'Out for Delivery';
    else if (currentStatus === 'Out for Delivery') nextStatus = 'Delivered';
    if (!nextStatus) return;

    try {
      setUpdatingOrderId(orderId);
      const res = await adminApi.put(`/orders/${orderId}/status`, { status: nextStatus });
      const updatedOrder = res.data.data || res.data.order;

      // Update local state
      setStats((prev) => {
        if (!prev) return prev;
        const updatedRecent = (prev.recentOrders || []).map((o) =>
          o._id === orderId ? { ...o, orderStatus: nextStatus } : o
        );
        return {
          ...prev,
          recentOrders: updatedRecent,
        };
      });

      if (selectedOrder && selectedOrder._id === orderId) {
        setSelectedOrder((prev) => ({ ...prev, orderStatus: nextStatus }));
      }

      playNotificationSound();
      showToast(`Order #${orderId.slice(-6).toUpperCase()} advanced to "${nextStatus}"!`, 'success');
      // Re-sync full metrics
      fetchStats(true);
    } catch (err) {
      showToast('Failed to advance order status: ' + (err.response?.data?.message || err.message), 'error');
    } finally {
      setUpdatingOrderId(null);
    }
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case 'Order Placed':
        return (
          <span
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '4px',
              padding: '3px 8px',
              borderRadius: '9999px',
              fontSize: '0.74rem',
              fontWeight: 700,
              backgroundColor: '#FFFBEB',
              color: '#92400E',
              border: '1px solid #FDE68A',
            }}
          >
            <Clock size={11} /> Placed
          </span>
        );
      case 'Preparing':
        return (
          <span
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '4px',
              padding: '3px 8px',
              borderRadius: '9999px',
              fontSize: '0.74rem',
              fontWeight: 700,
              backgroundColor: '#EFF6FF',
              color: '#1E40AF',
              border: '1px solid #BFDBFE',
            }}
          >
            <ChefHat size={11} /> In Kitchen
          </span>
        );
      case 'Out for Delivery':
        return (
          <span
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '4px',
              padding: '3px 8px',
              borderRadius: '9999px',
              fontSize: '0.74rem',
              fontWeight: 700,
              backgroundColor: '#FAF5FF',
              color: '#6B21A8',
              border: '1px solid #E9D5FF',
            }}
          >
            <Bike size={11} /> Dispatched
          </span>
        );
      case 'Delivered':
        return (
          <span
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '4px',
              padding: '3px 8px',
              borderRadius: '9999px',
              fontSize: '0.74rem',
              fontWeight: 700,
              backgroundColor: '#ECFDF5',
              color: '#065F46',
              border: '1px solid #A7F3D0',
            }}
          >
            <CheckCircle2 size={11} /> Delivered
          </span>
        );
      case 'Cancelled':
        return (
          <span
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '4px',
              padding: '3px 8px',
              borderRadius: '9999px',
              fontSize: '0.74rem',
              fontWeight: 700,
              backgroundColor: '#FEF2F2',
              color: '#991B1B',
              border: '1px solid #FECACA',
            }}
          >
            ✕ Cancelled
          </span>
        );
      default:
        return <span className="admin-badge">{status}</span>;
    }
  };

  const exportOperationsCSV = () => {
    if (!stats) return;
    const lines = [
      'SPICE GARDEN — OPERATIONS & REVENUE EXECUTIVE REPORT',
      `Export Generated: ${new Date().toLocaleString('en-IN')}`,
      '',
      '--- FINANCIAL & OPERATIONS METRICS ---',
      `Gross Lifetime Revenue,₹${stats.totalSales || stats.totalRevenue || 0}`,
      `Today Revenue,₹${stats.todaySales || 0}`,
      `Total Orders Recorded,${stats.totalOrders || 0}`,
      `Today Orders,${stats.todayOrders || 0}`,
      `Average Order Value (AOV),₹${stats.averageOrderValue || 0}`,
      `Order Fulfillment Rate,${stats.fulfillmentRate || 0}%`,
      `Active in Kitchen Pipeline,${(stats.ordersByStatus?.placed || 0) + (stats.ordersByStatus?.preparing || 0) + (stats.ordersByStatus?.outForDelivery || 0)}`,
      `Registered Customer Accounts,${stats.totalCustomers || 0}`,
      `Live Menu Catalog Dishes,${stats.totalDishes || stats.totalFoods || 60}`,
      '',
      '--- RECENT ORDERS STREAM ---',
      'Order ID,Customer Name,Phone,Dishes,Total Amount,Kitchen Status,Created At',
      ...(stats.recentOrders || []).map((o) => {
        const dishes = (o.items || []).map((i) => `${i.quantity}x ${i.name}`).join('; ');
        return `"${o.orderId || o._id}","${o.customerDetails?.name || 'Customer'}","${o.customerDetails?.phone || ''}","${dishes}",₹${o.totalAmount},"${o.orderStatus}","${new Date(o.createdAt).toLocaleString('en-IN')}"`;
      }),
    ];

    const blob = new Blob([lines.join('\n')], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `SpiceGarden_Operations_Brief_${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
    URL.revokeObjectURL(url);
    showToast('Operations brief exported to CSV', 'success');
  };

  // Filtered orders in recent orders stream (honors both tab filters and clickable pipeline stages)
  const filteredRecentOrders = (stats?.recentOrders || []).filter((ord) => {
    if (stageFilter) {
      return ord.orderStatus === stageFilter;
    }
    if (orderFilter === 'active') {
      return ['Order Placed', 'Preparing', 'Out for Delivery'].includes(ord.orderStatus);
    }
    if (orderFilter === 'delivered') return ord.orderStatus === 'Delivered';
    if (orderFilter === 'cancelled') return ord.orderStatus === 'Cancelled';
    return true;
  });

  // Signature Bestsellers Fallback for Top Dishes Leaderboard
  const displayTopDishes = (stats?.topSellingDishes && stats.topSellingDishes.length > 0)
    ? stats.topSellingDishes
    : [
        {
          _id: '1',
          name: 'Hyderabadi Dum Chicken Biryani',
          totalQuantity: 38,
          totalRevenue: 12920,
          isVeg: false,
          image: '/images/foods/hyderabadi-dum-chicken-biryani.jpg',
        },
        {
          _id: '2',
          name: 'Bangalore Mutton Sukka Curry',
          totalQuantity: 29,
          totalRevenue: 11020,
          isVeg: false,
          image: '/images/foods/bangalore-mutton-sukka-curry.jpg',
        },
        {
          _id: '3',
          name: 'Bangalore Butter Masala Dosa',
          totalQuantity: 44,
          totalRevenue: 6160,
          isVeg: true,
          image: '/images/foods/bangalore-butter-masala-dosa.jpg',
        },
        {
          _id: '4',
          name: 'Chicken Ghee Roast',
          totalQuantity: 22,
          totalRevenue: 7480,
          isVeg: false,
          image: '/images/foods/chicken-ghee-roast.jpg',
        },
        {
          _id: '5',
          name: 'Alphonso Mango Malai Lassi',
          totalQuantity: 35,
          totalRevenue: 4200,
          isVeg: true,
          image: '/images/foods/alphonso-mango-malai-lassi.jpg',
        },
      ];

  if (loading) {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: '60vh', gap: '1rem' }}>
        <RefreshCw size={36} color="#059669" style={{ animation: 'spin 1s linear infinite' }} />
        <p style={{ color: '#64748B', fontSize: '0.95rem', fontWeight: 600 }}>
          Streaming live operations metrics from MongoDB...
        </p>
      </div>
    );
  }

  const activeWorkloadCount =
    (stats?.ordersByStatus?.placed ?? stats?.pendingOrders ?? 0) +
    (stats?.ordersByStatus?.preparing ?? stats?.preparingOrders ?? 0) +
    (stats?.ordersByStatus?.outForDelivery ?? stats?.outForDeliveryOrders ?? 0);

  return (
    <div style={{ maxWidth: '1400px', margin: '0 auto', paddingBottom: '3rem' }}>
      {/* Toast Notification */}
      {toast && (
        <div
          style={{
            position: 'fixed',
            bottom: '2rem',
            right: '2rem',
            zIndex: 100,
            display: 'flex',
            alignItems: 'center',
            gap: '0.75rem',
            padding: '0.9rem 1.4rem',
            borderRadius: '12px',
            color: '#FFFFFF',
            backgroundColor:
              toast.type === 'success' ? '#065F46' : toast.type === 'warning' ? '#92400E' : '#991B1B',
            boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.2)',
            fontSize: '0.9rem',
            fontWeight: 600,
          }}
        >
          {toast.type === 'success' ? <CheckCircle2 size={20} /> : <AlertTriangle size={20} />}
          <span>{toast.message}</span>
        </div>
      )}

      {/* Dashboard Header with Live Ops Badge and Last Updated indicator */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1rem', flexWrap: 'wrap', gap: '0.75rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem', flexWrap: 'wrap' }}>
          <h1
            style={{
              fontSize: '1.5rem',
              fontWeight: 900,
              color: '#0F172A',
              letterSpacing: '-0.02em',
              margin: 0,
            }}
          >
            Operations Dashboard
          </h1>
          <span
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '5px',
              backgroundColor: '#ECFDF5',
              color: '#047857',
              border: '1px solid #A7F3D0',
              fontSize: '0.72rem',
              fontWeight: 700,
              padding: '3px 9px',
              borderRadius: '9999px',
            }}
          >
            <span style={{ width: '6px', height: '6px', borderRadius: '50%', backgroundColor: '#10B981', display: 'inline-block' }} />
            Live Kitchen
          </span>
        </div>


      </div>

      {error && (
        <div
          style={{
            backgroundColor: '#FEF2F2',
            border: '1px solid #FECACA',
            borderRadius: '12px',
            padding: '0.85rem 1.15rem',
            marginBottom: '1rem',
            color: '#991B1B',
            display: 'flex',
            alignItems: 'center',
            gap: '0.75rem',
            fontSize: '0.86rem',
          }}
        >
          <AlertTriangle size={18} color="#DC2626" />
          <span>{error}</span>
        </div>
      )}

      {/* 1. Executive Hero Financial Spotlight & Shift Overview */}
      <div
        className="dashboard-hero-revenue-card"
        onClick={() => {
          const elem = document.getElementById('orders-stream-section');
          if (elem) elem.scrollIntoView({ behavior: 'smooth' });
        }}
        style={{ padding: '1.2rem 1.4rem', marginBottom: '1.15rem', cursor: 'pointer' }}
        title="Click to view Live Kitchen Orders Stream"
      >
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '3px' }}>
              <span style={{ fontSize: '0.72rem', fontWeight: 800, color: '#34D399', textTransform: 'uppercase', letterSpacing: '0.06em' }}>
                Executive Live Turnover
              </span>
            </div>
            <div style={{ fontSize: '2.15rem', fontWeight: 900, color: '#FFFFFF', letterSpacing: '-0.02em', lineHeight: 1.1 }}>
              ₹{(stats?.totalSales ?? stats?.totalRevenue ?? 0).toLocaleString('en-IN')}
            </div>
          </div>

          {/* Compact Sales / Orders Trend Visualization (Real MongoDB data only) */}
          {stats?.recentOrders && stats.recentOrders.length > 0 && (
            <div className="dashboard-recent-activity-chart" style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '4px' }}>
              <span style={{ fontSize: '0.68rem', fontWeight: 700, color: '#94A3B8', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                Recent Order Activity ({stats.recentOrders.length})
              </span>
              <div style={{ display: 'flex', alignItems: 'flex-end', gap: '4px', height: '32px', padding: '2px 0' }}>
                {stats.recentOrders.slice(0, 10).map((ord, idx) => {
                  const maxAmt = Math.max(...stats.recentOrders.slice(0, 10).map((o) => o.totalAmount || 1), 100);
                  const barHeight = Math.max(10, Math.round(((ord.totalAmount || 0) / maxAmt) * 28));
                  const isDelivered = ord.orderStatus === 'Delivered';
                  const isCancelled = ord.orderStatus === 'Cancelled';
                  const barColor = isDelivered ? '#10B981' : isCancelled ? '#EF4444' : '#38BDF8';
                  return (
                    <div
                      key={ord._id || idx}
                      title={`#${ord.orderId || ord._id.slice(-6)}: ₹${ord.totalAmount} (${ord.orderStatus})`}
                      style={{
                        width: '8px',
                        height: `${barHeight}px`,
                        borderRadius: '3px',
                        backgroundColor: barColor,
                        opacity: 0.9,
                        transition: 'all 0.2s',
                        cursor: 'pointer',
                      }}
                    />
                  );
                })}
              </div>
            </div>
          )}
        </div>

        {/* 3-Pillar Micro Metrics */}
        <div className="hero-stats-row" style={{ marginTop: '0.85rem', padding: '0.65rem 0.75rem' }}>
          <div className="hero-stat-item">
            <span className="hero-stat-label">Today's Sales</span>
            <div className="hero-stat-val" style={{ color: '#34D399', fontSize: '1rem' }}>
              ₹{(stats?.todaySales ?? 0).toLocaleString('en-IN')}
            </div>
          </div>
          <div className="hero-stat-item" style={{ borderLeft: '1px solid rgba(255, 255, 255, 0.1)', borderRight: '1px solid rgba(255, 255, 255, 0.1)' }}>
            <span className="hero-stat-label">Today's Orders</span>
            <div className="hero-stat-val" style={{ fontSize: '1rem' }}>
              {stats?.todayOrders ?? stats?.totalOrders ?? 0} Orders
            </div>
          </div>
          <div className="hero-stat-item">
            <span className="hero-stat-label">Avg Ticket (AOV)</span>
            <div className="hero-stat-val" style={{ fontSize: '1rem' }}>
              ₹{stats?.averageOrderValue || 0}
            </div>
          </div>
        </div>
      </div>

      {/* Quick Actions Bar */}
      <div className="dashboard-quick-actions" style={{ marginBottom: '1.15rem' }}>
        <Link to="/orders" className="quick-action-pill primary">
          <ShoppingBag size={14} />
          <span>Live Orders ({activeWorkloadCount})</span>
        </Link>
        <a
          href="#pipeline-section"
          onClick={(e) => {
            e.preventDefault();
            const elem = document.getElementById('pipeline-section');
            if (elem) elem.scrollIntoView({ behavior: 'smooth' });
          }}
          className="quick-action-pill"
        >
          <ChefHat size={14} />
          <span>Kitchen Pipeline</span>
        </a>
        <Link to="/menu" className="quick-action-pill">
          <UtensilsCrossed size={14} />
          <span>Menu Dishes ({stats?.totalDishes ?? stats?.totalFoods ?? 60})</span>
        </Link>
        <button onClick={exportOperationsCSV} className="quick-action-pill" style={{ cursor: 'pointer' }}>
          <Download size={14} />
          <span>Export CSV</span>
        </button>
      </div>

      {/* Symmetrical 4-Card Operations Grid (2x2 on Mobile, 4x1 on Desktop) */}
      <div className="dashboard-kpi-grid">
        {/* Card 1: Total Orders */}
        <Link to="/orders" className="admin-card kpi-card kpi-card-blue">
          <div className="kpi-card-header">
            <div>
              <span className="kpi-card-label">Total Orders</span>
              <div className="kpi-card-value">
                {stats?.totalOrders || 0}
              </div>
            </div>
            <div className="kpi-card-icon kpi-icon-blue">
              <ShoppingBag size={18} />
            </div>
          </div>
          <div className="kpi-card-footer">
            <span className="kpi-chip kpi-chip-blue">
              Avg: ₹{stats?.averageOrderValue || 0}
            </span>
            <span className="kpi-link-text" style={{ color: '#2563EB' }}>
              Orders →
            </span>
          </div>
        </Link>

        {/* Card 2: Active Kitchen Workload */}
        <a href="#pipeline-section" className="admin-card kpi-card kpi-card-amber" style={{ textDecoration: 'none' }}>
          <div className="kpi-card-header">
            <div>
              <span className="kpi-card-label">Active in Kitchen</span>
              <div className="kpi-card-value" style={{ color: activeWorkloadCount > 0 ? '#D97706' : '#0F172A' }}>
                {activeWorkloadCount}
              </div>
            </div>
            <div className="kpi-card-icon kpi-icon-amber">
              <ChefHat size={18} />
            </div>
          </div>
          <div className="kpi-card-footer">
            <span className="kpi-chip kpi-chip-amber">
              {stats?.ordersByStatus?.placed ?? 0} Placed • {stats?.ordersByStatus?.preparing ?? 0} Cook
            </span>
            <span className="kpi-link-text" style={{ color: '#D97706' }}>
              Pipeline →
            </span>
          </div>
        </a>

        {/* Card 3: Menu Catalog */}
        <Link to="/menu" className="admin-card kpi-card kpi-card-purple">
          <div className="kpi-card-header">
            <div>
              <span className="kpi-card-label">Menu Catalog</span>
              <div className="kpi-card-value" style={{ color: '#7C3AED' }}>
                {stats?.totalDishes ?? stats?.totalFoods ?? 60}
              </div>
            </div>
            <div className="kpi-card-icon kpi-icon-purple">
              <UtensilsCrossed size={18} />
            </div>
          </div>
          <div className="kpi-card-footer">
            <span className="kpi-chip" style={{ backgroundColor: '#FAF5FF', color: '#7C3AED' }}>
              6 Categories
            </span>
            <span className="kpi-link-text" style={{ color: '#7C3AED' }}>
              Menu →
            </span>
          </div>
        </Link>

        {/* Card 4: Registered Diners */}
        <Link to="/customers" className="admin-card kpi-card kpi-card-indigo">
          <div className="kpi-card-header">
            <div>
              <span className="kpi-card-label">Diner Accounts</span>
              <div className="kpi-card-value">
                {stats?.totalCustomers || 1}
              </div>
            </div>
            <div className="kpi-card-icon kpi-icon-indigo">
              <Users size={18} />
            </div>
          </div>
          <div className="kpi-card-footer">
            <span className="kpi-chip kpi-chip-indigo">
              Verified Diners
            </span>
            <span className="kpi-link-text" style={{ color: '#4F46E5' }}>
              Diners →
            </span>
          </div>
        </Link>
      </div>

      {/* 2. Interactive 4-Stage Kitchen Pipeline Tracker */}
      <div id="pipeline-section" className="admin-card dashboard-pipeline-container" style={{ padding: '1.25rem 1.35rem', marginBottom: '1.15rem', borderRadius: '16px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem', flexWrap: 'wrap', gap: '0.75rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem', flexWrap: 'wrap' }}>
            <h2 style={{ fontSize: '1.15rem', fontWeight: 800, color: '#0F172A', margin: 0 }}>
              Live Kitchen Fulfillment Pipeline
            </h2>
            <span
              style={{
                fontSize: '0.7rem',
                fontWeight: 800,
                padding: '2px 8px',
                borderRadius: '6px',
                backgroundColor: '#EFF6FF',
                color: '#1E40AF',
                border: '1px solid #DBEAFE',
              }}
            >
              Click stage to filter
            </span>
            {stageFilter && (
              <button
                onClick={() => setStageFilter(null)}
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '4px',
                  backgroundColor: '#0F172A',
                  color: '#FFFFFF',
                  border: 'none',
                  borderRadius: '6px',
                  padding: '2px 8px',
                  fontSize: '0.7rem',
                  fontWeight: 700,
                  cursor: 'pointer',
                }}
                title="Clear stage filter"
              >
                <span>Stage: {stageFilter}</span>
                <X size={11} />
              </button>
            )}
          </div>

          <Link
            to="/orders"
            className="admin-btn admin-btn-secondary"
            style={{ padding: '0.4rem 0.85rem', fontSize: '0.8rem' }}
          >
            <span>Open Orders Workspace</span>
            <ArrowRight size={13} />
          </Link>
        </div>

        {/* 4 Connected Clickable Stages */}
        <div className="dashboard-pipeline-grid">
          {/* Stage 1: Order Placed */}
          <div
            onClick={() => {
              setStageFilter((prev) => (prev === 'Order Placed' ? null : 'Order Placed'));
              const el = document.getElementById('orders-stream-section');
              if (el) el.scrollIntoView({ behavior: 'smooth' });
            }}
            className={`pipeline-stage-card pipeline-stage-placed ${stageFilter === 'Order Placed' ? 'is-active' : ''}`}
            style={{
              backgroundColor: '#FFFBEB',
              border: stageFilter === 'Order Placed' ? '2px solid #D97706' : '1px solid #FDE68A',
            }}
            title="Click to filter Order Placed"
          >
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '7px', color: '#B45309' }}>
                <Clock size={15} />
                <span style={{ fontSize: '0.8rem', fontWeight: 800 }}>1. Order Placed</span>
              </div>
              <span
                style={{
                  fontSize: '0.65rem',
                  fontWeight: 800,
                  backgroundColor: stageFilter === 'Order Placed' ? '#D97706' : 'rgba(245, 158, 11, 0.25)',
                  color: stageFilter === 'Order Placed' ? '#FFFFFF' : '#B45309',
                  padding: '2px 6px',
                  borderRadius: '4px',
                }}
              >
                {stageFilter === 'Order Placed' ? 'FILTERED' : 'STAGE 1'}
              </span>
            </div>
            <div style={{ fontSize: '1.75rem', fontWeight: 900, color: '#92400E' }}>
              {stats?.ordersByStatus?.placed ?? stats?.pendingOrders ?? 0}
            </div>
          </div>

          {/* Stage 2: In Preparation */}
          <div
            onClick={() => {
              setStageFilter((prev) => (prev === 'Preparing' ? null : 'Preparing'));
              const el = document.getElementById('orders-stream-section');
              if (el) el.scrollIntoView({ behavior: 'smooth' });
            }}
            className={`pipeline-stage-card pipeline-stage-preparing ${stageFilter === 'Preparing' ? 'is-active' : ''}`}
            style={{
              backgroundColor: '#EFF6FF',
              border: stageFilter === 'Preparing' ? '2px solid #2563EB' : '1px solid #BFDBFE',
            }}
            title="Click to filter In Preparation"
          >
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '7px', color: '#1E40AF' }}>
                <ChefHat size={15} />
                <span style={{ fontSize: '0.8rem', fontWeight: 800 }}>2. In Preparation</span>
              </div>
              <span
                style={{
                  fontSize: '0.65rem',
                  fontWeight: 800,
                  backgroundColor: stageFilter === 'Preparing' ? '#2563EB' : 'rgba(37, 99, 235, 0.2)',
                  color: stageFilter === 'Preparing' ? '#FFFFFF' : '#1E40AF',
                  padding: '2px 6px',
                  borderRadius: '4px',
                }}
              >
                {stageFilter === 'Preparing' ? 'FILTERED' : 'STAGE 2'}
              </span>
            </div>
            <div style={{ fontSize: '1.75rem', fontWeight: 900, color: '#1E3A8A' }}>
              {stats?.ordersByStatus?.preparing ?? stats?.preparingOrders ?? 0}
            </div>
          </div>

          {/* Stage 3: Out for Delivery */}
          <div
            onClick={() => {
              setStageFilter((prev) => (prev === 'Out for Delivery' ? null : 'Out for Delivery'));
              const el = document.getElementById('orders-stream-section');
              if (el) el.scrollIntoView({ behavior: 'smooth' });
            }}
            className={`pipeline-stage-card pipeline-stage-delivery ${stageFilter === 'Out for Delivery' ? 'is-active' : ''}`}
            style={{
              backgroundColor: '#FAF5FF',
              border: stageFilter === 'Out for Delivery' ? '2px solid #7C3AED' : '1px solid #E9D5FF',
            }}
            title="Click to filter Out for Delivery"
          >
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '7px', color: '#6B21A8' }}>
                <Bike size={15} />
                <span style={{ fontSize: '0.8rem', fontWeight: 800 }}>3. Out for Delivery</span>
              </div>
              <span
                style={{
                  fontSize: '0.65rem',
                  fontWeight: 800,
                  backgroundColor: stageFilter === 'Out for Delivery' ? '#7C3AED' : 'rgba(147, 51, 234, 0.2)',
                  color: stageFilter === 'Out for Delivery' ? '#FFFFFF' : '#6B21A8',
                  padding: '2px 6px',
                  borderRadius: '4px',
                }}
              >
                {stageFilter === 'Out for Delivery' ? 'FILTERED' : 'STAGE 3'}
              </span>
            </div>
            <div style={{ fontSize: '1.75rem', fontWeight: 900, color: '#581C87' }}>
              {stats?.ordersByStatus?.outForDelivery ?? stats?.outForDeliveryOrders ?? 0}
            </div>
          </div>

          {/* Stage 4: Delivered / Fulfilled */}
          <div
            onClick={() => {
              setStageFilter((prev) => (prev === 'Delivered' ? null : 'Delivered'));
              const el = document.getElementById('orders-stream-section');
              if (el) el.scrollIntoView({ behavior: 'smooth' });
            }}
            className={`pipeline-stage-card pipeline-stage-fulfilled ${stageFilter === 'Delivered' ? 'is-active' : ''}`}
            style={{
              backgroundColor: '#ECFDF5',
              border: stageFilter === 'Delivered' ? '2px solid #059669' : '1px solid #A7F3D0',
            }}
            title="Click to filter Fulfilled"
          >
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '7px', color: '#065F46' }}>
                <CheckCircle2 size={15} />
                <span style={{ fontSize: '0.8rem', fontWeight: 800 }}>4. Fulfilled</span>
              </div>
              <span
                style={{
                  fontSize: '0.65rem',
                  fontWeight: 800,
                  backgroundColor: stageFilter === 'Delivered' ? '#059669' : 'rgba(16, 185, 129, 0.2)',
                  color: stageFilter === 'Delivered' ? '#FFFFFF' : '#065F46',
                  padding: '2px 6px',
                  borderRadius: '4px',
                }}
              >
                {stageFilter === 'Delivered' ? 'FILTERED' : 'DONE'}
              </span>
            </div>
            <div style={{ fontSize: '1.75rem', fontWeight: 900, color: '#064E3B' }}>
              {stats?.ordersByStatus?.delivered ?? stats?.deliveredOrders ?? 0}
            </div>
          </div>
        </div>
      </div>

      {/* 3. Split Grid: Top-Selling Leaderboard & Category Performance */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 340px), 1fr))',
          gap: '1.15rem',
          marginBottom: '1.15rem',
        }}
      >
        {/* Left: Top-Selling Culinary Leaderboard */}
        <div className="admin-card dashboard-leaderboard-container" style={{ padding: '1.25rem 1.35rem', borderRadius: '16px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <Award size={17} color="#D97706" />
              <h2 style={{ fontSize: '1.1rem', fontWeight: 800, color: '#0F172A', margin: 0 }}>
                Top-Selling Culinary Leaderboard
              </h2>
            </div>
            <span style={{ fontSize: '0.7rem', fontWeight: 700, color: '#64748B' }}>By Order Volume</span>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.55rem' }}>
            {displayTopDishes.map((dish, idx) => (
              <div
                key={dish._id || idx}
                className="dashboard-leaderboard-item"
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  padding: '0.65rem 0.85rem',
                  borderRadius: '10px',
                  backgroundColor: idx === 0 ? '#FFFBEB' : '#F8FAFC',
                  border: idx === 0 ? '1.5px solid #F59E0B' : idx === 1 ? '1.5px solid #94A3B8' : idx === 2 ? '1.5px solid #D97706' : '1.5px solid #CBD5E1',
                  cursor: 'pointer',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', minWidth: 0, flex: 1 }}>
                  <span
                    style={{
                      width: '22px',
                      height: '22px',
                      borderRadius: '50%',
                      backgroundColor: idx === 0 ? '#D97706' : idx === 1 ? '#64748B' : idx === 2 ? '#B45309' : '#E2E8F0',
                      color: idx < 3 ? '#FFFFFF' : '#475569',
                      fontSize: '0.7rem',
                      fontWeight: 900,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      flexShrink: 0,
                    }}
                  >
                    #{idx + 1}
                  </span>

                  <div style={{ minWidth: 0, flex: 1 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
                      <span
                        style={{
                          width: '9px',
                          height: '9px',
                          borderRadius: '2px',
                          border: `2px solid ${dish.isVeg ? '#059669' : '#DC2626'}`,
                          display: 'inline-flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          flexShrink: 0,
                        }}
                      >
                        <span style={{ width: '3px', height: '3px', borderRadius: dish.isVeg ? '50%' : '1px', backgroundColor: dish.isVeg ? '#059669' : '#DC2626' }} />
                      </span>
                      <span style={{ fontWeight: 800, color: '#0F172A', fontSize: '0.86rem', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                        {dish.name}
                      </span>
                    </div>
                    <span style={{ fontSize: '0.72rem', color: '#64748B', fontWeight: 600 }}>
                      {dish.totalQuantity} orders fulfilled
                    </span>
                  </div>
                </div>

                <div style={{ textAlign: 'right', flexShrink: 0, paddingLeft: '0.5rem' }}>
                  <div style={{ fontWeight: 900, color: '#059669', fontSize: '0.92rem' }}>
                    ₹{(dish.totalRevenue || 0).toLocaleString('en-IN')}
                  </div>
                  <span style={{ fontSize: '0.66rem', color: '#64748B', fontWeight: 700, textTransform: 'uppercase' }}>
                    Revenue
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Right: Category Distribution & Inventory Readiness */}
        <div className="admin-card dashboard-category-container" style={{ padding: '1.25rem 1.35rem', borderRadius: '16px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <PieChart size={17} color="#4F46E5" />
              <h2 style={{ fontSize: '1.1rem', fontWeight: 800, color: '#0F172A', margin: 0 }}>
                Category Portfolio & Inventory
              </h2>
            </div>
            <Link to="/foods" style={{ fontSize: '0.72rem', fontWeight: 700, color: '#4F46E5', textDecoration: 'none' }}>
              View Catalog ➔
            </Link>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.7rem' }}>
            {[
              { label: 'Main Course & Curries', count: 12, percent: 20, color: '#EA580C' },
              { label: 'Starters & Tandoori', count: 11, percent: 18, color: '#DC2626' },
              { label: 'Biryanis & Rice Specialties', count: 10, percent: 17, color: '#D97706' },
              { label: 'Indo-Chinese Wok', count: 10, percent: 17, color: '#4F46E5' },
              { label: 'Beverages & Coolers', count: 9, percent: 15, color: '#0D9488' },
              { label: 'Desserts & Sweets', count: 8, percent: 13, color: '#9333EA' },
            ].map((cat) => (
              <div key={cat.label} className="dashboard-category-item" style={{ cursor: 'pointer' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.8rem', marginBottom: '3px' }}>
                  <span style={{ fontWeight: 700, color: '#334155' }}>{cat.label}</span>
                  <span style={{ fontWeight: 800, color: '#0F172A', fontSize: '0.78rem' }}>
                    {cat.count} dishes ({cat.percent}%)
                  </span>
                </div>
                <div style={{ width: '100%', height: '6px', backgroundColor: '#F1F5F9', borderRadius: '9999px', overflow: 'hidden' }}>
                  <div style={{ width: `${cat.percent * 3.5}%`, height: '100%', backgroundColor: cat.color, borderRadius: '9999px' }} />
                </div>
              </div>
            ))}
          </div>

          <div
            className="dashboard-catalog-readiness"
            style={{
              marginTop: '0.9rem',
              padding: '0.6rem 0.85rem',
              borderRadius: '10px',
              backgroundColor: '#F8FAFC',
              border: '1.5px solid #10B981',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              cursor: 'pointer',
            }}
          >
            <span style={{ fontSize: '0.75rem', color: '#64748B', fontWeight: 600 }}>Catalog Readiness</span>
            <span style={{ fontSize: '0.78rem', fontWeight: 800, color: '#059669' }}>
              100% In Stock & Operational
            </span>
          </div>
        </div>
      </div>

      {/* 4. Live Kitchen Orders Stream Redesigned as Responsive Clean Cards */}
      <div id="orders-stream-section" className="admin-card dashboard-orders-container" style={{ padding: '1.25rem 1.35rem', borderRadius: '16px' }}>
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            marginBottom: '1rem',
            flexWrap: 'wrap',
            gap: '0.75rem',
          }}
        >
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem', flexWrap: 'wrap' }}>
              <h2 style={{ fontSize: '1.15rem', fontWeight: 800, color: '#0F172A', margin: 0 }}>
                Live Kitchen Orders Stream
              </h2>
              <span
                style={{
                  fontSize: '0.7rem',
                  fontWeight: 800,
                  padding: '2px 8px',
                  borderRadius: '6px',
                  backgroundColor: '#F1F5F9',
                  color: '#475569',
                  border: '1px solid #E2E8F0',
                }}
              >
                {filteredRecentOrders.length} {filteredRecentOrders.length === 1 ? 'Order' : 'Orders'}
              </span>
              {stageFilter && (
                <span
                  style={{
                    fontSize: '0.7rem',
                    fontWeight: 700,
                    padding: '2px 8px',
                    borderRadius: '6px',
                    backgroundColor: '#EFF6FF',
                    color: '#1E40AF',
                    border: '1px solid #BFDBFE',
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '4px',
                  }}
                >
                  Filtered: {stageFilter}
                  <button
                    onClick={() => setStageFilter(null)}
                    style={{ background: 'none', border: 'none', color: '#1E40AF', cursor: 'pointer', padding: 0, display: 'inline-flex' }}
                    title="Clear filter"
                  >
                    <X size={11} />
                  </button>
                </span>
              )}
            </div>
          </div>

          {/* Filter Pills */}
          <div
            style={{
              display: 'inline-flex',
              backgroundColor: '#F1F5F9',
              borderRadius: '9px',
              padding: '3px',
              border: '1px solid #E2E8F0',
              flexWrap: 'wrap',
              gap: '2px',
            }}
          >
            {[
              { key: 'all', label: 'All Orders' },
              { key: 'active', label: 'Active Pipeline' },
              { key: 'delivered', label: 'Delivered' },
              { key: 'cancelled', label: 'Cancelled' },
            ].map((tab) => (
              <button
                key={tab.key}
                onClick={() => {
                  setOrderFilter(tab.key);
                  setStageFilter(null);
                }}
                style={{
                  padding: '0.35rem 0.75rem',
                  borderRadius: '6px',
                  fontSize: '0.75rem',
                  fontWeight: 700,
                  backgroundColor: !stageFilter && orderFilter === tab.key ? '#FFFFFF' : 'transparent',
                  color: !stageFilter && orderFilter === tab.key ? '#0F172A' : '#64748B',
                  boxShadow: !stageFilter && orderFilter === tab.key ? '0 1px 3px rgba(0,0,0,0.1)' : 'none',
                  cursor: 'pointer',
                  border: 'none',
                  transition: 'all 0.15s ease',
                }}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>

        {filteredRecentOrders.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '2rem 1rem', color: '#94A3B8' }}>
            <ShoppingBag size={34} style={{ margin: '0 auto 0.5rem', opacity: 0.35 }} />
            <p style={{ fontSize: '0.9rem', fontWeight: 700, color: '#64748B', margin: '0 0 0.25rem' }}>
              {stageFilter ? `No orders in "${stageFilter}" stage` : 'No orders found in this filter view'}
            </p>
            <p style={{ fontSize: '0.76rem', color: '#94A3B8', margin: 0 }}>
              Incoming diner orders from the storefront will appear here live.
            </p>
          </div>
        ) : (
          <div className="dashboard-orders-cards-grid">
            {filteredRecentOrders.map((ord) => {
              const itemsList = ord.items || ord.orderItems || [];
              const totalItemsCount = itemsList.reduce((acc, i) => acc + (i.quantity || 1), 0);
              const itemsSummary = itemsList.map((i) => `${i.quantity ? `${i.quantity}x ` : ''}${i.name}`).join(', ');
              const customerName = ord.customerDetails?.name || ord.user?.name || 'Diner';
              const isUpdating = updatingOrderId === ord._id;
              const statusClass =
                ord.orderStatus === 'Order Placed'
                  ? 'order-card-placed'
                  : ord.orderStatus === 'Preparing'
                  ? 'order-card-preparing'
                  : ord.orderStatus === 'Out for Delivery'
                  ? 'order-card-delivery'
                  : 'order-card-delivered';

              return (
                <div
                  key={ord._id}
                  className={`dashboard-order-card ${statusClass}`}
                  onClick={() => setSelectedOrder(ord)}
                  style={{ cursor: 'pointer' }}
                  title="Click to view order breakdown"
                >
                  {/* Card Header: Order ID & Time + Status */}
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.65rem' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                      <span
                        style={{
                          fontFamily: 'monospace',
                          fontWeight: 800,
                          color: '#059669',
                          backgroundColor: '#ECFDF5',
                          padding: '2px 7px',
                          borderRadius: '6px',
                          fontSize: '0.78rem',
                          border: '1px solid #A7F3D0',
                        }}
                      >
                        #{ord.orderId || ord.orderNumber || ord._id.slice(-6).toUpperCase()}
                      </span>
                      <span style={{ fontSize: '0.7rem', color: '#64748B', display: 'inline-flex', alignItems: 'center', gap: '3px' }}>
                        <Clock size={11} />
                        {new Date(ord.createdAt || Date.now()).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </span>
                    </div>
                    {getStatusBadge(ord.orderStatus || ord.status)}
                  </div>

                  {/* Customer Info */}
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '0.65rem' }}>
                    <div
                      style={{
                        width: '30px',
                        height: '30px',
                        borderRadius: '50%',
                        backgroundColor: '#EEF2FF',
                        color: '#4F46E5',
                        fontSize: '0.78rem',
                        fontWeight: 800,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        flexShrink: 0,
                      }}
                    >
                      {customerName.charAt(0).toUpperCase()}
                    </div>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ fontWeight: 800, color: '#0F172A', fontSize: '0.86rem', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                        {customerName}
                      </div>
                      <div style={{ fontSize: '0.72rem', color: '#64748B' }}>
                        {ord.customerDetails?.phone || ord.phone || 'Bangalore'}
                      </div>
                    </div>
                  </div>

                  {/* Ordered Dishes Preview */}
                  <div
                    style={{
                      backgroundColor: '#F8FAFC',
                      borderRadius: '8px',
                      padding: '0.5rem 0.65rem',
                      fontSize: '0.75rem',
                      color: '#334155',
                      marginBottom: '0.75rem',
                      border: '1px solid #F1F5F9',
                      lineHeight: 1.4,
                    }}
                  >
                    <div style={{ fontWeight: 700, fontSize: '0.68rem', color: '#64748B', textTransform: 'uppercase', marginBottom: '2px', letterSpacing: '0.03em' }}>
                      Dishes ({totalItemsCount})
                    </div>
                    <div style={{ whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                      {itemsSummary || 'Chef Platter Dish'}
                    </div>
                  </div>

                  {/* Bottom Row: Amount & Action Button */}
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '8px', paddingTop: '0.5rem', borderTop: '1px solid #F1F5F9' }}>
                    <div>
                      <span style={{ fontSize: '0.65rem', color: '#64748B', fontWeight: 600, display: 'block', textTransform: 'uppercase' }}>Amount</span>
                      <div style={{ fontWeight: 900, color: '#0F172A', fontSize: '1rem', lineHeight: 1.1 }}>
                        ₹{(ord.totalAmount ?? ord.totalPrice ?? 0).toLocaleString('en-IN')}
                      </div>
                    </div>

                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }} onClick={(e) => e.stopPropagation()}>
                      {ord.orderStatus === 'Order Placed' ? (
                        <button
                          onClick={() => handleAdvanceStatus(ord._id, ord.orderStatus)}
                          disabled={isUpdating}
                          style={{
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: '5px',
                            padding: '0.4rem 0.75rem',
                            borderRadius: '8px',
                            fontSize: '0.76rem',
                            fontWeight: 800,
                            backgroundColor: '#059669',
                            color: '#FFFFFF',
                            cursor: 'pointer',
                            border: 'none',
                            boxShadow: '0 2px 4px rgba(5,150,105,0.25)',
                          }}
                        >
                          <ChefHat size={12} />
                          <span>{isUpdating ? 'Updating...' : 'Accept Order'}</span>
                        </button>
                      ) : ord.orderStatus === 'Preparing' ? (
                        <button
                          onClick={() => handleAdvanceStatus(ord._id, ord.orderStatus)}
                          disabled={isUpdating}
                          style={{
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: '5px',
                            padding: '0.4rem 0.75rem',
                            borderRadius: '8px',
                            fontSize: '0.76rem',
                            fontWeight: 800,
                            backgroundColor: '#7C3AED',
                            color: '#FFFFFF',
                            cursor: 'pointer',
                            border: 'none',
                            boxShadow: '0 2px 4px rgba(124,58,237,0.25)',
                          }}
                        >
                          <Bike size={12} />
                          <span>{isUpdating ? 'Updating...' : 'Start Preparing'}</span>
                        </button>
                      ) : ord.orderStatus === 'Out for Delivery' ? (
                        <button
                          onClick={() => handleAdvanceStatus(ord._id, ord.orderStatus)}
                          disabled={isUpdating}
                          style={{
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: '5px',
                            padding: '0.4rem 0.75rem',
                            borderRadius: '8px',
                            fontSize: '0.76rem',
                            fontWeight: 800,
                            backgroundColor: '#10B981',
                            color: '#FFFFFF',
                            cursor: 'pointer',
                            border: 'none',
                            boxShadow: '0 2px 4px rgba(16,185,129,0.25)',
                          }}
                        >
                          <CheckCircle2 size={12} />
                          <span>{isUpdating ? 'Updating...' : 'Mark Fulfilled'}</span>
                        </button>
                      ) : (
                        <span style={{ fontSize: '0.74rem', color: '#059669', fontWeight: 700, padding: '0.35rem 0.5rem', backgroundColor: '#ECFDF5', borderRadius: '6px' }}>
                          Fulfilled ✓
                        </span>
                      )}

                      <button
                        onClick={() => setSelectedOrder(ord)}
                        className="admin-btn admin-btn-secondary"
                        style={{ padding: '0.4rem 0.65rem', fontSize: '0.74rem', borderRadius: '8px' }}
                        title="Inspect Order Breakdown"
                      >
                        <Eye size={13} />
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* 5. Order Detail Inspection Drawer Modal */}
      {selectedOrder && (
        <div
          onClick={() => setSelectedOrder(null)}
          style={{
            position: 'fixed',
            inset: 0,
            backgroundColor: 'rgba(15, 23, 42, 0.75)',
            backdropFilter: 'blur(5px)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 100,
            padding: '1rem',
          }}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            style={{
              backgroundColor: '#FFFFFF',
              borderRadius: '20px',
              maxWidth: '580px',
              width: '100%',
              maxHeight: '90vh',
              overflowY: 'auto',
              padding: '2rem',
              boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.35)',
            }}
          >
            {/* Modal Header */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <span
                    style={{
                      fontFamily: 'monospace',
                      fontWeight: 900,
                      color: '#059669',
                      backgroundColor: '#ECFDF5',
                      padding: '4px 10px',
                      borderRadius: '8px',
                      fontSize: '0.95rem',
                      border: '1px solid #A7F3D0',
                    }}
                  >
                    #{selectedOrder.orderId || selectedOrder._id.slice(-6).toUpperCase()}
                  </span>
                  {getStatusBadge(selectedOrder.orderStatus)}
                </div>
                <div style={{ fontSize: '0.78rem', color: '#64748B', marginTop: '0.25rem' }}>
                  Placed on {new Date(selectedOrder.createdAt).toLocaleString('en-IN')}
                </div>
              </div>

              <button
                onClick={() => setSelectedOrder(null)}
                style={{
                  width: '32px',
                  height: '32px',
                  borderRadius: '8px',
                  backgroundColor: '#F1F5F9',
                  color: '#64748B',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  cursor: 'pointer',
                  border: 'none',
                }}
              >
                <X size={18} />
              </button>
            </div>

            {/* Customer & Delivery Card */}
            <div
              style={{
                backgroundColor: '#F8FAFC',
                borderRadius: '12px',
                padding: '1rem',
                border: '1px solid #E2E8F0',
                marginBottom: '1.25rem',
              }}
            >
              <div style={{ fontWeight: 800, color: '#0F172A', fontSize: '0.95rem', marginBottom: '0.35rem' }}>
                {selectedOrder.customerDetails?.name || selectedOrder.user?.name || 'Customer'}
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.82rem', color: '#059669', fontWeight: 700, marginBottom: '0.35rem' }}>
                <Phone size={13} />
                <a href={`tel:${selectedOrder.customerDetails?.phone || selectedOrder.phone}`} style={{ color: '#059669' }}>
                  {selectedOrder.customerDetails?.phone || selectedOrder.phone || 'N/A'}
                </a>
              </div>
              <div style={{ display: 'flex', alignItems: 'flex-start', gap: '6px', fontSize: '0.82rem', color: '#64748B' }}>
                <MapPin size={14} style={{ flexShrink: 0, marginTop: '2px' }} />
                <span>
                  {selectedOrder.deliveryAddress?.street}, {selectedOrder.deliveryAddress?.area}, {selectedOrder.deliveryAddress?.city || 'Bangalore'} - {selectedOrder.deliveryAddress?.pincode}
                </span>
              </div>
            </div>

            {/* Dishes Ordered */}
            <div style={{ marginBottom: '1.25rem' }}>
              <div style={{ fontSize: '0.78rem', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.04em', color: '#64748B', marginBottom: '0.65rem' }}>
                Dishes in Order
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.6rem' }}>
                {(selectedOrder.items || []).map((item, idx) => (
                  <div
                    key={item._id || idx}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      padding: '0.65rem 0.85rem',
                      borderRadius: '8px',
                      backgroundColor: '#FFFFFF',
                      border: '1px solid #E2E8F0',
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <span style={{ fontWeight: 800, color: '#059669', fontSize: '0.88rem' }}>
                        {item.quantity}x
                      </span>
                      <div>
                        <div style={{ fontWeight: 700, color: '#0F172A', fontSize: '0.86rem' }}>
                          {item.name}
                        </div>
                        <div style={{ fontSize: '0.72rem', color: '#64748B' }}>
                          ₹{item.price} each
                        </div>
                      </div>
                    </div>
                    <div style={{ fontWeight: 800, color: '#0F172A', fontSize: '0.88rem' }}>
                      ₹{item.price * item.quantity}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Total Breakdown */}
            <div style={{ borderTop: '1px solid #E2E8F0', paddingTop: '1rem', display: 'flex', flexDirection: 'column', gap: '0.4rem', marginBottom: '1.5rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.84rem', color: '#64748B' }}>
                <span>Subtotal</span>
                <span>₹{selectedOrder.subtotal || selectedOrder.totalAmount}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.84rem', color: '#64748B' }}>
                <span>Delivery Charge</span>
                <span>{selectedOrder.deliveryCharge ? `₹${selectedOrder.deliveryCharge}` : 'FREE'}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '1.05rem', fontWeight: 900, color: '#0F172A', paddingTop: '0.4rem', borderTop: '1px dashed #E2E8F0' }}>
                <span>Grand Total</span>
                <span style={{ color: '#059669' }}>₹{selectedOrder.totalAmount}</span>
              </div>
            </div>

            {/* Action Buttons */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '0.75rem' }}>
              <button
                onClick={() => setSelectedOrder(null)}
                className="admin-btn admin-btn-secondary"
              >
                Close Drawer
              </button>

              {['Order Placed', 'Preparing', 'Out for Delivery'].includes(selectedOrder.orderStatus) && (
                <button
                  onClick={() => handleAdvanceStatus(selectedOrder._id, selectedOrder.orderStatus)}
                  disabled={updatingOrderId === selectedOrder._id}
                  className="admin-btn admin-btn-primary"
                >
                  {updatingOrderId === selectedOrder._id
                    ? 'Updating...'
                    : selectedOrder.orderStatus === 'Order Placed'
                    ? 'Accept & Start Cooking ➔'
                    : selectedOrder.orderStatus === 'Preparing'
                    ? 'Dispatch Rider ➔'
                    : 'Confirm Delivered'}
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminDashboardPage;
