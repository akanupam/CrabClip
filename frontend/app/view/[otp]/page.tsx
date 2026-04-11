'use client'

import { useEffect, useState } from 'react'
import { useParams } from 'next/navigation'
import { retrieveContent } from '../../../lib/api'
import ContentDisplay from '../../../components/ContentDisplay'
import RetrieveForm from '../../../components/RetrieveForm'
import Link from 'next/link'

export default function ViewPage() {
  const params = useParams()
  const otp = params.otp as string
  const [content, setContent] = useState<string | null>(null)
  const [loading, setLoading] = useState(!!otp)
  const [error, setError] = useState('')

  useEffect(() => {
    if (otp) {
      handleRetrieve(otp)
    }
  }, [otp])

  const handleRetrieve = async (otpValue: string) => {
    setLoading(true)
    setError('')
    try {
      const result = await retrieveContent(otpValue)
      setContent(result.content)
    } catch (err: any) {
      setError(err.message || 'Failed to retrieve content')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="w-full max-w-md">
      <div className="bg-white rounded-2xl shadow-2xl p-8">
        <div className="text-center mb-8">
          <h1 className="text-5xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent mb-2">
            CrabClip
          </h1>
          <p className="text-gray-600">Retrieve shared content</p>
        </div>

        {!content ? (
          <>
            <RetrieveForm 
              onRetrieve={handleRetrieve} 
              loading={loading}
              initialOtp={otp}
            />
            {error && (
              <div className="mt-4 bg-red-50 border-l-4 border-red-500 p-4 rounded">
                <p className="text-red-700 text-sm font-medium">{error}</p>
              </div>
            )}
          </>
        ) : (
          <>
            <ContentDisplay content={content} />
            <Link href="/">
              <button className="w-full mt-6 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white font-semibold py-3 px-4 rounded-lg transition transform hover:scale-105">
                ← Back to Home
              </button>
            </Link>
          </>
        )}
      </div>

      <div className="text-center mt-6 text-white text-sm opacity-75">
        <Link href="/" className="hover:opacity-100 transition">
          ⎘ Create a new paste
        </Link>
      </div>
    </div>
  )
}
