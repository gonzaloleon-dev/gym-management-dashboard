'use client';

import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from 'recharts';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { mockMembers, revenueData, formatCurrency, PLAN_PRICES, paymentMethodsData, type MembershipPlan } from '@/lib/mock-data';
import { PaymentMethodsChart } from '@/components/dashboard/payment-methods-chart';

// Define colors directly for light mode - teal primary palette
const COLORS = {
  primary: '#14b8a6', // teal
  chart2: '#0891b2', // cyan
  chart3: '#10b981', // emerald
  chart4: '#f59e0b', // amber
  destructive: '#ef4444', // red
  grid: 'rgba(0, 0, 0, 0.06)',
  text: 'rgba(0, 0, 0, 0.5)',
};

export function StatisticsView() {
  // Plan distribution using new plans
  const planCounts: Record<string, number> = {};
  Object.keys(PLAN_PRICES).forEach(plan => {
    planCounts[plan] = mockMembers.filter((m) => m.plan === plan).length;
  });
  
  const planData = Object.entries(planCounts)
    .filter(([, value]) => value > 0)
    .map(([name, value]) => ({ name, value }));

  // Status distribution
  const statusData = [
    { name: 'Activos', value: mockMembers.filter((m) => m.status === 'Activo').length },
    { name: 'Vencidos', value: mockMembers.filter((m) => m.status === 'Vencido').length },
    { name: 'Deudores', value: mockMembers.filter((m) => m.status === 'Deudor').length },
  ];

  const PIE_COLORS = [COLORS.primary, '#f59e0b', '#8b5cf6', '#ec4899', '#06b6d4', '#22c55e'];
  const STATUS_COLORS = [COLORS.primary, COLORS.chart4, COLORS.destructive];

  // Members growth data
  const membersGrowth = revenueData.map((d) => ({
    month: d.month,
    members: d.members,
  }));

  function CustomTooltip({
    active,
    payload,
    label,
  }: {
    active?: boolean;
    payload?: Array<{ value: number; name?: string }>;
    label?: string;
  }) {
    if (active && payload && payload.length) {
      return (
        <div className="rounded-lg border border-border bg-card px-3 py-2 shadow-lg">
          <p className="text-xs text-muted-foreground">{label}</p>
          <p className="text-sm font-semibold text-foreground">{payload[0].value} miembros</p>
        </div>
      );
    }
    return null;
  }

  return (
    <div className="space-y-6">
      {/* Summary Stats */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Card className="border-border bg-card shadow-sm">
          <CardContent className="p-5">
            <p className="text-sm text-muted-foreground">Total Miembros</p>
            <p className="text-3xl font-bold text-card-foreground">{mockMembers.length}</p>
          </CardContent>
        </Card>
        <Card className="border-border bg-card shadow-sm">
          <CardContent className="p-5">
            <p className="text-sm text-muted-foreground">Tasa de Retención</p>
            <p className="text-3xl font-bold text-primary">87%</p>
          </CardContent>
        </Card>
        <Card className="border-border bg-card shadow-sm">
          <CardContent className="p-5">
            <p className="text-sm text-muted-foreground">Promedio por Miembro</p>
            <p className="text-3xl font-bold text-card-foreground">{formatCurrency(52000)}</p>
          </CardContent>
        </Card>
        <Card className="border-border bg-card shadow-sm">
          <CardContent className="p-5">
            <p className="text-sm text-muted-foreground">Crecimiento Mensual</p>
            <p className="text-3xl font-bold text-primary">+6.4%</p>
          </CardContent>
        </Card>
      </div>

      {/* Charts Grid */}
      <div className="grid gap-6 lg:grid-cols-2">
        {/* Members Growth Chart */}
        <Card className="border-border bg-card shadow-sm">
          <CardHeader>
            <CardTitle className="text-base font-semibold text-card-foreground">
              Crecimiento de Miembros
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-[280px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={membersGrowth}>
                  <CartesianGrid strokeDasharray="3 3" stroke={COLORS.grid} vertical={false} />
                  <XAxis
                    dataKey="month"
                    tick={{ fill: COLORS.text, fontSize: 12 }}
                    tickLine={false}
                    axisLine={false}
                  />
                  <YAxis
                    tick={{ fill: COLORS.text, fontSize: 12 }}
                    tickLine={false}
                    axisLine={false}
                    width={35}
                  />
                  <Tooltip content={<CustomTooltip />} />
                  <Bar dataKey="members" fill={COLORS.primary} radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        {/* Plan Distribution */}
        <Card className="border-border bg-card shadow-sm">
          <CardHeader>
            <CardTitle className="text-base font-semibold text-card-foreground">
              Distribución por Plan
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-[280px]">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={planData}
                    cx="50%"
                    cy="50%"
                    innerRadius={50}
                    outerRadius={80}
                    paddingAngle={3}
                    dataKey="value"
                  >
                    {planData.map((entry, index) => (
                      <Cell key={`cell-${entry.name}`} fill={PIE_COLORS[index % PIE_COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip
                    formatter={(value: number, name: string) => [`${value} miembros`, name]}
                    contentStyle={{
                      background: 'white',
                      border: '1px solid #e5e7eb',
                      borderRadius: '8px',
                    }}
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>
            <div className="mt-4 grid grid-cols-2 gap-2">
              {planData.map((item, index) => (
                <div key={item.name} className="flex items-center gap-2 text-xs">
                  <div
                    className="h-2.5 w-2.5 rounded-full shrink-0"
                    style={{ backgroundColor: PIE_COLORS[index % PIE_COLORS.length] }}
                  />
                  <span className="text-muted-foreground truncate">{item.name}</span>
                  <span className="font-medium text-card-foreground ml-auto">{item.value}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Status Distribution */}
        <Card className="border-border bg-card shadow-sm lg:col-span-2">
          <CardHeader>
            <CardTitle className="text-base font-semibold text-card-foreground">
              Estado de Membresías
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4 sm:grid-cols-3">
              {statusData.map((status, index) => (
                <div
                  key={status.name}
                  className="flex items-center gap-4 rounded-lg border border-border bg-muted/30 p-4"
                >
                  <div
                    className="h-12 w-12 rounded-full flex items-center justify-center text-lg font-bold"
                    style={{ backgroundColor: `${STATUS_COLORS[index]}15`, color: STATUS_COLORS[index] }}
                  >
                    {status.value}
                  </div>
                  <div>
                    <p className="text-sm font-medium text-card-foreground">{status.name}</p>
                    <p className="text-xs text-muted-foreground">
                      {((status.value / mockMembers.length) * 100).toFixed(1)}% del total
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Payment Methods Chart */}
        <div className="lg:col-span-2 max-w-md mx-auto w-full">
          <PaymentMethodsChart data={paymentMethodsData} />
        </div>
      </div>
    </div>
  );
}
