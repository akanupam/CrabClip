'use client'

import { motion } from 'framer-motion'
import Image from 'next/image'

export default function MascotBubble() {
  return (
    <div className="relative w-[30vh] h-[30vh] max-w-[280px] max-h-[280px] min-w-[120px] min-h-[120px] flex items-center justify-center">
      {/* Outer Glow / Pulse */}
      <motion.div
        className="absolute inset-0 bg-crab-coral/10 blur-[80px] rounded-full"
        animate={{
          scale: [1, 1.2, 1],
          opacity: [0.3, 0.5, 0.3],
        }}
        transition={{
          duration: 4,
          repeat: Infinity,
          ease: "easeInOut"
        }}
      />

      {/* The "Liquid" Bubble */}
      <motion.div
        className="relative w-full h-full bg-white/95 border-[6px] border-white shadow-premium overflow-hidden flex items-center justify-center group"
        style={{ willChange: 'border-radius, transform' }}
        animate={{
          borderRadius: [
            "60% 40% 30% 70% / 60% 30% 70% 40%",
            "30% 60% 70% 40% / 50% 60% 30% 60%",
            "60% 40% 30% 70% / 60% 30% 70% 40%",
          ],
          rotate: [0, 5, -5, 0],
        }}
        transition={{
          duration: 8,
          repeat: Infinity,
          ease: "easeInOut"
        }}
      >
        {/* Subtle inner reflection */}
        <div className="absolute top-4 left-8 w-12 h-6 bg-white/40 blur-sm rounded-full -rotate-45" />
        
        <div className="absolute inset-0 bg-gradient-to-b from-transparent to-black/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
        
        <motion.div
          className="relative w-[110%] h-[110%]"
          animate={{
            y: [0, -10, 0],
          }}
          transition={{
            duration: 5,
            repeat: Infinity,
            ease: "easeInOut"
          }}
        >
          <Image
            src="/crab-mascot.png"
            alt="CrabClip Mascot"
            fill
            className="object-contain scale-[1.1]"
            priority
            fetchPriority="high"
          />
        </motion.div>
      </motion.div>

      {/* Accenting Bubbles around mascot */}
      <motion.div 
        className="absolute -top-4 -right-4 w-6 h-6 rounded-full bg-white/40 backdrop-blur-sm border border-white/50"
        animate={{ y: [0, -20, 0], opacity: [0.5, 0.8, 0.5] }}
        transition={{ duration: 3, repeat: Infinity, delay: 0.5 }}
      />
      <motion.div 
        className="absolute bottom-8 -left-2 w-4 h-4 rounded-full bg-white/30 backdrop-blur-sm border border-white/50"
        animate={{ y: [0, -15, 0], opacity: [0.4, 0.7, 0.4] }}
        transition={{ duration: 4, repeat: Infinity, delay: 1.2 }}
      />
    </div>
  )
}
