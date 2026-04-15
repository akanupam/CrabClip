'use client'

import { useState, useEffect } from 'react'
import Image from 'next/image'
import { createPaste, checkHealth, retrieveContent } from '../lib/api'
import { useClipHistory } from '../lib/useClipHistory'
import PasteForm from '../components/PasteForm'
import RetrieveForm from '../components/RetrieveForm'
import OtpDisplay from '../components/OtpDisplay'
import ContentDisplay from '../components/ContentDisplay'
import ClipHistory from '../components/ClipHistory'
import AnimatedOcean from '../components/AnimatedOcean'
import MascotBubble from '../components/MascotBubble'

export default function Home() {
  const clipHistory = useClipHistory()
  const [showHistory, setShowHistory] = useState(false)
  const [activeTab, setActiveTab] = useState<'share' | 'retrieve'>('share')
  const [otp, setOtp] = useState<string | null>(null)
  const [expiresAt, setExpiresAt] = useState<number | null>(null)
  const [createLoading, setCreateLoading] = useState(false)
  const [createError, setCreateError] = useState('')
  const [retrievedContent, setRetrievedContent] = useState<string | null>(null)
  const [retrievedContentType, setRetrievedContentType] = useState<string>('text/plain')
  const [retrievedEncoding, setRetrievedEncoding] = useState<string>('utf-8')
  const [retrievedFilename, setRetrievedFilename] = useState<string | undefined>(undefined)
  const [retrieveLoading, setRetrieveLoading] = useState(false)
  const [retrieveError, setRetrieveError] = useState('')
  const [connectionError, setConnectionError] = useState(false)

  useEffect(() => {
    checkBackendConnection()
  }, [])

  const checkBackendConnection = async () => {
    try {
      await checkHealth()
      setConnectionError(false)
    } catch (err) {
      setConnectionError(true)
    }
  }

  const handlePaste = async (content: string, ttl_minutes: number, content_type: string, filename?: string) => {
    setCreateLoading(true)
    setCreateError('')
    try {
      const result = await createPaste(content, ttl_minutes, content_type, filename)
      setOtp(result.otp)
      setExpiresAt(Number(result.expires_at))

      const preview = clipHistory.getPreview(content, content_type)
      clipHistory.addToHistory({
        otp: result.otp,
        content_preview: preview,
        created_at: Date.now(),
        ttl_minutes: ttl_minutes as 5 | 20 | 60,
        content_type,
      })
    } catch (err: any) {
      setCreateError(err.message || 'Failed to create paste')
    } finally {
      setCreateLoading(false)
    }
  }

  const handleHistorySelect = (otpCode: string) => {
    setShowHistory(false)
    setActiveTab('retrieve')
    handleRetrieve(otpCode)
  }

  const handleRetrieve = async (otpCode: string) => {
    setRetrieveLoading(true)
    setRetrieveError('')
    try {
      const result = await retrieveContent(otpCode)
      setRetrievedContent(result.content)
      setRetrievedContentType(result.content_type || 'text/plain')
      setRetrievedEncoding(result.encoding || 'utf-8')
      setRetrievedFilename(result.filename)
    } catch (err: any) {
      setRetrieveError(err.message || 'Failed to retrieve content')
    } finally {
      setRetrieveLoading(false)
    }
  }

  const handleResetCreate = () => {
    setOtp(null)
    setExpiresAt(null)
    setCreateError('')
  }

  const handleResetRetrieve = () => {
    setRetrievedContent(null)
    setRetrievedContentType('text/plain')
    setRetrievedEncoding('utf-8')
    setRetrievedFilename(undefined)
    setRetrieveError('')
  }

  if (connectionError) {
    return (
      <div className="w-full min-h-screen flex items-center justify-center p-4">
        <div className="glass-panel p-10 max-w-md w-full text-center animate-scale-in">
          <div className="text-6xl mb-6">🦀</div>
          <h1 className="text-3xl font-bold text-slate-800 mb-4">Deep Sea Static</h1>
          <p className="text-slate-500 mb-10">We&apos;re having trouble reaching the seabed. Check your connection or try floating back up later.</p>
          <button onClick={checkBackendConnection} className="btn-primary w-full">
            Ping the Reef
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="w-full min-h-screen lg:h-screen lg:overflow-hidden relative flex flex-col bg-gradient-to-br from-crab-sand via-white to-cyan-50/30 pt-14 lg:pt-10">

      {/* Background Pattern */}
      <div className="fixed inset-0 bg-gradient-to-br from-crab-sand via-white to-cyan-50/30 -z-20" />
      <AnimatedOcean />

      {/* "Crafted by" Pill */}
      <div className="fixed top-0 left-0 right-0 z-50 bg-white/80 backdrop-blur-md animate-fade-in shadow-sm">
        <div className="px-4 lg:px-12 py-4 lg:py-5">
          <div className="flex items-center justify-between">
            {/* Header with Logo */}
            <h1 className="text-2xl lg:text-3xl font-black text-slate-800 tracking-tighter">
              Crab<span className="text-crab-coral">Clip</span>
            </h1>
            <a
              href="https://github.com/akanupam"
              target="_blank"
              rel="noopener noreferrer"
              className="px-4 py-2 bg-slate-50 hover:bg-slate-100 border border-slate-200 rounded-lg text-[11px] font-black tracking-widest text-slate-600 uppercase flex items-center gap-1.5 hover:text-crab-coral transition-colors duration-300"
            >
              Crafted by <span className="text-crab-coral font-black lowercase tracking-widest">akanupam</span>
            </a>
          </div>
        </div>
      </div>

      {/* Main Content Container */}
      <div className="flex-1 overflow-hidden px-4 lg:px-12 pb-4 lg:pb-8 z-10">
        <div className="max-w-7xl mx-auto h-full flex flex-col lg:flex-row items-center justify-center gap-6 lg:gap-16">

          {/* Hero Section (Left) */}
          <div className="w-full lg:w-1/2 flex flex-col items-center lg:items-start justify-center text-center lg:text-left space-y-[2vh] lg:space-y-[3vh] animate-fade-in max-w-xl relative">

            {/* Mascot Bubble Container */}
            <div className="relative flex-shrink-0">
              <MascotBubble />
            </div>

            <div className="space-y-[1vh] relative">
              <div className="px-3 py-1 bg-white shadow-sm text-crab-coral rounded-full text-[10px] font-black inline-block uppercase tracking-[0.2em] border border-slate-50">
                Secure · Fast · Branded
              </div>
              <p className="text-sm lg:text-lg text-slate-500 font-bold leading-tight max-w-md pt-1">
                Instantly share text & files across devices. Generate a secure 4-digit code, anyone with it can fetch your clip.
              </p>
            </div>

            <div className="flex flex-wrap gap-2 lg:gap-3 justify-center lg:justify-start pt-1">
              <div className="flex items-center gap-2 px-4 lg:px-5 py-2 lg:py-2.5 bg-white border border-slate-50 rounded-2xl text-[9px] lg:text-[10px] font-black text-slate-500 uppercase tracking-widest shadow-sm">
                <span className="w-1.5 lg:w-2 h-1.5 lg:h-2 bg-emerald-400 rounded-full animate-pulse" />
                Secure
              </div>
              <div className="flex items-center gap-2 px-4 lg:px-5 py-2 lg:py-2.5 bg-white border border-slate-100 rounded-2xl text-[9px] lg:text-[10px] font-black text-slate-500 uppercase tracking-widest shadow-sm">
                <span className="w-1.5 lg:w-2 h-1.5 lg:h-2 bg-crab-ocean rounded-full animate-pulse" />
                Anonymous
              </div>
            </div>

            <button
              onClick={() => setShowHistory(true)}
              className="mt-2 lg:mt-4 px-6 lg:px-8 py-2.5 lg:py-3.5 text-[9px] lg:text-[10px] font-black bg-slate-900 hover:bg-black text-white rounded-2xl transition-all shadow-lg flex items-center gap-3 group uppercase tracking-widest"
            >
              View Secret History
              {clipHistory.history.length > 0 && (
                <span className="bg-crab-coral text-white rounded-lg px-2 py-0.5 lg:py-1 ml-1">
                  {clipHistory.history.length}
                </span>
              )}
            </button>
          </div>

          {/* Main Functional Container (Right) */}
          <div className="w-full lg:w-[583px] flex items-center justify-center relative z-10 h-[600px] lg:h-[620px] flex-shrink-0">
        <div className="glass-panel p-6 lg:p-10 w-full h-full animate-slide-up relative bg-white backdrop-blur-3xl flex flex-col overflow-hidden">
          {/* Segmented Tab Control */}
          <div className="flex bg-sky-50 p-1 lg:p-1.5 rounded-2xl mb-6 lg:mb-10 border border-sky-200/60">
            <button
              onClick={() => setActiveTab('share')}
              className={`flex-1 py-3.5 text-xs font-black rounded-xl transition-all duration-300 uppercase tracking-widest ${activeTab === 'share'
                  ? 'bg-white text-slate-800 shadow-sm border border-slate-100'
                  : 'text-slate-400 hover:text-slate-500'
                }`}
            >
              Share
            </button>
            <button
              onClick={() => setActiveTab('retrieve')}
              className={`flex-1 py-3.5 text-xs font-black rounded-xl transition-all duration-300 uppercase tracking-widest ${activeTab === 'retrieve'
                  ? 'bg-white text-slate-800 shadow-sm border border-slate-100'
                  : 'text-slate-400 hover:text-slate-500'
                }`}
            >
              Retrieve
            </button>
          </div>

          <div className="flex-1 overflow-y-auto no-scrollbar flex flex-col">
            {activeTab === 'share' && (
              <div className="animate-fade-in h-full flex flex-col">
                {!otp ? (
                  <>
                    <PasteForm onPaste={handlePaste} loading={createLoading} />
                    {createError && (
                      <div className="mt-8 p-5 rounded-3xl bg-red-50 border border-red-100 text-red-500 text-[10px] font-black uppercase tracking-widest animate-slide-up text-center">
                        ⚠ {createError}
                      </div>
                    )}
                  </>
                ) : (
                  <div className="animate-scale-in h-full flex flex-col gap-4">
                    <OtpDisplay otp={otp} expiresAt={expiresAt!} />
                    <button onClick={handleResetCreate} className="btn-secondary w-full uppercase tracking-widest text-[10px] flex-shrink-0">
                      New Clip
                    </button>
                  </div>
                )}
              </div>
            )}

            {activeTab === 'retrieve' && (
              <div className="animate-fade-in h-full flex flex-col">
                {!retrievedContent ? (
                  <>
                    <RetrieveForm onRetrieve={handleRetrieve} loading={retrieveLoading} />
                    {retrieveError && (
                      <div className="mt-8 p-5 rounded-3xl bg-red-50 border border-red-100 text-red-500 text-[10px] font-black uppercase tracking-widest animate-slide-up text-center">
                        ⚠ {retrieveError}
                      </div>
                    )}
                  </>
                ) : (
                  <div className="animate-scale-in h-full flex flex-col gap-4">
                    <ContentDisplay
                      content={retrievedContent}
                      content_type={retrievedContentType}
                      encoding={retrievedEncoding}
                      filename={retrievedFilename}
                    />
                    <button onClick={handleResetRetrieve} className="btn-secondary w-full uppercase tracking-widest text-[10px] flex-shrink-0">
                      Fetch Another
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
        </div>
      </div>
      </div>

      {/* History Modal */}
      {showHistory && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-md flex items-center justify-center p-4 z-50 animate-fade-in">
          <div className="glass-panel max-w-xl w-full max-h-[85vh] overflow-hidden flex flex-col animate-scale-in">
            <div className="px-8 py-6 border-b border-slate-100 flex items-center justify-between bg-white/50">
              <h3 className="text-xl font-black text-slate-800">Clip History</h3>
              <button
                onClick={() => setShowHistory(false)}
                className="w-10 h-10 flex items-center justify-center rounded-2xl hover:bg-gray-100 text-slate-400 transition-colors"
              >
                ✕
              </button>
            </div>
            <div className="p-8 overflow-y-auto">
              <ClipHistory
                items={clipHistory.history}
                onSelectOtp={handleHistorySelect}
                onDelete={clipHistory.removeFromHistory}
                onClearAll={clipHistory.clearHistory}
              />
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

