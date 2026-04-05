'use client';

import { useState, useMemo } from 'react';
import { AlertTriangle, CalendarClock, Clock, CheckCircle, CircleDollarSign } from 'lucide-react';
import { FaWhatsapp } from 'react-icons/fa';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import type { Member } from '@/lib/mock-data';
import { formatCurrency, formatDate, formatRelativeDate, PLAN_PRICES, getUpcomingExpiries } from '@/lib/mock-data';
import { PaymentModal } from '@/components/dashboard/payment-modal';

interface CollectionManagementWidgetProps {
  overdueMembers: Member[];
  todayExpiries: Member[];
  upcomingExpiries: Member[];
}

export function CollectionManagementWidget({
  overdueMembers,
  todayExpiries,
  upcomingExpiries: initialUpcomingExpiries,
}: CollectionManagementWidgetProps) {
  const [contactCounts, setContactCounts] = useState<Record<string, number>>({});
  const [upcomingDaysFilter, setUpcomingDaysFilter] = useState<string>('3');
  const [activeTab, setActiveTab] = useState<string>('overdue');
  const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false);
  const [paymentMember, setPaymentMember] = useState<Member | null>(null);

  const upcomingExpiriesFiltered = useMemo(() => {
    return getUpcomingExpiries(parseInt(upcomingDaysFilter));
  }, [upcomingDaysFilter]);
  const handleWhatsApp = (member: Member, type: 'overdue' | 'today' | 'upcoming') => {
    const gymName = process.env.NEXT_PUBLIC_GYM_NAME || 'el gimnasio';
    let message = '';

    if (type === 'overdue') {
      message = encodeURIComponent(`Hola ${member.name.split(' ')[0]}, te escribimos desde ${gymName}. Notamos que tenés un saldo pendiente de ${formatCurrency(member.debt)}. ¿Podemos ayudarte a regularizar tu situación?`);
    } else if (type === 'today') {
      const planPrice = PLAN_PRICES[member.plan];
      message = encodeURIComponent(`Hola ${member.name.split(' ')[0]}! Te escribimos desde ${gymName}. Tu membresía de ${member.plan} vence hoy. El valor para renovar es ${formatCurrency(planPrice)}. ¿Te gustaría renovar?`);
    } else {
      const planPrice = PLAN_PRICES[member.plan];
      message = encodeURIComponent(`Hola ${member.name.split(' ')[0]}! Te contamos desde ${gymName} que tu membresía vence pronto (${formatDate(member.nextExpiry)}). Podés renovarla por ${formatCurrency(planPrice)}. ¡Te esperamos!`);
    }

    setContactCounts(prev => ({
      ...prev,
      [member.id]: (prev[member.id] || 0) + 1
    }));

    const phone = member.phone.replace(/\D/g, '');
    window.open(`https://wa.me/${phone}?text=${message}`, '_blank');
  };

  const renderTable = (members: Member[], type: 'overdue' | 'today' | 'upcoming') => {
    if (members.length === 0) {
      return (
        <div className="py-12 text-center text-muted-foreground bg-muted/10 rounded-lg border border-dashed border-border mt-4">
          <CheckCircle className="mx-auto h-10 w-10 mb-3 opacity-30 text-emerald-500" />
          <p className="text-sm font-medium">¡Todo al día en esta categoría!</p>
        </div>
      );
    }

    return (
      <div className="rounded-lg border border-border overflow-hidden mt-4 bg-background shadow-xs">
        <Table>
          <TableHeader>
            <TableRow className="bg-muted/20 hover:bg-muted/20">
              <TableHead className="font-bold text-foreground">Alumno</TableHead>
              <TableHead className="font-bold text-foreground hidden sm:table-cell text-left w-[150px]">Plan</TableHead>
              {type !== 'today' && (
                <TableHead className="font-bold text-foreground w-[130px] text-left">Vencimiento</TableHead>
              )}
              {type === 'overdue' ? (
                <TableHead className="font-bold text-foreground w-[120px] text-left">Deuda</TableHead>
              ) : (
                <TableHead className="font-bold text-foreground w-[120px] text-left">A Pagar</TableHead>
              )}
              <TableHead className="font-bold text-foreground w-[230px] text-center">Acciones</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {members.map((member) => (
              <TableRow key={member.id} className="hover:bg-muted/30 border-border/50">
                <TableCell className="py-3">
                  <div className="flex items-center gap-3">
                    <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-xs font-bold bg-muted text-muted-foreground">
                      {member.name.split(' ').map(n => n[0]).join('')}
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-foreground">{member.name}</p>
                    </div>
                  </div>
                </TableCell>
                <TableCell className="hidden sm:table-cell text-left">
                  <span className="text-sm text-muted-foreground font-medium">
                    {member.plan}
                  </span>
                </TableCell>
                {type !== 'today' && (
                  <TableCell className="text-left">
                    <span className="text-sm font-medium text-muted-foreground">
                      {formatRelativeDate(member.nextExpiry, type, member.daysOverdue)}
                    </span>
                  </TableCell>
                )}
                {type === 'overdue' ? (
                  <TableCell className="text-left">
                    <span className="font-semibold text-red-600">
                      {formatCurrency(member.debt)}
                    </span>
                  </TableCell>
                ) : (
                  <TableCell className="text-left">
                    <span className="font-semibold text-foreground">
                      {formatCurrency(PLAN_PRICES[member.plan])}
                    </span>
                  </TableCell>
                )}
                <TableCell className="w-[230px]">
                  <div className="flex items-center justify-center gap-2">
                    {/* Cobrar: izquierda — neutral oscuro para jerarquía profesional */}
                    <button
                      className="h-8 flex items-center gap-1.5 px-3 rounded-lg bg-slate-800 text-white hover:bg-slate-700 transition-colors shadow-sm text-sm font-semibold cursor-pointer"
                      onClick={() => { setPaymentMember(member); setIsPaymentModalOpen(true); }}
                    >
                      <CircleDollarSign className="h-3.5 w-3.5" />
                      Cobrar
                    </button>
                    {/* WhatsApp: derecha — verde oficial sólido */}
                    <div className="relative">
                      <button
                        className="h-8 flex items-center gap-1.5 px-3 rounded-lg bg-[#25D366] text-white hover:bg-[#20bc5a] transition-colors shadow-sm text-sm font-semibold cursor-pointer"
                        onClick={() => handleWhatsApp(member, type)}
                        title="Contactar por WhatsApp"
                      >
                        <FaWhatsapp className="h-4 w-4" />
                        <span className="hidden sm:inline">WhatsApp</span>
                      </button>
                      {contactCounts[member.id] && (
                        <Badge className="absolute -top-1.5 -right-1.5 h-4 w-4 p-0 text-[10px] bg-white text-[#25D366] font-bold flex items-center justify-center border border-[#25D366] rounded-full shadow-sm pointer-events-none">
                          {contactCounts[member.id]}
                        </Badge>
                      )}
                    </div>
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    );
  };

  return (
    <Card className="border-border shadow-sm w-full">
      <CardContent className="p-0 sm:p-5">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <div className="p-4 sm:p-0 border-b border-border sm:border-0 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <TabsList className="w-full sm:w-auto flex flex-col sm:flex-row h-auto gap-2 bg-transparent p-0">
              {/* Overdue Tab - Rose (Alerta) */}
              <TabsTrigger
                value="overdue"
                className="group w-full sm:w-auto data-[state=active]:bg-red-50 data-[state=active]:text-red-700 data-[state=active]:border-red-200 data-[state=active]:shadow-sm justify-start sm:justify-center border border-transparent px-4 py-2.5 rounded-lg transition-all font-medium text-muted-foreground cursor-pointer hover:bg-muted/50"
              >
                <AlertTriangle className="w-4 h-4 mr-2" />
                Pagos Vencidos
                <Badge variant="secondary" className="ml-2 h-5 px-1.5 min-w-[20px] flex items-center justify-center font-bold border-0 bg-muted-foreground/15 text-muted-foreground group-data-[state=active]:bg-red-600 group-data-[state=active]:text-white">
                  {overdueMembers.length}
                </Badge>
              </TabsTrigger>

              {/* Today Tab - Teal */}
              <TabsTrigger
                value="today"
                className="group w-full sm:w-auto data-[state=active]:bg-teal-50 data-[state=active]:text-teal-800 data-[state=active]:border-teal-200 data-[state=active]:shadow-sm justify-start sm:justify-center border border-transparent px-4 py-2.5 rounded-lg transition-all font-medium text-muted-foreground cursor-pointer hover:bg-muted/50"
              >
                <CalendarClock className="w-4 h-4 mr-2" />
                Vencen Hoy
                <Badge variant="secondary" className="ml-2 h-5 px-1.5 min-w-[20px] flex items-center justify-center font-bold border-0 bg-muted-foreground/15 text-muted-foreground group-data-[state=active]:bg-teal-600 group-data-[state=active]:text-white">
                  {todayExpiries.length}
                </Badge>
              </TabsTrigger>

              {/* Upcoming Tab - Teal */}
              <TabsTrigger
                value="upcoming"
                className="group w-full sm:w-auto data-[state=active]:bg-teal-50 data-[state=active]:text-teal-800 data-[state=active]:border-teal-200 data-[state=active]:shadow-sm justify-start sm:justify-center border border-transparent px-4 py-2.5 rounded-lg transition-all font-medium text-muted-foreground cursor-pointer hover:bg-muted/50"
              >
                <Clock className="w-4 h-4 mr-2" />
                Próximos
                <span className="hidden sm:inline ml-1">Vencimientos</span>
                <Badge variant="secondary" className="ml-2 h-5 px-1.5 min-w-[20px] flex items-center justify-center font-bold border-0 bg-muted-foreground/15 text-muted-foreground group-data-[state=active]:bg-teal-600 group-data-[state=active]:text-white">
                  {upcomingExpiriesFiltered.length}
                </Badge>
              </TabsTrigger>
            </TabsList>

            {/* Filter Dropdown for Upcoming */}
            {activeTab === 'upcoming' && (
              <div className="hidden sm:flex ml-auto items-center">
                <Select value={upcomingDaysFilter} onValueChange={setUpcomingDaysFilter}>
                  <SelectTrigger className="w-[185px] h-[44px] px-4 text-sm font-medium rounded-lg bg-background border-border shadow-sm hover:bg-muted/50 transition-colors">
                    <SelectValue placeholder="Periodo" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="3">Próximos 3 días</SelectItem>
                    <SelectItem value="7">Próximos 7 días</SelectItem>
                    <SelectItem value="15">Próximos 15 días</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            )}

            {/* Mobile Filter */}
            {activeTab === 'upcoming' && (
              <div className="sm:hidden mt-3 px-4 w-full">
                <Select value={upcomingDaysFilter} onValueChange={setUpcomingDaysFilter}>
                  <SelectTrigger className="w-full h-[44px] px-4 text-sm font-medium rounded-lg bg-background border-border shadow-sm">
                    <SelectValue placeholder="Periodo" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="3">Próximos 3 días</SelectItem>
                    <SelectItem value="7">Próximos 7 días</SelectItem>
                    <SelectItem value="15">Próximos 15 días</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            )}
          </div>

          <div className="px-4 pb-4 sm:p-0">
            <TabsContent value="overdue" className="m-0 focus-visible:outline-none focus-visible:ring-0">
              {renderTable(overdueMembers, 'overdue')}
            </TabsContent>
            <TabsContent value="today" className="m-0 focus-visible:outline-none focus-visible:ring-0">
              {renderTable(todayExpiries, 'today')}
            </TabsContent>
            <TabsContent value="upcoming" className="m-0 focus-visible:outline-none focus-visible:ring-0">
              {renderTable(upcomingExpiriesFiltered, 'upcoming')}
            </TabsContent>
          </div>
        </Tabs>
      </CardContent>
      <PaymentModal
        open={isPaymentModalOpen}
        onOpenChange={setIsPaymentModalOpen}
        member={paymentMember}
      />
    </Card>
  );
}
