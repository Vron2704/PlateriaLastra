import { createClient } from 'https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2/+esm';

// --- CONFIGURACIÓN ---
const SUPABASE_URL = 'https://xdblvjdkfnlrcmymujfz.supabase.co';
const SUPABASE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InhkYmx2amRrZm5scmNteW11amZ6Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjI0NjM5MDMsImV4cCI6MjA3ODAzOTkwM30.nWmdzB2Nm_fzhGDDeky5ho-EwbP-goxqMj-vuxLLvYg';
export const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

// --- ESTADO GLOBAL ---
export let filtrosGlobales = {
    tipo_articulo: null, // Filtro MAESTRO (Reemplaza a 'type')
    genero: null,        // Independiente
    categoria: null,     // Independiente
    search_term: null
    // Nota: 'engaste' fue eliminado porque no existe en la tabla articulos
};

// --- INICIALIZACIÓN ---
async function iniciarApp() {
    console.log("Iniciando aplicación...");

    // 1. Leer URL para el Filtro Maestro (tipo_articulo)
    const params = new URLSearchParams(window.location.search);
    let tipoUrl = params.get('tipo_articulo');

    if (tipoUrl) {
        tipoUrl = decodeURIComponent(tipoUrl);
        // Normalizar (Primera mayúscula)
        filtrosGlobales.tipo_articulo = tipoUrl.charAt(0).toUpperCase() + tipoUrl.slice(1).toLowerCase();
    }

    // 2. Cargar opciones y productos
    await cargarFiltrosLaterales();
    await cargarProductos();
    actualizarBreadcrumb();
}

document.addEventListener('DOMContentLoaded', () => {
    // Selección de elementos
    const menuToggle = document.getElementById('menu-toggle-btn');
    const closeBtn = document.getElementById('close-menu-btn');
    const navLinks = document.getElementById('nav-links-menu');
    const overlay = document.getElementById('overlay');

    function openMenu() {
        navLinks.classList.add('active');
        overlay.classList.add('active');
        document.body.style.overflow = 'hidden';
    }

    function closeMenu() {
        navLinks.classList.remove('active');
        overlay.classList.remove('active');
        document.body.style.overflow = '';
    }

    if (menuToggle) menuToggle.addEventListener('click', openMenu);
    if (closeBtn) closeBtn.addEventListener('click', closeMenu);
    if (overlay) overlay.addEventListener('click', closeMenu);

    const links = document.querySelectorAll('.nav-links a');
    links.forEach(link => {
        link.addEventListener('click', closeMenu);
    });
});

document.addEventListener('DOMContentLoaded', () => {
    // --- LÓGICA ACORDEÓN MÓVIL ---
    const accordionHeader = document.querySelector('.accordion-header');
    const dropdownMobile = document.querySelector('.dropdown-mobile');

    if (accordionHeader && dropdownMobile) {
        accordionHeader.addEventListener('click', (e) => {
            e.preventDefault();
            dropdownMobile.classList.toggle('open');
        });
    }
});


// --- GESTIÓN DE PANELES (FILTROS LATERALES) ---
async function cargarFiltrosLaterales() {
    await cargarOpcionesPanel('tipo_articulo', false);
    await cargarOpcionesPanel('genero', true);
    await cargarOpcionesPanel('categoria', true);
}

async function cargarOpcionesPanel(columna, dependeDeTipo) {
    let query = supabase.from('articulos').select(columna);

    if (dependeDeTipo && filtrosGlobales.tipo_articulo) {
        query = query.eq('tipo_articulo', filtrosGlobales.tipo_articulo);
    }

    const { data, error } = await query;
    if (error) {
        console.error(`Error en ${columna}:`, error);
        return;
    }

    const valoresRaw = data.map(item => item[columna]).filter(Boolean);
    const valoresUnicos = [...new Set(valoresRaw)];

    renderizarPanel(columna, valoresUnicos);
}

function renderizarPanel(columna, valores) {
    const container = document.getElementById(`filtro-${columna}-desktop`);
    if (!container) return;

    container.innerHTML = '';

    valores.forEach(valor => {
        const li = document.createElement('li');
        const isActive = filtrosGlobales[columna] === valor;

        li.className = `filter-item ${isActive ? 'active' : ''}`;
        li.textContent = valor;
        li.dataset.valor = valor;

        li.addEventListener('click', () => {
            seleccionarFiltro(columna, valor);
        });

        container.appendChild(li);
    });
}

// --- LÓGICA DE SELECCIÓN ---
export async function seleccionarFiltro(columna, valor) {

    const esElMismoValor = filtrosGlobales[columna] === valor;
    const nuevoValor = esElMismoValor ? null : valor;

    filtrosGlobales[columna] = nuevoValor;

    if (columna === 'tipo_articulo') {
        filtrosGlobales.genero = null;
        filtrosGlobales.categoria = null;

        const newUrl = new URL(window.location);
        if (nuevoValor) {
            newUrl.searchParams.set('tipo_articulo', nuevoValor);
        } else {
            newUrl.searchParams.delete('tipo_articulo');
        }
        window.history.pushState({}, '', newUrl);

        await cargarFiltrosLaterales();
    }

    actualizarClasesActivas(columna);

    if (columna === 'tipo_articulo') {
        actualizarClasesActivas('genero');
        actualizarClasesActivas('categoria');
    }

    await cargarProductos();
    actualizarBreadcrumb();
}

function actualizarClasesActivas(columna) {
    const container = document.getElementById(`filtro-${columna}-desktop`);
    if(!container) return;

    const items = container.querySelectorAll('.filter-item');
    items.forEach(item => item.classList.remove('active'));

    const valorSeleccionado = filtrosGlobales[columna];

    if (valorSeleccionado) {
        const itemActivo = Array.from(items).find(li => li.dataset.valor === valorSeleccionado);
        if (itemActivo) {
            itemActivo.classList.add('active');
        }
    }
}

// --- CARGA DE PRODUCTOS ---
export async function cargarProductos() {
    let query = supabase.from('articulos').select('*');

    if (filtrosGlobales.tipo_articulo) query = query.eq('tipo_articulo', filtrosGlobales.tipo_articulo);
    if (filtrosGlobales.genero) query = query.eq('genero', filtrosGlobales.genero);
    if (filtrosGlobales.categoria) query = query.eq('categoria', filtrosGlobales.categoria);

    if (filtrosGlobales.search_term) {
        query = query.ilike('nombre', `%${filtrosGlobales.search_term}%`);
    }

    const { data, error } = await query;
    if (error) { console.error('Error grid:', error); return; }

    renderizarGrid(data);
}

function renderizarGrid(data) {
    const container = document.getElementById('catalogo-container');
    const noMsg = document.getElementById('no-results-message');
    if (!container) return;

    container.innerHTML = '';

    if (!data || data.length === 0) {
        if(noMsg) noMsg.style.display = 'block';
    } else {
        if(noMsg) noMsg.style.display = 'none';
        data.forEach(prod => {
            const html = `
            <div class="product-card">
                <div class="card-image-container">
                    <img src="${prod.img_url || 'https://via.placeholder.com/300'}" loading="lazy" alt="${prod.nombre}">
                </div>
                
                <div class="card-info">
                    <h4 class="card-title">${prod.nombre}</h4>
                    <p class="card-description">S/ ${prod.precio ? prod.precio.toFixed(2) : '0.00'} | Stock: ${prod.stock}</p>
                    <small style="color: #666;">${prod.tipo_articulo || ''} ${prod.categoria ? '- ' + prod.categoria : ''}</small>
                </div>

                <div class="card-footer">
                    <a href="detalle-producto.html?id=${prod.id_articulo}" class="arrow-btn" aria-label="Ver detalles"> Mas info
                        <svg xmlns="https://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                            <line x1="5" y1="12" x2="19" y2="12"></line>
                            <polyline points="12 5 19 12 12 19"></polyline>
                        </svg>
                    </a>
                </div>
            </div>`;
            container.innerHTML += html;
        });
    }
}

// --- BREADCRUMB ---
function actualizarBreadcrumb() {
    const container = document.getElementById('breadcrumb-nav');
    if (!container) return;

    container.innerHTML = '';

    const liHome = document.createElement('li');
    liHome.className = 'breadcrumb-item';
    liHome.innerHTML = `
        <a href="/" aria-label="Inicio">
            <svg class="homeicon" viewBox="0 0 24 24" width="16" height="16" xmlns="https://www.w3.org/2000/svg" fill="currentColor">
                <path d="M10 20v-6h4v6h5v-8h3L12 3 2 12h3v8z"/>
            </svg>
        </a>`;
    container.appendChild(liHome);

    const liCat = document.createElement('li');
    liCat.className = 'breadcrumb-item';

    const hayFiltros = Object.values(filtrosGlobales).some(v => v !== null);

    if (!hayFiltros) {
        liCat.classList.add('active');
        liCat.textContent = 'Catálogo';
    } else {
        const aCat = document.createElement('a');
        aCat.href = '#';
        aCat.textContent = 'Catálogo';
        aCat.onclick = (e) => {
            e.preventDefault();
            limpiarFiltrosGlobal();
        };
        liCat.appendChild(aCat);
    }
    container.appendChild(liCat);

    const orden = ['tipo_articulo', 'genero', 'categoria'];

    orden.forEach((columna, index) => {
        const valor = filtrosGlobales[columna];

        if (valor) {
            const li = document.createElement('li');
            li.className = 'breadcrumb-item';

            const esElUltimo = orden.slice(index + 1).every(key => filtrosGlobales[key] === null);

            if (esElUltimo) {
                li.classList.add('active');
                li.textContent = valor;
            } else {
                const a = document.createElement('a');
                a.href = '#';
                a.textContent = valor;
                a.onclick = (e) => {
                    e.preventDefault();
                    retrocederFiltroHasta(columna);
                };
                li.appendChild(a);
            }
            container.appendChild(li);
        }
    });
}

// --- NAVEGACIÓN EN BREADCRUMB ---
async function retrocederFiltroHasta(columnaLimite) {
    const orden = ['tipo_articulo', 'genero', 'categoria'];
    const indiceLimite = orden.indexOf(columnaLimite);

    for (let i = indiceLimite + 1; i < orden.length; i++) {
        const colAborrar = orden[i];
        filtrosGlobales[colAborrar] = null;
        actualizarClasesActivas(colAborrar);
    }

    await cargarProductos();
    actualizarBreadcrumb();
}

// --- UTILS ---
export function limpiarFiltros() {
    filtrosGlobales.genero = null;
    filtrosGlobales.categoria = null;

    ['genero', 'categoria'].forEach(col => actualizarClasesActivas(col));
    cargarProductos();
}
window.limpiarFiltrosGlobal = limpiarFiltros;
window.aplicarFiltroDesdeMenu = function(event, tipo) { /* Tu lógica existente */ };

// Ejecutar
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', iniciarApp);
} else {
    iniciarApp();
}