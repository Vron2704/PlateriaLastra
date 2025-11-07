import { createClient } from 'https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2/+esm';

// 2. TUS CLAVES (igual que antes)
// Reemplaza con tus propias claves de la Fase 1
const SUPABASE_URL = 'https://xdblvjdkfnlrcmymujfz.supabase.co';
const SUPABASE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InhkYmx2amRrZm5scmNteW11amZ6Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjI0NjM5MDMsImV4cCI6MjA3ODAzOTkwM30.nWmdzB2Nm_fzhGDDeky5ho-EwbP-goxqMj-vuxLLvYg';

// 3. CREAR EL CLIENTE
// Usamos la función 'createClient' que importamos
const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

// 4. FUNCIÓN PARA CARGAR PRODUCTOS (sin cambios)
async function cargarProductos() {
    console.log("Cargando productos..."); // Para depurar
    
    // Hacemos la consulta a la tabla 'productos'
    const { data, error } = await supabase
        .from('productos')
        .select('*'); // Selecciona todas las columnas

    if (error) {
        console.error('Error al cargar productos:', error);
        return; // Detener la función si hay un error
    }

    // Si todo va bien, 'data' es un array de tus productos
    console.log("Productos cargados:", data);
    
        const container = document.getElementById('catalogo-container');
    container.innerHTML = ''; // Limpiar el contenedor por si acaso

    // Recorrer los datos y crear el HTML para cada producto
    data.forEach(producto => {
        // Usamos plantillas literales (template literals) para crear el HTML
        const tarjetaProducto = `
            <div class="product-card" type="${producto.type}">
                <img src="${producto.img_url}" alt="Imagen de ${producto.nombre}">
                <h3>${producto.nombre}</h3>
                <p>${producto.descripcion || 'Sin descripción.'}</p>
                <button class="cta-button">Más información</button>
                </div>
        `;
        // Añadir la tarjeta al contenedor
        container.innerHTML += tarjetaProducto;
    });
}

// 5. LLAMAR A LA FUNCIÓN (sin cambios)
// Nos aseguramos de que el DOM esté cargado antes de ejecutar la función
document.addEventListener('DOMContentLoaded', cargarProductos);