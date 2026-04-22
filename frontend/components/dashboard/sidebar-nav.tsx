'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import {
  Home,
  Users,
  CreditCard,
  BarChart3,
  Settings,
  Menu,
  X,
  LogOut,
  TrendingDown,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { useAppContext } from '@/lib/app-context';
import { Button } from '@/components/ui/button';

const navItems = [
  { id: 'dashboard', label: 'Inicio', icon: Home },
  { id: 'members', label: 'Miembros', icon: Users },
  { id: 'payments', label: 'Ingresos', icon: CreditCard },
  { id: 'expenses', label: 'Gastos', icon: TrendingDown },
  { id: 'statistics', label: 'Estadísticas', icon: BarChart3 },
  { id: 'settings', label: 'Configuración', icon: Settings },
];

interface SidebarNavProps {
  activeTab: string;
  onTabChange: (tab: string) => void;
}

export function SidebarNav({ activeTab, onTabChange }: SidebarNavProps) {
  const router = useRouter();
  const { logout } = useAppContext();
  const [isMobileOpen, setIsMobileOpen] = useState(false);

  const handleLogout = () => {
    logout();
    router.push('/login');
  };

  return (
    <>
      {/* Mobile Menu Button */}
      <Button
        variant="ghost"
        size="icon"
        className="fixed top-4 left-4 z-50 lg:hidden bg-card shadow-md border border-border"
        onClick={() => setIsMobileOpen(!isMobileOpen)}
      >
        {isMobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
      </Button>

      {/* Overlay */}
      {isMobileOpen && (
        <div
          className="fixed inset-0 bg-foreground/20 backdrop-blur-sm z-40 lg:hidden"
          onClick={() => setIsMobileOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={cn(
          'fixed top-0 left-0 z-40 h-screen w-64 border-r border-sidebar-border bg-sidebar shadow-sm transition-transform duration-300 ease-in-out lg:translate-x-0',
          isMobileOpen ? 'translate-x-0' : '-translate-x-full'
        )}
      >
        <div className="flex h-full flex-col">
          {/* Logo */}
          <div className="flex items-center gap-3 border-b border-sidebar-border px-6 py-5">
            <Image
              src="/images/gym-logo.png"
              alt={process.env.NEXT_PUBLIC_GYM_NAME || "Gym Logo"}
              width={140}
              height={40}
              className="h-10 w-auto"
              priority
            />
          </div>

          {/* Navigation */}
          <nav className="flex-1 space-y-1 px-3 py-4">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = activeTab === item.id;

              return (
                <button
                  key={item.id}
                  onClick={() => {
                    onTabChange(item.id);
                    setIsMobileOpen(false);
                  }}
                  className={cn(
                    'relative flex w-full items-center gap-3 rounded-r-lg px-3 py-3 text-sm font-medium transition-all duration-200',
                    isActive
                      ? 'bg-primary/8 text-primary border-l-[3px] border-l-primary rounded-l-none'
                      : 'text-muted-foreground hover:bg-muted/50 hover:text-foreground border-l-[3px] border-l-transparent'
                  )}
                >
                  <Icon className={cn('h-5 w-5', isActive && 'text-primary')} />
                  {item.label}
                </button>
              );
            })}
          </nav>

          {/* Footer */}
          <div className="border-t border-sidebar-border p-4 space-y-3">
            <div className="flex items-center gap-3">
              <div className="flex h-9 w-9 items-center justify-center rounded-full bg-primary/15 text-sm font-semibold text-primary">
                AD
              </div>
              <div className="flex-1 truncate">
                <p className="text-sm font-medium text-sidebar-foreground">Admin</p>
                <p className="text-xs text-muted-foreground">Administrador</p>
              </div>
            </div>
            <button
              onClick={handleLogout}
              className="flex w-full items-center gap-2.5 rounded-lg px-3 py-2 text-sm font-medium text-muted-foreground hover:bg-destructive/8 hover:text-destructive transition-colors"
            >
              <LogOut className="h-4 w-4" />
              Cerrar sesión
            </button>
          </div>
        </div>
      </aside>
    </>
  );
}