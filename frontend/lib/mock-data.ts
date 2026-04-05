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
  medicalNotes?: string;
  emergencyContactName?: string;
  emergencyContactPhone?: string;
  personalObjective?: string;
  origin?: string;
  initialPlan?: MembershipPlan;
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

const firstNames = ['Martín', 'Lucía', 'Santiago', 'Camila', 'Tomás', 'Valentina', 'Nicolás', 'Florencia', 'Agustín', 'Carolina', 'Federico', 'María José', 'Juan Pablo', 'Sofía', 'Ezequiel', 'Mateo', 'Isabella', 'Facundo', 'Delfina', 'Bautista', 'Julia', 'Benjamín', 'Catalina', 'Joaquín', 'Victoria', 'Felipe', 'Pilar', 'Gastón', 'Milagros', 'Bruno'];
const lastNames = ['González', 'Fernández', 'Rodríguez', 'López', 'Martínez', 'Pérez', 'Díaz', 'Sánchez', 'Romero', 'Álvarez', 'Torres', 'Herrera', 'Morales', 'Vargas', 'Castro', 'Ruiz', 'Gómez', 'Blanco', 'Paz', 'Sosa', 'Siri', 'Méndez', 'Guzmán', 'García', 'Lombardi', 'Navarro', 'Rojas', 'Luna', 'Acosta', 'Benitez'];
const plans: MembershipPlan[] = ['3 veces x semana', 'LIBRE', 'Funcional', 'M+F', 'Stretching Global Activo', 'Feldenkrais/GPG'];

const generateMockMembers = (count: number): Member[] => {
  const members: Member[] = [];
  const today = new Date('2026-02-13'); // Hoy simulado
  
  for (let i = 1; i <= count; i++) {
    const firstName = firstNames[i % firstNames.length];
    const lastName = lastNames[Math.floor(i / firstNames.length) % lastNames.length];
    const name = `${firstName} ${lastName}`;
    const plan = plans[i % plans.length];
    
    // Generar fechas con logica de status
    let nextExpiryDate: Date;
    let status: 'Activo' | 'Vencido' | 'Deudor';
    let debt = 0;
    let daysOverdue = 0;

    if (i % 5 === 0) {
      // Deudores: Vencieron hace tiempo (1 a 3 meses atras)
      const monthsBack = (i % 3) + 1;
      nextExpiryDate = new Date(today);
      nextExpiryDate.setMonth(today.getMonth() - monthsBack);
      status = 'Deudor';
      debt = PLAN_PRICES[plan] * monthsBack;
      daysOverdue = Math.floor((today.getTime() - nextExpiryDate.getTime()) / (1000 * 60 * 60 * 24));
    } else if (i % 7 === 0) {
      // Vencidos hoy: Vencen exactamente hoy
      nextExpiryDate = new Date(today);
      status = 'Vencido';
    } else {
      // Activos: Vencen en el futuro (1 a 25 dias adelante)
      const daysAhead = (i % 25) + 1;
      nextExpiryDate = new Date(today);
      nextExpiryDate.setDate(today.getDate() + daysAhead);
      status = 'Activo';
    }

    const nextExpiry = nextExpiryDate.toISOString().split('T')[0];
    const lastPaymentDate = new Date(nextExpiryDate);
    lastPaymentDate.setMonth(nextExpiryDate.getMonth() - 1);
    const lastPayment = lastPaymentDate.toISOString().split('T')[0];
    
    const joinDate = '2024-01-15'; // Fecha de ingreso fija para simplificar
    
    members.push({
      id: i.toString(),
      dni: `${25 + (i % 20)}.${Math.floor(Math.random() * 900) + 100}.${Math.floor(Math.random() * 900) + 100}`,
      name,
      email: `${firstName.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "")}.${lastName.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "")}${i}@gmail.com`,
      phone: `+54 11 ${Math.floor(Math.random() * 9000) + 1000}-${Math.floor(Math.random() * 9000) + 1000}`,
      plan,
      status,
      lastPayment,
      nextExpiry,
      debt,
      daysOverdue,
      joinDate,
      medicalNotes: 'Apto médico al día. Sin lesiones.',
      emergencyContactName: 'Familiar de Contacto',
      emergencyContactPhone: '+54 11 0000-0000',
      personalObjective: 'Salud y bienestar',
      origin: i % 3 === 0 ? 'Instagram' : i % 3 === 1 ? 'Facebook' : 'Recomendación',
      initialPlan: '3 veces x semana',
    });
  }
  return members;
};

export const mockMembers = generateMockMembers(50);

// Revenue data for the last 6 months
export const revenueData: RevenueData[] = [
  { month: 'Ago', revenue: 3250000, members: 142 },
  { month: 'Sep', revenue: 3580000, members: 155 },
  { month: 'Oct', revenue: 4120000, members: 168 },
  { month: 'Nov', revenue: 4450000, members: 176 },
  { month: 'Dic', revenue: 4880000, members: 188 },
  { month: 'Ene', revenue: 5200000, members: 200 },
];

export const paymentMethodsData = [
  { method: 'Efectivo', amount: 2800000, count: 95 },
  { method: 'Transferencia', amount: 2400000, count: 85 },
];

export const recentPayments: Payment[] = mockMembers.slice(0, 8).map(m => ({
  id: `p${m.id}`,
  memberId: m.id,
  memberName: m.name,
  amount: PLAN_PRICES[m.plan],
  date: '2026-01-20',
  method: Math.random() > 0.5 ? 'Transferencia' : 'Efectivo',
  concept: `${m.plan} - Enero`,
}));

export const todayExpiringMembers: Member[] = mockMembers.filter(m => m.status === 'Vencido');

export const getUpcomingExpiries = (days: number = 2): Member[] => {
  return mockMembers.filter(m => m.status === 'Activo').slice(0, 10);
};

export function formatCurrency(amount: number): string {
  return '$ ' + amount.toLocaleString('es-AR');
}

export function formatDate(dateStr: string): string {
  const date = new Date(dateStr);
  return new Intl.DateTimeFormat('es-AR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  }).format(date);
}

export function formatRelativeDate(dateStr: string, type: 'overdue' | 'today' | 'upcoming', daysOverdue: number): string {
  if (type === 'today') return 'Hoy';
  if (type === 'overdue') {
    if (daysOverdue === 1) return 'Hace 1 día';
    if (daysOverdue < 30) return `Hace ${daysOverdue} días`;
    const months = Math.floor(daysOverdue / 30);
    return months === 1 ? 'Hace 1 mes' : `Hace ${months} meses`;
  }
  const targetDate = new Date(dateStr);
  const now = new Date('2026-02-13'); // Hoy simulado
  const diffTime = Math.max(0, targetDate.getTime() - now.getTime());
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  if (diffDays === 0) return 'Mañana';
  if (diffDays === 1) return 'En 1 día';
  return `En ${diffDays} días`;
}

export function getOverdueMembers(): Member[] {
  return mockMembers.filter(m => m.status === 'Deudor').sort((a, b) => b.daysOverdue - a.daysOverdue);
}

export function getDashboardStats() {
  const debtors = mockMembers.filter(m => m.status === 'Deudor');
  const totalDebt = debtors.reduce((acc, m) => acc + m.debt, 0);
  return {
    monthlyRevenue: 5200000,
    totalMembers: mockMembers.length * 4,
    paidMembers: mockMembers.length * 2,
    totalDebt,
    newMembersThisMonth: 15,
    growthPercentage: 6.4,
    todayExpiries: todayExpiringMembers.length,
    upcomingExpiries: 8,
    debtors: debtors.sort((a, b) => b.daysOverdue - a.daysOverdue),
  };
}
