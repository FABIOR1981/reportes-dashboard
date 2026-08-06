const fs = require('fs');
const path = require('path');

const dirPath = path.join(__dirname, 'html_externos');
const outputPath = path.join(__dirname, 'index.json');

// Crear la carpeta si no existe
if (!fs.existsSync(dirPath)) {
  fs.mkdirSync(dirPath, { recursive: true });
}

const files = fs.readdirSync(dirPath);

const reportes = files
  .filter(file => file.endsWith('.html'))
  .map(file => {
    const filePath = path.join(dirPath, file);
    const content = fs.readFileSync(filePath, 'utf8');

    // Intenta extraer el título del HTML o usa el nombre del archivo formateado
    const titleMatch = content.match(/<title>(.*?)<\/title>/i);
    const title = titleMatch ? titleMatch[1].trim() : file.replace('.html', '').replace(/[-_]/g, ' ');

    return {
      filename: file,
      title: title,
      path: `html_externos/${file}`
    };
  });

fs.writeFileSync(outputPath, JSON.stringify(reportes, null, 2));
console.log(`✅ Índice de reportes generado con éxito: ${reportes.length} reportes encontrados.`);