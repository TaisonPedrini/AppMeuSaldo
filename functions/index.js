// Cloud Function usada pela leitura de cupom fiscal (UC09 / RF011).
// O navegador não consegue ler a página da SEFAZ direto (a SEFAZ não libera CORS), então esta função
// busca a consulta pública da NFC-e a partir do QR Code e devolve só emitente, valor e data em JSON.
//
// GET /consultarCupom?qr=<conteúdo do QR Code>
// 200 { emitente, valor (centavos), data (AAAA-MM-DD) } · 400 QR inválido · 502 SEFAZ fora do ar ou leiaute desconhecido
import { onRequest } from 'firebase-functions/v2/https';
import { logger } from 'firebase-functions';
import { extrairDadosDaNota, urlDeConsultaPermitida } from './sefaz.js';

const TEMPO_LIMITE_MS = 8000;

const MAXIMO_REDIRECIONAMENTOS = 3;

/** Segue redirecionamentos só enquanto continuarem em domínios .gov.br. */
async function buscar(url) {
  const sinal = AbortSignal.timeout(TEMPO_LIMITE_MS);
  let atual = new URL(url);
  for (let i = 0; i <= MAXIMO_REDIRECIONAMENTOS; i++) {
    const resposta = await fetch(atual, {
      signal: sinal,
      redirect: 'manual',
      headers: { 'User-Agent': 'Mozilla/5.0 (compatible; MeuSaldo/1.0)', Accept: 'text/html' },
    });
    const destino = resposta.headers.get('location');
    if (resposta.status < 300 || resposta.status >= 400 || !destino) return resposta;
    atual = new URL(destino, atual);
    if (!['http:', 'https:'].includes(atual.protocol) || !atual.hostname.endsWith('.gov.br')) {
      throw new Error(`Redirecionamento para fora da SEFAZ: ${atual.hostname}`);
    }
  }
  throw new Error('Redirecionamentos demais');
}

async function baixarPagina(url) {
  const resposta = await buscar(url);
  if (!resposta.ok) throw new Error(`SEFAZ respondeu ${resposta.status}`);
  // Alguns portais ainda servem ISO-8859-1.
  const charset = /charset=([\w-]+)/i.exec(resposta.headers.get('content-type') ?? '')?.[1] ?? 'utf-8';
  const bytes = await resposta.arrayBuffer();
  try {
    return new TextDecoder(charset).decode(bytes);
  } catch {
    return new TextDecoder('utf-8').decode(bytes);
  }
}

export const consultarCupom = onRequest(
  { region: 'southamerica-east1', cors: true, maxInstances: 5, timeoutSeconds: 15, memory: '256MiB' },
  async (req, res) => {
    if (req.method !== 'GET') {
      res.status(405).json({ erro: 'Use GET.' });
      return;
    }
    const url = urlDeConsultaPermitida(req.query.qr);
    if (!url) {
      res.status(400).json({ erro: 'QR Code não é de uma NFC-e.' });
      return;
    }
    try {
      const dados = extrairDadosDaNota(await baixarPagina(url.href));
      if (dados.valor == null && dados.data == null) {
        logger.warn('Leiaute da consulta não reconhecido', { host: url.hostname });
        res.status(502).json({ erro: 'Não foi possível ler a página da SEFAZ.' });
        return;
      }
      res.set('Cache-Control', 'private, max-age=86400').json(dados);
    } catch (erro) {
      logger.warn('Falha ao consultar a SEFAZ', { host: url.hostname, motivo: String(erro) });
      res.status(502).json({ erro: 'A SEFAZ não respondeu.' });
    }
  },
);
