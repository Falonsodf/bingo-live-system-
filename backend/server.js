import express from 'express';
import cors from 'cors';
import roomController from './controllers/roomController.js';
import playerController from './controllers/playerController.js';

const app = express();
app.use(cors());
app.use(express.json());

// Rutas del bingo
app.use('/rooms', roomController);
app.use('/players', playerController);

const PORT = 4000;
app.listen(PORT, () => {
  console.log(`Servidor Bingo escuchando en http://localhost:${PORT}`);
});
