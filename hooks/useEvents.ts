// hooks/useEvents.ts
import { useState, useEffect, useCallback } from 'react'
import { useFocusEffect } from '@react-navigation/native'
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
  ponente: string
  invitados_especiales: string[]
  modalidad: string
  lugar: string
  plataforma?: string
  fecha: string
  hora_inicio: string
  hora_fin: string
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
  optimisticEvent?: Event | null
} = {}) {
  const [events, setEvents] = useState<Event[]>([])
  const [isLoading, setIsLoading] = useState(true)

  const fetchAll = useCallback(async () => {
    console.log('🔄 useEvents: Fetching events with capacity data...')
    setIsLoading(true)
    try {
      // ✅ AGREGAR TIMESTAMP PARA DATOS EN TIEMPO REAL
      const timestamp = Date.now()
      
      // 1) Leer todos los eventos
      const resE = await fetch(`${BASE_URL}/data/events/all?format=json&t=${timestamp}`, {
        headers: {
          'Cache-Control': 'no-cache',
          'Pragma': 'no-cache'
        }
      })
      const { data: rawE } = (await resE.json()) as { data: RawRow<RawEvent>[] }
      console.log('📊 useEvents: Raw events loaded:', rawE.length)

      // 2) Leer todos los feedbacks
      const resF = await fetch(`${BASE_URL}/data/feedbacks/all?format=json&t=${timestamp}`)
      const { data: rawF } = (await resF.json()) as { data: RawRow<RawFeedback>[] }

      // 3) Leer todos los tracks
      const resT = await fetch(`${BASE_URL}/data/tracks/all?format=json&t=${timestamp}`)
      const { data: rawT } = (await resT.json()) as { data: RawRow<RawTrack>[] }

      // 4) Leer todas las relaciones event_tracks
      const resET = await fetch(`${BASE_URL}/data/event_tracks/all?format=json&t=${timestamp}`)
      const { data: rawET } = (await resET.json()) as { data: RawRow<RawEventTrack>[] }

      // 5) Eliminar duplicados de eventos usando Map
      const eventMap = new Map<number, RawEvent>()
      rawE.forEach(r => {
        if (!eventMap.has(r.data.id)) {
          eventMap.set(r.data.id, r.data)
        }
      })
      const uniqueEventsList = Array.from(eventMap.values())
      console.log('📊 useEvents: Unique events after deduplication:', uniqueEventsList.length)

      // 6) Agrupar feedbacks por event_id
      const feedbackByEvent: Record<number, RawFeedback[]> = {}
      rawF.forEach(r => {
        const fb = r.data
        if (!feedbackByEvent[fb.event_id]) feedbackByEvent[fb.event_id] = []
        feedbackByEvent[fb.event_id].push(fb)
      })

      // 7) Crear un mapa de trackId → nombre
      const trackMap: Record<number, string> = {}
      rawT.forEach(r => {
        trackMap[r.data.id] = r.data.nombre
      })

      // 8) Agrupar track IDs por event_id
      const tracksByEvent: Record<number, number[]> = {}
      rawET.forEach(r => {
        const { event_id, track_id } = r.data
        if (!tracksByEvent[event_id]) tracksByEvent[event_id] = []
        tracksByEvent[event_id].push(track_id)
      })

      // 9) Mapear cada evento crudo a nuestro tipo Event (INCLUYENDO CAPACIDAD)
      const mapped = uniqueEventsList.map(e => {
        const fList = feedbackByEvent[e.id] || []
        const count = fList.length
        const avg = count > 0
          ? fList.reduce((sum, x) => sum + x.rating, 0) / count
          : 0

        // Obtener lista de nombres de tracks para este evento
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
            month: 'short',
            day: 'numeric',
            year: 'numeric'
          }),
          time: `${e.hora_inicio} - ${e.hora_fin}`,
          location: e.lugar,
          imageUrl: e.imageUrl,
          rating: avg,
          ratingCount: count,
          tracks: trackNames,
          // ✅ NUEVOS CAMPOS DE CAPACIDAD
          currentCapacity: e.suscritos || 0,
          maxCapacity: e.max_participantes || 0
        }
      })

      // 10) Aplicar filtros de búsqueda y categoría
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

      // 11) Agregar evento optimista si existe
      if (params.optimisticEvent) {
        filtered = [params.optimisticEvent, ...filtered]
      }

      // 12) Ordenar por fecha (más recientes primero)
      filtered.sort((a, b) => {
        const dateA = new Date(a.date)
        const dateB = new Date(b.date)
        return dateB.getTime() - dateA.getTime()
      })

      console.log('✅ useEvents: Final filtered events with capacity:', filtered.length)
      setEvents(filtered)
    } catch (err) {
      console.error('❌ useEvents error:', err)
      setEvents([])
    } finally {
      setIsLoading(false)
    }
  }, [params.search, params.category, params.optimisticEvent])

  // ✅ POLLING CADA 60 SEGUNDOS PARA CAPACIDAD EN TIEMPO REAL
  useEffect(() => {
    fetchAll()
    
    const interval = setInterval(() => {
      fetchAll()
    }, 60000) // Actualizar cada minuto
    
    return () => clearInterval(interval)
  }, [fetchAll])

  // Recargar automáticamente cuando la pantalla reciba el foco
  useFocusEffect(
    useCallback(() => {
      console.log('🎯 Events screen focused - refreshing capacity data')
      fetchAll()
    }, [fetchAll])
  )

  return {
    events,
    isLoading,
    refresh: fetchAll
  }
}