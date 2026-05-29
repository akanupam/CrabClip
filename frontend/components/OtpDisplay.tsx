'use client'

import { useState, useEffect } from 'react'
import { Check, Copy, Link as LinkIcon } from 'lucide-react'

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

  const shareUrl = `${typeof window !== 'undefined' ? window.location.origin : ''}/?retrieve=${otp}`

  return (
    <div className="flex-1 flex flex-col gap-5 animate-fade-in">
      <div className="text-center space-y-1">
        <h3 className="text-2xl font-semibold text-zinc-100 tracking-tight">Clip is Locked & Ready</h3>
        <p className="text-sm text-zinc-400 font-medium px-8">Your secure link has been generated. Share the passcode below.</p>
      </div>

      {/* OTP box — grows to fill remaining space */}
      <div className="relative group flex-1 flex flex-col">
        <div className="flex-1 flex items-center justify-center glass-input relative overflow-hidden group border-zinc-800 bg-zinc-950">
          <div className="text-6xl font-bold tracking-[0.4em] text-zinc-100 relative z-10 selection:bg-crab-coral/10">
            {otp}
          </div>
        </div>
        <button
          onClick={() => handleCopy(otp, 'otp')}
          className="absolute -top-3 -right-3 w-10 h-10 bg-zinc-900 border border-zinc-800 rounded-full flex items-center justify-center text-zinc-400 hover:text-zinc-100 shadow-sm transition-transform hover:scale-110 active:scale-95"
          title="Copy Code"
        >
          {copied === 'otp' ? <Check size={18} /> : <Copy size={18} />}
        </button>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div className="p-4 rounded-xl bg-zinc-950 border border-zinc-800 space-y-1 shadow-sm">
          <p className="text-xs font-medium text-zinc-400 text-center">Expires In</p>
          <p className={`text-2xl font-semibold text-center tabular-nums ${timeLeft === 'Expired' ? 'text-red-400' : 'text-zinc-100'}`}>
            {timeLeft}
          </p>
        </div>
        <div className="p-4 rounded-xl bg-zinc-950 border border-zinc-800 space-y-1 shadow-sm">
          <p className="text-xs font-medium text-zinc-400 text-center">Status</p>
          <div className="flex items-center justify-center gap-2 mt-2">
             <div className="w-2 h-2 bg-emerald-500 rounded-full" />
             <p className="text-sm font-semibold text-zinc-100">Secure</p>
          </div>
        </div>
      </div>

      <div className="space-y-3">
        <button
          onClick={() => handleCopy(shareUrl, 'link')}
          className="btn-primary w-full flex items-center justify-center gap-3"
        >
          {copied === 'link' ? (
            <><Check size={16} /> Link Copied!</>
          ) : (
            <><LinkIcon size={16} /> Copy Shareable Link</>
          )}
        </button>
        <p className="text-xs text-center text-zinc-400 font-medium">
            This clip will be deleted forever after expiration
        </p>
      </div>
    </div>
  )
}
