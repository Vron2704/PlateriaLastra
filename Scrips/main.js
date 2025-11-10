// /Scrips/main.js

import { 
    cargarProductos, 
    aplicarFiltros, 
    cargarOpcionesPanel,
    limpiarFiltros,
    filtrosGlobales 
} from '/Scrips/client.js?v=5.0'; // Sube la versión a 5.0

document.addEventListener('DOMContentLoaded', () => {

    // --- SELECTORES (Mantenidos) ---
    const menuBtn = document.getElementById('menu-toggle-btn');
    const navMenu = document.getElementById('nav-links-menu');
    const closeMenuBtn = document.getElementById('close-menu-btn');
    const openFilterBtn = document.getElementById('open-filter-btn');
    const filterSidebar = document.getElementById('filter-sidebar');
    const panelContainer = document.getElementById('panel-container');
    const applyFilterBtn = document.getElementById('filter-btn-apply');
    const clearFilterBtn = document.getElementById('filter-btn-clear');
    const searchForm = document.getElementById('search-form');
    const searchInput = document.querySelector('.search-input');
    const overlay = document.getElementById('overlay');

    // --- Funciones de Paneles (Mantenidas) ---
    function openNavMenu() { /* ... */ if (navMenu) navMenu.classList.add('active'); if (overlay) overlay.classList.add('active');}
    function closeNavMenu() { /* ... */ if (navMenu) navMenu.classList.remove('active'); if (overlay) overlay.classList.remove('active');}
    function openFilterMenu() { if (filterSidebar) filterSidebar.classList.add('active'); if (overlay) overlay.classList.add('active');}
    function closeFilterMenu() { if (filterSidebar) filterSidebar.classList.remove('active'); if (overlay) overlay.classList.remove('active');}

    // Función para animar el deslizamiento de paneles (Mantenida)
    function navegarA(panelId) {
        if (!panelContainer) return;
        const paneles = panelContainer.querySelectorAll('.filter-panel');
        paneles.forEach(p => {
            p.classList.remove('active', 'parent');
            if (p.id === panelId) p.classList.add('active');
        });
        
        let panelActual = panelContainer.querySelector(`#${panelId}`);
        if (!panelActual) return;
        
        let backBtn = panelActual.querySelector('.panel-back-btn');
        let panelAnterior = backBtn ? panelContainer.querySelector(`#${backBtn.dataset.target}`) : null;
        
        while (panelAnterior) {
            panelAnterior.classList.add('parent');
            backBtn = panelAnterior.querySelector('.panel-back-btn');
            panelAnterior = backBtn ? panelContainer.querySelector(`#${backBtn.dataset.target}`) : null;
        }
    }

    // --- Lógica de PÁGINA DE CATÁLOGO ---
    if (document.getElementById('catalogo-container')) {
        cargarProductos(); 
        
        // Carga inicial del primer panel de filtros
        cargarOpcionesPanel('type', 'lista-type'); // Columna 'type', ID 'lista-type'

        // Listener para navegar ENTRE paneles
        if (panelContainer) {
            panelContainer.addEventListener('click', (e) => {
                const link = e.target.closest('.nav-link');
                const backBtn = e.target.closest('.panel-back-btn');
                const checkbox = e.target.closest('#lista-categoria .filter-checkbox'); 
                
                // 1. Navegación HACIA ADELANTE
                if (link) {
                    const columna = link.dataset.columna;
                    const valor = link.dataset.valor;
                    
                    filtrosGlobales[columna] = valor; 

                    let siguientePanelId, siguienteColumna, listaId;
                    
                    if (columna === 'type') {
                        siguientePanelId = 'panel-genero';
                        siguienteColumna = 'genero';
                        listaId = 'lista-genero';
                    } else if (columna === 'genero') {
                        siguientePanelId = 'panel-engaste';
                        siguienteColumna = 'engaste';
                        listaId = 'lista-engaste';
                    } else if (columna === 'engaste') {
                        siguientePanelId = 'panel-categoria';
                        siguienteColumna = 'categoria';
                        listaId = 'lista-categoria';
                    }
                    
                    if (siguientePanelId) {
                        cargarOpcionesPanel(siguienteColumna, listaId);
                        navegarA(siguientePanelId);
                    }
                }
                
                // 2. Navegación HACIA ATRÁS (SOLUCIONADO EL ERROR DEL PANEL BLANCO)
                if (backBtn) {
                    const targetPanelId = backBtn.dataset.target;
                    
                    const panelActual = backBtn.closest('.filter-panel');
                    if (panelActual.id === 'panel-genero') delete filtrosGlobales.type;
                    if (panelActual.id === 'panel-engaste') delete filtrosGlobales.genero;
                    if (panelActual.id === 'panel-categoria') delete filtrosGlobales.engaste;
                    
                    // Recarga las opciones del panel destino para que no esté vacío
                    let columnaDestino = targetPanelId.replace('panel-', '');
                    let listaDestinoId = (columnaDestino === 'categoria') ? 'lista-categoria' : `lista-${columnaDestino}`;
                    
                    // Asegura que el panel principal recarga el 'type'
                    if (columnaDestino === 'panel-type') {
                        cargarOpcionesPanel('type', 'lista-type');
                    } else {
                        cargarOpcionesPanel(columnaDestino, listaDestinoId);
                    }
                    
                    navegarA(targetPanelId);
                }
                
                // 3. Aplicar al instante en Categoría
                if (checkbox) {
                    aplicarFiltros();
                }
            });
        }

        // Botones de acción de filtros (APLICAR / LIMPIAR)
        if (applyFilterBtn) {
            applyFilterBtn.addEventListener('click', () => {
                aplicarFiltros(); 
                closeFilterMenu();
            });
        }

        if (clearFilterBtn) {
            clearFilterBtn.addEventListener('click', () => {
                limpiarFiltros();
                // Resetea los paneles y recarga el primer nivel
                navegarA('panel-type');
                cargarOpcionesPanel('type', 'lista-type');
                closeFilterMenu();
            });
        }
    }

    // --- Listeners Generales ---
    const header = document.querySelector('header');
    if (header) {
        header.classList.add('sticky-nav');
    }
    if (menuBtn) menuBtn.addEventListener('click', openNavMenu);
    if (closeMenuBtn) closeMenuBtn.addEventListener('click', closeNavMenu);
    if (openFilterBtn) openFilterBtn.addEventListener('click', openFilterMenu);
    
    if (searchForm) {
        searchForm.addEventListener('submit', (e) => e.preventDefault());
    }
    if (searchInput) {
        searchInput.addEventListener('input', aplicarFiltros);
    }
    
    if (overlay) {
        overlay.addEventListener('click', () => {
            closeNavMenu();
            closeFilterMenu();
        });
    }
});