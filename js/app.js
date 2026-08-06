(() => {
  const AUTO_REFRESH_MS = 6000;

  const grid = document.getElementById('grid');
  const emptyState = document.getElementById('empty-state');
  const statusLine = document.getElementById('status-line');
  const searchInput = document.getElementById('search-input');
  const refreshBtn = document.getElementById('refresh-btn');
  const cardTemplate = document.getElementById('card-template');

  const overlay = document.getElementById('preview-overlay');
  const previewFrame = document.getElementById('preview-frame');
  const previewTitle = document.getElementById('preview-title');
  const previewOpenNew = document.getElementById('preview-open-new');
  const previewClose = document.getElementById('preview-close');

  let allReportes = [];
  let currentFilter = '';

  function formatSize(bytes) {
    if (!bytes) return '0 KB';
    const kb = bytes / 1024;
    if (kb < 1024) return kb.toFixed(kb < 10 ? 1 : 0) + ' KB';
    return (kb / 1024).toFixed(1) + ' MB';
  }

  function formatDate(iso) {
    if (!iso) return '—';
    const d = new Date(iso);
    return d.toLocaleDateString('es-ES', { day: '2-digit', month: 'short', year: 'numeric' }) +
      ' · ' + d.toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' });
  }

  function render(list) {
    grid.innerHTML = '';

    if (list.length === 0) {
      emptyState.hidden = false;
      grid.hidden = true;
      return;
    }
    emptyState.hidden = true;
    grid.hidden = false;

    list.forEach((reporte, i) => {
      const node = cardTemplate.content.cloneNode(true);

      node.querySelector('.card-index').textContent = 'N.º ' + String(i + 1).padStart(2, '0');
      node.querySelector('.card-title').textContent = reporte.title;
      node.querySelector('.card-file').textContent = reporte.file;
      node.querySelector('.card-modified').textContent = formatDate(reporte.modified);
      node.querySelector('.card-size').textContent = formatSize(reporte.size);

      const openLink = node.querySelector('.card-open');
      openLink.href = reporte.url;

      const previewBtn = node.querySelector('.card-preview');
      previewBtn.addEventListener('click', () => openPreview(reporte));

      grid.appendChild(node);
    });
  }

  function applyFilter() {
    const q = currentFilter.trim().toLowerCase();
    const filtered = !q
      ? allReportes
      : allReportes.filter(r =>
          r.title.toLowerCase().includes(q) || r.file.toLowerCase().includes(q)
        );
    render(filtered);
  }

  function setStatus(text, tone) {
    statusLine.textContent = text;
    statusLine.className = 'status-line' + (tone ? ' ' + tone : '');
  }

  async function fetchReportes({ silent } = {}) {
    if (!silent) setStatus('Consultando html_externos…');
    try {
      const res = await fetch('/api/reportes', { cache: 'no-store' });
      if (!res.ok) throw new Error('HTTP ' + res.status);
      const data = await res.json();

      allReportes = data;
      applyFilter();

      const n = data.length;
      setStatus(
        n === 0
          ? 'html_externos está vacía por ahora.'
          : n + (n === 1 ? ' reporte disponible' : ' reportes disponibles') + ' · actualizado ' +
            new Date().toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit', second: '2-digit' }),
        'ok'
      );
    } catch (err) {
      setStatus('No se pudo leer la carpeta (¿el servidor está corriendo?).', 'err');
    }
  }

  function openPreview(reporte) {
    previewTitle.textContent = reporte.title;
    previewFrame.src = reporte.url;
    previewOpenNew.href = reporte.url;
    overlay.hidden = false;
  }

  function closePreview() {
    overlay.hidden = true;
    previewFrame.src = 'about:blank';
  }

  searchInput.addEventListener('input', (e) => {
    currentFilter = e.target.value;
    applyFilter();
  });

  refreshBtn.addEventListener('click', () => fetchReportes());
  previewClose.addEventListener('click', closePreview);
  overlay.addEventListener('click', (e) => { if (e.target === overlay) closePreview(); });
  document.addEventListener('keydown', (e) => { if (e.key === 'Escape' && !overlay.hidden) closePreview(); });

  // primera carga + polling silencioso para detectar archivos nuevos solos
  fetchReportes();
  setInterval(() => fetchReportes({ silent: true }), AUTO_REFRESH_MS);
})();
