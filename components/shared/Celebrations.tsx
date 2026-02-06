'use client';
import { createContext, useContext, useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { PartyPopper, CheckCircle2, Sparkles } from 'lucide-react';

type CelebrationType = 'inboxZero' | 'allDone' | 'complete' | null;

interface CelebrationContextType {
  celebrateInboxZero: () => void;
  celebrateAllDone: () => void;
  celebrateComplete: () => void;
}

const CelebrationContext = createContext<CelebrationContextType | undefined>(undefined);

export function useCelebration() {
  const context = useContext(CelebrationContext);
  if (!context) {
    throw new Error('useCelebration must be used within CelebrationProvider');
  }
  return context;
}

interface ConfettiPiece {
  id: number;
  x: number;
  y: number;
  color: string;
  rotation: number;
  scale: number;
}

export function CelebrationProvider({ children }: { children: React.ReactNode }) {
  const [celebration, setCelebration] = useState<CelebrationType>(null);
  const [confetti, setConfetti] = useState<ConfettiPiece[]>([]);

  const generateConfetti = useCallback(() => {
    const colors = ['#10b981', '#3b82f6', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899'];
    const pieces: ConfettiPiece[] = [];

    for (let i = 0; i < 50; i++) {
      pieces.push({
        id: i,
        x: Math.random() * 100,
        y: -10,
        color: colors[Math.floor(Math.random() * colors.length)],
        rotation: Math.random() * 360,
        scale: 0.5 + Math.random() * 0.5,
      });
    }

    return pieces;
  }, []);

  const celebrateInboxZero = useCallback(() => {
    setCelebration('inboxZero');
    setConfetti(generateConfetti());
    setTimeout(() => {
      setCelebration(null);
      setConfetti([]);
    }, 2000);
  }, [generateConfetti]);

  const celebrateAllDone = useCallback(() => {
    setCelebration('allDone');
    setConfetti(generateConfetti());
    setTimeout(() => {
      setCelebration(null);
      setConfetti([]);
    }, 2000);
  }, [generateConfetti]);

  const celebrateComplete = useCallback(() => {
    setCelebration('complete');
    setTimeout(() => {
      setCelebration(null);
    }, 1500);
  }, []);

  return (
    <CelebrationContext.Provider
      value={{ celebrateInboxZero, celebrateAllDone, celebrateComplete }}
    >
      {children}

      {/* Full-screen celebrations */}
      <AnimatePresence>
        {(celebration === 'inboxZero' || celebration === 'allDone') && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/20 backdrop-blur-sm pointer-events-none"
          >
            {/* Confetti pieces */}
            {confetti.map((piece) => (
              <motion.div
                key={piece.id}
                initial={{
                  x: `${piece.x}vw`,
                  y: '-10vh',
                  rotate: piece.rotation,
                  scale: piece.scale,
                }}
                animate={{
                  y: '110vh',
                  rotate: piece.rotation + 720,
                }}
                transition={{
                  duration: 2,
                  ease: 'easeIn',
                  delay: Math.random() * 0.2,
                }}
                className="absolute w-3 h-3 rounded-sm"
                style={{ backgroundColor: piece.color }}
              />
            ))}

            {/* Celebration message */}
            <motion.div
              initial={{ scale: 0, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.8, opacity: 0 }}
              transition={{
                type: 'spring',
                stiffness: 260,
                damping: 20,
              }}
              className="flex flex-col items-center gap-4 bg-card rounded-2xl shadow-2xl p-8 border border-border"
            >
              <motion.div
                initial={{ rotate: -10 }}
                animate={{ rotate: 10 }}
                transition={{
                  repeat: Infinity,
                  repeatType: 'reverse',
                  duration: 0.3,
                }}
              >
                {celebration === 'inboxZero' ? (
                  <PartyPopper className="w-16 h-16 text-emerald-500" />
                ) : (
                  <Sparkles className="w-16 h-16 text-blue-500" />
                )}
              </motion.div>

              <div className="text-center">
                <h2 className="text-3xl font-bold text-foreground mb-2">
                  {celebration === 'inboxZero' ? 'Inbox Zero!' : 'All done for today!'}
                </h2>
                <p className="text-muted-foreground">
                  {celebration === 'inboxZero'
                    ? 'Your inbox is clear and organized'
                    : 'You have completed all your commitments'}
                </p>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Small toast notification for individual completions */}
      <AnimatePresence>
        {celebration === 'complete' && (
          <motion.div
            initial={{ x: 100, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            exit={{ x: 100, opacity: 0 }}
            transition={{
              type: 'spring',
              stiffness: 260,
              damping: 20,
            }}
            className="fixed bottom-6 right-6 z-50 flex items-center gap-3 bg-card rounded-lg shadow-lg border border-border px-4 py-3"
          >
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: [0, 1.2, 1] }}
              transition={{ duration: 0.4 }}
            >
              <CheckCircle2 className="w-6 h-6 text-emerald-500" />
            </motion.div>
            <span className="text-sm font-medium text-foreground">
              Task completed!
            </span>
          </motion.div>
        )}
      </AnimatePresence>
    </CelebrationContext.Provider>
  );
}
