// Datas são guardadas como texto ISO "AAAA-MM-DD" (sem fuso) e exibidas como DD/MM/AAAA (RNF003).

/** "2026-09-29" → "29/09/2026" */
export function formatarData(iso) {
  if (!iso) return '';
  const [ano, mes, dia] = iso.split('-');
  return `${dia}/${mes}/${ano}`;
}

/** Data de hoje no fuso local, em ISO. */
export function hojeISO() {
  const agora = new Date();
  return new Date(agora.getTime() - agora.getTimezoneOffset() * 60000).toISOString().slice(0, 10);
}

/** "2026-09-29" → "2026-09" (período de orçamento). */
export function periodoDe(iso) {
  return iso.slice(0, 7);
}

/** Milissegundos → "29/09/2026 14:32" (RNF003). */
export function formatarDataHora(ms) {
  if (ms == null) return '';
  const d = new Date(ms);
  const doisDigitos = (n) => String(n).padStart(2, '0');
  return `${doisDigitos(d.getDate())}/${doisDigitos(d.getMonth() + 1)}/${d.getFullYear()} ${doisDigitos(d.getHours())}:${doisDigitos(d.getMinutes())}`;
}

const MESES = ['janeiro', 'fevereiro', 'março', 'abril', 'maio', 'junho', 'julho', 'agosto', 'setembro', 'outubro', 'novembro', 'dezembro'];

/** "2026-09" → "setembro de 2026" */
export function nomeDoMes(periodo) {
  const [ano, mes] = periodo.split('-').map(Number);
  return `${MESES[mes - 1]} de ${ano}`;
}

/** "2026-11" + 1 → "2026-12"; "2026-01" − 1 → "2025-12". */
export function somarMeses(periodo, quantidade) {
  const [ano, mes] = periodo.split('-').map(Number);
  const total = ano * 12 + (mes - 1) + quantidade;
  return `${Math.floor(total / 12)}-${String((total % 12) + 1).padStart(2, '0')}`;
}

/** "2026-11" → "Novembro de 2026" (para títulos e seletores). */
export function nomeDoMesTitulo(periodo) {
  const nome = nomeDoMes(periodo);
  return nome.charAt(0).toUpperCase() + nome.slice(1);
}

/**
 * Primeiro e último dia possíveis do mês, para consultas por faixa de data ISO.
 * "-31" funciona para qualquer mês porque a comparação é de texto.
 */
export function faixaDoMes(periodo) {
  return [`${periodo}-01`, `${periodo}-31`];
}

export function dataISOValida(iso) {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(iso ?? '')) return false;
  const [ano, mes, dia] = iso.split('-').map(Number);
  const data = new Date(Date.UTC(ano, mes - 1, dia));
  return data.getUTCFullYear() === ano && data.getUTCMonth() === mes - 1 && data.getUTCDate() === dia;
}
