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

export function dataISOValida(iso) {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(iso ?? '')) return false;
  const [ano, mes, dia] = iso.split('-').map(Number);
  const data = new Date(Date.UTC(ano, mes - 1, dia));
  return data.getUTCFullYear() === ano && data.getUTCMonth() === mes - 1 && data.getUTCDate() === dia;
}
