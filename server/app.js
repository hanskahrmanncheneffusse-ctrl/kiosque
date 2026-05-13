import express from 'express';
import cors from 'cors';
import { randomUUID } from 'crypto';

const app = express();
app.use(cors());
app.use(express.json());

const ITEMS = [
  { id: 1, name: 'Lucido, Marco de Bartoli 0,1l', qty: 3, unitPrice: 8.00, total: 24.00  },
  { id: 2, name: 'olives giganti',                qty: 1, unitPrice: 8.00, total: 8.00   },
  { id: 3, name: 'house focaccia',                qty: 1, unitPrice: 8.00, total: 8.00   },
  { id: 4, name: "Carbone's spicy vodka rigatoni",qty: 2, unitPrice: 19.00,total: 38.00  },
  { id: 5, name: 'gnocchi wild garlic',           qty: 1, unitPrice: 23.00,total: 23.00  },
  { id: 6, name: 'pappardelle al la norma',       qty: 1, unitPrice: 18.00,total: 18.00  },
  { id: 7, name: 'Lucido, Marco de Bartoli 0,75l',qty: 2, unitPrice: 52.00,total: 104.00 },
  { id: 8, name: 'Tip',                           qty: 1, unitPrice: 22.30,total: 22.30, isTip: true },
];

const TOTAL = 245.30;

let claims = [];

function claimedPct(itemId) {
  return claims
    .filter(c => c.itemId === itemId)
    .reduce((sum, c) => sum + c.percentage, 0);
}

const stateResponse = () => ({ items: ITEMS, claims, total: TOTAL });

app.get('/api/state', (_req, res) => {
  res.json(stateResponse());
});

app.post('/api/claims', (req, res) => {
  const { person, itemId, percentage } = req.body;

  if (!person || !person.trim()) {
    return res.status(400).json({ error: 'Name is required.' });
  }
  if (!Number.isInteger(itemId) || !ITEMS.find(i => i.id === itemId)) {
    return res.status(400).json({ error: 'Invalid item.' });
  }
  const pct = Number(percentage);
  if (isNaN(pct) || pct <= 0 || pct > 100) {
    return res.status(400).json({ error: 'Percentage must be between 1 and 100.' });
  }

  const already = claimedPct(itemId);
  if (already + pct > 100) {
    return res.status(400).json({
      error: `Only ${(100 - already).toFixed(0)}% remaining for this item.`,
    });
  }

  const claim = { id: randomUUID(), person: person.trim(), itemId, percentage: pct };
  claims.push(claim);
  res.json(stateResponse());
});

app.delete('/api/claims/:id', (req, res) => {
  claims = claims.filter(c => c.id !== req.params.id);
  res.json(stateResponse());
});

export default app;
