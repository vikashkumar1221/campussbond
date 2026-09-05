import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import {
  eventService,
  marketService,
  lostFoundService,
  clubService,
} from '../../services/api';
import LoadingSpinner from '../../components/LoadingSpinner';
import {
  User,
  GraduationCap,
  Sparkles,
  Compass,
  FileCheck,
  ShoppingBag,
  Search,
  Users,
  Clock,
  ChevronRight,
  Trash2,
} from 'lucide-react';

export default function ProfilePage() {
  const { user } = useAuth();
  const displayName = (user?.name && user.name !== 'Test Student') ? user.name : 'Vikash';

  const [activeTab, setActiveTab] = useState('posts');
  const [loading, setLoading] = useState(true);

  // Tab datasets
  const [myPosts, setMyPosts] = useState([]);
  const [myApplications, setMyApplications] = useState([]);
  const [myListings, setMyListings] = useState([]);
  const [myLostItems, setMyLostItems] = useState([]);
  const [myClubs, setMyClubs] = useState([]);

  useEffect(() => {
    async function loadData() {
      setLoading(true);
      try {
        const [postsRes, appsRes, marketRes, lostRes, clubsRes] = await Promise.allSettled([
          eventService.getMyCreated(),
          eventService.getMyApplications(),
          marketService.getMyListings(),
          lostFoundService.getMyPosts(),
          clubService.getMyJoined(),
        ]);

        if (postsRes.status === 'fulfilled') setMyPosts(postsRes.value.data.events || []);
        if (appsRes.status === 'fulfilled') setMyApplications(appsRes.value.data.applications || []);
        if (marketRes.status === 'fulfilled') setMyListings(marketRes.value.data.items || []);
        if (lostRes.status === 'fulfilled') setMyLostItems(lostRes.value.data.items || []);
        if (clubsRes.status === 'fulfilled') setMyClubs(clubsRes.value.data.clubs || []);
      } catch (err) {
        console.error('Error fetching profile data', err);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, []);

  const tabs = [
    { id: 'posts', label: 'My Posts', count: myPosts.length, icon: Compass },
    { id: 'applications', label: 'My Applications', count: myApplications.length, icon: FileCheck },
    { id: 'market', label: 'My Listings', count: myListings.length, icon: ShoppingBag },
    { id: 'lost', label: 'Lost & Found', count: myLostItems.length, icon: Search },
    { id: 'clubs', label: 'Joined Clubs', count: myClubs.length, icon: Users },
  ];

  return (
    <div className="max-w-7xl xl:max-w-[1440px] mx-auto px-3 sm:px-6 lg:px-8 py-4 sm:py-8 space-y-4 sm:space-y-6">
      {/* Student Identity Card */}
      <div className="bg-white border-2 border-gray-200 rounded-2xl p-5 sm:p-7 shadow-xs">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 sm:gap-6">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-full bg-[#E8F8F0] border border-[#05A86B]/30 text-[#05A86B] font-black text-xl sm:text-2xl flex items-center justify-center flex-shrink-0 shadow-xs">
              {displayName.charAt(0).toUpperCase()}
            </div>

            <div className="space-y-1">
              <div className="flex flex-wrap items-center gap-2">
                <h1 className="text-lg sm:text-xl font-bold text-gray-950">{displayName}</h1>
                <span className="text-[10px] font-bold px-2.5 py-0.5 rounded-full bg-[#E8F8F0] text-[#05A86B] border border-[#05A86B]/30">
                  VERIFIED STUDENT
                </span>
              </div>
              <p className="text-xs text-gray-500 truncate">{user?.email}</p>
              <div className="flex flex-wrap items-center gap-2 pt-0.5 text-xs text-gray-500">
                <span className="flex items-center gap-1.5 bg-gray-100 border border-gray-200 px-2.5 py-1 rounded-xl text-[11px] font-semibold text-gray-700">
                  <GraduationCap className="w-3.5 h-3.5 text-gray-500" />
                  {user?.branch || 'CSE'}
                </span>
                {user?.semester && (
                  <span className="bg-gray-100 border border-gray-200 px-2.5 py-1 rounded-xl text-[11px] font-semibold text-gray-700">
                    Semester {user.semester}
                  </span>
                )}
              </div>
            </div>
          </div>

          <div className="flex sm:flex-col items-center sm:items-end justify-between sm:justify-center p-3 sm:p-0 bg-[#FEF3C7]/60 sm:bg-transparent rounded-xl sm:rounded-none border border-[#F59E0B]/20 sm:border-0">
            <span className="text-xs text-gray-500">Campus Score</span>
            <div className="flex items-center gap-1.5 text-base sm:text-lg font-black text-[#D97706]">
              <Sparkles className="w-4 h-4 text-[#D97706]" />
              <span>{user?.campusScore || 0} pts</span>
            </div>
          </div>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="flex gap-1.5 sm:gap-2 overflow-x-auto pb-1 scrollbar-none border-b border-gray-200 -mx-1 px-1">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const active = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-2 px-3.5 sm:px-4 py-2.5 rounded-xl text-xs font-semibold transition-all whitespace-nowrap cursor-pointer ${
                active
                  ? 'bg-white text-gray-950 border border-gray-200 font-bold shadow-xs'
                  : 'text-gray-600 hover:text-gray-950 hover:bg-gray-50'
              }`}
            >
              <Icon className="w-3.5 h-3.5" />
              <span>{tab.label}</span>
              <span
                className={`text-[10px] px-1.5 py-0.2 rounded-md font-bold ${
                  active ? 'bg-[#05A86B] text-white' : 'bg-gray-200 text-gray-700'
                }`}
              >
                {tab.count}
              </span>
            </button>
          );
        })}
      </div>

      {/* Tab Panels */}
      {loading ? (
        <LoadingSpinner message="Loading your activity dashboard..." />
      ) : (
        <div className="space-y-4">
          {/* TAB 1: My Posts */}
          {activeTab === 'posts' && (
            <div>
              {myPosts.length === 0 ? (
                <div className="bg-white border-2 border-gray-200 rounded-2xl p-12 text-center text-xs sm:text-sm text-gray-500 shadow-xs">
                  You haven't posted any team collaboration requests yet.
                </div>
              ) : (
                <div className="space-y-3">
                  {myPosts.map((p) => (
                    <div
                      key={p._id}
                      className="bg-white border-2 border-gray-200 rounded-2xl p-5 flex items-center justify-between gap-4 shadow-xs hover:border-gray-300 transition-all"
                    >
                      <div className="space-y-1">
                        <span className="text-[10px] font-bold capitalize px-2.5 py-0.5 rounded-lg bg-[#E8F8F0] text-[#05A86B] border border-[#05A86B]/30">
                          {p.category}
                        </span>
                        <h4 className="font-bold text-sm text-gray-950">{p.title}</h4>
                        <p className="text-xs text-gray-500">
                          {p.approvedCount || 0} / {p.teamSize} spots filled • {p.applicants?.length || 0} applicants
                        </p>
                      </div>

                      <Link
                        to={`/events/${p._id}`}
                        className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold bg-[#05A86B] hover:bg-[#048E5A] text-white transition-all shadow-xs"
                      >
                        <span>Manage Applicants</span>
                        <ChevronRight className="w-3.5 h-3.5" />
                      </Link>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* TAB 2: My Applications */}
          {activeTab === 'applications' && (
            <div>
              {myApplications.length === 0 ? (
                <div className="bg-white border-2 border-gray-200 rounded-2xl p-12 text-center text-xs sm:text-sm text-gray-500 shadow-xs">
                  You haven't applied to any team posts yet.
                </div>
              ) : (
                <div className="space-y-3">
                  {myApplications.map((app, idx) => (
                    <div
                      key={idx}
                      className="bg-white border-2 border-gray-200 rounded-2xl p-5 flex items-center justify-between gap-4 shadow-xs hover:border-gray-300 transition-all"
                    >
                      <div className="space-y-1">
                        <h4 className="font-bold text-sm text-gray-950">{app.event?.title || 'Post'}</h4>
                        <p className="text-xs text-gray-500 italic">Pitch: "{app.message}"</p>
                      </div>

                      <span
                        className={`text-xs font-bold px-3 py-1 rounded-xl capitalize border ${
                          app.status === 'approved'
                            ? 'bg-[#E8F8F0] text-[#05A86B] border-[#05A86B]/30'
                            : app.status === 'rejected'
                            ? 'bg-rose-50 text-rose-600 border-rose-200'
                            : 'bg-amber-50 text-[#D97706] border-amber-200'
                        }`}
                      >
                        {app.status}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* TAB 3: My Marketplace Listings */}
          {activeTab === 'market' && (
            <div>
              {myListings.length === 0 ? (
                <div className="bg-white border-2 border-gray-200 rounded-2xl p-12 text-center text-xs sm:text-sm text-gray-500 shadow-xs">
                  You have no active listings on the marketplace.
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {myListings.map((item) => (
                    <div
                      key={item._id}
                      className="bg-white border-2 border-gray-200 rounded-2xl p-4 flex items-center justify-between gap-3 shadow-xs hover:border-gray-300 transition-all"
                    >
                      <div className="space-y-1">
                        <h4 className="font-bold text-sm text-gray-950">{item.title}</h4>
                        <p className="text-xs font-black text-[#05A86B]">₹{item.price}</p>
                      </div>
                      <span
                        className={`text-xs font-bold px-2.5 py-1 rounded-lg capitalize border ${
                          item.status === 'sold'
                            ? 'bg-gray-100 text-gray-500 border-gray-200'
                            : 'bg-[#E8F8F0] text-[#05A86B] border-[#05A86B]/30'
                        }`}
                      >
                        {item.status}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* TAB 4: Lost & Found */}
          {activeTab === 'lost' && (
            <div>
              {myLostItems.length === 0 ? (
                <div className="bg-white border-2 border-gray-200 rounded-2xl p-12 text-center text-xs sm:text-sm text-gray-500 shadow-xs">
                  You haven't reported any lost or found items.
                </div>
              ) : (
                <div className="space-y-3">
                  {myLostItems.map((item) => (
                    <div
                      key={item._id}
                      className="bg-white border-2 border-gray-200 rounded-2xl p-4 flex items-center justify-between gap-3 shadow-xs hover:border-gray-300 transition-all"
                    >
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <span
                            className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded-md border ${
                              item.type === 'lost'
                                ? 'bg-[#FDF2F8] text-[#D946EF] border-[#D946EF]/30'
                                : 'bg-[#E8F8F0] text-[#05A86B] border-[#05A86B]/30'
                            }`}
                          >
                            {item.type}
                          </span>
                          <h4 className="font-bold text-sm text-gray-950">{item.title}</h4>
                        </div>
                        <p className="text-xs text-gray-500">{item.location}</p>
                      </div>
                      <span className="text-xs font-semibold px-2.5 py-1 rounded-lg bg-gray-100 text-gray-700 border border-gray-200 capitalize">
                        {item.status}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* TAB 5: Joined Clubs */}
          {activeTab === 'clubs' && (
            <div>
              {myClubs.length === 0 ? (
                <div className="bg-white border-2 border-gray-200 rounded-2xl p-12 text-center text-xs sm:text-sm text-gray-500 shadow-xs">
                  You haven't joined any campus clubs yet. Check out the Clubs tab!
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {myClubs.map((club) => (
                    <div
                      key={club._id}
                      className="bg-white border-2 border-gray-200 rounded-2xl p-4 flex items-center justify-between shadow-xs hover:border-gray-300 transition-all"
                    >
                      <div className="flex items-center gap-3 min-w-0">
                        <div className="w-9 h-9 rounded-xl bg-[#E8F8F0] border border-[#05A86B]/30 flex items-center justify-center font-mono font-black text-xs text-[#05A86B] flex-shrink-0">
                          {club.category === 'tech' || (club.name || '').toLowerCase().includes('code') ? '</>' : club.name.charAt(0).toUpperCase()}
                        </div>
                        <div className="min-w-0">
                          <h4 className="font-bold text-sm text-gray-950 truncate">{club.name}</h4>
                          <span className="text-[10px] text-gray-500 uppercase font-semibold">{club.category}</span>
                        </div>
                      </div>
                      <Link
                        to="/clubs"
                        className="text-xs font-bold text-[#05A86B] hover:text-[#048E5A]"
                      >
                        View Society
                      </Link>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
