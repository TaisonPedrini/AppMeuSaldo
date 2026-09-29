import { Controller } from '../core/Controller.js';
import { Categoria } from '../models/Categoria.js';
import { CategoriaRepository } from '../repositories/CategoriaRepository.js';
import { CategoriasView } from '../views/categorias/CategoriasView.js';
import { Toast } from '../views/components/Toast.js';

/** UC07 — Gerenciar categorias. Exemplo de CRUD simples com paginação (RNF004). */
export class CategoriaController extends Controller {
  async index() {
    this.repositorio = new CategoriaRepository(this.grupoId);
    this.view = new CategoriasView(this.conteudo).render();
    this.view.aoAdicionar((dados) => this.adicionar(dados));
    this.view.aoCarregarMais(() => this.carregarPagina());
    await this.carregarPagina({ substituir: true });
  }

  async carregarPagina({ substituir = false } = {}) {
    try {
      const { itens, cursor } = await this.repositorio.listar({
        ordenarPor: 'nome',
        direcao: 'asc',
        cursor: substituir ? null : this.cursor,
      });
      this.cursor = cursor;
      this.view.mostrarCategorias(itens, { haMais: Boolean(cursor), substituir });
    } catch (erro) {
      this.tratarErro(erro);
    }
  }

  async adicionar(dados) {
    this.view.limparErros();
    this.view.ocupado(true);
    try {
      await this.repositorio.criar(new Categoria({ nome: dados.nome?.trim(), tipo: dados.tipo }));
      Toast.sucesso('Categoria adicionada.');
      this.view.limparFormulario();
      await this.carregarPagina({ substituir: true });
    } catch (erro) {
      this.tratarErro(erro, this.view);
    } finally {
      this.view.ocupado(false);
    }
  }
}
