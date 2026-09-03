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
    <div className="max-w-7xl xl:max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8 space-y-6">
      {/* Student Identity Card */}
      <div className="bg-[#1A1D21] border border-[#282D33] rounded-2xl sm:rounded-3xl p-5 sm:p-8 relative overflow-hidden shadow-md">
        <div className="absolute top-0 right-0 w-64 h-64 bg-[#E58A3C]/5 rounded-full blur-3xl pointer-events-none" />

        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 sm:gap-6 relative z-10">
          <div className="flex items-center gap-3.5 sm:gap-5">
            <div className="w-14 h-14 sm:w-20 sm:h-20 rounded-2xl sm:rounded-3xl bg-[#23272D] border border-[#343A42] text-white font-black text-xl sm:text-2xl flex items-center justify-center shadow-lg flex-shrink-0">
              {user?.name?.charAt(0).toUpperCase() || 'U'}
            </div>

            <div className="space-y-1">
              <div className="flex flex-wrap items-center gap-2">
                <h1 className="text-lg sm:text-2xl font-black text-white">{user?.name}</h1>
                <span className="text-[9px] sm:text-[10px] font-bold px-2 py-0.5 rounded-full bg-[#16221A] text-[#4ADE80] border border-[#4ADE80]/30">
                  VERIFIED STUDENT
                </span>
              </div>
              <p className="text-xs text-[#8A94A0]">{user?.email}</p>
              <div className="flex flex-wrap items-center gap-2 sm:gap-3 pt-1 text-xs text-[#8A94A0]">
                <span className="flex items-center gap-1 bg-[#131518] border border-[#282D33] px-2.5 py-1 rounded-xl">
                  <GraduationCap className="w-3.5 h-3.5 text-[#60A5FA]" />
                  {user?.branch || 'Campus Student'}
                </span>
                {user?.semester && (
                  <span className="bg-[#131518] border border-[#282D33] px-2.5 py-1 rounded-xl">
                    Semester {user.semester}
                  </span>
                )}
              </div>
            </div>
          </div>

          <div className="flex sm:flex-col items-center sm:items-end justify-between sm:justify-center p-3 sm:p-0 bg-[#131518] sm:bg-transparent rounded-xl sm:rounded-none border border-[#282D33] sm:border-0">
            <span className="text-[11px] sm:text-xs text-[#8A94A0] font-medium">Campus Score</span>
            <div className="flex items-center gap-1.5 text-lg sm:text-xl font-black text-[#F59E0B]">
              <Sparkles className="w-4 h-4 sm:w-5 sm:h-5 text-[#F59E0B]" />
              <span>{user?.campusScore || 0} pts</span>
            </div>
          </div>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="flex gap-1.5 sm:gap-2 overflow-x-auto pb-1 scrollbar-none border-b border-[#282D33]">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const active = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-2 px-4 py-3 border-b-2 text-xs font-bold transition-all whitespace-nowrap cursor-pointer ${
                active
                  ? 'border-[#E58A3C] text-[#E58A3C]'
                  : 'border-transparent text-[#8A94A0] hover:text-white'
              }`}
            >
              <Icon className="w-4 h-4" />
              <span>{tab.label}</span>
              <span
                className={`text-[10px] px-2 py-0.2 rounded-full ${
                  active ? 'bg-[#2A2014] text-[#E58A3C]' : 'bg-[#1A1D21] text-[#8A94A0]'
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
                <div className="bg-[#1A1D21] border border-[#282D33] rounded-3xl p-12 text-center text-sm text-[#8A94A0] shadow-md">
                  You haven't posted any team collaboration requests yet.
                </div>
              ) : (
                <div className="space-y-3">
                  {myPosts.map((p) => (
                    <div
                      key={p._id}
                      className="bg-[#1A1D21] border border-[#282D33] rounded-2xl p-5 flex items-center justify-between gap-4 shadow-sm hover:border-[#383F47] transition-all"
                    >
                      <div className="space-y-1">
                        <span className="text-[10px] font-semibold uppercase px-2 py-0.5 rounded-full bg-[#162238] text-[#60A5FA] border border-[#60A5FA]/30">
                          {p.category}
                        </span>
                        <h4 className="font-bold text-sm text-white">{p.title}</h4>
                        <p className="text-xs text-[#8A94A0]">
                          {p.approvedCount || 0} / {p.teamSize} spots filled • {p.applicants?.length || 0} applicants
                        </p>
                      </div>

                      <Link
                        to={`/events/${p._id}`}
                        className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold bg-[#23272D] text-white border border-[#282D33] hover:border-[#E58A3C] transition-all shadow-xs"
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
                <div className="bg-[#1A1D21] border border-[#282D33] rounded-3xl p-12 text-center text-sm text-[#8A94A0] shadow-md">
                  You haven't applied to any team posts yet.
                </div>
              ) : (
                <div className="space-y-3">
                  {myApplications.map((app, idx) => (
                    <div
                      key={idx}
                      className="bg-[#1A1D21] border border-[#282D33] rounded-2xl p-5 flex items-center justify-between gap-4 shadow-sm hover:border-[#383F47] transition-all"
                    >
                      <div className="space-y-1">
                        <h4 className="font-bold text-sm text-white">{app.event?.title || 'Post'}</h4>
                        <p className="text-xs text-[#8A94A0] italic">Pitch: "{app.message}"</p>
                      </div>

                      <span
                        className={`text-xs font-bold px-3 py-1 rounded-xl uppercase border ${
                          app.status === 'approved'
                            ? 'bg-[#18261F] text-[#4ADE80] border-[#4ADE80]/30'
                            : app.status === 'rejected'
                            ? 'bg-[#2B1818] text-[#FF6B6B] border-[#FF6B6B]/30'
                            : 'bg-[#2B2215] text-[#F59E0B] border-[#F59E0B]/30'
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
                <div className="bg-[#1A1D21] border border-[#282D33] rounded-3xl p-12 text-center text-sm text-[#8A94A0] shadow-md">
                  You have no active listings on the marketplace.
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {myListings.map((item) => (
                    <div
                      key={item._id}
                      className="bg-[#1A1D21] border border-[#282D33] rounded-2xl p-4 flex items-center justify-between gap-3 shadow-sm hover:border-[#383F47] transition-all"
                    >
                      <div className="space-y-1">
                        <h4 className="font-bold text-sm text-white">{item.title}</h4>
                        <p className="text-xs font-black text-[#F59E0B]">₹{item.price}</p>
                      </div>
                      <span
                        className={`text-xs font-semibold px-2.5 py-1 rounded-lg capitalize border ${
                          item.status === 'sold'
                            ? 'bg-[#131518] text-[#8A94A0] border-[#282D33]'
                            : 'bg-[#18261F] text-[#4ADE80] border-[#4ADE80]/30'
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
                <div className="bg-[#1A1D21] border border-[#282D33] rounded-3xl p-12 text-center text-sm text-[#8A94A0] shadow-md">
                  You haven't reported any lost or found items.
                </div>
              ) : (
                <div className="space-y-3">
                  {myLostItems.map((item) => (
                    <div
                      key={item._id}
                      className="bg-[#1A1D21] border border-[#282D33] rounded-2xl p-4 flex items-center justify-between gap-3 shadow-sm hover:border-[#383F47] transition-all"
                    >
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <span
                            className={`text-[10px] font-black uppercase px-2 py-0.5 rounded-full border ${
                              item.type === 'lost'
                                ? 'bg-[#2B1818] text-[#FF6B6B] border-[#FF6B6B]/30'
                                : 'bg-[#18261F] text-[#4ADE80] border-[#4ADE80]/30'
                            }`}
                          >
                            {item.type}
                          </span>
                          <h4 className="font-bold text-sm text-white">{item.title}</h4>
                        </div>
                        <p className="text-xs text-[#8A94A0]">{item.location}</p>
                      </div>
                      <span className="text-xs font-semibold px-2.5 py-1 rounded-lg bg-[#131518] text-[#8A94A0] border border-[#282D33] capitalize">
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
                <div className="bg-[#1A1D21] border border-[#282D33] rounded-3xl p-12 text-center text-sm text-[#8A94A0] shadow-md">
                  You haven't joined any campus clubs yet. Check out the Clubs tab!
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {myClubs.map((club) => (
                    <div
                      key={club._id}
                      className="bg-[#1A1D21] border border-[#282D33] rounded-2xl p-4 flex items-center justify-between shadow-sm hover:border-[#383F47] transition-all"
                    >
                      <div>
                        <h4 className="font-bold text-sm text-white">{club.name}</h4>
                        <span className="text-[10px] text-[#C084FC] uppercase font-semibold">{club.category}</span>
                      </div>
                      <Link
                        to="/clubs"
                        className="text-xs font-semibold text-[#E58A3C] hover:underline"
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
