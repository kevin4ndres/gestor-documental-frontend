/**
 * API simulada en memoria.
 * Respeta EXACTAMENTE el mismo contrato que documentosApiReal (mismos métodos,
 * misma forma de datos, mismos errores), para poder desarrollar y demostrar el
 * Frontend aunque el Backend no esté disponible.
 */
import { ApiError } from './httpClient.js';

const tipos = [
  { id: 1, codigo: 'memo', nombre: 'Memo', descripcion: 'Comunicaciones internas breves del equipo directivo', activo: true },
  { id: 2, codigo: 'oficio', nombre: 'Oficio', descripcion: 'Comunicaciones formales hacia organismos externos', activo: true },
  { id: 3, codigo: 'citacion_apoderado', nombre: 'Citación de apoderados', descripcion: 'Citaciones a apoderados', activo: true },
  { id: 4, codigo: 'acuerdo_apoderado', nombre: 'Acuerdo de apoderados', descripcion: 'Acuerdos firmados con apoderados', activo: true },
  { id: 5, codigo: 'reunion_comunal', nombre: 'Reunión comunal', descripcion: 'Actas de reuniones comunales', activo: true },
  { id: 6, codigo: 'permiso_administrativo', nombre: 'Permiso administrativo', descripcion: 'Permisos administrativos del personal', activo: true },
];

let secuencia = 7;
let documentos = [
  doc(1, 'Memo N°12 - Uso de sala de computación', 1, '2026-08-03', 'Instrucciones para el uso compartido de la sala de computación durante agosto.', 'archivos/2026/memo_012.pdf'),
  doc(2, 'Oficio N°45 - Solicitud de mantención techumbre', 2, '2026-08-10', 'Oficio dirigido a la Corporación Municipal de María Pinto solicitando reparación de techumbre.', 'archivos/2026/oficio_045.pdf'),
  doc(3, 'Citación apoderado - 5° básico', 3, '2026-08-18', 'Citación a entrevista por rendimiento académico del primer semestre.', 'archivos/2026/citacion_5b_018.pdf'),
  doc(4, 'Acuerdo de apoyo pedagógico - 3° básico', 4, '2026-08-20', 'Acuerdo de compromiso de apoyo en el hogar firmado en entrevista.', 'archivos/2026/acuerdo_3b_020.pdf'),
  doc(5, 'Acta reunión comunal de directores - agosto', 5, '2026-08-25', 'Acta de la reunión mensual de directores de la comuna de María Pinto.', 'archivos/2026/acta_comunal_ago.pdf'),
  doc(6, 'Permiso administrativo - Docente 1° básico', 6, '2026-08-28', 'Solicitud de permiso administrativo por un día, artículo 40 Estatuto Docente.', 'archivos/2026/permiso_adm_028.pdf'),
];

function ahora() {
  return new Date().toISOString().slice(0, 19).replace('T', ' ');
}

function doc(id, titulo, tipoId, fecha, descripcion, archivo) {
  const t = tipos.find((x) => x.id === tipoId);
  return {
    id, titulo, tipo_documento_id: tipoId,
    tipo_documento: { id: t.id, codigo: t.codigo, nombre: t.nombre },
    fecha, descripcion, archivo_referencia: archivo,
    creado_en: ahora(), actualizado_en: ahora(),
  };
}

/** Simula latencia de red para que los estados de carga sean visibles. */
const espera = (ms = 250) => new Promise((r) => setTimeout(r, ms));

function validar(datos) {
  const errors = {};
  if (!datos.titulo || datos.titulo.length < 3 || datos.titulo.length > 150) errors.titulo = 'El título debe tener entre 3 y 150 caracteres';
  if (!tipos.some((t) => t.id === Number(datos.tipo_documento_id))) errors.tipo_documento_id = 'El tipo de documento no existe';
  if (!/^\d{4}-\d{2}-\d{2}$/.test(datos.fecha || '')) errors.fecha = 'La fecha debe tener formato YYYY-MM-DD';
  if (Object.keys(errors).length) throw new ApiError('Los datos enviados no son válidos', { status: 422, errors });
}

export const documentosApiMock = {
  async listarTipos() {
    await espera();
    return tipos.map((t) => ({ ...t }));
  },

  async listar({ tipo, q, desde, hasta, page = 1, perPage = 10 } = {}) {
    await espera();
    let lista = [...documentos];
    if (tipo) lista = lista.filter((d) => d.tipo_documento_id === Number(tipo));
    if (q) {
      const texto = q.toLowerCase();
      lista = lista.filter((d) => d.titulo.toLowerCase().includes(texto) || (d.descripcion || '').toLowerCase().includes(texto));
    }
    if (desde) lista = lista.filter((d) => d.fecha >= desde);
    if (hasta) lista = lista.filter((d) => d.fecha <= hasta);
    lista.sort((a, b) => (b.fecha + b.id).localeCompare(a.fecha + a.id));

    const total = lista.length;
    const inicio = (page - 1) * perPage;
    return {
      items: lista.slice(inicio, inicio + perPage).map((d) => ({ ...d })),
      meta: { total, page, per_page: perPage, total_pages: Math.max(1, Math.ceil(total / perPage)) },
    };
  },

  async obtener(id) {
    await espera();
    const d = documentos.find((x) => x.id === Number(id));
    if (!d) throw new ApiError(`No existe un documento con id ${id}`, { status: 404 });
    return { ...d };
  },

  async crear(datos) {
    await espera();
    validar(datos);
    const nuevo = doc(secuencia++, datos.titulo, Number(datos.tipo_documento_id), datos.fecha, datos.descripcion ?? null, datos.archivo_referencia ?? null);
    documentos.push(nuevo);
    return { ...nuevo };
  },

  async actualizar(id, datos) {
    await espera();
    const idx = documentos.findIndex((x) => x.id === Number(id));
    if (idx === -1) throw new ApiError(`No existe un documento con id ${id}`, { status: 404 });
    validar(datos);
    const actualizado = { ...doc(Number(id), datos.titulo, Number(datos.tipo_documento_id), datos.fecha, datos.descripcion ?? null, datos.archivo_referencia ?? null), creado_en: documentos[idx].creado_en };
    documentos[idx] = actualizado;
    return { ...actualizado };
  },

  async eliminar(id) {
    await espera();
    const idx = documentos.findIndex((x) => x.id === Number(id));
    if (idx === -1) throw new ApiError(`No existe un documento con id ${id}`, { status: 404 });
    documentos.splice(idx, 1);
    return true;
  },
};
