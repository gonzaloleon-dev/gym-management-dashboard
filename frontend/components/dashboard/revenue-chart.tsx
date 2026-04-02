'use client';

import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { TrendingUp } from 'lucide-react';
import type { RevenueData } from '@/lib/mock-data';

interface RevenueChartProps {
  data: RevenueData[];
}

// Define colors directly for Recharts - using teal/turquoise
const CHART_COLORS = {
  primary: '#14b8a6', // teal-500
  primaryLight: 'rgba(20, 184, 166, 0.1)',
  grid: 'rgba(0, 0, 0, 0.06)',
  text: 'rgba(0, 0, 0, 0.5)',
};

function CustomTooltip({ active, payload, label }: { active?: boolean; payload?: Array<{ value: number }>; label?: string }) {
  if (active && payload && payload.length) {
    return (
      <div className="rounded-lg border border-border bg-card px-3 py-2 shadow-lg">
        <p className="text-xs text-muted-foreground">{label}</p>
        <p className="text-sm font-semibold text-foreground">
          $ {payload[0].value.toLocaleString('es-AR')}
        </p>
      </div>
    );
  }
  return null;
}

export function RevenueChart({ data }: RevenueChartProps) {
  return (
    <Card className="border-border bg-card shadow-sm h-full">
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="rounded-lg bg-primary/10 p-2">
              <TrendingUp className="h-5 w-5 text-primary" />
            </div>
            <CardTitle className="text-base font-semibold text-card-foreground">
              Ingresos - Últimos 6 Meses
            </CardTitle>
          </div>
          <div className="flex items-center gap-2">
            <div className="h-2.5 w-2.5 rounded-full bg-primary" />
            <span className="text-xs text-muted-foreground">Ingresos</span>
          </div>
        </div>
      </CardHeader>
      <CardContent className="pt-4">
        <div className="h-[260px] w-full">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart
              data={data}
              margin={{ top: 5, right: 5, left: 0, bottom: 0 }}
            >
              <defs>
                <linearGradient id="revenueGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor={CHART_COLORS.primary} stopOpacity={0.2} />
                  <stop offset="100%" stopColor={CHART_COLORS.primary} stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid
                strokeDasharray="3 3"
                stroke={CHART_COLORS.grid}
                vertical={false}
              />
              <XAxis
                dataKey="month"
                tick={{ fill: CHART_COLORS.text, fontSize: 12 }}
                tickLine={false}
                axisLine={false}
              />
              <YAxis
                tick={{ fill: CHART_COLORS.text, fontSize: 12 }}
                tickLine={false}
                axisLine={false}
                tickFormatter={(value) => `${(value / 1000000).toFixed(1)}M`}
                width={45}
              />
              <Tooltip content={<CustomTooltip />} />
              <Area
                type="monotone"
                dataKey="revenue"
                stroke={CHART_COLORS.primary}
                strokeWidth={2.5}
                fill="url(#revenueGradient)"
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
}
