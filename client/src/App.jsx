import { useState, useEffect, useCallback } from 'react';
import LineItemRow from './components/LineItemRow.jsx';
import Summary from './components/Summary.jsx';
import Onboarding from './components/Onboarding.jsx';

export default function App() {
  const [state, setState] = useState(null);
  const [name, setName] = useState(() => localStorage.getItem('kiosque_name') || '');
  const [nameInput, setNameInput] = useState(() => localStorage.getItem('kiosque_name') || '');
  const [showOnboarding, setShowOnboarding] = useState(
    () => !localStorage.getItem('kiosque_onboarded')
  );

  const fetchState = useCallback(async () => {
    try {
      const res = await fetch('/api/state');
      setState(await res.json());
    } catch {
      // server not ready yet, retry on next tick
    }
  }, []);

  useEffect(() => {
    fetchState();
    const id = setInterval(fetchState, 2000);
    return () => clearInterval(id);
  }, [fetchState]);

  function saveName(e) {
    e.preventDefault();
    const trimmed = nameInput.trim();
    if (!trimmed) return;
    setName(trimmed);
    localStorage.setItem('kiosque_name', trimmed);
  }

  async function handleClaim(itemId, percentage) {
    if (!name) return { error: 'Set your name first.' };
    const res = await fetch('/api/claims', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ person: name, itemId, percentage }),
    });
    const data = await res.json();
    if (res.ok) { setState(data); return null; }
    return data;
  }

  async function handleDelete(claimId) {
    const res = await fetch(`/api/claims/${claimId}`, { method: 'DELETE' });
    if (res.ok) setState(await res.json());
  }

  function dismissOnboarding() {
    localStorage.setItem('kiosque_onboarded', '1');
    setShowOnboarding(false);
  }

  if (!state) {
    return <div className="loading">Connecting to server…</div>;
  }

  return (
    <div className="app">
      {showOnboarding && <Onboarding onDone={dismissOnboarding} />}

      <header>
        <div className="header-title">
          <span className="header-logo">KIOSQUE</span>
          <span className="header-sub">Table 401 · 13.05.2026</span>
        </div>
        <div className="header-right">
          <button className="btn-help" onClick={() => setShowOnboarding(true)} aria-label="Help">?</button>
          <div className="header-total">€{state.total.toFixed(2)}</div>
        </div>
      </header>

      <div className="name-bar" id="name-bar">
        {name ? (
          <div className="name-set">
            Claiming as <strong>{name}</strong>
            <button className="btn-link" onClick={() => { setName(''); setNameInput(''); localStorage.removeItem('kiosque_name'); }}>
              change
            </button>
          </div>
        ) : (
          <form className="name-form" onSubmit={saveName}>
            <input
              id="name-input"
              value={nameInput}
              onChange={e => setNameInput(e.target.value)}
              placeholder="Your name"
              autoFocus={!showOnboarding}
            />
            <button type="submit">Set name</button>
          </form>
        )}
      </div>

      <main id="items-list">
        {state.items.map(item => (
          <LineItemRow
            key={item.id}
            item={item}
            claims={state.claims}
            myName={name}
            onClaim={handleClaim}
            onDelete={handleDelete}
          />
        ))}
      </main>

      <Summary
        items={state.items}
        claims={state.claims}
        total={state.total}
      />
    </div>
  );
}
