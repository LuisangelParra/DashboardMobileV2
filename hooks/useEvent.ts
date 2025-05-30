// useEvent.ts
import { useState, useEffect } from 'react'
import Constants from 'expo-constants'
import { Event, Speaker, Feedback, EventCategory } from '@/types'

const {
  UNIDB_BASE_URL,
  UNIDB_CONTRACT_KEY
} = (Constants.expoConfig!.extra as {
  UNIDB_BASE_URL: string
  UNIDB_CONTRACT_KEY: string
})
const BASE_URL = `${UNIDB_BASE_URL}/${UNIDB_CONTRACT_KEY}`

type RawRow<T> = { entry_id: string; data: T }

// 1) Define la forma cruda de un evento en la DB
type RawEvent = {
  id: number
  titulo: string
  descripcion: string
  tema: string
  fecha: string
  hora_inicio: string
  hora_fin: string
  location: string
  imageUrl: string
  suscritos: number
}

// 2) Raw de la tabla puente
type RawEventSpeaker = {
  event_id: number
  speaker_id: number
}

// 3) Raw de feedback
type RawFeedback = {
  id: number
  event_id: number
  rating: number
  comment: string
  created_at?: string
}

export function useEvent(id: string) {
  const [event, setEvent] = useState<Event | null>(null)
  const [speakers, setSpeakers] = useState<Speaker[]>([])
  const [feedback, setFeedback] = useState<Feedback[]>([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    if (!id) return

    const fetchEventDetails = async () => {
      setIsLoading(true)
      try {
        // --- 1) Eventos ---
        const resE = await fetch(`${BASE_URL}/data/events/all?format=json`)
        const jsonE = (await resE.json()) as { data: RawRow<RawEvent>[] }
        const rawEvents = jsonE.data.map(r => r.data)

        // Buscar el rawEvent solicitado
        const rawEv = rawEvents.find(e => String(e.id) === id)
        if (!rawEv) {
          setEvent(null)
          setIsLoading(false)
          return
        }

        // --- 2) Relaciones event_speakers ---
        const resRel = await fetch(
          `${BASE_URL}/data/event_speakers/all?format=json`
        )
        const jsonRel = (await resRel.json()) as { data: RawRow<RawEventSpeaker>[] }
        const rels = jsonRel.data.map(r => r.data)
        const speakerIds = Array.from(
          new Set(
            rels
              .filter(r => String(r.event_id) === id)
              .map(r => r.speaker_id)
          )
        )

        // --- 3) Speakers ---
        const resS = await fetch(`${BASE_URL}/data/speakers/all?format=json`)
        const jsonS = (await resS.json()) as { data: RawRow<{ id: number; name: string }>[] }
        const rawSpeakers = jsonS.data.map(r => r.data)
        const speakerMap = new Map<number, Speaker>()
        rawSpeakers
          .filter(s => speakerIds.includes(s.id))
          .forEach(s => {
            if (!speakerMap.has(s.id)) {
              speakerMap.set(s.id, {
                id: String(s.id),
                name: s.name,
                role: '',        // completa si añades más campos
                bio: '',
                eventCount: 0,
                rating: 0
              })
            }
          })
        setSpeakers(Array.from(speakerMap.values()))

        // --- 4) Feedback ---
        const resF = await fetch(`${BASE_URL}/data/feedbacks/all?format=json`)
        const jsonF = (await resF.json()) as { data: RawRow<RawFeedback>[] }
        const rawFb = jsonF.data.map(r => r.data)
        // Filtrar solo los de este evento
        const fList = rawFb.filter(f => String(f.event_id) === id)
        // Mapear al tipo Feedback
        const mappedFb: Feedback[] = fList.map(f => ({
          id: String(f.id),
          eventId: String(f.event_id),
          eventName: rawEv.titulo,
          rating: f.rating,
          comment: f.comment,
          date: f.created_at ?? ''
        }))
        setFeedback(mappedFb)

        // --- 5) Calcular rating y ratingCount ---
        const ratingCount = fList.length
        const rating =
          ratingCount > 0
            ? fList.reduce((sum, x) => sum + x.rating, 0) / ratingCount
            : 0

        // --- 6) Mapear el Event final con rating ---
        const mappedEvent: Event = {
          id: String(rawEv.id),
          name: rawEv.titulo,
          description: rawEv.descripcion,
          category: rawEv.tema as EventCategory,
          date: rawEv.fecha,
          time: `${rawEv.hora_inicio} - ${rawEv.hora_fin}`,
          location: rawEv.location,
          imageUrl: rawEv.imageUrl,
          rating,
          ratingCount
        }
        setEvent(mappedEvent)
      } catch (err) {
        console.error('useEvent error:', err)
      } finally {
        setIsLoading(false)
      }
    }

    fetchEventDetails()
  }, [id])

  const deleteEvent = async () => {
    try {
      const res = await fetch(
        `${BASE_URL}/data/events/delete/${id}`,
        { method: 'DELETE' }
      )
      return res.ok
    } catch {
      return false
    }
  }

  return { event, speakers, feedback, isLoading, deleteEvent }
}
