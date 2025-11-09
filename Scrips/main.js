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
    const heroSection = document.querySelector('.hero, .hero-2');
    
    // 2. Si existe una sección 'hero' (y solo si existe)...
    if (heroSection) {
        const header = document.querySelector('header');
        
        if (header) {
            // 3. Obtenemos la altura exacta del header
            const headerHeight = header.offsetHeight;
            
            // 4. Le decimos a la ventana que se scrollee a esa altura
            window.scrollTo({
                top: headerHeight,
                behavior: 'smooth' 
            });
        }
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