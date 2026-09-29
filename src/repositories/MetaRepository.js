import { Repository } from '../core/Repository.js';
import { Sessao } from '../core/Sessao.js';
import { registrarLog } from '../services/AuditoriaService.js';
import { Meta } from '../models/Meta.js';

// Metas são pessoais (usuarios/{uid}/metas), mas o log vai para o grupo do usuário.
export class MetaRepository extends Repository {
  constructor(usuarioId) {
    super(['usuarios', usuarioId, 'metas'], Meta);
  }

  async auditar(acao, id) {
    if (Sessao.grupoId) await registrarLog(Sessao.grupoId, acao, 'Meta', id);
  }
}
