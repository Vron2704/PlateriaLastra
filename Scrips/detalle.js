import { createClient } from 'https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2/+esm';

// CONFIGURACIÓN DE SUPABASE
const SUPABASE_URL = 'https://xdblvjdkfnlrcmymujfz.supabase.co';
const SUPABASE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InhkYmx2amRrZm5scmNteW11amZ6Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjI0NjM5MDMsImV4cCI6MjA3ODAzOTkwM30.nWmdzB2Nm_fzhGDDeky5ho-EwbP-goxqMj-vuxLLvYg';
const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

// INICIALIZACIÓN
document.addEventListener('DOMContentLoaded', initPage);
function actualizarBreadcrumbDetalle(nombreProducto) {
    const breadcrumbList = document.getElementById('breadcrumb-nav');
    if (!breadcrumbList) return;

    // 1. Asegurarnos de que el enlace de "Catálogo" sea clicable para volver
    // Buscamos el último item actual (que debería ser Catálogo)
    const items = breadcrumbList.querySelectorAll('.breadcrumb-item');
    if (items.length > 0) {
        const itemCatalogo = items[items.length - 1];
        // Si "Catálogo" es solo texto, lo convertimos en enlace
        if (!itemCatalogo.querySelector('a')) {
            itemCatalogo.innerHTML = `<a href="catalogo.html">Catálogo</a>`;
            itemCatalogo.classList.remove('active'); // Ya no es la página activa
        }
    }

    // 2. Crear el nuevo elemento para el PRODUCTO
    const liProducto = document.createElement('li');
    liProducto.className = 'breadcrumb-item active'; // 'active' lo pone en gris/negrita
    liProducto.textContent = nombreProducto; // El nombre que vino de la BD (ej: "Estrella")

    // 3. Añadirlo al final
    breadcrumbList.appendChild(liProducto);
}


async function initPage() {
    const params = new URLSearchParams(window.location.search);
    const id = params.get('id');
    
    // Si no hay ID en la URL (ej. entras directo al html sin ?id=...), no carga nada
    if (!id) {
        console.warn("No se proporcionó ID de producto.");
        document.getElementById('product-info-container').innerHTML = "<p>Selecciona un producto del catálogo.</p>";
        return; 
    }

    await cargarDetalle(id);
}

async function cargarDetalle(id) {
    const container = document.getElementById('product-info-container');
    const mainImg = document.getElementById('main-product-image');

    // Consultamos el producto específico
    const { data, error } = await supabase
        .from('productos')
        .select('*')
        .eq('id', id)
        .single();

    if (error || !data) {
        container.innerHTML = "<h3>Producto no encontrado</h3>";
        if(mainImg) mainImg.style.display = 'none';
        return;
    }

    // 1. Configurar Título e Imagen
    document.title = `${data.nombre} - Platería Lastra`;

    if (mainImg) {
        // Usamos una imagen placeholder si el campo está vacío
        mainImg.src = data.img_url || 'https://via.placeholder.com/600x600?text=Sin+Imagen';
        mainImg.alt = data.nombre;
    }

    // 2. Renderizar Información (Inyección de HTML)
    container.innerHTML = `
        
        <h1>${data.nombre}</h1>
        
        <p class="description">${data.descripción || 'Una pieza única elaborada con los mejores materiales de joyería.'}</p>
        
        <div class="specs-grid">
            <div class="spec-item">
                <span class="spec-label">Categoría</span>
                <span class="spec-value">${data.categoria}</span>
            </div>
            <div class="spec-item">
                <span class="spec-label">Material / Tipo</span>
                <span class="spec-value">${data.type || 'Plata 950'}</span>
            </div>
            <div class="spec-item">
                <span class="spec-label">Engaste</span>
                <span class="spec-value">${data.engaste || 'Liso'}</span>
            </div>
        </div>

        <a href="https://wa.me/51923979139?text=Hola,%20estoy%20interesado%20en%20la%20cera:%20${encodeURIComponent(data.nombre)}" 
           target="_blank" 
           class="cta-button">
           Consultar Disponibilidad en WhatsApp
        </a>
    `;

    // 3. Cargar Recomendados (Basado en la categoría del producto actual)
    cargarRecomendados(data.categoria, data.id);
}

async function cargarRecomendados(categoria, currentId) {
    const recGrid = document.getElementById('recommendations-grid');
    
    // Consultamos productos de la misma categoría, max 4, excluyendo el actual
    const { data: recs, error } = await supabase
        .from('productos')
        .select('id, nombre, img_url, categoria')
        .eq('categoria', categoria)
        .neq('id', currentId) 
        .limit(4);

    // Si hay error o no hay productos, ocultamos la sección entera
    if (error || !recs || recs.length === 0) {
        const recSection = document.querySelector('.recommendations-section');
        if(recSection) recSection.style.display = 'none';
        return;
    }

    // Generamos las tarjetas de recomendación
    recGrid.innerHTML = recs.map(prod => `
        <a href="detalle.html?id=${prod.id}" class="rec-card">
            <div class="rec-img-box">
                <img src="${prod.img_url || 'https://via.placeholder.com/300'}" alt="${prod.nombre}" loading="lazy">
            </div>
            <div class="rec-name">${prod.nombre}</div>
            <div class="rec-cat">${prod.categoria}</div>
        </a>
    `).join('');
}
