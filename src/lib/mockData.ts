// Mock data generator for highway accidents dashboard

export interface AccidentData {
  id_acidente: string;
  data_hora: Date;
  uf: string;
  br: string;
  latitude: number;
  longitude: number;
  tipo_acidente: string;
  causa_acidente: string;
  tipo_pista: string;
  condicao_climatica: string;
  feridos_leves: number;
  feridos_graves: number;
  mortos: number;
}

const UFS = ['SP', 'RJ', 'MG', 'RS', 'PR', 'BA', 'SC', 'PE', 'CE', 'GO'];
const BRS = ['BR-101', 'BR-116', 'BR-040', 'BR-262', 'BR-153', 'BR-381', 'BR-050', 'BR-060', 'BR-277', 'BR-376'];
const TIPOS_ACIDENTE = [
  'Colisão traseira',
  'Colisão frontal',
  'Saída de pista',
  'Atropelamento',
  'Capotamento',
  'Colisão lateral'
];
const CAUSAS = [
  'Falta de atenção',
  'Velocidade incompatível',
  'Embriaguez',
  'Animais na pista',
  'Defeito mecânico',
  'Pista escorregadia'
];
const TIPOS_PISTA = ['Simples', 'Dupla', 'Múltipla'];
const CONDICOES_CLIMA = ['Sol', 'Chuva', 'Neblina', 'Vento'];

export function generateMockData(count: number = 5000): AccidentData[] {
  const data: AccidentData[] = [];
  const startDate = new Date('2022-01-01');
  const endDate = new Date('2024-12-31');

  for (let i = 0; i < count; i++) {
    const randomDate = new Date(
      startDate.getTime() + Math.random() * (endDate.getTime() - startDate.getTime())
    );

    data.push({
      id_acidente: `ACC-${String(i + 1).padStart(6, '0')}`,
      data_hora: randomDate,
      uf: UFS[Math.floor(Math.random() * UFS.length)],
      br: BRS[Math.floor(Math.random() * BRS.length)],
      latitude: -23 + Math.random() * 10,
      longitude: -50 + Math.random() * 10,
      tipo_acidente: TIPOS_ACIDENTE[Math.floor(Math.random() * TIPOS_ACIDENTE.length)],
      causa_acidente: CAUSAS[Math.floor(Math.random() * CAUSAS.length)],
      tipo_pista: TIPOS_PISTA[Math.floor(Math.random() * TIPOS_PISTA.length)],
      condicao_climatica: CONDICOES_CLIMA[Math.floor(Math.random() * CONDICOES_CLIMA.length)],
      feridos_leves: Math.floor(Math.random() * 5),
      feridos_graves: Math.floor(Math.random() * 3),
      mortos: Math.random() > 0.85 ? Math.floor(Math.random() * 3) : 0,
    });
  }

  return data;
}

export const FILTER_OPTIONS = {
  ufs: UFS,
  brs: BRS,
  tiposAcidente: TIPOS_ACIDENTE,
  causas: CAUSAS,
  tiposPista: TIPOS_PISTA,
  condicoesClima: CONDICOES_CLIMA,
};
