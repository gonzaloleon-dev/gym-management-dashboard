'use client';

import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { mockMembers, PLAN_PRICES, formatCurrency, type MembershipPlan } from '@/lib/mock-data';

// 6 distinct, vibrant colors for each plan - avoiding confusing shades
const PLAN_COLORS: Record<MembershipPlan, string> = {
  '3 veces x semana': '#14b8a6', // teal
  'LIBRE': '#f59e0b', // amber
  'Funcional': '#8b5cf6', // purple
  'M+F': '#ec4899', // pink
  'Stretching Global Activo': '#06b6d4', // cyan
  'Feldenkrais/GPG': '#22c55e', // green
};

interface PlanDataItem {
  name: MembershipPlan;
  value: number;
  price: number;
  percentage: number;
}

function CustomTooltip({
  active,
  payload,
}: {
  active?: boolean;
  payload?: Array<{ payload: PlanDataItem }>;
}) {
  if (active && payload && payload.length) {
    const data = payload[0].payload;
    return (
      <div className="rounded-lg border border-border bg-card px-4 py-3 shadow-lg">
        <p className="text-sm font-semibold text-card-foreground">{data.name}</p>
        <p className="text-xs text-muted-foreground mt-1">
          {data.value} alumnos ({data.percentage.toFixed(1)}%)
        </p>
        <p className="text-xs text-primary font-medium mt-1">
          {formatCurrency(data.price)}/mes
        </p>
      </div>
    );
  }
  return null;
}

export function PlanDistributionChart() {
  // Calculate plan distribution
  const planCounts: Record<MembershipPlan, number> = {
    '3 veces x semana': 0,
    'LIBRE': 0,
    'Funcional': 0,
    'M+F': 0,
    'Stretching Global Activo': 0,
    'Feldenkrais/GPG': 0,
  };

  mockMembers.forEach((member) => {
    planCounts[member.plan]++;
  });

  const totalMembers = mockMembers.length;

  const planData: PlanDataItem[] = (Object.keys(PLAN_PRICES) as MembershipPlan[]).map((plan) => ({
    name: plan,
    value: planCounts[plan],
    price: PLAN_PRICES[plan],
    percentage: (planCounts[plan] / totalMembers) * 100,
  }));

  return (
    <Card className="border-border bg-card shadow-sm">
      <CardHeader className="pb-2">
        <CardTitle className="text-base font-semibold text-card-foreground">
          Distribución por Plan
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="flex flex-col lg:flex-row items-start gap-6">
          {/* Donut Chart */}
          <div className="h-[220px] w-full lg:w-[220px] shrink-0">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={planData}
                  cx="50%"
                  cy="50%"
                  innerRadius={55}
                  outerRadius={90}
                  paddingAngle={2}
                  dataKey="value"
                  stroke="none"
                >
                  {planData.map((entry) => (
                    <Cell 
                      key={`cell-${entry.name}`} 
                      fill={PLAN_COLORS[entry.name]} 
                      className="cursor-pointer transition-opacity hover:opacity-80"
                    />
                  ))}
                </Pie>
                <Tooltip content={<CustomTooltip />} />
              </PieChart>
            </ResponsiveContainer>
          </div>

          {/* Vertical Legend with details */}
          <div className="flex-1 w-full space-y-3">
            {planData.map((item) => (
              <div
                key={item.name}
                className="flex items-center gap-3 py-1.5 border-b border-border/50 last:border-0"
              >
                <div
                  className="h-3 w-3 rounded-full shrink-0"
                  style={{ backgroundColor: PLAN_COLORS[item.name] }}
                />
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-card-foreground truncate">
                    {item.name}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {formatCurrency(item.price)}/mes
                  </p>
                </div>
                <div className="text-right shrink-0">
                  <p className="text-sm font-semibold text-card-foreground">
                    {item.value}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {item.percentage.toFixed(0)}%
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
