import React from 'react';
import { motion } from 'motion/react';

export const FlowingBackground: React.FC = () => {
  return (
    <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden select-none">
      {/* Animated Flowing Fluid Water Gradient Layer */}
      <div className="absolute inset-0 flowing-gradient-bg opacity-70" />

      {/* Floating Neon Orb 1 - Electric Cyan */}
      <motion.div
        animate={{
          x: [0, 80, -60, 0],
          y: [0, -90, 60, 0],
          scale: [1, 1.25, 0.85, 1],
        }}
        transition={{
          duration: 22,
          repeat: Infinity,
          ease: 'easeInOut',
        }}
        className="absolute -top-20 -left-20 w-96 h-96 rounded-full bg-cyan-400/20 dark:bg-cyan-500/15 blur-3xl"
      />

      {/* Floating Neon Orb 2 - Lime Green */}
      <motion.div
        animate={{
          x: [0, -100, 70, 0],
          y: [0, 80, -70, 0],
          scale: [1, 1.15, 0.9, 1],
        }}
        transition={{
          duration: 26,
          repeat: Infinity,
          ease: 'easeInOut',
        }}
        className="absolute top-1/3 -right-20 w-96 h-96 rounded-full bg-lime-400/20 dark:bg-lime-500/15 blur-3xl"
      />

      {/* Floating Neon Orb 3 - Magenta/Pink */}
      <motion.div
        animate={{
          x: [0, 70, -80, 0],
          y: [0, -60, 90, 0],
          scale: [1, 1.2, 0.8, 1],
        }}
        transition={{
          duration: 24,
          repeat: Infinity,
          ease: 'easeInOut',
        }}
        className="absolute -bottom-20 left-1/4 w-[28rem] h-[28rem] rounded-full bg-pink-400/15 dark:bg-pink-500/15 blur-3xl"
      />

      {/* Floating Paper / Research Document Outline Shapes */}
      <div className="absolute inset-0 opacity-[0.06] dark:opacity-[0.12]">
        <motion.div
          animate={{
            y: [0, -25, 0],
            rotate: [0, 4, 0],
          }}
          transition={{
            duration: 14,
            repeat: Infinity,
            ease: 'easeInOut',
          }}
          className="absolute top-20 left-[15%] w-32 h-44 rounded-xl border-2 border-cyan-500 bg-cyan-500/5 backdrop-blur-3xs"
        >
          <div className="p-3 space-y-2">
            <div className="w-12 h-2 rounded bg-cyan-500/40" />
            <div className="w-20 h-1.5 rounded bg-cyan-500/30" />
            <div className="w-16 h-1.5 rounded bg-cyan-500/30" />
            <div className="w-24 h-12 rounded border border-cyan-500/30 mt-2" />
          </div>
        </motion.div>

        <motion.div
          animate={{
            y: [0, 30, 0],
            rotate: [0, -6, 0],
          }}
          transition={{
            duration: 18,
            repeat: Infinity,
            ease: 'easeInOut',
          }}
          className="absolute top-1/2 right-[12%] w-40 h-52 rounded-2xl border-2 border-lime-500 bg-lime-500/5 backdrop-blur-3xs"
        >
          <div className="p-4 space-y-2.5">
            <div className="w-16 h-2 rounded bg-lime-500/40" />
            <div className="w-28 h-1.5 rounded bg-lime-500/30" />
            <div className="w-20 h-1.5 rounded bg-lime-500/30" />
            <div className="w-full h-16 rounded-xl border border-lime-500/30 mt-3" />
          </div>
        </motion.div>

        {/* Dynamic Continuous Wave Lines */}
        <svg className="absolute inset-0 w-full h-full" xmlns="http://www.w3.org/2000/svg">
          <motion.path
            d="M 0 300 Q 350 150 700 300 T 1400 300 T 2100 300"
            fill="none"
            stroke="rgba(6, 182, 212, 0.4)"
            strokeWidth="1.5"
            strokeDasharray="6 6"
            animate={{
              d: [
                "M 0 300 Q 350 150 700 300 T 1400 300 T 2100 300",
                "M 0 300 Q 350 450 700 300 T 1400 300 T 2100 300",
                "M 0 300 Q 350 150 700 300 T 1400 300 T 2100 300",
              ],
            }}
            transition={{
              duration: 20,
              repeat: Infinity,
              ease: 'easeInOut',
            }}
          />
          <motion.path
            d="M 0 600 Q 400 450 800 600 T 1600 600 T 2400 600"
            fill="none"
            stroke="rgba(132, 204, 22, 0.4)"
            strokeWidth="1.5"
            strokeDasharray="8 8"
            animate={{
              d: [
                "M 0 600 Q 400 750 800 600 T 1600 600 T 2400 600",
                "M 0 600 Q 400 450 800 600 T 1600 600 T 2400 600",
                "M 0 600 Q 400 750 800 600 T 1600 600 T 2400 600",
              ],
            }}
            transition={{
              duration: 25,
              repeat: Infinity,
              ease: 'easeInOut',
            }}
          />
        </svg>
      </div>
    </div>
  );
};
