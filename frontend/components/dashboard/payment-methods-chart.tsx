'use client';

import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Wallet } from 'lucide-react';
import { formatCurrency } from '@/lib/mock-data';

interface PaymentMethodData {
  method: string;
  amount: number;
  count: number;
}

interface PaymentMethodsChartProps {
  data: PaymentMethodData[];
}

// Colors for the pie chart - teal and violet
const COLORS = ['#14b8a6', '#7c3aed'];

function CustomTooltip({ active, payload }: { active?: boolean; payload?: Array<{ payload: PaymentMethodData }> }) {
  if (active && payload && payload.length) {
    const data = payload[0].payload;
    return (
      <div className="rounded-lg border border-border bg-card px-3 py-2 shadow-lg">
        <p className="text-sm font-medium text-foreground">{data.method}</p>
        <p className="text-xs text-muted-foreground">
          {formatCurrency(data.amount)} ({data.count} pagos)
        </p>
      </div>
    );
  }
  return null;
}

export function PaymentMethodsChart({ data }: PaymentMethodsChartProps) {
  const total = data.reduce((acc, item) => acc + item.amount, 0);

  return (
    <Card className="border-border bg-card shadow-sm">
      <CardHeader className="pb-2">
        <div className="flex items-center gap-2">
          <div className="rounded-lg bg-secondary/10 p-2">
            <Wallet className="h-5 w-5 text-secondary" />
          </div>
          <CardTitle className="text-base font-semibold text-card-foreground">
            Métodos de Pago del Mes
          </CardTitle>
        </div>
      </CardHeader>
      <CardContent>
        <div className="flex items-center gap-6">
          <div className="h-[140px] w-[140px]">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={data}
                  cx="50%"
                  cy="50%"
                  innerRadius={35}
                  outerRadius={60}
                  paddingAngle={3}
                  dataKey="amount"
                >
                  {data.map((entry, index) => (
                    <Cell 
                      key={`cell-${entry.method}`} 
                      fill={COLORS[index % COLORS.length]} 
                    />
                  ))}
                </Pie>
                <Tooltip content={<CustomTooltip />} />
              </PieChart>
            </ResponsiveContainer>
          </div>
          <div className="flex-1 space-y-3">
            {data.map((item, index) => {
              const percentage = Math.round((item.amount / total) * 100);
              return (
                <div key={item.method} className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div
                      className="h-3 w-3 rounded-full"
                      style={{ backgroundColor: COLORS[index % COLORS.length] }}
                    />
                    <span className="text-sm text-card-foreground">{item.method}</span>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-semibold text-card-foreground">{percentage}%</p>
                    <p className="text-xs text-muted-foreground">{item.count} pagos</p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
