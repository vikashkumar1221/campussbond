import React, { useState, useEffect, useRef } from 'react';
import { useSearchParams } from 'react-router-dom';
import { lostFoundService } from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import { useSearch } from '../../context/SearchContext';
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
  const { searchQuery: search, debouncedSearch, setSearchQuery } = useSearch();
  const [searchParams, setSearchParams] = useSearchParams();
  const urlType = searchParams.get('type') || '';
  const urlCategory = searchParams.get('category') || '';

  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [typeFilter, setTypeFilter] = useState(urlType);
  const [categoryFilter, setCategoryFilter] = useState(urlCategory);

  // Keep state in sync with URL searchParams
  useEffect(() => {
    const t = searchParams.get('type') || '';
    const c = searchParams.get('category') || '';
    setTypeFilter(t);
    setCategoryFilter(c);
  }, [searchParams]);
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


  return (
    <div className="w-full max-w-7xl xl:max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-5">
      {/* ─── Type Filter Pills & Report Item Button ─── */}
      <div className="flex flex-col sm:flex-row gap-3 items-stretch sm:items-center justify-between">
        <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar py-0.5">
          {[
            { label: 'All Reports', value: '' },
            { label: 'Lost Items', value: 'lost' },
            { label: 'Found Items', value: 'found' },
          ].map((tab) => {
            const isSelected = typeFilter === tab.value;
            return (
              <button
                key={tab.value}
                type="button"
                onClick={() => setTypeFilter(tab.value)}
                className={`px-4 py-2 rounded-full text-xs sm:text-sm font-semibold whitespace-nowrap transition-all cursor-pointer ${
                  isSelected
                    ? 'bg-[#BCB5A3] text-[#1D1819] shadow-xs'
                    : 'bg-white dark:bg-[#0E1626] text-gray-600 dark:text-slate-300 border border-gray-200 dark:border-slate-800 hover:border-gray-300 dark:hover:border-slate-700 hover:text-gray-900 dark:hover:text-white'
                }`}
              >
                {tab.label}
              </button>
            );
          })}
        </div>

        <button
          onClick={() => setModalOpen(true)}
          title="Report Item"
          className="flex items-center justify-center gap-2 px-5 py-2.5 rounded-full bg-[#E95E38] hover:bg-[#D7522D] text-white text-xs sm:text-sm font-bold tracking-tight whitespace-nowrap transition-all duration-200 cursor-pointer flex-shrink-0 active:scale-98 shadow-sm hover:shadow-md"
        >
          <Plus className="w-4 h-4 stroke-[3]" />
          <span>Report Item</span>
        </button>
      </div>

      {/* Active Search Filter Banner */}
      {search && (
        <div className="flex items-center justify-between px-4 py-2 rounded-2xl bg-[#BCB5A3]/20 border border-[#BCB5A3]/40 text-xs sm:text-sm text-[#1D1819] dark:text-amber-200">
          <div className="flex items-center gap-2">
            <Search className="w-3.5 h-3.5 text-[#1D1819] dark:text-amber-300" />
            <span>Showing results for: <strong>"{search}"</strong></span>
          </div>
          <button
            onClick={() => setSearchQuery('')}
            className="text-xs font-bold underline hover:opacity-80 cursor-pointer"
          >
            Clear
          </button>
        </div>
      )}

      {/* ─── Reports Feed (Full Width, Matching Home) ─── */}
      <div className="w-full space-y-4">
        {loading ? (
          <LoadingSpinner message="Loading lost & found reports..." />
        ) : items.length === 0 ? (
          <div className="bg-white border border-gray-300 rounded-3xl p-12 text-center space-y-4 shadow-xs">
            <div className="w-14 h-14 rounded-2xl bg-gray-100 border border-gray-200 text-gray-700 flex items-center justify-center mx-auto shadow-xs">
              <Search className="w-7 h-7" />
            </div>
            <h3 className="font-display text-lg font-bold text-gray-950 tracking-tight">No reports found</h3>
            <p className="text-xs sm:text-sm text-gray-500 max-w-sm mx-auto font-normal">
              {search || categoryFilter || typeFilter
                ? 'Try adjusting your search keywords or topic filter.'
                : 'No items currently reported. You can post a report anytime.'}
            </p>
            <button
              onClick={() => setModalOpen(true)}
              className="font-display inline-flex items-center gap-2 px-5 py-2.5 rounded-2xl bg-[#0B1528] dark:bg-blue-600 hover:bg-black dark:hover:bg-blue-500 text-white font-bold text-xs sm:text-sm tracking-tight transition-all shadow-md cursor-pointer active:scale-95"
            >
              <Plus className="w-4 h-4 stroke-[3]" /> Report Item
            </button>
          </div>
        ) : (
          <div className="flex flex-col gap-4 sm:gap-5 w-full">
            {items.map((item) => {
              const isOwner = user && (item.createdBy?._id || item.createdBy) === user._id;

              return (
                <div
                  key={item._id}
                  className="w-full bg-white dark:bg-[#0E1626] border border-gray-300 dark:border-slate-800/90 hover:border-gray-400 dark:hover:border-slate-700 rounded-2xl sm:rounded-3xl p-6 sm:p-8 transition-all duration-300 ease-out space-y-4 sm:space-y-5 shadow-xs hover:shadow-xl hover:-translate-y-1 group cursor-pointer relative"
                >
                  {/* Top: Title & Type/Category Badges */}
                  <div className="flex items-start justify-between gap-4">
                    <div className="min-w-0">
                      <h3 className="font-bold text-lg sm:text-xl text-gray-950 dark:text-white group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors leading-snug tracking-tight truncate">
                        {item.title}
                      </h3>
                      {item.location && (
                        <div className="flex items-center gap-1.5 mt-1 text-xs text-gray-500 dark:text-slate-400 font-medium">
                          <MapPin className="w-3.5 h-3.5 text-gray-400 dark:text-slate-500 flex-shrink-0" />
                          <span>{item.location}</span>
                        </div>
                      )}
                    </div>

                    <div className="flex items-center gap-2 flex-shrink-0">
                      <span
                        className={`font-mono-code text-[10.5px] font-bold uppercase tracking-wider px-3 py-1 rounded-full border shadow-2xs ${
                          item.type === 'lost'
                            ? 'bg-amber-50 dark:bg-amber-950/40 text-amber-700 dark:text-amber-300 border-amber-200 dark:border-amber-800/60'
                            : 'bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800/60'
                        }`}
                      >
                        {item.type}
                      </span>
                      <span className="font-mono-code text-[10.5px] font-bold uppercase tracking-wider px-3 py-1 rounded-full border shadow-2xs bg-gray-100 dark:bg-slate-800 text-gray-700 dark:text-slate-300 border-gray-200 dark:border-slate-700">
                        {item.category}
                      </span>
                    </div>
                  </div>

                  {/* Photo if present */}
                  {item.image && (
                    <div className="h-48 sm:h-64 w-full rounded-2xl bg-gray-100 dark:bg-slate-800/50 overflow-hidden border border-gray-200/80 dark:border-slate-800">
                      <img
                        src={item.image.startsWith('http') ? item.image : `${item.image}`}
                        alt={item.title}
                        className="w-full h-full object-cover group-hover:scale-102 transition-transform duration-300"
                      />
                    </div>
                  )}

                  {/* Description */}
                  {item.description && (
                    <p className="text-sm text-gray-600 dark:text-slate-300 leading-relaxed font-normal">
                      {item.description}
                    </p>
                  )}

                  {/* Bottom Footer: Reporter Info & Actions */}
                  <div className="pt-4 sm:pt-5 border-t border-gray-100 dark:border-slate-800 flex items-center justify-between gap-4 text-xs text-gray-500 dark:text-slate-400">
                    <div className="flex items-center gap-2.5 min-w-0">
                      <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-gray-200 to-gray-100 dark:from-slate-700 dark:to-slate-800 border border-gray-300 dark:border-slate-700 flex items-center justify-center font-bold text-gray-700 dark:text-slate-300 flex-shrink-0 text-xs shadow-2xs">
                        {item.createdBy?.name ? item.createdBy.name[0].toUpperCase() : 'U'}
                      </div>
                      <div className="min-w-0">
                        <p className="font-semibold text-gray-900 dark:text-white truncate">
                          {item.createdBy?.name || 'Campus Student'}
                        </p>
                        <p className="text-[11px] text-gray-600 dark:text-slate-400 truncate">
                          {item.createdAt ? new Date(item.createdAt).toLocaleDateString() : 'Recently'}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 flex-shrink-0" onClick={(e) => e.stopPropagation()}>
                      {item.contact && (
                        <a
                          href={`tel:${item.contact.replace(/[^0-9+]/g, '')}`}
                          className="font-display inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold tracking-tight bg-[#0B1528] dark:bg-blue-600 hover:bg-black dark:hover:bg-blue-500 text-white shadow-xs hover:shadow-md transition-all cursor-pointer active:scale-95"
                        >
                          <Phone className="w-3.5 h-3.5" />
                          <span>Contact ({item.contact})</span>
                        </a>
                      )}

                      {isOwner && (
                        <button
                          onClick={() => handleToggleStatus(item._id, item.status)}
                          className={`px-3.5 py-2 rounded-xl text-xs font-semibold transition-all cursor-pointer border ${
                            item.status === 'resolved'
                              ? 'bg-gray-100 dark:bg-slate-800 text-gray-700 dark:text-slate-300 border-gray-200 dark:border-slate-700 hover:bg-gray-200'
                              : 'bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800/60 hover:bg-emerald-100'
                          }`}
                        >
                          {item.status === 'resolved' ? 'Reopen' : 'Mark Resolved'}
                        </button>
                      )}

                      {isOwner && (
                        <button
                          onClick={() => handleDelete(item._id)}
                          className="p-2 rounded-xl text-gray-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/40 transition-colors cursor-pointer"
                          title="Delete Report"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

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
              className={`flex-1 py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer border ${
                formData.type === 'lost'
                  ? 'bg-[#FDF2F8] text-[#D946EF] border-[#D946EF] shadow-xs'
                  : 'bg-white text-gray-600 border-gray-200 hover:bg-gray-50'
              }`}
            >
              I Lost Something
            </button>
            <button
              type="button"
              onClick={() => setFormData({ ...formData, type: 'found' })}
              className={`flex-1 py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer border ${
                formData.type === 'found'
                  ? 'bg-[#0B1528] text-white border-[#0B1528] shadow-xs'
                  : 'bg-white text-gray-600 border-gray-200 hover:bg-gray-50'
              }`}
            >
              I Found Something
            </button>
          </div>

          <div>
            <label className="block text-xs font-bold text-gray-600 uppercase mb-1.5">
              Item Name / Title
            </label>
            <input
              type="text"
              required
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              placeholder="e.g. Casio fx-991EX Calculator with black pouch"
              className="w-full px-4 py-2.5 bg-white border-2 border-gray-200 focus:border-[#0B1528] rounded-xl text-sm text-gray-900 placeholder-gray-400 focus:outline-none"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-gray-600 uppercase mb-1.5">
                Category
              </label>
              <select
                value={formData.category}
                onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                className="w-full px-4 py-2.5 bg-white border-2 border-gray-200 focus:border-[#0B1528] rounded-xl text-sm text-gray-900 focus:outline-none cursor-pointer"
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
              <label className="block text-xs font-bold text-gray-600 uppercase mb-1.5">
                Campus Location
              </label>
              <input
                type="text"
                value={formData.location}
                onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                placeholder="e.g. Central Library, 2nd Fl"
                className="w-full px-4 py-2.5 bg-white border-2 border-gray-200 focus:border-[#0B1528] rounded-xl text-sm text-gray-900 placeholder-gray-400 focus:outline-none"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-gray-600 uppercase mb-1.5">
              Contact Info (Phone, WhatsApp, or Hostel Room)
            </label>
            <input
              type="text"
              value={formData.contact}
              onChange={(e) => setFormData({ ...formData, contact: e.target.value })}
              placeholder="e.g. +91 9876543210 or Room 204 B-Block"
              className="w-full px-4 py-2.5 bg-white border-2 border-gray-200 focus:border-[#0B1528] rounded-xl text-sm text-gray-900 placeholder-gray-400 focus:outline-none"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-gray-600 uppercase mb-1.5">
              Description
            </label>
            <textarea
              rows={2}
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              placeholder="Distinctive marks, stickers, color, time seen..."
              className="w-full px-4 py-2.5 bg-white border-2 border-gray-200 focus:border-[#0B1528] rounded-xl text-sm text-gray-900 placeholder-gray-400 focus:outline-none"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-gray-600 uppercase mb-1.5">
              Upload Photo (Optional)
            </label>
            <input
              type="file"
              accept="image/*"
              onChange={(e) => setSelectedFile(e.target.files[0])}
              className="w-full text-xs text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-xl file:border-0 file:text-xs file:font-bold file:bg-gray-100 file:text-gray-800 hover:file:bg-gray-200 cursor-pointer"
            />
          </div>

          <div className="pt-2 flex justify-end gap-2">
            <button
              type="button"
              onClick={() => setModalOpen(false)}
              className="px-4 py-2 rounded-xl text-xs font-semibold text-gray-700 hover:bg-gray-100 bg-white border border-gray-200 cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={actionLoading}
              className="px-6 py-2.5 rounded-2xl text-xs font-bold bg-[#0B1528] hover:bg-black text-white transition-all disabled:opacity-50 cursor-pointer shadow-sm hover:shadow-md"
            >
              {actionLoading ? 'Submitting...' : 'Post Report'}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
