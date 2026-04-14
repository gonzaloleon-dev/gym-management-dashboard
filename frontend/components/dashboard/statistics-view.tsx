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
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ArrowUpRight, ArrowDownRight, Activity, Users, TrendingUp, PieChart as PieChartIcon, ShieldCheck } from 'lucide-react';
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

  const PIE_COLORS = ['#14b8a6', '#f59e0b', '#0ea5e9', '#6366f1'];
  const STATUS_COLORS = [COLORS.primary, '#f59e0b', '#ef4444'];

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

      {/* Tabs Layout for Widgets */}
      <Tabs defaultValue="crecimiento" className="w-full space-y-6">
        <TabsList className="w-full sm:w-auto overflow-x-auto flex flex-nowrap h-auto gap-2 bg-transparent p-0 border-b border-border pb-4 sm:pb-0 sm:border-0 justify-start">
          <TabsTrigger
            value="crecimiento"
            className="group w-auto shrink-0 data-[state=active]:bg-teal-50 data-[state=active]:text-teal-800 data-[state=active]:border-teal-200 data-[state=active]:shadow-sm justify-center border border-transparent px-4 py-2.5 rounded-lg transition-all font-medium text-muted-foreground cursor-pointer hover:bg-muted/50"
          >
            <TrendingUp className="w-4 h-4 mr-2" />
            Crecimiento y Flujo
          </TabsTrigger>
          <TabsTrigger
            value="comercial"
            className="group w-auto shrink-0 data-[state=active]:bg-teal-50 data-[state=active]:text-teal-800 data-[state=active]:border-teal-200 data-[state=active]:shadow-sm justify-center border border-transparent px-4 py-2.5 rounded-lg transition-all font-medium text-muted-foreground cursor-pointer hover:bg-muted/50"
          >
            <PieChartIcon className="w-4 h-4 mr-2" />
            Bloque Comercial
          </TabsTrigger>
          <TabsTrigger
            value="auditoria"
            className="group w-auto shrink-0 data-[state=active]:bg-teal-50 data-[state=active]:text-teal-800 data-[state=active]:border-teal-200 data-[state=active]:shadow-sm justify-center border border-transparent px-4 py-2.5 rounded-lg transition-all font-medium text-muted-foreground cursor-pointer hover:bg-muted/50"
          >
            <ShieldCheck className="w-4 h-4 mr-2" />
            Auditoría y Marketing
          </TabsTrigger>
        </TabsList>

        <TabsContent value="crecimiento" className="mt-0 outline-none">
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
        </div> {/* Cierra grid crecimiento */}
        </TabsContent>

        <TabsContent value="comercial" className="mt-0 outline-none">
          <div className="grid gap-6 lg:grid-cols-2 lg:col-span-2">
            {/* Plan Distribution */}
        <Card className="border-border bg-card shadow-sm h-full flex flex-col">
          <CardHeader>
            <CardTitle className="text-base font-semibold text-card-foreground">
              Distribución por Plan
            </CardTitle>
          </CardHeader>
          <CardContent className="flex-1 flex flex-col justify-center">
            <div className="h-[280px]">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={planData}
                    cx="50%"
                    cy="50%"
                    innerRadius={75}
                    outerRadius={95}
                    paddingAngle={3}
                    dataKey="value"
                    isAnimationActive={false}
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
              {/* Centro de la dona con el Total */}
              <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                <span className="text-3xl font-bold text-slate-900">{stats.totalMembers}</span>
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Alumnos</span>
              </div>
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

        {/* Payment Methods Chart */}
        <div className="h-full w-full">
          <PaymentMethodsChart data={paymentMethodsData} />
        </div>

        </div>
        </TabsContent>

        <TabsContent value="auditoria" className="mt-0 outline-none">
          <div className="grid gap-6 lg:grid-cols-2 lg:col-span-2">
            {/* Origen de Alumnos */}
        <Card className="border-border bg-card shadow-sm h-full flex flex-col">
          <CardHeader className="pb-4">
            <div className="flex items-center gap-2">
              <div className="rounded-lg bg-emerald-50 p-2">
                <Users className="h-5 w-5 text-emerald-600" />
              </div>
              <CardTitle className="text-base font-semibold text-card-foreground">
                Origen de Alumnos
              </CardTitle>
            </div>
            <p className="text-sm text-muted-foreground mt-1">¿Cómo te conocieron tus alumnos actuales?</p>
          </CardHeader>
          <CardContent className="flex-1 flex flex-col justify-center pt-2">
            <div className="space-y-6">
              {[
                { name: 'Instagram', value: 85, color: '#14b8a6' },
                { name: 'Recomendación', value: 60, color: '#0ea5e9' },
                { name: 'Pasó por el local', value: 45, color: '#f59e0b' },
                { name: 'Facebook / Folletos', value: 14, color: '#8b5cf6' },
              ].map((item) => {
                const total = 204; // Aproximado del total mockeado
                const percentage = Math.round((item.value / total) * 100);
                return (
                  <div key={item.name} className="space-y-2">
                    <div className="flex items-center justify-between text-sm">
                      <span className="font-medium text-slate-700">{item.name}</span>
                      <span className="font-bold text-slate-900">{percentage}% <span className="text-muted-foreground font-normal">({item.value})</span></span>
                    </div>
                    <div className="h-2.5 w-full bg-slate-100 rounded-full overflow-hidden">
                      <div className="h-full rounded-full" style={{ width: `${percentage}%`, backgroundColor: item.color }} />
                    </div>
                  </div>
                )
              })}
            </div>
          </CardContent>
        </Card>

        {/* Status Distribution */}
        <Card className="border-border bg-card shadow-sm h-full flex flex-col">
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
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
