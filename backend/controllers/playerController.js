import express from 'express';
import { loadData, saveData } from '../utils/fileManager.js';
import { generateBingoCard } from '../utils/bingoGenerator.js';
import { v4 as uuid } from 'uuid';

const router = express.Router();

// Registrar jugador
router.post('/register', async (req, res) => {
  const { name, roomId } = req.body;

  const players = await loadData('players.json');

  const newPlayer = {
    id: uuid(),
    name,
    roomId,
    card: generateBingoCard()
  };

  players.push(newPlayer);
  await saveData('players.json', players);

  res.json(newPlayer);
});

// Obtener jugadores por sala
router.get('/:roomId', async (req, res) => {
  const players = await loadData('players.json');
  const roomPlayers = players.filter(p => p.roomId === req.params.roomId);
  res.json(roomPlayers);
});

export default router;
