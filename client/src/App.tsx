import { useState, useEffect, useCallback, useMemo } from 'react';
import axios from 'axios';
import { LayoutDashboard, Image as ImageIcon, Video, Music, Calendar, Settings, Bell, Search, Loader2, X, Send, CheckCircle2, Terminal, BarChart3, Users, Eye, Bookmark, Menu, ArrowRight, Zap, RefreshCw, Lock, Cloud, Heart, MessageCircle } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

// Global Axios Config for Flora
axios.defaults.baseURL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

interface MediaItem {
  id: string;
  url: string;
  previewUrl: string;
  source: string;
  resource_type?: string;
}

interface LogEntry {
  _id: string;
  message: string;
  level: string;
  createdAt: string;
}

interface StatsData {
  totalPosts: number;
  totalReach: number;
  totalViews: number;
  totalLikes: number;
  nextRunTime?: string;
  recentPosts: any[];
}

interface HistoryDay {
  date: string;
  posts: number;
  reach: number;
}

function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [password, setPassword] = useState('');
  const [loginError, setLoginError] = useState(false);
  const [isVerifying, setIsVerifying] = useState(false);

  const [activeTab, setActiveTab] = useState('dashboard');
  const [images, setImages] = useState<MediaItem[]>([]);
  const [cloudPool, setCloudPool] = useState<MediaItem[]>([]);
  const [logs, setLogs] = useState<LogEntry[]>([]);
  const [loading, setLoading] = useState(false);
  const [query, setQuery] = useState('');
  const [selectedMedia, setSelectedMedia] = useState<MediaItem | null>(null);
  const [history, setHistory] = useState<HistoryDay[]>([]);
  const [caption, setCaption] = useState('Nature is calling... 🌸✨ #flora #automation');
  const [posting, setPosting] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [nextPostTime, setNextPostTime] = useState('');
  const [isMobile, setIsMobile] = useState(window.innerWidth < 1024);
  const [verifyPass, setVerifyPass] = useState(false);
  
  const [stats, setStats] = useState<StatsData>({
    totalPosts: 0,
    totalReach: 0,
    totalViews: 0,
    totalLikes: 0,
    recentPosts: []
  });

  const discoveryKeywords = useMemo(() => ['forest', 'mountains', 'ocean', 'wildlife', 'landscape', 'waterfall', 'desert'], []);

  // Update Axios Header whenever password changes or on load
  const setAuthHeader = useCallback((token: string) => {
    if (token) {
      axios.defaults.headers.common['x-dashboard-password'] = token;
    }
  }, []);

  const fetchMedia = useCallback(async (searchQuery: string = query) => {
    setLoading(true);
    try {
      const q = searchQuery || discoveryKeywords[Math.floor(Math.random() * discoveryKeywords.length)];
      const res = await axios.get(`/api/media/images?query=${q}`);
      if (res.data.success) setImages(res.data.data);
    } catch (error) {
      console.error('Fetch Media Error:', error);
    } finally {
      setLoading(false);
    }
  }, [query, discoveryKeywords]);

  const fetchCloudPool = useCallback(async () => {
    try {
      const res = await axios.get('/api/media/cloudinary-pool');
      if (res.data.success) setCloudPool(res.data.data);
    } catch (error) {
      console.error('Fetch Cloud Pool Error:', error);
    }
  }, []);

  const fetchLogs = useCallback(async () => {
    try {
      const res = await axios.get('/api/logs');
      if (res.data.success) setLogs(res.data.data);
    } catch (error: any) {
      if (error.response?.status === 401) {
        localStorage.removeItem('flora_pass');
        setIsAuthenticated(false);
      }
    }
  }, []);

  const fetchStats = useCallback(async () => {
    try {
      const res = await axios.get('/api/stats/overview');
      setStats(res.data);
    } catch (error) {
      console.error('Fetch Stats Error:', error);
    }
  }, []);

  const fetchHistory = useCallback(async () => {
    try {
      const res = await axios.get('/api/stats/history');
      if (res.data.success) setHistory(res.data.data);
    } catch (error) {
      console.error('Fetch History Error:', error);
    }
  }, []);

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setIsVerifying(true);
    setAuthHeader(password);
    axios.get('/api/stats/overview')
      .then(() => {
        localStorage.setItem('flora_pass', password);
        setIsAuthenticated(true);
        setLoginError(false);
      })
      .catch(() => {
        setLoginError(true);
        setAuthHeader('');
      })
      .finally(() => setIsVerifying(false));
  };

  useEffect(() => {
    const savedPass = localStorage.getItem('flora_pass');
    if (savedPass) {
      setAuthHeader(savedPass);
      axios.get('/api/stats/overview')
        .then(() => setIsAuthenticated(true))
        .catch(() => {
           localStorage.removeItem('flora_pass');
           setIsAuthenticated(false);
        });
    }
  }, [setAuthHeader]);

  useEffect(() => {
    if (isAuthenticated) {
      fetchMedia();
      fetchCloudPool();
      fetchLogs();
      fetchStats();
      fetchHistory();

      const handleResize = () => setIsMobile(window.innerWidth < 1024);
      window.addEventListener('resize', handleResize);

      const interval = setInterval(() => {
        fetchLogs();
        fetchStats();
        
        if (stats.nextRunTime) {
          const next = new Date(stats.nextRunTime);
          const now = new Date();
          const diff = next.getTime() - now.getTime();
          
          if (diff > 0) {
            const mins = Math.floor(diff / 60000);
            const secs = Math.floor((diff % 60000) / 1000);
            setNextPostTime(`${mins}m ${secs}s`);
          } else {
            setNextPostTime('Processing...');
          }
        } else {
          const now = new Date();
          setNextPostTime(`${59 - now.getMinutes()}m ${59 - now.getSeconds()}s`);
        }
      }, 1000);

      return () => {
        clearInterval(interval);
        window.removeEventListener('resize', handleResize);
      };
    }
  }, [isAuthenticated, fetchMedia, fetchCloudPool, fetchLogs, fetchStats]);

  const handleQuickPublish = async () => {
    if (!selectedMedia) return;
    setPosting(true);
    try {
      await axios.post('/api/posts/quick-publish', {
        mediaUrl: selectedMedia.url,
        mediaType: selectedMedia.resource_type === 'video' || selectedMedia.url.includes('.mp4') ? 'video' : 'image',
        description: caption,
        platform: 'both'
      });
      setShowSuccess(true);
      setTimeout(() => setShowSuccess(false), 3000);
      setSelectedMedia(null);
      setVerifyPass(false);
      fetchLogs();
      fetchStats();
      fetchCloudPool();
    } catch (error) {
      console.error('Quick Publish Error:', error);
      alert('Security Check Failed or Network Error');
    } finally {
      setPosting(false);
    }
  };

  if (!isAuthenticated) {
    return (
      <div className="h-screen bg-[#030712] flex items-center justify-center p-6 font-sans">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="w-full max-w-md p-10 glass-card text-center border-primary-500/10">
          <div className="w-20 h-20 rounded-[2rem] bg-primary-600 flex items-center justify-center mx-auto mb-8 shadow-2xl shadow-primary-500/20 relative overflow-hidden group">
            <div className="absolute inset-0 bg-white/20 translate-y-full group-hover:translate-y-0 transition-transform duration-500"></div>
            <Lock size={36} className="text-white relative z-10" />
          </div>
          <h2 className="text-4xl font-black text-white mb-2 tracking-tighter">Flora Admin</h2>
          <p className="text-gray-500 text-sm mb-10 font-medium">Verify identity to access auto-pilot.</p>
          
          <form onSubmit={handleLogin} className="space-y-4">
            <input 
              type="password" 
              placeholder="Enter Admin Password" 
              className={`w-full bg-white/5 border ${loginError ? 'border-red-500/40' : 'border-white/10'} rounded-2xl py-5 px-6 text-center focus:border-primary-500 outline-none transition-all placeholder:text-gray-700 text-lg font-bold`}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
            <button disabled={isVerifying} className="w-full py-5 bg-primary-600 hover:bg-primary-500 rounded-2xl font-black text-white shadow-2xl shadow-primary-600/30 transition-all uppercase tracking-[0.2em] text-xs flex items-center justify-center gap-3">
              {isVerifying ? <Loader2 className="animate-spin" size={20} /> : 'Unlock Engine'}
            </button>
          </form>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="flex h-screen bg-[#030712] text-gray-100 overflow-hidden font-sans selection:bg-primary-500/30">
      {!isMobile && (
        <aside className="w-72 border-r border-white/5 bg-[#030712] flex flex-col z-20">
          <div className="p-8">
            <div className="flex items-center gap-3">
               <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-primary-500 to-primary-700 flex items-center justify-center shadow-lg shadow-primary-500/20">
                  <Zap size={22} className="text-white fill-current" />
               </div>
               <div>
                  <h1 className="text-2xl font-black tracking-tighter text-white">Flora</h1>
                  <p className="text-[9px] text-gray-500 font-bold uppercase tracking-[0.2em] -mt-1">Auto-Engine v3.0</p>
               </div>
            </div>
          </div>
          
          <nav className="flex-1 px-4 space-y-1.5 mt-4">
            <NavItem icon={<LayoutDashboard size={18} />} label="Overview" active={activeTab === 'dashboard'} onClick={() => setActiveTab('dashboard')} />
            <NavItem icon={<Cloud size={18} />} label="Cloud Pool" active={activeTab === 'cloud'} onClick={() => setActiveTab('cloud')} />
            <NavItem icon={<ImageIcon size={18} />} label="Discovery" active={activeTab === 'media'} onClick={() => setActiveTab('media')} />
            <NavItem icon={<BarChart3 size={18} />} label="Analytics" active={activeTab === 'analytics'} onClick={() => setActiveTab('analytics')} />
            <NavItem icon={<Terminal size={18} />} label="Engine Logs" active={activeTab === 'logs'} onClick={() => setActiveTab('logs')} />
          </nav>

          <div className="p-6 m-4 rounded-3xl bg-white/[0.02] border border-white/5 backdrop-blur-md">
            <div className="flex items-center gap-2 mb-3">
              <div className="w-2 h-2 rounded-full bg-green-500 shadow-[0_0_10px_rgba(34,197,94,0.5)]"></div>
              <p className="text-[10px] font-black text-green-500 uppercase tracking-widest">Active Engine</p>
            </div>
            <div className="space-y-1">
               <p className="text-[10px] text-gray-500 font-medium">Next Cycle In</p>
               <p className="text-lg font-mono font-bold text-white tabular-nums">{nextPostTime || '00:00'}</p>
            </div>
            <button onClick={() => { localStorage.removeItem('flora_pass'); window.location.reload(); }} className="mt-6 w-full py-2 border border-white/5 hover:bg-white/5 rounded-xl text-[10px] font-bold uppercase tracking-widest text-gray-500 transition-colors">
              Logout
            </button>
          </div>
        </aside>
      )}

      <main className="flex-1 flex flex-col overflow-hidden pb-[75px] lg:pb-0">
        <header className="h-20 border-b border-white/5 flex items-center justify-between px-6 lg:px-10 bg-[#030712]/80 backdrop-blur-xl z-10 shrink-0">
          <div className="flex items-center gap-4 bg-white/5 border border-white/5 rounded-2xl px-5 py-2.5 flex-1 max-w-2xl">
            <Search size={18} className="text-gray-500" />
            <input 
              type="text" 
              placeholder="Discover the wild..." 
              className="bg-transparent border-none focus:outline-none text-sm w-full placeholder:text-gray-600"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && fetchMedia()}
            />
          </div>
          <div className="flex items-center gap-6 ml-6">
            <button onClick={fetchStats} className="p-2.5 bg-white/5 rounded-xl hover:bg-white/10 transition-colors border border-white/5">
               <RefreshCw size={18} className="text-primary-400" />
            </button>
            <div className="w-10 h-10 rounded-full bg-primary-600 flex items-center justify-center font-bold">F</div>
          </div>
        </header>

        <div className="flex-1 overflow-y-auto p-6 lg:p-10 custom-scrollbar">
          {activeTab === 'dashboard' && (
            <div className="space-y-10">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <StatCard icon={<Users className="text-blue-400" />} label="Network Reach" value={stats.totalReach.toLocaleString()} color="blue" />
                <StatCard icon={<Eye className="text-purple-400" />} label="Viral Views" value={stats.totalViews.toLocaleString()} color="purple" />
                <StatCard icon={<Heart className="text-red-400" />} label="Total Hearts" value={(stats as any).totalLikes?.toLocaleString() || '0'} color="red" />
              </div>

              <div>
                <h3 className="text-xl font-bold mb-8 flex items-center gap-3">
                  <div className="w-1 h-6 bg-primary-500 rounded-full"></div>
                  Performance Pulse
                </h3>
                
                <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
                  {stats.recentPosts.map((post) => (
                    <div key={post._id} className="glass-card p-4 flex gap-5 group hover:bg-white/[0.03] transition-all duration-500">
                      <div className="w-24 h-32 lg:w-28 lg:h-36 rounded-2xl overflow-hidden flex-shrink-0 shadow-2xl relative bg-black">
                        {post.mediaUrl.includes('.mp4') || (post.insights?.media_url && post.insights.media_url.includes('video')) ? (
                          <video 
                            src={post.insights?.media_url || post.mediaUrl} 
                            className="w-full h-full object-cover" 
                            controls 
                            preload="metadata" 
                            crossOrigin="anonymous" 
                          />
                        ) : (
                          <img src={post.insights?.media_url || post.mediaUrl} className="w-full h-full object-cover" loading="lazy" />
                        )}
                      </div>

                      <div className="flex-1 flex flex-col justify-between py-1 overflow-hidden">
                        <div>
                          <div className="flex justify-between items-start">
                             <p className="text-[9px] text-gray-500 font-bold uppercase">{new Date(post.postedAt).toLocaleDateString()}</p>
                             <div className="flex gap-2">
                                <InsightBadge icon={<Heart size={10} />} label={post.insights?.likes || 0} color="red" />
                                <InsightBadge icon={<MessageCircle size={10} />} label={post.insights?.comments || 0} color="blue" />
                             </div>
                          </div>
                          <p className="text-sm font-semibold line-clamp-2 mt-3 text-gray-200">{post.description}</p>
                        </div>
                        <div className="flex flex-wrap items-center gap-3 mt-4">
                          <InsightBadge icon={<Users size={12} />} label={post.insights?.reach || 0} color="blue" />
                          <InsightBadge icon={<Eye size={12} />} label={post.insights?.video_views || 0} color="purple" />
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {activeTab === 'cloud' && (
            <div className="space-y-8">
              <h2 className="text-3xl font-black text-white">Cloud Pool</h2>
              {cloudPool.length === 0 ? (
                 <div className="p-20 text-center glass-card">
                    <Cloud size={48} className="mx-auto mb-4 text-gray-700" />
                    <p className="text-gray-500">Cloudinary account is empty. Auto-sourcing active.</p>
                 </div>
              ) : (
                <div className="media-grid">
                  {cloudPool.map((item) => (
                    <div key={item.id} onClick={() => setSelectedMedia(item)} className="group relative aspect-[4/5] rounded-3xl overflow-hidden border border-white/5 hover:border-primary-500/50 transition-all cursor-pointer bg-black">
                      {item.resource_type === 'video' ? (
                        <video src={item.url} className="w-full h-full object-cover" muted onMouseOver={e => e.currentTarget.play()} onMouseOut={e => { e.currentTarget.pause(); e.currentTarget.currentTime = 0; }} />
                      ) : (
                        <img src={item.url} className="w-full h-full object-cover" loading="lazy" />
                      )}
                      <div className="absolute top-4 right-4 bg-black/60 px-2 py-1 rounded text-[8px] font-bold text-white uppercase">{item.resource_type}</div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {activeTab === 'media' && (
            <div className="space-y-8">
              <h2 className="text-3xl font-black text-white">Discovery Hub</h2>
              <div className="media-grid">
                {images.map((img) => (
                  <div key={img.id} onClick={() => setSelectedMedia(img)} className="group aspect-[4/5] rounded-3xl overflow-hidden border border-white/5 hover:border-primary-500 transition-all cursor-pointer">
                    <img src={img.previewUrl} className="w-full h-full object-cover" loading="lazy" />
                  </div>
                ))}
              </div>
            </div>
          )}

          {activeTab === 'analytics' && (
            <div className="space-y-8">
              <h2 className="text-3xl font-black text-white">Analytics</h2>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <StatCard icon={<BarChart3 className="text-primary-400" />} label="Total Posts" value={stats.totalPosts.toLocaleString()} color="blue" />
                <StatCard icon={<Eye className="text-purple-400" />} label="Total Reach" value={stats.totalReach.toLocaleString()} color="purple" />
                <StatCard icon={<Heart className="text-red-400" />} label="Total Views" value={stats.totalViews.toLocaleString()} color="red" />
              </div>

              {/* 7-Day Posts Chart */}
              <div className="p-8 rounded-[2rem] border border-white/5 bg-white/[0.01]">
                <h3 className="text-lg font-bold mb-6 flex items-center gap-3">
                  <div className="w-1 h-5 bg-primary-500 rounded-full"></div>
                  Posts Per Day (Last 7 Days)
                </h3>
                <BarChart data={history} valueKey="posts" color="#3b82f6" />
              </div>

              {/* 7-Day Reach Chart */}
              <div className="p-8 rounded-[2rem] border border-white/5 bg-white/[0.01]">
                <h3 className="text-lg font-bold mb-6 flex items-center gap-3">
                  <div className="w-1 h-5 bg-purple-500 rounded-full"></div>
                  Reach Per Day (Last 7 Days)
                </h3>
                <BarChart data={history} valueKey="reach" color="#a855f7" />
              </div>
            </div>
          )}

          {activeTab === 'logs' && (
            <div className="p-6 bg-black/40 rounded-[2rem] border border-white/5 font-mono text-xs overflow-y-auto h-[60vh] space-y-2 custom-scrollbar">
               {logs.map(log => (
                 <div key={log._id} className="flex gap-4 p-2 hover:bg-white/5 rounded-lg">
                    <span className="text-gray-600 font-bold">[{new Date(log.createdAt).toLocaleTimeString()}]</span>
                    <span className={log.level === 'error' ? 'text-red-400' : 'text-primary-400'}>{log.message}</span>
                 </div>
               ))}
            </div>
          )}
        </div>
      </main>

      {isMobile && (
        <div className="fixed bottom-0 left-0 right-0 h-[75px] bg-[#030712]/90 backdrop-blur-2xl border-t border-white/5 flex justify-around items-center px-4 z-[100]">
          <MobileNavItem icon={<LayoutDashboard size={22} />} active={activeTab === 'dashboard'} onClick={() => setActiveTab('dashboard')} />
          <MobileNavItem icon={<Cloud size={22} />} active={activeTab === 'cloud'} onClick={() => setActiveTab('cloud')} />
          <MobileNavItem icon={<ImageIcon size={22} />} active={activeTab === 'media'} onClick={() => setActiveTab('media')} />
          <MobileNavItem icon={<BarChart3 size={22} />} active={activeTab === 'analytics'} onClick={() => setActiveTab('analytics')} />
          <MobileNavItem icon={<Terminal size={22} />} active={activeTab === 'logs'} onClick={() => setActiveTab('logs')} />
        </div>
      )}

      <AnimatePresence>
        {selectedMedia && (
          <div className="fixed inset-0 z-[200] flex items-center justify-center p-4 bg-[#030712]/95 backdrop-blur-2xl">
            <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.9 }} className="bg-[#030712] border border-white/10 rounded-[2.5rem] w-full max-w-5xl h-[90vh] lg:h-[80vh] overflow-hidden flex flex-col lg:flex-row">
              <div className="flex-1 bg-black flex items-center justify-center relative">
                {selectedMedia.resource_type === 'video' || selectedMedia.url.includes('.mp4') ? (
                   <video src={selectedMedia.url} className="max-h-full max-w-full" controls autoPlay crossOrigin="anonymous" />
                ) : (
                   <img src={selectedMedia.url} className="max-h-full max-w-full" />
                )}
                <button onClick={() => { setSelectedMedia(null); setVerifyPass(false); }} className="absolute top-6 left-6 p-3 bg-white/5 rounded-2xl hover:bg-white/10 transition-all border border-white/10">
                  <X size={24} />
                </button>
              </div>

              <div className="w-full lg:w-[380px] p-8 lg:p-10 flex flex-col bg-[#030712] border-t lg:border-t-0 lg:border-l border-white/5 overflow-y-auto">
                <h3 className="text-2xl font-black italic mb-8">Manual Publish</h3>
                <textarea 
                  className="w-full h-full min-h-[200px] bg-white/[0.02] border border-white/5 rounded-3xl p-5 text-sm focus:border-primary-500 outline-none mb-6 text-gray-200"
                  placeholder="Enter caption..."
                  value={caption}
                  onChange={(e) => setCaption(e.target.value)}
                />
                <div className="mb-6 p-5 bg-primary-500/5 border border-primary-500/10 rounded-3xl">
                   <p className="text-[10px] font-black text-primary-400 uppercase mb-3">Confirm Secret</p>
                   <input type="password" placeholder="Admin Password" className="w-full bg-black/40 border border-white/10 rounded-xl py-3 px-4 text-sm focus:border-primary-500 outline-none" onChange={e => setVerifyPass(e.target.value === localStorage.getItem('flora_pass'))} />
                </div>
                <button disabled={posting || !verifyPass} onClick={handleQuickPublish} className={`w-full py-5 rounded-3xl font-black uppercase text-sm tracking-widest transition-all ${!verifyPass ? 'bg-gray-800 text-gray-500' : 'bg-primary-600 hover:bg-primary-500 text-white shadow-xl shadow-primary-600/20'}`}>
                  {posting ? <Loader2 className="animate-spin" size={20} /> : verifyPass ? 'Publish Now' : 'Locked'}
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {showSuccess && (
          <motion.div initial={{ opacity: 0, y: 100, x: '-50%' }} animate={{ opacity: 1, y: 0, x: '-50%' }} exit={{ opacity: 0, y: 100, x: '-50%' }} className="fixed bottom-12 left-1/2 bg-white text-gray-950 px-8 py-4 rounded-full shadow-2xl flex items-center gap-4 z-[300]">
            <CheckCircle2 size={18} className="text-green-500" />
            <p className="font-black text-sm uppercase">Success!</p>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

function NavItem({ icon, label, active = false, onClick }: { icon: any, label: string, active?: boolean, onClick?: () => void }) {
  return (
    <button onClick={onClick} className={`w-full flex items-center gap-4 px-5 py-4 rounded-2xl transition-all ${active ? 'bg-white/5 text-white shadow-xl border border-white/5' : 'text-gray-500 hover:text-white hover:bg-white/[0.02]'}`}>
      <div className={active ? 'text-primary-500' : 'text-gray-500'}>{icon}</div>
      <span className={`font-bold text-sm ${active ? 'text-white' : 'text-gray-500'}`}>{label}</span>
    </button>
  );
}

function MobileNavItem({ icon, active, onClick }: { icon: any, active: boolean, onClick: () => void }) {
  return (
    <button onClick={onClick} className={`p-4 rounded-2xl transition-all ${active ? 'text-primary-500 bg-primary-500/10' : 'text-gray-500'}`}>
      {icon}
    </button>
  );
}

// ─── CSS Bar Chart Component ───────────────────────────────────────────────
function BarChart({ data, valueKey, color }: { data: HistoryDay[], valueKey: 'posts' | 'reach', color: string }) {
  const max = Math.max(...data.map(d => d[valueKey]), 1);
  return (
    <div className="flex items-end gap-3 h-48">
      {data.map((day, i) => {
        const pct = (day[valueKey] / max) * 100;
        return (
          <div key={i} className="flex-1 flex flex-col items-center gap-2 h-full justify-end">
            <span className="text-[10px] font-bold text-gray-400">{day[valueKey] > 0 ? day[valueKey].toLocaleString() : ''}</span>
            <div
              className="w-full rounded-t-xl transition-all duration-700"
              style={{ height: `${Math.max(pct, 3)}%`, backgroundColor: color, opacity: 0.7 + (i / data.length) * 0.3 }}
            />
            <span className="text-[9px] text-gray-600 font-semibold text-center leading-tight">{day.date.split(' ').slice(0,2).join(' ')}</span>
          </div>
        );
      })}
      {data.length === 0 && (
        <div className="flex-1 flex items-center justify-center text-gray-600 text-sm">No data yet</div>
      )}
    </div>
  );
}

function StatCard({ icon, label, value, color }: { icon: any, label: string, value: string, color: string }) {
  const colors: any = { blue: 'text-blue-400', purple: 'text-purple-400', red: 'text-red-400' };
  return (
    <div className={`p-8 rounded-[2rem] border border-white/5 bg-white/[0.01] flex flex-col gap-2 relative overflow-hidden`}>
      <div className="flex items-center gap-3 mb-2">
        <div className={`p-2.5 rounded-xl bg-white/5 ${colors[color]}`}>{icon}</div>
        <span className="text-[10px] font-black text-gray-500 uppercase tracking-widest">{label}</span>
      </div>
      <span className="text-4xl font-black tracking-tighter text-white">{value}</span>
    </div>
  );
}

function InsightBadge({ icon, label, color }: { icon: any, label: string | number, color: string }) {
  const colors: any = { blue: 'text-blue-400 bg-blue-400/10 border-blue-500/10', purple: 'text-purple-400 bg-purple-400/10 border-purple-500/10', red: 'text-red-400 bg-red-400/10 border-red-500/10' };
  return (
    <div className={`flex items-center gap-1.5 text-[9px] px-2 py-1 rounded-lg border font-bold ${colors[color]}`}>
      {icon} {label}
    </div>
  );
}

export default App;
