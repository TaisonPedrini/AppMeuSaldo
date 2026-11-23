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

const PALAVRAS_MINUSCULAS = new Set(['da', 'de', 'do', 'das', 'dos', 'e']);
const SIGLAS = new Set(['ltda', 'me', 'epp', 'sa', 's/a', 'eireli', 'cia']);

/**
 * Nome de empresa como aparece na nota, sem caixa alta e sem o sufixo societário:
 * "SUPERMERCADO BOM PRECO DE SC LTDA" → "Supermercado Bom Preco de SC".
 */
export function nomeDeEmpresa(razaoSocial) {
  const palavras = String(razaoSocial ?? '').trim().split(/\s+/).filter(Boolean);
  while (palavras.length > 1 && SIGLAS.has(palavras.at(-1).toLowerCase().replace(/[.\-]/g, ''))) palavras.pop();
  return palavras
    .map((palavra, i) => {
      const minuscula = palavra.toLocaleLowerCase('pt-BR');
      if (i > 0 && PALAVRAS_MINUSCULAS.has(minuscula)) return minuscula;
      if (palavra.length === 2 && /^[A-Z]{2}$/.test(palavra)) return palavra; // UF ou sigla curta
      return minuscula.charAt(0).toLocaleUpperCase('pt-BR') + minuscula.slice(1);
    })
    .join(' ');
}
