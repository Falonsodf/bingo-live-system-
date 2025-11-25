import { useState } from "react";
import BingoCard from "./components/BingoCard";
import { generateCard } from "./utils/generateCard";

export default function App() {
  const [numbersCalled, setNumbersCalled] = useState([]);
  const [currentNumber, setCurrentNumber] = useState(null);
  const [card, setCard] = useState(generateCard());

  const generateNewNumber = () => {
    if (numbersCalled.length >= 75) return;

    let num;
    do {
      num = Math.floor(Math.random() * 75) + 1;
    } while (numbersCalled.includes(num));

    setNumbersCalled([...numbersCalled, num]);
    setCurrentNumber(num);
  };

  const resetGame = () => {
    setNumbersCalled([]);
    setCurrentNumber(null);
    setCard(generateCard());
  };

  return (
    <div style={{ padding: 20, fontFamily: "Arial" }}>
      <h1>Bingo Virtual</h1>

      <button onClick={generateNewNumber}>
        Sacar número
      </button>

      <button onClick={resetGame} style={{ marginLeft: 10 }}>
        Reiniciar
      </button>

      <h2>Número actual: {currentNumber ?? "---"}</h2>

      <h3>Números cantados:</h3>
      <div>
        {numbersCalled.map((n) => (
          <span key={n} style={{ marginRight: 8 }}>{n}</span>
        ))}
      </div>

      <h2>Tu Cartón</h2>
      <BingoCard card={card} numbers={numbersCalled} />
    </div>
  );
}
