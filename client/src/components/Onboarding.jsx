import { useState } from 'react';

const STEPS = [
  {
    icon: (
      <svg width="40" height="40" viewBox="0 0 40 40" fill="none">
        <rect width="40" height="40" rx="12" fill="#1a1a1a"/>
        <path d="M12 28l4-1 11-11-3-3-11 11-1 4zm14-16l2-2a1.4 1.4 0 0 1 2 2l-2 2-2-2z" fill="white"/>
      </svg>
    ),
    title: 'Enter your name',
    body: 'Type your name at the top so everyone can see who\'s covering what. It\'s saved automatically — no need to re-enter it.',
  },
  {
    icon: (
      <svg width="40" height="40" viewBox="0 0 40 40" fill="none">
        <rect width="40" height="40" rx="12" fill="#1a1a1a"/>
        <rect x="10" y="13" width="20" height="4" rx="2" fill="white"/>
        <rect x="10" y="21" width="14" height="4" rx="2" fill="white" opacity="0.5"/>
        <circle cx="30" cy="29" r="6" fill="#22c55e"/>
        <path d="M27.5 29l1.5 1.5 3-3" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
      </svg>
    ),
    title: 'Claim your share',
    body: 'Tap "Claim" on any item and enter the percentage you\'re covering — for example, 50% if you\'re splitting evenly. The tip is also a claimable item.',
  },
  {
    icon: (
      <svg width="40" height="40" viewBox="0 0 40 40" fill="none">
        <rect width="40" height="40" rx="12" fill="#1a1a1a"/>
        <rect x="10" y="11" width="20" height="2.5" rx="1.25" fill="white" opacity="0.3"/>
        <rect x="10" y="16" width="20" height="2.5" rx="1.25" fill="white" opacity="0.6"/>
        <rect x="10" y="21" width="20" height="2.5" rx="1.25" fill="white"/>
        <rect x="10" y="26" width="12" height="2.5" rx="1.25" fill="#22c55e"/>
      </svg>
    ),
    title: 'See what everyone owes',
    body: 'The summary updates live. Items grey out when fully covered. Open this page on any device — it syncs every 2 seconds.',
  },
];

export default function Onboarding({ onDone }) {
  const [step, setStep] = useState(0);
  const isLast = step === STEPS.length - 1;
  const current = STEPS[step];

  return (
    <div className="onboarding-backdrop" onClick={onDone}>
      <div className="onboarding-card" onClick={e => e.stopPropagation()}>
        <button className="onboarding-skip" onClick={onDone} aria-label="Skip">×</button>

        <div className="onboarding-icon">{current.icon}</div>
        <h2 className="onboarding-title">{current.title}</h2>
        <p className="onboarding-body">{current.body}</p>

        <div className="onboarding-dots">
          {STEPS.map((_, i) => (
            <button
              key={i}
              className={`dot${i === step ? ' active' : ''}`}
              onClick={() => setStep(i)}
              aria-label={`Step ${i + 1}`}
            />
          ))}
        </div>

        <div className="onboarding-actions">
          {step > 0 && (
            <button className="btn-back" onClick={() => setStep(s => s - 1)}>Back</button>
          )}
          <button
            className="btn-next"
            onClick={() => isLast ? onDone() : setStep(s => s + 1)}
          >
            {isLast ? "Let's go" : 'Next'}
          </button>
        </div>
      </div>
    </div>
  );
}
