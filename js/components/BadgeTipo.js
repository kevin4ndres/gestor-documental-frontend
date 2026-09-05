/**
 * Componente: BadgeTipo
 * Responsabilidad: etiqueta visual del tipo de documento (color por categoría).
 * Recibe: tipo { codigo, nombre }
 * Devuelve: string HTML. Reutilizado en la tabla y en el detalle.
 */
import { escapeHtml } from '../utils/dom.js';

const CODIGOS = ['memo', 'oficio', 'citacion_apoderado', 'acuerdo_apoderado', 'reunion_comunal', 'permiso_administrativo'];

export function BadgeTipo(tipo) {
  if (!tipo) return '<span class="badge badge-tipo badge-tipo--default">Sin tipo</span>';
  const clase = CODIGOS.includes(tipo.codigo) ? tipo.codigo : 'default';
  return `<span class="badge badge-tipo badge-tipo--${clase}">${escapeHtml(tipo.nombre)}</span>`;
}
