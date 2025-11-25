import { BingoProvider } from "./context/BingoContext";
import Home from "./pages/Home";

export default function App() {
  return (
    <BingoProvider>
      <Home />
    </BingoProvider>
  );
}
