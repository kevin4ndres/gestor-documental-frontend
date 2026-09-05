/**
 * Formateo de datos para presentación.
 */

/** 2026-08-18 -> 18/08/2026 */
export function formatearFecha(fechaIso) {
  if (!fechaIso) return '—';
  const [anio, mes, dia] = String(fechaIso).slice(0, 10).split('-');
  if (!anio || !mes || !dia) return fechaIso;
  return `${dia}/${mes}/${anio}`;
}

/** 2026-09-05 18:29:58 -> 05/09/2026 18:29 */
export function formatearFechaHora(fechaHora) {
  if (!fechaHora) return '—';
  const [fecha, hora = ''] = String(fechaHora).replace('T', ' ').split(' ');
  return `${formatearFecha(fecha)} ${hora.slice(0, 5)}`.trim();
}

/** Fecha de hoy en formato YYYY-MM-DD (valor por defecto del formulario). */
export function hoyIso() {
  const d = new Date();
  const mm = String(d.getMonth() + 1).padStart(2, '0');
  const dd = String(d.getDate()).padStart(2, '0');
  return `${d.getFullYear()}-${mm}-${dd}`;
}
