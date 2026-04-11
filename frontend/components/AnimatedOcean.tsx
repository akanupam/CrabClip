'use client'

import { motion } from 'framer-motion'
import { useEffect, useState } from 'react'

const Bubble = ({ index }: { index: number }) => {
  const [randomX, setRandomX] = useState(0)
  const [randomDelay, setRandomDelay] = useState(0)
  const [randomDuration, setRandomDuration] = useState(0)
  const [randomSize, setRandomSize] = useState(0)

  useEffect(() => {
    setRandomX(Math.random() * 100)
    setRandomDelay(Math.random() * 10)
    setRandomDuration(6 + Math.random() * 8)
    setRandomSize(4 + Math.random() * 12)
  }, [])

  if (randomSize === 0) return null

  return (
    <motion.div
      className="absolute bottom-[-20px] rounded-full bg-white/40 backdrop-blur-[2px] border-[1.5px] border-cyan-400/40"
      style={{
        left: `${randomX}%`,
        width: randomSize + 10,
        height: randomSize + 10,
      }}
      initial={{ y: 0, opacity: 0, scale: 0.5 }}
      animate={{
        y: -500 - Math.random() * 300,
        opacity: [0, 0.8, 0.8, 0],
        scale: [0.5, 1.1, 1.3, 0.9],
        x: [0, (Math.random() - 0.5) * 80, (Math.random() - 0.5) * 80],
      }}
      transition={{
        duration: randomDuration,
        repeat: Infinity,
        delay: randomDelay,
        ease: "easeInOut",
      }}
    />
  )
}

export default function AnimatedOcean() {
  const [bubbles, setBubbles] = useState<number[]>([])

  useEffect(() => {
    setBubbles(Array.from({ length: 100 }, (_, i) => i))
  }, [])

  return (
    <div className="fixed bottom-0 left-0 w-full h-[360px] pointer-events-none overflow-hidden z-0">
      {/* Ocean Waves */}
      <div className="absolute bottom-0 left-0 w-full h-full">
        {/* Wave 1 (Deepest) */}
        <motion.svg
          className="absolute bottom-0 left-0 w-[200%] h-[144px] opacity-[0.08] text-cyan-500"
          viewBox="0 0 1440 320"
          preserveAspectRatio="none"
          animate={{ x: ['0%', '-50%'] }}
          transition={{ duration: 20, repeat: Infinity, ease: 'linear' }}
        >
          <path
            fill="currentColor"
            d="M0,192L48,197.3C96,203,192,213,288,229.3C384,245,480,267,576,250.7C672,235,768,181,864,181.3C960,181,1056,235,1152,234.7C1248,235,1344,181,1392,154.7L1440,128L1440,320L1392,320C1344,320,1248,320,1152,320C1056,320,960,320,864,320C768,320,672,320,576,320C480,320,384,320,288,320C192,320,96,320,48,320L0,320Z"
          />
        </motion.svg>

        {/* Wave 2 */}
        <motion.svg
          className="absolute bottom-0 left-0 w-[200%] h-[168px] opacity-[0.12] text-cyan-400"
          viewBox="0 0 1440 320"
          preserveAspectRatio="none"
          animate={{ x: ['-50%', '0%'] }}
          transition={{ duration: 25, repeat: Infinity, ease: 'linear' }}
        >
          <path
            fill="currentColor"
            d="M0,160L60,170.7C120,181,240,203,360,197.3C480,192,600,160,720,144C840,128,960,128,1080,149.3C1200,171,1320,213,1380,234.7L1440,256L1440,320L1380,320C1320,320,1200,320,1080,320C960,320,840,320,720,320C600,320,480,320,360,320C240,320,120,320,60,320L0,320Z"
          />
        </motion.svg>

        {/* Wave 3 (Front) */}
        <motion.svg
          className="absolute bottom-0 left-0 w-[200%] h-[120px] opacity-[0.05] text-cyan-300"
          viewBox="0 0 1440 320"
          preserveAspectRatio="none"
          animate={{ x: ['0%', '-50%'] }}
          transition={{ duration: 15, repeat: Infinity, ease: 'linear' }}
        >
          <path
            fill="currentColor"
            d="M0,224L80,213.3C160,203,320,181,480,186.7C640,192,800,224,960,224C1120,224,1280,192,1360,176L1440,160L1440,320L1360,320C1280,320,1120,320,960,320C800,320,640,320,480,320C320,320,160,320,80,320L0,320Z"
          />
        </motion.svg>
      </div>

      {/* Bubbles */}
      <div className="absolute inset-x-0 bottom-0 h-full">
        {bubbles.map((i) => (
          <Bubble key={i} index={i} />
        ))}
      </div>
    </div>
  )
}
