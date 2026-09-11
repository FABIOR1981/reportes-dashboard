// ============================================================
//  UDE – vistaPrevia.js
//  Render de la vista previa en vivo.
//  Depende de: utils.js (fmtFecha, calcularEdad)
// ============================================================
function updatePreview(){
  var ciudad = document.getElementById('ciudad').value;
  var fecha = document.getElementById('fechaInforme').value;
  var institucion = document.getElementById('institucion').value;
  var titulo = document.getElementById('tituloInforme').value;
  var prefijo = document.getElementById('prefijo').value;
  var apellidos = document.getElementById('apellidos').value;
  var nombres = document.getElementById('nombres').value;
  var cargo = document.getElementById('cargo').value;
  var ci = document.getElementById('ci').value;
  var fechaNacimiento = document.getElementById('fechaNacimiento').value;
  var contacto = document.getElementById('contacto').value;
  var edad = calcularEdad(fechaNacimiento, fecha);
  var evaluacion = document.getElementById('evaluacion').value;
  var conclusion = document.getElementById('conclusion').value;
  var profNombre = document.getElementById('profNombre').value;
  var profCel = document.getElementById('profCel').value;
  var profCargo = document.getElementById('profCargo').value;

  var nombreCompleto = (apellidos + ' ' + nombres).trim() || '[Nombre del postulante]';
  var fechaStr = fecha ? fmtFecha(fecha) : '';

  // Encabezado
  document.getElementById('prevCiudadFecha').textContent = ciudad + (fechaStr ? ', ' + fechaStr : '');
  document.getElementById('prevInstitucion').textContent = profNombre || '[Nombre del profesional]';
  document.getElementById('prevTitulo').textContent = titulo || 'Informe de Evaluación Psicolaboral';

  // Info-box
  document.getElementById('prevNombre').textContent = nombreCompleto;
  document.getElementById('prevCargo').textContent = cargo || '[Cargo]';
  document.getElementById('prevEdad').textContent = (edad !== '' ? edad : '--');
  document.getElementById('prevCI').textContent = ci || '--';
  document.getElementById('prevFechaNac').textContent = fechaNacimiento ? fmtFecha(fechaNacimiento) : '--';
  document.getElementById('prevContacto').textContent = contacto || '--';
  // Cuerpo (el texto se reconstruye completo más abajo en bodyHTML)
  var bodyHTML = '';
  bodyHTML += '<p>A solicitud de <strong>' + (institucion || 'la institución') + '</strong>, se realizó entrevista psicolaboral ' + (prefijo || 'al') + ' postulante <strong>' + nombreCompleto + '</strong>.</p>';
  bodyHTML += '<p>La misma tuvo como finalidad evaluar competencias transversales en instancia de entrevista, a los efectos de desempeñar tareas como <strong>' + (cargo || 'el cargo postulado') + '</strong>.</p>';

  if(evaluacion){
    var parrafos = evaluacion.split(/\r?\n/);
    for(var i=0;i<parrafos.length;i++){
      if(parrafos[i].trim()) bodyHTML += '<p>' + parrafos[i] + '</p>';
    }
  } else {
    bodyHTML += '<p style="color:#aaa;font-style:italic;">[Aquí se desarrolla el texto de evaluación con las observaciones de la entrevista...]</p>';
  }

  document.getElementById('prevBody').innerHTML = bodyHTML;

  // Conclusión
  if(conclusion){
    document.getElementById('prevConclusion').innerHTML = conclusion.replace(/\r?\n/g,'<br>');
  } else {
    document.getElementById('prevConclusion').innerHTML = '<span style="color:#aaa;font-style:italic;">[Conclusión del informe...]</span>';
  }

  // Recomendación
  var rec = document.querySelector('input[name="recom"]:checked');
  var recVal = rec ? rec.value : 'Recomendable';
  document.getElementById('prevRec1').innerHTML = '<span class="check-box' + (recVal==='Recomendable'?' checked':'') + '"></span>';
  document.getElementById('prevRec2').innerHTML = '<span class="check-box' + (recVal==='Recomendable con Observación'?' checked':'') + '"></span>';
  document.getElementById('prevRec3').innerHTML = '<span class="check-box' + (recVal==='No Recomendable'?' checked':'') + '"></span>';

  // Firma
  document.getElementById('prevProfNombre').textContent = profNombre || '[Nombre del evaluador]';
  document.getElementById('prevProfCargo').textContent = profCargo || '[Cargo del evaluador]';
  document.getElementById('prevProfMat').textContent = profCel ? 'Cel. ' + profCel : '';
}
