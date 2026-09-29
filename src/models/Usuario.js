import { Model } from '../core/Model.js';

/** Documento em usuarios/{uid}; o id é o uid da conta Google. */
export class Usuario extends Model {
  constructor(dados = {}) {
    super(dados);
    this.nome = dados.nome ?? '';
    this.email = dados.email ?? '';
    this.grupoId = dados.grupoId ?? null;
  }
}
