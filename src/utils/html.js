// Tag de template que escapa os valores interpolados, evitando injeção de HTML.
// Uso: html`<p>${descricao}</p>`. Listas e outros html`` aninhados são aceitos sem escapar de novo.

class HtmlSeguro {
  constructor(valor) {
    this.valor = valor;
  }

  toString() {
    return this.valor;
  }
}

const ENTIDADES = { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' };

export function escapar(texto) {
  return String(texto).replace(/[&<>"']/g, (c) => ENTIDADES[c]);
}

function converter(valor) {
  if (valor instanceof HtmlSeguro) return valor.valor;
  if (Array.isArray(valor)) return valor.map(converter).join('');
  if (valor === null || valor === undefined || valor === false) return '';
  return escapar(valor);
}

export function html(partes, ...valores) {
  let resultado = partes[0];
  valores.forEach((valor, i) => {
    resultado += converter(valor) + partes[i + 1];
  });
  return new HtmlSeguro(resultado);
}

/** Marca um trecho já confiável (ex.: SVG fixo do código) para não ser escapado. */
export function seguro(texto) {
  return new HtmlSeguro(texto);
}
