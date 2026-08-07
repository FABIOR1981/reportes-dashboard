# 📊 Reportes Dashboard

Panel web dinámico para centralizar y visualizar reportes HTML generados externamente, organizados por carpetas y con búsqueda en tiempo real.

## ✨ Características

- **Índice automático**: escanea la carpeta `html_externos/` (incluyendo subcarpetas) y genera un menú jerárquico de reportes.
- **Menú lateral navegable**: carpetas colapsables y listado de reportes con ícono y título.
- **Título automático**: si el HTML del reporte tiene una etiqueta `<title>`, se usa como nombre en el menú; si no, se genera a partir del nombre del archivo.
- **Búsqueda en tiempo real**: filtra reportes por título o nombre de archivo mientras se escribe.
- **Visualización embebida**: cada reporte se carga en un `iframe` dentro del panel principal, sin salir del dashboard.
- **Abrir en pestaña nueva**: botón para abrir cualquier reporte de forma independiente.
- **Recargar y pantalla completa**: acciones rápidas sobre el reporte activo.
- **Responsive y con iconografía** (Font Awesome).

## 🗂️ Estructura del proyecto

```
reportes-dashboard/
├── index.html          # Estructura principal del dashboard
├── index.json          # Índice generado automáticamente (no editar a mano)
├── build-index.js       # Script que escanea html_externos/ y genera index.json
├── package.json
├── netlify.toml         # Configuración de build y redirects para Netlify
├── css/
│   └── style.css
├── js/
│   └── main.js          # Lógica del dashboard (menú, búsqueda, carga de reportes)
└── html_externos/       # Acá van los reportes HTML, organizados en subcarpetas
    ├── UDE/
    │   └── Generador_informe_psicolaboral.html
    └── SM Consultores/
        └── Generador_informe_psicotecnico.html
```

## 🚀 Cómo agregar un nuevo reporte

1. Colocá el archivo `.html` del reporte dentro de `html_externos/`, en la subcarpeta que corresponda (o creá una nueva).
2. (Opcional) Agregale una etiqueta `<title>` dentro del `<head>` del HTML para que ese sea el nombre mostrado en el menú.
3. Regenerá el índice:

   ```bash
   npm run build
   ```

   Esto ejecuta `build-index.js` y actualiza `index.json` con la nueva estructura de carpetas y archivos.

4. Recargá `index.html` en el navegador (o hacé deploy) para ver el reporte en el menú.

## 🛠️ Desarrollo local

```bash
# Clonar el repositorio
git clone https://github.com/FABIOR1981/reportes-dashboard.git
cd reportes-dashboard

# Generar el índice de reportes
npm run build

# Servir la carpeta de forma local (ejemplo con un servidor estático)
npx serve .
```

> El proyecto no tiene dependencias de build más allá de Node.js (usa únicamente el módulo `fs` nativo).

## ☁️ Despliegue (Netlify)

El repositorio incluye `netlify.toml` con la siguiente configuración:

- **Build command**: `npm run build` (genera `index.json` antes de publicar).
- **Publish directory**: `.` (raíz del proyecto).
- **Redirects**: todas las rutas (`/*`) redirigen a `index.html` (SPA fallback).

Al conectar el repo en Netlify, cada nuevo push regenera automáticamente el índice de reportes y publica la última versión.

## 📄 Notas

- `index.json` se genera automáticamente — no debe editarse manualmente, ya que se sobrescribe en cada build.
- Los reportes dentro de `html_externos/` deben ser archivos `.html` autocontenidos (o con sus propios recursos relativos), ya que se cargan directamente en un `iframe`.

## 📌 Versión

v1.0