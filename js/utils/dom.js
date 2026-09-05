/**
 * Utilidades de DOM.
 */

/** Escapa caracteres peligrosos para insertar texto dentro de HTML (previene XSS). */
export function escapeHtml(value) {
  if (value === null || value === undefined) return '';
  return String(value)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

/** Atajo para querySelector. */
export const $ = (selector, root = document) => root.querySelector(selector);

/** Atajo para querySelectorAll como arreglo. */
export const $$ = (selector, root = document) => Array.from(root.querySelectorAll(selector));

/** Crea un elemento a partir de un string HTML (un solo nodo raíz). */
export function htmlToElement(html) {
  const template = document.createElement('template');
  template.innerHTML = html.trim();
  return template.content.firstElementChild;
}

/**
 * Debounce: retrasa la ejecución hasta que dejan de llegar llamadas.
 * Se usa en el buscador para no disparar una petición por cada tecla.
 */
export function debounce(fn, waitMs = 300) {
  let timer;
  return (...args) => {
    clearTimeout(timer);
    timer = setTimeout(() => fn(...args), waitMs);
  };
}
