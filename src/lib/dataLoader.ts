import type { AccidentData } from './mockData';

function parseNumber(value: string | undefined): number {
  if (!value) return 0;
  // replace comma decimal separators
  const v = value.replace(',', '.').trim();
  const n = Number(v);
  return Number.isFinite(n) ? n : 0;
}

export async function loadAccidentData(limit?: number): Promise<AccidentData[]> {
  const res = await fetch('/data/acidentes_2017_2025_tratado.csv');
  if (!res.ok) throw new Error('Failed to fetch accident CSV');

  const text = await res.text();
  const lines = text.split(/\r?\n/).filter((l) => l.trim().length > 0);
  if (lines.length <= 1) return [];

  const header = lines[0].split(';').map((h) => h.trim());
  const rows = lines.slice(1, limit ? 1 + limit : undefined);

  const idx: Record<string, number> = {};
  header.forEach((h, i) => (idx[h] = i));

  const data: AccidentData[] = rows.map((row, i) => {
    const cols = row.split(';');
    const id = cols[idx['id']] || `row-${i}`;
    // Prefer the `data_inversa` (YYYY-MM-DD) field and use `horario` (HH:MM) when present
    // to construct a local Date (avoid interpreting 'YYYY-MM-DD' as UTC which shifts hours).
    let date: Date;
    const dataInversa = idx['data_inversa'] !== undefined ? (cols[idx['data_inversa']] || '').trim() : '';
    const horario = idx['horario'] !== undefined ? (cols[idx['horario']] || '').trim() : '';

    if (dataInversa) {
      // parse YYYY-MM-DD
      const m = dataInversa.match(/^(\d{4})-(\d{2})-(\d{2})$/);
      if (m) {
        const y = Number(m[1]);
        const mo = Number(m[2]) - 1;
        const d = Number(m[3]);
        let h = 0;
        let min = 0;
        if (horario) {
          const hm = horario.match(/^(\d{1,2}):(\d{2})/);
          if (hm) {
            h = Number(hm[1]);
            min = Number(hm[2]);
          }
        }
        // Use Date(y, mo, d, h, min) to construct local datetime
        date = new Date(y, mo, d, h, min);
      } else if (idx['data_horario'] !== undefined) {
        const rawDateTime = cols[idx['data_horario']];
        date = rawDateTime ? new Date(rawDateTime.trim()) : new Date();
      } else {
        // fallback: try constructing from the string (last resort)
        date = new Date(dataInversa);
      }
    } else if (idx['data_horario'] !== undefined) {
      const raw = cols[idx['data_horario']];
      date = raw ? new Date(raw.trim()) : new Date();
    } else {
      date = new Date();
    }

    return {
      id_acidente: id,
      data_hora: date,
      uf: (cols[idx['uf']] || '').trim(),
      br: (cols[idx['br']] || '').trim(),
      latitude: parseNumber(cols[idx['latitude']]),
      longitude: parseNumber(cols[idx['longitude']]),
      tipo_acidente: (cols[idx['tipo_acidente']] || '').trim(),
      causa_acidente: (cols[idx['causa_acidente']] || '').trim(),
      tipo_pista: (cols[idx['tipo_pista']] || '').trim(),
      condicao_climatica: (cols[idx['condicao_metereologica']] || '').trim(),
      feridos_leves: Math.round(parseNumber(cols[idx['feridos_leves']])),
      feridos_graves: Math.round(parseNumber(cols[idx['feridos_graves']])),
      mortos: Math.round(parseNumber(cols[idx['mortos']])),
    } as AccidentData;
  });

  return data;
}
