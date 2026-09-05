/**
 * Servicio de acceso a la API del Gestor Documental (Backend U3).
 *
 * Contrato (compartido con la asignatura Desarrollo Backend):
 *   GET    /api/tipos-documento
 *   GET    /api/documentos?tipo=&q=&desde=&hasta=&page=&per_page=
 *   GET    /api/documentos/{id}
 *   POST   /api/documentos
 *   PUT    /api/documentos/{id}
 *   PATCH  /api/documentos/{id}
 *   DELETE /api/documentos/{id}
 */
import { request } from './httpClient.js';

function queryString(params) {
  const qs = new URLSearchParams();
  Object.entries(params).forEach(([k, v]) => {
    if (v !== undefined && v !== null && v !== '') qs.set(k, v);
  });
  const s = qs.toString();
  return s ? `?${s}` : '';
}

export const documentosApiReal = {
  async listarTipos() {
    const res = await request('/api/tipos-documento');
    return res.data;
  },

  /** @returns {{items: Array, meta: {total:number,page:number,per_page:number,total_pages:number}}} */
  async listar({ tipo, q, desde, hasta, page = 1, perPage = 10 } = {}, signal) {
    const res = await request(`/api/documentos${queryString({ tipo, q, desde, hasta, page, per_page: perPage })}`, { signal });
    return { items: res.data, meta: res.meta };
  },

  async obtener(id) {
    const res = await request(`/api/documentos/${encodeURIComponent(id)}`);
    return res.data;
  },

  async crear(datos) {
    const res = await request('/api/documentos', { method: 'POST', body: datos });
    return res.data;
  },

  async actualizar(id, datos) {
    const res = await request(`/api/documentos/${encodeURIComponent(id)}`, { method: 'PUT', body: datos });
    return res.data;
  },

  async eliminar(id) {
    await request(`/api/documentos/${encodeURIComponent(id)}`, { method: 'DELETE' });
    return true;
  },
};
