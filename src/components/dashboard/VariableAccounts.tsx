import React from 'react';
import { CreditCard, ShoppingBag, Utensils, Car, Lightbulb, Trash2 } from 'lucide-react';
import { cn, formatCurrency } from '../../lib/utils';
import { Transaction } from '../../types';

interface VariableAccountsProps {
  transactions: Transaction[];
  onDelete?: (id: string) => void;
  onUpdateDueDate?: (id: string, newDate: number) => void;
}

const categoryIcons: Record<string, React.ReactNode> = {
  'Alimentação': <Utensils size={18} />,
  'Transporte': <Car size={18} />,
  'Lazer': <ShoppingBag size={18} />,
  'Outros': <CreditCard size={18} />,
};

export function VariableAccounts({ transactions, onDelete, onUpdateDueDate }: VariableAccountsProps) {
  // Group by category
  const categories = transactions.reduce((acc, t) => {
    if (t.type === 'expense') {
      acc[t.category] = (acc[t.category] || 0) + Number(t.amount);
    }
    return acc;
  }, {} as Record<string, number>);

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {Object.entries(categories).map(([cat, total]) => (
          <div key={cat} className="bg-white border border-slate-200 p-6 rounded-xl shadow-sm">
            <div className="flex items-center gap-3 mb-3">
              <div className="p-2.5 bg-slate-50 border border-slate-100 rounded-lg text-blue-600">
                {categoryIcons[cat] || <CreditCard size={18} />}
              </div>
              <span className="text-slate-500 font-bold text-[10px] uppercase tracking-widest">{cat}</span>
            </div>
            <p className="text-2xl font-bold text-slate-900">{formatCurrency(total)}</p>
          </div>
        ))}
      </div>

      <div className="bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden">
        <div className="p-4 border-b border-slate-100 bg-slate-50/50 flex justify-between items-center">
          <h3 className="font-bold text-slate-800 uppercase text-xs tracking-widest">Despesas Variáveis Recentes</h3>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead className="bg-slate-50 text-[10px] uppercase text-slate-500 font-bold border-b border-slate-100">
              <tr>
                <th className="px-6 py-3">Descrição</th>
                <th className="px-6 py-3">Categoria</th>
                <th className="px-6 py-3 text-center">Vencimento</th>
                <th className="px-6 py-3 text-right">Valor</th>
                <th className="px-6 py-3 text-right">Ações</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {transactions.map((t) => (
                <tr key={t.id} className="text-sm group hover:bg-slate-50 transition-colors">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-lg bg-slate-100 flex items-center justify-center text-slate-400 group-hover:text-blue-600 transition-colors">
                        {categoryIcons[t.category] || <CreditCard size={16} />}
                      </div>
                      <span className="font-medium text-slate-800">{t.description}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <span className="text-xs font-semibold text-slate-500 uppercase">{t.category}</span>
                  </td>
                  <td className="px-6 py-4 text-center">
                    <input 
                      type="number"
                      min="1"
                      max="31"
                      value={t.dueDate || 1}
                      onChange={(e) => onUpdateDueDate?.(t.id, parseInt(e.target.value))}
                      className="w-12 text-center text-xs font-bold text-slate-700 bg-slate-100 px-1 py-1 rounded border-none focus:ring-2 focus:ring-blue-600/20 outline-none hover:bg-slate-200 transition-colors"
                    />
                  </td>
                  <td className={cn(
                    "px-6 py-4 text-right font-bold",
                    t.type === 'income' ? "text-emerald-600" : "text-rose-600"
                  )}>
                    {t.type === 'income' ? '+' : '-'} {formatCurrency(t.amount)}
                  </td>
                  <td className="px-6 py-4 text-right">
                    <button 
                      onClick={() => onDelete?.(t.id)}
                      className="p-1.5 text-slate-300 hover:text-rose-500 hover:bg-rose-50 rounded transition-all"
                      title="Excluir"
                    >
                      <Trash2 size={16} />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {transactions.length === 0 && (
            <div className="p-12 text-center text-slate-400 italic text-sm">Nenhuma despesa registrada.</div>
          )}
        </div>
      </div>
    </div>
  );
}
