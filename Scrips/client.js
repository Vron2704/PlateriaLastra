// /Scrips/client.js

import { createClient } from 'https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2/+esm';

const SUPABASE_URL = 'https://xdblvjdkfnlrcmymujfz.supabase.co';
const SUPABASE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InhkYmx2amRrZm5scmNteW11amZ6Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjI0NjM5MDMsImV4cCI6MjA3ODAzOTkwM30.nWmdzB2Nm_fzhGDDeky5ho-EwbP-goxqMj-vuxLLvYg';
const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

// 1. DEFINE Y EXPORTA la variable de filtros global
export let filtrosGlobales = {};

/**
 * EXPORTA: Carga productos desde Supabase
 */
export async function cargarProductos() {
    console.log("Cargando productos con filtros:", filtrosGlobales);
    let query = supabase.from('productos').select('*');

    // Filtros de Checkbox (solo 'categoria')
    if (filtrosGlobales.categoria && filtrosGlobales.categoria.length > 0) {
        query = query.in('categoria', filtrosGlobales.categoria);
    }
    
    // Filtros Jerárquicos
    if (filtrosGlobales.type) {
        query = query.eq('type', filtrosGlobales.type);
    }
    if (filtrosGlobales.genero) {
        query = query.eq('genero', filtrosGlobales.genero);
    }
    if (filtrosGlobales.engaste) {
        query = query.eq('engaste', filtrosGlobales.engaste);
    }

    // Filtro de Búsqueda
    if (filtrosGlobales.search_term) {
        query = query.ilike('nombre', `%${filtrosGlobales.search_term}%`);
    }
    
    const { data, error } = await query;
    if (error) {
        console.error('Error al cargar productos:', error);
        return;
    }
    
    // Pinta los productos en el HTML
    const container = document.getElementById('catalogo-container');
    const noResultsMsg = document.getElementById('no-results-message');
    if (!container) return;
    
    container.innerHTML = ''; 

    if (data.length === 0) {
        if (noResultsMsg) noResultsMsg.style.display = 'block';
    } else {
        if (noResultsMsg) noResultsMsg.style.display = 'none';
        data.forEach(producto => {
            const tarjetaProducto = `
            <a href="detalle-producto.html?id=${producto.id}" class="product-card-link">
                <div class="product-card" type="${producto.type}">
                    <img src="${producto.img_url || 'https://via.placeholder.com/300?text=Sin+Imagen'}" alt="Imagen de ${producto.nombre}">
                    <h3>${producto.nombre}</h3>
                    <p>${producto.descripción || 'Sin descripción.'}</p>
                    <p>${producto.categoria}</p>
                    <button class="cta-button">Más información</button>
                </div>
            </a>
            `;
            container.innerHTML += tarjetaProducto;
        });
    }
}

/**
 * EXPORTA: Carga las opciones para un panel de filtro (DINÁMICO)
 */
export async function cargarOpcionesPanel(columna, panelId) {
    const listaContainer = document.getElementById(panelId);
    if (!listaContainer) {
        console.error(`Error: No se encontró el contenedor de lista con ID: ${panelId}`);
        return;
    }
    listaContainer.innerHTML = '<li>Cargando...</li>';

    let query = supabase.from('productos').select(columna, { distinct: true });

    // === LÓGICA DE FILTRO DEPENDIENTE CORREGIDA ===
    // Encadenamos los filtros anteriores para reducir las opciones
    if (filtrosGlobales.type) {
        query = query.eq('type', filtrosGlobales.type);
    }
    if (filtrosGlobales.genero) {
        query = query.eq('genero', filtrosGlobales.genero);
    }
    if (filtrosGlobales.engaste) {
        query = query.eq('engaste', filtrosGlobales.engaste);
    }
    // =================================================

    const { data, error } = await query;
    if (error) {
        console.error(`Error cargando ${columna}:`, error);
        listaContainer.innerHTML = '<li>Error al cargar</li>';
        return;
    }

    listaContainer.innerHTML = ''; 
    const valoresUnicos = data.map(item => item[columna]).filter(Boolean);

    if (columna === 'categoria') {
        // El último panel (Categoría) usa checkboxes
        valoresUnicos.forEach(valor => {
            const listItem = document.createElement('li');
            listItem.className = 'checkbox-item';
            // 🐛 Solución 3: El listener ahora se añade en main.js
            listItem.innerHTML = `
                <input type="checkbox" id="filter-cat-${valor}" class="filter-checkbox" value="${valor}">
                <label for="filter-cat-${valor}">${valor}</label>
            `;
            listaContainer.appendChild(listItem);
        });
    } else {
        // Los otros paneles (Tipo, Género, Engaste) usan enlaces
        valoresUnicos.forEach(valor => {
            const listItem = document.createElement('li');
            listItem.className = 'nav-link';
            listItem.dataset.valor = valor;
            listItem.dataset.columna = columna;
            listItem.textContent = valor;
            listaContainer.appendChild(listItem);
        });
    }
}

/**
 * EXPORTA: Recolecta filtros y llama a cargarProductos
 */
export function aplicarFiltros() {
    // 1. Recolectar búsqueda
    const searchInput = document.querySelector('.search-input');
    if (searchInput && searchInput.value.trim() !== '') {
        filtrosGlobales.search_term = searchInput.value.trim();
    } else {
        delete filtrosGlobales.search_term;
    }

    // 2. Recolectar checkboxes (solo del panel 'categoria')
    const checkboxesMarcados = document.querySelectorAll('#lista-categoria .filter-checkbox:checked');
    filtrosGlobales.categoria = Array.from(checkboxesMarcados).map(cb => cb.value);

    // 3. Cargar productos
    cargarProductos();
}

/**
 * EXPORTA: Limpia todos los filtros y recarga
 */
export function limpiarFiltros() {
    filtrosGlobales = {}; // Resetea el objeto
    aplicarFiltros(); // Recarga productos
}