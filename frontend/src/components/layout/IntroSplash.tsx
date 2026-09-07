import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { PlaneCanvas3D } from './PlaneCanvas3D';

const SESSION_KEY = 'intro_splash_shown';
const FLIGHT_MS = 1500;
const HOLD_MS = 1700;

/**
 * Full-screen "welcome" intro shown once per browser tab session, the first time a
 * customer lands on the site: a real-time 3D plane (Three.js) flies across a
 * frosted-glass backdrop that blurs the actual page loading underneath, then the
 * whole overlay fades away — nothing is delayed, the page is only visually covered
 * for a moment.
 */
export const IntroSplash: React.FC = () => {
  // Read-only decision, computed once from state that predates this mount's own
  // side effects — safe under React 18 StrictMode's dev-only double-invoke, unlike
  // reading sessionStorage inside the effect below (which the effect itself writes to).
  const [shouldPlay] = useState(() => {
    const alreadyShown = sessionStorage.getItem(SESSION_KEY);
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    return !alreadyShown && !prefersReducedMotion;
  });
  const [visible, setVisible] = useState(shouldPlay);

  useEffect(() => {
    if (!shouldPlay) return;

    sessionStorage.setItem(SESSION_KEY, '1');
    document.body.style.overflow = 'hidden';

    const timer = setTimeout(() => setVisible(false), HOLD_MS);

    return () => clearTimeout(timer);
  }, [shouldPlay]);

  useEffect(() => {
    if (!visible) document.body.style.overflow = '';
  }, [visible]);

  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          className="fixed inset-0 z-[100] overflow-hidden backdrop-blur-lg"
          initial={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.4, ease: 'easeInOut' }}
        >
          <PlaneCanvas3D durationMs={FLIGHT_MS} />
        </motion.div>
      )}
    </AnimatePresence>
  );
};
