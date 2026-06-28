import { useState, useEffect } from 'react';
import Navbar from './components/Navbar';
import Hero from './components/Hero';
import ItemGrid, { ItemGridSkeleton } from './components/ItemGrid';
import ReportForm from './components/ReportForm';
import ItemDetail from './components/ItemDetail';
import CampusMap from './components/CampusMap';
import { Item, ItemType } from './types';
import { ItemService } from './lib/itemService';
import { useAuthState } from './hooks/useAuthState';
import { signInWithPopup, auth, googleProvider } from './lib/firebase';
import { LayoutGrid, Filter, Search as SearchIcon, Map as MapIcon } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

export default function App() {
  const { user } = useAuthState();
  const [items, setItems] = useState<Item[]>([]);
  const [filter, setFilter] = useState<{ type?: ItemType; category?: string; location?: string }>({});
  const [searchQuery, setSearchQuery] = useState('');
  const [isReportModalOpen, setIsReportModalOpen] = useState(false);
  const [selectedItem, setSelectedItem] = useState<Item | null>(null);
  const [viewMode, setViewMode] = useState<'grid' | 'map'>('grid');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    const unsubscribe = ItemService.subscribeToItems(filter, (newItems) => {
      setItems(newItems.filter(item => item.status !== 'archived'));
      setLoading(false);
    });
    return () => unsubscribe();
  }, [filter]);

  const filteredItems = items.filter(item => 
    item.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    item.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
    item.location.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleReportClick = async () => {
    if (!user) {
      try {
        await signInWithPopup(auth, googleProvider);
        setIsReportModalOpen(true);
      } catch (err: any) {
        console.error("Popup Auth Error:", err);
        if (err.code !== 'auth/popup-closed-by-user') {
          alert(`Authentication failed: ${err.message}`);
        }
      }
    } else {
      setIsReportModalOpen(true);
    }
  };

  return (
    <div className="min-h-screen selection:bg-[#D44A32] selection:text-white">
      <Navbar />
      
      <main>
        <Hero onReportClick={handleReportClick} />

        <section id="listings" className="px-10 py-24 max-w-[1440px] mx-auto overflow-hidden">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-12 mb-20 border-b border-[#1A1A1A] pb-12">
            <div className="max-w-md">
              <span className="text-[10px] uppercase tracking-[0.4em] font-black text-[#D44A32] mb-4 block">Archive Directory</span>
              <h2 className="text-6xl font-serif tracking-tighter italic">Recent Filings</h2>
            </div>
            
            <div className="flex flex-col gap-6 w-full md:w-auto">
              <div className="flex gap-4 items-center justify-end mb-2">
                <button
                  onClick={() => setViewMode('grid')}
                  className={`p-2 transition-colors ${viewMode === 'grid' ? 'text-[#1A1A1A]' : 'text-[#1A1A1A]/20 hover:text-[#1A1A1A]/60'}`}
                  title="Grid View"
                >
                  <LayoutGrid size={20} />
                </button>
                <button
                  onClick={() => setViewMode('map')}
                  className={`p-2 transition-colors ${viewMode === 'map' ? 'text-[#1A1A1A]' : 'text-[#1A1A1A]/20 hover:text-[#1A1A1A]/60'}`}
                  title="Map View"
                >
                  <MapIcon size={20} />
                </button>
              </div>
              <div className="flex gap-4">
                {(['all', 'lost', 'found'] as (ItemType | 'all')[]).map((type) => (
                  <button
                    key={type}
                    onClick={() => setFilter({ ...filter, type: type === 'all' ? undefined : type })}
                    className={`px-6 py-2 text-[10px] uppercase tracking-widest font-black border transition-all
                      ${(type === 'all' && !filter.type) || filter.type === type 
                        ? 'bg-[#1A1A1A] text-white border-[#1A1A1A]' 
                        : 'border-[#1A1A1A]/10 text-[#1A1A1A]/40 hover:border-[#1A1A1A]'}`}
                  >
                    {type}
                  </button>
                ))}
              </div>
              <div className="relative group">
                <SearchIcon className="absolute left-0 top-1/2 -translate-y-1/2 opacity-20 group-focus-within:opacity-100 transition-opacity" size={16} />
                <input
                  type="text"
                  placeholder="Search indices..."
                  className="bg-transparent border-b border-[#1A1A1A]/10 focus:border-[#1A1A1A] py-2 pl-8 pr-4 text-sm font-serif italic outline-none w-full md:w-80 transition-all placeholder:text-[#1A1A1A]/20"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
            </div>
          </div>

          {viewMode === 'map' ? (
            <div className="mb-12">
              <CampusMap items={filteredItems} onItemClick={setSelectedItem} />
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-12">
              {loading ? (
                Array.from({ length: 8 }).map((_, i) => (
                  <ItemGridSkeleton key={`skeleton-${i}`} />
                ))
              ) : (
                <AnimatePresence mode="popLayout">
                  {filteredItems.map((item) => (
                    <ItemGrid 
                      key={item.id} 
                      item={item} 
                      onItemClick={setSelectedItem}
                    />
                  ))}
                </AnimatePresence>
              )}
            </div>
          )}

          {!loading && filteredItems.length === 0 && (
            <div className="py-40 text-center border-2 border-dashed border-[#1A1A1A]/5 rounded-3xl">
              <span className="font-serif text-3xl italic opacity-20 block mb-4">No entries found in archive</span>
              <p className="text-[10px] uppercase tracking-widest font-bold opacity-30">Try refining your search parameters</p>
            </div>
          )}
        </section>
      </main>

      <footer id="footer" className="py-24 px-10 border-t border-[#1A1A1A]/10 bg-white">
        <div className="max-w-[1440px] mx-auto flex flex-col md:flex-row justify-between items-start gap-12">
          <div className="max-w-sm">
            <span className="font-serif text-3xl italic tracking-tighter block mb-4">Find - IT</span>
            <p className="text-xs leading-relaxed opacity-40 italic">A specialized digital archive for the management and restoration of displaced assets within the institutional perimeter.</p>
          </div>
          <div className="grid grid-cols-2 gap-20">
            <div>
              <h4 className="text-[10px] uppercase tracking-widest font-black mb-6">Protocols</h4>
              <ul className="space-y-3 text-[11px] opacity-40 font-bold">
                <li><a href="#" className="hover:text-[#D44A32] transition-colors">Usage Policy</a></li>
                <li><a href="#" className="hover:text-[#D44A32] transition-colors">Privacy Seal</a></li>
                <li><a href="#" className="hover:text-[#D44A32] transition-colors">Contact Admin</a></li>
              </ul>
            </div>
            <div>
              <h4 className="text-[10px] uppercase tracking-widest font-black mb-6">Social Proof</h4>
              <ul className="space-y-3 text-[11px] opacity-40 font-bold">
                <li><a href="#" className="hover:text-[#D44A32] transition-colors">Twitter</a></li>
                <li><a href="#" className="hover:text-[#D44A32] transition-colors">Instagram</a></li>
                <li><a href="#" className="hover:text-[#D44A32] transition-colors">LinkedIn</a></li>
              </ul>
            </div>
          </div>
        </div>
        <div className="max-w-[1440px] mx-auto mt-20 pt-10 border-t border-[#1A1A1A]/5 flex justify-between items-center text-[9px] uppercase tracking-[0.2em] font-black opacity-20">
          <span>&copy; {new Date().getFullYear()} Find - IT Portal</span>
          <span>Index: Engineering-Design-Facility</span>
        </div>
      </footer>

      <ReportForm 
        isOpen={isReportModalOpen} 
        onClose={() => setIsReportModalOpen(false)}
        onSuccess={() => {}}
      />

      <ItemDetail 
        item={selectedItem}
        onClose={() => setSelectedItem(null)}
      />
    </div>
  );
}
