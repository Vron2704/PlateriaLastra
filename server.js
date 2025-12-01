const express = require('express');
const path = require('path'); // Módulo nativo de Node.js
const app = express();
const PORT = process.env.PORT || 3000;

// 🔑 CLAVE 1: Configurar Express para servir archivos estáticos (HTML, CSS, JS)
// Le dice a Express que todos los archivos en la raíz del proyecto (incluyendo index.html, styles.css, y Scripts/*)
// deben ser accesibles por el navegador.
app.use(express.static(__dirname)); 

// Middleware para procesar JSON (útil para peticiones API)
app.use(express.json());

// 🔑 CLAVE 2: Definir la ruta raíz ('/') para enviar el archivo index.html
// Usamos res.sendFile para enviar el archivo HTML completo.
app.get('/', (req, res) => {
    // __dirname es el directorio actual del archivo server.js
    res.sendFile(path.join(__dirname, 'index.html')); 
});

// Iniciar el servidor
app.listen(PORT, () => {
    console.log(`Servidor escuchando en http://localhost:${PORT}`);
});