import { Calendar, Filter } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { FILTER_OPTIONS } from "@/lib/mockData";

export interface Filters {
  ufs: string[];
  brs: string[];
  tiposAcidente: string[];
  causas: string[];
  tiposPista: string[];
  condicoesClima: string[];
  dateRange: { start: Date; end: Date };
}

interface FilterPanelProps {
  filters: Filters;
  onFiltersChange: (filters: Filters) => void;
}

export function FilterPanel({ filters, onFiltersChange }: FilterPanelProps) {
  const toggleFilter = (category: keyof Omit<Filters, 'dateRange'>, value: string) => {
    const currentValues = filters[category] as string[];
    const newValues = currentValues.includes(value)
      ? currentValues.filter((v) => v !== value)
      : [...currentValues, value];
    
    onFiltersChange({ ...filters, [category]: newValues });
  };

  const clearAllFilters = () => {
    onFiltersChange({
      ufs: [],
      brs: [],
      tiposAcidente: [],
      causas: [],
      tiposPista: [],
      condicoesClima: [],
      dateRange: { start: new Date('2022-01-01'), end: new Date('2024-12-31') },
    });
  };

  return (
    <Card className="h-full border-border">
      <div className="p-4 border-b border-border">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-2">
            <Filter className="h-5 w-5 text-primary" />
            <h2 className="text-lg font-semibold text-foreground">Filtros</h2>
          </div>
          <Button variant="ghost" size="sm" onClick={clearAllFilters}>
            Limpar
          </Button>
        </div>
      </div>

      <ScrollArea className="h-[calc(100vh-12rem)]">
        <div className="p-4 space-y-6">
          <FilterSection
            title="Estados (UF)"
            options={FILTER_OPTIONS.ufs}
            selected={filters.ufs}
            onToggle={(value) => toggleFilter('ufs', value)}
          />

          <Separator />

          <FilterSection
            title="Rodovias (BR)"
            options={FILTER_OPTIONS.brs}
            selected={filters.brs}
            onToggle={(value) => toggleFilter('brs', value)}
          />

          <Separator />

          <FilterSection
            title="Tipo de Acidente"
            options={FILTER_OPTIONS.tiposAcidente}
            selected={filters.tiposAcidente}
            onToggle={(value) => toggleFilter('tiposAcidente', value)}
          />

          <Separator />

          <FilterSection
            title="Causa do Acidente"
            options={FILTER_OPTIONS.causas}
            selected={filters.causas}
            onToggle={(value) => toggleFilter('causas', value)}
          />

          <Separator />

          <FilterSection
            title="Tipo de Pista"
            options={FILTER_OPTIONS.tiposPista}
            selected={filters.tiposPista}
            onToggle={(value) => toggleFilter('tiposPista', value)}
          />

          <Separator />

          <FilterSection
            title="Condição Climática"
            options={FILTER_OPTIONS.condicoesClima}
            selected={filters.condicoesClima}
            onToggle={(value) => toggleFilter('condicoesClima', value)}
          />
        </div>
      </ScrollArea>
    </Card>
  );
}

interface FilterSectionProps {
  title: string;
  options: string[];
  selected: string[];
  onToggle: (value: string) => void;
}

function FilterSection({ title, options, selected, onToggle }: FilterSectionProps) {
  return (
    <div className="space-y-3">
      <h3 className="font-medium text-sm text-foreground">{title}</h3>
      <div className="space-y-2">
        {options.map((option) => (
          <div key={option} className="flex items-center space-x-2">
            <Checkbox
              id={`${title}-${option}`}
              checked={selected.includes(option)}
              onCheckedChange={() => onToggle(option)}
            />
            <Label
              htmlFor={`${title}-${option}`}
              className="text-sm text-muted-foreground cursor-pointer"
            >
              {option}
            </Label>
          </div>
        ))}
      </div>
    </div>
  );
}
