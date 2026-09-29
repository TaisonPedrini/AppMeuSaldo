// Avisos temporários no rodapé da tela. Erros usam role="alert" para leitores de tela.
const DURACAO_MS = 6000;

function mostrar(mensagem, tipo) {
  const area = document.getElementById('toasts');
  if (!area) return;
  const aviso = document.createElement('div');
  aviso.className = `toast toast--${tipo}`;
  aviso.setAttribute('role', tipo === 'erro' ? 'alert' : 'status');
  aviso.textContent = mensagem;
  area.append(aviso);
  setTimeout(() => aviso.remove(), DURACAO_MS);
}

export const Toast = {
  sucesso: (mensagem) => mostrar(mensagem, 'sucesso'),
  aviso: (mensagem) => mostrar(mensagem, 'aviso'),
  erro: (mensagem) => mostrar(mensagem, 'erro'),
};
