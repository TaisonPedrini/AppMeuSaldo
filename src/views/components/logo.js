// Logo do MeuSaldo: um M partido ao meio em duas metades espelhadas (um cartão, duas pessoas).
// Os arquivos originais e as variações ficam em design/logo/final.
import { seguro } from '../../utils/html.js';

const METADES = `
  <path d="M37 203 V53 H79 L116 109 V167 L79 111 V203 Z"/>
  <path d="M219 203 V53 H177 L140 109 V167 L177 111 V203 Z"/>`;

/** Ícone do app: o M em branco sobre o verde principal. Decorativo; o nome vem escrito ao lado. */
export function logoIcone(tamanho = 32) {
  return seguro(`
    <svg class="logo-icone" viewBox="0 0 256 256" width="${Number(tamanho)}" height="${Number(tamanho)}" aria-hidden="true">
      <rect width="256" height="256" rx="58" fill="#0F6E56"/>
      <g transform="translate(128 128) scale(0.64) translate(-128 -128)" fill="#FFFFFF" stroke="#FFFFFF"
        stroke-width="10" stroke-linejoin="round">${METADES}</g>
    </svg>`);
}
