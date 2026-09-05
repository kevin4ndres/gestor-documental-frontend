/**
 * Configuración de la aplicación.
 * No contiene credenciales: la API es de uso interno y se protege a nivel de red/servidor.
 */
export const config = {
  /** URL base del Backend (Desarrollo Backend U3). Ajustar según dónde corra la API. */
  apiBaseUrl: 'http://localhost:8000',

  /**
   * Si el Backend no responde, la app puede seguir funcionando con una API simulada
   * que respeta el mismo contrato (misma estructura JSON, mismos códigos).
   *   true   = usar siempre la simulación
   *   false  = usar siempre el Backend real
   *   'auto' = intentar Backend y, si falla la carga inicial, caer a la simulación
   */
  useMock: 'auto',

  /** Tiempo máximo de espera de una petición (ms) */
  requestTimeoutMs: 8000,

  /** Registros por página en el listado */
  pageSize: 10,
};
