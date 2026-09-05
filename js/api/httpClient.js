/**
 * Cliente HTTP mínimo sobre fetch.
 * - Agrega cabeceras JSON, timeout y manejo uniforme de errores.
 * - Convierte la respuesta del Backend ({success, message, data, meta, errors}) en
 *   un objeto JS o lanza ApiError con el mensaje entregado por la API.
 */
import { config } from '../config.js';

export class ApiError extends Error {
  constructor(message, { status = 0, errors = {}, causa = null } = {}) {
    super(message);
    this.name = 'ApiError';
    this.status = status;   // código HTTP (0 = sin respuesta / red)
    this.errors = errors;   // errores por campo (422)
    this.causa = causa;
  }
  get esDeRed() { return this.status === 0; }
  get esValidacion() { return this.status === 422; }
  get esNoEncontrado() { return this.status === 404; }
}

export async function request(path, { method = 'GET', body = null, signal } = {}) {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), config.requestTimeoutMs);
  if (signal) signal.addEventListener('abort', () => controller.abort(), { once: true });

  const options = {
    method,
    headers: { Accept: 'application/json' },
    signal: controller.signal,
  };
  if (body !== null) {
    options.headers['Content-Type'] = 'application/json';
    options.body = JSON.stringify(body);
  }

  let response;
  try {
    response = await fetch(`${config.apiBaseUrl}${path}`, options);
  } catch (err) {
    clearTimeout(timer);
    const msg = err.name === 'AbortError'
      ? 'La solicitud tardó demasiado. Verifique que el servidor esté disponible.'
      : 'No fue posible conectar con el servidor.';
    throw new ApiError(msg, { status: 0, causa: err });
  }
  clearTimeout(timer);

  let payload = null;
  const text = await response.text();
  if (text) {
    try { payload = JSON.parse(text); } catch { payload = null; }
  }

  if (!response.ok) {
    // Mensaje claro sin exponer detalle técnico al usuario final
    const message = payload?.message || `Error ${response.status} al comunicarse con el servidor.`;
    throw new ApiError(message, { status: response.status, errors: payload?.errors || {} });
  }

  return payload ?? { success: true, data: null };
}
