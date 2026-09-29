// Acesso ao Firestore (camada Model). Um repositório por coleção.
import {
  db, collection, doc, getDoc, getDocs, setDoc, addDoc, updateDoc, deleteDoc,
  query, orderBy, limit, startAfter, serverTimestamp,
} from '../lib/firebase.js';
import { ErroValidacao, protegido } from './erros.js';

export const TAMANHO_PAGINA = 20; // RNF004

export class Repository {
  /**
   * @param {string[]} segmentos caminho da coleção, ex.: ['grupos', grupoId, 'despesas']
   * @param {typeof import('./Model.js').Model} Model
   */
  constructor(segmentos, Model) {
    this.segmentos = segmentos;
    this.Model = Model;
  }

  get colecao() {
    return collection(db, ...this.segmentos);
  }

  ref(id) {
    return doc(db, ...this.segmentos, id);
  }

  converter(snapshot) {
    return this.Model.fromFirestore(snapshot.id, snapshot.data());
  }

  async buscarPorId(id) {
    return protegido(async () => {
      const snapshot = await getDoc(this.ref(id));
      return snapshot.exists() ? this.converter(snapshot) : null;
    }, 'Não foi possível carregar os dados. Verifique sua conexão e tente novamente.');
  }

  /**
   * Consulta paginada (RNF004). Passe o `cursor` retornado para buscar a próxima página.
   * Filtros com where() em campo diferente de `ordenarPor` exigem índice composto no Firestore.
   */
  async listar({ restricoes = [], ordenarPor = 'data', direcao = 'desc', cursor = null } = {}) {
    return protegido(async () => {
      const partes = [...restricoes, orderBy(ordenarPor, direcao)];
      if (cursor) partes.push(startAfter(cursor));
      partes.push(limit(TAMANHO_PAGINA + 1));

      const snapshot = await getDocs(query(this.colecao, ...partes));
      const pagina = snapshot.docs.slice(0, TAMANHO_PAGINA);
      return {
        itens: pagina.map((d) => this.converter(d)),
        cursor: snapshot.docs.length > TAMANHO_PAGINA ? pagina.at(-1) : null,
      };
    }, 'Não foi possível carregar a lista. Verifique sua conexão e tente novamente.');
  }

  /** Lista completa, para coleções pequenas usadas em seleções (categorias, cartões, terceiros). */
  async listarTodos({ restricoes = [], ordenarPor = 'nome' } = {}) {
    return protegido(async () => {
      const snapshot = await getDocs(query(this.colecao, ...restricoes));
      return snapshot.docs
        .map((d) => this.converter(d))
        .sort((a, b) => String(a[ordenarPor]).localeCompare(String(b[ordenarPor]), 'pt-BR'));
    }, 'Não foi possível carregar a lista. Verifique sua conexão e tente novamente.');
  }

  async criar(entidade) {
    this.garantirValido(entidade);
    return protegido(async () => {
      const ref = await addDoc(this.colecao, { ...entidade.toFirestore(), criadoEm: serverTimestamp() });
      entidade.id = ref.id;
      await this.auditar('CRIAR', ref.id);
      return entidade;
    }, 'Não foi possível salvar. Verifique sua conexão e tente novamente.');
  }

  /** Grava com id definido pela aplicação (cria ou substitui). */
  async salvarComId(entidade) {
    this.garantirValido(entidade);
    return protegido(async () => {
      await setDoc(this.ref(entidade.id), { ...entidade.toFirestore(), atualizadoEm: serverTimestamp() }, { merge: true });
      await this.auditar('SALVAR', entidade.id);
      return entidade;
    }, 'Não foi possível salvar. Verifique sua conexão e tente novamente.');
  }

  async atualizar(entidade) {
    this.garantirValido(entidade);
    return protegido(async () => {
      await updateDoc(this.ref(entidade.id), { ...entidade.toFirestore(), atualizadoEm: serverTimestamp() });
      await this.auditar('ALTERAR', entidade.id);
      return entidade;
    }, 'Não foi possível salvar as alterações. Verifique sua conexão e tente novamente.');
  }

  async excluir(id) {
    return protegido(async () => {
      await deleteDoc(this.ref(id));
      await this.auditar('EXCLUIR', id);
    }, 'Não foi possível excluir. Verifique sua conexão e tente novamente.');
  }

  garantirValido(entidade) {
    const erros = entidade.validar();
    if (erros.length) throw new ErroValidacao(erros);
  }

  /** Registro de log (RNF002). Repositórios do grupo sobrescrevem; os demais não registram. */
  async auditar(_acao, _id) {}
}
