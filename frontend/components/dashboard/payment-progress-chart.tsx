'use client';

import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { mockMembers } from '@/lib/mock-data';

const COLORS = {
  paid: '#10b981', // emerald
  pending: '#ef4444', // red
};

export function PaymentProgressChart() {
  const paidMembers = mockMembers.filter(m => m.status === 'Activo').length;
  const pendingMembers = mockMembers.filter(m => m.status === 'Vencido' || m.status === 'Deudor').length;
  
  const total = paidMembers + pendingMembers || 1; // avoid division by zero

  const data = [
    { name: 'Ya Pagaron', value: paidMembers, color: COLORS.paid },
    { name: 'Faltan Pagar', value: pendingMembers, color: COLORS.pending },
  ];

  return (
    <Card className="border-border bg-card shadow-sm">
      <CardHeader className="pb-2">
        <CardTitle className="text-base font-semibold text-card-foreground uppercase tracking-wide">
          Progreso de Cobros del Mes
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="flex flex-col lg:flex-row items-center justify-center gap-6 mt-4">
          <div className="h-[220px] w-full lg:w-[220px] shrink-0">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={data}
                  cx="50%"
                  cy="50%"
                  innerRadius={65}
                  outerRadius={95}
                  paddingAngle={4}
                  dataKey="value"
                  stroke="none"
                >
                  {data.map((entry) => (
                    <Cell 
                      key={`cell-${entry.name}`} 
                      fill={entry.color} 
                      className="transition-opacity hover:opacity-80"
                    />
                  ))}
                </Pie>
                <Tooltip 
                  formatter={(value: number) => [`${value} alumnos`, '']}
                  contentStyle={{
                    borderRadius: '8px',
                    border: '1px solid #e5e7eb',
                    fontWeight: 600,
                  }}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>

          <div className="flex w-full lg:flex-col justify-center gap-8 lg:gap-6 pl-0 lg:pl-4">
            {data.map((item) => (
              <div
                key={item.name}
                className="flex items-center gap-4"
              >
                <div
                  className="h-5 w-5 rounded-full shrink-0 shadow-sm"
                  style={{ backgroundColor: item.color }}
                />
                <div>
                  <p className="text-sm font-bold text-muted-foreground uppercase tracking-wider mb-1">
                    {item.name}
                  </p>
                  <p className="text-3xl font-black text-foreground">
                    {item.value} <span className="text-sm font-medium text-muted-foreground whitespace-nowrap tracking-normal">({((item.value / total) * 100).toFixed(0)}%)</span>
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
