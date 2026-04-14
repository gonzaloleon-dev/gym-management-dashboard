'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Wallet, CreditCard, Banknote, Landmark } from 'lucide-react';
import { formatCurrency } from '@/lib/mock-data';

interface PaymentMethodData {
  method: string;
  amount: number;
  count: number;
}

interface PaymentMethodsChartProps {
  data: PaymentMethodData[];
}

const getIcon = (method: string) => {
  switch (method.toLowerCase()) {
    case 'efectivo': return <Banknote className="h-4 w-4 text-emerald-600" />;
    case 'transferencia': return <Landmark className="h-4 w-4 text-blue-600" />;
    case 'cuenta dni': return <Landmark className="h-4 w-4 text-violet-600" />;
    case 'mercado pago': return <Activity className="h-4 w-4 text-sky-500" />;
    case 'débito': return <CreditCard className="h-4 w-4 text-indigo-600" />;
    default: return <Wallet className="h-4 w-4 text-slate-600" />;
  }
};

const getBgColor = (method: string) => {
  switch (method.toLowerCase()) {
    case 'efectivo': return 'bg-emerald-50';
    case 'transferencia': return 'bg-blue-50';
    case 'cuenta dni': return 'bg-violet-50';
    case 'mercado pago': return 'bg-sky-50';
    case 'débito': return 'bg-indigo-50';
    default: return 'bg-slate-50';
  }
};

const getProgressColor = (method: string) => {
  switch (method.toLowerCase()) {
    case 'efectivo': return 'bg-emerald-500';
    case 'transferencia': return 'bg-blue-500';
    case 'cuenta dni': return 'bg-violet-500';
    case 'mercado pago': return 'bg-sky-500';
    case 'débito': return 'bg-indigo-500';
    default: return 'bg-slate-500';
  }
};

import { Activity } from 'lucide-react';

export function PaymentMethodsChart({ data }: PaymentMethodsChartProps) {
  const totalAmount = data.reduce((acc, item) => acc + item.amount, 0);

  return (
    <Card className="border-border bg-card shadow-sm h-full flex flex-col">
      <CardHeader className="pb-4">
        <div className="flex items-center gap-2">
          <div className="rounded-lg bg-teal-50 p-2">
            <Wallet className="h-5 w-5 text-teal-600" />
          </div>
          <CardTitle className="text-base font-semibold text-card-foreground">
            Métodos de Pago del Mes
          </CardTitle>
        </div>
        <p className="text-sm text-muted-foreground mt-1">Desglose de recaudación por canal.</p>
      </CardHeader>
      <CardContent className="flex-1 space-y-5 pt-2">
        {data.map((item) => {
          const percentage = (item.amount / totalAmount) * 100;
          return (
            <div key={item.method} className="space-y-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className={`p-1.5 rounded-md ${getBgColor(item.method)}`}>
                    {getIcon(item.method)}
                  </div>
                  <span className="text-sm font-medium text-slate-700">{item.method}</span>
                </div>
                <div className="text-right">
                  <p className="text-sm font-bold text-slate-900">{formatCurrency(item.amount)}</p>
                  <p className="text-[10px] text-muted-foreground font-medium">{item.count} pagos registrados</p>
                </div>
              </div>
              <div className="h-1.5 w-full bg-slate-100 rounded-full overflow-hidden">
                <div 
                  className={`h-full rounded-full ${getProgressColor(item.method)}`} 
                  style={{ width: `${percentage}%` }} 
                />
              </div>
            </div>
          );
        })}
      </CardContent>
    </Card>
  );
}
