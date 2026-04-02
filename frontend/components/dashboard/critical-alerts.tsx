'use client';

import { AlertCircle, MessageCircle, Phone } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import type { Member } from '@/lib/mock-data';
import { formatCurrency } from '@/lib/mock-data';

interface CriticalAlertsProps {
  debtors: Member[];
}

export function CriticalAlerts({ debtors }: CriticalAlertsProps) {
  const handleWhatsApp = (member: Member) => {
    const message = encodeURIComponent(
      `Hola ${member.name.split(' ')[0]}, te escribimos desde GymPro. Notamos que tenés un saldo pendiente de ${formatCurrency(member.debt)}. ¿Podemos ayudarte a regularizar tu situación?`
    );
    const phone = member.phone.replace(/\D/g, '');
    window.open(`https://wa.me/${phone}?text=${message}`, '_blank');
  };

  return (
    <Card className="border-border bg-card">
      <CardHeader className="pb-3">
        <div className="flex items-center gap-2">
          <AlertCircle className="h-5 w-5 text-destructive" />
          <CardTitle className="text-base font-semibold text-card-foreground">
            Alertas Críticas - Top 5 Deudores
          </CardTitle>
        </div>
      </CardHeader>
      <CardContent className="space-y-3">
        {debtors.map((member, index) => (
          <div
            key={member.id}
            className="flex items-center justify-between gap-4 rounded-lg border border-border bg-secondary/30 p-3"
          >
            <div className="flex items-center gap-3 min-w-0">
              <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-destructive/15 text-sm font-semibold text-destructive">
                {index + 1}
              </div>
              <div className="min-w-0">
                <p className="truncate text-sm font-medium text-card-foreground">
                  {member.name}
                </p>
                <p className="text-xs text-muted-foreground">DNI: {member.dni}</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <Badge variant="destructive" className="shrink-0 font-semibold">
                {formatCurrency(member.debt)}
              </Badge>
              <Button
                size="sm"
                variant="outline"
                className="shrink-0 gap-1.5 border-primary/30 text-primary hover:bg-primary/10 hover:text-primary bg-transparent"
                onClick={() => handleWhatsApp(member)}
              >
                <MessageCircle className="h-3.5 w-3.5" />
                <span className="hidden sm:inline">WhatsApp</span>
              </Button>
            </div>
          </div>
        ))}

        {debtors.length === 0 && (
          <div className="py-8 text-center text-muted-foreground">
            <AlertCircle className="mx-auto h-10 w-10 mb-2 opacity-50" />
            <p>No hay deudores registrados</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
