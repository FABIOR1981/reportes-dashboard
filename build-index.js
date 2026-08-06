const fs = require('fs');
const path = require('path');

const dirPath = path.join(__dirname, 'html_externos');
const outputPath = path.join(__dirname, 'index.json');

// Si no existe la carpeta, la crea
if (!fs.existsSync(dirPath)) {
  fs.mkdirSync(dirPath);
}

const files = fs.readdirSync(dirPath);

const reportes = files
  .filter(file => file.endsWith('.html'))
  .map(file => {
    const filePath = path.join(dirPath, file);
    const content = fs.readFileSync(filePath, 'utf8');
    
    // Intenta extraer el <title> del HTML. Si no lo encuentra, usa el nombre del archivo.
    const titleMatch = content.match(/<title>(.*?)<\/title>/i);
    const title = titleMatch ? titleMatch[1] : file.replace('.html', '').replace(/[-_]/g, ' ');

    return {
      filename: file,
      title: title,
      path: `html_externos/${file}`
    };
  });

fs.writeFileSync(outputPath, JSON.stringify(reportes, null, 2));
console.log(`✅ Índice generado con éxito: ${reportes.length} reportes encontrados.`);