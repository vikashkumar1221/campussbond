import React, { useState, useEffect } from 'react';
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
} from 'lucide-react';

export default function LostFoundPage() {
  const { user } = useAuth();

  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [typeFilter, setTypeFilter] = useState(''); // '' | 'lost' | 'found'
  const [categoryFilter, setCategoryFilter] = useState('');
  const [search, setSearch] = useState('');

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
    <div className="max-w-7xl xl:max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8 space-y-6">
      {/* Top Banner */}
      <div className="bg-[#1A1D21] border border-[#282D33] rounded-2xl sm:rounded-3xl p-6 sm:p-8 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-5 shadow-xl relative overflow-hidden">
        <div className="space-y-2 relative z-10">
          <span className="text-[10px] sm:text-[11px] font-bold uppercase tracking-wider text-[#60A5FA] bg-[#162238] px-2.5 py-0.5 rounded-full border border-[#60A5FA]/30">
            Campus Care
          </span>
          <h1 className="text-xl sm:text-2xl lg:text-3xl font-extrabold text-white">
            Lost & Found Board
          </h1>
          <p className="text-xs sm:text-sm text-[#8A94A0] max-w-xl leading-relaxed">
            Lost your student ID, calculator, or water bottle? Report lost items or help fellow students recover belongings found on campus.
          </p>
        </div>

        <button
          onClick={() => setModalOpen(true)}
          className="w-full sm:w-auto flex items-center justify-center gap-2 px-5 py-3 rounded-xl sm:rounded-2xl bg-[#E58A3C] hover:bg-[#D97724] text-white font-bold text-xs sm:text-sm transition-all shadow-md shadow-[#E58A3C]/20 flex-shrink-0 cursor-pointer"
        >
          <Plus className="w-4 h-4 sm:w-5 sm:h-5" />
          <span>Report Item</span>
        </button>
      </div>

      {/* Tabs & Filters */}
      <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
        {/* Type Toggle: All / Lost / Found */}
        <div className="flex bg-[#1A1D21] p-1 rounded-2xl border border-[#282D33] shadow-xs">
          {[
            { label: 'All', value: '' },
            { label: 'Lost Items', value: 'lost' },
            { label: 'Found Items', value: 'found' },
          ].map((tab) => (
            <button
              key={tab.value}
              onClick={() => setTypeFilter(tab.value)}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                typeFilter === tab.value
                  ? 'bg-[#1E2228] text-white border border-[#3A414A] shadow-xs'
                  : 'text-[#8A94A0] hover:text-white'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Search */}
        <div className="relative w-full sm:w-72">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#8A94A0]" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by title or description..."
            className="w-full pl-9 pr-4 py-2 bg-[#1A1D21] border border-[#282D33] rounded-xl text-xs text-white placeholder-[#8A94A0]/60 focus:outline-none focus:border-[#E58A3C] shadow-xs"
          />
        </div>
      </div>

      {/* Categories chips */}
      <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-none">
        {categories.map((c) => (
          <button
            key={c.value}
            onClick={() => setCategoryFilter(c.value)}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all cursor-pointer ${
              categoryFilter === c.value
                ? 'bg-[#1E2228] text-white border border-[#3A414A] shadow-xs font-bold'
                : 'bg-[#1A1D21] border border-[#282D33] text-[#8A94A0] hover:text-white'
            }`}
          >
            {c.label}
          </button>
        ))}
      </div>

      {/* Grid */}
      {loading ? (
        <LoadingSpinner message="Loading lost & found reports..." />
      ) : items.length === 0 ? (
        <div className="bg-[#1A1D21] border border-[#282D33] rounded-3xl p-12 text-center space-y-4 shadow-md">
          <Search className="w-10 h-10 text-[#8A94A0] mx-auto" />
          <h3 className="text-lg font-bold text-white">No reports found</h3>
          <p className="text-sm text-[#8A94A0]">No items match the selected filters.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {items.map((item) => {
            const isOwner = user && (item.createdBy?._id || item.createdBy) === user._id;

            return (
              <div
                key={item._id}
                className="bg-[#1A1D21] border border-[#282D33] rounded-3xl overflow-hidden hover:border-[#383F47] hover:shadow-lg transition-all flex flex-col justify-between group shadow-sm"
              >
                <div>
                  {/* Photo if available */}
                  {item.image ? (
                    <div className="h-48 w-full bg-[#131518] relative overflow-hidden">
                      <img
                        src={item.image.startsWith('http') ? item.image : `${item.image}`}
                        alt={item.title}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                      />
                      <div className="absolute top-3 left-3">
                        <span
                          className={`text-[11px] font-black uppercase px-3 py-1 rounded-full shadow-md ${
                            item.type === 'lost'
                              ? 'bg-[#2B1818] text-[#FF6B6B] border border-[#FF6B6B]/30'
                              : 'bg-[#18261F] text-[#4ADE80] border border-[#4ADE80]/30'
                          }`}
                        >
                          {item.type}
                        </span>
                      </div>
                    </div>
                  ) : (
                    <div className="p-5 pb-0 flex items-center justify-between">
                      <span
                        className={`text-[11px] font-black uppercase px-3 py-1 rounded-full border ${
                          item.type === 'lost'
                            ? 'bg-[#2B1818] text-[#FF6B6B] border border-[#FF6B6B]/30'
                            : 'bg-[#18261F] text-[#4ADE80] border border-[#4ADE80]/30'
                        }`}
                      >
                        {item.type}
                      </span>
                      <span className="text-xs text-[#8A94A0] capitalize">{item.category}</span>
                    </div>
                  )}

                  {/* Body details */}
                  <div className="p-5 space-y-3">
                    <h3 className="font-bold text-base text-white group-hover:text-[#E58A3C] transition-colors">{item.title}</h3>
                    {item.description && (
                      <p className="text-xs text-[#8A94A0] line-clamp-3 leading-relaxed">
                        {item.description}
                      </p>
                    )}

                    <div className="space-y-1.5 pt-2 text-xs text-[#8A94A0]">
                      {item.location && (
                        <div className="flex items-center gap-1.5 text-[#60A5FA]">
                          <MapPin className="w-3.5 h-3.5 flex-shrink-0" />
                          <span>{item.location}</span>
                        </div>
                      )}
                      {item.contact && (
                        <div className="flex items-center gap-1.5 text-[#E58A3C] font-medium">
                          <Phone className="w-3.5 h-3.5 flex-shrink-0" />
                          <span>{item.contact}</span>
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                {/* Footer status / actions */}
                <div className="p-5 pt-3 border-t border-[#252A30] flex items-center justify-between">
                  <span
                    className={`text-[11px] font-bold px-2.5 py-0.5 rounded-full capitalize border ${
                      item.status === 'resolved'
                        ? 'bg-[#131518] text-[#8A94A0] border-[#282D33] line-through'
                        : 'bg-[#18261F] text-[#4ADE80] border-[#4ADE80]/30'
                    }`}
                  >
                    {item.status === 'resolved' ? 'Resolved' : 'Active Report'}
                  </span>

                  {isOwner && (
                    <div className="flex items-center gap-1.5">
                      <button
                        onClick={() => handleToggleStatus(item._id, item.status)}
                        className="px-2.5 py-1 rounded-lg text-[11px] font-semibold bg-[#23272D] hover:bg-[#2C323A] text-white border border-[#282D33] transition-colors cursor-pointer"
                      >
                        {item.status === 'resolved' ? 'Reopen' : 'Mark Resolved'}
                      </button>
                      <button
                        onClick={() => handleDelete(item._id)}
                        className="p-1.5 rounded-lg text-[#F87171] hover:bg-[#2B1818] transition-colors cursor-pointer"
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
              className={`flex-1 py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer border ${
                formData.type === 'lost'
                  ? 'bg-[#2B1818] text-[#FF6B6B] border-[#FF6B6B]/40 shadow-xs'
                  : 'bg-[#131518] text-[#8A94A0] border-[#282D33]'
              }`}
            >
              I Lost Something
            </button>
            <button
              type="button"
              onClick={() => setFormData({ ...formData, type: 'found' })}
              className={`flex-1 py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer border ${
                formData.type === 'found'
                  ? 'bg-[#18261F] text-[#4ADE80] border-[#4ADE80]/40 shadow-xs'
                  : 'bg-[#131518] text-[#8A94A0] border-[#282D33]'
              }`}
            >
              I Found Something
            </button>
          </div>

          <div>
            <label className="block text-xs font-semibold text-[#8A94A0] uppercase mb-1.5">
              Item Name / Title
            </label>
            <input
              type="text"
              required
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              placeholder="e.g. Casio fx-991EX Calculator with black pouch"
              className="w-full px-4 py-2.5 bg-[#131518] border border-[#282D33] rounded-xl text-sm text-white placeholder-[#8A94A0]/50 focus:outline-none focus:border-[#E58A3C]"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-[#8A94A0] uppercase mb-1.5">
                Category
              </label>
              <select
                value={formData.category}
                onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                className="w-full px-4 py-2.5 bg-[#131518] border border-[#282D33] rounded-xl text-sm text-white focus:outline-none focus:border-[#E58A3C] cursor-pointer"
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
              <label className="block text-xs font-semibold text-[#8A94A0] uppercase mb-1.5">
                Campus Location
              </label>
              <input
                type="text"
                value={formData.location}
                onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                placeholder="e.g. Central Library, 2nd Fl"
                className="w-full px-4 py-2.5 bg-[#131518] border border-[#282D33] rounded-xl text-sm text-white placeholder-[#8A94A0]/50 focus:outline-none focus:border-[#E58A3C]"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-[#8A94A0] uppercase mb-1.5">
              Contact Info (Phone, WhatsApp, or Hostel Room)
            </label>
            <input
              type="text"
              value={formData.contact}
              onChange={(e) => setFormData({ ...formData, contact: e.target.value })}
              placeholder="e.g. +91 9876543210 or Room 204 B-Block"
              className="w-full px-4 py-2.5 bg-[#131518] border border-[#282D33] rounded-xl text-sm text-white placeholder-[#8A94A0]/50 focus:outline-none focus:border-[#E58A3C]"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-[#8A94A0] uppercase mb-1.5">
              Description
            </label>
            <textarea
              rows={2}
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              placeholder="Distinctive marks, stickers, color, time seen..."
              className="w-full px-4 py-2.5 bg-[#131518] border border-[#282D33] rounded-xl text-sm text-white placeholder-[#8A94A0]/50 focus:outline-none focus:border-[#E58A3C]"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-[#8A94A0] uppercase mb-1.5">
              Upload Photo (Optional)
            </label>
            <input
              type="file"
              accept="image/*"
              onChange={(e) => setSelectedFile(e.target.files[0])}
              className="w-full text-xs text-[#8A94A0] file:mr-4 file:py-2 file:px-4 file:rounded-xl file:border-0 file:text-xs file:font-semibold file:bg-[#23272D] file:text-white hover:file:bg-[#2C323A] cursor-pointer"
            />
          </div>

          <div className="pt-2 flex justify-end gap-2">
            <button
              type="button"
              onClick={() => setModalOpen(false)}
              className="px-4 py-2 rounded-xl text-xs font-semibold text-[#8A94A0] hover:text-white bg-[#23272D] cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={actionLoading}
              className="px-6 py-2 rounded-xl text-xs font-bold bg-[#E58A3C] hover:bg-[#D97724] text-white transition-all shadow-md shadow-[#E58A3C]/20 disabled:opacity-50 cursor-pointer"
            >
              {actionLoading ? 'Submitting...' : 'Post Report'}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
