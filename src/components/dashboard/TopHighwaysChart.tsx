import { Card } from "@/components/ui/card";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LabelList } from "recharts";
import { AccidentData } from "@/lib/mockData";

interface TopHighwaysChartProps {
  data: AccidentData[];
}

export function TopHighwaysChart({ data }: TopHighwaysChartProps) {
  const highwayCounts = data.reduce((acc, accident) => {
    const key = (accident.br || '').toString().trim() || 'Desconhecido';
    acc[key] = (acc[key] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  const chartData = Object.entries(highwayCounts)
    .map(([br, count]) => ({ br, count }))
    .sort((a, b) => b.count - a.count) // descending: largest first
    .slice(0, 10);

  // dynamic height so chart uses more vertical space when there are multiple items
  const chartHeight = Math.max(360, chartData.length * 42 + 80);

  const numberFormatter = (value: number) => Intl.NumberFormat('pt-BR').format(value);

  // Custom label component: place label inside the bar if the bar width is large enough,
  // otherwise place it to the right of the bar. We estimate text width roughly by chars.
  const CustomBarLabel = (props: any) => {
    const { x, y, width = 0, height = 0, value } = props;
    const text = numberFormatter(Number(value));
    const padding = 8; // px
    const approxCharWidth = 7; // rough approximation
    const textWidthEstimate = String(text).length * approxCharWidth;
    const inside = width > textWidthEstimate + padding * 2;

    if (inside) {
      // place inside, right-aligned with some padding
      return (
        <text
          x={x + width - padding}
          y={y + height / 2}
          fill="#fff"
          textAnchor="end"
          dominantBaseline="middle"
          style={{ fontSize: 12 }}
        >
          {text}
        </text>
      );
    }

    // place outside to the right
    return (
      <text
        x={x + width + padding}
        y={y + height / 2}
        fill="hsl(var(--muted-foreground))"
        textAnchor="start"
        dominantBaseline="middle"
        style={{ fontSize: 12 }}
      >
        {text}
      </text>
    );
  };

  return (
    <Card className="p-6 border-border">
      <h3 className="text-lg font-semibold text-foreground mb-4">Top 10 Rodovias Mais Perigosas</h3>
      <ResponsiveContainer width="100%" height={chartHeight}>
        {/* layout="vertical" makes bars horizontal: X is numeric, Y is category */}
  <BarChart data={chartData} layout="vertical" margin={{ top: 20, right: 30, left: 0, bottom: 20 }} barCategoryGap={12}>
          <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
          <XAxis 
            type="number"
            domain={[0, 'dataMax']}
            stroke="hsl(var(--muted-foreground))"
            tick={{ fill: 'hsl(var(--muted-foreground))' }}
            tickFormatter={(val) => numberFormatter(Number(val))}
          />
          <YAxis 
            type="category"
            dataKey="br"
            stroke="hsl(var(--muted-foreground))"
            tick={{ fill: 'hsl(var(--muted-foreground))' }}
            width={40} /* allocate space so full names appear */
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
          >
            <LabelList dataKey="count" content={CustomBarLabel} />
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </Card>
  );
}
