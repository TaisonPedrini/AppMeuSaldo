// Vitrine das telas de acesso (só no PC): alterna entre os principais recursos do app,
// cada um com um cartão de exemplo, um título em duas linhas e uma descrição.
// A troca automática é comandada pelo CSS: o ponto ativo tem uma animação de progresso e,
// quando ela termina (animationend), a vitrine avança. Assim não há temporizador para limpar
// quando a tela sai, e pausar é só pausar a animação (mouse em cima, foco ou botão de pausa).
// Com "reduzir movimento" ligado a troca continua, mas só com esmaecimento (ver components.css).
import { html, seguro } from '../../utils/html.js';

const barra = (percentual, cor = '') => html`
  <span class="vitrine-barra ${cor}"><span style="${seguro(`width: ${Math.min(percentual, 100)}%`)}"></span></span>`;

const linhaValor = (rotulo, valor, classe = '') => html`
  <div class="vitrine-linha"><span>${rotulo}</span><strong class="${classe}">${valor}</strong></div>`;

const pessoa = (iniciais, nome, detalhe, valor, selo, classeSelo) => html`
  <div class="vitrine-linha">
    <span class="vitrine-pessoa">
      <span class="vitrine-avatar" aria-hidden="true">${iniciais}</span>
      <span><strong>${nome}</strong><small>${detalhe}</small></span>
    </span>
    <span class="vitrine-lado"><strong>${valor}</strong><span class="vitrine-selo ${classeSelo}">${selo}</span></span>
  </div>`;

const SLIDES = [
  {
    titulo: 'Um cartão, duas pessoas.',
    destaque: 'Cada gasto no seu lugar.',
    descricao: 'Veja quanto cada um gastou no mês, sem planilha e sem discussão na hora da fatura.',
    exemplo: html`
      <h3>Gastos do mês por pessoa</h3>
      <div class="vitrine-bloco">${linhaValor('Thiago', 'R$ 2.410,00')}${barra(100)}</div>
      <div class="vitrine-bloco">${linhaValor('Mariana', 'R$ 1.980,00')}${barra(82, 'vitrine-barra--roxa')}</div>
      <div class="vitrine-bloco">${linhaValor('Terceiros', 'R$ 460,00')}${barra(19, 'vitrine-barra--laranja')}</div>`,
  },
  {
    titulo: 'Emprestou o cartão?',
    destaque: 'Saiba quem ainda deve.',
    descricao: 'Registre as compras de terceiros e os reembolsos. O saldo devedor se atualiza sozinho.',
    exemplo: html`
      <h3>Terceiros</h3>
      ${pessoa('DS', 'Dona Sônia', 'Mãe do Thiago', 'R$ 320,00', 'Devendo', 'vitrine-selo--perigo')}
      ${pessoa('AL', 'Ana Lima', 'Amiga do casal', 'R$ 85,00', 'Devendo', 'vitrine-selo--perigo')}
      ${pessoa('CS', 'Carlos Silva', 'Irmão do Thiago', 'R$ 0,00', 'Quitado', 'vitrine-selo--sucesso')}`,
  },
  {
    titulo: 'O orçamento avisa',
    destaque: 'antes de estourar.',
    descricao: 'Defina limites por categoria e receba um alerta quando o gasto chegar a 80%.',
    exemplo: html`
      <h3>Orçamento do mês</h3>
      <div class="vitrine-bloco">${linhaValor('Mercado', '86%', 'vitrine-alerta')}${barra(86, 'vitrine-barra--ambar')}</div>
      <div class="vitrine-bloco">${linhaValor('Lazer', '105%', 'vitrine-perigo')}${barra(100, 'vitrine-barra--vermelha')}</div>
      <div class="vitrine-bloco">${linhaValor('Transporte', '62%')}${barra(62)}</div>`,
  },
  {
    titulo: 'Chegue ao fim do mês',
    destaque: 'sem surpresas.',
    descricao: 'A projeção soma receitas, despesas e as contas recorrentes que ainda vão vencer.',
    exemplo: html`
      <h3>Saldo projetado em 30/09</h3>
      <p class="vitrine-valor">R$ 1.842,30</p>
      ${linhaValor('Receitas', '+ R$ 9.200,00', 'vitrine-sucesso')}
      ${linhaValor('Despesas lançadas', '- R$ 7.167,70')}
      ${linhaValor('Contas futuras', '- R$ 190,00')}`,
  },
  {
    titulo: 'Tire os planos do papel.',
    destaque: 'Uma meta de cada vez.',
    descricao: 'Crie metas de economia e acompanhe quanto já foi guardado para cada uma.',
    exemplo: html`
      <h3>Metas de economia</h3>
      <div class="vitrine-bloco">${linhaValor('Viagem de férias', '45%')}${barra(45)}<small>R$ 3.600,00 de R$ 8.000,00</small></div>
      <div class="vitrine-bloco">${linhaValor('Reserva de emergência', '35%')}${barra(35, 'vitrine-barra--roxa')}<small>R$ 5.200,00 de R$ 15.000,00</small></div>`,
  },
];

const ICONE_PAUSA = '<path d="M8 5v14M16 5v14"/>';
const ICONE_TOCAR = '<path d="m7 4 13 8-13 8z"/>';

function iconePausa(pausado) {
  return seguro(`<svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2"
    stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${pausado ? ICONE_TOCAR : ICONE_PAUSA}</svg>`);
}

/** Painel lateral das telas de login e cadastro. */
export function vitrine() {
  return html`
    <aside class="vitrine" data-vitrine aria-roledescription="carrossel" aria-label="Recursos do MeuSaldo">
      <div class="vitrine-slides">
        ${SLIDES.map((slide, i) => html`
          <div class="vitrine-slide" data-vitrine-slide ${i === 0 ? seguro('data-ativo') : seguro('aria-hidden="true"')}
            role="group" aria-roledescription="slide" aria-label="${i + 1} de ${SLIDES.length}">
            <div class="vitrine-palco">
              <div class="vitrine-exemplo">${slide.exemplo}</div>
            </div>
            <div class="vitrine-texto">
              <h2>${slide.titulo}<br><span>${slide.destaque}</span></h2>
              <p>${slide.descricao}</p>
            </div>
          </div>`)}
      </div>

      <div class="vitrine-controles">
        <div class="vitrine-pontos">
          ${SLIDES.map((slide, i) => html`
            <button type="button" class="vitrine-ponto" data-vitrine-ponto="${i}"
              aria-label="Mostrar ${i + 1} de ${SLIDES.length}: ${slide.titulo} ${slide.destaque}"
              ${i === 0 ? seguro('aria-current="true"') : ''}>
              <span class="vitrine-ponto-trilho"><span data-vitrine-progresso></span></span>
            </button>`)}
        </div>
        <button type="button" class="vitrine-pausa" data-vitrine-pausa aria-pressed="false" aria-label="Pausar a troca automática">
          ${iconePausa(false)}
        </button>
      </div>
    </aside>`;
}

function mostrar(painel, indice) {
  const slides = painel.querySelectorAll('[data-vitrine-slide]');
  const pontos = painel.querySelectorAll('[data-vitrine-ponto]');
  const alvo = (indice + slides.length) % slides.length;
  slides.forEach((slide, i) => {
    // Quem estava na tela sai deslizando para a esquerda (data-saindo); os demais esperam à direita.
    slide.toggleAttribute('data-saindo', slide.hasAttribute('data-ativo') && i !== alvo);
    slide.toggleAttribute('data-ativo', i === alvo);
    if (i === alvo) slide.removeAttribute('aria-hidden');
    else slide.setAttribute('aria-hidden', 'true');
  });
  pontos.forEach((ponto, i) => {
    if (i === alvo) ponto.setAttribute('aria-current', 'true');
    else ponto.removeAttribute('aria-current');
  });
}

/**
 * Liga os controles da vitrine. Os eventos são delegados na raiz da View,
 * então continuam valendo depois de um novo render().
 * @param {import('../../core/View.js').View} view
 */
export function ligarVitrine(view) {
  view.on('click', '[data-vitrine-ponto]', (_e, ponto) => {
    mostrar(ponto.closest('[data-vitrine]'), Number(ponto.dataset.vitrinePonto));
  });

  // O progresso do ponto ativo terminou: passa para o próximo recurso.
  view.on('animationend', '[data-vitrine-progresso]', (_e, progresso) => {
    const ponto = progresso.closest('[data-vitrine-ponto]');
    mostrar(ponto.closest('[data-vitrine]'), Number(ponto.dataset.vitrinePonto) + 1);
  });

  view.on('click', '[data-vitrine-pausa]', (_e, botao) => {
    const painel = botao.closest('[data-vitrine]');
    const pausado = painel.toggleAttribute('data-pausado');
    botao.setAttribute('aria-pressed', String(pausado));
    botao.setAttribute('aria-label', pausado ? 'Retomar a troca automática' : 'Pausar a troca automática');
    botao.innerHTML = String(iconePausa(pausado));
  });
}
