// Geração do relatório financeiro em PDF (RF021 / UC18), feita no próprio navegador com o jsPDF.
// A biblioteca só é baixada (por CDN) na primeira vez que o usuário gera um relatório.
import { ErroServicoIndisponivel } from '../core/erros.js';
import { SecoesRelatorio, TipoCategoria } from '../models/enums.js';
import { formatarMoeda } from '../utils/moeda.js';
import { formatarData, formatarDataHora } from '../utils/data.js';

const URL_JSPDF = 'https://cdnjs.cloudflare.com/ajax/libs/jspdf/2.5.1/jspdf.umd.min.js';

let carregamento = null;

function carregarJsPdf() {
  if (window.jspdf?.jsPDF) return Promise.resolve(window.jspdf.jsPDF);
  carregamento ??= new Promise((resolve, reject) => {
    const script = document.createElement('script');
    script.src = URL_JSPDF;
    script.onload = () => (window.jspdf?.jsPDF ? resolve(window.jspdf.jsPDF) : reject(new Error('jsPDF indisponível')));
    script.onerror = () => reject(new Error('Falha ao baixar o jsPDF'));
    document.head.append(script);
  }).catch((erro) => {
    carregamento = null; // permite tentar de novo
    throw erro;
  });
  return carregamento;
}

/** O Intl usa espaço não separável em "R$ 1,00"; as fontes padrão do PDF tratam melhor o espaço comum. */
const moeda = (centavos) => formatarMoeda(centavos).replace(/ /g, ' ');

/** Escreve linhas com quebra de página automática. */
class Pagina {
  constructor(pdf) {
    this.pdf = pdf;
    this.y = 20;
    this.margem = 18;
    this.largura = pdf.internal.pageSize.getWidth() - this.margem * 2;
  }

  garantirEspaco(altura) {
    if (this.y + altura > this.pdf.internal.pageSize.getHeight() - 18) {
      this.pdf.addPage();
      this.y = 20;
    }
  }

  titulo(texto) {
    this.garantirEspaco(14);
    this.y += 4;
    this.pdf.setFont('helvetica', 'bold').setFontSize(13).setTextColor(15, 110, 86);
    this.pdf.text(texto, this.margem, this.y);
    this.y += 7;
  }

  /** Linha com texto à esquerda e valor alinhado à direita. */
  linha(esquerda, direita = '', { negrito = false, cor = [31, 31, 29] } = {}) {
    this.garantirEspaco(7);
    this.pdf.setFont('helvetica', negrito ? 'bold' : 'normal').setFontSize(10).setTextColor(...cor);
    const texto = this.pdf.splitTextToSize(esquerda, this.largura - 45)[0];
    this.pdf.text(texto, this.margem, this.y);
    if (direita) this.pdf.text(direita, this.margem + this.largura, this.y, { align: 'right' });
    this.y += 6;
  }

  texto(conteudo, cor = [107, 106, 100]) {
    this.garantirEspaco(7);
    this.pdf.setFont('helvetica', 'normal').setFontSize(9).setTextColor(...cor);
    this.pdf.text(conteudo, this.margem, this.y);
    this.y += 6;
  }
}

export const RelatorioPdfService = {
  /**
   * @param {{ mes: string, nomeArquivo: string, secoes: string[], indicadores: object }} dados
   *   indicadores no formato de RelatorioService.indicadores
   * @returns {Promise<void>} baixa o arquivo no navegador
   */
  async gerar({ mes, nomeArquivo, secoes, indicadores }) {
    let JsPdf;
    try {
      JsPdf = await carregarJsPdf();
    } catch (erro) {
      throw new ErroServicoIndisponivel('Não foi possível gerar o PDF agora. Verifique sua conexão e tente novamente.', erro);
    }

    const pdf = new JsPdf({ unit: 'mm', format: 'a4' });
    const p = new Pagina(pdf);
    const incluir = (secao) => secoes.includes(secao);
    const { totais } = indicadores;

    pdf.setFont('helvetica', 'bold').setFontSize(18).setTextColor(31, 31, 29);
    pdf.text('MeuSaldo · Relatório financeiro', p.margem, p.y);
    p.y += 8;
    p.texto(`Período: ${mes} · Gerado em ${formatarDataHora(Date.now())}`);

    if (incluir(SecoesRelatorio.RESUMO)) {
      p.titulo('Resumo');
      p.linha('Receitas', moeda(totais.receitas), { cor: [59, 109, 17] });
      p.linha('Despesas', moeda(totais.despesas), { cor: [163, 45, 45] });
      p.linha('Economia (receitas - despesas)', moeda(totais.saldo), { negrito: true });
      if (indicadores.maiorGasto) p.linha('Maior gasto', `${indicadores.maiorGasto.nome} (${moeda(indicadores.maiorGasto.valor)})`);
    }

    if (incluir(SecoesRelatorio.CATEGORIAS)) {
      p.titulo('Despesas por categoria');
      if (!indicadores.despesasPorCategoria.length) p.texto('Nenhuma despesa no período.');
      for (const c of indicadores.despesasPorCategoria) {
        const parte = totais.despesas ? Math.round((c.valor / totais.despesas) * 100) : 0;
        p.linha(`${c.nome} (${parte}%)`, moeda(c.valor));
      }
    }

    if (incluir(SecoesRelatorio.PESSOAS)) {
      p.titulo('Gastos por pessoa');
      for (const pessoa of indicadores.porPessoa) p.linha(pessoa.nome, moeda(pessoa.valor));
    }

    if (incluir(SecoesRelatorio.TERCEIROS)) {
      p.titulo('Terceiros e saldo devedor');
      if (!indicadores.terceiros.length) p.texto('Nenhum terceiro cadastrado.');
      for (const t of indicadores.terceiros) {
        p.linha(t.nome, t.saldoDevedor > 0 ? `deve ${moeda(t.saldoDevedor)}` : 'quitado');
      }
    }

    if (incluir(SecoesRelatorio.ORCAMENTO)) {
      p.titulo('Orçamento por categoria');
      if (!indicadores.orcamento.length) p.texto('Nenhum limite definido no período.');
      for (const o of indicadores.orcamento) {
        p.linha(`${o.categoria} (${Math.round(o.fracao * 100)}%)`, `${moeda(o.utilizado)} de ${moeda(o.limite)}`,
          { cor: o.fracao >= 1 ? [163, 45, 45] : [31, 31, 29] });
      }
    }

    if (incluir(SecoesRelatorio.MOVIMENTACOES)) {
      p.titulo('Movimentações');
      if (!indicadores.lancamentos.length) p.texto('Nenhuma movimentação no período.');
      for (const l of indicadores.lancamentos) {
        const receita = l.tipo === TipoCategoria.RECEITA;
        p.linha(`${formatarData(l.data)}  ${l.descricao} · ${l.categoria}`, `${receita ? '+' : '-'} ${moeda(l.valor)}`,
          { cor: receita ? [59, 109, 17] : [31, 31, 29] });
      }
    }

    const paginas = pdf.getNumberOfPages();
    for (let i = 1; i <= paginas; i += 1) {
      pdf.setPage(i);
      pdf.setFont('helvetica', 'normal').setFontSize(8).setTextColor(107, 106, 100);
      pdf.text(`Página ${i} de ${paginas}`, pdf.internal.pageSize.getWidth() - p.margem, pdf.internal.pageSize.getHeight() - 10, { align: 'right' });
    }

    pdf.save(nomeArquivo);
  },
};
