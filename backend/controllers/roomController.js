import express from 'express';
import { loadData, saveData } from '../utils/fileManager.js';
import { v4 as uuid } from 'uuid';

const router = express.Router();

// Crear sala
router.post('/create', async (req, res) => {
  const rooms = await loadData('rooms.json');

  const newRoom = {
    id: uuid(),
    createdAt: new Date(),
    numbersDrawn: []
  };

  rooms.push(newRoom);
  await saveData('rooms.json', rooms);

  res.json(newRoom);
});

// Obtener salas
router.get('/', async (req, res) => {
  const rooms = await loadData('rooms.json');
  res.json(rooms);
});

export default router;
