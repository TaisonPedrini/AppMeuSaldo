// Leitura da página de consulta pública da NFC-e.
// A maioria das SEFAZ usa o mesmo leiaute de consulta (padrão do portal nacional da NFC-e):
//   emitente  → <div class="txtTopo">RAZÃO SOCIAL</div>
//   total     → <label>Valor a pagar R$:</label> <span class="totalNumb txtMax">12,34</span>
//   emissão   → <strong> Emissão: </strong>23/11/2026 10:15:00
// Por isso a extração procura esses rótulos de texto, tolerando variações de marcação entre estados.

/** Só busca páginas de órgãos públicos, para a função não virar um proxy aberto. */
export function urlDeConsultaPermitida(texto) {
  let url;
  try {
    url = new URL(String(texto ?? '').trim());
  } catch {
    return null;
  }
  if (!['http:', 'https:'].includes(url.protocol)) return null;
  if (!url.hostname.endsWith('.gov.br')) return null;
  if (!url.searchParams.get('p') && !url.searchParams.get('chNFe')) return null;
  return url;
}

const ENTIDADES = { amp: '&', lt: '<', gt: '>', quot: '"', apos: "'", nbsp: ' ' };
// &Ccedil; → C + cedilha combinante → Ç (depois de normalize('NFC')).
const ACENTOS = { acute: '́', grave: '̀', circ: '̂', tilde: '̃', cedil: '̧', uml: '̈' };

function textoPuro(htmlTrecho) {
  return htmlTrecho
    .replace(/<[^>]*>/g, ' ')
    .replace(/&(#x?[0-9a-f]+|[a-z]+);/gi, (entidade, nome) => {
      if (nome[0] === '#') {
        const codigo = nome[1].toLowerCase() === 'x' ? parseInt(nome.slice(2), 16) : Number(nome.slice(1));
        return Number.isFinite(codigo) ? String.fromCodePoint(codigo) : entidade;
      }
      const acento = /^([a-z])(acute|grave|circ|tilde|cedil|uml)$/i.exec(nome);
      if (acento) return (acento[1] + ACENTOS[acento[2].toLowerCase()]).normalize('NFC');
      return ENTIDADES[nome.toLowerCase()] ?? entidade;
    })
    .replace(/\s+/g, ' ')
    .trim();
}

/** "1.234,56" → 123456 centavos. */
function centavosDe(texto) {
  const limpo = String(texto ?? '').replace(/\./g, '').replace(',', '.');
  if (!/^\d+(\.\d{1,2})?$/.test(limpo)) return null;
  const [inteiro, decimal = ''] = limpo.split('.');
  return Number(inteiro) * 100 + Number(decimal.padEnd(2, '0'));
}

function extrairEmitente(pagina) {
  const bloco = pagina.match(/class="[^"]*\btxtTopo\b[^"]*"[^>]*>([\s\S]*?)<\/div>/i);
  const nome = bloco ? textoPuro(bloco[1]) : null;
  return nome || null;
}

function extrairValor(texto) {
  const rotulos = [/Valor a pagar R\$:?\s*([\d.]+,\d{2})/i, /Valor total R\$:?\s*([\d.]+,\d{2})/i, /Valor Total da Nota:?\s*R?\$?\s*([\d.]+,\d{2})/i];
  for (const rotulo of rotulos) {
    const achado = texto.match(rotulo);
    if (achado) return centavosDe(achado[1]);
  }
  return null;
}

function extrairData(texto) {
  const achado = texto.match(/Emiss[ãa]o:?\s*(\d{2})\/(\d{2})\/(\d{4})/i);
  return achado ? `${achado[3]}-${achado[2]}-${achado[1]}` : null;
}

/**
 * @param {string} pagina HTML da consulta pública
 * @returns {{ emitente: string|null, valor: number|null, data: string|null }} valor em centavos, data em ISO
 */
export function extrairDadosDaNota(pagina) {
  const texto = textoPuro(pagina);
  return {
    emitente: extrairEmitente(pagina),
    valor: extrairValor(texto),
    data: extrairData(texto),
  };
}
