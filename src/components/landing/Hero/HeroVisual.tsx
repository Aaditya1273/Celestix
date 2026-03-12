'use client';

import { useRef, useEffect } from 'react';
import { motion } from 'framer-motion';

export default function HeroVisual() {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const handleMouseMove = (e: MouseEvent) => {
      const cards = container.querySelectorAll('.floating-card');
      const { clientX, clientY } = e;
      const { left, top, width, height } = container.getBoundingClientRect();
      const x = (clientX - left) / width - 0.5;
      const y = (clientY - top) / height - 0.5;

      cards.forEach((card, index) => {
        const element = card as HTMLElement;
        const intensity = (index + 1) * 10;
        element.style.transform = `translate(${x * intensity}px, ${y * intensity}px)`;
      });
    };

    container.addEventListener('mousemove', handleMouseMove);
    return () => container.removeEventListener('mousemove', handleMouseMove);
  }, []);

  return (
    <div ref={containerRef} className="relative w-full h-[600px] flex items-center justify-center">
      {/* Central Glow */}
      <div className="absolute inset-0 flex items-center justify-center">
        <div className="w-64 h-64 bg-orange-500/30 rounded-full blur-3xl animate-pulse" />
      </div>

      {/* Floating Cards */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 1 }}
        className="relative w-full h-full"
      >
        {/* Card 1 - Top Right */}
        <motion.div
          initial={{ opacity: 0, y: -50 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.2 }}
          className="floating-card absolute top-[10%] right-[15%] w-48 h-48 glass-effect rounded-2xl p-6 transition-transform duration-300 ease-out"
          style={{ animationDelay: '0s' }}
        >
          <div className="w-full h-full flex flex-col justify-between">
            <div className="w-12 h-12 bg-gradient-to-br from-orange-500 to-orange-600 rounded-xl" />
            <div className="space-y-2">
              <div className="h-3 bg-white/20 rounded-full w-3/4" />
              <div className="h-3 bg-white/10 rounded-full w-1/2" />
            </div>
          </div>
        </motion.div>

        {/* Card 2 - Left Middle */}
        <motion.div
          initial={{ opacity: 0, x: -50 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.8, delay: 0.4 }}
          className="floating-card absolute top-[35%] left-[5%] w-56 h-32 glass-effect rounded-2xl p-6 transition-transform duration-300 ease-out"
          style={{ animationDelay: '2s' }}
        >
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 bg-gradient-to-br from-purple-500 to-pink-500 rounded-xl" />
            <div className="flex-1 space-y-2">
              <div className="h-3 bg-white/20 rounded-full" />
              <div className="h-3 bg-white/10 rounded-full w-2/3" />
            </div>
          </div>
        </motion.div>

        {/* Card 3 - Bottom Right */}
        <motion.div
          initial={{ opacity: 0, y: 50 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.6 }}
          className="floating-card absolute bottom-[15%] right-[10%] w-52 h-52 glass-effect rounded-2xl p-6 transition-transform duration-300 ease-out"
          style={{ animationDelay: '4s' }}
        >
          <div className="w-full h-full flex flex-col gap-4">
            <div className="flex gap-2">
              <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-cyan-500 rounded-lg" />
              <div className="w-8 h-8 bg-gradient-to-br from-green-500 to-emerald-500 rounded-lg" />
              <div className="w-8 h-8 bg-gradient-to-br from-red-500 to-rose-500 rounded-lg" />
            </div>
            <div className="flex-1 bg-white/5 rounded-xl" />
          </div>
        </motion.div>

        {/* Card 4 - Center */}
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.8, delay: 0.8 }}
          className="floating-card absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-64 h-64 glass-effect rounded-3xl p-8 transition-transform duration-300 ease-out glow-orange"
        >
          <div className="w-full h-full flex flex-col items-center justify-center gap-6">
            <div className="w-20 h-20 bg-gradient-to-br from-orange-500 to-orange-600 rounded-2xl animate-pulse-glow" />
            <div className="text-center space-y-2">
              <div className="h-4 bg-white/30 rounded-full w-32 mx-auto" />
              <div className="h-3 bg-white/20 rounded-full w-24 mx-auto" />
            </div>
            <div className="flex gap-2">
              <div className="w-2 h-2 bg-orange-500 rounded-full animate-pulse" />
              <div className="w-2 h-2 bg-orange-500 rounded-full animate-pulse" style={{ animationDelay: '0.2s' }} />
              <div className="w-2 h-2 bg-orange-500 rounded-full animate-pulse" style={{ animationDelay: '0.4s' }} />
            </div>
          </div>
        </motion.div>

        {/* Card 5 - Top Left */}
        <motion.div
          initial={{ opacity: 0, x: -50, y: -50 }}
          animate={{ opacity: 1, x: 0, y: 0 }}
          transition={{ duration: 0.8, delay: 1 }}
          className="floating-card absolute top-[20%] left-[20%] w-40 h-40 glass-effect rounded-2xl p-4 transition-transform duration-300 ease-out"
          style={{ animationDelay: '1s' }}
        >
          <div className="w-full h-full flex items-center justify-center">
            <div className="text-6xl">✨</div>
          </div>
        </motion.div>

        {/* Connecting Lines */}
        <svg className="absolute inset-0 w-full h-full pointer-events-none opacity-20">
          <motion.line
            initial={{ pathLength: 0 }}
            animate={{ pathLength: 1 }}
            transition={{ duration: 2, delay: 1.2 }}
            x1="50%"
            y1="50%"
            x2="85%"
            y2="20%"
            stroke="url(#gradient)"
            strokeWidth="2"
            strokeDasharray="5,5"
          />
          <motion.line
            initial={{ pathLength: 0 }}
            animate={{ pathLength: 1 }}
            transition={{ duration: 2, delay: 1.4 }}
            x1="50%"
            y1="50%"
            x2="15%"
            y2="40%"
            stroke="url(#gradient)"
            strokeWidth="2"
            strokeDasharray="5,5"
          />
          <defs>
            <linearGradient id="gradient" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="#ff8c00" />
              <stop offset="100%" stopColor="#ff4500" />
            </linearGradient>
          </defs>
        </svg>
      </motion.div>
    </div>
  );
}
