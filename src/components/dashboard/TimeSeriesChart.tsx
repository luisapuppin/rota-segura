import { Card } from "@/components/ui/card";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from "recharts";
import { AccidentData } from "@/lib/mockData";

interface TimeSeriesChartProps {
  data: AccidentData[];
}

export function TimeSeriesChart({ data }: TimeSeriesChartProps) {
  const monthlyData = data.reduce((acc, accident) => {
    const date = new Date(accident.data_hora);
    const key = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;

    if (!acc[key]) {
      acc[key] = { month: key, count: 0, mortos: 0, feridos_graves: 0, feridos_leves: 0, ilesos: 0 } as any;
    }

    acc[key].count++;
    acc[key].mortos += Number(accident.mortos || 0);
    acc[key].feridos_graves += Number((accident as any).feridos_graves || 0);
    acc[key].feridos_leves += Number((accident as any).feridos_leves || 0);

    const casualties = Number(accident.mortos || 0) + Number((accident as any).feridos_graves || 0) + Number((accident as any).feridos_leves || 0);
    if (casualties === 0) acc[key].ilesos += 1; // count accidents with no casualties as 'ilesos'

    return acc;
  }, {} as Record<string, { month: string; count: number; mortos: number; feridos_graves: number; feridos_leves: number; ilesos: number }>);

  const chartData = Object.values(monthlyData)
    .sort((a, b) => a.month.localeCompare(b.month))
    .map(d => ({
      month: d.month,
      count: d.count,
      mortos: d.mortos,
      feridos_graves: d.feridos_graves,
      feridos_leves: d.feridos_leves,
      ilesos: d.ilesos,
    }));

  return (
    <Card className="p-6 border-border">
      <h3 className="text-lg font-semibold text-foreground mb-4">Série Temporal de Acidentes e Vítimas</h3>
      <ResponsiveContainer width="100%" height={300}>
        <LineChart data={chartData}>
          <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
          <XAxis 
            dataKey="month" 
            stroke="hsl(var(--muted-foreground))"
            tick={{ fill: 'hsl(var(--muted-foreground))' }}
          />
          <YAxis 
            stroke="hsl(var(--muted-foreground))"
            tick={{ fill: 'hsl(var(--muted-foreground))' }}
            yAxisId="left"
          />
          <YAxis
            yAxisId="right"
            orientation="right"
            stroke="hsl(var(--muted-foreground))"
            tick={{ fill: 'hsl(var(--muted-foreground))' }}
            width={60}
          />
          <Tooltip
            contentStyle={{
              backgroundColor: 'hsl(var(--card))',
              border: '1px solid hsl(var(--border))',
              borderRadius: '8px',
            }}
            labelStyle={{ color: 'hsl(var(--foreground))' }}
          />
          <Legend verticalAlign="top" align="right" />
          {/* number of accidents (left axis) */}
          <Line 
            type="monotone" 
            dataKey="count" 
            stroke="hsl(var(--primary))" 
            strokeWidth={2}
            dot={{ fill: 'hsl(var(--primary))', r: 4 }}
            activeDot={{ r: 6 }}
            yAxisId="left"
            name="Acidentes"
          />

          {/* people counts (right axis) */}
          <Line type="monotone" dataKey="mortos" stroke="#ff0000" strokeWidth={2} dot={false} yAxisId="right" name="Mortos" />
          <Line type="monotone" dataKey="feridos_graves" stroke="#ffa500" strokeWidth={2} dot={false} yAxisId="right" name="Feridos Graves" />
          <Line type="monotone" dataKey="feridos_leves" stroke="#00ff37ff" strokeWidth={2} dot={false} yAxisId="right" name="Feridos Leves" />
          <Line type="monotone" dataKey="ilesos" stroke="#ffffff" strokeWidth={2} dot={false} yAxisId="right" name="Ilesos" />
        </LineChart>
      </ResponsiveContainer>
    </Card>
  );
}
