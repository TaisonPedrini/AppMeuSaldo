// Repositório de uma subcoleção de grupos/{grupoId}, com log de auditoria (RNF002).
import { Repository } from './Repository.js';
import { registrarLog } from '../services/AuditoriaService.js';

export class RepositorioDoGrupo extends Repository {
  /** @param {string|string[]} subcolecao ex.: 'despesas' ou ['terceiros', terceiroId, 'reembolsos'] */
  constructor(grupoId, subcolecao, Model) {
    super(['grupos', grupoId, ...[].concat(subcolecao)], Model);
    this.grupoId = grupoId;
  }

  async auditar(acao, id) {
    await registrarLog(this.grupoId, acao, this.Model.name, id);
  }
}
