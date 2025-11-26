import { useEffect, useMemo, useRef } from "react";
import { MapContainer, TileLayer, useMap } from 'react-leaflet';
import L from 'leaflet';
// leaflet.heat plugin (adds L.heatLayer)
// @ts-ignore - plugin has no bundled TS types
import 'leaflet.heat';
import 'leaflet/dist/leaflet.css';
import { Card } from "@/components/ui/card";
import { AccidentData } from "@/lib/mockData";

interface HeatmapViewProps {
  data: AccidentData[];
}

/**
 * Simples Heatmap por lat/lon
 * - Agrega pontos por lat/lon arredondados (4 decimais)
 * - Renderiza leaflet.heat com gradiente azul -> amarelo -> vermelho
 * - Se blur === 0, mostra circleMarkers 'crisp' com tooltip de contagem
 */
export function HeatmapView({ data }: HeatmapViewProps) {
  // fixed heat options (UI controls removed per request)
  const radius = 25;
  const blur = 25;

  // aggregate points by rounded lat/lon
  const { points, max, bounds } = useMemo(() => {
    const bucket = new Map<string, { lat: number; lon: number; count: number }>();
    let minLat = Infinity, maxLat = -Infinity, minLon = Infinity, maxLon = -Infinity;

    for (const d of data) {
      const lat = Number(d.latitude);
      const lon = Number(d.longitude);
      if (!Number.isFinite(lat) || !Number.isFinite(lon)) continue;
      const key = `${lat.toFixed(4)},${lon.toFixed(4)}`;
      const exists = bucket.get(key);
      if (exists) {
        exists.count += 1;
      } else {
        bucket.set(key, { lat: Number(lat.toFixed(4)), lon: Number(lon.toFixed(4)), count: 1 });
      }
      if (lat < minLat) minLat = lat;
      if (lat > maxLat) maxLat = lat;
      if (lon < minLon) minLon = lon;
      if (lon > maxLon) maxLon = lon;
    }

    const pts: Array<[number, number, number]> = [];
    let maxCount = 0;
    for (const v of bucket.values()) {
      pts.push([v.lat, v.lon, v.count]);
      if (v.count > maxCount) maxCount = v.count;
    }

    if (!(minLat < Infinity && minLon < Infinity)) {
      return { points: [], max: 0, bounds: null };
    }

    // pad bounds a bit
    const latPad = (maxLat - minLat) * 0.03 || 0.1;
    const lonPad = (maxLon - minLon) * 0.03 || 0.1;
    const b = { minLat: minLat - latPad, maxLat: maxLat + latPad, minLon: minLon - lonPad, maxLon: maxLon + lonPad };

    return { points: pts, max: maxCount, bounds: b };
  }, [data]);

  const totalAccidents = data.length;
  const gradient = useMemo(() => ({ 0.0: '#0000ff', 0.5: '#ffff00', 1.0: '#ff0000' }), []);

  const validCoordsCount = useMemo(() => {
    return data.reduce((acc, d) => {
      const lat = Number(d.latitude);
      const lon = Number(d.longitude);
      if (Number.isFinite(lat) && Number.isFinite(lon) && Math.abs(lat) > 0.0001 && Math.abs(lon) > 0.0001) return acc + 1;
      return acc;
    }, 0);
  }, [data]);

  const sampleRows = data.slice(0, 10).map(d => ({ id: d.id_acidente, lat: d.latitude, lon: d.longitude }));

  // Heatmap layer that always renders a blurred heat layer (no markers)
  function HeatLayer({ points, radius, blur, max }: { points: Array<[number, number, number]>; radius: number; blur: number; max: number }) {
    const map = useMap();
    const layerRef = useRef<any | null>(null);

    useEffect(() => {
      if (!map) return;

      if (layerRef.current) {
        try { map.removeLayer(layerRef.current); } catch (e) { /* ignore */ }
        layerRef.current = null;
      }

      if (!points || points.length === 0) return;

      // ensure plugin is available
      if (typeof (L as any).heatLayer !== 'function') {
        // eslint-disable-next-line no-console
        console.error('leaflet.heat plugin not available on L. Ensure leaflet.heat is installed and imported.');
      }
      // @ts-ignore
      const heat = (L as any).heatLayer(points.map(p => [p[0], p[1], p[2]]), { radius, blur, max: max || undefined, gradient });
      heat.addTo(map);
      layerRef.current = heat;

      try {
        const latLngs = points.map(p => [p[0], p[1]] as [number, number]);
        map.fitBounds(latLngs as any, { padding: [20, 20] });
      } catch (e) { /* ignore */ }

      return () => {
        if (layerRef.current) {
          try { map.removeLayer(layerRef.current); } catch (e) { /* ignore */ }
          layerRef.current = null;
        }
      };
    }, [map, JSON.stringify(points), radius, blur, max]);

    return null;
  }

  return (
    <Card className="p-6 border-border">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-foreground">Mapa de Calor (lat/lon)</h3>
        <div />
      </div>

      <div className="relative w-full h-[32rem] bg-muted rounded-lg mb-4">
        <div className="absolute inset-0 p-4">
          <div className="w-full h-full overflow-hidden rounded">
            {points && points.length > 0 && bounds ? (
              <MapContainer
                key={`map-${bounds.minLat}-${bounds.minLon}-${bounds.maxLat}-${bounds.maxLon}`}
                style={{ width: '100%', height: '100%' }}
                center={[ (bounds.minLat + bounds.maxLat)/2, (bounds.minLon + bounds.maxLon)/2 ]}
                zoom={6}
                scrollWheelZoom={false}
              >
                <TileLayer
                  attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                  url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                />
                <HeatLayer points={points} radius={radius} blur={blur} max={max} />
              </MapContainer>
            ) : (
              <div className="w-full h-full flex flex-col items-center justify-center text-sm text-muted-foreground">
                <div>Sem coordenadas válidas.</div>
                <div className="mt-2">Total de registros carregados: {totalAccidents}</div>
                <div className="mt-1">Pontos agregados: {points.length}</div>
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="text-sm text-muted-foreground">Legenda: gradiente Azul → Amarelo → Vermelho representa menor → maior concentração de acidentes.</div>

      <div className="mt-3 p-3 bg-muted rounded text-sm">
        <div><strong>Diagnóstico:</strong></div>
        <div>Total de registros: {totalAccidents}</div>
        <div>Registros com coordenadas válidas: {validCoordsCount}</div>
        <div>Pontos agregados (buckets): {points.length}</div>

        <div className="mt-2">
          <div className="font-medium">Amostra (primeiras 10 linhas):</div>
          <div className="overflow-auto max-h-40 mt-1">
            <table className="w-full text-xs">
              <thead>
                <tr><th className="text-left">id</th><th className="text-left">lat</th><th className="text-left">lon</th></tr>
              </thead>
              <tbody>
                {sampleRows.map((r, i) => (
                  <tr key={i}><td>{r.id}</td><td>{String(r.lat)}</td><td>{String(r.lon)}</td></tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </Card>
  );
}
