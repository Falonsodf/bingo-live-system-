export default function BingoCard({ card, numbers }) {
  return (
    <table border="1" cellPadding="10" style={{ marginTop: 20 }}>
      <tbody>
        {card.map((row, rIndex) => (
          <tr key={rIndex}>
            {row.map((value, cIndex) => {
              const marked = numbers.includes(value);

              return (
                <td
                  key={cIndex}
                  style={{
                    background: marked ? "#4caf50" : "white",
                    color: marked ? "white" : "black",
                    fontWeight: "bold",
                    textAlign: "center"
                  }}
                >
                  {value === "FREE" ? "★" : value}
                </td>
              );
            })}
          </tr>
        ))}
      </tbody>
    </table>
  );
}
