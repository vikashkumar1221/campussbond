import React, { useState, useEffect } from 'react';
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
} from 'lucide-react';

export default function MarketPage() {
  const { user } = useAuth();

  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [categoryFilter, setCategoryFilter] = useState('');
  const [conditionFilter, setConditionFilter] = useState('');
  const [search, setSearch] = useState('');

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
    <div className="max-w-7xl xl:max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8 space-y-6">
      {/* Header Banner */}
      <div className="bg-[#1A1D21] border border-[#282D33] rounded-2xl sm:rounded-3xl p-6 sm:p-8 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-5 shadow-xl relative overflow-hidden">
        <div className="space-y-2 relative z-10">
          <span className="text-[10px] sm:text-[11px] font-bold uppercase tracking-wider text-[#E58A3C] bg-[#2A2014] px-2.5 py-0.5 rounded-full border border-[#E58A3C]/30">
            Student Marketplace
          </span>
          <h1 className="text-xl sm:text-2xl lg:text-3xl font-extrabold text-white">
            Buy & Sell Within Campus
          </h1>
          <p className="text-xs sm:text-sm text-[#8A94A0] max-w-xl leading-relaxed">
            Pass down lab coats, engineering drafters, semester reference books, or dorm essentials to juniors without middlemen or courier fees.
          </p>
        </div>

        <button
          onClick={() => setModalOpen(true)}
          className="w-full sm:w-auto flex items-center justify-center gap-2 px-5 py-3 rounded-xl sm:rounded-2xl bg-[#E58A3C] hover:bg-[#D97724] text-white font-bold text-xs sm:text-sm transition-all shadow-md shadow-[#E58A3C]/20 flex-shrink-0 cursor-pointer"
        >
          <Plus className="w-4 h-4 sm:w-5 sm:h-5" />
          <span>Sell an Item</span>
        </button>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-col sm:flex-row gap-3 items-center justify-between">
        <div className="relative flex-1 w-full">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#8A94A0]" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search books, drafters, notes, calculators..."
            className="w-full pl-9 pr-4 py-2.5 bg-[#1A1D21] border border-[#282D33] rounded-2xl text-xs text-white placeholder-[#8A94A0]/60 focus:outline-none focus:border-[#E58A3C] shadow-xs"
          />
        </div>

        {/* Condition Filter */}
        <select
          value={conditionFilter}
          onChange={(e) => setConditionFilter(e.target.value)}
          className="px-3 py-2.5 bg-[#1A1D21] border border-[#282D33] rounded-2xl text-xs text-white focus:outline-none focus:border-[#E58A3C] shadow-xs cursor-pointer"
        >
          <option value="">Any Condition</option>
          <option value="new">Brand New</option>
          <option value="like-new">Like New</option>
          <option value="good">Good Condition</option>
          <option value="fair">Fair / Usable</option>
        </select>
      </div>

      {/* Category Chips */}
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
        <LoadingSpinner message="Loading marketplace items..." />
      ) : items.length === 0 ? (
        <div className="bg-[#1A1D21] border border-[#282D33] rounded-3xl p-12 text-center space-y-4 shadow-md">
          <ShoppingBag className="w-10 h-10 text-[#8A94A0] mx-auto" />
          <h3 className="text-lg font-bold text-white">No items found</h3>
          <p className="text-sm text-[#8A94A0]">Try searching with a different keyword or category.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {items.map((item) => {
            const isSeller = user && (item.seller?._id || item.seller) === user._id;

            return (
              <div
                key={item._id}
                className="bg-[#1A1D21] border border-[#282D33] rounded-3xl overflow-hidden hover:border-[#383F47] hover:shadow-lg transition-all flex flex-col justify-between group shadow-sm"
              >
                <div>
                  {/* Photo if available */}
                  <div className="h-52 w-full bg-[#131518] relative overflow-hidden flex items-center justify-center">
                    {item.image ? (
                      <img
                        src={item.image.startsWith('http') ? item.image : `${item.image}`}
                        alt={item.title}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                      />
                    ) : (
                      <ShoppingBag className="w-12 h-12 text-[#282D33]" />
                    )}

                    {/* Price tag */}
                    <div className="absolute top-3 left-3 bg-[#1A1D21]/95 backdrop-blur-md px-3 py-1 rounded-full border border-[#282D33] text-sm font-black text-[#F59E0B] shadow-sm">
                      ₹{item.price}
                    </div>

                    {/* Condition badge */}
                    <div className="absolute top-3 right-3 bg-[#1A1D21]/95 backdrop-blur-md px-2.5 py-0.5 rounded-full text-[10px] font-semibold text-[#8A94A0] capitalize border border-[#282D33] shadow-xs">
                      {item.condition}
                    </div>

                    {item.status === 'sold' && (
                      <div className="absolute inset-0 bg-black/70 backdrop-blur-xs flex items-center justify-center">
                        <span className="text-sm font-extrabold uppercase tracking-widest text-rose-300 border-2 border-rose-400 px-4 py-1.5 rounded-xl rotate-[-12deg] bg-black/50">
                          SOLD OUT
                        </span>
                      </div>
                    )}
                  </div>

                  {/* Body */}
                  <div className="p-5 space-y-2">
                    <div className="flex items-center justify-between text-xs text-[#8A94A0]">
                      <span className="uppercase font-semibold text-[10px] text-[#60A5FA] bg-[#162238] border border-[#60A5FA]/20 px-2 py-0.5 rounded-full">
                        {item.category}
                      </span>
                      <span>{new Date(item.createdAt).toLocaleDateString()}</span>
                    </div>

                    <h3 className="font-bold text-base text-white group-hover:text-[#E58A3C] transition-colors line-clamp-1">{item.title}</h3>
                    {item.description && (
                      <p className="text-xs text-[#8A94A0] line-clamp-2 leading-relaxed">
                        {item.description}
                      </p>
                    )}

                    {/* Seller details */}
                    <div className="pt-2 flex items-center justify-between text-xs">
                      <span className="text-[#8A94A0]">
                        Sold by <span className="text-white font-semibold">{item.seller?.name || 'Student'}</span>
                      </span>
                      {item.contact && (
                        <div className="flex items-center gap-1 text-[#E58A3C] font-semibold">
                          <Phone className="w-3.5 h-3.5" />
                          <span>{item.contact}</span>
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                {/* Footer Controls */}
                <div className="p-5 pt-3 border-t border-[#252A30] flex items-center justify-between">
                  <span
                    className={`text-[11px] font-bold px-2.5 py-0.5 rounded-full capitalize border ${
                      item.status === 'sold'
                        ? 'bg-[#131518] text-[#8A94A0] border-[#282D33]'
                        : 'bg-[#18261F] text-[#4ADE80] border-[#4ADE80]/30'
                    }`}
                  >
                    {item.status === 'sold' ? 'Sold' : 'Available'}
                  </span>

                  {isSeller && (
                    <div className="flex items-center gap-1.5">
                      <button
                        onClick={() => handleToggleStatus(item._id, item.status)}
                        className="px-2.5 py-1 rounded-lg text-[11px] font-semibold bg-[#23272D] hover:bg-[#2C323A] text-white border border-[#282D33] cursor-pointer"
                      >
                        {item.status === 'sold' ? 'Mark Available' : 'Mark Sold'}
                      </button>
                      <button
                        onClick={() => handleDelete(item._id)}
                        className="p-1.5 rounded-lg text-[#F87171] hover:bg-[#2B1818] cursor-pointer"
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
            <label className="block text-xs font-semibold text-[#8A94A0] uppercase mb-1.5">
              Item Title
            </label>
            <input
              type="text"
              required
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              placeholder="e.g. Higher Engineering Mathematics by B.S. Grewal (44th Ed)"
              className="w-full px-4 py-2.5 bg-[#131518] border border-[#282D33] rounded-xl text-sm text-white placeholder-[#8A94A0]/50 focus:outline-none focus:border-[#E58A3C]"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-[#8A94A0] uppercase mb-1.5">
                Selling Price (₹)
              </label>
              <input
                type="number"
                min={0}
                required
                value={formData.price}
                onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                placeholder="350"
                className="w-full px-4 py-2.5 bg-[#131518] border border-[#282D33] rounded-xl text-sm text-white placeholder-[#8A94A0]/50 focus:outline-none focus:border-[#E58A3C]"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-[#8A94A0] uppercase mb-1.5">
                Condition
              </label>
              <select
                value={formData.condition}
                onChange={(e) => setFormData({ ...formData, condition: e.target.value })}
                className="w-full px-4 py-2.5 bg-[#131518] border border-[#282D33] rounded-xl text-sm text-white focus:outline-none focus:border-[#E58A3C] cursor-pointer"
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
              <label className="block text-xs font-semibold text-[#8A94A0] uppercase mb-1.5">
                Category
              </label>
              <select
                value={formData.category}
                onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                className="w-full px-4 py-2.5 bg-[#131518] border border-[#282D33] rounded-xl text-sm text-white focus:outline-none focus:border-[#E58A3C] cursor-pointer"
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
              <label className="block text-xs font-semibold text-[#8A94A0] uppercase mb-1.5">
                Contact Phone / WhatsApp
              </label>
              <input
                type="text"
                value={formData.contact}
                onChange={(e) => setFormData({ ...formData, contact: e.target.value })}
                placeholder="+91 9876543210"
                className="w-full px-4 py-2.5 bg-[#131518] border border-[#282D33] rounded-xl text-sm text-white placeholder-[#8A94A0]/50 focus:outline-none focus:border-[#E58A3C]"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-[#8A94A0] uppercase mb-1.5">
              Description / Notes
            </label>
            <textarea
              rows={2}
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              placeholder="Book condition, includes CD, can meet at college canteen..."
              className="w-full px-4 py-2.5 bg-[#131518] border border-[#282D33] rounded-xl text-sm text-white placeholder-[#8A94A0]/50 focus:outline-none focus:border-[#E58A3C]"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-[#8A94A0] uppercase mb-1.5">
              Item Photo (Optional)
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
              {actionLoading ? 'Listing...' : 'List for Sale'}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
