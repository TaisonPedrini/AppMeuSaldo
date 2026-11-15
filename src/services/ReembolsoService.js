// Registro de reembolso de terceiro (UC11 / RF008), numa única transação:
// grava o reembolso, abate o saldo devedor do terceiro e registra o log (RNF002).
import { db, collection, doc, runTransaction, increment, serverTimestamp } from '../lib/firebase.js';
import { ErroRegraNegocio, ErroValidacao, protegido } from '../core/erros.js';
import { Terceiro } from '../models/Terceiro.js';
import { formatarMoeda } from '../utils/moeda.js';
import { registrarLogEm } from './AuditoriaService.js';

export class ReembolsoService {
  constructor(grupoId) {
    this.grupoId = grupoId;
  }

  /**
   * @param {import('../models/Reembolso.js').Reembolso} reembolso
   * @returns {Promise<number>} novo saldo devedor do terceiro, em centavos
   */
  async registrar(reembolso) {
    const erros = reembolso.validar();
    if (erros.length) throw new ErroValidacao(erros);

    const terceiroRef = doc(db, 'grupos', this.grupoId, 'terceiros', reembolso.terceiroId);
    const reembolsoRef = doc(collection(terceiroRef, 'reembolsos'));

    return protegido(() => runTransaction(db, async (tx) => {
      const snapshot = await tx.get(terceiroRef);
      if (!snapshot.exists()) throw new ErroRegraNegocio('Este terceiro não foi encontrado. Volte para a lista de terceiros e tente de novo.');

      const terceiro = Terceiro.fromFirestore(snapshot.id, snapshot.data());
      if (reembolso.valor > terceiro.saldoDevedor) {
        throw new ErroValidacao([{
          campo: 'valor',
          mensagem: `O valor é maior que o saldo devedor de ${terceiro.nome} (${formatarMoeda(terceiro.saldoDevedor)}).`,
        }]);
      }

      tx.set(reembolsoRef, { ...reembolso.toFirestore(), criadoEm: serverTimestamp() });
      tx.update(terceiroRef, { saldoDevedor: increment(-reembolso.valor) });
      registrarLogEm(tx, this.grupoId, 'CRIAR', 'Reembolso', reembolsoRef.id);
      return terceiro.saldoDevedor - reembolso.valor;
    }), 'Não foi possível registrar o reembolso. Verifique sua conexão e tente novamente; os dados do formulário foram mantidos.');
  }
}
