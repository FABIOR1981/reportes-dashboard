document.addEventListener('DOMContentLoaded', () => {
  const reportList = document.getElementById('report-list');
  const searchInput = document.getElementById('search-input');
  const reportFrame = document.getElementById('report-frame');
  const welcomeMessage = document.getElementById('welcome-message');
  const currentReportTitle = document.getElementById('current-report-title');
  const reloadBtn = document.getElementById('reload-btn');
  const fullscreenBtn = document.getElementById('fullscreen-btn');

  let reportsData = [];

  // 1. Cargar el JSON generado dinámicamente
  fetch('index.json')
    .then(response => {
      if (!response.ok) throw new Error('No se pudo cargar el índice de reportes.');
      return response.json();
    })
    .then(data => {
      reportsData = data;
      renderReportList(reportsData);
    })
    .catch(error => {
      console.error(error);
      if (reportList) {
        reportList.innerHTML = `<li class="loading">Error al cargar reportes. Asegúrate de compilar el proyecto.</li>`;
      }
    });

  // 2. Renderizar lista en la barra lateral
  function renderReportList(reports) {
    if (!reportList) return;

    if (reports.length === 0) {
      reportList.innerHTML = `<li class="loading">No se encontraron reportes.</li>`;
      return;
    }

    reportList.innerHTML = '';
    reports.forEach((report) => {
      const li = document.createElement('li');
      li.innerHTML = `
        <a href="#" data-path="${escapeHtml(report.path)}" data-title="${escapeHtml(report.title)}">
          <i class="fa-regular fa-file-code"></i>
          <span>${escapeHtml(report.title)}</span>
        </a>
      `;

      li.querySelector('a').addEventListener('click', (e) => {
        e.preventDefault();
        loadReport(report.path, report.title, li);
      });

      reportList.appendChild(li);
    });
  }

  // 3. Cargar reporte seleccionado en el IFRAME
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

  // 4. Búsqueda en tiempo real
  if (searchInput) {
    searchInput.addEventListener('input', (e) => {
      const query = e.target.value.toLowerCase();
      const filtered = reportsData.filter(r => 
        r.title.toLowerCase().includes(query) || r.filename.toLowerCase().includes(query)
      );
      renderReportList(filtered);
    });
  }

  // 5. Botones de acción (Recargar y Pantalla Completa)
  if (reloadBtn) {
    reloadBtn.addEventListener('click', () => {
      if (reportFrame && reportFrame.src) {
        reportFrame.contentWindow.location.reload();
      }
    });
  }

  if (fullscreenBtn) {
    fullscreenBtn.addEventListener('click', () => {
      if (reportFrame && !reportFrame.classList.contains('hidden')) {
        if (reportFrame.requestFullscreen) {
          reportFrame.requestFullscreen();
        } else if (reportFrame.webkitRequestFullscreen) {
          reportFrame.webkitRequestFullscreen();
        }
      }
    });
  }

  // Función auxiliar para escapar texto HTML
  function escapeHtml(str) {
    return str.replace(/[&<>"']/g, match => ({
      '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;'
    }[match]));
  }
});