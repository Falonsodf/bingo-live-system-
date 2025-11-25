export const generateBingoCard = () => {
  const card = { B: [], I: [], N: [], G: [], O: [] };

  const ranges = {
    B: [1, 15],
    I: [16, 30],
    N: [31, 45],
    G: [46, 60],
    O: [61, 75]
  };

  for (const letter in ranges) {
    const [min, max] = ranges[letter];
    const numbers = [];

    while (numbers.length < 5) {
      const num = Math.floor(Math.random() * (max - min + 1)) + min;
      if (!numbers.includes(num)) numbers.push(num);
    }

    card[letter] = numbers;
  }

  card.N[2] = "FREE";

  return card;
};
