import { createClient } from 'https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2/+esm';

// --- CONFIGURACIÓN ---
const SUPABASE_URL = 'https://xdblvjdkfnlrcmymujfz.supabase.co';
const SUPABASE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InhkYmx2amRrZm5scmNteW11amZ6Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjI0NjM5MDMsImV4cCI6MjA3ODAzOTkwM30.nWmdzB2Nm_fzhGDDeky5ho-EwbP-goxqMj-vuxLLvYg';
export const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

// --- ESTADO GLOBAL ---
export let filtrosGlobales = {
    type: null,      // Filtro MAESTRO (Anillo o Dije)
    genero: null,    // Independiente
    engaste: null,   // Independiente
    categoria: null, // Independiente
    search_term: null
};

// --- INICIALIZACIÓN ---
async function iniciarApp() {
    console.log("Iniciando aplicación...");

    // 1. Leer URL para el Filtro Maestro (TIPO)
    const params = new URLSearchParams(window.location.search);
    let tipoUrl = params.get('type');

    if (tipoUrl) {
        tipoUrl = decodeURIComponent(tipoUrl);
        // Normalizar (Primera mayúscula)
        filtrosGlobales.type = tipoUrl.charAt(0).toUpperCase() + tipoUrl.slice(1).toLowerCase();
    }

    // 2. Cargar opciones y productos
    await cargarFiltrosLaterales(); // Carga las opciones disponibles
    await cargarProductos();        // Carga la grilla
    actualizarBreadcrumb();         // Actualiza migas de pan
}

document.addEventListener('DOMContentLoaded', () => {
    // Selección de elementos
    const menuToggle = document.getElementById('menu-toggle-btn');
    const closeBtn = document.getElementById('close-menu-btn');
    const navLinks = document.getElementById('nav-links-menu');
    const overlay = document.getElementById('overlay');

    // Función para abrir menú
    function openMenu() {
        navLinks.classList.add('active');
        overlay.classList.add('active');
        document.body.style.overflow = 'hidden'; // Bloquea el scroll de la página
    }

    // Función para cerrar menú
    function closeMenu() {
        navLinks.classList.remove('active');
        overlay.classList.remove('active');
        document.body.style.overflow = ''; // Reactiva el scroll
    }

    // Eventos
    if (menuToggle) menuToggle.addEventListener('click', openMenu);
    if (closeBtn) closeBtn.addEventListener('click', closeMenu);
    if (overlay) overlay.addEventListener('click', closeMenu); // Cerrar al tocar afuera

    // Opcional: Cerrar menú al hacer click en un enlace (útil para navegación interna)
    const links = document.querySelectorAll('.nav-links a');
    links.forEach(link => {
        link.addEventListener('click', closeMenu);
    });
});

document.addEventListener('DOMContentLoaded', () => {
    // ... (Tu código anterior para abrir/cerrar el menú general) ...

    // --- NUEVA LÓGICA ACORDEÓN MÓVIL ---
    const accordionHeader = document.querySelector('.accordion-header');
    const dropdownMobile = document.querySelector('.dropdown-mobile');

    if (accordionHeader && dropdownMobile) {
        accordionHeader.addEventListener('click', (e) => {
            // Prevenimos navegación si fuera un enlace
            e.preventDefault();
            
            // Alternamos la clase 'open'
            dropdownMobile.classList.toggle('open');
        });
    }
});


// --- GESTIÓN DE PANELES (FILTROS LATERALES) ---
async function cargarFiltrosLaterales() {
    // Cargamos todos los paneles al mismo tiempo
    // IMPORTANTE: Las opciones dependen SOLAMENTE del 'type' seleccionado.
    // Esto asegura que si estoy en "Anillos", solo vea géneros de anillos, etc.
    
    await cargarOpcionesPanel('type', false); // El panel de Tipo
    await cargarOpcionesPanel('genero', true); // Depende de Tipo
    await cargarOpcionesPanel('engaste', true); // Depende de Tipo
    await cargarOpcionesPanel('categoria', true); // Depende de Tipo
}

async function cargarOpcionesPanel(columna, dependeDeTipo) {
    let query = supabase.from('productos').select(columna);

    // Si dependeDeTipo es true, filtramos las opciones para mostrar solo las que pertenecen a Anillos o Dijes
    if (dependeDeTipo && filtrosGlobales.type) {
        query = query.eq('type', filtrosGlobales.type);
    }

    const { data, error } = await query;
    if (error) { console.error(`Error en ${columna}:`, error); return; }

    // Valores únicos
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

// --- LÓGICA DE SELECCIÓN (SIN CASCADA DE BORRADO) ---
// --- LÓGICA DE SELECCIÓN (CON TOGGLE / DESELECCIÓN) ---
export async function seleccionarFiltro(columna, valor) {
    
    // 1. DETERMINAR EL NUEVO VALOR (TOGGLE)
    // Si lo que clickeé ya estaba seleccionado, el nuevo valor es NULL (quitar filtro).
    // Si no estaba seleccionado, el nuevo valor es el que clickeé.
    const esElMismoValor = filtrosGlobales[columna] === valor;
    const nuevoValor = esElMismoValor ? null : valor;

    // 2. ASIGNAR VALOR
    filtrosGlobales[columna] = nuevoValor;

    // 3. MANEJO ESPECIAL PARA 'TYPE' (El filtro maestro)
    if (columna === 'type') {
        // Al cambiar el Tipo (o quitarlo), reiniciamos los sub-filtros
        // para evitar combinaciones imposibles (ej: Anillo + Dije)
        filtrosGlobales.genero = null;
        filtrosGlobales.engaste = null;
        filtrosGlobales.categoria = null;
        
        // Actualizar URL
        const newUrl = new URL(window.location);
        if (nuevoValor) {
            newUrl.searchParams.set('type', nuevoValor);
        } else {
            newUrl.searchParams.delete('type'); // Si deseleccionamos, limpiamos la URL
        }
        window.history.pushState({}, '', newUrl);
        
        // Recargar las opciones laterales (porque dependen del tipo)
        await cargarFiltrosLaterales(); 
    }

    // 4. ACTUALIZAR VISUALMENTE (CLASES ACTIVE)
    actualizarClasesActivas(columna);
    
    // Si cambiamos 'type', también debemos refrescar visualmente los hijos que se borraron
    if (columna === 'type') {
        actualizarClasesActivas('genero');
        actualizarClasesActivas('engaste');
        actualizarClasesActivas('categoria');
    }

    // 5. RECARGAR PRODUCTOS Y BREADCRUMB
    await cargarProductos();
    actualizarBreadcrumb();
}


function actualizarClasesActivas(columna) {
    const container = document.getElementById(`filtro-${columna}-desktop`);
    if(!container) return;
    
    // 1. Quitar 'active' de todos los items de esta columna
    const items = container.querySelectorAll('.filter-item');
    items.forEach(item => item.classList.remove('active'));

    // 2. Buscar el valor actual seleccionado en los filtros globales
    const valorSeleccionado = filtrosGlobales[columna];

    // 3. Si existe un valor, buscar su elemento HTML y ponerle 'active'
    if (valorSeleccionado) {
        // Buscamos por el atributo data-valor que añadimos al crear la lista
        const itemActivo = Array.from(items).find(li => li.dataset.valor === valorSeleccionado);
        if (itemActivo) {
            itemActivo.classList.add('active');
        }
    }
}

// --- CARGA DE PRODUCTOS ---
export async function cargarProductos() {
    let query = supabase.from('productos').select('*');

    // Aplicar filtros acumulativos (AND logic)
    if (filtrosGlobales.type) query = query.eq('type', filtrosGlobales.type); // Usar eq o ilike segun tu BD
    if (filtrosGlobales.engaste) query = query.eq('engaste', filtrosGlobales.engaste);
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
                    <p class="card-description">${prod.type} | ${prod.categoria}</p>
                </div>

                <div class="card-footer">
                    <a href="detalle-producto.html?id=${prod.id}" class="arrow-btn" aria-label="Ver detalles"> Mas info
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

    container.innerHTML = ''; // Limpiamos para reconstruir

    // 1. INICIO (Home Icon)
    const liHome = document.createElement('li');
    liHome.className = 'breadcrumb-item';
    liHome.innerHTML = `
        <a href="/" aria-label="Inicio">
            <svg class="homeicon" viewBox="0 0 24 24" width="16" height="16" xmlns="https://www.w3.org/2000/svg" fill="currentColor">
                <path d="M10 20v-6h4v6h5v-8h3L12 3 2 12h3v8z"/>
            </svg>
        </a>`;
    container.appendChild(liHome);

    // 2. CATÁLOGO (Raíz)
    const liCat = document.createElement('li');
    liCat.className = 'breadcrumb-item';
    
    // Si no hay filtros, es texto plano (active). Si hay filtros, es enlace para limpiar.
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
            limpiarFiltrosGlobal(); // Tu función existente para borrar todo
        };
        liCat.appendChild(aCat);
    }
    container.appendChild(liCat);

    // 3. NIVELES JERÁRQUICOS
    // Definimos el orden estricto de aparición
    const orden = ['type', 'genero', 'engaste', 'categoria'];
    
    // Iteramos para construir el camino
    orden.forEach((columna, index) => {
        const valor = filtrosGlobales[columna];

        if (valor) {
            const li = document.createElement('li');
            li.className = 'breadcrumb-item';

            // Verificamos si es el último elemento seleccionado
            // (Para saber si ponerlo como texto 'active' o como enlace)
            const esElUltimo = orden.slice(index + 1).every(key => filtrosGlobales[key] === null);

            if (esElUltimo) {
                li.classList.add('active');
                li.textContent = valor;
            } else {
                // Si hay niveles superiores, este debe ser un enlace para "volver" a este nivel
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
    const orden = ['type', 'genero', 'engaste', 'categoria'];
    const indiceLimite = orden.indexOf(columnaLimite);

    // Borramos todo lo que esté DESPUÉS de la columna clickeada
    for (let i = indiceLimite + 1; i < orden.length; i++) {
        const colAborrar = orden[i];
        filtrosGlobales[colAborrar] = null;
        
        // Actualizamos visualmente el sidebar (quitar clase active)
        actualizarClasesActivas(colAborrar); 
    }

    // Recargamos todo
    await cargarProductos();
    actualizarBreadcrumb(); // Se redibuja a sí mismo
}

// --- UTILS ---
export function limpiarFiltros() {
    // Mantenemos el TYPE, limpiamos el resto
    const currentType = filtrosGlobales.type;
    
    filtrosGlobales.genero = null;
    filtrosGlobales.engaste = null;
    filtrosGlobales.categoria = null;
    
    // Refrescamos UI
    ['genero', 'engaste', 'categoria'].forEach(col => actualizarClasesActivas(col));
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