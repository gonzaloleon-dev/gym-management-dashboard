'use client';

import { useState } from 'react';
import { SidebarNav } from '@/components/dashboard/sidebar-nav';
import { KPICards } from '@/components/dashboard/kpi-cards';
import { RevenueChart } from '@/components/dashboard/revenue-chart';
import { PlanDistributionChart } from '@/components/dashboard/plan-distribution-chart';
import { TodayExpiries } from '@/components/dashboard/today-expiries';
import { OverdueMembersTable } from '@/components/dashboard/overdue-members-table';
import { PaymentMethodsChart } from '@/components/dashboard/payment-methods-chart';
import { MembersTable } from '@/components/dashboard/members-table';
import { QuickActions } from '@/components/dashboard/quick-actions';
import { PaymentsView } from '@/components/dashboard/payments-view';
import { StatisticsView } from '@/components/dashboard/statistics-view';
import { SettingsView } from '@/components/dashboard/settings-view';
import { 
  mockMembers, 
  revenueData, 
  paymentMethodsData,
  todayExpiringMembers,
  getDashboardStats,
  getOverdueMembers 
} from '@/lib/mock-data';

export default function DashboardPage() {
  const [activeTab, setActiveTab] = useState('dashboard');
  const stats = getDashboardStats();
  const overdueMembers = getOverdueMembers();

  return (
    <div className="min-h-screen bg-background">
      {/* Sidebar */}
      <SidebarNav activeTab={activeTab} onTabChange={setActiveTab} />

      {/* Main Content */}
      <main className="lg:pl-64">
        <div className="px-4 py-6 sm:px-6 lg:px-8">
          {/* Header */}
          <header className="mb-8 pt-12 lg:pt-0">
            <h1 className="text-3xl font-bold text-foreground tracking-tight">
              {activeTab === 'dashboard' && 'Dashboard'}
              {activeTab === 'members' && 'Miembros'}
              {activeTab === 'payments' && 'Pagos'}
              {activeTab === 'statistics' && 'Estadísticas'}
              {activeTab === 'settings' && 'Configuración'}
            </h1>
            <p className="text-base text-muted-foreground mt-1">
              {activeTab === 'dashboard' && "Vista general"}
              {activeTab === 'members' && 'Gestiona tus miembros y membresías'}
              {activeTab === 'payments' && 'Historial y registro de pagos'}
              {activeTab === 'statistics' && 'Análisis y métricas de rendimiento'}
              {activeTab === 'settings' && 'Configura tu gimnasio'}
            </p>
          </header>

          {/* Dashboard View */}
          {activeTab === 'dashboard' && (
            <div className="space-y-6">
              {/* KPI Cards */}
              <KPICards
                monthlyRevenue={stats.monthlyRevenue}
                activeMembers={stats.activeMembers}
                totalMembers={stats.totalMembers}
                paidMembers={stats.paidMembers}
                totalDebt={stats.totalDebt}
              />

              {/* Analytics Row: Revenue Chart and Plan Distribution */}
              <div className="grid gap-6 lg:grid-cols-2">
                <RevenueChart data={revenueData} />
                <PlanDistributionChart />
              </div>

              {/* Today's Expiries */}
              <TodayExpiries members={todayExpiringMembers} />

              {/* Overdue Members Table */}
              <OverdueMembersTable members={overdueMembers} />

              {/* Payment Methods Chart */}
              <div className="max-w-md">
                <PaymentMethodsChart data={paymentMethodsData} />
              </div>
            </div>
          )}

          {/* Members View */}
          {activeTab === 'members' && (
            <div className="space-y-6">
              <MembersTable members={mockMembers} />
            </div>
          )}

          {/* Payments View */}
          {activeTab === 'payments' && <PaymentsView />}

          {/* Statistics View */}
          {activeTab === 'statistics' && <StatisticsView />}

          {/* Settings View */}
          {activeTab === 'settings' && <SettingsView />}
        </div>
      </main>

      {/* Quick Actions FAB */}
      <QuickActions />
    </div>
  );
}
