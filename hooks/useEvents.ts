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

export function useEvents(params: {
  search?: string
  category?: EventCategory | null
} = {}) {
  const [events, setEvents] = useState<Event[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [refreshFlag, setRefreshFlag] = useState(0)

  const refresh = useCallback(() => {
    setRefreshFlag(f => f + 1)
  }, [])

  useEffect(() => {
    const fetchAll = async () => {
      setIsLoading(true)
      try {
        // 1) Leer eventos
        const resE = await fetch(
          `${BASE_URL}/data/events/all?format=json`
        )
        const { data: rawE } = (await resE.json()) as {
          data: RawRow<RawEvent>[]
        }

        // 2) Leer feedbacks
        const resF = await fetch(
          `${BASE_URL}/data/feedbacks/all?format=json`
        )
        const { data: rawF } = (await resF.json()) as {
          data: RawRow<RawFeedback>[]
        }

        // 3) Agrupar feedbacks por evento
        const feedbackByEvent: Record<number, RawFeedback[]> = {}
        rawF.forEach(r => {
          const fb = r.data
          if (!feedbackByEvent[fb.event_id]) {
            feedbackByEvent[fb.event_id] = []
          }
          feedbackByEvent[fb.event_id].push(fb)
        })

        // 4) Mapear a nuestro tipo Event, calculando rating y ratingCount
        const mapped = rawE.map(r => {
          const e = r.data
          const fList = feedbackByEvent[e.id] || []
          const count = fList.length
          const avg =
            count > 0
              ? fList.reduce((sum, x) => sum + x.rating, 0) / count
              : 0

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
            location: '',                // si no tienes campo 'location' en DB
            imageUrl: e.imageUrl,
            rating: avg,
            ratingCount: count
          } as Event
        })

        // 5) Filtrar por search y categoría
        let filtered = mapped
        if (params.search) {
          const q = params.search.toLowerCase()
          filtered = filtered.filter(ev =>
            ev.name.toLowerCase().includes(q) ||
            ev.description.toLowerCase().includes(q)
          )
        }
        if (params.category) {
          filtered = filtered.filter(
            ev => ev.category === params.category
          )
        }

        setEvents(filtered)
      } catch (err) {
        console.error('useEvents error:', err)
      } finally {
        setIsLoading(false)
      }
    }

    fetchAll()
  }, [
    params.search,
    params.category,
    refreshFlag,   // vuelve a disparar la carga tras cada `refresh()`
  ])

  return { events, isLoading, refresh }
}
