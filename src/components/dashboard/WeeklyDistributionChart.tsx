import { Card } from "@/components/ui/card";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import { AccidentData } from "@/lib/mockData";

interface WeeklyDistributionChartProps {
  data: AccidentData[];
}

const DAYS = ['Domingo', 'Segunda', 'Terça', 'Quarta', 'Quinta', 'Sexta', 'Sábado'];

export function WeeklyDistributionChart({ data }: WeeklyDistributionChartProps) {
  // Count unique accidents (by id) per weekday. Prefer `dia_semana` if present on the record,
  // otherwise derive weekday from `data_hora`.
  const lowerDays = DAYS.map((d) => d.toLowerCase());

  const sets: Set<string>[] = Array.from({ length: 7 }, () => new Set<string>());

  data.forEach((accident) => {
    // robust id detection (data loader maps id -> id_acidente)
    const id = (accident as any).id_acidente ?? (accident as any).id ?? String((accident as any).id_acidente ?? (accident as any).id ?? '');

    let dayIndex = -1;
    const ds = (accident as any).dia_semana;
    if (ds && typeof ds === 'string' && ds.trim().length > 0) {
      const norm = ds.trim().toLowerCase();
      dayIndex = lowerDays.indexOf(norm);
    }

    if (dayIndex === -1) {
      const d = new Date((accident as any).data_hora);
      if (!isNaN(d.getTime())) dayIndex = d.getDay();
    }

    if (dayIndex < 0 || dayIndex > 6) dayIndex = 0;
    if (id) sets[dayIndex].add(id);
  });

  const chartData = DAYS.map((day, index) => ({
    day,
    count: sets[index].size,
  }));

  return (
    <Card className="p-6 border-border">
      <h3 className="text-lg font-semibold text-foreground mb-4">Distribuição de Acidentes por Dia da Semana</h3>
      <ResponsiveContainer width="100%" height={300}>
        <BarChart data={chartData}>
          <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
          <XAxis 
            dataKey="day"
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
            fill="hsl(var(--chart-3))"
            radius={[4, 4, 0, 0]}
          />
        </BarChart>
      </ResponsiveContainer>
    </Card>
  );
}
