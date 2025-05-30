// hooks/useEvents.ts
import Constants from 'expo-constants'
import { useState, useEffect } from 'react'
import { Event, EventCategory } from '@/types'

const { UNIDB_BASE_URL, UNIDB_CONTRACT_KEY } = Constants.manifest!.extra as Record<string,string>
const API_BASE = `${UNIDB_BASE_URL}/${UNIDB_CONTRACT_KEY}`

type EventsParams = {
  search?: string
  category?: EventCategory | null
}

export function useEvents(params: EventsParams = {}) {
  const [events, setEvents]       = useState<Event[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError]         = useState<string | null>(null)

  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true)
      setError(null)
      try {
        // 1) Llamada al API
        const res = await fetch(
          `${API_BASE}/data/events/all?format=json`
        )
        if (!res.ok) throw new Error(`HTTP ${res.status}`)
        const body = await res.json()
        const raw: { entry_id: string; data: any }[] = body.data

        const mapped: Event[] = raw.map(({ entry_id, data }) => ({
          id:            String(data.id),               // ← usa data.id, no entry_id
          name:          data.titulo,
          description:   data.descripcion,
          category:      (['Workshop','Presentation','Panel','Networking','Other'] as string[])
                          .includes(data.tema)
                          ? (data.tema as EventCategory)
                          : 'Other',
          date:          data.fecha,
          time:          data.hora_inicio && data.hora_fin
                            ? `${data.hora_inicio} - ${data.hora_fin}`
                            : '',
          location:      data.lugar  ?? '',
          imageUrl:      data.imageUrl ?? '',
          rating:        Number(data.rating)      || 0,
          ratingCount:   Number(data.ratingCount) || 0,
        }))

        // 3) Filtros cliente (search + category)
        let filtered = mapped
        if (params.search) {
          const term = params.search.toLowerCase()
          filtered = filtered.filter(e =>
            e.name.toLowerCase().includes(term) ||
            e.description.toLowerCase().includes(term)
          )
        }
        if (params.category) {
          filtered = filtered.filter(e => e.category === params.category)
        }

        setEvents(filtered)
      } catch (e: any) {
        console.error(e)
        setError(e.message ?? 'Error fetching events')
      } finally {
        setIsLoading(false)
      }
    }

    fetchData()
  }, [params.search, params.category])

  return { events, isLoading, error }
}
