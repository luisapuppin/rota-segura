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
  tiposPista: string[];
  condicoesClima: string[];
  dateRange: { start: Date; end: Date };
}

export interface FilterOptions {
  ufs: string[];
  brs: string[];
  tiposPista: string[];
  condicoesClima: string[];
}

interface FilterPanelProps {
  filters: Filters;
  onFiltersChange: (filters: Filters) => void;
  filterOptions?: FilterOptions;
}

export function FilterPanel({ filters, onFiltersChange, filterOptions }: FilterPanelProps) {
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

  <ScrollArea className="h-full">
        <div className="p-4 space-y-6">
          <FilterSection
            title="Estados (UF)"
            options={(filterOptions ?? FILTER_OPTIONS).ufs}
            selected={filters.ufs}
            onToggle={(value) => toggleFilter('ufs', value)}
            columns={4}
          />

          <Separator />

          <FilterSection
            title="Rodovias (BR)"
            options={(filterOptions ?? FILTER_OPTIONS).brs}
            selected={filters.brs}
            onToggle={(value) => toggleFilter('brs', value)}
            columns={4}
          />

          <Separator />

          

          <FilterSection
            title="Tipo de Pista"
            options={(filterOptions ?? FILTER_OPTIONS).tiposPista}
            selected={filters.tiposPista}
            onToggle={(value) => toggleFilter('tiposPista', value)}
            columns={3}
          />

          <Separator />

          <FilterSection
            title="Condição Climática"
            options={(filterOptions ?? FILTER_OPTIONS).condicoesClima}
            selected={filters.condicoesClima}
            onToggle={(value) => toggleFilter('condicoesClima', value)}
            columns={3}
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
  columns?: number;
}
function FilterSection({ title, options, selected, onToggle, columns = 1 }: FilterSectionProps) {
  // choose grid class based on requested columns — keep tailwind-friendly classes
  const gridClass = columns === 2
    ? 'grid grid-cols-2 gap-x-3 gap-y-2'
    : columns === 3
    ? 'grid grid-cols-3 gap-x-3 gap-y-2'
    : columns === 4
    ? 'grid grid-cols-4 gap-x-3 gap-y-2'
    : 'space-y-2';

  return (
    <div className="space-y-3">
      <h3 className="font-medium text-sm text-foreground">{title}</h3>
      <div className={gridClass}>
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
