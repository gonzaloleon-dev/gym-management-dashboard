'use client';

import {
  DollarSign,
  Users,
  AlertTriangle,
  CheckCircle2,
} from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { formatCurrency } from '@/lib/mock-data';
import { cn } from '@/lib/utils';

interface KPICardsProps {
  monthlyRevenue: number;
  activeMembers: number;
  totalMembers: number;
  paidMembers: number;
  totalDebt: number;
}

export function KPICards({
  monthlyRevenue,
  activeMembers,
  totalMembers,
  paidMembers,
  totalDebt,
}: KPICardsProps) {
  const paymentProgress = Math.round((paidMembers / totalMembers) * 100);

  const kpis = [
    {
      title: 'Ingresos del Mes',
      value: formatCurrency(monthlyRevenue),
      icon: DollarSign,
      iconBg: 'bg-primary/10',
      iconColor: 'text-primary',
      showProgress: false,
    },
    {
      title: 'Progreso de Pagos',
      value: `${paidMembers} / ${totalMembers}`,
      subtitle: `${paymentProgress}% pagaron`,
      icon: CheckCircle2,
      iconBg: 'bg-primary/10',
      iconColor: 'text-primary',
      showProgress: true,
      progress: paymentProgress,
    },
    {
      title: 'Miembros Activos',
      value: activeMembers.toString(),
      icon: Users,
      iconBg: 'bg-secondary/10',
      iconColor: 'text-secondary',
      showProgress: false,
    },
    {
      title: 'Deuda Total Pendiente',
      value: formatCurrency(totalDebt),
      icon: AlertTriangle,
      iconBg: 'bg-destructive/10',
      iconColor: 'text-destructive',
      valueColor: 'text-destructive',
      showProgress: false,
    },
  ];

  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
      {kpis.map((kpi) => {
        const Icon = kpi.icon;
        return (
          <Card key={kpi.title} className="border-border bg-card shadow-sm">
            <CardContent className="p-5">
              <div className="flex items-start justify-between">
                <div className="space-y-2 flex-1">
                  <p className="text-sm text-muted-foreground">{kpi.title}</p>
                  <p className={cn('text-2xl font-bold', kpi.valueColor || 'text-card-foreground')}>
                    {kpi.value}
                  </p>
                  {kpi.subtitle && (
                    <p className="text-xs text-muted-foreground">{kpi.subtitle}</p>
                  )}
                  {kpi.showProgress && (
                    <Progress 
                      value={kpi.progress} 
                      className="h-2 mt-2" 
                    />
                  )}
                </div>
                <div className={cn('rounded-lg p-2.5 shrink-0', kpi.iconBg)}>
                  <Icon className={cn('h-5 w-5', kpi.iconColor)} />
                </div>
              </div>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}
