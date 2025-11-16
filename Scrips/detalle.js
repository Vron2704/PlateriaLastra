// detalle.js

import { createClient } from 'https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2/+esm';

const SUPABASE_URL = 'https://xdblvjdkfnlrcmymujfz.supabase.co';
const SUPABASE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InhkYmx2amRrZm5scmNteW11amZ6Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjI0NjM5MDMsImV4cCI6MjA3ODAzOTkwM30.nWmdzB2Nm_fzhGDDeky5ho-EwbP-goxqMj-vuxLLvYg';
const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);


async function cargarDetalleProducto() {
    const params = new URLSearchParams(window.location.search);
    const productoId = params.get('id');

    const detailPageContainer = document.getElementById('product-detail-page');
    const mainProductImage = document.getElementById('main-product-image');
    const thumbnailContainer = document.getElementById('thumbnail-container');
    const productInfoContainer = document.getElementById('product-info-container');

    if (!productoId) {
        if (detailPageContainer) detailPageContainer.innerHTML = "<h1>Error: Producto no encontrado.</h1><p>Por favor, vuelve al <a href='catalogo.html'>catálogo</a>.</p>";
        return;
    }

    const { data, error } = await supabase
        .from('productos')
        .select('*')
        .eq('id', productoId)
        .single();

    if (error || !data) {
        console.error('Error al cargar el producto:', error);
        if (detailPageContainer) detailPageContainer.innerHTML = "<h1>Error al cargar el producto.</h1><p>No se pudo recuperar la información del artículo.</p>";
        return;
    }

    // Actualizar título de la página
    document.title = data.nombre + " - Plateria Lastra";

    // --- Cargar Galería de Imágenes ---
    if (mainProductImage && thumbnailContainer) {
        // Establecer la imagen principal inicial
        mainProductImage.src = data.img_url;
        mainProductImage.alt = `Imagen principal de ${data.nombre}`;

        // Crear miniatura para la imagen principal
        const mainThumbnail = document.createElement('img');
        mainThumbnail.src = data.img_url;
        mainThumbnail.alt = `Miniatura de ${data.nombre}`;
        mainThumbnail.classList.add('thumbnail-image', 'active'); // Añadir clase 'active'
        mainThumbnail.addEventListener('click', () => {
            mainProductImage.src = data.img_url;
            // Manejar clase 'active' para miniaturas
            document.querySelectorAll('.thumbnail-image').forEach(img => img.classList.remove('active'));
            mainThumbnail.classList.add('active');
        });
        thumbnailContainer.appendChild(mainThumbnail);

        // Si tienes más imágenes (ej. en una columna 'otras_imagenes' como array de URLs)
        // Adaptar esto a cómo tengas tus imágenes secundarias en Supabase
        if (data.otras_imagenes && Array.isArray(data.otras_imagenes)) {
            data.otras_imagenes.forEach(imgUrl => {
                const thumbnail = document.createElement('img');
                thumbnail.src = imgUrl;
                thumbnail.alt = `Miniatura de ${data.nombre}`;
                thumbnail.classList.add('thumbnail-image');
                thumbnail.addEventListener('click', () => {
                    mainProductImage.src = imgUrl;
                    document.querySelectorAll('.thumbnail-image').forEach(img => img.classList.remove('active'));
                    thumbnail.classList.add('active');
                });
                thumbnailContainer.appendChild(thumbnail);
            });
        }
    }

    // --- Cargar Información del Producto ---
    if (productInfoContainer) {
        productInfoContainer.innerHTML = `
            <h1 class="product-title">${data.nombre}</h1>
            <p class="product-description">${data.descripción || 'No hay descripción disponible.'}</p>
            
            <div class="product-details-group">
                <span><strong>Categoría:</strong> ${data.categoria}</span>
                <span><strong>Tipo:</strong> ${data.type || 'N/A'}</span>
                <span><strong>Género:</strong> ${data.genero || 'N/A'}</span>
                <span><strong>Engaste:</strong> ${data.engaste || 'N/A'}</span>
            </div>
            
            <div class="product-actions">
                <button class="cta-button add-to-cart-btn">Pedir</button>
                </button>
            </div>
            `;
    }
cargarRecomendados(data);
document.addEventListener('DOMContentLoaded', cargarDetalleProducto);
}
async function cargarRecomendados(productoActual) {
    const listaTarjetasContainer = document.querySelector('.lista-tarjetas');
    if (!listaTarjetasContainer) return;

    // 1. Obtener productos de la misma categoría (excluyendo el actual)
    const { data, error } = await supabase
        .from('productos')
        .select('id, nombre, img_url') // Seleccionamos solo los campos necesarios para la tarjeta
        .eq('categoria', productoActual.categoria) // Filtra por la misma categoría
        .neq('id', productoActual.id)           // Excluye el producto que se está viendo
        .limit(4);                             // Limita a 4 recomendaciones (o el número que prefieras)

    if (error) {
        console.error('Error al cargar recomendados:', error);
        listaTarjetasContainer.innerHTML = '<p>No se pudieron cargar las recomendaciones.</p>';
        return;
    }

    if (!data || data.length === 0) {
        // Ocultar la sección si no hay recomendaciones
        const hubSection = document.querySelector('.productos-recomendados-hub');
        if (hubSection) hubSection.style.display = 'none';
        return;
    }

    // 2. Generar el HTML de las tarjetas
    listaTarjetasContainer.innerHTML = ''; // Limpiar el contenido de ejemplo del HTML

    data.forEach(producto => {
        const tarjetaHTML = `
            <a href="/detalle-producto.html?id=${producto.id}" class="tarjeta-producto" onclick="window.location.reload()">
                <div class="imagen-cuadrada">
                    <img src="${producto.img_url}" alt="${producto.nombre}">
                </div>
                <div class="info-producto">
                    <p class="titulo-producto">${producto.nombre}</p>
                    <button class="boton-ver-mas">Ver Artículo</button>
                </div>
            </a>
        `;
        listaTarjetasContainer.insertAdjacentHTML('beforeend', tarjetaHTML);
    });
}

document.addEventListener('DOMContentLoaded', cargarDetalleProducto);