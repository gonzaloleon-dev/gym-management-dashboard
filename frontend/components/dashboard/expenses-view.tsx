'use client';

import { useState, useMemo } from 'react';
import { Search, Trash2, ChevronLeft, ChevronRight, Plus } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
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
import { mockExpenses, formatCurrency } from '@/lib/mock-data';
import { ExpenseModal } from './expense-modal';
import type { Expense, ExpenseCategory } from '@/lib/mock-data';

// ─── Tipos ────────────────────────────────────────────────────────────────────

type DateFilter = 'today' | 'yesterday' | 'week' | 'month' | 'all';
type MethodFilter = 'Todos' | 'Efectivo' | 'Transferencia' | 'Mercado Pago' | 'Débito' | 'Cuenta DNI';
type CategoryFilter = 'Todas' | ExpenseCategory;

const TODAY = new Date('2026-02-13');

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

// ─── Componente ────────────────────────────────────────────────────────────────

export function ExpensesView() {
  // Estados para datos simulados para permitir crear/eliminar
  const [expenses, setExpenses] = useState<Expense[]>(mockExpenses);
  
  const [searchQuery, setSearchQuery] = useState('');
  const [dateFilter, setDateFilter] = useState<DateFilter>('month');
  const [methodFilter, setMethodFilter] = useState<MethodFilter>('Todos');
  const [categoryFilter, setCategoryFilter] = useState<CategoryFilter>('Todas');
  
  const [currentPage, setCurrentPage] = useState(1);
  const [sortBy, setSortBy] = useState<'recent' | 'amount'>('recent');
  
  // Modals
  const [isExpenseModalOpen, setIsExpenseModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [expenseToDelete, setExpenseToDelete] = useState<Expense | null>(null);

  const hasActiveFilters = searchQuery !== '' || dateFilter !== 'month' || methodFilter !== 'Todos' || categoryFilter !== 'Todas';

  const clearFilters = () => {
    setSearchQuery('');
    setDateFilter('month');
    setMethodFilter('Todos');
    setCategoryFilter('Todas');
    setCurrentPage(1);
  };

  const handleSearch = (val: string) => { setSearchQuery(val); setCurrentPage(1); };
  
  // Handlers para acciones
  const handleAddExpense = (newExpenseData: any) => {
    const newExpense: Expense = {
      id: `e${Date.now()}`,
      concept: newExpenseData.concept,
      amount: newExpenseData.amount,
      date: newExpenseData.date,
      category: newExpenseData.category,
      method: newExpenseData.method
    };
    setExpenses(prev => [newExpense, ...prev]);
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
      // Búsqueda por concepto o fecha
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
      
      {/* Header con botón */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <h2 className="text-xl font-bold tracking-tight text-slate-900">Historial de Egresos</h2>
        <Button 
          onClick={() => setIsExpenseModalOpen(true)}
          className="bg-slate-900 hover:bg-slate-800 text-white font-medium"
        >
          <Plus className="h-4 w-4 mr-2" />
          Registrar Gasto
        </Button>
      </div>

      <Card className="border-border shadow-sm">
        <CardContent className="p-0 sm:p-0">
          
          {/* ── Filtros Estilo "Members Table" ── */}
          <div className="p-4 sm:p-6 border-b border-border bg-slate-50/50 flex flex-col gap-4">
            <div className="flex flex-col sm:flex-row gap-4 w-full">
              {/* Buscador general */}
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Buscar por concepto o fecha (ej: alquiler o 05/02)..."
                  value={searchQuery}
                  onChange={(e) => handleSearch(e.target.value)}
                  className="pl-9 w-full bg-white transition-all shadow-sm focus-visible:ring-1 focus-visible:ring-slate-300"
                />
              </div>

              {/* Filtros Dropdowns */}
              <div className="flex flex-col sm:flex-row gap-2 sm:gap-4 shrink-0 overflow-x-auto pb-1 sm:pb-0">
                {/* Categoría */}
                <Select value={categoryFilter} onValueChange={(v: CategoryFilter) => { setCategoryFilter(v); setCurrentPage(1); }}>
                  <SelectTrigger className="w-full sm:w-[150px] bg-white shadow-sm font-medium border-slate-200">
                    <div className="flex items-center gap-2">
                      <SelectValue placeholder="Categoría" />
                    </div>
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Todas" className="font-semibold text-slate-700">Todas las categorías</SelectItem>
                    <SelectItem value="Alquiler">Alquiler</SelectItem>
                    <SelectItem value="Servicios">Servicios</SelectItem>
                    <SelectItem value="Insumos / Mantenimiento">Insumos / Mantenimiento</SelectItem>
                    <SelectItem value="Honorarios">Honorarios</SelectItem>
                    <SelectItem value="Varios">Varios</SelectItem>
                  </SelectContent>
                </Select>

                {/* Medio */}
                <Select value={methodFilter} onValueChange={(v: MethodFilter) => { setMethodFilter(v); setCurrentPage(1); }}>
                  <SelectTrigger className="w-full sm:w-[150px] bg-white shadow-sm font-medium border-slate-200">
                    <div className="flex items-center gap-2">
                      <SelectValue placeholder="Medio" />
                    </div>
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Todos" className="font-semibold text-slate-700">Todos los medios</SelectItem>
                    <SelectItem value="Efectivo">Efectivo</SelectItem>
                    <SelectItem value="Transferencia">Transferencia</SelectItem>
                    <SelectItem value="Mercado Pago">Mercado Pago</SelectItem>
                    <SelectItem value="Débito">Débito</SelectItem>
                    <SelectItem value="Cuenta DNI">Cuenta DNI</SelectItem>
                  </SelectContent>
                </Select>

                {/* Fecha */}
                <Select value={dateFilter} onValueChange={(v: DateFilter) => { setDateFilter(v); setCurrentPage(1); }}>
                  <SelectTrigger className="w-full sm:w-[150px] bg-white shadow-sm font-medium border-slate-200">
                    <div className="flex items-center gap-2">
                      <SelectValue placeholder="Fecha" />
                    </div>
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="today">Hoy</SelectItem>
                    <SelectItem value="yesterday">Ayer</SelectItem>
                    <SelectItem value="week">Últimos 7 días</SelectItem>
                    <SelectItem value="month">Este Mes</SelectItem>
                    <SelectItem value="all">Historico</SelectItem>
                  </SelectContent>
                </Select>

                {/* Ordenar */}
                <Select value={sortBy} onValueChange={(v: 'recent' | 'amount') => setSortBy(v)}>
                  <SelectTrigger className="w-full sm:w-[150px] bg-white shadow-sm font-medium border-slate-200">
                    <SelectValue placeholder="Ordenar por" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="recent">Más recientes</SelectItem>
                    <SelectItem value="amount">Monto (Mayor)</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Fila inferior de filtros (Botón Limpiar) */}
            {hasActiveFilters && (
              <div className="flex items-center animate-in fade-in slide-in-from-top-1">
                <Button 
                  variant="ghost" 
                  size="sm" 
                  onClick={clearFilters}
                  className="text-slate-500 hover:bg-slate-200/50 hover:text-slate-900 h-8 px-3 rounded-md transition-colors"
                >
                  Limpiar filtros
                </Button>
              </div>
            )}
          </div>

          {/* ── Tabla de Gastos ── */}
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow className="bg-slate-50/70 hover:bg-slate-50/70 border-b border-slate-200">
                  <TableHead className="text-xs font-semibold text-slate-500 uppercase tracking-wider px-6 py-3">Fecha</TableHead>
                  <TableHead className="text-xs font-semibold text-slate-500 uppercase tracking-wider px-6 py-3">Concepto</TableHead>
                  <TableHead className="text-xs font-semibold text-slate-500 uppercase tracking-wider px-6 py-3 hidden sm:table-cell">Categoría</TableHead>
                  <TableHead className="text-xs font-semibold text-slate-500 uppercase tracking-wider px-6 py-3">Medio</TableHead>
                  <TableHead className="text-xs font-semibold text-slate-500 uppercase tracking-wider px-6 py-3">Monto</TableHead>
                  <TableHead className="text-xs font-semibold text-slate-500 uppercase tracking-wider text-center px-6 py-3">Acciones</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filtered.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={6} className="py-16 text-center text-slate-400 text-sm">
                      No hay gastos para los filtros seleccionados.
                    </TableCell>
                  </TableRow>
                ) : (
                  paginatedResults.map((expense) => (
                    <TableRow
                      key={expense.id}
                      className="border-b border-slate-100 hover:bg-slate-50/70 transition-colors"
                    >
                      <TableCell className="px-6 py-4 whitespace-nowrap font-medium text-slate-600">
                        {(() => {
                          const [y, m, d] = expense.date.split('-');
                          const displayDate = `${d}/${m}/${y}`;
                          return <HighlightedText text={displayDate} query={searchQuery} />;
                        })()}
                      </TableCell>
                      <TableCell className="px-6 py-4 whitespace-nowrap font-semibold text-slate-900">
                        <HighlightedText text={expense.concept} query={searchQuery} />
                      </TableCell>

                      <TableCell className="px-6 py-4 whitespace-nowrap text-slate-500 text-sm hidden sm:table-cell">
                        <Badge variant="outline" className="bg-slate-100/50 text-slate-600 border-slate-200 font-medium">
                          {expense.category}
                        </Badge>
                      </TableCell>

                      <TableCell className="px-6 py-4 whitespace-nowrap">
                        <Badge
                          variant="outline"
                          className={`text-xs font-medium ${METHOD_COLORS[expense.method] ?? 'bg-slate-100 text-slate-600 border-slate-200'}`}
                        >
                          {expense.method}
                        </Badge>
                      </TableCell>

                      {/* Monto: text-slate-900 como indicó el usuario */}
                      <TableCell className="px-6 py-4 whitespace-nowrap font-bold text-slate-900 tabular-nums">
                        {formatCurrency(expense.amount)}
                      </TableCell>

                      <TableCell className="px-6 py-4 whitespace-nowrap text-center">
                        <div className="flex justify-center">
                          <button
                            onClick={() => {
                              setExpenseToDelete(expense);
                              setIsDeleteModalOpen(true);
                            }}
                            title="Eliminar gasto"
                            className="text-slate-400 hover:text-rose-600 hover:bg-rose-50 p-2 rounded-md transition-all cursor-pointer"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
              
              {/* Footer de Tabla Responsivo y Limpio */}
              {filtered.length > 0 && (
                <TableFooter className="bg-slate-50 border-t border-slate-200">
                  <TableRow className="hover:bg-slate-50">
                    <TableCell colSpan={6} className="px-6 py-4">
                      <div className="flex justify-end items-center gap-3">
                        <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Total Gastado:</span>
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
            <div className="flex items-center justify-between pt-4 px-6 pb-6">
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

          {/* ── Modales ── */}

          {/* Modal: Nuevo Gasto */}
          <ExpenseModal 
            open={isExpenseModalOpen} 
            onOpenChange={setIsExpenseModalOpen} 
            onSave={handleAddExpense} 
          />

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
                      <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Concepto</span>
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
                  Eliminar
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>

        </CardContent>
      </Card>
    </div>
  );
}
