'use client';

import { useState, useMemo } from 'react';
import { Search, ChevronLeft, ChevronRight, Plus, SquarePen, Trash2, CircleDollarSign } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import type { Member, MembershipPlan } from '@/lib/mock-data';
import { formatDate } from '@/lib/mock-data';
import { cn } from '@/lib/utils';
import { Label } from '@/components/ui/label';
import { MemberDetailsModal } from './member-details-modal';
import { PaymentModal } from './payment-modal';

interface MembersTableProps {
  members: Member[];
}

const ITEMS_PER_PAGE = 10;

import { HighlightedText } from '@/components/ui/highlighted-text';

export function MembersTable({ members }: MembersTableProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('Todos');
  const [sortBy, setSortBy] = useState<string>('nameAsc');
  const [currentPage, setCurrentPage] = useState(1);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedMember, setSelectedMember] = useState<Member | null>(null);

  const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false);
  const [paymentMember, setPaymentMember] = useState<Member | null>(null);

  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [memberToDelete, setMemberToDelete] = useState<Member | null>(null);

  const handleEditMember = (member: Member) => {
    setSelectedMember(member);
    setIsModalOpen(true);
  };

  const handleNewMember = () => {
    setSelectedMember(null);
    setIsModalOpen(true);
  };

  const filteredMembers = useMemo(() => {
    let filtered = [...members]; // Creamos una copia para poder mutarla en sort

    if (searchQuery.trim()) {
      const normalize = (str: string) =>
        str.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase();
      
      const query = normalize(searchQuery.trim());
      filtered = filtered.filter(
        (m) =>
          normalize(m.name).includes(query) ||
          m.phone.toLowerCase().includes(query) ||
          m.dni.includes(query)
      );
    }

    if (statusFilter !== 'Todos') {
      filtered = filtered.filter((m) => m.status === statusFilter);
    }

    if (sortBy === 'nameAsc') {
      filtered.sort((a, b) => a.name.localeCompare(b.name));
    } else if (sortBy === 'nameDesc') {
      filtered.sort((a, b) => b.name.localeCompare(a.name));
    } else if (sortBy === 'lastNameAsc') {
      filtered.sort((a, b) => {
        const aLast = a.name.split(' ').slice(1).join(' ') || a.name;
        const bLast = b.name.split(' ').slice(1).join(' ') || b.name;
        return aLast.localeCompare(bLast);
      });
    } else if (sortBy === 'lastNameDesc') {
      filtered.sort((a, b) => {
        const aLast = a.name.split(' ').slice(1).join(' ') || a.name;
        const bLast = b.name.split(' ').slice(1).join(' ') || b.name;
        return bLast.localeCompare(aLast);
      });
    } else if (sortBy === 'expiryAsc') {
      // Ordenar por fecha cronológica: primero los más viejos (vencidos) hasta los más futuros
      filtered.sort((a, b) => new Date(a.nextExpiry).getTime() - new Date(b.nextExpiry).getTime());
    }

    return filtered;
  }, [members, searchQuery, statusFilter, sortBy]);

  const totalPages = Math.ceil(filteredMembers.length / ITEMS_PER_PAGE);
  const paginatedMembers = filteredMembers.slice(
    (currentPage - 1) * ITEMS_PER_PAGE,
    currentPage * ITEMS_PER_PAGE
  );

  const getStatusBadge = (status: Member['status']) => {
    switch (status) {
      case 'Activo':
        return (
          <Badge variant="outline" className="bg-emerald-50 text-emerald-700 border-emerald-200 font-medium">
            Activo
          </Badge>
        );
      case 'Vencido':
        return (
          <Badge variant="outline" className="bg-orange-50 text-orange-700 border-orange-200 font-medium">
            Vence Hoy
          </Badge>
        );
      case 'Deudor':
        return (
          <Badge variant="outline" className="bg-red-50 text-red-700 border-red-200 font-medium">
            Pago Vencido
          </Badge>
        );
    }
  };

  return (
    <Card className="rounded-xl border border-border bg-white shadow-sm overflow-hidden">
      <CardHeader className="pb-2">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <CardTitle className="text-base font-semibold text-card-foreground">
            Listado de Miembros
          </CardTitle>
          <Button onClick={handleNewMember} className="gap-2 bg-primary text-primary-foreground hover:bg-primary/90 w-full sm:w-auto cursor-pointer">
            <Plus className="h-4 w-4" />
            Nuevo Miembro
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        <div className="flex flex-col sm:flex-row gap-4 mb-6 items-end">
          <div className="flex flex-col gap-1.5 flex-1 w-full">
            <Label className="text-xs font-semibold text-slate-500 uppercase tracking-wider ml-1">Buscar Alumno</Label>
            <div className="relative w-full">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder="Buscar por nombre, apellido "
                value={searchQuery}
                onChange={(e) => {
                  setSearchQuery(e.target.value);
                  setCurrentPage(1);
                }}
                className="pl-10 pr-4 py-2 bg-white border border-stone-200 rounded-lg text-sm focus:outline-none focus-visible:ring-2 focus-visible:ring-teal-500 transition-shadow w-full h-10"
              />
            </div>
          </div>

          <div className="flex flex-col gap-1.5 w-full sm:w-[200px]">
            <Label className="text-xs font-semibold text-slate-500 uppercase tracking-wider ml-1">Ordenar por</Label>
            <Select value={sortBy} onValueChange={(val) => {
              setSortBy(val);
              if (val === 'expiryAsc') setStatusFilter('Todos'); // Si ordena por vencimiento, mostrar panorama completo
              setCurrentPage(1);
            }}>
              <SelectTrigger className="w-full bg-white border border-stone-200 hover:bg-stone-50 text-sm h-10">
                <SelectValue placeholder="Ordenar por" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="nameAsc">Nombre (A-Z)</SelectItem>
                <SelectItem value="nameDesc">Nombre (Z-A)</SelectItem>
                <SelectItem value="lastNameAsc">Apellido (A-Z)</SelectItem>
                <SelectItem value="lastNameDesc">Apellido (Z-A)</SelectItem>
                <SelectItem value="expiryAsc">Vencimiento</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="flex flex-col gap-1.5 w-full sm:w-[150px]">
            <Label className="text-xs font-semibold text-slate-500 uppercase tracking-wider ml-1">Filtrar por</Label>
            <Select value={statusFilter} onValueChange={(val) => {
              setStatusFilter(val);
              setSortBy('nameAsc'); // Resetear orden al filtrar para evitar confusiones
              setCurrentPage(1);
            }}>
              <SelectTrigger className="w-full bg-white border border-stone-200 hover:bg-stone-50 text-sm h-10">
                <SelectValue placeholder="Estado" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Todos">Todos</SelectItem>
                <SelectItem value="Activo">Activos</SelectItem>
                <SelectItem value="Vencido">Vencen Hoy</SelectItem>
                <SelectItem value="Deudor">Pagos Vencidos</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        <div className="rounded-lg border border-border overflow-hidden">
          <Table>
            <TableHeader>
              <TableRow className="bg-slate-50 hover:bg-slate-50 border-b border-slate-200">
                <TableHead className="text-xs font-semibold text-slate-500 uppercase tracking-wider text-left px-6 py-3">Alumno</TableHead>
                <TableHead className="text-xs font-semibold text-slate-500 uppercase tracking-wider text-left px-6 py-3 hidden md:table-cell">Contacto</TableHead>
                <TableHead className="text-xs font-semibold text-slate-500 uppercase tracking-wider text-left px-6 py-3 w-[150px] hidden sm:table-cell">Plan</TableHead>
                <TableHead className="text-xs font-semibold text-slate-500 uppercase tracking-wider text-left px-6 py-3">Vencimiento</TableHead>
                <TableHead className="text-xs font-semibold text-slate-500 uppercase tracking-wider text-left px-6 py-3">Estado</TableHead>
                <TableHead className="text-xs font-semibold text-slate-500 uppercase tracking-wider text-center px-6 py-3">Acciones</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {paginatedMembers.map((member) => (
                <TableRow key={member.id} className="border-b border-slate-200 hover:bg-slate-50 transition-colors">
                  <TableCell className="bg-white px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center gap-3 cursor-pointer group" onClick={() => handleEditMember(member)}>
                      <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-muted text-xs font-bold text-muted-foreground group-hover:bg-primary/10 group-hover:text-primary transition-colors">
                        {member.name.split(' ').map((n) => n[0]).join('').slice(0, 2)}
                      </div>
                      <div className="min-w-0">
                        <p className="truncate text-sm font-semibold text-slate-700 group-hover:text-primary transition-colors">
                          <HighlightedText text={member.name} query={searchQuery} />
                        </p>
                        <p className="truncate text-xs text-slate-500 font-sans md:hidden">
                          {member.phone}
                        </p>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell className="bg-white px-6 py-4 whitespace-nowrap hidden md:table-cell">
                    <p className="text-slate-700 font-medium text-sm">{member.phone}</p>
                    <p className="text-slate-500 text-xs">{member.email}</p>
                  </TableCell>
                  <TableCell className="bg-white px-6 py-4 whitespace-nowrap hidden sm:table-cell">
                    <span className="text-sm text-slate-600 font-medium">
                      {member.plan}
                    </span>
                  </TableCell>
                  <TableCell className="bg-white px-6 py-4 whitespace-nowrap text-slate-600 font-medium text-sm">
                    {formatDate(member.nextExpiry)}
                  </TableCell>
                  <TableCell className="bg-white px-6 py-4 whitespace-nowrap text-sm">
                    {getStatusBadge(member.status)}
                  </TableCell>
                  <TableCell className="bg-white px-6 py-4 whitespace-nowrap text-center">
                    <div className="flex items-center justify-center gap-2">
                      {/* Cobrar */}
                      <div className="relative group/tooltip">
                        <button
                          onClick={(e) => { e.stopPropagation(); setPaymentMember(member); setIsPaymentModalOpen(true); }}
                          className="text-slate-400 hover:text-teal-600 hover:bg-teal-50 p-2 rounded-md transition-all cursor-pointer"
                        >
                          <CircleDollarSign className="h-5 w-5" />
                        </button>
                        <span className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-2 py-1 bg-slate-900 text-white text-[10px] font-medium rounded opacity-0 group-hover/tooltip:opacity-100 pointer-events-none transition-opacity whitespace-nowrap z-30 shadow-sm">
                          Registrar Cobro
                          <span className="absolute top-full left-1/2 -translate-x-1/2 border-4 border-transparent border-t-slate-900"></span>
                        </span>
                      </div>

                      {/* Editar */}
                      <div className="relative group/tooltip">
                        <button
                          onClick={(e) => { e.stopPropagation(); handleEditMember(member); }}
                          className="text-slate-400 hover:text-slate-800 hover:bg-slate-100 p-2 rounded-md transition-all cursor-pointer"
                        >
                          <SquarePen className="h-5 w-5" />
                        </button>
                        <span className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-2 py-1 bg-slate-900 text-white text-[10px] font-medium rounded opacity-0 group-hover/tooltip:opacity-100 pointer-events-none transition-opacity whitespace-nowrap z-30 shadow-sm">
                          Editar Alumno
                          <span className="absolute top-full left-1/2 -translate-x-1/2 border-4 border-transparent border-t-slate-900"></span>
                        </span>
                      </div>

                      {/* Eliminar */}
                      <div className="relative group/tooltip">
                        <button
                          onClick={(e) => { 
                            e.stopPropagation(); 
                            setMemberToDelete(member);
                            setIsDeleteModalOpen(true);
                          }}
                          className="text-slate-400 hover:text-rose-600 hover:bg-rose-50 p-2 rounded-md transition-all cursor-pointer"
                        >
                          <Trash2 className="h-5 w-5" />
                        </button>
                        <span className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-2 py-1 bg-slate-900 text-white text-[10px] font-medium rounded opacity-0 group-hover/tooltip:opacity-100 pointer-events-none transition-opacity whitespace-nowrap z-30 shadow-sm">
                          Eliminar Alumno
                          <span className="absolute top-full left-1/2 -translate-x-1/2 border-4 border-transparent border-t-slate-900"></span>
                        </span>
                      </div>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
              {paginatedMembers.length === 0 && (
                <TableRow>
                  <TableCell colSpan={6} className="h-24 text-center text-muted-foreground">
                    No se encontraron miembros
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex items-center justify-between pt-4">
            <p className="text-sm text-muted-foreground">
              Mostrando {(currentPage - 1) * ITEMS_PER_PAGE + 1} -{' '}
              {Math.min(currentPage * ITEMS_PER_PAGE, filteredMembers.length)} de{' '}
              {filteredMembers.length}
            </p>
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="icon"
                className="h-8 w-8 bg-transparent"
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
                className="h-8 w-8 bg-transparent"
                onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                disabled={currentPage === totalPages}
              >
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
          </div>
        )}
      </CardContent>

      <MemberDetailsModal
        open={isModalOpen}
        onOpenChange={setIsModalOpen}
        member={selectedMember}
      />
      <PaymentModal
        open={isPaymentModalOpen}
        onOpenChange={setIsPaymentModalOpen}
        member={paymentMember}
      />

      {/* ── Modal de Confirmación de Eliminación ── */}
      <Dialog open={isDeleteModalOpen} onOpenChange={setIsDeleteModalOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle className="text-xl font-bold text-slate-900">Eliminar Alumno</DialogTitle>
            <DialogDescription className="text-slate-500 pt-2">
              ¿Estás seguro de que deseas eliminar este alumno? Todo su historial se archivará pero no será visible.
            </DialogDescription>
          </DialogHeader>

          {memberToDelete && (() => {
            const m = memberToDelete;
            return (
              <div className="bg-slate-50 rounded-lg p-4 border border-slate-100 my-4 flex flex-col gap-3">
                <div className="flex justify-between items-center">
                  <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Alumno</span>
                  <span className="text-sm font-bold text-slate-700">{m.name}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Plan</span>
                  <span className="text-sm font-bold text-slate-700">{m.plan}</span>
                </div>
                <div className="flex justify-between items-center pt-2 border-t border-slate-200">
                  <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Estado</span>
                  <span className={`text-sm font-bold ${m.status === 'Activo' ? 'text-emerald-600' : m.status === 'Deudor' ? 'text-rose-600' : 'text-orange-600'}`}>
                    {m.status}
                  </span>
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
              Mantener alumno
            </Button>
            <Button
              onClick={() => {
                // Aquí iría tu lógica real de anulación, simulada cerrando modal
                setIsDeleteModalOpen(false);
              }}
              className="bg-rose-600 hover:bg-rose-700 text-white font-bold px-6 shadow-md transition-all cursor-pointer border-0"
            >
              Eliminar alumno
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

    </Card>
  );
}
