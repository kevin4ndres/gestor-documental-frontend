/**
 * Punto único de acceso a la API. Decide entre Backend real y simulación
 * según config.useMock, y permite cambiar en caliente si el Backend falla.
 */
import { config } from '../config.js';
import { documentosApiReal } from './documentosApi.js';
import { documentosApiMock } from './mockApi.js';

let modo = config.useMock === true ? 'mock' : 'real';

export const api = {
  get modo() { return modo; },
  usarSimulacion() { modo = 'mock'; },
  usarReal() { modo = 'real'; },

  /** ¿Se permite caer a la simulación automáticamente? */
  get autoFallback() { return config.useMock === 'auto'; },

  listarTipos: (...a) => impl().listarTipos(...a),
  listar: (...a) => impl().listar(...a),
  obtener: (...a) => impl().obtener(...a),
  crear: (...a) => impl().crear(...a),
  actualizar: (...a) => impl().actualizar(...a),
  eliminar: (...a) => impl().eliminar(...a),
};

function impl() {
  return modo === 'mock' ? documentosApiMock : documentosApiReal;
}
