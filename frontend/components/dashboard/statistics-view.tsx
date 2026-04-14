'use client';

import { useState } from 'react';
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
import { ArrowUpRight, ArrowDownRight, Activity } from 'lucide-react';
import { mockMembers, revenueData, formatCurrency, PLAN_PRICES, paymentMethodsData, type MembershipPlan, getDashboardStats } from '@/lib/mock-data';
import { PaymentMethodsChart } from '@/components/dashboard/payment-methods-chart';
import { MembersGrowthChart } from '@/components/dashboard/members-growth-chart';
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
  const stats = getDashboardStats();
  const [selectedMonth, setSelectedMonth] = useState<string>(revenueData[revenueData.length - 1].month);

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

  // Members growth data enriched with real flows
  const membersGrowthData = revenueData.map((d) => {
    return {
      month: d.month,
      members: d.members,
      newMembers: d.newMembers,
      churnedMembers: d.churnedMembers,
      growth: d.growth
    };
  });

  const selectedGrowthData = membersGrowthData.find(m => m.month === selectedMonth) || membersGrowthData[membersGrowthData.length - 1];

  return (
    <div className="space-y-6">
      {/* Summary Stats */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Card className="border-border bg-card shadow-sm">
          <CardContent className="p-5">
            <p className="text-sm text-muted-foreground">Total Miembros</p>
            <p className="text-3xl font-bold text-card-foreground">{stats.totalMembers}</p>
          </CardContent>
        </Card>
        <Card className="border-border bg-card shadow-sm">
          <CardContent className="p-5">
            <p className="text-sm text-muted-foreground">Tasa de Retención</p>
            <p className="text-3xl font-bold text-primary">{stats.retentionRate}%</p>
          </CardContent>
        </Card>
        <Card className="border-border bg-card shadow-sm">
          <CardContent className="p-5">
            <p className="text-sm text-muted-foreground">Promedio por Miembro</p>
            <p className="text-3xl font-bold text-card-foreground">{formatCurrency(stats.avgPerMember)}</p>
          </CardContent>
        </Card>
        <Card className="border-border bg-card shadow-sm">
          <CardContent className="p-5">
            <p className="text-sm text-muted-foreground">Crecimiento Mensual</p>
            <p className="text-3xl font-bold text-primary">+{stats.growthPercentage}%</p>
          </CardContent>
        </Card>
      </div>

      {/* Charts Grid */}
      <div className="grid gap-6 lg:grid-cols-2">
        {/* Members Growth Chart */}
        <MembersGrowthChart
          data={membersGrowthData}
          selectedMonth={selectedMonth}
          onMonthSelect={setSelectedMonth}
        />

        {/* Movements Widget */}
        <Card className="border-border bg-card shadow-sm flex flex-col justify-between">
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="rounded-lg bg-teal-50 p-2">
                  <Activity className="h-5 w-5 text-teal-600" />
                </div>
                <CardTitle className="text-base font-semibold text-card-foreground">
                  Flujo de Miembros
                </CardTitle>
              </div>
              <span className="text-xs font-semibold px-2.5 py-1 rounded-md bg-slate-100 text-slate-600 border border-slate-200">
                {selectedGrowthData.month}
              </span>
            </div>
            <p className="text-sm text-muted-foreground mt-1">Nuevas inscripciones y bajas del mes.</p>
          </CardHeader>
          <CardContent className="pt-4 flex-1 flex flex-col justify-center">

            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-full bg-emerald-100">
                    <ArrowUpRight className="h-5 w-5 text-emerald-600" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-slate-500">Nuevas Inscripciones</p>
                    <p className="text-2xl font-bold text-slate-900">+{selectedGrowthData.newMembers}</p>
                  </div>
                </div>
              </div>

              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-full bg-red-100">
                    <ArrowDownRight className="h-5 w-5 text-red-600" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-slate-500">Bajas (No renovaron)</p>
                    <p className="text-2xl font-bold text-slate-900">-{selectedGrowthData.churnedMembers}</p>
                  </div>
                </div>
              </div>

              <div className="pt-4 border-t border-slate-100">
                <div className="flex items-center justify-between">
                  <p className="text-sm font-semibold text-slate-700">Crecimiento Neto</p>
                  <span className={`px-2.5 py-1 rounded-full text-xs font-bold ${selectedGrowthData.growth >= 0 ? 'bg-emerald-100 text-emerald-700' : 'bg-rose-100 text-rose-700'}`}>
                    {selectedGrowthData.growth > 0 ? '+' : ''}{selectedGrowthData.growth} alumnos
                  </span>
                </div>
              </div>
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
        <Card className="border-border bg-card shadow-sm">
          <CardHeader>
            <CardTitle className="text-base font-semibold text-card-foreground">
              Estado de Membresías
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col gap-4 mt-2">
              {statusData.map((status, index) => (
                <div
                  key={status.name}
                  className="flex items-center justify-between w-full rounded-lg border border-slate-100 bg-slate-50 p-3"
                >
                  <div className="flex items-center gap-3">
                    <div
                      className="h-10 w-10 rounded-full flex items-center justify-center text-sm font-bold shrink-0"
                      style={{ backgroundColor: `${STATUS_COLORS[index]}15`, color: STATUS_COLORS[index] }}
                    >
                      {status.value}
                    </div>
                    <p className="text-sm font-medium text-slate-700">{status.name}</p>
                  </div>
                  <p className="text-xs font-semibold text-slate-500 bg-white px-2 py-1 rounded-md border border-slate-200">
                    {((status.value / mockMembers.length) * 100).toFixed(1)}%
                  </p>
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
