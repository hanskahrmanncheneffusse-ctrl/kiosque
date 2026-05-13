import { useState } from 'react';

export default function LineItemRow({ item, claims, myName, onClaim, onDelete }) {
  const [open, setOpen] = useState(false);
  const [pct, setPct] = useState('');
  const [err, setErr] = useState('');

  const itemClaims = claims.filter(c => c.itemId === item.id);
  const claimedPct = itemClaims.reduce((s, c) => s + c.percentage, 0);
  const remaining = item.total * (1 - claimedPct / 100);
  const fullyPaid = claimedPct >= 100;

  async function handleClaim(e) {
    e.preventDefault();
    setErr('');
    const result = await onClaim(item.id, Number(pct));
    if (result?.error) {
      setErr(result.error);
    } else {
      setPct('');
      setOpen(false);
    }
  }

  return (
    <div className={`item-row${fullyPaid ? ' paid' : ''}${item.isTip ? ' tip-row' : ''}`}>
      <div className="item-header">
        <div className="item-meta">
          {!item.isTip && <span className="item-qty">{item.qty}×</span>}
          <span className="item-name">{item.name}</span>
          {item.isTip && <span className="tip-badge">gratuity</span>}
          {!item.isTip && <span className="item-unit">€{item.unitPrice.toFixed(2)}</span>}
        </div>
        <div className="item-right">
          <span className="item-total">€{item.total.toFixed(2)}</span>
          {!fullyPaid && (
            <button className="btn-claim" onClick={() => { setOpen(o => !o); setErr(''); }}>
              {open ? 'Cancel' : 'Claim'}
            </button>
          )}
        </div>
      </div>

      <div className="progress-wrap">
        <div className="progress-bar" style={{ width: `${claimedPct}%` }} />
      </div>

      <div className="item-status">
        {fullyPaid
          ? <span className="badge-paid">Fully covered</span>
          : <span className="remaining">€{remaining.toFixed(2)} remaining ({(100 - claimedPct).toFixed(0)}%)</span>
        }
      </div>

      {itemClaims.length > 0 && (
        <ul className="claim-list">
          {itemClaims.map(c => (
            <li key={c.id}>
              <span className="claim-person">{c.person}</span>
              <span className="claim-pct">{c.percentage}% — €{(item.total * c.percentage / 100).toFixed(2)}</span>
              {c.person === myName && (
                <button className="btn-delete" onClick={() => onDelete(c.id)}>×</button>
              )}
            </li>
          ))}
        </ul>
      )}

      {open && (
        <form className="claim-form" onSubmit={handleClaim}>
          <label>
            Your share (%)
            <input
              type="number"
              min="1"
              max={100 - claimedPct}
              step="1"
              value={pct}
              onChange={e => setPct(e.target.value)}
              autoFocus
              placeholder={`1–${(100 - claimedPct).toFixed(0)}`}
            />
          </label>
          {pct && (
            <span className="pct-preview">= €{(item.total * Number(pct) / 100).toFixed(2)}</span>
          )}
          <button type="submit" className="btn-confirm">Confirm</button>
          {err && <span className="form-error">{err}</span>}
        </form>
      )}
    </div>
  );
}
