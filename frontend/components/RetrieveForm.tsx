'use client'

import { useState } from 'react'
import { Lock } from 'lucide-react'

interface RetrieveFormProps {
  onRetrieve: (otp: string) => Promise<void>
  loading: boolean
  initialOtp?: string
}

export default function RetrieveForm({ onRetrieve, loading, initialOtp = '' }: RetrieveFormProps) {
  const [otp, setOtp] = useState(initialOtp)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!otp.trim()) return
    await onRetrieve(otp)
  }

  return (
    <form onSubmit={handleSubmit} className="h-full flex flex-col gap-5 animate-fade-in">
      <div className="flex-1 flex flex-col justify-center space-y-4">
        <label className="block text-sm font-medium text-zinc-400 text-center px-4">
          Enter your 4-digit passcode to fetch the clip
        </label>
        <input
          type="text"
          value={otp}
          onChange={(e) => setOtp(e.target.value.toUpperCase())}
          placeholder="••••"
          disabled={loading}
          maxLength={4}
          className="glass-input w-full p-6 text-4xl tracking-[0.5em] text-center font-bold text-zinc-100 placeholder:text-zinc-400 selection:bg-crab-coral/30 uppercase"
        />
      </div>
      <button
        type="submit"
        disabled={loading || !otp.trim() || otp.length < 4}
        className="btn-primary w-full group relative overflow-hidden"
      >
        <span className="relative z-10">{loading ? 'Decrypting...' : 'Fetch Secure Clip'}</span>
      </button>

      <div className="flex items-center gap-4 py-4 px-5 bg-zinc-950 rounded-xl border border-zinc-800 shadow-sm">
        <div className="text-zinc-500 bg-zinc-800/30 p-2 rounded-lg">
          <Lock size={18} strokeWidth={2} />
        </div>
        <p className="text-xs text-zinc-400 font-medium leading-relaxed">
          Retrieval is encrypted locally. Once fetched, the clip remains active until its timer expires.
        </p>
      </div>
    </form>
  )
}
