window.downloadPDF = async function() {
  const btn = document.querySelector('[data-action="pdf"]');
  const status = document.getElementById('status');
  
  try {
    btn.disabled = true;
    if (status) status.textContent = 'Preparando PDF...';

    // Disparar diálogo de impresión nativo (Las reglas @media print ocultan el UI)
    window.print();
    
    if (status) status.textContent = '✅ PDF generado exitosamente.';
  } catch (err) {
    console.error('Error al generar PDF:', err);
    if (status) status.textContent = '❌ Error al generar el PDF.';
  } finally {
    btn.disabled = false;
    setTimeout(() => { if(status) status.textContent = ''; }, 3000);
  }
};