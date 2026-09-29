// Roteador por hash (#/caminho): associa cada rota a uma ação de Controller
// e aplica as guardas de autenticação e de grupo.
import { Sessao } from './Sessao.js';
import { LayoutView } from '../views/layout/LayoutView.js';

function compilar(caminho) {
  const nomes = [];
  const padrao = caminho.replace(/:(\w+)/g, (_, nome) => {
    nomes.push(nome);
    return '([^/]+)';
  });
  return { regex: new RegExp(`^${padrao}$`), nomes };
}

export class Router {
  /**
   * @param {Array<{ caminho: string, acao: (conteudo: HTMLElement, params: object) => void,
   *   publica?: boolean, semGrupo?: boolean }>} rotas
   *   publica: acessível sem login; semGrupo: exige login, mas não grupo (tela de criar/entrar no grupo)
   */
  constructor(rotas, { raiz, aoSair }) {
    this.rotas = rotas.map((rota) => ({ ...rota, ...compilar(rota.caminho) }));
    this.layout = new LayoutView(raiz, { aoSair });
  }

  static ir(caminho) {
    if (Router.caminhoAtual() === caminho) window.dispatchEvent(new HashChangeEvent('hashchange'));
    else window.location.hash = caminho;
  }

  static caminhoAtual() {
    return window.location.hash.slice(1) || '/';
  }

  iniciar() {
    window.addEventListener('hashchange', () => this.resolver());
    this.resolver();
  }

  resolver() {
    const caminho = Router.caminhoAtual();
    let rota = null;
    let params = {};
    for (const candidata of this.rotas) {
      const achado = candidata.regex.exec(caminho);
      if (achado) {
        rota = candidata;
        params = Object.fromEntries(candidata.nomes.map((nome, i) => [nome, decodeURIComponent(achado[i + 1])]));
        break;
      }
    }

    const destino = this.redirecionamento(rota);
    if (destino) {
      Router.ir(destino);
      return;
    }

    const conteudo = rota.publica || rota.semGrupo
      ? this.layout.simples()
      : this.layout.completo(caminho);
    rota.acao(conteudo, params);
  }

  redirecionamento(rota) {
    if (!rota) return '/';
    const logado = Boolean(Sessao.usuario);
    const temGrupo = Boolean(Sessao.grupoId);
    if (rota.publica) return logado ? '/' : null;
    if (!logado) return '/login';
    if (rota.semGrupo) return temGrupo ? '/' : null;
    return temGrupo ? null : '/grupo';
  }
}
