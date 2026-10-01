import React, { useState, useEffect, useMemo, useRef } from 'react';
import adminApi from '../api/adminApi';
import {
  Plus,
  Edit2,
  Trash2,
  Check,
  X,
  Search,
  Utensils,
  Download,
  Filter,
  RefreshCw,
  Eye,
  AlertCircle,
  Flame,
  Sparkles,
  Grid,
  List,
  ChevronRight,
  TrendingUp,
  Clock,
  Star,
  CheckCircle2,
  DollarSign,
  ArrowUpDown,
  Tag,
  Soup,
  Coffee,
  ExternalLink,
  SlidersHorizontal,
  ChevronUp,
  ChevronDown,
  Camera,
  Upload,
  FolderOpen,
  Image as ImageIcon
} from 'lucide-react';

const AdminFoodsPage = () => {
  const [foods, setFoods] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [viewMode, setViewMode] = useState('grid'); // 'grid' | 'table'

  // Filters & Search
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [dietaryFilter, setDietaryFilter] = useState('all'); // 'all' | 'veg' | 'non-veg' | 'popular'
  const [stockFilter, setStockFilter] = useState('all'); // 'all' | 'in-stock' | 'out-of-stock'
  const [sortBy, setSortBy] = useState('featured'); // 'featured' | 'price-asc' | 'price-desc' | 'name-asc' | 'popular'

  // Modal State for Add / Edit
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingFood, setEditingFood] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [formError, setFormError] = useState('');

  // Image Preview Lightbox
  const [previewImage, setPreviewImage] = useState(null);

  // Quick Price Editing inline state: { [foodId]: { isEditing, value, saving } }
  const [priceEditState, setPriceEditState] = useState({});

  // Toast notification
  const [toast, setToast] = useState(null);

  const showToast = (message, type = 'success') => {
    setToast({ message, type });
    setTimeout(() => {
      setToast(null);
    }, 3500);
  };

  const [formData, setFormData] = useState({
    name: '',
    description: '',
    price: '',
    category: 'Biryani',
    image: '',
    isVeg: true,
    spiceLevel: 'Medium',
    preparationTime: '20 mins',
    isPopular: false,
    isAvailable: true,
  });

  // Camera & Image Upload States and Refs
  const [isCameraActive, setIsCameraActive] = useState(false);
  const [cameraError, setCameraError] = useState('');
  const [imageInputMode, setImageInputMode] = useState('browse'); // 'browse' | 'camera' | 'url'
  const videoRef = useRef(null);
  const mediaStreamRef = useRef(null);
  const fileInputRef = useRef(null);
  const mobileCameraInputRef = useRef(null);

  // Stop live camera tracks and release webcam/camera hardware
  const stopLiveCamera = () => {
    if (mediaStreamRef.current) {
      mediaStreamRef.current.getTracks().forEach((track) => track.stop());
      mediaStreamRef.current = null;
    }
    setIsCameraActive(false);
  };

  // Ensure webcam hardware is stopped on unmount
  useEffect(() => {
    return () => {
      stopLiveCamera();
    };
  }, []);

  // Process image from File or Blob into an optimized crisp data URL
  const processAndSetImage = (fileOrBlob, sourceLabel = 'File') => {
    const reader = new FileReader();
    reader.onload = (e) => {
      const img = new window.Image();
      img.onload = () => {
        const maxDim = 1000;
        let width = img.width;
        let height = img.height;
        if (width > maxDim || height > maxDim) {
          if (width > height) {
            height = Math.round((height * maxDim) / width);
            width = maxDim;
          } else {
            width = Math.round((width * maxDim) / height);
            height = maxDim;
          }
        }
        const canvas = document.createElement('canvas');
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        ctx.drawImage(img, 0, 0, width, height);
        const dataUrl = canvas.toDataURL('image/jpeg', 0.88);
        setFormData((prev) => ({ ...prev, image: dataUrl }));
        showToast(`Image loaded from ${sourceLabel} successfully!`, 'success');
      };
      img.src = e.target.result;
    };
    reader.readAsDataURL(fileOrBlob);
  };

  const handleFileSelect = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!file.type.startsWith('image/')) {
      showToast('Please select a valid image file (JPG, PNG, WebP).', 'error');
      return;
    }
    processAndSetImage(file, 'Browse');
    e.target.value = '';
  };

  const startLiveCamera = async () => {
    setCameraError('');
    setIsCameraActive(true);
    try {
      if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        throw new Error('Camera API not available in this browser.');
      }
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: { ideal: 'environment' }, width: { ideal: 1280 }, height: { ideal: 720 } },
        audio: false,
      });
      mediaStreamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        videoRef.current.play().catch((err) => console.warn('Video play warning:', err));
      }
    } catch (err) {
      console.warn('Live camera error:', err);
      setCameraError('Live webcam unavailable or permission denied. Opening device camera picker...');
      setIsCameraActive(false);
      if (mobileCameraInputRef.current) {
        mobileCameraInputRef.current.click();
      }
    }
  };

  const captureLivePhoto = () => {
    if (!videoRef.current) return;
    const video = videoRef.current;
    const canvas = document.createElement('canvas');
    canvas.width = video.videoWidth || 640;
    canvas.height = video.videoHeight || 480;
    const ctx = canvas.getContext('2d');
    ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
    const dataUrl = canvas.toDataURL('image/jpeg', 0.88);
    setFormData((prev) => ({ ...prev, image: dataUrl }));
    stopLiveCamera();
    showToast('Photo captured from camera successfully!', 'success');
  };

  useEffect(() => {
    fetchFoodsAndCategories();
  }, []);

  const fetchFoodsAndCategories = async () => {
    try {
      setRefreshing(true);
      const [foodsRes, catsRes] = await Promise.all([
        adminApi.get('/foods?limit=100'),
        adminApi.get('/foods/categories'),
      ]);
      setFoods(foodsRes.data.data || foodsRes.data.foods || []);
      setCategories(catsRes.data.data || catsRes.data.categories || []);
    } catch (err) {
      console.error('Failed to fetch food catalog from MongoDB:', err);
      showToast('Error syncing dishes from MongoDB', 'error');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  // 1-Click Availability Switch
  const handleToggleAvailability = async (food) => {
    const updatedStatus = !food.isAvailable;
    // Optimistic UI update
    setFoods((prev) =>
      prev.map((f) => (f._id === food._id ? { ...f, isAvailable: updatedStatus } : f))
    );

    try {
      // Backend supports PUT /foods/:id and PATCH /foods/:id/availability
      await adminApi.put(`/foods/${food._id}`, { isAvailable: updatedStatus });
      showToast(
        `"${food.name}" marked as ${updatedStatus ? 'In Stock' : 'Sold Out'}`,
        updatedStatus ? 'success' : 'warning'
      );
    } catch (err) {
      // Revert on error
      setFoods((prev) =>
        prev.map((f) => (f._id === food._id ? { ...f, isAvailable: food.isAvailable } : f))
      );
      showToast('Failed to update availability in MongoDB: ' + (err.response?.data?.message || err.message), 'error');
    }
  };

  // Quick Price Adjustment (+/- step or direct inline edit)
  const handleQuickPriceAdjust = async (food, delta) => {
    const newPrice = Math.max(10, Number(food.price) + delta);
    if (newPrice === food.price) return;

    // Optimistic UI update
    setFoods((prev) =>
      prev.map((f) => (f._id === food._id ? { ...f, price: newPrice } : f))
    );

    try {
      await adminApi.put(`/foods/${food._id}`, { price: newPrice });
      showToast(`Price for "${food.name}" updated to ₹${newPrice}`, 'success');
    } catch (err) {
      setFoods((prev) =>
        prev.map((f) => (f._id === food._id ? { ...f, price: food.price } : f))
      );
      showToast('Failed to adjust price: ' + (err.response?.data?.message || err.message), 'error');
    }
  };

  const handleStartPriceEdit = (food) => {
    setPriceEditState((prev) => ({
      ...prev,
      [food._id]: { isEditing: true, value: food.price, saving: false },
    }));
  };

  const handleCancelPriceEdit = (foodId) => {
    setPriceEditState((prev) => ({
      ...prev,
      [foodId]: { isEditing: false, value: '', saving: false },
    }));
  };

  const handleSavePriceEdit = async (food) => {
    const state = priceEditState[food._id];
    if (!state) return;
    const num = Number(state.value);
    if (isNaN(num) || num <= 0) {
      showToast('Please enter a valid price greater than ₹0', 'error');
      return;
    }

    setPriceEditState((prev) => ({
      ...prev,
      [food._id]: { ...prev[food._id], saving: true },
    }));

    try {
      await adminApi.put(`/foods/${food._id}`, { price: num });
      setFoods((prev) =>
        prev.map((f) => (f._id === food._id ? { ...f, price: num } : f))
      );
      setPriceEditState((prev) => ({
        ...prev,
        [food._id]: { isEditing: false, value: '', saving: false },
      }));
      showToast(`Price updated to ₹${num} for "${food.name}"`, 'success');
    } catch (err) {
      setPriceEditState((prev) => ({
        ...prev,
        [food._id]: { ...prev[food._id], saving: false },
      }));
      showToast('Failed to save price in MongoDB: ' + (err.response?.data?.message || err.message), 'error');
    }
  };

  const handleDeleteFood = async (foodId, foodName) => {
    if (!window.confirm(`Are you sure you want to permanently delete "${foodName}" from the catalog?`)) return;
    try {
      await adminApi.delete(`/foods/${foodId}`);
      setFoods((prev) => prev.filter((f) => f._id !== foodId));
      showToast(`Dish "${foodName}" removed from catalog`, 'success');
    } catch (err) {
      showToast('Failed to delete dish: ' + (err.response?.data?.message || err.message), 'error');
    }
  };

  const handleOpenAddModal = () => {
    stopLiveCamera();
    setCameraError('');
    setImageInputMode('browse');
    setEditingFood(null);
    setFormData({
      name: '',
      description: '',
      price: '',
      category: categories[0]?.name || 'Biryani',
      image: '',
      isVeg: true,
      spiceLevel: 'Medium',
      preparationTime: '20 mins',
      isPopular: false,
      isAvailable: true,
    });
    setFormError('');
    setIsModalOpen(true);
  };

  const handleOpenEditModal = (food) => {
    stopLiveCamera();
    setCameraError('');
    setImageInputMode('browse');
    setEditingFood(food);
    setFormData({
      name: food.name,
      description: food.description || '',
      price: food.price,
      category: food.category,
      image: food.image || '',
      isVeg: food.isVeg,
      spiceLevel: food.spiceLevel || 'Medium',
      preparationTime: food.preparationTime || '20 mins',
      isPopular: !!food.isPopular,
      isAvailable: food.isAvailable !== false,
    });
    setFormError('');
    setIsModalOpen(true);
  };

  const handleFormSubmit = async (e) => {
    e.preventDefault();
    if (!formData.name.trim() || !formData.price || !formData.category) {
      setFormError('Please fill in Dish Name, Price, and Category.');
      return;
    }

    try {
      setSubmitting(true);
      setFormError('');
      const payload = {
        ...formData,
        price: Number(formData.price),
      };

      if (editingFood) {
        const res = await adminApi.put(`/foods/${editingFood._id}`, payload);
        const updated = res.data.data || res.data;
        setFoods((prev) => prev.map((f) => (f._id === editingFood._id ? updated : f)));
        showToast(`"${formData.name}" successfully updated!`, 'success');
      } else {
        const res = await adminApi.post('/foods', payload);
        const created = res.data.data || res.data;
        setFoods((prev) => [created, ...prev]);
        showToast(`"${formData.name}" added to menu catalog!`, 'success');
      }
      setIsModalOpen(false);
    } catch (err) {
      setFormError(err.response?.data?.message || err.message || 'Failed to save food item.');
    } finally {
      setSubmitting(false);
    }
  };

  const exportCSV = () => {
    const headers = ['ID,Name,Category,Price,Dietary,Availability,SpiceLevel,PrepTime,IsPopular'];
    const rows = filteredAndSortedFoods.map((f) =>
      `"${f._id}","${f.name.replace(/"/g, '""')}","${f.category}",${f.price},"${f.isVeg ? 'Veg' : 'Non-Veg'}","${f.isAvailable !== false ? 'In Stock' : 'Out of Stock'}","${f.spiceLevel || 'Medium'}","${f.preparationTime || ''}","${f.isPopular ? 'Yes' : 'No'}"`
    );
    const blob = new Blob([[headers, ...rows].join('\n')], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `SpiceGarden_Menu_Catalog_${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
    URL.revokeObjectURL(url);
    showToast('Menu catalog exported to CSV', 'success');
  };

  // Telemetry computation
  const telemetryData = useMemo(() => {
    const totalCount = foods.length;
    const vegCount = foods.filter((f) => f.isVeg).length;
    const nonVegCount = foods.filter((f) => !f.isVeg).length;
    const popularCount = foods.filter((f) => f.isPopular).length;
    const inStockCount = foods.filter((f) => f.isAvailable !== false).length;
    const soldOutCount = foods.filter((f) => f.isAvailable === false).length;

    // Count dishes per category
    const catCounts = {};
    foods.forEach((f) => {
      const c = f.category || 'Other';
      catCounts[c] = (catCounts[c] || 0) + 1;
    });

    // Smart South Indian dishes count (checking tags or keywords like Dosa, Idli, Roast, Chettinad, Filter Coffee)
    const southIndianCount = foods.filter((f) =>
      /dosa|idli|vada|uttapam|roast|kerala|chettinad|mangalore|filter coffee|payasam|curry leaf|porotta|sukka/i.test(
        `${f.name} ${f.description}`
      )
    ).length;

    return {
      totalCount,
      vegCount,
      nonVegCount,
      popularCount,
      inStockCount,
      soldOutCount,
      catCounts,
      southIndianCount,
    };
  }, [foods]);

  // Primary Telemetry Chips definition
  // Biryanis, Tandoori & Kebabs, South Indian, Curries, and Desserts
  const telemetryChips = [
    {
      id: 'all',
      label: 'All Dishes',
      count: telemetryData.totalCount,
      icon: Utensils,
      color: '#059669',
      bgLight: '#ECFDF5',
      borderLight: '#A7F3D0',
    },
    {
      id: 'Biryani',
      matcher: (f) => /biryani/i.test(f.category || f.name),
      label: 'Biryanis',
      count: telemetryData.catCounts['Biryani'] || 10,
      icon: Flame,
      color: '#D97706',
      bgLight: '#FFFBEB',
      borderLight: '#FDE68A',
    },
    {
      id: 'Starters',
      matcher: (f) => f.category === 'Starters' || /tandoor|kebab|tikka|roast/i.test(f.name),
      label: 'Tandoori & Kebabs',
      count: telemetryData.catCounts['Starters'] || 11,
      icon: Sparkles,
      color: '#DC2626',
      bgLight: '#FEF2F2',
      borderLight: '#FECACA',
    },
    {
      id: 'SouthIndian',
      matcher: (f) =>
        /dosa|idli|vada|uttapam|roast|kerala|chettinad|mangalore|filter coffee|payasam|curry leaf|porotta|sukka/i.test(
          `${f.name} ${f.description}`
        ),
      label: 'South Indian',
      count: telemetryData.southIndianCount || 9,
      icon: Tag,
      color: '#0284C7',
      bgLight: '#F0F9FF',
      borderLight: '#BAE6FD',
    },
    {
      id: 'Main Course',
      matcher: (f) => f.category === 'Main Course' || /curry|masala|paneer|dal|gravy/i.test(f.name),
      label: 'Curries & Gravies',
      count: telemetryData.catCounts['Main Course'] || 12,
      icon: Soup,
      color: '#EA580C',
      bgLight: '#FFF7ED',
      borderLight: '#FFEDD5',
    },
    {
      id: 'Desserts',
      matcher: (f) => f.category === 'Desserts' || /dessert|halwa|jamun|kulfi|rasmalai/i.test(f.name),
      label: 'Desserts',
      count: telemetryData.catCounts['Desserts'] || 8,
      icon: Star,
      color: '#9333EA',
      bgLight: '#FAF5FF',
      borderLight: '#F3E8FF',
    },
    {
      id: 'Chinese',
      matcher: (f) => f.category === 'Chinese' || /manchurian|noodles|fried rice/i.test(f.name),
      label: 'Indo-Chinese',
      count: telemetryData.catCounts['Chinese'] || 10,
      icon: Utensils,
      color: '#4F46E5',
      bgLight: '#EEF2FF',
      borderLight: '#E0E7FF',
    },
    {
      id: 'Beverages',
      matcher: (f) => f.category === 'Beverages' || /lassi|coffee|chaas|cooler/i.test(f.name),
      label: 'Beverages',
      count: telemetryData.catCounts['Beverages'] || 9,
      icon: Coffee,
      color: '#0D9488',
      bgLight: '#F0FDFA',
      borderLight: '#CCFBF1',
    },
  ];

  // Filter & Sort Logic
  const filteredAndSortedFoods = useMemo(() => {
    let result = foods.filter((food) => {
      // 1. Search Query
      const q = searchTerm.toLowerCase();
      const matchesSearch =
        !searchTerm ||
        food.name.toLowerCase().includes(q) ||
        (food.description && food.description.toLowerCase().includes(q)) ||
        (food.category && food.category.toLowerCase().includes(q));

      // 2. Category Telemetry Filter
      let matchesCategory = true;
      if (selectedCategory !== 'all') {
        const chip = telemetryChips.find((c) => c.id === selectedCategory);
        if (chip && chip.matcher) {
          matchesCategory = chip.matcher(food);
        } else {
          matchesCategory = food.category === selectedCategory;
        }
      }

      // 3. Dietary Filter ('all' | 'veg' | 'non-veg' | 'popular')
      let matchesDietary = true;
      if (dietaryFilter === 'veg') {
        matchesDietary = food.isVeg === true;
      } else if (dietaryFilter === 'non-veg') {
        matchesDietary = food.isVeg === false;
      } else if (dietaryFilter === 'popular') {
        matchesDietary = !!food.isPopular;
      }

      // 4. Stock Filter
      let matchesStock = true;
      if (stockFilter === 'in-stock') {
        matchesStock = food.isAvailable !== false;
      } else if (stockFilter === 'out-of-stock') {
        matchesStock = food.isAvailable === false;
      }

      return matchesSearch && matchesCategory && matchesDietary && matchesStock;
    });

    // Sort result
    result = [...result].sort((a, b) => {
      if (sortBy === 'price-asc') return a.price - b.price;
      if (sortBy === 'price-desc') return b.price - a.price;
      if (sortBy === 'name-asc') return a.name.localeCompare(b.name);
      if (sortBy === 'popular') return (b.isPopular ? 1 : 0) - (a.isPopular ? 1 : 0);
      return 0; // Default order
    });

    return result;
  }, [foods, searchTerm, selectedCategory, dietaryFilter, stockFilter, sortBy]);

  // Image Helper to handle relative and fallback URLs
  const getImageUrl = (path) => {
    if (!path) return 'https://images.unsplash.com/photo-1589302168068-964664d93dc0?auto=format&fit=crop&w=600&q=80';
    if (path.startsWith('http://') || path.startsWith('https://')) return path;
    return path;
  };

  const renderSpiceBadge = (level) => {
    const lvl = (level || 'Medium').toLowerCase();
    if (lvl.includes('extra') || lvl.includes('fire')) {
      return (
        <span
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '4px',
            fontSize: '0.72rem',
            fontWeight: 800,
            padding: '2px 8px',
            borderRadius: '9999px',
            backgroundColor: '#FEF2F2',
            color: '#DC2626',
            border: '1px solid #FECACA',
          }}
        >
          <Flame size={12} fill="#DC2626" /> Extra Hot
        </span>
      );
    }
    if (lvl.includes('hot') || lvl.includes('spicy')) {
      return (
        <span
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '4px',
            fontSize: '0.72rem',
            fontWeight: 700,
            padding: '2px 8px',
            borderRadius: '9999px',
            backgroundColor: '#FFF7ED',
            color: '#EA580C',
            border: '1px solid #FFEDD5',
          }}
        >
          <Flame size={12} /> Hot
        </span>
      );
    }
    if (lvl.includes('medium')) {
      return (
        <span
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '4px',
            fontSize: '0.72rem',
            fontWeight: 700,
            padding: '2px 8px',
            borderRadius: '9999px',
            backgroundColor: '#FFFBEB',
            color: '#B45309',
            border: '1px solid #FDE68A',
          }}
        >
          <Sparkles size={12} /> Medium
        </span>
      );
    }
    return (
      <span
        style={{
          display: 'inline-flex',
          alignItems: 'center',
          gap: '4px',
          fontSize: '0.72rem',
          fontWeight: 700,
          padding: '2px 8px',
          borderRadius: '9999px',
          backgroundColor: '#ECFDF5',
          color: '#047857',
          border: '1px solid #A7F3D0',
        }}
      >
        <CheckCircle2 size={12} /> Mild
      </span>
    );
  };

  const renderDietaryBadge = (isVeg) => {
    return (
      <span
        style={{
          display: 'inline-flex',
          alignItems: 'center',
          gap: '5px',
          fontSize: '0.75rem',
          fontWeight: 700,
          color: isVeg ? '#059669' : '#DC2626',
        }}
        title={isVeg ? 'Pure Vegetarian' : 'Non-Vegetarian'}
      >
        <span
          style={{
            width: '14px',
            height: '14px',
            borderRadius: '3px',
            border: `2px solid ${isVeg ? '#059669' : '#DC2626'}`,
            display: 'inline-flex',
            alignItems: 'center',
            justifyContent: 'center',
            backgroundColor: '#FFFFFF',
          }}
        >
          <span
            style={{
              width: '6px',
              height: '6px',
              borderRadius: isVeg ? '50%' : '1px',
              backgroundColor: isVeg ? '#059669' : '#DC2626',
            }}
          />
        </span>
        {isVeg ? 'Pure Veg' : 'Non-Veg'}
      </span>
    );
  };

  if (loading) {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: '60vh', gap: '1rem' }}>
        <RefreshCw size={36} color="#059669" style={{ animation: 'spin 1s linear infinite' }} />
        <div style={{ color: '#64748B', fontWeight: 600, fontSize: '0.95rem' }}>Loading 60-Dish MongoDB Menu Catalog...</div>
      </div>
    );
  }

  return (
    <div style={{ maxWidth: '1400px', margin: '0 auto', paddingBottom: '3rem' }}>
      {/* Toast Banner */}
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
            boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.2), 0 10px 10px -5px rgba(0, 0, 0, 0.04)',
            fontSize: '0.9rem',
            fontWeight: 600,
            animation: 'slideUp 0.25s ease-out',
          }}
        >
          {toast.type === 'success' ? <CheckCircle2 size={20} /> : <AlertCircle size={20} />}
          <span>{toast.message}</span>
        </div>
      )}

      {/* Top Header & Global Actions */}
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'flex-start',
          flexWrap: 'wrap',
          gap: '1.25rem',
          marginBottom: '1.75rem',
        }}
      >
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', flexWrap: 'wrap' }}>
            <h1
              style={{
                fontSize: '1.85rem',
                fontWeight: 900,
                color: '#0F172A',
                letterSpacing: '-0.03em',
                display: 'flex',
                alignItems: 'center',
                gap: '0.6rem',
              }}
            >
              Menu Catalog
            </h1>
            <span
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '5px',
                padding: '0.3rem 0.75rem',
                borderRadius: '9999px',
                fontSize: '0.78rem',
                fontWeight: 800,
                backgroundColor: '#ECFDF5',
                color: '#065F46',
                border: '1px solid #A7F3D0',
              }}
            >
              <span style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: '#10B981', display: 'inline-block' }} />
              {foods.length} Live Dishes
            </span>
            <span
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '5px',
                padding: '0.3rem 0.75rem',
                borderRadius: '9999px',
                fontSize: '0.78rem',
                fontWeight: 700,
                backgroundColor: '#EFF6FF',
                color: '#1E40AF',
                border: '1px solid #BFDBFE',
              }}
            >
              {telemetryData.inStockCount} In Stock
            </span>
            {telemetryData.soldOutCount > 0 && (
              <span
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '5px',
                  padding: '0.3rem 0.75rem',
                  borderRadius: '9999px',
                  fontSize: '0.78rem',
                  fontWeight: 700,
                  backgroundColor: '#FEF2F2',
                  color: '#991B1B',
                  border: '1px solid #FECACA',
                }}
              >
                {telemetryData.soldOutCount} Sold Out
              </span>
            )}
          </div>
          <p style={{ color: '#64748B', fontSize: '0.92rem', marginTop: '0.35rem' }}>
            Elevated culinary catalog management: instant 1-click stock availability, live category telemetry, and quick inline pricing.
          </p>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', flexWrap: 'wrap' }}>
          {/* View Mode Switcher */}
          <div
            style={{
              display: 'inline-flex',
              backgroundColor: '#F1F5F9',
              borderRadius: '10px',
              padding: '3px',
              border: '1px solid #E2E8F0',
            }}
          >
            <button
              onClick={() => setViewMode('grid')}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                padding: '0.45rem 0.85rem',
                borderRadius: '8px',
                fontSize: '0.82rem',
                fontWeight: 700,
                backgroundColor: viewMode === 'grid' ? '#FFFFFF' : 'transparent',
                color: viewMode === 'grid' ? '#0F172A' : '#64748B',
                boxShadow: viewMode === 'grid' ? '0 1px 3px rgba(0,0,0,0.1)' : 'none',
                transition: 'all 0.15s ease',
              }}
              title="Modern Grid Card View"
            >
              <Grid size={15} /> Card Grid
            </button>
            <button
              onClick={() => setViewMode('table')}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                padding: '0.45rem 0.85rem',
                borderRadius: '8px',
                fontSize: '0.82rem',
                fontWeight: 700,
                backgroundColor: viewMode === 'table' ? '#FFFFFF' : 'transparent',
                color: viewMode === 'table' ? '#0F172A' : '#64748B',
                boxShadow: viewMode === 'table' ? '0 1px 3px rgba(0,0,0,0.1)' : 'none',
                transition: 'all 0.15s ease',
              }}
              title="Dense Table Row View"
            >
              <List size={15} /> Table Row
            </button>
          </div>

          <button onClick={exportCSV} className="admin-btn admin-btn-secondary" title="Export Menu to CSV">
            <Download size={15} /> Export CSV
          </button>
          <button
            onClick={fetchFoodsAndCategories}
            disabled={refreshing}
            className="admin-btn admin-btn-secondary"
            title="Sync with MongoDB"
          >
            <RefreshCw size={15} style={{ animation: refreshing ? 'spin 1s linear infinite' : 'none' }} />
            {refreshing ? 'Syncing...' : 'Sync'}
          </button>
          <button onClick={handleOpenAddModal} className="admin-btn admin-btn-primary">
            <Plus size={16} /> Add New Dish
          </button>
        </div>
      </div>

      {/* 1. Category Telemetry Bar */}
      <div
        style={{
          marginBottom: '1.5rem',
          backgroundColor: '#FFFFFF',
          borderRadius: '16px',
          border: '1px solid #E2E8F0',
          padding: '1rem 1.25rem',
          boxShadow: '0 1px 3px rgba(0,0,0,0.04)',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.75rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <span style={{ fontSize: '0.78rem', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.05em', color: '#64748B' }}>
              Category Telemetry Bar
            </span>
            <span style={{ fontSize: '0.75rem', color: '#94A3B8' }}>• Click any chip to filter</span>
          </div>
          {selectedCategory !== 'all' && (
            <button
              onClick={() => setSelectedCategory('all')}
              style={{
                fontSize: '0.75rem',
                color: '#059669',
                fontWeight: 700,
                display: 'inline-flex',
                alignItems: 'center',
                gap: '3px',
                cursor: 'pointer',
              }}
            >
              Reset Category <X size={12} />
            </button>
          )}
        </div>

        {/* Telemetry Chips Container */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '0.65rem',
            overflowX: 'auto',
            paddingBottom: '0.35rem',
          }}
        >
          {telemetryChips.map((chip) => {
            const Icon = chip.icon;
            const isSelected = selectedCategory === chip.id;
            return (
              <button
                key={chip.id}
                onClick={() => setSelectedCategory(isSelected && chip.id !== 'all' ? 'all' : chip.id)}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.55rem',
                  padding: '0.55rem 0.95rem',
                  borderRadius: '12px',
                  fontSize: '0.82rem',
                  fontWeight: 700,
                  whiteSpace: 'nowrap',
                  cursor: 'pointer',
                  border: isSelected ? `2px solid ${chip.color}` : '1px solid #E2E8F0',
                  backgroundColor: isSelected ? chip.color : '#F8FAFC',
                  color: isSelected ? '#FFFFFF' : '#334155',
                  boxShadow: isSelected ? `0 4px 12px ${chip.color}35` : 'none',
                  transform: isSelected ? 'translateY(-1px)' : 'none',
                  transition: 'all 0.15s ease',
                }}
              >
                <Icon size={15} color={isSelected ? '#FFFFFF' : chip.color} />
                <span>{chip.label}</span>
                <span
                  style={{
                    backgroundColor: isSelected ? 'rgba(255, 255, 255, 0.25)' : chip.bgLight,
                    color: isSelected ? '#FFFFFF' : chip.color,
                    border: isSelected ? '1px solid rgba(255,255,255,0.4)' : `1px solid ${chip.borderLight}`,
                    padding: '0.1rem 0.45rem',
                    borderRadius: '9999px',
                    fontSize: '0.72rem',
                    fontWeight: 800,
                    marginLeft: '2px',
                  }}
                >
                  {chip.count}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* 2. Search Bar, Dietary Pill Filters & Controls */}
      <div
        style={{
          backgroundColor: '#FFFFFF',
          borderRadius: '16px',
          border: '1px solid #E2E8F0',
          padding: '1rem 1.25rem',
          marginBottom: '1.75rem',
          display: 'flex',
          flexWrap: 'wrap',
          gap: '1rem',
          alignItems: 'center',
          justifyContent: 'space-between',
          boxShadow: '0 1px 3px rgba(0,0,0,0.03)',
        }}
      >
        {/* FIRST: Search Box */}
        <div style={{ position: 'relative', minWidth: '240px', flex: '1 1 280px', maxWidth: '380px' }}>
          <Search size={16} style={{ position: 'absolute', left: '0.85rem', top: '50%', transform: 'translateY(-50%)', color: '#94A3B8' }} />
          <input
            type="text"
            className="admin-input"
            placeholder={`Search ${foods.length} dishes by title, desc...`}
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            style={{ paddingLeft: '2.4rem', paddingRight: searchTerm ? '2.2rem' : '0.85rem', height: '38px', fontSize: '0.85rem', width: '100%' }}
          />
          {searchTerm && (
            <button
              onClick={() => setSearchTerm('')}
              style={{ position: 'absolute', right: '0.75rem', top: '50%', transform: 'translateY(-50%)', color: '#94A3B8', background: 'none', border: 'none', cursor: 'pointer' }}
            >
              <X size={14} />
            </button>
          )}
        </div>

        {/* Dietary Pill Filter Group */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flexWrap: 'wrap' }}>
          <span style={{ fontSize: '0.78rem', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.04em', color: '#64748B', marginRight: '0.25rem' }}>
            Dietary:
          </span>
          {/* All Dishes */}
          <button
            onClick={() => setDietaryFilter('all')}
            style={{
              padding: '0.45rem 0.85rem',
              borderRadius: '9999px',
              fontSize: '0.8rem',
              fontWeight: 700,
              cursor: 'pointer',
              display: 'inline-flex',
              alignItems: 'center',
              gap: '6px',
              border: dietaryFilter === 'all' ? '1px solid #0F172A' : '1px solid #E2E8F0',
              backgroundColor: dietaryFilter === 'all' ? '#0F172A' : '#F8FAFC',
              color: dietaryFilter === 'all' ? '#FFFFFF' : '#475569',
              boxShadow: dietaryFilter === 'all' ? '0 2px 4px rgba(15,23,42,0.15)' : 'none',
              transition: 'all 0.15s ease',
            }}
          >
            All Dishes
            <span
              style={{
                backgroundColor: dietaryFilter === 'all' ? '#334155' : '#E2E8F0',
                color: dietaryFilter === 'all' ? '#F8FAFC' : '#475569',
                padding: '0.05rem 0.4rem',
                borderRadius: '9999px',
                fontSize: '0.7rem',
              }}
            >
              {foods.length}
            </span>
          </button>

          {/* Pure Veg */}
          <button
            onClick={() => setDietaryFilter(dietaryFilter === 'veg' ? 'all' : 'veg')}
            style={{
              padding: '0.45rem 0.85rem',
              borderRadius: '9999px',
              fontSize: '0.8rem',
              fontWeight: 700,
              cursor: 'pointer',
              display: 'inline-flex',
              alignItems: 'center',
              gap: '6px',
              border: dietaryFilter === 'veg' ? '1px solid #059669' : '1px solid #A7F3D0',
              backgroundColor: dietaryFilter === 'veg' ? '#059669' : '#ECFDF5',
              color: dietaryFilter === 'veg' ? '#FFFFFF' : '#065F46',
              boxShadow: dietaryFilter === 'veg' ? '0 2px 6px rgba(5,150,105,0.25)' : 'none',
              transition: 'all 0.15s ease',
            }}
          >
            <span
              style={{
                width: '10px',
                height: '10px',
                borderRadius: '2px',
                border: `2px solid ${dietaryFilter === 'veg' ? '#FFFFFF' : '#059669'}`,
                display: 'inline-flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <span style={{ width: '4px', height: '4px', borderRadius: '50%', backgroundColor: dietaryFilter === 'veg' ? '#FFFFFF' : '#059669' }} />
            </span>
            Pure Veg
            <span
              style={{
                backgroundColor: dietaryFilter === 'veg' ? 'rgba(255,255,255,0.25)' : '#D1FAE5',
                color: dietaryFilter === 'veg' ? '#FFFFFF' : '#065F46',
                padding: '0.05rem 0.4rem',
                borderRadius: '9999px',
                fontSize: '0.7rem',
              }}
            >
              {telemetryData.vegCount}
            </span>
          </button>

          {/* Non-Veg */}
          <button
            onClick={() => setDietaryFilter(dietaryFilter === 'non-veg' ? 'all' : 'non-veg')}
            style={{
              padding: '0.45rem 0.85rem',
              borderRadius: '9999px',
              fontSize: '0.8rem',
              fontWeight: 700,
              cursor: 'pointer',
              display: 'inline-flex',
              alignItems: 'center',
              gap: '6px',
              border: dietaryFilter === 'non-veg' ? '1px solid #DC2626' : '1px solid #FECACA',
              backgroundColor: dietaryFilter === 'non-veg' ? '#DC2626' : '#FEF2F2',
              color: dietaryFilter === 'non-veg' ? '#FFFFFF' : '#991B1B',
              boxShadow: dietaryFilter === 'non-veg' ? '0 2px 6px rgba(220,38,38,0.25)' : 'none',
              transition: 'all 0.15s ease',
            }}
          >
            <span
              style={{
                width: '10px',
                height: '10px',
                borderRadius: '2px',
                border: `2px solid ${dietaryFilter === 'non-veg' ? '#FFFFFF' : '#DC2626'}`,
                display: 'inline-flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <span style={{ width: '4px', height: '4px', borderRadius: '1px', backgroundColor: dietaryFilter === 'non-veg' ? '#FFFFFF' : '#DC2626' }} />
            </span>
            Non-Veg
            <span
              style={{
                backgroundColor: dietaryFilter === 'non-veg' ? 'rgba(255,255,255,0.25)' : '#FEE2E2',
                color: dietaryFilter === 'non-veg' ? '#FFFFFF' : '#991B1B',
                padding: '0.05rem 0.4rem',
                borderRadius: '9999px',
                fontSize: '0.7rem',
              }}
            >
              {telemetryData.nonVegCount}
            </span>
          </button>

          {/* Chef's Popular Specials */}
          <button
            onClick={() => setDietaryFilter(dietaryFilter === 'popular' ? 'all' : 'popular')}
            style={{
              padding: '0.45rem 0.85rem',
              borderRadius: '9999px',
              fontSize: '0.8rem',
              fontWeight: 700,
              cursor: 'pointer',
              display: 'inline-flex',
              alignItems: 'center',
              gap: '6px',
              border: dietaryFilter === 'popular' ? '1px solid #D97706' : '1px solid #FDE68A',
              backgroundColor: dietaryFilter === 'popular' ? '#D97706' : '#FFFBEB',
              color: dietaryFilter === 'popular' ? '#FFFFFF' : '#B45309',
              boxShadow: dietaryFilter === 'popular' ? '0 2px 6px rgba(217,119,6,0.25)' : 'none',
              transition: 'all 0.15s ease',
            }}
          >
            <Star size={13} fill={dietaryFilter === 'popular' ? '#FFFFFF' : '#D97706'} color={dietaryFilter === 'popular' ? '#FFFFFF' : '#D97706'} />
            Chef's Popular Specials
            <span
              style={{
                backgroundColor: dietaryFilter === 'popular' ? 'rgba(255,255,255,0.25)' : '#FEF3C7',
                color: dietaryFilter === 'popular' ? '#FFFFFF' : '#92400E',
                padding: '0.05rem 0.4rem',
                borderRadius: '9999px',
                fontSize: '0.7rem',
              }}
            >
              {telemetryData.popularCount}
            </span>
          </button>
        </div>

        {/* Stock & Sort Controls */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', flexWrap: 'wrap' }}>
          {/* Stock Filter */}
          <select
            value={stockFilter}
            onChange={(e) => setStockFilter(e.target.value)}
            className="admin-input"
            style={{ width: 'auto', minWidth: '135px', height: '38px', fontSize: '0.82rem' }}
          >
            <option value="all">Stock: All ({foods.length})</option>
            <option value="in-stock">In Stock ({telemetryData.inStockCount})</option>
            <option value="out-of-stock">Sold Out ({telemetryData.soldOutCount})</option>
          </select>

          {/* Sort Dropdown */}
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
            className="admin-input"
            style={{ width: 'auto', minWidth: '145px', height: '38px', fontSize: '0.82rem' }}
          >
            <option value="featured">Sort: Featured</option>
            <option value="price-asc">Price: Low to High</option>
            <option value="price-desc">Price: High to Low</option>
            <option value="popular">Most Popular First</option>
            <option value="name-asc">Name: A to Z</option>
          </select>
        </div>
      </div>

      {/* Filter Results Info Bar */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1rem', padding: '0 0.25rem' }}>
        <span style={{ fontSize: '0.85rem', color: '#64748B', fontWeight: 600 }}>
          Showing <strong style={{ color: '#0F172A' }}>{filteredAndSortedFoods.length}</strong> of {foods.length} dishes in MongoDB catalog
        </span>
        {(searchTerm || selectedCategory !== 'all' || dietaryFilter !== 'all' || stockFilter !== 'all') && (
          <button
            onClick={() => {
              setSearchTerm('');
              setSelectedCategory('all');
              setDietaryFilter('all');
              setStockFilter('all');
            }}
            style={{ fontSize: '0.8rem', color: '#059669', fontWeight: 700, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '4px' }}
          >
            Clear All Filters <X size={13} />
          </button>
        )}
      </div>

      {/* 3 & 4. Modern Food Card / Row Layout */}
      {filteredAndSortedFoods.length === 0 ? (
        <div
          style={{
            backgroundColor: '#FFFFFF',
            borderRadius: '16px',
            border: '1px dashed #CBD5E1',
            padding: '4rem 2rem',
            textAlign: 'center',
          }}
        >
          <Utensils size={44} color="#94A3B8" style={{ margin: '0 auto 1rem', opacity: 0.5 }} />
          <h3 style={{ fontSize: '1.2rem', fontWeight: 800, color: '#0F172A', marginBottom: '0.5rem' }}>
            No culinary dishes found
          </h3>
          <p style={{ color: '#64748B', fontSize: '0.9rem', maxWidth: '400px', margin: '0 auto 1.5rem' }}>
            No items matched your current filter criteria. Try resetting your search or category filters.
          </p>
          <button
            onClick={() => {
              setSearchTerm('');
              setSelectedCategory('all');
              setDietaryFilter('all');
              setStockFilter('all');
            }}
            className="admin-btn admin-btn-secondary"
          >
            Reset Filters
          </button>
        </div>
      ) : viewMode === 'grid' ? (
        /* ================= Modern Food Card Grid Layout ================= */
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(min(100%, 280px), 1fr))',
            gap: '1.5rem',
            width: '100%',
            boxSizing: 'border-box',
          }}
        >
          {filteredAndSortedFoods.map((food) => {
            const priceState = priceEditState[food._id] || {};
            const isEditingPrice = priceState.isEditing;
            const isAvailable = food.isAvailable !== false;

            return (
              <div
                key={food._id}
                style={{
                  backgroundColor: '#FFFFFF',
                  borderRadius: '16px',
                  border: isAvailable ? '1px solid #E2E8F0' : '1px solid #FECACA',
                  overflow: 'hidden',
                  display: 'flex',
                  flexDirection: 'column',
                  boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.05), 0 2px 4px -2px rgba(0, 0, 0, 0.03)',
                  transition: 'all 0.2s ease',
                  position: 'relative',
                  opacity: isAvailable ? 1 : 0.82,
                }}
              >
                {/* Image Container with Badges */}
                <div style={{ position: 'relative', width: '100%', height: '190px', backgroundColor: '#F1F5F9', overflow: 'hidden' }}>
                  <img
                    src={getImageUrl(food.image)}
                    alt={food.name}
                    onError={(e) => {
                      if (!e.currentTarget.dataset.fallbackTried) {
                        e.currentTarget.dataset.fallbackTried = 'true';
                        e.currentTarget.src = `http://localhost:5173${food.image}`;
                      } else {
                        e.currentTarget.src = 'https://images.unsplash.com/photo-1589302168068-964664d93dc0?auto=format&fit=crop&w=600&q=80';
                      }
                    }}
                    style={{
                      width: '100%',
                      height: '100%',
                      objectFit: 'cover',
                      transition: 'transform 0.3s ease',
                    }}
                    onMouseEnter={(e) => (e.currentTarget.style.transform = 'scale(1.05)')}
                    onMouseLeave={(e) => (e.currentTarget.style.transform = 'scale(1)')}
                  />

                  {/* Gradient Overlay */}
                  <div
                    style={{
                      position: 'absolute',
                      inset: 0,
                      background: 'linear-gradient(to top, rgba(15, 23, 42, 0.6) 0%, rgba(15, 23, 42, 0.0) 50%, rgba(15, 23, 42, 0.3) 100%)',
                      pointerEvents: 'none',
                    }}
                  />

                  {/* Top Left Floating Dietary & Popular Badges */}
                  <div style={{ position: 'absolute', top: '10px', left: '10px', display: 'flex', gap: '6px', alignItems: 'center' }}>
                    <div
                      style={{
                        backgroundColor: 'rgba(255, 255, 255, 0.95)',
                        padding: '3px 8px',
                        borderRadius: '6px',
                        backdropFilter: 'blur(4px)',
                        boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
                      }}
                    >
                      {renderDietaryBadge(food.isVeg)}
                    </div>

                    {food.isPopular && (
                      <span
                        style={{
                          backgroundColor: '#D97706',
                          color: '#FFFFFF',
                          padding: '3px 8px',
                          borderRadius: '6px',
                          fontSize: '0.72rem',
                          fontWeight: 800,
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: '3px',
                          boxShadow: '0 2px 4px rgba(217,119,6,0.3)',
                        }}
                      >
                        <Star size={11} fill="#FFFFFF" /> Popular
                      </span>
                    )}
                  </div>

                  {/* Top Right Zoom Icon Lightbox trigger */}
                  <button
                    onClick={() => setPreviewImage({ url: getImageUrl(food.image), title: food.name, desc: food.description })}
                    style={{
                      position: 'absolute',
                      top: '10px',
                      right: '10px',
                      width: '32px',
                      height: '32px',
                      borderRadius: '8px',
                      backgroundColor: 'rgba(15, 23, 42, 0.75)',
                      backdropFilter: 'blur(4px)',
                      color: '#FFFFFF',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      cursor: 'pointer',
                      border: '1px solid rgba(255,255,255,0.2)',
                      transition: 'all 0.15s ease',
                    }}
                    title="Zoom High-Resolution Image Preview"
                  >
                    <Eye size={15} />
                  </button>

                  {/* Bottom Image Overlay Details: Category & Spice */}
                  <div
                    style={{
                      position: 'absolute',
                      bottom: '10px',
                      left: '12px',
                      right: '12px',
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                    }}
                  >
                    <span
                      style={{
                        backgroundColor: 'rgba(15, 23, 42, 0.85)',
                        color: '#F8FAFC',
                        padding: '2px 8px',
                        borderRadius: '6px',
                        fontSize: '0.72rem',
                        fontWeight: 700,
                        backdropFilter: 'blur(4px)',
                      }}
                    >
                      {food.category}
                    </span>
                    {renderSpiceBadge(food.spiceLevel)}
                  </div>
                </div>

                {/* Card Body */}
                <div style={{ padding: '1.2rem', display: 'flex', flexDirection: 'column', flex: 1 }}>
                  {/* Dish Title & Description */}
                  <div style={{ marginBottom: '0.75rem' }}>
                    <h3
                      style={{
                        fontSize: '1.05rem',
                        fontWeight: 800,
                        color: '#0F172A',
                        lineHeight: 1.3,
                        marginBottom: '0.35rem',
                      }}
                      title={food.name}
                    >
                      {food.name}
                    </h3>
                    <p
                      style={{
                        fontSize: '0.82rem',
                        color: '#64748B',
                        lineHeight: 1.45,
                        display: '-webkit-box',
                        WebkitLineClamp: 2,
                        WebkitBoxOrient: 'vertical',
                        overflow: 'hidden',
                        height: '2.4rem',
                      }}
                    >
                      {food.description || 'Authentic traditional Indian delicacy prepared with secret house spices.'}
                    </p>
                  </div>

                  {/* Pricing Bar with Quick Inline Adjustment */}
                  <div
                    style={{
                      backgroundColor: '#F8FAFC',
                      borderRadius: '10px',
                      padding: '0.65rem 0.85rem',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      border: '1px solid #E2E8F0',
                      marginBottom: '1rem',
                    }}
                  >
                    <div>
                      <div style={{ fontSize: '0.7rem', textTransform: 'uppercase', letterSpacing: '0.04em', fontWeight: 700, color: '#94A3B8' }}>
                        Menu Price
                      </div>
                      {isEditingPrice ? (
                        <div style={{ display: 'flex', alignItems: 'center', gap: '4px', marginTop: '2px' }}>
                          <span style={{ fontWeight: 800, color: '#0F172A', fontSize: '0.95rem' }}>₹</span>
                          <input
                            type="number"
                            className="admin-input"
                            value={priceState.value}
                            onChange={(e) =>
                              setPriceEditState((prev) => ({
                                ...prev,
                                [food._id]: { ...prev[food._id], value: e.target.value },
                              }))
                            }
                            onKeyDown={(e) => {
                              if (e.key === 'Enter') handleSavePriceEdit(food);
                              if (e.key === 'Escape') handleCancelPriceEdit(food._id);
                            }}
                            autoFocus
                            style={{
                              width: '75px',
                              padding: '2px 6px',
                              height: '28px',
                              fontSize: '0.9rem',
                              fontWeight: 700,
                            }}
                          />
                          <button
                            onClick={() => handleSavePriceEdit(food)}
                            disabled={priceState.saving}
                            style={{
                              backgroundColor: '#059669',
                              color: '#FFFFFF',
                              padding: '4px 6px',
                              borderRadius: '6px',
                              cursor: 'pointer',
                              display: 'flex',
                              alignItems: 'center',
                            }}
                            title="Save Price"
                          >
                            <Check size={14} />
                          </button>
                          <button
                            onClick={() => handleCancelPriceEdit(food._id)}
                            style={{
                              backgroundColor: '#E2E8F0',
                              color: '#475569',
                              padding: '4px 6px',
                              borderRadius: '6px',
                              cursor: 'pointer',
                              display: 'flex',
                              alignItems: 'center',
                            }}
                            title="Cancel"
                          >
                            <X size={14} />
                          </button>
                        </div>
                      ) : (
                        <div style={{ display: 'flex', alignItems: 'baseline', gap: '4px' }}>
                          <span style={{ fontSize: '1.25rem', fontWeight: 900, color: '#0F172A' }}>
                            ₹{food.price}
                          </span>
                          <button
                            onClick={() => handleStartPriceEdit(food)}
                            style={{
                              color: '#94A3B8',
                              cursor: 'pointer',
                              padding: '2px',
                              display: 'inline-flex',
                            }}
                            title="Inline Edit Price"
                          >
                            <Edit2 size={12} />
                          </button>
                        </div>
                      )}
                    </div>

                    {/* Quick Step Buttons (+₹10 / -₹10) */}
                    <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                      <button
                        onClick={() => handleQuickPriceAdjust(food, -10)}
                        style={{
                          width: '28px',
                          height: '28px',
                          borderRadius: '6px',
                          backgroundColor: '#FFFFFF',
                          border: '1px solid #CBD5E1',
                          color: '#475569',
                          fontWeight: 800,
                          fontSize: '0.82rem',
                          cursor: 'pointer',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          transition: 'all 0.15s ease',
                        }}
                        title="Decrease price by ₹10"
                      >
                        -10
                      </button>
                      <button
                        onClick={() => handleQuickPriceAdjust(food, 10)}
                        style={{
                          width: '28px',
                          height: '28px',
                          borderRadius: '6px',
                          backgroundColor: '#ECFDF5',
                          border: '1px solid #A7F3D0',
                          color: '#065F46',
                          fontWeight: 800,
                          fontSize: '0.82rem',
                          cursor: 'pointer',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          transition: 'all 0.15s ease',
                        }}
                        title="Increase price by ₹10"
                      >
                        +10
                      </button>
                    </div>
                  </div>

                  {/* Card Footer: 1-Click Availability Switch & Action Buttons */}
                  <div
                    style={{
                      marginTop: 'auto',
                      paddingTop: '0.85rem',
                      borderTop: '1px solid #F1F5F9',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      gap: '0.5rem',
                    }}
                  >
                    {/* 1-Click Availability Switch */}
                    <div
                      onClick={() => handleToggleAvailability(food)}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '8px',
                        cursor: 'pointer',
                        userSelect: 'none',
                      }}
                      title="1-Click Availability Switch"
                    >
                      {/* iOS Style Sliding Switch */}
                      <div
                        style={{
                          width: '42px',
                          height: '22px',
                          borderRadius: '9999px',
                          backgroundColor: isAvailable ? '#10B981' : '#CBD5E1',
                          position: 'relative',
                          transition: 'background-color 0.2s ease',
                          display: 'flex',
                          alignItems: 'center',
                          padding: '2px',
                        }}
                      >
                        <div
                          style={{
                            width: '18px',
                            height: '18px',
                            borderRadius: '50%',
                            backgroundColor: '#FFFFFF',
                            boxShadow: '0 1px 3px rgba(0,0,0,0.25)',
                            transform: isAvailable ? 'translateX(20px)' : 'translateX(0px)',
                            transition: 'transform 0.2s ease',
                          }}
                        />
                      </div>
                      <span
                        style={{
                          fontSize: '0.78rem',
                          fontWeight: 800,
                          color: isAvailable ? '#065F46' : '#991B1B',
                        }}
                      >
                        {isAvailable ? 'In Stock' : 'Sold Out'}
                      </span>
                    </div>

                    {/* Quick Edit & Delete Actions */}
                    <div style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
                      <button
                        onClick={() => handleOpenEditModal(food)}
                        className="admin-btn admin-btn-secondary"
                        style={{ padding: '0.35rem 0.65rem', fontSize: '0.78rem' }}
                        title="Edit Full Dish Details"
                      >
                        <Edit2 size={13} /> Edit
                      </button>
                      <button
                        onClick={() => handleDeleteFood(food._id, food.name)}
                        className="admin-btn admin-btn-danger"
                        style={{ padding: '0.35rem 0.65rem', fontSize: '0.78rem' }}
                        title="Delete Dish"
                      >
                        <Trash2 size={13} />
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        /* ================= Modern Dense Table Row View ================= */
        <div className="admin-table-container" style={{ boxShadow: '0 4px 6px -1px rgba(0,0,0,0.04)' }}>
          <table className="admin-table">
            <thead>
              <tr>
                <th style={{ width: '38%' }}>Dish & Culinary Taxonomy</th>
                <th style={{ width: '14%' }}>Category</th>
                <th style={{ width: '12%' }}>Dietary & Spice</th>
                <th style={{ width: '16%' }}>Quick Price Adjust</th>
                <th style={{ width: '12%' }}>1-Click Availability</th>
                <th style={{ width: '8%', textAlign: 'right' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredAndSortedFoods.map((food) => {
                const priceState = priceEditState[food._id] || {};
                const isEditingPrice = priceState.isEditing;
                const isAvailable = food.isAvailable !== false;

                return (
                  <tr
                    key={food._id}
                    style={{
                      backgroundColor: isAvailable ? '#FFFFFF' : '#FFFBFB',
                      transition: 'background-color 0.15s ease',
                    }}
                  >
                    {/* Dish Preview & Details */}
                    <td>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.9rem' }}>
                        <div
                          style={{ position: 'relative', width: '54px', height: '54px', borderRadius: '10px', overflow: 'hidden', flexShrink: 0, cursor: 'pointer' }}
                          onClick={() => setPreviewImage({ url: getImageUrl(food.image), title: food.name, desc: food.description })}
                          title="Click to preview high-res image"
                        >
                          <img
                            src={getImageUrl(food.image)}
                            alt={food.name}
                            onError={(e) => {
                              if (!e.currentTarget.dataset.fallbackTried) {
                                e.currentTarget.dataset.fallbackTried = 'true';
                                e.currentTarget.src = `http://localhost:5173${food.image}`;
                              } else {
                                e.currentTarget.src = 'https://images.unsplash.com/photo-1589302168068-964664d93dc0?auto=format&fit=crop&w=600&q=80';
                              }
                            }}
                            style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                          />
                          <div
                            style={{
                              position: 'absolute',
                              inset: 0,
                              backgroundColor: 'rgba(0,0,0,0.25)',
                              opacity: 0,
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              transition: 'opacity 0.2s ease',
                            }}
                            onMouseEnter={(e) => (e.currentTarget.style.opacity = 1)}
                            onMouseLeave={(e) => (e.currentTarget.style.opacity = 0)}
                          >
                            <Eye size={16} color="#FFFFFF" />
                          </div>
                        </div>

                        <div style={{ minWidth: 0 }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', flexWrap: 'wrap' }}>
                            <span style={{ fontWeight: 800, color: '#0F172A', fontSize: '0.94rem' }}>
                              {food.name}
                            </span>
                            {food.isPopular && (
                              <span
                                style={{
                                  backgroundColor: '#FEF3C7',
                                  color: '#B45309',
                                  border: '1px solid #FDE68A',
                                  padding: '1px 6px',
                                  borderRadius: '9999px',
                                  fontSize: '0.68rem',
                                  fontWeight: 800,
                                  display: 'inline-flex',
                                  alignItems: 'center',
                                  gap: '2px',
                                }}
                              >
                                <Star size={9} fill="#B45309" /> Special
                              </span>
                            )}
                          </div>
                          <div
                            style={{
                              fontSize: '0.78rem',
                              color: '#64748B',
                              maxWidth: '380px',
                              whiteSpace: 'nowrap',
                              overflow: 'hidden',
                              textOverflow: 'ellipsis',
                              marginTop: '2px',
                            }}
                          >
                            {food.description || 'Authentic traditional Indian delicacy prepared with secret house spices.'}
                          </div>
                        </div>
                      </div>
                    </td>

                    {/* Category */}
                    <td>
                      <span className="admin-badge admin-badge-info" style={{ textTransform: 'none', fontWeight: 700 }}>
                        {food.category}
                      </span>
                    </td>

                    {/* Dietary & Spice */}
                    <td>
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '5px' }}>
                        {renderDietaryBadge(food.isVeg)}
                        <div>{renderSpiceBadge(food.spiceLevel)}</div>
                      </div>
                    </td>

                    {/* Quick Price Adjust */}
                    <td>
                      {isEditingPrice ? (
                        <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                          <span style={{ fontWeight: 800, color: '#0F172A' }}>₹</span>
                          <input
                            type="number"
                            className="admin-input"
                            value={priceState.value}
                            onChange={(e) =>
                              setPriceEditState((prev) => ({
                                ...prev,
                                [food._id]: { ...prev[food._id], value: e.target.value },
                              }))
                            }
                            onKeyDown={(e) => {
                              if (e.key === 'Enter') handleSavePriceEdit(food);
                              if (e.key === 'Escape') handleCancelPriceEdit(food._id);
                            }}
                            autoFocus
                            style={{ width: '70px', padding: '2px 6px', height: '28px', fontSize: '0.88rem' }}
                          />
                          <button
                            onClick={() => handleSavePriceEdit(food)}
                            disabled={priceState.saving}
                            style={{ backgroundColor: '#059669', color: '#FFF', padding: '3px 6px', borderRadius: '5px' }}
                            title="Save"
                          >
                            <Check size={13} />
                          </button>
                          <button
                            onClick={() => handleCancelPriceEdit(food._id)}
                            style={{ backgroundColor: '#E2E8F0', color: '#475569', padding: '3px 6px', borderRadius: '5px' }}
                            title="Cancel"
                          >
                            <X size={13} />
                          </button>
                        </div>
                      ) : (
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                          <div
                            onClick={() => handleStartPriceEdit(food)}
                            style={{
                              display: 'flex',
                              alignItems: 'baseline',
                              gap: '2px',
                              cursor: 'pointer',
                              fontWeight: 900,
                              fontSize: '1.05rem',
                              color: '#0F172A',
                            }}
                            title="Click to inline edit"
                          >
                            <span>₹{food.price}</span>
                            <Edit2 size={11} color="#94A3B8" style={{ marginLeft: '4px' }} />
                          </div>

                          <div style={{ display: 'inline-flex', gap: '3px' }}>
                            <button
                              onClick={() => handleQuickPriceAdjust(food, -10)}
                              style={{
                                padding: '2px 6px',
                                borderRadius: '4px',
                                backgroundColor: '#F1F5F9',
                                border: '1px solid #CBD5E1',
                                fontSize: '0.72rem',
                                fontWeight: 700,
                              }}
                              title="-₹10"
                            >
                              -10
                            </button>
                            <button
                              onClick={() => handleQuickPriceAdjust(food, 10)}
                              style={{
                                padding: '2px 6px',
                                borderRadius: '4px',
                                backgroundColor: '#ECFDF5',
                                border: '1px solid #A7F3D0',
                                color: '#065F46',
                                fontSize: '0.72rem',
                                fontWeight: 700,
                              }}
                              title="+₹10"
                            >
                              +10
                            </button>
                          </div>
                        </div>
                      )}
                    </td>

                    {/* 1-Click Availability Switch */}
                    <td>
                      <div
                        onClick={() => handleToggleAvailability(food)}
                        style={{
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: '6px',
                          cursor: 'pointer',
                          userSelect: 'none',
                        }}
                        title="1-Click Availability Switch"
                      >
                        <div
                          style={{
                            width: '38px',
                            height: '20px',
                            borderRadius: '9999px',
                            backgroundColor: isAvailable ? '#10B981' : '#CBD5E1',
                            position: 'relative',
                            transition: 'background-color 0.2s ease',
                            display: 'flex',
                            alignItems: 'center',
                            padding: '2px',
                          }}
                        >
                          <div
                            style={{
                              width: '16px',
                              height: '16px',
                              borderRadius: '50%',
                              backgroundColor: '#FFFFFF',
                              boxShadow: '0 1px 3px rgba(0,0,0,0.2)',
                              transform: isAvailable ? 'translateX(18px)' : 'translateX(0px)',
                              transition: 'transform 0.2s ease',
                            }}
                          />
                        </div>
                        <span
                          style={{
                            fontSize: '0.76rem',
                            fontWeight: 800,
                            color: isAvailable ? '#065F46' : '#991B1B',
                          }}
                        >
                          {isAvailable ? 'In Stock' : 'Sold Out'}
                        </span>
                      </div>
                    </td>

                    {/* Actions */}
                    <td style={{ textAlign: 'right' }}>
                      <div style={{ display: 'inline-flex', alignItems: 'center', gap: '0.4rem' }}>
                        <button
                          onClick={() => handleOpenEditModal(food)}
                          className="admin-btn admin-btn-secondary"
                          style={{ padding: '0.35rem 0.65rem', fontSize: '0.78rem' }}
                          title="Edit Dish"
                        >
                          <Edit2 size={13} /> Edit
                        </button>
                        <button
                          onClick={() => handleDeleteFood(food._id, food.name)}
                          className="admin-btn admin-btn-danger"
                          style={{ padding: '0.35rem 0.65rem', fontSize: '0.78rem' }}
                          title="Delete Dish"
                        >
                          <Trash2 size={13} />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      {/* High-Resolution Image Lightbox Modal */}
      {previewImage && (
        <div
          onClick={() => setPreviewImage(null)}
          style={{
            position: 'fixed',
            inset: 0,
            backgroundColor: 'rgba(15, 23, 42, 0.85)',
            backdropFilter: 'blur(8px)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 100,
            padding: '1.5rem',
          }}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            style={{
              backgroundColor: '#FFFFFF',
              borderRadius: '20px',
              maxWidth: '680px',
              width: '100%',
              overflow: 'hidden',
              boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.35)',
              position: 'relative',
            }}
          >
            <div style={{ position: 'relative', width: '100%', height: '360px', backgroundColor: '#0F172A' }}>
              <img
                src={previewImage.url}
                alt={previewImage.title}
                style={{ width: '100%', height: '100%', objectFit: 'cover' }}
              />
              <button
                onClick={() => setPreviewImage(null)}
                style={{
                  position: 'absolute',
                  top: '14px',
                  right: '14px',
                  width: '36px',
                  height: '36px',
                  borderRadius: '50%',
                  backgroundColor: 'rgba(15, 23, 42, 0.75)',
                  color: '#FFFFFF',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  cursor: 'pointer',
                  border: '1px solid rgba(255,255,255,0.2)',
                }}
              >
                <X size={18} />
              </button>
            </div>
            <div style={{ padding: '1.5rem' }}>
              <h3 style={{ fontSize: '1.3rem', fontWeight: 800, color: '#0F172A', marginBottom: '0.4rem' }}>
                {previewImage.title}
              </h3>
              <p style={{ color: '#64748B', fontSize: '0.9rem', lineHeight: 1.5 }}>
                {previewImage.desc}
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Add / Edit Dish Modal */}
      {isModalOpen && (
        <div className="food-modal-backdrop">
          <div className="food-modal-card">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
              <div>
                <h2 style={{ fontSize: '1.35rem', fontWeight: 900, color: '#0F172A' }}>
                  {editingFood ? 'Edit Culinary Dish' : 'Add New Culinary Dish'}
                </h2>
                <p style={{ fontSize: '0.82rem', color: '#64748B', marginTop: '0.15rem' }}>
                  Configure catalog attributes, pricing, spice level, and dietary taxonomies.
                </p>
              </div>
              <button
                onClick={() => {
                  stopLiveCamera();
                  setIsModalOpen(false);
                }}
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
                }}
              >
                <X size={18} />
              </button>
            </div>

            {formError && (
              <div
                style={{
                  backgroundColor: '#FEF2F2',
                  border: '1px solid #FECACA',
                  borderRadius: '10px',
                  padding: '0.75rem 1rem',
                  marginBottom: '1.25rem',
                  color: '#991B1B',
                  fontSize: '0.85rem',
                  fontWeight: 600,
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px',
                }}
              >
                <AlertCircle size={16} /> {formError}
              </div>
            )}

            <form onSubmit={handleFormSubmit}>
              <div style={{ marginBottom: '1.1rem' }}>
                <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 700, color: '#334155', marginBottom: '0.35rem' }}>
                  Dish Name *
                </label>
                <input
                  type="text"
                  className="admin-input"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="e.g., Hyderabadi Dum Chicken Biryani"
                  required
                />
              </div>

              <div style={{ marginBottom: '1.1rem' }}>
                <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 700, color: '#334155', marginBottom: '0.35rem' }}>
                  Description *
                </label>
                <textarea
                  className="admin-input"
                  rows="3"
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="Fragrant aged basmati rice layered with succulent bone-in chicken marinated overnight..."
                  required
                />
              </div>

              <div className="food-form-row-2col">
                <div>
                  <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 700, color: '#334155', marginBottom: '0.35rem' }}>
                    Price (₹) *
                  </label>
                  <input
                    type="number"
                    className="admin-input"
                    value={formData.price}
                    onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                    placeholder="340"
                    min="1"
                    required
                  />
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 700, color: '#334155', marginBottom: '0.35rem' }}>
                    Category *
                  </label>
                  <select
                    className="admin-input"
                    value={formData.category}
                    onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                  >
                    {categories.length > 0 ? (
                      categories.map((c) => (
                        <option key={c._id || c.name} value={c.name}>
                          {c.name}
                        </option>
                      ))
                    ) : (
                      <>
                        <option value="Biryani">Biryani</option>
                        <option value="Starters">Starters</option>
                        <option value="Main Course">Main Course</option>
                        <option value="Chinese">Chinese</option>
                        <option value="Desserts">Desserts</option>
                        <option value="Beverages">Beverages</option>
                      </>
                    )}
                  </select>
                </div>
              </div>

              <div className="food-form-row-2col">
                <div>
                  <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 700, color: '#334155', marginBottom: '0.35rem' }}>
                    Dietary Classification
                  </label>
                  <select
                    className="admin-input"
                    value={formData.isVeg ? 'veg' : 'non-veg'}
                    onChange={(e) => setFormData({ ...formData, isVeg: e.target.value === 'veg' })}
                  >
                    <option value="veg">🟢 Pure Vegetarian</option>
                    <option value="non-veg">🔴 Non-Vegetarian</option>
                  </select>
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 700, color: '#334155', marginBottom: '0.35rem' }}>
                    Spice Level
                  </label>
                  <select
                    className="admin-input"
                    value={formData.spiceLevel}
                    onChange={(e) => setFormData({ ...formData, spiceLevel: e.target.value })}
                  >
                    <option value="Mild">Mild</option>
                    <option value="Medium">Medium</option>
                    <option value="Hot">Hot</option>
                    <option value="Extra Hot">Extra Hot</option>
                  </select>
                </div>
              </div>

              <div className="food-form-row-2col">
                <div>
                  <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 700, color: '#334155', marginBottom: '0.35rem' }}>
                    Preparation Time
                  </label>
                  <input
                    type="text"
                    className="admin-input"
                    value={formData.preparationTime}
                    onChange={(e) => setFormData({ ...formData, preparationTime: e.target.value })}
                    placeholder="e.g., 20 mins"
                  />
                </div>

                <div className="food-checkbox-stack">
                  <label className="food-checkbox-pill">
                    <input
                      type="checkbox"
                      checked={formData.isPopular}
                      onChange={(e) => setFormData({ ...formData, isPopular: e.target.checked })}
                      style={{ width: '16px', height: '16px', accentColor: '#D97706', cursor: 'pointer' }}
                    />
                    ⭐ Chef's Popular Special
                  </label>

                  <label className="food-checkbox-pill">
                    <input
                      type="checkbox"
                      checked={formData.isAvailable}
                      onChange={(e) => setFormData({ ...formData, isAvailable: e.target.checked })}
                      style={{ width: '16px', height: '16px', accentColor: '#059669', cursor: 'pointer' }}
                    />
                    ✅ Available In Stock
                  </label>
                </div>
              </div>

              {/* Image Selection: Browse from Computer / Device, Camera Capture, or URL */}
              <div className="food-image-section">
                <div className="food-image-header-row">
                  <label style={{ fontSize: '0.82rem', fontWeight: 700, color: '#334155', margin: 0, display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <ImageIcon size={15} color="#059669" />
                    Dish Image *
                  </label>
                  
                  {/* Mode toggles */}
                  <div className="food-image-mode-toggles">
                    <button
                      type="button"
                      onClick={() => { stopLiveCamera(); setImageInputMode('browse'); }}
                      className="food-image-mode-btn"
                      style={{
                        backgroundColor: imageInputMode === 'browse' ? '#FFFFFF' : 'transparent',
                        color: imageInputMode === 'browse' ? '#0F172A' : '#64748B',
                        boxShadow: imageInputMode === 'browse' ? '0 1px 2px rgba(0,0,0,0.08)' : 'none',
                      }}
                    >
                      <FolderOpen size={12} /> Browse
                    </button>
                    <button
                      type="button"
                      onClick={() => { setImageInputMode('camera'); startLiveCamera(); }}
                      className="food-image-mode-btn"
                      style={{
                        backgroundColor: imageInputMode === 'camera' ? '#FFFFFF' : 'transparent',
                        color: imageInputMode === 'camera' ? '#0F172A' : '#64748B',
                        boxShadow: imageInputMode === 'camera' ? '0 1px 2px rgba(0,0,0,0.08)' : 'none',
                      }}
                    >
                      <Camera size={12} /> Camera
                    </button>
                    <button
                      type="button"
                      onClick={() => { stopLiveCamera(); setImageInputMode('url'); }}
                      className="food-image-mode-btn"
                      style={{
                        backgroundColor: imageInputMode === 'url' ? '#FFFFFF' : 'transparent',
                        color: imageInputMode === 'url' ? '#0F172A' : '#64748B',
                        boxShadow: imageInputMode === 'url' ? '0 1px 2px rgba(0,0,0,0.08)' : 'none',
                      }}
                    >
                      <ExternalLink size={12} /> URL / Path
                    </button>
                  </div>
                </div>

                {/* Hidden native inputs for browsing and mobile camera capture */}
                <input
                  type="file"
                  ref={fileInputRef}
                  accept="image/*"
                  onChange={handleFileSelect}
                  style={{ display: 'none' }}
                />
                <input
                  type="file"
                  ref={mobileCameraInputRef}
                  accept="image/*"
                  capture="environment"
                  onChange={handleFileSelect}
                  style={{ display: 'none' }}
                />

                {/* Primary Action Buttons Bar */}
                <div className="food-image-action-grid">
                  <button
                    type="button"
                    onClick={() => {
                      stopLiveCamera();
                      setImageInputMode('browse');
                      if (fileInputRef.current) fileInputRef.current.click();
                    }}
                    className="food-image-action-btn"
                  >
                    <Upload size={15} color="#059669" />
                    Upload from Browse
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      setImageInputMode('camera');
                      startLiveCamera();
                    }}
                    className="food-image-action-btn"
                    style={{
                      backgroundColor: isCameraActive ? '#FEF3C7' : '#FFFFFF',
                      borderColor: isCameraActive ? '#F59E0B' : '#CBD5E1',
                    }}
                  >
                    <Camera size={15} color="#D97706" />
                    {isCameraActive ? 'Camera Active' : 'Take Photo (Camera)'}
                  </button>
                </div>

                {/* Live Camera Viewfinder Modal / Card */}
                {isCameraActive && (
                  <div style={{
                    position: 'relative',
                    marginBottom: '1rem',
                    backgroundColor: '#0F172A',
                    borderRadius: '10px',
                    overflow: 'hidden',
                    padding: '0.75rem',
                    border: '2px solid #F59E0B',
                    boxShadow: '0 4px 12px rgba(0,0,0,0.2)'
                  }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
                      <span style={{ color: '#F8FAFC', fontSize: '0.75rem', fontWeight: 700, display: 'inline-flex', alignItems: 'center', gap: '6px' }}>
                        <span style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: '#EF4444', display: 'inline-block' }} />
                        Live Camera Viewfinder
                      </span>
                      <button
                        type="button"
                        onClick={stopLiveCamera}
                        style={{
                          background: 'none',
                          border: 'none',
                          color: '#94A3B8',
                          cursor: 'pointer',
                          padding: '2px 6px',
                          fontSize: '0.75rem',
                          fontWeight: 700,
                        }}
                      >
                        ✕ Close
                      </button>
                    </div>

                    <div style={{ position: 'relative', width: '100%', borderRadius: '8px', overflow: 'hidden', backgroundColor: '#000000', minHeight: '180px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      <video
                        ref={videoRef}
                        autoPlay
                        playsInline
                        muted
                        style={{ width: '100%', maxHeight: '260px', objectFit: 'contain' }}
                      />
                    </div>

                    <div style={{ display: 'flex', gap: '0.5rem', marginTop: '0.75rem' }}>
                      <button
                        type="button"
                        onClick={captureLivePhoto}
                        style={{
                          flex: 1,
                          display: 'inline-flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          gap: '6px',
                          padding: '8px 12px',
                          backgroundColor: '#059669',
                          color: '#FFFFFF',
                          border: 'none',
                          borderRadius: '8px',
                          fontSize: '0.82rem',
                          fontWeight: 800,
                          cursor: 'pointer',
                          boxShadow: '0 2px 6px rgba(5, 150, 105, 0.3)'
                        }}
                      >
                        <Camera size={16} /> Snap Photo
                      </button>
                      <button
                        type="button"
                        onClick={stopLiveCamera}
                        style={{
                          padding: '8px 12px',
                          backgroundColor: '#334155',
                          color: '#F1F5F9',
                          border: 'none',
                          borderRadius: '8px',
                          fontSize: '0.82rem',
                          fontWeight: 700,
                          cursor: 'pointer',
                        }}
                      >
                        Cancel
                      </button>
                    </div>
                  </div>
                )}

                {cameraError && (
                  <div style={{ marginBottom: '0.75rem', padding: '0.5rem 0.75rem', backgroundColor: '#FEF2F2', border: '1px solid #FECACA', borderRadius: '8px', fontSize: '0.75rem', color: '#DC2626' }}>
                    {cameraError}
                  </div>
                )}

                {/* Image URL / Asset Path Input */}
                <div style={{ marginTop: '0.5rem' }}>
                  <span style={{ fontSize: '0.72rem', fontWeight: 600, color: '#64748B', display: 'block', marginBottom: '3px' }}>
                    Image URL / Asset Path:
                  </span>
                  <input
                    type="text"
                    className="admin-input"
                    value={formData.image.startsWith('data:') ? '✅ Captured/Uploaded Image (Optimized Base64)' : formData.image}
                    onChange={(e) => setFormData({ ...formData, image: e.target.value })}
                    placeholder="/images/foods/hyderabadi-dum-chicken-biryani.jpg or https://..."
                    required
                    style={{ fontSize: '0.82rem', padding: '0.5rem 0.75rem' }}
                  />
                </div>

                {/* Preview Thumbnail Card with Details and Clear option */}
                {formData.image && (
                  <div className="food-image-preview-box">
                    <div className="food-image-preview-left" style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', minWidth: 0 }}>
                      <img
                        src={getImageUrl(formData.image)}
                        alt="Preview"
                        style={{ width: '48px', height: '48px', borderRadius: '8px', objectFit: 'cover', border: '1px solid #CBD5E1', flexShrink: 0 }}
                        onError={(e) => {
                          e.currentTarget.src = 'https://images.unsplash.com/photo-1589302168068-964664d93dc0?auto=format&fit=crop&w=600&q=80';
                        }}
                      />
                      <div className="food-image-preview-info" style={{ minWidth: 0, flex: 1 }}>
                        <div style={{ fontSize: '0.78rem', fontWeight: 700, color: '#1E293B', display: 'flex', alignItems: 'center', gap: '6px', flexWrap: 'wrap' }}>
                          <span>Image Ready</span>
                          {formData.image.startsWith('data:') ? (
                            <span style={{ fontSize: '0.65rem', backgroundColor: '#ECFDF5', color: '#059669', padding: '1px 6px', borderRadius: '4px', fontWeight: 800 }}>
                              Custom Upload / Camera
                            </span>
                          ) : (
                            <span style={{ fontSize: '0.65rem', backgroundColor: '#F1F5F9', color: '#475569', padding: '1px 6px', borderRadius: '4px', fontWeight: 800 }}>
                              Asset Path / URL
                            </span>
                          )}
                        </div>
                        <span style={{ fontSize: '0.72rem', color: '#64748B', display: 'block', wordBreak: 'break-all' }}>
                          {formData.image.startsWith('data:') ? 'Optimized image ready to save' : formData.image}
                        </span>
                      </div>
                    </div>

                    <button
                      type="button"
                      onClick={() => setFormData({ ...formData, image: '' })}
                      className="food-image-clear-btn"
                      style={{
                        padding: '5px 10px',
                        fontSize: '0.72rem',
                        fontWeight: 700,
                        color: '#EF4444',
                        backgroundColor: '#FEF2F2',
                        border: '1px solid #FCA5A5',
                        borderRadius: '6px',
                        cursor: 'pointer',
                        whiteSpace: 'nowrap'
                      }}
                      title="Clear image"
                    >
                      Clear
                    </button>
                  </div>
                )}
              </div>

              <div className="food-modal-actions">
                <button
                  type="button"
                  onClick={() => {
                    stopLiveCamera();
                    setIsModalOpen(false);
                  }}
                  className="admin-btn admin-btn-secondary"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="admin-btn admin-btn-primary"
                >
                  {submitting ? 'Saving...' : editingFood ? 'Update Dish' : 'Create Dish'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminFoodsPage;
