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
- La carpeta `OLD/` contiene versiones anteriores de reportes, guardadas como referencia. `build-index.js` no la escanea, por lo que su contenido no aparece en el dashboard.

## 📌 Versión

v1.0