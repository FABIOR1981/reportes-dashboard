CAMBIOS A APLICAR EN prompt_nuevo_informe.md
=============================================

1) Reemplazar el bloque de estructura de carpetas (líneas ~22-27) por:

**Quiero que generes la estructura completa, lista para copiar a `html_externos/[carpeta]/`:**
```
html_externos/[carpeta]/
├── generador_informe_[nombre].html
├── css/style.css
└── js/
    ├── utils.js
    ├── vistaPrevia.js
    ├── exportPdf.js
    ├── exportWord.js
    └── script.js
```
(si el informe va a tener una variante con gráfico desde el vamos, avisalo
en "Datos del nuevo informe" y la estructura suma `grafico_Grafico.js` +
el sufijo `_Sin_Grafico`/`_Grafico` en los otros 5 — ver requisito 8)

2) Agregar como nuevo punto 8 en "Requisitos obligatorios (contrato del proyecto)":

8. **División de JS obligatoria desde el inicio** (ver sección
   "🧩 CONVENCIÓN DE DIVISIÓN DE JS POR INFORME" de
   `CONTEXTO_ARQUITECTURA_DASHBOARD.md`): nunca generar un `script.js`
   monolítico. Dividir siempre en `utils.js` / `vistaPrevia.js` /
   `exportPdf.js` / `exportWord.js` / `script.js` desde la primera
   versión — no como una refactorización posterior. Si el informe tiene
   variante con gráfico, sumar `grafico_Grafico.js` y aplicar el sufijo
   `_Sin_Grafico` / `_Grafico` a los otros 5 (excepto `utils.js`, que se
   comparte sin sufijo solo si su contenido queda 100% idéntico entre
   las dos variantes). El código de arranque (listeners, carga de datos
   por defecto, `Botonera.init()`) va siempre en `script.js`, envuelto en
   `function init(){...}` + `DOMContentLoaded` — nunca "suelto" a nivel
   superior del archivo, para no depender de hoisting entre archivos.

3) Actualizar la nota final ("Después de recibir los archivos, probá el
   flujo completo...") sumando: "y, si el informe tiene más de un
   archivo JS, verificá primero con `node --check` en cada uno y que el
   orden de los `<script>` en el HTML respete
   utils → grafico (si existe) → vistaPrevia → exportPdf → exportWord → script."
