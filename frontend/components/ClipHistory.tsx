'use client'

import { useState } from 'react'
import { HistoryItem } from '../lib/useClipHistory'
import { Archive, ImageIcon, FileText, FileJson, FileCode2, FileIcon, Check, Copy, Trash2 } from 'lucide-react'

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
      <div className="py-20 flex flex-col items-center justify-center">
        <div className="text-zinc-600 mb-4 bg-zinc-800/30 p-4 rounded-2xl">
          <Archive size={48} strokeWidth={1.5} />
        </div>
        <p className="text-lg font-semibold text-zinc-100 mb-2">No clips found</p>
        <p className="text-sm text-zinc-400 text-center max-w-[280px] font-medium leading-relaxed">Generated codes will appear here until they expire.</p>
      </div>
    )
  }

  const getTtlLabel = (ttl: 5 | 20 | 60): string => {
    if (ttl === 5) return '5m'
    if (ttl === 20) return '20m'
    if (ttl === 60) return '1h'
    return '??'
  }

  const getContentTypeIcon = (contentType: string) => {
    if (contentType.startsWith('image/')) return <ImageIcon size={20} strokeWidth={1.5} />
    if (contentType === 'application/pdf') return <FileText size={20} strokeWidth={1.5} />
    if (contentType === 'application/json') return <FileJson size={20} strokeWidth={1.5} />
    if (contentType.startsWith('text/')) return <FileCode2 size={20} strokeWidth={1.5} />
    return <FileIcon size={20} strokeWidth={1.5} />
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
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-semibold text-zinc-100 text-sm flex items-center gap-2">
          <span>Previous Clips</span>
          <span className="bg-zinc-800 text-zinc-100 px-2 py-0.5 rounded text-xs">{items.length}</span>
        </h3>
        {items.length > 0 && (
          <button
            onClick={onClearAll}
            className="text-xs font-medium text-zinc-400 hover:text-red-400 transition-colors bg-zinc-950 hover:bg-red-950/20 px-3 py-1.5 rounded-lg border border-zinc-800 hover:border-red-900/50"
          >
            Clear Log
          </button>
        )}
      </div>

      <div className="space-y-4">
        {items.map((item) => (
          <div
            key={item.otp}
            className="group glass-panel p-5 bg-zinc-900 hover:bg-zinc-800/30 transition-colors flex flex-col sm:flex-row sm:items-center gap-5 relative border-zinc-800"
          >
            <div className="flex-1 min-w-0 flex flex-col justify-center">
              <div className="flex items-center gap-3 mb-1">
                <span className="text-xl bg-zinc-950 border border-zinc-800 w-10 h-10 rounded-lg flex items-center justify-center opacity-80">{getContentTypeIcon(item.content_type)}</span>
                <div className="flex flex-col">
                    <code className="text-lg font-semibold text-zinc-100 tracking-wider">
                      {item.otp}
                    </code>
                    <div className="flex items-center gap-2">
                        <span className="text-xs font-medium text-zinc-400">
                          {getTtlLabel(item.ttl_minutes)} · {formatTime(item.created_at)}
                        </span>
                    </div>
                </div>
              </div>

              <p className="text-sm text-zinc-400 font-normal truncate max-w-[280px]">
                {item.content_preview}
              </p>
            </div>

            <div className="flex gap-2 shrink-0">
              <button
                onClick={() => {
                  navigator.clipboard.writeText(item.otp)
                  setExpandedOtp(item.otp)
                  setTimeout(() => setExpandedOtp(null), 1500)
                }}
                className="w-10 h-10 bg-zinc-950 hover:bg-zinc-800 text-zinc-400 hover:text-zinc-100 rounded-lg border border-zinc-800 transition-colors flex items-center justify-center"
                title="Copy Code"
              >
                {expandedOtp === item.otp ? <Check size={18} /> : <Copy size={18} />}
              </button>

              <button
                onClick={() => onSelectOtp(item.otp)}
                className="flex-1 sm:flex-none px-5 h-10 bg-crab-coral hover:bg-crab-coral-light text-white rounded-lg font-medium text-sm transition-colors"
              >
                Open
              </button>

              <button
                onClick={() => onDelete(item.otp)}
                className="w-10 h-10 bg-zinc-950 hover:bg-red-950/20 text-zinc-400 hover:text-red-400 rounded-lg border border-zinc-800 hover:border-red-900/50 transition-colors flex items-center justify-center"
                title="Delete"
              >
                <Trash2 size={18} />
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
