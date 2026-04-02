'use client';

import { CalendarClock, MessageCircle, Clock } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import type { Member } from '@/lib/mock-data';
import { PLAN_PRICES, formatCurrency } from '@/lib/mock-data';

interface TodayExpiriesProps {
  members: Member[];
}

export function TodayExpiries({ members }: TodayExpiriesProps) {
  const handleWhatsApp = (member: Member) => {
    const planPrice = PLAN_PRICES[member.plan];
    const gymName = process.env.NEXT_PUBLIC_GYM_NAME || 'el gimnasio';
    const message = encodeURIComponent(
      `Hola ${member.name.split(' ')[0]}! Te escribimos desde ${gymName}. Tu membresía de ${member.plan} vence hoy. El valor para renovar es ${formatCurrency(planPrice)}. ¿Te gustaría renovar?`
    );
    const phone = member.phone.replace(/\D/g, '');
    window.open(`https://wa.me/${phone}?text=${message}`, '_blank');
  };

  return (
    <Card className="border-border bg-card shadow-sm h-full">
      <CardHeader className="pb-3">
        <div className="flex items-center gap-2">
          <div className="rounded-lg bg-warning/10 p-2">
            <CalendarClock className="h-5 w-5 text-warning" />
          </div>
          <CardTitle className="text-base font-semibold text-card-foreground">
            Vencimientos de Hoy
          </CardTitle>
          <Badge variant="secondary" className="ml-auto bg-warning/10 text-warning border-0">
            {members.length}
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-3">
        {members.map((member) => (
          <div
            key={member.id}
            className="flex items-center justify-between gap-3 rounded-lg border border-border bg-muted/30 p-3"
          >
            <div className="flex items-center gap-3 min-w-0">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-primary/10 text-sm font-semibold text-primary">
                {member.name.split(' ').map(n => n[0]).join('')}
              </div>
              <div className="min-w-0">
                <p className="truncate text-sm font-medium text-card-foreground">
                  {member.name}
                </p>
                <div className="flex items-center gap-2">
                  <Badge variant="outline" className="text-xs font-normal">
                    {member.plan}
                  </Badge>
                </div>
              </div>
            </div>
            <Button
              size="sm"
              className="shrink-0 gap-1.5 bg-primary text-primary-foreground hover:bg-primary/90"
              onClick={() => handleWhatsApp(member)}
            >
              <MessageCircle className="h-4 w-4" />
              <span className="hidden sm:inline">Recordar</span>
            </Button>
          </div>
        ))}

        {members.length === 0 && (
          <div className="py-8 text-center text-muted-foreground">
            <Clock className="mx-auto h-10 w-10 mb-2 opacity-50" />
            <p className="text-sm">No hay vencimientos hoy</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
