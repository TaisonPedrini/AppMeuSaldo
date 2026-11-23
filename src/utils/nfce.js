// Interpretação do QR Code impresso no cupom fiscal eletrônico (UC09 / RF011).
// Formatos aceitos:
// - NFC-e versão 2 e 3 (NT 2015.002 e posteriores): URL da SEFAZ com ?p=chave|versao|ambiente|...
//     emissão normal:        p=chave|versao|ambiente|idCSC|hash
//     emissão em contingência: p=chave|versao|ambiente|dia|valor|digVal|idCSC|hash
// - NFC-e versão 1 (antiga): URL com chNFe, dhEmi (data em hexadecimal) e vNF.
// - CF-e SAT (São Paulo): chave|AAAAMMDDHHMMSS|valor|documento|assinatura
//
// Só a contingência, a versão 1 e o SAT trazem valor e data no próprio QR Code. Na emissão normal,
// que é a mais comum, valor e data ficam na página da SEFAZ (consultada por CupomFiscalService).

const UF_POR_CODIGO = {
  11: 'RO', 12: 'AC', 13: 'AM', 14: 'RR', 15: 'PA', 16: 'AP', 17: 'TO',
  21: 'MA', 22: 'PI', 23: 'CE', 24: 'RN', 25: 'PB', 26: 'PE', 27: 'AL', 28: 'SE', 29: 'BA',
  31: 'MG', 32: 'ES', 33: 'RJ', 35: 'SP',
  41: 'PR', 42: 'SC', 43: 'RS',
  50: 'MS', 51: 'MT', 52: 'GO', 53: 'DF',
};

/** Dígito verificador da chave de acesso (módulo 11, pesos 2 a 9 da direita para a esquerda). */
export function chaveDeAcessoValida(chave) {
  if (!/^\d{44}$/.test(chave ?? '')) return false;
  let soma = 0;
  let peso = 2;
  for (let i = 42; i >= 0; i--) {
    soma += Number(chave[i]) * peso;
    peso = peso === 9 ? 2 : peso + 1;
  }
  const resto = soma % 11;
  const dv = resto < 2 ? 0 : 11 - resto;
  return dv === Number(chave[43]);
}

/** Campos fixos da chave de acesso de 44 dígitos. */
export function decomporChave(chave) {
  return {
    uf: UF_POR_CODIGO[chave.slice(0, 2)] ?? null,
    anoMes: `20${chave.slice(2, 4)}-${chave.slice(4, 6)}`,
    cnpj: chave.slice(6, 20),
    modelo: chave.slice(20, 22),
    serie: Number(chave.slice(22, 25)),
    numero: Number(chave.slice(25, 34)),
  };
}

/** "12.34" → 1234 centavos. Aceita ponto ou vírgula como separador decimal. */
function centavosDe(texto) {
  const normalizado = String(texto ?? '').trim().replace(',', '.');
  if (!/^\d+(\.\d{1,2})?$/.test(normalizado)) return null;
  const [inteiro, decimal = ''] = normalizado.split('.');
  return Number(inteiro) * 100 + Number(decimal.padEnd(2, '0'));
}

function dataValida(iso) {
  const data = new Date(`${iso}T00:00:00Z`);
  return !Number.isNaN(data.getTime()) && data.toISOString().slice(0, 10) === iso;
}

/** O dhEmi da versão 1 é o texto "AAAA-MM-DDThh:mm:ss-03:00" codificado em hexadecimal. */
function dataDeHex(hex) {
  if (!/^[0-9a-f]+$/i.test(hex ?? '') || hex.length % 2) return null;
  const texto = hex.match(/../g).map((par) => String.fromCharCode(parseInt(par, 16))).join('');
  const iso = texto.slice(0, 10);
  return /^\d{4}-\d{2}-\d{2}$/.test(iso) && dataValida(iso) ? iso : null;
}

function interpretarSat(texto) {
  const partes = texto.split('|');
  const chave = partes[0].replace(/\D/g, '');
  if (partes.length < 3 || !chaveDeAcessoValida(chave)) return null;
  const [, dataHora, valor] = partes;
  const iso = /^\d{14}$/.test(dataHora) ? `${dataHora.slice(0, 4)}-${dataHora.slice(4, 6)}-${dataHora.slice(6, 8)}` : null;
  return {
    tipo: 'CFE_SAT',
    chave,
    ...decomporChave(chave),
    url: null,
    data: iso && dataValida(iso) ? iso : null,
    valor: centavosDe(valor),
  };
}

function interpretarUrl(texto) {
  let url;
  try {
    url = new URL(texto.trim());
  } catch {
    return null;
  }
  if (!['http:', 'https:'].includes(url.protocol)) return null;

  const p = url.searchParams.get('p');
  if (p) {
    const partes = p.split('|');
    const chave = partes[0];
    if (!chaveDeAcessoValida(chave)) return null;
    const dados = decomporChave(chave);
    let data = null;
    let valor = null;
    // Contingência: dia da emissão e valor total logo depois do ambiente.
    if (partes.length >= 8 && /^\d{2}$/.test(partes[3])) {
      const iso = `${dados.anoMes}-${partes[3]}`;
      data = dataValida(iso) ? iso : null;
      valor = centavosDe(partes[4]);
    }
    return { tipo: 'NFCE', chave, ...dados, url: url.href, data, valor };
  }

  const chave = url.searchParams.get('chNFe');
  if (chave && chaveDeAcessoValida(chave)) {
    return {
      tipo: 'NFCE',
      chave,
      ...decomporChave(chave),
      url: url.href,
      data: dataDeHex(url.searchParams.get('dhEmi')),
      valor: centavosDe(url.searchParams.get('vNF')),
    };
  }
  return null;
}

/**
 * Lê o conteúdo do QR Code do cupom.
 * @returns {{ tipo: 'NFCE'|'CFE_SAT', chave: string, uf: string|null, anoMes: string, cnpj: string,
 *   modelo: string, serie: number, numero: number, url: string|null, data: string|null, valor: number|null } | null}
 *   null quando o texto não é de um cupom fiscal. valor em centavos, data em ISO.
 */
export function interpretarQrCodeCupom(texto) {
  const conteudo = String(texto ?? '').trim();
  if (!conteudo) return null;
  if (/^https?:\/\//i.test(conteudo)) return interpretarUrl(conteudo);
  if (/^(CFe)?\d{44}\|/.test(conteudo)) return interpretarSat(conteudo);
  return null;
}
