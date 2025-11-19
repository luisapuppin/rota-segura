import { Card } from "@/components/ui/card";
import { AlertTriangle, Activity, TrendingUp } from "lucide-react";
import { AccidentData } from "@/lib/mockData";

interface KPICardsProps {
  data: AccidentData[];
}

export function KPICards({ data }: KPICardsProps) {
  const totalAccidents = data.length;
  const totalDeaths = data.reduce((sum, accident) => sum + accident.mortos, 0);
  const lethalityRate = totalAccidents > 0 ? ((totalDeaths / totalAccidents) * 100).toFixed(2) : '0.00';

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
      <Card className="p-6 border-border bg-card hover:border-primary/50 transition-colors">
        <div className="flex items-start justify-between">
          <div>
            <p className="text-sm text-muted-foreground mb-1">Total de Acidentes</p>
            <p className="text-3xl font-bold text-foreground">{totalAccidents.toLocaleString('pt-BR')}</p>
          </div>
          <div className="p-3 bg-primary/10 rounded-lg">
            <Activity className="h-6 w-6 text-primary" />
          </div>
        </div>
      </Card>

      <Card className="p-6 border-border bg-card hover:border-danger-high/50 transition-colors">
        <div className="flex items-start justify-between">
          <div>
            <p className="text-sm text-muted-foreground mb-1">Total de Mortes</p>
            <p className="text-3xl font-bold text-danger-high">{totalDeaths.toLocaleString('pt-BR')}</p>
          </div>
          <div className="p-3 bg-danger-high/10 rounded-lg">
            <AlertTriangle className="h-6 w-6 text-danger-high" />
          </div>
        </div>
      </Card>

      <Card className="p-6 border-border bg-card hover:border-accent/50 transition-colors">
        <div className="flex items-start justify-between">
          <div>
            <p className="text-sm text-muted-foreground mb-1">Índice de Letalidade</p>
            <p className="text-3xl font-bold text-accent">{lethalityRate}%</p>
          </div>
          <div className="p-3 bg-accent/10 rounded-lg">
            <TrendingUp className="h-6 w-6 text-accent" />
          </div>
        </div>
      </Card>
    </div>
  );
}
