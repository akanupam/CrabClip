'use client'

import { useState } from 'react'
import Image from 'next/image'

interface ContentDisplayProps {
  content: string
  content_type?: string
  encoding?: string
}

export default function ContentDisplay({
  content,
  content_type = 'text/plain',
  encoding = 'utf-8',
}: ContentDisplayProps) {
  const [copied, setCopied] = useState(false)

  const handleCopy = () => {
    navigator.clipboard.writeText(content)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  const handleDownload = () => {
    let url: string
    let filename = 'download'

    if (encoding === 'base64') {
      const binaryString = atob(content)
      const bytes = new Uint8Array(binaryString.length)
      for (let i = 0; i < binaryString.length; i++) {
        bytes[i] = binaryString.charCodeAt(i)
      }
      const blob = new Blob([bytes], { type: content_type })
      url = URL.createObjectURL(blob)
      filename = getFilenameFromContentType(content_type)
    } else {
      const blob = new Blob([content], { type: 'text/plain' })
      url = URL.createObjectURL(blob)
      filename = 'paste.txt'
    }

    const a = document.createElement('a')
    a.href = url
    a.download = filename
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
  }

  const getFilenameFromContentType = (type: string): string => {
    const ext = type.split('/')[1]?.split(';')[0] || 'bin'
    return `file.${ext}`
  }

  const isImage = content_type.startsWith('image/')
  const isPdf = content_type === 'application/pdf'
  const isText = content_type.startsWith('text/') || content_type === 'application/json'

  return (
    <div className="flex-1 flex flex-col gap-5 animate-fade-in">
      <div className="flex items-center justify-between border-b border-slate-100 pb-6">
        <div className="space-y-1">
          <h3 className="text-xl font-black text-slate-800 tracking-tight">Decrypted Clip</h3>
          <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">{content_type}</p>
        </div>
        <div className="px-5 py-2 bg-emerald-50 rounded-2xl border border-emerald-100 flex items-center gap-2.5 shadow-sm">
          <div className="w-2.5 h-2.5 bg-emerald-400 rounded-full animate-pulse" />
          <span className="text-xs font-black text-emerald-500 uppercase tracking-widest">Active</span>
        </div>
      </div>

      <div className="flex-1 flex flex-col overflow-hidden">
        {isImage && (
          <div className="glass-panel p-3 bg-white shadow-vibrant flex items-center justify-center relative group overflow-hidden">
            <Image
              src={`data:${content_type};base64,${content}`}
              alt="Decrypted Content"
              width={400}
              height={400}
              className="max-w-full max-h-96 rounded-2xl relative z-10 transition-transform duration-500 group-hover:scale-[1.02]"
            />
          </div>
        )}

        {isPdf && (
          <div className="glass-input p-12 text-center flex flex-col items-center justify-center bg-white border-slate-100">
            <div className="w-20 h-20 bg-red-50 text-red-400 rounded-3xl flex items-center justify-center text-3xl font-black mb-6 border border-red-50 shadow-sm">
              PDF
            </div>
            <h4 className="text-lg font-black text-slate-800 mb-2">Secure PDF Found</h4>
            <p className="text-sm text-slate-400 font-medium">Download to view contents locally and securely.</p>
          </div>
        )}

        {isText && (
          <div className="glass-input flex-1 overflow-hidden flex flex-col relative group bg-sky-50/40 border-sky-200/50 shadow-sm">
            <div className="p-6 overflow-y-auto custom-scrollbar relative z-0 flex-1">
              <pre className="text-sm font-mono whitespace-pre-wrap break-words leading-relaxed text-slate-600">
                {content}
              </pre>
            </div>
          </div>
        )}

        {!isImage && !isPdf && !isText && (
          <div className="glass-input p-12 text-center flex flex-col items-center justify-center bg-white border-slate-100">
            <div className="text-5xl mb-6 opacity-80">🐚</div>
            <h4 className="text-lg font-black text-slate-800 mb-2">{content_type}</h4>
            <p className="text-sm text-slate-400 font-medium">Binary clip detected. Save to your device to open.</p>
          </div>
        )}
      </div>

      <div className="flex flex-col sm:flex-row gap-4">
        {isText && (
          <button
            onClick={handleCopy}
            className="flex-1 btn-secondary py-5 text-sm font-black"
          >
            {copied ? '✓ Copied' : 'Copy Content'}
          </button>
        )}
        <button
          onClick={handleDownload}
          className="flex-1 btn-primary py-5 text-sm font-black group"
        >
          <span className="flex items-center justify-center gap-2">
            <span>Download Clip</span>
            <span className="opacity-50 group-hover:translate-y-0.5 transition-transform duration-300">↓</span>
          </span>
        </button>
      </div>
      
      <p className="text-center text-[10px] font-black text-slate-400 uppercase tracking-widest leading-relaxed">
        This clip is available until the self-destruct timer hits zero
      </p>
    </div>
  )
}
