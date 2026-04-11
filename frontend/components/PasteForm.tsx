'use client'

import { useState, useRef } from 'react'

interface PasteFormProps {
  onPaste: (content: string, ttl_minutes: number, content_type: string) => Promise<void>
  loading: boolean
}

export default function PasteForm({ onPaste, loading }: PasteFormProps) {
  const [activeType, setActiveType] = useState<'text' | 'file'>('text')
  const [content, setContent] = useState('')
  const [file, setFile] = useState<File | null>(null)
  const [ttl_minutes, setTtl] = useState<5 | 60 | 1440>(5)
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
    if (selectedFile.size > 5242880) {
      setFileError('File too large! Max 5MB allowed.')
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
        await onPaste(base64, ttl_minutes, mimeType)
        setFile(null)
        if (fileInputRef.current) fileInputRef.current.value = ''
      } catch (error: any) {
        setFileError(error?.message || 'Error processing file')
      }
    }
  }

  return (
    <form onSubmit={handleSubmit} className="h-full flex flex-col gap-5 animate-fade-in">
      <div className="flex gap-6 border-b border-slate-100 pb-2 overflow-x-auto custom-scrollbar">
        <button
          type="button"
          onClick={() => setActiveType('text')}
          className={`pb-2 text-sm font-black transition-all relative ${
            activeType === 'text' ? 'text-crab-coral' : 'text-slate-400 hover:text-slate-600'
          }`}
        >
          Snippet
          {activeType === 'text' && (
            <span className="absolute bottom-0 left-0 w-full h-0.5 bg-crab-coral rounded-full animate-scale-in" />
          )}
        </button>
        <button
          type="button"
          onClick={() => setActiveType('file')}
          className={`pb-2 text-sm font-black transition-all relative ${
            activeType === 'file' ? 'text-crab-coral' : 'text-slate-400 hover:text-slate-600'
          }`}
        >
          Drop File
          {activeType === 'file' && (
            <span className="absolute bottom-0 left-0 w-full h-0.5 bg-crab-coral rounded-full animate-scale-in" />
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
            className="glass-input w-full flex-1 p-5 text-slate-700 placeholder:text-slate-300 resize-none font-medium leading-relaxed"
          />
          <div className="absolute bottom-4 right-4 text-[10px] font-black text-slate-300 uppercase tracking-widest pointer-events-none group-focus-within:text-crab-ocean/50 transition-colors">
            {content.length} characters
          </div>
        </div>
      ) : (
        <div
          onClick={() => fileInputRef.current?.click()}
          className="glass-input flex-1 border-dashed border-2 border-slate-200 flex flex-col items-center justify-center cursor-pointer hover:border-crab-ocean/50 hover:bg-crab-ocean/[0.02] transition-all group"
        >
          {file ? (
            <div className="flex flex-col items-center">
              <div className="text-4xl mb-2">🐚</div>
              <p className="text-sm font-black text-slate-600">{file.name}</p>
              <p className="text-xs text-slate-400 mt-1">{(file.size / 1024 / 1024).toFixed(2)} MB</p>
            </div>
          ) : (
            <>
              <div className="text-4xl mb-4 group-hover:scale-110 transition-transform">📁</div>
              <p className="text-sm font-black text-slate-600">Click to upload or drag & drop</p>
              <p className="text-xs text-slate-400 mt-2">Max size: 5MB</p>
            </>
          )}
        </div>
      )}

      {fileError && (
        <div className="p-4 rounded-xl bg-red-50 border border-red-100 text-red-500 text-xs font-bold animate-slide-up">
          ⚠ {fileError}
        </div>
      )}

      <div>
        <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-4">
          Self-Destruct in
        </label>
        <div className="grid grid-cols-3 gap-3">
          {[
            { label: '5 min', value: 5 as const },
            { label: '1 hour', value: 60 as const },
            { label: '24 hours', value: 1440 as const },
          ].map((preset) => (
            <button
              key={preset.value}
              type="button"
              onClick={() => setTtl(preset.value)}
              className={`py-3 text-xs font-black rounded-xl transition-all border shadow-sm ${
                ttl_minutes === preset.value
                  ? 'bg-crab-coral text-white border-crab-coral shadow-lg scale-[1.02]'
                  : 'bg-sky-50 text-slate-500 border-sky-200 hover:bg-sky-100 hover:text-slate-700'
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
        <div className="absolute inset-0 bg-white/10 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-700 ease-in-out" />
      </button>
    </form>
  )
}
