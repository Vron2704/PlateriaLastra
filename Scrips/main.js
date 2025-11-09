// Espera a que todo el HTML esté cargado
document.addEventListener('DOMContentLoaded', () => {

    // Selecciona el botón (por su ID)
    const menuBtn = document.getElementById('menu-toggle-btn');
    // Selecciona el menú (por su ID)
    const navMenu = document.getElementById('nav-links-menu');

    // Revisa si ambos elementos existen
    if (menuBtn && navMenu) {
        
        // Añade un "escuchador" de clics al botón
        menuBtn.addEventListener('click', () => {
            // Cada clic, "alterna" (toggle) la clase 'active' en el menú
            navMenu.classList.toggle('active');
        });
    }

});