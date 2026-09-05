import React, { useState, useEffect, useRef } from 'react';
import { marketService } from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import Modal from '../../components/Modal';
import LoadingSpinner from '../../components/LoadingSpinner';
import {
  ShoppingBag,
  Plus,
  Search,
  Tag,
  Phone,
  CheckCircle2,
  Trash2,
  Sparkles,
  ChevronDown,
  Filter,
  Check,
} from 'lucide-react';

export default function MarketPage() {
  const { user } = useAuth();

  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [categoryFilter, setCategoryFilter] = useState('');
  const [conditionFilter, setConditionFilter] = useState('');
  const [search, setSearch] = useState('');
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const dropdownRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setDropdownOpen(false);
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

  const handleToggleStatus = async (id, currentStatus) => {
    try {
      const nextStatus = currentStatus === 'available' ? 'sold' : 'available';
      await marketService.updateMarketStatus(id, nextStatus);
      fetchItems();
    } catch (err) {
      alert(err.message || 'Failed to update status');
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this listing?')) return;
    try {
      await marketService.deleteMarketItem(id);
      fetchItems();
    } catch (err) {
      alert(err.message || 'Failed to delete listing');
    }
  };

  const categories = [
    { label: 'All Items', value: '' },
    { label: 'Books & Textbooks', value: 'books' },
    { label: 'Handwritten Notes', value: 'notes' },
    { label: 'Lab & Drawing Kits', value: 'kit' },
    { label: 'Electronics', value: 'electronics' },
    { label: 'Instruments', value: 'instruments' },
    { label: 'Furniture / Hostel', value: 'furniture' },
    { label: 'Other', value: 'other' },
  ];

  return (
    <div className="max-w-7xl xl:max-w-[1440px] mx-auto px-3 sm:px-6 lg:px-8 py-4 sm:py-8 space-y-4 sm:space-y-6">
      {/* Header Banner */}
      <div className="bg-[#121417] border border-[#1E2228] rounded-2xl p-6 sm:p-7 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 shadow-sm relative overflow-hidden">
        <div className="space-y-1.5 relative z-10">
          <span className="text-[11px] font-semibold uppercase tracking-wider text-[#A6B0BC] bg-[#181B20] px-3 py-1 rounded-xl border border-[#242932]">
            Student Marketplace
          </span>
          <h1 className="text-xl sm:text-2xl font-bold text-white">
            Buy & Sell Within Campus
          </h1>
          <p className="text-xs sm:text-sm text-[#7C8592] max-w-xl leading-relaxed">
            Pass down lab coats, engineering drafters, semester reference books, or dorm essentials to juniors without middlemen or courier fees.
          </p>
        </div>

        <button
          onClick={() => setModalOpen(true)}
          className="w-full sm:w-auto flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-[#20242B] hover:bg-[#282D36] border border-[#2D333E] text-white font-semibold text-xs sm:text-sm transition-all flex-shrink-0 cursor-pointer active:scale-98"
        >
          <Plus className="w-4 h-4" />
          <span>Sell an Item</span>
        </button>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-col sm:flex-row gap-2.5 sm:gap-3 items-stretch sm:items-center justify-between">
        <div className="relative flex-1 w-full">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[#7C8592]" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search books, drafters, notes, calculators..."
            className="w-full pl-10 pr-4 py-2.5 bg-[#121417] border border-[#20242B] rounded-xl text-xs sm:text-sm text-white placeholder-[#687280] focus:outline-none focus:border-[#383F4D] transition-all"
          />
        </div>

        {/* Category Dropdown */}
        <div className="relative flex-shrink-0" ref={dropdownRef}>
          <button
            type="button"
            onClick={() => setDropdownOpen(!dropdownOpen)}
            className="w-full sm:w-auto flex items-center justify-between gap-3 px-4 py-2.5 bg-[#121417] border border-[#20242B] hover:border-[#383F4D] rounded-xl text-xs sm:text-sm text-white transition-all cursor-pointer shadow-xs min-w-[190px]"
          >
            <div className="flex items-center gap-2">
              <Filter className="w-3.5 h-3.5 text-[#7C8592]" />
              <span className="font-medium text-white truncate">
                {categories.find((c) => c.value === categoryFilter)?.label || 'All Items'}
              </span>
            </div>
            <ChevronDown
              className={`w-3.5 h-3.5 text-[#7C8592] transition-transform duration-200 flex-shrink-0 ${
                dropdownOpen ? 'rotate-180' : ''
              }`}
            />
          </button>

          {dropdownOpen && (
            <div className="absolute right-0 mt-2 w-full sm:w-60 bg-[#121417] border border-[#20242B] rounded-2xl p-1.5 shadow-2xl z-40 animate-in fade-in slide-in-from-top-2 duration-150">
              <div className="px-3 py-1.5 text-[10px] uppercase font-semibold text-[#7C8592] tracking-wider border-b border-[#1E2228] mb-1">
                Filter by Category
              </div>
              <div className="max-h-64 overflow-y-auto space-y-0.5 scrollbar-none">
                {categories.map((c) => {
                  const isSelected = categoryFilter === c.value;
                  return (
                    <button
                      key={c.value}
                      type="button"
                      onClick={() => {
                        setCategoryFilter(c.value);
                        setDropdownOpen(false);
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

        {/* Condition Filter */}
        <select
          value={conditionFilter}
          onChange={(e) => setConditionFilter(e.target.value)}
          className="px-3.5 py-2.5 bg-[#121417] border border-[#20242B] rounded-xl text-xs sm:text-sm text-white focus:outline-none focus:border-[#383F4D] cursor-pointer"
        >
          <option value="">Any Condition</option>
          <option value="new">Brand New</option>
          <option value="like-new">Like New</option>
          <option value="good">Good Condition</option>
          <option value="fair">Fair / Usable</option>
        </select>
      </div>

      {/* Grid */}
      {loading ? (
        <LoadingSpinner message="Loading marketplace items..." />
      ) : items.length === 0 ? (
        <div className="bg-[#121417] border border-[#1E2228] rounded-2xl p-12 text-center space-y-4 shadow-sm">
          <ShoppingBag className="w-10 h-10 text-[#7C8592] mx-auto" />
          <h3 className="text-base sm:text-lg font-bold text-white">No items found</h3>
          <p className="text-xs sm:text-sm text-[#7C8592]">Try searching with a different keyword or category.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-6">
          {items.map((item) => {
            const isSeller = user && (item.seller?._id || item.seller) === user._id;

            return (
              <div
                key={item._id}
                className="bg-[#121417] border border-[#1E2228] hover:border-[#272C35] rounded-2xl overflow-hidden transition-all flex flex-col justify-between group shadow-sm"
              >
                <div>
                  {/* Photo if available */}
                  <div className="h-44 sm:h-52 w-full bg-[#0F1114] relative overflow-hidden flex items-center justify-center">
                    {item.image ? (
                      <img
                        src={item.image.startsWith('http') ? item.image : `${item.image}`}
                        alt={item.title}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                      />
                    ) : (
                      <ShoppingBag className="w-12 h-12 text-[#242932]" />
                    )}

                    {/* Price tag */}
                    <div className="absolute top-3 left-3 bg-[#121417]/95 backdrop-blur-md px-3 py-1 rounded-xl border border-[#242932] text-xs sm:text-sm font-bold text-white shadow-sm">
                      ₹{item.price}
                    </div>

                    {/* Condition badge */}
                    <div className="absolute top-3 right-3 bg-[#121417]/95 backdrop-blur-md px-2.5 py-1 rounded-xl text-[11px] font-medium text-[#A6B0BC] capitalize border border-[#242932] shadow-xs">
                      {item.condition}
                    </div>

                    {item.status === 'sold' && (
                      <div className="absolute inset-0 bg-black/75 backdrop-blur-xs flex items-center justify-center">
                        <span className="text-xs font-bold uppercase tracking-widest text-[#FF6B6B] border border-[#FF6B6B]/40 px-3.5 py-1.5 rounded-xl rotate-[-10deg] bg-[#251515]">
                          SOLD OUT
                        </span>
                      </div>
                    )}
                  </div>

                  {/* Body */}
                  <div className="p-5 space-y-2">
                    <div className="flex items-center justify-between text-xs text-[#7C8592]">
                      <span className="uppercase font-semibold text-[10px] text-[#A6B0BC] bg-[#181B20] border border-[#242932] px-2 py-0.5 rounded-lg">
                        {item.category}
                      </span>
                      <span>{new Date(item.createdAt).toLocaleDateString()}</span>
                    </div>

                    <h3 className="font-bold text-sm sm:text-base text-white group-hover:text-gray-200 transition-colors line-clamp-1">{item.title}</h3>
                    {item.description && (
                      <p className="text-xs text-[#7C8592] line-clamp-2 leading-relaxed">
                        {item.description}
                      </p>
                    )}

                    {/* Seller details */}
                    <div className="pt-2 flex items-center justify-between text-xs">
                      <span className="text-[#7C8592]">
                        Sold by <span className="text-white font-semibold">{item.seller?.name || 'Student'}</span>
                      </span>
                      {item.contact && (
                        <div className="flex items-center gap-1 text-white font-semibold">
                          <Phone className="w-3.5 h-3.5 text-[#7C8592]" />
                          <span>{item.contact}</span>
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                {/* Footer Controls */}
                <div className="p-5 pt-3 border-t border-[#1C1F26] flex items-center justify-between">
                  <span
                    className={`text-[11px] font-semibold px-2.5 py-0.5 rounded-lg capitalize border ${
                      item.status === 'sold'
                        ? 'bg-[#181B20] text-[#7C8592] border-[#242932]'
                        : 'bg-[#121E16] text-[#4ADE80] border-[#4ADE80]/30'
                    }`}
                  >
                    {item.status === 'sold' ? 'Sold' : 'Available'}
                  </span>

                  {isSeller && (
                    <div className="flex items-center gap-1.5">
                      <button
                        onClick={() => handleToggleStatus(item._id, item.status)}
                        className="px-2.5 py-1 rounded-xl text-[11px] font-semibold bg-[#20242B] hover:bg-[#282D36] text-white border border-[#2D333E] cursor-pointer"
                      >
                        {item.status === 'sold' ? 'Mark Available' : 'Mark Sold'}
                      </button>
                      <button
                        onClick={() => handleDelete(item._id)}
                        className="p-1.5 rounded-xl text-[#FF6B6B] hover:bg-[#251515] cursor-pointer"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Sell Item Modal */}
      <Modal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        title="List an Item on Campus Marketplace"
      >
        <form onSubmit={handleCreate} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-[#7C8592] uppercase mb-1.5">
              Item Title
            </label>
            <input
              type="text"
              required
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              placeholder="e.g. Higher Engineering Mathematics by B.S. Grewal (44th Ed)"
              className="w-full px-4 py-2.5 bg-[#0F1114] border border-[#1E2228] rounded-xl text-sm text-white placeholder-[#687280] focus:outline-none focus:border-[#383F4D]"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-[#7C8592] uppercase mb-1.5">
                Selling Price (₹)
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
                <option value="good">Good (No markings)</option>
                <option value="fair">Fair / Highlighted</option>
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
                <option value="books">Books & Textbooks</option>
                <option value="notes">Notes & Exam Guides</option>
                <option value="kit">Lab & Drawing Kits</option>
                <option value="electronics">Electronics & Calculators</option>
                <option value="instruments">Musical Instruments</option>
                <option value="furniture">Hostel Furniture</option>
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
                placeholder="+91 9876543210"
                className="w-full px-4 py-2.5 bg-[#0F1114] border border-[#1E2228] rounded-xl text-sm text-white placeholder-[#687280] focus:outline-none focus:border-[#383F4D]"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-[#7C8592] uppercase mb-1.5">
              Description / Notes
            </label>
            <textarea
              rows={2}
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              placeholder="Book condition, includes CD, can meet at college canteen..."
              className="w-full px-4 py-2.5 bg-[#0F1114] border border-[#1E2228] rounded-xl text-sm text-white placeholder-[#687280] focus:outline-none focus:border-[#383F4D]"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-[#7C8592] uppercase mb-1.5">
              Item Photo (Optional)
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
              {actionLoading ? 'Listing...' : 'List for Sale'}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
