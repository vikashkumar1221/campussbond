import React, { useState, useEffect, useRef } from 'react';
import { marketService } from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import Modal from '../../components/Modal';
import LoadingSpinner from '../../components/LoadingSpinner';
import {
  ShoppingBag,
  Plus,
  Search,
  Phone,
  CheckCircle2,
  Trash2,
  Sparkles,
  ChevronDown,
  Filter,
  Check,
  MoreVertical,
  BookOpen,
  FileText,
  PenTool,
  Laptop,
  Music,
  Home,
  SlidersHorizontal,
  Calendar,
  MessageCircle,
} from 'lucide-react';

export default function MarketPage() {
  const { user } = useAuth();

  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [categoryFilter, setCategoryFilter] = useState('');
  const [conditionFilter, setConditionFilter] = useState('');
  const [search, setSearch] = useState('');
  const [onlyMyListings, setOnlyMyListings] = useState(false);

  // Selected item for rich detail modal
  const [selectedItem, setSelectedItem] = useState(null);

  // Dropdown states
  const [categoryDropdownOpen, setCategoryDropdownOpen] = useState(false);
  const [conditionDropdownOpen, setConditionDropdownOpen] = useState(false);
  const [activeMenuItemId, setActiveMenuItemId] = useState(null);

  const categoryDropdownRef = useRef(null);
  const conditionDropdownRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (
        categoryDropdownRef.current &&
        !categoryDropdownRef.current.contains(event.target)
      ) {
        setCategoryDropdownOpen(false);
      }
      if (
        conditionDropdownRef.current &&
        !conditionDropdownRef.current.contains(event.target)
      ) {
        setConditionDropdownOpen(false);
      }
      if (!event.target.closest('.market-menu-container')) {
        setActiveMenuItemId(null);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Modal & form
  const [modalOpen, setModalOpen] = useState(false);
  const [actionLoading, setActionLoading] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    price: '',
    category: 'books',
    condition: 'good',
    contact: '',
  });
  const [selectedFile, setSelectedFile] = useState(null);

  const fetchItems = async () => {
    try {
      setLoading(true);
      const params = {};
      if (categoryFilter) params.category = categoryFilter;
      if (conditionFilter) params.condition = conditionFilter;
      if (search) params.search = search;
      const res = await marketService.getMarketItems(params);
      setItems(res.data.items || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchItems();
  }, [categoryFilter, conditionFilter, search]);

  const handleCreate = async (e) => {
    e.preventDefault();
    try {
      setActionLoading(true);
      const data = new FormData();
      data.append('title', formData.title);
      data.append('description', formData.description);
      data.append('price', Number(formData.price));
      data.append('category', formData.category);
      data.append('condition', formData.condition);
      data.append('contact', formData.contact);
      if (selectedFile) {
        data.append('image', selectedFile);
      }

      await marketService.createMarketItem(data);
      setModalOpen(false);
      setFormData({
        title: '',
        description: '',
        price: '',
        category: 'books',
        condition: 'good',
        contact: '',
      });
      setSelectedFile(null);
      fetchItems();
    } catch (err) {
      alert(err.message || 'Failed to list item');
    } finally {
      setActionLoading(false);
    }
  };

  const handleToggleStatus = async (item) => {
    setActiveMenuItemId(null);
    try {
      setActionLoading(true);
      const nextStatus = item.status === 'available' ? 'sold' : 'available';
      await marketService.updateMarketStatus(item._id, nextStatus);
      setSelectedItem((prev) =>
        prev && prev._id === item._id ? { ...prev, status: nextStatus } : prev
      );
      fetchItems();
    } catch (err) {
      alert(err.message || 'Failed to update status');
    } finally {
      setActionLoading(false);
    }
  };

  const handleDelete = async (item) => {
    setActiveMenuItemId(null);
    const confirmed = window.confirm(
      `Are you sure you want to delete "${item.title}"? This action cannot be undone.`
    );
    if (!confirmed) return;

    try {
      setActionLoading(true);
      await marketService.deleteMarketItem(item._id);
      setSelectedItem((prev) => (prev && prev._id === item._id ? null : prev));
      alert(`"${item.title}" has been deleted successfully.`);
      fetchItems();
    } catch (err) {
      alert(err.message || 'Failed to delete listing');
    } finally {
      setActionLoading(false);
    }
  };

  const categories = [
    { label: 'All Items', value: '', icon: ShoppingBag },
    { label: 'Books', value: 'books', icon: BookOpen },
    { label: 'Notes', value: 'notes', icon: FileText },
    { label: 'Lab Kits', value: 'kit', icon: PenTool },
    { label: 'Electronics', value: 'electronics', icon: Laptop },
    { label: 'Instruments', value: 'instruments', icon: Music },
    { label: 'Furniture', value: 'furniture', icon: Home },
    { label: 'Other', value: 'other', icon: Sparkles },
  ];

  const conditions = [
    { label: 'Any Condition', value: '' },
    { label: 'Brand New', value: 'new' },
    { label: 'Like New', value: 'like-new' },
    { label: 'Good', value: 'good' },
    { label: 'Fair', value: 'fair' },
  ];

  const myListingsCount = user
    ? items.filter((item) => String(item.seller?._id || item.seller) === String(user._id)).length
    : 0;

  const displayedItems = onlyMyListings && user
    ? items.filter((item) => String(item.seller?._id || item.seller) === String(user._id))
    : items;

  return (
    <div className="max-w-7xl xl:max-w-[1440px] mx-auto px-3 sm:px-6 lg:px-8 py-4 sm:py-8 space-y-4 sm:space-y-6">
      {/* Interactive Top Hub (Minimal text, systematic) */}
      <div className="bg-[#121417] border border-[#1E2228] rounded-3xl p-5 sm:p-6 shadow-sm relative z-20 space-y-4">
        {/* Subtle ambient light with isolated overflow containment */}
        <div className="absolute inset-0 rounded-3xl overflow-hidden pointer-events-none">
          <div className="absolute -top-24 -right-24 w-80 h-80 bg-white/[0.02] rounded-full blur-3xl" />
        </div>

        {/* Header Row: Title & Action Controls */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 relative z-10">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-2xl bg-[#181B20] border border-[#242932] flex items-center justify-center text-white flex-shrink-0 shadow-xs">
              <ShoppingBag className="w-5 h-5" />
            </div>
            <div>
              <h1 className="text-xl sm:text-2xl font-bold text-white tracking-tight">
                Marketplace
              </h1>
            </div>
          </div>

          <div className="flex items-center gap-2.5 flex-wrap sm:flex-nowrap">
            {/* Interactive Toggle: All vs My Listings */}
            <div className="inline-flex items-center bg-[#0C0E11] p-1 rounded-xl border border-[#1E2228]">
              <button
                type="button"
                onClick={() => setOnlyMyListings(false)}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                  !onlyMyListings
                    ? 'bg-[#20242B] text-white shadow-xs'
                    : 'text-[#7C8592] hover:text-white'
                }`}
              >
                <span>All</span>
                <span className="text-[10px] px-1.5 py-0.2 rounded-full bg-[#14161A] text-[#A6B0BC]">
                  {items.length}
                </span>
              </button>

              {user && (
                <button
                  type="button"
                  onClick={() => setOnlyMyListings(true)}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                    onlyMyListings
                      ? 'bg-[#20242B] text-white shadow-xs'
                      : 'text-[#7C8592] hover:text-white'
                  }`}
                >
                  <span>My Listings</span>
                  {myListingsCount > 0 && (
                    <span className="text-[10px] font-bold px-1.5 py-0.2 rounded-full bg-white text-black">
                      {myListingsCount}
                    </span>
                  )}
                </button>
              )}
            </div>

            {/* Sell an Item Button */}
            <button
              onClick={() => setModalOpen(true)}
              className="flex items-center justify-center gap-1.5 px-4 py-2 rounded-xl bg-white text-black hover:bg-gray-200 font-bold text-xs sm:text-sm transition-all cursor-pointer active:scale-95 shadow-sm"
            >
              <Plus className="w-4 h-4" />
              <span>Sell Item</span>
            </button>
          </div>
        </div>

        {/* Filter and Search Controls Bar */}
        <div className="pt-3 border-t border-[#1A1D23] flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 relative z-10">
          <div className="flex items-center gap-2.5 flex-wrap sm:flex-nowrap">
            {/* Category Dropdown */}
            <div className="relative flex-shrink-0" ref={categoryDropdownRef}>
              <button
                type="button"
                onClick={() => setCategoryDropdownOpen(!categoryDropdownOpen)}
                className="w-full sm:w-auto flex items-center justify-between gap-3 px-3.5 py-2 bg-[#0C0E11] border border-[#1E2228] hover:border-[#383F4D] rounded-xl text-xs sm:text-sm text-white transition-all cursor-pointer shadow-xs min-w-[160px]"
              >
                <div className="flex items-center gap-2">
                  <Filter className="w-3.5 h-3.5 text-[#7C8592]" />
                  <span className="font-medium text-white truncate">
                    {categories.find((c) => c.value === categoryFilter)?.label || 'All Items'}
                  </span>
                </div>
                <ChevronDown
                  className={`w-3.5 h-3.5 text-[#7C8592] transition-transform duration-200 flex-shrink-0 ${
                    categoryDropdownOpen ? 'rotate-180' : ''
                  }`}
                />
              </button>

              {categoryDropdownOpen && (
                <div className="absolute left-0 top-full mt-2 w-full sm:w-56 bg-[#121417] border border-[#20242B] rounded-2xl p-1.5 shadow-2xl z-50 animate-in fade-in slide-in-from-top-2 duration-150">
                  <div className="px-3 py-1.5 text-[10px] uppercase font-semibold text-[#7C8592] tracking-wider border-b border-[#1E2228] mb-1">
                    Category
                  </div>
                  <div className="max-h-64 overflow-y-auto space-y-0.5 scrollbar-none">
                    {categories.map((c) => {
                      const isSelected = categoryFilter === c.value;
                      const IconComponent = c.icon;
                      return (
                        <button
                          key={c.value}
                          type="button"
                          onClick={() => {
                            setCategoryFilter(c.value);
                            setOnlyMyListings(false);
                            setCategoryDropdownOpen(false);
                          }}
                          className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs sm:text-sm transition-all cursor-pointer text-left ${
                            isSelected
                              ? 'bg-[#1C2027] text-white font-semibold'
                              : 'text-[#A6B0BC] hover:text-white hover:bg-[#181B20]'
                          }`}
                        >
                          <div className="flex items-center gap-2.5">
                            <IconComponent className="w-3.5 h-3.5 text-[#A6B0BC]" />
                            <span>{c.label}</span>
                          </div>
                          {isSelected && <Check className="w-3.5 h-3.5 text-white flex-shrink-0" />}
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>

            {/* Condition Dropdown */}
            <div className="relative flex-shrink-0" ref={conditionDropdownRef}>
              <button
                type="button"
                onClick={() => setConditionDropdownOpen(!conditionDropdownOpen)}
                className="w-full sm:w-auto flex items-center justify-between gap-3 px-3.5 py-2 bg-[#0C0E11] border border-[#1E2228] hover:border-[#383F4D] rounded-xl text-xs sm:text-sm text-white transition-all cursor-pointer shadow-xs min-w-[145px]"
              >
                <div className="flex items-center gap-2">
                  <SlidersHorizontal className="w-3.5 h-3.5 text-[#7C8592]" />
                  <span className="font-medium text-white truncate">
                    {conditions.find((c) => c.value === conditionFilter)?.label || 'Any Condition'}
                  </span>
                </div>
                <ChevronDown
                  className={`w-3.5 h-3.5 text-[#7C8592] transition-transform duration-200 flex-shrink-0 ${
                    conditionDropdownOpen ? 'rotate-180' : ''
                  }`}
                />
              </button>

              {conditionDropdownOpen && (
                <div className="absolute left-0 top-full mt-2 w-full sm:w-48 bg-[#121417] border border-[#20242B] rounded-2xl p-1.5 shadow-2xl z-50 animate-in fade-in slide-in-from-top-2 duration-150">
                  <div className="px-3 py-1.5 text-[10px] uppercase font-semibold text-[#7C8592] tracking-wider border-b border-[#1E2228] mb-1">
                    Condition
                  </div>
                  <div className="space-y-0.5">
                    {conditions.map((c) => {
                      const isSelected = conditionFilter === c.value;
                      return (
                        <button
                          key={c.value}
                          type="button"
                          onClick={() => {
                            setConditionFilter(c.value);
                            setConditionDropdownOpen(false);
                          }}
                          className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs sm:text-sm transition-all cursor-pointer text-left ${
                            isSelected
                              ? 'bg-[#1C2027] text-white font-semibold'
                              : 'text-[#A6B0BC] hover:text-white hover:bg-[#181B20]'
                          }`}
                        >
                          <span>{c.label}</span>
                          {isSelected && <Check className="w-3.5 h-3.5 text-white flex-shrink-0" />}
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Search Box */}
          <div className="relative flex-1 sm:max-w-xs">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-[#7C8592]" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search items..."
              className="w-full pl-9 pr-7 py-2 bg-[#0C0E11] border border-[#1E2228] focus:border-[#383F4D] rounded-xl text-xs text-white placeholder-[#687280] focus:outline-none transition-all"
            />
            {search && (
              <button
                type="button"
                onClick={() => setSearch('')}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-xs text-[#7C8592] hover:text-white cursor-pointer"
              >
                ×
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Grid */}
      {loading ? (
        <LoadingSpinner message="Loading marketplace..." />
      ) : displayedItems.length === 0 ? (
        <div className="bg-[#121417] border border-[#1E2228] rounded-2xl p-12 text-center space-y-4 shadow-sm">
          <ShoppingBag className="w-10 h-10 text-[#7C8592] mx-auto" />
          <h3 className="text-base sm:text-lg font-bold text-white">
            {onlyMyListings ? 'No listings found' : 'No items found'}
          </h3>
          <p className="text-xs sm:text-sm text-[#7C8592]">
            {onlyMyListings
              ? 'You have not listed any items for sale yet.'
              : 'Try searching with a different keyword or category.'}
          </p>
          {onlyMyListings && (
            <button
              onClick={() => setOnlyMyListings(false)}
              className="px-4 py-2 rounded-xl bg-white text-black font-bold text-xs hover:bg-gray-200 transition-all cursor-pointer"
            >
              Browse All Items
            </button>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5 sm:gap-6">
          {displayedItems.map((item) => {
            const isSeller = Boolean(
              user && String(item.seller?._id || item.seller) === String(user._id)
            );

            return (
              <div
                key={item._id}
                onClick={() => setSelectedItem(item)}
                className="bg-[#121417] border border-[#1E2228] hover:border-[#383F4D] rounded-2xl overflow-hidden transition-all duration-200 hover:shadow-xl hover:shadow-black/50 flex flex-col justify-between group shadow-xs relative cursor-pointer"
              >
                <div>
                  {/* Photo area */}
                  <div className="h-52 sm:h-56 w-full bg-[#0C0E11] relative overflow-hidden flex items-center justify-center border-b border-[#1A1D23]">
                    {item.image ? (
                      <img
                        src={item.image.startsWith('http') ? item.image : `${item.image}`}
                        alt={item.title}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                      />
                    ) : (
                      <div className="w-14 h-14 rounded-2xl bg-[#14171C] border border-[#1E2228] flex items-center justify-center text-[#5B6370]">
                        <ShoppingBag className="w-7 h-7" />
                      </div>
                    )}

                    {/* Price tag */}
                    <div className="absolute top-3.5 left-3.5 bg-[#0C0E11]/90 backdrop-blur-md px-3 py-1.5 rounded-xl border border-[#242932] text-xs sm:text-sm font-bold text-white shadow-xs">
                      ₹{item.price}
                    </div>

                    {/* Condition & Options Menu */}
                    <div className="absolute top-3.5 right-3.5 flex items-center gap-1.5">
                      <span className="bg-[#0C0E11]/90 backdrop-blur-md px-2.5 py-1 rounded-lg text-[10px] font-semibold text-[#A6B0BC] uppercase border border-[#242932] shadow-xs">
                        {item.condition}
                      </span>

                      {/* Hidden 3-dots options menu for seller */}
                      {isSeller && (
                        <div className="relative market-menu-container">
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              setActiveMenuItemId(
                                activeMenuItemId === item._id ? null : item._id
                              );
                            }}
                            className="p-1 rounded-lg bg-[#0C0E11]/90 backdrop-blur-md text-[#7C8592] hover:text-white border border-[#242932] transition-colors cursor-pointer shadow-xs"
                            title="Options"
                          >
                            <MoreVertical className="w-3.5 h-3.5" />
                          </button>

                          {activeMenuItemId === item._id && (
                            <div
                              className="absolute right-0 top-full mt-1.5 w-36 bg-[#16191E] border border-[#242932] rounded-xl shadow-2xl p-1 z-30 animate-in fade-in zoom-in-95 duration-100"
                              onClick={(e) => e.stopPropagation()}
                            >
                              <button
                                type="button"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleToggleStatus(item);
                                }}
                                className="w-full flex items-center gap-2 px-2.5 py-1.5 rounded-lg text-xs font-medium text-[#A6B0BC] hover:text-white hover:bg-[#20242B] transition-colors text-left cursor-pointer"
                              >
                                <CheckCircle2 className="w-3.5 h-3.5 text-[#7C8592]" />
                                <span>{item.status === 'sold' ? 'Mark Available' : 'Mark Sold'}</span>
                              </button>
                              <button
                                type="button"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleDelete(item);
                                }}
                                className="w-full flex items-center gap-2 px-2.5 py-1.5 rounded-lg text-xs font-semibold text-[#FF6B6B] hover:bg-[#251515] transition-colors text-left cursor-pointer"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                                <span>Delete</span>
                              </button>
                            </div>
                          )}
                        </div>
                      )}
                    </div>

                    {/* Sold overlay */}
                    {item.status === 'sold' && (
                      <div className="absolute inset-0 bg-black/75 backdrop-blur-[2px] flex items-center justify-center">
                        <span className="text-xs font-bold uppercase tracking-widest text-[#A6B0BC] border border-[#383F4D] px-3.5 py-1.5 rounded-xl bg-[#16191E]/95 shadow-lg">
                          SOLD
                        </span>
                      </div>
                    )}
                  </div>

                  {/* Body: Minimal text & clean hierarchy */}
                  <div className="p-5 sm:p-6 space-y-3 flex-1 flex flex-col justify-between">
                    <div className="flex items-center justify-between text-xs text-[#7C8592]">
                      <span className="font-semibold uppercase tracking-wider text-[10px] text-[#A6B0BC] bg-[#181B20] border border-[#242932] px-2 py-0.5 rounded-md">
                        {item.category}
                      </span>
                      <span>{new Date(item.createdAt).toLocaleDateString()}</span>
                    </div>

                    <h3 className="font-bold text-base sm:text-lg text-white group-hover:text-gray-200 transition-colors line-clamp-1 leading-snug">
                      {item.title}
                    </h3>

                    <p className="text-xs sm:text-sm text-[#7C8592] line-clamp-2 min-h-[38px] leading-relaxed">
                      {item.description || 'No additional details provided.'}
                    </p>
                  </div>
                </div>

                {/* Footer Section: Surface shift */}
                <div className="px-5 sm:px-6 py-3.5 bg-[#0F1114]/70 border-t border-[#1A1D23] flex items-center justify-between gap-3 text-xs">
                  <span className="text-xs text-[#7C8592] truncate">
                    By <strong className="text-white font-semibold">{item.seller?.name || 'Student'}</strong>
                  </span>

                  {item.contact ? (
                    <a
                      href={`tel:${item.contact.replace(/[^0-9+]/g, '')}`}
                      onClick={(e) => e.stopPropagation()}
                      className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-[#181B20] hover:bg-[#20242B] text-white border border-[#242932] text-xs font-semibold transition-all shadow-xs flex-shrink-0 cursor-pointer active:scale-95"
                    >
                      <Phone className="w-3.5 h-3.5 text-[#7C8592]" />
                      <span>Contact</span>
                    </a>
                  ) : (
                    <span className="text-xs text-[#5B6370]">Campus</span>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Item Detail Modal */}
      <Modal
        isOpen={Boolean(selectedItem)}
        onClose={() => setSelectedItem(null)}
        title={selectedItem?.title || 'Item Details'}
        maxWidth="max-w-2xl"
      >
        {selectedItem && (() => {
          const isSeller = Boolean(
            user && String(selectedItem.seller?._id || selectedItem.seller) === String(user._id)
          );
          const cleanPhone = (selectedItem.contact || '').replace(/[^0-9]/g, '');
          const waNumber = cleanPhone.length === 10 ? `91${cleanPhone}` : cleanPhone;

          return (
            <div className="space-y-5">
              {/* Product Media */}
              <div className="w-full bg-[#0C0E11] rounded-2xl overflow-hidden border border-[#1E2228] relative flex items-center justify-center max-h-80 sm:max-h-96">
                {selectedItem.image ? (
                  <img
                    src={
                      selectedItem.image.startsWith('http')
                        ? selectedItem.image
                        : `${selectedItem.image}`
                    }
                    alt={selectedItem.title}
                    className="w-full h-full max-h-80 sm:max-h-96 object-contain sm:object-cover"
                  />
                ) : (
                  <div className="py-16 flex flex-col items-center justify-center text-[#5B6370] gap-2">
                    <ShoppingBag className="w-12 h-12" />
                    <span className="text-xs">No image available</span>
                  </div>
                )}

                {/* Sold Overlay */}
                {selectedItem.status === 'sold' && (
                  <div className="absolute inset-0 bg-black/80 backdrop-blur-[2px] flex items-center justify-center">
                    <span className="text-sm font-bold uppercase tracking-widest text-[#A6B0BC] border border-[#383F4D] px-4 py-2 rounded-xl bg-[#16191E]/95 shadow-lg">
                      SOLD OUT
                    </span>
                  </div>
                )}
              </div>

              {/* Price, Status & Badges */}
              <div className="space-y-3">
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span
                      className={`px-2.5 py-1 rounded-lg text-xs font-semibold uppercase tracking-wider border ${
                        selectedItem.status === 'sold'
                          ? 'bg-[#181B20] text-[#7C8592] border-[#242932]'
                          : 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20'
                      }`}
                    >
                      {selectedItem.status === 'sold' ? 'Sold' : 'Available'}
                    </span>

                    <span className="px-2.5 py-1 rounded-lg text-xs font-medium uppercase tracking-wider text-[#A6B0BC] bg-[#181B20] border border-[#242932]">
                      {selectedItem.category}
                    </span>

                    <span className="px-2.5 py-1 rounded-lg text-xs font-medium uppercase tracking-wider text-[#A6B0BC] bg-[#181B20] border border-[#242932]">
                      Condition: {selectedItem.condition}
                    </span>
                  </div>

                  <div className="text-2xl font-black text-white bg-[#181B20] border border-[#242932] px-4 py-1.5 rounded-xl shadow-xs">
                    ₹{selectedItem.price}
                  </div>
                </div>

                <h2 className="text-xl sm:text-2xl font-bold text-white leading-tight">
                  {selectedItem.title}
                </h2>

                <div className="flex items-center gap-2 text-xs text-[#7C8592]">
                  <Calendar className="w-3.5 h-3.5" />
                  <span>
                    Listed on{' '}
                    {new Date(selectedItem.createdAt).toLocaleDateString(undefined, {
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric',
                    })}
                  </span>
                </div>
              </div>

              {/* Full Description */}
              <div className="space-y-1.5">
                <div className="text-[11px] font-bold uppercase tracking-wider text-[#7C8592]">
                  Description
                </div>
                <div className="bg-[#0C0E11] p-4 rounded-xl border border-[#1E2228] text-sm text-[#D1D5DB] leading-relaxed whitespace-pre-wrap">
                  {selectedItem.description || 'No description was provided for this item.'}
                </div>
              </div>

              {/* Seller Information */}
              <div className="space-y-1.5">
                <div className="text-[11px] font-bold uppercase tracking-wider text-[#7C8592]">
                  Seller Information
                </div>
                <div className="bg-[#0C0E11] p-4 rounded-xl border border-[#1E2228] flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div className="flex items-center gap-3">
                    <div className="w-11 h-11 rounded-xl bg-[#181B20] border border-[#242932] flex items-center justify-center text-white font-bold text-base flex-shrink-0">
                      {selectedItem.seller?.avatar ? (
                        <img
                          src={selectedItem.seller.avatar}
                          alt={selectedItem.seller.name}
                          className="w-full h-full object-cover rounded-xl"
                        />
                      ) : (
                        (selectedItem.seller?.name?.[0] || 'S').toUpperCase()
                      )}
                    </div>
                    <div>
                      <div className="font-semibold text-white text-sm">
                        {selectedItem.seller?.name || 'Campus Student'}
                      </div>
                      <div className="text-xs text-[#7C8592]">
                        {selectedItem.seller?.branch
                          ? `${selectedItem.seller.branch}${
                              selectedItem.seller.semester ? ` • Sem ${selectedItem.seller.semester}` : ''
                            }`
                          : 'Campus Student'}
                        {selectedItem.seller?.email ? ` • ${selectedItem.seller.email}` : ''}
                      </div>
                    </div>
                  </div>

                  {/* Direct Contact Buttons */}
                  {selectedItem.contact && (
                    <div className="flex items-center gap-2 flex-wrap">
                      {waNumber && (
                        <a
                          href={`https://wa.me/${waNumber}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-[#181B20] hover:bg-[#20242B] text-emerald-400 border border-[#242932] text-xs font-semibold transition-all cursor-pointer shadow-xs"
                          title="Chat on WhatsApp"
                        >
                          <MessageCircle className="w-4 h-4" />
                          <span>WhatsApp</span>
                        </a>
                      )}
                      <a
                        href={`tel:${cleanPhone}`}
                        className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-white text-black hover:bg-gray-200 text-xs font-bold transition-all cursor-pointer shadow-xs"
                      >
                        <Phone className="w-3.5 h-3.5" />
                        <span>Call</span>
                      </a>
                    </div>
                  )}
                </div>
              </div>

              {/* Modal Footer Actions */}
              <div className="pt-2 border-t border-[#1E2228] flex items-center justify-between gap-3 flex-wrap">
                {isSeller ? (
                  <div className="flex items-center gap-2 flex-wrap">
                    <button
                      type="button"
                      disabled={actionLoading}
                      onClick={() => handleToggleStatus(selectedItem)}
                      className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-[#181B20] hover:bg-[#20242B] text-white border border-[#242932] text-xs font-semibold transition-all cursor-pointer"
                    >
                      <CheckCircle2 className="w-3.5 h-3.5 text-[#7C8592]" />
                      <span>{selectedItem.status === 'sold' ? 'Mark Available' : 'Mark as Sold'}</span>
                    </button>

                    <button
                      type="button"
                      disabled={actionLoading}
                      onClick={() => handleDelete(selectedItem)}
                      className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-[#251515] hover:bg-[#321A1A] text-[#FF6B6B] border border-[#401C1C] text-xs font-semibold transition-all cursor-pointer"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                      <span>Delete</span>
                    </button>
                  </div>
                ) : (
                  <div className="text-[11px] text-[#7C8592]">
                    Campus Safety: Exchange goods in public campus spaces.
                  </div>
                )}

                <button
                  type="button"
                  onClick={() => setSelectedItem(null)}
                  className="px-4 py-2 rounded-xl text-xs font-semibold text-[#7C8592] hover:text-white bg-[#181B20] border border-[#242932] cursor-pointer ml-auto"
                >
                  Close
                </button>
              </div>
            </div>
          );
        })()}
      </Modal>

      {/* Sell Item Modal */}
      <Modal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        title="Sell Item"
      >
        <form onSubmit={handleCreate} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-[#7C8592] uppercase mb-1.5">
              Title
            </label>
            <input
              type="text"
              required
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              placeholder="e.g. Engineering Mathematics by B.S. Grewal"
              className="w-full px-4 py-2.5 bg-[#0F1114] border border-[#1E2228] rounded-xl text-sm text-white placeholder-[#687280] focus:outline-none focus:border-[#383F4D]"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-[#7C8592] uppercase mb-1.5">
                Price (₹)
              </label>
              <input
                type="number"
                min={0}
                required
                value={formData.price}
                onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                placeholder="350"
                className="w-full px-4 py-2.5 bg-[#0F1114] border border-[#1E2228] rounded-xl text-sm text-white placeholder-[#687280] focus:outline-none focus:border-[#383F4D]"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-[#7C8592] uppercase mb-1.5">
                Condition
              </label>
              <select
                value={formData.condition}
                onChange={(e) => setFormData({ ...formData, condition: e.target.value })}
                className="w-full px-4 py-2.5 bg-[#0F1114] border border-[#1E2228] rounded-xl text-sm text-white focus:outline-none focus:border-[#383F4D] cursor-pointer"
              >
                <option value="like-new">Like New</option>
                <option value="good">Good</option>
                <option value="fair">Fair</option>
                <option value="new">Brand New</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-[#7C8592] uppercase mb-1.5">
                Category
              </label>
              <select
                value={formData.category}
                onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                className="w-full px-4 py-2.5 bg-[#0F1114] border border-[#1E2228] rounded-xl text-sm text-white focus:outline-none focus:border-[#383F4D] cursor-pointer"
              >
                <option value="books">Books</option>
                <option value="notes">Notes</option>
                <option value="kit">Lab Kits</option>
                <option value="electronics">Electronics</option>
                <option value="instruments">Instruments</option>
                <option value="furniture">Furniture</option>
                <option value="other">Other</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-[#7C8592] uppercase mb-1.5">
                Contact Phone / WhatsApp
              </label>
              <input
                type="text"
                value={formData.contact}
                onChange={(e) => setFormData({ ...formData, contact: e.target.value })}
                placeholder="+91 98765 43210"
                className="w-full px-4 py-2.5 bg-[#0F1114] border border-[#1E2228] rounded-xl text-sm text-white placeholder-[#687280] focus:outline-none focus:border-[#383F4D]"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-[#7C8592] uppercase mb-1.5">
              Description
            </label>
            <textarea
              rows={2}
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              placeholder="Item details, meeting spot, etc..."
              className="w-full px-4 py-2.5 bg-[#0F1114] border border-[#1E2228] rounded-xl text-sm text-white placeholder-[#687280] focus:outline-none focus:border-[#383F4D]"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-[#7C8592] uppercase mb-1.5">
              Photo (Optional)
            </label>
            <input
              type="file"
              accept="image/*"
              onChange={(e) => setSelectedFile(e.target.files[0])}
              className="w-full text-xs text-[#7C8592] file:mr-4 file:py-2 file:px-4 file:rounded-xl file:border-0 file:text-xs file:font-semibold file:bg-[#20242B] file:text-white hover:file:bg-[#282D36] cursor-pointer"
            />
          </div>

          <div className="pt-2 flex justify-end gap-2">
            <button
              type="button"
              onClick={() => setModalOpen(false)}
              className="px-4 py-2 rounded-xl text-xs font-semibold text-[#7C8592] hover:text-white bg-[#181B20] border border-[#242932] cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={actionLoading}
              className="px-6 py-2 rounded-xl text-xs font-semibold bg-[#20242B] hover:bg-[#282D36] text-white border border-[#2D333E] transition-all disabled:opacity-50 cursor-pointer"
            >
              {actionLoading ? 'Listing...' : 'List Item'}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
