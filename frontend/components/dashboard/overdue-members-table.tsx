'use client';

import { AlertTriangle, MessageCircle, Phone } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
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
import type { Member } from '@/lib/mock-data';
import { formatCurrency, formatDate } from '@/lib/mock-data';

interface OverdueMembersTableProps {
  members: Member[];
}

export function OverdueMembersTable({ members }: OverdueMembersTableProps) {
  const handleWhatsApp = (member: Member) => {
    const gymName = process.env.NEXT_PUBLIC_GYM_NAME || 'el gimnasio';
    const message = encodeURIComponent(
      `Hola ${member.name.split(' ')[0]}, te escribimos desde ${gymName}. Notamos que tenés un saldo pendiente de ${formatCurrency(member.debt)}. ¿Podemos ayudarte a regularizar tu situación?`
    );
    const phone = member.phone.replace(/\D/g, '');
    window.open(`https://wa.me/${phone}?text=${message}`, '_blank');
  };

  const handleCall = (member: Member) => {
    const phone = member.phone.replace(/\D/g, '');
    window.open(`tel:${phone}`, '_self');
  };

  return (
    <Card className="border-border bg-card shadow-sm">
      <CardHeader className="pb-3">
        <div className="flex items-center gap-2">
          <div className="rounded-lg bg-destructive/10 p-2">
            <AlertTriangle className="h-5 w-5 text-destructive" />
          </div>
          <CardTitle className="text-base font-semibold text-card-foreground">
            Miembros con Pagos Vencidos
          </CardTitle>
          <Badge variant="destructive" className="ml-auto">
            {members.length} deudores
          </Badge>
        </div>
      </CardHeader>
      <CardContent>
        <div className="rounded-lg border border-border overflow-hidden">
          <Table>
            <TableHeader>
              <TableRow className="bg-muted/50 hover:bg-muted/50">
                <TableHead className="font-semibold text-foreground">Miembro</TableHead>
                <TableHead className="font-semibold text-foreground">Plan</TableHead>
                <TableHead className="font-semibold text-foreground">Deuda</TableHead>
                <TableHead className="font-semibold text-foreground">Días Vencido</TableHead>
                <TableHead className="font-semibold text-foreground">Vencimiento</TableHead>
                <TableHead className="font-semibold text-foreground text-right">Acciones</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {members.map((member) => (
                <TableRow key={member.id} className="hover:bg-muted/30">
                  <TableCell className="py-4">
                    <div className="flex items-center gap-3">
                      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-destructive/10 text-sm font-semibold text-destructive">
                        {member.name.split(' ').map(n => n[0]).join('')}
                      </div>
                      <div>
                        <p className="text-[15px] font-semibold text-card-foreground">{member.name}</p>
                        <p className="text-xs text-muted-foreground/70 font-mono">DNI: {member.dni}</p>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge variant="outline" className="font-normal">
                      {member.plan}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <span className="font-semibold text-destructive">
                      {formatCurrency(member.debt)}
                    </span>
                  </TableCell>
                  <TableCell>
                    <Badge 
                      variant="destructive" 
                      className="font-semibold"
                    >
                      {member.daysOverdue} días
                    </Badge>
                  </TableCell>
                  <TableCell className="text-muted-foreground">
                    {formatDate(member.nextExpiry)}
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center justify-end gap-2">
                      <Button
                        size="sm"
                        variant="ghost"
                        className="h-8 w-8 p-0 text-muted-foreground hover:text-foreground"
                        onClick={() => handleCall(member)}
                      >
                        <Phone className="h-4 w-4" />
                        <span className="sr-only">Llamar</span>
                      </Button>
                      <Button
                        size="sm"
                        className="gap-1.5 bg-primary text-primary-foreground hover:bg-primary/90"
                        onClick={() => handleWhatsApp(member)}
                      >
                        <MessageCircle className="h-4 w-4" />
                        <span className="hidden md:inline">WhatsApp</span>
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>

        {members.length === 0 && (
          <div className="py-12 text-center text-muted-foreground">
            <AlertTriangle className="mx-auto h-12 w-12 mb-3 opacity-30" />
            <p className="text-sm">No hay miembros con pagos vencidos</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
