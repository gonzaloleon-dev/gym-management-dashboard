'use client';

import { useState, useMemo } from 'react';
import { Search, Trash2, ChevronLeft, ChevronRight, Plus, TrendingDown, TrendingUp, ArrowRightLeft, Building, Lightbulb, Megaphone, Receipt, Wrench, ShieldCheck, Sparkles } from 'lucide-react';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip as RechartsTooltip, AreaChart, Area, LineChart, Line, XAxis, YAxis, CartesianGrid, Legend } from 'recharts';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
  TableFooter,
} from '@/components/ui/table';
import { HighlightedText } from '@/components/ui/highlighted-text';
import { mockExpenses, formatCurrency, getPaymentStats, revenueData } from '@/lib/mock-data';
import type { Expense, ExpenseCategory } from '@/lib/mock-data';

// ─── Tipos y Utilidades ────────────────────────────────────────────────────────

type DateFilter = 'today' | 'yesterday' | 'week' | 'month' | 'all';
type MethodFilter = 'Todos' | 'Efectivo' | 'Transferencia' | 'Mercado Pago' | 'Débito' | 'Cuenta DNI';
type CategoryFilter = 'Todas' | ExpenseCategory;

const TODAY = new Date('2026-02-13');
const CURRENT_MONTH_STR = '2026-02';

function getDateRange(filter: DateFilter): { from: Date; to: Date } | null {
  const from = new Date(TODAY);
  const to = new Date(TODAY);
  to.setHours(23, 59, 59, 999);

  switch (filter) {
    case 'today':
      from.setHours(0, 0, 0, 0);
      return { from, to };
    case 'yesterday':
      from.setDate(from.getDate() - 1); from.setHours(0, 0, 0, 0);
      to.setDate(to.getDate() - 1);
      return { from, to };
    case 'week':
      from.setDate(from.getDate() - 6); from.setHours(0, 0, 0, 0);
      return { from, to };
    case 'month':
      from.setDate(1); from.setHours(0, 0, 0, 0);
      return { from, to };
    case 'all':
      return null;
  }
}

const METHOD_COLORS: Record<string, string> = {
  'Efectivo': 'bg-emerald-50 text-emerald-700 border-emerald-200',
  'Transferencia': 'bg-blue-50 text-blue-700 border-blue-200',
  'Mercado Pago': 'bg-sky-50 text-sky-700 border-sky-200',
  'Débito': 'bg-violet-50 text-violet-700 border-violet-200',
  'Cuenta DNI': 'bg-orange-50 text-orange-700 border-orange-200',
  'Otros': 'bg-slate-100 text-slate-600 border-slate-200',
};

const ITEMS_PER_PAGE = 10;

// ─── Custom Tooltip ────────────────────────────────────────────────────────
const CustomTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    const ingresos = payload.find((p: any) => p.dataKey === 'Ingresos')?.value || 0;
    const gastos = payload.find((p: any) => p.dataKey === 'Gastos')?.value || 0;
    const resultado = ingresos - gastos;
    const isPositive = resultado >= 0;

    return (
      <div className="bg-card border border-border shadow-md rounded-xl p-4 text-sm min-w-[200px]">
        <p className="font-bold mb-3 text-card-foreground border-b border-border pb-2 capitalize">{label}</p>
        <div className="flex justify-between items-center mb-2">
          <div className="flex items-center gap-2">
            <div className="w-2.5 h-2.5 rounded-full bg-emerald-500"></div>
            <span className="text-slate-600">Ingresos:</span>
          </div>
          <span className="font-bold text-slate-900">{formatCurrency(ingresos)}</span>
        </div>
        <div className="flex justify-between items-center mb-3">
          <div className="flex items-center gap-2">
            <div className="w-2.5 h-2.5 rounded-full bg-slate-500"></div>
            <span className="text-slate-600">Gastos:</span>
          </div>
          <span className="font-bold text-slate-900">{formatCurrency(gastos)}</span>
        </div>
        <div className={`flex justify-between items-center pt-2 mt-2 border-t border-slate-100 font-bold ${isPositive ? 'text-emerald-600' : 'text-rose-600'}`}>
          <span>Ganancia:</span>
          <span>{formatCurrency(resultado)}</span>
        </div>
      </div>
    );
  }
  return null;
};

// ─── Componente Principal ────────────────────────────────────────────────────────

export function ExpensesView() {
  const [expenses, setExpenses] = useState<Expense[]>(mockExpenses);

  const [searchQuery, setSearchQuery] = useState('');
  const [dateFilter, setDateFilter] = useState<DateFilter>('month');
  const [methodFilter, setMethodFilter] = useState<MethodFilter>('Todos');
  const [categoryFilter, setCategoryFilter] = useState<CategoryFilter>('Todas');

  const [currentPage, setCurrentPage] = useState(1);
  const [sortBy, setSortBy] = useState<'recent' | 'amount'>('recent');

  // Modals de eliminación
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [expenseToDelete, setExpenseToDelete] = useState<Expense | null>(null);

  // Formulario en línea
  const [newExpenseName, setNewExpenseName] = useState('');
  const [newCategory, setNewCategory] = useState<ExpenseCategory | ''>('');
  const [newMethod, setNewMethod] = useState('');
  const [newAmount, setNewAmount] = useState('');

  const hasActiveFilters = searchQuery !== '' || dateFilter !== 'month' || methodFilter !== 'Todos' || categoryFilter !== 'Todas';

  const clearFilters = () => {
    setSearchQuery('');
    setDateFilter('month');
    setMethodFilter('Todos');
    setCategoryFilter('Todas');
    setCurrentPage(1);
  };

  const handleSearch = (val: string) => { setSearchQuery(val); setCurrentPage(1); };

  // Macro Estadísticas del mes actual
  const monthlyExpenses = useMemo(() => expenses.filter(e => e.date.startsWith(CURRENT_MONTH_STR)), [expenses]);
  const totalMonth = monthlyExpenses.reduce((acc, e) => acc + e.amount, 0);

  const monthRevenue = getPaymentStats().monthlyRevenue;
  const netProfit = monthRevenue - totalMonth;
  const isProfit = netProfit >= 0;

  const catAlquiler = monthlyExpenses.filter(e => e.category === 'Alquiler').reduce((acc, e) => acc + e.amount, 0);
  const catServicios = monthlyExpenses.filter(e => e.category === 'Servicios').reduce((acc, e) => acc + e.amount, 0);
  const catMantenimiento = monthlyExpenses.filter(e => e.category === 'Mantenimiento / Reparaciones').reduce((acc, e) => acc + e.amount, 0);

  // Evolución histórica (Últimos 6 meses). Se aseguran datos coherentes sin caída a cero.
  const balanceHistory = useMemo(() => {
    // Desvinculamos de revenueData para forzar coherencia con la vista de MTD.
    const baseRevenue = monthRevenue > 0 ? monthRevenue : 650000;
    const baseExpenses = totalMonth > 0 ? totalMonth : 690000;

    const history = [
      { name: 'Sep', Ingresos: baseRevenue * 0.90, Gastos: baseRevenue * 0.65 },
      { name: 'Oct', Ingresos: baseRevenue * 0.95, Gastos: baseRevenue * 0.80 },
      { name: 'Nov', Ingresos: baseRevenue * 0.92, Gastos: baseRevenue * 0.70 },
      { name: 'Dic', Ingresos: baseRevenue * 1.10, Gastos: baseRevenue * 0.85 },
      { name: 'Ene', Ingresos: baseRevenue * 1.05, Gastos: baseRevenue * 0.75 },
    ];
    // Mes actual
    history.push({
      name: 'Feb',
      Ingresos: baseRevenue,
      Gastos: baseExpenses,
    });
    return history;
  }, [monthRevenue, totalMonth]);

  // Handlers para acciones
  const handleQuickSave = () => {
    if (!newExpenseName || !newCategory || !newMethod || !newAmount) return;

    const newExpense: Expense = {
      id: `e${Date.now()}`,
      concept: newExpenseName,
      amount: Number(newAmount.toString().replace(',', '.')),
      date: new Date().toISOString().split('T')[0],
      category: newCategory as ExpenseCategory,
      method: newMethod
    };
    setExpenses(prev => [newExpense, ...prev]);

    // Reset inputs
    setNewExpenseName('');
    setNewCategory('');
    setNewMethod('');
    setNewAmount('');
  };

  const handleDelete = (id: string) => {
    setExpenses(prev => prev.filter(e => e.id !== id));
    setIsDeleteModalOpen(false);
  };

  const filtered = useMemo(() => {
    const range = getDateRange(dateFilter);
    const normalize = (s: string) =>
      s.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase();
    const q = normalize(searchQuery.trim());

    const isPotentialDate = /[\d/]/.test(searchQuery);

    return expenses.filter((e) => {
      if (isPotentialDate && searchQuery.trim()) {
        const [y, m, d] = e.date.split('-');
        const displayDate = `${d}/${m}/${y}`;
        if (displayDate.includes(searchQuery.trim())) return true;
      }

      if (range) {
        const eDate = new Date(e.date);
        if (eDate < range.from || eDate > range.to) return false;
      }

      if (methodFilter !== 'Todos' && e.method !== methodFilter) return false;
      if (categoryFilter !== 'Todas' && e.category !== categoryFilter) return false;

      if (q) {
        if (!normalize(e.concept).includes(q)) return false;
      }

      return true;
    }).sort((a, b) => {
      if (sortBy === 'recent') {
        const dateA = new Date(a.date).getTime();
        const dateB = new Date(b.date).getTime();
        return dateB - dateA;
      }
      if (sortBy === 'amount') {
        return b.amount - a.amount;
      }
      return 0;
    });
  }, [searchQuery, dateFilter, methodFilter, categoryFilter, sortBy, expenses]);

  const totalFiltered = filtered.reduce((acc, e) => acc + e.amount, 0);

  const totalPages = Math.max(1, Math.ceil(filtered.length / ITEMS_PER_PAGE));
  const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
  const paginatedResults = filtered.slice(startIndex, startIndex + ITEMS_PER_PAGE);

  return (
    <div className="space-y-6">



      {/* ── 2. Análisis Financiero General (Separado en Tarjetas) ── */}
      <div className="grid grid-cols-1 xl:grid-cols-12 gap-6 mb-8">

        {/* Panel Izquierdo (Evolución y KPIs) */}
        <Card className="xl:col-span-8 flex flex-col p-5 md:p-6 pb-4 border-border bg-card shadow-sm rounded-2xl">

            <div className="flex items-center justify-between mb-5">
              <div>
                <h2 className="text-base font-semibold text-card-foreground">Gastos vs Ingresos</h2>
                <p className="text-sm text-muted-foreground mt-0.5">Comparativa mensual del flujo de caja</p>
              </div>
            </div>

            {/* KPIs Intercalados */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
              <div className="bg-slate-50 rounded-xl p-4 border border-slate-100 flex flex-col justify-center">
                <span className="text-sm font-medium text-muted-foreground mb-1">Ingresos</span>
                <span className="text-2xl font-black text-slate-800 tracking-tight">{formatCurrency(monthRevenue)}</span>
              </div>
              <div className="bg-slate-50 rounded-xl p-4 border border-slate-100 flex flex-col justify-center">
                <span className="text-sm font-medium text-muted-foreground mb-1">Gastos</span>
                <span className="text-2xl font-black text-slate-800 tracking-tight">{formatCurrency(totalMonth)}</span>
              </div>
              <div className={`${isProfit ? 'bg-emerald-50 border-emerald-100' : 'bg-rose-50 border-rose-100'} rounded-xl p-4 border flex flex-col justify-center transition-colors`}>
                <span className={`text-sm font-medium mb-1 ${isProfit ? 'text-emerald-700' : 'text-rose-700'}`}>Ganancia Neta</span>
                <div className="flex items-baseline gap-2">
                  <span className={`text-2xl font-black tracking-tight ${isProfit ? 'text-emerald-900' : 'text-rose-900'}`}>{formatCurrency(netProfit)}</span>
                  <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${isProfit ? 'text-emerald-700 bg-emerald-100/50' : 'text-rose-700 bg-rose-100/50'}`}>{monthRevenue > 0 ? ((Math.abs(netProfit) / monthRevenue) * 100).toFixed(1) : '0'}%</span>
                </div>
              </div>
            </div>

            {/* Gráfico Chart */}
            <div className="flex-1 w-full min-h-[260px]">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart
                  data={balanceHistory}
                  margin={{ top: 10, right: 10, left: 0, bottom: 0 }}
                >
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                  <XAxis dataKey="name" tick={{ fill: '#64748b', fontSize: 12 }} axisLine={false} tickLine={false} dy={10} />
                  <YAxis
                    domain={[0, 'auto']}
                    tickFormatter={(val) => val === 0 ? '$0' : `$${(val / 1000000).toFixed(1)}M`}
                    tick={{ fill: '#64748b', fontSize: 12 }}
                    axisLine={false}
                    tickLine={false}
                    width={50}
                  />
                  <RechartsTooltip content={<CustomTooltip />} />
                  <Legend iconType="circle" wrapperStyle={{ paddingTop: '20px', fontSize: '13px' }} formatter={(value) => <span className="text-slate-600 font-medium">{value}</span>} />

                  {/* SOLO Ingresos y Gastos */}
                  <Line
                    type="monotone"
                    dataKey="Ingresos"
                    stroke="#10B981"
                    strokeWidth={3}
                    dot={{ r: 4, strokeWidth: 2 }}
                    activeDot={{ r: 6 }}
                  />
                  <Line
                    type="monotone"
                    dataKey="Gastos"
                    stroke="#64748B"
                    strokeWidth={3}
                    dot={{ r: 4, strokeWidth: 2 }}
                    activeDot={{ r: 6 }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
        </Card>

        {/* Panel Derecho (Composición) */}
        <Card className="xl:col-span-4 bg-white flex flex-col p-6 md:p-8 border-border shadow-sm rounded-2xl">
            <div className="flex items-center justify-between mb-8">
              <div>
                <h2 className="text-base font-semibold text-card-foreground">Composición de Gastos</h2>
                <p className="text-sm text-muted-foreground mt-0.5">Desglose del mes actual</p>
              </div>
            </div>

            <div className="relative h-[240px] w-full flex items-center justify-center mb-10 shrink-0">
              <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none z-10">
                <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-widest mb-1">Total Gastado</span>
                <span className="text-2xl font-black text-slate-800">{formatCurrency(totalMonth)}</span>
              </div>
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={[
                      { name: 'Alquiler', value: catAlquiler, color: '#0F766E' },
                      { name: 'Mantenimiento', value: catMantenimiento, color: '#14B8A6' },
                      { name: 'Servicios', value: catServicios, color: '#0284C7' },
                      { name: 'Limpieza', value: monthlyExpenses.filter(e => e.category === 'Limpieza').reduce((acc, e) => acc + e.amount, 0), color: '#3B82F6' },
                      { name: 'Varios', value: monthlyExpenses.filter(e => e.category === 'Varios').reduce((acc, e) => acc + e.amount, 0), color: '#94A3B8' },
                    ].sort((a, b) => b.value - a.value).filter(d => d.value > 0)}
                    cx="50%"
                    cy="50%"
                    innerRadius={80}
                    outerRadius={105}
                    paddingAngle={5}
                    dataKey="value"
                    stroke="none"
                    cornerRadius={4}
                  >
                    {
                      [
                        { name: 'Alquiler', value: catAlquiler, color: '#0F766E' },
                        { name: 'Mantenimiento', value: catMantenimiento, color: '#14B8A6' },
                        { name: 'Servicios', value: catServicios, color: '#0284C7' },
                        { name: 'Limpieza', value: monthlyExpenses.filter(e => e.category === 'Limpieza').reduce((acc, e) => acc + e.amount, 0), color: '#3B82F6' },
                        { name: 'Varios', value: monthlyExpenses.filter(e => e.category === 'Varios').reduce((acc, e) => acc + e.amount, 0), color: '#94A3B8' },
                      ].sort((a, b) => b.value - a.value).filter(d => d.value > 0).map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))
                    }
                  </Pie>
                  <RechartsTooltip formatter={(value: number) => formatCurrency(value)} contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }} />
                </PieChart>
              </ResponsiveContainer>
            </div>

            <div className="space-y-5 px-2 flex-1 flex flex-col justify-end">
              {[
                { name: 'Alquiler', value: catAlquiler, colorClass: 'bg-teal-700' },
                { name: 'Mantenimiento', value: catMantenimiento, colorClass: 'bg-teal-500' },
                { name: 'Servicios', value: catServicios, colorClass: 'bg-sky-600' },
                { name: 'Limpieza', value: monthlyExpenses.filter(e => e.category === 'Limpieza').reduce((acc, e) => acc + e.amount, 0), colorClass: 'bg-blue-500' },
                { name: 'Varios', value: monthlyExpenses.filter(e => e.category === 'Varios').reduce((acc, e) => acc + e.amount, 0), colorClass: 'bg-slate-400' },
              ].sort((a, b) => b.value - a.value).filter(d => d.value > 0).map((item, i) => (
                <div key={i} className="group">
                  <div className="flex justify-between items-center mb-1.5 text-sm">
                    <span className="font-semibold text-slate-600 group-hover:text-slate-900 transition-colors">{item.name}</span>
                    <span className="font-bold text-slate-800">{formatCurrency(item.value)}</span>
                  </div>
                  <div className="w-full h-2.5 bg-slate-100 rounded-full overflow-hidden">
                    <div className={`${item.colorClass} h-full rounded-full transition-all duration-500`} style={{ width: totalMonth > 0 ? `${(item.value / totalMonth) * 100}%` : '0%' }}></div>
                  </div>
                </div>
              ))}
            </div>
        </Card>
      </div>

      {/* ── 2. Operación (Registrar Nuevo Gasto) ── */}
      <Card className="border-border bg-white shadow-sm mb-6 rounded-2xl">
        <CardHeader className="pb-4">
          <CardTitle className="text-base font-semibold text-card-foreground">Registrar Nuevo Gasto</CardTitle>
          <p className="text-sm text-muted-foreground mt-0.5">Cargá un nuevo gasto de forma rápida</p>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-5 gap-4 items-end">
            <div className="flex flex-col gap-2">
              <Label className="text-sm font-medium" htmlFor="quick-expense">Descripción</Label>
              <Input
                id="quick-expense"
                placeholder="Ej. Reparación de pesas"
                className="w-full h-10 border-slate-200 bg-white"
                value={newExpenseName}
                onChange={(e) => setNewExpenseName(e.target.value)}
              />
            </div>

            <div className="flex flex-col gap-2">
              <Label className="text-sm font-medium">Categoría</Label>
              <Select value={newCategory} onValueChange={(v: ExpenseCategory) => setNewCategory(v)}>
                <SelectTrigger className="w-full h-10 border-slate-200 bg-white">
                  <SelectValue placeholder="Seleccionar" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Alquiler">Alquiler</SelectItem>
                  <SelectItem value="Servicios">Servicios</SelectItem>
                  <SelectItem value="Mantenimiento / Reparaciones">Mantenimiento</SelectItem>
                  <SelectItem value="Limpieza">Limpieza</SelectItem>
                  <SelectItem value="Varios">Varios</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="flex flex-col gap-2">
              <Label className="text-sm font-medium">Medio de Pago</Label>
              <Select value={newMethod} onValueChange={setNewMethod}>
                <SelectTrigger className="w-full h-10 border-slate-200 bg-white">
                  <SelectValue placeholder="Seleccionar..." />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Efectivo">Efectivo</SelectItem>
                  <SelectItem value="Transferencia">Transferencia</SelectItem>
                  <SelectItem value="Mercado Pago">Mercado Pago</SelectItem>
                  <SelectItem value="Débito">Débito</SelectItem>
                  <SelectItem value="Cuenta DNI">Cuenta DNI</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="flex flex-col gap-2">
              <Label className="text-sm font-medium" htmlFor="quick-amount">Monto ($)</Label>
              <Input
                id="quick-amount"
                type="text"
                inputMode="decimal"
                placeholder="0.00"
                className="w-full h-10 text-lg font-medium border-slate-200 bg-white"
                value={newAmount}
                onChange={(e) => {
                  const val = e.target.value.replace(/[^0-9.,]/g, '');
                  setNewAmount(val);
                }}
              />
            </div>

            <div className="flex flex-col">
              <Button
                className="w-full bg-primary hover:bg-primary/90 text-primary-foreground h-10 shadow-sm flex items-center justify-center gap-2 font-medium cursor-pointer"
                onClick={handleQuickSave}
              >
                <Plus className="h-4 w-4" />
                Guardar Gasto
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* ── 3. Historial de Egresos (Tabla y Filtros) ── */}
      <Card className="rounded-xl border border-border bg-white shadow-sm overflow-hidden">
        <CardHeader className="pb-2">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <CardTitle className="text-base font-semibold text-card-foreground">
              Historial de Egresos
            </CardTitle>
            <div className="flex items-center gap-2 text-sm">
              <Receipt className="h-4 w-4 text-slate-400" />
              <span className="text-slate-500">{filtered.length} transacciones</span>
              <span className="text-slate-300">·</span>
              <span className="font-semibold text-slate-900">{formatCurrency(totalFiltered)}</span>
            </div>
          </div>
        </CardHeader>

        <CardContent>
          {/* Barra de controles SIMÉTRICA A PAGOS */}
          <div className="flex flex-col md:flex-row justify-between items-end gap-4 w-full mb-6">

            {/* Buscador */}
            <div className="flex flex-col gap-1.5 flex-1 w-full md:max-w-2xl">
              <Label className="text-xs font-semibold text-slate-500 uppercase tracking-wider ml-1">Buscar</Label>
              <div className="relative w-full">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  placeholder="Buscar por descripción o fecha (ej: alquiler o 05/02)..."
                  value={searchQuery}
                  onChange={(e) => handleSearch(e.target.value)}
                  className="pl-10 pr-4 py-2 bg-white border border-stone-200 rounded-lg text-sm focus:outline-none focus-visible:ring-2 focus-visible:ring-slate-400 transition-shadow w-full h-10"
                />
              </div>
            </div>

            {/* Filtros */}
            <div className="flex flex-wrap md:flex-nowrap gap-3 shrink-0">
              <div className="flex flex-col gap-1.5 w-full sm:w-[140px]">
                <Label className="text-xs font-semibold text-slate-500 uppercase tracking-wider ml-1">Categoría</Label>
                <Select value={categoryFilter} onValueChange={(v: CategoryFilter) => { setCategoryFilter(v); setCurrentPage(1); }}>
                  <SelectTrigger className="w-full bg-white border border-stone-200 hover:bg-stone-50 text-sm h-10 cursor-pointer">
                    <SelectValue placeholder="Todas" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Todas">Todas</SelectItem>
                    <SelectItem value="Alquiler">Alquiler</SelectItem>
                    <SelectItem value="Servicios">Servicios</SelectItem>
                    <SelectItem value="Mantenimiento / Reparaciones">Mantenimiento</SelectItem>
                    <SelectItem value="Limpieza">Limpieza</SelectItem>
                    <SelectItem value="Varios">Varios</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="flex flex-col gap-1.5 w-full sm:w-[140px]">
                <Label className="text-xs font-semibold text-slate-500 uppercase tracking-wider ml-1">Medio</Label>
                <Select value={methodFilter} onValueChange={(v: MethodFilter) => { setMethodFilter(v); setCurrentPage(1); }}>
                  <SelectTrigger className="w-full bg-white border border-stone-200 hover:bg-stone-50 text-sm h-10 cursor-pointer">
                    <SelectValue placeholder="Todos" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Todos">Todos</SelectItem>
                    <SelectItem value="Efectivo">Efectivo</SelectItem>
                    <SelectItem value="Transferencia">Transferencia</SelectItem>
                    <SelectItem value="Mercado Pago">Mercado Pago</SelectItem>
                    <SelectItem value="Débito">Débito</SelectItem>
                    <SelectItem value="Cuenta DNI">Cuenta DNI</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="flex flex-col gap-1.5 w-full sm:w-[140px]">
                <Label className="text-xs font-semibold text-slate-500 uppercase tracking-wider ml-1">Fecha</Label>
                <Select value={dateFilter} onValueChange={(v: DateFilter) => { setDateFilter(v); setCurrentPage(1); }}>
                  <SelectTrigger className="w-full bg-white border border-stone-200 hover:bg-stone-50 text-sm h-10 cursor-pointer">
                    <SelectValue placeholder="Este mes" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="today">Hoy</SelectItem>
                    <SelectItem value="yesterday">Ayer</SelectItem>
                    <SelectItem value="week">Esta semana</SelectItem>
                    <SelectItem value="month">Este mes</SelectItem>
                    <SelectItem value="all">Todos</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

          </div>

          {/* Fila inferir de filtros */}
          {hasActiveFilters && (
            <div className="flex items-center mb-4">
              <Button
                variant="ghost"
                size="sm"
                onClick={clearFilters}
                className="text-slate-500 hover:text-slate-900 border border-transparent hover:border-slate-200 h-8 px-3 rounded-md transition-colors"
              >
                Limpiar filtros
              </Button>
            </div>
          )}

          {/* ── Tabla de Gastos ── */}
          <div className="rounded-md border border-slate-200 overflow-hidden">
            <Table>
              <TableHeader className="bg-slate-50">
                <TableRow className="hover:bg-slate-50 border-b border-slate-200 text-xs font-semibold text-slate-500 uppercase tracking-wider">
                  <TableHead className="px-6 py-3 h-auto">Fecha</TableHead>
                  <TableHead className="px-6 py-3 h-auto">Descripción</TableHead>
                  <TableHead className="px-6 py-3 h-auto hidden sm:table-cell">Categoría</TableHead>
                  <TableHead className="px-6 py-3 h-auto">Medio de Pago</TableHead>
                  <TableHead className="px-6 py-3 h-auto text-right">Monto</TableHead>
                  <TableHead className="w-[80px] text-center px-6 py-3 h-auto">Acciones</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filtered.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={6} className="py-16 text-center text-slate-400 text-sm">
                      <div className="flex flex-col items-center gap-2">
                        <Search className="h-8 w-8 text-slate-200 mb-2" />
                        <p>No se encontraron gastos</p>
                      </div>
                    </TableCell>
                  </TableRow>
                ) : (
                  paginatedResults.map((expense) => (
                    <TableRow
                      key={expense.id}
                      className="border-b border-slate-100/50 hover:bg-slate-50/70 transition-colors"
                    >
                      <TableCell className="px-6 py-4 whitespace-nowrap text-sm font-medium text-slate-600">
                        {(() => {
                          const [y, m, d] = expense.date.split('-');
                          const displayDate = `${d}/${m}/${y}`;
                          return <HighlightedText text={displayDate} query={searchQuery} />;
                        })()}
                      </TableCell>
                      <TableCell className="px-6 py-4 whitespace-nowrap text-sm font-semibold text-slate-900">
                        <HighlightedText text={expense.concept} query={searchQuery} />
                      </TableCell>

                      <TableCell className="px-6 py-4 whitespace-nowrap text-slate-500 text-sm hidden sm:table-cell">
                        {expense.category}
                      </TableCell>

                      <TableCell className="px-6 py-4 whitespace-nowrap">
                        <Badge
                          variant="outline"
                          className={`text-xs font-medium ${METHOD_COLORS[expense.method] ?? 'bg-slate-100 text-slate-600 border-slate-200'}`}
                        >
                          {expense.method}
                        </Badge>
                      </TableCell>

                      {/* Monto: text-slate-900, text-right para alinear con footer */}
                      <TableCell className="px-6 py-4 whitespace-nowrap text-right font-semibold text-slate-900 tabular-nums">
                        {formatCurrency(expense.amount)}
                      </TableCell>

                      <TableCell className="px-6 py-4 whitespace-nowrap text-center">
                        <button
                          onClick={() => {
                            setExpenseToDelete(expense);
                            setIsDeleteModalOpen(true);
                          }}
                          title="Eliminar gasto"
                          className="p-1.5 mx-auto rounded-md text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-colors"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>

              {/* Footer de Tabla Responsivo y Limpio */}
              {filtered.length > 0 && (
                <TableFooter className="bg-slate-50 hover:bg-slate-50 border-t border-slate-200">
                  <TableRow className="hover:bg-slate-50">
                    <TableCell colSpan={6} className="px-6 py-4">
                      <div className="flex justify-end items-center gap-3">
                        <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">TOTAL GASTADO:</span>
                        <span className="font-bold text-slate-900 tabular-nums text-lg">{formatCurrency(totalFiltered)}</span>
                      </div>
                    </TableCell>
                  </TableRow>
                </TableFooter>
              )}
            </Table>
          </div>

          {/* ── Paginación ── */}
          {totalPages > 1 && (
            <div className="flex items-center justify-between pt-6">
              <p className="text-sm text-muted-foreground">
                Mostrando {startIndex + 1} -{' '}
                {Math.min(startIndex + ITEMS_PER_PAGE, filtered.length)} de{' '}
                {filtered.length}
              </p>
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="icon"
                  className="h-8 w-8 bg-transparent cursor-pointer"
                  onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                  disabled={currentPage === 1}
                >
                  <ChevronLeft className="h-4 w-4" />
                </Button>
                <span className="text-sm text-muted-foreground">
                  {currentPage} / {totalPages}
                </span>
                <Button
                  variant="outline"
                  size="icon"
                  className="h-8 w-8 bg-transparent cursor-pointer"
                  onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                  disabled={currentPage === totalPages}
                >
                  <ChevronRight className="h-4 w-4" />
                </Button>
              </div>
            </div>
          )}

          {/* Modal: Confirmación de Eliminación */}
          <Dialog open={isDeleteModalOpen} onOpenChange={setIsDeleteModalOpen}>
            <DialogContent className="sm:max-w-[425px]">
              <DialogHeader>
                <DialogTitle className="text-xl font-bold text-slate-900">Eliminar Gasto</DialogTitle>
                <DialogDescription className="text-slate-500 pt-2">
                  ¿Estás seguro de que deseas eliminar este registro de gasto? Esta acción es irreversible.
                </DialogDescription>
              </DialogHeader>

              {expenseToDelete && (() => {
                const e = expenseToDelete;
                const [y, m, d] = e.date.split('-');
                return (
                  <div className="bg-slate-50 rounded-lg p-4 border border-slate-100 my-4 flex flex-col gap-3">
                    <div className="flex justify-between items-center">
                      <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Descripción</span>
                      <span className="text-sm font-bold text-slate-700 max-w-[200px] text-right truncate">{e.concept}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Fecha</span>
                      <span className="text-sm font-bold text-slate-700">{`${d}/${m}/${y}`}</span>
                    </div>
                    <div className="flex justify-between items-center pt-2 border-t border-slate-200">
                      <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Monto</span>
                      <span className="text-lg font-bold text-slate-900">{formatCurrency(e.amount)}</span>
                    </div>
                  </div>
                );
              })()}

              <DialogFooter className="gap-3 sm:gap-3 pt-2">
                <Button
                  variant="outline"
                  onClick={() => setIsDeleteModalOpen(false)}
                  className="cursor-pointer border-slate-300 text-slate-700 hover:bg-slate-100 hover:text-slate-900 font-medium px-6"
                >
                  Mantener gasto
                </Button>
                <Button
                  onClick={() => expenseToDelete && handleDelete(expenseToDelete.id)}
                  className="bg-rose-600 hover:bg-rose-700 text-white font-bold px-6 shadow-md transition-all cursor-pointer border-0"
                >
                  Eliminar gasto
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>

        </CardContent>
      </Card>
    </div>
  );
}
