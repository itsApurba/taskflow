import { useCallback, useEffect, useRef, useState } from "react";

export const BURST_MS = 1300;
const COINS = 16;

// Even spread around the circle with a little jitter.
const makeCoins = () =>
  Array.from({ length: COINS }, (_, i) => {
    const angle = (i / COINS) * Math.PI * 2 + (Math.random() - 0.5) * 0.4;
    const distance = 90 + Math.random() * 90;
    return {
      dx: `${Math.cos(angle) * distance}px`,
      dy: `${Math.sin(angle) * distance - 40}px`,
      spin: `${Math.round((Math.random() - 0.5) * 720)}deg`,
      size: 5 + Math.round(Math.random() * 3),
      delay: Math.round(Math.random() * 120),
    };
  });

// State for <CoinBurst burst={burst} />: call `fire("Redeemed!")` to play it.
const useCoinBurst = () => {
  const [burst, setBurst] = useState(null);
  const timer = useRef(null);
  useEffect(() => () => clearTimeout(timer.current), []);
  const fire = useCallback((label) => {
    clearTimeout(timer.current);
    setBurst({ id: Date.now(), label, coins: makeCoins() });
    timer.current = setTimeout(() => setBurst(null), BURST_MS + 200);
  }, []);
  return [burst, fire];
};

export default useCoinBurst;
