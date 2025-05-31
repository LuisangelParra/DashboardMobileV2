// hooks/useEvents.ts
import { useState, useEffect, useCallback } from 'react'
import Constants from 'expo-constants'
import { Event, EventCategory } from '@/types'

const {
  UNIDB_BASE_URL,
  UNIDB_CONTRACT_KEY
} = (Constants.expoConfig!.extra as {
  UNIDB_BASE_URL: string
  UNIDB_CONTRACT_KEY: string
})
const BASE_URL = `${UNIDB_BASE_URL}/${UNIDB_CONTRACT_KEY}`

type RawRow<T> = { entry_id: string; data: T }

type RawEvent = {
  id: number
  titulo: string
  descripcion: string
  tema: string
  ponente_id: number
  fecha: string       // "YYYY-MM-DD"
  hora_inicio: string // "HH:MM"
  hora_fin: string    // "HH:MM"
  max_participantes: number
  suscritos: number
  imageUrl: string
}

type RawFeedback = {
  id: number
  event_id: number
  rating: number
  comment: string
  created_at?: string
}

type RawTrack = {
  id: number
  nombre: string
}

type RawEventTrack = {
  event_id: number
  track_id: number
}

export function useEvents(params: {
  search?: string
  category?: EventCategory | null
} = {}) {
  const [events, setEvents] = useState<Event[]>([])
  const [isLoading, setIsLoading] = useState(true)

  const fetchAll = useCallback(async () => {
    setIsLoading(true)
    try {
      // 1) Leer eventos
      const resE = await fetch(`${BASE_URL}/data/events/all?format=json`)
      const { data: rawE } = (await resE.json()) as { data: RawRow<RawEvent>[] }

      // 2) Leer feedbacks
      const resF = await fetch(`${BASE_URL}/data/feedbacks/all?format=json`)
      const { data: rawF } = (await resF.json()) as { data: RawRow<RawFeedback>[] }

      // 3) Leer tracks
      const resT = await fetch(`${BASE_URL}/data/tracks/all?format=json`)
      const { data: rawT } = (await resT.json()) as { data: RawRow<RawTrack>[] }

      // 4) Leer event_tracks
      const resET = await fetch(`${BASE_URL}/data/event_tracks/all?format=json`)
      const { data: rawET } = (await resET.json()) as { data: RawRow<RawEventTrack>[] }

      // 5) Agrupar feedbacks por evento
      const feedbackByEvent: Record<number, RawFeedback[]> = {}
      rawF.forEach(r => {
        const fb = r.data
        if (!feedbackByEvent[fb.event_id]) feedbackByEvent[fb.event_id] = []
        feedbackByEvent[fb.event_id].push(fb)
      })

      // 6) Mapa de tracks
      const trackMap: Record<number, string> = {}
      rawT.forEach(r => { trackMap[r.data.id] = r.data.nombre })

      // 7) Agrupar tracks por evento
      const tracksByEvent: Record<number, number[]> = {}
      rawET.forEach(r => {
        const { event_id, track_id } = r.data
        if (!tracksByEvent[event_id]) tracksByEvent[event_id] = []
        tracksByEvent[event_id].push(track_id)
      })

      // 8) Mapear a nuestro tipo Event
      const mapped = rawE.map(r => {
        const e = r.data
        const fList = feedbackByEvent[e.id] || []
        const count = fList.length
        const avg = count > 0
          ? fList.reduce((sum, x) => sum + x.rating, 0) / count
          : 0

        // tracks de este evento
        const trackIds = tracksByEvent[e.id] || []
        const trackNames = trackIds
          .map(tid => trackMap[tid])
          .filter((n): n is EventCategory => !!n)

        return {
          id: String(e.id),
          name: e.titulo,
          description: e.descripcion,
          category: e.tema as EventCategory,
          date: new Date(e.fecha).toLocaleDateString(undefined, {
            month: 'short', day: 'numeric', year: 'numeric'
          }),
          time: `${e.hora_inicio} - ${e.hora_fin}`,
          location: '',         // si no lo tienes en DB
          imageUrl: e.imageUrl,
          rating: avg,
          ratingCount: count,
          tracks: trackNames
        }
      })

      // 9) Filtrar por search y categoría
      let filtered = mapped
      if (params.search) {
        const q = params.search.toLowerCase()
        filtered = filtered.filter(ev =>
          ev.name.toLowerCase().includes(q) ||
          ev.description.toLowerCase().includes(q)
        )
      }
      if (params.category) {
        filtered = filtered.filter(ev =>
          ev.tracks.includes(params.category!)
        )
      }

      setEvents(filtered)
    } catch (err) {
      console.error('useEvents error:', err)
    } finally {
      setIsLoading(false)
    }
  }, [params.search, params.category])

  useEffect(() => {
    fetchAll()
  }, [fetchAll])

  return {
    events,
    isLoading,
    refresh: fetchAll
  }
}
