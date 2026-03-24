'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  FolderPlus, 
  Search, 
  Filter, 
  MoreVertical, 
  Folder, 
  FileText, 
  Calendar, 
  User, 
  Mail, 
  Award,
  Plus
} from 'lucide-react';
import axios from 'axios';
import ThreeBackground from '@/components/layout/ThreeBackground';

const DashboardPage = () => {
  const [folders, setFolders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');

  // Dummy user data
  const user = {
    name: "Hari Ganessh",
    email: "hariganessh@example.com",
    role: "Premium Member",
    quizzesGenerated: 42,
    foldersCreated: 12
  };

  useEffect(() => {
    fetchFolders();
  }, []);

  const fetchFolders = async () => {
    try {
      const response = await axios.get('/api/folders');
      if (response.data.success) {
        setFolders(response.data.data);
      }
    } catch (error) {
      console.error("Error fetching folders:", error);
    } finally {
      setLoading(false);
    }
  };

  const filteredFolders = folders.filter(f => 
    f.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="relative min-h-screen pt-12 pb-24 px-6">
      <ThreeBackground />
      
      <div className="container mx-auto max-w-7xl relative z-10">
        {/* User Profile Section */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-12"
        >
          <div className="md:col-span-1 bg-white/5 backdrop-blur-xl border border-white/10 rounded-3xl p-8 flex flex-col items-center text-center shadow-2xl">
            <div className="w-24 h-24 rounded-full bg-gradient-to-tr from-primary to-purple-500 p-1 mb-4 shadow-lg shadow-primary/30">
              <div className="w-full h-full rounded-full bg-[#0a0a0a] flex items-center justify-center border-4 border-[#0a0a0a]">
                <User className="w-12 h-12 text-white" />
              </div>
            </div>
            <h2 className="text-2xl font-bold text-white mb-1">{user.name}</h2>
            <p className="text-gray-400 text-sm mb-4 flex items-center justify-center">
              <Mail className="w-3 h-3 mr-1" /> {user.email}
            </p>
            <div className="px-3 py-1 bg-primary/20 border border-primary/30 rounded-full text-primary text-xs font-bold uppercase tracking-wider mb-6">
              {user.role}
            </div>
            
            <div className="grid grid-cols-2 gap-4 w-full pt-6 border-t border-white/10">
              <div className="text-center">
                <div className="text-xl font-bold text-white">{user.quizzesGenerated}</div>
                <div className="text-[10px] text-gray-500 uppercase tracking-tighter">Quizzes</div>
              </div>
              <div className="text-center">
                <div className="text-xl font-bold text-white">{user.foldersCreated}</div>
                <div className="text-[10px] text-gray-500 uppercase tracking-tighter">Folders</div>
              </div>
            </div>
          </div>

          <div className="md:col-span-3 bg-white/5 backdrop-blur-xl border border-white/10 rounded-3xl p-8 shadow-2xl overflow-hidden relative group">
            <div className="absolute -top-24 -right-24 w-64 h-64 bg-primary/20 rounded-full blur-[100px] pointer-events-none group-hover:bg-primary/30 transition-all duration-500" />
            
            <div className="flex justify-between items-center mb-8 relative z-10">
              <div>
                <h1 className="text-4xl font-extrabold text-white mb-2">My Folders</h1>
                <p className="text-gray-400">Manage and organize your quizzes efficiently</p>
              </div>
              <button 
                onClick={() => window.location.href = '/create-quiz'}
                className="p-4 bg-primary rounded-2xl text-white shadow-lg shadow-primary/20 hover:scale-105 active:scale-95 transition-all flex items-center space-x-2 font-bold"
              >
                <Plus className="w-6 h-6" />
                <span>New Folder</span>
              </button>
            </div>

            <div className="flex flex-col md:flex-row gap-4 mb-8">
              <div className="flex-1 relative">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500" />
                <input 
                  type="text" 
                  placeholder="Search folders..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-12 pr-4 py-4 bg-white/5 border border-white/10 rounded-2xl text-white focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all"
                />
              </div>
              <button className="px-6 py-4 bg-white/5 border border-white/10 rounded-2xl text-gray-400 hover:text-white transition-all flex items-center space-x-2">
                <Filter className="w-5 h-5" />
                <span>Filter</span>
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {loading ? (
                Array(3).fill(0).map((_, i) => (
                  <div key={i} className="h-48 bg-white/5 animate-pulse rounded-3xl" />
                ))
              ) : filteredFolders.length > 0 ? (
                filteredFolders.map((folder, index) => (
                  <motion.div 
                    key={folder._id}
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: index * 0.1 }}
                    className="group relative bg-[#121212]/50 border border-white/5 hover:border-primary/50 rounded-3xl p-6 transition-all hover:shadow-2xl hover:shadow-primary/5 cursor-pointer"
                  >
                    <div className="absolute top-4 right-4 text-gray-600 group-hover:text-gray-400 transition-colors">
                      <MoreVertical className="w-5 h-5" />
                    </div>
                    
                    <div className="w-14 h-14 bg-gradient-to-br from-primary/10 to-purple-500/10 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                      <Folder className="w-8 h-8 text-primary" />
                    </div>
                    
                    <h3 className="text-xl font-bold text-white mb-2 group-hover:text-primary transition-colors truncate">{folder.name}</h3>
                    <p className="text-gray-500 text-sm mb-6 line-clamp-1">{folder.description || "No description"}</p>
                    
                    <div className="flex items-center justify-between pt-4 border-t border-white/5">
                      <div className="flex items-center text-gray-500 text-[10px] uppercase font-bold tracking-widest">
                        <Calendar className="w-3 h-3 mr-1" />
                        {new Date(folder.createdAt).toLocaleDateString()}
                      </div>
                      <div className="flex items-center text-primary text-[10px] font-bold">
                        <FileText className="w-3 h-3 mr-1" />
                        VIEW QUIZZES
                      </div>
                    </div>
                  </motion.div>
                ))
              ) : (
                <div className="col-span-full py-20 flex flex-col items-center justify-center text-center opacity-50">
                  <FolderPlus className="w-20 h-20 mb-6 text-gray-500" />
                  <h3 className="text-2xl font-bold text-white mb-2">No folders found</h3>
                  <p className="text-gray-500">Create your first folder to organize your work!</p>
                </div>
              )}
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default DashboardPage;


