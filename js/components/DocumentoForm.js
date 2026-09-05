/**
 * Componente: DocumentoForm
 * Responsabilidad: formulario de creación y edición de documentos en un modal,
 *                  con validación en cliente y errores por campo devueltos por la API.
 * Recibe: { tipos, documento (null = crear), onGuardar(datos, id) -> Promise }
 * Relación: se abre desde "Nuevo documento" o desde la acción "editar";
 *           al guardar, main.js recarga el listado y muestra un Toast.
 */
import { escapeHtml, htmlToElement, $ } from '../utils/dom.js';
import { hoyIso } from '../utils/format.js';
import { validarDocumento, normalizarDocumento } from '../utils/validators.js';

export function abrirFormulario({ tipos, documento = null, onGuardar }) {
  const esEdicion = documento !== null;
  const v = documento ?? { titulo: '', tipo_documento_id: '', fecha: hoyIso(), descripcion: '', archivo_referencia: '' };

  const opciones = tipos.map((t) =>
    `<option value="${t.id}" ${Number(v.tipo_documento_id) === t.id ? 'selected' : ''}>${escapeHtml(t.nombre)}</option>`,
  ).join('');

  const el = htmlToElement(`
    <div class="modal fade" tabindex="-1" aria-labelledby="form-titulo" aria-hidden="true" data-bs-backdrop="static">
      <div class="modal-dialog modal-lg modal-dialog-centered modal-dialog-scrollable">
        <form class="modal-content" id="form-documento" novalidate>
          <div class="modal-header">
            <h2 class="modal-title h5" id="form-titulo">${esEdicion ? 'Editar documento' : 'Nuevo documento'}</h2>
            <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Cerrar"></button>
          </div>
          <div class="modal-body">
            <div class="alert alert-danger d-none" role="alert" id="form-error-general"></div>
            <div class="row g-3">
              <div class="col-12">
                <label for="f-titulo" class="form-label">Título <span class="text-danger" aria-hidden="true">*</span></label>
                <input type="text" class="form-control" id="f-titulo" name="titulo" value="${escapeHtml(v.titulo)}"
                       required minlength="3" maxlength="150" aria-required="true" aria-describedby="e-titulo">
                <div class="invalid-feedback" id="e-titulo"></div>
              </div>
              <div class="col-md-7">
                <label for="f-tipo" class="form-label">Tipo de documento <span class="text-danger" aria-hidden="true">*</span></label>
                <select class="form-select" id="f-tipo" name="tipo_documento_id" required aria-required="true" aria-describedby="e-tipo">
                  <option value="">Seleccione…</option>
                  ${opciones}
                </select>
                <div class="invalid-feedback" id="e-tipo"></div>
              </div>
              <div class="col-md-5">
                <label for="f-fecha" class="form-label">Fecha <span class="text-danger" aria-hidden="true">*</span></label>
                <input type="date" class="form-control" id="f-fecha" name="fecha" value="${escapeHtml(v.fecha)}" required aria-required="true" aria-describedby="e-fecha">
                <div class="invalid-feedback" id="e-fecha"></div>
              </div>
              <div class="col-12">
                <label for="f-descripcion" class="form-label">Descripción o referencia</label>
                <textarea class="form-control" id="f-descripcion" name="descripcion" rows="3" maxlength="2000" aria-describedby="e-descripcion h-descripcion">${escapeHtml(v.descripcion || '')}</textarea>
                <div class="form-text" id="h-descripcion">Resumen breve del contenido del documento (opcional).</div>
                <div class="invalid-feedback" id="e-descripcion"></div>
              </div>
              <div class="col-12">
                <label for="f-archivo" class="form-label">Archivo asociado (referencia)</label>
                <input type="text" class="form-control" id="f-archivo" name="archivo_referencia" value="${escapeHtml(v.archivo_referencia || '')}"
                       maxlength="255" placeholder="Ej: archivos/2026/memo_013.pdf o https://…" aria-describedby="e-archivo h-archivo">
                <div class="form-text" id="h-archivo">Ruta, código de archivador o enlace donde se encuentra el documento físico/digital.</div>
                <div class="invalid-feedback" id="e-archivo"></div>
              </div>
            </div>
          </div>
          <div class="modal-footer">
            <button type="button" class="btn btn-outline-secondary" data-bs-dismiss="modal">Cancelar</button>
            <button type="submit" class="btn btn-primary" id="btn-guardar">
              <span class="spinner-border spinner-border-sm d-none me-1" aria-hidden="true"></span>
              ${esEdicion ? 'Guardar cambios' : 'Crear documento'}
            </button>
          </div>
        </form>
      </div>
    </div>`);
  document.getElementById('modales').appendChild(el);

  const form = $('#form-documento', el);
  const campos = { titulo: '#f-titulo', tipo_documento_id: '#f-tipo', fecha: '#f-fecha', descripcion: '#f-descripcion', archivo_referencia: '#f-archivo' };
  const feedback = { titulo: '#e-titulo', tipo_documento_id: '#e-tipo', fecha: '#e-fecha', descripcion: '#e-descripcion', archivo_referencia: '#e-archivo' };

  function mostrarErrores(errores) {
    Object.entries(campos).forEach(([campo, sel]) => {
      const input = $(sel, form);
      const msg = errores[campo];
      input.classList.toggle('is-invalid', Boolean(msg));
      input.setAttribute('aria-invalid', msg ? 'true' : 'false');
      $(feedback[campo], form).textContent = msg || '';
    });
    const primero = Object.keys(errores).find((k) => campos[k]);
    if (primero) $(campos[primero], form).focus();
  }

  function errorGeneral(mensaje) {
    const box = $('#form-error-general', form);
    box.textContent = mensaje || '';
    box.classList.toggle('d-none', !mensaje);
  }

  // Limpia el error de un campo cuando el usuario lo corrige
  form.addEventListener('input', (e) => {
    if (e.target.classList.contains('is-invalid')) {
      e.target.classList.remove('is-invalid');
      e.target.setAttribute('aria-invalid', 'false');
    }
  });

  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    errorGeneral('');
    const datos = Object.fromEntries(new FormData(form).entries());
    const { valido, errores } = validarDocumento(datos);
    mostrarErrores(errores);
    if (!valido) return;

    const btn = $('#btn-guardar', form);
    btn.disabled = true;
    btn.querySelector('.spinner-border').classList.remove('d-none');
    try {
      await onGuardar(normalizarDocumento(datos), documento?.id ?? null);
      modal.hide();
    } catch (err) {
      if (err.errors && Object.keys(err.errors).length) {
        mostrarErrores(err.errors);          // errores por campo desde la API (422)
      } else {
        errorGeneral(err.message || 'No fue posible guardar el documento.');
      }
    } finally {
      btn.disabled = false;
      btn.querySelector('.spinner-border').classList.add('d-none');
    }
  });

  const modal = new bootstrap.Modal(el);
  el.addEventListener('shown.bs.modal', () => $('#f-titulo', form).focus());
  el.addEventListener('hidden.bs.modal', () => el.remove());
  modal.show();
}
