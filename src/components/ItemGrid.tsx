import { Item } from '../types';
import { MapPin, Calendar, Tag } from 'lucide-react';
import { motion } from 'motion/react';

interface ItemGridProps {
  item: Item;
  onItemClick: (item: Item) => void;
  key?: string;
}

export function ItemGridSkeleton() {
  return (
    <div className="flex flex-col h-full bg-white border border-[#1A1A1A]/5 p-2 pb-6">
      <div className="aspect-[4/5] bg-gray-200 animate-pulse mb-6 border border-[#1A1A1A]/5"></div>
      <div className="px-4 flex flex-col flex-grow space-y-4">
        <div className="h-6 bg-gray-200 animate-pulse rounded w-3/4"></div>
        <div className="space-y-2 mb-6">
          <div className="h-3 bg-gray-200 animate-pulse rounded w-1/2"></div>
          <div className="h-3 bg-gray-200 animate-pulse rounded w-1/3"></div>
        </div>
        <div className="pt-4 border-t border-[#1A1A1A]/10 flex items-center justify-between">
          <div className="h-3 bg-gray-200 animate-pulse rounded w-1/4"></div>
          <div className="h-3 bg-gray-200 animate-pulse rounded w-1/4"></div>
        </div>
      </div>
    </div>
  );
}

export default function ItemGrid({ item, onItemClick }: ItemGridProps) {
  const isLost = item.type === 'lost';

  return (
    <motion.div
      layout
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="group cursor-pointer flex flex-col h-full bg-white border border-[#1A1A1A]/5 p-2 pb-6 hover:shadow-2xl transition-all duration-500"
      onClick={() => onItemClick(item)}
    >
      <div className="relative aspect-[4/5] bg-[#E5E5E1] mb-6 flex items-center justify-center overflow-hidden border border-[#1A1A1A]/5">
        {item.imageUrl ? (
          <img 
            src={item.imageUrl} 
            alt={item.title} 
            className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
            referrerPolicy="no-referrer"
          />
        ) : (
          <div className="w-32 h-32 border border-[#1A1A1A]/10 rotate-12 flex items-center justify-center">
            <span className="text-[10px] uppercase tracking-widest opacity-20 font-black">No Records</span>
          </div>
        )}
        
        <div className={`absolute top-4 right-4 px-3 py-1 text-[9px] font-black uppercase tracking-[0.2em] shadow-sm
          ${isLost ? 'bg-[#D44A32] text-white' : 'bg-[#1A1A1A] text-white'}`}>
          {item.type}
        </div>

        {item.status === 'resolved' && (
          <div className="absolute inset-0 bg-white/60 backdrop-blur-[1px] flex items-center justify-center">
            <span className="text-black border-2 border-black px-4 py-2 font-black uppercase tracking-[0.2em] text-[10px]">
              Resolved
            </span>
          </div>
        )}
      </div>

      <div className="px-4 flex flex-col flex-grow">
        <h3 className="font-serif text-2xl tracking-tight leading-tight mb-2 group-hover:italic transition-all">
          {item.title}
        </h3>
        
        <div className="space-y-1 mb-6 flex-grow opacity-60">
          <p className="text-[10px] uppercase tracking-[0.2em] font-semibold">{item.location}</p>
          <p className="text-[10px] italic">{new Date(item.date).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}</p>
        </div>

        <div className="pt-4 border-t border-[#1A1A1A]/10 flex items-center justify-between opacity-40">
          <span className="text-[9px] uppercase tracking-widest font-bold">Reporter: {item.reporterName?.split(' ')[0]}</span>
          <span className="text-[9px] font-mono">#{item.id?.slice(-4).toUpperCase()}</span>
        </div>
      </div>
    </motion.div>
  );
}
