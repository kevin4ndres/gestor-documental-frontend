/**
 * Componente: EstadoVacio
 * Responsabilidad: mensaje para "sin resultados" o error, con acción opcional.
 * Recibe: { icono, titulo, mensaje, accion?: {id, texto, icono}, tono? }
 * Devuelve: string HTML (componente de presentación puro).
 */
import { escapeHtml } from '../utils/dom.js';

export function EstadoVacio({ icono, titulo, mensaje, accion = null, tono = 'secondary' }) {
  return `
    <div class="estado-vacio" role="status">
      <div class="estado-vacio__icono text-${tono} mb-2"><i class="bi ${icono}" aria-hidden="true"></i></div>
      <h2 class="h5">${escapeHtml(titulo)}</h2>
      <p class="mb-${accion ? '3' : '0'}">${escapeHtml(mensaje)}</p>
      ${accion ? `<button type="button" class="btn btn-outline-${tono}" id="${accion.id}">
                    <i class="bi ${accion.icono} me-1" aria-hidden="true"></i>${escapeHtml(accion.texto)}
                  </button>` : ''}
    </div>`;
}
