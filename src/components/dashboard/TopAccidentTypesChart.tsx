import { Card } from "@/components/ui/card";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LabelList } from "recharts";
import { AccidentData } from "@/lib/mockData";

interface Props {
  data: AccidentData[];
}

export function TopAccidentTypesChart({ data }: Props) {
  // count unique accident IDs per tipo_acidente
  const counts = data.reduce((acc, row) => {
    const key = (row.tipo_acidente || '').toString().trim() || 'Desconhecido';
    const id = (row as any).id_acidente ?? (row as any).id ?? '';
    if (!acc[key]) acc[key] = new Set<string>();
    if (id) acc[key].add(String(id));
    return acc;
  }, {} as Record<string, Set<string>>);

  const chartData = Object.entries(counts)
    .map(([tipo, set]) => ({ tipo, count: set.size }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 10);

  const chartHeight = Math.max(300, chartData.length * 42 + 60);
  const numberFormatter = (v: number) => Intl.NumberFormat('pt-BR').format(v);

  const CustomBarLabel = (props: any) => {
    const { x, y, width = 0, height = 0, value } = props;
    const text = numberFormatter(Number(value));
    const padding = 8;
    const approxCharWidth = 7;
    const textWidthEstimate = String(text).length * approxCharWidth;
    const inside = width > textWidthEstimate + padding * 2;
    if (inside) {
      return (
        <text x={x + width - padding} y={y + height / 2} fill="#fff" textAnchor="end" dominantBaseline="middle" style={{ fontSize: 12 }}>
          {text}
        </text>
      );
    }
    return (
      <text x={x + width + padding} y={y + height / 2} fill="hsl(var(--muted-foreground))" textAnchor="start" dominantBaseline="middle" style={{ fontSize: 12 }}>
        {text}
      </text>
    );
  };

  return (
    <Card className="p-6 border-border">
      <h3 className="text-lg font-semibold text-foreground mb-4">Top 10 Tipos de Acidentes</h3>
      <ResponsiveContainer width="100%" height={chartHeight}>
        <BarChart data={chartData} layout="vertical" margin={{ top: 12, right: 24, left: 0, bottom: 12 }} barCategoryGap={12}>
          <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
          <XAxis type="number" domain={[0, 'dataMax']} stroke="hsl(var(--muted-foreground))" tick={{ fill: 'hsl(var(--muted-foreground))' }} tickFormatter={(v) => numberFormatter(Number(v))} />
          <YAxis type="category" dataKey="tipo" stroke="hsl(var(--muted-foreground))" tick={{ fill: 'hsl(var(--muted-foreground))' }} width={140} />
          <Tooltip contentStyle={{ backgroundColor: 'hsl(var(--card))', border: '1px solid hsl(var(--border))', borderRadius: '8px' }} />
          <Bar dataKey="count" fill="hsl(var(--chart-3))" radius={[0,4,4,0]}>
            <LabelList dataKey="count" content={CustomBarLabel} />
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </Card>
  );
}
