const fs = require('fs');
const path = require('path');

const dirPath = path.join(__dirname, 'html_externos');
const outputPath = path.join(__dirname, 'index.json');

if (!fs.existsSync(dirPath)) {
  fs.mkdirSync(dirPath, { recursive: true });
}

function getTitleFromHtml(filePath, defaultName) {
  try {
    const content = fs.readFileSync(filePath, 'utf8');
    const titleMatch = content.match(/<title>(.*?)<\/title>/i);
    return titleMatch ? titleMatch[1].trim() : defaultName;
  } catch (err) {
    return defaultName;
  }
}

// Nombre "lindo" para el sidebar (ej. "UDE" en vez de "ude"). Vive en un
// archivo de texto plano DENTRO de la propia carpeta que describe (no en
// un mapeo centralizado aparte), así nunca queda desincronizado si se
// agrega o saca un informe de esa carpeta. Si no existe el archivo, se
// sigue usando el nombre de carpeta tal cual (comportamiento de siempre).
function getFolderDisplayName(folderPath, defaultName) {
  const nombreFile = path.join(folderPath, 'nombre.txt');
  try {
    if (fs.existsSync(nombreFile)) {
      const content = fs.readFileSync(nombreFile, 'utf8').trim();
      if (content) return content;
    }
  } catch (err) { /* si falla, usamos el nombre de carpeta de siempre */ }
  return defaultName;
}

function scanDirectory(currentPath, relativePath = '') {
  const items = fs.readdirSync(currentPath, { withFileTypes: true });
  const result = [];

  for (const item of items) {
    const itemRelativePath = relativePath ? `${relativePath}/${item.name}` : item.name;
    const fullPath = path.join(currentPath, item.name);

    if (item.isDirectory()) {
      const subItems = scanDirectory(fullPath, itemRelativePath);
      if (subItems.length > 0) {
        result.push({
          type: 'folder',
          name: getFolderDisplayName(fullPath, item.name),
          items: subItems
        });
      }
    } else if (item.isFile() && item.name.endsWith('.html')) {
      const defaultTitle = item.name.replace('.html', '').replace(/[-_]/g, ' ');
      result.push({
        type: 'file',
        filename: item.name,
        title: getTitleFromHtml(fullPath, defaultTitle),
        path: `html_externos/${itemRelativePath}`
      });
    }
  }

  return result;
}

const reportes = scanDirectory(dirPath);

fs.writeFileSync(outputPath, JSON.stringify(reportes, null, 2));
console.log(`✅ Índice jerárquico generado con éxito.`);