'use client';

import { useState } from 'react';
import { SidebarNav } from '@/components/dashboard/sidebar-nav';
import { KPICards } from '@/components/dashboard/kpi-cards';
import { MembersGrowthChart } from '@/components/dashboard/members-growth-chart';
import { CollectionManagementWidget } from '@/components/dashboard/collection-management-widget';
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
  getOverdueMembers,
  getUpcomingExpiries
} from '@/lib/mock-data';

export default function DashboardPage() {
  const [activeTab, setActiveTab] = useState('dashboard');
  const stats = getDashboardStats();
  const overdueMembers = getOverdueMembers();
  const upcomingExpiries = getUpcomingExpiries();

  const membersGrowth = revenueData.map((d) => ({
    month: d.month,
    members: d.members,
  }));

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
              {activeTab === 'dashboard' && 'Panel Principal'}
              {activeTab === 'members' && 'Miembros'}
              {activeTab === 'payments' && 'Pagos'}
              {activeTab === 'statistics' && 'Estadísticas'}
              {activeTab === 'settings' && 'Configuración'}
            </h1>
            <p className="text-base text-muted-foreground mt-1">
              {activeTab === 'dashboard' && "Vista general"}
              {activeTab === 'members' && 'Administración de miembros'}
              {activeTab === 'payments' && 'Historial y registro de pagos'}
              {activeTab === 'statistics' && 'Reportes y balance general'}
              {activeTab === 'settings' && 'Configura tu gimnasio'}
            </p>
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
              <div className="grid gap-6">
                <MembersGrowthChart data={membersGrowth} />
              </div>
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

    </div>
  );
}
