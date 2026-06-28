import { auth, googleProvider, signInWithPopup, signOut } from '../lib/firebase';
import { useAuthState } from '../hooks/useAuthState';
import { LogIn, LogOut, User as UserIcon } from 'lucide-react';
import NotificationsDropdown from './NotificationsDropdown';

export default function Navbar() {
  const { user, loading } = useAuthState();

  const handleLogin = async () => {
    try {
      await signInWithPopup(auth, googleProvider);
    } catch (error) {
      console.error("Login failed", error);
    }
  };

  const handleLogout = async () => {
    try {
      await signOut(auth);
    } catch (error) {
      console.error("Logout failed", error);
    }
  };

  return (
    <nav className="h-24 border-b border-[#1A1A1A]/10 bg-[#FBFBF9] sticky top-0 z-50">
      <div className="max-w-[1440px] mx-auto px-10 h-full flex items-center justify-between">
        <div className="flex flex-col">
          <span className="font-serif text-3xl italic tracking-tighter leading-none">Find - IT</span>
        </div>

        <div className="flex items-center gap-12">
          <div className="hidden md:flex gap-10 text-[10px] uppercase tracking-[0.2em] font-bold">
            <a href="#" onClick={(e) => { e.preventDefault(); window.scrollTo(0,0); }} className="hover:text-[#D44A32] pb-1 border-b border-transparent hover:border-[#D44A32] transition-all">Home</a>
            <a href="#about" onClick={(e) => { e.preventDefault(); document.getElementById('footer')?.scrollIntoView({ behavior: 'smooth' }); }} className="hover:text-[#D44A32] pb-1 border-b border-transparent hover:border-[#D44A32] transition-all">About</a>
            <a href="#contact" onClick={(e) => { e.preventDefault(); document.getElementById('footer')?.scrollIntoView({ behavior: 'smooth' }); }} className="hover:text-[#D44A32] pb-1 border-b border-transparent hover:border-[#D44A32] transition-all">Contacts</a>
          </div>

          <div className="h-8 w-[1px] bg-[#1A1A1A]/10 hidden md:block" />

          {loading ? (
            <div className="w-8 h-8 rounded-full border border-[#1A1A1A]/5 animate-pulse" />
          ) : user ? (
            <div className="flex items-center gap-6">
              <NotificationsDropdown />
              <div className="flex items-center gap-3">
                {user.photoURL ? (
                  <img src={user.photoURL} alt={user.displayName || ''} className="w-8 h-8 rounded-full border border-[#1A1A1A]/10 p-0.5" referrerPolicy="no-referrer" />
                ) : (
                  <div className="w-8 h-8 bg-black rounded-full flex items-center justify-center text-white">
                    <UserIcon size={14} />
                  </div>
                )}
                <span className="text-[10px] uppercase tracking-widest font-black hidden lg:block">{user.displayName}</span>
              </div>
              <button 
                onClick={handleLogout}
                className="text-[10px] uppercase tracking-widest font-bold opacity-40 hover:opacity-100 transition-opacity"
              >
                Sign Out
              </button>
            </div>
          ) : (
            <button 
              onClick={handleLogin}
              className="px-6 py-3 bg-[#1A1A1A] text-white text-[10px] uppercase tracking-[0.2em] font-black hover:bg-[#D44A32] transition-all"
            >
              Portal Login
            </button>
          )}
        </div>
      </div>
    </nav>
  );
}
