'use client'

import { useState } from 'react'
import Image from 'next/image'
import { Download, FileQuestion, Check, Copy } from 'lucide-react'

interface ContentDisplayProps {
  content: string
  content_type?: string
  encoding?: string
  filename?: string
}

export default function ContentDisplay({
  content,
  content_type = 'text/plain',
  encoding = 'utf-8',
  filename,
}: ContentDisplayProps) {
  const [copied, setCopied] = useState(false)

  const handleCopy = () => {
    navigator.clipboard.writeText(content)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  const handleDownload = () => {
    let url: string
    let downloadFilename = filename || 'download'

    if (encoding === 'base64') {
      const binaryString = atob(content)
      const bytes = new Uint8Array(binaryString.length)
      for (let i = 0; i < binaryString.length; i++) {
        bytes[i] = binaryString.charCodeAt(i)
      }
      const blob = new Blob([bytes], { type: content_type })
      url = URL.createObjectURL(blob)
      if (!filename) {
          downloadFilename = getFilenameFromContentType(content_type)
      }
    } else {
      const blob = new Blob([content], { type: 'text/plain' })
      url = URL.createObjectURL(blob)
      if (!filename) {
          downloadFilename = 'paste.txt'
      }
    }

    const a = document.createElement('a')
    a.href = url
    a.download = downloadFilename
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
  }

  const getFilenameFromContentType = (type: string | undefined): string => {
    if (!type) return 'file.bin'
    const ext = type.split('/')[1]?.split(';')[0] || 'bin'
    return `file.${ext}`
  }

  const isImage = content_type?.startsWith('image/') ?? false
  const isPdf = content_type === 'application/pdf'
  const isText = content_type?.startsWith('text/') || content_type === 'application/json'

  return (
    <div className="flex-1 flex flex-col gap-5 animate-fade-in min-h-0">
      <div className="flex items-center justify-between border-b border-zinc-800 pb-6 shrink-0">
        <div className="space-y-1">
          <h3 className="text-xl font-semibold text-zinc-100 tracking-tight">Decrypted Clip</h3>
          <p className="text-xs font-medium text-zinc-400 uppercase tracking-widest">{content_type}</p>
        </div>
        <div className="px-4 py-1.5 bg-emerald-500/10 rounded-full border border-emerald-500/20 flex items-center gap-2">
          <div className="w-2 h-2 bg-emerald-500 rounded-full" />
          <span className="text-xs font-medium text-emerald-500">Active</span>
        </div>
      </div>

      <div className="flex-1 flex flex-col overflow-hidden min-h-0">
        {isImage && (
          <div className="glass-panel p-2 bg-zinc-950 border-zinc-800 flex items-center justify-center relative group overflow-hidden">
            <Image
              src={`data:${content_type};base64,${content}`}
              alt="Decrypted Content"
              width={400}
              height={400}
              className="max-w-full max-h-96 rounded-xl relative z-10 transition-transform duration-500 group-hover:scale-[1.02]"
            />
          </div>
        )}

        {isPdf && (
          <div className="glass-input p-12 text-center flex flex-col items-center justify-center bg-zinc-950 border-zinc-800">
            <div className="w-16 h-16 bg-red-500/10 text-red-500 rounded-2xl flex items-center justify-center text-2xl font-bold mb-4 border border-red-500/20">
              PDF
            </div>
            <h4 className="text-lg font-semibold text-zinc-100 mb-2">Secure PDF Found</h4>
            <p className="text-sm text-zinc-400 font-medium">Download to view contents locally and securely.</p>
          </div>
        )}

        {isText && (
          <div className="glass-input flex-1 overflow-hidden flex flex-col relative group bg-zinc-950 border-zinc-800 shadow-none min-h-0">
            <div className="p-4 overflow-y-auto custom-scrollbar relative z-0 flex-1 min-h-0">
              <pre className="text-sm font-mono whitespace-pre-wrap break-words leading-relaxed text-zinc-100">
                {content}
              </pre>
            </div>
          </div>
        )}

        {!isImage && !isPdf && !isText && (
          <div className="glass-input p-12 text-center flex flex-col items-center justify-center bg-zinc-950 border-zinc-800">
            <div className="text-zinc-500 mb-4 bg-zinc-800/30 p-4 rounded-2xl">
              <FileQuestion size={48} strokeWidth={1.5} />
            </div>
            <h4 className="text-lg font-semibold text-zinc-100 mb-2">{content_type}</h4>
            <p className="text-sm text-zinc-400 font-medium">Binary clip detected. Save to your device to open.</p>
          </div>
        )}
      </div>

      <div className="flex flex-col sm:flex-row gap-3">
        {isText && (
          <button
            onClick={handleCopy}
            className="flex-1 btn-secondary"
          >
            {copied ? (
              <span className="flex items-center gap-2 justify-center"><Check size={16} /> Copied</span>
            ) : (
              <span className="flex items-center gap-2 justify-center"><Copy size={16} /> Copy Content</span>
            )}
          </button>
        )}
        <button
          onClick={handleDownload}
          className="flex-1 btn-primary group"
        >
          <span className="flex items-center justify-center gap-2">
            <span>Download Clip</span>
            <Download size={16} className="opacity-70 group-hover:translate-y-0.5 transition-transform duration-300" strokeWidth={2.5} />
          </span>
        </button>
      </div>
      
      <p className="text-center text-xs font-medium text-zinc-400 leading-relaxed">
        This clip is available until the self-destruct timer hits zero
      </p>
    </div>
  )
}
