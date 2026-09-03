import React, { useState, useEffect } from 'react';
import { clubService } from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import Modal from '../../components/Modal';
import LoadingSpinner from '../../components/LoadingSpinner';
import {
  Users,
  Plus,
  Search,
  CheckCircle,
  UserPlus,
  UserMinus,
  Sparkles,
  Trash2,
} from 'lucide-react';

export default function ClubsPage() {
  const { user } = useAuth();

  const [clubs, setClubs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [categoryFilter, setCategoryFilter] = useState('');
  const [search, setSearch] = useState('');

  // Modal & form
  const [modalOpen, setModalOpen] = useState(false);
  const [actionLoading, setActionLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    category: 'tech',
  });
  const [selectedFile, setSelectedFile] = useState(null);

  const fetchClubs = async () => {
    try {
      setLoading(true);
      const params = {};
      if (categoryFilter) params.category = categoryFilter;
      if (search) params.search = search;
      const res = await clubService.getClubs(params);
      setClubs(res.data.clubs || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchClubs();
  }, [categoryFilter, search]);

  const handleCreate = async (e) => {
    e.preventDefault();
    try {
      setActionLoading(true);
      const data = new FormData();
      data.append('name', formData.name);
      data.append('description', formData.description);
      data.append('category', formData.category);
      if (selectedFile) {
        data.append('image', selectedFile);
      }

      await clubService.createClub(data);
      setModalOpen(false);
      setFormData({ name: '', description: '', category: 'tech' });
      setSelectedFile(null);
      fetchClubs();
    } catch (err) {
      alert(err.message || 'Failed to create club');
    } finally {
      setActionLoading(false);
    }
  };

  const handleJoin = async (id) => {
    try {
      await clubService.joinClub(id);
      fetchClubs();
    } catch (err) {
      alert(err.message || 'Failed to join club');
    }
  };

  const handleLeave = async (id) => {
    try {
      await clubService.leaveClub(id);
      fetchClubs();
    } catch (err) {
      alert(err.message || 'Failed to leave club');
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this club?')) return;
    try {
      await clubService.deleteClub(id);
      fetchClubs();
    } catch (err) {
      alert(err.message || 'Failed to delete club');
    }
  };

  const categories = [
    { label: 'All Clubs', value: '' },
    { label: 'Tech & Coding', value: 'tech' },
    { label: 'Cultural & Drama', value: 'cultural' },
    { label: 'Sports & Athletics', value: 'sports' },
    { label: 'Academic & Research', value: 'academic' },
    { label: 'Arts & Photography', value: 'arts' },
    { label: 'Social & NGO', value: 'social' },
    { label: 'Other', value: 'other' },
  ];

  return (
    <div className="max-w-7xl xl:max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8 space-y-6">
      {/* Top Banner */}
      <div className="bg-[#1A1D21] border border-[#282D33] rounded-2xl sm:rounded-3xl p-6 sm:p-8 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-5 shadow-xl relative overflow-hidden">
        <div className="space-y-2 relative z-10">
          <span className="text-[10px] sm:text-[11px] font-bold uppercase tracking-wider text-[#C084FC] bg-[#241B38] px-2.5 py-0.5 rounded-full border border-[#C084FC]/30">
            Student Societies
          </span>
          <h1 className="text-xl sm:text-2xl lg:text-3xl font-extrabold text-white">
            Campus Clubs & Communities
          </h1>
          <p className="text-xs sm:text-sm text-[#8A94A0] max-w-xl leading-relaxed">
            Explore official campus societies, student interest groups, robotics clubs, and music circles. Join to receive event notices and collaborate.
          </p>
        </div>

        <button
          onClick={() => setModalOpen(true)}
          className="w-full sm:w-auto flex items-center justify-center gap-2 px-5 py-3 rounded-xl sm:rounded-2xl bg-[#E58A3C] hover:bg-[#D97724] text-white font-bold text-xs sm:text-sm transition-all shadow-md shadow-[#E58A3C]/20 flex-shrink-0 cursor-pointer"
        >
          <Plus className="w-4 h-4 sm:w-5 sm:h-5" />
          <span>Register a Club</span>
        </button>
      </div>

      {/* Search & Categories */}
      <div className="flex flex-col sm:flex-row gap-3 items-center justify-between">
        <div className="relative flex-1 w-full">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#8A94A0]" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search clubs by name or keywords..."
            className="w-full pl-9 pr-4 py-2.5 bg-[#1A1D21] border border-[#282D33] rounded-2xl text-xs text-white placeholder-[#8A94A0]/60 focus:outline-none focus:border-[#E58A3C] shadow-xs"
          />
        </div>
      </div>

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
        <LoadingSpinner message="Loading campus societies..." />
      ) : clubs.length === 0 ? (
        <div className="bg-[#1A1D21] border border-[#282D33] rounded-3xl p-12 text-center space-y-4 shadow-md">
          <Users className="w-10 h-10 text-[#8A94A0] mx-auto" />
          <h3 className="text-lg font-bold text-white">No clubs found</h3>
          <p className="text-sm text-[#8A94A0]">Start a new club for your campus interest!</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {clubs.map((club) => {
            const isCreator = user && (club.createdBy?._id || club.createdBy) === user._id;
            const isMember =
              user &&
              (club.members || []).some(
                (m) => (m._id || m) === user._id
              );

            return (
              <div
                key={club._id}
                className="bg-[#1A1D21] border border-[#282D33] rounded-3xl p-6 hover:border-[#383F47] hover:shadow-lg transition-all flex flex-col justify-between space-y-4 shadow-sm"
              >
                <div className="space-y-3">
                  <div className="flex items-start justify-between">
                    <div className="w-12 h-12 rounded-2xl bg-[#23272D] border border-[#343A42] flex items-center justify-center text-xl font-black text-white overflow-hidden flex-shrink-0">
                      {club.image ? (
                        <img
                          src={club.image.startsWith('http') ? club.image : `${club.image}`}
                          alt={club.name}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        club.name.charAt(0).toUpperCase()
                      )}
                    </div>
                    <span className="text-[10px] font-semibold uppercase px-2.5 py-1 rounded-full bg-[#241B38] text-[#C084FC] border border-[#C084FC]/30">
                      {club.category}
                    </span>
                  </div>

                  <div>
                    <h3 className="font-bold text-lg text-white">{club.name}</h3>
                    <p className="text-xs text-[#8A94A0] line-clamp-3 leading-relaxed mt-1">
                      {club.description || 'Official campus community.'}
                    </p>
                  </div>
                </div>

                <div className="pt-4 border-t border-[#252A30] flex items-center justify-between">
                  <div className="flex items-center gap-1.5 text-xs text-[#8A94A0]">
                    <Users className="w-3.5 h-3.5 text-[#4ADE80]" />
                    <span>{club.memberCount || (club.members || []).length} members</span>
                  </div>

                  <div className="flex items-center gap-2">
                    {isMember ? (
                      <button
                        onClick={() => handleLeave(club._id)}
                        className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold text-[#FF6B6B] bg-[#2B1818] hover:bg-[#381E1E] transition-all cursor-pointer border border-[#FF6B6B]/30"
                      >
                        <UserMinus className="w-3.5 h-3.5" />
                        <span>Leave</span>
                      </button>
                    ) : (
                      <button
                        onClick={() => handleJoin(club._id)}
                        className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl text-xs font-bold bg-[#E58A3C] hover:bg-[#D97724] text-white transition-all shadow-md shadow-[#E58A3C]/20 cursor-pointer"
                      >
                        <UserPlus className="w-3.5 h-3.5" />
                        <span>Join Club</span>
                      </button>
                    )}

                    {isCreator && (
                      <button
                        onClick={() => handleDelete(club._id)}
                        title="Delete Club"
                        className="p-1.5 rounded-xl text-[#F87171] hover:bg-[#2B1818] transition-colors cursor-pointer"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Create Club Modal */}
      <Modal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        title="Register a Campus Club or Society"
      >
        <form onSubmit={handleCreate} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-[#8A94A0] uppercase mb-1.5">
              Club / Society Name
            </label>
            <input
              type="text"
              required
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              placeholder="e.g. ACM Student Chapter or Campus Robotics Club"
              className="w-full px-4 py-2.5 bg-[#131518] border border-[#282D33] rounded-xl text-sm text-white placeholder-[#8A94A0]/50 focus:outline-none focus:border-[#E58A3C]"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-[#8A94A0] uppercase mb-1.5">
              Category
            </label>
            <select
              value={formData.category}
              onChange={(e) => setFormData({ ...formData, category: e.target.value })}
              className="w-full px-4 py-2.5 bg-[#131518] border border-[#282D33] rounded-xl text-sm text-white focus:outline-none focus:border-[#E58A3C] cursor-pointer"
            >
              <option value="tech">Tech & Coding</option>
              <option value="cultural">Cultural & Drama</option>
              <option value="sports">Sports & Athletics</option>
              <option value="academic">Academic & Research</option>
              <option value="arts">Arts & Photography</option>
              <option value="social">Social & NGO</option>
              <option value="other">Other</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold text-[#8A94A0] uppercase mb-1.5">
              Description & Activities
            </label>
            <textarea
              required
              rows={3}
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              placeholder="What this club does, regular meetups, activities..."
              className="w-full px-4 py-2.5 bg-[#131518] border border-[#282D33] rounded-xl text-sm text-white placeholder-[#8A94A0]/50 focus:outline-none focus:border-[#E58A3C]"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-[#8A94A0] uppercase mb-1.5">
              Club Logo / Badge (Optional)
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
              {actionLoading ? 'Creating...' : 'Create Club'}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
