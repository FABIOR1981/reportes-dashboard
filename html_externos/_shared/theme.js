// ============================================================
//  THEME (claro/oscuro) — Lógica compartida para los 3 informes
// ============================================================
// Solo afecta el PANEL DE FORMULARIO en pantalla (nunca la vista
// previa del documento ni el PDF/Word exportado, que siempre usan
// la estética fija de oficina). El tema elegido se guarda en
// localStorage con una clave COMPARTIDA entre los 3 informes, para
// que el modo elegido en uno se mantenga al abrir cualquier otro.
//
// Contrato: window.Theme.init(), .toggle(), .current()
// Se aplica como atributo data-theme="claro"|"oscuro" en <html>.
// Cada CSS de informe (y botonera.css) define las reglas
// [data-theme="oscuro"] #panel {...} / .form-panel {...} etc.
// ============================================================

window.Theme = (function() {
  var STORAGE_KEY = 'temaPreferido';
  var DEFAULT_THEME = 'claro';

  function getStored() {
    try {
      var val = localStorage.getItem(STORAGE_KEY);
      return (val === 'claro' || val === 'oscuro') ? val : DEFAULT_THEME;
    } catch (e) {
      return DEFAULT_THEME;
    }
  }

  var ICON_MOON = '<path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79Z"/>';
  var ICON_SUN = '<circle cx="12" cy="12" r="4"/><path d="M12 2v2M12 20v2M4.93 4.93l1.41 1.41M17.66 17.66l1.41 1.41M2 12h2M20 12h2M6.34 17.66l-1.41 1.41M19.07 4.93l-1.41 1.41"/>';

  function apply(theme) {
    document.documentElement.setAttribute('data-theme', theme);
    var icon = document.getElementById('themeToggleIcon');
    // En modo oscuro se muestra el sol (acción: volver a claro) y viceversa.
    if (icon) icon.innerHTML = theme === 'oscuro' ? ICON_SUN : ICON_MOON;
    var btn = document.getElementById('themeToggleBtn');
    if (btn) {
      var label = theme === 'oscuro' ? 'Cambiar a modo claro' : 'Cambiar a modo oscuro';
      btn.setAttribute('aria-label', label);
      btn.title = label;
    }
  }

  function toggle() {
    var next = current() === 'oscuro' ? 'claro' : 'oscuro';
    try { localStorage.setItem(STORAGE_KEY, next); } catch (e) { /* noop */ }
    apply(next);
  }

  function current() {
    return document.documentElement.getAttribute('data-theme') || DEFAULT_THEME;
  }

  function init() {
    apply(getStored());
    // Delegación de eventos en document (no bind directo al botón):
    // en Genérico, Botonera.init() crea el botón dentro de su propio
    // listener de DOMContentLoaded, que puede correr DESPUÉS del de
    // theme.js (theme.js se carga primero, en el <head>). Bindear
    // directo al nodo del botón puede intentar engancharse antes de
    // que exista. La delegación funciona sin importar el orden.
    document.addEventListener('click', function(ev) {
      var btn = ev.target.closest && ev.target.closest('#themeToggleBtn');
      if (btn) toggle();
    });
  }

  // Aplicar el tema guardado lo antes posible (antes de DOMContentLoaded)
  // para evitar parpadeo de tema incorrecto al cargar la página.
  apply(getStored());

  document.addEventListener('DOMContentLoaded', init);

  return { init: init, toggle: toggle, current: current };
})();
