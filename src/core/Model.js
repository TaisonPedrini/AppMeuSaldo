// Base das entidades do domínio (camada Model).
// Cada entidade declara seus campos no construtor e suas regras em validar().
export class Model {
  constructor(dados = {}) {
    this.id = dados.id ?? null;
  }

  /** @returns {{ campo: string, mensagem: string }[]} lista vazia quando válido */
  validar() {
    return [];
  }

  /** Converte a entidade no documento gravado no Firestore (sem o id, que é a chave do documento). */
  toFirestore() {
    const { id, ...campos } = this;
    return Object.fromEntries(Object.entries(campos).filter(([, valor]) => valor !== undefined));
  }

  static fromFirestore(id, dados) {
    return new this({ ...dados, id });
  }
}
