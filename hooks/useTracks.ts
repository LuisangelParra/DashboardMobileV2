// hooks/useTracks.ts
import { useState, useEffect, useCallback } from 'react'
import Constants from 'expo-constants'

const {
  UNIDB_BASE_URL,
  UNIDB_CONTRACT_KEY
} = (Constants.expoConfig!.extra as {
  UNIDB_BASE_URL: string
  UNIDB_CONTRACT_KEY: string
})
const BASE_URL = `${UNIDB_BASE_URL}/${UNIDB_CONTRACT_KEY}`

type RawRow<T> = { entry_id: string; data: T }

export type Track = {
  id: string
  name: string
}

// Hook para leer **todos** los tracks disponibles
export function useTracks() {
  const [tracks, setTracks] = useState<Track[]>([])
  const [isLoading, setIsLoading] = useState(true)

  const fetchTracks = useCallback(async () => {
    setIsLoading(true)
    try {
      const res = await fetch(`${BASE_URL}/data/tracks/all?format=json`)
      const { data } = (await res.json()) as { data: RawRow<{ id: number; nombre: string }>[] }
      setTracks(
        data.map(r => ({
          id: String(r.data.id),
          name: r.data.nombre
        }))
      )
    } catch (err) {
      console.error('useTracks error:', err)
    } finally {
      setIsLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchTracks()
  }, [fetchTracks])

  return { tracks, isLoading, reload: fetchTracks }
}

// Hook para leer los tracks **de un evento** concreto
export function useEventTracks(eventId: string) {
  const [tracks, setTracks] = useState<Track[]>([])
  const [isLoading, setIsLoading] = useState(true)

  const fetchEventTracks = useCallback(async () => {
    if (!eventId) return
    setIsLoading(true)
    try {
      // 1) leer relaciones event_tracks
      const relRes = await fetch(`${BASE_URL}/data/event_tracks/all?format=json`)
      const { data: relData } = (await relRes.json()) as { data: RawRow<{ event_id: number; track_id: number }>[] }
      const assigned = relData
        .map(r => r.data)
        .filter(r => String(r.event_id) === eventId)
        .map(r => r.track_id)

      if (assigned.length === 0) {
        setTracks([])
      } else {
        // 2) leer la tabla tracks
        const trRes = await fetch(`${BASE_URL}/data/tracks/all?format=json`)
        const { data: trData } = (await trRes.json()) as { data: RawRow<{ id: number; nombre: string }>[] }
        setTracks(
          trData
            .map(r => r.data)
            .filter(t => assigned.includes(t.id))
            .map(t => ({ id: String(t.id), name: t.nombre }))
        )
      }
    } catch (err) {
      console.error('useEventTracks error:', err)
    } finally {
      setIsLoading(false)
    }
  }, [eventId])

  useEffect(() => {
    fetchEventTracks()
  }, [fetchEventTracks])

  return { tracks, isLoading, reload: fetchEventTracks }
}
