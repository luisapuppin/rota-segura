import { Card } from "@/components/ui/card";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import { AccidentData } from "@/lib/mockData";

interface TopHighwaysChartProps {
  data: AccidentData[];
}

export function TopHighwaysChart({ data }: TopHighwaysChartProps) {
  const highwayCounts = data.reduce((acc, accident) => {
    acc[accident.br] = (acc[accident.br] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  const chartData = Object.entries(highwayCounts)
    .map(([br, count]) => ({ br, count }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 10);

  return (
    <Card className="p-6 border-border">
      <h3 className="text-lg font-semibold text-foreground mb-4">Top 10 Rodovias Mais Perigosas</h3>
      <ResponsiveContainer width="100%" height={300}>
        <BarChart data={chartData} layout="horizontal">
          <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
          <XAxis 
            type="number"
            stroke="hsl(var(--muted-foreground))"
            tick={{ fill: 'hsl(var(--muted-foreground))' }}
          />
          <YAxis 
            type="category"
            dataKey="br"
            stroke="hsl(var(--muted-foreground))"
            tick={{ fill: 'hsl(var(--muted-foreground))' }}
          />
          <Tooltip
            contentStyle={{
              backgroundColor: 'hsl(var(--card))',
              border: '1px solid hsl(var(--border))',
              borderRadius: '8px',
            }}
          />
          <Bar 
            dataKey="count" 
            fill="hsl(var(--danger-high))"
            radius={[0, 4, 4, 0]}
          />
        </BarChart>
      </ResponsiveContainer>
    </Card>
  );
}
