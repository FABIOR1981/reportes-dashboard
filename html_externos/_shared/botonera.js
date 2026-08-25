// ============================================================
//  BOTONERA COMPARTIDA – Logica comun para todos los informes
// ============================================================

window.Botonera = (function() {
  let cfg = {
    camposGuardables: [],
    camposNoLimpiar: [],
    camposOrtografia: [],
    nombreArchivoBase: 'informe',
    onResetExtra: null,
    onLoadExtra: null,
    statusId: 'status',
    actionsId: 'actions',
    spellPanelId: 'spellPanel',
    dicPanelId: 'dicPanel',
    dicListId: 'dicList',
    dicInputId: 'dicInput',
    dicAddBtnId: 'dicAddBtn',
    diccionarioKey: 'correctorDiccionario'
  };

  let els = {};

  function escapeHTML(str) {
    const div = document.createElement('div');
    div.textContent = str;
    return div.innerHTML;
  }

  function init(userConfig) {
    Object.assign(cfg, userConfig);
    renderToolbar();
    cacheElements();
    bindEvents();
    renderDiccionarioPanel();
  }

  function renderToolbar() {
    const container = document.getElementById(cfg.actionsId);
    if (!container) return;

    container.innerHTML =
      '<button type="button" id="themeToggleBtn" class="btn-toolbar-item" aria-label="Cambiar a modo oscuro" title="Cambiar a modo oscuro">' +
        '<svg id="themeToggleIcon" class="btn-icon" data-icon="moon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79Z"/></svg>' +
      '</button>' +
      '<button class="btn btn-primary" data-action="pdf" aria-label="Descargar PDF">' +
        '<svg class="btn-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><text x="12" y="18.5" font-size="7" font-weight="700" font-family="Arial, sans-serif" text-anchor="middle" fill="currentColor" stroke="none">PDF</text></svg>' +
        '<span class="tooltip">Descargar PDF</span>' +
      '</button>' +
      '<button class="btn btn-primary" data-action="word" aria-label="Descargar Word">' +
        '<svg class="btn-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><text x="12" y="18" font-size="9" font-weight="700" font-family="Arial, sans-serif" text-anchor="middle" fill="currentColor" stroke="none">W</text></svg>' +
        '<span class="tooltip">Descargar Word</span>' +
      '</button>' +
      '<button class="btn btn-secondary" data-action="save" aria-label="Guardar datos">' +
        '<svg class="btn-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2Z"/><polyline points="17 21 17 13 7 13 7 21"/><polyline points="7 3 7 8 15 8"/></svg>' +
        '<span class="tooltip">Guardar datos</span>' +
      '</button>' +
      '<button class="btn btn-secondary" data-action="load" aria-label="Cargar datos">' +
        '<svg class="btn-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z"/></svg>' +
        '<span class="tooltip">Cargar datos</span>' +
      '</button>' +
      '<input type="file" id="loadInput" accept="application/json,.json" hidden aria-label="Cargar archivo JSON de datos guardados">' +
      '<button class="btn btn-tertiary" data-action="spellcheck" aria-label="Revisar ortografia">' +
        '<svg class="btn-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><text x="12" y="11" font-size="7.5" font-weight="700" font-family="Arial, sans-serif" text-anchor="middle" fill="currentColor" stroke="none">ABC</text><polyline points="8 16 11 19 17 13" stroke-width="2.2"/></svg>' +
        '<span class="tooltip">Revisar ortografia</span>' +
      '</button>' +
      '<button class="btn btn-danger" data-action="reset" aria-label="Limpiar formulario">' +
        '<svg class="btn-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6"/><path d="M10 11v6"/><path d="M14 11v6"/><path d="M9 6V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2"/></svg>' +
        '<span class="tooltip">Limpiar formulario</span>' +
      '</button>';

    // El botón de tema se acaba de crear recién ahora: si theme.js ya
    // había corrido antes (por ejemplo, si el informe difiere el resto
    // de la inicialización a DOMContentLoaded), hay que sincronizar el
    // ícono/estado del botón con el tema ya aplicado en <html>.
    if (window.Theme && typeof window.Theme.current === 'function') {
      var temaActual = window.Theme.current();
      var icon = document.getElementById('themeToggleIcon');
      var btn = document.getElementById('themeToggleBtn');
      var esOscuro = temaActual === 'oscuro';
      if (icon) {
        icon.innerHTML = esOscuro
          ? '<circle cx="12" cy="12" r="4"/><path d="M12 2v2M12 20v2M4.93 4.93l1.41 1.41M17.66 17.66l1.41 1.41M2 12h2M20 12h2M6.34 17.66l-1.41 1.41M19.07 4.93l-1.41 1.41"/>'
          : '<path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79Z"/>';
      }
      if (btn) {
        var label = esOscuro ? 'Cambiar a modo claro' : 'Cambiar a modo oscuro';
        btn.setAttribute('aria-label', label);
        btn.title = label;
      }
    }
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
    const pdfBtn = document.querySelector('[data-action="pdf"]');
    if (pdfBtn) pdfBtn.addEventListener('click', function() {
      if (typeof window.downloadPDF === 'function') window.downloadPDF();
      else alert('downloadPDF() no esta implementado para este informe.');
    });

    const wordBtn = document.querySelector('[data-action="word"]');
    if (wordBtn) wordBtn.addEventListener('click', function() {
      if (typeof window.downloadWord === 'function') window.downloadWord();
      else alert('downloadWord() no esta implementado para este informe.');
    });

    const saveBtn = document.querySelector('[data-action="save"]');
    if (saveBtn) saveBtn.addEventListener('click', guardarDatos);

    const loadBtn = document.querySelector('[data-action="load"]');
    const loadInput = document.getElementById('loadInput');
    if (loadBtn && loadInput) {
      loadBtn.addEventListener('click', function() { loadInput.click(); });
      loadInput.addEventListener('change', cargarDatos);
    }

    const spellBtn = document.querySelector('[data-action="spellcheck"]');
    if (spellBtn) spellBtn.addEventListener('click', revisarOrtografia);

    const resetBtn = document.querySelector('[data-action="reset"]');
    if (resetBtn) resetBtn.addEventListener('click', limpiarFormulario);

    if (els.dicAddBtn && els.dicInput) {
      els.dicAddBtn.addEventListener('click', agregarPalabraDiccionario);
      els.dicInput.addEventListener('keydown', function(e) {
        if (e.key === 'Enter') { e.preventDefault(); agregarPalabraDiccionario(); }
      });
    }
  }

  function mostrarStatus(msg) {
    if (!els.status) return;
    els.status.textContent = msg;
    setTimeout(function() { els.status.textContent = ''; }, 5000);
  }

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
      mostrarStatus('✅ Datos guardados. Guarda este archivo para continuar luego.');
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
      let data;
      try {
        data = JSON.parse(ev.target.result);
      } catch(err) {
        console.error(err);
        alert('El archivo elegido no es un JSON valido generado por esta herramienta.');
        return;
      }
      try {
        document.querySelectorAll('input[type="radio"]:checked').forEach(function(r) { r.checked = false; });
        Object.keys(data).forEach(function(key) {
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
        mostrarStatus('✅ Datos cargados. Podes continuar editando.');
      } catch(err) {
        console.error(err);
        alert('El JSON es valido, pero ocurrio un error al aplicar los datos al formulario. Revisa la consola (F12) para mas detalles.');
      }
    };
    reader.readAsText(file);
    e.target.value = '';
  }

  let langtoolStatus = 'unknown';
  const MODAL_SHOWN_KEY = 'langtoolOfflineModalShown';

  function reportLangtoolStatus(status) {
    langtoolStatus = status;
    try {
      window.parent.postMessage({ source: 'reportes-dashboard', type: 'langtool-status', status: status }, '*');
    } catch (e) { }
  }

  function mostrarModalSinConexion() {
    if (sessionStorage.getItem(MODAL_SHOWN_KEY) === 'true') return;
    sessionStorage.setItem(MODAL_SHOWN_KEY, 'true');

    const overlay = document.createElement('div');
    overlay.id = 'langtoolOfflineModal';
    overlay.className = 'langtool-modal-overlay';
    overlay.innerHTML =
      '<div class="langtool-modal-box">' +
      '<div class="langtool-modal-icon">⚠️</div>' +
      '<h3>Sin conexion con el corrector</h3>' +
      '<p>No se pudo conectar con el corrector ortografico y gramatical automatico. ' +
      'Podes seguir completando el informe con normalidad — esta funcion se reintentara ' +
      'la proxima vez que uses "Revisar ortografia".</p>' +
      '<button type="button" class="langtool-modal-accept">Aceptar</button>' +
      '</div>';
    document.body.appendChild(overlay);
    overlay.querySelector('.langtool-modal-accept').addEventListener('click', function() {
      overlay.remove();
    });
  }

  reportLangtoolStatus(navigator.onLine ? 'unknown' : 'offline');
  window.addEventListener('online', function() { reportLangtoolStatus('unknown'); });
  window.addEventListener('offline', function() { reportLangtoolStatus('offline'); });

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
    els.spellPanel.innerHTML = 'Revisando ortografia y gramatica, un momento...';

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
          const badEscaped = escapeHTML(bad);
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

      els.spellPanel.innerHTML = totalIssues ? html : '✅ No se encontraron errores ortograficos ni gramaticales.';
      reportLangtoolStatus('online');

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
      els.spellPanel.innerHTML = '❌ No se pudo conectar con el corrector ortografico. Verifica tu conexion a internet e intenta de nuevo.';
      reportLangtoolStatus('offline');
      mostrarModalSinConexion();
    } finally {
      btn.disabled = false;
    }
  }

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
      els.dicList.innerHTML = '<span style="color:#999;">Sin palabras agregadas todavia.</span>';
      return;
    }
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
    if (!/^[a-záéíóúñüA-ZÁÉÍÓÚÑÜ\s'-]+$/.test(palabra)) {
      alert('La palabra solo puede contener letras, espacios, guiones y apostrofos.');
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

  // ---------- Limpiar (CORREGIDO) ----------
  function limpiarFormulario() {
    if (!confirm('¿Estas seguro de que queres limpiar los datos del formulario?')) return;
    cfg.camposGuardables.forEach(function(id) {
      if (cfg.camposNoLimpiar.indexOf(id) !== -1) return;
      const el = document.getElementById(id);
      if (el) {
        if (el.type === 'checkbox') {
          el.checked = true;
        } else {
          el.value = '';
        }
      }
    });
    // Resetear radios: marcar el primero de cada grupo
    const radioNames = new Set();
    document.querySelectorAll('input[type="radio"]').forEach(function(r) {
      radioNames.add(r.name);
    });
    radioNames.forEach(function(name) {
      const firstRadio = document.querySelector('input[type="radio"][name="' + CSS.escape(name) + '"]');
      if (firstRadio) firstRadio.checked = true;
    });

    if (cfg.onResetExtra) cfg.onResetExtra();
    mostrarStatus('🗑 Formulario limpiado.');
  }

  return { init: init };
})();
