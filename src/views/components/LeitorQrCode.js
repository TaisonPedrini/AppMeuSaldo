// Janela de leitura do QR Code do cupom fiscal (UC09): câmera traseira ou foto do cupom.
// Só captura o texto do código; quem interpreta e consulta a nota é o CupomFiscalService.
import { html } from '../../utils/html.js';
import { decodificarQrCode, decodificarQrCodeDeArquivo, prepararLeitorQrCode } from '../../lib/qrcode.js';

const INTERVALO_LEITURA_MS = 250;

const MENSAGENS_CAMERA = {
  NotAllowedError: 'Sem permissão para usar a câmera. Libere o acesso nas configurações do navegador ou envie uma foto do cupom.',
  NotFoundError: 'Nenhuma câmera encontrada neste aparelho. Envie uma foto do QR Code do cupom.',
  NotReadableError: 'A câmera está em uso por outro aplicativo. Feche-o e tente de novo, ou envie uma foto do cupom.',
};

/**
 * Abre a janela e resolve com o texto do QR Code lido, ou null se o usuário cancelar.
 * @returns {Promise<string|null>}
 */
export function lerQrCode() {
  return new Promise((resolve) => {
    const dialogo = document.createElement('dialog');
    dialogo.className = 'leitor-qr';
    dialogo.setAttribute('aria-labelledby', 'leitor-qr-titulo');
    dialogo.innerHTML = String(html`
      <h2 id="leitor-qr-titulo">Ler cupom fiscal</h2>
      <p class="leitor-qr-instrucao">Aponte a câmera para o QR Code impresso no rodapé do cupom.</p>
      <div class="leitor-qr-visor">
        <video muted playsinline autoplay></video>
        <span class="leitor-qr-mira" aria-hidden="true"></span>
      </div>
      <p class="leitor-qr-status" role="status" aria-live="polite">Abrindo a câmera…</p>
      <div class="leitor-qr-acoes">
        <label class="botao botao--secundario">
          Enviar foto do cupom
          <input type="file" accept="image/*" data-campo="foto" hidden>
        </label>
        <button type="button" class="botao-texto leitor-qr-cancelar" data-acao="cancelar">Preencher manualmente</button>
      </div>`);
    document.body.append(dialogo);

    const video = dialogo.querySelector('video');
    const status = dialogo.querySelector('.leitor-qr-status');
    let fluxo = null;
    let temporizador = null;
    let encerrado = false;

    const mostrarStatus = (texto, erro = false) => {
      status.textContent = texto;
      status.classList.toggle('leitor-qr-status--erro', erro);
    };

    const encerrar = (resultado) => {
      if (encerrado) return;
      encerrado = true;
      clearTimeout(temporizador);
      fluxo?.getTracks().forEach((faixa) => faixa.stop());
      dialogo.close();
      dialogo.remove();
      resolve(resultado);
    };

    const lerQuadro = async () => {
      if (encerrado) return;
      try {
        if (video.readyState >= video.HAVE_CURRENT_DATA && video.videoWidth) {
          const texto = await decodificarQrCode(video, video.videoWidth, video.videoHeight);
          if (texto) return encerrar(texto);
        }
      } catch {
        // quadro ilegível ou decodificador indisponível: tenta o próximo
      }
      temporizador = setTimeout(lerQuadro, INTERVALO_LEITURA_MS);
    };

    const abrirCamera = async () => {
      if (!navigator.mediaDevices?.getUserMedia) {
        video.parentElement.hidden = true;
        mostrarStatus('Este navegador não dá acesso à câmera. Envie uma foto do QR Code do cupom.', true);
        return;
      }
      try {
        fluxo = await navigator.mediaDevices.getUserMedia({
          video: { facingMode: { ideal: 'environment' }, width: { ideal: 1280 }, height: { ideal: 720 } },
          audio: false,
        });
        if (encerrado) return fluxo.getTracks().forEach((faixa) => faixa.stop());
        video.srcObject = fluxo;
        await video.play().catch(() => {});
        mostrarStatus('Procurando o QR Code…');
        lerQuadro();
      } catch (erro) {
        video.parentElement.hidden = true;
        mostrarStatus(MENSAGENS_CAMERA[erro?.name] ?? 'Não foi possível abrir a câmera. Envie uma foto do QR Code do cupom.', true);
      }
    };

    dialogo.querySelector('[data-acao="cancelar"]').addEventListener('click', () => encerrar(null));
    dialogo.addEventListener('cancel', (e) => {
      e.preventDefault(); // Esc
      encerrar(null);
    });

    dialogo.querySelector('[data-campo="foto"]').addEventListener('change', async (e) => {
      const [arquivo] = e.target.files;
      e.target.value = '';
      if (!arquivo) return;
      mostrarStatus('Lendo a foto…');
      try {
        const texto = await decodificarQrCodeDeArquivo(arquivo);
        if (texto) return encerrar(texto);
        mostrarStatus('Não encontramos um QR Code nessa foto. Tire outra mais de perto, com o código inteiro e sem reflexo.', true);
      } catch {
        mostrarStatus('Não foi possível ler essa foto. Tente outra imagem ou preencha manualmente.', true);
      }
    });

    dialogo.showModal();
    prepararLeitorQrCode().catch(() => {});
    abrirCamera();
  });
}
