// Base dos controladores (camada Controller): recebem as ações da View,
// chamam Models/Services e decidem o que exibir em seguida.
import { Router } from './Router.js';
import { Sessao } from './Sessao.js';
import { ErroValidacao, MENSAGEM_PADRAO } from './erros.js';
import { Toast } from '../views/components/Toast.js';
import { PendenteView } from '../views/PendenteView.js';

export class Controller {
  /**
   * @param {HTMLElement} conteudo área da página onde a View é desenhada
   * @param {Record<string, string>} params parâmetros da rota (ex.: :id)
   */
  constructor(conteudo, params = {}) {
    this.conteudo = conteudo;
    this.params = params;
  }

  get usuario() {
    return Sessao.usuario;
  }

  get grupoId() {
    return Sessao.grupoId;
  }

  navegar(caminho) {
    Router.ir(caminho);
  }

  /** Erros de validação voltam para o formulário; os demais viram aviso (RNF005). */
  tratarErro(erro, view) {
    if (erro instanceof ErroValidacao && view) {
      view.mostrarErros(erro.erros);
      return;
    }
    console.error(erro);
    Toast.erro(erro.mensagemUsuario ?? MENSAGEM_PADRAO);
  }

  /** Tela ainda não implementada. */
  pendente(titulo, casosDeUso) {
    new PendenteView(this.conteudo).render({ titulo, casosDeUso });
  }
}
