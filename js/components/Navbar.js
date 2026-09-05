/**
 * Componente: Navbar
 * Responsabilidad: cabecera institucional y navegación principal.
 * Recibe: { titulo, subtitulo }
 * Relación: se monta una vez desde main.js; no depende del estado.
 */
import { escapeHtml } from '../utils/dom.js';

export function Navbar(contenedor, { titulo, subtitulo }) {
  contenedor.innerHTML = `
    <nav class="navbar navbar-dark navbar-gd" aria-label="Principal">
      <div class="container">
        <a class="navbar-brand d-flex align-items-center gap-2" href="#contenido-principal">
          <span class="navbar-brand__logo" aria-hidden="true">G</span>
          <span>
            <span class="d-block lh-1">${escapeHtml(titulo)}</span>
            <small class="d-block opacity-75 lh-1 mt-1">${escapeHtml(subtitulo)}</small>
          </span>
        </a>
        <span class="navbar-text text-white-50 small d-none d-md-inline">
          <i class="bi bi-people-fill me-1" aria-hidden="true"></i>Equipo directivo
        </span>
      </div>
    </nav>`;
}
