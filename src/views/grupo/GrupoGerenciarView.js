import { View } from '../../core/View.js';
import { html } from '../../utils/html.js';
import { formatarDataHora } from '../../utils/data.js';
import { iniciais } from '../../utils/texto.js';
import { campo, legendaObrigatorios } from '../components/campos.js';
import { MAXIMO_INTEGRANTES } from '../../models/GrupoFinanceiro.js';

/** Grupo do casal: nome, data de criação, integrantes e código de convite (UC02). */
export class GrupoGerenciarView extends View {
  template({ grupo, usuario }) {
    const criadoEm = typeof grupo.criadaEm?.toMillis === 'function' ? formatarDataHora(grupo.criadaEm.toMillis()).slice(0, 10) : null;
    const outros = grupo.membros.filter((id) => id !== usuario.id).length;
    const completo = grupo.membros.length >= MAXIMO_INTEGRANTES;

    return html`
      <section class="pagina">
        <header class="pagina-cabecalho">
          <div>
            <h1>Grupo financeiro</h1>
            <p class="texto-secundario">${criadoEm ? `Criado em ${criadoEm}` : 'Cadastros › Grupo financeiro'}</p>
          </div>
        </header>

        <div class="pagina-dupla">
          <div class="pagina">
            <form class="cartao formulario" data-form="grupo" novalidate>
              <h2>Dados do grupo</h2>
              ${campo({ nome: 'nome', texto: 'Nome do grupo', valor: grupo.nome, obrigatorio: true })}
              ${legendaObrigatorios()}
              <button type="submit" class="botao botao--primario">Salvar nome</button>
            </form>

            <div>
              <h2>Integrantes (${grupo.membros.length} de ${MAXIMO_INTEGRANTES})</h2>
              <ul class="lista">
                <li class="lista-item">
                  <span class="lista-item-principal">
                    <span class="avatar" aria-hidden="true">${iniciais(usuario.nome)}</span>
                    <span class="lista-item-textos"><strong>${usuario.nome} (você)</strong><span>${usuario.email}</span></span>
                  </span>
                </li>
                ${outros ? html`
                  <li class="lista-item">
                    <span class="lista-item-principal">
                      <span class="avatar avatar--outro" aria-hidden="true">+</span>
                      <span class="lista-item-textos"><strong>Outro integrante</strong><span>Entrou pelo código de convite</span></span>
                    </span>
                  </li>` : html`
                  <li class="lista-item texto-secundario">Aguardando o segundo integrante entrar com o código de convite.</li>`}
              </ul>
            </div>
          </div>

          <div class="pagina">
            <div class="cartao convite">
              <h2>Código de convite</h2>
              <p class="convite-codigo">${grupo.codigoConvite}</p>
              <p class="texto-secundario">${completo
                ? 'O grupo já está completo.'
                : 'Envie este código para o outro integrante entrar no grupo.'}</p>
              <button type="button" class="botao botao--secundario botao--bloco" data-acao="copiar">Copiar convite</button>
            </div>
            <p class="cartao aviso">O grupo aceita no máximo dois integrantes.</p>
          </div>
        </div>
      </section>`;
  }

  aoRenomear(handler) {
    this.aoEnviar('[data-form="grupo"]', handler);
  }

  aoCopiarConvite(handler) {
    this.on('click', '[data-acao="copiar"]', handler);
  }
}
