'use client';

import { useState } from 'react';
import {
  Plus, Trash2, SquarePen, Check, X, CreditCard,
  Users, ShieldCheck, History,
  Eye, Lock, Clock
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Switch } from '@/components/ui/switch';
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';
import { formatCurrency } from '@/lib/mock-data';

// ─── Types ────────────────────────────────────────────────────────────────────

interface Plan {
  id: string;
  name: string;
  price: number;
}

interface TeamUser {
  id: string;
  name: string;
  role: 'Administrador' | 'Profesor';
  email: string;
  initials: string;
  permissions: {
    viewFinances: boolean;
    viewStats: boolean;
    viewExpenses: boolean;
    deleteMembers: boolean;
  };
}

interface AuditEntry {
  id: string;
  user: string;
  action: string;
  target: string;
  timestamp: string;
  type: 'delete' | 'edit' | 'create';
}

// ─── Mock inicial de planes ───────────────────────────────────────────────────

const INITIAL_PLANS: Plan[] = [
  { id: 'p1', name: 'Libre', price: 60000 },
  { id: 'p2', name: '3 veces por semana', price: 50000 },
  { id: 'p3', name: 'Funcional', price: 50000 },
  { id: 'p4', name: 'Sala Musculación + Funcional', price: 70000 },
];

const INITIAL_USERS: TeamUser[] = [
  {
    id: 'u1',
    name: 'Admin Principal',
    role: 'Administrador',
    email: 'admin@naxion.com.ar',
    initials: 'AD',
    permissions: { viewFinances: true, viewStats: true, viewExpenses: true, deleteMembers: true },
  },
  {
    id: 'u2',
    name: 'Nicolás Herrera',
    role: 'Profesor',
    email: 'nicolas@naxion.com.ar',
    initials: 'NH',
    permissions: { viewFinances: false, viewStats: false, viewExpenses: false, deleteMembers: true },
  },
  {
    id: 'u3',
    name: 'Valentina Torres',
    role: 'Profesor',
    email: 'valentina@naxion.com.ar',
    initials: 'VT',
    permissions: { viewFinances: false, viewStats: false, viewExpenses: false, deleteMembers: false },
  },
];

const AUDIT_LOG: AuditEntry[] = [
  { id: 'a1', user: 'Nicolás Herrera',   action: 'eliminó al miembro',  target: 'Juan Pérez',          timestamp: '14/04/2026 – 10:32', type: 'delete' },
  { id: 'a2', user: 'Admin Principal',   action: 'editó el plan de',    target: 'Camila López',         timestamp: '14/04/2026 – 09:15', type: 'edit'   },
  { id: 'a3', user: 'Valentina Torres',  action: 'registró el cobro de',target: 'Martín González',      timestamp: '13/04/2026 – 18:47', type: 'create' },
  { id: 'a4', user: 'Nicolás Herrera',   action: 'editó el vencimiento de', target: 'Sofía Díaz',      timestamp: '13/04/2026 – 16:02', type: 'edit'   },
  { id: 'a5', user: 'Admin Principal',   action: 'eliminó el pago de',  target: 'Federico Romero',      timestamp: '12/04/2026 – 11:20', type: 'delete' },
  { id: 'a6', user: 'Valentina Torres',  action: 'creó el miembro',     target: 'Bautista Sosa',        timestamp: '11/04/2026 – 09:05', type: 'create' },
];

// ─── Helpers ─────────────────────────────────────────────────────────────────

const auditBadge = (type: AuditEntry['type']) => {
  if (type === 'delete') return <Badge className="text-[10px] px-1.5 py-0.5 bg-red-50 text-red-700 border border-red-200 font-semibold">Eliminación</Badge>;
  if (type === 'edit')   return <Badge className="text-[10px] px-1.5 py-0.5 bg-amber-50 text-amber-700 border border-amber-200 font-semibold">Edición</Badge>;
  return                        <Badge className="text-[10px] px-1.5 py-0.5 bg-emerald-50 text-emerald-700 border border-emerald-200 font-semibold">Alta</Badge>;
};

const formatPriceInput = (val: string) => {
  // Solo permitimos números y una coma
  const clean = val.replace(/[^\d,]/g, '');
  const parts = clean.split(',');
  
  // Formateamos la parte entera con puntos
  parts[0] = parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, ".");
  
  // Retornamos unido por la coma (máximo una)
  return parts.length > 1 ? `${parts[0]},${parts[1].slice(0, 2)}` : parts[0];
};

// ─── Main Component ───────────────────────────────────────────────────────────

export function SettingsView() {
  // Tarifario state
  const [plans, setPlans] = useState<Plan[]>(INITIAL_PLANS);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editName, setEditName] = useState('');
  const [editPrice, setEditPrice] = useState('');
  const [newName, setNewName] = useState('');
  const [newPrice, setNewPrice] = useState('');
  const [addingPlan, setAddingPlan] = useState(false);

  // Users state
  const [users, setUsers] = useState<TeamUser[]>(INITIAL_USERS);

  const startEdit = (plan: Plan) => {
    setEditingId(plan.id);
    setEditName(plan.name);
    setEditPrice(formatPriceInput(String(plan.price)));
  };

  const saveEdit = (id: string) => {
    const cleanValue = editPrice.replace(/\./g, '').replace(',', '.');
    const numericPrice = Number(cleanValue);
    setPlans(plans.map(p => p.id === id ? { ...p, name: editName, price: numericPrice } : p));
    setEditingId(null);
  };

  const deletePlan = (id: string) => setPlans(plans.filter(p => p.id !== id));

  const addPlan = () => {
    if (!newName.trim() || !newPrice) return;
    const cleanValue = newPrice.replace(/\./g, '').replace(',', '.');
    const numericPrice = Number(cleanValue);
    setPlans([...plans, { id: `p${Date.now()}`, name: newName.trim(), price: numericPrice }]);
    setNewName('');
    setNewPrice('');
    setAddingPlan(false);
  };

  const togglePermission = (userId: string, perm: keyof TeamUser['permissions']) => {
    setUsers(users.map(u =>
      u.id === userId ? { ...u, permissions: { ...u.permissions, [perm]: !u.permissions[perm] } } : u
    ));
  };

  return (
    <div className="space-y-6">


      {/* ── 2. Tarifario ─────────────────────────────────────────────────── */}
      <Card className="border-border bg-card shadow-sm">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="rounded-lg bg-secondary/10 p-2">
                <CreditCard className="h-5 w-5 text-secondary" />
              </div>
              <div>
                <CardTitle className="text-base text-card-foreground">Tarifario</CardTitle>
                <CardDescription>Planes de membresía y precios mensuales</CardDescription>
              </div>
            </div>
            <Button
              className="gap-2 bg-primary text-primary-foreground hover:bg-primary/90 cursor-pointer"
              onClick={() => { setAddingPlan(true); setEditingId(null); }}
            >
              <Plus className="h-4 w-4" /> Nuevo Plan
            </Button>
          </div>
        </CardHeader>
        <CardContent className="space-y-2">

          {/* Fila de nuevo plan */}
          {addingPlan && (
            <div className="flex items-center gap-3 p-3 rounded-lg border border-teal-200 bg-teal-50/50 mb-2">
              <Input
                placeholder="Ej: Pase Libre"
                value={newName}
                onChange={e => setNewName(e.target.value)}
                className="flex-1 h-10 text-sm bg-white border border-stone-200 focus-visible:ring-2 focus-visible:ring-teal-500/20 focus-visible:border-teal-500 transition-all"
              />
              <Input
                placeholder="$ 0,00"
                type="text"
                inputMode="decimal"
                value={newPrice}
                onChange={e => setNewPrice(formatPriceInput(e.target.value))}
                className="w-32 h-10 text-sm bg-white border border-stone-200 focus-visible:ring-2 focus-visible:ring-teal-500/20 focus-visible:border-teal-500 transition-all font-medium"
              />
              <div className="flex items-center gap-1">
                <div className="relative group/tooltip">
                  <button onClick={addPlan} className="p-1.5 rounded-md bg-teal-600 hover:bg-teal-700 text-white transition-all cursor-pointer">
                    <Check className="h-4 w-4" />
                  </button>
                  <span className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-2 py-1 bg-slate-900 text-white text-[10px] font-medium rounded opacity-0 group-hover/tooltip:opacity-100 pointer-events-none transition-opacity whitespace-nowrap z-30 shadow-sm">
                    Confirmar
                    <span className="absolute top-full left-1/2 -translate-x-1/2 border-4 border-transparent border-t-slate-900" />
                  </span>
                </div>
                <div className="relative group/tooltip">
                  <button onClick={() => setAddingPlan(false)} className="p-1.5 rounded-md hover:bg-slate-100 text-slate-500 transition-all cursor-pointer">
                    <X className="h-4 w-4" />
                  </button>
                  <span className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-2 py-1 bg-slate-900 text-white text-[10px] font-medium rounded opacity-0 group-hover/tooltip:opacity-100 pointer-events-none transition-opacity whitespace-nowrap z-30 shadow-sm">
                    Cancelar
                    <span className="absolute top-full left-1/2 -translate-x-1/2 border-4 border-transparent border-t-slate-900" />
                  </span>
                </div>
              </div>
            </div>
          )}

          <div className="divide-y divide-border rounded-lg border border-border overflow-visible">
            {plans.map((plan, index) => (
              <div key={plan.id} className="flex items-center gap-4 px-4 py-3.5 bg-white hover:bg-slate-50 transition-colors first:rounded-t-lg last:rounded-b-lg">
                {editingId === plan.id ? (
                  <>
                    <Input
                      value={editName}
                      onChange={e => setEditName(e.target.value)}
                      className="flex-1 h-9 text-sm bg-white border border-stone-200 focus-visible:ring-2 focus-visible:ring-teal-500/20 focus-visible:border-teal-500 transition-all"
                    />
                    <Input
                      value={editPrice}
                      type="text"
                      inputMode="decimal"
                      onChange={e => setEditPrice(formatPriceInput(e.target.value))}
                      className="w-32 h-9 text-sm bg-white border border-stone-200 focus-visible:ring-2 focus-visible:ring-teal-500/20 focus-visible:border-teal-500 transition-all font-medium"
                    />
                    <div className="flex items-center gap-1">
                      <div className="relative group/tooltip">
                        <button onClick={() => saveEdit(plan.id)} className="p-1.5 rounded-md bg-teal-600 hover:bg-teal-700 text-white transition-all cursor-pointer">
                          <Check className="h-4 w-4" />
                        </button>
                        <span className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-2 py-1 bg-slate-900 text-white text-[10px] font-medium rounded opacity-0 group-hover/tooltip:opacity-100 pointer-events-none transition-opacity whitespace-nowrap z-30 shadow-sm">
                          Guardar Cambios
                          <span className="absolute top-full left-1/2 -translate-x-1/2 border-4 border-transparent border-t-slate-900" />
                        </span>
                      </div>
                      <div className="relative group/tooltip">
                        <button onClick={() => setEditingId(null)} className="p-1.5 rounded-md hover:bg-slate-100 text-slate-500 transition-all cursor-pointer">
                          <X className="h-4 w-4" />
                        </button>
                        <span className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-2 py-1 bg-slate-900 text-white text-[10px] font-medium rounded opacity-0 group-hover/tooltip:opacity-100 pointer-events-none transition-opacity whitespace-nowrap z-30 shadow-sm">
                          Descartar
                          <span className="absolute top-full left-1/2 -translate-x-1/2 border-4 border-transparent border-t-slate-900" />
                        </span>
                      </div>
                    </div>
                  </>
                ) : (
                  <>
                    {/* Nombre del plan */}
                    <span className="flex-1 text-sm font-medium text-slate-900">{plan.name}</span>

                    {/* Precio equilibrado */}
                    <div className="flex items-center gap-1">
                      <span className="text-sm text-slate-400 font-normal">$</span>
                      <span className="text-lg font-bold text-primary tabular-nums">
                        {plan.price.toLocaleString('es-AR', { minimumFractionDigits: 0, maximumFractionDigits: 2 })}
                      </span>
                      <span className="text-xs text-slate-500 font-normal ml-0.5">/ mes</span>
                    </div>

                    {/* Acciones con tooltip idéntico a members-table */}
                    <div className="flex items-center gap-0.5 ml-1">
                      {/* Editar */}
                      <div className="relative group/tooltip">
                        <button
                          onClick={() => startEdit(plan)}
                          className="text-slate-400 hover:text-slate-800 hover:bg-slate-100 p-2 rounded-md transition-all cursor-pointer"
                        >
                          <SquarePen className="h-4 w-4" />
                        </button>
                        <span className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-2 py-1 bg-slate-900 text-white text-[10px] font-medium rounded opacity-0 group-hover/tooltip:opacity-100 pointer-events-none transition-opacity whitespace-nowrap z-30 shadow-sm">
                          Editar Plan
                          <span className="absolute top-full left-1/2 -translate-x-1/2 border-4 border-transparent border-t-slate-900" />
                        </span>
                      </div>

                      {/* Eliminar */}
                      <div className="relative group/tooltip">
                        <button
                          onClick={() => deletePlan(plan.id)}
                          className="text-slate-400 hover:text-rose-600 hover:bg-rose-50 p-2 rounded-md transition-all cursor-pointer"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                        <span className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-2 py-1 bg-slate-900 text-white text-[10px] font-medium rounded opacity-0 group-hover/tooltip:opacity-100 pointer-events-none transition-opacity whitespace-nowrap z-30 shadow-sm">
                          Eliminar Plan
                          <span className="absolute top-full left-1/2 -translate-x-1/2 border-4 border-transparent border-t-slate-900" />
                        </span>
                      </div>
                    </div>
                  </>
                )}
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* ── 3. Usuarios y Permisos ────────────────────────────────────────── */}
      <Card className="border-border bg-card shadow-sm">
        <CardHeader>
          <div className="flex items-center gap-3">
            <div className="rounded-lg bg-emerald-50 p-2">
              <Users className="h-5 w-5 text-emerald-600" />
            </div>
            <div>
              <CardTitle className="text-base text-card-foreground">Usuarios y Permisos</CardTitle>
              <CardDescription>Controlá qué puede ver y hacer cada miembro del equipo</CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-6">
          {users.map((user, idx) => (
            <div key={user.id}>
              {idx > 0 && <Separator className="mb-6 bg-border" />}
              <div className="flex items-start gap-4">
                {/* Avatar */}
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-muted text-xs font-bold text-muted-foreground">
                  {user.initials}
                </div>
                <div className="flex-1 space-y-4">
                  {/* Header del usuario */}
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-semibold text-slate-800">{user.name}</p>
                      <p className="text-xs text-muted-foreground">{user.email}</p>
                    </div>
                    <Badge
                      className={
                        user.role === 'Administrador'
                          ? 'bg-secondary/10 text-secondary border border-secondary/20 text-xs font-semibold'
                          : 'bg-teal-50 text-teal-700 border border-teal-200 text-xs font-semibold'
                      }
                    >
                      {user.role === 'Administrador' ? (
                        <><ShieldCheck className="h-3 w-3 mr-1" /> {user.role}</>
                      ) : user.role}
                    </Badge>
                  </div>

                  {/* Permisos — solo para profesores */}
                  {user.role === 'Profesor' && (
                    <div className="rounded-lg border border-border bg-slate-50 divide-y divide-border overflow-hidden">
                      {[
                        { key: 'viewFinances' as const, label: 'Ver Ingresos y Balance', icon: <Eye className="h-3.5 w-3.5" />, sensitive: true },
                        { key: 'viewStats'    as const, label: 'Ver Estadísticas',        icon: <Eye className="h-3.5 w-3.5" />, sensitive: true },
                        { key: 'viewExpenses' as const, label: 'Ver Gastos',              icon: <Eye className="h-3.5 w-3.5" />, sensitive: true },
                        { key: 'deleteMembers'as const, label: 'Eliminar Alumnos',        icon: <Trash2 className="h-3.5 w-3.5" />, sensitive: false },
                      ].map(perm => (
                        <div key={perm.key} className="flex items-center justify-between px-4 py-2.5 bg-white">
                          <div className="flex items-center gap-2">
                            <span className={perm.sensitive ? 'text-amber-500' : 'text-slate-400'}>{perm.icon}</span>
                            <span className="text-sm text-slate-700">{perm.label}</span>
                            {perm.sensitive && (
                              <span className="flex items-center gap-0.5 text-[10px] text-amber-600 font-semibold">
                                <Lock className="h-2.5 w-2.5" /> Financiero
                              </span>
                            )}
                          </div>
                          <Switch
                            checked={user.permissions[perm.key]}
                            onCheckedChange={() => togglePermission(user.id, perm.key)}
                          />
                        </div>
                      ))}
                    </div>
                  )}

                  {/* Admin = acceso total, no editable */}
                  {user.role === 'Administrador' && (
                    <p className="text-xs text-muted-foreground flex items-center gap-1.5 pl-0.5">
                      <ShieldCheck className="h-3.5 w-3.5 text-secondary" />
                      Acceso total a todas las secciones — no editable
                    </p>
                  )}
                </div>
              </div>
            </div>
          ))}
        </CardContent>
      </Card>

      {/* ── 4. Historial de Auditoría ─────────────────────────────────────── */}
      <Card className="border-border bg-card shadow-sm">
        <CardHeader>
          <div className="flex items-center gap-3">
            <div className="rounded-lg bg-slate-100 p-2">
              <History className="h-5 w-5 text-slate-600" />
            </div>
            <div>
              <CardTitle className="text-base text-card-foreground">Historial de Auditoría</CardTitle>
              <CardDescription>Registro inmutable de acciones realizadas por cada usuario</CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent className="px-0 pb-0">
          <div className="divide-y divide-border">
            {AUDIT_LOG.map(entry => (
              <div key={entry.id} className="flex items-start gap-4 px-6 py-3.5 hover:bg-slate-50 transition-colors">
                <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-muted text-[10px] font-bold text-muted-foreground mt-0.5">
                  {entry.user.split(' ').map(n => n[0]).join('').slice(0, 2)}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm text-slate-700">
                    <span className="font-semibold text-slate-900">{entry.user}</span>
                    {' '}{entry.action}{' '}
                    <span className="font-semibold text-slate-900">{entry.target}</span>
                  </p>
                  <div className="flex items-center gap-1.5 mt-0.5">
                    <Clock className="h-3 w-3 text-muted-foreground" />
                    <span className="text-xs text-muted-foreground">{entry.timestamp}</span>
                  </div>
                </div>
                <div className="shrink-0">{auditBadge(entry.type)}</div>
              </div>
            ))}
          </div>
          <div className="px-6 py-3 border-t border-border bg-slate-50 rounded-b-xl">
            <p className="text-xs text-muted-foreground text-center">
              Mostrando los últimos {AUDIT_LOG.length} eventos · Este registro no puede ser modificado
            </p>
          </div>
        </CardContent>
      </Card>

    </div>
  );
}
