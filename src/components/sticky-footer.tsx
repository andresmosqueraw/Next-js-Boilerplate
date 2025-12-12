'use client';
import { AnimatePresence, motion } from 'framer-motion';
import { useEffect, useState } from 'react';

export function StickyFooter() {
  const [isAtBottom, setIsAtBottom] = useState(false);

  useEffect(() => {
    let ticking = false;

    const handleScroll = () => {
      if (!ticking) {
        requestAnimationFrame(() => {
          const scrollTop = window.scrollY;
          const windowHeight = window.innerHeight;
          const documentHeight = document.documentElement.scrollHeight;
          const isNearBottom = scrollTop + windowHeight >= documentHeight - 100;

          setIsAtBottom(isNearBottom);
          ticking = false;
        });
        ticking = true;
      }
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    handleScroll(); // Check initial state
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <AnimatePresence>
      {isAtBottom && (
        <motion.div
          className="fixed bottom-0 left-0 z-50 flex h-80 w-full items-center justify-center"
          style={{ backgroundColor: '#e78a53' }}
          initial={{ y: '100%' }}
          animate={{ y: 0 }}
          exit={{ y: '100%' }}
          transition={{ duration: 0.3, ease: 'easeOut' }}
        >
          <div
            className="relative flex h-full w-full items-start justify-end overflow-hidden px-12 py-12 text-right"
            style={{ color: '#121113' }}
          >
            <motion.div
              className="flex flex-row space-x-12 text-sm sm:space-x-16 sm:text-lg md:space-x-24 md:text-xl"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.1 }}
            >
              <ul className="space-y-2">
                <li
                  className="cursor-pointer transition-colors hover:underline"
                  style={{ color: '#121113' }}
                  onMouseEnter={e => (e.target.style.color = 'rgba(18, 17, 19, 0.8)')}
                  onMouseLeave={e => (e.target.style.color = '#121113')}
                >
                  Home
                </li>
                <li
                  className="cursor-pointer transition-colors hover:underline"
                  style={{ color: '#121113' }}
                  onMouseEnter={e => (e.target.style.color = 'rgba(18, 17, 19, 0.8)')}
                  onMouseLeave={e => (e.target.style.color = '#121113')}
                >
                  Docs
                </li>
                <li
                  className="cursor-pointer transition-colors hover:underline"
                  style={{ color: '#121113' }}
                  onMouseEnter={e => (e.target.style.color = 'rgba(18, 17, 19, 0.8)')}
                  onMouseLeave={e => (e.target.style.color = '#121113')}
                >
                  Components
                </li>
              </ul>
              <ul className="space-y-2">
                <li
                  className="cursor-pointer transition-colors hover:underline"
                  style={{ color: '#121113' }}
                  onMouseEnter={e => (e.target.style.color = 'rgba(18, 17, 19, 0.8)')}
                  onMouseLeave={e => (e.target.style.color = '#121113')}
                >
                  Github
                </li>
                <li
                  className="cursor-pointer transition-colors hover:underline"
                  style={{ color: '#121113' }}
                  onMouseEnter={e => (e.target.style.color = 'rgba(18, 17, 19, 0.8)')}
                  onMouseLeave={e => (e.target.style.color = '#121113')}
                >
                  Twitter
                </li>
                <li
                  className="cursor-pointer transition-colors hover:underline"
                  style={{ color: '#121113' }}
                  onMouseEnter={e => (e.target.style.color = 'rgba(18, 17, 19, 0.8)')}
                  onMouseLeave={e => (e.target.style.color = '#121113')}
                >
                  Discord
                </li>
              </ul>
            </motion.div>
            <motion.h2
              className="absolute bottom-0 left-0 translate-y-1/3 text-[80px] font-bold select-none sm:text-[192px]"
              style={{ color: '#121113' }}
              initial={{ opacity: 0, x: -100 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8, delay: 0.3 }}
            >
              v0
            </motion.h2>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
