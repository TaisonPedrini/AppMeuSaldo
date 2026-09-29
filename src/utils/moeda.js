// Valores monetários são guardados em centavos (inteiro) para não perder precisão (RNF011).
const formatador = new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' });

/** 123456 → "R$ 1.234,56" */
export function formatarMoeda(centavos) {
  return formatador.format((centavos ?? 0) / 100);
}

/** "1.234,56" ou "R$ 1.234,56" → 123456. Retorna null se vazio ou com mais de duas casas decimais. */
export function paraCentavos(texto) {
  const limpo = String(texto ?? '').replace(/[^\d,]/g, '');
  if (!limpo) return null;
  const partes = limpo.split(',');
  if (partes.length > 2) return null;
  const [inteiro, decimal = ''] = partes;
  if (decimal.length > 2) return null;
  return Number(inteiro || '0') * 100 + Number(decimal.padEnd(2, '0'));
}

/** 123456 → "1234,56", para preencher campos de formulário. */
export function centavosParaCampo(centavos) {
  if (centavos == null) return '';
  return (centavos / 100).toFixed(2).replace('.', ',');
}
