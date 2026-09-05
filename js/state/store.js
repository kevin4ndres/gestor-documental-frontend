/**
 * Store de estado mínimo (patrón observador).
 * Los componentes se suscriben y se vuelven a renderizar solo cuando cambia
 * la parte del estado que les interesa.
 */
export function createStore(estadoInicial) {
  let estado = { ...estadoInicial };
  const suscriptores = new Set();

  return {
    get: () => estado,

    /** Actualiza el estado (fusión superficial) y notifica solo si hubo cambios. */
    set(parcial) {
      const cambios = Object.keys(parcial).filter((k) => estado[k] !== parcial[k]);
      if (cambios.length === 0) return;
      estado = { ...estado, ...parcial };
      suscriptores.forEach((fn) => fn(estado, cambios));
    },

    /**
     * Suscribe una función. Si se indican `claves`, solo se llama cuando
     * cambia alguna de ellas (evita renderizados innecesarios).
     */
    subscribe(fn, claves = null) {
      const wrapper = (est, cambios) => {
        if (!claves || cambios.some((c) => claves.includes(c))) fn(est, cambios);
      };
      suscriptores.add(wrapper);
      return () => suscriptores.delete(wrapper);
    },
  };
}

export const store = createStore({
  tipos: [],
  documentos: [],
  meta: { total: 0, page: 1, per_page: 10, total_pages: 1 },
  filtros: { q: '', tipo: '', desde: '', hasta: '' },
  page: 1,
  cargando: true,
  error: null,          // mensaje de error del listado (string) o null
  modoApi: 'real',      // 'real' | 'mock'
});
