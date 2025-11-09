import { createClient } from 'https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2/+esm';

// 2. TUS CLAVES (igual que antes)
// Reemplaza con tus propias claves de la Fase 1
const SUPABASE_URL = 'https://xdblvjdkfnlrcmymujfz.supabase.co';
const SUPABASE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InhkYmx2amRrZm5scmNteW11amZ6Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjI0NjM5MDMsImV4cCI6MjA3ODAzOTkwM30.nWmdzB2Nm_fzhGDDeky5ho-EwbP-goxqMj-vuxLLvYg';

// 3. CREAR EL CLIENTE
// Usamos la función 'createClient' que importamos
const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

// 4. FUNCIÓN PARA CARGAR PRODUCTOS (sin cambios)
async function cargarProductos(filtros = {}) {
    console.log("Cargando productos con filtros:", filtros);

    // Empezamos la consulta base
    let query = supabase.from('productos').select('*');

    // === LÓGICA DE FILTRADO (AND) ===
    // Recorremos cada grupo de filtros (ej. 'genero', 'tipo_producto')
    for (const columna in filtros) {
        const valores = filtros[columna]; // ej. ['masculino', 'unisex']

        // Si hay valores seleccionados para ese grupo...
        if (valores && valores.length > 0) {
            // Usamos .in() para lógica OR dentro del grupo
            // ej. WHERE genero IN ('masculino', 'unisex')
            query = query.in(columna, valores);
        }
    }

    // Ejecutamos la consulta final
    const { data, error } = await query;

    if (error) {
        console.error('Error al cargar productos:', error);
        return;
    }
    
    // (Aquí va tu código para "pintar" los productos en el HTML)
    const container = document.getElementById('catalogo-container'); // O tu ID
    container.innerHTML = ''; // Limpiar
    data.forEach(producto => {
        // Usamos plantillas literales (template literals) para crear el HTML
        const tarjetaProducto = `
            <div class="product-card" type="${producto.type}">
                <img src="${producto.img_url}" alt="Imagen de ${producto.nombre}">
                <h3>${producto.nombre}</h3>
                <p>${producto.descripción || 'Sin descripción.'}</p>
                <p>${producto.categoria}</p>
                <button class="cta-button">Más información</button>
                </div>
        `;
        // Añadir la tarjeta al contenedor
        container.innerHTML += tarjetaProducto;
    });
}

// 5. LLAMAR A LA FUNCIÓN (sin cambios)
// Nos aseguramos de que el DOM esté cargado antes de ejecutar la función
function aplicarFiltros() {
    
    const filtrosSeleccionados = {};

    // 1. Busca TODOS los checkboxes que estén MARCADOS
    const checkboxesMarcados = document.querySelectorAll('.filter-checkbox:checked');

    // 2. Agrupa los valores por su 'data-group'
    checkboxesMarcados.forEach(checkbox => {
        const grupo = checkbox.dataset.group; // ej. 'genero'
        const valor = checkbox.value;         // ej. 'masculino'

        if (!filtrosSeleccionados[grupo]) {
            filtrosSeleccionados[grupo] = []; // Crea el array si no existe
        }
        
        filtrosSeleccionados[grupo].push(valor); // Añade el valor
    });

    // 3. Llama a cargarProductos con el objeto de filtros
    // filtrosSeleccionados se verá así:
    // {
    //   tipo_producto: ['anillo'],
    //   genero: ['masculino', 'unisex']
    // }
    cargarProductos(filtrosSeleccionados);
}
async function cargarFiltrosCategoria() {
    
    // 1. Llama a la "Vista" que creamos en Supabase
    // (pide la columna 'categoria' de la vista 'categorias_unicas')
    const { data, error } = await supabase
        .from('categorias_unicas') // El nombre de la Vista
        .select('categoria');      // La columna que queremos

    if (error) {
        console.error('Error al cargar filtros de categoría:', error);
        return;
    }

    // 2. Selecciona el contenedor <ul> que dejamos en el HTML
    const listaContainer = document.getElementById('lista-categorias-filtro');
    
    // 3. Genera el HTML para cada categoría
    data.forEach(item => {
        
        const listItem = document.createElement('li');
        listItem.innerHTML = `
            <input data-group ="categoria"
                type="checkbox" 
                id="filter-${item.categoria}" 
                class="filter-checkbox" 
                value="${item.categoria}"
            >
            <label for="filter-${item.categoria}">${item.categoria}</label>
        `;
        
        // 4. Añade el <li> al <ul>
        listaContainer.appendChild(listItem);
    });
}
document.addEventListener('DOMContentLoaded', () => {
    // --- 1. SELECCIÓN DE ELEMENTOS ---
    
    // Elementos del Menú de Navegación
    const menuBtn = document.getElementById('menu-toggle-btn');
    const navMenu = document.getElementById('nav-links-menu');
    const closeMenuBtn = document.getElementById('close-menu-btn');
    
    // Elementos del Menú de Filtros (NUEVO)
    const openFilterBtn = document.getElementById('open-filter-btn');
    const filterSidebar = document.getElementById('filter-sidebar');
    const applyFilterBtn = document.getElementById('filter-btn-apply');
    const clearFilterBtn = document.getElementById('filter-btn-clear');
    
    // Elemento Overlay (Compartido)
    const overlay = document.getElementById('overlay');

    // --- 2. FUNCIONES DE ABRIR / CERRAR ---

    function openNavMenu() {
        if (navMenu) navMenu.classList.add('active');
        if (overlay) overlay.classList.add('active');
    }
    function closeNavMenu() {
        if (navMenu) navMenu.classList.remove('active');
        if (overlay) overlay.classList.remove('active');
    }

    function openFilterMenu() { // NUEVA
        if (filterSidebar) filterSidebar.classList.add('active');
        if (overlay) overlay.classList.add('active');
    }
    function closeFilterMenu() { // NUEVA
        if (filterSidebar) filterSidebar.classList.remove('active');
        if (overlay) overlay.classList.remove('active');
    }

    // --- 3. ESCUCHADORES DE EVENTOS (LISTENERS) ---

    // Cargas iniciales de la página de catálogo
    if (document.getElementById('catalogo-container')) {
        cargarProductos();
        cargarFiltrosCategoria();
    }
    
    // Listeners del Menú de Navegación
    if (menuBtn) menuBtn.addEventListener('click', openNavMenu);
    if (closeMenuBtn) closeMenuBtn.addEventListener('click', closeNavMenu);

    // Listeners del Menú de Filtros (NUEVO)
    if (openFilterBtn) {
        openFilterBtn.addEventListener('click', openFilterMenu);
    }
    
    if (applyFilterBtn) {
        applyFilterBtn.addEventListener('click', () => {
            aplicarFiltros(); // <-- Tu función existente
            closeFilterMenu();
        });
    }

    if (clearFilterBtn) {
        clearFilterBtn.addEventListener('click', () => {
            // Desmarca todos los checkboxes dentro del sidebar
            const checkboxes = filterSidebar.querySelectorAll('.filter-checkbox');
            checkboxes.forEach(cb => cb.checked = false);
            
            aplicarFiltros(); // Vuelve a cargar sin filtros
            closeFilterMenu();
        });
    }

    // Listener del Overlay (Cierra AMBOS paneles)
    if (overlay) {
        overlay.addEventListener('click', () => {
            closeNavMenu();
            closeFilterMenu();
        });
    }

    // 2. Añade UN solo escuchador de eventos al contenedo
});