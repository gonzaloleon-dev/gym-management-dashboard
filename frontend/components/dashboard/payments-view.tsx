'use client';

import { useState, useMemo } from 'react';
import { Search, Trash2, Receipt, ChevronLeft, ChevronRight, Banknote, Landmark, CreditCard, Wallet, Smartphone, QrCode } from 'lucide-react';
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
} from '@/components/ui/table';
import { HighlightedText } from '@/components/ui/highlighted-text';
import { recentPayments, formatCurrency, formatDate } from '@/lib/mock-data';

// ─── Tipos ────────────────────────────────────────────────────────────────────

type DateFilter   = 'today' | 'yesterday' | 'week' | 'month' | 'all';
type MethodFilter = 'Todos' | 'Efectivo' | 'Transferencia' | 'Mercado Pago' | 'Débito' | 'Cuenta DNI';

const TODAY = new Date('2026-02-13');

function getDateRange(filter: DateFilter): { from: Date; to: Date } | null {
  const from = new Date(TODAY);
  const to   = new Date(TODAY);
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
  'Efectivo':      'bg-emerald-50 text-emerald-700 border-emerald-200',
  'Transferencia': 'bg-blue-50 text-blue-700 border-blue-200',
  'Mercado Pago':  'bg-sky-50 text-sky-700 border-sky-200',
  'Débito':        'bg-violet-50 text-violet-700 border-violet-200',
  'Cuenta DNI':    'bg-orange-50 text-orange-700 border-orange-200',
  'Otros':         'bg-slate-100 text-slate-600 border-slate-200',
};

const ITEMS_PER_PAGE = 10;

// ─── Componente ────────────────────────────────────────────────────────────────

export function PaymentsView() {
  const [searchQuery,   setSearchQuery]   = useState('');
  const [dateFilter,    setDateFilter]    = useState<DateFilter>('month');
  const [methodFilter,  setMethodFilter]  = useState<MethodFilter>('Todos');
  const [voidedIds,     setVoidedIds]     = useState<Set<string>>(new Set());
  const [currentPage,   setCurrentPage]   = useState(1);
  const [paymentToVoid, setPaymentToVoid] = useState<string | null>(null);

  const hasActiveFilters = searchQuery !== '' || dateFilter !== 'month' || methodFilter !== 'Todos';

  const clearFilters = () => {
    setSearchQuery('');
    setDateFilter('month');
    setMethodFilter('Todos');
    setCurrentPage(1);
  };

  const handleSearch = (val: string) => { setSearchQuery(val); setCurrentPage(1); };
  const handleDateChange = (val: DateFilter) => { setDateFilter(val); setCurrentPage(1); };
  const handleMethodChange = (val: MethodFilter) => { setMethodFilter(val); setCurrentPage(1); };

  const handleVoid = (id: string) => {
    setVoidedIds((prev) => new Set(prev).add(id));
    setPaymentToVoid(null);
  };

  const filtered = useMemo(() => {
    const range     = getDateRange(dateFilter);
    const normalize = (s: string) =>
      s.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase();
    const q = normalize(searchQuery.trim());

    // Verificamos si la búsqueda parece ser una fecha (contiene números o barras)
    const isPotentialDate = /[\d/]/.test(searchQuery);

    return recentPayments.filter((p) => {
      if (voidedIds.has(p.id)) return false;

      // Búsqueda por fecha (parcial o completa en formato DD/MM/YYYY)
      if (isPotentialDate && searchQuery.trim()) {
        const [y, m, d] = p.date.split('-');
        const displayDate = `${d}/${m}/${y}`;
        if (displayDate.includes(searchQuery.trim())) return true;
      }

      if (range) {
        const pDate = new Date(p.date);
        if (pDate < range.from || pDate > range.to) return false;
      }

      if (methodFilter !== 'Todos' && p.method !== methodFilter) return false;

      if (q) {
        const matchName = normalize(p.memberName).includes(q);
        const matchPlan = normalize(p.concept).includes(q);
        if (!matchName && !matchPlan) return false;
      }

      return true;
    });
  }, [searchQuery, dateFilter, methodFilter, voidedIds]);

  // Totales para el desglose de caja
  const totalFiltered  = filtered.reduce((acc, p) => acc + p.amount, 0);
  const countByMethod  = filtered.reduce<Record<string, number>>((acc, p) => {
    acc[p.method] = (acc[p.method] ?? 0) + p.amount;
    return acc;
  }, {});

  // Lógica de paginación
  const totalPages = Math.ceil(filtered.length / ITEMS_PER_PAGE);
  const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
  const paginatedResults = filtered.slice(startIndex, startIndex + ITEMS_PER_PAGE);

  return (
    <div className="space-y-6">
      {/* ── Panel 'Cierre de Caja' ── */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4 mb-2">
        {[
          { name: 'Efectivo',      icon: Banknote,   color: 'text-emerald-600', bg: 'bg-emerald-50' },
          { name: 'Transferencia', icon: Landmark,   color: 'text-blue-600',    bg: 'bg-blue-50' },
          { name: 'Mercado Pago',  icon: Wallet,     color: 'text-sky-600',     bg: 'bg-sky-50' },
          { name: 'Débito',        icon: CreditCard, color: 'text-violet-600',   bg: 'bg-violet-50' },
          { name: 'Cuenta DNI',    icon: Smartphone, color: 'text-orange-600',   bg: 'bg-orange-50' },
        ].map((method) => {
          const Icon = method.icon;
          return (
            <Card key={method.name} className="border-slate-200 bg-white shadow-sm">
              <CardContent className="p-5">
                <div className="flex items-start justify-between">
                  <div>
                    <p className="text-sm font-medium text-slate-500">{method.name}</p>
                    <p className="text-xl font-bold text-slate-900 mt-1">
                      {formatCurrency(countByMethod[method.name] || 0)}
                    </p>
                  </div>
                  <div className={`p-2.5 rounded-lg shrink-0 ${method.bg}`}>
                    <Icon className={`h-5 w-5 ${method.color}`} />
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      <Card className="rounded-xl border border-border bg-white shadow-sm overflow-hidden">
        <CardHeader className="pb-2">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <CardTitle className="text-base font-semibold text-card-foreground">
              Historial de Pagos
            </CardTitle>

            {/* Resumen rápido inline */}
            <div className="flex items-center gap-2 text-sm">
              <Receipt className="h-4 w-4 text-slate-400" />
              <span className="text-slate-500">{filtered.length} transacciones</span>
              <span className="text-slate-300">·</span>
              <span className="font-semibold text-teal-700">{formatCurrency(totalFiltered)}</span>
            </div>
          </div>
        </CardHeader>

        <CardContent>

          {/* ── Barra de controles ── */}
          <div className="flex flex-col sm:flex-row gap-3 mb-6 items-end">

            {/* Búsqueda */}
            <div className="flex flex-col gap-1.5 flex-1 w-full">
              <Label className="text-xs font-semibold text-slate-500 uppercase tracking-wider ml-1">Buscar</Label>
              <div className="relative w-full">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  placeholder="Buscar por alumno, plan o fecha (ej: 28/12/2025)..."
                  value={searchQuery}
                  onChange={(e) => handleSearch(e.target.value)}
                  className="pl-10 pr-4 py-2 bg-white border border-stone-200 rounded-lg text-sm focus:outline-none focus-visible:ring-2 focus-visible:ring-teal-500 transition-shadow w-full h-10"
                />
              </div>
            </div>

            {/* Filtro Fecha y Medio juntos para reducir espacio */}
            <div className="flex gap-2 w-full sm:w-auto">
              <div className="flex flex-col gap-1.5 w-full sm:w-[150px]">
                <Label className="text-xs font-semibold text-slate-500 uppercase tracking-wider ml-1">Fecha</Label>
                <Select value={dateFilter} onValueChange={(v) => handleDateChange(v as DateFilter)}>
                  <SelectTrigger className="h-10 bg-white border-stone-200 text-sm text-slate-900 cursor-pointer">
                    <SelectValue />
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

              <div className="flex flex-col gap-1.5 w-full sm:w-[170px]">
                <Label className="text-xs font-semibold text-slate-500 uppercase tracking-wider ml-1">Medio de pago</Label>
                <Select value={methodFilter} onValueChange={(v) => handleMethodChange(v as MethodFilter)}>
                  <SelectTrigger className="h-10 bg-white border-stone-200 text-sm text-slate-900 cursor-pointer">
                    <SelectValue />
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
            </div>
          </div>

          {/* ── Tabla ── */}
          <div className="rounded-lg border border-slate-100 overflow-hidden">
            <Table>
              <TableHeader>
                <TableRow className="border-slate-100 bg-slate-50 hover:bg-slate-50">
                  <TableHead className="text-slate-600 font-semibold text-xs uppercase tracking-wider w-[110px]">Fecha</TableHead>
                  <TableHead className="text-slate-600 font-semibold text-xs uppercase tracking-wider">Alumno</TableHead>
                  <TableHead className="text-slate-600 font-semibold text-xs uppercase tracking-wider hidden sm:table-cell">Plan</TableHead>
                  <TableHead className="text-slate-600 font-semibold text-xs uppercase tracking-wider w-[140px]">Medio</TableHead>
                  <TableHead className="text-slate-600 font-semibold text-xs uppercase tracking-wider w-[110px]">Monto</TableHead>
                  <TableHead className="text-slate-600 font-semibold text-xs uppercase tracking-wider text-center w-[80px]">Acciones</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filtered.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={6} className="py-16 text-center text-slate-400 text-sm">
                      No hay transacciones para los filtros seleccionados.
                    </TableCell>
                  </TableRow>
                ) : (
                  paginatedResults.map((payment) => (
                    <TableRow
                      key={payment.id}
                      className="border-slate-100 hover:bg-slate-50/70 transition-colors"
                    >
                      <TableCell className="py-4 font-medium text-slate-600">
                        {(() => {
                          const [y, m, d] = payment.date.split('-');
                          const displayDate = `${d}/${m}/${y}`;
                          return <HighlightedText text={displayDate} query={searchQuery} />;
                        })()}
                      </TableCell>
                      <TableCell className="py-4 font-semibold text-slate-900">
                        <HighlightedText text={payment.memberName} query={searchQuery} />
                      </TableCell>

                      {/* Plan — con resaltado */}
                      <TableCell className="text-slate-500 text-sm hidden sm:table-cell">
                        <HighlightedText text={payment.concept} query={searchQuery} />
                      </TableCell>

                      {/* Medio de pago */}
                      <TableCell>
                        <Badge
                          variant="outline"
                          className={`text-xs font-medium ${METHOD_COLORS[payment.method] ?? 'bg-slate-100 text-slate-600 border-slate-200'}`}
                        >
                          {payment.method}
                        </Badge>
                      </TableCell>

                      {/* Monto — left aligned */}
                      <TableCell className="font-semibold text-teal-700 tabular-nums">
                        {formatCurrency(payment.amount)}
                      </TableCell>

                      {/* Acciones — centrado */}
                      <TableCell className="text-center">
                        <div className="flex justify-center">
                          <button
                            onClick={() => setPaymentToVoid(payment.id)}
                            title="Anular pago"
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
            </Table>
          </div>

          {/* ── Desglose de caja por método ── */}
          {filtered.length > 0 && (
            <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-end">
                <div className="flex items-center gap-3 leading-tight">
                  <span className="text-sm text-slate-500 font-medium uppercase tracking-wide">Total:</span>
                  <span className="text-xl font-bold text-teal-700">{formatCurrency(totalFiltered)}</span>
                </div>
            </div>
          )}

          {/* ── Paginación (Sincronizada con Miembros) ── */}
          {totalPages > 1 && (
            <div className="flex items-center justify-between pt-4 border-t border-slate-50 mt-4">
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

          {/* ── Modal de Confirmación de Anulación ── */}
          <Dialog open={!!paymentToVoid} onOpenChange={(open) => !open && setPaymentToVoid(null)}>
            <DialogContent className="sm:max-w-[425px]">
              <DialogHeader>
                <DialogTitle>Anular Pago</DialogTitle>
                <DialogDescription>
                  ¿Estás seguro de que deseas anular este pago? Esta acción no se puede deshacer y el registro dejará de figurar en el libro contable.
                </DialogDescription>
              </DialogHeader>
              <DialogFooter className="gap-2 sm:gap-0">
                <Button
                  variant="outline"
                  onClick={() => setPaymentToVoid(null)}
                  className="cursor-pointer"
                >
                  Cancelar
                </Button>
                <Button
                  variant="destructive"
                  onClick={() => paymentToVoid && handleVoid(paymentToVoid)}
                  className="bg-rose-600 hover:bg-rose-700 cursor-pointer"
                >
                  Confirmar Anulación
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>


        </CardContent>
      </Card>
    </div>
  );
}
