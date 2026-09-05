/**
 * Componente: ConfirmDialog
 * Responsabilidad: confirmación antes de una acción destructiva (eliminar).
 * Recibe: { titulo, mensaje, textoConfirmar }
 * Devuelve: Promise<boolean> (true = confirmado). Usa el Modal de Bootstrap
 *           (accesible: foco atrapado, cierre con Esc, aria-*).
 */
import { escapeHtml, htmlToElement } from '../utils/dom.js';

export function confirmar({ titulo = '¿Confirmar acción?', mensaje, textoConfirmar = 'Eliminar' }) {
  return new Promise((resolve) => {
    const el = htmlToElement(`
      <div class="modal fade" tabindex="-1" aria-labelledby="confirm-titulo" aria-describedby="confirm-mensaje" aria-hidden="true">
        <div class="modal-dialog modal-dialog-centered">
          <div class="modal-content">
            <div class="modal-header">
              <h2 class="modal-title h5" id="confirm-titulo"><i class="bi bi-exclamation-triangle text-danger me-2" aria-hidden="true"></i>${escapeHtml(titulo)}</h2>
              <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Cerrar"></button>
            </div>
            <div class="modal-body" id="confirm-mensaje">${escapeHtml(mensaje)}</div>
            <div class="modal-footer">
              <button type="button" class="btn btn-outline-secondary" data-bs-dismiss="modal">Cancelar</button>
              <button type="button" class="btn btn-danger" data-rol="confirmar">${escapeHtml(textoConfirmar)}</button>
            </div>
          </div>
        </div>
      </div>`);
    document.getElementById('modales').appendChild(el);

    let resultado = false;
    el.querySelector('[data-rol="confirmar"]').addEventListener('click', () => { resultado = true; modal.hide(); });
    el.addEventListener('hidden.bs.modal', () => { el.remove(); resolve(resultado); });

    const modal = new bootstrap.Modal(el);
    modal.show();
  });
}
