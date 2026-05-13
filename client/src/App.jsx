import { useState, useEffect } from 'react';
import { ref, onValue, push, remove } from 'firebase/database';
import { db } from './firebase.js';
import { ITEMS, TOTAL } from './data.js';
import LineItemRow from './components/LineItemRow.jsx';
import Summary from './components/Summary.jsx';
import Onboarding from './components/Onboarding.jsx';

export default function App() {
  const [claims, setClaims] = useState([]);
  const [name, setName] = useState(() => localStorage.getItem('kiosque_name') || '');
  const [nameInput, setNameInput] = useState(() => localStorage.getItem('kiosque_name') || '');
  const [showOnboarding, setShowOnboarding] = useState(
    () => !localStorage.getItem('kiosque_onboarded')
  );

  useEffect(() => {
    const claimsRef = ref(db, 'claims');
    const unsubscribe = onValue(claimsRef, (snapshot) => {
      const data = snapshot.val();
      const list = data
        ? Object.entries(data).map(([id, val]) => ({ id, ...val }))
        : [];
      setClaims(list);
    });
    return unsubscribe;
  }, []);

  function saveName(e) {
    e.preventDefault();
    const trimmed = nameInput.trim();
    if (!trimmed) return;
    setName(trimmed);
    localStorage.setItem('kiosque_name', trimmed);
  }

  async function handleClaim(itemId, percentage) {
    if (!name) return { error: 'Set your name first.' };

    const item = ITEMS.find(i => i.id === itemId);
    if (!item) return { error: 'Invalid item.' };

    const alreadyClaimed = claims
      .filter(c => c.itemId === itemId)
      .reduce((s, c) => s + c.percentage, 0);

    if (alreadyClaimed + percentage > 100) {
      return { error: `Only ${(100 - alreadyClaimed).toFixed(0)}% remaining for this item.` };
    }

    await push(ref(db, 'claims'), { person: name, itemId, percentage });
    return null;
  }

  async function handleDelete(claimId) {
    await remove(ref(db, `claims/${claimId}`));
  }

  function dismissOnboarding() {
    localStorage.setItem('kiosque_onboarded', '1');
    setShowOnboarding(false);
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
          <div className="header-total">€{TOTAL.toFixed(2)}</div>
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
        {ITEMS.map(item => (
          <LineItemRow
            key={item.id}
            item={item}
            claims={claims}
            myName={name}
            onClaim={handleClaim}
            onDelete={handleDelete}
          />
        ))}
      </main>

      <Summary items={ITEMS} claims={claims} total={TOTAL} />
    </div>
  );
}
