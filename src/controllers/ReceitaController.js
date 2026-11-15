import { Controller } from '../core/Controller.js';
import { Receita } from '../models/Receita.js';
import { TipoCategoria } from '../models/enums.js';
import { CategoriaRepository } from '../repositories/CategoriaRepository.js';
import { ReceitaRepository } from '../repositories/ReceitaRepository.js';
import { ReceitaFormView } from '../views/receitas/ReceitaFormView.js';
import { Toast } from '../views/components/Toast.js';
import { paraCentavos } from '../utils/moeda.js';
import { hojeISO } from '../utils/data.js';

/** UC04 — Cadastrar receita. */
export class ReceitaController extends Controller {
  async nova() {
    const view = new ReceitaFormView(this.conteudo);
    try {
      const categorias = await new CategoriaRepository(this.grupoId).listarPorTipo(TipoCategoria.RECEITA);
      view.render({ categorias, hoje: hojeISO() });
    } catch (erro) {
      this.tratarErro(erro);
      return;
    }
    view.aoSalvar((dados) => this.salvar(view, dados));
  }

  async salvar(view, dados) {
    view.limparErros();
    view.ocupado(true);
    try {
      await new ReceitaRepository(this.grupoId).criar(new Receita({
        valor: paraCentavos(dados.valor),
        data: dados.data,
        descricao: dados.descricao?.trim(),
        categoriaId: dados.categoriaId || null,
        usuarioId: this.usuario.id, // RF005: quem recebeu
      }));
      Toast.sucesso('Receita salva.');
      this.navegar('/');
    } catch (erro) {
      this.tratarErro(erro, view);
    } finally {
      view.ocupado(false);
    }
  }
}
