import { useEffect } from "react";
import { useBingo } from "../context/BingoContext";
import { generateCard } from "../utils/generateCard";
import BingoCard from "../components/BingoCard";

export default function Home() {
  const {
    numbersCalled,
    setNumbersCalled,
    currentNumber,
    setCurrentNumber,
    card,
    setCard
  } = useBingo();

  useEffect(() => {
    if (!card) {
      setCard(generateCard());
    }
  }, []);

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
    <div style={{ padding: 20 }}>
      <h1>Bingo Virtual</h1>

      <button onClick={generateNewNumber}>Sacar número</button>
      <button onClick={resetGame} style={{ marginLeft: 10 }}>
        Reiniciar
      </button>

      <h2>Número actual: {currentNumber ?? "---"}</h2>

      <h3>Números cantados:</h3>
      <div style={{ marginBottom: 20 }}>
        {numbersCalled.map((n) => (
          <span key={n} style={{ marginRight: 8 }}>{n}</span>
        ))}
      </div>

      {card && <BingoCard card={card} numbers={numbersCalled} />}
    </div>
  );
}
