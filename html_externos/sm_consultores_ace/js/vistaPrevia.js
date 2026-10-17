function updatePreview() {
  const nombre = document.getElementById('nombre').value;
  const puesto = document.getElementById('puesto').value;
  const observaciones = document.getElementById('observaciones').value;

  document.getElementById('prev-nombre').textContent = nombre || '[Nombre]';
  document.getElementById('prev-puesto').textContent = puesto || '[Puesto]';
  document.getElementById('prev-observaciones').innerHTML = procesarTextoMultilinea(observaciones);
}