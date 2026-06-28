import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, MapPin, Calendar, Tag, User, Hash, MessageCircle, CheckCircle } from 'lucide-react';
import { Item } from '../types';
import { auth } from '../lib/firebase';
import { ItemService } from '../lib/itemService';

interface ItemDetailProps {
  item: Item | null;
  onClose: () => void;
}

export default function ItemDetail({ item, onClose }: ItemDetailProps) {
  const [isMatching, setIsMatching] = useState(false);
  const [isMatchLoading, setIsMatchLoading] = useState(false);
  const [myItems, setMyItems] = useState<Item[]>([]);
  const [selectedMyItemId, setSelectedMyItemId] = useState<string>('');
  
  // reset state when modal opens for a new item
  useEffect(() => {
    setIsMatching(false);
    setSelectedMyItemId('');
  }, [item?.id]);

  if (!item) return null;

  const isOwner = auth.currentUser?.uid === item.reporterId;

  const handleStatusChange = async (newStatus: 'active' | 'resolved' | 'archived') => {
    if (!item.id) return;
    try {
      await ItemService.updateItem(item.id, { status: newStatus });
      onClose();
    } catch (error) {
      alert("Failed to update status");
    }
  };

  const handleInitiateContact = async () => {
    try {
      setIsMatching(true);
      setIsMatchLoading(true);
      const oppositeType = item.type === 'lost' ? 'found' : 'lost';
      const fetchedItems = await ItemService.getMyActiveItems(oppositeType);
      setMyItems(fetchedItems);
      if (fetchedItems.length > 0) {
        setSelectedMyItemId(fetchedItems[0].id!);
      }
    } catch (error) {
      console.error(error);
    } finally {
      setIsMatchLoading(false);
    }
  };

  const handleConfirmMatch = async () => {
    if (!selectedMyItemId || !item.id) return;
    try {
      setIsMatchLoading(true);
      await ItemService.matchItems(selectedMyItemId, item.id);
      alert(`Match confirmed! Both items are marked as resolved.\n\nA notification has been generated for both users. You can check your notifications in the top right menu.`);
      onClose();
    } catch (error) {
      alert(error instanceof Error ? error.message : "Failed to initiate match.");
    } finally {
      setIsMatchLoading(false);
    }
  };

  return (
    <AnimatePresence>
      {item && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="absolute inset-0 bg-[#1A1A1A]/60 backdrop-blur-sm"
          />
          <motion.div
            initial={{ opacity: 0, y: 100 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 100 }}
            className="relative bg-[#FBFBF9] w-full max-w-5xl border-[12px] border-white shadow-2xl overflow-hidden max-h-[90vh] flex flex-col md:flex-row"
          >
            <button 
              onClick={onClose}
              className="absolute top-8 right-8 z-10 p-3 bg-white hover:bg-[#1A1A1A] hover:text-white transition-all shadow-xl"
            >
              <X size={20} />
            </button>

            <div className="w-full md:w-1/2 bg-[#E5E5E1] aspect-[4/5] md:aspect-auto border-r border-[#1A1A1A]/10">
              {item.imageUrl ? (
                <img 
                  src={item.imageUrl} 
                  alt={item.title} 
                  className="w-full h-full object-cover grayscale-[0.2] hover:grayscale-0 transition-all duration-700"
                  referrerPolicy="no-referrer"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-[#1A1A1A]/10">
                  <Tag size={120} strokeWidth={1} />
                </div>
              )}
            </div>

            <div className="w-full md:w-1/2 p-12 md:p-16 overflow-y-auto bg-[#FBFBF9] flex flex-col justify-between">
              <div>
                <header className="mb-12 border-b border-[#1A1A1A]/10 pb-8">
                  <span className={`text-[10px] uppercase tracking-[0.4em] font-black mb-4 block 
                    ${item.type === 'lost' ? 'text-[#D44A32]' : 'text-[#1A1A1A]'}`}>
                    Official Record / {item.type}
                  </span>
                  <h2 className="text-5xl font-serif italic tracking-tighter text-[#1A1A1A] leading-none mb-4">
                    {item.title}
                  </h2>
                  <p className="text-[11px] uppercase tracking-widest font-bold opacity-40">
                    Ref No. {item.id?.slice(-12).toUpperCase()}
                  </p>
                </header>

                <div className="grid grid-cols-2 gap-10 mb-12">
                  <div>
                    <span className="text-[9px] uppercase tracking-[0.2em] font-black opacity-30 block mb-2">Geo-Location</span>
                    <p className="text-sm font-bold tracking-tight">{item.location}</p>
                  </div>
                  <div>
                    <span className="text-[9px] uppercase tracking-[0.2em] font-black opacity-30 block mb-2">Temporal Marker</span>
                    <p className="text-sm font-bold tracking-tight">{new Date(item.date).toLocaleDateString(undefined, { dateStyle: 'medium' })}</p>
                  </div>
                </div>

                <div className="mb-12">
                  <span className="text-[9px] uppercase tracking-[0.2em] font-black opacity-30 block mb-3">Observational Data</span>
                  <p className="text-gray-600 leading-relaxed font-light italic text-lg">
                    "{item.description}"
                  </p>
                </div>
              </div>

              <div className="space-y-8">
                <div className="flex items-center justify-between p-6 bg-white border border-[#1A1A1A]/5 shadow-sm">
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 bg-[#1A1A1A] text-white flex items-center justify-center font-serif italic text-xl">
                      {item.reporterName?.[0]}
                    </div>
                    <div>
                      <span className="text-[9px] uppercase tracking-widest font-black opacity-30 block">Logged By</span>
                      <span className="text-xs font-bold">{item.reporterName}</span>
                    </div>
                  </div>
                </div>

                {isOwner ? (
                  <div className="grid grid-cols-2 gap-4">
                    <button 
                      onClick={() => handleStatusChange('resolved')}
                      className="px-6 py-5 bg-[#1A1A1A] text-white text-[11px] uppercase tracking-[0.3em] font-black hover:bg-green-600 transition-all active:scale-95 flex items-center justify-center gap-2"
                    >
                      <CheckCircle size={14} />
                      Mark as Resolved
                    </button>
                    <button 
                      onClick={() => handleStatusChange('archived')}
                      className="px-6 py-5 border border-[#1A1A1A] text-[#1A1A1A] text-[11px] uppercase tracking-[0.3em] font-black hover:bg-black hover:text-white transition-all active:scale-95"
                    >
                      Archive
                    </button>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {!isMatching ? (
                      <button 
                        onClick={handleInitiateContact}
                        className="w-full px-8 py-5 bg-[#1A1A1A] text-white text-[11px] uppercase tracking-[0.3em] font-black hover:bg-[#D44A32] transition-all shadow-xl shadow-black/10 flex items-center justify-center gap-4 group"
                      >
                        <MessageCircle size={18} className="group-hover:rotate-12 transition-transform" />
                        <span>Initiate Contact & Match</span>
                      </button>
                    ) : (
                      <div className="bg-white p-6 border border-[#1A1A1A]/10 shadow-sm space-y-6">
                        <div>
                          <h4 className="text-[10px] uppercase tracking-widest font-black mb-2">Select Your {item.type === 'lost' ? 'Found' : 'Lost'} Item</h4>
                          {isMatchLoading ? (
                            <p className="text-xs italic opacity-60">Loading your entries...</p>
                          ) : myItems.length > 0 ? (
                            <select 
                              value={selectedMyItemId}
                              onChange={(e) => setSelectedMyItemId(e.target.value)}
                              className="w-full bg-transparent border-b border-[#1A1A1A]/20 py-3 text-sm focus:border-[#1A1A1A] outline-none"
                            >
                              {myItems.map(mItem => (
                                <option key={mItem.id} value={mItem.id}>{mItem.title} ({mItem.location})</option>
                              ))}
                            </select>
                          ) : (
                            <p className="text-xs italic opacity-60 text-[#D44A32]">
                              You don't have any active {item.type === 'lost' ? 'found' : 'lost'} item records. Please report an item first to initiate a match.
                            </p>
                          )}
                        </div>
                        {myItems.length > 0 && !isMatchLoading && (
                          <div className="flex gap-4">
                            <button 
                              onClick={() => setIsMatching(false)}
                              className="flex-1 py-3 border border-[#1A1A1A] text-[#1A1A1A] text-[10px] uppercase tracking-widest font-black hover:bg-gray-100 transition-colors"
                            >
                              Cancel
                            </button>
                            <button 
                              onClick={handleConfirmMatch}
                              className="flex-1 py-3 bg-[#1A1A1A] text-white text-[10px] uppercase tracking-widest font-black hover:bg-[#D44A32] transition-colors flex justify-center items-center gap-2"
                            >
                              <CheckCircle size={14} />
                              Confirm Match
                            </button>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
