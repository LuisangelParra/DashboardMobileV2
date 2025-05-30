// useFeedback.ts
import { useState, useEffect } from 'react'
import Constants from 'expo-constants'
import { Feedback, Event } from '@/types'

const {
  UNIDB_BASE_URL,
  UNIDB_CONTRACT_KEY
} = (Constants.expoConfig!.extra as {
  UNIDB_BASE_URL: string
  UNIDB_CONTRACT_KEY: string
})
const BASE_URL = `${UNIDB_BASE_URL}/${UNIDB_CONTRACT_KEY}`

type RawRow<T> = { entry_id: string; data: T }
type RawFeedback = {
  id: number
  event_id: number
  rating: number
  comment: string
  created_at?: string
}
type RawEvent = { id: number; titulo: string }

export function useFeedback(params: {
  sortBy?: 'date' | 'rating'
  sortOrder?: 'asc' | 'desc'
  eventId?: string | null
  rating?: number | null
} = {}) {
  const [feedback, setFeedback] = useState<Feedback[]>([])
  const [events, setEvents] = useState<Pick<Event, 'id' | 'name'>[]>([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const fetchFeedback = async () => {
      setIsLoading(true)
      try {
        // eventos (para nombre)
        const resE = await fetch(
          `${BASE_URL}/data/events/all?format=json`
        )
        const { data: rawE } = (await resE.json()) as {
          data: RawRow<RawEvent>[]
        }
        const evMap = rawE.map(r => r.data).reduce(
          (acc, e) => ((acc[String(e.id)] = e.titulo), acc),
          {} as Record<string, string>
        )
        setEvents(
          Object.entries(evMap).map(([id, name]) => ({
            id,
            name
          }))
        )

        // feedback
        const resF = await fetch(
          `${BASE_URL}/data/feedbacks/all?format=json`
        )
        const { data: rawF } = (await resF.json()) as {
          data: RawRow<RawFeedback>[]
        }
        let list = rawF.map(r => {
          const f = r.data
          return {
            id: String(f.id),
            eventId: String(f.event_id),
            eventName: evMap[String(f.event_id)] || '',
            rating: f.rating,
            comment: f.comment,
            date: f.created_at || ''
          }
        })

        // filtros
        if (params.eventId) {
          list = list.filter(f => f.eventId === params.eventId)
        }
        if (params.rating != null) {
          list = list.filter(f => f.rating === params.rating)
        }

        // orden
        const sortBy = params.sortBy || 'date'
        const asc = params.sortOrder === 'asc'
        list.sort((a, b) => {
          if (sortBy === 'rating') {
            return asc ? a.rating - b.rating : b.rating - a.rating
          }
          // date
          return asc
            ? new Date(a.date).getTime() - new Date(b.date).getTime()
            : new Date(b.date).getTime() - new Date(a.date).getTime()
        })

        setFeedback(list)
      } catch (err) {
        console.error('useFeedback error:', err)
      } finally {
        setIsLoading(false)
      }
    }
    fetchFeedback()
  }, [
    params.sortBy,
    params.sortOrder,
    params.eventId,
    params.rating
  ])

  return { feedback, events, isLoading }
}
