export function generateCard() {
  const card = [];
  const columns = [
    [1, 15],
    [16, 30],
    [31, 45],
    [46, 60],
    [61, 75]
  ];

  for (let c = 0; c < 5; c++) {
    const [min, max] = columns[c];
    const nums = shuffle(range(min, max)).slice(0, 5);
    card.push(nums);
  }

  // FREE space in the center
  card[2][2] = "FREE";

  // rotate to form rows
  return card[0].map((_, i) => card.map((col) => col[i]));
}

function range(a, b) {
  const arr = [];
  for (let i = a; i <= b; i++) arr.push(i);
  return arr;
}

function shuffle(arr) {
  return [...arr].sort(() => Math.random() - 0.5);
}
