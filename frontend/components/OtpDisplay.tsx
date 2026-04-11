'use client'

import { useState, useEffect } from 'react'

interface OtpDisplayProps {
  otp: string
  expiresAt: number
}

export default function OtpDisplay({ otp, expiresAt }: OtpDisplayProps) {
  const [copied, setCopied] = useState<'otp' | 'link' | null>(null)
  const [timeLeft, setTimeLeft] = useState('')

  useEffect(() => {
    const interval = setInterval(() => {
      const now = Date.now()
      const diff = expiresAt - now

      if (diff <= 0) {
        setTimeLeft('Expired')
      } else {
        const minutes = Math.floor(diff / 60000)
        const seconds = Math.floor((diff % 60000) / 1000)
        setTimeLeft(`${minutes}:${seconds.toString().padStart(2, '0')}`)
      }
    }, 1000)

    return () => clearInterval(interval)
  }, [expiresAt])

  const handleCopy = (text: string, type: 'otp' | 'link') => {
    navigator.clipboard.writeText(text)
    setCopied(type)
    setTimeout(() => setCopied(null), 2000)
  }

  const shareUrl = `${typeof window !== 'undefined' ? window.location.origin : ''}/view/${otp}`

  return (
    <div className="flex-1 flex flex-col gap-5 animate-fade-in">
      <div className="text-center space-y-1">
        <h3 className="text-2xl font-black text-slate-800 tracking-tight">Clip is Locked & Ready</h3>
        <p className="text-sm text-slate-400 font-medium px-8">Your secure link has been generated. Share the passcode below.</p>
      </div>

      {/* OTP box — grows to fill remaining space */}
      <div className="relative group flex-1 flex flex-col">
        <div className="flex-1 flex items-center justify-center glass-input relative overflow-hidden group border-crab-ocean/20 bg-crab-ocean/[0.02] shadow-sm">
          <div className="absolute inset-0 bg-gradient-to-br from-crab-ocean/5 to-crab-coral/5 opacity-0 group-hover:opacity-100 transition-opacity duration-700" />
          <div className="text-6xl font-black tracking-[0.4em] text-slate-800 relative z-10 selection:bg-crab-ocean/10">
            {otp}
          </div>
        </div>
        <button
          onClick={() => handleCopy(otp, 'otp')}
          className="absolute -top-3 -right-3 w-10 h-10 bg-white border border-slate-100 rounded-full flex items-center justify-center text-slate-400 hover:text-crab-ocean shadow-sm transition-all hover:scale-110 active:scale-90"
          title="Copy Code"
        >
          {copied === 'otp' ? '✓' : '⎘'}
        </button>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div className="p-4 rounded-2xl bg-sky-50/60 border border-sky-200/50 space-y-1">
          <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest text-center">Expires In</p>
          <p className={`text-2xl font-black text-center tabular-nums ${timeLeft === 'Expired' ? 'text-red-500' : 'text-slate-800'}`}>
            {timeLeft}
          </p>
        </div>
        <div className="p-4 rounded-2xl bg-sky-50/60 border border-sky-200/50 space-y-1">
          <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest text-center">Status</p>
          <div className="flex items-center justify-center gap-2">
             <div className="w-2 h-2 bg-emerald-400 rounded-full animate-pulse" />
             <p className="text-sm font-black text-slate-800">Secure</p>
          </div>
        </div>
      </div>

      <div className="space-y-3">
        <button
          onClick={() => handleCopy(shareUrl, 'link')}
          className="btn-primary w-full py-4 text-base flex items-center justify-center gap-3"
        >
          {copied === 'link' ? '✓ Link Copied!' : 'Copy Shareable Link'}
        </button>
        <p className="text-[10px] text-center text-slate-400 font-bold uppercase tracking-widest">
            This clip will be deleted forever after expiration
        </p>
      </div>
    </div>
  )
}
