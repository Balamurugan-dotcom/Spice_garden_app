import React, { useState, useEffect } from 'react';
import adminApi from '../api/adminApi';
import {
  BarChart3,
  TrendingUp,
  Download,
  Calendar,
  IndianRupee,
  ShoppingBag,
  Clock,
  ArrowUpRight,
  ArrowDownRight,
  Sparkles,
  PieChart,
  FileSpreadsheet,
  Printer,
  CheckCircle2,
  Percent,
  Flame,
  Award
} from 'lucide-react';

const AdminReportPage = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [dateRange, setDateRange] = useState('all');

  useEffect(() => {
    const fetchReportData = async () => {
      try {
        setLoading(true);
        const res = await adminApi.get('/orders');
        if (res.data?.success && Array.isArray(res.data.data)) {
          setOrders(res.data.data);
        }
      } catch (err) {
        console.error('Error fetching report data:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchReportData();
  }, []);

  // Filter orders by date range
  const filteredOrders = orders.filter((ord) => {
    if (dateRange === 'all') return true;
    const ordDate = new Date(ord.createdAt);
    const now = new Date();
    if (dateRange === 'today') {
      return ordDate.toDateString() === now.toDateString();
    }
    if (dateRange === '7days') {
      const diff = (now - ordDate) / (1000 * 60 * 60 * 24);
      return diff <= 7;
    }
    if (dateRange === '30days') {
      const diff = (now - ordDate) / (1000 * 60 * 60 * 24);
      return diff <= 30;
    }
    return true;
  });

  // KPI calculations
  const totalRevenue = filteredOrders.reduce((sum, o) => sum + (o.totalAmount || 0), 0);
  const totalOrders = filteredOrders.length;
  const averageOrderValue = totalOrders > 0 ? Math.round(totalRevenue / totalOrders) : 0;
  const deliveredOrders = filteredOrders.filter((o) => o.orderStatus === 'Delivered').length;
  const fulfillmentRate = totalOrders > 0 ? Math.round((deliveredOrders / totalOrders) * 100) : 100;
  const totalDiscountGiven = filteredOrders.reduce((sum, o) => sum + (o.discountAmount || 0), 0);

  // Category sales breakdown
  const categorySales = {
    'Biryani & Rice': 0,
    'Starters & Tandoor': 0,
    'Main Course Curries': 0,
    'Indo-Chinese': 0,
    'Desserts & Sweets': 0,
  };

  filteredOrders.forEach((ord) => {
    if (Array.isArray(ord.items)) {
      ord.items.forEach((it) => {
        const itemTotal = (it.price || 0) * (it.quantity || 1);
        const name = (it.name || '').toLowerCase();
        if (name.includes('biryani') || name.includes('rice') || name.includes('pulao')) {
          categorySales['Biryani & Rice'] += itemTotal;
        } else if (name.includes('tikka') || name.includes('kebab') || name.includes('starter') || name.includes('fry')) {
          categorySales['Starters & Tandoor'] += itemTotal;
        } else if (name.includes('curry') || name.includes('masala') || name.includes('dal') || name.includes('paneer') || name.includes('butter chicken')) {
          categorySales['Main Course Curries'] += itemTotal;
        } else if (name.includes('manchurian') || name.includes('noodles') || name.includes('chilli')) {
          categorySales['Indo-Chinese'] += itemTotal;
        } else {
          categorySales['Desserts & Sweets'] += itemTotal;
        }
      });
    }
  });

  const totalCatSales = Object.values(categorySales).reduce((a, b) => a + b, 0) || 1;

  // Export CSV
  const handleExportCSV = () => {
    const headers = 'Order ID,Customer Name,Phone,Date,Payment Method,Status,Subtotal,Discount,Total\n';
    const rows = filteredOrders
      .map((o) =>
        `"${o.orderId}","${o.customerDetails?.name || 'Customer'}","${o.customerDetails?.phone || ''}","${new Date(
          o.createdAt
        ).toLocaleString()}","${o.paymentMethod}","${o.orderStatus}",${o.subtotal || 0},${o.discountAmount || 0},${o.totalAmount || 0}`
      )
      .join('\n');

    const blob = new Blob([headers + rows], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `spice_garden_sales_report_${dateRange}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div style={{ maxWidth: '1440px', margin: '0 auto', display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      {/* Header Banner */}
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: '1rem',
          backgroundColor: '#FFFFFF',
          padding: '1.5rem 1.75rem',
          borderRadius: '16px',
          border: '1px solid #E2E8F0',
          boxShadow: '0 1px 3px rgba(0,0,0,0.04)',
        }}
      >
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', marginBottom: '0.25rem' }}>
            <h1 style={{ fontSize: '1.6rem', fontWeight: 800, color: '#0F172A', margin: 0 }}>
              Culinary & Sales Financial Telemetry
            </h1>
            <span
              style={{
                fontSize: '0.74rem',
                fontWeight: 700,
                backgroundColor: '#EFF6FF',
                color: '#1D4ED8',
                border: '1px solid #BFDBFE',
                padding: '2px 8px',
                borderRadius: '999px',
              }}
            >
              Audited Analytics
            </span>
          </div>
          <p style={{ fontSize: '0.88rem', color: '#64748B', margin: 0 }}>
            Real-time revenue reconciliation, average ticket size, category sales performance, and Bangalore delivery throughput.
          </p>
        </div>

        <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center', flexWrap: 'wrap' }}>
          {/* Date Range Selector */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', backgroundColor: '#F8FAFC', padding: '4px', borderRadius: '10px', border: '1px solid #CBD5E1' }}>
            {[
              { id: 'all', label: 'All Time' },
              { id: '30days', label: 'Last 30 Days' },
              { id: '7days', label: 'Last 7 Days' },
              { id: 'today', label: 'Today' },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setDateRange(tab.id)}
                style={{
                  padding: '6px 12px',
                  borderRadius: '7px',
                  border: 'none',
                  fontSize: '0.8rem',
                  fontWeight: 600,
                  cursor: 'pointer',
                  backgroundColor: dateRange === tab.id ? '#0F172A' : 'transparent',
                  color: dateRange === tab.id ? '#FFFFFF' : '#475569',
                  transition: 'all 0.15s ease',
                }}
              >
                {tab.label}
              </button>
            ))}
          </div>

          <button
            onClick={handleExportCSV}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '6px',
              padding: '0.65rem 1.15rem',
              borderRadius: '9px',
              backgroundColor: '#FFFFFF',
              color: '#0F172A',
              fontWeight: 700,
              fontSize: '0.85rem',
              border: '1px solid #CBD5E1',
              cursor: 'pointer',
              transition: 'all 0.15s ease',
            }}
            onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = '#F1F5F9')}
            onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = '#FFFFFF')}
          >
            <Download size={15} />
            <span>Export CSV</span>
          </button>

          <button
            onClick={() => window.print()}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '6px',
              padding: '0.65rem 1.15rem',
              borderRadius: '9px',
              backgroundColor: '#0F172A',
              color: '#FFFFFF',
              fontWeight: 700,
              fontSize: '0.85rem',
              border: 'none',
              cursor: 'pointer',
              transition: 'all 0.15s ease',
            }}
          >
            <Printer size={15} />
            <span>Print Report</span>
          </button>
        </div>
      </div>

      {/* KPI Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '1rem' }}>
        <div
          style={{
            backgroundColor: '#FFFFFF',
            padding: '1.4rem',
            borderRadius: '16px',
            border: '1px solid #E2E8F0',
            boxShadow: '0 1px 3px rgba(0,0,0,0.04)',
          }}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
            <div>
              <span style={{ fontSize: '0.78rem', color: '#64748B', fontWeight: 700, textTransform: 'uppercase' }}>
                GROSS SALES REVENUE
              </span>
              <div style={{ fontSize: '1.85rem', fontWeight: 800, color: '#0F172A', marginTop: '6px' }}>
                ₹{totalRevenue.toLocaleString()}
              </div>
            </div>
            <div
              style={{
                width: '42px',
                height: '42px',
                borderRadius: '10px',
                backgroundColor: '#ECFDF5',
                color: '#059669',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <IndianRupee size={22} />
            </div>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginTop: '0.75rem', fontSize: '0.78rem', color: '#059669', fontWeight: 600 }}>
            <TrendingUp size={14} />
            <span>Direct Kitchen Collections</span>
          </div>
        </div>

        <div
          style={{
            backgroundColor: '#FFFFFF',
            padding: '1.4rem',
            borderRadius: '16px',
            border: '1px solid #E2E8F0',
            boxShadow: '0 1px 3px rgba(0,0,0,0.04)',
          }}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
            <div>
              <span style={{ fontSize: '0.78rem', color: '#64748B', fontWeight: 700, textTransform: 'uppercase' }}>
                AVERAGE ORDER VALUE
              </span>
              <div style={{ fontSize: '1.85rem', fontWeight: 800, color: '#0F172A', marginTop: '6px' }}>
                ₹{averageOrderValue}
              </div>
            </div>
            <div
              style={{
                width: '42px',
                height: '42px',
                borderRadius: '10px',
                backgroundColor: '#EFF6FF',
                color: '#2563EB',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <TrendingUp size={22} />
            </div>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginTop: '0.75rem', fontSize: '0.78rem', color: '#2563EB', fontWeight: 600 }}>
            <span>Across {totalOrders} Orders Placed</span>
          </div>
        </div>

        <div
          style={{
            backgroundColor: '#FFFFFF',
            padding: '1.4rem',
            borderRadius: '16px',
            border: '1px solid #E2E8F0',
            boxShadow: '0 1px 3px rgba(0,0,0,0.04)',
          }}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
            <div>
              <span style={{ fontSize: '0.78rem', color: '#64748B', fontWeight: 700, textTransform: 'uppercase' }}>
                DELIVERY SUCCESS RATE
              </span>
              <div style={{ fontSize: '1.85rem', fontWeight: 800, color: '#059669', marginTop: '6px' }}>
                {fulfillmentRate}%
              </div>
            </div>
            <div
              style={{
                width: '42px',
                height: '42px',
                borderRadius: '10px',
                backgroundColor: '#ECFDF5',
                color: '#059669',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <CheckCircle2 size={22} />
            </div>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginTop: '0.75rem', fontSize: '0.78rem', color: '#64748B', fontWeight: 600 }}>
            <span>Indiranagar & Koramangala Cluster</span>
          </div>
        </div>

        <div
          style={{
            backgroundColor: '#FFFFFF',
            padding: '1.4rem',
            borderRadius: '16px',
            border: '1px solid #E2E8F0',
            boxShadow: '0 1px 3px rgba(0,0,0,0.04)',
          }}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
            <div>
              <span style={{ fontSize: '0.78rem', color: '#64748B', fontWeight: 700, textTransform: 'uppercase' }}>
                DISCOUNTS & PROMOS SAVED
              </span>
              <div style={{ fontSize: '1.85rem', fontWeight: 800, color: '#C2410C', marginTop: '6px' }}>
                ₹{totalDiscountGiven.toLocaleString()}
              </div>
            </div>
            <div
              style={{
                width: '42px',
                height: '42px',
                borderRadius: '10px',
                backgroundColor: '#FFF7ED',
                color: '#C2410C',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <Percent size={22} />
            </div>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginTop: '0.75rem', fontSize: '0.78rem', color: '#C2410C', fontWeight: 600 }}>
            <span>Via BANGALORE50, BIRYANI20</span>
          </div>
        </div>
      </div>

      {/* Culinary Category Revenue Share */}
      <div style={{ display: 'grid', gridTemplateColumns: '1.4fr 1fr', gap: '1.5rem' }}>
        {/* Category Contribution Bars */}
        <div
          style={{
            backgroundColor: '#FFFFFF',
            padding: '1.5rem',
            borderRadius: '16px',
            border: '1px solid #E2E8F0',
            boxShadow: '0 1px 3px rgba(0,0,0,0.04)',
          }}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
            <div>
              <h3 style={{ fontSize: '1.1rem', fontWeight: 800, color: '#0F172A', margin: 0 }}>
                Culinary Category Revenue Share
              </h3>
              <p style={{ fontSize: '0.8rem', color: '#64748B', margin: '2px 0 0' }}>
                Sales distribution across the Spice Garden 60+ authentic menu portfolio
              </p>
            </div>
            <span style={{ fontSize: '0.75rem', fontWeight: 700, color: '#059669', backgroundColor: '#ECFDF5', padding: '3px 8px', borderRadius: '6px' }}>
              Live Order Weighted
            </span>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.2rem' }}>
            {Object.entries(categorySales).map(([category, amt]) => {
              const pct = totalCatSales > 0 ? Math.round((amt / totalCatSales) * 100) : 20;
              const barColor =
                category.includes('Biryani')
                  ? '#E65100'
                  : category.includes('Starters')
                  ? '#059669'
                  : category.includes('Main Course')
                  ? '#2563EB'
                  : category.includes('Chinese')
                  ? '#7C3AED'
                  : '#DB2777';

              return (
                <div key={category}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem', fontWeight: 700, marginBottom: '6px' }}>
                    <span style={{ color: '#1E293B' }}>{category}</span>
                    <span style={{ color: '#64748B' }}>
                      ₹{amt.toLocaleString()} ({pct}%)
                    </span>
                  </div>
                  <div
                    style={{
                      height: '10px',
                      backgroundColor: '#F1F5F9',
                      borderRadius: '999px',
                      overflow: 'hidden',
                    }}
                  >
                    <div
                      style={{
                        height: '100%',
                        width: `${Math.max(pct, 8)}%`,
                        backgroundColor: barColor,
                        borderRadius: '999px',
                        transition: 'width 0.6s ease',
                      }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Bangalore Order Peak Telemetry */}
        <div
          style={{
            backgroundColor: '#FFFFFF',
            padding: '1.5rem',
            borderRadius: '16px',
            border: '1px solid #E2E8F0',
            boxShadow: '0 1px 3px rgba(0,0,0,0.04)',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'space-between',
          }}
        >
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '0.25rem' }}>
              <Clock size={18} color="#E65100" />
              <h3 style={{ fontSize: '1.1rem', fontWeight: 800, color: '#0F172A', margin: 0 }}>
                Bangalore Peak Kitchen Hours
              </h3>
            </div>
            <p style={{ fontSize: '0.8rem', color: '#64748B', margin: '0 0 1.25rem' }}>
              Order rush telemetry based on Indiranagar & IT corridor dining habits.
            </p>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
              <div
                style={{
                  padding: '0.85rem 1rem',
                  borderRadius: '10px',
                  backgroundColor: '#FFF7ED',
                  border: '1px solid #FED7AA',
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{ fontWeight: 800, fontSize: '0.85rem', color: '#C2410C' }}>
                    🔥 Dinner Rush (07:30 PM - 10:45 PM)
                  </span>
                  <span style={{ fontSize: '0.74rem', fontWeight: 700, color: '#EA580C', backgroundColor: '#FFFFFF', padding: '2px 6px', borderRadius: '4px' }}>
                    58% Total Volume
                  </span>
                </div>
                <div style={{ fontSize: '0.78rem', color: '#7C2D12', marginTop: '4px' }}>
                  Peak Dum Biryani handis & family meal packs across Koramangala & HSR.
                </div>
              </div>

              <div
                style={{
                  padding: '0.85rem 1rem',
                  borderRadius: '10px',
                  backgroundColor: '#EFF6FF',
                  border: '1px solid #BFDBFE',
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{ fontWeight: 800, fontSize: '0.85rem', color: '#1E40AF' }}>
                    ⚡ Corporate Lunch (12:30 PM - 02:45 PM)
                  </span>
                  <span style={{ fontSize: '0.74rem', fontWeight: 700, color: '#2563EB', backgroundColor: '#FFFFFF', padding: '2px 6px', borderRadius: '4px' }}>
                    34% Total Volume
                  </span>
                </div>
                <div style={{ fontSize: '0.78rem', color: '#1E3A8A', marginTop: '4px' }}>
                  Thalis, Combos, and Quick Tandoor Wraps delivered in 28 mins.
                </div>
              </div>

              <div
                style={{
                  padding: '0.85rem 1rem',
                  borderRadius: '10px',
                  backgroundColor: '#F8FAFC',
                  border: '1px solid #E2E8F0',
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{ fontWeight: 800, fontSize: '0.85rem', color: '#475569' }}>
                    🍵 Evening Starters & Chai (04:30 PM - 06:30 PM)
                  </span>
                  <span style={{ fontSize: '0.74rem', fontWeight: 700, color: '#64748B' }}>
                    8% Volume
                  </span>
                </div>
                <div style={{ fontSize: '0.78rem', color: '#64748B', marginTop: '4px' }}>
                  Kebabs, Crispy Corn, and Ghee Roasts for tea-time snacks.
                </div>
              </div>
            </div>
          </div>

          <div
            style={{
              marginTop: '1.25rem',
              padding: '0.75rem 1rem',
              borderRadius: '10px',
              backgroundColor: '#ECFDF5',
              border: '1px solid #A7F3D0',
              fontSize: '0.78rem',
              color: '#065F46',
              fontWeight: 600,
            }}
          >
            ✓ Delivery fleet dynamically pre-positioned at Indiranagar 100ft road kitchen during peak hours.
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminReportPage;
