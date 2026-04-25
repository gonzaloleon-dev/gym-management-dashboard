// Types for the Gym Management System
export type ExpenseCategory = 'Alquiler' | 'Servicios' | 'Mantenimiento / Reparaciones' | 'Limpieza' | 'Varios';

export interface Expense {
  id: string;
  concept: string;
  amount: number;
  date: string;
  category: ExpenseCategory;
  method: string;
}

export type MembershipPlan = 
  | '3 veces por semana'
  | 'Libre'
  | 'Funcional'
  | 'Sala Musculación + Funcional';

export const PLAN_PRICES: Record<MembershipPlan, number> = {
  '3 veces por semana': 50000,
  'Libre': 60000,
  'Funcional': 50000,
  'Sala Musculación + Funcional': 70000,
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
  method: 'Efectivo' | 'Transferencia' | 'Cuenta DNI' | 'Mercado Pago' | 'Débito' | 'Otros';
  concept: string;
  voided?: boolean;
}

export interface RevenueData {
  month: string;
  revenue: number;
  members: number;
  newMembers: number;
  churnedMembers: number;
  growth: number;
}

const firstNames = ['Martín', 'Lucía', 'Santiago', 'Camila', 'Tomás', 'Valentina', 'Nicolás', 'Florencia', 'Agustín', 'Carolina', 'Federico', 'María José', 'Juan Pablo', 'Sofía', 'Ezequiel', 'Mateo', 'Isabella', 'Facundo', 'Delfina', 'Bautista', 'Julia', 'Benjamín', 'Catalina', 'Joaquín', 'Victoria', 'Felipe', 'Pilar', 'Gastón', 'Milagros', 'Bruno'];
const lastNames = ['González', 'Fernández', 'Rodríguez', 'López', 'Martínez', 'Pérez', 'Díaz', 'Sánchez', 'Romero', 'Álvarez', 'Torres', 'Herrera', 'Morales', 'Vargas', 'Castro', 'Ruiz', 'Gómez', 'Blanco', 'Paz', 'Sosa', 'Siri', 'Méndez', 'Guzmán', 'García', 'Lombardi', 'Navarro', 'Rojas', 'Luna', 'Acosta', 'Benitez'];
const plans: MembershipPlan[] = ['3 veces por semana', 'Libre', 'Funcional', 'Sala Musculación + Funcional'];

const generateMockMembers = (count: number): Member[] => {
  const members: Member[] = [];
  const today = new Date();
  
  for (let i = 1; i <= count; i++) {
    const firstName = firstNames[i % firstNames.length];
    const lastName = lastNames[Math.floor(i / firstNames.length) % lastNames.length];
    const name = `${firstName} ${lastName}`;
    const plan = plans[i % plans.length];
    
    let nextExpiryDate: Date;
    let status: 'Activo' | 'Vencido' | 'Deudor';
    let debt = 0;
    let daysOverdue = 0;

    if (i % 5 === 0) {
      const monthsBack = (i % 3) + 1;
      nextExpiryDate = new Date(today);
      nextExpiryDate.setMonth(today.getMonth() - monthsBack);
      status = 'Deudor';
      debt = PLAN_PRICES[plan]; // deuda de 1 mes (el mes vencido más reciente)
      daysOverdue = Math.floor((today.getTime() - nextExpiryDate.getTime()) / (1000 * 60 * 60 * 24));
    } else if (i % 7 === 0) {
      nextExpiryDate = new Date(today);
      status = 'Vencido';
    } else {
      const daysAhead = (i % 25) + 1;
      nextExpiryDate = new Date(today);
      nextExpiryDate.setDate(today.getDate() + daysAhead);
      status = 'Activo';
    }

    const nextExpiry = nextExpiryDate.toISOString().split('T')[0];
    const lastPaymentDate = new Date(nextExpiryDate);
    lastPaymentDate.setMonth(nextExpiryDate.getMonth() - 1);
    const lastPayment = lastPaymentDate.toISOString().split('T')[0];
    
    const joinDate = '2024-01-15'; 
    
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
      origin: (
        i % 10 <= 2 ? 'Instagram / TikTok'
        : i % 10 <= 5 ? 'Referido por alumno'
        : i % 10 === 6 ? 'Visto al pasar'
        : i % 10 === 7 ? 'Visto al pasar'
        : i % 10 === 8 ? 'Google Maps'
        : 'Otro'
      ),
      initialPlan: '3 veces x semana',
    });
  }
  return members;
};

export const mockMembers = generateMockMembers(60);

// Revenue data for the last 6 months
export const revenueData: RevenueData[] = [
  { month: 'Ago', revenue: 3250000, members: 140, newMembers: 15, churnedMembers: 5, growth: 10 },
  { month: 'Sep', revenue: 3580000, members: 155, newMembers: 20, churnedMembers: 5, growth: 15 },
  { month: 'Oct', revenue: 4120000, members: 168, newMembers: 18, churnedMembers: 5, growth: 13 },
  { month: 'Nov', revenue: 3850000, members: 150, newMembers: 5, churnedMembers: 23, growth: -18 },
  { month: 'Dic', revenue: 4880000, members: 175, newMembers: 30, churnedMembers: 5, growth: 25 },
  { month: 'Ene', revenue: 5200000, members: 204, newMembers: 35, churnedMembers: 6, growth: 29 },
];

export const paymentMethodsData = [
  { method: 'Efectivo', amount: 2800000, count: 95 },
  { method: 'Transferencia', amount: 1400000, count: 32 },
  { method: 'Mercado Pago', amount: 950000, count: 18 },
  { method: 'Cuenta DNI', amount: 650000, count: 14 },
  { method: 'Débito', amount: 250000, count: 6 },
];

// Datos de pagos realistas (Simulando 15 alumnos y 6 meses de historial)
export const recentPayments: Payment[] = [
  // --- FEBRERO 2026 (Mes Actual) ---
  // HOY (13/02)
  { id: 'p501', memberId: '1',  memberName: 'Martín González',      amount: 50000, date: '2026-04-22', method: 'Efectivo',     concept: '3 veces x semana' },
  { id: 'p502', memberId: '2',  memberName: 'Martín Fernández',     amount: 60000, date: '2026-04-22', method: 'Mercado Pago', concept: 'LIBRE' },
  { id: 'p503', memberId: '3',  memberName: 'Lucía Pérez',          amount: 50000, date: '2026-04-22', method: 'Transferencia', concept: 'Funcional' },
  // AYER (12/02)
  { id: 'p504', memberId: '4',  memberName: 'Santiago Rodríguez',   amount: 70000, date: '2026-04-12', method: 'Débito',       concept: 'M+F' },
  { id: 'p505', memberId: '5',  memberName: 'Camila Martínez',      amount: 30000, date: '2026-04-12', method: 'Cuenta DNI',   concept: 'Stretching Global Activo' },
  { id: 'p506', memberId: '6',  memberName: 'Tomás Díaz',           amount: 60000, date: '2026-04-12', method: 'Efectivo',     concept: 'LIBRE' },
  // Otros Febrero
  { id: 'p507', memberId: '7',  memberName: 'Valentina Sánchez',    amount: 50000, date: '2026-04-10', method: 'Transferencia', concept: '3 veces x semana' },
  { id: 'p508', memberId: '8',  memberName: 'Nicolás Romero',       amount: 50000, date: '2026-04-08', method: 'Mercado Pago', concept: 'Funcional' },
  { id: 'p509', memberId: '9',  memberName: 'Florencia Álvarez',    amount: 60000, date: '2026-04-05', method: 'Efectivo',     concept: 'LIBRE' }, 
  { id: 'p510', memberId: '10', memberName: 'Agustín Torres',       amount: 50000, date: '2026-04-05', method: 'Mercado Pago', concept: 'Funcional' }, 
  { id: 'p511', memberId: '11', memberName: 'Carolina Herrera',     amount: 50000, date: '2026-04-03', method: 'Transferencia', concept: 'Funcional' }, 
  { id: 'p512', memberId: '12', memberName: 'Federico Morales',     amount: 70000, date: '2026-04-01', method: 'Débito',       concept: 'M+F' }, 

  // --- ENERO 2026 ---
  { id: 'p401', memberId: '1',  memberName: 'Martín González',      amount: 50000, date: '2026-01-15', method: 'Efectivo',     concept: '3 veces x semana' },
  { id: 'p403', memberId: '3',  memberName: 'Lucía Pérez',          amount: 50000, date: '2026-01-10', method: 'Transferencia', concept: 'Funcional' },
  { id: 'p404', memberId: '4',  memberName: 'Santiago Rodríguez',   amount: 70000, date: '2026-01-12', method: 'Débito',       concept: 'M+F' },
  { id: 'p405', memberId: '5',  memberName: 'Camila Martínez',      amount: 30000, date: '2026-01-12', method: 'Cuenta DNI',   concept: 'Stretching Global Activo' },
  { id: 'p406', memberId: '6',  memberName: 'Tomás Díaz',           amount: 60000, date: '2026-01-12', method: 'Efectivo',     concept: 'LIBRE' },
  { id: 'p408', memberId: '8',  memberName: 'Nicolás Romero',       amount: 50000, date: '2026-01-08', method: 'Mercado Pago', concept: 'Funcional' },
  { id: 'p409', memberId: '9',  memberName: 'Florencia Álvarez',    amount: 60000, date: '2026-01-05', method: 'Efectivo',     concept: 'LIBRE' },
  { id: 'p410', memberId: '10', memberName: 'Agustín Torres',       amount: 50000, date: '2026-01-05', method: 'Mercado Pago', concept: 'Funcional' },
  { id: 'p411', memberId: '11', memberName: 'Carolina Herrera',     amount: 30000, date: '2026-01-03', method: 'Transferencia', concept: 'Stretching Global Activo' },
  { id: 'p412', memberId: '12', memberName: 'Federico Morales',     amount: 70000, date: '2026-01-01', method: 'Débito',       concept: 'M+F' },

  // --- DICIEMBRE 2025 ---
  { id: 'p301', memberId: '1',  memberName: 'Martín González',      amount: 50000, date: '2025-12-15', method: 'Efectivo',     concept: '3 veces x semana' },
  { id: 'p302', memberId: '2',  memberName: 'Martín Fernández',     amount: 60000, date: '2025-12-13', method: 'Mercado Pago', concept: 'LIBRE' },
  { id: 'p303', memberId: '3',  memberName: 'Lucía Pérez',          amount: 50000, date: '2025-12-10', method: 'Transferencia', concept: 'Funcional' },
  { id: 'p304', memberId: '4',  memberName: 'Santiago Rodríguez',   amount: 70000, date: '2025-12-12', method: 'Débito',       concept: 'M+F' },
  { id: 'p305', memberId: '5',  memberName: 'Camila Martínez',      amount: 30000, date: '2025-12-12', method: 'Cuenta DNI',   concept: 'Stretching Global Activo' },
  { id: 'p306', memberId: '6',  memberName: 'Tomás Díaz',           amount: 60000, date: '2025-12-12', method: 'Efectivo',     concept: 'LIBRE' },
  { id: 'p309', memberId: '9',  memberName: 'Florencia Álvarez',    amount: 50000, date: '2025-12-05', method: 'Efectivo',     concept: '3 veces x semana' },
  { id: 'p310', memberId: '10', memberName: 'Agustín Torres',       amount: 50000, date: '2025-12-05', method: 'Efectivo',     concept: 'Funcional' },
  { id: 'p311', memberId: '11', memberName: 'Carolina Herrera',     amount: 30000, date: '2025-12-03', method: 'Transferencia', concept: 'Stretching Global Activo' },
  { id: 'p312', memberId: '12', memberName: 'Federico Morales',     amount: 70000, date: '2025-12-01', method: 'Transferencia', concept: 'M+F' },
  { id: 'p314', memberId: '14', memberName: 'Sofía Castro',         amount: 60000, date: '2025-12-01', method: 'Transferencia', concept: 'LIBRE' }, 

  // --- NOVIEMBRE 2025 ---
  { id: 'p201', memberId: '1',  memberName: 'Martín González',      amount: 50000, date: '2025-11-15', method: 'Efectivo',     concept: '3 veces x semana' },
  { id: 'p203', memberId: '3',  memberName: 'Lucía Pérez',          amount: 50000, date: '2025-11-10', method: 'Transferencia', concept: 'Funcional' },
  { id: 'p204', memberId: '4',  memberName: 'Santiago Rodríguez',   amount: 70000, date: '2025-11-12', method: 'Débito',       concept: 'M+F' },
  { id: 'p205', memberId: '5',  memberName: 'Camila Martínez',      amount: 30000, date: '2025-11-12', method: 'Cuenta DNI',   concept: 'Stretching Global Activo' },
  { id: 'p206', memberId: '6',  memberName: 'Tomás Díaz',           amount: 60000, date: '2025-11-12', method: 'Efectivo',     concept: 'LIBRE' },
  { id: 'p207', memberId: '7',  memberName: 'Valentina Sánchez',    amount: 50000, date: '2025-11-10', method: 'Transferencia', concept: '3 veces x semana' },
  { id: 'p208', memberId: '8',  memberName: 'Nicolás Romero',       amount: 50000, date: '2025-11-08', method: 'Mercado Pago', concept: 'Funcional' },
  { id: 'p209', memberId: '9',  memberName: 'Florencia Álvarez',    amount: 50000, date: '2025-11-05', method: 'Efectivo',     concept: '3 veces x semana' },
  { id: 'p210', memberId: '10', memberName: 'Agustín Torres',       amount: 50000, date: '2025-11-05', method: 'Efectivo',     concept: 'Funcional' },
  { id: 'p211', memberId: '11', memberName: 'Carolina Herrera',     amount: 30000, date: '2025-11-03', method: 'Transferencia', concept: 'Stretching Global Activo' },
  { id: 'p212', memberId: '12', memberName: 'Federico Morales',     amount: 70000, date: '2025-11-01', method: 'Transferencia', concept: 'M+F' },
  { id: 'p213', memberId: '13', memberName: 'María Vargas',         amount: 50000, date: '2025-11-01', method: 'Efectivo',     concept: '3 veces x semana' }, 
  { id: 'p214', memberId: '14', memberName: 'Sofía Castro',         amount: 60000, date: '2025-11-01', method: 'Transferencia', concept: 'LIBRE' }, 

  // --- OCTUBRE 2025 ---
  { id: 'p101', memberId: '1',  memberName: 'Martín González',      amount: 50000, date: '2025-10-15', method: 'Efectivo',     concept: '3 veces x semana' },
  { id: 'p102', memberId: '2',  memberName: 'Martín Fernández',     amount: 60000, date: '2025-10-13', method: 'Mercado Pago', concept: 'LIBRE' },
  { id: 'p103', memberId: '3',  memberName: 'Lucía Pérez',          amount: 50000, date: '2025-10-10', method: 'Transferencia', concept: 'Funcional' },
  { id: 'p104', memberId: '4',  memberName: 'Santiago Rodríguez',   amount: 70000, date: '2025-10-12', method: 'Débito',       concept: 'M+F' },
  { id: 'p105', memberId: '5',  memberName: 'Camila Martínez',      amount: 30000, date: '2025-10-12', method: 'Cuenta DNI',   concept: 'Stretching Global Activo' },
  { id: 'p106', memberId: '6',  memberName: 'Tomás Díaz',           amount: 60000, date: '2025-10-12', method: 'Efectivo',     concept: 'LIBRE' },
  { id: 'p107', memberId: '7',  memberName: 'Valentina Sánchez',    amount: 50000, date: '2025-10-10', method: 'Transferencia', concept: '3 veces x semana' },
  { id: 'p109', memberId: '9',  memberName: 'Florencia Álvarez',    amount: 50000, date: '2025-10-05', method: 'Efectivo',     concept: '3 veces x semana' },
  { id: 'p110', memberId: '10', memberName: 'Agustín Torres',       amount: 50000, date: '2025-10-05', method: 'Efectivo',     concept: 'Funcional' },
  { id: 'p111', memberId: '11', memberName: 'Carolina Herrera',     amount: 30000, date: '2025-10-03', method: 'Transferencia', concept: 'Stretching Global Activo' },
  { id: 'p112', memberId: '12', memberName: 'Federico Morales',     amount: 70000, date: '2025-10-01', method: 'Transferencia', concept: 'M+F' },
  { id: 'p113', memberId: '13', memberName: 'María Vargas',         amount: 50000, date: '2025-10-01', method: 'Efectivo',     concept: '3 veces x semana' }, 
  { id: 'p114', memberId: '14', memberName: 'Sofía Castro',         amount: 60000, date: '2025-10-01', method: 'Transferencia', concept: 'LIBRE' }, 
  { id: 'p115', memberId: '15', memberName: 'Ezequiel Ruiz',        amount: 30000, date: '2025-10-01', method: 'Efectivo',     concept: 'Stretching Global Activo' }, 
];

export const mockExpenses: Expense[] = [
  { id: 'e1', concept: 'Alquiler del Local (Febrero)', amount: 450000, date: '2026-04-05', category: 'Alquiler', method: 'Transferencia' },
  { id: 'e2', concept: 'Factura Luz', amount: 85000, date: '2026-04-10', category: 'Servicios', method: 'Transferencia' },
  { id: 'e3', concept: 'Kit de Limpieza Profunda', amount: 35000, date: '2026-04-12', category: 'Limpieza', method: 'Efectivo' },
  { id: 'e4', concept: 'Service de Cintas (Técnico)', amount: 60000, date: '2026-04-02', category: 'Mantenimiento / Reparaciones', method: 'Mercado Pago' },
  { id: 'e5', concept: 'Reparación Polea Cable Cross', amount: 45000, date: '2026-04-11', category: 'Mantenimiento / Reparaciones', method: 'Efectivo' },
  { id: 'e6', concept: 'Papelería y Librería', amount: 15000, date: '2026-04-01', category: 'Varios', method: 'Efectivo' },
];

export const todayExpiringMembers: Member[] = mockMembers.filter(m => m.status === 'Vencido');

export const getUpcomingExpiries = (days: number = 3): Member[] => {
  const today = new Date('2026-04-22');
  const limitDate = new Date(today);
  limitDate.setDate(today.getDate() + days);
  
  return mockMembers.filter(m => {
    if (m.status !== 'Activo') return false;
    const expiryDate = new Date(m.nextExpiry);
    // Vencimiento posterior a hoy pero dentro del límite de días
    return expiryDate > today && expiryDate <= limitDate;
  }).sort((a, b) => new Date(a.nextExpiry).getTime() - new Date(b.nextExpiry).getTime());
};

export function formatCurrency(amount: number): string {
  return '$ ' + amount.toLocaleString('es-AR');
}

export function formatDate(dateStr: string): string {
  if (!dateStr) return '';
  // Formato de entrada esperado: YYYY-MM-DD
  const [y, m, d] = dateStr.split('-');
  if (!y || !m || !d) return dateStr;
  return `${d}/${m}/${y}`;
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
  const now = new Date('2026-04-22'); 
  const diffTime = Math.max(0, targetDate.getTime() - now.getTime());
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  if (diffDays === 0) return 'Mañana';
  if (diffDays === 1) return 'En 1 día';
  return `En ${diffDays} días`;
}

export function getOverdueMembers(): Member[] {
  return mockMembers.filter(m => m.status === 'Deudor').sort((a, b) => a.daysOverdue - b.daysOverdue);
}

export function getPaymentStats() {
  const totalRevenue = recentPayments.reduce((acc, p) => acc + p.amount, 0);
  const monthlyRevenue = recentPayments
    .filter(p => p.date.startsWith('2026-04'))
    .reduce((acc, p) => acc + p.amount, 0);
  
  return {
    totalRevenue,
    monthlyRevenue,
    monthlyCount: recentPayments.filter(p => p.date.startsWith('2026-04')).length,
  };
}

export function getDashboardStats() {
  const activeMembers = mockMembers.filter(m => m.status === 'Activo').length;
  const debtors = mockMembers.filter(m => m.status === 'Deudor');
  const totalDebt = debtors.reduce((acc, m) => acc + m.debt, 0);
  
  const retentionRate = (activeMembers + debtors.length) > 0
    ? Math.round((activeMembers / (activeMembers + debtors.length)) * 100)
    : 0;
  
  const planPrices = Object.values(PLAN_PRICES);
  const avgPerMember = Math.round(planPrices.reduce((a, b) => a + b, 0) / planPrices.length);

  const currentMonthStr = new Date().toISOString().slice(0, 7);
  const monthlyRevenue = recentPayments
    .filter(p => !p.voided && p.date.startsWith(currentMonthStr))
    .reduce((acc, p) => acc + p.amount, 0);

  return {
    monthlyRevenue,
    totalMembers: mockMembers.length,
    activeMembers,
    paidMembers: recentPayments.filter(p => !p.voided).length,
    totalDebt,
    retentionRate,
    avgPerMember,
    newMembersThisMonth: 0,
    growthPercentage: 0,
    todayExpiries: todayExpiringMembers.length,
    upcomingExpiries: getUpcomingExpiries().length,
    debtors: debtors.sort((a, b) => b.daysOverdue - a.daysOverdue),
  };
}
