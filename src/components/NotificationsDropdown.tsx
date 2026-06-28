import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Bell, Check } from 'lucide-react';
import { auth, db } from '../lib/firebase';
import { collection, query, where, orderBy, onSnapshot, doc, updateDoc, serverTimestamp } from 'firebase/firestore';
import { AppNotification } from '../types';
import { OperationType } from '../lib/itemService';

export default function NotificationsDropdown() {
  const [notifications, setNotifications] = useState<AppNotification[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const user = auth.currentUser;
    if (!user) return;

    const q = query(
      collection(db, 'notifications'),
      where('userId', '==', user.uid)
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const notes = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as AppNotification[];
      
      notes.sort((a, b) => {
        const dateA = a.createdAt?.seconds || 0;
        const dateB = b.createdAt?.seconds || 0;
        return dateB - dateA;
      });
      
      setNotifications(notes);
    }, (error) => {
      console.error('Failed to fetch notifications', error);
    });

    return () => unsubscribe();
  }, [auth.currentUser?.uid]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const unreadCount = notifications.filter(n => !n.read).length;

  const markAsRead = async (notificationId: string) => {
    try {
      const ref = doc(db, 'notifications', notificationId);
      await updateDoc(ref, { read: true });
    } catch (err) {
      console.error("Failed to mark notification as read", err);
    }
  };

  const markAllAsRead = async () => {
    const unreadIds = notifications.filter(n => !n.read).map(n => n.id!);
    for (const id of unreadIds) {
      await markAsRead(id);
    }
  };

  return (
    <div className="relative" ref={dropdownRef}>
      <button 
        onClick={() => setIsOpen(!isOpen)}
        className="relative p-2 text-gray-600 hover:text-black transition-colors"
      >
        <Bell size={20} />
        {unreadCount > 0 && (
          <span className="absolute top-1 right-1 w-2.5 h-2.5 bg-[#D44A32] rounded-full border border-white" />
        )}
      </button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 10 }}
            className="absolute right-0 mt-2 w-80 bg-white border border-[#1A1A1A]/10 shadow-xl z-50 overflow-hidden"
          >
            <div className="flex items-center justify-between p-4 border-b border-[#1A1A1A]/10 bg-[#FBFBF9]">
              <h3 className="text-[10px] uppercase tracking-widest font-black">Notifications</h3>
              {unreadCount > 0 && (
                <button 
                  onClick={markAllAsRead}
                  className="text-[9px] uppercase tracking-widest font-bold opacity-50 hover:opacity-100"
                >
                  Mark all read
                </button>
              )}
            </div>
            
            <div className="max-h-96 overflow-y-auto">
              {notifications.length === 0 ? (
                <div className="p-8 text-center text-gray-400">
                  <p className="text-xs italic">No new notifications</p>
                </div>
              ) : (
                notifications.map(note => (
                  <div 
                    key={note.id} 
                    className={`p-4 border-b border-[#1A1A1A]/5 last:border-b-0 hover:bg-gray-50 flex gap-4 transition-colors ${!note.read ? 'bg-orange-50/30' : ''}`}
                    onClick={() => { if (!note.read) markAsRead(note.id!); }}
                  >
                    <div className="mt-1">
                      {!note.read ? (
                        <div className="w-2 h-2 rounded-full bg-[#D44A32] mt-1" />
                      ) : (
                        <Check size={12} className="text-gray-300 mt-0.5" />
                      )}
                    </div>
                    <div className="flex-1">
                      <p className={`text-xs leading-relaxed ${!note.read ? 'font-medium text-black' : 'text-gray-600'}`}>
                        {note.message}
                      </p>
                      <span className="text-[9px] text-gray-400 uppercase tracking-widest block mt-2">
                        {note.createdAt ? new Date(note.createdAt.seconds * 1000).toLocaleString() : 'Just now'}
                      </span>
                    </div>
                  </div>
                ))
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
