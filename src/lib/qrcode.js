// Decodificação de QR Code no navegador.
// Usa o BarcodeDetector nativo quando existe (Chrome e Edge no Android, por exemplo) e, nos demais
// navegadores (Safari, Chrome no Windows), o jsQR, baixado por CDN só na primeira leitura.
const URL_JSQR = 'https://cdn.jsdelivr.net/npm/jsqr@1.4.0/dist/jsQR.min.js';
const LADO_MAXIMO = 1280; // reduz fotos grandes antes de procurar o código

let carregamentoJsQr = null;
let detectorNativo;

function carregarJsQr() {
  if (window.jsQR) return Promise.resolve(window.jsQR);
  carregamentoJsQr ??= new Promise((resolve, reject) => {
    const script = document.createElement('script');
    script.src = URL_JSQR;
    script.onload = () => (window.jsQR ? resolve(window.jsQR) : reject(new Error('jsQR indisponível')));
    script.onerror = () => reject(new Error('Falha ao baixar o jsQR'));
    document.head.append(script);
  }).catch((erro) => {
    carregamentoJsQr = null; // permite tentar de novo
    throw erro;
  });
  return carregamentoJsQr;
}

async function obterDetectorNativo() {
  if (detectorNativo !== undefined) return detectorNativo;
  detectorNativo = null;
  try {
    if ('BarcodeDetector' in window && (await window.BarcodeDetector.getSupportedFormats()).includes('qr_code')) {
      detectorNativo = new window.BarcodeDetector({ formats: ['qr_code'] });
    }
  } catch {
    detectorNativo = null;
  }
  return detectorNativo;
}

/** Baixa o decodificador com antecedência, para a primeira leitura não esperar a rede. */
export async function prepararLeitorQrCode() {
  if (!(await obterDetectorNativo())) await carregarJsQr();
}

const canvas = document.createElement('canvas');
const contexto = canvas.getContext('2d', { willReadFrequently: true });

/**
 * Procura um QR Code na imagem (vídeo, imagem ou ImageBitmap).
 * @returns {Promise<string|null>} o texto do código, ou null se nenhum foi encontrado
 */
export async function decodificarQrCode(fonte, largura, altura) {
  const nativo = await obterDetectorNativo();
  if (nativo) {
    const [codigo] = await nativo.detect(fonte);
    return codigo?.rawValue ?? null;
  }

  const jsQR = await carregarJsQr();
  const escala = Math.min(1, LADO_MAXIMO / Math.max(largura, altura));
  canvas.width = Math.round(largura * escala);
  canvas.height = Math.round(altura * escala);
  contexto.drawImage(fonte, 0, 0, canvas.width, canvas.height);
  const { data } = contexto.getImageData(0, 0, canvas.width, canvas.height);
  return jsQR(data, canvas.width, canvas.height, { inversionAttempts: 'attemptBoth' })?.data ?? null;
}

/** Lê o QR Code de uma foto escolhida pelo usuário. */
export async function decodificarQrCodeDeArquivo(arquivo) {
  const imagem = await createImageBitmap(arquivo);
  try {
    return await decodificarQrCode(imagem, imagem.width, imagem.height);
  } finally {
    imagem.close?.();
  }
}
