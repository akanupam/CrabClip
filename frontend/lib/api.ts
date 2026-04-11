import axios from 'axios'

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8001'

const api = axios.create({
  baseURL: API_URL,
  timeout: 10000,
})

export interface PasteResponse {
  otp: string
  expires_at: number  // Unix timestamp in milliseconds
}

export interface RetrieveResponse {
  content: string
  content_type: string
  encoding: string
}

export const createPaste = async (
  content: string,
  ttl_minutes: number = 5,
  content_type: string = 'text/plain'
): Promise<PasteResponse> => {
  try {
    const response = await api.post('/paste', { content, ttl_minutes, content_type })
    return response.data
  } catch (error: any) {
    if (error.response) {
      throw new Error(error.response.data.detail || 'Failed to create paste')
    }
    throw new Error('Network error. Check backend connection.')
  }
}

export const retrieveContent = async (otp: string): Promise<RetrieveResponse> => {
  try {
    const response = await api.get(`/retrieve/${otp}`)
    return response.data
  } catch (error: any) {
    if (error.response) {
      if (error.response.status === 404) {
        throw new Error('OTP invalid or expired')
      } else if (error.response.status === 429) {
        throw new Error('Too many attempts. Try again later.')
      }
      throw new Error(error.response.data.detail || 'Failed to retrieve content')
    }
    throw new Error('Network error. Check backend connection.')
  }
}

export const checkHealth = async () => {
  try {
    const response = await api.get('/health')
    return response.data
  } catch (error) {
    throw error
  }
}
