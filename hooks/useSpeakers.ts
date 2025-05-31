// useSpeakers.ts
import { useState, useEffect, useCallback } from 'react'
import { Speaker } from '@/types'
import Constants from 'expo-constants'

const {
  UNIDB_BASE_URL,
  UNIDB_CONTRACT_KEY
} = (Constants.expoConfig!.extra as {
  UNIDB_BASE_URL: string
  UNIDB_CONTRACT_KEY: string
})
const BASE_URL = `${UNIDB_BASE_URL}/${UNIDB_CONTRACT_KEY}`

interface UseSpeakersOptions {
  search?: string
}

export function useSpeakers(options: UseSpeakersOptions = {}) {
  const [speakers, setSpeakers] = useState<Speaker[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchSpeakers = useCallback(async () => {
    try {
      setIsLoading(true)
      setError(null)
      console.log('📡 Fetching speakers from:', `${BASE_URL}/data/speakers/all?format=json`)
      
      const response = await fetch(`${BASE_URL}/data/speakers/all?format=json`)
      
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`)
      }
      
      const data = await response.json()
      console.log('🔍 RAW API Response:', data)
      
      // ✅ MANEJO ESPECÍFICO PARA EL FORMATO DE UniDB
      let speakersArray: Speaker[] = []
      
      if (data && Array.isArray(data.data)) {
        console.log('📋 Processing UniDB format, entries:', data.data.length)
        
        // ✅ Extraer el objeto .data de cada entrada
        speakersArray = data.data.map((entry: any) => {
          if (entry.data) {
            return {
              ...entry.data,
              // ✅ Usar el ID del objeto data, o el entry_id como fallback
              id: entry.data.id || entry.entry_id,
              name: entry.data.name || 'Unknown Speaker',
            }
          }
          return null
        }).filter(Boolean) // Eliminar entradas null
        
      } else if (Array.isArray(data)) {
        console.log('📋 Processing as direct array, length:', data.length)
        speakersArray = data
      } else {
        console.log('⚠️ Unexpected data format:', data)
      }
      
      console.log('🔍 Extracted speakers array:', speakersArray)
      
      // ✅ Normalizar datos y asegurar claves únicas
      const normalizedSpeakers = speakersArray.map((speaker, index) => ({
        ...speaker,
        name: speaker.name || `Speaker ${index + 1}`,
        email: speaker.email || null,
        company: speaker.company || null,
        id: speaker.id || `speaker-${Date.now()}-${index}`,
      }));
      
      // ✅ Eliminar duplicados por ID
      const uniqueSpeakers = normalizedSpeakers.filter((speaker, index, arr) => 
        arr.findIndex(s => s.id === speaker.id) === index
      );
      
      console.log(`✅ Final speakers (${uniqueSpeakers.length} unique):`, uniqueSpeakers)
      setSpeakers(uniqueSpeakers)
      
    } catch (error) {
      console.error('❌ Error fetching speakers:', error)
      setError(error instanceof Error ? error.message : 'Unknown error occurred')
      setSpeakers([])
    } finally {
      setIsLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchSpeakers()
  }, [fetchSpeakers])

  return {
    speakers,
    isLoading,
    error,
    refetch: fetchSpeakers,
  }
}
