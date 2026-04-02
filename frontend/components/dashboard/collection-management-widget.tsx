'use client';

import { useState, useMemo } from 'react';
import { MessageCircle, AlertTriangle, CalendarClock, Clock, CheckCircle } from 'lucide-react';
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
import { formatCurrency, formatDate, PLAN_PRICES, getUpcomingExpiries } from '@/lib/mock-data';

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
  const [upcomingDaysFilter, setUpcomingDaysFilter] = useState<string>('2');
  const [activeTab, setActiveTab] = useState<string>('overdue');

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
              <TableHead className="font-bold text-foreground hidden sm:table-cell text-left">Plan</TableHead>
              {type === 'overdue' ? (
                <TableHead className="font-bold text-foreground w-[120px] text-left">Deuda</TableHead>
              ) : (
                <TableHead className="font-bold text-foreground w-[120px] text-left">A Pagar</TableHead>
              )}
              <TableHead className="font-bold text-foreground w-[130px] text-left">Vencimiento</TableHead>
              <TableHead className="font-bold text-foreground text-left w-[140px]">Contactar</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {members.map((member) => (
              <TableRow key={member.id} className="hover:bg-muted/30 border-border/50">
                <TableCell className="py-3">
                  <div className="flex items-center gap-3">
                    <div className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-xs font-bold
                      ${type === 'overdue' ? 'bg-destructive/10 text-destructive' : 
                        type === 'today' ? 'bg-amber-500/10 text-amber-600' : 
                        'bg-cyan-500/10 text-cyan-600'}`}>
                      {member.name.split(' ').map(n => n[0]).join('')}
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-foreground">{member.name}</p>
                    </div>
                  </div>
                </TableCell>
                <TableCell className="hidden sm:table-cell text-left">
                  <Badge variant="outline" className="font-medium text-xs border-muted-foreground/30 text-foreground">
                    {member.plan}
                  </Badge>
                </TableCell>
                {type === 'overdue' ? (
                  <TableCell className="text-left">
                    <span className="font-bold text-destructive">
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
                <TableCell className="text-left">
                  <span className={`text-sm font-medium ${type === 'overdue' ? 'text-destructive/80' : 'text-muted-foreground'}`}>
                    {formatDate(member.nextExpiry)}
                  </span>
                </TableCell>
                <TableCell className="text-left">
                  <Button
                    size="sm"
                    className="gap-1.5 bg-[#25D366] text-white hover:bg-[#128C7E] shadow-sm font-medium"
                    onClick={() => handleWhatsApp(member, type)}
                  >
                    <MessageCircle className="h-4 w-4" />
                    <span className="hidden sm:inline">WhatsApp</span>
                    {contactCounts[member.id] && (
                      <Badge className="ml-1 h-5 w-5 p-0 bg-white/20 text-white hover:bg-white/30 flex items-center justify-center border-0 rounded-full">
                        {contactCounts[member.id]}
                      </Badge>
                    )}
                  </Button>
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
              {/* Overdue Tab */}
              <TabsTrigger 
                value="overdue" 
                className="w-full sm:w-auto data-[state=active]:bg-destructive/10 data-[state=active]:text-destructive data-[state=active]:border-destructive/20 data-[state=active]:shadow-none justify-start sm:justify-center border border-border sm:border-transparent px-4 py-2.5 rounded-lg transition-all font-medium"
              >
                <AlertTriangle className="w-4 h-4 mr-2 opacity-70" />
                Pagos Vencidos
                <Badge variant="destructive" className="ml-2 h-5 px-1.5 min-w-[20px] flex items-center justify-center font-bold">
                  {overdueMembers.length}
                </Badge>
              </TabsTrigger>
              
              {/* Today Tab */}
              <TabsTrigger 
                value="today" 
                className="w-full sm:w-auto data-[state=active]:bg-amber-500/10 data-[state=active]:text-amber-600 data-[state=active]:border-amber-500/20 data-[state=active]:shadow-none justify-start sm:justify-center border border-border sm:border-transparent px-4 py-2.5 rounded-lg transition-all font-medium"
              >
                <CalendarClock className="w-4 h-4 mr-2 opacity-70" />
                Vencen Hoy
                <Badge className="ml-2 h-5 px-1.5 min-w-[20px] bg-amber-500 text-white hover:bg-amber-600 flex items-center justify-center border-0 font-bold">
                  {todayExpiries.length}
                </Badge>
              </TabsTrigger>
              
              {/* Upcoming Tab */}
              <TabsTrigger 
                value="upcoming" 
                className="w-full sm:w-auto data-[state=active]:bg-cyan-500/10 data-[state=active]:text-cyan-700 data-[state=active]:border-cyan-500/20 data-[state=active]:shadow-none justify-start sm:justify-center border border-border sm:border-transparent px-4 py-2.5 rounded-lg transition-all font-medium"
              >
                <Clock className="w-4 h-4 mr-2 opacity-70" />
                Próximos 
                <span className="hidden sm:inline ml-1">Vencimientos</span>
                <Badge className="ml-2 h-5 px-1.5 min-w-[20px] bg-cyan-500 text-white hover:bg-cyan-600 flex items-center justify-center border-0 font-bold">
                  {upcomingExpiriesFiltered.length}
                </Badge>
              </TabsTrigger>
            </TabsList>
            
            {/* Filter Dropdown for Upcoming */}
            {activeTab === 'upcoming' && (
              <div className="hidden sm:flex ml-auto items-center">
                <Select value={upcomingDaysFilter} onValueChange={setUpcomingDaysFilter}>
                  <SelectTrigger className="w-[160px] h-[44px] px-4 text-sm font-medium rounded-lg bg-background border-border shadow-sm hover:bg-muted/50 transition-colors">
                    <SelectValue placeholder="Periodo" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="2">En 2 días</SelectItem>
                    <SelectItem value="5">En 5 días</SelectItem>
                    <SelectItem value="7">Esta semana</SelectItem>
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
                    <SelectItem value="2">En 2 días</SelectItem>
                    <SelectItem value="5">En 5 días</SelectItem>
                    <SelectItem value="7">Esta semana</SelectItem>
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
    </Card>
  );
}
