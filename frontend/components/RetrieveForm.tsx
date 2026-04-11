'use client'

import { useState } from 'react'

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
        <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest text-center px-4">
          Enter your 4-digit passcode to fetch the clip
        </label>
        <input
          type="text"
          value={otp}
          onChange={(e) => setOtp(e.target.value.toUpperCase())}
          placeholder="••••"
          disabled={loading}
          maxLength={4}
          className="glass-input w-full p-6 text-4xl tracking-[0.6em] text-center font-black text-slate-800 placeholder:text-slate-200 selection:bg-crab-coral/10 uppercase"
        />
      </div>
      <button
        type="submit"
        disabled={loading || !otp.trim() || otp.length < 4}
        className="btn-primary w-full group relative overflow-hidden"
      >
        <span className="relative z-10">{loading ? 'Fetching Reef...' : 'Fetch Secure Clip'}</span>
        <div className="absolute inset-0 bg-white/10 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-700 ease-in-out" />
      </button>

      <div className="flex items-center gap-4 py-4 px-6 bg-sky-50/70 rounded-2xl border border-sky-200/50">
        <div className="text-2xl">🪸</div>
        <p className="text-xs text-slate-500 font-medium leading-relaxed">
          Retrieval is encrypted locally. Once fetched, the clip remains active until its timer expires.
        </p>
      </div>
    </form>
  )
}
