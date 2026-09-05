# Pruebas del Frontend – Gestor Documental

Entorno: Chromium (Playwright) en 1280×900 y 390×844, Frontend servido en `http://127.0.0.1:5500`, Backend PHP en `http://localhost:8000` con la base `gestor_documental` cargada.

## 1. Pruebas funcionales (integración con el Backend real)

| # | Caso | Acción | Resultado esperado | Resultado obtenido | Estado |
|---|---|---|---|---|---|
| 1 | Carga inicial | Abrir la app | Spinner → tabla con 6 documentos, resumen "6 documentos registrados", pie "Conectado a http://localhost:8000" | Igual | ✅ |
| 2 | Filtro por tipo | Seleccionar "Oficio" | Solo documentos tipo 2 (1 fila) | 1 fila | ✅ |
| 3 | Búsqueda sin resultados | Escribir `zzzz` | Componente "Sin resultados" | Visible | ✅ |
| 4 | Limpiar filtros | Clic en "Limpiar filtros" | Vuelven los 6 documentos | 6 filas | ✅ |
| 5 | Validación en cliente | "Nuevo documento" → Guardar vacío | Errores en título y tipo, foco en el primer campo, sin petición a la API | 2 campos `is-invalid` | ✅ |
| 6 | Crear | Completar formulario válido → Guardar | `POST` 201, modal se cierra, toast "creado correctamente", tabla con 7 filas | Igual | ✅ |
| 7 | Ver detalle | Clic en ojo del nuevo documento | Modal con título, tipo, fecha, descripción, referencia, fechas de registro | Igual | ✅ |
| 8 | Editar desde el detalle | Botón "Editar" → cambiar título → Guardar | `GET` + `PUT` 200, toast "actualizado", título nuevo en la primera fila | Igual | ✅ |
| 9 | Eliminar con confirmación | Papelera → "Sí, eliminar" | `DELETE` 200, toast de advertencia, tabla vuelve a 6 filas | Igual | ✅ |
| 10 | Vista móvil | Viewport 390 px | Tabla en tarjetas con etiquetas, sin scroll horizontal, botones ≥ 40 px | Igual | ✅ |
| 11 | Backend caído (fallback) | Bloquear `localhost:8000` y abrir la app | Toast de advertencia, pie "Modo demostración (API simulada)", listado con datos simulados; crear funciona | Igual | ✅ |
| 12 | Consola del navegador | Durante todo el flujo | Sin errores de JavaScript | `console errors: []` | ✅ |

Salida de la ejecución automatizada:

```
filas iniciales: 6
resumen: 6 documentos registrados
estado api: Conectado a http://localhost:8000
filas tipo oficio: 1
vacio visible: true
errores validacion cliente: 2
toast: Documento "Memo N°14 - Prueba UI Playwright" creado correctamente.
filas tras crear: 7
detalle titulo: Memo N°14 - Prueba UI Playwright
primer titulo tras editar: Memo N°14 - Editado desde UI
filas tras eliminar: 6
console errors: []
--- fallback ---
estado api: Modo demostración (API simulada)
toast: No se pudo conectar con el Backend. Se muestra una demostración con datos simulados.
filas mock: 6 -> tras crear: 7
```

Capturas en `docs/capturas/`.

## 2. Prueba de accesibilidad

| Criterio WCAG 2.1 | Método | Problema | Mejora | Verificación |
|---|---|---|---|---|
| 4.1.2 Nombre, función, valor | Recorrer la tabla con `Tab` y revisar el árbol de accesibilidad (DevTools → Accessibility) | Botones de acción solo con icono: se anunciaban como "botón" | `aria-label="Ver detalle de {título}"` (y equivalentes), `aria-hidden` en iconos | Cada botón anuncia acción + documento |
| 1.4.3 Contraste | Cálculo de relación de contraste de la paleta | Badge naranjo por defecto (`#fd7e14`) con texto blanco: 2,9:1 | Color `#b25e09` → 4,6:1; el resto de badges ≥ 4,5:1 | Cumple AA |
| 2.1.1 Teclado | Operar toda la app sin mouse | — | Modales de Bootstrap con foco atrapado y cierre con `Esc`; enlace "saltar al contenido"; foco visible | Operable |
| 4.1.3 Mensajes de estado | Revisar `aria-live` | — | Resumen, estado de API, toasts y spinner anuncian cambios sin mover el foco | Correcto |

## 3. Prueba de usabilidad con usuario externo

| Tarea | Resultado 1ª ronda | Observación | Mejora | Resultado 2ª ronda |
|---|---|---|---|---|
| Encontrar la citación de 5° básico | Completada | Usó el buscador de inmediato | — | Completada |
| Registrar un memo nuevo | Completada con duda | No sabía qué poner en "Archivo asociado" | Texto de ayuda con ejemplo + placeholder; fecha precargada con hoy | Completada sin dudas |
| Eliminar un documento | Completada con duda | Temor a borrar sin aviso | Confirmación que nombra el documento y advierte irreversibilidad | Completada con seguridad |

> Completar aquí nombre/rol del usuario de prueba y fecha de la sesión.
