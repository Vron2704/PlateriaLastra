const express = require('express');
const path = require('path'); // Módulo nativo de Node.js
const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.static(__dirname)); 


app.use(express.json());

app.get('/', (req, res) => {
    // __dirname es el directorio actual del archivo server.js
    res.sendFile(path.join(__dirname, 'index.html')); 
});

// Iniciar el servidor
app.listen(PORT, () => {
    console.log(`Servidor escuchando en http://localhost:${PORT}`);
});