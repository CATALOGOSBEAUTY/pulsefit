import { Menu, Bell, Search, User, LogOut } from 'lucide-react';
import { useAuthStore } from '../../auth/store/useAuthStore';
import { useUIStore } from '../store/useUIStore';

export function AdminHeader() {
  const user = useAuthStore((state) => state.user);
  const logout = useAuthStore((state) => state.logout);
  const toggleSidebar = useUIStore((state) => state.toggleSidebar);

  const handleLogout = () => {
    logout();
    window.location.href = '/login';
  };

  return (
    <header className="h-16 md:h-20 bg-white border-b border-neutral-200 px-4 md:px-8 flex items-center justify-between shrink-0 sticky top-0 z-30">
      <div className="flex items-center gap-2 md:gap-4 flex-1">
        <button 
          onClick={toggleSidebar} 
          className="lg:hidden p-2 text-neutral-500 hover:text-neutral-900 hover:bg-neutral-100 rounded-lg transition-colors"
        >
          <Menu className="w-6 h-6" />
        </button>

        <div className="flex-1 max-w-xl hidden sm:block">
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Search className="h-5 w-5 text-neutral-400" />
            </div>
            <input
              type="text"
              placeholder="Pesquisar produtos..."
              className="w-full pl-10 pr-4 py-2 bg-neutral-50 border border-neutral-200 rounded-xl text-sm focus:outline-none focus:border-purple-500 focus:ring-1 focus:ring-purple-500 transition-colors"
            />
          </div>
        </div>
      </div>

      <div className="flex items-center gap-4 md:gap-6 ml-4">
        <button onClick={handleLogout} title="Sair" className="p-2 text-rose-500 bg-rose-50 hover:bg-rose-100 rounded-full transition-colors flex items-center">
           <LogOut className="w-4 h-4 ml-[-2px]" />
        </button>

        <button className="relative text-neutral-400 hover:text-purple-600 transition-colors">
          <Bell className="w-5 h-5 md:w-6 md:h-6" />
          <span className="absolute 0 right-0 w-2.5 h-2.5 bg-red-500 rounded-full border-2 border-white"></span>
        </button>
        
        <div className="flex items-center gap-3 pl-4 md:pl-6 border-l border-neutral-200">
          <div className="hidden sm:flex flex-col items-end">
            <span className="text-sm font-bold text-neutral-900 truncate max-w-[120px]">Admin</span>
            <span className="text-[10px] md:text-xs text-neutral-500 truncate max-w-[150px]">{user?.email || 'admin'}</span>
          </div>
          <div className="w-8 h-8 md:w-10 md:h-10 shrink-0 bg-purple-100 rounded-full flex items-center justify-center text-purple-800 font-bold">
            <User className="w-4 h-4 md:w-5 md:h-5" />
          </div>
        </div>
      </div>
    </header>
  );
}
