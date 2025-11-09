// Espera a que todo el HTML esté cargado
document.addEventListener('DOMContentLoaded', () => {

    // Selecciona todos los elementos necesarios
    const menuBtn = document.getElementById('menu-toggle-btn');
    const navMenu = document.getElementById('nav-links-menu');
    const overlay = document.getElementById('overlay');
    const closeBtn = document.getElementById('close-menu-btn');

    // Función para ABRIR el menú
    function openMenu() {
        if (navMenu) navMenu.classList.add('active');
        if (overlay) overlay.classList.add('active');
    }

    // Función para CERRAR el menú
    function closeMenu() {
        if (navMenu) navMenu.classList.remove('active');
        if (overlay) overlay.classList.remove('active');
    }

    // Escuchadores de eventos
    if (menuBtn) {
        menuBtn.addEventListener('click', openMenu); // El botón hamburguesa ABRE
    }
    
    if (closeBtn) {
        closeBtn.addEventListener('click', closeMenu); // El botón 'X' CIERRA
    }
    
    if (overlay) {
        overlay.addEventListener('click', closeMenu); // El overlay CIERRA
    }

});