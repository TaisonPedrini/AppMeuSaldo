// Repositório de uma subcoleção de grupos/{grupoId}, com log de auditoria (RNF002).
import { Repository } from './Repository.js';
import { where } from '../lib/firebase.js';
import { registrarLog } from '../services/AuditoriaService.js';
import { faixaDoMes } from '../utils/data.js';

export class RepositorioDoGrupo extends Repository {
  /** @param {string|string[]} subcolecao ex.: 'despesas' ou ['terceiros', terceiroId, 'reembolsos'] */
  constructor(grupoId, subcolecao, Model) {
    super(['grupos', grupoId, ...[].concat(subcolecao)], Model);
    this.grupoId = grupoId;
  }

  /**
   * Todos os documentos do mês ("AAAA-MM") pelo campo `data`, para totais e consultas filtradas.
   * Filtra só pela data, então não exige índice composto no Firestore.
   */
  listarDoPeriodo(periodo) {
    const [inicio, fim] = faixaDoMes(periodo);
    return this.listarTodos({ restricoes: [where('data', '>=', inicio), where('data', '<=', fim)], ordenarPor: 'data' });
  }

  async auditar(acao, id) {
    await registrarLog(this.grupoId, acao, this.Model.name, id);
  }
}
