'use client';

import { useState, useMemo } from 'react';
import { Search, ChevronLeft, ChevronRight, MoreHorizontal, Mail, Phone } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import type { Member, MembershipPlan } from '@/lib/mock-data';
import { formatDate } from '@/lib/mock-data';
import { cn } from '@/lib/utils';

interface MembersTableProps {
  members: Member[];
}

const ITEMS_PER_PAGE = 8;

export function MembersTable({ members }: MembersTableProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [currentPage, setCurrentPage] = useState(1);

  const filteredMembers = useMemo(() => {
    if (!searchQuery.trim()) return members;
    const query = searchQuery.toLowerCase();
    return members.filter(
      (m) =>
        m.name.toLowerCase().includes(query) ||
        m.dni.includes(query) ||
        m.email.toLowerCase().includes(query)
    );
  }, [members, searchQuery]);

  const totalPages = Math.ceil(filteredMembers.length / ITEMS_PER_PAGE);
  const paginatedMembers = filteredMembers.slice(
    (currentPage - 1) * ITEMS_PER_PAGE,
    currentPage * ITEMS_PER_PAGE
  );

  const getStatusBadge = (status: Member['status']) => {
    const styles = {
      Activo: 'bg-primary/15 text-primary border-primary/30',
      Vencido: 'bg-warning/15 text-warning border-warning/30',
      Deudor: 'bg-destructive/15 text-destructive border-destructive/30',
    };
    return (
      <Badge variant="outline" className={cn('font-medium', styles[status])}>
        {status}
      </Badge>
    );
  };

  const getPlanBadge = (plan: MembershipPlan) => {
    return (
      <Badge variant="outline" className="font-normal text-card-foreground bg-muted/50">
        {plan}
      </Badge>
    );
  };

  return (
    <Card className="border-border bg-card">
      <CardHeader className="pb-4">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <CardTitle className="text-base font-semibold text-card-foreground">
            Listado de Miembros
          </CardTitle>
          <div className="relative w-full sm:w-72">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Buscar por nombre, DNI o email..."
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value);
                setCurrentPage(1);
              }}
              className="pl-9 bg-secondary/50 border-border"
            />
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="rounded-lg border border-border overflow-hidden">
          <Table>
            <TableHeader>
              <TableRow className="border-border bg-secondary/30 hover:bg-secondary/30">
                <TableHead className="text-muted-foreground font-medium">Nombre</TableHead>
                <TableHead className="text-muted-foreground font-medium hidden md:table-cell">DNI</TableHead>
                <TableHead className="text-muted-foreground font-medium">Plan</TableHead>
                <TableHead className="text-muted-foreground font-medium">Estado</TableHead>
                <TableHead className="text-muted-foreground font-medium hidden sm:table-cell">Último Pago</TableHead>
                <TableHead className="text-muted-foreground font-medium w-10"></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {paginatedMembers.map((member) => (
                <TableRow key={member.id} className="border-border hover:bg-secondary/20">
                  <TableCell className="py-4">
                    <div className="flex items-center gap-3">
                      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-primary/15 text-sm font-semibold text-primary">
                        {member.name.split(' ').map((n) => n[0]).join('').slice(0, 2)}
                      </div>
                      <div className="min-w-0">
                        <p className="truncate text-[15px] font-semibold text-card-foreground">
                          {member.name}
                        </p>
                        <p className="truncate text-xs text-muted-foreground/70 md:hidden">
                          {member.dni}
                        </p>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell className="py-4 text-sm text-muted-foreground/70 hidden md:table-cell font-mono">
                    {member.dni}
                  </TableCell>
                  <TableCell className="py-4">{getPlanBadge(member.plan)}</TableCell>
                  <TableCell className="py-4">{getStatusBadge(member.status)}</TableCell>
                  <TableCell className="py-4 text-muted-foreground hidden sm:table-cell">
                    {formatDate(member.lastPayment)}
                  </TableCell>
                  <TableCell className="py-4">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon" className="h-8 w-8">
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end" className="w-48">
                        <DropdownMenuItem className="gap-2">
                          <Mail className="h-4 w-4" />
                          Enviar Email
                        </DropdownMenuItem>
                        <DropdownMenuItem className="gap-2">
                          <Phone className="h-4 w-4" />
                          Llamar
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
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
    </Card>
  );
}
