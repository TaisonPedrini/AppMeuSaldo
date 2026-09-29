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

// UC05 passo 8: alerta quando o valor utilizado atinge o limite.
// Para avisar antes (RF018, "se aproxima do limite"), reduza, por exemplo, para 0.8.
export const PERCENTUAL_ALERTA = 1;

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

    return protegido(() => runTransaction(db, async (tx) => {
      // Transações exigem todas as leituras antes das gravações.
      const [orcamentoSnap, grupoSnap] = await Promise.all([tx.get(orcamentoRef), tx.get(grupoRef)]);

      tx.set(despesaRef, { ...despesa.toFirestore(), criadoEm: serverTimestamp() });

      for (const divisao of divisoes) {
        tx.set(doc(collection(despesaRef, 'divisoes')), divisao.toFirestore());
        if (despesa.classificacao === Classificacao.TERCEIRO) {
          tx.update(doc(grupoRef, 'terceiros', divisao.terceiroId), { saldoDevedor: increment(divisao.valor) });
        }
      }

      if (orcamentoSnap.exists()) {
        const orcamento = Orcamento.fromFirestore(orcamentoSnap.id, orcamentoSnap.data());
        const gatilho = orcamento.limite * PERCENTUAL_ALERTA;
        const depois = orcamento.valorUtilizado + despesa.valor;
        tx.update(orcamentoRef, { valorUtilizado: increment(despesa.valor) });

        if (orcamento.valorUtilizado < gatilho && depois >= gatilho) {
          const mensagem = `O orçamento da categoria chegou a ${formatarMoeda(depois)} de ${formatarMoeda(orcamento.limite)} neste mês.`;
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
