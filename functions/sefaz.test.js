import { test } from 'node:test';
import assert from 'node:assert/strict';
import { extrairDadosDaNota, urlDeConsultaPermitida } from './sefaz.js';

// Trecho no leiaute padrão da consulta pública da NFC-e (o mesmo usado por SC, RS, PR e outros).
const PAGINA = `
<div id="conteudo">
  <div class="txtCenter">
    <div id="u20" class="txtTopo">SUPERMERCADO BOM PRE&Ccedil;O LTDA</div>
    <div class="text">CNPJ: 12.345.678/0001-95</div>
  </div>
  <table id="tabResult"><tr id="Item + 1"><td><span class="txtTit">ARROZ 5KG</span></td>
    <td class="txtTit noWrap">Vl. Total<br><span class="valor">27,90</span></td></tr></table>
  <div id="totalNota" class="txtRight">
    <div id="linhaTotal"><label>Qtd. total de itens:</label><span class="totalNumb">2</span></div>
    <div id="linhaTotal"><label>Valor total R$:</label><span class="totalNumb">1.235,40</span></div>
    <div id="linhaTotal"><label>Descontos R$:</label><span class="totalNumb">1,00</span></div>
    <div id="linhaTotal" class="linhaShade"><label>Valor a pagar R$:</label><span class="totalNumb txtMax">1.234,40</span></div>
  </div>
  <div id="infos"><ul><li><strong>Número: </strong>1234 <strong>Série: </strong>1
    <strong> Emissão: </strong>21/11/2026 18:42:07 - Via Consumidor</li></ul></div>
</div>`;

test('extrai emitente, valor a pagar e data da emissão', () => {
  assert.deepEqual(extrairDadosDaNota(PAGINA), {
    emitente: 'SUPERMERCADO BOM PREÇO LTDA',
    valor: 123440,
    data: '2026-11-21',
  });
});

test('página sem os rótulos devolve campos nulos', () => {
  assert.deepEqual(extrairDadosDaNota('<html><body>Chave inválida</body></html>'), { emitente: null, valor: null, data: null });
});

test('só aceita endereços .gov.br com a chave da NFC-e', () => {
  assert.ok(urlDeConsultaPermitida('https://sat.sef.sc.gov.br/nfce/consulta?p=42261112345678000195650010000012341000012345|2|1|1|ABC'));
  assert.equal(urlDeConsultaPermitida('https://exemplo.com/nfce?p=123'), null);
  assert.equal(urlDeConsultaPermitida('https://sefaz.gov.br.exemplo.com/?p=1'), null);
  assert.equal(urlDeConsultaPermitida('https://sat.sef.sc.gov.br/nfce/consulta'), null);
  assert.equal(urlDeConsultaPermitida('file:///etc/passwd'), null);
});
