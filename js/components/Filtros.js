/**
 * Componente: Filtros
 * Responsabilidad: búsqueda por texto, filtro por tipo y rango de fechas.
 * Recibe: { tipos, filtros, onCambiar(filtros), onLimpiar() }
 * Relación: main.js lo re-renderiza cuando cambian los tipos; emite cambios de filtros
 *           que provocan una nueva carga del listado.
 */
import { escapeHtml, debounce, $ } from '../utils/dom.js';

export function Filtros(contenedor, { tipos, filtros, onCambiar, onLimpiar }) {
  const opcionesTipo = tipos.map((t) =>
    `<option value="${t.id}" ${String(filtros.tipo) === String(t.id) ? 'selected' : ''}>${escapeHtml(t.nombre)}</option>`,
  ).join('');

  contenedor.innerHTML = `
    <form class="card card-body shadow-sm" id="form-filtros" role="search" novalidate>
      <div class="row g-2 align-items-end">
        <div class="col-12 col-md-5">
          <label for="filtro-q" class="form-label">Buscar</label>
          <div class="input-group">
            <span class="input-group-text" aria-hidden="true"><i class="bi bi-search"></i></span>
            <input type="search" class="form-control" id="filtro-q" name="q" placeholder="Título o descripción…"
                   value="${escapeHtml(filtros.q)}" autocomplete="off">
          </div>
        </div>
        <div class="col-12 col-sm-6 col-md-3">
          <label for="filtro-tipo" class="form-label">Tipo de documento</label>
          <select class="form-select" id="filtro-tipo" name="tipo">
            <option value="">Todos los tipos</option>
            ${opcionesTipo}
          </select>
        </div>
        <div class="col-6 col-sm-3 col-md-2">
          <label for="filtro-desde" class="form-label">Desde</label>
          <input type="date" class="form-control" id="filtro-desde" name="desde" value="${escapeHtml(filtros.desde)}">
        </div>
        <div class="col-6 col-sm-3 col-md-2">
          <label for="filtro-hasta" class="form-label">Hasta</label>
          <input type="date" class="form-control" id="filtro-hasta" name="hasta" value="${escapeHtml(filtros.hasta)}">
        </div>
      </div>
      <div class="d-flex justify-content-end mt-2">
        <button type="button" class="btn btn-link btn-sm text-decoration-none" id="btn-limpiar">
          <i class="bi bi-x-circle me-1" aria-hidden="true"></i>Limpiar filtros
        </button>
      </div>
    </form>`;

  const form = $('#form-filtros', contenedor);
  const leer = () => Object.fromEntries(new FormData(form).entries());

  // El texto se envía con debounce para no llamar a la API en cada tecla
  $('#filtro-q', form).addEventListener('input', debounce(() => onCambiar(leer()), 350));
  ['#filtro-tipo', '#filtro-desde', '#filtro-hasta'].forEach((sel) => {
    $(sel, form).addEventListener('change', () => onCambiar(leer()));
  });
  form.addEventListener('submit', (e) => { e.preventDefault(); onCambiar(leer()); });
  $('#btn-limpiar', form).addEventListener('click', () => {
    form.reset();
    onLimpiar();
  });
}
