import { useEffect, useMemo, useRef, useState } from "react";
import { MapContainer, TileLayer, useMap } from 'react-leaflet';
import L from 'leaflet';
// leaflet.heat side-effect import (adds L.heatLayer)
// @ts-ignore
import 'leaflet.heat';
import 'leaflet/dist/leaflet.css';
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
  const playRef = useRef<number | null>(null);

  const months = Array.from(new Set(data.map(d => {
    const date = new Date(d.data_hora);
    return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
  }))).sort();

  // group data by month key for faster filtering
  const dataByMonth = useMemo(() => {
    const map: Record<string, typeof data> = {};
    for (const d of data) {
      const date = new Date(d.data_hora);
      const key = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
      if (!map[key]) map[key] = [];
      map[key].push(d);
    }
    return map;
  }, [data]);

  const handlePlayPause = () => {
    setIsPlaying(!isPlaying);
    // In a real implementation, this would trigger animation
  };

  const handleReset = () => {
    setTimeIndex(0);
    setIsPlaying(false);
  };

  // advance time when playing
  useEffect(() => {
    if (!isPlaying) {
      if (playRef.current) {
        window.clearInterval(playRef.current);
        playRef.current = null;
      }
      return;
    }

    playRef.current = window.setInterval(() => {
      setTimeIndex((t) => (t + 1) % Math.max(1, months.length));
    }, 900);

    return () => {
      if (playRef.current) {
        window.clearInterval(playRef.current);
        playRef.current = null;
      }
    };
  }, [isPlaying, months.length]);

  // compute heat grid for the currently selected month
  const grid = useMemo(() => {
    const monthKey = months[timeIndex];
    const rows = 40;
    const cols = 80;
    const cells: number[][] = Array.from({ length: rows }, () => Array(cols).fill(0));

    const monthData = monthKey ? (dataByMonth[monthKey] || []) : data;
    if (!monthData || monthData.length === 0) return { cells, rows, cols, max: 0, bounds: null };

    // compute bounds
    let minLat = Infinity, maxLat = -Infinity, minLon = Infinity, maxLon = -Infinity;
    for (const d of monthData) {
      const lat = Number(d.latitude);
      const lon = Number(d.longitude);
      if (!Number.isFinite(lat) || !Number.isFinite(lon)) continue;
      if (lat < minLat) minLat = lat;
      if (lat > maxLat) maxLat = lat;
      if (lon < minLon) minLon = lon;
      if (lon > maxLon) maxLon = lon;
    }
    if (!(minLat < Infinity && minLon < Infinity)) return { cells, rows, cols, max: 0, bounds: null };

    // pad bounds a little
    const latPad = (maxLat - minLat) * 0.03 || 0.1;
    const lonPad = (maxLon - minLon) * 0.03 || 0.1;
    minLat -= latPad; maxLat += latPad; minLon -= lonPad; maxLon += lonPad;

    // populate cells
    let max = 0;
    for (const d of monthData) {
      const lat = Number(d.latitude);
      const lon = Number(d.longitude);
      if (!Number.isFinite(lat) || !Number.isFinite(lon)) continue;
      // map lon->x, lat->y (y reversed so north is top)
      const xRatio = (lon - minLon) / (maxLon - minLon);
      const yRatio = (maxLat - lat) / (maxLat - minLat);
      if (xRatio < 0 || xRatio > 1 || yRatio < 0 || yRatio > 1) continue;
      const col = Math.min(cols - 1, Math.floor(xRatio * cols));
      const row = Math.min(rows - 1, Math.floor(yRatio * rows));
      cells[row][col] += 1;
      if (cells[row][col] > max) max = cells[row][col];
    }

    return { cells, rows, cols, max, bounds: { minLat, maxLat, minLon, maxLon } };
  }, [dataByMonth, months, timeIndex, data]);

  // prepare aggregated points for heat layer: group by rounded coords to reduce point count
  const points = useMemo(() => {
    const res: Array<[number, number, number]> = [];
    if (!grid.bounds) return res;
    const bucket = new Map<string, number>();
    const monthKey = months[timeIndex];
    const monthData = monthKey ? (dataByMonth[monthKey] || []) : data;
    for (const d of monthData) {
      const lat = Number(d.latitude);
      const lon = Number(d.longitude);
      if (!Number.isFinite(lat) || !Number.isFinite(lon)) continue;
      // round to ~4 decimals (~11m) to aggregate close points
      const key = `${lat.toFixed(4)},${lon.toFixed(4)}`;
      bucket.set(key, (bucket.get(key) || 0) + 1);
    }
    for (const [k, count] of bucket.entries()) {
      const [latS, lonS] = k.split(',');
      res.push([Number(latS), Number(lonS), count]);
    }
    return res;
  }, [dataByMonth, months, timeIndex, data, grid.bounds]);

  // UI-controlled heat options
  const [radius, setRadius] = useState<number>(25);
  const [blur, setBlur] = useState<number>(15);
  const [palette, setPalette] = useState<'yor' | 'bry'>('yor');

  const gradients: Record<string, Record<number, string>> = {
    yor: { 0.2: 'yellow', 0.6: 'orange', 1.0: 'red' },
    bry: { 0.0: '#0000ff', 0.5: '#ffff00', 1.0: '#ff0000' }
  };

  // HeatmapLayer component that integrates leaflet.heat with react-leaflet
  function HeatmapLayer({ points, max, bounds, radius, blur, gradient }: { points: Array<[number, number, number]>; max: number; bounds: any; radius: number; blur: number; gradient: Record<number,string> }) {
    const map = useMap();
    const layerRef = useRef<any>(null);

    useEffect(() => {
      if (!map) return;
      const heatPoints = points.map(p => [p[0], p[1], p[2]]);
      if (blur > 0) {
        // @ts-ignore
        const heatLayer = (L as any).heatLayer(heatPoints, { radius, blur, max: max || undefined, gradient });
        heatLayer.addTo(map);
        layerRef.current = heatLayer;
      } else {
        // create crisp circle markers instead of blurred heat
        const group = L.layerGroup();
        for (const p of points) {
          const lat = p[0];
          const lon = p[1];
          const count = p[2];
          const intensity = max > 0 ? count / max : 0;
          // color thresholds: blue -> yellow -> red
          let color = '#ff0000';
          if (intensity < 0.33) color = '#0000ff';
          else if (intensity < 0.66) color = '#ffff00';

          const marker = L.circleMarker([lat, lon], {
            radius: Math.max(4, Math.min(20, 3 + Math.log(count + 1) * 3)),
            color: color,
            fillColor: color,
            fillOpacity: 0.85,
            weight: 0,
          });
          marker.addTo(group);
        }
        group.addTo(map);
        layerRef.current = group;
      }

      if (bounds) {
        try {
          map.fitBounds([[bounds.minLat, bounds.minLon], [bounds.maxLat, bounds.maxLon]], { padding: [20, 20] });
        } catch (e) {
          // ignore
        }
      }

      return () => {
        if (layerRef.current) {
          map.removeLayer(layerRef.current);
          layerRef.current = null;
        }
      };
    }, [map]);

    // update points when they change
    useEffect(() => {
      if (layerRef.current) {
        if (blur > 0) {
          // @ts-ignore
          layerRef.current.setLatLngs(points.map(p => [p[0], p[1], p[2]]));
        } else {
          // recreate marker group
          try {
            map.removeLayer(layerRef.current);
          } catch (e) {}
          const group = L.layerGroup();
          for (const p of points) {
            const lat = p[0];
            const lon = p[1];
            const count = p[2];
            const intensity = max > 0 ? count / max : 0;
            let color = '#ff0000';
            if (intensity < 0.33) color = '#0000ff';
            else if (intensity < 0.66) color = '#ffff00';
            const marker = L.circleMarker([lat, lon], {
              radius: Math.max(4, Math.min(20, 3 + Math.log(count + 1) * 3)),
              color: color,
              fillColor: color,
              fillOpacity: 0.85,
              weight: 0,
            });
            marker.addTo(group);
          }
          group.addTo(map);
          layerRef.current = group;
        }
      }
    }, [points]);

    return null;
  }


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

      <div className="space-y-3 mb-4">
        <div className="flex items-center gap-6">
          <div className="flex items-center gap-2">
            <span className="text-sm text-muted-foreground">Raio</span>
            <Slider value={[radius]} onValueChange={([v]) => setRadius(v)} min={5} max={80} className="w-36" />
            <span className="text-sm text-muted-foreground">{radius}</span>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-sm text-muted-foreground">Blur</span>
            <Slider value={[blur]} onValueChange={([v]) => setBlur(v)} min={0} max={50} className="w-36" />
            <span className="text-sm text-muted-foreground">{blur}</span>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-sm text-muted-foreground">Paleta</span>
            <select value={palette} onChange={(e) => setPalette(e.target.value as any)} className="text-sm p-1 bg-card border border-border rounded">
              <option value="yor">Amarelo → Laranja → Vermelho</option>
              <option value="bry">Azul → Amarelo → Vermelho</option>
            </select>
          </div>
        </div>
      </div>

      <div className="relative w-full h-[28rem] bg-muted rounded-lg mb-4">
        <div className="absolute inset-0 p-4">
          <div className="flex items-center justify-between mb-2">
            <div>
              <p className="text-muted-foreground mb-1">Visualização do Mapa</p>
              <p className="text-sm text-muted-foreground">{months[timeIndex] || 'Carregando...'}</p>
            </div>
          </div>

          {/* Leaflet map with heat layer */}
          <div className="w-full h-[calc(100%-48px)] overflow-hidden rounded">
            {grid.bounds ? (
              <MapContainer
                style={{ width: '100%', height: '100%' }}
                center={[ (grid.bounds.minLat + grid.bounds.maxLat)/2, (grid.bounds.minLon + grid.bounds.maxLon)/2 ]}
                zoom={5}
                scrollWheelZoom={false}
              >
                <TileLayer
                  attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                  url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                />
                  <HeatmapLayer points={points} max={grid.max} bounds={grid.bounds} radius={radius} blur={blur} gradient={gradients[palette]} />
              </MapContainer>
            ) : (
              <div className="w-full h-full flex items-center justify-center text-sm text-muted-foreground">Sem coordenadas válidas para este período.</div>
            )}
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
