window.downloadWord = async function() {
  const btn = document.querySelector('[data-action="word"]');
  const status = document.getElementById('status');
  
  try {
    btn.disabled = true;
    if (status) status.textContent = 'Generando archivo Word...';

    const nombre = document.getElementById('nombre').value || 'Candidato';
    const observaciones = document.getElementById('observaciones').value || '';
    const fortalezas = document.getElementById('fortalezas').value || '';
    const mejoras = document.getElementById('mejoras').value || '';

    // Utilizando docx (UMD window.docx)
    const { Document, Packer, Paragraph, TextRun, HeadingLevel } = docx;

    const doc = new Document({
      sections: [{
        properties: {},
        children: [
          new Paragraph({
            text: "INFORME PSICOLABORAL ACE",
            heading: HeadingLevel.HEADING_1,
            alignment: docx.AlignmentType.CENTER
          }),
          new Paragraph({
            children: [
              new TextRun({ text: "Nombre: ", bold: true }),
              new TextRun(nombre)
            ]
          }),
          new Paragraph({
            text: "OBSERVACIONES",
            heading: HeadingLevel.HEADING_3,
            spacing: { before: 400 }
          }),
          new Paragraph({ text: observaciones }),
          
          new Paragraph({
            text: "FORTALEZAS",
            heading: HeadingLevel.HEADING_3,
            spacing: { before: 400 }
          }),
          new Paragraph({ text: fortalezas }),
          
          new Paragraph({
            text: "ÁREAS DE MEJORA",
            heading: HeadingLevel.HEADING_3,
            spacing: { before: 400 }
          }),
          new Paragraph({ text: mejoras })
          
          // Aquí iría el gráfico / perfil de competencias
        ]
      }]
    });

    const blob = await Packer.toBlob(doc);
    
    // Validar con la función de descarga provista por Botonera
    const success = await window.Botonera.guardarBlob(blob, `Informe_ACE_${nombre.replace(/\s+/g, '_')}.docx`);
    
    if (success && status) status.textContent = '✅ Archivo Word guardado exitosamente.';

  } catch (err) {
    console.error('Error generando Word:', err);
    if (status) status.textContent = '❌ Ocurrió un error al generar Word.';
  } finally {
    btn.disabled = false;
    setTimeout(() => { if (status) status.textContent = ''; }, 3000);
  }
};