// Base das telas (camada View). A View só desenha e captura eventos;
// quem decide o que fazer com eles é o Controller.
export class View {
  /** @param {HTMLElement} raiz */
  constructor(raiz) {
    this.raiz = raiz;
  }

  /** Retorna o HTML da tela. Use o tag `html` de utils/html.js para escapar os valores. */
  template(_dados) {
    return '';
  }

  render(dados = {}) {
    this.raiz.innerHTML = String(this.template(dados));
    return this;
  }

  $(seletor) {
    return this.raiz.querySelector(seletor);
  }

  /** Escuta eventos por delegação, então continua funcionando após novo render(). */
  on(evento, seletor, handler) {
    this.raiz.addEventListener(evento, (e) => {
      const alvo = e.target.closest(seletor);
      if (alvo && this.raiz.contains(alvo)) handler(e, alvo);
    });
  }

  /** Captura o submit de um formulário e entrega os campos como objeto. */
  aoEnviar(seletorForm, handler) {
    this.on('submit', seletorForm, (e, form) => {
      e.preventDefault();
      handler(Object.fromEntries(new FormData(form)), form);
    });
  }

  /** Destaca os campos inválidos (RNF012) com a mensagem ao lado. */
  mostrarErros(erros) {
    this.limparErros();
    for (const { campo, mensagem } of erros) {
      const input = this.raiz.querySelector(`[name="${campo}"]`);
      if (!input) continue;
      input.setAttribute('aria-invalid', 'true');
      const aviso = document.createElement('p');
      aviso.className = 'campo-erro';
      aviso.id = `erro-${campo}`;
      aviso.textContent = mensagem;
      input.setAttribute('aria-describedby', aviso.id);
      const campoWrapper = input.closest('.campo');
      if (campoWrapper) campoWrapper.append(aviso);
      else input.after(aviso);
    }
    this.raiz.querySelector('[aria-invalid="true"]')?.focus();
  }

  limparErros() {
    this.raiz.querySelectorAll('.campo-erro').forEach((el) => el.remove());
    this.raiz.querySelectorAll('[aria-invalid]').forEach((el) => {
      el.removeAttribute('aria-invalid');
      el.removeAttribute('aria-describedby');
    });
  }

  ocupado(ativo, seletor = 'button[type="submit"]') {
    const botao = this.$(seletor);
    if (!botao) return;
    botao.disabled = ativo;
    botao.setAttribute('aria-busy', String(ativo));
  }
}
