import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, Upload, MapPin, Calendar, Tag, Info } from 'lucide-react';
import { CATEGORIES, LOCATIONS, ItemType } from '../types';
import { ItemService } from '../lib/itemService';

interface ReportFormProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export default function ReportForm({ isOpen, onClose, onSuccess }: ReportFormProps) {
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    type: 'lost' as ItemType,
    title: '',
    description: '',
    category: CATEGORIES[0],
    location: LOCATIONS[0],
    date: new Date().toISOString().split('T')[0],
    imageUrl: '',
    coordinates: null as { lat: number, lng: number } | null
  });

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Check size (Firestore limit is 1MB, let's keep it under 500KB for safety)
    if (file.size > 500 * 1024) {
      alert("Image is too large. Please select an image under 500KB.");
      return;
    }

    const reader = new FileReader();
    reader.onloadend = () => {
      setFormData({ ...formData, imageUrl: reader.result as string });
    };
    reader.readAsDataURL(file);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      await ItemService.createItem(formData);
      onSuccess();
      onClose();
      // Reset form
      setFormData({
        type: 'lost',
        title: '',
        description: '',
        category: CATEGORIES[0],
        location: LOCATIONS[0],
        date: new Date().toISOString().split('T')[0],
        imageUrl: '',
        coordinates: null
      });
    } catch (error) {
      alert("Error reporting item. Please check console for details.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="absolute inset-0 bg-[#1A1A1A]/40 backdrop-blur-md"
          />
          <motion.div
            initial={{ opacity: 0, y: 100 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 100 }}
            className="relative bg-[#FBFBF9] w-full max-w-2xl border-t-[12px] border-[#1A1A1A] shadow-2xl overflow-hidden max-h-[95vh] flex flex-col"
          >
            <div className="p-10 border-b border-[#1A1A1A]/10 flex items-start justify-between">
              <div>
                <span className="text-[10px] uppercase tracking-[0.4em] font-bold text-[#D44A32] mb-2 block">Entry Form</span>
                <h2 className="text-4xl font-serif italic tracking-tight">Report Item</h2>
              </div>
              <button 
                onClick={onClose}
                className="p-2 hover:bg-black/5 rounded-full transition-colors mt-2"
              >
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-10 overflow-y-auto space-y-8 no-scroll">
              <div className="flex gap-4">
                {(['lost', 'found'] as ItemType[]).map((type) => (
                  <button
                    key={type}
                    type="button"
                    onClick={() => setFormData({ ...formData, type })}
                    className={`flex-1 py-4 border-2 transition-all uppercase tracking-[0.2em] text-[11px] font-black
                      ${formData.type === type 
                        ? 'bg-[#1A1A1A] border-[#1A1A1A] text-white' 
                        : 'bg-transparent border-[#1A1A1A]/10 text-[#1A1A1A]/40 hover:border-[#1A1A1A]/30'}`}
                  >
                    {type}
                  </button>
                ))}
              </div>

              <div className="space-y-6">
                <div className="space-y-2">
                  <label className="text-[10px] uppercase tracking-[0.2em] font-bold text-[#1A1A1A]/60">ITEM</label>
                  <input
                    required
                    type="text"
                    placeholder="Brief description of the item"
                    className="w-full bg-transparent border-b border-[#1A1A1A] py-3 text-lg font-serif outline-none placeholder:text-[#1A1A1A]/20"
                    value={formData.title}
                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  <div className="space-y-2">
                    <label className="text-[10px] uppercase tracking-[0.2em] font-bold text-[#1A1A1A]/60">Category</label>
                    <select
                      className="w-full bg-transparent border-b border-[#1A1A1A]/20 focus:border-[#1A1A1A] py-3 text-sm outline-none appearance-none cursor-pointer transition-colors"
                      value={formData.category}
                      onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                    >
                      {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
                    </select>
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] uppercase tracking-[0.2em] font-bold text-[#1A1A1A]/60">Date of Incident</label>
                    <input
                      required
                      type="date"
                      className="w-full bg-transparent border-b border-[#1A1A1A]/20 focus:border-[#1A1A1A] py-3 text-sm outline-none transition-colors"
                      value={formData.date}
                      onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-[10px] uppercase tracking-[0.2em] font-bold text-[#1A1A1A]/60">Location (Area)</label>
                  <select
                    className="w-full bg-transparent border-b border-[#1A1A1A]/20 focus:border-[#1A1A1A] py-3 text-sm outline-none appearance-none cursor-pointer transition-colors"
                    value={formData.location}
                    onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                  >
                    {LOCATIONS.map(l => <option key={l} value={l}>{l}</option>)}
                  </select>
                </div>

                <div className="space-y-2">
                  <label className="text-[10px] uppercase tracking-[0.2em] font-bold text-[#1A1A1A]/60">Details</label>
                  <textarea
                    required
                    rows={3}
                    placeholder="Specific markings, color, brand, etc."
                    className="w-full bg-transparent border-b border-[#1A1A1A] py-3 text-sm outline-none resize-none placeholder:text-[#1A1A1A]/20"
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-[10px] uppercase tracking-[0.2em] font-bold text-[#1A1A1A]/60">Visual Proof</label>
                  <div className="relative">
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleFileChange}
                      className="hidden"
                      id="image-upload"
                    />
                    <label 
                      htmlFor="image-upload"
                      className="flex items-center justify-center gap-3 w-full border-2 border-dashed border-[#1A1A1A]/10 py-10 rounded-xl cursor-pointer hover:bg-black/5 transition-all group"
                    >
                      {formData.imageUrl ? (
                        <div className="flex flex-col items-center">
                          <img src={formData.imageUrl} className="h-20 w-20 object-cover rounded mb-2 border border-[#1A1A1A]/10" alt="Preview" />
                          <span className="text-[10px] uppercase tracking-widest font-bold">Change Image</span>
                        </div>
                      ) : (
                        <>
                          <Upload size={20} className="text-[#1A1A1A]/20 group-hover:text-[#1A1A1A]/40 transition-colors" />
                          <span className="text-[10px] uppercase tracking-widest font-bold text-[#1A1A1A]/40">Click to Upload Photo</span>
                        </>
                      )}
                    </label>
                  </div>
                </div>
              </div>
            </form>

            <div className="p-10 border-t border-[#1A1A1A]/10 flex items-center justify-between bg-white/50">
              <button
                type="button"
                onClick={onClose}
                className="text-[11px] uppercase tracking-[0.2em] font-bold opacity-40 hover:opacity-100 transition-opacity"
              >
                Cancel
              </button>
              <button
                onClick={handleSubmit}
                disabled={loading}
                className="px-12 py-5 bg-[#1A1A1A] text-white text-[11px] uppercase tracking-[0.3em] font-black hover:bg-[#D44A32] disabled:opacity-50 transition-all flex items-center gap-4"
              >
                {loading ? 'Processing...' : 'Submit Entry'}
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
