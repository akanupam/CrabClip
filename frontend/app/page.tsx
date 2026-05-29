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
import { VerticalThemeWipeToggle } from '../components/ui/vertical-theme-wipe-toggle'
import { WifiOff, X, Clock, ShieldCheck, Ghost } from 'lucide-react'

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
  const [isAutoFetching, setIsAutoFetching] = useState(false)
  const [isReady, setIsReady] = useState(false)

  useEffect(() => {
    checkBackendConnection()

    // Handle auto-retrieve from URL parameter or path
    if (typeof window !== 'undefined') {
      const searchParams = new URLSearchParams(window.location.search)
      let retrieveOtp = searchParams.get('retrieve')
      
      const pathPart = window.location.pathname.slice(1).toUpperCase()
      if (!retrieveOtp && pathPart.length === 4) {
        retrieveOtp = pathPart
      }

      if (retrieveOtp) {
        setIsAutoFetching(true)
        setActiveTab('retrieve')
        handleRetrieve(retrieveOtp)
        // Clean up URL
        window.history.replaceState({}, '', '/')
      }
    }
    
    setIsReady(true)
    // eslint-disable-next-line react-hooks/exhaustive-deps
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
      setIsAutoFetching(false)
    } finally {
      setRetrieveLoading(false)
      setTimeout(() => setIsAutoFetching(false), 500)
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
        <div className="glass-panel p-10 max-w-md w-full text-center animate-scale-in flex flex-col items-center">
          <div className="text-zinc-600 mb-6 bg-zinc-800/30 p-4 rounded-2xl">
            <WifiOff size={48} strokeWidth={1.5} />
          </div>
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
    <div className="w-full min-h-screen lg:h-screen lg:overflow-hidden relative flex flex-col pt-14 lg:pt-10">

      {/* "Crafted by" Pill & Header */}
      <div className="fixed top-0 left-0 right-0 z-50 bg-zinc-950/90 backdrop-blur-md animate-fade-in border-b border-zinc-800">
        <div className="px-6 lg:px-12 py-4">
          <div className="flex items-center justify-between">
            {/* Header with Logo */}
            <h1 className="text-xl lg:text-2xl font-semibold tracking-tight text-zinc-100">
              Crab<span className="text-crab-coral">Clip</span>
            </h1>
            <div className="flex items-center gap-2 sm:gap-3">
              <VerticalThemeWipeToggle direction="top" className="text-zinc-400 hover:text-zinc-100 bg-transparent hover:bg-zinc-800 transition-colors" />
              <button
                onClick={() => setShowHistory(true)}
                className="px-3 sm:px-4 py-2 bg-transparent hover:bg-zinc-800 border border-zinc-800 rounded-lg text-xs font-medium text-zinc-400 hover:text-zinc-100 transition-colors flex items-center gap-2"
              >
                <Clock size={14} />
                <span className="hidden sm:inline">History</span>
                {clipHistory.history.length > 0 && (
                  <span className="bg-crab-coral/20 text-crab-coral rounded-md px-1.5 py-0.5 text-[10px] font-semibold leading-none flex items-center justify-center">
                    {clipHistory.history.length}
                  </span>
                )}
              </button>
              <a
                href="https://github.com/akanupam"
                target="_blank"
                rel="noopener noreferrer"
                className="flex px-3 sm:px-4 py-2 bg-transparent hover:bg-zinc-800 border border-zinc-800 rounded-lg text-xs font-medium text-zinc-400 items-center gap-1.5 hover:text-zinc-100 transition-colors duration-200"
              >
                <span className="hidden sm:inline">Crafted by</span>
                <span className="text-crab-coral font-medium">akanupam</span>
              </a>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content Container */}
      <div className="flex-1 overflow-hidden px-4 lg:px-12 pb-4 lg:pb-8 z-10 pt-8 lg:pt-0">
        <div className="max-w-[1400px] mx-auto h-full flex flex-col lg:flex-row items-center justify-between gap-12 lg:gap-20">

          {/* Hero Section (Left) */}
          <div className="w-full lg:flex-1 flex flex-col items-center lg:items-start justify-center text-center lg:text-left animate-fade-in max-w-2xl xl:max-w-3xl relative h-[600px] lg:h-[620px] py-4 lg:py-6 space-y-10 lg:space-y-12">

            <div className="space-y-6 lg:space-y-8 w-full">
              <div className="flex flex-row items-center justify-center lg:justify-start gap-4 lg:gap-8 w-full">
                <div className="relative w-28 h-28 sm:w-36 sm:h-36 lg:w-40 lg:h-40 xl:w-48 xl:h-48 hover:scale-[1.05] transition-transform duration-500 flex-shrink-0">
                  <Image src="/crab-mascot.png" alt="Mascot" fill className="object-contain relative z-10" priority />
                </div>
                
                <div className="flex flex-col items-start justify-center pt-0 lg:pt-4 xl:pt-8 space-y-2 sm:space-y-3 lg:space-y-4">
                  <h2 className="text-4xl lg:text-5xl xl:text-[4.5rem] font-extrabold tracking-tight text-zinc-100 leading-[1.1]">
                    Crab<span className="text-transparent bg-clip-text bg-gradient-to-r from-crab-coral to-orange-400">Clip</span>
                  </h2>
                  <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-zinc-900/80 border border-zinc-800 shadow-sm">
                    <span className="flex h-2 w-2 rounded-full bg-emerald-500 animate-pulse"></span>
                    <span className="text-[10px] lg:text-xs font-semibold text-zinc-300 tracking-wide uppercase">Secure · Fast · Anonymous</span>
                  </div>
                </div>
              </div>
              
              <div className="space-y-4 lg:space-y-5 w-full pl-0 lg:pl-2">
                <p className="text-3xl lg:text-4xl xl:text-5xl text-zinc-300 font-semibold leading-relaxed max-w-lg mx-auto lg:mx-0">
                  Your go-to online clipboard.
                </p>
                
                <ul className="text-base lg:text-lg text-zinc-400 font-medium leading-relaxed max-w-lg mx-auto lg:mx-0 space-y-2 lg:space-y-3 text-left w-max lg:w-auto">
                  <li className="flex items-center gap-3">
                    <span className="w-1.5 h-1.5 rounded-full bg-crab-coral flex-shrink-0"></span>
                    Drop text or files to generate a secure code.
                  </li>
                  <li className="flex items-center gap-3">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 flex-shrink-0"></span>
                    Clips self-destruct instantly after retrieval.
                  </li>
                  <li className="flex items-center gap-3">
                    <span className="w-1.5 h-1.5 rounded-full bg-zinc-500 flex-shrink-0"></span>
                    No tracking, no logs, and no accounts required.
                  </li>
                </ul>
              </div>
            </div>

            <div className="flex flex-wrap gap-4 lg:gap-6 justify-center lg:justify-start relative z-10 w-full pl-0 lg:pl-2">
              <div className="flex items-center gap-3 px-5 py-3 lg:px-6 lg:py-4 bg-zinc-900/40 border border-zinc-800/80 rounded-xl text-base font-medium text-zinc-300 shadow-sm backdrop-blur-sm">
                <ShieldCheck size={22} className="text-emerald-500" />
                End-to-End Secure
              </div>
              <div className="flex items-center gap-3 px-5 py-3 lg:px-6 lg:py-4 bg-zinc-900/40 border border-zinc-800/80 rounded-xl text-base font-medium text-zinc-300 shadow-sm backdrop-blur-sm">
                <Ghost size={22} className="text-crab-coral" />
                No Traces Left
              </div>
            </div>
          </div>

          {/* Main Functional Container (Right) */}
          <div className="w-full lg:w-[500px] xl:w-[560px] flex items-center justify-center relative z-10 h-[600px] lg:h-[620px] flex-shrink-0 mx-auto lg:mx-0">
            <div className="glass-panel p-6 lg:p-8 w-full h-full animate-slide-up flex flex-col">
              
              {!isReady ? (
                <div className="h-full w-full flex flex-col items-center justify-center space-y-4 opacity-70 animate-pulse">
                  <div className="w-10 h-10 border-2 border-zinc-800 border-t-crab-coral rounded-full animate-spin" />
                  <p className="text-sm font-medium text-zinc-400">Initializing...</p>
                </div>
              ) : (
                <>
                  {/* Segmented Tab Control */}
                  <div className="relative flex bg-zinc-950 p-1 rounded-lg mb-6 border border-zinc-800">
                    <div
                      className="absolute top-1 bottom-1 w-[calc(50%-0.25rem)] bg-zinc-800 rounded-md transition-transform duration-300 ease-in-out"
                      style={{
                        transform: activeTab === 'share' ? 'translateX(0)' : 'translateX(100%)',
                      }}
                    />
                    <button
                      onClick={() => setActiveTab('share')}
                      className={`relative z-10 flex-1 py-2.5 text-sm font-medium transition-colors duration-300 ${activeTab === 'share'
                          ? 'text-zinc-100'
                          : 'text-zinc-400 hover:text-zinc-200'
                        }`}
                    >
                      Share
                    </button>
                    <button
                      onClick={() => setActiveTab('retrieve')}
                      className={`relative z-10 flex-1 py-2.5 text-sm font-medium transition-colors duration-300 ${activeTab === 'retrieve'
                          ? 'text-zinc-100'
                          : 'text-zinc-400 hover:text-zinc-200'
                        }`}
                    >
                      Retrieve
                    </button>
                  </div>

                  <div className="flex-1 overflow-hidden relative">
                    <div
                      className="flex h-full w-[200%] transition-transform duration-500 ease-in-out"
                      style={{ transform: activeTab === 'share' ? 'translateX(0)' : 'translateX(-50%)' }}
                    >
                      <div className="w-1/2 h-full flex flex-col overflow-hidden min-h-0">
                        <div className="h-full flex flex-col min-h-0">
                          {!otp ? (
                            <>
                              <PasteForm onPaste={handlePaste} loading={createLoading} />
                              {createError && (
                                <div className="mt-4 p-4 rounded-lg bg-red-950/30 border border-red-900 text-red-400 text-sm font-medium animate-slide-up text-center">
                                  {createError}
                                </div>
                              )}
                            </>
                          ) : (
                            <div className="animate-scale-in h-full flex flex-col gap-4">
                              <OtpDisplay otp={otp} expiresAt={expiresAt!} />
                              <button onClick={handleResetCreate} className="btn-secondary w-full shrink-0">
                                New Clip
                              </button>
                            </div>
                          )}
                        </div>
                      </div>

                      <div className="w-1/2 h-full flex flex-col overflow-hidden min-h-0">
                        <div className="h-full flex flex-col min-h-0">
                          {!retrievedContent ? (
                            isAutoFetching ? (
                              <div className="h-full flex flex-col items-center justify-center space-y-4 opacity-90">
                                <div className="w-10 h-10 border-2 border-zinc-800 border-t-crab-coral rounded-full animate-spin" />
                                <p className="text-sm font-medium text-zinc-400">Decrypting...</p>
                              </div>
                            ) : (
                              <>
                                <RetrieveForm onRetrieve={handleRetrieve} loading={retrieveLoading} />
                                {retrieveError && (
                                  <div className="mt-4 p-4 rounded-lg bg-red-950/30 border border-red-900 text-red-400 text-sm font-medium animate-slide-up text-center">
                                    {retrieveError}
                                  </div>
                                )}
                              </>
                            )
                          ) : (
                            <div className="animate-scale-in h-full flex flex-col gap-4">
                              <ContentDisplay
                                content={retrievedContent}
                                content_type={retrievedContentType}
                                encoding={retrievedEncoding}
                                filename={retrievedFilename}
                              />
                              <button onClick={handleResetRetrieve} className="btn-secondary w-full shrink-0">
                                Fetch Another
                              </button>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                </>
              )}
            </div>
          </div>
      </div>
      </div>

      {/* History Modal */}
      {showHistory && (
        <div className="fixed inset-0 bg-zinc-950/80 backdrop-blur-sm flex items-center justify-center p-4 z-50 animate-fade-in">
          <div className="glass-panel max-w-xl w-full max-h-[85vh] overflow-hidden flex flex-col animate-scale-in">
            <div className="px-6 py-5 border-b border-zinc-800 flex items-center justify-between bg-zinc-900">
              <h3 className="text-lg font-semibold text-zinc-100 tracking-tight">Secret History</h3>
              <button
                onClick={() => setShowHistory(false)}
                className="w-8 h-8 flex items-center justify-center rounded-md hover:bg-zinc-800 text-zinc-400 hover:text-zinc-100 transition-colors"
              >
                <X size={20} />
              </button>
            </div>
            <div className="p-6 overflow-y-auto no-scrollbar bg-zinc-950">
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

