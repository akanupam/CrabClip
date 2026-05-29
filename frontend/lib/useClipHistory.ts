'use client'

import { useState, useEffect } from 'react'

export interface HistoryItem {
  otp: string
  content_preview: string // First 100 chars or thumbnail
  created_at: number // Timestamp
  ttl_minutes: 5 | 20 | 60
  content_type: string
}

const STORAGE_KEY = 'onlineclip_history'
const MAX_HISTORY_ITEMS = 20

export const useClipHistory = () => {
  const [history, setHistory] = useState<HistoryItem[]>([])
  const [isLoaded, setIsLoaded] = useState(false)

  // Load history from localStorage on mount and setup interval to clean expired clips
  useEffect(() => {
    const loadAndClean = () => {
      try {
        const stored = localStorage.getItem(STORAGE_KEY)
        if (stored) {
          const parsed = JSON.parse(stored)
          if (Array.isArray(parsed)) {
            const now = Date.now()
            const valid = parsed.filter(h => now < h.created_at + h.ttl_minutes * 60 * 1000)
            setHistory(valid)
            localStorage.setItem(STORAGE_KEY, JSON.stringify(valid))
          }
        }
      } catch (e) {
        console.warn('Failed to load history:', e)
      }
      setIsLoaded(true)
    }

    loadAndClean()

    const interval = setInterval(() => {
      setHistory(prev => {
        const now = Date.now()
        const valid = prev.filter(h => now < h.created_at + h.ttl_minutes * 60 * 1000)
        if (valid.length !== prev.length) {
          return valid
        }
        return prev
      })
    }, 10000) // check every 10 seconds

    return () => clearInterval(interval)
  }, [])

  // Save history to localStorage whenever it changes
  useEffect(() => {
    if (isLoaded) {
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(history))
      } catch (e) {
        console.warn('Failed to save history:', e)
      }
    }
  }, [history, isLoaded])

  const addToHistory = (item: HistoryItem) => {
    setHistory((prev) => {
      // Remove duplicates (same OTP)
      const filtered = prev.filter((h) => h.otp !== item.otp)
      // Add new item to front
      const updated = [item, ...filtered]
      // Keep only max items
      return updated.slice(0, MAX_HISTORY_ITEMS)
    })
  }

  const removeFromHistory = (otp: string) => {
    setHistory((prev) => prev.filter((h) => h.otp !== otp))
  }

  const clearHistory = () => {
    setHistory([])
  }

  const getPreview = (content: string, contentType: string): string => {
    if (contentType.startsWith('image/')) {
      return '[Image]'
    }
    if (contentType === 'application/pdf') {
      return '[PDF Document]'
    }
    return content.substring(0, 100).replace(/\n/g, ' ') + (content.length > 100 ? '...' : '')
  }

  return {
    history,
    addToHistory,
    removeFromHistory,
    clearHistory,
    getPreview,
  }
}
