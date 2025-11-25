import { Card } from "@/components/ui/card";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import { AccidentData } from "@/lib/mockData";

interface HourlyDistributionChartProps {
  data: AccidentData[];
}

export function HourlyDistributionChart({ data }: HourlyDistributionChartProps) {
  // Count unique accident IDs per hour (0-23).
  // Prefer the `horario` field from the dataset (format like "08:17"); fall back to `data_hora`.
  const sets: Set<string>[] = Array.from({ length: 24 }, () => new Set<string>());

  data.forEach((accident) => {
    const id = (accident as any).id_acidente ?? (accident as any).id ?? String((accident as any).id_acidente ?? (accident as any).id ?? '');

    let hourIndex = -1;
    const horario = (accident as any).horario;
    if (horario && typeof horario === 'string') {
      const m = horario.trim().match(/^(\d{1,2}):/);
      // fallback parsing: split on ':'
      if (m && m[1]) {
        hourIndex = Number(m[1]);
      } else {
        const parts = horario.split(':');
        const h = Number(parts[0]);
        if (!isNaN(h)) hourIndex = h;
      }
    }

    if (hourIndex === -1) {
      const d = new Date((accident as any).data_hora);
      if (!isNaN(d.getTime())) hourIndex = d.getHours();
    }

    if (hourIndex < 0 || hourIndex > 23) hourIndex = 0;
    if (id) sets[hourIndex].add(id);
  });

  const chartData = Array.from({ length: 24 }, (_, i) => ({
    hour: `${String(i).padStart(2, '0')}h`,
    count: sets[i].size,
  }));

  return (
    <Card className="p-6 border-border">
      <h3 className="text-lg font-semibold text-foreground mb-4">Distribuição de Acidentes por Hora do Dia</h3>
      <ResponsiveContainer width="100%" height={300}>
        <BarChart data={chartData}>
          <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
          <XAxis 
            dataKey="hour"
            stroke="hsl(var(--muted-foreground))"
            tick={{ fill: 'hsl(var(--muted-foreground))' }}
          />
          <YAxis 
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
            fill="hsl(var(--chart-2))"
            radius={[4, 4, 0, 0]}
          />
        </BarChart>
      </ResponsiveContainer>
    </Card>
  );
}
