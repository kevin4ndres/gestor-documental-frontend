/**
 * Componente: DocumentosTabla
 * Responsabilidad: mostrar el listado de documentos con sus acciones, más los
 *                  estados de carga, error y "sin resultados", y la paginación.
 * Recibe: { documentos, meta, cargando, error, onVer(id), onEditar(id), onEliminar(id),
 *           onPagina(n), onReintentar() }
 * Relación: se re-renderiza desde main.js cada vez que cambia el estado del listado.
 */
import { escapeHtml } from '../utils/dom.js';
import { formatearFecha } from '../utils/format.js';
import { EstadoVacio } from './EstadoVacio.js';
import { Paginacion } from './Paginacion.js';
import { BadgeTipo } from './BadgeTipo.js';

export function DocumentosTabla(contenedor, props) {
  const { documentos, meta, cargando, error, onVer, onEditar, onEliminar, onPagina, onReintentar } = props;

  if (cargando) {
    contenedor.innerHTML = `
      <div class="card card-body shadow-sm text-center py-5" role="status" aria-live="polite">
        <div class="spinner-border text-primary mx-auto" aria-hidden="true"></div>
        <p class="mt-3 mb-0">Cargando documentos…</p>
      </div>`;
    return;
  }

  if (error) {
    contenedor.innerHTML = EstadoVacio({
      icono: 'bi-exclamation-triangle',
      titulo: 'No se pudo cargar el listado',
      mensaje: error,
      accion: { id: 'btn-reintentar', texto: 'Reintentar', icono: 'bi-arrow-clockwise' },
      tono: 'danger',
    });
    contenedor.querySelector('#btn-reintentar')?.addEventListener('click', onReintentar);
    return;
  }

  if (!documentos.length) {
    contenedor.innerHTML = EstadoVacio({
      icono: 'bi-folder2-open',
      titulo: 'Sin resultados',
      mensaje: 'No hay documentos que coincidan con la búsqueda o los filtros aplicados.',
    });
    return;
  }

  const filas = documentos.map((d) => `
    <tr data-id="${d.id}">
      <td data-label="Título">
        <span class="tabla-docs__titulo">${escapeHtml(d.titulo)}</span>
      </td>
      <td data-label="Tipo">${BadgeTipo(d.tipo_documento)}</td>
      <td data-label="Fecha"><time datetime="${escapeHtml(d.fecha)}">${formatearFecha(d.fecha)}</time></td>
      <td data-label="Descripción">
        <span class="tabla-docs__descripcion" title="${escapeHtml(d.descripcion || '')}">${escapeHtml(d.descripcion || '—')}</span>
      </td>
      <td data-label="Acciones" class="tabla-docs__acciones">
        <div class="btn-group btn-group-sm" role="group" aria-label="Acciones para ${escapeHtml(d.titulo)}">
          <button type="button" class="btn btn-outline-secondary" data-accion="ver" data-id="${d.id}" title="Ver detalle" aria-label="Ver detalle de ${escapeHtml(d.titulo)}">
            <i class="bi bi-eye" aria-hidden="true"></i>
          </button>
          <button type="button" class="btn btn-outline-primary" data-accion="editar" data-id="${d.id}" title="Editar" aria-label="Editar ${escapeHtml(d.titulo)}">
            <i class="bi bi-pencil" aria-hidden="true"></i>
          </button>
          <button type="button" class="btn btn-outline-danger" data-accion="eliminar" data-id="${d.id}" title="Eliminar" aria-label="Eliminar ${escapeHtml(d.titulo)}">
            <i class="bi bi-trash" aria-hidden="true"></i>
          </button>
        </div>
      </td>
    </tr>`).join('');

  contenedor.innerHTML = `
    <div class="card shadow-sm">
      <div class="table-responsive">
        <table class="table table-hover align-middle mb-0 tabla-docs">
          <caption class="visually-hidden">Listado de documentos institucionales, ${meta.total} en total</caption>
          <thead class="table-light">
            <tr>
              <th scope="col">Título</th>
              <th scope="col">Tipo</th>
              <th scope="col">Fecha</th>
              <th scope="col">Descripción / referencia</th>
              <th scope="col" class="text-end">Acciones</th>
            </tr>
          </thead>
          <tbody>${filas}</tbody>
        </table>
      </div>
      <div class="card-footer bg-white d-flex flex-wrap justify-content-between align-items-center gap-2">
        <span class="small text-body-secondary">
          Mostrando ${documentos.length} de ${meta.total} documento${meta.total === 1 ? '' : 's'}
        </span>
        ${Paginacion(meta)}
      </div>
    </div>`;

  // Delegación de eventos: un solo listener para todas las filas (más eficiente que uno por botón)
  contenedor.querySelector('tbody').addEventListener('click', (e) => {
    const btn = e.target.closest('button[data-accion]');
    if (!btn) return;
    const id = Number(btn.dataset.id);
    ({ ver: onVer, editar: onEditar, eliminar: onEliminar })[btn.dataset.accion]?.(id);
  });

  contenedor.querySelector('.paginacion')?.addEventListener('click', (e) => {
    const link = e.target.closest('[data-page]');
    if (!link || link.closest('.disabled')) return;
    e.preventDefault();
    onPagina(Number(link.dataset.page));
  });
}
