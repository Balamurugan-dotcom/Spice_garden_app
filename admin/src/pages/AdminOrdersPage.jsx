import React, { useState, useEffect } from 'react';
import adminApi from '../api/adminApi';
import {
  Search,
  Eye,
  Download,
  CheckCircle2,
  Clock,
  Bike,
  XCircle,
  X,
  RefreshCw,
  ShoppingBag,
  IndianRupee,
  MapPin,
  Phone,
  ChefHat,
  ArrowRight,
  ExternalLink,
  ChevronRight,
  Sparkles,
  PackageCheck,
  ChevronDown
} from 'lucide-react';

const AdminOrdersPage = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [filterStatus, setFilterStatus] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [updatingId, setUpdatingId] = useState(null);

  useEffect(() => {
    fetchOrders();
  }, [filterStatus]);

  const fetchOrders = async () => {
    try {
      setRefreshing(true);
      const url = filterStatus ? `/orders?status=${encodeURIComponent(filterStatus)}` : '/orders';
      const res = await adminApi.get(url);
      setOrders(res.data.data || res.data.orders || []);
    } catch (err) {
      console.error('Failed to fetch orders from MongoDB:', err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const handleUpdateStatus = async (orderId, newStatus) => {
    try {
      setUpdatingId(orderId);
      const res = await adminApi.put(`/orders/${orderId}/status`, { status: newStatus });
      const updatedOrder = res.data.data || res.data.order;
      if (updatedOrder) {
        setOrders((prev) => prev.map((o) => (o._id === orderId ? updatedOrder : o)));
        if (selectedOrder && selectedOrder._id === orderId) {
          setSelectedOrder(updatedOrder);
        }
      } else {
        fetchOrders();
      }
    } catch (err) {
      alert('Could not update order status: ' + (err.response?.data?.message || err.message));
    } finally {
      setUpdatingId(null);
    }
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case 'Order Placed':
        return (
          <span style={{ display: 'inline-flex', alignItems: 'center', gap: '5px', padding: '3px 9px', borderRadius: '999px', fontSize: '0.74rem', fontWeight: 700, backgroundColor: '#FFFBEB', color: '#92400E', border: '1px solid #FDE68A' }}>
            <Clock size={12} /> Order Placed
          </span>
        );
      case 'Preparing':
        return (
          <span style={{ display: 'inline-flex', alignItems: 'center', gap: '5px', padding: '3px 9px', borderRadius: '999px', fontSize: '0.74rem', fontWeight: 700, backgroundColor: '#EFF6FF', color: '#1E40AF', border: '1px solid #BFDBFE' }}>
            <ChefHat size={12} /> In Kitchen
          </span>
        );
      case 'Out for Delivery':
        return (
          <span style={{ display: 'inline-flex', alignItems: 'center', gap: '5px', padding: '3px 9px', borderRadius: '999px', fontSize: '0.74rem', fontWeight: 700, backgroundColor: '#FAF5FF', color: '#6B21A8', border: '1px solid #E9D5FF' }}>
            <Bike size={12} /> Out for Delivery
          </span>
        );
      case 'Delivered':
        return (
          <span style={{ display: 'inline-flex', alignItems: 'center', gap: '5px', padding: '3px 9px', borderRadius: '999px', fontSize: '0.74rem', fontWeight: 700, backgroundColor: '#ECFDF5', color: '#065F46', border: '1px solid #A7F3D0' }}>
            <CheckCircle2 size={12} /> Fulfilled / Delivered
          </span>
        );
      case 'Cancelled':
        return (
          <span style={{ display: 'inline-flex', alignItems: 'center', gap: '5px', padding: '3px 9px', borderRadius: '999px', fontSize: '0.74rem', fontWeight: 700, backgroundColor: '#FEF2F2', color: '#991B1B', border: '1px solid #FECACA' }}>
            <XCircle size={12} /> Cancelled
          </span>
        );
      default:
        return <span className="admin-badge">{status}</span>;
    }
  };

  const handleExportCSV = () => {
    const headers = ['Order ID,Customer,Phone,Total (INR),Status,Payment Method,Created At'];
    const rows = filteredOrders.map((o) =>
      `"${o.orderNumber || o.orderId || o._id.slice(-6).toUpperCase()}","${(o.user?.name || o.customerDetails?.name || 'Walk-in').replace(/"/g, '""')}","${o.customerDetails?.phone || o.phone || 'N/A'}",${o.totalPrice || o.totalAmount || 0},"${o.orderStatus || o.status}","${o.paymentMethod || 'COD'}","${new Date(o.createdAt).toISOString()}"`
    );
    const blob = new Blob([[headers, ...rows].join('\n')], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `Spice_Garden_Orders_${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  // Stage Count Computations
  const countPlaced = orders.filter((o) => (o.orderStatus || o.status) === 'Order Placed').length;
  const countPrep = orders.filter((o) => (o.orderStatus || o.status) === 'Preparing').length;
  const countDelivery = orders.filter((o) => (o.orderStatus || o.status) === 'Out for Delivery').length;
  const countDelivered = orders.filter((o) => (o.orderStatus || o.status) === 'Delivered').length;
  const countCancelled = orders.filter((o) => (o.orderStatus || o.status) === 'Cancelled').length;

  const filteredOrders = orders.filter((order) => {
    const term = searchTerm.toLowerCase();
    const idMatch = (order.orderNumber || order.orderId || order._id).toLowerCase().includes(term);
    const nameMatch = (order.user?.name || order.customerDetails?.name || '').toLowerCase().includes(term);
    const phoneMatch = (order.phone || order.customerDetails?.phone || '').includes(term);
    return idMatch || nameMatch || phoneMatch;
  });

  const totalFilteredValue = filteredOrders.reduce((acc, o) => acc + (o.totalPrice || o.totalAmount || 0), 0);

  if (loading) {
    return (
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '50vh' }}>
        <div style={{ textAlign: 'center' }}>
          <RefreshCw size={36} color="#059669" style={{ animation: 'spin 1s linear infinite', margin: '0 auto 1rem' }} />
          <p style={{ color: '#64748B', fontSize: '0.9rem', fontWeight: 600 }}>Loading orders pipeline from MongoDB...</p>
        </div>
      </div>
    );
  }

  return (
    <div style={{ animation: 'fadeIn 0.3s ease-in-out' }}>
      {/* Header */}
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: '1.25rem',
          marginBottom: '2rem',
          paddingBottom: '1.5rem',
          borderBottom: '1px solid #E2E8F0',
        }}
      >
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <h1 style={{ fontSize: '1.85rem', fontWeight: 800, color: '#0F172A', letterSpacing: '-0.02em', margin: 0 }}>
              Kitchen Orders Pipeline
            </h1>
            <span
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '6px',
                padding: '4px 10px',
                borderRadius: '999px',
                backgroundColor: '#ECFDF5',
                border: '1px solid #A7F3D0',
                color: '#065F46',
                fontSize: '0.74rem',
                fontWeight: 700,
              }}
            >
              <Sparkles size={12} color="#059669" />
              {orders.length} Active Records
            </span>
          </div>
          <p style={{ color: '#64748B', fontSize: '0.92rem', marginTop: '0.35rem', fontWeight: 500 }}>
            Real-time kitchen order dispatching, 1-click stage advancement, and customer order management
          </p>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <button
            onClick={handleExportCSV}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '0.5rem',
              padding: '0.65rem 1.15rem',
              borderRadius: '10px',
              backgroundColor: '#FFFFFF',
              border: '1px solid #CBD5E1',
              color: '#334155',
              fontSize: '0.85rem',
              fontWeight: 600,
              cursor: 'pointer',
              boxShadow: '0 1px 2px rgba(0, 0, 0, 0.05)',
              transition: 'all 0.2s ease',
            }}
            onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = '#F8FAFC'; }}
            onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = '#FFFFFF'; }}
          >
            <Download size={15} />
            <span>Export CSV</span>
          </button>

          <button
            onClick={fetchOrders}
            disabled={refreshing}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '0.5rem',
              padding: '0.65rem 1.15rem',
              borderRadius: '10px',
              backgroundColor: '#FFFFFF',
              border: '1px solid #CBD5E1',
              color: '#334155',
              fontSize: '0.85rem',
              fontWeight: 600,
              cursor: refreshing ? 'not-allowed' : 'pointer',
              boxShadow: '0 1px 2px rgba(0, 0, 0, 0.05)',
              transition: 'all 0.2s ease',
            }}
            onMouseEnter={(e) => { if (!refreshing) e.currentTarget.style.backgroundColor = '#F8FAFC'; }}
            onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = '#FFFFFF'; }}
            title="Refresh orders from MongoDB"
          >
            <RefreshCw size={15} style={{ animation: refreshing ? 'spin 1s linear infinite' : 'none' }} />
            <span>{refreshing ? 'Updating...' : 'Sync Pipeline'}</span>
          </button>
        </div>
      </div>

      {/* 3. Status Filter Tabs with Live Count Badges */}
      <div
        style={{
          display: 'flex',
          gap: '0.5rem',
          marginBottom: '1.5rem',
          flexWrap: 'wrap',
          backgroundColor: '#F1F5F9',
          padding: '6px',
          borderRadius: '14px',
          width: 'fit-content',
        }}
      >
        {[
          { key: '', label: 'All Orders', count: orders.length, color: '#0F172A' },
          { key: 'Order Placed', label: '1. Order Placed', count: countPlaced, color: '#B45309' },
          { key: 'Preparing', label: '2. In Kitchen', count: countPrep, color: '#1E40AF' },
          { key: 'Out for Delivery', label: '3. Out for Delivery', count: countDelivery, color: '#6B21A8' },
          { key: 'Delivered', label: '4. Delivered', count: countDelivered, color: '#065F46' },
          { key: 'Cancelled', label: 'Cancelled', count: countCancelled, color: '#991B1B' },
        ].map((tab) => {
          const isActive = filterStatus === tab.key;
          return (
            <button
              key={tab.key}
              onClick={() => setFilterStatus(tab.key)}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '6px',
                backgroundColor: isActive ? '#FFFFFF' : 'transparent',
                color: isActive ? '#0F172A' : '#64748B',
                fontWeight: isActive ? 700 : 600,
                borderRadius: '9px',
                padding: '0.5rem 1rem',
                fontSize: '0.82rem',
                boxShadow: isActive ? '0 1px 3px rgba(0,0,0,0.1)' : 'none',
                transition: 'all 0.15s ease',
                cursor: 'pointer',
              }}
            >
              <span>{tab.label}</span>
              <span
                style={{
                  fontSize: '0.72rem',
                  fontWeight: 800,
                  padding: '1px 6px',
                  borderRadius: '999px',
                  backgroundColor: isActive ? '#F1F5F9' : 'rgba(0,0,0,0.06)',
                  color: isActive ? tab.color : '#64748B',
                }}
              >
                {tab.count}
              </span>
            </button>
          );
        })}
      </div>

      {/* Search & Telemetry Bar */}
      <div
        className="admin-card"
        style={{
          padding: '1.25rem',
          marginBottom: '1.5rem',
          display: 'flex',
          flexWrap: 'wrap',
          gap: '1rem',
          alignItems: 'center',
          justifyContent: 'space-between',
          borderRadius: '14px',
        }}
      >
        <div style={{ position: 'relative', flex: '1 1 300px' }}>
          <Search size={18} style={{ position: 'absolute', left: '0.85rem', top: '50%', transform: 'translateY(-50%)', color: '#94A3B8' }} />
          <input
            type="text"
            className="admin-input"
            placeholder="Search by Order ID, customer name, or phone number..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            style={{ paddingLeft: '2.5rem', borderRadius: '10px' }}
          />
        </div>

        <div style={{ fontSize: '0.88rem', color: '#475569', fontWeight: 600 }}>
          Live Pipeline Value: <strong style={{ color: '#059669', fontSize: '1.05rem' }}>₹{totalFilteredValue.toLocaleString('en-IN')}</strong> ({filteredOrders.length} orders shown)
        </div>
      </div>

      {/* Orders Table with Direct 1-Click Pipeline Advances */}
      <div className="admin-table-container" style={{ border: '1px solid #E2E8F0', borderRadius: '14px' }}>
        <table className="admin-table" style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead>
            <tr style={{ backgroundColor: '#F8FAFC', borderBottom: '1px solid #E2E8F0' }}>
              <th style={{ padding: '0.85rem 1rem', textAlign: 'left', fontSize: '0.78rem', fontWeight: 700, color: '#475569', textTransform: 'uppercase', letterSpacing: '0.04em' }}>Order ID</th>
              <th style={{ padding: '0.85rem 1rem', textAlign: 'left', fontSize: '0.78rem', fontWeight: 700, color: '#475569', textTransform: 'uppercase', letterSpacing: '0.04em' }}>Customer</th>
              <th style={{ padding: '0.85rem 1rem', textAlign: 'left', fontSize: '0.78rem', fontWeight: 700, color: '#475569', textTransform: 'uppercase', letterSpacing: '0.04em' }}>Dishes & Qty</th>
              <th style={{ padding: '0.85rem 1rem', textAlign: 'left', fontSize: '0.78rem', fontWeight: 700, color: '#475569', textTransform: 'uppercase', letterSpacing: '0.04em' }}>Amount</th>
              <th style={{ padding: '0.85rem 1rem', textAlign: 'left', fontSize: '0.78rem', fontWeight: 700, color: '#475569', textTransform: 'uppercase', letterSpacing: '0.04em' }}>Stage Status</th>
              <th style={{ padding: '0.85rem 1rem', textAlign: 'left', fontSize: '0.78rem', fontWeight: 700, color: '#475569', textTransform: 'uppercase', letterSpacing: '0.04em' }}>1-Click Pipeline Action</th>
              <th style={{ padding: '0.85rem 1rem', textAlign: 'right', fontSize: '0.78rem', fontWeight: 700, color: '#475569', textTransform: 'uppercase', letterSpacing: '0.04em' }}>Inspect</th>
            </tr>
          </thead>
          <tbody>
            {filteredOrders.length === 0 ? (
              <tr>
                <td colSpan="7" style={{ textAlign: 'center', padding: '3.5rem 1rem', color: '#94A3B8' }}>
                  <ShoppingBag size={42} style={{ margin: '0 auto 0.75rem', opacity: 0.35 }} />
                  <p style={{ fontSize: '0.95rem', fontWeight: 700, color: '#64748B' }}>No orders found matching this filter</p>
                </td>
              </tr>
            ) : (
              filteredOrders.map((order) => {
                const orderIdStr = order.orderNumber || order.orderId || order._id.slice(-6).toUpperCase();
                const customerName = order.user?.name || order.customerDetails?.name || 'Walk-in Diner';
                const itemsList = order.items || order.orderItems || [];
                const totalItemsCount = itemsList.reduce((acc, i) => acc + (i.quantity || 1), 0);
                const currentStatus = order.orderStatus || order.status;
                const isUpdating = updatingId === order._id;

                return (
                  <tr
                    key={order._id}
                    style={{
                      borderBottom: '1px solid #F1F5F9',
                      transition: 'background-color 0.15s ease',
                    }}
                    onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = '#F8FAFC'; }}
                    onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = 'transparent'; }}
                  >
                    {/* Order ID */}
                    <td style={{ padding: '0.8rem 1rem', verticalAlign: 'middle' }}>
                      <span
                        style={{
                          fontFamily: 'monospace',
                          fontWeight: 800,
                          color: '#059669',
                          backgroundColor: '#ECFDF5',
                          padding: '3px 8px',
                          borderRadius: '6px',
                          fontSize: '0.82rem',
                          border: '1px solid #A7F3D0',
                        }}
                      >
                        #{orderIdStr}
                      </span>
                    </td>

                    {/* Customer */}
                    <td style={{ padding: '0.8rem 1rem', verticalAlign: 'middle' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <div
                          style={{
                            width: '28px',
                            height: '28px',
                            borderRadius: '50%',
                            backgroundColor: '#E0E7FF',
                            color: '#3730A3',
                            fontSize: '0.75rem',
                            fontWeight: 800,
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            flexShrink: 0,
                          }}
                        >
                          {customerName.charAt(0).toUpperCase()}
                        </div>
                        <div>
                          <div style={{ fontWeight: 700, color: '#0F172A', fontSize: '0.86rem' }}>
                            {customerName}
                          </div>
                          <div style={{ fontSize: '0.74rem', color: '#64748B' }}>
                            {order.customerDetails?.phone || order.phone || 'N/A'}
                          </div>
                        </div>
                      </div>
                    </td>

                    {/* Items */}
                    <td style={{ padding: '0.8rem 1rem', verticalAlign: 'middle' }}>
                      <div style={{ fontWeight: 700, color: '#1E293B', fontSize: '0.84rem' }}>
                        {totalItemsCount} {totalItemsCount === 1 ? 'item' : 'items'}
                      </div>
                      <div style={{ fontSize: '0.74rem', color: '#64748B', maxWidth: '240px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                        {itemsList.map((i) => `${i.quantity || 1}x ${i.name}`).join(', ')}
                      </div>
                    </td>

                    {/* Amount */}
                    <td style={{ padding: '0.8rem 1rem', verticalAlign: 'middle', fontWeight: 800, color: '#0F172A', fontSize: '0.92rem' }}>
                      ₹{(order.totalPrice || order.totalAmount || 0).toLocaleString('en-IN')}
                    </td>

                    {/* Professional Stage Status Selector */}
                    <td style={{ padding: '0.8rem 1rem', verticalAlign: 'middle' }}>
                      <div style={{ position: 'relative', display: 'inline-flex', alignItems: 'center' }}>
                        <select
                          value={currentStatus}
                          onChange={(e) => handleUpdateStatus(order._id, e.target.value)}
                          disabled={isUpdating}
                          style={{
                            appearance: 'none',
                            WebkitAppearance: 'none',
                            MozAppearance: 'none',
                            backgroundColor:
                              currentStatus === 'Delivered'
                                ? '#ECFDF5'
                                : currentStatus === 'Preparing'
                                ? '#EFF6FF'
                                : currentStatus === 'Out for Delivery'
                                ? '#FAF5FF'
                                : currentStatus === 'Order Placed'
                                ? '#FFFBEB'
                                : '#FEF2F2',
                            color:
                              currentStatus === 'Delivered'
                                ? '#065F46'
                                : currentStatus === 'Preparing'
                                ? '#1E40AF'
                                : currentStatus === 'Out for Delivery'
                                ? '#6B21A8'
                                : currentStatus === 'Order Placed'
                                ? '#92400E'
                                : '#991B1B',
                            border: `1px solid ${
                              currentStatus === 'Delivered'
                                ? '#A7F3D0'
                                : currentStatus === 'Preparing'
                                ? '#BFDBFE'
                                : currentStatus === 'Out for Delivery'
                                ? '#E9D5FF'
                                : currentStatus === 'Order Placed'
                                ? '#FDE68A'
                                : '#FECACA'
                            }`,
                            borderRadius: '999px',
                            padding: '4px 24px 4px 22px',
                            fontSize: '0.74rem',
                            fontWeight: 700,
                            cursor: isUpdating ? 'wait' : 'pointer',
                            outline: 'none',
                            transition: 'all 0.15s ease',
                            boxShadow: '0 1px 2px rgba(0, 0, 0, 0.04)',
                          }}
                          title="Click to update order stage"
                        >
                          <option value="Order Placed">Order Placed</option>
                          <option value="Preparing">In Kitchen</option>
                          <option value="Out for Delivery">Out for Delivery</option>
                          <option value="Delivered">Fulfilled / Delivered</option>
                          <option value="Cancelled">Cancelled</option>
                        </select>
                        <span
                          style={{
                            position: 'absolute',
                            left: '9px',
                            width: '6px',
                            height: '6px',
                            borderRadius: '50%',
                            backgroundColor:
                              currentStatus === 'Delivered'
                                ? '#10B981'
                                : currentStatus === 'Preparing'
                                ? '#3B82F6'
                                : currentStatus === 'Out for Delivery'
                                ? '#A855F7'
                                : currentStatus === 'Order Placed'
                                ? '#F59E0B'
                                : '#EF4444',
                            pointerEvents: 'none',
                          }}
                        />
                        <ChevronDown
                          size={12}
                          style={{
                            position: 'absolute',
                            right: '8px',
                            pointerEvents: 'none',
                            opacity: 0.75,
                            color:
                              currentStatus === 'Delivered'
                                ? '#065F46'
                                : currentStatus === 'Preparing'
                                ? '#1E40AF'
                                : currentStatus === 'Out for Delivery'
                                ? '#6B21A8'
                                : currentStatus === 'Order Placed'
                                ? '#92400E'
                                : '#991B1B',
                          }}
                        />
                      </div>
                    </td>

                    {/* 1. Direct 1-Click Pipeline Advances */}
                    <td style={{ padding: '0.8rem 1rem', verticalAlign: 'middle' }}>
                      {currentStatus === 'Order Placed' && (
                        <button
                          onClick={() => handleUpdateStatus(order._id, 'Preparing')}
                          disabled={isUpdating}
                          style={{
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: '5px',
                            padding: '5px 12px',
                            borderRadius: '8px',
                            backgroundColor: '#059669',
                            color: '#FFFFFF',
                            fontSize: '0.78rem',
                            fontWeight: 700,
                            cursor: 'pointer',
                            boxShadow: '0 2px 5px rgba(5, 150, 105, 0.25)',
                            transition: 'all 0.15s ease',
                          }}
                          onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = '#047857'; }}
                          onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = '#059669'; }}
                          title="Accept order and notify kitchen to start cooking"
                        >
                          <ChefHat size={14} />
                          <span>Accept & Cook</span>
                          <ArrowRight size={12} />
                        </button>
                      )}

                      {currentStatus === 'Preparing' && (
                        <button
                          onClick={() => handleUpdateStatus(order._id, 'Out for Delivery')}
                          disabled={isUpdating}
                          style={{
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: '5px',
                            padding: '5px 12px',
                            borderRadius: '8px',
                            backgroundColor: '#7C3AED',
                            color: '#FFFFFF',
                            fontSize: '0.78rem',
                            fontWeight: 700,
                            cursor: 'pointer',
                            boxShadow: '0 2px 5px rgba(124, 58, 237, 0.25)',
                            transition: 'all 0.15s ease',
                          }}
                          onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = '#6D28D9'; }}
                          onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = '#7C3AED'; }}
                          title="Food is packaged. Hand over to delivery rider"
                        >
                          <Bike size={14} />
                          <span>Dispatch Rider</span>
                          <ArrowRight size={12} />
                        </button>
                      )}

                      {currentStatus === 'Out for Delivery' && (
                        <button
                          onClick={() => handleUpdateStatus(order._id, 'Delivered')}
                          disabled={isUpdating}
                          style={{
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: '5px',
                            padding: '5px 12px',
                            borderRadius: '8px',
                            backgroundColor: '#059669',
                            color: '#FFFFFF',
                            fontSize: '0.78rem',
                            fontWeight: 700,
                            cursor: 'pointer',
                            boxShadow: '0 2px 5px rgba(5, 150, 105, 0.25)',
                            transition: 'all 0.15s ease',
                          }}
                          onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = '#047857'; }}
                          onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = '#059669'; }}
                          title="Rider reached customer. Confirm delivery"
                        >
                          <CheckCircle2 size={14} />
                          <span>Confirm Delivery</span>
                        </button>
                      )}

                      {currentStatus === 'Delivered' && (
                        <span style={{ fontSize: '0.78rem', color: '#059669', fontWeight: 700, display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
                          <CheckCircle2 size={14} /> Order Fulfilled
                        </span>
                      )}

                      {currentStatus === 'Cancelled' && (
                        <span style={{ fontSize: '0.78rem', color: '#DC2626', fontWeight: 600 }}>
                          Order Voided
                        </span>
                      )}
                    </td>

                    {/* Inspect Ticket Action */}
                    <td style={{ padding: '0.8rem 1rem', textAlign: 'right', verticalAlign: 'middle' }}>
                      <button
                        onClick={() => setSelectedOrder(order)}
                        style={{
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: '4px',
                          padding: '4px 10px',
                          borderRadius: '6px',
                          backgroundColor: '#F1F5F9',
                          border: '1px solid #CBD5E1',
                          color: '#334155',
                          fontSize: '0.76rem',
                          fontWeight: 700,
                          cursor: 'pointer',
                          transition: 'all 0.2s ease',
                        }}
                        onMouseEnter={(e) => {
                          e.currentTarget.style.backgroundColor = '#059669';
                          e.currentTarget.style.borderColor = '#047857';
                          e.currentTarget.style.color = '#FFFFFF';
                        }}
                        onMouseLeave={(e) => {
                          e.currentTarget.style.backgroundColor = '#F1F5F9';
                          e.currentTarget.style.borderColor = '#CBD5E1';
                          e.currentTarget.style.color = '#334155';
                        }}
                      >
                        <Eye size={12} />
                        <span>Inspect</span>
                      </button>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      {/* 2. Order Inspection Modal & Dish Preview Drawer */}
      {selectedOrder && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            backgroundColor: 'rgba(15, 23, 42, 0.65)',
            backdropFilter: 'blur(6px)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 50,
            padding: '1rem',
          }}
          onClick={() => setSelectedOrder(null)}
        >
          <div
            style={{
              backgroundColor: '#FFFFFF',
              borderRadius: '20px',
              maxWidth: '620px',
              width: '100%',
              maxHeight: '92vh',
              overflowY: 'auto',
              padding: '2.25rem',
              boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.35)',
              position: 'relative',
              animation: 'fadeIn 0.2s ease-in-out',
            }}
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Header */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1.5rem' }}>
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '0.35rem' }}>
                  <span style={{ fontSize: '0.72rem', fontWeight: 800, padding: '2px 8px', borderRadius: '6px', backgroundColor: '#ECFDF5', color: '#065F46', border: '1px solid #A7F3D0' }}>
                    LIVE KITCHEN TICKET
                  </span>
                  <span style={{ color: '#64748B', fontSize: '0.8rem' }}>
                    {new Date(selectedOrder.createdAt).toLocaleString('en-IN', {
                      dateStyle: 'medium',
                      timeStyle: 'short',
                    })}
                  </span>
                </div>
                <h2 style={{ fontSize: '1.5rem', fontWeight: 800, color: '#0F172A', margin: 0 }}>
                  #{selectedOrder.orderNumber || selectedOrder.orderId || selectedOrder._id.slice(-6).toUpperCase()}
                </h2>
              </div>
              <button
                onClick={() => setSelectedOrder(null)}
                style={{
                  width: '32px',
                  height: '32px',
                  borderRadius: '8px',
                  backgroundColor: '#F1F5F9',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: '#64748B',
                  cursor: 'pointer',
                  border: 'none',
                }}
              >
                <X size={18} />
              </button>
            </div>

            {/* Stage Progress Stepper Bar */}
            <div style={{ backgroundColor: '#F8FAFC', borderRadius: '12px', padding: '1rem', marginBottom: '1.5rem', border: '1px solid #E2E8F0' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.6rem' }}>
                <span style={{ fontSize: '0.78rem', fontWeight: 700, color: '#475569', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                  Pipeline Progression
                </span>
                {getStatusBadge(selectedOrder.orderStatus || selectedOrder.status)}
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '6px' }}>
                {[
                  { st: 'Order Placed', label: '1. Placed' },
                  { st: 'Preparing', label: '2. Cooking' },
                  { st: 'Out for Delivery', label: '3. En Route' },
                  { st: 'Delivered', label: '4. Done' },
                ].map((step, idx) => {
                  const currentSt = selectedOrder.orderStatus || selectedOrder.status;
                  const stages = ['Order Placed', 'Preparing', 'Out for Delivery', 'Delivered'];
                  const currentIndex = stages.indexOf(currentSt);
                  const isCompleted = currentIndex >= idx;
                  const isCurrent = currentIndex === idx;

                  return (
                    <div
                      key={step.st}
                      onClick={() => handleUpdateStatus(selectedOrder._id, step.st)}
                      style={{
                        padding: '6px',
                        borderRadius: '6px',
                        textAlign: 'center',
                        fontSize: '0.72rem',
                        fontWeight: 700,
                        backgroundColor: isCompleted ? (isCurrent ? '#059669' : '#D1FAE5') : '#E2E8F0',
                        color: isCompleted ? (isCurrent ? '#FFFFFF' : '#065F46') : '#64748B',
                        cursor: 'pointer',
                        transition: 'all 0.15s ease',
                      }}
                      title={`Click to set stage to: ${step.st}`}
                    >
                      {step.label}
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Customer Coordinates & Phone Drawer */}
            <div style={{ backgroundColor: '#F8FAFC', borderRadius: '14px', padding: '1.25rem', marginBottom: '1.5rem', border: '1px solid #E2E8F0' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '0.5rem', marginBottom: '0.75rem' }}>
                <div>
                  <div style={{ fontWeight: 800, color: '#0F172A', fontSize: '1rem' }}>
                    {selectedOrder.user?.name || selectedOrder.customerDetails?.name || 'Customer'}
                  </div>
                  <div style={{ fontSize: '0.78rem', color: '#64748B' }}>
                    {selectedOrder.customerDetails?.email || selectedOrder.user?.email || 'N/A'}
                  </div>
                </div>

                <a
                  href={`tel:${selectedOrder.phone || selectedOrder.customerDetails?.phone || ''}`}
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '6px',
                    padding: '4px 10px',
                    borderRadius: '8px',
                    backgroundColor: '#ECFDF5',
                    color: '#059669',
                    fontSize: '0.8rem',
                    fontWeight: 700,
                    textDecoration: 'none',
                    border: '1px solid #A7F3D0',
                  }}
                >
                  <Phone size={13} />
                  <span>{selectedOrder.phone || selectedOrder.customerDetails?.phone || 'No phone'}</span>
                </a>
              </div>

              {/* Delivery Address Details */}
              <div style={{ display: 'flex', alignItems: 'flex-start', gap: '8px', fontSize: '0.82rem', color: '#475569', backgroundColor: '#FFFFFF', padding: '0.75rem', borderRadius: '8px', border: '1px solid #E2E8F0' }}>
                <MapPin size={16} color="#059669" style={{ flexShrink: 0, marginTop: '2px' }} />
                <div>
                  <div style={{ fontWeight: 700, color: '#0F172A' }}>
                    {selectedOrder.deliveryAddress?.area || selectedOrder.shippingAddress?.street || 'Indiranagar / Koramangala'}, Bangalore
                  </div>
                  <div style={{ fontSize: '0.76rem', color: '#64748B' }}>
                    Pincode: {selectedOrder.deliveryAddress?.pincode || '560103'} • Zone: Bangalore Urban Central
                  </div>
                </div>
              </div>
            </div>

            {/* Dishes Ordered Preview Drawer */}
            <h3 style={{ fontSize: '0.85rem', fontWeight: 800, color: '#475569', marginBottom: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
              Dishes In This Order ({((selectedOrder.items || selectedOrder.orderItems || []).length)})
            </h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.6rem', marginBottom: '1.5rem', maxHeight: '200px', overflowY: 'auto' }}>
              {((selectedOrder.items || selectedOrder.orderItems || [])).map((dish, idx) => (
                <div
                  key={idx}
                  style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    padding: '0.75rem 1rem',
                    borderRadius: '10px',
                    backgroundColor: '#F8FAFC',
                    border: '1px solid #F1F5F9',
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <span
                      style={{
                        display: 'inline-flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        width: '16px',
                        height: '16px',
                        borderRadius: '3px',
                        border: `1.5px solid ${dish.isVeg ? '#16A34A' : '#DC2626'}`,
                        padding: '2px',
                      }}
                    >
                      <span
                        style={{
                          width: '6px',
                          height: '6px',
                          borderRadius: '50%',
                          backgroundColor: dish.isVeg ? '#16A34A' : '#DC2626',
                          display: 'inline-block',
                        }}
                      />
                    </span>
                    <div>
                      <div style={{ fontWeight: 700, color: '#0F172A', fontSize: '0.88rem' }}>
                        {dish.name}
                      </div>
                      <div style={{ fontSize: '0.74rem', color: '#64748B' }}>
                        Qty: <strong style={{ color: '#059669' }}>{dish.quantity || 1}</strong> × ₹{dish.price}
                      </div>
                    </div>
                  </div>

                  <span style={{ fontWeight: 800, color: '#0F172A', fontSize: '0.92rem' }}>
                    ₹{(dish.price * (dish.quantity || 1)).toLocaleString('en-IN')}
                  </span>
                </div>
              ))}
            </div>

            {/* Live Financial Breakdown */}
            <div style={{ borderTop: '1px solid #E2E8F0', paddingTop: '1rem', marginBottom: '1.5rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem', color: '#64748B', marginBottom: '0.4rem' }}>
                <span>Subtotal</span>
                <span>₹{(selectedOrder.totalAmount || selectedOrder.totalPrice || 0) > 50 ? (selectedOrder.totalAmount || selectedOrder.totalPrice) - 50 : (selectedOrder.totalAmount || selectedOrder.totalPrice || 0)}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem', color: '#64748B', marginBottom: '0.4rem' }}>
                <span>Delivery & Logistics</span>
                <span style={{ color: selectedOrder.deliveryCharge === 0 ? '#059669' : '#0F172A', fontWeight: 600 }}>
                  {selectedOrder.deliveryCharge === 0 ? 'FREE 🎉' : `₹${selectedOrder.deliveryCharge}`}
                </span>
              </div>
              {selectedOrder.couponCode && (
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem', color: '#059669', marginBottom: '0.4rem' }}>
                  <span style={{ fontWeight: 700, display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
                    🏷️ Coupon Applied ({selectedOrder.couponCode})
                  </span>
                  <span style={{ fontWeight: 800 }}>-₹{selectedOrder.discountAmount || 0}</span>
                </div>
              )}
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem', color: '#64748B', marginBottom: '0.4rem' }}>
                <span>Payment Method</span>
                <span style={{ fontWeight: 600, color: '#0F172A' }}>{selectedOrder.paymentMethod || 'Cash on Delivery'}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '1.2rem', fontWeight: 800, color: '#0F172A', marginTop: '0.6rem', borderTop: '1px dashed #CBD5E1', paddingTop: '0.6rem' }}>
                <span>Total Amount</span>
                <span style={{ color: '#059669' }}>
                  ₹{(selectedOrder.totalPrice || selectedOrder.totalAmount || 0).toLocaleString('en-IN')}
                </span>
              </div>
            </div>

            {/* Close Button */}
            <button
              onClick={() => setSelectedOrder(null)}
              style={{
                width: '100%',
                padding: '0.85rem',
                borderRadius: '12px',
                backgroundColor: '#F1F5F9',
                color: '#334155',
                fontSize: '0.9rem',
                fontWeight: 700,
                cursor: 'pointer',
                border: 'none',
                transition: 'all 0.2s ease',
              }}
              onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = '#E2E8F0'; }}
              onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = '#F1F5F9'; }}
            >
              Done & Close Ticket
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminOrdersPage;
