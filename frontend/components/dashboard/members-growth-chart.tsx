'use client';

import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Users } from 'lucide-react';

interface MembersGrowthChartProps {
  data: Array<{ month: string; members: number }>;
}

const CHART_COLORS = {
  primary: '#14b8a6', // teal-500
  grid: 'rgba(0, 0, 0, 0.06)',
  text: 'rgba(0, 0, 0, 0.5)',
};

function CustomTooltip({ active, payload, label }: { active?: boolean; payload?: Array<{ value: number }>; label?: string }) {
  if (active && payload && payload.length) {
    return (
      <div className="rounded-lg border border-border bg-card px-3 py-2 shadow-lg">
        <p className="text-xs text-muted-foreground">{label}</p>
        <p className="text-sm font-semibold text-foreground">{payload[0].value} miembros</p>
      </div>
    );
  }
  return null;
}

export function MembersGrowthChart({ data }: MembersGrowthChartProps) {
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
              <Tooltip content={<CustomTooltip />} />
              <Bar dataKey="members" fill={CHART_COLORS.primary} radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
}
