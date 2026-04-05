'use client';

import { useState } from 'react';
import { Search, ArrowUpRight, Calendar, Filter } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { mockMembers, recentPayments, formatCurrency, formatDate, revenueData, getPaymentStats } from '@/lib/mock-data';
import { RevenueChart } from '@/components/dashboard/revenue-chart';

export function PaymentsView() {
  const paymentStats = getPaymentStats();
  const allPayments = recentPayments;
  const [searchQuery, setSearchQuery] = useState('');

  const filteredPayments = searchQuery
    ? allPayments.filter(
        (p) =>
          p.memberName.toLowerCase().includes(searchQuery.toLowerCase()) ||
          p.concept.toLowerCase().includes(searchQuery.toLowerCase())
      )
    : allPayments;

  const totalIncome = paymentStats.totalRevenue;
  const thisMonthIncome = paymentStats.monthlyRevenue;
  const thisMonthPaymentsCount = paymentStats.monthlyCount;

  const getMethodColor = (method: string) => {
    switch (method) {
      case 'Efectivo':
        return 'bg-primary/15 text-primary border-primary/30';
      case 'Transferencia':
        return 'bg-secondary/15 text-secondary border-secondary/30';
      default:
        return 'bg-muted text-muted-foreground';
    }
  };

  return (
    <div className="space-y-6">
      {/* Summary Cards */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <Card className="border-border bg-card shadow-sm">
          <CardContent className="p-5">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Ingresos Este Mes</p>
                <p className="text-2xl font-bold text-primary">{formatCurrency(thisMonthIncome)}</p>
              </div>
              <div className="rounded-lg bg-primary/10 p-2.5">
                <ArrowUpRight className="h-5 w-5 text-primary" />
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="border-border bg-card shadow-sm">
          <CardContent className="p-5">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Pagos Este Mes</p>
                <p className="text-2xl font-bold text-card-foreground">{thisMonthPaymentsCount}</p>
              </div>
              <div className="rounded-lg bg-secondary/10 p-2.5">
                <Calendar className="h-5 w-5 text-secondary" />
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="border-border bg-card shadow-sm sm:col-span-2 lg:col-span-1">
          <CardContent className="p-5">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Total Histórico</p>
                <p className="text-2xl font-bold text-card-foreground">{formatCurrency(totalIncome)}</p>
              </div>
              <div className="rounded-lg bg-muted p-2.5">
                <ArrowUpRight className="h-5 w-5 text-muted-foreground" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Revenue Chart Widget */}
      <div className="grid">
        <RevenueChart data={revenueData} />
      </div>

      {/* Payments Table */}
      <Card className="border-border bg-card shadow-sm">
        <CardHeader className="pb-4">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <CardTitle className="text-base font-semibold text-card-foreground">
              Historial de Pagos
            </CardTitle>
            <div className="flex gap-2">
              <div className="relative flex-1 sm:w-64">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  placeholder="Buscar pagos..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-9 bg-muted/50 border-border"
                />
              </div>
              <Button variant="outline" size="icon" className="shrink-0 bg-transparent">
                <Filter className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="rounded-lg border border-border overflow-hidden">
            <Table>
              <TableHeader>
                <TableRow className="border-border bg-muted/50 hover:bg-muted/50">
                  <TableHead className="text-foreground font-semibold">Fecha</TableHead>
                  <TableHead className="text-foreground font-semibold">Miembro</TableHead>
                  <TableHead className="text-foreground font-semibold hidden sm:table-cell">
                    Concepto
                  </TableHead>
                  <TableHead className="text-foreground font-semibold">Método</TableHead>
                  <TableHead className="text-foreground font-semibold text-right">Monto</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredPayments.map((payment) => (
                  <TableRow key={payment.id} className="border-border hover:bg-muted/30">
                    <TableCell className="text-muted-foreground">
                      {formatDate(payment.date)}
                    </TableCell>
                    <TableCell>
                      <span className="font-medium text-card-foreground">{payment.memberName}</span>
                    </TableCell>
                    <TableCell className="text-muted-foreground hidden sm:table-cell">
                      {payment.concept}
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline" className={getMethodColor(payment.method)}>
                        {payment.method}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right font-semibold text-primary">
                      {formatCurrency(payment.amount)}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
