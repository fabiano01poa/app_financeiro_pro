import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  LayoutDashboard, 
  ArrowUpCircle, 
  ArrowDownCircle, 
  CalendarClock, 
  CreditCard,
  Settings,
  Menu,
  X
} from 'lucide-react';
import { cn } from '../../lib/utils';

interface SidebarProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
}

const navItems = [
  { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { id: 'transactions', label: 'Transações', icon: ArrowUpCircle }, // For both In/Out
  { id: 'fixed', label: 'Contas Fixas', icon: CalendarClock },
  { id: 'variable', label: 'Contas Variáveis', icon: CreditCard },
];

export function Sidebar({ activeTab, setActiveTab }: SidebarProps) {
  return (
    <div className="flex flex-col h-full bg-slate-900 text-white border-r border-slate-200 w-64 hidden md:flex">
      <div className="p-6">
        <div className="flex items-center gap-3 mb-10">
          <div className="w-8 h-8 bg-blue-500 rounded flex items-center justify-center">
            <div className="w-4 h-4 border-2 border-white"></div>
          </div>
          <span className="text-white font-bold text-xl tracking-tight uppercase">Finanças Pro</span>
        </div>
      </div>
      
      <nav className="flex-1 px-4 space-y-1">
        {navItems.map((item) => (
          <button
            key={item.id}
            onClick={() => setActiveTab(item.id)}
            className={cn(
              "flex items-center w-full gap-3 px-4 py-3 rounded-lg transition-all duration-200 group",
              activeTab === item.id 
                ? "bg-blue-600 text-white shadow-sm" 
                : "text-slate-400 hover:text-white hover:bg-slate-800"
            )}
          >
            <item.icon size={20} className={cn(
              "transition-colors opacity-80",
              activeTab === item.id ? "text-white" : "text-slate-500 group-hover:text-slate-300"
            )} />
            <span className="font-medium text-sm">{item.label}</span>
          </button>
        ))}
      </nav>

      <div className="p-6 border-t border-slate-800 mt-auto">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-slate-700 flex items-center justify-center text-xs font-bold text-white">
            JD
          </div>
          <div>
            <p className="text-sm font-semibold text-white">João Duarte</p>
            <p className="text-xs text-slate-500 uppercase tracking-tighter font-bold">Plano Pro</p>
          </div>
        </div>
      </div>
    </div>
  );
}

export function MobileNav({ activeTab, setActiveTab }: SidebarProps) {
  return (
    <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-slate-200 px-2 py-2 flex justify-around items-center md:hidden z-50 shadow-[0_-4px_10px_rgba(0,0,0,0.05)]">
      {navItems.map((item) => (
        <button
          key={item.id}
          onClick={() => setActiveTab(item.id)}
          className={cn(
            "flex flex-col items-center gap-1 p-2 rounded-lg transition-colors",
            activeTab === item.id ? "text-blue-600" : "text-slate-400"
          )}
        >
          <item.icon size={20} />
          <span className="text-[10px] uppercase font-bold tracking-tighter">{item.label.split(' ')[1] || item.label}</span>
        </button>
      ))}
    </div>
  );
}
