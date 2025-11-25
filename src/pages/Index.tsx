                                                                                                                                                              import { useState, useMemo, useEffect } from "react";
import { FilterPanel, Filters } from "@/components/dashboard/FilterPanel";
import { KPICards } from "@/components/dashboard/KPICards";
import { TimeSeriesChart } from "@/components/dashboard/TimeSeriesChart";
import { TopHighwaysChart } from "@/components/dashboard/TopHighwaysChart";
import { TopStatesChart } from "@/components/dashboard/TopStatesChart";
import { HourlyDistributionChart } from "@/components/dashboard/HourlyDistributionChart";
import { WeeklyDistributionChart } from "@/components/dashboard/WeeklyDistributionChart";
import { HeatmapView } from "@/components/dashboard/HeatmapView";
import { loadAccidentData } from "@/lib/dataLoader";
import { BarChart3 } from "lucide-react";                                                                                                                                                                                                       

const Index = () => {
  const [filters, setFilters] = useState<Filters>({
    ufs: [],                                                                                                                      
    brs: [],
    tiposAcidente: [],
    causas: [],
    tiposPista: [],
    condicoesClima: [],
    // expand default range to cover dataset years
    dateRange: { start: new Date('2017-01-01'), end: new Date('2025-12-31') },
  });

  const [allData, setAllData] = useState<any[]>([]);

  // load real dataset from public/data
  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        const data = await loadAccidentData();
        if (mounted) setAllData(data);
      } catch (e) {
        // keep using empty dataset on error
        // eslint-disable-next-line no-console
        console.error('Failed to load accident data', e);
      }
    })();
    return () => {
      mounted = false;
    };
  }, []);

  const filterOptions = useMemo(() => {
    const ufs = Array.from(new Set(allData.map((d) => d.uf).filter(Boolean))).sort();
    const brs = Array.from(new Set(allData.map((d) => d.br).filter(Boolean))).sort();
    const tiposAcidente = Array.from(new Set(allData.map((d) => d.tipo_acidente).filter(Boolean))).sort();
    const causas = Array.from(new Set(allData.map((d) => d.causa_acidente).filter(Boolean))).sort();
    const tiposPista = Array.from(new Set(allData.map((d) => d.tipo_pista).filter(Boolean))).sort();
    const condicoesClima = Array.from(new Set(allData.map((d) => d.condicao_climatica).filter(Boolean))).sort();

    return { ufs, brs, tiposAcidente, causas, tiposPista, condicoesClima };
  }, [allData]);

  const filteredData = useMemo(() => {
    return allData.filter((accident) => {
      if (filters.ufs.length > 0 && !filters.ufs.includes(accident.uf)) return false;
      if (filters.brs.length > 0 && !filters.brs.includes(accident.br)) return false;
      if (filters.tiposAcidente.length > 0 && !filters.tiposAcidente.includes(accident.tipo_acidente)) return false;
      if (filters.causas.length > 0 && !filters.causas.includes(accident.causa_acidente)) return false;
      if (filters.tiposPista.length > 0 && !filters.tiposPista.includes(accident.tipo_pista)) return false;
      if (filters.condicoesClima.length > 0 && !filters.condicoesClima.includes(accident.condicao_climatica)) return false;

      const accidentDate = new Date(accident.data_hora);
      if (accidentDate < filters.dateRange.start || accidentDate > filters.dateRange.end) return false;

      return true;
    });
  }, [allData, filters]);

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b border-border bg-card">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-primary/10 rounded-lg">
              <BarChart3 className="h-6 w-6 text-primary" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-foreground">
                Dashboard de Acidentes Rodoviários
              </h1>
              <p className="text-sm text-muted-foreground">
                Monitoramento e análise de acidentes nas rodovias federais brasileiras
              </p>
            </div>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-6">
        <div className="flex gap-6">
          <aside className="w-80 flex-shrink-0 self-stretch">
            <FilterPanel filters={filters} onFiltersChange={setFilters} filterOptions={filterOptions} />
          </aside>

          <main className="flex-1 space-y-6">
            <KPICards data={filteredData} />

            <TimeSeriesChart data={filteredData} />

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <TopHighwaysChart data={filteredData} />
              <TopStatesChart data={filteredData} />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <HourlyDistributionChart data={filteredData} />
              <WeeklyDistributionChart data={filteredData} />
            </div>

            <HeatmapView data={filteredData} />
          </main>
        </div>
      </div>
    </div>
  );
};

export default Index;
