import { View } from '../../core/View.js';
import { html } from '../../utils/html.js';
import { primeiroNome } from '../../utils/texto.js';
import { campo } from '../components/campos.js';
import { logoIcone } from '../components/logo.js';
import { ligarVitrine } from '../components/vitrine.js';
import { telaAcesso } from '../auth/AuthView.js';

/**
 * Primeiro acesso: criar o grupo do casal ou entrar com o código de convite (UC02).
 * É a primeira tela depois do cadastro, então usa a mesma moldura do login (vitrine + painel).
 */
export class GrupoConfigView extends View {
  constructor(raiz) {
    super(raiz);
    ligarVitrine(this);
  }

  template({ nomeUsuario, emailUsuario }) {
    return telaAcesso(html`
      <header class="acesso-cabecalho">
        ${logoIcone(56)}
        <h1 class="acesso-titulo">Boas-vindas, ${primeiroNome(nomeUsuario)}!</h1>
        <p class="acesso-subtitulo">
          O MeuSaldo organiza as finanças de duas pessoas num grupo só.
          Crie o seu ou entre no grupo que a outra pessoa já criou.
        </p>
      </header>

      <div class="acesso-cartao grupo-escolha">
        <form class="formulario" data-form="criar" novalidate>
          <div class="grupo-opcao-titulo">
            <span class="grupo-passo" aria-hidden="true">1</span>
            <div>
              <h2>Criar um grupo</h2>
              <p class="legenda">Você recebe um código para convidar a outra pessoa.</p>
            </div>
          </div>
          ${campo({ nome: 'nome', texto: 'Nome do grupo', obrigatorio: true, atributos: 'placeholder="Ex.: Casa Silva Costa" autocomplete="off"' })}
          <button type="submit" class="botao botao--primario botao--bloco">Criar grupo</button>
        </form>

        <p class="divisor"><span>ou</span></p>

        <form class="formulario" data-form="entrar" novalidate>
          <div class="grupo-opcao-titulo">
            <span class="grupo-passo" aria-hidden="true">2</span>
            <div>
              <h2>Entrar com um convite</h2>
              <p class="legenda">Use o código de 6 letras que a outra pessoa recebeu ao criar o grupo.</p>
            </div>
          </div>
          ${campo({ nome: 'codigo', texto: 'Código de convite', obrigatorio: true,
            atributos: 'class="campo-codigo" placeholder="Ex.: WCSPNY" maxlength="6" autocapitalize="characters" autocomplete="off" spellcheck="false"' })}
          <button type="submit" class="botao botao--secundario botao--bloco">Entrar no grupo</button>
        </form>
      </div>

      <p class="acesso-rodape">
        Entrou como <strong>${emailUsuario}</strong>.
        <button type="button" class="botao-texto link-acao" data-acao="sair">Usar outra conta</button>
      </p>`);
  }

  aoCriar(handler) {
    this.aoEnviar('[data-form="criar"]', handler);
  }

  aoEntrarComCodigo(handler) {
    this.aoEnviar('[data-form="entrar"]', handler);
  }

  aoSair(handler) {
    this.on('click', '[data-acao="sair"]', handler);
  }
}
