document.addEventListener('DOMContentLoaded', () => {
  const reportList = document.getElementById('report-list');
  const searchInput = document.getElementById('search-input');
  const reportFrame = document.getElementById('report-frame');
  const welcomeMessage = document.getElementById('welcome-message');
  const currentReportTitle = document.getElementById('current-report-title');
  const reloadBtn = document.getElementById('reload-btn');
  const fullscreenBtn = document.getElementById('fullscreen-btn');

  let reportsData = [];

  // 1. Cargar el JSON generado
  fetch('index.json')
    .then(response => {
      if (!response.ok) throw new Error('No se pudo cargar el índice.');
      return response.json();
    })
    .then(data => {
      reportsData = data;
      renderReportList(reportsData);
    })
    .catch(error => {
      console.error(error);
      if (reportList) {
        reportList.innerHTML = `<li class="loading">Error al cargar reportes.</li>`;
      }
    });

  // 2. Renderizar menú y submenús
  function renderReportList(data) {
    if (!reportList) return;

    if (!data || data.length === 0) {
      reportList.innerHTML = `<li class="loading">No hay archivos ni carpetas.</li>`;
      return;
    }

    reportList.innerHTML = '';
    const fragment = createMenuTree(data);
    reportList.appendChild(fragment);
  }

  function createMenuTree(items) {
    const fragment = document.createDocumentFragment();

    items.forEach(item => {
      const li = document.createElement('li');

      if (item.type === 'folder') {
        li.classList.add('folder-item');
        li.innerHTML = `
          <div class="folder-header">
            <i class="fa-solid fa-folder folder-icon"></i>
            <span>${escapeHtml(item.name)}</span>
            <i class="fa-solid fa-chevron-down arrow-icon"></i>
          </div>
          <ul class="submenu hidden"></ul>
        `;

        const folderHeader = li.querySelector('.folder-header');
        const submenu = li.querySelector('.submenu');
        submenu.appendChild(createMenuTree(item.items));

        folderHeader.addEventListener('click', () => {
          submenu.classList.toggle('hidden');
          folderHeader.classList.toggle('open');
        });

      } else if (item.type === 'file') {
        li.innerHTML = `
          <a href="#" data-path="${escapeHtml(item.path)}" data-title="${escapeHtml(item.title)}">
            <i class="fa-regular fa-file-code"></i>
            <span>${escapeHtml(item.title)}</span>
          </a>
        `;

        li.querySelector('a').addEventListener('click', (e) => {
          e.preventDefault();
          loadReport(item.path, item.title, li);
        });
      }

      fragment.appendChild(li);
    });

    return fragment;
  }

  // 3. Cargar reporte en el Iframe
  function loadReport(path, title, activeLi) {
    document.querySelectorAll('.sidebar-nav li').forEach(el => el.classList.remove('active'));
    if (activeLi) activeLi.classList.add('active');

    if (welcomeMessage) welcomeMessage.classList.add('hidden');
    if (reportFrame) {
      reportFrame.classList.remove('hidden');
      reportFrame.src = path;
    }
    if (currentReportTitle) currentReportTitle.textContent = title;
  }

  // 4. Búsqueda
  if (searchInput) {
    searchInput.addEventListener('input', (e) => {
      const query = e.target.value.toLowerCase().trim();
      if (!query) {
        renderReportList(reportsData);
        return;
      }
      const filtered = filterData(reportsData, query);
      renderReportList(filtered);
      // Abrir todas las carpetas automáticamente al buscar
      document.querySelectorAll('.submenu').forEach(s => s.classList.remove('hidden'));
    });
  }

  function filterData(items, query) {
    return items.map(item => {
      if (item.type === 'file') {
        const matches = item.title.toLowerCase().includes(query) || item.filename.toLowerCase().includes(query);
        return matches ? item : null;
      } else if (item.type === 'folder') {
        const subFiltered = filterData(item.items, query);
        if (subFiltered.length > 0) {
          return { ...item, items: subFiltered };
        }
      }
      return null;
    }).filter(Boolean);
  }

  // 5. Botones Acción
  if (reloadBtn) {
    reloadBtn.addEventListener('click', () => {
      if (reportFrame && reportFrame.src) reportFrame.contentWindow.location.reload();
    });
  }

  if (fullscreenBtn) {
    fullscreenBtn.addEventListener('click', () => {
      if (reportFrame && !reportFrame.classList.contains('hidden')) {
        if (reportFrame.requestFullscreen) reportFrame.requestFullscreen();
      }
    });
  }

  function escapeHtml(str) {
    return str.replace(/[&<>"']/g, match => ({
      '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;'
    }[match]));
  }
});