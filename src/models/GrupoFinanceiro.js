import { Model } from '../core/Model.js';
import { Validador } from '../utils/Validador.js';

export const MAXIMO_INTEGRANTES = 2;

/**
 * Documento em grupos/{grupoId}.
 * `membros` (uids) não está no dicionário de dados: é o que permite às regras
 * do Firestore verificar quem pertence ao grupo e garantir o limite de dois integrantes.
 */
export class GrupoFinanceiro extends Model {
  constructor(dados = {}) {
    super(dados);
    this.nome = dados.nome ?? '';
    this.codigoConvite = dados.codigoConvite ?? null;
    this.membros = dados.membros ?? [];
    this.criadaEm = dados.criadaEm;
  }

  get completo() {
    return this.membros.length >= MAXIMO_INTEGRANTES;
  }

  validar() {
    return new Validador()
      .exigir('nome', this.nome, 'o nome do grupo')
      .regra(this.membros.length <= MAXIMO_INTEGRANTES, 'membros', 'O grupo pode ter no máximo dois integrantes.')
      .erros;
  }
}
