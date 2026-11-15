import { Controller } from '../core/Controller.js';
import { ErroValidacao } from '../core/erros.js';
import { Cartao } from '../models/Cartao.js';
import { FormaPagamento } from '../models/enums.js';
import { bancoPorId } from '../models/bancos.js';
import { CartaoRepository } from '../repositories/CartaoRepository.js';
import { DespesaRepository } from '../repositories/DespesaRepository.js';
import { CartoesView } from '../views/cartoes/CartoesView.js';
import { Toast } from '../views/components/Toast.js';
import { paraCentavos } from '../utils/moeda.js';
import { hojeISO, nomeDoMes, periodoDe } from '../utils/data.js';

/** UC06 — Gerenciar cartões de crédito. Mostra quanto cada cartão já usou do limite no mês. */
export class CartaoController extends Controller {
  async index() {
    this.repositorio = new CartaoRepository(this.grupoId);
    this.periodo = periodoDe(hojeISO());
    this.view = new CartoesView(this.conteudo).render({ mes: nomeDoMes(this.periodo) });
    this.view.aoAdicionar((dados) => this.adicionar(dados));
    this.view.aoExcluir((id, nome) => this.excluir(id, nome));
    await this.carregar();
  }

  async carregar() {
    try {
      const [cartoes, despesas] = await Promise.all([
        this.repositorio.listarTodos(),
        new DespesaRepository(this.grupoId).listarDoPeriodo(this.periodo),
      ]);
      this.view.mostrarCartoes(cartoes.map((cartao) => ({ cartao, gastoNoMes: this.gastoNoMes(cartao.id, despesas) })));
    } catch (erro) {
      this.tratarErro(erro);
    }
  }

  /** Soma das despesas no crédito feitas com o cartão no mês (sem considerar data de fechamento da fatura). */
  gastoNoMes(cartaoId, despesas) {
    return despesas
      .filter((d) => d.formaPagamento === FormaPagamento.CREDITO && d.cartaoId === cartaoId)
      .reduce((soma, d) => soma + d.valor, 0);
  }

  async adicionar(dados) {
    this.view.limparErros();
    this.view.ocupado(true);
    try {
      if (!dados.banco) throw new ErroValidacao([{ campo: 'banco', mensagem: 'Escolha o banco do cartão (ou "Outro").' }]);
      const banco = bancoPorId(dados.banco);
      await this.repositorio.criar(new Cartao({
        nome: dados.nome?.trim(),
        // Banco da lista: o nome vem dela. "Outro": o nome digitado no campo que aparece.
        bandeira: banco ? banco.nome : dados.bandeira?.trim(),
        banco: banco ? banco.id : null,
        limite: paraCentavos(dados.limite),
      }));
      Toast.sucesso('Cartão adicionado.');
      this.view.limparFormulario();
      await this.carregar();
    } catch (erro) {
      this.tratarErro(erro, this.view);
    } finally {
      this.view.ocupado(false);
    }
  }

  async excluir(id, nome) {
    if (!this.view.confirmar(`Excluir o cartão ${nome}? As despesas já lançadas nele continuam no histórico.`)) return;
    try {
      await this.repositorio.excluir(id);
      Toast.sucesso('Cartão excluído.');
      await this.carregar();
    } catch (erro) {
      this.tratarErro(erro);
    }
  }
}
