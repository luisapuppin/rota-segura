import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import { Play, Pause, RotateCcw } from "lucide-react";
import { AccidentData } from "@/lib/mockData";

interface HeatmapViewProps {
  data: AccidentData[];
}

export function HeatmapView({ data }: HeatmapViewProps) {
  const [isPlaying, setIsPlaying] = useState(false);
  const [timeIndex, setTimeIndex] = useState(0);

  const months = Array.from(new Set(data.map(d => {
    const date = new Date(d.data_hora);
    return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
  }))).sort();

  const handlePlayPause = () => {
    setIsPlaying(!isPlaying);
    // In a real implementation, this would trigger animation
  };

  const handleReset = () => {
    setTimeIndex(0);
    setIsPlaying(false);
  };

  return (
    <Card className="p-6 border-border">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-foreground">Mapa de Calor Temporal</h3>
        <div className="flex items-center gap-2">
          <Button 
            variant="outline" 
            size="icon"
            onClick={handleReset}
          >
            <RotateCcw className="h-4 w-4" />
          </Button>
          <Button 
            variant="outline" 
            size="icon"
            onClick={handlePlayPause}
          >
            {isPlaying ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />}
          </Button>
        </div>
      </div>

      <div className="relative w-full h-96 bg-muted rounded-lg mb-4 flex items-center justify-center">
        <div className="text-center">
          <p className="text-muted-foreground mb-2">Visualização do Mapa</p>
          <p className="text-sm text-muted-foreground">
            {months[timeIndex] || 'Carregando...'}
          </p>
          <div className="mt-4 grid grid-cols-3 gap-2 max-w-xs mx-auto">
            {data.slice(0, 9).map((accident, i) => (
              <div 
                key={i}
                className="w-12 h-12 rounded-full"
                style={{
                  backgroundColor: `hsl(var(--danger-high))`,
                  opacity: 0.3 + (Math.random() * 0.7),
                }}
              />
            ))}
          </div>
        </div>
      </div>

      <div className="space-y-2">
        <div className="flex items-center justify-between text-sm text-muted-foreground">
          <span>{months[0]}</span>
          <span>{months[months.length - 1]}</span>
        </div>
        <Slider
          value={[timeIndex]}
          onValueChange={([value]) => setTimeIndex(value)}
          max={months.length - 1}
          step={1}
          className="w-full"
        />
      </div>
    </Card>
  );
}
