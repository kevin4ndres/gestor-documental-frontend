/**
 * Componente: Toast
 * Responsabilidad: retroalimentación visual no bloqueante tras cada acción
 *                  (creado, actualizado, eliminado, error).
 * Recibe: mensaje, { tipo: 'success'|'danger'|'warning'|'info' }
 * Relación: lo invocan las acciones de main.js. Usa el Toast de Bootstrap.
 */
import { escapeHtml, htmlToElement } from '../utils/dom.js';

const ICONOS = { success: 'bi-check-circle-fill', danger: 'bi-x-circle-fill', warning: 'bi-exclamation-triangle-fill', info: 'bi-info-circle-fill' };

export function mostrarToast(mensaje, { tipo = 'success', duracion = 4000 } = {}) {
  const contenedor = document.getElementById('toasts');
  const el = htmlToElement(`
    <div class="toast align-items-center text-bg-${tipo} border-0" role="${tipo === 'danger' ? 'alert' : 'status'}" aria-live="${tipo === 'danger' ? 'assertive' : 'polite'}" aria-atomic="true">
      <div class="d-flex">
        <div class="toast-body"><i class="bi ${ICONOS[tipo]} me-2" aria-hidden="true"></i>${escapeHtml(mensaje)}</div>
        <button type="button" class="btn-close btn-close-white me-2 m-auto" data-bs-dismiss="toast" aria-label="Cerrar"></button>
      </div>
    </div>`);
  contenedor.appendChild(el);
  const toast = bootstrap.Toast.getOrCreateInstance(el, { delay: duracion });
  el.addEventListener('hidden.bs.toast', () => el.remove()); // limpia el DOM
  toast.show();
}
