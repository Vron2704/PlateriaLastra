// /Scrips/client.js

import { createClient } from 'https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2/+esm';

const SUPABASE_URL = 'https://xdblvjdkfnlrcmymujfz.supabase.co';
const SUPABASE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InhkYmx2amRrZm5scmNteW11amZ6Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjI0NjM5MDMsImV4cCI6MjA3ODAzOTkwM30.nWmdzB2Nm_fzhGDDeky5ho-EwbP-goxqMj-vuxLLvYg';
const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

/**
 * EXPORTA: Carga productos desde Supabase
 */
export async function cargarProductos(filtros = {}) {
    console.log("Cargando productos con filtros:", filtros);
    let query = supabase.from('productos').select('*');

    // Filtros de Checkbox
    for (const columna in filtros) {
        if (columna === 'search_term') continue;
        const valores = filtros[columna];
        if (valores && valores.length > 0) {
            query = query.in(columna, valores);
        }
    }

    // Filtro de Búsqueda
    if (filtros.search_term) {
        query = query.ilike('nombre', `%${filtros.search_term}%`);
    }

    const { data, error } = await query;
    if (error) {
        console.error('Error al cargar productos:', error);
        return;
    }
    
    // Pinta los productos en el HTML
    const container = document.getElementById('catalogo-container');
    const noResultsMsg = document.getElementById('no-results-message');
    if (!container) return; // Seguridad
    
    container.innerHTML = ''; 

    if (data.length === 0) {
        if (noResultsMsg) noResultsMsg.style.display = 'block';
    } else {
        if (noResultsMsg) noResultsMsg.style.display = 'none';
        data.forEach(producto => {
            const tarjetaProducto = `
             <a href="detalle-producto.html?id=${producto.id}" class="product-card-link">
                <div class="product-card" type="${producto.type}">
                    <img src="${producto.img_url}" alt="Imagen de ${producto.nombre}">
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
 * EXPORTA: Recolecta filtros y llama a cargarProductos
 */
export function aplicarFiltros() {
    const filtrosSeleccionados = {};

    // 1. Checkboxes
    const checkboxesMarcados = document.querySelectorAll('.filter-checkbox:checked');
    checkboxesMarcados.forEach(checkbox => {
        const grupo = checkbox.dataset.group; // Busca 'data-group'
        const valor = checkbox.value;
        if (grupo) { // Solo si 'data-group' existe
            if (!filtrosSeleccionados[grupo]) {
                filtrosSeleccionados[grupo] = [];
            }
            filtrosSeleccionados[grupo].push(valor);
        }
    });

    // 2. Búsqueda
    const searchInput = document.querySelector('.search-input');
    if (searchInput && searchInput.value.trim() !== '') {
        filtrosSeleccionados.search_term = searchInput.value.trim();
    }

    cargarProductos(filtrosSeleccionados);
}

/**
 * EXPORTA: Carga las categorías de filtro desde la DB
 */
export async function cargarFiltrosCategoria() {
    const { data, error } = await supabase.from('categorias_unicas').select('categoria');
    if (error) {
        console.error('Error al cargar filtros de categoría:', error);
        return;
    }

    const listaContainer = document.getElementById('lista-categorias-filtro');
    if (!listaContainer) return;
    
    data.forEach(item => {
        const listItem = document.createElement('li');
        listItem.innerHTML = `
            <input 
                data-group="categoria"  type="checkbox" 
                id="filter-cat-${item.categoria}" 
                class="filter-checkbox" 
                value="${item.categoria}"
            >
            <label for="filter-cat-${item.categoria}">${item.categoria}</label>
        `;
        listaContainer.appendChild(listItem);
    });
}