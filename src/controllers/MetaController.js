import { Controller } from '../core/Controller.js';
import { ErroValidacao } from '../core/erros.js';
import { Meta } from '../models/Meta.js';
import { MetaRepository } from '../repositories/MetaRepository.js';
import { MetasView } from '../views/metas/MetasView.js';
import { Toast } from '../views/components/Toast.js';
import { paraCentavos } from '../utils/moeda.js';

/** UC14 — Gerenciar metas de economia (RF014) e acompanhar o progresso (RF015). Metas são pessoais. */
export class MetaController extends Controller {
  async index() {
    this.repositorio = new MetaRepository(this.usuario.id);
    this.view = new MetasView(this.conteudo).render();
    this.view.aoCriar((dados) => this.criar(dados));
    this.view.aoAdicionarValor((id, valor, form) => this.adicionarValor(id, valor, form));
    this.view.aoExcluir((id, nome) => this.excluir(id, nome));
    await this.carregar();
  }

  async carregar() {
    try {
      this.metas = await this.repositorio.listarTodos({ ordenarPor: 'prazo' });
      this.view.mostrarMetas(this.metas);
    } catch (erro) {
      this.tratarErro(erro);
    }
  }

  async criar(dados) {
    this.view.limparErros();
    this.view.ocupado(true);
    try {
      await this.repositorio.criar(new Meta({
        nome: dados.nome?.trim(),
        valorAlvo: paraCentavos(dados.valorAlvo),
        valorAtual: 0,
        prazo: dados.prazo,
        usuarioId: this.usuario.id,
      }));
      Toast.sucesso('Meta criada.');
      this.view.limparFormulario();
      await this.carregar();
    } catch (erro) {
      this.tratarErro(erro, this.view);
    } finally {
      this.view.ocupado(false);
    }
  }

  /** Registra quanto foi guardado para a meta (RF015). */
  async adicionarValor(id, texto, form) {
    const meta = this.metas.find((m) => m.id === id);
    const valor = paraCentavos(texto);
    try {
      if (!Number.isInteger(valor) || valor <= 0) {
        throw new ErroValidacao([{ campo: `valor-${id}`, mensagem: 'Informe um valor maior que zero, com até duas casas decimais.' }]);
      }
      const atualizada = new Meta({ ...meta, valorAtual: meta.valorAtual + valor });
      await this.repositorio.atualizar(atualizada);
      Toast.sucesso(atualizada.valorAtual >= atualizada.valorAlvo ? `Parabéns! A meta ${meta.nome} foi alcançada.` : 'Valor adicionado à meta.');
      form.reset();
      await this.carregar();
    } catch (erro) {
      this.tratarErro(erro, this.view);
    }
  }

  async excluir(id, nome) {
    if (!this.view.confirmar(`Excluir a meta ${nome}? O valor guardado registrado nela também será apagado.`)) return;
    try {
      await this.repositorio.excluir(id);
      Toast.sucesso('Meta excluída.');
      await this.carregar();
    } catch (erro) {
      this.tratarErro(erro);
    }
  }
}
