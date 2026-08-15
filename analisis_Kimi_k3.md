# 🔍 Análisis del Repositorio: reportes-dashboard

**Repositorio:** [FABIOR1981/reportes-dashboard](https://github.com/FABIOR1981/reportes-dashboard)  
**Fecha de análisis:** 15 de agosto de 2026  
**Analista:** Kimi K3  
**Versión del proyecto:** v1.0.0

---

## 1. Propósito del Proyecto

**reportes-dashboard** es un **dashboard dinámico para reportes HTML**. Su objetivo es servir como un panel de control centralizado que:

- Lista reportes HTML organizados por carpetas en una barra lateral navegable.
- Carga cada reporte dentro de un `iframe` en el área principal al hacer clic.
- Permite agregar nuevos reportes simplemente colocando archivos `.html` en la carpeta correspondiente, sin necesidad de modificar código.

Es una solución pensada para equipos que generan informes o visualizaciones estáticas y necesitan un "visor centralizado" sin complejidad de backend.

---

## 2. Stack Tecnológico

| Capa | Tecnología | Detalle |
|------|-----------|---------|
| **Frontend** | HTML5 + CSS + JavaScript (vanilla) | SPA simple. No utiliza frameworks como React, Vue o Angular. |
| **Build** | Node.js (nativo) | Únicamente emplea el módulo `fs` nativo. **Sin dependencias npm externas**. |
| **Hosting / CDN** | Netlify | Configurado vía `netlify.toml` con SPA fallback. |
| **Reportes** | Archivos `.html` autocontenidos | Deben incluir sus propios recursos (CSS, JS, imágenes) de forma relativa. |

---

## 3. Estructura de Carpetas y Archivos

```
reportes-dashboard/
├── index.html              # Entry point (SPA). Panel lateral + iframe principal
├── index.json              # Generado automáticamente por build-index.js (NO editar manualmente)
├── build-index.js          # Script Node: escanea html_externos/ y genera index.json
├── package.json            # Define el script "build": "node build-index.js"
├── netlify.toml            # Configuración de despliegue en Netlify
├── readme.md               # Documentación de uso
├── css/                    # Estilos del dashboard
├── js/                     # Lógica del frontend (carga index.json, renderiza menú, etc.)
├── html_externos/          # 📂 Reportes HTML organizados por subcarpetas
│   ├── sm consultores/
│   │   └── Generador_informe_psicotecnico.html
│   └── ude/
│       └── Generador_informe_psicolaboral.html
└── old/                    # Versiones anteriores de reportes (referencia, NO escaneada)
```

---

## 4. Archivos Clave

### 4.1 `package.json`
```json
{
  "name": "reportes-dashboard",
  "version": "1.0.0",
  "description": "Dashboard dinámico para reportes HTML",
  "main": "index.html",
  "scripts": {
    "build": "node build-index.js"
  }
}
```

### 4.2 `netlify.toml`
```toml
[build]
  command = "npm run build"
  publish = "."

[[redirects]]
  from = "/*"
  to = "/index.html"
  status = 200
```

### 4.3 `build-index.js`
Script Node.js que:
1. Escanea recursivamente la carpeta `html_externos/`.
2. Para cada archivo `.html`, extrae el `<title>` del documento (si existe).
3. Genera `index.json` con una estructura jerárquica de carpetas y archivos.
4. Ignora la carpeta `old/`.

### 4.4 `index.json` (generado)
Ejemplo de estructura generada:
```json
[
  {
    "type": "folder",
    "name": "SM Consultores",
    "items": [
      {
        "type": "file",
        "filename": "Generador_informe_psicotecnico.html",
        "title": "Generador de Informe Psicotecnico",
        "path": "html_externos/SM Consultores/Generador_informe_psicotecnico.html"
      }
    ]
  },
  {
    "type": "folder",
    "name": "UDE",
    "items": [
      {
        "type": "file",
        "filename": "Generador_informe_psicolaboral.html",
        "title": "Generador de Informe Psicotecnico",
        "path": "html_externos/UDE/Generador_informe_psicolaboral.html"
      }
    ]
  }
]
```

---

## 5. Instrucciones de Uso, Build y Despliegue

### 5.1 Desarrollo Local
```bash
# 1. Clonar el repositorio
git clone https://github.com/FABIOR1981/reportes-dashboard.git
cd reportes-dashboard

# 2. Generar el índice de reportes (obligatorio antes de servir)
npm run build        # Ejecuta: node build-index.js

# 3. Servir la carpeta raíz con un servidor estático
npx serve .
```

### 5.2 Agregar un Nuevo Reporte
1. Colocar el archivo `.html` dentro de `html_externos/`, en la subcarpeta correspondiente (o crear una nueva).
2. *(Opcional)* Agregar `<title>Tu Reporte</title>` en el `<head>` del HTML para que ese sea el nombre mostrado en el menú lateral. Si no tiene `<title>`, usa el nombre del archivo formateado (reemplazando `-` y `_` por espacios).
3. Ejecutar `npm run build` para regenerar `index.json`.
4. Recargar `index.html` en el navegador (o re-desplegar) para ver el reporte en el menú.

### 5.3 Despliegue (Netlify)
El repositorio ya incluye `netlify.toml` con la siguiente configuración:

- **Build command:** `npm run build` (genera `index.json` antes de publicar).
- **Publish directory:** `.` (raíz del proyecto).
- **Redirects:** todas las rutas (`/*`) redirigen a `index.html` con status `200` (SPA fallback).

Al conectar el repo en Netlify, cada nuevo push regenera automáticamente el índice de reportes y publica la última versión.

---

## 6. Observaciones Relevantes

| # | Observación |
|---|-------------|
| 1 | **Zero dependencies:** El proyecto no instala ningún paquete npm. El build se basa 100% en Node.js nativo (`fs`, `path`). |
| 2 | **`index.json` es efímero:** Se sobrescribe en cada build. Contiene una estructura jerárquica (carpetas → archivos) con metadatos extraídos de cada HTML (título, ruta relativa). **No debe editarse manualmente.** |
| 3 | **Autocontenimiento:** Los reportes en `html_externos/` deben ser archivos `.html` autocontenidos o con recursos relativos, ya que se cargan directamente en un `iframe`. |
| 4 | **Carpeta `old/` ignorada:** El script `build-index.js` no escanea `old/`, por lo que su contenido no aparece en el dashboard. Sirve como archivo histórico de versiones anteriores. |
| 5 | **SPA behavior:** Netlify está configurado para que cualquier ruta devuelva `index.html` (status 200, no redirect), permitiendo que la app maneje la navegación interna sin errores 404. |
| 6 | **Extracción inteligente de títulos:** `build-index.js` lee cada archivo HTML buscando la etiqueta `<title>...</title>` para usarlo como nombre legible en el menú. Si no la encuentra, usa el nombre del archivo reemplazando guiones y guiones bajos por espacios. |
| 7 | **Separación por cliente/área:** La estructura actual de `html_externos/` usa subcarpetas como `sm consultores` y `ude`, lo que sugiere que el dashboard agrupa reportes por cliente o área de negocio. |

---

## 7. Conclusión

**reportes-dashboard** es una solución **ligera, sin dependencias y fácilmente desplegable** para quienes necesitan un "visor centralizado" de reportes HTML generados externamente. Es ideal para equipos que producen informes estáticos (por ejemplo, generadores de informes psicotécnicos o psicolaborales) y quieren un menú navegable sin complejidad de backend ni frameworks pesados.

Su arquitectura simple (HTML + JS vanilla + Node nativo) lo hace muy mantenible, aunque podría beneficiarse de mejoras como:
- Búsqueda/filtro de reportes.
- Paginación si la cantidad de reportes crece mucho.
- Cacheo del `index.json` en el frontend.
- Soporte para reportes no-HTML (PDFs, etc.).

---

*Análisis realizado por Kimi K3 — Moonshot AI*
