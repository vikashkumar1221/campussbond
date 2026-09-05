import React, { useState, useEffect, useRef } from 'react';
import { lostFoundService } from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import Modal from '../../components/Modal';
import LoadingSpinner from '../../components/LoadingSpinner';
import {
  Search,
  Plus,
  MapPin,
  Phone,
  CheckCircle,
  Tag,
  AlertTriangle,
  Sparkles,
  Camera,
  Trash2,
  ChevronDown,
  Filter,
  Check,
} from 'lucide-react';

export default function LostFoundPage() {
  const { user } = useAuth();

  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [typeFilter, setTypeFilter] = useState(''); // '' | 'lost' | 'found'
  const [categoryFilter, setCategoryFilter] = useState('');
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
    type: 'lost',
    title: '',
    description: '',
    category: 'electronics',
    location: '',
    contact: '',
  });
  const [selectedFile, setSelectedFile] = useState(null);

  const fetchItems = async () => {
    try {
      setLoading(true);
      const params = {};
      if (typeFilter) params.type = typeFilter;
      if (categoryFilter) params.category = categoryFilter;
      if (search) params.search = search;
      const res = await lostFoundService.getLostItems(params);
      setItems(res.data.items || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchItems();
  }, [typeFilter, categoryFilter, search]);

  const handleCreate = async (e) => {
    e.preventDefault();
    try {
      setActionLoading(true);
      const data = new FormData();
      data.append('type', formData.type);
      data.append('title', formData.title);
      data.append('description', formData.description);
      data.append('category', formData.category);
      data.append('location', formData.location);
      data.append('contact', formData.contact);
      if (selectedFile) {
        data.append('image', selectedFile);
      }

      await lostFoundService.createLostItem(data);
      setModalOpen(false);
      setFormData({
        type: 'lost',
        title: '',
        description: '',
        category: 'electronics',
        location: '',
        contact: '',
      });
      setSelectedFile(null);
      fetchItems();
    } catch (err) {
      alert(err.message || 'Failed to submit report');
    } finally {
      setActionLoading(false);
    }
  };

  const handleToggleStatus = async (id, currentStatus) => {
    try {
      const nextStatus = currentStatus === 'open' ? 'resolved' : 'open';
      await lostFoundService.updateLostStatus(id, nextStatus);
      fetchItems();
    } catch (err) {
      alert(err.message || 'Failed to update status');
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this report?')) return;
    try {
      await lostFoundService.deleteLostItem(id);
      fetchItems();
    } catch (err) {
      alert(err.message || 'Failed to delete');
    }
  };

  const categories = [
    { label: 'All Items', value: '' },
    { label: 'Electronics', value: 'electronics' },
    { label: 'ID Cards', value: 'id-card' },
    { label: 'Keys', value: 'keys' },
    { label: 'Books', value: 'books' },
    { label: 'Accessories', value: 'accessories' },
    { label: 'Clothing', value: 'clothing' },
    { label: 'Other', value: 'other' },
  ];

  return (
    <div className="max-w-7xl xl:max-w-[1440px] mx-auto px-3 sm:px-6 lg:px-8 py-4 sm:py-8 space-y-4 sm:space-y-6">
      {/* Header Banner */}
      <div className="bg-[#121417] border border-[#1E2228] rounded-2xl p-6 sm:p-7 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 shadow-sm relative overflow-hidden">
        <div className="space-y-1.5 relative z-10">
          <span className="text-[11px] font-semibold uppercase tracking-wider text-[#A6B0BC] bg-[#181B20] px-3 py-1 rounded-xl border border-[#242932]">
            Campus Recovery
          </span>
          <h1 className="text-xl sm:text-2xl font-bold text-white">
            Lost & Found Board
          </h1>
          <p className="text-xs sm:text-sm text-[#7C8592] max-w-xl leading-relaxed">
            Lost your student ID, calculator, or water bottle? Report lost items or help fellow students recover belongings found on campus.
          </p>
        </div>

        <button
          onClick={() => setModalOpen(true)}
          className="w-full sm:w-auto flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-[#20242B] hover:bg-[#282D36] border border-[#2D333E] text-white font-semibold text-xs sm:text-sm transition-all flex-shrink-0 cursor-pointer active:scale-98"
        >
          <Plus className="w-4 h-4" />
          <span>Report Item</span>
        </button>
      </div>

      {/* Tabs & Filters */}
      <div className="flex flex-col lg:flex-row gap-2.5 sm:gap-3 items-stretch lg:items-center justify-between">
        <div className="flex flex-col sm:flex-row gap-2.5 sm:gap-3 flex-1 items-stretch sm:items-center">
          {/* Type Toggle: All / Lost / Found */}
          <div className="flex bg-[#121417] p-1 rounded-xl border border-[#20242B] shadow-xs flex-shrink-0">
            {[
              { label: 'All', value: '' },
              { label: 'Lost Items', value: 'lost' },
              { label: 'Found Items', value: 'found' },
            ].map((tab) => (
              <button
                key={tab.value}
                onClick={() => setTypeFilter(tab.value)}
                className={`flex-1 sm:flex-initial px-3.5 sm:px-4 py-1.5 sm:py-2 rounded-lg text-xs font-medium transition-all cursor-pointer ${
                  typeFilter === tab.value
                    ? 'bg-[#1C2027] text-white border border-[#2E3542] font-semibold shadow-xs'
                    : 'text-[#7C8592] hover:text-white'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          {/* Search */}
          <div className="relative flex-1 w-full">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[#7C8592]" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search by title or description..."
              className="w-full pl-10 pr-4 py-2 sm:py-2.5 bg-[#121417] border border-[#20242B] rounded-xl text-xs sm:text-sm text-white placeholder-[#687280] focus:outline-none focus:border-[#383F4D] transition-all"
            />
          </div>
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
                {categories.find((c) => c.value === categoryFilter)?.label || 'All Categories'}
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
      </div>

      {/* Grid */}
      {loading ? (
        <LoadingSpinner message="Loading lost & found reports..." />
      ) : items.length === 0 ? (
        <div className="bg-[#121417] border border-[#1E2228] rounded-2xl p-12 text-center space-y-4 shadow-sm">
          <Search className="w-10 h-10 text-[#7C8592] mx-auto" />
          <h3 className="text-base sm:text-lg font-bold text-white">No reports found</h3>
          <p className="text-xs sm:text-sm text-[#7C8592]">No items match the selected filters.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-6">
          {items.map((item) => {
            const isOwner = user && (item.createdBy?._id || item.createdBy) === user._id;

            return (
              <div
                key={item._id}
                className="bg-[#121417] border border-[#1E2228] hover:border-[#272C35] rounded-2xl overflow-hidden transition-all flex flex-col justify-between group shadow-sm"
              >
                <div>
                  {/* Photo if available */}
                  {item.image ? (
                    <div className="h-48 w-full bg-[#0F1114] relative overflow-hidden">
                      <img
                        src={item.image.startsWith('http') ? item.image : `${item.image}`}
                        alt={item.title}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                      />
                      <div className="absolute top-3 left-3">
                        <span
                          className={`text-[11px] font-semibold uppercase px-3 py-1 rounded-xl shadow-md ${
                            item.type === 'lost'
                              ? 'bg-[#251515] text-[#FF6B6B] border border-[#FF6B6B]/30'
                              : 'bg-[#121E16] text-[#4ADE80] border border-[#4ADE80]/30'
                          }`}
                        >
                          {item.type}
                        </span>
                      </div>
                    </div>
                  ) : (
                    <div className="p-5 pb-0 flex items-center justify-between">
                      <span
                        className={`text-[11px] font-semibold uppercase px-3 py-1 rounded-xl border ${
                          item.type === 'lost'
                            ? 'bg-[#251515] text-[#FF6B6B] border border-[#FF6B6B]/30'
                            : 'bg-[#121E16] text-[#4ADE80] border border-[#4ADE80]/30'
                        }`}
                      >
                        {item.type}
                      </span>
                      <span className="text-xs text-[#7C8592] capitalize px-2.5 py-0.5 rounded-lg bg-[#181B20] border border-[#242932]">{item.category}</span>
                    </div>
                  )}

                  {/* Body details */}
                  <div className="p-5 space-y-2.5">
                    <h3 className="font-bold text-base text-white group-hover:text-gray-200 transition-colors">{item.title}</h3>
                    {item.description && (
                      <p className="text-xs text-[#7C8592] line-clamp-3 leading-relaxed">
                        {item.description}
                      </p>
                    )}

                    <div className="space-y-1.5 pt-2 text-xs text-[#7C8592]">
                      {item.location && (
                        <div className="flex items-center gap-1.5 text-[#A6B0BC]">
                          <MapPin className="w-3.5 h-3.5 text-[#7C8592] flex-shrink-0" />
                          <span>{item.location}</span>
                        </div>
                      )}
                      {item.contact && (
                        <div className="flex items-center gap-1.5 text-white font-medium">
                          <Phone className="w-3.5 h-3.5 text-[#7C8592] flex-shrink-0" />
                          <span>{item.contact}</span>
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                {/* Footer status / actions */}
                <div className="p-5 pt-3 border-t border-[#1C1F26] flex items-center justify-between">
                  <span
                    className={`text-[11px] font-semibold px-2.5 py-0.5 rounded-lg capitalize border ${
                      item.status === 'resolved'
                        ? 'bg-[#181B20] text-[#7C8592] border-[#242932] line-through'
                        : 'bg-[#121E16] text-[#4ADE80] border-[#4ADE80]/30'
                    }`}
                  >
                    {item.status === 'resolved' ? 'Resolved' : 'Active Report'}
                  </span>

                  {isOwner && (
                    <div className="flex items-center gap-1.5">
                      <button
                        onClick={() => handleToggleStatus(item._id, item.status)}
                        className="px-2.5 py-1 rounded-xl text-[11px] font-semibold bg-[#20242B] hover:bg-[#282D36] text-white border border-[#2D333E] transition-colors cursor-pointer"
                      >
                        {item.status === 'resolved' ? 'Reopen' : 'Mark Resolved'}
                      </button>
                      <button
                        onClick={() => handleDelete(item._id)}
                        className="p-1.5 rounded-xl text-[#FF6B6B] hover:bg-[#251515] transition-colors cursor-pointer"
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

      {/* Report Item Modal */}
      <Modal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        title="Report a Lost or Found Item"
      >
        <form onSubmit={handleCreate} className="space-y-4">
          <div className="flex gap-2">
            <button
              type="button"
              onClick={() => setFormData({ ...formData, type: 'lost' })}
              className={`flex-1 py-2.5 rounded-xl text-xs font-semibold transition-all cursor-pointer border ${
                formData.type === 'lost'
                  ? 'bg-[#251515] text-[#FF6B6B] border-[#FF6B6B]/40 shadow-xs'
                  : 'bg-[#0F1114] text-[#7C8592] border-[#1E2228]'
              }`}
            >
              I Lost Something
            </button>
            <button
              type="button"
              onClick={() => setFormData({ ...formData, type: 'found' })}
              className={`flex-1 py-2.5 rounded-xl text-xs font-semibold transition-all cursor-pointer border ${
                formData.type === 'found'
                  ? 'bg-[#121E16] text-[#4ADE80] border-[#4ADE80]/40 shadow-xs'
                  : 'bg-[#0F1114] text-[#7C8592] border-[#1E2228]'
              }`}
            >
              I Found Something
            </button>
          </div>

          <div>
            <label className="block text-xs font-semibold text-[#7C8592] uppercase mb-1.5">
              Item Name / Title
            </label>
            <input
              type="text"
              required
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              placeholder="e.g. Casio fx-991EX Calculator with black pouch"
              className="w-full px-4 py-2.5 bg-[#0F1114] border border-[#1E2228] rounded-xl text-sm text-white placeholder-[#687280] focus:outline-none focus:border-[#383F4D]"
            />
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
                <option value="electronics">Electronics</option>
                <option value="id-card">ID Card</option>
                <option value="keys">Keys</option>
                <option value="books">Books</option>
                <option value="accessories">Accessories</option>
                <option value="clothing">Clothing</option>
                <option value="other">Other</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-[#7C8592] uppercase mb-1.5">
                Campus Location
              </label>
              <input
                type="text"
                value={formData.location}
                onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                placeholder="e.g. Central Library, 2nd Fl"
                className="w-full px-4 py-2.5 bg-[#0F1114] border border-[#1E2228] rounded-xl text-sm text-white placeholder-[#687280] focus:outline-none focus:border-[#383F4D]"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-[#7C8592] uppercase mb-1.5">
              Contact Info (Phone, WhatsApp, or Hostel Room)
            </label>
            <input
              type="text"
              value={formData.contact}
              onChange={(e) => setFormData({ ...formData, contact: e.target.value })}
              placeholder="e.g. +91 9876543210 or Room 204 B-Block"
              className="w-full px-4 py-2.5 bg-[#0F1114] border border-[#1E2228] rounded-xl text-sm text-white placeholder-[#687280] focus:outline-none focus:border-[#383F4D]"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-[#7C8592] uppercase mb-1.5">
              Description
            </label>
            <textarea
              rows={2}
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              placeholder="Distinctive marks, stickers, color, time seen..."
              className="w-full px-4 py-2.5 bg-[#0F1114] border border-[#1E2228] rounded-xl text-sm text-white placeholder-[#687280] focus:outline-none focus:border-[#383F4D]"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-[#7C8592] uppercase mb-1.5">
              Upload Photo (Optional)
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
              {actionLoading ? 'Submitting...' : 'Post Report'}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
