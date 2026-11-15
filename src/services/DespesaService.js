// Regras de gravação da despesa (UC05, passos 5 a 8), numa única transação:
// despesa + divisões + saldo devedor dos terceiros + consumo do orçamento + alerta + log.
import { db, collection, doc, runTransaction, increment, serverTimestamp } from '../lib/firebase.js';
import { ErroValidacao, protegido } from '../core/erros.js';
import { Classificacao } from '../models/enums.js';
import { Orcamento } from '../models/Orcamento.js';
import { Notificacao } from '../models/Notificacao.js';
import { periodoDe } from '../utils/data.js';
import { formatarMoeda } from '../utils/moeda.js';
import { registrarLogEm } from './AuditoriaService.js';

// Alertas de orçamento: ao se aproximar do limite (RF018) e ao atingi-lo (UC05, passo 8).
// Cada despesa gera no máximo um alerta: o do maior limiar que ela fez o consumo ultrapassar.
export const LIMIARES_ALERTA = [0.8, 1];

/** Mensagem do alerta quando o consumo passa de `antes` para `depois` (centavos); null se nenhum limiar foi cruzado. */
export function mensagemDeAlerta(nomeCategoria, limite, antes, depois) {
  const cruzados = LIMIARES_ALERTA.filter((limiar) => antes < limite * limiar && depois >= limite * limiar);
  if (!cruzados.length) return null;
  const percentual = Math.round((depois / limite) * 100);
  const situacao = cruzados.at(-1) >= 1 ? 'atingiu o limite' : `chegou a ${percentual}% do limite`;
  return `${nomeCategoria} ${situacao}: ${formatarMoeda(depois)} de ${formatarMoeda(limite)} neste mês.`;
}

export class DespesaService {
  constructor(grupoId) {
    this.grupoId = grupoId;
  }

  /**
   * @param {import('../models/Despesa.js').Despesa} despesa
   * @param {import('../models/DivisaoDespesa.js').DivisaoDespesa[]} divisoes partes atribuídas a terceiros
   * @returns {Promise<string>} id da despesa
   */
  async cadastrar(despesa, divisoes = []) {
    this.validar(despesa, divisoes);

    const { grupoId } = this;
    const grupoRef = doc(db, 'grupos', grupoId);
    const despesaRef = doc(collection(grupoRef, 'despesas'));
    const orcamentoRef = doc(grupoRef, 'orcamentos', Orcamento.idPara(despesa.categoriaId, periodoDe(despesa.data)));
    const categoriaRef = doc(grupoRef, 'categorias', despesa.categoriaId);

    return protegido(() => runTransaction(db, async (tx) => {
      // Transações exigem todas as leituras antes das gravações.
      const [orcamentoSnap, grupoSnap, categoriaSnap] = await Promise.all([
        tx.get(orcamentoRef), tx.get(grupoRef), tx.get(categoriaRef),
      ]);

      tx.set(despesaRef, { ...despesa.toFirestore(), criadoEm: serverTimestamp() });

      for (const divisao of divisoes) {
        tx.set(doc(collection(despesaRef, 'divisoes')), divisao.toFirestore());
        if (despesa.classificacao === Classificacao.TERCEIRO) {
          tx.update(doc(grupoRef, 'terceiros', divisao.terceiroId), { saldoDevedor: increment(divisao.valor) });
        }
      }

      if (orcamentoSnap.exists()) {
        const orcamento = Orcamento.fromFirestore(orcamentoSnap.id, orcamentoSnap.data());
        const depois = orcamento.valorUtilizado + despesa.valor;
        tx.update(orcamentoRef, { valorUtilizado: increment(despesa.valor) });

        const nomeCategoria = categoriaSnap.exists() ? categoriaSnap.data().nome : 'A categoria';
        const mensagem = mensagemDeAlerta(nomeCategoria, orcamento.limite, orcamento.valorUtilizado, depois);
        if (mensagem) {
          for (const usuarioId of grupoSnap.data().membros) {
            const alerta = new Notificacao({ mensagem, usuarioId, orcamentoId: orcamento.id });
            tx.set(doc(collection(grupoRef, 'notificacoes')), { ...alerta.toFirestore(), data: serverTimestamp() });
          }
        }
      }

      registrarLogEm(tx, grupoId, 'CRIAR', 'Despesa', despesaRef.id);
      return despesaRef.id;
    }), 'Não foi possível salvar a despesa. Verifique sua conexão e tente novamente; os dados do formulário foram mantidos.');
  }

  validar(despesa, divisoes) {
    const erros = [
      ...despesa.validar(),
      // Campos da divisão aparecem no formulário com o prefixo "divisao.".
      ...divisoes.flatMap((d) => d.validar().map((e) => ({ ...e, campo: `divisao.${e.campo}` }))),
    ];

    const totalDividido = divisoes.reduce((soma, d) => soma + (d.valor ?? 0), 0);
    if (Number.isInteger(despesa.valor) && totalDividido > despesa.valor) {
      erros.push({ campo: 'divisao.valor', mensagem: 'A parte do terceiro não pode ser maior que o valor da despesa.' });
    }
    if (despesa.classificacao === Classificacao.TERCEIRO && divisoes.length === 0) {
      erros.push({ campo: 'divisao.terceiroId', mensagem: 'Informe o terceiro.' });
    }

    if (erros.length) throw new ErroValidacao(erros);
  }
}
