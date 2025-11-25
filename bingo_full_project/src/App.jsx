
import React, { useEffect, useState, useRef } from "react";
import { initializeApp } from "firebase/app";
import {
  getDatabase,
  ref,
  push,
  set,
  onValue,
  update,
  get,
  child,
} from "firebase/database";
import { v4 as uuidv4 } from "uuid";
import jsPDF from "jspdf";
import html2canvas from "html2canvas";

// --- REEMPLAZAR con tu configuración de Firebase ---
const firebaseConfig = {
  apiKey: "REPLACE_ME",
  authDomain: "REPLACE_ME",
  databaseURL: "REPLACE_ME",
  projectId: "REPLACE_ME",
  storageBucket: "REPLACE_ME",
  messagingSenderId: "REPLACE_ME",
  appId: "REPLACE_ME",
};
const app = initializeApp(firebaseConfig);
const db = getDatabase(app);

function generateCard(variant = 75) {
  const size = 5;
  const nums = new Set();
  while (nums.size < size * size - 1) {
    const n = Math.floor(Math.random() * variant) + 1;
    nums.add(n);
  }
  const arr = Array.from(nums);
  arr.splice(12, 0, "FREE");
  return arr;
}

function checkBingo(card, drawn) {
  const grid = [];
  for (let r = 0; r < 5; r++) {
    grid.push(card.slice(r * 5, r * 5 + 5));
  }
  const hit = (val) => val === "FREE" || drawn.has(val);
  for (let r = 0; r < 5; r++) if (grid[r].every((c) => hit(c))) return true;
  for (let c = 0; c < 5; c++) {
    let ok = true;
    for (let r = 0; r < 5; r++) if (!hit(grid[r][c])) ok = false;
    if (ok) return true;
  }
  let d1 = true;
  let d2 = true;
  for (let i = 0; i < 5; i++) {
    if (!hit(grid[i][i])) d1 = false;
    if (!hit(grid[i][4 - i])) d2 = false;
  }
  if (d1 || d2) return true;
  if (card.every((v) => hit(v))) return true;
  return false;
}

export default function BingoApp() {
  const [mode, setMode] = useState("lobby");
  const [roomCode, setRoomCode] = useState("");
  const [playerName, setPlayerName] = useState("");
  const [roomData, setRoomData] = useState(null);
  const [localCards, setLocalCards] = useState([]);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const r = params.get("room");
    if (r) setRoomCode(r);
  }, []);

  useEffect(() => {
    if (!roomCode) return;
    const roomRef = ref(db, `rooms/${roomCode}`);
    const unsub = onValue(roomRef, (snap) => {
      setRoomData(snap.val());
    });
    return () => unsub();
  }, [roomCode]);

  return (
    <div className="min-h-screen p-4">
      <div className="max-w-4xl mx-auto">
        <header className="flex items-center justify-between mb-4">
          <h1 className="text-xl font-bold">Bingo Virtual — Sistema Completo</h1>
          <div className="text-sm text-gray-600">Sala: {roomCode || "(sin sala)"}</div>
        </header>

        {mode === "lobby" && (
          <Lobby
            onCreate={(code) => {
              setRoomCode(code);
              setMode("host");
            }}
            onJoin={(code, name) => {
              setRoomCode(code);
              setPlayerName(name);
              setMode("player");
            }}
          />
        )}

        {mode === "host" && roomCode && roomData && (
          <HostView
            roomCode={roomCode}
            roomData={roomData}
            onExport={(cards) => setLocalCards(cards)}
          />
        )}

        {mode === "player" && roomCode && (
          <PlayerView
            roomCode={roomCode}
            playerName={playerName}
            localCards={localCards}
            setLocalCards={setLocalCards}
          />
        )}

        <footer className="mt-6 text-sm text-gray-500">Configura Firebase antes de usar.</footer>
      </div>
    </div>
  );
}

function Lobby({ onCreate, onJoin }) {
  const [creating, setCreating] = useState(false);
  const [joinCode, setJoinCode] = useState("");
  const [name, setName] = useState("");

  async function createRoom() {
    setCreating(true);
    const code = Math.random().toString(36).slice(2, 8).toUpperCase();
    const roomRef = ref(db, `rooms/${code}`);
    await set(roomRef, {
      createdAt: Date.now(),
      hostId: uuidv4(),
      drawn: [],
      players: {},
      cards: {},
    });
    setCreating(false);
    onCreate(code);
    const url = new URL(window.location.href);
    url.searchParams.set("room", code);
    window.history.replaceState({}, "", url);
  }

  async function joinRoom() {
    if (!joinCode || !name) return alert("Ingresa código y nombre");
    const roomRef = ref(db, `rooms/${joinCode}`);
    const snap = await get(roomRef);
    if (!snap.exists()) return alert("Sala no encontrada");
    const playerId = uuidv4();
    await set(ref(db, `rooms/${joinCode}/players/${playerId}`), {
      name,
      joinedAt: Date.now(),
    });
    onJoin(joinCode, name);
    const url = new URL(window.location.href);
    url.searchParams.set("room", joinCode);
    window.history.replaceState({}, "", url);
  }

  return (
    <div className="bg-white p-4 rounded-2xl shadow">
      <h2 className="text-lg font-semibold mb-2">Crear o unirse a una sala</h2>
      <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
        <div>
          <button
            className="w-full px-4 py-2 rounded-xl bg-blue-600 text-white"
            onClick={createRoom}
            disabled={creating}
          >
            {creating ? "Creando..." : "Crear Sala (Host)"}
          </button>
        </div>
        <div>
          <input
            placeholder="Código de sala"
            className="w-full p-2 border rounded"
            value={joinCode}
            onChange={(e) => setJoinCode(e.target.value.toUpperCase())}
          />
          <input
            placeholder="Tu nombre"
            className="w-full p-2 border rounded mt-2"
            value={name}
            onChange={(e) => setName(e.target.value)}
          />
          <button className="w-full mt-2 px-4 py-2 rounded-xl bg-green-600 text-white" onClick={joinRoom}>
            Unirse como jugador
          </button>
        </div>
      </div>
    </div>
  );
}

function HostView({ roomCode, roomData, onExport }) {
  const [drawn, setDrawn] = useState(new Set(roomData?.drawn || []));
  const [last, setLast] = useState(null);
  const [allCards, setAllCards] = useState([]);

  useEffect(() => {
    setDrawn(new Set(roomData?.drawn || []));
  }, [roomData]);

  async function drawNumber() {
    const variant = 75;
    let n;
    do {
      n = Math.floor(Math.random() * variant) + 1;
    } while (drawn.has(n));
    const newDrawn = new Set(drawn);
    newDrawn.add(n);
    setDrawn(newDrawn);
    setLast(n);
    await update(ref(db, `rooms/${roomCode}`), { drawn: Array.from(newDrawn) });
  }

  async function generateCardsForPlayers() {
    const players = roomData.players || {};
    const cardsObj = {};
    const cardList = [];
    Object.keys(players).forEach((pid) => {
      const card = generateCard();
      cardsObj[pid] = { card, owner: players[pid].name };
      cardList.push({ pid, owner: players[pid].name, card });
    });
    await set(ref(db, `rooms/${roomCode}/cards`), cardsObj);
    setAllCards(cardList);
    onExport(cardList.map((c) => c.card));
  }

  async function checkAllForBingo() {
    const cards = roomData.cards || {};
    const drawnSet = new Set(roomData.drawn || []);
    const winners = [];
    Object.entries(cards).forEach(([pid, obj]) => {
      if (checkBingo(obj.card, drawnSet)) winners.push({ pid, owner: obj.owner });
    });
    if (winners.length) alert(`Ganadores: ${winners.map((w) => w.owner).join(", ")}`);
    else alert("Nadie tiene bingo aún");
  }

  async function exportPDF() {
    const doc = new jsPDF({ unit: "pt", format: "a4" });
    let y = 20;
    for (let i = 0; i < allCards.length; i++) {
      const c = allCards[i].card;
      doc.setFontSize(12);
      doc.text(`Cartón - ${allCards[i].owner}`, 20, y);
      y += 14;
      for (let r = 0; r < 5; r++) {
        let row = c.slice(r * 5, r * 5 + 5).join(" |");
        doc.text(row, 20, y);
        y += 12;
      }
      y += 18;
      if (y > 720) {
        doc.addPage();
        y = 40;
      }
    }
    doc.save(`cartones_${roomCode}.pdf`);
  }

  return (
    <div className="bg-white p-4 rounded-2xl shadow">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-lg font-semibold">Panel del Host — Sala {roomCode}</h2>
        <div className="text-sm text-gray-600">Jugadores: {Object.keys(roomData.players || {}).length}</div>
      </div>

      <div className="flex gap-2 mb-4 flex-col md:flex-row">
        <button className="px-4 py-2 rounded-xl bg-indigo-600 text-white" onClick={drawNumber}>
          Sacar número
        </button>
        <button className="px-4 py-2 rounded-xl bg-yellow-500 text-black" onClick={generateCardsForPlayers}>
          Generar cartones (1 por jugador)
        </button>
        <button className="px-4 py-2 rounded-xl bg-red-600 text-white" onClick={checkAllForBingo}>
          Verificar bingos
        </button>
        <button className="px-4 py-2 rounded-xl bg-green-700 text-white" onClick={exportPDF}>
          Exportar PDF
        </button>
      </div>

      <div className="mb-4">
        <div className="font-semibold">Último número: {Array.from(drawn).slice(-1)[0] || "—"}</div>
        <div className="flex flex-wrap gap-2 mt-2">
          {Array.from(drawn).map((n) => (
            <div key={n} className="px-2 py-1 rounded bg-blue-100">{n}</div>
          ))}
        </div>
      </div>

      <div>
        <h3 className="font-semibold mb-2">Cartones (preview)</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          {allCards.map((c, i) => (
            <div className="p-2 border rounded" key={i}>
              <div className="font-medium">{c.owner}</div>
              <div className="grid grid-cols-5 gap-1 mt-2">
                {c.card.map((n, j) => (
                  <div key={j} className="border p-2 text-center rounded">{n}</div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function PlayerView({ roomCode, playerName, localCards, setLocalCards }) {
  const [cards, setCards] = useState([]);
  const [drawn, setDrawn] = useState(new Set());
  const cardsRef = useRef(null);

  useEffect(() => {
    const r = ref(db, `rooms/${roomCode}`);
    const unsub = onValue(r, (snap) => {
      const val = snap.val() || {};
      const remoteCards = val.cards || {};
      const arr = Object.values(remoteCards).map((c, idx) => ({ id: idx, card: c.card, owner: c.owner }));
      setCards(arr);
      setDrawn(new Set(val.drawn || []));
    });
    return () => unsub();
  }, [roomCode]);

  function exportMyCardsPDF() {
    const doc = new jsPDF({ unit: "pt", format: "a4" });
    let y = 20;
    cards.forEach((c, i) => {
      doc.text(`${playerName} - Cartón ${i + 1}`, 20, y);
      y += 14;
      for (let r = 0; r < 5; r++) {
        let row = c.card.slice(r * 5, r * 5 + 5).join(" |");
        doc.text(row, 20, y);
        y += 12;
      }
      y += 18;
      if (y > 720) {
        doc.addPage();
        y = 40;
      }
    });
    doc.save(`mis_cartones_${roomCode}.pdf`);
  }

  async function claimBingo(card) {
    const claimRef = ref(db, `rooms/${roomCode}/claims`);
    const id = uuidv4();
    await set(child(claimRef, id), {
      player: playerName,
      card,
      at: Date.now(),
    });
    alert("Reclamo enviado. Espera verificación del anfitrión.");
  }

  return (
    <div className="bg-white p-4 rounded-2xl shadow">
      <h2 className="text-lg font-semibold">Jugador: {playerName} — Sala {roomCode}</h2>
      <div className="mt-3 mb-3">
        <button className="px-3 py-2 rounded bg-blue-600 text-white" onClick={exportMyCardsPDF}>
          Exportar mis cartones a PDF
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-3" ref={cardsRef}>
        {cards.map((c, i) => (
          <div key={i} className="p-3 border rounded">
            <div className="font-medium mb-2">Cartón {i + 1}</div>
            <div className="grid grid-cols-5 gap-1">
              {c.card.map((n, j) => (
                <div key={j} className={`p-2 border text-center rounded ${drawn.has(n) ? "bg-green-100" : ""}`}>{n}</div>
              ))}
            </div>
            <div className="mt-3 flex gap-2">
              <button className="px-3 py-1 rounded bg-yellow-400" onClick={() => claimBingo(c.card)}>
                Cantar Bingo (reclamar)
              </button>
            </div>
          </div>
        ))}
      </div>

      <div className="mt-4 text-sm text-gray-600">Números cantados: {Array.from(drawn).join(", ") || "—"}</div>
    </div>
  );
}
