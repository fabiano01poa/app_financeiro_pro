/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { Sidebar, MobileNav } from './components/layout/Navigation.tsx';
import { FixedAccounts } from './components/dashboard/FixedAccounts.tsx';
import { VariableAccounts } from './components/dashboard/VariableAccounts.tsx';
import { motion, AnimatePresence } from 'motion/react';
import { Plus, TrendingUp, TrendingDown, Wallet, X, BarChart3, RefreshCw, AlertCircle } from 'lucide-react';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  Cell
} from 'recharts';
import { cn, formatCurrency } from './lib/utils.ts';
import { Transaction, Account } from './types.ts';

// Mock Data
const MOCK_FIXED: Account[] = [
  { id: '1', name: 'Aluguel', expectedAmount: 2500, dueDate: 5, status: 'paid', type: 'fixed' },
  { id: '2', name: 'Internet', expectedAmount: 120, dueDate: 10, status: 'pending', type: 'fixed' },
  { id: '3', name: 'Energia', expectedAmount: 350, dueDate: 15, status: 'pending', type: 'fixed' },
];

const MOCK_TRANSACTIONS: Transaction[] = [
  { id: '101', description: 'Supermercado', amount: 450.50, type: 'expense', category: 'Alimentação', date: new Date() },
  { id: '102', description: 'Uber', amount: 35.00, type: 'expense', category: 'Transporte', date: new Date() },
  { id: '103', description: 'Restaurante', amount: 120.00, type: 'expense', category: 'Alimentação', date: new Date() },
  { id: '104', description: 'Salário', amount: 5600.00, type: 'income', category: 'Outros', date: new Date() },
];

const MOCK_MONTHLY_DATA = [
  { month: 'Jan', income: 4200, expense: 3100 },
  { month: 'Fev', income: 4800, expense: 3400 },
  { month: 'Mar', income: 5100, expense: 4200 },
  { month: 'Abr', income: 4900, expense: 3900 },
  { month: 'Mai', income: 5600, expense: 3250 },
  { month: 'Jun', income: 6200, expense: 3500 },
];

const Dashboard = ({ transactions, accounts }: { transactions: Transaction[], accounts: Account[] }) => {
  const upcomingAlerts = [
    ...accounts.filter(a => a.status === 'pending' && a.dueDate - new Date().getDate() <= 3 && a.dueDate >= new Date().getDate()),
    ...(transactions || []).filter(t => t.type === 'expense' && t.dueDate && t.dueDate - new Date().getDate() <= 3 && t.dueDate >= new Date().getDate())
  ];

  return (
    <div className="space-y-6">
      {upcomingAlerts.length > 0 && (
        <motion.div 
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-rose-50 border border-rose-200 p-4 rounded-xl flex items-center gap-3 shadow-sm"
        >
          <div className="w-10 h-10 bg-rose-100 rounded-full flex items-center justify-center text-rose-600">
            <TrendingDown size={20} />
          </div>
          <div>
            <p className="text-sm font-bold text-rose-800">Alerta de Vencimento</p>
            <p className="text-xs text-rose-600">
              Você tem {upcomingAlerts.length} conta(s) vencendo nos próximos 3 dias.
            </p>
          </div>
        </motion.div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white border border-slate-200 p-6 rounded-xl shadow-sm">
          <p className="text-sm text-slate-500 font-medium mb-1">Saldo Disponível</p>
          <p className="text-3xl font-bold text-slate-900">{formatCurrency(12450.00)}</p>
          <div className="mt-3 flex items-center text-[10px] text-emerald-600 font-bold bg-emerald-50 px-2 py-1 rounded w-fit">
            +5.2% este mês
          </div>
        </div>
        <div className="bg-white border border-slate-200 p-6 rounded-xl shadow-sm">
          <p className="text-sm text-slate-500 font-medium mb-1">Entradas Totais</p>
          <p className="text-3xl font-bold text-emerald-600">{formatCurrency(5600.00)}</p>
          <div className="mt-3 flex items-center text-[10px] text-slate-400 font-medium uppercase tracking-wider">
            Projeção: {formatCurrency(5800)}
          </div>
        </div>
        <div className="bg-white border border-slate-200 p-6 rounded-xl shadow-sm">
          <p className="text-sm text-slate-500 font-medium mb-1">Saídas Totais</p>
          <p className="text-3xl font-bold text-rose-600">{formatCurrency(3250.00)}</p>
          <div className="mt-3 flex items-center text-[10px] text-rose-500 font-bold bg-rose-50 px-2 py-1 rounded w-fit uppercase tracking-tighter">
            {accounts.filter(a => a.status === 'pending').length} contas pendentes
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
        <div className="lg:col-span-3 bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden flex flex-col">
          <div className="p-4 border-b border-slate-100 bg-slate-50/50 flex justify-between items-center">
            <h2 className="font-bold text-slate-800 uppercase text-xs tracking-widest flex items-center gap-2">
              <BarChart3 size={14} className="text-blue-600" />
              Comparativo Mensal
            </h2>
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-1.5">
                <div className="w-2 h-2 bg-blue-600 rounded-full" />
                <span className="text-[10px] font-bold text-slate-400 uppercase">Receitas</span>
              </div>
              <div className="flex items-center gap-1.5">
                <div className="w-2 h-2 bg-rose-300 rounded-full" />
                <span className="text-[10px] font-bold text-slate-400 uppercase">Despesas</span>
              </div>
            </div>
          </div>
          <div className="p-6 h-[300px] w-full min-h-[300px] relative">
            <ResponsiveContainer width="100%" height="100%" debounce={100}>
              <BarChart data={MOCK_MONTHLY_DATA} barGap={8}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis 
                  dataKey="month" 
                  axisLine={false} 
                  tickLine={false} 
                  tick={{ fontSize: 10, fontWeight: 600, fill: '#64748b' }} 
                  dy={10}
                />
                <YAxis 
                  axisLine={false} 
                  tickLine={false} 
                  tick={{ fontSize: 10, fontWeight: 600, fill: '#64748b' }}
                  tickFormatter={(value) => `R$${value}`}
                />
                <Tooltip 
                  cursor={{ fill: '#f8fafc' }}
                  contentStyle={{ 
                    borderRadius: '12px', 
                    border: '1px solid #e2e8f0',
                    boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)',
                    fontSize: '12px'
                  }}
                  formatter={(value: number, name: string) => [formatCurrency(value), name === 'income' ? 'Receita' : 'Despesa']}
                />
                <Bar 
                  dataKey="income" 
                  fill="#2563eb"
                  radius={[4, 4, 0, 0]} 
                  barSize={16}
                />
                <Bar 
                  dataKey="expense" 
                  fill="#fca5a5"
                  radius={[4, 4, 0, 0]} 
                  barSize={16}
                />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
        
        <div className="lg:col-span-2 bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden">
          <div className="p-4 border-b border-slate-100 bg-slate-50/50 flex justify-between items-center">
            <h2 className="font-bold text-slate-800 uppercase text-xs tracking-widest">Atividades Recentes</h2>
            <button className="text-[10px] font-bold text-blue-600 uppercase tracking-widest hover:underline">Ver tudo</button>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead className="bg-slate-50 text-[10px] uppercase text-slate-500 font-bold">
                <tr>
                  <th className="px-6 py-3">Descrição</th>
                  <th className="px-6 py-3 text-right">Valor</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {(transactions || []).slice(0, 5).map((t) => (
                  <tr key={t.id} className={cn(
                    "text-sm hover:bg-slate-50 transition-colors border-l-4",
                    t.type === 'income' ? "border-emerald-500 bg-emerald-50/5" : "border-slate-100"
                  )}>
                    <td className="px-6 py-4">
                      <div>
                        <p className="font-medium text-slate-800 truncate max-w-[120px]">{t.description}</p>
                        <p className="text-[10px] text-slate-400 font-medium uppercase">{t.category} {t.installments ? `(${t.currentInstallment}/${t.installments})` : ''}</p>
                      </div>
                    </td>
                    <td className={cn(
                      "px-6 py-4 text-right font-bold",
                      t.type === 'income' ? "text-emerald-600" : "text-rose-600"
                    )}>
                      {t.type === 'income' ? '+' : '-'} {formatCurrency(t.amount)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};

export default function App() {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [isAdding, setIsAdding] = useState(false);
  const [fixedAccounts, setFixedAccounts] = useState<Account[]>([]);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [categories, setCategories] = useState<string[]>(['Alimentação', 'Transporte', 'Lazer', 'Moradia', 'Saúde', 'Outros']);
  const [showNewCategoryInput, setShowNewCategoryInput] = useState(false);
  const [newCategoryName, setNewCategoryName] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [isSyncing, setIsSyncing] = useState(false);
  const [syncError, setSyncError] = useState<string | null>(null);

  // Load Data
  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await fetch('/api/data');
        const data = await res.json();
        
        if (!res.ok) {
          if (data.error === 'CREDENTIALS_MISSING') {
            setSyncError('CREDENTIALS_MISSING');
          } else {
            // Store the specific message from Google/Server
            setSyncError(data.message || 'Erro ao carregar dados.');
          }
          return;
        }

        if (data.transactions) setTransactions(data.transactions);
        if (data.fixedAccounts) setFixedAccounts(data.fixedAccounts);
        if (data.categories && data.categories.length > 0) setCategories(data.categories);
      } catch (e: any) {
        setSyncError(e.message);
      } finally {
        setIsLoading(false);
      }
    };
    fetchData();
  }, []);

  const saveToSheets = async (currentTransactions: Transaction[], currentAccounts: Account[], currentCategories: string[]) => {
    setIsSyncing(true);
    setSyncError(null);
    try {
      const res = await fetch('/api/save', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          transactions: currentTransactions, 
          fixedAccounts: currentAccounts, 
          categories: currentCategories 
        })
      });
      if (!res.ok) throw new Error('Erro ao salvar dados na planilha.');
    } catch (e: any) {
      setSyncError(e.message);
    } finally {
      setIsSyncing(false);
    }
  };

  // Auth State
  const [user, setUser] = useState<{email: string} | null>(null);
  const [authMode, setAuthMode] = useState<'login' | 'register' | 'forgot'>('login');
  const [authForm, setAuthForm] = useState({ email: '', password: '', code: '' });

  // Filter State
  const [dateFilter, setDateFilter] = useState({
    type: 'month' as 'all' | 'month' | 'year' | 'custom',
    start: '',
    end: ''
  });

  // New transaction state
  const [newTransaction, setNewTransaction] = useState({
    description: '',
    amount: '',
    type: 'expense' as 'income' | 'expense',
    category: 'Alimentação',
    installments: '1',
    dueDate: new Date().getDate().toString()
  });

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (authForm.email && authForm.password) {
      setUser({ email: authForm.email });
    }
  };

  const filterTransactions = (items: Transaction[]) => {
    if (dateFilter.type === 'all') return items;
    const now = new Date();
    return items.filter(t => {
      const d = new Date(t.date);
      if (dateFilter.type === 'month') return d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear();
      if (dateFilter.type === 'year') return d.getFullYear() === now.getFullYear();
      if (dateFilter.type === 'custom' && dateFilter.start && dateFilter.end) {
        return d >= new Date(dateFilter.start) && d <= new Date(dateFilter.end);
      }
      return true;
    });
  };

  const DateFilterBar = () => (
    <div className="flex flex-wrap items-center gap-3 mb-6 bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
      <div className="flex bg-slate-100 p-1 rounded-lg">
        {(['month', 'year', 'all', 'custom'] as const).map((type) => (
          <button
            key={type}
            onClick={() => setDateFilter({ ...dateFilter, type })}
            className={cn(
              "px-4 py-1.5 text-xs font-bold uppercase tracking-wider rounded-md transition-all",
              dateFilter.type === type ? "bg-white text-blue-600 shadow-sm" : "text-slate-500 hover:text-slate-700"
            )}
          >
            {type === 'month' ? 'Mês' : type === 'year' ? 'Ano' : type === 'all' ? 'Ver Tudo' : 'Personalizado'}
          </button>
        ))}
      </div>
      
      {dateFilter.type === 'custom' && (
        <motion.div initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} className="flex items-center gap-2">
          <input 
            type="date" 
            className="bg-slate-50 border border-slate-200 rounded-lg px-3 py-1.5 text-xs font-medium focus:ring-2 focus:ring-blue-600/20 outline-none"
            value={dateFilter.start}
            onChange={e => setDateFilter({...dateFilter, start: e.target.value})}
          />
          <span className="text-slate-400 text-xs font-bold">até</span>
          <input 
            type="date" 
            className="bg-slate-50 border border-slate-200 rounded-lg px-3 py-1.5 text-xs font-medium focus:ring-2 focus:ring-blue-600/20 outline-none"
            value={dateFilter.end}
            onChange={e => setDateFilter({...dateFilter, end: e.target.value})}
          />
        </motion.div>
      )}
    </div>
  );

  if (!user) {
    return (
      <div className="min-h-screen bg-slate-900 flex items-center justify-center p-4 font-sans">
        <motion.div 
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="bg-white w-full max-w-[400px] rounded-[2rem] p-10 shadow-2xl relative overflow-hidden"
        >
          <div className="absolute top-0 left-0 w-full h-2 bg-blue-600" />
          
          <div className="flex items-center justify-center gap-3 mb-12">
            <div className="w-10 h-10 bg-blue-600 rounded-xl rotate-12 flex items-center justify-center transform hover:rotate-0 transition-transform cursor-pointer shadow-lg shadow-blue-600/20">
              <div className="w-5 h-5 border-2 border-white" />
            </div>
            <h1 className="text-2xl font-black text-slate-900 tracking-tighter uppercase italic">FinanCorp</h1>
          </div>

          <h2 className="text-xl font-bold text-slate-800 mb-2">
            {authMode === 'login' ? 'Bem-vindo de volta' : authMode === 'register' ? 'Criar sua conta' : 'Recuperar Senha'}
          </h2>
          <p className="text-sm text-slate-500 mb-8">
            {authMode === 'login' ? 'Acesse seu painel financeiro' : authMode === 'register' ? 'Comece seu controle hoje mesmo' : 'Enviaremos um código para seu e-mail'}
          </p>

          <form onSubmit={handleLogin} className="space-y-5">
            <div>
              <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1.5 block">Seu E-mail</label>
              <input 
                type="email" 
                required
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-5 py-4 focus:ring-2 focus:ring-blue-600/20 outline-none transition-all font-medium"
                placeholder="exemplo@email.com"
                value={authForm.email}
                onChange={e => setAuthForm({...authForm, email: e.target.value})}
              />
            </div>

            {(authMode === 'login' || authMode === 'register') && (
              <div>
                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1.5 block">Sua Senha</label>
                <input 
                  type="password" 
                  required
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-5 py-4 focus:ring-2 focus:ring-blue-600/20 outline-none transition-all font-medium"
                  placeholder="••••••••"
                  value={authForm.password}
                  onChange={e => setAuthForm({...authForm, password: e.target.value})}
                />
              </div>
            )}

            {authMode === 'forgot' && authForm.code && (
               <div>
                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1.5 block">Código Recebido</label>
                <input 
                  type="text" 
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-5 py-4 focus:ring-2 focus:ring-blue-600/20 outline-none transition-all font-bold tracking-[0.5em] text-center"
                  placeholder="000000"
                />
              </div>
            )}

            <button className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-4 rounded-xl shadow-lg shadow-blue-600/20 transition-all active:scale-[0.98]">
              {authMode === 'login' ? 'Entrar Agora' : authMode === 'register' ? 'Cadastrar' : 'Enviar Código'}
            </button>
          </form>

          <div className="mt-8 text-center space-y-3">
            {authMode === 'login' ? (
              <>
                <button onClick={() => setAuthMode('register')} className="text-sm font-bold text-blue-600 hover:underline">Criar uma conta gratuita</button>
                <br />
                <button onClick={() => setAuthMode('forgot')} className="text-xs text-slate-400 hover:text-slate-600 transition-colors">Esqueceu sua senha?</button>
              </>
            ) : (
              <button onClick={() => setAuthMode('login')} className="text-sm font-bold text-blue-600 hover:underline">Já tenho uma conta</button>
            )}
          </div>
        </motion.div>
      </div>
    );
  }

  const toggleAccount = (id: string) => {
    const updated = fixedAccounts.map(a => 
      a.id === id ? { ...a, status: a.status === 'paid' ? 'pending' : 'paid' } : a
    );
    setFixedAccounts(updated);
    saveToSheets(transactions, updated, categories);
  };

  const handleDeleteTransaction = (id: string) => {
    if (confirm('Tem certeza que deseja excluir esta transação?')) {
      const updated = transactions.filter(t => t.id !== id);
      setTransactions(updated);
      saveToSheets(updated, fixedAccounts, categories);
    }
  };

  const handleUpdateDueDate = (id: string, newDate: number) => {
    const updated = fixedAccounts.map(a => 
      a.id === id ? { ...a, dueDate: newDate } : a
    );
    setFixedAccounts(updated);
    saveToSheets(transactions, updated, categories);
  };

  const handleSaveTransaction = () => {
    const installmentsNum = parseInt(newTransaction.installments) || 1;
    const amountNum = parseFloat(newTransaction.amount) || 0;
    
    let finalCategory = newTransaction.category;
    let updatedCategories = categories;
    if (showNewCategoryInput && newCategoryName.trim()) {
      finalCategory = newCategoryName.trim();
      if (!categories.includes(finalCategory)) {
        updatedCategories = [...categories, finalCategory];
        setCategories(updatedCategories);
      }
    }

    const newEntries: Transaction[] = [];
    
    for (let i = 1; i <= installmentsNum; i++) {
      const date = new Date();
      date.setMonth(date.getMonth() + (i - 1));
      
      newEntries.push({
        id: Math.random().toString(36).substr(2, 9),
        description: newTransaction.description,
        amount: amountNum,
        type: newTransaction.type as any,
        category: finalCategory,
        date: date,
        dueDate: parseInt(newTransaction.dueDate),
        installments: installmentsNum > 1 ? installmentsNum : undefined,
        currentInstallment: installmentsNum > 1 ? i : undefined
      });
    }

    const updatedTransactions = [...newEntries, ...transactions];
    setTransactions(updatedTransactions);
    saveToSheets(updatedTransactions, fixedAccounts, updatedCategories);
    
    setIsAdding(false);
    setShowNewCategoryInput(false);
    setNewCategoryName('');
    setNewTransaction({
      description: '',
      amount: '',
      type: 'expense',
      category: 'Alimentação',
      installments: '1',
      dueDate: new Date().getDate().toString()
    });
  };

  const handleUpdateTransactionDueDate = (id: string, newDate: number) => {
    const updated = transactions.map(t => 
      t.id === id ? { ...t, dueDate: newDate } : t
    );
    setTransactions(updated);
    saveToSheets(updated, fixedAccounts, categories);
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center p-4 font-sans">
        <RefreshCw size={48} className="text-blue-600 animate-spin mb-4" />
        <h2 className="text-xl font-bold text-slate-800 tracking-tight">Conectando à sua Planilha...</h2>
        <p className="text-sm text-slate-500 mt-2 font-medium">Isso pode levar alguns segundos.</p>
        {syncError && (
          <div className="mt-8 p-6 bg-white border border-slate-200 rounded-3xl max-w-xl shadow-xl text-left">
            <div className="flex items-center gap-3 mb-4 text-rose-500">
              <AlertCircle size={24} />
              <p className="text-lg font-black uppercase tracking-tighter italic">
                {syncError === 'CREDENTIALS_MISSING' ? 'Configuração Necessária' : 'Erro na Planilha'}
              </p>
            </div>
            
            <div className="space-y-4 text-slate-600 text-sm leading-relaxed">
              {syncError !== 'CREDENTIALS_MISSING' && (
                <div className="bg-rose-50 p-4 rounded-xl border border-rose-100 mb-4">
                  <p className="text-rose-700 font-bold mb-1">Diagnóstico:</p>
                  <p className="text-rose-600 text-xs font-mono">{syncError}</p>
                </div>
              )}

              <p className="font-bold text-slate-800">Como corrigir:</p>
              
              <ul className="list-decimal list-inside space-y-4 font-medium text-slate-700">
                <li className="p-4 bg-rose-50 border border-rose-100 rounded-2xl">
                   <b className="text-rose-700">Atenção à imagem que você enviou:</b> Você copiou o <b>ID DA CHAVE</b> (o código curto na tabela). Isso está <b>ERRADO</b>.
                   <br/><br/>
                   <span className="text-xs">O que fazer: Clique no botão <b className="bg-slate-200 px-1 rounded">Adicionar Chave</b> &gt; <b className="bg-slate-200 px-1 rounded">Criar nova chave</b> &gt; Escolha <b>JSON</b>. Um arquivo será baixado.</span>
                </li>
                <li>
                   <b>Passo 2:</b> Abra esse arquivo baixado no seu computador e copie TODO o conteúdo (o texto que começa com <code className="bg-slate-100 px-1 rounded">{'{'}</code>).
                </li>
                <li>
                   <b>Passo 3:</b> No applet, vá em <b>Settings</b> &gt; adicione <code className="bg-slate-100 px-1 rounded">GOOGLE_PRIVATE_KEY</code> e cole o conteúdo que você copiou.
                </li>
                <li className="p-4 bg-blue-50 border border-blue-100 rounded-2xl">
                  <b>Passo 4: Verifique o ID da Planilha:</b><br/>
                  Confira se o código na URL da sua planilha é EXATAMENTE:<br/>
                  <code className="block mt-2 bg-white p-2 rounded border border-blue-200 text-blue-700 font-mono text-[10px] break-all">
                    {import.meta.env.VITE_SPREADSHEET_ID || "NÃO CONFIGURADO"}
                  </code>
                  <span className="text-[10px] text-blue-600 block mt-1 italic leading-tight">
                    Se for diferente, você precisa atualizar a variável <b>VITE_SPREADSHEET_ID</b> nas Settings.
                  </span>
                </li>
                <li>
                  <b>Passo 5:</b> Certifique-se de que convidou o e-mail que está em <code className="bg-slate-100 px-1 rounded">client_email</code> dentro do JSON para ser <b>Editor</b> na sua planilha.
                </li>
                <li>
                  Sua planilha <b>PRECISA</b> ter abas com estes nomes:
                  <div className="flex gap-2 mt-2">
                    <span className="bg-slate-100 px-2 py-1 rounded text-[10px] font-mono border border-slate-200">Transactions</span>
                    <span className="bg-slate-100 px-2 py-1 rounded text-[10px] font-mono border border-slate-200">FixedAccounts</span>
                    <span className="bg-slate-100 px-2 py-1 rounded text-[10px] font-mono border border-slate-200">Categories</span>
                  </div>
                </li>
              </ul>

              <button 
                onClick={() => window.location.reload()}
                className="w-full bg-slate-900 text-white font-bold py-3 rounded-xl mt-4 hover:bg-slate-800 transition-all flex items-center justify-center gap-2"
              >
                <RefreshCw size={16} />
                Tentar Novamente
              </button>
            </div>
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="flex h-screen bg-slate-50 text-slate-900 selection:bg-blue-500/30 overflow-hidden font-sans">
      <Sidebar activeTab={activeTab} setActiveTab={setActiveTab} />
      
      <main className="flex-1 flex flex-col min-w-0 bg-slate-50 relative">
        <header className="h-16 bg-white border-b border-slate-200 flex items-center justify-between px-6 md:px-8 shrink-0">
          <div className="flex items-center gap-2 md:hidden">
             <div className="w-6 h-6 bg-blue-600 rounded flex items-center justify-center">
              <div className="w-3 h-3 border-2 border-white"></div>
            </div>
            <h1 className="text-lg font-bold tracking-tight text-slate-900 border-l border-slate-200 pl-2 uppercase">
              FinanCorp
            </h1>
          </div>
          <div className="hidden md:block">
            <h1 className="text-lg font-semibold capitalize">Visão Geral: {activeTab}</h1>
          </div>
          
          <div className="flex items-center gap-4">
            {isSyncing && (
              <div className="flex items-center gap-2 text-[10px] font-bold text-blue-600 animate-pulse">
                <RefreshCw size={12} className="animate-spin" />
                SALVANDO...
              </div>
            )}
            {syncError && (
              <div className="flex items-center gap-2 text-[10px] font-bold text-rose-500 bg-rose-50 px-2 py-1 rounded">
                <AlertCircle size={12} />
                PLANILHA NÃO CONFIGURADA
              </div>
            )}
             <button 
              onClick={() => setIsAdding(true)}
              className="bg-blue-600 hover:bg-blue-700 text-white px-5 py-2.5 rounded-lg text-sm font-semibold shadow-sm flex items-center gap-2 transition-all active:scale-95 disabled:opacity-50"
              disabled={isLoading}
            >
              <Plus size={18} />
              <span className="hidden sm:inline">Nova Transação</span>
            </button>
          </div>
        </header>

        <div className="flex-1 overflow-y-auto p-6 md:p-8 pb-24 md:pb-8 scrollbar-hide">
          <AnimatePresence mode="wait">
            <motion.div
              key={activeTab}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.25, ease: "easeInOut" }}
            >
              {activeTab === 'dashboard' && <Dashboard transactions={filterTransactions(transactions)} accounts={fixedAccounts} />}
              {activeTab === 'transactions' && (
                <div className="space-y-6">
                   <div className="flex justify-between items-end mb-4">
                     <h2 className="text-2xl font-bold">Histórico Financeiro</h2>
                     <p className="text-xs text-slate-500 font-medium">Relatório Automático</p>
                   </div>
                   <DateFilterBar />
                   <VariableAccounts transactions={filterTransactions(transactions)} onDelete={handleDeleteTransaction} onUpdateDueDate={handleUpdateTransactionDueDate} />
                </div>
              )}
              {activeTab === 'fixed' && (
                <div className="space-y-6">
                  <h2 className="text-2xl font-bold mb-4">Controle de Mensalidades</h2>
                  <DateFilterBar />
                  <FixedAccounts accounts={fixedAccounts} onToggle={toggleAccount} onUpdateDueDate={handleUpdateDueDate} />
                </div>
              )}
              {activeTab === 'variable' && (
                <div className="space-y-6">
                  <h2 className="text-2xl font-bold mb-4">Análise de Gastos Variáveis</h2>
                  <DateFilterBar />
                  <VariableAccounts transactions={filterTransactions(transactions).filter(t => t.type === 'expense')} onDelete={handleDeleteTransaction} onUpdateDueDate={handleUpdateTransactionDueDate} />
                </div>
              )}
            </motion.div>
          </AnimatePresence>
        </div>

        <MobileNav activeTab={activeTab} setActiveTab={setActiveTab} />
      </main>

      {/* Transaction Modal */}
      <AnimatePresence>
        {isAdding && (
          <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4 z-[100]">
            <motion.div 
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-white border border-slate-200 w-full max-w-md rounded-2xl p-8 shadow-2xl overflow-y-auto max-h-[90vh]"
            >
              <div className="flex justify-between items-center mb-8">
                <h3 className="text-xl font-bold text-slate-900">Adicionar Registro</h3>
                <button onClick={() => setIsAdding(false)} className="p-2 hover:bg-slate-100 rounded-lg text-slate-400 transition-colors">
                  <X size={20} />
                </button>
              </div>
              <div className="space-y-5">
                <div>
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1.5 block">Descrição</label>
                  <input 
                    type="text" 
                    value={newTransaction.description}
                    onChange={(e) => setNewTransaction({...newTransaction, description: e.target.value})}
                    className="w-full bg-slate-50 border border-slate-200 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-600/20 focus:border-blue-600 transition-all font-medium" 
                    placeholder="Ex: Lojas Renner" 
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                   <div>
                    <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1.5 block">Valor (R$)</label>
                    <input 
                      type="number" 
                      value={newTransaction.amount}
                      onChange={(e) => setNewTransaction({...newTransaction, amount: e.target.value})}
                      className="w-full bg-slate-50 border border-slate-200 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-600/20 focus:border-blue-600 transition-all font-mono font-bold" 
                      placeholder="0,00" 
                    />
                  </div>
                   <div>
                    <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1.5 block">Dia Vencimento</label>
                    <input 
                      type="number" 
                      min="1" max="31"
                      value={newTransaction.dueDate}
                      onChange={(e) => setNewTransaction({...newTransaction, dueDate: e.target.value})}
                      className="w-full bg-slate-50 border border-slate-200 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-600/20 focus:border-blue-600 transition-all font-medium" 
                    />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                   <div>
                    <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1.5 block">Tipo</label>
                    <select 
                      value={newTransaction.type}
                      onChange={(e) => setNewTransaction({...newTransaction, type: e.target.value as any})}
                      className="w-full bg-slate-50 border border-slate-200 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-600/20 focus:border-blue-600 transition-all appearance-none text-sm font-medium"
                    >
                      <option value="expense">Saída</option>
                      <option value="income">Entrada</option>
                    </select>
                  </div>
                   <div>
                    <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1.5 block">Parcelas</label>
                    <input 
                      type="number" 
                      min="1"
                      value={newTransaction.installments}
                      onChange={(e) => setNewTransaction({...newTransaction, installments: e.target.value})}
                      disabled={newTransaction.type === 'income'}
                      className="w-full bg-slate-50 border border-slate-200 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-600/20 focus:border-blue-600 transition-all font-medium disabled:opacity-50" 
                    />
                  </div>
                </div>
                <div>
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1.5 block">Categoria</label>
                  {!showNewCategoryInput ? (
                    <select 
                      value={newTransaction.category}
                      onChange={(e) => {
                        if (e.target.value === 'NEW') {
                          setShowNewCategoryInput(true);
                        } else {
                          setNewTransaction({...newTransaction, category: e.target.value});
                        }
                      }}
                      className="w-full bg-slate-50 border border-slate-200 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-600/20 focus:border-blue-600 transition-all appearance-none text-sm font-medium"
                    >
                      {categories.map(cat => (
                        <option key={cat} value={cat}>{cat}</option>
                      ))}
                      <option value="NEW">+ Adicionar Nova...</option>
                    </select>
                  ) : (
                    <div className="flex gap-2">
                       <input 
                        type="text" 
                        autoFocus
                        value={newCategoryName}
                        onChange={(e) => setNewCategoryName(e.target.value)}
                        placeholder="Nome da categoria"
                        className="flex-1 bg-slate-50 border border-slate-200 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-600/20 focus:border-blue-600 transition-all text-sm font-medium"
                      />
                      <button 
                        onClick={() => setShowNewCategoryInput(false)}
                        className="px-3 bg-slate-100 text-slate-500 rounded-lg hover:bg-slate-200 transition-colors"
                      >
                        <X size={16} />
                      </button>
                    </div>
                  )}
                </div>
                <button 
                  onClick={handleSaveTransaction}
                  className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-4 rounded-lg mt-4 shadow-lg shadow-blue-600/20 active:scale-[0.98] transition-all"
                >
                  Confirmar Registro {parseInt(newTransaction.installments) > 1 ? `(${newTransaction.installments}x)` : ''}
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
