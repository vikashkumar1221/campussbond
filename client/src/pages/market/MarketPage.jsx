import React, { useState, useEffect, useRef } from 'react';
import { useSearchParams } from 'react-router-dom';
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
  const [searchParams, setSearchParams] = useSearchParams();
  const urlCategory = searchParams.get('category') || '';
  const urlIsMyListings = searchParams.get('myListings') === 'true' || urlCategory === 'my-listings';

  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [categoryFilter, setCategoryFilter] = useState(urlIsMyListings ? '' : urlCategory);
  const [conditionFilter, setConditionFilter] = useState('');
  const [search, setSearch] = useState('');
  const [onlyMyListings, setOnlyMyListings] = useState(urlIsMyListings);

  // Keep state in sync with URL searchParams
  useEffect(() => {
    const cat = searchParams.get('category') || '';
    const isMy = searchParams.get('myListings') === 'true' || cat === 'my-listings';
    if (isMy) {
      setOnlyMyListings(true);
      setCategoryFilter('');
    } else {
      setOnlyMyListings(false);
      setCategoryFilter(cat);
    }
  }, [searchParams]);

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
    <div className="w-full max-w-7xl xl:max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-5">
      {/* ─── Search & Actions Bar (Matching Home) ─── */}
      <div className="flex flex-col sm:flex-row gap-3 items-stretch sm:items-center justify-between">
        <div className="relative flex-1 w-full group">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 dark:text-slate-500 group-hover:text-gray-600 dark:group-hover:text-slate-300 transition-colors" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search textbooks, notes, electronics, lab kits, calculators..."
            className="w-full pl-11 pr-5 py-3 sm:py-3.5 bg-white dark:bg-[#0E1626] border border-gray-200 dark:border-slate-800 hover:border-gray-400 dark:hover:border-slate-600 focus:border-[#0B1528] dark:focus:border-blue-500 rounded-2xl text-xs sm:text-sm text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-slate-500 focus:outline-none transition-all duration-200 shadow-2xs hover:shadow-sm"
          />
        </div>

        <button
          onClick={() => setModalOpen(true)}
          title="Sell Item"
          className="flex items-center justify-center gap-2 px-6 py-3 sm:py-3.5 rounded-2xl bg-[#0B1528] dark:bg-blue-600 hover:bg-black dark:hover:bg-blue-500 text-white text-xs sm:text-sm font-bold tracking-tight whitespace-nowrap transition-all duration-200 cursor-pointer flex-shrink-0 active:scale-98 shadow-sm hover:shadow-md"
        >
          <Plus className="w-4 h-4 stroke-[3]" />
          <span>Sell Item</span>
        </button>
      </div>

      {/* ─── Market Feed (Full Width, Matching Home) ─── */}
      <div className="w-full space-y-4">
        {loading ? (
          <LoadingSpinner message="Loading campus marketplace..." />
        ) : displayedItems.length === 0 ? (
          <div className="bg-white border border-gray-300 rounded-3xl p-12 text-center space-y-4 shadow-xs">
            <div className="w-14 h-14 rounded-2xl bg-gray-100 border border-gray-200 text-gray-700 flex items-center justify-center mx-auto shadow-xs">
              <ShoppingBag className="w-7 h-7" />
            </div>
            <h3 className="font-display text-lg font-bold text-gray-950 tracking-tight">
              {onlyMyListings ? 'No listings found' : 'No items found'}
            </h3>
            <p className="text-xs sm:text-sm text-gray-500 max-w-sm mx-auto font-normal">
              {onlyMyListings
                ? 'You have not listed any items for sale yet.'
                : 'Try adjusting your search keywords or topic filter.'}
            </p>
            {onlyMyListings ? (
              <button
                onClick={() => setOnlyMyListings(false)}
                className="font-display inline-flex items-center gap-2 px-5 py-2.5 rounded-2xl bg-[#0B1528] dark:bg-blue-600 hover:bg-black dark:hover:bg-blue-500 text-white font-bold text-xs sm:text-sm tracking-tight transition-all shadow-md cursor-pointer active:scale-95"
              >
                Browse All Items
              </button>
            ) : (
              <button
                onClick={() => setModalOpen(true)}
                className="font-display inline-flex items-center gap-2 px-5 py-2.5 rounded-2xl bg-[#0B1528] dark:bg-blue-600 hover:bg-black dark:hover:bg-blue-500 text-white font-bold text-xs sm:text-sm tracking-tight transition-all shadow-md cursor-pointer active:scale-95"
              >
                <Plus className="w-4 h-4 stroke-[3]" /> Sell Item
              </button>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-5 w-full">
            {displayedItems.map((item) => {
              const isSeller = Boolean(
                user && String(item.seller?._id || item.seller) === String(user._id)
              );

              return (
                <div
                  key={item._id}
                  onClick={() => setSelectedItem(item)}
                  className="bg-white dark:bg-[#0E1626] border border-gray-300 dark:border-slate-800/90 hover:border-gray-400 dark:hover:border-slate-700 rounded-2xl sm:rounded-3xl overflow-hidden transition-all duration-300 ease-out flex flex-col justify-between shadow-xs hover:shadow-xl hover:-translate-y-1 group cursor-pointer relative"
                >
                  {/* Top Image Preview */}
                  <div className="h-44 sm:h-48 w-full bg-gray-100 dark:bg-slate-800/50 overflow-hidden relative border-b border-gray-100 dark:border-slate-800 flex items-center justify-center">
                    {item.image ? (
                      <img
                        src={item.image.startsWith('http') ? item.image : `${item.image}`}
                        alt={item.title}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                      />
                    ) : (
                      <div className="flex flex-col items-center justify-center text-gray-400 dark:text-slate-500 gap-1.5 p-4 text-center">
                        <ShoppingBag className="w-8 h-8 stroke-[1.5] text-gray-400 dark:text-slate-500" />
                        <span className="text-[10.5px] font-semibold text-gray-400 dark:text-slate-500 uppercase tracking-wider">
                          {item.category}
                        </span>
                      </div>
                    )}

                    {/* Overlay Badges */}
                    <div className="absolute top-3 left-3 right-3 flex items-center justify-between gap-1.5 pointer-events-none">
                      <span className="font-mono-code text-[10px] font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-full bg-white/95 dark:bg-slate-900/90 backdrop-blur-sm text-gray-800 dark:text-slate-200 border border-gray-200/80 dark:border-slate-700 shadow-xs">
                        {item.category}
                      </span>
                      {item.status === 'sold' ? (
                        <span className="font-mono-code text-[10px] font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-full bg-rose-600 text-white shadow-xs">
                          Sold
                        </span>
                      ) : (
                        <span className="font-mono-code text-[10px] font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-full bg-white/95 dark:bg-slate-900/90 backdrop-blur-sm text-gray-700 dark:text-slate-300 border border-gray-200/80 dark:border-slate-700 shadow-xs capitalize">
                          {item.condition}
                        </span>
                      )}
                    </div>

                    {item.status === 'sold' && (
                      <div className="absolute inset-0 bg-black/50 backdrop-blur-[1px] flex items-center justify-center">
                        <span className="text-xs font-bold uppercase tracking-widest text-white border border-white/30 px-3 py-1.5 rounded-xl bg-gray-900/90 shadow-md">
                          SOLD
                        </span>
                      </div>
                    )}
                  </div>

                  {/* Card Content */}
                  <div className="p-4 sm:p-5 flex-1 flex flex-col justify-between space-y-3">
                    <div>
                      <div className="flex items-baseline justify-between gap-2">
                        <span className="font-mono-code text-xl sm:text-2xl font-black text-[#0B1528] dark:text-blue-400 tracking-tight">
                          ₹{item.price}
                        </span>
                      </div>

                      <h3
                        className="font-bold text-sm sm:text-base text-gray-950 dark:text-white group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors leading-snug tracking-tight mt-1 line-clamp-2"
                        title={item.title}
                      >
                        {item.title}
                      </h3>

                      {item.description && (
                        <p className="text-xs text-gray-500 dark:text-slate-400 line-clamp-2 font-normal mt-1 leading-relaxed">
                          {item.description}
                        </p>
                      )}
                    </div>

                    {/* Bottom Footer: Seller Info & Actions */}
                    <div className="pt-3 border-t border-gray-100 dark:border-slate-800 flex items-center justify-between gap-2 text-xs text-gray-500 dark:text-slate-400 mt-auto">
                      <div className="flex items-center gap-2 min-w-0">
                        <div className="w-7 h-7 rounded-full bg-gray-100 dark:bg-slate-800 border border-gray-300 dark:border-slate-700 flex items-center justify-center font-bold text-gray-700 dark:text-slate-300 flex-shrink-0 text-[11px] shadow-2xs">
                          {item.seller?.name ? item.seller.name[0].toUpperCase() : 'S'}
                        </div>
                        <div className="min-w-0">
                          <p className="font-semibold text-gray-900 dark:text-white text-xs truncate">
                            {item.seller?.name || 'Campus Student'}
                          </p>
                          <p className="text-[10px] text-gray-400 dark:text-slate-500 truncate">
                            {item.createdAt ? new Date(item.createdAt).toLocaleDateString() : 'Recently'}
                          </p>
                        </div>
                      </div>

                      <div
                        className="flex items-center gap-1.5 flex-shrink-0"
                        onClick={(e) => e.stopPropagation()}
                      >
                        {item.contact ? (
                          <a
                            href={`tel:${item.contact.replace(/[^0-9+]/g, '')}`}
                            className="p-2 rounded-xl bg-[#0B1528] dark:bg-blue-600 hover:bg-black dark:hover:bg-blue-500 text-white shadow-xs transition-all cursor-pointer active:scale-95 flex items-center justify-center"
                            title={`Call: ${item.contact}`}
                          >
                            <Phone className="w-3.5 h-3.5" />
                          </a>
                        ) : null}

                        {isSeller && (
                          <button
                            onClick={() => handleToggleStatus(item)}
                            className={`px-2.5 py-1.5 rounded-lg text-[10.5px] font-bold transition-all cursor-pointer border ${
                              item.status === 'sold'
                                ? 'bg-gray-100 dark:bg-slate-800 text-gray-700 dark:text-slate-300 border-gray-200 dark:border-slate-700 hover:bg-gray-200'
                                : 'bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800/60 hover:bg-emerald-100'
                            }`}
                            title={item.status === 'sold' ? 'Mark Available' : 'Mark Sold'}
                          >
                            {item.status === 'sold' ? 'Avail' : 'Sold'}
                          </button>
                        )}

                        {isSeller && (
                          <button
                            onClick={() => handleDelete(item)}
                            className="p-1.5 rounded-lg text-gray-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/40 transition-colors cursor-pointer"
                            title="Delete"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

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
              <div className="w-full bg-gray-100 rounded-2xl overflow-hidden border border-gray-200 relative flex items-center justify-center max-h-80 sm:max-h-96">
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
                  <div className="py-16 flex flex-col items-center justify-center text-gray-400 gap-2">
                    <ShoppingBag className="w-12 h-12" />
                    <span className="text-xs">No image available</span>
                  </div>
                )}

                {/* Sold Overlay */}
                {selectedItem.status === 'sold' && (
                  <div className="absolute inset-0 bg-black/60 backdrop-blur-[2px] flex items-center justify-center">
                    <span className="text-sm font-bold uppercase tracking-widest text-white border border-white/30 px-4 py-2 rounded-xl bg-gray-900/90 shadow-lg">
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
                      className={`px-2.5 py-1 rounded-lg text-xs font-bold uppercase tracking-wider border ${
                        selectedItem.status === 'sold'
                          ? 'bg-gray-100 text-gray-500 border-gray-200'
                          : 'bg-emerald-50 text-emerald-700 border-emerald-200'
                      }`}
                    >
                      {selectedItem.status === 'sold' ? 'Sold' : 'Available'}
                    </span>

                    <span className="px-2.5 py-1 rounded-lg text-xs font-semibold uppercase tracking-wider text-gray-700 bg-gray-100 border border-gray-200">
                      {selectedItem.category}
                    </span>

                    <span className="px-2.5 py-1 rounded-lg text-xs font-semibold uppercase tracking-wider text-gray-700 bg-gray-100 border border-gray-200">
                      Condition: {selectedItem.condition}
                    </span>
                  </div>

                  <div className="text-2xl font-black text-white bg-[#0B1528] px-4 py-1.5 rounded-xl shadow-xs">
                    ₹{selectedItem.price}
                  </div>
                </div>

                <h2 className="text-xl sm:text-2xl font-bold text-gray-950 leading-tight">
                  {selectedItem.title}
                </h2>

                <div className="flex items-center gap-2 text-xs text-gray-500">
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
                <div className="text-[11px] font-bold uppercase tracking-wider text-gray-500">
                  Description
                </div>
                <div className="bg-gray-50 p-4 rounded-xl border border-gray-200 text-sm text-gray-800 leading-relaxed whitespace-pre-wrap">
                  {selectedItem.description || 'No description was provided for this item.'}
                </div>
              </div>

              {/* Seller Information */}
              <div className="space-y-1.5">
                <div className="text-[11px] font-bold uppercase tracking-wider text-gray-500">
                  Seller Information
                </div>
                <div className="bg-gray-50 p-4 rounded-xl border border-gray-200 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div className="flex items-center gap-3">
                    <div className="w-11 h-11 rounded-xl bg-gray-200 border border-gray-300 flex items-center justify-center text-gray-900 font-bold text-base flex-shrink-0">
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
                      <div className="font-bold text-gray-950 text-sm">
                        {selectedItem.seller?.name || 'Campus Student'}
                      </div>
                      <div className="text-xs text-gray-500">
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
                          className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-emerald-50 hover:bg-emerald-100 text-emerald-700 border border-emerald-200 text-xs font-bold transition-all cursor-pointer shadow-xs"
                          title="Chat on WhatsApp"
                        >
                          <MessageCircle className="w-4 h-4" />
                          <span>WhatsApp</span>
                        </a>
                      )}
                      <a
                        href={`tel:${cleanPhone}`}
                        className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-[#0B1528] hover:bg-black text-white text-xs font-bold transition-all cursor-pointer shadow-xs"
                      >
                        <Phone className="w-3.5 h-3.5" />
                        <span>Call</span>
                      </a>
                    </div>
                  )}
                </div>
              </div>

              {/* Modal Footer Actions */}
              <div className="pt-2 border-t border-gray-200 flex items-center justify-between gap-3 flex-wrap">
                {isSeller ? (
                  <div className="flex items-center gap-2 flex-wrap">
                    <button
                      type="button"
                      disabled={actionLoading}
                      onClick={() => handleToggleStatus(selectedItem)}
                      className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-gray-100 hover:bg-gray-200 text-gray-800 border border-gray-200 text-xs font-semibold transition-all cursor-pointer"
                    >
                      <CheckCircle2 className="w-3.5 h-3.5 text-gray-500" />
                      <span>{selectedItem.status === 'sold' ? 'Mark Available' : 'Mark as Sold'}</span>
                    </button>

                    <button
                      type="button"
                      disabled={actionLoading}
                      onClick={() => handleDelete(selectedItem)}
                      className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-rose-50 hover:bg-rose-100 text-rose-600 border border-rose-200 text-xs font-semibold transition-all cursor-pointer"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                      <span>Delete</span>
                    </button>
                  </div>
                ) : (
                  <div className="text-[11px] text-gray-500">
                    Campus Safety: Exchange goods in public campus spaces.
                  </div>
                )}

                <button
                  type="button"
                  onClick={() => setSelectedItem(null)}
                  className="px-4 py-2 rounded-xl text-xs font-semibold text-gray-700 hover:bg-gray-100 bg-white border border-gray-200 cursor-pointer ml-auto"
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
            <label className="block text-xs font-bold text-gray-600 uppercase mb-1.5">
              Title
            </label>
            <input
              type="text"
              required
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              placeholder="e.g. Engineering Mathematics by B.S. Grewal"
              className="w-full px-4 py-2.5 bg-white border-2 border-gray-200 focus:border-[#0B1528] rounded-xl text-sm text-gray-900 placeholder-gray-400 focus:outline-none"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-gray-600 uppercase mb-1.5">
                Price (₹)
              </label>
              <input
                type="number"
                min={0}
                required
                value={formData.price}
                onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                placeholder="350"
                className="w-full px-4 py-2.5 bg-white border-2 border-gray-200 focus:border-[#0B1528] rounded-xl text-sm text-gray-900 placeholder-gray-400 focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-gray-600 uppercase mb-1.5">
                Condition
              </label>
              <select
                value={formData.condition}
                onChange={(e) => setFormData({ ...formData, condition: e.target.value })}
                className="w-full px-4 py-2.5 bg-white border-2 border-gray-200 focus:border-[#0B1528] rounded-xl text-sm text-gray-900 focus:outline-none cursor-pointer"
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
              <label className="block text-xs font-bold text-gray-600 uppercase mb-1.5">
                Category
              </label>
              <select
                value={formData.category}
                onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                className="w-full px-4 py-2.5 bg-white border-2 border-gray-200 focus:border-[#0B1528] rounded-xl text-sm text-gray-900 focus:outline-none cursor-pointer"
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
              <label className="block text-xs font-bold text-gray-600 uppercase mb-1.5">
                Contact Phone / WhatsApp
              </label>
              <input
                type="text"
                value={formData.contact}
                onChange={(e) => setFormData({ ...formData, contact: e.target.value })}
                placeholder="+91 98765 43210"
                className="w-full px-4 py-2.5 bg-white border-2 border-gray-200 focus:border-[#0B1528] rounded-xl text-sm text-gray-900 placeholder-gray-400 focus:outline-none"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-gray-600 uppercase mb-1.5">
              Description
            </label>
            <textarea
              rows={2}
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              placeholder="Item details, meeting spot, etc..."
              className="w-full px-4 py-2.5 bg-white border-2 border-gray-200 focus:border-[#0B1528] rounded-xl text-sm text-gray-900 placeholder-gray-400 focus:outline-none"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-gray-600 uppercase mb-1.5">
              Photo (Optional)
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
              className="px-6 py-2 rounded-xl text-xs font-bold bg-[#0B1528] hover:bg-black text-white transition-all disabled:opacity-50 cursor-pointer shadow-md"
            >
              {actionLoading ? 'Listing...' : 'List Item'}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
