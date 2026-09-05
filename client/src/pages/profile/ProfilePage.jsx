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
      <div className="bg-[#121417] border border-[#1E2228] rounded-2xl p-5 sm:p-7 shadow-sm">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 sm:gap-6">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-full bg-[#1C1F26] border border-[#2B303A] text-white font-bold text-xl sm:text-2xl flex items-center justify-center flex-shrink-0 shadow-sm">
              {displayName.charAt(0).toUpperCase()}
            </div>

            <div className="space-y-1">
              <div className="flex flex-wrap items-center gap-2">
                <h1 className="text-lg sm:text-xl font-bold text-white">{displayName}</h1>
                <span className="text-[10px] font-semibold px-2.5 py-0.5 rounded-full bg-[#121E16] text-[#4ADE80] border border-[#4ADE80]/30">
                  VERIFIED STUDENT
                </span>
              </div>
              <p className="text-xs text-[#7C8592] truncate">{user?.email}</p>
              <div className="flex flex-wrap items-center gap-2 pt-0.5 text-xs text-[#7C8592]">
                <span className="flex items-center gap-1.5 bg-[#181B20] border border-[#242932] px-2.5 py-1 rounded-xl text-[11px] text-[#A6B0BC]">
                  <GraduationCap className="w-3.5 h-3.5 text-[#7C8592]" />
                  {user?.branch || 'CSE'}
                </span>
                {user?.semester && (
                  <span className="bg-[#181B20] border border-[#242932] px-2.5 py-1 rounded-xl text-[11px] text-[#A6B0BC]">
                    Semester {user.semester}
                  </span>
                )}
              </div>
            </div>
          </div>

          <div className="flex sm:flex-col items-center sm:items-end justify-between sm:justify-center p-3 sm:p-0 bg-[#181B20] sm:bg-transparent rounded-xl sm:rounded-none border border-[#242932] sm:border-0">
            <span className="text-xs text-[#7C8592]">Campus Score</span>
            <div className="flex items-center gap-1.5 text-base sm:text-lg font-bold text-[#F59E0B]">
              <Sparkles className="w-4 h-4 text-[#F59E0B]" />
              <span>{user?.campusScore || 0} pts</span>
            </div>
          </div>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="flex gap-1.5 sm:gap-2 overflow-x-auto pb-1 scrollbar-none border-b border-[#1E2228] -mx-1 px-1">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const active = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-2 px-3.5 sm:px-4 py-2.5 rounded-xl text-xs font-medium transition-all whitespace-nowrap cursor-pointer ${
                active
                  ? 'bg-[#1C2027] text-white border border-[#2E3542] font-semibold shadow-xs'
                  : 'text-[#7C8592] hover:text-white hover:bg-[#121417]'
              }`}
            >
              <Icon className="w-3.5 h-3.5" />
              <span>{tab.label}</span>
              <span
                className={`text-[10px] px-1.5 py-0.2 rounded-md ${
                  active ? 'bg-[#2E3542] text-white' : 'bg-[#181B20] text-[#7C8592]'
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
                <div className="bg-[#121417] border border-[#1E2228] rounded-2xl p-12 text-center text-xs sm:text-sm text-[#7C8592] shadow-sm">
                  You haven't posted any team collaboration requests yet.
                </div>
              ) : (
                <div className="space-y-3">
                  {myPosts.map((p) => (
                    <div
                      key={p._id}
                      className="bg-[#121417] border border-[#1E2228] rounded-2xl p-5 flex items-center justify-between gap-4 shadow-sm hover:border-[#272C35] transition-all"
                    >
                      <div className="space-y-1">
                        <span className="text-[10px] font-medium capitalize px-2.5 py-0.5 rounded-lg bg-[#181B20] text-[#A6B0BC] border border-[#242932]">
                          {p.category}
                        </span>
                        <h4 className="font-bold text-sm text-white">{p.title}</h4>
                        <p className="text-xs text-[#7C8592]">
                          {p.approvedCount || 0} / {p.teamSize} spots filled • {p.applicants?.length || 0} applicants
                        </p>
                      </div>

                      <Link
                        to={`/events/${p._id}`}
                        className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-semibold bg-[#20242B] hover:bg-[#282D36] text-white border border-[#2D333E] transition-all shadow-xs"
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
                <div className="bg-[#121417] border border-[#1E2228] rounded-2xl p-12 text-center text-xs sm:text-sm text-[#7C8592] shadow-sm">
                  You haven't applied to any team posts yet.
                </div>
              ) : (
                <div className="space-y-3">
                  {myApplications.map((app, idx) => (
                    <div
                      key={idx}
                      className="bg-[#121417] border border-[#1E2228] rounded-2xl p-5 flex items-center justify-between gap-4 shadow-sm hover:border-[#272C35] transition-all"
                    >
                      <div className="space-y-1">
                        <h4 className="font-bold text-sm text-white">{app.event?.title || 'Post'}</h4>
                        <p className="text-xs text-[#7C8592] italic">Pitch: "{app.message}"</p>
                      </div>

                      <span
                        className={`text-xs font-semibold px-3 py-1 rounded-xl capitalize border ${
                          app.status === 'approved'
                            ? 'bg-[#121E16] text-[#4ADE80] border-[#4ADE80]/30'
                            : app.status === 'rejected'
                            ? 'bg-[#251515] text-[#FF6B6B] border-[#FF6B6B]/30'
                            : 'bg-[#20242B] text-[#A6B0BC] border-[#2D333E]'
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
                <div className="bg-[#121417] border border-[#1E2228] rounded-2xl p-12 text-center text-xs sm:text-sm text-[#7C8592] shadow-sm">
                  You have no active listings on the marketplace.
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {myListings.map((item) => (
                    <div
                      key={item._id}
                      className="bg-[#121417] border border-[#1E2228] rounded-2xl p-4 flex items-center justify-between gap-3 shadow-sm hover:border-[#272C35] transition-all"
                    >
                      <div className="space-y-1">
                        <h4 className="font-bold text-sm text-white">{item.title}</h4>
                        <p className="text-xs font-bold text-white">₹{item.price}</p>
                      </div>
                      <span
                        className={`text-xs font-semibold px-2.5 py-1 rounded-lg capitalize border ${
                          item.status === 'sold'
                            ? 'bg-[#181B20] text-[#7C8592] border-[#242932]'
                            : 'bg-[#121E16] text-[#4ADE80] border-[#4ADE80]/30'
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
                <div className="bg-[#121417] border border-[#1E2228] rounded-2xl p-12 text-center text-xs sm:text-sm text-[#7C8592] shadow-sm">
                  You haven't reported any lost or found items.
                </div>
              ) : (
                <div className="space-y-3">
                  {myLostItems.map((item) => (
                    <div
                      key={item._id}
                      className="bg-[#121417] border border-[#1E2228] rounded-2xl p-4 flex items-center justify-between gap-3 shadow-sm hover:border-[#272C35] transition-all"
                    >
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <span
                            className={`text-[10px] font-semibold uppercase px-2 py-0.5 rounded-md border ${
                              item.type === 'lost'
                                ? 'bg-[#251515] text-[#FF6B6B] border-[#FF6B6B]/30'
                                : 'bg-[#121E16] text-[#4ADE80] border-[#4ADE80]/30'
                            }`}
                          >
                            {item.type}
                          </span>
                          <h4 className="font-bold text-sm text-white">{item.title}</h4>
                        </div>
                        <p className="text-xs text-[#7C8592]">{item.location}</p>
                      </div>
                      <span className="text-xs font-semibold px-2.5 py-1 rounded-lg bg-[#181B20] text-[#7C8592] border border-[#242932] capitalize">
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
                <div className="bg-[#121417] border border-[#1E2228] rounded-2xl p-12 text-center text-xs sm:text-sm text-[#7C8592] shadow-sm">
                  You haven't joined any campus clubs yet. Check out the Clubs tab!
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {myClubs.map((club) => (
                    <div
                      key={club._id}
                      className="bg-[#121417] border border-[#1E2228] rounded-2xl p-4 flex items-center justify-between shadow-sm hover:border-[#272C35] transition-all"
                    >
                      <div className="flex items-center gap-3 min-w-0">
                        <div className="w-9 h-9 rounded-xl bg-[#141B26] border border-[#60A5FA]/25 flex items-center justify-center font-mono font-bold text-xs text-[#60A5FA] flex-shrink-0">
                          {club.category === 'tech' || (club.name || '').toLowerCase().includes('code') ? '</>' : club.name.charAt(0).toUpperCase()}
                        </div>
                        <div className="min-w-0">
                          <h4 className="font-bold text-sm text-white truncate">{club.name}</h4>
                          <span className="text-[10px] text-[#A6B0BC] uppercase font-medium">{club.category}</span>
                        </div>
                      </div>
                      <Link
                        to="/clubs"
                        className="text-xs font-semibold text-white hover:text-gray-300"
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
