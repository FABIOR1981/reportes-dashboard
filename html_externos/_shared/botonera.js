// ============================================================
//  BOTONERA COMPARTIDA – Lógica común para todos los informes
//  Cada informe debe definir window.downloadPDF y window.downloadWord
//  ANTES de llamar a Botonera.init()
// ============================================================

window.Botonera = (function() {
  // ---------- Configuración ----------
  let cfg = {
    camposGuardables: [],
    camposNoLimpiar: [],
    camposOrtografia: [],
    nombreArchivoBase: 'informe',
    onResetExtra: null,
    onLoadExtra: null,
    statusId: 'status',
    spellPanelId: 'spellPanel',
    dicPanelId: 'dicPanel',
    dicListId: 'dicList',
    dicInputId: 'dicInput',
    dicAddBtnId: 'dicAddBtn',
    diccionarioKey: 'correctorDiccionario'
  };

  let els = {};

  // Función para escapar HTML
  function escapeHTML(str) {
    const div = document.createElement('div');
    div.textContent = str;
    return div.innerHTML;
  }

  // ---------- Inicialización ----------
  function init(userConfig) {
    Object.assign(cfg, userConfig);
    cacheElements();
    bindEvents();
    renderDiccionarioPanel();
  }

  function cacheElements() {
    els.status = document.getElementById(cfg.statusId);
    els.spellPanel = document.getElementById(cfg.spellPanelId);
    els.dicPanel = document.getElementById(cfg.dicPanelId);
    els.dicList = document.getElementById(cfg.dicListId);
    els.dicInput = document.getElementById(cfg.dicInputId);
    els.dicAddBtn = document.getElementById(cfg.dicAddBtnId);
  }

  function bindEvents() {
    // PDF (hook)
    const pdfBtn = document.querySelector('[data-action="pdf"]');
    if (pdfBtn) pdfBtn.addEventListener('click', function() {
      if (typeof window.downloadPDF === 'function') window.downloadPDF();
      else alert('downloadPDF() no está implementado para este informe.');
    });

    // Word (hook)
    const wordBtn = document.querySelector('[data-action="word"]');
    if (wordBtn) wordBtn.addEventListener('click', function() {
      if (typeof window.downloadWord === 'function') window.downloadWord();
      else alert('downloadWord() no está implementado para este informe.');
    });

    // Guardar
    const saveBtn = document.querySelector('[data-action="save"]');
    if (saveBtn) saveBtn.addEventListener('click', guardarDatos);

    // Cargar
    const loadBtn = document.querySelector('[data-action="load"]');
    const loadInput = document.getElementById('loadInput');
    if (loadBtn && loadInput) {
      loadBtn.addEventListener('click', () => loadInput.click());
      loadInput.addEventListener('change', cargarDatos);
    }

    // Ortografía
    const spellBtn = document.querySelector('[data-action="spellcheck"]');
    if (spellBtn) spellBtn.addEventListener('click', revisarOrtografia);

    // Limpiar
    const resetBtn = document.querySelector('[data-action="reset"]');
    if (resetBtn) resetBtn.addEventListener('click', limpiarFormulario);

    // Diccionario
    if (els.dicAddBtn && els.dicInput) {
      els.dicAddBtn.addEventListener('click', agregarPalabraDiccionario);
      els.dicInput.addEventListener('keydown', function(e) {
        if (e.key === 'Enter') { e.preventDefault(); agregarPalabraDiccionario(); }
      });
    }
  }

  // ---------- Status ----------
  function mostrarStatus(msg) {
    if (!els.status) return;
    els.status.textContent = msg;
    setTimeout(function() { els.status.textContent = ''; }, 5000);
  }

  // ---------- Guardar / Cargar ----------
  function gatherFormData() {
    const data = {};
    cfg.camposGuardables.forEach(function(id) {
      const el = document.getElementById(id);
      if (el) data[id] = el.value;
    });
    document.querySelectorAll('input[type="radio"]:checked').forEach(function(r) {
      data[r.name] = r.value;
    });
    return data;
  }

  function guardarDatos() {
    try {
      const data = gatherFormData();
      if (cfg.onSaveExtra) cfg.onSaveExtra(data);
      const blob = new Blob([JSON.stringify(data, null, 2)], {type: 'application/json'});
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      const nombre = (document.getElementById(cfg.camposGuardables[0])?.value || cfg.nombreArchivoBase)
        .replace(/\s+/g, '_');
      a.href = url;
      a.download = 'DATOS_INFORME_' + nombre + '.json';
      document.body.appendChild(a);
      a.click();
      a.remove();
      URL.revokeObjectURL(url);
      mostrarStatus('✅ Datos guardados. Guardá este archivo para continuar luego.');
    } catch(err) {
      console.error(err);
      mostrarStatus('❌ No se pudieron guardar los datos.');
    }
  }

  function cargarDatos(e) {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = function(ev) {
      // 1) Parsear el JSON. Solo acá mostramos el error de "JSON inválido".
      let data;
      try {
        data = JSON.parse(ev.target.result);
      } catch(err) {
        console.error(err);
        alert('El archivo elegido no es un JSON válido generado por esta herramienta.');
        return;
      }

      // 2) Aplicar los datos al formulario. Si algo falla acá, NO es un problema
      //    del JSON (que ya sabemos que es válido), así que avisamos distinto.
      try {
        document.querySelectorAll('input[type="radio"]:checked').forEach(function(r) { r.checked = false; });
        Object.keys(data).forEach(function(key) {
          // Buscamos los radios por "name" únicamente (sin meter el value en el
          // selector, para no romper el CSS selector si el texto tiene comillas
          // u otros caracteres especiales) y comparamos el value en JS.
          const radios = document.querySelectorAll('input[type="radio"][name="' + CSS.escape(key) + '"]');
          if (radios.length) {
            radios.forEach(function(r) {
              r.checked = (r.value === data[key]);
            });
          } else {
            const el = document.getElementById(key);
            if (el) el.value = data[key];
          }
        });
        if (cfg.onLoadExtra) cfg.onLoadExtra(data);
        mostrarStatus('✅ Datos cargados. Podés continuar editando.');
      } catch(err) {
        console.error(err);
        alert('El JSON es válido, pero ocurrió un error al aplicar los datos al formulario. Revisá la consola (F12) para más detalles.');
      }
    };
    reader.readAsText(file);
    e.target.value = '';
  }

  // ---------- Ortografía ----------
  async function checkSpellingText(text) {
    if (!text || !text.trim()) return [];
    const resp = await fetch('https://api.languagetool.org/v2/check', {
      method: 'POST',
      headers: {'Content-Type': 'application/x-www-form-urlencoded'},
      body: new URLSearchParams({ text: text, language: 'es' })
    });
    if (!resp.ok) throw new Error('Error de API: ' + resp.status);
    const json = await resp.json();
    return json.matches || [];
  }

  function palabraEnDiccionario(palabra) {
    const p = palabra.toLowerCase().replace(/[.,;:!?'"]/g, '');
    // Diccionario de fábrica (vocabulario del rubro), común a los 3 informes.
    // Vive en un archivo aparte (diccionario-base.js) para poder ampliarlo
    // sin tocar la lógica del corrector.
    const base = window.DICCIONARIO_BASE || [];
    let custom = [];
    try { custom = JSON.parse(localStorage.getItem(cfg.diccionarioKey) || '[]'); } catch(e) {}
    const dic = base.concat(custom).map(function(w) { return w.toLowerCase(); });
    return dic.indexOf(p) !== -1;
  }

  async function revisarOrtografia() {
    const btn = document.querySelector('[data-action="spellcheck"]');
    if (!btn) return;
    btn.disabled = true;
    els.spellPanel.innerHTML = 'Revisando ortografía y gramática, un momento...';

    try {
      let totalIssues = 0;
      let html = '';

      for (let i = 0; i < cfg.camposOrtografia.length; i++) {
        const campo = cfg.camposOrtografia[i];
        const el = document.getElementById(campo.id);
        if (!el || !el.value.trim()) continue;
        const matches = await checkSpellingText(el.value);
        const items = [];
        matches.forEach(function(m) {
          const bad = el.value.substring(m.offset, m.offset + m.length);
          if (palabraEnDiccionario(bad)) return;
          const suggestion = (m.replacements && m.replacements[0]) ? m.replacements[0].value : null;
          // SEGURIDAD: Escapar HTML para evitar XSS
          const badEscaped = escapeHTML(bad);
          const labelEscaped = escapeHTML(campo.label);
          items.push(suggestion
            ? '<li>"' + badEscaped + '" → <b>' + escapeHTML(suggestion) + '</b> <button type="button" class="dic-ignore" data-w="' + badEscaped + '">no es un error, ignorar siempre</button></li>'
            : '<li>"' + badEscaped + '": ' + escapeHTML(m.message) + ' <button type="button" class="dic-ignore" data-w="' + badEscaped + '">no es un error, ignorar siempre</button></li>'
          );
        });
        if (items.length) {
          totalIssues += items.length;
          const labelEscaped = escapeHTML(campo.label);
          html += '<div class="spell-field"><b>' + labelEscaped + '</b><ul>' + items.join('') + '</ul></div>';
        }
      }

      els.spellPanel.innerHTML = totalIssues ? html : '✅ No se encontraron errores ortográficos ni gramaticales.';

      els.spellPanel.querySelectorAll('.dic-ignore').forEach(function(btnIgnore) {
        btnIgnore.addEventListener('click', function() {
          let custom = [];
          try { custom = JSON.parse(localStorage.getItem(cfg.diccionarioKey) || '[]'); } catch(e) {}
          if (custom.map(function(w) { return w.toLowerCase(); }).indexOf(this.dataset.w.toLowerCase()) === -1) {
            custom.push(this.dataset.w);
            localStorage.setItem(cfg.diccionarioKey, JSON.stringify(custom));
          }
          renderDiccionarioPanel();
          btn.click();
        });
      });
    } catch(err) {
      console.error(err);
      els.spellPanel.innerHTML = '❌ No se pudo conectar con el corrector ortográfico. Verificá tu conexión a internet e intentá de nuevo.';
    } finally {
      btn.disabled = false;
    }
  }

  // ---------- Diccionario ----------
  function getDiccionarioPersonalizado() {
    try { return JSON.parse(localStorage.getItem(cfg.diccionarioKey) || '[]'); }
    catch(e) { return []; }
  }

  function setDiccionarioPersonalizado(arr) {
    localStorage.setItem(cfg.diccionarioKey, JSON.stringify(arr));
  }

  function renderDiccionarioPanel() {
    if (!els.dicList) return;
    const custom = getDiccionarioPersonalizado();
    if (!custom.length) {
      els.dicList.innerHTML = '<span style="color:#999;">Sin palabras agregadas todavía.</span>';
      return;
    }
    // SEGURIDAD: Escapar palabras para evitar XSS
    els.dicList.innerHTML = custom.map(function(w) {
      const wEscaped = escapeHTML(w);
      return '<span class="dic-chip">' + wEscaped + ' <button type="button" class="dic-del" data-w="' + wEscaped + '">✕</button></span>';
    }).join('');

    els.dicList.querySelectorAll('.dic-del').forEach(function(btnDel) {
      btnDel.addEventListener('click', function() {
        const updated = getDiccionarioPersonalizado().filter(function(w) { return w !== this.dataset.w; }.bind(this));
        setDiccionarioPersonalizado(updated);
        renderDiccionarioPanel();
      });
    });
  }

  function agregarPalabraDiccionario() {
    if (!els.dicInput) return;
    const palabra = els.dicInput.value.trim();
    if (!palabra) return;
    // Validar que no tenga caracteres sospechosos
    if (!/^[a-záéíóúñüA-ZÁÉÍÓÚÑÜ\s'-]+$/.test(palabra)) {
      alert('La palabra solo puede contener letras, espacios, guiones y apóstrofos.');
      return;
    }
    const custom = getDiccionarioPersonalizado();
    if (custom.map(function(w) { return w.toLowerCase(); }).indexOf(palabra.toLowerCase()) === -1) {
      custom.push(palabra);
      setDiccionarioPersonalizado(custom);
      renderDiccionarioPanel();
    }
    els.dicInput.value = '';
  }

  // ---------- Limpiar ----------
  function limpiarFormulario() {
    if (!confirm('¿Estás seguro de que querés limpiar los datos del formulario?')) return;
    cfg.camposGuardables.forEach(function(id) {
      if (cfg.camposNoLimpiar.indexOf(id) !== -1) return;
      const el = document.getElementById(id);
      if (el) el.value = '';
    });
    const defaultRec = document.querySelector('input[name="recom"][value="Recomendable"]');
    if (defaultRec) defaultRec.checked = true;
    const defaultClasif = document.querySelector('input[name="clasif"][value="RECOMENDABLE"]');
    if (defaultClasif) defaultClasif.checked = true;

    if (cfg.onResetExtra) cfg.onResetExtra();
    mostrarStatus('🗑 Formulario limpiado.');
  }

  return { init: init };
})();
