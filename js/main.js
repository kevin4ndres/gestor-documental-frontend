/**
 * Punto de entrada de la aplicación.
 * Orquesta: estado (store) -> componentes -> API.
 *
 * Gestor Documental - Escuela Básica G-733 Chorombo Bajo
 * Evaluación Unidad 3 - Desarrollo Frontend (IPSS)
 */
import { config } from './config.js';
import { api } from './api/index.js';
import { store } from './state/store.js';
import { $ } from './utils/dom.js';

import { Navbar } from './components/Navbar.js';
import { Filtros } from './components/Filtros.js';
import { DocumentosTabla } from './components/DocumentosTabla.js';
import { abrirDetalle } from './components/DocumentoDetalle.js';
import { abrirFormulario } from './components/DocumentoForm.js';
import { confirmar } from './components/ConfirmDialog.js';
import { mostrarToast } from './components/Toast.js';

// ---------- Referencias a contenedores ----------
const elNavbar = $('#navbar');
const elFiltros = $('#filtros');
const elListado = $('#listado');
const elResumen = $('#resumen-listado');
const elEstadoApi = $('#estado-api');

// Controlador para cancelar una carga anterior si el usuario sigue filtrando
let cargaActual = null;

// ---------- Acciones (casos de uso) ----------

async function cargarTipos() {
  const tipos = await api.listarTipos();
  store.set({ tipos });
}

async function cargarDocumentos() {
  cargaActual?.abort();
  cargaActual = new AbortController();
  const { filtros, page } = store.get();
  store.set({ cargando: true, error: null });

  try {
    const { items, meta } = await api.listar({ ...filtros, page, perPage: config.pageSize }, cargaActual.signal);
    store.set({ documentos: items, meta, cargando: false });
  } catch (err) {
    if (err.causa?.name === 'AbortError' && cargaActual.signal.aborted) return; // reemplazada por otra carga
    store.set({ documentos: [], cargando: false, error: err.message });
  }
}

function cambiarFiltros(filtros) {
  store.set({ filtros: { ...store.get().filtros, ...filtros }, page: 1 });
  cargarDocumentos();
}

function limpiarFiltros() {
  store.set({ filtros: { q: '', tipo: '', desde: '', hasta: '' }, page: 1 });
  renderFiltros();
  cargarDocumentos();
}

function irAPagina(n) {
  store.set({ page: n });
  cargarDocumentos();
  $('#contenido-principal').focus({ preventScroll: false });
}

async function verDocumento(id) {
  try {
    const doc = await api.obtener(id);
    abrirDetalle(doc, { onEditar: editarDocumento, onEliminar: eliminarDocumento });
  } catch (err) {
    mostrarToast(err.message, { tipo: 'danger' });
    if (err.esNoEncontrado) cargarDocumentos();
  }
}

function nuevoDocumento() {
  abrirFormulario({
    tipos: store.get().tipos,
    documento: null,
    onGuardar: async (datos) => {
      const creado = await api.crear(datos);
      mostrarToast(`Documento "${creado.titulo}" creado correctamente.`);
      await cargarDocumentos();
    },
  });
}

async function editarDocumento(id) {
  try {
    const doc = await api.obtener(id);
    abrirFormulario({
      tipos: store.get().tipos,
      documento: doc,
      onGuardar: async (datos, docId) => {
        const actualizado = await api.actualizar(docId, datos);
        mostrarToast(`Documento "${actualizado.titulo}" actualizado.`);
        await cargarDocumentos();
      },
    });
  } catch (err) {
    mostrarToast(err.message, { tipo: 'danger' });
  }
}

async function eliminarDocumento(id) {
  const doc = store.get().documentos.find((d) => d.id === id) ?? { titulo: `#${id}` };
  const ok = await confirmar({
    titulo: 'Eliminar documento',
    mensaje: `¿Está seguro de eliminar "${doc.titulo}"? Esta acción no se puede deshacer.`,
    textoConfirmar: 'Sí, eliminar',
  });
  if (!ok) return;

  try {
    await api.eliminar(id);
    mostrarToast(`Documento "${doc.titulo}" eliminado.`, { tipo: 'warning' });
    // Si era el último de la página, retrocede una página
    const { documentos, page } = store.get();
    if (documentos.length === 1 && page > 1) store.set({ page: page - 1 });
    await cargarDocumentos();
  } catch (err) {
    mostrarToast(err.message, { tipo: 'danger' });
    if (err.esNoEncontrado) cargarDocumentos();
  }
}

// ---------- Renderizado ----------

function renderFiltros() {
  const { tipos, filtros } = store.get();
  Filtros(elFiltros, { tipos, filtros, onCambiar: cambiarFiltros, onLimpiar: limpiarFiltros });
}

function renderListado() {
  const { documentos, meta, cargando, error } = store.get();
  DocumentosTabla(elListado, {
    documentos, meta, cargando, error,
    onVer: verDocumento,
    onEditar: editarDocumento,
    onEliminar: eliminarDocumento,
    onPagina: irAPagina,
    onReintentar: cargarDocumentos,
  });
  if (cargando) elResumen.textContent = 'Cargando…';
  else if (error) elResumen.textContent = 'Error al cargar el listado';
  else elResumen.textContent = `${meta.total} documento${meta.total === 1 ? '' : 's'} registrado${meta.total === 1 ? '' : 's'}`;
}

function renderEstadoApi() {
  const mock = store.get().modoApi === 'mock';
  elEstadoApi.innerHTML = mock
    ? '<i class="bi bi-plug text-warning" aria-hidden="true"></i> Modo demostración (API simulada)'
    : `<i class="bi bi-plug-fill text-success" aria-hidden="true"></i> Conectado a ${config.apiBaseUrl}`;
}

// Suscripciones selectivas: cada componente se redibuja solo con los cambios que le afectan
store.subscribe(renderFiltros, ['tipos']);
store.subscribe(renderListado, ['documentos', 'meta', 'cargando', 'error']);
store.subscribe(renderEstadoApi, ['modoApi']);

// ---------- Inicio ----------

async function iniciar() {
  Navbar(elNavbar, { titulo: 'Gestor Documental', subtitulo: 'Escuela Básica G-733 Chorombo Bajo' });
  $('#btn-nuevo').addEventListener('click', nuevoDocumento);
  renderListado();
  store.set({ modoApi: api.modo });
  renderEstadoApi();

  try {
    await cargarTipos();
  } catch (err) {
    if (api.autoFallback && err.esDeRed) {
      // Backend no disponible: se continúa con la API simulada (mismo contrato)
      api.usarSimulacion();
      store.set({ modoApi: 'mock' });
      mostrarToast('No se pudo conectar con el Backend. Se muestra una demostración con datos simulados.', { tipo: 'warning', duracion: 7000 });
      await cargarTipos();
    } else {
      store.set({ cargando: false, error: err.message });
      return;
    }
  }
  await cargarDocumentos();
}

iniciar();
