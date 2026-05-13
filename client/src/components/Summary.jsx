export default function Summary({ items, claims, total }) {
  if (claims.length === 0) return null;

  const people = [...new Set(claims.map(c => c.person))];

  const rows = people.map(person => {
    const personClaims = claims.filter(c => c.person === person);
    const owed = personClaims.reduce((sum, c) => {
      const item = items.find(i => i.id === c.itemId);
      return sum + (item ? item.total * c.percentage / 100 : 0);
    }, 0);
    return { person, owed };
  });

  const claimed = rows.reduce((s, r) => s + r.owed, 0);
  const uncovered = total - claimed;

  return (
    <div className="summary">
      <h2>Summary</h2>
      <table>
        <thead>
          <tr>
            <th>Name</th>
            <th>Total owed</th>
          </tr>
        </thead>
        <tbody>
          {rows.map(r => (
            <tr key={r.person}>
              <td>{r.person}</td>
              <td className="total-cell">€{r.owed.toFixed(2)}</td>
            </tr>
          ))}
        </tbody>
        {uncovered > 0.005 && (
          <tfoot>
            <tr className="uncovered-row">
              <td>Unclaimed</td>
              <td className="total-cell">€{uncovered.toFixed(2)}</td>
            </tr>
          </tfoot>
        )}
      </table>
      <p className="summary-note">Bill total: €{total.toFixed(2)}</p>
    </div>
  );
}
