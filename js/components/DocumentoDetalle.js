/**
 * Componente: DocumentoDetalle
 * Responsabilidad: mostrar la ficha completa de un documento en un modal.
 * Recibe: documento, { onEditar(id), onEliminar(id) }
 * Relación: se abre desde la acción "ver" de DocumentosTabla; puede derivar a edición o eliminación.
 */
import { escapeHtml, htmlToElement } from '../utils/dom.js';
import { formatearFecha, formatearFechaHora } from '../utils/format.js';
import { esUrlSegura } from '../utils/validators.js';
import { BadgeTipo } from './BadgeTipo.js';

export function abrirDetalle(doc, { onEditar, onEliminar }) {
  const referencia = doc.archivo_referencia
    ? (esUrlSegura(doc.archivo_referencia)
        ? `<a href="${escapeHtml(doc.archivo_referencia)}" target="_blank" rel="noopener noreferrer">${escapeHtml(doc.archivo_referencia)} <i class="bi bi-box-arrow-up-right small" aria-hidden="true"></i></a>`
        : `<code>${escapeHtml(doc.archivo_referencia)}</code>`)
    : '<span class="text-body-secondary">Sin archivo asociado</span>';

  const el = htmlToElement(`
    <div class="modal fade" tabindex="-1" aria-labelledby="detalle-titulo" aria-hidden="true">
      <div class="modal-dialog modal-lg modal-dialog-centered modal-dialog-scrollable">
        <div class="modal-content">
          <div class="modal-header">
            <h2 class="modal-title h5" id="detalle-titulo">${escapeHtml(doc.titulo)}</h2>
            <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Cerrar"></button>
          </div>
          <div class="modal-body">
            <dl class="row detalle-doc mb-0">
              <dt class="col-sm-4">Identificador</dt>
              <dd class="col-sm-8">#${doc.id}</dd>
              <dt class="col-sm-4">Tipo de documento</dt>
              <dd class="col-sm-8">${BadgeTipo(doc.tipo_documento)}</dd>
              <dt class="col-sm-4">Fecha del documento</dt>
              <dd class="col-sm-8"><time datetime="${escapeHtml(doc.fecha)}">${formatearFecha(doc.fecha)}</time></dd>
              <dt class="col-sm-4">Descripción / referencia</dt>
              <dd class="col-sm-8" style="white-space: pre-line">${escapeHtml(doc.descripcion || '—')}</dd>
              <dt class="col-sm-4">Archivo asociado</dt>
              <dd class="col-sm-8">${referencia}</dd>
              <dt class="col-sm-4">Registrado</dt>
              <dd class="col-sm-8">${formatearFechaHora(doc.creado_en)}</dd>
              <dt class="col-sm-4">Última modificación</dt>
              <dd class="col-sm-8 mb-0">${formatearFechaHora(doc.actualizado_en)}</dd>
            </dl>
          </div>
          <div class="modal-footer justify-content-between">
            <button type="button" class="btn btn-outline-danger" data-rol="eliminar">
              <i class="bi bi-trash me-1" aria-hidden="true"></i>Eliminar
            </button>
            <div>
              <button type="button" class="btn btn-outline-secondary" data-bs-dismiss="modal">Cerrar</button>
              <button type="button" class="btn btn-primary" data-rol="editar">
                <i class="bi bi-pencil me-1" aria-hidden="true"></i>Editar
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>`);
  document.getElementById('modales').appendChild(el);

  const modal = new bootstrap.Modal(el);
  el.querySelector('[data-rol="editar"]').addEventListener('click', () => { modal.hide(); onEditar(doc.id); });
  el.querySelector('[data-rol="eliminar"]').addEventListener('click', () => { modal.hide(); onEliminar(doc.id); });
  el.addEventListener('hidden.bs.modal', () => el.remove());
  modal.show();
}
