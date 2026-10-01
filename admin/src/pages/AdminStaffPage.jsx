import React, { useState, useEffect } from 'react';
import {
  Users,
  UserPlus,
  Search,
  Filter,
  Phone,
  Mail,
  Shield,
  Clock,
  Award,
  CheckCircle2,
  XCircle,
  AlertCircle,
  Edit2,
  Trash2,
  ChefHat,
  Bike,
  Coins,
  Calendar,
  X,
  Sparkles,
  ArrowUpDown,
  PhoneCall
} from 'lucide-react';

const INITIAL_STAFF = [
  {
    id: 'SG-EMP-101',
    name: 'Chef Rajesh Sharma',
    role: 'Head Chef (Dum Biryani)',
    department: 'Kitchen',
    phone: '+91 98450 12345',
    email: 'rajesh.chef@spicegarden.com',
    shift: 'Morning (09:00 AM - 05:00 PM)',
    status: 'On Duty',
    rating: 4.9,
    experience: '12 Years',
    salary: '₹55,000 / mo',
    specialty: 'Authentic Hyderabadi & Dum Cooking',
    avatarBg: '#E65100',
  },
  {
    id: 'SG-EMP-102',
    name: 'Chef Mohammed Farooq',
    role: 'Tandoor & Kebab Master',
    department: 'Kitchen',
    phone: '+91 98450 56789',
    email: 'farooq.kebab@spicegarden.com',
    shift: 'Evening (03:00 PM - 11:30 PM)',
    status: 'On Duty',
    rating: 4.95,
    experience: '9 Years',
    salary: '₹48,000 / mo',
    specialty: 'Murgh Malai Tikka & Galouti Kebabs',
    avatarBg: '#059669',
  },
  {
    id: 'SG-EMP-103',
    name: 'Suresh Gowda',
    role: 'Floor & Kitchen Operations Lead',
    department: 'Operations',
    phone: '+91 99801 22334',
    email: 'suresh.ops@spicegarden.com',
    shift: 'Morning (10:00 AM - 06:00 PM)',
    status: 'On Duty',
    rating: 4.8,
    experience: '6 Years',
    salary: '₹42,000 / mo',
    specialty: 'Inventory, Order Dispatch & Hygiene Audits',
    avatarBg: '#2563EB',
  },
  {
    id: 'SG-EMP-104',
    name: 'Priya Nambiar',
    role: 'Billing & Customer Accounts Lead',
    department: 'Accounts',
    phone: '+91 97411 99887',
    email: 'priya.billing@spicegarden.com',
    shift: 'Full Day (11:00 AM - 08:00 PM)',
    status: 'On Duty',
    rating: 4.85,
    experience: '4 Years',
    salary: '₹36,000 / mo',
    specialty: 'POS Systems, Cash Reconciliation & Invoicing',
    avatarBg: '#7C3AED',
  },
  {
    id: 'SG-EMP-105',
    name: 'Kiran Kumar V',
    role: 'Senior Delivery Captain (Indiranagar / Domlur)',
    department: 'Delivery Fleet',
    phone: '+91 96322 44556',
    email: 'kiran.fleet@spicegarden.com',
    shift: 'Evening (05:00 PM - 11:30 PM)',
    status: 'On Duty',
    rating: 4.92,
    experience: '3 Years',
    salary: '₹28,000 / mo',
    specialty: 'Express Bangalore Delivery & Cold-chain Handling',
    avatarBg: '#0D9488',
  },
  {
    id: 'SG-EMP-106',
    name: 'Manjunath Reddy',
    role: 'Delivery Executive (Koramangala / HSR)',
    department: 'Delivery Fleet',
    phone: '+91 95911 77889',
    email: 'manju.fleet@spicegarden.com',
    shift: 'Evening (04:00 PM - 11:30 PM)',
    status: 'On Duty',
    rating: 4.75,
    experience: '2 Years',
    salary: '₹26,000 / mo',
    specialty: 'Navigation & Thermal Bag Logistics',
    avatarBg: '#D97706',
  },
  {
    id: 'SG-EMP-107',
    name: 'Sunita Devi',
    role: 'Kitchen Prep & Pantry Specialist',
    department: 'Kitchen',
    phone: '+91 98866 33221',
    email: 'sunita.prep@spicegarden.com',
    shift: 'Morning (08:00 AM - 04:00 PM)',
    status: 'On Break',
    rating: 4.7,
    experience: '5 Years',
    salary: '₹24,000 / mo',
    specialty: 'Marinade Prep, Fresh Salads & Desserts',
    avatarBg: '#DB2777',
  },
];

const AdminStaffPage = () => {
  const [staffList, setStaffList] = useState(() => {
    try {
      const saved = localStorage.getItem('sg_admin_staff');
      return saved ? JSON.parse(saved) : INITIAL_STAFF;
    } catch {
      return INITIAL_STAFF;
    }
  });

  const [searchTerm, setSearchTerm] = useState('');
  const [selectedDept, setSelectedDept] = useState('All');
  const [selectedStatus, setSelectedStatus] = useState('All');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingStaff, setEditingStaff] = useState(null);

  const [formData, setFormData] = useState({
    name: '',
    role: '',
    department: 'Kitchen',
    phone: '',
    email: '',
    shift: 'Morning (09:00 AM - 05:00 PM)',
    status: 'On Duty',
    experience: '',
    salary: '',
    specialty: '',
  });

  useEffect(() => {
    localStorage.setItem('sg_admin_staff', JSON.stringify(staffList));
  }, [staffList]);

  const handleOpenAddModal = () => {
    setEditingStaff(null);
    setFormData({
      name: '',
      role: '',
      department: 'Kitchen',
      phone: '',
      email: '',
      shift: 'Morning (09:00 AM - 05:00 PM)',
      status: 'On Duty',
      experience: '',
      salary: '',
      specialty: '',
    });
    setIsModalOpen(true);
  };

  const handleOpenEditModal = (staff) => {
    setEditingStaff(staff);
    setFormData({
      name: staff.name,
      role: staff.role,
      department: staff.department,
      phone: staff.phone,
      email: staff.email,
      shift: staff.shift,
      status: staff.status,
      experience: staff.experience,
      salary: staff.salary,
      specialty: staff.specialty,
    });
    setIsModalOpen(true);
  };

  const handleSaveStaff = (e) => {
    e.preventDefault();
    if (!formData.name.trim() || !formData.role.trim()) return;

    if (editingStaff) {
      setStaffList((prev) =>
        prev.map((item) =>
          item.id === editingStaff.id
            ? { ...item, ...formData }
            : item
        )
      );
    } else {
      const newStaff = {
        ...formData,
        id: `SG-EMP-${Math.floor(100 + Math.random() * 900)}`,
        rating: 5.0,
        avatarBg: '#059669',
      };
      setStaffList((prev) => [newStaff, ...prev]);
    }
    setIsModalOpen(false);
  };

  const handleDeleteStaff = (id) => {
    if (window.confirm('Are you sure you want to remove this staff record?')) {
      setStaffList((prev) => prev.filter((item) => item.id !== id));
    }
  };

  const toggleStatus = (id) => {
    setStaffList((prev) =>
      prev.map((item) => {
        if (item.id === id) {
          const next =
            item.status === 'On Duty'
              ? 'On Break'
              : item.status === 'On Break'
              ? 'Off Duty'
              : 'On Duty';
          return { ...item, status: next };
        }
        return item;
      })
    );
  };

  // Filtered staff
  const filteredStaff = staffList.filter((item) => {
    const matchesSearch =
      item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.role.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.phone.includes(searchTerm);

    const matchesDept = selectedDept === 'All' || item.department === selectedDept;
    const matchesStatus = selectedStatus === 'All' || item.status === selectedStatus;

    return matchesSearch && matchesDept && matchesStatus;
  });

  const onDutyCount = staffList.filter((s) => s.status === 'On Duty').length;
  const onBreakCount = staffList.filter((s) => s.status === 'On Break').length;
  const offDutyCount = staffList.filter((s) => s.status === 'Off Duty').length;

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
              Staff & Kitchen Personnel Roster
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
              {staffList.length} Active Staff
            </span>
          </div>
          <p style={{ fontSize: '0.88rem', color: '#64748B', margin: 0 }}>
            Manage master chefs, kitchen assistants, delivery fleet, and floor operations roster in real-time.
          </p>
        </div>

        <button
          onClick={handleOpenAddModal}
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '8px',
            padding: '0.75rem 1.35rem',
            borderRadius: '10px',
            backgroundColor: '#059669',
            color: '#FFFFFF',
            fontWeight: 700,
            fontSize: '0.9rem',
            border: 'none',
            cursor: 'pointer',
            boxShadow: '0 2px 8px rgba(5, 150, 105, 0.25)',
            transition: 'all 0.2s ease',
          }}
          onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = '#047857')}
          onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = '#059669')}
        >
          <UserPlus size={17} />
          <span>Add Staff Member</span>
        </button>
      </div>

      {/* Roster KPI Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '1rem' }}>
        <div
          style={{
            backgroundColor: '#FFFFFF',
            padding: '1.25rem 1.4rem',
            borderRadius: '14px',
            border: '1px solid #E2E8F0',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
          }}
        >
          <div>
            <div style={{ fontSize: '0.8rem', color: '#64748B', fontWeight: 600 }}>TOTAL ROSTER</div>
            <div style={{ fontSize: '1.75rem', fontWeight: 800, color: '#0F172A', marginTop: '4px' }}>
              {staffList.length}
            </div>
            <div style={{ fontSize: '0.74rem', color: '#10B981', fontWeight: 600, marginTop: '2px' }}>
              ● 100% Verified Crew
            </div>
          </div>
          <div
            style={{
              width: '44px',
              height: '44px',
              borderRadius: '10px',
              backgroundColor: '#F1F5F9',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#334155',
            }}
          >
            <Users size={22} />
          </div>
        </div>

        <div
          style={{
            backgroundColor: '#FFFFFF',
            padding: '1.25rem 1.4rem',
            borderRadius: '14px',
            border: '1px solid #E2E8F0',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
          }}
        >
          <div>
            <div style={{ fontSize: '0.8rem', color: '#065F46', fontWeight: 600 }}>CURRENTLY ON DUTY</div>
            <div style={{ fontSize: '1.75rem', fontWeight: 800, color: '#059669', marginTop: '4px' }}>
              {onDutyCount}
            </div>
            <div style={{ fontSize: '0.74rem', color: '#059669', fontWeight: 600, marginTop: '2px' }}>
              Kitchen & Delivery active
            </div>
          </div>
          <div
            style={{
              width: '44px',
              height: '44px',
              borderRadius: '10px',
              backgroundColor: '#ECFDF5',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#059669',
            }}
          >
            <ChefHat size={22} />
          </div>
        </div>

        <div
          style={{
            backgroundColor: '#FFFFFF',
            padding: '1.25rem 1.4rem',
            borderRadius: '14px',
            border: '1px solid #E2E8F0',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
          }}
        >
          <div>
            <div style={{ fontSize: '0.8rem', color: '#92400E', fontWeight: 600 }}>ON BREAK</div>
            <div style={{ fontSize: '1.75rem', fontWeight: 800, color: '#D97706', marginTop: '4px' }}>
              {onBreakCount}
            </div>
            <div style={{ fontSize: '0.74rem', color: '#D97706', fontWeight: 600, marginTop: '2px' }}>
              Meal & shift transition
            </div>
          </div>
          <div
            style={{
              width: '44px',
              height: '44px',
              borderRadius: '10px',
              backgroundColor: '#FEF3C7',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#D97706',
            }}
          >
            <Clock size={22} />
          </div>
        </div>

        <div
          style={{
            backgroundColor: '#FFFFFF',
            padding: '1.25rem 1.4rem',
            borderRadius: '14px',
            border: '1px solid #E2E8F0',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
          }}
        >
          <div>
            <div style={{ fontSize: '0.8rem', color: '#1E40AF', fontWeight: 600 }}>DELIVERY FLEET</div>
            <div style={{ fontSize: '1.75rem', fontWeight: 800, color: '#2563EB', marginTop: '4px' }}>
              {staffList.filter((s) => s.department === 'Delivery Fleet').length}
            </div>
            <div style={{ fontSize: '0.74rem', color: '#2563EB', fontWeight: 600, marginTop: '2px' }}>
              Bangalore Zone Covered
            </div>
          </div>
          <div
            style={{
              width: '44px',
              height: '44px',
              borderRadius: '10px',
              backgroundColor: '#EFF6FF',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#2563EB',
            }}
          >
            <Bike size={22} />
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
          <div
            style={{
              position: 'relative',
              flex: 1,
              display: 'flex',
              alignItems: 'center',
            }}
          >
            <Search
              size={17}
              color="#94A3B8"
              style={{ position: 'absolute', left: '12px', pointerEvents: 'none' }}
            />
            <input
              type="text"
              placeholder="Search staff by name, role, ID, or phone number..."
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
            value={selectedDept}
            onChange={(e) => setSelectedDept(e.target.value)}
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
            <option value="All">All Departments</option>
            <option value="Kitchen">Kitchen Staff</option>
            <option value="Delivery Fleet">Delivery Fleet</option>
            <option value="Operations">Operations Lead</option>
            <option value="Accounts">Accounts & Billing</option>
          </select>

          <select
            value={selectedStatus}
            onChange={(e) => setSelectedStatus(e.target.value)}
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
            <option value="All">All Shift Statuses</option>
            <option value="On Duty">🟢 On Duty</option>
            <option value="On Break">🟡 On Break</option>
            <option value="Off Duty">⚪ Off Duty</option>
          </select>
        </div>

        <div style={{ fontSize: '0.82rem', color: '#64748B', fontWeight: 600 }}>
          Showing <strong>{filteredStaff.length}</strong> of {staffList.length} staff
        </div>
      </div>

      {/* Staff Roster Table */}
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
                  PERSONNEL & ROLE
                </th>
                <th style={{ padding: '0.9rem 1.25rem', fontSize: '0.76rem', fontWeight: 700, color: '#475569' }}>
                  DEPARTMENT
                </th>
                <th style={{ padding: '0.9rem 1.25rem', fontSize: '0.76rem', fontWeight: 700, color: '#475569' }}>
                  SHIFT & SCHEDULE
                </th>
                <th style={{ padding: '0.9rem 1.25rem', fontSize: '0.76rem', fontWeight: 700, color: '#475569' }}>
                  DUTY STATUS
                </th>
                <th style={{ padding: '0.9rem 1.25rem', fontSize: '0.76rem', fontWeight: 700, color: '#475569' }}>
                  CONTACT
                </th>
                <th style={{ padding: '0.9rem 1.25rem', fontSize: '0.76rem', fontWeight: 700, color: '#475569' }}>
                  COMPENSATION
                </th>
                <th style={{ padding: '0.9rem 1.25rem', fontSize: '0.76rem', fontWeight: 700, color: '#475569', textAlign: 'right' }}>
                  ACTIONS
                </th>
              </tr>
            </thead>
            <tbody>
              {filteredStaff.length === 0 ? (
                <tr>
                  <td colSpan={7} style={{ padding: '3rem', textAlign: 'center', color: '#64748B' }}>
                    <Users size={36} color="#94A3B8" style={{ margin: '0 auto 0.5rem' }} />
                    <p style={{ fontWeight: 600, fontSize: '0.95rem', margin: 0 }}>No staff members found.</p>
                    <p style={{ fontSize: '0.82rem', margin: '4px 0 0' }}>Try adjusting search or department filters.</p>
                  </td>
                </tr>
              ) : (
                filteredStaff.map((staff) => (
                  <tr
                    key={staff.id}
                    style={{
                      borderBottom: '1px solid #F1F5F9',
                      transition: 'background-color 0.15s ease',
                    }}
                    onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = '#FAFAFA')}
                    onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = 'transparent')}
                  >
                    {/* Personnel & Role */}
                    <td style={{ padding: '1rem 1.25rem' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                        <div
                          style={{
                            width: '40px',
                            height: '40px',
                            borderRadius: '10px',
                            backgroundColor: staff.avatarBg || '#059669',
                            color: '#FFFFFF',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            fontWeight: 800,
                            fontSize: '0.95rem',
                            flexShrink: 0,
                          }}
                        >
                          {staff.name.charAt(0).toUpperCase()}
                        </div>
                        <div>
                          <div style={{ fontWeight: 700, fontSize: '0.92rem', color: '#0F172A' }}>
                            {staff.name}
                          </div>
                          <div style={{ fontSize: '0.78rem', color: '#64748B', display: 'flex', alignItems: 'center', gap: '6px' }}>
                            <span>{staff.role}</span>
                            <span style={{ color: '#CBD5E1' }}>•</span>
                            <span style={{ fontFamily: 'monospace', color: '#059669', fontWeight: 600 }}>{staff.id}</span>
                          </div>
                        </div>
                      </div>
                    </td>

                    {/* Department */}
                    <td style={{ padding: '1rem 1.25rem' }}>
                      <span
                        style={{
                          fontSize: '0.75rem',
                          fontWeight: 700,
                          padding: '3px 8px',
                          borderRadius: '6px',
                          backgroundColor:
                            staff.department === 'Kitchen'
                              ? '#FFF7ED'
                              : staff.department === 'Delivery Fleet'
                              ? '#EFF6FF'
                              : '#F3E8FF',
                          color:
                            staff.department === 'Kitchen'
                              ? '#C2410C'
                              : staff.department === 'Delivery Fleet'
                              ? '#1D4ED8'
                              : '#6D28D9',
                          border: `1px solid ${
                            staff.department === 'Kitchen'
                              ? '#FED7AA'
                              : staff.department === 'Delivery Fleet'
                              ? '#BFDBFE'
                              : '#E9D5FF'
                          }`,
                        }}
                      >
                        {staff.department}
                      </span>
                    </td>

                    {/* Shift */}
                    <td style={{ padding: '1rem 1.25rem' }}>
                      <div style={{ fontSize: '0.82rem', color: '#334155', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '5px' }}>
                        <Clock size={13} color="#64748B" />
                        <span>{staff.shift}</span>
                      </div>
                      {staff.specialty && (
                        <div style={{ fontSize: '0.72rem', color: '#64748B', marginTop: '2px' }}>
                          ★ {staff.specialty}
                        </div>
                      )}
                    </td>

                    {/* Duty Status */}
                    <td style={{ padding: '1rem 1.25rem' }}>
                      <button
                        onClick={() => toggleStatus(staff.id)}
                        title="Click to cycle status (On Duty ➔ On Break ➔ Off Duty)"
                        style={{
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: '5px',
                          padding: '4px 9px',
                          borderRadius: '999px',
                          fontSize: '0.75rem',
                          fontWeight: 700,
                          cursor: 'pointer',
                          border: 'none',
                          backgroundColor:
                            staff.status === 'On Duty'
                              ? '#ECFDF5'
                              : staff.status === 'On Break'
                              ? '#FFFBEB'
                              : '#F1F5F9',
                          color:
                            staff.status === 'On Duty'
                              ? '#065F46'
                              : staff.status === 'On Break'
                              ? '#92400E'
                              : '#475569',
                          border: `1px solid ${
                            staff.status === 'On Duty'
                              ? '#A7F3D0'
                              : staff.status === 'On Break'
                              ? '#FDE68A'
                              : '#CBD5E1'
                          }`,
                          transition: 'all 0.15s ease',
                        }}
                      >
                        <span
                          style={{
                            width: '6px',
                            height: '6px',
                            borderRadius: '50%',
                            backgroundColor:
                              staff.status === 'On Duty'
                                ? '#10B981'
                                : staff.status === 'On Break'
                                ? '#F59E0B'
                                : '#94A3B8',
                          }}
                        />
                        {staff.status}
                      </button>
                    </td>

                    {/* Contact */}
                    <td style={{ padding: '1rem 1.25rem' }}>
                      <a
                        href={`tel:${staff.phone}`}
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: '5px',
                          color: '#0F172A',
                          textDecoration: 'none',
                          fontSize: '0.82rem',
                          fontWeight: 600,
                        }}
                      >
                        <PhoneCall size={13} color="#059669" />
                        <span>{staff.phone}</span>
                      </a>
                      <div style={{ fontSize: '0.72rem', color: '#64748B', marginTop: '1px' }}>
                        {staff.email}
                      </div>
                    </td>

                    {/* Compensation */}
                    <td style={{ padding: '1rem 1.25rem' }}>
                      <div style={{ fontSize: '0.85rem', fontWeight: 700, color: '#0F172A' }}>
                        {staff.salary || '₹35,000 / mo'}
                      </div>
                      <div style={{ fontSize: '0.72rem', color: '#64748B' }}>
                        {staff.experience || '3+ yrs'} exp
                      </div>
                    </td>

                    {/* Actions */}
                    <td style={{ padding: '1rem 1.25rem', textAlign: 'right' }}>
                      <div style={{ display: 'inline-flex', gap: '6px' }}>
                        <button
                          onClick={() => handleOpenEditModal(staff)}
                          title="Edit Staff Member"
                          style={{
                            width: '32px',
                            height: '32px',
                            borderRadius: '8px',
                            border: '1px solid #CBD5E1',
                            backgroundColor: '#FFFFFF',
                            color: '#334155',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            cursor: 'pointer',
                            transition: 'all 0.15s ease',
                          }}
                          onMouseEnter={(e) => {
                            e.currentTarget.style.backgroundColor = '#F1F5F9';
                            e.currentTarget.style.borderColor = '#94A3B8';
                          }}
                          onMouseLeave={(e) => {
                            e.currentTarget.style.backgroundColor = '#FFFFFF';
                            e.currentTarget.style.borderColor = '#CBD5E1';
                          }}
                        >
                          <Edit2 size={14} />
                        </button>

                        <button
                          onClick={() => handleDeleteStaff(staff.id)}
                          title="Delete Staff Record"
                          style={{
                            width: '32px',
                            height: '32px',
                            borderRadius: '8px',
                            border: '1px solid #FECACA',
                            backgroundColor: '#FEF2F2',
                            color: '#DC2626',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            cursor: 'pointer',
                            transition: 'all 0.15s ease',
                          }}
                          onMouseEnter={(e) => {
                            e.currentTarget.style.backgroundColor = '#DC2626';
                            e.currentTarget.style.color = '#FFFFFF';
                          }}
                          onMouseLeave={(e) => {
                            e.currentTarget.style.backgroundColor = '#FEF2F2';
                            e.currentTarget.style.color = '#DC2626';
                          }}
                        >
                          <Trash2 size={14} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add / Edit Staff Modal */}
      {isModalOpen && (
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
              maxWidth: '560px',
              boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 8px 10px -6px rgba(0, 0, 0, 0.1)',
              overflow: 'hidden',
              animation: 'fadeIn 0.2s ease',
            }}
          >
            <div
              style={{
                padding: '1.25rem 1.5rem',
                borderBottom: '1px solid #E2E8F0',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Users size={18} color="#059669" />
                <h3 style={{ fontSize: '1.1rem', fontWeight: 800, color: '#0F172A', margin: 0 }}>
                  {editingStaff ? 'Edit Staff Details' : 'Add New Staff Member'}
                </h3>
              </div>
              <button
                onClick={() => setIsModalOpen(false)}
                style={{
                  background: 'none',
                  border: 'none',
                  color: '#64748B',
                  cursor: 'pointer',
                  padding: '4px',
                }}
              >
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleSaveStaff} style={{ padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 700, color: '#334155', marginBottom: '4px' }}>
                    Full Name *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Chef Anand Kumar"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    style={{
                      width: '100%',
                      padding: '0.6rem 0.85rem',
                      borderRadius: '8px',
                      border: '1px solid #CBD5E1',
                      fontSize: '0.88rem',
                    }}
                  />
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 700, color: '#334155', marginBottom: '4px' }}>
                    Role / Designation *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Master Dum Chef"
                    value={formData.role}
                    onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                    style={{
                      width: '100%',
                      padding: '0.6rem 0.85rem',
                      borderRadius: '8px',
                      border: '1px solid #CBD5E1',
                      fontSize: '0.88rem',
                    }}
                  />
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 700, color: '#334155', marginBottom: '4px' }}>
                    Department
                  </label>
                  <select
                    value={formData.department}
                    onChange={(e) => setFormData({ ...formData, department: e.target.value })}
                    style={{
                      width: '100%',
                      padding: '0.6rem 0.85rem',
                      borderRadius: '8px',
                      border: '1px solid #CBD5E1',
                      fontSize: '0.88rem',
                      backgroundColor: '#FFFFFF',
                    }}
                  >
                    <option value="Kitchen">Kitchen Staff</option>
                    <option value="Delivery Fleet">Delivery Fleet</option>
                    <option value="Operations">Operations Lead</option>
                    <option value="Accounts">Accounts & Billing</option>
                  </select>
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 700, color: '#334155', marginBottom: '4px' }}>
                    Duty Status
                  </label>
                  <select
                    value={formData.status}
                    onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                    style={{
                      width: '100%',
                      padding: '0.6rem 0.85rem',
                      borderRadius: '8px',
                      border: '1px solid #CBD5E1',
                      fontSize: '0.88rem',
                      backgroundColor: '#FFFFFF',
                    }}
                  >
                    <option value="On Duty">On Duty</option>
                    <option value="On Break">On Break</option>
                    <option value="Off Duty">Off Duty</option>
                  </select>
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 700, color: '#334155', marginBottom: '4px' }}>
                    Phone Number
                  </label>
                  <input
                    type="tel"
                    placeholder="+91 98765 43210"
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    style={{
                      width: '100%',
                      padding: '0.6rem 0.85rem',
                      borderRadius: '8px',
                      border: '1px solid #CBD5E1',
                      fontSize: '0.88rem',
                    }}
                  />
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 700, color: '#334155', marginBottom: '4px' }}>
                    Monthly Salary / Wage
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. ₹35,000 / mo"
                    value={formData.salary}
                    onChange={(e) => setFormData({ ...formData, salary: e.target.value })}
                    style={{
                      width: '100%',
                      padding: '0.6rem 0.85rem',
                      borderRadius: '8px',
                      border: '1px solid #CBD5E1',
                      fontSize: '0.88rem',
                    }}
                  />
                </div>
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 700, color: '#334155', marginBottom: '4px' }}>
                  Shift Timing
                </label>
                <select
                  value={formData.shift}
                  onChange={(e) => setFormData({ ...formData, shift: e.target.value })}
                  style={{
                    width: '100%',
                    padding: '0.6rem 0.85rem',
                    borderRadius: '8px',
                    border: '1px solid #CBD5E1',
                    fontSize: '0.88rem',
                    backgroundColor: '#FFFFFF',
                  }}
                >
                  <option value="Morning (09:00 AM - 05:00 PM)">Morning (09:00 AM - 05:00 PM)</option>
                  <option value="Evening (04:00 PM - 11:30 PM)">Evening (04:00 PM - 11:30 PM)</option>
                  <option value="Full Day (11:00 AM - 09:00 PM)">Full Day (11:00 AM - 09:00 PM)</option>
                  <option value="Night Kitchen Prep (10:00 PM - 06:00 AM)">Night Kitchen Prep (10:00 PM - 06:00 AM)</option>
                </select>
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 700, color: '#334155', marginBottom: '4px' }}>
                  Culinary Specialty / Responsibilities
                </label>
                <input
                  type="text"
                  placeholder="e.g. Dum Handi Cooking, Tandoor Breads, Fleet Safety"
                  value={formData.specialty}
                  onChange={(e) => setFormData({ ...formData, specialty: e.target.value })}
                  style={{
                    width: '100%',
                    padding: '0.6rem 0.85rem',
                    borderRadius: '8px',
                    border: '1px solid #CBD5E1',
                    fontSize: '0.88rem',
                  }}
                />
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem', marginTop: '0.5rem' }}>
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  style={{
                    padding: '0.65rem 1.25rem',
                    borderRadius: '8px',
                    border: '1px solid #CBD5E1',
                    backgroundColor: '#FFFFFF',
                    color: '#475569',
                    fontSize: '0.88rem',
                    fontWeight: 600,
                    cursor: 'pointer',
                  }}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  style={{
                    padding: '0.65rem 1.4rem',
                    borderRadius: '8px',
                    border: 'none',
                    backgroundColor: '#059669',
                    color: '#FFFFFF',
                    fontSize: '0.88rem',
                    fontWeight: 700,
                    cursor: 'pointer',
                    boxShadow: '0 2px 6px rgba(5, 150, 105, 0.25)',
                  }}
                >
                  {editingStaff ? 'Save Changes' : 'Add Staff'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminStaffPage;
