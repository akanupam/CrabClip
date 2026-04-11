'use client'

import { useState } from 'react'
import { HistoryItem } from '@/lib/useClipHistory'

interface ClipHistoryProps {
  items: HistoryItem[]
  onSelectOtp: (otp: string) => void
  onDelete: (otp: string) => void
  onClearAll: () => void
}

export default function ClipHistory({
  items,
  onSelectOtp,
  onDelete,
  onClearAll,
}: ClipHistoryProps) {
  const [expandedOtp, setExpandedOtp] = useState<string | null>(null)

  if (items.length === 0) {
    return (
      <div className="py-20 flex flex-col items-center justify-center opacity-50">
        <div className="text-6xl mb-6">🐚</div>
        <p className="text-xl font-black text-slate-800 mb-2">No clips found</p>
        <p className="text-sm text-slate-400 text-center max-w-[280px] font-medium leading-relaxed">Generated codes will appear here until they expire on the seabed.</p>
      </div>
    )
  }

  const getTtlLabel = (ttl: 5 | 60 | 1440): string => {
    if (ttl === 5) return '5m'
    if (ttl === 60) return '1h'
    if (ttl === 1440) return '24h'
    return '??'
  }

  const getContentTypeIcon = (contentType: string): string => {
    if (contentType.startsWith('image/')) return '🐠'
    if (contentType === 'application/pdf') return '🪸'
    if (contentType === 'application/json') return '{ }'
    if (contentType.startsWith('text/')) return '🌊'
    return '🐚'
  }

  const formatTime = (timestamp: number): string => {
    const date = new Date(timestamp)
    const now = new Date()
    const diff = now.getTime() - date.getTime()

    if (diff < 60000) return 'Just now'
    if (diff < 3600000) return `${Math.floor(diff / 60000)}m ago`
    if (diff < 86400000) return `${Math.floor(diff / 3600000)}h ago`
    return date.toLocaleDateString()
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between mb-2">
        <h3 className="font-black text-slate-400 text-[10px] uppercase tracking-[0.3em] flex items-center gap-3">
          <span>Active Clips</span>
          <span className="bg-slate-100 text-slate-600 px-2.5 py-1 rounded-lg font-black text-[9px] shadow-sm">{items.length}</span>
        </h3>
        {items.length > 0 && (
          <button
            onClick={onClearAll}
            className="text-[10px] font-black text-red-500 hover:text-red-600 transition-colors bg-red-50 hover:bg-red-100 px-4 py-2 rounded-xl uppercase tracking-widest border border-red-100"
          >
            Clear Log
          </button>
        )}
      </div>

      <div className="space-y-4">
        {items.map((item) => (
          <div
            key={item.otp}
            className="group glass-panel p-6 bg-white hover:border-crab-ocean/20 transition-all flex flex-col sm:flex-row sm:items-center gap-6 relative shadow-sm hover:shadow-md active:scale-[0.99]"
          >
            <div className="flex-1 min-w-0 flex flex-col justify-center">
              <div className="flex items-center gap-4 mb-2">
                <span className="text-2xl bg-slate-50 w-12 h-12 rounded-2xl flex items-center justify-center shadow-sm group-hover:bg-crab-ocean/5 transition-colors">{getContentTypeIcon(item.content_type)}</span>
                <div className="flex flex-col">
                    <code className="text-xl font-black text-slate-800 tracking-wider">
                      {item.otp}
                    </code>
                    <div className="flex items-center gap-2 mt-1">
                        <span className="text-[10px] font-black tracking-widest uppercase text-slate-300">
                          {getTtlLabel(item.ttl_minutes)} · {formatTime(item.created_at)}
                        </span>
                    </div>
                </div>
              </div>

              <p className="text-xs text-slate-400 font-medium truncate max-w-[280px]">
                {item.content_preview}
              </p>
            </div>

            <div className="flex gap-3 shrink-0">
              <button
                onClick={() => {
                  navigator.clipboard.writeText(item.otp)
                  setExpandedOtp(item.otp)
                  setTimeout(() => setExpandedOtp(null), 1500)
                }}
                className="w-12 h-12 bg-white hover:bg-slate-50 text-slate-400 rounded-2xl border border-slate-100 transition-all flex items-center justify-center shadow-sm"
                title="Copy Code"
              >
                {expandedOtp === item.otp ? '✓' : '⎘'}
              </button>

              <button
                onClick={() => onSelectOtp(item.otp)}
                className="flex-1 sm:flex-none px-6 h-12 bg-crab-coral hover:bg-crab-coral-light text-white rounded-2xl font-black text-xs uppercase tracking-widest transition-all shadow-vibrant hover:shadow-lg active:scale-95"
              >
                Open
              </button>

              <button
                onClick={() => onDelete(item.otp)}
                className="w-12 h-12 bg-slate-50 hover:bg-red-50 text-slate-300 hover:text-red-500 rounded-2xl border border-slate-100 hover:border-red-100 transition-all flex items-center justify-center shadow-sm"
                title="Delete"
              >
                ✕
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
