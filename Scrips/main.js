// main.js

// --- 1. IMPORTA las funciones de client.js ---
import { 
    cargarProductos, 
    aplicarFiltros, 
    cargarFiltrosCategoria 
} from '/Scrips/client.js'; // Asegúrate que esta RUTA sea correcta

// Espera a que todo el HTML esté cargado
document.addEventListener('DOMContentLoaded', () => {

    // --- 2. SELECCIÓN DE ELEMENTOS (Todos) ---
    const menuBtn = document.getElementById('menu-toggle-btn');
    const navMenu = document.getElementById('nav-links-menu');
    const closeMenuBtn = document.getElementById('close-menu-btn');
    const openFilterBtn = document.getElementById('open-filter-btn');
    const filterSidebar = document.getElementById('filter-sidebar');
    const applyFilterBtn = document.getElementById('filter-btn-apply');
    const clearFilterBtn = document.getElementById('filter-btn-clear');
    const searchForm = document.getElementById('search-form');
    const searchInput = document.querySelector('.search-input');
    const overlay = document.getElementById('overlay');
    const header = document.querySelector('header');

    // --- 3. FUNCIONES INNATAS (Abrir/Cerrar Paneles) ---
    function openNavMenu() {
        if (navMenu) navMenu.classList.add('active');
        if (overlay) overlay.classList.add('active');
    }
    function closeNavMenu() {
        if (navMenu) navMenu.classList.remove('active');
        if (overlay) overlay.classList.remove('active');
    }
    function openFilterMenu() {
        if (filterSidebar) filterSidebar.classList.add('active');
        if (overlay) overlay.classList.add('active');
    }
    function closeFilterMenu() {
        if (filterSidebar) filterSidebar.classList.remove('active');
        if (overlay) overlay.classList.remove('active');
    }

    // --- 4. LÓGICA DE HEADER STICKY ---
    if (header) {
        header.classList.add('sticky-nav');
    }

    // --- 5. CARGAS INICIALES (SOLO EN PÁGINA CATÁLOGO) ---
    if (document.getElementById('catalogo-container')) {
        cargarProductos();
        cargarFiltrosCategoria();
    }
    
    // --- 6. ESCUCHADORES DE EVENTOS (LISTENERS) ---
    if (menuBtn) menuBtn.addEventListener('click', openNavMenu);
    if (closeMenuBtn) closeMenuBtn.addEventListener('click', closeNavMenu);
    if (openFilterBtn) openFilterBtn.addEventListener('click', openFilterMenu);
    
    if (applyFilterBtn) {
        applyFilterBtn.addEventListener('click', () => {
            aplicarFiltros(); 
            closeFilterMenu();
        });
    }

    if (clearFilterBtn) {
        clearFilterBtn.addEventListener('click', () => {
            if (filterSidebar) {
                const checkboxes = filterSidebar.querySelectorAll('.filter-checkbox');
                checkboxes.forEach(cb => cb.checked = false);
            }
            aplicarFiltros();
            closeFilterMenu();
        });
    }

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
    
    if (filterSidebar) {
        filterSidebar.addEventListener('click', (event) => {
            const header = event.target.closest('.filter-group h3');
            if (header) {
                const group = header.closest('.filter-group');
                if (group) group.classList.toggle('active');
            }
        });
    }
});