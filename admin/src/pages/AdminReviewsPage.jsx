import React, { useState, useEffect } from 'react';
import adminApi from '../api/adminApi';
import {
  Star,
  CheckCircle,
  Trash2,
  XCircle,
  ShieldAlert,
  Check,
  RefreshCw,
  MessageSquare,
  Sparkles,
  Clock,
  UserCheck
} from 'lucide-react';

const AdminReviewsPage = () => {
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [filter, setFilter] = useState('all');

  useEffect(() => {
    fetchReviews();
  }, []);

  const fetchReviews = async () => {
    try {
      setRefreshing(true);
      const res = await adminApi.get('/reviews/admin');
      setReviews(res.data.data || res.data.reviews || []);
    } catch (err) {
      console.error('Failed to fetch reviews from MongoDB:', err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const handleToggleApprove = async (id, currentStatus) => {
    try {
      const res = await adminApi.put(`/reviews/${id}/approve`, { isApproved: !currentStatus });
      const updated = res.data.review || res.data.data;
      setReviews((prev) =>
        prev.map((r) => (r._id === id ? { ...r, isApproved: updated?.isApproved ?? !currentStatus } : r))
      );
    } catch (err) {
      alert('Could not update review approval: ' + (err.response?.data?.message || err.message));
    }
  };

  const handleDeleteReview = async (id) => {
    if (!window.confirm('Are you sure you want to permanently delete this customer review from MongoDB?')) return;
    try {
      await adminApi.delete(`/reviews/${id}`);
      setReviews((prev) => prev.filter((r) => r._id !== id));
    } catch (err) {
      alert('Failed to delete review: ' + (err.response?.data?.message || err.message));
    }
  };

  const approvedCount = reviews.filter((r) => r.isApproved).length;
  const pendingCount = reviews.filter((r) => !r.isApproved).length;
  const avgRating = reviews.length > 0 
    ? (reviews.reduce((acc, r) => acc + (r.rating || 5), 0) / reviews.length).toFixed(1) 
    : '5.0';

  const filteredReviews = reviews.filter((r) => {
    if (filter === 'pending') return !r.isApproved;
    if (filter === 'approved') return r.isApproved;
    return true;
  });

  if (loading) {
    return (
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '50vh' }}>
        <div style={{ textAlign: 'center' }}>
          <RefreshCw size={36} color="#059669" style={{ animation: 'spin 1s linear infinite', margin: '0 auto 1rem' }} />
          <p style={{ color: '#64748B', fontSize: '0.9rem', fontWeight: 600 }}>Loading review queue from MongoDB...</p>
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
              Review Moderation Queue
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
              {reviews.length} Total Feedback Records
            </span>
          </div>
          <p style={{ color: '#64748B', fontSize: '0.92rem', marginTop: '0.35rem', fontWeight: 500 }}>
            Inspect, moderate, and publish verified customer dining feedback to the live storefront
          </p>
        </div>

        <button
          onClick={fetchReviews}
          disabled={refreshing}
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '0.5rem',
            padding: '0.65rem 1.25rem',
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
          onMouseEnter={(e) => {
            if (!refreshing) {
              e.currentTarget.style.backgroundColor = '#F8FAFC';
              e.currentTarget.style.borderColor = '#94A3B8';
            }
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.backgroundColor = '#FFFFFF';
            e.currentTarget.style.borderColor = '#CBD5E1';
          }}
          title="Reload reviews from MongoDB database"
        >
          <RefreshCw size={15} style={{ animation: refreshing ? 'spin 1s linear infinite' : 'none' }} />
          <span>{refreshing ? 'Syncing...' : 'Sync Reviews'}</span>
        </button>
      </div>

      {/* Review Telemetry KPI Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '1.25rem', marginBottom: '2rem' }}>
        {/* Total Feedback */}
        <div className="admin-card" style={{ padding: '1.25rem', borderTop: '3px solid #3B82F6', borderRadius: '14px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
            <span style={{ fontSize: '0.8rem', fontWeight: 700, color: '#64748B', textTransform: 'uppercase' }}>All Reviews</span>
            <div style={{ width: '36px', height: '36px', borderRadius: '8px', backgroundColor: '#EFF6FF', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#2563EB' }}>
              <MessageSquare size={18} />
            </div>
          </div>
          <div style={{ fontSize: '1.85rem', fontWeight: 800, color: '#0F172A' }}>{reviews.length}</div>
          <p style={{ fontSize: '0.75rem', color: '#64748B', marginTop: '0.25rem' }}>Recorded diner submissions</p>
        </div>

        {/* Approved & Live */}
        <div className="admin-card" style={{ padding: '1.25rem', borderTop: '3px solid #10B981', borderRadius: '14px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
            <span style={{ fontSize: '0.8rem', fontWeight: 700, color: '#065F46', textTransform: 'uppercase' }}>Published Live</span>
            <div style={{ width: '36px', height: '36px', borderRadius: '8px', backgroundColor: '#ECFDF5', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#059669' }}>
              <CheckCircle size={18} />
            </div>
          </div>
          <div style={{ fontSize: '1.85rem', fontWeight: 800, color: '#065F46' }}>{approvedCount}</div>
          <p style={{ fontSize: '0.75rem', color: '#059669', marginTop: '0.25rem', fontWeight: 600 }}>Visible on customer site</p>
        </div>

        {/* Pending Moderation */}
        <div className="admin-card" style={{ padding: '1.25rem', borderTop: '3px solid #F59E0B', borderRadius: '14px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
            <span style={{ fontSize: '0.8rem', fontWeight: 700, color: '#92400E', textTransform: 'uppercase' }}>Awaiting Action</span>
            <div style={{ width: '36px', height: '36px', borderRadius: '8px', backgroundColor: '#FFFBEB', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#D97706' }}>
              <Clock size={18} />
            </div>
          </div>
          <div style={{ fontSize: '1.85rem', fontWeight: 800, color: '#D97706' }}>{pendingCount}</div>
          <p style={{ fontSize: '0.75rem', color: '#D97706', marginTop: '0.25rem', fontWeight: 600 }}>Requires admin approval</p>
        </div>

        {/* Average Rating */}
        <div className="admin-card" style={{ padding: '1.25rem', borderTop: '3px solid #EAB308', borderRadius: '14px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
            <span style={{ fontSize: '0.8rem', fontWeight: 700, color: '#854D0E', textTransform: 'uppercase' }}>Average Rating</span>
            <div style={{ width: '36px', height: '36px', borderRadius: '8px', backgroundColor: '#FEF9C3', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#CA8A04' }}>
              <Star size={18} fill="#CA8A04" />
            </div>
          </div>
          <div style={{ fontSize: '1.85rem', fontWeight: 800, color: '#854D0E', display: 'flex', alignItems: 'center', gap: '6px' }}>
            <span>{avgRating}</span>
            <span style={{ fontSize: '1rem', color: '#A16207', fontWeight: 600 }}>/ 5.0</span>
          </div>
          <p style={{ fontSize: '0.75rem', color: '#854D0E', marginTop: '0.25rem' }}>Customer satisfaction score</p>
        </div>
      </div>

      {/* Modern Filter Tabs */}
      <div
        style={{
          display: 'flex',
          gap: '0.65rem',
          marginBottom: '1.5rem',
          backgroundColor: '#F1F5F9',
          padding: '4px',
          borderRadius: '12px',
          width: 'fit-content',
        }}
      >
        {[
          { key: 'all', label: `All Reviews (${reviews.length})` },
          { key: 'approved', label: `Approved (${approvedCount})` },
          { key: 'pending', label: `Pending Moderation (${pendingCount})` },
        ].map((tab) => {
          const isActive = filter === tab.key;
          return (
            <button
              key={tab.key}
              onClick={() => setFilter(tab.key)}
              style={{
                backgroundColor: isActive ? '#FFFFFF' : 'transparent',
                color: isActive ? '#0F172A' : '#64748B',
                fontWeight: isActive ? 700 : 600,
                borderRadius: '8px',
                padding: '0.55rem 1.15rem',
                fontSize: '0.84rem',
                boxShadow: isActive ? '0 1px 3px rgba(0,0,0,0.1)' : 'none',
                transition: 'all 0.15s ease',
                cursor: 'pointer',
              }}
            >
              {tab.label}
            </button>
          );
        })}
      </div>

      {/* Reviews List */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
        {filteredReviews.length === 0 ? (
          <div className="admin-card" style={{ padding: '3.5rem 1rem', textAlign: 'center', color: '#94A3B8', borderRadius: '16px' }}>
            <MessageSquare size={44} style={{ margin: '0 auto 0.75rem', opacity: 0.35 }} />
            <p style={{ fontSize: '1rem', fontWeight: 700, color: '#64748B' }}>No customer reviews in this category</p>
            <p style={{ fontSize: '0.82rem', color: '#94A3B8', marginTop: '0.25rem' }}>
              Feedback submitted by diners via the storefront will appear here for moderation.
            </p>
          </div>
        ) : (
          filteredReviews.map((rev) => {
            const dinerName = rev.user?.name || rev.userName || 'Diner';
            return (
              <div
                key={rev._id}
                className="admin-card"
                style={{
                  padding: '1.4rem 1.6rem',
                  borderRadius: '14px',
                  borderLeft: `5px solid ${rev.isApproved ? '#10B981' : '#F59E0B'}`,
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'flex-start',
                  flexWrap: 'wrap',
                  gap: '1.25rem',
                  boxShadow: '0 1px 3px rgba(0, 0, 0, 0.04)',
                }}
              >
                <div style={{ flex: '1 1 360px' }}>
                  {/* Top Bar: Stars + Status Pills */}
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem', marginBottom: '0.6rem', flexWrap: 'wrap' }}>
                    <div style={{ display: 'flex', gap: '2px', alignItems: 'center' }}>
                      {[1, 2, 3, 4, 5].map((star) => (
                        <Star
                          key={star}
                          size={16}
                          fill={star <= rev.rating ? '#F59E0B' : '#E2E8F0'}
                          color={star <= rev.rating ? '#F59E0B' : '#CBD5E1'}
                        />
                      ))}
                      <span style={{ fontSize: '0.85rem', fontWeight: 800, color: '#0F172A', marginLeft: '6px' }}>
                        {rev.rating}.0
                      </span>
                    </div>

                    {rev.isApproved ? (
                      <span
                        style={{
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: '4px',
                          fontSize: '0.72rem',
                          fontWeight: 700,
                          backgroundColor: '#ECFDF5',
                          color: '#065F46',
                          border: '1px solid #A7F3D0',
                          padding: '2px 8px',
                          borderRadius: '999px',
                        }}
                      >
                        <Check size={12} /> Approved & Public
                      </span>
                    ) : (
                      <span
                        style={{
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: '4px',
                          fontSize: '0.72rem',
                          fontWeight: 700,
                          backgroundColor: '#FFFBEB',
                          color: '#92400E',
                          border: '1px solid #FDE68A',
                          padding: '2px 8px',
                          borderRadius: '999px',
                        }}
                      >
                        <ShieldAlert size={12} /> Pending Moderation
                      </span>
                    )}

                    {rev.isVerifiedDiner && (
                      <span
                        style={{
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: '4px',
                          fontSize: '0.72rem',
                          fontWeight: 700,
                          backgroundColor: '#EFF6FF',
                          color: '#1E40AF',
                          border: '1px solid #BFDBFE',
                          padding: '2px 8px',
                          borderRadius: '999px',
                        }}
                      >
                        <UserCheck size={12} /> Verified Diner
                      </span>
                    )}
                  </div>

                  {/* Review Text */}
                  <p style={{ color: '#0F172A', fontSize: '0.98rem', fontWeight: 600, lineHeight: 1.5, margin: '0.5rem 0' }}>
                    "{rev.comment}"
                  </p>

                  {/* Diner Metadata Row */}
                  <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', fontSize: '0.82rem', color: '#64748B', marginTop: '0.6rem', flexWrap: 'wrap' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                      <div
                        style={{
                          width: '22px',
                          height: '22px',
                          borderRadius: '50%',
                          backgroundColor: '#E0E7FF',
                          color: '#3730A3',
                          fontSize: '0.68rem',
                          fontWeight: 800,
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                        }}
                      >
                        {dinerName.charAt(0).toUpperCase()}
                      </div>
                      <span>
                        Diner: <strong style={{ color: '#1E293B' }}>{dinerName}</strong>
                      </span>
                    </div>

                    {rev.dishTag && (
                      <span>
                        Dish: <strong style={{ color: '#059669', backgroundColor: '#ECFDF5', padding: '1px 6px', borderRadius: '4px' }}>{rev.dishTag}</strong>
                      </span>
                    )}

                    <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                      <Clock size={12} color="#94A3B8" />
                      <span>
                        {new Date(rev.createdAt).toLocaleDateString('en-IN', {
                          year: 'numeric',
                          month: 'short',
                          day: 'numeric',
                        })}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Moderation Actions */}
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
                  <button
                    onClick={() => handleToggleApprove(rev._id, rev.isApproved)}
                    style={{
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '5px',
                      padding: '0.55rem 1rem',
                      borderRadius: '8px',
                      fontSize: '0.82rem',
                      fontWeight: 700,
                      cursor: 'pointer',
                      transition: 'all 0.2s ease',
                      backgroundColor: rev.isApproved ? '#FFFBEB' : '#059669',
                      color: rev.isApproved ? '#92400E' : '#FFFFFF',
                      border: `1px solid ${rev.isApproved ? '#FDE68A' : '#047857'}`,
                      boxShadow: rev.isApproved ? 'none' : '0 2px 6px rgba(5, 150, 105, 0.25)',
                    }}
                    onMouseEnter={(e) => {
                      if (rev.isApproved) {
                        e.currentTarget.style.backgroundColor = '#FEF3C7';
                      } else {
                        e.currentTarget.style.backgroundColor = '#047857';
                      }
                    }}
                    onMouseLeave={(e) => {
                      if (rev.isApproved) {
                        e.currentTarget.style.backgroundColor = '#FFFBEB';
                      } else {
                        e.currentTarget.style.backgroundColor = '#059669';
                      }
                    }}
                  >
                    {rev.isApproved ? (
                      <>
                        <XCircle size={14} /> Unpublish
                      </>
                    ) : (
                      <>
                        <CheckCircle size={14} /> Approve & Publish
                      </>
                    )}
                  </button>

                  <button
                    onClick={() => handleDeleteReview(rev._id)}
                    style={{
                      display: 'inline-flex',
                      alignItems: 'center',
                      justifyContent: 'center',                     
                      width: '36px',
                      height: '36px',
                      borderRadius: '8px',
                      backgroundColor: '#FEF2F2',
                      color: '#DC2626',
                      border: '1px solid #FECACA',
                      cursor: 'pointer',
                      transition: 'all 0.2s ease',
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.backgroundColor = '#DC2626';
                      e.currentTarget.style.color = '#FFFFFF';
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.backgroundColor = '#FEF2F2';
                      e.currentTarget.style.color = '#DC2626';
                    }}
                    title="Permanently Delete Review"
                  >
                    <Trash2 size={15} />
                  </button>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};

export default AdminReviewsPage;
