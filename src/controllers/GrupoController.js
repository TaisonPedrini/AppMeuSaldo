import { Controller } from '../core/Controller.js';
import { Sessao } from '../core/Sessao.js';
import { GrupoService } from '../services/GrupoService.js';
import { AuthService } from '../services/AuthService.js';
import { GrupoConfigView } from '../views/grupo/GrupoConfigView.js';
import { GrupoGerenciarView } from '../views/grupo/GrupoGerenciarView.js';
import { Toast } from '../views/components/Toast.js';

/** UC02 — Gerenciar grupo financeiro. */
export class GrupoController extends Controller {
  /** Primeiro acesso: usuário ainda sem grupo. */
  configurar() {
    const view = new GrupoConfigView(this.conteudo).render({ nomeUsuario: this.usuario.nome, emailUsuario: this.usuario.email });
    // Quem entrou com a conta errada precisa poder sair: esta tela não tem a barra lateral.
    view.aoSair(() => AuthService.sair());

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

  /** Dados do grupo, código de convite e integrantes; permite renomear o grupo. */
  async gerenciar() {
    this.view = new GrupoGerenciarView(this.conteudo);
    try {
      this.grupo = await GrupoService.buscar(this.grupoId);
      this.view.render({ grupo: this.grupo, usuario: this.usuario });
    } catch (erro) {
      this.tratarErro(erro);
      return;
    }
    this.view.aoRenomear(({ nome }) => this.renomear(nome));
    this.view.aoCopiarConvite(() => this.copiarConvite());
  }

  async renomear(nome) {
    this.view.limparErros();
    this.view.ocupado(true);
    try {
      this.grupo = await GrupoService.renomear(this.grupo, nome);
      Toast.sucesso('Nome do grupo salvo.');
    } catch (erro) {
      this.tratarErro(erro, this.view);
    } finally {
      this.view.ocupado(false);
    }
  }

  async copiarConvite() {
    try {
      await navigator.clipboard.writeText(this.grupo.codigoConvite);
      Toast.sucesso('Código de convite copiado.');
    } catch {
      Toast.aviso(`Não foi possível copiar automaticamente. O código é ${this.grupo.codigoConvite}.`);
    }
  }
}
