import React, { useState, useEffect } from 'react';
import adminApi from '../api/adminApi';
import {
  CreditCard,
  IndianRupee,
  Search,
  Filter,
  CheckCircle2,
  Clock,
  AlertCircle,
  QrCode,
  Banknote,
  Smartphone,
  ArrowDownLeft,
  ArrowUpRight,
  Download,
  Eye,
  Check,
  X,
  FileText
} from 'lucide-react';

const AdminPaymentPage = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [methodFilter, setMethodFilter] = useState('All');
  const [statusFilter, setStatusFilter] = useState('All');
  const [selectedTxn, setSelectedTxn] = useState(null);

  // Fetch real orders from database
  useEffect(() => {
    const fetchPayments = async () => {
      try {
        setLoading(true);
        const res = await adminApi.get('/orders');
        if (res.data?.success && Array.isArray(res.data.data)) {
          setOrders(res.data.data);
        }
      } catch (err) {
        console.error('Error fetching orders for payments:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchPayments();
  }, []);

  // Filtered transactions
  const filteredTransactions = orders.filter((o) => {
    const term = searchTerm.toLowerCase();
    const matchesSearch =
      (o.orderId && o.orderId.toLowerCase().includes(term)) ||
      (o.customerDetails?.name && o.customerDetails.name.toLowerCase().includes(term)) ||
      (o.customerDetails?.phone && o.customerDetails.phone.includes(term)) ||
      (o.paymentMethod && o.paymentMethod.toLowerCase().includes(term));

    const matchesMethod =
      methodFilter === 'All' ||
      (methodFilter === 'UPI' && (o.paymentMethod?.includes('UPI') || o.paymentMethod?.includes('Online'))) ||
      (methodFilter === 'COD' && (o.paymentMethod?.includes('Cash') || o.paymentMethod?.includes('COD'))) ||
      (methodFilter === 'Card' && o.paymentMethod?.includes('Card'));

    const matchesStatus =
      statusFilter === 'All' ||
      (statusFilter === 'Paid' && (o.paymentStatus === 'Paid' || o.orderStatus === 'Delivered')) ||
      (statusFilter === 'Pending' && o.paymentStatus !== 'Paid' && o.orderStatus !== 'Delivered') ||
      (statusFilter === 'Cancelled' && o.orderStatus === 'Cancelled');

    return matchesSearch && matchesMethod && matchesStatus;
  });

  // Calculate Metrics
  const totalCollected = orders.reduce((sum, o) => {
    if (o.orderStatus !== 'Cancelled') {
      return sum + (o.totalAmount || 0);
    }
    return sum;
  }, 0);

  const upiOrders = orders.filter(
    (o) => (o.paymentMethod?.includes('UPI') || o.paymentMethod?.includes('Online')) && o.orderStatus !== 'Cancelled'
  );
  const upiTotal = upiOrders.reduce((sum, o) => sum + (o.totalAmount || 0), 0);

  const codOrders = orders.filter(
    (o) => (o.paymentMethod?.includes('Cash') || o.paymentMethod?.includes('COD')) && o.orderStatus !== 'Cancelled'
  );
  const codTotal = codOrders.reduce((sum, o) => sum + (o.totalAmount || 0), 0);

  const pendingCodOrders = codOrders.filter((o) => o.orderStatus !== 'Delivered');
  const pendingCodTotal = pendingCodOrders.reduce((sum, o) => sum + (o.totalAmount || 0), 0);

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
              Payment Operations & Settlement Ledger
            </h1>
            <span
              style={{
                fontSize: '0.74rem',
                fontWeight: 700,
                backgroundColor: '#ECFDF5',
                color: '#065F46',
                border: '1px solid #A7F3D0',
                padding: '2px 8px',
                borderRadius: '999px',
              }}
            >
              Live Bank Gateway
            </span>
          </div>
          <p style={{ fontSize: '0.88rem', color: '#64748B', margin: 0 }}>
            Monitor real-time UPI collections (GPay/PhonePe), Cash on Delivery reconciliation, and customer transaction receipts.
          </p>
        </div>

        <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center' }}>
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              padding: '6px 12px',
              borderRadius: '8px',
              backgroundColor: '#F8FAFC',
              border: '1px solid #E2E8F0',
              fontSize: '0.78rem',
              color: '#334155',
              fontWeight: 700,
            }}
          >
            <QrCode size={16} color="#059669" />
            <span>Instant UPI / Auto-Settlement Active</span>
          </div>
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
                TOTAL SETTLED VOLUME
              </span>
              <div style={{ fontSize: '1.85rem', fontWeight: 800, color: '#0F172A', marginTop: '6px' }}>
                ₹{totalCollected.toLocaleString()}
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
            <span>Across {orders.length} lifetime orders</span>
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
                UPI & ONLINE GATEWAY
              </span>
              <div style={{ fontSize: '1.85rem', fontWeight: 800, color: '#2563EB', marginTop: '6px' }}>
                ₹{upiTotal.toLocaleString()}
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
              <Smartphone size={22} />
            </div>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginTop: '0.75rem', fontSize: '0.78rem', color: '#2563EB', fontWeight: 600 }}>
            <span>Google Pay, PhonePe, Paytm, Cards</span>
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
                CASH ON DELIVERY (COD)
              </span>
              <div style={{ fontSize: '1.85rem', fontWeight: 800, color: '#059669', marginTop: '6px' }}>
                ₹{codTotal.toLocaleString()}
              </div>
            </div>
            <div
              style={{
                width: '42px',
                height: '42px',
                borderRadius: '10px',
                backgroundColor: '#FEF3C7',
                color: '#D97706',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <Banknote size={22} />
            </div>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginTop: '0.75rem', fontSize: '0.78rem', color: '#D97706', fontWeight: 600 }}>
            <span>{codOrders.length} cash deliveries processed</span>
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
                PENDING RIDER HANDOVER
              </span>
              <div style={{ fontSize: '1.85rem', fontWeight: 800, color: pendingCodTotal > 0 ? '#C2410C' : '#059669', marginTop: '6px' }}>
                ₹{pendingCodTotal.toLocaleString()}
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
              <Clock size={22} />
            </div>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginTop: '0.75rem', fontSize: '0.78rem', color: '#64748B', fontWeight: 600 }}>
            <span>{pendingCodOrders.length} orders in delivery transit</span>
          </div>
        </div>
      </div>

      {/* Filter & Search Bar */}
      <div
        style={{
          backgroundColor: '#FFFFFF',
          padding: '1rem 1.25rem',
          borderRadius: '12px',
          border: '1px solid #E2E8F0',
          display: 'flex',
          gap: '1rem',
          flexWrap: 'wrap',
          alignItems: 'center',
          justifyContent: 'space-between',
        }}
      >
        <div style={{ display: 'flex', gap: '0.75rem', flex: 1, minWidth: '280px', alignItems: 'center' }}>
          <div style={{ position: 'relative', flex: 1, display: 'flex', alignItems: 'center' }}>
            <Search size={17} color="#94A3B8" style={{ position: 'absolute', left: '12px', pointerEvents: 'none' }} />
            <input
              type="text"
              placeholder="Search by Order ID, Diner Name, Phone number..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              style={{
                width: '100%',
                padding: '0.65rem 1rem 0.65rem 2.4rem',
                borderRadius: '8px',
                border: '1px solid #CBD5E1',
                fontSize: '0.88rem',
                outline: 'none',
              }}
            />
          </div>

          <select
            value={methodFilter}
            onChange={(e) => setMethodFilter(e.target.value)}
            style={{
              padding: '0.65rem 1rem',
              borderRadius: '8px',
              border: '1px solid #CBD5E1',
              fontSize: '0.88rem',
              backgroundColor: '#F8FAFC',
              color: '#334155',
              cursor: 'pointer',
              fontWeight: 600,
            }}
          >
            <option value="All">All Payment Modes</option>
            <option value="UPI">UPI / Online Gateway</option>
            <option value="COD">Cash on Delivery (COD)</option>
            <option value="Card">Debit / Credit Card</option>
          </select>

          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            style={{
              padding: '0.65rem 1rem',
              borderRadius: '8px',
              border: '1px solid #CBD5E1',
              fontSize: '0.88rem',
              backgroundColor: '#F8FAFC',
              color: '#334155',
              cursor: 'pointer',
              fontWeight: 600,
            }}
          >
            <option value="All">All Settlement Status</option>
            <option value="Paid">🟢 Settled / Paid</option>
            <option value="Pending">🟡 Pending Handover</option>
            <option value="Cancelled">🔴 Cancelled / Refunded</option>
          </select>
        </div>

        <div style={{ fontSize: '0.82rem', color: '#64748B', fontWeight: 600 }}>
          Showing <strong>{filteredTransactions.length}</strong> of {orders.length} transactions
        </div>
      </div>

      {/* Transactions Table */}
      <div
        style={{
          backgroundColor: '#FFFFFF',
          borderRadius: '16px',
          border: '1px solid #E2E8F0',
          boxShadow: '0 1px 3px rgba(0,0,0,0.04)',
          overflow: 'hidden',
        }}
      >
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
            <thead>
              <tr style={{ backgroundColor: '#F8FAFC', borderBottom: '1px solid #E2E8F0' }}>
                <th style={{ padding: '0.9rem 1.25rem', fontSize: '0.76rem', fontWeight: 700, color: '#475569' }}>
                  TRANSACTION & ORDER ID
                </th>
                <th style={{ padding: '0.9rem 1.25rem', fontSize: '0.76rem', fontWeight: 700, color: '#475569' }}>
                  DINER & CONTACT
                </th>
                <th style={{ padding: '0.9rem 1.25rem', fontSize: '0.76rem', fontWeight: 700, color: '#475569' }}>
                  DATE & TIME
                </th>
                <th style={{ padding: '0.9rem 1.25rem', fontSize: '0.76rem', fontWeight: 700, color: '#475569' }}>
                  PAYMENT METHOD
                </th>
                <th style={{ padding: '0.9rem 1.25rem', fontSize: '0.76rem', fontWeight: 700, color: '#475569' }}>
                  AMOUNT
                </th>
                <th style={{ padding: '0.9rem 1.25rem', fontSize: '0.76rem', fontWeight: 700, color: '#475569' }}>
                  SETTLEMENT STATUS
                </th>
                <th style={{ padding: '0.9rem 1.25rem', fontSize: '0.76rem', fontWeight: 700, color: '#475569', textAlign: 'right' }}>
                  RECEIPT
                </th>
              </tr>
            </thead>
            <tbody>
              {filteredTransactions.length === 0 ? (
                <tr>
                  <td colSpan={7} style={{ padding: '3.5rem', textAlign: 'center', color: '#64748B' }}>
                    <CreditCard size={36} color="#94A3B8" style={{ margin: '0 auto 0.5rem' }} />
                    <p style={{ fontWeight: 600, fontSize: '0.95rem', margin: 0 }}>No payment transactions found.</p>
                    <p style={{ fontSize: '0.82rem', margin: '4px 0 0' }}>
                      Transactions will populate as customers place orders on the storefront.
                    </p>
                  </td>
                </tr>
              ) : (
                filteredTransactions.map((tx) => {
                  const isPaid = tx.paymentStatus === 'Paid' || tx.orderStatus === 'Delivered';
                  const isCancelled = tx.orderStatus === 'Cancelled';

                  return (
                    <tr
                      key={tx._id}
                      style={{
                        borderBottom: '1px solid #F1F5F9',
                        transition: 'background-color 0.15s ease',
                      }}
                      onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = '#FAFAFA')}
                      onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = 'transparent')}
                    >
                      {/* Transaction & Order ID */}
                      <td style={{ padding: '1rem 1.25rem' }}>
                        <div style={{ fontWeight: 800, fontSize: '0.9rem', color: '#0F172A', fontFamily: 'monospace' }}>
                          {tx.orderId}
                        </div>
                        <div style={{ fontSize: '0.72rem', color: '#64748B', marginTop: '2px' }}>
                          Ref: TXN-{(tx._id || '').slice(-8).toUpperCase()}
                        </div>
                      </td>

                      {/* Diner & Contact */}
                      <td style={{ padding: '1rem 1.25rem' }}>
                        <div style={{ fontWeight: 700, fontSize: '0.88rem', color: '#1E293B' }}>
                          {tx.customerDetails?.name || 'Bangalore Diner'}
                        </div>
                        <div style={{ fontSize: '0.75rem', color: '#64748B' }}>
                          {tx.customerDetails?.phone || '+91 98450 00000'}
                        </div>
                      </td>

                      {/* Date & Time */}
                      <td style={{ padding: '1rem 1.25rem' }}>
                        <div style={{ fontSize: '0.82rem', color: '#334155', fontWeight: 600 }}>
                          {new Date(tx.createdAt).toLocaleDateString('en-IN', {
                            day: 'numeric',
                            month: 'short',
                            year: 'numeric',
                          })}
                        </div>
                        <div style={{ fontSize: '0.72rem', color: '#64748B' }}>
                          {new Date(tx.createdAt).toLocaleTimeString('en-IN', {
                            hour: '2-digit',
                            minute: '2-digit',
                          })}
                        </div>
                      </td>

                      {/* Payment Method */}
                      <td style={{ padding: '1rem 1.25rem' }}>
                        <span
                          style={{
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: '5px',
                            fontSize: '0.78rem',
                            fontWeight: 700,
                            padding: '3px 9px',
                            borderRadius: '6px',
                            backgroundColor: tx.paymentMethod?.includes('Cash') ? '#FEF3C7' : '#EFF6FF',
                            color: tx.paymentMethod?.includes('Cash') ? '#92400E' : '#1D4ED8',
                            border: `1px solid ${tx.paymentMethod?.includes('Cash') ? '#FDE68A' : '#BFDBFE'}`,
                          }}
                        >
                          {tx.paymentMethod?.includes('Cash') ? (
                            <Banknote size={13} />
                          ) : (
                            <Smartphone size={13} />
                          )}
                          <span>{tx.paymentMethod || 'Online'}</span>
                        </span>
                      </td>

                      {/* Amount */}
                      <td style={{ padding: '1rem 1.25rem' }}>
                        <div style={{ fontWeight: 800, fontSize: '0.95rem', color: '#0F172A' }}>
                          ₹{(tx.totalAmount || 0).toLocaleString()}
                        </div>
                        {tx.discountAmount > 0 && (
                          <div style={{ fontSize: '0.72rem', color: '#059669', fontWeight: 600 }}>
                            Saved ₹{tx.discountAmount} ({tx.couponCode || 'Promo'})
                          </div>
                        )}
                      </td>

                      {/* Settlement Status */}
                      <td style={{ padding: '1rem 1.25rem' }}>
                        <span
                          style={{
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: '5px',
                            fontSize: '0.75rem',
                            fontWeight: 700,
                            padding: '3px 8px',
                            borderRadius: '999px',
                            backgroundColor: isCancelled
                              ? '#FEF2F2'
                              : isPaid
                              ? '#ECFDF5'
                              : '#FFFBEB',
                            color: isCancelled
                              ? '#DC2626'
                              : isPaid
                              ? '#065F46'
                              : '#92400E',
                            border: `1px solid ${
                              isCancelled
                                ? '#FECACA'
                                : isPaid
                                ? '#A7F3D0'
                                : '#FDE68A'
                            }`,
                          }}
                        >
                          <span
                            style={{
                              width: '6px',
                              height: '6px',
                              borderRadius: '50%',
                              backgroundColor: isCancelled
                                ? '#DC2626'
                                : isPaid
                                ? '#10B981'
                                : '#F59E0B',
                            }}
                          />
                          {isCancelled ? 'Cancelled' : isPaid ? 'Settled & Paid' : 'Pending Delivery'}
                        </span>
                      </td>

                      {/* Receipt Action */}
                      <td style={{ padding: '1rem 1.25rem', textAlign: 'right' }}>
                        <button
                          onClick={() => setSelectedTxn(tx)}
                          style={{
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: '5px',
                            padding: '5px 10px',
                            borderRadius: '7px',
                            border: '1px solid #CBD5E1',
                            backgroundColor: '#FFFFFF',
                            color: '#0F172A',
                            fontSize: '0.78rem',
                            fontWeight: 700,
                            cursor: 'pointer',
                            transition: 'all 0.15s ease',
                          }}
                          onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = '#F1F5F9')}
                          onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = '#FFFFFF')}
                        >
                          <Eye size={13} />
                          <span>Receipt</span>
                        </button>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Transaction Receipt Breakdown Modal */}
      {selectedTxn && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            backgroundColor: 'rgba(15, 23, 42, 0.65)',
            backdropFilter: 'blur(3px)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 100,
            padding: '1rem',
          }}
        >
          <div
            style={{
              backgroundColor: '#FFFFFF',
              borderRadius: '16px',
              width: '100%',
              maxWidth: '500px',
              boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 8px 10px -6px rgba(0, 0, 0, 0.1)',
              overflow: 'hidden',
            }}
          >
            <div
              style={{
                padding: '1.25rem 1.5rem',
                borderBottom: '1px solid #E2E8F0',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                backgroundColor: '#F8FAFC',
              }}
            >
              <div>
                <span style={{ fontSize: '0.74rem', color: '#64748B', fontWeight: 700, textTransform: 'uppercase' }}>
                  Official Transaction Voucher
                </span>
                <h3 style={{ fontSize: '1.1rem', fontWeight: 800, color: '#0F172A', margin: '2px 0 0', fontFamily: 'monospace' }}>
                  {selectedTxn.orderId}
                </h3>
              </div>
              <button
                onClick={() => setSelectedTxn(null)}
                style={{ background: 'none', border: 'none', color: '#64748B', cursor: 'pointer', padding: '4px' }}
              >
                <X size={20} />
              </button>
            </div>

            <div style={{ padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                <div>
                  <div style={{ fontSize: '0.75rem', color: '#64748B', fontWeight: 600 }}>Diner Name</div>
                  <div style={{ fontSize: '0.9rem', fontWeight: 700, color: '#0F172A' }}>
                    {selectedTxn.customerDetails?.name}
                  </div>
                </div>
                <div>
                  <div style={{ fontSize: '0.75rem', color: '#64748B', fontWeight: 600 }}>Contact</div>
                  <div style={{ fontSize: '0.9rem', fontWeight: 700, color: '#0F172A' }}>
                    {selectedTxn.customerDetails?.phone}
                  </div>
                </div>
              </div>

              <div style={{ borderTop: '1px dashed #E2E8F0', paddingTop: '0.75rem' }}>
                <div style={{ fontSize: '0.75rem', color: '#64748B', fontWeight: 700, marginBottom: '6px' }}>
                  ORDERED DISHES ({selectedTxn.items?.length || 0})
                </div>
                {selectedTxn.items?.map((it, idx) => (
                  <div key={idx} style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.82rem', marginBottom: '4px' }}>
                    <span style={{ color: '#334155' }}>
                      {it.quantity}x {it.name}
                    </span>
                    <span style={{ fontWeight: 700, color: '#0F172A' }}>
                      ₹{(it.price * it.quantity).toLocaleString()}
                    </span>
                  </div>
                ))}
              </div>

              <div style={{ borderTop: '1px solid #E2E8F0', paddingTop: '0.75rem', display: 'flex', flexDirection: 'column', gap: '4px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.82rem', color: '#64748B' }}>
                  <span>Subtotal</span>
                  <span>₹{selectedTxn.subtotal || 0}</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.82rem', color: '#64748B' }}>
                  <span>Delivery Charge</span>
                  <span>₹{selectedTxn.deliveryCharge || 0}</span>
                </div>
                {selectedTxn.discountAmount > 0 && (
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.82rem', color: '#059669', fontWeight: 600 }}>
                    <span>Coupon Savings ({selectedTxn.couponCode})</span>
                    <span>-₹{selectedTxn.discountAmount}</span>
                  </div>
                )}
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '1.1rem', fontWeight: 800, color: '#0F172A', borderTop: '1px solid #E2E8F0', paddingTop: '8px', marginTop: '4px' }}>
                  <span>Total Settled</span>
                  <span>₹{selectedTxn.totalAmount}</span>
                </div>
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem', marginTop: '0.5rem' }}>
                <button
                  type="button"
                  onClick={() => setSelectedTxn(null)}
                  style={{
                    padding: '0.65rem 1.4rem',
                    borderRadius: '8px',
                    border: 'none',
                    backgroundColor: '#0F172A',
                    color: '#FFFFFF',
                    fontSize: '0.88rem',
                    fontWeight: 700,
                    cursor: 'pointer',
                  }}
                >
                  Close Voucher
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminPaymentPage;
