// Tabela de rotas: caminho → ação do Controller.
// publica: sem login | semGrupo: com login, antes de ter grupo | demais: login + grupo.
import { AuthController } from './controllers/AuthController.js';
import { GrupoController } from './controllers/GrupoController.js';
import { InicioController } from './controllers/InicioController.js';
import { DespesaController } from './controllers/DespesaController.js';
import { ReceitaController } from './controllers/ReceitaController.js';
import { TerceiroController } from './controllers/TerceiroController.js';
import { CartaoController } from './controllers/CartaoController.js';
import { CategoriaController } from './controllers/CategoriaController.js';
import { OrcamentoController } from './controllers/OrcamentoController.js';
import { MetaController } from './controllers/MetaController.js';
import { ProjecaoController } from './controllers/ProjecaoController.js';
import { RelatorioController } from './controllers/RelatorioController.js';

export const rotas = [
  { caminho: '/login', publica: true, acao: (c) => new AuthController(c).login() },
  { caminho: '/cadastro', publica: true, acao: (c) => new AuthController(c).cadastro() },
  { caminho: '/grupo', semGrupo: true, acao: (c) => new GrupoController(c).configurar() },

  { caminho: '/', acao: (c) => new InicioController(c).index() },
  { caminho: '/grupo/gerenciar', acao: (c) => new GrupoController(c).gerenciar() },
  { caminho: '/lancamentos', acao: (c) => new DespesaController(c).listar() },
  { caminho: '/despesas/nova', acao: (c) => new DespesaController(c).nova() },
  { caminho: '/receitas/nova', acao: (c) => new ReceitaController(c).nova() },
  { caminho: '/terceiros', acao: (c) => new TerceiroController(c).index() },
  { caminho: '/terceiros/:id/reembolso', acao: (c, p) => new TerceiroController(c, p).reembolso() },
  { caminho: '/cartoes', acao: (c) => new CartaoController(c).index() },
  { caminho: '/categorias', acao: (c) => new CategoriaController(c).index() },
  { caminho: '/orcamentos', acao: (c) => new OrcamentoController(c).index() },
  { caminho: '/metas', acao: (c) => new MetaController(c).index() },
  { caminho: '/projecao', acao: (c) => new ProjecaoController(c).index() },
  { caminho: '/relatorios', acao: (c) => new RelatorioController(c).index() },
];
