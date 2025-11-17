// 1. Importar el framework Express
const express = require('express');

// 2. Crear una instancia de la aplicación
const app = express();

// 3. Definir el puerto del servidor
const PORT = process.env.PORT || 3000;
app.use(express.json());
app.get('/', (req, res) => {
    res.send('index.html');
});
app.listen(PORT, () => {
    console.log(`Servidor escuchando en http://localhost:${PORT}`);
});