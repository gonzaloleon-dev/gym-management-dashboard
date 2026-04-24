'use client';

import { useState } from 'react';
import {
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Tooltip,
} from 'recharts';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  ArrowUpRight,
  ArrowDownRight,
  Activity,
  Users,
  TrendingUp,
  PieChart as PieChartIcon,
  ShieldCheck,
  Banknote,
} from 'lucide-react';
import {
  mockMembers,
  revenueData,
  formatCurrency,
  PLAN_PRICES,
  paymentMethodsData,
  getDashboardStats,
} from '@/lib/mock-data';
import { useAppContext } from '@/lib/app-context';
import { PaymentMethodsChart } from '@/components/dashboard/payment-methods-chart';
import { MembersGrowthChart } from '@/components/dashboard/members-growth-chart';

const PIE_COLORS = ['#14b8a6', '#f59e0b', '#64748b', '#059669'];
const STATUS_COLORS = ['#14b8a6', '#f59e0b', '#ef4444'];

// Tooltip custom para la dona — color calculado por posición en planData
const PlanTooltip = ({
  active,
  payload,
  planData,
}: {
  active?: boolean;
  payload?: Array<{ name: string; value: number }>;
  planData: Array<{ name: string; value: number }>;
}) => {
  if (!active || !payload || !payload.length) return null;
  const entry = payload[0];
  const colorIndex = planData.findIndex((p) => p.name === entry.name);
  const color = PIE_COLORS[colorIndex >= 0 ? colorIndex : 0];
  return (
    <div className="bg-white border border-slate-200 rounded-xl shadow-lg px-4 py-3 flex items-center gap-3 pointer-events-none">
      <div className="h-3 w-3 rounded-full shrink-0" style={{ backgroundColor: color }} />
      <div>
        <p className="text-xs text-slate-500 font-medium leading-none mb-1">Plan</p>
        <p className="text-sm font-bold text-slate-800 leading-none">{entry.name}</p>
      </div>
      <div className="ml-3 pl-3 border-l border-slate-200">
        <p className="text-xs text-slate-500 font-medium leading-none mb-1">Alumnos</p>
        <p className="text-sm font-bold text-slate-800 leading-none">{entry.value}</p>
      </div>
    </div>
  );
};

export function StatisticsView() {
  const stats = getDashboardStats();
  const { members, plans } = useAppContext();
  const totalMembers = members.length;
  const avgPerMember = plans.length > 0
    ? Math.round(plans.reduce((a, b) => a + b.price, 0) / plans.length)
    : stats.avgPerMember;
  const [selectedMonth, setSelectedMonth] = useState<string>(
    revenueData[revenueData.length - 1].month
  );

  // Plan distribution — usa contexto dinámico (ordenado mayor a menor)
  const planCounts: Record<string, number> = {};
  Object.keys(PLAN_PRICES).forEach((plan) => {
    planCounts[plan] = members.filter((m) => m.plan === plan).length;
  });
  const planData = Object.entries(planCounts)
    .filter(([, value]) => value > 0)
    .map(([name, value]) => ({ name, value }))
    .sort((a, b) => b.value - a.value);

  // Status distribution — usa contexto dinámico
  const statusData = [
    { name: 'Activos',   value: members.filter((m) => m.status === 'Activo').length },
    { name: 'Vencidos',  value: members.filter((m) => m.status === 'Vencido').length },
    { name: 'Deudores',  value: members.filter((m) => m.status === 'Deudor').length },
  ];

  // Growth data
  const membersGrowthData = revenueData.map((d) => ({
    month: d.month,
    members: d.members,
    newMembers: d.newMembers,
    churnedMembers: d.churnedMembers,
    growth: d.growth,
  }));

  const selectedGrowthData =
    membersGrowthData.find((m) => m.month === selectedMonth) ||
    membersGrowthData[membersGrowthData.length - 1];

  return (
    <div className="space-y-6">
      {/* Fila 1: KPIs */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {/* Total Miembros */}
        <Card className="border-border bg-card shadow-sm">
          <CardContent className="p-5">
            <div className="flex items-start justify-between">
              <div className="space-y-2 flex-1">
                <p className="text-sm text-muted-foreground">Total Miembros</p>
                <p className="text-2xl font-bold text-card-foreground">{totalMembers}</p>
              </div>
              <div className="rounded-lg p-2.5 shrink-0 bg-primary/10">
                <Users className="h-5 w-5 text-primary" />
              </div>
            </div>
          </CardContent>
        </Card>
        {/* Tasa de Retención */}
        <Card className="border-border bg-card shadow-sm">
          <CardContent className="p-5">
            <div className="flex items-start justify-between">
              <div className="space-y-2 flex-1">
                <p className="text-sm text-muted-foreground">Tasa de Retención</p>
                <p className="text-2xl font-bold text-primary">{stats.retentionRate}%</p>
              </div>
              <div className="rounded-lg p-2.5 shrink-0 bg-primary/10">
                <ShieldCheck className="h-5 w-5 text-primary" />
              </div>
            </div>
          </CardContent>
        </Card>
        {/* Cuota Promedio */}
        <Card className="border-border bg-card shadow-sm">
          <CardContent className="p-5">
            <div className="flex items-start justify-between">
              <div className="space-y-2 flex-1">
                <p className="text-sm text-muted-foreground">Cuota Promedio</p>
                <p className="text-2xl font-bold text-card-foreground">{formatCurrency(avgPerMember)}</p>
              </div>
              <div className="rounded-lg p-2.5 shrink-0 bg-primary/10">
                <Banknote className="h-5 w-5 text-primary" />
              </div>
            </div>
          </CardContent>
        </Card>
        {/* Crecimiento Mensual */}
        <Card className="border-border bg-card shadow-sm">
          <CardContent className="p-5">
            <div className="flex items-start justify-between">
              <div className="space-y-2 flex-1">
                <p className="text-sm text-muted-foreground">Crecimiento Mensual</p>
                <p className="text-2xl font-bold text-primary">+{stats.growthPercentage}%</p>
              </div>
              <div className="rounded-lg p-2.5 shrink-0 bg-primary/10">
                <TrendingUp className="h-5 w-5 text-primary" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filas 2–4: Panel con Pestañas */}
      <Card className="border-border bg-card shadow-sm">
        <CardContent className="p-5 sm:p-6">
          <Tabs defaultValue="crecimiento" className="w-full">
            {/* Tab List */}
            <TabsList className="w-full sm:w-auto flex flex-nowrap overflow-x-auto h-auto gap-2 bg-transparent p-0 mb-6 justify-start">
              <TabsTrigger
                value="crecimiento"
                className="group shrink-0 data-[state=active]:bg-teal-50 data-[state=active]:text-teal-800 data-[state=active]:border-teal-200 data-[state=active]:shadow-sm justify-center border border-transparent px-4 py-2.5 rounded-lg transition-all font-medium text-muted-foreground cursor-pointer hover:bg-muted/50"
              >
                <TrendingUp className="w-4 h-4 mr-2" />
                Evolución
              </TabsTrigger>
              <TabsTrigger
                value="comercial"
                className="group shrink-0 data-[state=active]:bg-teal-50 data-[state=active]:text-teal-800 data-[state=active]:border-teal-200 data-[state=active]:shadow-sm justify-center border border-transparent px-4 py-2.5 rounded-lg transition-all font-medium text-muted-foreground cursor-pointer hover:bg-muted/50"
              >
                <PieChartIcon className="w-4 h-4 mr-2" />
                Ingresos y Planes
              </TabsTrigger>
              <TabsTrigger
                value="auditoria"
                className="group shrink-0 data-[state=active]:bg-teal-50 data-[state=active]:text-teal-800 data-[state=active]:border-teal-200 data-[state=active]:shadow-sm justify-center border border-transparent px-4 py-2.5 rounded-lg transition-all font-medium text-muted-foreground cursor-pointer hover:bg-muted/50"
              >
                <ShieldCheck className="w-4 h-4 mr-2" />
                Alumnos y Origen
              </TabsTrigger>
            </TabsList>

            {/* Tab: Crecimiento y Flujo */}
            <TabsContent value="crecimiento" className="mt-0">
              <div className="grid gap-6 lg:grid-cols-2">
                {/* Gráfico de barras */}
                <MembersGrowthChart
                  data={membersGrowthData}
                  selectedMonth={selectedMonth}
                  onMonthSelect={setSelectedMonth}
                />

                {/* Flujo mensual */}
                <Card className="border-border bg-card shadow-sm flex flex-col">
                  <CardHeader className="pb-2">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <div className="rounded-lg bg-primary/10 p-2">
                          <Activity className="h-5 w-5 text-primary" />
                        </div>
                        <CardTitle className="text-base font-semibold text-card-foreground">
                          Flujo de Miembros
                        </CardTitle>
                      </div>
                      <span className="text-xs font-semibold px-2.5 py-1 rounded-md bg-slate-100 text-slate-600 border border-slate-200">
                        {selectedGrowthData.month}
                      </span>
                    </div>
                    <p className="text-sm text-muted-foreground mt-1">
                      Nuevas inscripciones y bajas del mes.
                    </p>
                  </CardHeader>
                  <CardContent className="pt-4 flex-1 flex flex-col justify-center">
                    <div className="space-y-6">
                      <div className="flex items-center gap-3">
                        <div className="flex h-10 w-10 items-center justify-center rounded-full bg-emerald-100 shrink-0">
                          <ArrowUpRight className="h-5 w-5 text-emerald-600" />
                        </div>
                        <div>
                          <p className="text-sm font-medium text-slate-500">Nuevas Inscripciones</p>
                          <p className="text-2xl font-bold text-slate-900">+{selectedGrowthData.newMembers}</p>
                        </div>
                      </div>

                      <div className="flex items-center gap-3">
                        <div className="flex h-10 w-10 items-center justify-center rounded-full bg-red-100 shrink-0">
                          <ArrowDownRight className="h-5 w-5 text-red-600" />
                        </div>
                        <div>
                          <p className="text-sm font-medium text-slate-500">Bajas (No renovaron)</p>
                          <p className="text-2xl font-bold text-slate-900">-{selectedGrowthData.churnedMembers}</p>
                        </div>
                      </div>

                      <div className="pt-4 border-t border-slate-100">
                        <div className="flex items-center justify-between">
                          <p className="text-sm font-semibold text-slate-700">Crecimiento Neto</p>
                          <span
                            className={`px-2.5 py-1 rounded-full text-xs font-bold ${selectedGrowthData.growth >= 0
                              ? 'bg-emerald-100 text-emerald-700'
                              : 'bg-rose-100 text-rose-700'
                              }`}
                          >
                            {selectedGrowthData.growth > 0 ? '+' : ''}
                            {selectedGrowthData.growth} alumnos
                          </span>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>

            {/* Tab: Bloque Comercial */}
            <TabsContent value="comercial" className="mt-0">
              <div className="grid gap-6 lg:grid-cols-2">
                {/* Dona Distribución por Plan */}
                <Card className="border-border bg-card shadow-sm flex flex-col">
                  <CardHeader className="pb-2">
                    <div className="flex items-center gap-2">
                      <div className="rounded-lg bg-primary/10 p-2">
                        <PieChartIcon className="h-5 w-5 text-primary" />
                      </div>
                      <CardTitle className="text-base font-semibold text-card-foreground">
                        Distribución por Plan
                      </CardTitle>
                    </div>
                    <p className="text-sm text-muted-foreground mt-1">¿Qué planes tienen tus alumnos este mes?</p>
                  </CardHeader>
                  <CardContent className="flex-1 flex flex-col justify-center">
                    {/* Dona con centro relativo */}
                    <div className="relative h-[240px]">
                      <ResponsiveContainer width="100%" height="100%">
                        <PieChart>
                          <Pie
                            data={planData}
                            cx="50%"
                            cy="50%"
                            innerRadius={75}
                            outerRadius={100}
                            paddingAngle={3}
                            dataKey="value"
                            isAnimationActive={true}
                            animationDuration={700}
                            animationEasing="ease-out"
                          >
                            {planData.map((entry, index) => (
                              <Cell
                                key={`cell-${entry.name}`}
                                fill={PIE_COLORS[index % PIE_COLORS.length]}
                              />
                            ))}
                          </Pie>
                          <Tooltip
                            content={(props) => <PlanTooltip {...props} planData={planData} />}
                            position={{ y: -20 }}
                          />
                        </PieChart>
                      </ResponsiveContainer>
                      {/* Centro de la dona */}
                      <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                        <span className="text-3xl font-bold text-slate-900">{totalMembers}</span>
                        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Alumnos</span>
                      </div>
                    </div>

                    {/* Leyenda — ordenada mayor a menor con barra proporcional */}
                    <div className="mt-5 space-y-3">
                      {planData.map((item, index) => {
                        const pct = totalMembers > 0 ? Math.round((item.value / totalMembers) * 100) : 0;
                        return (
                          <div key={item.name} className="flex items-center gap-3">
                            <div
                              className="h-3 w-3 rounded-full shrink-0"
                              style={{ backgroundColor: PIE_COLORS[index % PIE_COLORS.length] }}
                            />
                            <span className="text-sm text-slate-700 flex-1 truncate">{item.name}</span>
                            <div className="w-20 h-1.5 bg-slate-100 rounded-full overflow-hidden">
                              <div
                                className="h-full rounded-full transition-all duration-500"
                                style={{ width: `${pct}%`, backgroundColor: PIE_COLORS[index % PIE_COLORS.length] }}
                              />
                            </div>
                            <span className="text-sm font-semibold text-slate-800 w-6 text-right">{item.value}</span>
                            <span className="text-xs text-slate-400 w-8 text-right">{pct}%</span>
                          </div>
                        );
                      })}
                    </div>
                  </CardContent>
                </Card>

                {/* Lista Financiera Métodos de Pago */}
                <div className="h-full">
                  <PaymentMethodsChart data={paymentMethodsData} />
                </div>
              </div>
            </TabsContent>

            {/* Tab: Auditoría y Marketing */}
            <TabsContent value="auditoria" className="mt-0">
              <div className="grid gap-6 lg:grid-cols-2">

                {/* Origen de Alumnos */}
                <Card className="border-border bg-card shadow-sm">
                  <CardHeader className="pb-3">
                    <div className="flex items-center gap-2">
                      <div className="rounded-lg bg-primary/10 p-2">
                        <Users className="h-5 w-5 text-primary" />
                      </div>
                      <CardTitle className="text-base font-semibold text-card-foreground">
                        Origen de Alumnos
                      </CardTitle>
                    </div>
                    <p className="text-sm text-muted-foreground mt-1">¿Cómo nos conocieron tus alumnos?</p>
                  </CardHeader>
                  <CardContent className="pt-0">
                    <div className="space-y-5">
                      {[
                        { name: 'Instagram / TikTok',          color: '#14b8a6' },
                        { name: 'Referido por alumno',          color: '#0ea5e9' },
                        { name: 'Visto al pasar',               color: '#f59e0b' },
                        { name: 'Google Maps',                  color: '#10b981' },
                        { name: 'Otro',                        color: '#94a3b8' },
                      ].map((item, idx) => {
                        const count = members.filter((m) => m.origin === item.name).length;
                        const percentage = members.length > 0
                          ? Math.round((count / members.length) * 100)
                          : 0;
                        if (count === 0) return null;
                        return (
                          <div key={item.name} className="space-y-1.5">
                            <div className="flex items-center justify-between">
                              <span className="text-sm font-medium text-slate-700">{item.name}</span>
                              <div className="flex items-center gap-2">
                                <span className="text-sm font-bold text-slate-900">{percentage}%</span>
                                <span className="text-xs text-muted-foreground">({count} alumnos)</span>
                              </div>
                            </div>
                            <div className="h-2 w-full bg-slate-200/50 rounded-full overflow-hidden">
                              <div
                                className="h-full rounded-full bar-animate"
                                style={{ width: `${percentage}%`, backgroundColor: item.color, animationDelay: `${idx * 80}ms` }}
                              />
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </CardContent>
                </Card>

                {/* Estado de Membresías */}
                <Card className="border-border bg-card shadow-sm">
                  <CardHeader className="pb-3">
                    <div className="flex items-center gap-2">
                      <div className="rounded-lg bg-primary/10 p-2">
                        <ShieldCheck className="h-5 w-5 text-primary" />
                      </div>
                      <CardTitle className="text-base font-semibold text-card-foreground">
                        Estado de Membresías
                      </CardTitle>
                    </div>
                    <p className="text-sm text-muted-foreground mt-1">Distribución actual de la base de alumnos.</p>
                  </CardHeader>
                  <CardContent className="pt-0">
                    <div className="space-y-5">
                      {[
                        { name: 'Activos',    value: members.filter((m) => m.status === 'Activo').length,  color: '#14b8a6', label: 'alumnos al día' },
                        { name: 'Vencen Hoy', value: members.filter((m) => m.status === 'Vencido').length, color: '#f59e0b', label: 'a renovar hoy' },
                        { name: 'Deudores',   value: members.filter((m) => m.status === 'Deudor').length,  color: '#ef4444', label: 'con deuda' },
                      ].map((item, idx) => {
                        const percentage = members.length > 0
                          ? Math.round((item.value / members.length) * 100)
                          : 0;
                        return (
                          <div key={item.name} className="space-y-1.5">
                            <div className="flex items-center justify-between">
                              <span className="text-sm font-medium text-slate-700">{item.name}</span>
                              <div className="flex items-center gap-2">
                                <span className="text-sm font-bold text-slate-900">{percentage}%</span>
                                <span className="text-xs text-muted-foreground">({item.value} {item.label})</span>
                              </div>
                            </div>
                            <div className="h-2 w-full bg-slate-200/50 rounded-full overflow-hidden">
                              <div
                                className="h-full rounded-full bar-animate"
                                style={{ width: `${percentage}%`, backgroundColor: item.color, animationDelay: `${idx * 100}ms` }}
                              />
                            </div>
                          </div>
                        );
                      })}

                      {/* Totalizador */}
                      <div className="pt-4 border-t border-slate-100 flex items-center justify-between">
                        <span className="text-sm font-semibold text-slate-700">Total registrados</span>
                        <span className="text-sm font-bold text-slate-900">{members.length} alumnos</span>
                      </div>
                    </div>
                  </CardContent>
                </Card>

              </div>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
}
