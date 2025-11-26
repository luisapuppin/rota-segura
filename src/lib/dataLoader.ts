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

  // helper to find column by multiple possible header names (case-insensitive)
  const findCol = (candidates: string[]) => {
    const lower = header.map(h => h.toLowerCase());
    for (const name of candidates) {
      const i = lower.indexOf(name.toLowerCase());
      if (i !== -1) return i;
    }
    // try partial matches
    for (const name of candidates) {
      const i = lower.findIndex(h => h.includes(name.toLowerCase()));
      if (i !== -1) return i;
    }
    return -1;
  };

  const idIdx = idx['id'] ?? idx['id_acidente'] ?? findCol(['id_acidente', 'id', 'identificador']);
  const latIdx = idx['latitude'] ?? findCol(['latitude', 'lat', 'y', 'gps_lat']);
  const lonIdx = idx['longitude'] ?? findCol(['longitude', 'lon', 'lonfitude', 'lng', 'x', 'gps_lon']);
  const dataInversaIdx = idx['data_inversa'] ?? findCol(['data_inversa', 'data_invertida', 'data']);
  const horarioIdx = idx['horario'] ?? findCol(['horario', 'hora', 'hora_registro']);
  const dataHorarioIdx = idx['data_horario'] ?? findCol(['data_horario', 'data_hora', 'datetime']);
  const ufIdx = idx['uf'] ?? findCol(['uf', 'estado']);
  const brIdx = idx['br'] ?? findCol(['br', 'rodovia']);
  const tipoPistaIdx = idx['tipo_pista'] ?? findCol(['tipo_pista', 'pista']);
  const condClimaIdx = idx['condicao_metereologica'] ?? findCol(['condicao_metereologica', 'condicao_climatica', 'clima']);
  const tipoAcidenteIdx = idx['tipo_acidente'] ?? findCol(['tipo_acidente', 'tipo']);
  const causaIdx = idx['causa_acidente'] ?? findCol(['causa_acidente', 'causa']);
  const feridosLevesIdx = idx['feridos_leves'] ?? findCol(['feridos_leves', 'feridos_leve']);
  const feridosGravesIdx = idx['feridos_graves'] ?? findCol(['feridos_graves', 'feridos_grave']);
  const mortosIdx = idx['mortos'] ?? findCol(['mortos', 'obitos', 'óbitos']);

  const data: AccidentData[] = rows.map((row, i) => {
  const cols = row.split(';');
  const id = (idIdx !== -1 ? cols[idIdx] : cols[idx['id']]) || `row-${i}`;
  // Prefer the `data_inversa` (YYYY-MM-DD) field and use `horario` (HH:MM) when present
  // to construct a local Date (avoid interpreting 'YYYY-MM-DD' as UTC which shifts hours).
  let date: Date;
  const dataInversa = dataInversaIdx !== -1 ? (cols[dataInversaIdx] || '').trim() : '';
  const horario = horarioIdx !== -1 ? (cols[horarioIdx] || '').trim() : '';

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
      uf: (ufIdx !== -1 ? (cols[ufIdx] || '').trim() : ''),
      br: (brIdx !== -1 ? (cols[brIdx] || '').trim() : ''),
      latitude: latIdx !== -1 ? parseNumber(cols[latIdx]) : 0,
      longitude: lonIdx !== -1 ? parseNumber(cols[lonIdx]) : 0,
      tipo_acidente: tipoAcidenteIdx !== -1 ? (cols[tipoAcidenteIdx] || '').trim() : '',
      causa_acidente: causaIdx !== -1 ? (cols[causaIdx] || '').trim() : '',
      tipo_pista: tipoPistaIdx !== -1 ? (cols[tipoPistaIdx] || '').trim() : '',
      condicao_climatica: condClimaIdx !== -1 ? (cols[condClimaIdx] || '').trim() : '',
      feridos_leves: feridosLevesIdx !== -1 ? Math.round(parseNumber(cols[feridosLevesIdx])) : 0,
      feridos_graves: feridosGravesIdx !== -1 ? Math.round(parseNumber(cols[feridosGravesIdx])) : 0,
      mortos: mortosIdx !== -1 ? Math.round(parseNumber(cols[mortosIdx])) : 0,
    } as AccidentData;
  });

  return data;
}
