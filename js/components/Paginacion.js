/**
 * Componente: Paginacion
 * Responsabilidad: navegación entre páginas del listado.
 * Recibe: meta { page, total_pages }
 * Devuelve: string HTML; los clics los maneja DocumentosTabla por delegación.
 */
export function Paginacion({ page, total_pages: total }) {
  if (total <= 1) return '';

  const item = (n, texto, { disabled = false, active = false, label = '' } = {}) => `
    <li class="page-item ${disabled ? 'disabled' : ''} ${active ? 'active' : ''}">
      <a class="page-link" href="#" data-page="${n}" ${label ? `aria-label="${label}"` : ''} ${active ? 'aria-current="page"' : ''}>${texto}</a>
    </li>`;

  // Ventana de hasta 5 páginas alrededor de la actual
  const inicio = Math.max(1, Math.min(page - 2, total - 4));
  const fin = Math.min(total, inicio + 4);
  let paginas = '';
  for (let n = inicio; n <= fin; n++) paginas += item(n, n, { active: n === page });

  return `
    <nav aria-label="Paginación del listado">
      <ul class="pagination pagination-sm mb-0 paginacion">
        ${item(page - 1, '&laquo;', { disabled: page <= 1, label: 'Página anterior' })}
        ${paginas}
        ${item(page + 1, '&raquo;', { disabled: page >= total, label: 'Página siguiente' })}
      </ul>
    </nav>`;
}
