import { useState } from 'react';

export function useForm(initial) {
  const [v, setV] = useState(initial);
  const bind = (n) => ({ name: n, value: v[n], onChange: (e) => setV({ ...v, [n]: e.target.value }) });
  return [v, bind, () => setV(initial)];
}

export const StatCard = ({ label, value, trend, tone = 'primary' }) => (
  <div className={`stat-card ${tone}`}>
    <span className="stat-label">{label}</span>
    <strong>{value}</strong>
    <small>{trend}</small>
  </div>
);

/** cols: [[header, row => node], ...] */
export function Table({ cols, rows, empty = 'Nothing here yet.' }) {
  if (!rows || !rows.length) return <p className="empty">{empty}</p>;
  return (
    <div className="scroll"><table>
      <thead><tr>{cols.map(([h]) => <th key={h}>{h}</th>)}</tr></thead>
      <tbody>{rows.map((r, i) => <tr key={r.id ?? i}>{cols.map(([h, f]) => <td key={h}>{f(r)}</td>)}</tr>)}</tbody>
    </table></div>
  );
}

export const Tag = ({ v }) => <span className={`tag ${v}`}>{v}</span>;
export const Card = ({ title, children }) => <section className="card">{title && <h3>{title}</h3>}{children}</section>;
