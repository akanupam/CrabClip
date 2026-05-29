'use client'

import { useState, useRef } from 'react'
import { FileText, FolderUp } from 'lucide-react'

interface PasteFormProps {
  onPaste: (content: string, ttl_minutes: number, content_type: string, filename?: string) => Promise<void>
  loading: boolean
}

export default function PasteForm({ onPaste, loading }: PasteFormProps) {
  const [activeType, setActiveType] = useState<'text' | 'file'>('text')
  const [content, setContent] = useState('')
  const [file, setFile] = useState<File | null>(null)
  const [ttl_minutes, setTtl] = useState<5 | 20 | 60>(5)
  const [fileError, setFileError] = useState('')
  const fileInputRef = useRef<HTMLInputElement>(null)

  const fileToBase64 = async (selectedFile: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader()
      reader.onload = () => {
        const result = reader.result as string
        const base64String = result.includes(',') ? result.split(',')[1] : result
        resolve(base64String)
      }
      reader.onerror = (err) => reject(err)
      reader.readAsDataURL(selectedFile)
    })
  }

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0]
    setFileError('')
    if (!selectedFile) return
    if (selectedFile.size > 10485760) {
      setFileError('File too large! Max 10MB allowed.')
      setFile(null)
      if (fileInputRef.current) fileInputRef.current.value = ''
      return
    }
    setFile(selectedFile)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (activeType === 'text') {
      if (!content.trim()) return
      await onPaste(content, ttl_minutes, 'text/plain')
      setContent('')
    } else {
      if (!file) {
        setFileError('Please select a file first')
        return
      }
      try {
        setFileError('')
        const base64 = await fileToBase64(file)
        const mimeType = file.type || 'application/octet-stream'
        await onPaste(base64, ttl_minutes, mimeType, file.name)
        setFile(null)
        if (fileInputRef.current) fileInputRef.current.value = ''
      } catch (error: any) {
        setFileError(error?.message || 'Error processing file')
      }
    }
  }

  return (
    <form onSubmit={handleSubmit} className="h-full flex flex-col gap-5 animate-fade-in">
      <div className="flex gap-6 border-b border-zinc-800 pb-2 overflow-x-auto custom-scrollbar">
        <button
          type="button"
          onClick={() => setActiveType('text')}
          className={`pb-2 text-sm font-medium transition-colors relative ${
            activeType === 'text' ? 'text-crab-coral' : 'text-zinc-400 hover:text-zinc-100'
          }`}
        >
          Snippet
          {activeType === 'text' && (
            <span className="absolute bottom-0 left-0 w-full h-0.5 bg-crab-coral rounded-t-full animate-scale-in" />
          )}
        </button>
        <button
          type="button"
          onClick={() => setActiveType('file')}
          className={`pb-2 text-sm font-medium transition-colors relative ${
            activeType === 'file' ? 'text-crab-coral' : 'text-zinc-400 hover:text-zinc-100'
          }`}
        >
          Drop File
          {activeType === 'file' && (
            <span className="absolute bottom-0 left-0 w-full h-0.5 bg-crab-coral rounded-t-full animate-scale-in" />
          )}
        </button>
      </div>

      <input
        type="file"
        ref={fileInputRef}
        onChange={handleFileChange}
        className="hidden"
      />

      {activeType === 'text' ? (
        <div className="relative group flex-1 flex flex-col">
          <textarea
            value={content}
            onChange={(e) => setContent(e.target.value)}
            placeholder="Paste your secret text here..."
            disabled={loading}
            className="glass-input w-full flex-1 p-4 text-zinc-100 placeholder:text-zinc-400 resize-none font-medium leading-relaxed"
          />
          <div className="absolute bottom-3 right-4 text-xs font-medium text-zinc-400 pointer-events-none group-focus-within:text-crab-coral transition-colors">
            {content.length} characters
          </div>
        </div>
      ) : (
        <div
          onClick={() => fileInputRef.current?.click()}
          className="glass-input flex-1 border-dashed border-2 flex flex-col items-center justify-center cursor-pointer hover:border-crab-coral hover:bg-zinc-800/50 transition-colors group"
        >
          {file ? (
            <div className="flex flex-col items-center">
              <div className="text-zinc-500 mb-3 bg-zinc-800/30 p-3 rounded-xl">
                <FileText size={32} strokeWidth={1.5} />
              </div>
              <p className="text-sm font-medium text-zinc-100">{file.name}</p>
              <p className="text-xs text-zinc-400 mt-1">{(file.size / 1024 / 1024).toFixed(2)} MB</p>
            </div>
          ) : (
            <>
              <div className="text-zinc-500 mb-3 group-hover:-translate-y-1 transition-transform bg-zinc-800/30 p-3 rounded-xl">
                <FolderUp size={32} strokeWidth={1.5} />
              </div>
              <p className="text-sm font-medium text-zinc-100">Click to upload or drag & drop</p>
              <p className="text-xs text-zinc-400 mt-2">Max size: 10MB</p>
            </>
          )}
        </div>
      )}

      {fileError && (
        <div className="p-3 rounded-lg bg-red-950/30 border border-red-900 text-red-400 text-sm font-medium animate-slide-up">
          {fileError}
        </div>
      )}

      <div>
        <label className="block text-xs font-medium text-zinc-400 mb-3">
          Self-Destruct in
        </label>
        <div className="grid grid-cols-3 gap-3">
          {[
            { label: '5 min', value: 5 as const },
            { label: '20 min', value: 20 as const },
            { label: '1 hour', value: 60 as const },
          ].map((preset) => (
            <button
              key={preset.value}
              type="button"
              onClick={() => setTtl(preset.value)}
              className={`py-2 text-sm font-medium rounded-lg transition-colors border ${
                ttl_minutes === preset.value
                  ? 'bg-crab-coral text-white border-crab-coral'
                  : 'bg-transparent text-zinc-400 border-zinc-800 hover:bg-zinc-800 hover:text-zinc-100'
              }`}
            >
              {preset.label}
            </button>
          ))}
        </div>
      </div>

      <button
        type="submit"
        disabled={loading || (activeType === 'text' && !content.trim()) || (activeType === 'file' && !file)}
        className="btn-primary w-full group relative overflow-hidden"
      >
        <span className="relative z-10">
          {loading ? 'Encrypting...' : 'Generate Secure Link'}
        </span>
      </button>
    </form>
  )
}
