import express from 'express';
import cors from 'cors'; //middleware que sirve para que el frontend llame desde otro origen al backend

const app = express();

// Middlewares globales
app.use(cors());              // permite requests desde tu frontend (Vite). Por ahora acepta cualquier origen por defecto
app.use(express.json());      // parsea body JSON. Pone peticiones en lo pone en req.body


//-----------------------------
//AQUI ES DONDE IRÁN LA RUTAS 
app.get('/', (_req, res) => { //ruta ejemplo
  res.send('API funcionando');
});
app.get('/api/courses', (_req, res) => { //ruta ejemplo
  res.json([
    { id: 1, title: 'React Básico' },
    { id: 2, title: 'Node.js Avanzado' },
  ]);
});

//-------------------------------

// Puerto desde .env o por defecto
const PORT = process.env.PORT || 4000;

// Levanta servidor
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
