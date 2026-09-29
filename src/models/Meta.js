import { Model } from '../core/Model.js';
import { Validador } from '../utils/Validador.js';
import { dataISOValida } from '../utils/data.js';

/** usuarios/{uid}/metas. Meta de economia pessoal; valores em centavos. */
export class Meta extends Model {
  constructor(dados = {}) {
    super(dados);
    this.nome = dados.nome ?? '';
    this.valorAlvo = dados.valorAlvo ?? null;
    this.valorAtual = dados.valorAtual ?? 0;
    this.prazo = dados.prazo ?? '';
    this.usuarioId = dados.usuarioId ?? null;
  }

  get progresso() {
    return this.valorAlvo ? Math.min(this.valorAtual / this.valorAlvo, 1) : 0;
  }

  validar() {
    return new Validador()
      .exigir('nome', this.nome, 'o nome da meta')
      .valorPositivo('valorAlvo', this.valorAlvo)
      .exigir('prazo', this.prazo, 'o prazo')
      .regra(dataISOValida(this.prazo), 'prazo', 'Informe uma data válida.')
      .erros;
  }
}
