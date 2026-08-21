// Registrar el Service Worker (permite que la app cargue sin conexión
// una vez que ya se abrió al menos una vez con internet).
if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('./sw.js')
      .catch((err) => console.error('No se pudo registrar el Service Worker:', err));
  });
}

document.addEventListener('DOMContentLoaded', () => {
  const reportList = document.getElementById('report-list');
  const searchInput = document.getElementById('search-input');
  const reportFrame = document.getElementById('report-frame');
  const welcomeMessage = document.getElementById('welcome-message');
  const currentReportTitle = document.getElementById('current-report-title');
  const reloadBtn = document.getElementById('reload-btn');
  const fullscreenBtn = document.getElementById('fullscreen-btn');
  const sidebar = document.querySelector('.sidebar');
  const sidebarToggleBtn = document.getElementById('sidebar-toggle-btn');
  const mobileMenuBtn = document.getElementById('mobile-menu-btn');
  const sidebarBackdrop = document.getElementById('sidebar-backdrop');
  const langtoolStatusIcon = document.getElementById('langtool-status-icon');

  let reportsData = [];

  // Ícono de estado del corrector ortográfico (lo reporta cada informe
  // por postMessage, ya que corre dentro del iframe). 3 estados posibles.
  function setLangtoolIcon(status) {
    if (!langtoolStatusIcon) return;
    langtoolStatusIcon.classList.remove('langtool-status-online', 'langtool-status-offline', 'langtool-status-unknown');
    if (status === 'online') {
      langtoolStatusIcon.classList.add('langtool-status-online');
      langtoolStatusIcon.title = 'Corrector ortográfico: conectado';
    } else if (status === 'offline') {
      langtoolStatusIcon.classList.add('langtool-status-offline');
      langtoolStatusIcon.title = 'Corrector ortográfico: sin conexión';
    } else {
      langtoolStatusIcon.classList.add('langtool-status-unknown');
      langtoolStatusIcon.title = 'Corrector ortográfico: estado desconocido (aún no se probó)';
    }
  }

  window.addEventListener('message', (event) => {
    const data = event.data;
    if (data && data.source === 'reportes-dashboard' && data.type === 'langtool-status') {
      setLangtoolIcon(data.status);
    }
  });

  // 0. Colapsar/expandir sidebar (con preferencia guardada)
  if (sidebar && sidebarToggleBtn) {
    const savedPref = localStorage.getItem('sidebarCollapsed');
    // En pantallas chicas, si el usuario nunca tocó el botón, arranca
    // colapsado (oculto) para no tapar el contenido apenas se abre la app.
    const shouldCollapseByDefault = savedPref === null && window.innerWidth <= 768;
    const startsCollapsed = savedPref === 'true' || shouldCollapseByDefault;
    if (startsCollapsed) {
      sidebar.classList.add('collapsed');
    }
    if (sidebarBackdrop) sidebarBackdrop.classList.toggle('visible', !startsCollapsed && window.innerWidth <= 768);

    const toggleSidebar = () => {
      const isCollapsed = sidebar.classList.toggle('collapsed');
      localStorage.setItem('sidebarCollapsed', isCollapsed);
      sidebarToggleBtn.title = isCollapsed ? 'Expandir menú' : 'Colapsar menú';
      if (sidebarBackdrop) sidebarBackdrop.classList.toggle('visible', !isCollapsed && window.innerWidth <= 768);
    };

    sidebarToggleBtn.addEventListener('click', toggleSidebar);
    if (mobileMenuBtn) mobileMenuBtn.addEventListener('click', toggleSidebar);
    // Tocar el fondo oscuro (solo visible en mobile con el menú abierto) lo cierra
    if (sidebarBackdrop) sidebarBackdrop.addEventListener('click', toggleSidebar);
  }

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
        li.classList.add('file-item');
        li.innerHTML = `
          <div class="menu-item-wrapper">
            <a href="#" class="report-link" data-path="${escapeHtml(item.path)}" data-title="${escapeHtml(item.title)}">
              <i class="fa-regular fa-file-code"></i>
              <span class="report-title">${escapeHtml(item.title)}</span>
            </a>
            <a href="${escapeHtml(item.path)}" target="_blank" class="external-btn" title="Abrir en pestaña nueva">
              <i class="fa-solid fa-arrow-up-right-from-square"></i>
            </a>
          </div>
        `;

        li.querySelector('.report-link').addEventListener('click', (e) => {
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
    // El informe nuevo todavía no reportó su estado del corrector
    setLangtoolIcon('unknown');

    // En mobile, al elegir un reporte cerramos el menú para ver el contenido
    if (sidebar && window.innerWidth <= 768 && !sidebar.classList.contains('collapsed')) {
      sidebar.classList.add('collapsed');
      localStorage.setItem('sidebarCollapsed', 'true');
      if (sidebarBackdrop) sidebarBackdrop.classList.remove('visible');
    }
  }

  // 4. Búsqueda en tiempo real
  if (searchInput) {
    searchInput.addEventListener('input', (e) => {
      const query = e.target.value.toLowerCase().trim();
      if (!query) {
        renderReportList(reportsData);
        return;
      }
      const filtered = filterData(reportsData, query);
      renderReportList(filtered);
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

  // 5. Botones de Acción
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