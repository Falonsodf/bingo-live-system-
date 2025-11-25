import { createContext, useContext, useState } from "react";

const BingoContext = createContext();

export function BingoProvider({ children }) {
  const [numbersCalled, setNumbersCalled] = useState([]);
  const [currentNumber, setCurrentNumber] = useState(null);
  const [card, setCard] = useState(null);

  const value = {
    numbersCalled,
    setNumbersCalled,
    currentNumber,
    setCurrentNumber,
    card,
    setCard
  };

  return (
    <BingoContext.Provider value={value}>
      {children}
    </BingoContext.Provider>
  );
}

export function useBingo() {
  return useContext(BingoContext);
}
