import React from 'react';
import { CalendarClock, CheckCircle2, Circle } from 'lucide-react';
import { cn, formatCurrency } from '../../lib/utils';
import { Account } from '../../types';

interface FixedAccountsProps {
  accounts: Account[];
  onToggle: (id: string) => void;
  onUpdateDueDate: (id: string, newDate: number) => void;
}

export function FixedAccounts({ accounts, onToggle, onUpdateDueDate }: FixedAccountsProps) {
  const total = accounts.reduce((acc, curr) => acc + curr.expectedAmount, 0);
  const paid = accounts.filter(a => a.status === 'paid').reduce((acc, curr) => acc + curr.expectedAmount, 0);

  return (
    <div className="space-y-6">
      <div className="bg-white border border-slate-200 p-8 rounded-xl shadow-sm">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-slate-500 text-sm font-medium mb-1">Total de Custos Fixos</p>
            <h3 className="text-3xl font-bold text-slate-900">{formatCurrency(total)}</h3>
          </div>
          <div className="text-right">
            <p className="text-slate-500 text-sm font-medium mb-1">Pago este mês</p>
            <p className="text-xl font-bold text-emerald-600">{formatCurrency(paid)}</p>
          </div>
        </div>
        <div className="mt-6 w-full bg-slate-100 h-2 rounded-full overflow-hidden">
          <div 
            className="bg-blue-600 h-full transition-all duration-500" 
            style={{ width: `${(paid / total) * 100}%` }}
          />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {accounts.map((account) => (
          <div 
            key={account.id}
            className={cn(
              "p-6 rounded-xl border transition-all cursor-pointer group relative overflow-hidden",
              account.status === 'paid' 
                ? "bg-white border-emerald-500/30 ring-1 ring-emerald-500/10 shadow-sm" 
                : "bg-white border-slate-200 hover:border-blue-400 shadow-sm"
            )}
          >
            {account.status === 'paid' && (
              <div className="absolute top-0 right-0 p-1">
                 <div className="bg-emerald-500 text-white p-0.5 rounded-bl-lg">
                   <CheckCircle2 size={12} />
                 </div>
              </div>
            )}
            <div className="flex justify-between items-start mb-4">
              <div className="p-2.5 bg-slate-50 rounded-lg text-slate-400 group-hover:text-blue-600 transition-colors border border-slate-100">
                <CalendarClock size={20} />
              </div>
              <button 
                className="text-slate-300 hover:text-slate-600 transition-colors"
                onClick={(e) => {
                  e.stopPropagation();
                  onToggle(account.id);
                }}
              >
                {account.status === 'paid' ? <CheckCircle2 className="text-emerald-500" /> : <Circle />}
              </button>
            </div>
            <div>
              <h4 className="font-bold text-slate-800 mb-1">{account.name}</h4>
              <div className="flex justify-between items-end">
                <p className="text-xl font-bold text-slate-900">{formatCurrency(account.expectedAmount)}</p>
                <div className="flex flex-col items-end">
                  <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">Vencimento</span>
                  <input 
                    type="number" 
                    min="1" max="31"
                    className="w-12 h-8 text-center text-sm font-bold text-slate-700 bg-slate-50 border border-slate-200 rounded focus:outline-none focus:ring-1 focus:ring-blue-500"
                    value={account.dueDate}
                    onClick={(e) => e.stopPropagation()}
                    onChange={(e) => onUpdateDueDate(account.id, parseInt(e.target.value) || 1)}
                  />
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
