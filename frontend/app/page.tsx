'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { GlobalMemberSearch } from '@/components/dashboard/global-member-search';
import { SidebarNav } from '@/components/dashboard/sidebar-nav';
import { KPICards } from '@/components/dashboard/kpi-cards';
import { MembersGrowthChart } from '@/components/dashboard/members-growth-chart';
import { CollectionManagementWidget } from '@/components/dashboard/collection-management-widget';
import { MembersTable } from '@/components/dashboard/members-table';

import { PaymentsView } from '@/components/dashboard/payments-view';
import { ExpensesView } from '@/components/dashboard/expenses-view';
import { StatisticsView } from '@/components/dashboard/statistics-view';
import { SettingsView } from '@/components/dashboard/settings-view';
import {
} from '@/lib/mock-data';
import { useAppContext, Plan } from '@/lib/app-context';

export default function DashboardPage() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState('dashboard');
  const { isLoggedIn, members, payments, plans } = useAppContext();

  useEffect(() => {
    if (!isLoggedIn) {
      router.push('/login');
    }
  }, [isLoggedIn, router]);

  if (!isLoggedIn) return null;

  const today = new Date();
  today.setHours(0, 0, 0, 0);
  
  const activeMembers = members.filter(m => m.status === 'Activo').length;
  const debtors = members.filter(m => m.status === 'Deudor');
  // Deuda calculada con precios ACTUALES de plans (no el campo estático member.debt)
  const totalDebt = debtors.reduce((acc, m) => {
    const planPrice = plans.find(p => p.name === m.plan)?.price ?? m.debt;
    return acc + planPrice;
  }, 0);
  const retentionRate = members.length > 0 ? Math.round((activeMembers / (activeMembers + debtors.length)) * 100) : 0;
  
  const avgPerMember = plans.length > 0 ? Math.round(plans.reduce((a, b: Plan) => a + b.price, 0) / plans.length) : 0;
  
  const currentMonthStr = new Date().toISOString().slice(0, 7);
  const monthlyRevenue = payments
    .filter(p => !p.voided && p.date.startsWith(currentMonthStr))
    .reduce((acc, p) => acc + p.amount, 0);

  // Miembros (únicos) que pagaron este mes
  const paidMemberIds = new Set(
    payments.filter(p => !p.voided && p.date.startsWith(currentMonthStr)).map(p => p.memberId)
  );
  const paidMembers = paidMemberIds.size;

  // Nuevos alumnos este mes (joinDate del mes actual)
  const newMembersThisMonth = members.filter(m => m.joinDate?.startsWith(currentMonthStr)).length;

  // Crecimiento: nuevos vs mes anterior
  const prevMonthDate = new Date();
  prevMonthDate.setMonth(prevMonthDate.getMonth() - 1);
  const prevMonthStr = prevMonthDate.toISOString().slice(0, 7);
  const prevMonthMembers = members.filter(m => m.joinDate?.startsWith(prevMonthStr)).length;
  const growthPercentage = prevMonthMembers > 0
    ? Math.round(((newMembersThisMonth - prevMonthMembers) / prevMonthMembers) * 100 * 10) / 10
    : newMembersThisMonth > 0 ? 100 : 0;

  const stats = {
    monthlyRevenue,
    totalMembers: members.length,
    activeMembers,
    paidMembers,
    totalDebt,
    retentionRate,
    avgPerMember,
    newMembersThisMonth,
    growthPercentage,
  };

  const overdueMembers = debtors.sort((a, b) => a.daysOverdue - b.daysOverdue);
  const todayExpiringMembers = members.filter(m => {
    const exp = new Date(`${m.nextExpiry}T00:00:00`);
    return exp.getTime() === today.getTime() || m.status === 'Vencido';
  });
  
  const upcomingExpiries = members.filter(m => {
    if (m.status !== 'Activo') return false;
    const expiryDate = new Date(`${m.nextExpiry}T00:00:00`);
    const limitDate = new Date(today);
    limitDate.setDate(today.getDate() + 3);
    return expiryDate > today && expiryDate <= limitDate;
  }).sort((a, b) => new Date(`${a.nextExpiry}T00:00:00`).getTime() - new Date(`${b.nextExpiry}T00:00:00`).getTime());


  return (
    <div className="min-h-screen bg-background">
      {/* Sidebar */}
      <SidebarNav activeTab={activeTab} onTabChange={setActiveTab} />

      {/* Main Content */}
      <main className="lg:pl-64">
        <div className="px-4 py-6 sm:px-6 lg:px-8">
          {/* Header */}
          <header className="mb-8 pt-12 lg:pt-0">
            <div className="flex items-start justify-between gap-4">
              <div>
                <h1 className="text-3xl font-bold text-foreground tracking-tight">
                  {activeTab === 'dashboard' && 'Panel Principal'}
                  {activeTab === 'members' && 'Miembros'}
                  {activeTab === 'payments' && 'Ingresos'}
                  {activeTab === 'expenses' && 'Gastos'}
                  {activeTab === 'statistics' && 'Estadísticas'}
                  {activeTab === 'settings' && 'Configuración'}
                </h1>
                <p className="text-base text-muted-foreground mt-1">
                  {activeTab === 'dashboard' && "Vista general"}
                  {activeTab === 'members' && 'Administración de miembros'}
                  {activeTab === 'payments' && 'Control de caja y registro de ingresos'}
                  {activeTab === 'expenses' && 'Gestión y análisis de egresos'}
                  {activeTab === 'statistics' && 'Reportes y balance general'}
                  {activeTab === 'settings' && 'Configura tu gimnasio'}
                </p>
              </div>
              {/* Buscador global */}
              <div className="mt-1 shrink-0">
                <GlobalMemberSearch />
              </div>
            </div>
          </header>

          {/* Dashboard View */}
          {activeTab === 'dashboard' && (
            <div className="space-y-6">
              {/* KPI Cards */}
              <KPICards
                monthlyRevenue={stats.monthlyRevenue}
                newMembersThisMonth={stats.newMembersThisMonth}
                growthPercentage={stats.growthPercentage}
                totalMembers={stats.totalMembers}
                paidMembers={stats.paidMembers}
                totalDebt={stats.totalDebt}
              />

              {/* Central Collection Management Widget */}
              <div className="mt-6 mb-6">
                <CollectionManagementWidget
                  overdueMembers={overdueMembers}
                  todayExpiries={todayExpiringMembers}
                  upcomingExpiries={upcomingExpiries}
                />
              </div>
            </div>
          )}

          {/* Members View */}
          {activeTab === 'members' && (
            <div className="space-y-6">
              <MembersTable members={members} />
            </div>
          )}

          {/* Payments View */}
          {activeTab === 'payments' && <PaymentsView />}

          {/* Expenses View */}
          {activeTab === 'expenses' && <ExpensesView />}

          {/* Statistics View */}
          {activeTab === 'statistics' && <StatisticsView />}

          {/* Settings View */}
          {activeTab === 'settings' && <SettingsView />}
        </div>
      </main>

    </div>
  );
}
