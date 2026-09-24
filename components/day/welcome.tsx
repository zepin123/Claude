"use client";

import {useEffect, useState} from 'react';

const phrases = [
  'Un día a la vez.',
  'Hoy también puedes con esto.',
  'Respira, ya tenemos todo organizado.',
  'No tienes que recordar todo tú sola.',
  'Vamos a ordenar tu día.',
  'Primero lo importante, después lo demás.',
  'Tu día, un poquito más simple.',
  'Todo lo que necesitas, en un solo lugar.',
  'Vamos paso a paso.',
  'Tú concéntrate, yo te ayudo a recordar.',
  'Que hoy pese un poquito menos.',
  'No necesitas hacerlo todo al mismo tiempo.',
  'Hay tiempo. Empecemos por lo importante.',
  'Tu día ya está esperando por ti.',
  'Veamos qué toca hoy.',
  'Un pendiente menos también cuenta.',
  'Pequeños avances siguen siendo avances.',
  'Hoy tenemos un plan.',
  'Vamos a hacer espacio en tu cabeza.',
  'Tú vive tu día. Yo te ayudo a no olvidar nada.',
];

export function Welcome() {
  const [phrase] = useState(() => phrases[Math.floor(Math.random() * phrases.length)]);
  const [phase, setPhase] = useState<'showing' | 'leaving' | 'hidden'>('showing');

  useEffect(() => {
    if (phase === 'hidden') return;
    const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const timer = window.setTimeout(
      () => setPhase(phase === 'showing' ? 'leaving' : 'hidden'),
      phase === 'showing' ? (reducedMotion ? 800 : 3900) : (reducedMotion ? 0 : 450),
    );
    return () => window.clearTimeout(timer);
  }, [phase]);

  if (phase === 'hidden') return null;

  return (
    <div className={`welcome-overlay ${phase === 'leaving' ? 'welcome-leaving' : ''}`} role="dialog" aria-modal="true" aria-label="Bienvenida">
      <button
        type="button"
        className="welcome-skip"
        aria-label={`${phrase} atte: tu noviecito. Toca para continuar.`}
        onClick={() => setPhase('leaving')}
        autoFocus
      >
        <span className="welcome-mark" aria-hidden="true">m.</span>
        <span className="welcome-phrase">{phrase}</span>
        <span className="welcome-signature">atte: tu noviecito</span>
      </button>
    </div>
  );
}
