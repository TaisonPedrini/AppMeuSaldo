import { Controller } from '../core/Controller.js';
import { Sessao } from '../core/Sessao.js';
import { GrupoService } from '../services/GrupoService.js';
import { GrupoConfigView } from '../views/grupo/GrupoConfigView.js';

/** UC02 — Gerenciar grupo financeiro. */
export class GrupoController extends Controller {
  /** Primeiro acesso: usuário ainda sem grupo. */
  configurar() {
    const view = new GrupoConfigView(this.conteudo).render({ nomeUsuario: this.usuario.nome });

    view.aoCriar(({ nome }) => this.executarNoGrupo(view, '[data-form="criar"] button', () => GrupoService.criar(nome, this.usuario)));
    view.aoEntrarComCodigo(({ codigo }) => this.executarNoGrupo(view, '[data-form="entrar"] button', () => GrupoService.entrar(codigo, this.usuario)));
  }

  async executarNoGrupo(view, botao, operacao) {
    view.limparErros();
    view.ocupado(true, botao);
    try {
      Sessao.definirGrupo(await operacao());
      this.navegar('/');
    } catch (erro) {
      this.tratarErro(erro, view);
    } finally {
      view.ocupado(false, botao);
    }
  }

  /** Dados do grupo, código de convite e integrantes. */
  gerenciar() {
    this.pendente('Grupo', ['UC02']);
  }
}
