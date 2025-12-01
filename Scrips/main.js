import { 
    cargarProductos, 
    actualizarPanelesDeFiltros, 
    seleccionarFiltro, 
    limpiarFiltros,
    filtrosGlobales 
} from '/Scrips/client.js'; 

document.addEventListener('DOMContentLoaded', () => {

    // --- UI Elements ---
    const menuBtn = document.getElementById('menu-toggle-btn');
    const navMenu = document.getElementById('nav-links-menu');
    const closeMenuBtn = document.getElementById('close-menu-btn');
    
    const openFilterBtn = document.getElementById('open-filter-btn');
    const filterSidebar = document.getElementById('filter-sidebar'); 
    const overlay = document.getElementById('overlay');
    const clearFilterBtn = document.getElementById('filter-btn-clear');

    const searchForm = document.getElementById('catalog-search'); 
    const searchInput = document.querySelector('#catalog-search .search-input'); 

    // --- Funciones Visuales ---
    const toggleMenu = (show) => {
        if(navMenu) navMenu.classList.toggle('active', show);
        if(overlay) overlay.classList.toggle('active', show);
    };
    const toggleFilter = (show) => {
        if(filterSidebar) filterSidebar.classList.toggle('active', show);
        if(overlay) overlay.classList.toggle('active', show);
    };

    // --- LÓGICA DEL CATÁLOGO ---
    if (document.getElementById('catalogo-container')) {
        console.log("Iniciando Catálogo...");
        
        // 1. Carga Inicial
        cargarProductos(); 
        actualizarPanelesDeFiltros(); 

        // 2. EVENT DELEGATION (Detectar clicks en filtros dinámicos)
        document.addEventListener('click', (e) => {
            const filterItem = e.target.closest('.filter-item');
            
            if (filterItem && !filterItem.classList.contains('bloqueado')) {
                e.preventDefault();
                const col = filterItem.dataset.columna;
                const val = filterItem.dataset.valor;
                
                if (col && val) {
                    seleccionarFiltro(col, val);
                }
            }
        });

        // 3. Botón Limpiar (Móvil)
        if (clearFilterBtn) {
            clearFilterBtn.addEventListener('click', () => {
                limpiarFiltros();
                toggleFilter(false);
            });
        }
    }

    // --- LISTENERS GENERALES ---
    if (menuBtn) menuBtn.addEventListener('click', () => toggleMenu(true));
    if (closeMenuBtn) closeMenuBtn.addEventListener('click', () => toggleMenu(false));
    if (openFilterBtn) openFilterBtn.addEventListener('click', () => toggleFilter(true));
    
    if (overlay) {
        overlay.addEventListener('click', () => {
            toggleMenu(false);  
            toggleFilter(false);
        });
    }

    // Búsqueda
    if (searchInput) {
        searchInput.addEventListener('input', (e) => {
            const val = e.target.value.trim();
            filtrosGlobales.search_term = val !== '' ? val : null;
            cargarProductos();
        });
    }
    if (searchForm) {
        searchForm.addEventListener('submit', (e) => {
            e.preventDefault();
            if(searchInput) searchInput.blur();
        });
    }
});
const btn = document.querySelector('.btn-submit');
const form = document.getElementById('form-contacto');

form.addEventListener('submit', function(event) {
   event.preventDefault(); // Evita que la página se recargue

   btn.textContent = 'Enviando...';
   const serviceID = 'default_service'; // Reemplaza con tu Service ID real de EmailJS
   const templateID = 'template_xxxxx'; // Reemplaza con tu Template ID real de EmailJS

   emailjs.sendForm(serviceID, templateID, this)
    .then(() => {
        btn.textContent = 'Enviar Mensaje';
        
        // Alerta bonita de éxito
        Swal.fire({
            title: '¡Mensaje Enviado!',
            text: 'Nos pondremos en contacto contigo pronto.',
            icon: 'success',
            confirmButtonColor: '#122033'
        });
        
        form.reset(); // Limpia el formulario
    }, (err) => {
        btn.textContent = 'Enviar Mensaje';
        
        // Alerta de error
        Swal.fire({
            title: 'Error',
            text: 'Hubo un problema al enviar el mensaje. Intenta nuevamente.',
            icon: 'error',
            confirmButtonColor: '#122033'
        });
        console.error(JSON.stringify(err));
    });
});
