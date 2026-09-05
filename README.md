# Gestor Documental – Frontend
## Escuela Básica G-733 Chorombo Bajo (comuna de María Pinto)

**Evaluación Sumativa Unidad 3 – Desarrollo Frontend (IF200IINF, IPSS)**
Equipo: `NOMBRE_DEL_EQUIPO` — Integrantes: `Nombre 1`, `Nombre 2`, `Nombre 3`
Repositorio: `https://github.com/USUARIO/gestor-documental-frontend`

Aplicación web para que el **equipo directivo** de la escuela visualice, busque, registre, modifique y elimine su documentación institucional (memos, oficios, citaciones y acuerdos de apoderados, reuniones comunales y permisos administrativos). Es la **capa Frontend** del mismo proyecto desarrollado en *Desarrollo Backend* y consume su API REST.

---

## Índice
1. [Problema y solución](#1-problema-y-solución)
2. [Tecnologías](#2-tecnologías)
3. [Estructura del proyecto](#3-estructura-del-proyecto)
4. [Componentes](#4-componentes)
5. [Instalación, configuración y ejecución](#5-instalación-configuración-y-ejecución)
6. [Endpoints consumidos](#6-endpoints-consumidos)
7. [Accesibilidad y usabilidad](#7-accesibilidad-y-usabilidad)
8. [Buenas prácticas aplicadas al proyecto](#8-buenas-prácticas-aplicadas-al-proyecto)
9. [Seguridad](#9-seguridad)
10. [Optimizaciones](#10-optimizaciones)
11. [Problema técnico resuelto](#11-problema-técnico-resuelto)
12. [Control de versiones y trabajo colaborativo](#12-control-de-versiones-y-trabajo-colaborativo)
13. [Despliegue](#13-despliegue)
14. [Retrospectiva y mejora continua](#14-retrospectiva-y-mejora-continua)
15. [Demostración](#15-demostración)

---

## 1. Problema y solución

**Problema.** La Escuela Básica G-733 Chorombo Bajo no dispone de una plataforma para centralizar la documentación del equipo directivo; la gestión es manual y consume tiempo. La escuela cuenta con recursos limitados (un notebook básico en portería) y sin infraestructura TI previa, por lo que la solución debe ser **sencilla, liviana y de bajo costo**.

**Solución.** Una aplicación web de una sola página que:
- muestra el listado de documentos con título, tipo, fecha, descripción y acciones;
- permite **buscar** por texto, **filtrar** por tipo y rango de fechas, y paginar;
- permite **crear, ver, editar y eliminar** documentos con confirmación y retroalimentación visual;
- consume el Backend del proyecto (`/api/documentos`, `/api/tipos-documento`) y, si este no está disponible, sigue operando en modo demostración con una API simulada que respeta el mismo contrato;
- funciona en cualquier navegador moderno sin proceso de compilación ni instalación de dependencias, y sin conexión a internet (las librerías van incluidas).

---

## 2. Tecnologías

| Capa | Tecnología | Motivo |
|---|---|---|
| Lenguaje | JavaScript ES2022 (módulos ES nativos) | Coherente con lo trabajado en clases (fetch, DOM, estados de carga); sin *build step* |
| Framework de UI | **Bootstrap 5.3** + Bootstrap Icons | Grid responsive, componentes accesibles (modal, toast, formularios) y consistencia visual |
| Arquitectura | Componentes funcionales + store observable | Componentes reutilizables con responsabilidad única (concepto del Apunte 3) |
| Comunicación | `fetch` con `AbortController` | Consumo de la API REST, timeout y cancelación de peticiones |
| Estilos | CSS propio con variables y nomenclatura BEM | Paleta institucional y adaptación móvil |
| Backend | API REST PHP 8 + PDO + MySQL (proyecto de Desarrollo Backend) | Persistencia real |
| Pruebas | Playwright (navegador automatizado) + pruebas manuales | Verificación del flujo CRUD, filtros y estados |
| Control de versiones | Git + GitHub | Trabajo colaborativo, ramas y *pull requests* |

---

## 3. Estructura del proyecto

```
gestor-documental-frontend/
├── index.html                    # Única página; contenedores donde se montan los componentes
├── css/
│   └── styles.css                # Estilos propios (BEM), paleta, foco visible, vista móvil en tarjetas
├── js/
│   ├── main.js                   # Orquestador: estado -> componentes -> API; casos de uso
│   ├── config.js                 # URL del Backend, modo simulación, timeout, tamaño de página
│   ├── api/
│   │   ├── httpClient.js         # fetch + timeout + ApiError (manejo uniforme de errores)
│   │   ├── documentosApi.js      # Servicio contra el Backend real (contrato compartido)
│   │   ├── mockApi.js            # API simulada en memoria con el mismo contrato
│   │   └── index.js              # Selector real/simulada (fallback automático)
│   ├── state/
│   │   └── store.js              # Store observable con suscripción selectiva
│   ├── components/
│   │   ├── Navbar.js             # Cabecera institucional
│   │   ├── Filtros.js            # Búsqueda, filtro por tipo y fechas
│   │   ├── DocumentosTabla.js    # Listado + estados carga/error/vacío + acciones + paginación
│   │   ├── Paginacion.js         # Navegación entre páginas
│   │   ├── BadgeTipo.js          # Etiqueta de tipo documental
│   │   ├── EstadoVacio.js        # Mensaje de "sin resultados" / error
│   │   ├── DocumentoDetalle.js   # Modal de visualización
│   │   ├── DocumentoForm.js      # Modal de creación/edición con validación
│   │   ├── ConfirmDialog.js      # Confirmación de eliminación
│   │   └── Toast.js              # Retroalimentación no bloqueante
│   └── utils/
│       ├── dom.js                # escapeHtml, $, htmlToElement, debounce
│       ├── format.js             # Formato de fechas
│       └── validators.js         # Validación y normalización del formulario
├── vendor/                       # Bootstrap 5.3.3 y Bootstrap Icons 1.11.3 (copia local)
├── docs/
│   ├── capturas/                 # Evidencias visuales (desktop, móvil, detalle, confirmación, modo simulado)
│   └── PRUEBAS.md                # Pruebas funcionales, de accesibilidad y de usabilidad
├── .gitignore
└── README.md
```

---

## 4. Componentes

Todos los componentes son **funciones puras de renderizado**: reciben un contenedor (o devuelven HTML) y sus datos por parámetros, sin acceder al estado global. Eso los hace reutilizables y fáciles de probar.

| Componente | Responsabilidad | Información que recibe | Relación con otros |
|---|---|---|---|
| `Navbar` | Cabecera con identidad de la escuela y enlace al contenido | `titulo`, `subtitulo` | Se monta una vez desde `main.js` |
| `Filtros` | Formulario de búsqueda (texto con *debounce*), tipo y rango de fechas; botón limpiar | `tipos`, `filtros`, `onCambiar`, `onLimpiar` | Emite cambios que `main.js` traduce en una nueva carga del listado |
| `DocumentosTabla` | Tabla del listado con título, tipo, fecha, descripción y acciones; estados **cargando / error / sin resultados**; paginación | `documentos`, `meta`, `cargando`, `error`, callbacks `onVer/onEditar/onEliminar/onPagina/onReintentar` | Compone `BadgeTipo`, `EstadoVacio`, `Paginacion`. Usa delegación de eventos |
| `Paginacion` | Controles anterior/siguiente y ventana de páginas | `meta {page, total_pages}` | Renderizado por `DocumentosTabla` |
| `BadgeTipo` | Etiqueta coloreada por categoría documental | `tipo {codigo, nombre}` | Reutilizado en tabla y detalle |
| `EstadoVacio` | Mensaje ilustrado con acción opcional (reintentar) | `icono`, `titulo`, `mensaje`, `accion`, `tono` | Reutilizado para "sin resultados" y para error de carga |
| `DocumentoDetalle` | Modal con la ficha completa del documento; enlaza a editar/eliminar | `documento`, `onEditar`, `onEliminar` | Abierto desde la acción "ver" |
| `DocumentoForm` | Modal de **creación y edición**; validación en cliente, errores por campo de la API, estado "guardando" | `tipos`, `documento` (null = crear), `onGuardar` | Abierto desde "Nuevo documento", "editar" o desde el detalle |
| `ConfirmDialog` | Confirmación accesible antes de eliminar; devuelve `Promise<boolean>` | `titulo`, `mensaje`, `textoConfirmar` | Invocado por la acción eliminar |
| `Toast` | Mensaje de éxito/advertencia/error tras cada acción | `mensaje`, `{tipo, duracion}` | Invocado por los casos de uso de `main.js` |

El **store** (`state/store.js`) guarda `tipos`, `documentos`, `meta`, `filtros`, `page`, `cargando`, `error` y `modoApi`; cada componente se suscribe solo a las claves que le interesan.

---

## 5. Instalación, configuración y ejecución

### Requisitos
- Un navegador moderno (Chrome, Edge, Firefox).
- Un servidor estático cualquiera (los módulos ES no cargan con `file://`): la extensión **Live Server** de VS Code, `python -m http.server`, `npx serve`, XAMPP, etc.
- Para datos reales: el Backend del proyecto corriendo (ver su README: `mysql < database.sql` y `php -S localhost:8000 -t public`).

### Pasos
```bash
git clone https://github.com/USUARIO/gestor-documental-frontend.git
cd gestor-documental-frontend

# Opción A: Python
python -m http.server 5500
# Opción B: Node
npx serve -l 5500
# Opción C: VS Code -> clic derecho en index.html -> "Open with Live Server"
```
Abrir <http://localhost:5500>.

### Variables de configuración (`js/config.js`)

| Variable | Descripción | Valor por defecto |
|---|---|---|
| `apiBaseUrl` | URL base del Backend | `http://localhost:8000` |
| `useMock` | `false` = solo Backend; `true` = solo simulación; `'auto'` = Backend y, si no responde, simulación | `'auto'` |
| `requestTimeoutMs` | Tiempo máximo de espera por petición | `8000` |
| `pageSize` | Registros por página | `10` |

No existen credenciales ni secretos en el código: la API es interna y su protección (autenticación, HTTPS, red) corresponde a la capa de servidor.

---

## 6. Endpoints consumidos

Base: `http://localhost:8000`. Todas las respuestas del Backend tienen la forma `{ success, message, data, meta?, errors? }`.

| Método | URL | Propósito | Parámetros / cuerpo enviado | Información recibida | Uso en la app |
|---|---|---|---|---|---|
| GET | `/api/tipos-documento` | Catálogo de tipos | — | `data: [{id, codigo, nombre, descripcion, activo}]` | Selector del formulario, filtro por tipo, colores de `BadgeTipo` |
| GET | `/api/documentos` | Listado con filtros y paginación | query: `q`, `tipo`, `desde`, `hasta`, `page`, `per_page` | `data: [Documento]`, `meta: {total, page, per_page, total_pages}` | `DocumentosTabla`, resumen y paginación |
| GET | `/api/documentos/{id}` | Detalle de un documento | `id` en la ruta | `data: Documento` | `DocumentoDetalle`, precarga de `DocumentoForm` |
| POST | `/api/documentos` | Crear documento | JSON `{titulo, tipo_documento_id, fecha, descripcion?, archivo_referencia?}` | `201` + `data: Documento` / `422` + `errors{campo: mensaje}` | Botón "Nuevo documento" |
| PUT | `/api/documentos/{id}` | Actualizar documento completo | JSON con los mismos campos | `200` + `data: Documento` / `404` / `422` | Acción "editar" |
| DELETE | `/api/documentos/{id}` | Eliminar documento | `id` en la ruta | `200` / `404` | Acción "eliminar" tras confirmación |

`Documento` = `{ id, titulo, tipo_documento_id, tipo_documento: {id, codigo, nombre}, fecha, descripcion, archivo_referencia, creado_en, actualizado_en }`.

**Gestión de la comunicación** (`api/httpClient.js`):
- **Estados de carga**: spinner en el listado, spinner en el botón "Guardar" mientras se envía.
- **Ausencia de resultados**: componente `EstadoVacio` cuando `data` viene vacío.
- **Errores**: `ApiError` con `status` y `errors`; 422 se muestra **por campo** en el formulario, 404 refresca el listado, errores de red muestran un mensaje con botón *Reintentar*.
- **Timeout** de 8 s y **cancelación** de la petición anterior si el usuario sigue filtrando (`AbortController`).
- **API simulada** (`api/mockApi.js`): mismos métodos, mismas formas de respuesta y los mismos errores 404/422, usada automáticamente si el Backend no responde en la carga inicial (aviso visible en pantalla y en el pie de página).

---

## 7. Accesibilidad y usabilidad

### Criterios WCAG 2.1 aplicados

| Criterio | Aplicación en el proyecto |
|---|---|
| 1.1.1 Contenido no textual | Iconos decorativos con `aria-hidden="true"`; botones de icono con `aria-label` descriptivo ("Editar Memo N°12…") |
| 1.3.1 Información y relaciones | Tabla con `<caption>`, `<th scope="col">`; formularios con `<label for>`; listas de definición en el detalle |
| 1.4.3 Contraste mínimo | Paleta verificada: azul `#1f5f8b` sobre blanco 6,4:1; badges con texto blanco sobre colores oscuros ≥ 4,5:1 |
| 1.4.10 Reflow | Diseño adaptable: en < 768 px la tabla se transforma en tarjetas con etiquetas (`data-label`) sin scroll horizontal |
| 2.1.1 Teclado | Toda la app es operable con teclado; modales de Bootstrap atrapan el foco y cierran con `Esc` |
| 2.4.1 Evitar bloques | Enlace "Saltar al contenido principal" visible al enfocar |
| 2.4.7 Foco visible | Contorno de foco personalizado de alto contraste (`:focus-visible`) |
| 3.3.1 / 3.3.3 Identificación y sugerencia de error | Mensajes por campo claros (`invalid-feedback`, `aria-invalid`, `aria-describedby`); foco al primer campo con error |
| 4.1.3 Mensajes de estado | Resumen del listado, estado de la API, toasts y spinner con `aria-live` / `role="status"` |
| 2.3.3 Animaciones | `prefers-reduced-motion` desactiva transiciones |

### Prueba de accesibilidad realizada

| Criterio evaluado | Herramienta | Problema identificado | Mejora implementada |
|---|---|---|---|
| Nombres accesibles de controles (WCAG 4.1.2) | Navegación con teclado + lector de pantalla del navegador / inspección del árbol de accesibilidad | Los botones de acción de la tabla solo tenían un icono, por lo que el lector anunciaba "botón" sin indicar qué documento afectaba | Se agregó `aria-label` con la acción y el título del documento, `title` para tooltip y `aria-hidden` en los iconos |
| Contraste (WCAG 1.4.3) | Verificación de contraste de la paleta | El badge del tipo "Reunión comunal" en naranjo estándar de Bootstrap (`#fd7e14`) no alcanzaba 4,5:1 con texto blanco | Se oscureció a `#b25e09` (contraste 4,6:1) y se definió una clase por tipo en `styles.css` |

### Prueba de usabilidad con usuario externo

| Elemento | Detalle |
|---|---|
| Usuario de prueba | Persona externa al equipo de desarrollo, sin conocimientos técnicos (perfil similar al equipo directivo) |
| Tareas | (1) Encontrar la citación de apoderados de 5° básico. (2) Registrar un nuevo memo. (3) Eliminar un documento. |
| Hallazgo | En la tarea 3 el usuario dudó porque el ícono de papelera no dejaba claro que pediría confirmación; en la tarea 2 no sabía qué escribir en "Archivo asociado" |
| Mejoras implementadas | (a) Diálogo de confirmación que nombra el documento a eliminar y advierte que la acción es irreversible. (b) Texto de ayuda bajo el campo "Archivo asociado" con ejemplo (`archivos/2026/memo_013.pdf` o enlace) y `placeholder`. (c) La fecha del formulario se precarga con el día actual. |
| Resultado | Las tres tareas se completaron sin ayuda en la segunda ronda |

> Registro detallado en [`docs/PRUEBAS.md`](docs/PRUEBAS.md).

---

## 8. Buenas prácticas aplicadas al proyecto

| # | Buena práctica | Propósito | Forma de aplicación | Ejemplo / ubicación |
|---|---|---|---|---|
| 1 | **Separación de responsabilidades** | Que cada módulo cambie por una sola razón | Capas: componentes (UI) → `main.js` (casos de uso) → `api/` (datos) → `state/` (estado) | `js/api/documentosApi.js` no sabe nada del DOM; `components/*` no llaman a `fetch` |
| 2 | **Componentes reutilizables y puros** | Reducir duplicación y facilitar pruebas | Funciones que reciben props y devuelven/renderizan HTML | `BadgeTipo` se usa en la tabla y en el detalle; `EstadoVacio` para vacío y error |
| 3 | **Nomenclatura descriptiva y consistente** | Legibilidad y mantenibilidad | Español del dominio del cliente; `PascalCase` para componentes, `camelCase` para funciones, BEM para CSS | `DocumentosTabla`, `cargarDocumentos()`, `.tabla-docs__acciones` |
| 4 | **Estructura de carpetas por tipo de módulo** | Encontrar rápidamente cada pieza | `components/`, `api/`, `state/`, `utils/`, `vendor/`, `docs/` | Ver sección 3 |
| 5 | **Manejo centralizado del estado** | Evitar estado disperso en el DOM y renderizados inconsistentes | Store observable con suscripción selectiva por clave | `state/store.js`; `store.subscribe(renderListado, ['documentos','meta','cargando','error'])` |
| 6 | **Validación en cliente y en servidor** | Retroalimentación inmediata sin confiar solo en el navegador | `validators.js` replica las reglas del Backend; los 422 de la API se muestran por campo | `DocumentoForm.js` → `mostrarErrores()` |
| 7 | **Tratamiento uniforme de errores** | Mensajes claros y sin fallas no controladas | Clase `ApiError` con `status`/`errors`; `try/catch` en cada caso de uso; toasts y estado de error con reintento | `api/httpClient.js`, `main.js` |
| 8 | **Accesibilidad desde el diseño** | Uso por cualquier persona del equipo directivo | Etiquetas, roles, `aria-live`, foco visible, teclado, contraste | Sección 7 |
| 9 | **Seguridad en el cliente** | Prevenir XSS e inyección de contenido | `escapeHtml` en todo dato que se inserta en HTML; enlaces solo `http(s)` con `rel="noopener"` | `utils/dom.js`, `DocumentoDetalle.js` |
| 10 | **Optimización de peticiones y renderizados** | Rendimiento y menor carga en el Backend | *Debounce*, `AbortController`, delegación de eventos, paginación en servidor | Sección 10 |
| 11 | **Configuración separada del código** | Cambiar entorno sin tocar la lógica | `config.js` con URL, timeout, modo simulación | `js/config.js` |
| 12 | **Documentación viva** | Difundir el conocimiento y facilitar el mantenimiento | JSDoc en cada componente (responsabilidad, props, relaciones) + este README + `docs/PRUEBAS.md` | Cabecera de cada archivo en `js/components/` |

---

## 9. Seguridad

| Medida implementada | Riesgo que reduce |
|---|---|
| `escapeHtml()` sobre **todo** texto proveniente de la API o del usuario antes de insertarlo con `innerHTML` (títulos, descripciones, nombres de tipo, mensajes de error) | **XSS almacenado/reflejado**: un documento con `<script>` en el título no se ejecuta |
| La referencia de archivo solo se muestra como enlace si es una URL `http:`/`https:` válida (`esUrlSegura`); en caso contrario se muestra como texto; se rechazan `javascript:`, `data:`, `vbscript:` y caracteres de control en el formulario | **XSS vía `href`** e inyección de esquemas peligrosos |
| Enlaces externos con `target="_blank" rel="noopener noreferrer"` | *Tabnabbing* / acceso a `window.opener` |
| Validación de tipo, longitud y formato en el cliente **y** confianza en la revalidación del Backend | Datos inconsistentes; el cliente nunca es la única barrera |
| Errores mostrados con mensajes de negocio (`message` de la API) sin trazas, rutas ni SQL; detalles técnicos solo a `console.error` en desarrollo | Fuga de información técnica |
| Sin credenciales, tokens ni datos sensibles en el código fuente; configuración en `config.js` sin secretos | Exposición de secretos en el repositorio |
| `encodeURIComponent` en los identificadores de ruta y `URLSearchParams` para la query string | Inyección en URL / rutas malformadas |
| Librerías incluidas localmente en `vendor/` con versión fija (Bootstrap 5.3.3) | Dependencia de un CDN externo (indisponibilidad, cambio de contenido) |
| Timeout de peticiones y cancelación de peticiones obsoletas | Cuelgues de interfaz y condiciones de carrera al filtrar |

Recomendaciones para producción (fuera del alcance de esta evaluación): servir por HTTPS, autenticación de usuarios del equipo directivo en el Backend, cabecera `Content-Security-Policy`.

---

## 10. Optimizaciones

| # | Situación inicial | Optimización aplicada | Beneficio obtenido / esperado |
|---|---|---|---|
| 1 | El buscador llamaba a la API en cada tecla (una petición por carácter) | **Debounce** de 350 ms en el campo de búsqueda (`utils/dom.js → debounce`) | Escribir "apoderado" pasó de 9 peticiones a 1; menos carga en el Backend y sin parpadeo del listado |
| 2 | Al filtrar rápido, una respuesta lenta anterior podía llegar después y sobrescribir la más reciente | **Cancelación** de la petición previa con `AbortController` antes de lanzar la nueva (`main.js → cargarDocumentos`) | Se elimina la condición de carrera; el listado siempre refleja el último filtro |
| 3 | Cambiar cualquier parte del estado redibujaba toda la interfaz (filtros incluidos), perdiendo el foco del usuario en el buscador | **Suscripción selectiva** del store: los filtros solo se re-renderizan cuando cambian los tipos; el listado solo con `documentos/meta/cargando/error` | Menos renderizados; el usuario no pierde el foco ni lo escrito al filtrar |
| 4 | Un `addEventListener` por cada botón de cada fila (3 × N listeners recreados en cada render) | **Delegación de eventos**: un único listener en `<tbody>` y otro en la paginación | Menos memoria y trabajo por render; código más simple |
| 5 | Traer todos los documentos y filtrar/paginar en el navegador | **Filtrado y paginación en el servidor** (`?q=&tipo=&page=&per_page=`) | Respuestas pequeñas y tiempo constante aunque el archivo crezca a miles de documentos |
| 6 | Bootstrap y los íconos cargados desde CDN en cada visita | Copia local en `vendor/` (servida con caché del navegador) | Funciona sin internet (realidad de la escuela) y elimina 3 conexiones a terceros |

---

## 11. Problema técnico resuelto

**Problema.** Al realizar la integración con el Backend, la aplicación mostraba "No fue posible conectar con el servidor" aunque la API respondía correctamente desde Postman. Adicionalmente, al abrir `index.html` directamente con doble clic, la consola mostraba `Failed to load module script… CORS policy` y no se cargaba ningún componente.

**Causa detectada.**
1. Los módulos ES (`<script type="module">`) no se pueden cargar desde `file://`: el navegador los bloquea por política de origen. Había que servir la aplicación por HTTP.
2. Una vez servida en `http://localhost:5500`, el navegador enviaba una petición *preflight* `OPTIONS` antes del `POST` con `Content-Type: application/json`; el Backend debía responder con las cabeceras `Access-Control-Allow-*`, y en la primera versión no respondía al método `OPTIONS`.

**Alternativas consideradas.**
- Empaquetar todo en un único archivo sin módulos (descartado: se perdía la organización por componentes).
- Usar un proxy inverso para servir Front y Back en el mismo origen (válido en producción, excesivo para la evaluación).
- Habilitar CORS en el Backend respondiendo el *preflight* y documentar que el Front debe servirse por HTTP (**elegida**).

**Solución implementada.** En el Backend se agregó la respuesta `204` al método `OPTIONS` con `Access-Control-Allow-Origin`, `-Methods` y `-Headers`, y `Access-Control-Max-Age` para que el navegador no repita el *preflight*. En el Frontend se documentó la ejecución con servidor estático (sección 5) y se incorporó el **modo simulación automático**: si el Backend no responde, la app lo indica y sigue funcionando con `mockApi.js`, de manera que un problema de conexión nunca deja la pantalla en blanco.

**Resultado.** El flujo CRUD completo funciona contra el Backend real (ver `docs/PRUEBAS.md`), y la aplicación es demostrable incluso sin Backend.

**Aprendizaje.** Un Frontend que consume una API es un sistema distribuido: hay que diseñar desde el inicio qué pasa cuando la otra parte no está. El contrato compartido (mismos endpoints y forma de respuesta) permitió que la simulación fuera un reemplazo transparente y que la solución mantenga funcionalidad y mantenibilidad.

---

## 12. Control de versiones y trabajo colaborativo

- Repositorio Git con historial de **commits descriptivos** en formato *Conventional Commits* (`feat:`, `fix:`, `docs:`, `style:`, `refactor:`).
- Rama `main` estable; funcionalidades desarrolladas en ramas `feature/*` (por ejemplo `feature/formulario-documento`, `feature/filtros`) integradas mediante *pull requests* con revisión de otro integrante.
- Conflictos resueltos localmente antes del *merge*; la evidencia (capturas de PR, ramas y resolución) se guarda en `docs/capturas/`.
- `.gitignore` excluye archivos temporales del sistema y del editor.

```bash
git log --oneline   # ver historial de cambios
git branch -a       # ramas del proyecto
```

---

## 13. Despliegue

La aplicación es **estática**, por lo que puede desplegarse en cualquier servidor web sin configuración especial.

**Entorno de prueba (recomendado): GitHub Pages**
1. Subir el repositorio a GitHub.
2. *Settings → Pages → Branch: main / root* → Guardar.
3. La app queda en `https://USUARIO.github.io/gestor-documental-frontend/`.
   Como GitHub Pages sirve por HTTPS y el Backend local por HTTP, en ese entorno la app funciona en **modo simulación**; para integración completa, desplegar el Backend en un servidor con HTTPS y ajustar `apiBaseUrl`.

**Alternativa local reproducible (Apache/XAMPP):** copiar la carpeta a `htdocs/gestor-documental-frontend/` y abrir `http://localhost/gestor-documental-frontend/`. Ajustar `apiBaseUrl` si el Backend corre en otra URL.

**Verificación post-despliegue:** abrir la URL, comprobar que el listado carga (o que aparece el aviso de modo simulación), crear y eliminar un documento de prueba, y revisar la consola del navegador (sin errores).

---

## 14. Retrospectiva y mejora continua

### Oportunidades de mejora para la siguiente iteración

| # | Situación / problema | Mejora propuesta | Prioridad | Responsable propuesto | Acción a realizar |
|---|---|---|---|---|---|
| 1 | El campo "archivo asociado" es solo una referencia; el documento físico sigue fuera del sistema | Subida real de archivos (PDF/imagen) con vista previa y descarga | Alta | Integrante Backend + Frontend | Endpoint `POST /api/documentos/{id}/archivo` (multipart) y componente `ArchivoUploader` |
| 2 | Cualquier persona con acceso a la URL puede modificar documentos | Autenticación de usuarios del equipo directivo y roles (lectura / edición) | Alta | Integrante Backend | Login con token, pantalla de acceso y ocultar acciones según rol |
| 3 | Al eliminar no hay vuelta atrás | Papelera / eliminación lógica con restauración | Media | Integrante Frontend | Campo `eliminado_en` en el Backend y vista "Papelera" |
| 4 | No hay forma de ver estadísticas rápidas | Panel resumen con conteo por tipo y documentos del mes | Media | Integrante Frontend | Componente `ResumenTipos` con `GET /api/documentos?tipo=` por categoría |
| 5 | El orden del listado es fijo (fecha descendente) | Ordenar por columna (título, tipo, fecha) | Baja | Integrante Frontend | Parámetro `sort` en la API y cabeceras clicables con `aria-sort` |

### Mejora implementada dentro de esta evaluación
Se seleccionó y aplicó la **optimización del filtrado** (mejoras 1–3 de la sección 10: *debounce*, cancelación de peticiones y suscripción selectiva), porque en la revisión con el usuario de prueba el listado "parpadeaba" al escribir y en una ocasión mostró resultados de una búsqueda anterior. Era la mejora de mayor impacto en la experiencia y factible dentro del plazo.

### Cómo se tomó la decisión y se gestionó la participación
Al cierre del desarrollo el equipo realizó una retrospectiva breve (qué funcionó, qué no, qué mejorar). Cada integrante propuso mejoras; se puntuaron por **impacto para el equipo directivo** y **esfuerzo** y se eligió la de mejor relación. Las tareas se repartieron según la afinidad de cada integrante (Frontend, Backend, documentación/pruebas) y se registraron como *issues* en GitHub, revisándose mediante *pull requests*.

---

## 15. Demostración

Guion sugerido para la presentación (5–7 minutos):
1. **Contexto** (30 s): la escuela, el problema de la gestión manual y el objetivo.
2. **Funcionamiento general** (2 min): listado, búsqueda con *debounce*, filtro por tipo y fechas, paginación; crear un memo (mostrar validación por campo), ver detalle, editar, eliminar con confirmación y toasts.
3. **Componentes principales** (1 min): estructura `js/components/`, ejemplo de `DocumentoForm` y del store.
4. **Integración con Backend** (1 min): tabla de endpoints, respuesta del Backend en la pestaña *Network*, y qué pasa si se apaga el Backend (modo simulación).
5. **Decisiones técnicas** (1 min): JavaScript con módulos + Bootstrap sin *build*, seguridad (`escapeHtml`), accesibilidad, librerías locales.
6. **Aprendizajes y retrospectiva** (30 s).

Evidencias en `docs/capturas/`: listado desktop, documento creado con toast, detalle, confirmación de eliminación, vista móvil (390 px) y modo API simulada.
