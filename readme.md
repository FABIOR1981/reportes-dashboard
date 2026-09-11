# Reportes Dashboard

Dashboard web para centralizar y generar informes profesionales de selección y evaluación de personal. Cada informe funciona como una aplicación HTML independiente, con formulario, vista previa en tiempo real y exportación a PDF y Word.

El proyecto es un sitio estático: no requiere backend ni base de datos. Se puede publicar en Netlify y también instalar como PWA para trabajar con recursos locales cuando están disponibles.

---

## 📁 Estructura del proyecto

```
reportes-dashboard/
├── index.html              # Dashboard principal (barra lateral + iframe)
├── index.json              # Índice generado automáticamente; no editar a mano
├── build-index.js          # Script Node para regenerar el índice
├── package.json            # Scripts de build
├── netlify.toml            # Configuración de despliegue
├── manifest.json           # Configuración de la PWA
├── sw.js                   # Service Worker y caché offline
├── css/                    # Estilos del dashboard
├── js/main.js              # Lógica del dashboard y registro del Service Worker
├── icons/                  # Iconos de la PWA
├── documentacion/          # Arquitectura y guías de desarrollo
└── html_externos/          # Informes organizados por área
    ├── _shared/            # Código compartido entre informes
    │   ├── botonera.css    # Estilos de la botonera y sus modales
    │   ├── botonera.js     # Guardar, cargar, ortografía, limpiar y exportar
    │   ├── diccionario-base.js
    │   └── vendor/         # Copias locales de html2canvas, jsPDF y docx
    ├── generico/           # Informe genérico, con variantes con/sin gráfico
    ├── sm_consultores/     # Informe psicotécnico, con variantes con/sin gráfico
    └── ude/                # Informe psicolaboral
```

---

## 🚀 Cómo agregar un nuevo informe

1. Creá una carpeta dentro de `html_externos/` y agregá el HTML principal junto con sus recursos relativos (`css/` y `js/`).
2. Agregá un `nombre.txt` si querés definir el nombre de la carpeta que se mostrará en el menú.
3. Incluí la botonera compartida (`../_shared/botonera.css`, `../_shared/botonera.js` y `<div class="btn-toolbar" id="actions"></div>`).
4. Agregá una etiqueta `<title>` dentro del `<head>` para definir el nombre del informe en el índice.
5. Regenerá el índice:

```bash
npm run build
```

Esto ejecuta `build-index.js` y actualiza `index.json` con todos los archivos `.html` encontrados dentro de `html_externos/`. El índice no debe editarse manualmente.

6. Recargá `index.html` en el navegador o hacé deploy para ver el informe en el menú.

---

## 🛠️ Desarrollo local

```bash
# Clonar el repositorio (opcional)
git clone https://github.com/FABIOR1981/reportes-dashboard.git
cd reportes-dashboard

# Generar el índice de reportes
npm run build

# Servir la carpeta de forma local
npx serve .
```

Hace falta un servidor HTTP para que funcionen correctamente `fetch()`, los iframes y el Service Worker. El proyecto no tiene dependencias de build: `build-index.js` usa únicamente módulos nativos de Node.js.

---

## 🧩 Arquitectura de los informes

Cada informe en `html_externos/` es una aplicación HTML autocontenida que comparte funcionalidades mediante la **botonera unificada**. Las variantes con gráfico agregan la generación del gráfico y su inclusión en las exportaciones.

### Botonera compartida (`_shared/`)

Todos los informes incluyen los mismos botones con iconos unificados. Los iconos son SVG inline (estilo outline, `stroke="currentColor"`), no emojis — fondo blanco, ícono en el color semántico del botón (excepto "Limpiar", que usa fondo rojo claro):

| Icono (SVG) | Botón | Función |
|-------|-------|---------|
| Documento | Descargar PDF | Exporta el informe como PDF (cada informe define su propia lógica) |
| Disco/guardar | Descargar Word | Exporta el informe como documento Word `.docx` |
| Flecha abajo | Guardar datos | Descarga un archivo JSON con todos los campos del formulario |
| Flecha arriba | Cargar datos | Carga un archivo JSON previamente guardado para restaurar el formulario |
| Check | Revisar ortografía | Analiza el texto con LanguageTool y muestra sugerencias |
| Tacho de basura | Limpiar formulario | Borra todos los campos del formulario |

### Paneles adicionales

- **Status**: mensajes temporales de confirmación/error.
- **Revisor ortográfico**: muestra errores por campo con sugerencias de corrección.
- **Diccionario técnico personalizado**: palabras que el corrector ignora (guardadas en `localStorage`).

### Contrato por informe

Cada `script.js` de informe debe:

1. Definir `window.downloadPDF()` — implementación propia de exportación a PDF.
2. Definir `window.downloadWord()` — implementación propia de exportación a Word.
3. Llamar `Botonera.init({ ... })` con:
   - `camposGuardables`: array de IDs de inputs a guardar/cargar.
   - `camposOrtografia`: array de `{id, label}` para revisar ortografía.
   - `onResetExtra`: callback para lógica adicional al limpiar.
   - `onLoadExtra`: callback para lógica adicional al cargar datos.

---

## 📴 PWA y modo offline

`manifest.json` permite instalar el dashboard como aplicación. `sw.js` precarga el shell del dashboard, la botonera compartida, las librerías locales y los recursos de los informes registrados.

Si se agrega o mueve un recurso que deba funcionar sin conexión, actualizá también la lista `PRECACHE_URLS` de `sw.js`. Las librerías de exportación se intentan cargar primero desde CDN y tienen copias locales en `html_externos/_shared/vendor/` como respaldo.

## ☁️ Despliegue (Netlify)

El repositorio incluye `netlify.toml` con la siguiente configuración:

- **Build command**: `npm run build` (genera `index.json` antes de publicar).
- **Publish directory**: `.` (raíz del proyecto).
- **Pretty URLs**: están desactivadas para que los HTML cargados dentro de iframes y el Service Worker se resuelvan sin redirecciones.
- **SPA fallback**: las rutas desconocidas (`/*`) sirven `index.html`.
- **Caché**: `sw.js` se sirve con `no-cache` para que las actualizaciones se detecten correctamente.

Al conectar el repo en Netlify, cada nuevo push regenera automáticamente el índice de reportes y publica la última versión.

---

## 📄 Notas

- `index.json` se genera automáticamente — no debe editarse manualmente, ya que se sobrescribe en cada build.
- Los informes dentro de `html_externos/` se cargan directamente en un `iframe`; sus recursos deben usar rutas relativas válidas.
- `build-index.js` escanea automáticamente las carpetas y los archivos `.html` dentro de `html_externos/`.
- La carpeta `_shared/` contiene código reutilizable. Si accedés a un informe directamente, verificá que las rutas `../_shared/` resuelvan correctamente.
- Para conocer el contrato completo de un informe, consultá [`documentacion/contexto_arquitectura_dashboard.md`](documentacion/contexto_arquitectura_dashboard.md).
- Para crear un informe nuevo con la estructura esperada, consultá [`documentacion/prompt_nuevo_informe.md`](documentacion/prompt_nuevo_informe.md).

---

## 📌 Estado

Versión del paquete: `1.0.0`. La estructura de informes y la documentación pueden evolucionar independientemente de esta versión.
