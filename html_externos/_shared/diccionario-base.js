/* ============================================================
   DICCIONARIO BASE — reportes-dashboard
   ============================================================
   Vocabulario pre-cargado que el corrector ortográfico (botonera.js)
   NUNCA marca como error, sin importar en qué informe se use
   (UDE, SM Consultores o Genérico comparten este mismo archivo).

   Es un complemento del diccionario personalizado del usuario
   (el que se arma con el botón "no es un error, ignorar siempre",
   guardado en localStorage) — no lo reemplaza. Este archivo es el
   punto de partida de fábrica; el personalizado sigue funcionando
   igual que antes para casos puntuales.

   Para agregar más palabras en el futuro: sumarlas a la categoría
   que corresponda (o crear una nueva) y listo. No hace falta tocar
   ningún otro archivo — botonera.js lee esta lista automáticamente.
   ============================================================ */

window.DICCIONARIO_BASE = [

  // ---------- Términos del rubro / disciplina ----------
  'psic', 'psicolaboral', 'psicolaborales', 'psicotécnico', 'psicotécnica',
  'psicotécnicos', 'psicotécnicas', 'psicotecnico', 'psicométrico', 'psicométrica',
  'psicométricos', 'psicométricas', 'psicodiagnóstico', 'psicodiagnósticos',
  'psicoeducativo', 'psicosocial', 'psicoafectivo', 'sociolaboral',
  'ansiógeno', 'ansiógenos', 'ansiógena', 'ansiógenas',

  // ---------- Roles / actores del proceso ----------
  'postulante', 'postulantes', 'entrevistado', 'entrevistada',
  'entrevistados', 'entrevistadas', 'evaluado', 'evaluada', 'evaluados',
  'evaluadas', 'evaluador', 'evaluadora', 'evaluadores', 'evaluadoras',
  'reclutador', 'reclutadora', 'reclutadores', 'reclutadoras',
  'seleccionador', 'seleccionadora', 'candidato', 'candidata',

  // ---------- Proceso de selección / RRHH ----------
  'reclutamiento', 'preselección', 'convocatoria', 'onboarding',
  'inducción', 'desvinculación', 'reinducción', 'outplacement',
  'headhunting', 'benchmarking', 'engagement', 'empoderamiento',
  'mentoring', 'coaching', 'endomarketing', 'feedback', 'backfeeding',
  'employer', 'branding', 'assessment', 'workshop', 'freelance',
  'part-time', 'full-time', 'multitasking', 'networking',

  // ---------- Competencias / rasgos (los más frecuentes) ----------
  'adaptabilidad', 'adaptabilidades', 'proactividad', 'proactivo',
  'proactiva', 'proactivos', 'proactivas', 'resiliencia', 'resiliente',
  'resilientes', 'empatía', 'empático', 'empática', 'empáticos',
  'empáticas', 'asertividad', 'asertivo', 'asertiva', 'asertivos',
  'asertivas', 'liderazgo', 'liderar', 'autoeficacia', 'autocrítica',
  'autoconocimiento', 'autogestión', 'autonomía', 'autónomo', 'autónoma',
  'iniciativa', 'compromiso', 'responsabilidad', 'puntualidad',
  'flexibilidad', 'versatilidad', 'versátil', 'tolerancia',
  'negociación', 'persuasión', 'persuasivo', 'persuasiva',
  'polifuncional', 'multifacético', 'multifacética', 'resolutiva',
  'resolutivo', 'resolutivos', 'resolutivas', 'analítica', 'analítico',

  // ---------- Vocabulario típico de informes / evaluación ----------
  'entrevista', 'semiestructurada', 'estructurada', 'indicadores',
  'indicador', 'hallazgos', 'observaciones', 'conductuales',
  'conductual', 'trayectoria', 'ajuste', 'desempeño', 'desempeños',
  'motivación', 'intrínseca', 'extrínseca', 'afrontamiento',
  'cognitivas', 'cognitivo', 'cognitiva', 'razonamiento', 'atención',
  'memoria', 'planificación', 'organizacional', 'interpersonal',
  'intrapersonal', 'transversales', 'transversal', 'blandas',
  'aptitud', 'aptitudes',

  // ---------- Instrumentos / pruebas frecuentes en la región ----------
  'Raven', 'Bender', 'Wartegg', 'Zulliger', 'Rorschach', 'Cleaver',
  'DISC', '16PF', 'MMPI', 'NEO-PI-R','MBTI',

  // ---------- Localidades / regionalismos frecuentes (UY) ----------
  'Montevideo', 'Canelones', 'Maldonado', 'Paysandú', 'Salto',
  'Rivera', 'Tacuarembó', 'Rocha', 'Colonia', 'Florida', 'Durazno',
  'Cerro Largo', 'Lavalleja', 'Treinta y Tres', 'Artigas', 'Flores',
  'Soriano', 'Río Negro', 'San José'
];
