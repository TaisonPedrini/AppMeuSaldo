// Bancos e fintechs para o cadastro de cartões (UC06).
// Cada um é representado por um selo com a cor e a sigla da marca, sem usar os logotipos oficiais,
// que são marcas registradas. Para trocar por logotipos licenciados, basta mudar o selo na View.

/** @typedef {{ id: string, nome: string, sigla: string, fundo: string, texto: string }} Banco */

/** @type {Banco[]} */
export const BANCOS = Object.freeze([
  { id: 'nubank', nome: 'Nubank', sigla: 'nu', fundo: '#820AD1', texto: '#FFFFFF' },
  { id: 'itau', nome: 'Itaú', sigla: 'itaú', fundo: '#EC7000', texto: '#FFFFFF' },
  { id: 'bradesco', nome: 'Bradesco', sigla: 'b', fundo: '#CC092F', texto: '#FFFFFF' },
  { id: 'bb', nome: 'Banco do Brasil', sigla: 'BB', fundo: '#FCE500', texto: '#003DA5' },
  { id: 'caixa', nome: 'Caixa', sigla: 'CX', fundo: '#005CA9', texto: '#FFFFFF' },
  { id: 'santander', nome: 'Santander', sigla: 'S', fundo: '#EC0000', texto: '#FFFFFF' },
  { id: 'inter', nome: 'Inter', sigla: 'in', fundo: '#FF7A00', texto: '#FFFFFF' },
  { id: 'c6', nome: 'C6 Bank', sigla: 'C6', fundo: '#242424', texto: '#FFFFFF' },
  { id: 'picpay', nome: 'PicPay', sigla: 'PP', fundo: '#11A65F', texto: '#FFFFFF' },
  { id: 'mercadopago', nome: 'Mercado Pago', sigla: 'MP', fundo: '#0094CF', texto: '#FFFFFF' },
  { id: 'pagbank', nome: 'PagBank', sigla: 'PB', fundo: '#00875A', texto: '#FFFFFF' },
  { id: 'neon', nome: 'Neon', sigla: 'neon', fundo: '#00C2E0', texto: '#0B1F3A' },
  { id: 'btg', nome: 'BTG Pactual', sigla: 'BTG', fundo: '#0A2240', texto: '#FFFFFF' },
  { id: 'xp', nome: 'XP', sigla: 'XP', fundo: '#111111', texto: '#F7C600' },
  { id: 'sicoob', nome: 'Sicoob', sigla: 'S', fundo: '#003641', texto: '#7DB61C' },
]);

export const OUTRO_BANCO = 'outro';

/** Banco pelo id; null para "outro" ou cartões cadastrados antes desta lista. */
export function bancoPorId(id) {
  return BANCOS.find((b) => b.id === id) ?? null;
}
