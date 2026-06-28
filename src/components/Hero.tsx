import { motion } from 'motion/react';
import { Search, MapPin, Calendar, PlusCircle } from 'lucide-react';

interface HeroProps {
  onReportClick: () => void;
}

export default function Hero({ onReportClick }: HeroProps) {
  return (
    <section className="py-24 px-10 border-b border-[#1A1A1A]/10 overflow-hidden relative">
      <div className="max-w-[1440px] mx-auto">
        <div className="flex flex-col lg:flex-row justify-between items-end gap-12">
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8 }}
            className="flex-1"
          >
            <h1 className="font-serif text-[clamp(3.5rem,8vw,10rem)] leading-[0.85] italic tracking-tighter text-[#1A1A1A]">
              Lost item ? <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#1A1A1A] to-[#1A1A1A]/20">We're Here!</span>
            </h1>
          </motion.div>

          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3, duration: 0.8 }}
            className="flex-1 max-w-xl pb-6"
          >
            <p className="text-xl md:text-2xl font-light leading-relaxed text-[#1A1A1A]/70 mb-12">
              Reuniting People with Their Belongings.
            </p>
            <div className="flex flex-wrap gap-8 items-center">
              <button 
                onClick={onReportClick}
                className="group relative bg-[#1A1A1A] text-white px-12 py-5 text-[11px] uppercase tracking-[0.3em] font-black hover:bg-[#D44A32] transition-colors"
              >
                <span>Report Item</span>
                <div className="absolute inset-0 border border-[#1A1A1A] translate-x-2 translate-y-2 -z-10 group-hover:translate-x-0 group-hover:translate-y-0 transition-all" />
              </button>
              <a 
                href="#listings"
                className="text-[11px] uppercase tracking-[0.4em] font-black border-b-2 border-[#1A1A1A] pb-1 hover:text-[#D44A32] hover:border-[#D44A32] transition-all"
              >
                View Archive
              </a>
            </div>
          </motion.div>
        </div>

        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.6, duration: 1 }}
          className="mt-32 grid grid-cols-1 md:grid-cols-3 gap-12"
        >
          <div className="border-t border-[#1A1A1A]/10 pt-10">
            <span className="text-4xl font-serif italic mb-4 block">01</span>
            <h3 className="text-[10px] uppercase tracking-[0.3em] font-black mb-4">Precision Indexing</h3>
            <p className="text-sm opacity-60 leading-relaxed italic">Strategic categorization and geo-tagging ensures reports reach the right eyes instantly.</p>
          </div>
          <div className="border-t border-[#1A1A1A]/10 pt-10">
            <span className="text-4xl font-serif italic mb-4 block">02</span>
            <h3 className="text-[10px] uppercase tracking-[0.3em] font-black mb-4">Unified Network</h3>
            <p className="text-sm opacity-60 leading-relaxed italic">From SCE to SALITER, we bridge the communication gap across the entire facility.</p>
          </div>
          <div className="border-t border-[#1A1A1A]/10 pt-10">
            <span className="text-4xl font-serif italic mb-4 block">03</span>
            <h3 className="text-[10px] uppercase tracking-[0.3em] font-black mb-4">Visual Evidence</h3>
            <p className="text-sm opacity-60 leading-relaxed italic">High-integrity photographic logs provide definitive proof of ownership and recovery.</p>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
