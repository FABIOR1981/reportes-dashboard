## 🧩 CONVENCIÓN DE DIVISIÓN DE JS POR INFORME

> Agregado el 11-09-2026, tras dividir `generico` y `sm_consultores`.
> `ude` todavía no se dividió (no tocar UDE salvo pedido explícito).

Cada informe con variante `_Grafico` nace ahora con **10 archivos JS**
(5 por variante) en vez de un `script.js` monolítico. `generico` y
`sm_consultores` ya siguen este patrón; es el estándar para cualquier
informe nuevo.

### Los 5 archivos por variante

| Archivo | Responsabilidad | ¿Se comparte entre variantes? |
|---|---|---|
| `utils.js` | Utilidades sin estado (formateo de fechas, lectura de campos, escape de HTML) | **Sí, un solo archivo**, sin sufijo — se carga desde las dos variantes |
| `vistaPrevia_Sin_Grafico.js` / `_Grafico.js` | Bloques dinámicos (competencias/aspectos) + render de la vista previa en vivo | No — casi siempre hay una diferencia real de comportamiento (la versión con gráfico arma datos extra y llama al módulo de gráfico) |
| `grafico_Grafico.js` | Dibuja el SVG del gráfico + lo rasteriza a PNG para el Word | Solo existe en la variante con gráfico, no tiene par |
| `exportPdf_Sin_Grafico.js` / `_Grafico.js` | Define `window.downloadPDF` | No, aunque casi siempre el código es idéntico salvo comentarios — se mantiene separado por consistencia de nombres con el resto |
| `exportWord_Sin_Grafico.js` / `_Grafico.js` | Define `window.downloadWord` | No — la variante con gráfico inserta la imagen del gráfico en un punto puntual |
| `script_Sin_Grafico.js` / `_Grafico.js` | Orquestador: `init()`, listeners del formulario, `Botonera.init({...})` | No (ver regla de nomenclatura de valores más abajo) |

### Regla de nomenclatura

- **Sufijo `_Sin_Grafico`** para la variante sin gráfico, **`_Grafico`**
  para la variante con gráfico — en los 10 archivos, sin excepción
  (incluido el orquestador `script*.js`, aunque el proyecto históricamente
  usaba "sin sufijo = sin gráfico" para HTML/CSS; en JS se prefirió
  explicitar los dos lados para que la carpeta `js/` sea autoexplicativa
  de un vistazo).
- **Único archivo sin sufijo:** `utils.js`, y solo si su contenido es
  **100% idéntico** entre las dos variantes. Si tiene aunque sea una
  línea de lógica distinta, se separa en dos archivos con sufijo — no se
  fuerza una unificación con `if`/parámetros para ahorrarse un archivo.

### Regla para decidir si un archivo se unifica o se separa

> **Si la diferencia entre variantes es un VALOR → se tolera la
> duplicación de esa línea entre los dos archivos separados.**
> **Si la diferencia es un COMPORTAMIENTO (una función que se llama o
> no, un cálculo extra) → los archivos van separados, sin excepción.**

Se descartó explícitamente la idea de "parametrizar" con una variable
global tipo `window.NOMBRE_ARCHIVO_BASE` seteada en el HTML antes de
cargar un `script.js` común — el ahorro de un archivo no compensa el
riesgo de un bug silencioso si alguien arma un HTML nuevo y se olvida
esa línea de configuración (no tira error, descarga con el nombre por
defecto equivocado). Mejor un archivo de más y duplicar una línea, que
un acoplamiento implícito entre HTML y JS que nadie ve.

### Orden de carga de los `<script>` (obligatorio, en este orden)

```html
<script src="js/utils.js"></script>
<script src="js/grafico_Grafico.js"></script>        <!-- solo si existe -->
<script src="js/vistaPrevia_Sin_Grafico.js"></script> <!-- o _Grafico.js -->
<script src="js/exportPdf_Sin_Grafico.js"></script>   <!-- o _Grafico.js -->
<script src="js/exportWord_Sin_Grafico.js"></script>  <!-- o _Grafico.js -->
<script src="js/script_Sin_Grafico.js"></script>      <!-- o _Grafico.js -->
```
El orden importa porque son `<script>` planos sin bundler ni ES6
modules: `grafico*.js` tiene que cargar antes que `vistaPrevia*.js`
(que lo llama), y `utils.js` antes que todo lo demás.

### ⚠️ Gotcha real encontrado al dividir `sm_consultores`

`generico` ya tenía todo el arranque envuelto en `function init(){...}`
disparado por `DOMContentLoaded` — separar sus archivos fue directo,
porque nada se ejecuta hasta que **todos** los `<script>` terminaron de
cargar.

`sm_consultores` (y probablemente `ude`, sin confirmar) **no tenía**
ese wrapper: el código de arranque (cargar competencias por defecto,
pintar la vista previa inicial, enganchar los listeners) corría
"suelto" al nivel superior del archivo, apoyado en que las funciones
declaradas más abajo en el **mismo archivo** quedan disponibles por
"hoisting". Al dividir en varios archivos, ese hoisting deja de
alcanzar entre archivos — si el código de arranque queda en un archivo
que carga antes de que la función que necesita esté definida en otro,
explota con un `ReferenceError` apenas carga la página.

**Solución aplicada:** todo el código de arranque se movió al archivo
que carga último (`script_Sin_Grafico.js`/`_Grafico.js`, el
orquestador) y se envolvió en el mismo patrón `init()` +
`DOMContentLoaded` que ya usaba `generico`:
```js
function init() {
  // todo el código de arranque que antes estaba "suelto"
}
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', init);
} else {
  init();
}
```
Esto **no cambia el comportamiento ni el resultado** (se verificó con
pruebas automatizadas que las competencias por defecto siguen
cargándose exactamente igual) — solo lo hace seguro de dividir en
archivos. **Si el informe que estás dividiendo ya tiene este wrapper,
no hace falta tocarlo. Si no lo tiene, agregalo al dividirlo.**

### Cómo probar la división antes de subirla al repo

1. `node --check` en cada archivo nuevo.
2. Comparar la lista de funciones/`const`/`window.*` de nivel superior
   entre los archivos nuevos (concatenados) y el archivo original — deben
   coincidir exactamente, salvo el `init()` nuevo si aplica el gotcha de
   arriba.
3. Armar un harness de prueba con `jsdom` (Node) que cargue el HTML real
   con los `<script>` ya apuntando a los archivos nuevos, y verifique:
   - Que todas las funciones/objetos del contrato existen en `window`
     (`downloadPDF`, `downloadWord`, `Botonera`, `docx`, etc.).
   - Que los datos por defecto se cargan solos al iniciar (si aplica).
   - Que `renderPreview`/`updatePreview` corre sin error y actualiza el DOM.
   - Que `downloadWord()` corre de punta a punta sin lanzar excepciones.
   **Limitación conocida de jsdom:** `docx.Packer.toBlob()` se cuelga
   (no soporta bien las APIs de compresión/Blob que usa esa librería), y
   `canvas`/`Image`/`fetch` de imágenes tampoco están soportados
   realmente. Para el harness hay que interceptar (mockear) esas
   llamadas puntuales — esto prueba que el *wiring* entre archivos es
   correcto, pero **no reemplaza la prueba manual en navegador real**
   (Descargar PDF, Descargar Word, Guardar, Cargar, Ortografía, Limpiar)
   antes de reemplazar los archivos en el repo.

