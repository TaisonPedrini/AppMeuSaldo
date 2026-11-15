/**
 * Primeiro nome com só a inicial maiúscula, para saudações:
 * "GUSTAVO DA SILVA" → "Gustavo"; "maria clara" → "Maria".
 */
export function primeiroNome(nome) {
  const primeiro = String(nome ?? '').trim().split(/\s+/)[0] ?? '';
  return primeiro.charAt(0).toLocaleUpperCase('pt-BR') + primeiro.slice(1).toLocaleLowerCase('pt-BR');
}

/** "Thiago Silva" → "TS"; "Ana" → "A". Usado nos avatares. */
export function iniciais(nome) {
  const partes = String(nome ?? '').trim().split(/\s+/).filter(Boolean);
  return ((partes[0]?.[0] ?? '') + (partes.length > 1 ? partes.at(-1)[0] : '')).toUpperCase() || '?';
}
