'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  FolderPlus, 
  FilePlus, 
  ChevronRight, 
  CheckCircle2, 
  Layout, 
  Database, 
  ArrowRight,
  Loader2,
  Trash2,
  Edit2
} from 'lucide-react';
import axios from 'axios';
import ThreeBackground from '@/components/ThreeBackground';

const CreateQuizPage = () => {
  const [folders, setFolders] = useState([]);
  const [selectedFolder, setSelectedFolder] = useState(null);
  const [newFolderName, setNewFolderName] = useState('');
  const [newFolderDesc, setNewFolderDesc] = useState('');
  const [quizTitle, setQuizTitle] = useState('');
  const [loading, setLoading] = useState(false);
  const [step, setStep] = useState(1);
  const [showFolderModal, setShowFolderModal] = useState(false);

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
    }
  };

  const handleCreateFolder = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const response = await axios.post('/api/folders', {
        name: newFolderName,
        description: newFolderDesc
      });
      if (response.data.success) {
        setFolders([response.data.data, ...folders]);
        setSelectedFolder(response.data.data);
        setShowFolderModal(false);
        setNewFolderName('');
        setNewFolderDesc('');
        setStep(2);
      }
    } catch (error) {
      console.error("Error creating folder:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateQuiz = async (e) => {
    e.preventDefault();
    if (!selectedFolder) return;
    setLoading(true);
    try {
      const response = await axios.post('/api/quizzes', {
        title: quizTitle,
        folderId: selectedFolder._id,
      });
      if (response.data.success) {
        // Redirect to dashboard or quiz editor
        window.location.href = '/dashboard';
      }
    } catch (error) {
      console.error("Error creating quiz:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteFolder = async (id, e) => {
    e.stopPropagation();
    if (!confirm('Are you sure you want to delete this folder and all its quizzes?')) return;
    try {
      await axios.delete(`/api/folders/${id}`);
      setFolders(folders.filter(f => f._id !== id));
      if (selectedFolder?._id === id) setSelectedFolder(null);
    } catch (error) {
      console.error("Error deleting folder:", error);
    }
  };

  return (
    <div className="relative min-h-screen pt-12 pb-24 px-6 overflow-hidden">
      <ThreeBackground />
      
      <div className="container mx-auto max-w-5xl relative z-10">
        <motion.div 
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="text-center mb-16"
        >
          <div className="inline-block p-4 bg-primary/20 rounded-3xl mb-6 backdrop-blur-xl border border-primary/30">
            <Layout className="w-12 h-12 text-primary" />
          </div>
          <h1 className="text-5xl font-black text-white mb-4 tracking-tight">Create Your Masterpiece</h1>
          <p className="text-gray-400 text-xl max-w-2xl mx-auto">Organize your knowledge with folders and craft engaging quizzes in seconds.</p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-12 gap-12">
          {/* Progress Tracker */}
          <div className="md:col-span-3 space-y-4">
            {[
              { id: 1, name: 'Select Folder', icon: FolderPlus },
              { id: 2, name: 'Quiz Details', icon: FilePlus },
              { id: 3, name: 'Success!', icon: CheckCircle2 }
            ].map((s) => (
              <div 
                key={s.id}
                className={`flex items-center space-x-4 p-4 rounded-2xl transition-all ${
                  step === s.id ? 'bg-primary text-white shadow-lg shadow-primary/20' : 'bg-white/5 text-gray-500'
                }`}
              >
                <div className={`w-8 h-8 rounded-full flex items-center justify-center ${step === s.id ? 'bg-white text-primary' : 'bg-white/10'}`}>
                  {step > s.id ? <CheckCircle2 className="w-5 h-5 text-green-500" /> : <s.icon className="w-4 h-4" />}
                </div>
                <span className="font-bold text-sm tracking-wide uppercase">{s.name}</span>
              </div>
            ))}
          </div>

          <div className="md:col-span-9">
            <AnimatePresence mode="wait">
              {step === 1 && (
                <motion.div
                  key="step1"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  className="bg-white/5 backdrop-blur-3xl border border-white/10 rounded-[40px] p-10 shadow-2xl relative overflow-hidden"
                >
                  <div className="absolute top-0 right-0 w-64 h-64 bg-primary/5 rounded-full blur-[100px] pointer-events-none" />
                  
                  <div className="flex justify-between items-center mb-8">
                    <h2 className="text-3xl font-bold text-white">Choose a Folder</h2>
                    <button 
                      onClick={() => setShowFolderModal(true)}
                      className="px-6 py-3 bg-white/10 border border-white/10 rounded-2xl text-white hover:bg-white/20 transition-all font-bold flex items-center space-x-2"
                    >
                      <Plus className="w-5 h-5" />
                      <span>New Folder</span>
                    </button>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {folders.map((folder) => (
                      <div 
                        key={folder._id}
                        onClick={() => setSelectedFolder(folder)}
                        className={`group p-6 rounded-3xl border transition-all cursor-pointer relative overflow-hidden ${
                          selectedFolder?._id === folder._id 
                            ? 'bg-primary/20 border-primary shadow-2xl shadow-primary/10' 
                            : 'bg-white/5 border-white/10 hover:border-white/20'
                        }`}
                      >
                        <div className="flex justify-between items-start mb-4">
                          <div className={`p-3 rounded-2xl ${selectedFolder?._id === folder._id ? 'bg-primary text-white' : 'bg-white/10 text-gray-400'}`}>
                            <Database className="w-6 h-6" />
                          </div>
                          <button 
                            onClick={(e) => handleDeleteFolder(folder._id, e)}
                            className="p-2 text-gray-600 hover:text-red-400 transition-colors opacity-0 group-hover:opacity-100"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                        <h3 className="text-xl font-bold text-white mb-1">{folder.name}</h3>
                        <p className="text-gray-500 text-sm line-clamp-1">{folder.description || "No description"}</p>
                        
                        {selectedFolder?._id === folder._id && (
                          <motion.div 
                            layoutId="check"
                            className="absolute top-6 right-6 text-primary"
                          >
                            <CheckCircle2 className="w-6 h-6" />
                          </motion.div>
                        )}
                      </div>
                    ))}
                  </div>

                  <div className="mt-12 flex justify-end">
                    <button 
                      disabled={!selectedFolder}
                      onClick={() => setStep(2)}
                      className={`px-10 py-5 rounded-3xl font-black text-lg transition-all flex items-center space-x-3 ${
                        selectedFolder 
                          ? 'bg-primary text-white shadow-2xl shadow-primary/40 hover:scale-105 active:scale-95' 
                          : 'bg-white/5 text-gray-600 cursor-not-allowed'
                      }`}
                    >
                      <span>Continue to Quiz</span>
                      <ArrowRight className="w-6 h-6" />
                    </button>
                  </div>
                </motion.div>
              )}

              {step === 2 && (
                <motion.div
                  key="step2"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  className="bg-white/5 backdrop-blur-3xl border border-white/10 rounded-[40px] p-10 shadow-2xl"
                >
                  <button 
                    onClick={() => setStep(1)}
                    className="mb-8 text-gray-500 hover:text-white transition-colors flex items-center space-x-2 font-bold"
                  >
                    <span>← Back to Folders</span>
                  </button>
                  
                  <h2 className="text-3xl font-bold text-white mb-2">Quiz Information</h2>
                  <p className="text-gray-400 mb-8">Set a title for your amazing quiz in <span className="text-primary font-bold">{selectedFolder?.name}</span></p>

                  <form onSubmit={handleCreateQuiz} className="space-y-8">
                    <div className="space-y-3">
                      <label className="text-sm font-bold text-gray-500 uppercase tracking-widest ml-1">Quiz Title</label>
                      <input 
                        required
                        type="text" 
                        placeholder="e.g. Modern Web Architecture"
                        value={quizTitle}
                        onChange={(e) => setQuizTitle(e.target.value)}
                        className="w-full bg-white/5 border border-white/10 hover:border-white/20 rounded-[30px] p-6 text-xl text-white focus:outline-none focus:ring-4 focus:ring-primary/20 transition-all placeholder:text-gray-700"
                      />
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-4">
                      <div className="p-6 bg-white/5 rounded-3xl border border-white/5 text-center">
                        <div className="text-3xl font-black text-white mb-1">AI</div>
                        <div className="text-[10px] text-gray-500 uppercase tracking-tighter">Powered Generation</div>
                      </div>
                      <div className="p-6 bg-white/5 rounded-3xl border border-white/5 text-center">
                        <div className="text-3xl font-black text-white mb-1">20+</div>
                        <div className="text-[10px] text-gray-500 uppercase tracking-tighter">Question Types</div>
                      </div>
                    </div>

                    <button 
                      type="submit"
                      disabled={loading || !quizTitle}
                      className="w-full bg-primary py-6 rounded-3xl text-white font-black text-xl shadow-2xl shadow-primary/30 hover:scale-[1.02] active:scale-95 transition-all flex items-center justify-center space-x-4 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {loading ? <Loader2 className="w-8 h-8 animate-spin" /> : (
                        <>
                          <span>Create Launch Ready Quiz</span>
                          <ArrowRight className="w-8 h-8" />
                        </>
                      )}
                    </button>
                  </form>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </div>

      {/* New Folder Modal */}
      <AnimatePresence>
        {showFolderModal && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 bg-black/60 backdrop-blur-sm">
            <motion.div 
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className="bg-[#0a0a0a] border border-white/10 rounded-[40px] p-10 max-w-lg w-full shadow-2xl"
            >
              <h2 className="text-3xl font-bold text-white mb-6">Create New Folder</h2>
              <form onSubmit={handleCreateFolder} className="space-y-6">
                <div>
                  <label className="block text-sm font-bold text-gray-500 mb-2 uppercase tracking-widest">Name</label>
                  <input 
                    required
                    type="text" 
                    value={newFolderName}
                    onChange={(e) => setNewFolderName(e.target.value)}
                    className="w-full bg-white/5 border border-white/10 rounded-2xl p-4 text-white focus:outline-none focus:ring-2 focus:ring-primary/50"
                  />
                </div>
                <div>
                  <label className="block text-sm font-bold text-gray-500 mb-2 uppercase tracking-widest">Description</label>
                  <textarea 
                    value={newFolderDesc}
                    onChange={(e) => setNewFolderDesc(e.target.value)}
                    rows={3}
                    className="w-full bg-white/5 border border-white/10 rounded-2xl p-4 text-white focus:outline-none focus:ring-2 focus:ring-primary/50"
                  />
                </div>
                <div className="flex space-x-4 pt-4">
                  <button 
                    type="button"
                    onClick={() => setShowFolderModal(false)}
                    className="flex-1 py-4 bg-white/5 text-white rounded-2xl font-bold hover:bg-white/10 transition-all text-sm"
                  >
                    Cancel
                  </button>
                  <button 
                    type="submit"
                    disabled={loading || !newFolderName}
                    className="flex-1 py-4 bg-primary text-white rounded-2xl font-bold shadow-lg shadow-primary/20 hover:scale-105 active:scale-95 transition-all text-sm flex items-center justify-center"
                  >
                    {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : "Create Folder"}
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default CreateQuizPage;
