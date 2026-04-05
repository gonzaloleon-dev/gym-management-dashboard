'use client';

import { useState, useMemo } from 'react';
import { Search, ChevronLeft, ChevronRight, Plus, Pencil, Trash2 } from 'lucide-react';
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
import type { Member, MembershipPlan } from '@/lib/mock-data';
import { formatDate } from '@/lib/mock-data';
import { cn } from '@/lib/utils';
import { Label } from '@/components/ui/label';
import { MemberDetailsModal } from './member-details-modal';

interface MembersTableProps {
  members: Member[];
}

const ITEMS_PER_PAGE = 15;

export function MembersTable({ members }: MembersTableProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('Todos');
  const [sortBy, setSortBy] = useState<string>('nameAsc');
  const [currentPage, setCurrentPage] = useState(1);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedMember, setSelectedMember] = useState<Member | null>(null);

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
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(
        (m) =>
          m.name.toLowerCase().includes(query) ||
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
          <Button onClick={handleNewMember} className="gap-2 bg-primary text-primary-foreground hover:bg-primary/90 w-full sm:w-auto">
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
              <TableRow className="bg-white hover:bg-white border-b border-gray-100">
                <TableHead className="font-bold text-slate-900">Alumno</TableHead>
                <TableHead className="font-bold text-slate-900 hidden md:table-cell">Contacto</TableHead>
                <TableHead className="font-bold text-slate-900 w-[150px] hidden sm:table-cell text-left">Plan</TableHead>
                <TableHead className="font-bold text-slate-900">Vencimiento</TableHead>
                <TableHead className="font-bold text-slate-900">Estado</TableHead>
                <TableHead className="font-bold text-slate-900 text-right w-[100px]">Acciones</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {paginatedMembers.map((member) => (
                <TableRow key={member.id} className="border-border/50 hover:bg-slate-100 transition-colors">
                  <TableCell className="py-4">
                    <div className="flex items-center gap-3 cursor-pointer group" onClick={() => handleEditMember(member)}>
                      <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-muted text-xs font-bold text-muted-foreground group-hover:bg-primary/10 group-hover:text-primary transition-colors">
                        {member.name.split(' ').map((n) => n[0]).join('').slice(0, 2)}
                      </div>
                      <div className="min-w-0">
                        <p className="truncate text-sm font-semibold text-slate-700 group-hover:text-primary transition-colors">
                          {member.name}
                        </p>
                        <p className="truncate text-xs text-slate-500 font-sans md:hidden">
                          {member.phone}
                        </p>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell className="py-4 text-sm hidden md:table-cell">
                    <p className="text-slate-700 font-medium">{member.phone}</p>
                    <p className="text-slate-500 text-xs">{member.email}</p>
                  </TableCell>
                  <TableCell className="py-4 hidden sm:table-cell">
                    <span className="text-sm text-slate-600 font-medium">
                      {member.plan}
                    </span>
                  </TableCell>
                  <TableCell className="py-4 text-slate-600 font-medium text-sm">
                    {formatDate(member.nextExpiry)}
                  </TableCell>
                  <TableCell className="py-4 text-sm">
                    {getStatusBadge(member.status)}
                  </TableCell>
                  <TableCell className="py-4 text-right">
                    <div className="flex items-center justify-end gap-1">
                      <button 
                        onClick={(e) => { e.stopPropagation(); handleEditMember(member); }}
                        className="text-slate-400 hover:text-slate-700 hover:bg-slate-100 p-2 rounded-md transition-colors"
                        title="Editar alumno"
                      >
                        <Pencil className="h-4 w-4" />
                      </button>
                      <button 
                        onClick={(e) => { e.stopPropagation(); alert(`¿Eliminar al alumno ${member.name}?`); }}
                        className="text-slate-400 hover:text-red-600 hover:bg-red-50 p-2 rounded-md transition-colors"
                        title="Eliminar alumno"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
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
    </Card>
  );
}
