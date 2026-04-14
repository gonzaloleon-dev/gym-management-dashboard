'use client';

import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Cell,
} from 'recharts';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Users } from 'lucide-react';

export interface MembersGrowthData {
  month: string;
  members: number;
  newMembers: number; // Altas
  churnedMembers: number; // Bajas
  growth: number; // Neto
}

interface MembersGrowthChartProps {
  data: MembersGrowthData[];
  selectedMonth?: string;
  onMonthSelect?: (month: string) => void;
}

const CHART_COLORS = {
  primary: '#14b8a6', // teal-500
  grid: 'rgba(0, 0, 0, 0.06)',
  text: 'rgba(0, 0, 0, 0.5)',
};

function CustomTooltip({ active, payload, label }: { active?: boolean; payload?: any; label?: string }) {
  if (active && payload && payload.length) {
    const data = payload[0].payload as MembersGrowthData;
    return (
      <div className="rounded-lg border border-border bg-card px-3 py-2 shadow-lg z-50">
        <p className="text-xs font-semibold text-slate-800 uppercase tracking-wider mb-1">{label}</p>
        <div className="flex items-center gap-2">
          <p className="text-base font-bold text-teal-600">{data.members} <span className="text-sm font-medium text-slate-500">alumnos</span></p>
          <span className={`text-xs font-bold px-1.5 py-0.5 rounded-full ${data.growth >= 0 ? 'bg-emerald-100 text-emerald-700' : 'bg-rose-100 text-rose-700'}`}>
            {data.growth > 0 ? '+' : ''}{data.growth}
          </span>
        </div>
      </div>
    );
  }
  return null;
}

export function MembersGrowthChart({ data, selectedMonth, onMonthSelect }: MembersGrowthChartProps) {
  return (
    <Card className="border-border bg-card shadow-sm h-full">
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="rounded-lg bg-primary/10 p-2">
              <Users className="h-5 w-5 text-primary" />
            </div>
            <CardTitle className="text-base font-semibold text-card-foreground">
              Crecimiento de Miembros
            </CardTitle>
          </div>
          <div className="flex items-center gap-2">
            <div className="h-2.5 w-2.5 rounded-full bg-primary" />
            <span className="text-xs text-muted-foreground">Miembros</span>
          </div>
        </div>
      </CardHeader>
      <CardContent className="pt-4">
        <div className="h-[260px] w-full">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={data} margin={{ top: 5, right: 5, left: 0, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke={CHART_COLORS.grid} vertical={false} />
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
                width={35}
              />
              <Tooltip content={<CustomTooltip />} cursor={{ fill: 'transparent' }} position={{ y: -10 }} />
              <Bar dataKey="members" radius={[4, 4, 0, 0]} isAnimationActive={false}>
                {data.map((entry, index) => (
                  <Cell
                    cursor="pointer"
                    fill={selectedMonth === entry.month ? '#0f766e' : CHART_COLORS.primary}
                    key={`cell-${index}`}
                    onClick={() => onMonthSelect?.(entry.month)}
                    className="transition-colors duration-200"
                  />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
}
