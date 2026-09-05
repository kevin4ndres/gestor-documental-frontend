/**
 * Validación del formulario de documento.
 * Replica las reglas del Backend para dar retroalimentación inmediata al usuario;
 * el Backend vuelve a validar (nunca se confía solo en el cliente).
 */

const FECHA_RE = /^\d{4}-\d{2}-\d{2}$/;
const CONTROL_CHARS_RE = /[\x00-\x1F\x7F]/;

export function validarDocumento(datos) {
  const errores = {};

  const titulo = (datos.titulo ?? '').trim();
  if (!titulo) errores.titulo = 'El título es obligatorio.';
  else if (titulo.length < 3 || titulo.length > 150) errores.titulo = 'El título debe tener entre 3 y 150 caracteres.';

  const tipo = Number(datos.tipo_documento_id);
  if (!Number.isInteger(tipo) || tipo < 1) errores.tipo_documento_id = 'Seleccione un tipo de documento.';

  const fecha = (datos.fecha ?? '').trim();
  if (!fecha) errores.fecha = 'La fecha es obligatoria.';
  else if (!FECHA_RE.test(fecha) || Number.isNaN(new Date(fecha).getTime())) errores.fecha = 'Ingrese una fecha válida (AAAA-MM-DD).';

  const descripcion = (datos.descripcion ?? '').trim();
  if (descripcion.length > 2000) errores.descripcion = 'La descripción no puede superar 2000 caracteres.';

  const referencia = (datos.archivo_referencia ?? '').trim();
  if (referencia.length > 255) errores.archivo_referencia = 'La referencia no puede superar 255 caracteres.';
  else if (CONTROL_CHARS_RE.test(referencia)) errores.archivo_referencia = 'La referencia contiene caracteres no permitidos.';
  else if (/^\s*(javascript|data|vbscript):/i.test(referencia)) errores.archivo_referencia = 'La referencia debe ser una ruta, código o URL http(s).';

  return { valido: Object.keys(errores).length === 0, errores };
}

/** Normaliza los datos del formulario al formato que espera la API. */
export function normalizarDocumento(datos) {
  const limpio = (v) => {
    const t = (v ?? '').trim();
    return t === '' ? null : t;
  };
  return {
    titulo: (datos.titulo ?? '').trim(),
    tipo_documento_id: Number(datos.tipo_documento_id),
    fecha: (datos.fecha ?? '').trim(),
    descripcion: limpio(datos.descripcion),
    archivo_referencia: limpio(datos.archivo_referencia),
  };
}

/** Indica si una referencia de archivo es una URL web segura para mostrarse como enlace. */
export function esUrlSegura(valor) {
  if (!valor) return false;
  try {
    const url = new URL(valor);
    return url.protocol === 'http:' || url.protocol === 'https:';
  } catch {
    return false;
  }
}
