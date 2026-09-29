import { Controller } from '../core/Controller.js';
import { Despesa } from '../models/Despesa.js';
import { DivisaoDespesa } from '../models/DivisaoDespesa.js';
import { Classificacao, FormaPagamento, TipoCategoria } from '../models/enums.js';
import { CategoriaRepository } from '../repositories/CategoriaRepository.js';
import { CartaoRepository } from '../repositories/CartaoRepository.js';
import { TerceiroRepository } from '../repositories/TerceiroRepository.js';
import { DespesaService } from '../services/DespesaService.js';
import { CupomFiscalService } from '../services/CupomFiscalService.js';
import { DespesaFormView } from '../views/despesas/DespesaFormView.js';
import { Toast } from '../views/components/Toast.js';
import { paraCentavos } from '../utils/moeda.js';
import { hojeISO } from '../utils/data.js';

/** UC05 — Cadastrar despesa, com as extensões UC08 (dividir), UC09 (cupom) e UC10 (recorrente). */
export class DespesaController extends Controller {
  async nova() {
    const view = new DespesaFormView(this.conteudo);

    // Passo 1: carregar categorias, cartões e terceiros do grupo.
    try {
      const [categorias, cartoes, terceiros] = await Promise.all([
        new CategoriaRepository(this.grupoId).listarPorTipo(TipoCategoria.DESPESA),
        new CartaoRepository(this.grupoId).listarTodos(),
        new TerceiroRepository(this.grupoId).listarTodos(),
      ]);
      view.render({ categorias, cartoes, terceiros, hoje: hojeISO() });
    } catch (erro) {
      this.tratarErro(erro);
      return;
    }

    view.aoLerCupom(() => this.lerCupom(view));
    view.aoSalvar((dados) => this.salvar(view, dados));
  }

  /** Passo 2 (UC09): se a leitura falhar, avisa e segue com o preenchimento manual (RNF013). */
  async lerCupom(view) {
    try {
      view.preencher(await CupomFiscalService.ler());
    } catch (erro) {
      Toast.aviso(erro.mensagemUsuario ?? 'A leitura de cupom falhou. Preencha os dados manualmente.');
    }
  }

  /** Passos 3 a 8: monta a despesa com os dados do formulário e grava pelo serviço. */
  async salvar(view, dados) {
    view.limparErros();
    view.ocupado(true);
    try {
      const despesa = this.montarDespesa(dados);
      await new DespesaService(this.grupoId).cadastrar(despesa, this.montarDivisoes(despesa, dados));
      Toast.sucesso('Despesa salva.');
      this.navegar('/lancamentos');
    } catch (erro) {
      this.tratarErro(erro, view);
    } finally {
      view.ocupado(false);
    }
  }

  montarDespesa(dados) {
    const recorrente = dados.recorrente === 'on';
    return new Despesa({
      valor: paraCentavos(dados.valor),
      data: dados.data,
      descricao: dados.descricao?.trim(),
      categoriaId: dados.categoriaId || null,
      formaPagamento: dados.formaPagamento || null,
      cartaoId: dados.formaPagamento === FormaPagamento.CREDITO ? dados.cartaoId || null : null,
      classificacao: dados.classificacao,
      recorrente,
      periodicidade: recorrente ? dados.periodicidade || null : null,
      dataFim: recorrente ? dados.dataFim || null : null,
      abateIR: dados.abateIR === 'on',
      usuarioId: this.usuario.id, // RF005: quem realizou a movimentação
    });
  }

  /** UC08: despesa de terceiro gera uma divisão; sem valor informado, o terceiro deve o total. */
  montarDivisoes(despesa, dados) {
    if (despesa.classificacao !== Classificacao.TERCEIRO || !dados['divisao.terceiroId']) return [];
    const valorInformado = dados['divisao.valor']?.trim();
    return [new DivisaoDespesa({
      terceiroId: dados['divisao.terceiroId'],
      valor: valorInformado ? paraCentavos(valorInformado) : despesa.valor,
    })];
  }

  listar() {
    this.pendente('Lançamentos', ['UC17']);
  }
}
