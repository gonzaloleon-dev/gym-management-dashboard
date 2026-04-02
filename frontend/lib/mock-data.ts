// Types for the Gym Management System
export type MembershipPlan = 
  | '3 veces x semana'
  | 'LIBRE'
  | 'Funcional'
  | 'M+F'
  | 'Stretching Global Activo'
  | 'Feldenkrais/GPG';

export const PLAN_PRICES: Record<MembershipPlan, number> = {
  '3 veces x semana': 50000,
  'LIBRE': 60000,
  'Funcional': 50000,
  'M+F': 70000,
  'Stretching Global Activo': 30000,
  'Feldenkrais/GPG': 30000,
};

export interface Member {
  id: string;
  dni: string;
  name: string;
  email: string;
  phone: string;
  plan: MembershipPlan;
  status: 'Activo' | 'Vencido' | 'Deudor';
  lastPayment: string;
  nextExpiry: string;
  debt: number;
  daysOverdue: number;
  joinDate: string;
}

export interface Payment {
  id: string;
  memberId: string;
  memberName: string;
  amount: number;
  date: string;
  method: 'Efectivo' | 'Transferencia';
  concept: string;
}

export interface RevenueData {
  month: string;
  revenue: number;
  members: number;
}

// Mock Members Data - Argentine names and DNI-style IDs
export const mockMembers: Member[] = [
  {
    id: '1',
    dni: '35.456.789',
    name: 'Martín González',
    email: 'martin.gonzalez@gmail.com',
    phone: '+54 11 4567-8901',
    plan: 'LIBRE',
    status: 'Activo',
    lastPayment: '2026-01-15',
    nextExpiry: '2026-02-15',
    debt: 0,
    daysOverdue: 0,
    joinDate: '2024-06-10',
  },
  {
    id: '2',
    dni: '28.123.456',
    name: 'Lucía Fernández',
    email: 'lucia.fernandez@hotmail.com',
    phone: '+54 11 2345-6789',
    plan: 'M+F',
    status: 'Activo',
    lastPayment: '2026-01-20',
    nextExpiry: '2026-02-20',
    debt: 0,
    daysOverdue: 0,
    joinDate: '2023-08-22',
  },
  {
    id: '3',
    dni: '40.987.654',
    name: 'Santiago Rodríguez',
    email: 'santi.rod@gmail.com',
    phone: '+54 11 6789-0123',
    plan: '3 veces x semana',
    status: 'Deudor',
    lastPayment: '2025-12-10',
    nextExpiry: '2026-01-10',
    debt: 50000,
    daysOverdue: 20,
    joinDate: '2025-03-15',
  },
  {
    id: '4',
    dni: '33.456.123',
    name: 'Camila López',
    email: 'camila.lopez@yahoo.com',
    phone: '+54 11 3456-7890',
    plan: 'Funcional',
    status: 'Activo',
    lastPayment: '2026-01-25',
    nextExpiry: '2026-02-25',
    debt: 0,
    daysOverdue: 0,
    joinDate: '2022-01-05',
  },
  {
    id: '5',
    dni: '37.890.234',
    name: 'Tomás Martínez',
    email: 'tomas.martinez@gmail.com',
    phone: '+54 11 7890-1234',
    plan: 'LIBRE',
    status: 'Vencido',
    lastPayment: '2025-12-30',
    nextExpiry: '2026-01-30',
    debt: 0,
    daysOverdue: 0,
    joinDate: '2024-11-20',
  },
  {
    id: '6',
    dni: '29.567.891',
    name: 'Valentina Pérez',
    email: 'vale.perez@outlook.com',
    phone: '+54 11 5678-9012',
    plan: 'Stretching Global Activo',
    status: 'Activo',
    lastPayment: '2026-01-18',
    nextExpiry: '2026-02-18',
    debt: 0,
    daysOverdue: 0,
    joinDate: '2021-05-18',
  },
  {
    id: '7',
    dni: '42.234.567',
    name: 'Nicolás Díaz',
    email: 'nico.diaz@gmail.com',
    phone: '+54 11 2345-6780',
    plan: 'M+F',
    status: 'Deudor',
    lastPayment: '2025-11-15',
    nextExpiry: '2025-12-15',
    debt: 70000,
    daysOverdue: 46,
    joinDate: '2025-07-01',
  },
  {
    id: '8',
    dni: '31.678.901',
    name: 'Florencia Sánchez',
    email: 'flor.sanchez@gmail.com',
    phone: '+54 11 6789-0124',
    plan: 'Feldenkrais/GPG',
    status: 'Activo',
    lastPayment: '2026-01-22',
    nextExpiry: '2026-02-22',
    debt: 0,
    daysOverdue: 0,
    joinDate: '2024-02-14',
  },
  {
    id: '9',
    dni: '38.901.234',
    name: 'Agustín Romero',
    email: 'agus.romero@hotmail.com',
    phone: '+54 11 9012-3456',
    plan: 'LIBRE',
    status: 'Deudor',
    lastPayment: '2025-12-05',
    nextExpiry: '2026-01-05',
    debt: 60000,
    daysOverdue: 25,
    joinDate: '2025-04-22',
  },
  {
    id: '10',
    dni: '34.345.678',
    name: 'Carolina Álvarez',
    email: 'caro.alvarez@gmail.com',
    phone: '+54 11 3456-7891',
    plan: 'Funcional',
    status: 'Activo',
    lastPayment: '2026-01-10',
    nextExpiry: '2026-02-10',
    debt: 0,
    daysOverdue: 0,
    joinDate: '2023-06-15',
  },
  {
    id: '11',
    dni: '41.456.789',
    name: 'Federico Torres',
    email: 'fede.torres@yahoo.com',
    phone: '+54 11 4567-8902',
    plan: '3 veces x semana',
    status: 'Vencido',
    lastPayment: '2025-12-30',
    nextExpiry: '2026-01-30',
    debt: 0,
    daysOverdue: 0,
    joinDate: '2025-09-10',
  },
  {
    id: '12',
    dni: '30.789.012',
    name: 'María José Herrera',
    email: 'majo.herrera@gmail.com',
    phone: '+54 11 7890-1235',
    plan: 'LIBRE',
    status: 'Activo',
    lastPayment: '2026-01-28',
    nextExpiry: '2026-02-28',
    debt: 0,
    daysOverdue: 0,
    joinDate: '2020-12-01',
  },
  {
    id: '13',
    dni: '36.012.345',
    name: 'Juan Pablo Morales',
    email: 'jp.morales@outlook.com',
    phone: '+54 11 0123-4567',
    plan: 'M+F',
    status: 'Deudor',
    lastPayment: '2025-10-25',
    nextExpiry: '2025-11-25',
    debt: 140000,
    daysOverdue: 66,
    joinDate: '2025-01-08',
  },
  {
    id: '14',
    dni: '39.234.567',
    name: 'Sofía Vargas',
    email: 'sofia.vargas@gmail.com',
    phone: '+54 11 2345-6781',
    plan: 'Stretching Global Activo',
    status: 'Activo',
    lastPayment: '2026-01-12',
    nextExpiry: '2026-02-12',
    debt: 0,
    daysOverdue: 0,
    joinDate: '2024-07-30',
  },
  {
    id: '15',
    dni: '32.567.890',
    name: 'Ezequiel Castro',
    email: 'eze.castro@hotmail.com',
    phone: '+54 11 5678-9013',
    plan: 'Funcional',
    status: 'Deudor',
    lastPayment: '2025-11-20',
    nextExpiry: '2025-12-20',
    debt: 100000,
    daysOverdue: 41,
    joinDate: '2025-02-28',
  },
];

// Revenue data for the last 6 months
export const revenueData: RevenueData[] = [
  { month: 'Ago', revenue: 3250000, members: 142 },
  { month: 'Sep', revenue: 3580000, members: 155 },
  { month: 'Oct', revenue: 4120000, members: 168 },
  { month: 'Nov', revenue: 4450000, members: 176 },
  { month: 'Dic', revenue: 4880000, members: 188 },
  { month: 'Ene', revenue: 5200000, members: 200 },
];

// Payment methods distribution this month
export const paymentMethodsData = [
  { method: 'Efectivo', amount: 2800000, count: 95 },
  { method: 'Transferencia', amount: 2400000, count: 85 },
];

// Recent payments
export const recentPayments: Payment[] = [
  {
    id: 'p1',
    memberId: '1',
    memberName: 'Martín González',
    amount: 60000,
    date: '2026-01-15',
    method: 'Transferencia',
    concept: 'LIBRE - Enero',
  },
  {
    id: 'p2',
    memberId: '6',
    memberName: 'Valentina Pérez',
    amount: 30000,
    date: '2026-01-18',
    method: 'Efectivo',
    concept: 'Stretching Global Activo - Enero',
  },
  {
    id: 'p3',
    memberId: '12',
    memberName: 'María José Herrera',
    amount: 60000,
    date: '2026-01-28',
    method: 'Transferencia',
    concept: 'LIBRE - Enero',
  },
  {
    id: 'p4',
    memberId: '2',
    memberName: 'Lucía Fernández',
    amount: 70000,
    date: '2026-01-20',
    method: 'Transferencia',
    concept: 'M+F - Enero',
  },
  {
    id: 'p5',
    memberId: '4',
    memberName: 'Camila López',
    amount: 50000,
    date: '2026-01-25',
    method: 'Efectivo',
    concept: 'Funcional - Enero',
  },
  {
    id: 'p6',
    memberId: '8',
    memberName: 'Florencia Sánchez',
    amount: 30000,
    date: '2026-01-22',
    method: 'Transferencia',
    concept: 'Feldenkrais/GPG - Enero',
  },
];

// Members expiring today
export const todayExpiringMembers: Member[] = [
  {
    id: '5',
    dni: '37.890.234',
    name: 'Tomás Martínez',
    email: 'tomas.martinez@gmail.com',
    phone: '+54 11 7890-1234',
    plan: 'LIBRE',
    status: 'Vencido',
    lastPayment: '2025-12-30',
    nextExpiry: '2026-01-30',
    debt: 0,
    daysOverdue: 0,
    joinDate: '2024-11-20',
  },
  {
    id: '11',
    dni: '41.456.789',
    name: 'Federico Torres',
    email: 'fede.torres@yahoo.com',
    phone: '+54 11 4567-8902',
    plan: '3 veces x semana',
    status: 'Vencido',
    lastPayment: '2025-12-30',
    nextExpiry: '2026-01-30',
    debt: 0,
    daysOverdue: 0,
    joinDate: '2025-09-10',
  },
];

// Helper functions for dashboard stats
export function getDashboardStats() {
  const activeMembers = mockMembers.filter(m => m.status === 'Activo').length;
  const totalMembers = 200; // Total registered members
  const paidMembers = 120; // Members who have paid this month
  const debtors = mockMembers.filter(m => m.status === 'Deudor');
  const totalDebt = debtors.reduce((acc, m) => acc + m.debt, 0);
  
  const monthlyRevenue = revenueData[revenueData.length - 1].revenue;

  return {
    monthlyRevenue,
    activeMembers,
    totalMembers,
    paidMembers,
    totalDebt,
    todayExpiries: todayExpiringMembers.length,
    debtors: debtors.sort((a, b) => b.daysOverdue - a.daysOverdue),
  };
}

// Format currency in Argentine Pesos with dot separator
export function formatCurrency(amount: number): string {
  return '$ ' + amount.toLocaleString('es-AR');
}

// Format date in Spanish
export function formatDate(dateStr: string): string {
  const date = new Date(dateStr);
  return new Intl.DateTimeFormat('es-AR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  }).format(date);
}

// Get overdue members sorted by days overdue
export function getOverdueMembers(): Member[] {
  return mockMembers
    .filter(m => m.status === 'Deudor')
    .sort((a, b) => b.daysOverdue - a.daysOverdue);
}
