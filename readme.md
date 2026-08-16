# Reportes Dashboard

Dashboard dinámico para reportes HTML. Permite centralizar visualizaciones e informes autocontenidos en un panel navegable con menú lateral.

**Versión:** 1.0.0

---

## 📁 Estructura del proyecto

```
reportes-dashboard/
├── index.html              # Dashboard principal (barra lateral + iframe)
├── index.json              # Índice generado automáticamente
├── build-index.js          # Script Node para regenerar el índice
├── package.json            # Scripts de build
├── netlify.toml            # Configuración de despliegue
├── css/                    # Estilos del dashboard
├── js/                     # Lógica del dashboard (main.js)
├── old/                    # Versiones anteriores (referencia)
└── html_externos/          # 📂 Reportes HTML organizados por área
    ├── _shared/            # Código compartido entre informes
    │   ├── botonera.css    # Estilos de botones unificados
    │   └── botonera.js     # Lógica compartida (guardar, cargar, ortografía, limpiar)
    ├── sm consultores/     # Informe psicotécnico
    │   ├── generador_informe_psicotecnico.html
    │   ├── css/style.css
    │   └── js/script.js
    └── ude/                # Informe psicolaboral
        ├── generador_informe_psicolaboral.html
        ├── css/style.css
        └── js/script.js
```

---

## 🚀 Cómo agregar un nuevo reporte

1. Colocá el archivo `.html` del reporte dentro de `html_externos/`, en la subcarpeta que corresponda (o creá una nueva).
2. (Opcional) Agregale una etiqueta `<title>` dentro del `<head>` del HTML para que ese sea el nombre mostrado en el menú.
3. Regenerá el índice:

```bash
npm run build
```

Esto ejecuta `build-index.js` y actualiza `index.json` con la nueva estructura de carpetas y archivos.

4. Recargá `index.html` en el navegador (o hacé deploy) para ver el reporte en el menú.

---

## 🛠️ Desarrollo local

```bash
# Clonar el repositorio
git clone https://github.com/FABIOR1981/reportes-dashboard.git
cd reportes-dashboard

# Generar el índice de reportes
npm run build

# Servir la carpeta de forma local
npx serve .
```

> El proyecto no tiene dependencias de build más allá de Node.js (usa únicamente el módulo `fs` nativo).

---

## 🧩 Arquitectura de los informes

Cada informe en `html_externos/` es una aplicación HTML autocontenida que comparte funcionalidades mediante la **botonera unificada**:

### Botonera compartida (`_shared/`)

Todos los informes incluyen los mismos botones con iconos unificados:

| Icono | Botón | Función |
|-------|-------|---------|
| 📄 | Descargar PDF | Exporta el informe como PDF (cada informe define su propia lógica) |
| 📝 | Descargar Word | Exporta el informe como documento Word `.docx` |
| 💾 | Guardar datos | Descarga un archivo JSON con todos los campos del formulario |
| 📂 | Cargar datos | Carga un archivo JSON previamente guardado para restaurar el formulario |
| 🔤 | Revisar ortografía | Analiza el texto con LanguageTool y muestra sugerencias |
| 🗑 | Limpiar formulario | Borra todos los campos del formulario |

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

## ☁️ Despliegue (Netlify)

El repositorio incluye `netlify.toml` con la siguiente configuración:

- **Build command**: `npm run build` (genera `index.json` antes de publicar).
- **Publish directory**: `.` (raíz del proyecto).
- **Redirects**: todas las rutas (`/*`) redirigen a `index.html` (SPA fallback).

Al conectar el repo en Netlify, cada nuevo push regenera automáticamente el índice de reportes y publica la última versión.

---

## 📄 Notas

- `index.json` se genera automáticamente — no debe editarse manualmente, ya que se sobrescribe en cada build.
- Los reportes dentro de `html_externos/` deben ser archivos `.html` autocontenidos (o con sus propios recursos relativos), ya que se cargan directamente en un `iframe`.
- La carpeta `old/` contiene versiones anteriores de reportes, guardadas como referencia. `build-index.js` no la escanea, por lo que su contenido no aparece en el dashboard.
- La carpeta `_shared/` contiene código reutilizable. Si accedés a un informe directamente (sin pasar por el dashboard), asegurate de que las rutas `../_shared/` resuelvan correctamente desde la ubicación del informe.

---

## 📌 Versión

v1.0.0
