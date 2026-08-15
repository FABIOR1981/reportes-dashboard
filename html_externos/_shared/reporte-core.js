/**
 * reporte-core.js  v1.1.0
 * Módulo compartido para generadores de informes.
 */

(function(global) {
  "use strict";

  const DEFAULT_CONFIG = {
    tipo: "generico",
    tituloDefault: "Informe",
    camposGuardables: [],
    previewTarget: "page1",
    panelTarget: "panel",
    radioName: "recom",
    habilitarPDF: true,
    habilitarWord: true,
    habilitarDiccionario: true,
    diccionarioBase: [],
    diccionarioKey: null,

    nombreArchivo: function(datos) {
      return (datos.apellidos || datos.nombre || "informe").replace(/\s+/g, "_");
    },

    buildPreview: null,
    buildWordDocument: null,
    onReset: null,
    onBeforeSave: null,
    onAfterLoad: null
  };

  let config = {};
  let listenersActivos = false;
  const meses = ["enero","febrero","marzo","abril","mayo","junio",
                 "julio","agosto","septiembre","octubre","noviembre","diciembre"];

  /* ===== UTILIDADES ===== */
  function fmtFecha(iso) {
    if (!iso) return "";
    const p = iso.split("-");
    return parseInt(p[2],10) + " de " + meses[parseInt(p[1],10)-1] + " de " + p[0];
  }

  function fmtFechaCorta(iso) {
    if (!iso) return "";
    const p = iso.split("-");
    return p[2] + "/" + p[1] + "/" + p[0];
  }

  function calcularEdad(fechaNacIso, fechaRefIso) {
    if (!fechaNacIso) return "";
    const nac = fechaNacIso.split("-").map(Number);
    const ref = (fechaRefIso || new Date().toISOString().slice(0,10)).split("-").map(Number);
    let edad = ref[0] - nac[0];
    if (ref[1] < nac[1] || (ref[1] === nac[1] && ref[2] < nac[2])) edad--;
    return edad >= 0 ? edad : "";
  }

  function escapeHtml(str) {
    if (!str) return "";
    return str.replace(/[&<>"']/g, function(m) {
      return ({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[m]);
    });
  }

  function mostrarStatus(msg, duracion) {
    const el = document.getElementById("rc-status");
    if (!el) return;
    el.textContent = msg;
    if (duracion !== 0) {
      setTimeout(function() { el.textContent = ""; }, duracion || 5000);
    }
  }

  /* ===== DATOS ===== */
  function gatherDatos() {
    const datos = {};
    config.camposGuardables.forEach(function(id) {
      const el = document.getElementById(id);
      if (el) datos[id] = el.value;
    });
    const rec = document.querySelector('input[name="' + config.radioName + '"]:checked');
    if (rec) datos[config.radioName] = rec.value;

    if (typeof config.onBeforeSave === "function") {
      config.onBeforeSave(datos);
    }
    return datos;
  }

  function setDatos(datos) {
    Object.keys(datos).forEach(function(key) {
      if (key === config.radioName) {
        const radio = document.querySelector('input[name="' + config.radioName + '"][value="' + datos[key] + '"]');
        if (radio) radio.checked = true;
      } else {
        const el = document.getElementById(key);
        if (el) el.value = datos[key];
      }
    });
    if (typeof config.onAfterLoad === "function") {
      config.onAfterLoad(datos);
    }
  }

  /* ===== VISTA PREVIA ===== */
  function actualizarVistaPrevia() {
    const datos = gatherDatos();
    if (datos.fechaNacimiento || datos.fechaNac) {
      const edad = calcularEdad(datos.fechaNacimiento || datos.fechaNac, datos.fechaInforme);
      const edadEl = document.getElementById("edad");
      if (edadEl && !edadEl.value) edadEl.value = edad;
      datos.edad = edad;
    }
    if (typeof config.buildPreview === "function") {
      config.buildPreview(datos);
    }
  }

  function attachInputListeners() {
    if (listenersActivos) return;
    listenersActivos = true;
    config.camposGuardables.forEach(function(id) {
      const el = document.getElementById(id);
      if (!el) return;
      const events = (el.tagName === "TEXTAREA" || el.type === "date" || el.type === "time")
        ? ["input", "change"]
        : ["input", "keyup"];
      events.forEach(function(evt) {
        el.addEventListener(evt, actualizarVistaPrevia);
      });
    });
    document.querySelectorAll('input[name="' + config.radioName + '"]').forEach(function(r) {
      r.addEventListener("change", actualizarVistaPrevia);
    });
  }

  /* ===== GUARDAR / CARGAR ===== */
  function guardarDatos() {
    try {
      const datos = gatherDatos();
      const blob = new Blob([JSON.stringify(datos, null, 2)], {type: "application/json"});
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      const nombre = config.nombreArchivo(datos);
      a.href = url;
      a.download = "DATOS_" + config.tipo.toUpperCase() + "_" + nombre + ".json";
      document.body.appendChild(a);
      a.click();
      a.remove();
      URL.revokeObjectURL(url);
      mostrarStatus("💾 Datos guardados. Guardá ese archivo para continuar luego.");
    } catch(err) {
      console.error(err);
      mostrarStatus("❌ No se pudieron guardar los datos.");
    }
  }

  function cargarDatos() {
    const input = document.getElementById("rc-loadInput");
    if (input) input.click();
  }

  function onFileSelected(e) {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = function(ev) {
      try {
        const datos = JSON.parse(ev.target.result);
        setDatos(datos);
        actualizarVistaPrevia();
        mostrarStatus("✅ Datos cargados. Podés continuar editando.");
      } catch(err) {
        console.error(err);
        alert("El archivo elegido no es un JSON válido generado por esta herramienta.");
      }
    };
    reader.readAsText(file);
    e.target.value = "";
  }

  /* ===== DICCIONARIO ===== */
  function getDicKey() {
    return config.diccionarioKey || ("correctorDiccionario_" + config.tipo);
  }

  function getDiccionario() {
    try {
      return JSON.parse(localStorage.getItem(getDicKey()) || "[]");
    } catch(e) { return []; }
  }

  function setDiccionario(arr) {
    localStorage.setItem(getDicKey(), JSON.stringify(arr));
  }

  function palabraEnDiccionario(palabra) {
    const p = palabra.toLowerCase().replace(/[.,;:!?"']/g, "");
    const dic = config.diccionarioBase.concat(getDiccionario()).map(function(w) {
      return w.toLowerCase();
    });
    return dic.indexOf(p) !== -1;
  }

  function renderDiccionario() {
    const cont = document.getElementById("rc-dicList");
    if (!cont) return;
    const custom = getDiccionario();
    if (!custom.length) {
      cont.innerHTML = '<span style="color:#999;">Sin palabras agregadas todavía.</span>';
      return;
    }
    cont.innerHTML = custom.map(function(w) {
      return '<span class="rc-dic-chip">' + escapeHtml(w) +
             ' <button type="button" class="rc-dic-del" data-w="' + escapeHtml(w) + '">✕</button></span>';
    }).join("");
    cont.querySelectorAll(".rc-dic-del").forEach(function(btn) {
      btn.addEventListener("click", function() {
        const updated = getDiccionario().filter(function(w) { return w !== btn.dataset.w; });
        setDiccionario(updated);
        renderDiccionario();
      });
    });
  }

  function agregarPalabraDiccionario() {
    const input = document.getElementById("rc-dicInput");
    if (!input) return;
    const palabra = input.value.trim();
    if (!palabra) return;
    const custom = getDiccionario();
    const lowerCustom = custom.map(function(w) { return w.toLowerCase(); });
    if (lowerCustom.indexOf(palabra.toLowerCase()) === -1) {
      custom.push(palabra);
      setDiccionario(custom);
      renderDiccionario();
    }
    input.value = "";
  }

  /* ===== ORTOGRAFÍA ===== */
  async function checkSpellingText(texto) {
    if (!texto || !texto.trim()) return [];
    const resp = await fetch("https://api.languagetool.org/api/v2/check", {
      method: "POST",
      headers: {"Content-Type": "application/x-www-form-urlencoded"},
      body: new URLSearchParams({ text: texto, language: "es" })
    });
    if (!resp.ok) throw new Error("Error de API: " + resp.status);
    const json = await resp.json();
    return json.matches || [];
  }

  async function revisarOrtografia() {
    const panel = document.getElementById("rc-spellPanel");
    const btn = document.getElementById("rc-spellBtn");
    if (!panel || !btn) return;
    btn.disabled = true;
    panel.innerHTML = "Revisando ortografía y gramática, un momento...";

    try {
      const campos = [];
      document.querySelectorAll('input[spellcheck="true"], textarea[spellcheck="true"]').forEach(function(el) {
        if (el.value.trim()) {
          const label = el.previousElementSibling;
          campos.push({ label: label ? label.textContent : el.id, text: el.value });
        }
      });

      let html = "";
      let totalIssues = 0;

      for (let i = 0; i < campos.length; i++) {
        const f = campos[i];
        const matches = await checkSpellingText(f.text);
        const items = [];
        matches.forEach(function(m) {
          const bad = f.text.substring(m.offset, m.offset + m.length);
          if (palabraEnDiccionario(bad)) return;
          const suggestion = (m.replacements && m.replacements[0]) ? m.replacements[0].value : null;
          if (suggestion) {
            items.push('<li>"' + escapeHtml(bad) + '" → <b>' + escapeHtml(suggestion) + '</b> ' +
              '<button type="button" class="rc-dic-ignore" data-w="' + escapeHtml(bad) + '">no es un error, ignorar siempre</button></li>');
          } else {
            items.push('<li>"' + escapeHtml(bad) + '": ' + escapeHtml(m.message) + ' ' +
              '<button type="button" class="rc-dic-ignore" data-w="' + escapeHtml(bad) + '">no es un error, ignorar siempre</button></li>');
          }
        });
        if (items.length) {
          totalIssues += items.length;
          html += '<div class="rc-spell-field"><b>' + escapeHtml(f.label) + '</b><ul>' + items.join("") + '</ul></div>';
        }
      }

      panel.innerHTML = totalIssues ? html : "✅ No se encontraron errores ortográficos ni gramaticales.";

      panel.querySelectorAll(".rc-dic-ignore").forEach(function(btn) {
        btn.addEventListener("click", function() {
          const custom = getDiccionario();
          if (custom.map(function(w) { return w.toLowerCase(); }).indexOf(this.dataset.w.toLowerCase()) === -1) {
            custom.push(this.dataset.w);
            setDiccionario(custom);
            renderDiccionario();
          }
          revisarOrtografia();
        });
      });

    } catch(err) {
      console.error(err);
      panel.innerHTML = "❌ No se pudo conectar con el corrector ortográfico. Verificá tu conexión a internet e intentá de nuevo.";
    } finally {
      btn.disabled = false;
    }
  }

  /* ===== PDF ===== */
  async function descargarPDF() {
    const btn = document.getElementById("rc-downloadBtn");
    if (!btn) return;
    const originalText = btn.textContent;
    btn.textContent = "⏳ Generando PDF...";
    btn.disabled = true;

    try {
      if (document.fonts && document.fonts.ready) {
        await document.fonts.ready;
      }
      const page = document.getElementById(config.previewTarget);
      if (!page) throw new Error("No se encontró el contenedor de vista previa");

      const canvas = await html2canvas(page, { scale: 3, useCORS: true, backgroundColor: "#ffffff" });
      const imgData = canvas.toDataURL("image/png");
      const pdf = new window.jspdf.jsPDF("p", "mm", "a4");
      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = (canvas.height * pdfWidth) / canvas.width;

      pdf.addImage(imgData, "PNG", 0, 0, pdfWidth, pdfHeight);

      const datos = gatherDatos();
      const nombre = config.nombreArchivo(datos);
      pdf.save("Informe_" + config.tipo + "_" + nombre + ".pdf");

    } catch(e) {
      console.error(e);
      alert("Error al generar PDF: " + e.message);
    } finally {
      btn.textContent = originalText;
      btn.disabled = false;
    }
  }

  /* ===== WORD ===== */
  async function descargarWord() {
    const btn = document.getElementById("rc-wordBtn");
    if (!btn) return;
    const originalText = btn.textContent;
    btn.textContent = "⏳ Generando Word...";
    btn.disabled = true;

    try {
      const docx = window.docx;
      const Document = docx.Document, Packer = docx.Packer;
      const Paragraph = docx.Paragraph, TextRun = docx.TextRun;

      let doc;
      if (typeof config.buildWordDocument === "function") {
        doc = config.buildWordDocument(docx, gatherDatos());
      } else {
        const datos = gatherDatos();
        const children = [new Paragraph({
          children: [new TextRun({ text: config.tituloDefault, bold: true, size: 32 })]
        })];
        config.camposGuardables.forEach(function(id) {
          const el = document.getElementById(id);
          if (el && el.value) {
            children.push(new Paragraph({
              children: [
                new TextRun({ text: (el.previousElementSibling ? el.previousElementSibling.textContent : id) + ": ", bold: true }),
                new TextRun({ text: el.value })
              ]
            }));
          }
        });
        doc = new Document({ sections: [{ properties: {}, children: children }] });
      }

      const blob = await Packer.toBlob(doc);
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      const datos = gatherDatos();
      const nombre = config.nombreArchivo(datos);
      a.href = url;
      a.download = "Informe_" + config.tipo + "_" + nombre + ".docx";
      document.body.appendChild(a);
      a.click();
      a.remove();
      URL.revokeObjectURL(url);

    } catch(e) {
      console.error(e);
      alert("Error al generar Word: " + e.message);
    } finally {
      btn.textContent = originalText;
      btn.disabled = false;
    }
  }

  /* ===== LIMPIAR ===== */
  function limpiarFormulario() {
    if (!confirm("¿Estás seguro de que querés limpiar los datos del informe?")) return;

    config.camposGuardables.forEach(function(id) {
      const el = document.getElementById(id);
      if (!el) return;
      if (el.type === "date") {
        el.value = new Date().toISOString().slice(0,10);
      } else if (el.type === "time") {
        el.value = "";
      } else if (el.type !== "radio") {
        el.value = "";
      }
    });

    const firstRec = document.querySelector('input[name="' + config.radioName + '"]');
    if (firstRec) firstRec.checked = true;

    if (typeof config.onReset === "function") {
      config.onReset();
    }

    actualizarVistaPrevia();
  }

  /* ===== PANEL ===== */
  function injectPanel() {
    const panel = document.getElementById(config.panelTarget);
    if (!panel) return;
    if (document.getElementById("rc-actions")) return;

    let actionsHTML =
      '<div id="rc-actions">' +
      (config.habilitarPDF ? '<button id="rc-downloadBtn" type="button">📄 Descargar informe como PDF</button>' : "") +
      (config.habilitarWord ? '<button id="rc-wordBtn" type="button">📝 Descargar informe como Word</button>' : "") +
      '<button id="rc-saveBtn" type="button">💾 Guardar datos</button>' +
      '<button id="rc-loadBtn" type="button">📂 Cargar datos</button>' +
      '<input type="file" id="rc-loadInput" accept="application/json,.json" style="display:none;">' +
      '<button id="rc-spellBtn" type="button">🔤 Revisar ortografía</button>' +
      '<button id="rc-resetBtn" type="button">🗑️ Limpiar formulario</button>' +
      '<div id="rc-status"></div>' +
      '<div id="rc-spellPanel"></div>';

    if (config.habilitarDiccionario) {
      actionsHTML +=
        '<div id="rc-dicPanel">' +
        '  <label style="grid-column:1/-1; font-size:11.5px; color:#888; margin:4px 0 2px;">Diccionario técnico personalizado (palabras que nunca se marcan como error)</label>' +
        '  <div id="rc-dicAddRow">' +
        '    <input type="text" id="rc-dicInput" placeholder="Agregar palabra... ej: psicolaboral">' +
        '    <button type="button" id="rc-dicAddBtn">+ Agregar</button>' +
        '  </div>' +
        '  <div id="rc-dicList"></div>' +
        '</div>';
    }

    actionsHTML += '</div>';

    const temp = document.createElement("div");
    temp.innerHTML = actionsHTML;
    panel.appendChild(temp.firstElementChild);
  }

  function bindPanelEvents() {
    const btnMap = {
      "rc-downloadBtn": descargarPDF,
      "rc-wordBtn": descargarWord,
      "rc-saveBtn": guardarDatos,
      "rc-loadBtn": cargarDatos,
      "rc-spellBtn": revisarOrtografia,
      "rc-resetBtn": limpiarFormulario,
      "rc-dicAddBtn": agregarPalabraDiccionario
    };

    Object.keys(btnMap).forEach(function(id) {
      const btn = document.getElementById(id);
      if (btn) btn.addEventListener("click", btnMap[id]);
    });

    const loadInput = document.getElementById("rc-loadInput");
    if (loadInput) loadInput.addEventListener("change", onFileSelected);

    const dicInput = document.getElementById("rc-dicInput");
    if (dicInput) {
      dicInput.addEventListener("keydown", function(e) {
        if (e.key === "Enter") { e.preventDefault(); agregarPalabraDiccionario(); }
      });
    }
  }

  /* ===== API ===== */
  const ReporteCore = {
    version: "1.1.0",

    init: function(userConfig) {
      config = {};
      Object.keys(DEFAULT_CONFIG).forEach(function(k) {
        config[k] = userConfig && userConfig[k] !== undefined ? userConfig[k] : DEFAULT_CONFIG[k];
      });

      if (document.readyState === "loading") {
        document.addEventListener("DOMContentLoaded", function() { ReporteCore._doInit(); });
      } else {
        ReporteCore._doInit();
      }
    },

    _doInit: function() {
      injectPanel();
      bindPanelEvents();
      attachInputListeners();
      if (config.habilitarDiccionario) renderDiccionario();
      actualizarVistaPrevia();
      console.log("[ReporteCore] Inicializado para tipo:", config.tipo);
    },

    fmtFecha: fmtFecha,
    fmtFechaCorta: fmtFechaCorta,
    calcularEdad: calcularEdad,
    escapeHtml: escapeHtml,
    mostrarStatus: mostrarStatus,
    gatherDatos: gatherDatos,
    setDatos: setDatos,
    actualizarVistaPrevia: actualizarVistaPrevia,
    palabraEnDiccionario: palabraEnDiccionario,
    getDiccionario: getDiccionario,
    setDiccionario: setDiccionario,
    getConfig: function() { return config; }
  };

  global.ReporteCore = ReporteCore;

})(window);
