// useSpeaker.ts
import { useState, useEffect, useCallback } from 'react'
import { Speaker, Event } from '@/types'
import Constants from 'expo-constants'

const {
  UNIDB_BASE_URL,
  UNIDB_CONTRACT_KEY
} = (Constants.expoConfig!.extra as {
  UNIDB_BASE_URL: string
  UNIDB_CONTRACT_KEY: string
})
const BASE_URL = `${UNIDB_BASE_URL}/${UNIDB_CONTRACT_KEY}`

export function useSpeaker(id: string | null) {
  const [speaker, setSpeaker] = useState<Speaker | null>(null)
  const [speakerEntryId, setSpeakerEntryId] = useState<string | null>(null)
  const [events, setEvents] = useState<Event[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchSpeaker = useCallback(async () => {
    if (!id) {
      setIsLoading(false)
      return
    }

    try {
      setIsLoading(true)
      setError(null)
      console.log('📊 Cargando speaker ID:', id)
      
      // ✅ AGREGAR TIMESTAMP PARA EVITAR CACHE
      const timestamp = Date.now();
      const response = await fetch(`${BASE_URL}/data/speakers/all?format=json&t=${timestamp}`, {
        headers: {
          'Cache-Control': 'no-cache',
          'Pragma': 'no-cache'
        }
      })
      console.log('📊 Load Status:', response.status)
      
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: Failed to load speaker`)
      }
      
      const data = await response.json()
      console.log('🔍 All speakers data length:', data?.data?.length || 0)
      
      // ✅ PROCESAR LA RESPUESTA Y GUARDAR EL ENTRY_ID
      let foundEntry: any = null
      
      if (data && Array.isArray(data.data)) {
        console.log('🔍 Searching for speaker with ID:', id)
        
        // ✅ MOSTRAR TODOS LOS IDs DISPONIBLES PARA DEBUG
        data.data.forEach((entry: any, index: number) => {
          if (entry.data) {
            const speakerId = entry.data.id || entry.entry_id
            console.log(`🔍 Available speaker ${index}: ID="${speakerId}", Name="${entry.data.name}"`)
          }
        })
        
        foundEntry = data.data.find((entry: any) => {
          if (entry.data) {
            const speakerId = entry.data.id || entry.entry_id
            const speakerIdStr = String(speakerId)
            const searchIdStr = String(id)
            const match = speakerIdStr === searchIdStr
            console.log(`🔍 Comparing speaker ID "${speakerIdStr}" with search ID "${searchIdStr}" = ${match}`)
            return match
          }
          return false
        })
      }
      
      console.log('🔍 Found entry:', foundEntry ? 'YES' : 'NO')
      
      if (foundEntry && foundEntry.data) {
        // ✅ GUARDAR TANTO EL SPEAKER COMO EL ENTRY_ID
        const speakerData = foundEntry.data
        
        const normalizedSpeaker = {
          ...speakerData,
          id: speakerData.id || foundEntry.entry_id,
          name: speakerData.name || 'Unknown Speaker',
          email: speakerData.email || null,
          company: speakerData.company || null,
          phone: speakerData.phone || null,
          bio: speakerData.bio || 'No bio available',
          role: speakerData.role || 'Speaker',
          expertise: speakerData.expertise || [],
          social: speakerData.social || {},
          rating: speakerData.rating || 4.5,
          imageUrl: speakerData.imageUrl || null,
        }
        
        setSpeaker(normalizedSpeaker)
        setSpeakerEntryId(foundEntry.entry_id)
        setEvents([])
        
        console.log('✅ Speaker loaded:', normalizedSpeaker.name)
        console.log('✅ Entry ID:', foundEntry.entry_id)
      } else {
        console.log('❌ Speaker not found in data array')
        throw new Error(`Speaker with ID "${id}" not found`)
      }
      
    } catch (error) {
      console.error('❌ Error loading speaker:', error)
      setError(error instanceof Error ? error.message : 'Failed to load speaker')
      setSpeaker(null)
      setSpeakerEntryId(null)
      setEvents([])
    } finally {
      setIsLoading(false)
    }
  }, [id])

  useEffect(() => {
    fetchSpeaker()
  }, [fetchSpeaker])

  return {
    speaker,
    speakerEntryId,
    events,
    isLoading,
    error,
    refetch: fetchSpeaker,
  }
}
