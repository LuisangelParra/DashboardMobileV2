// useEvent.ts
import { useState, useEffect } from 'react'
import Constants from 'expo-constants'
import { Event, Speaker, Feedback } from '@/types'

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
        // --- Eventos ---
        const resE = await fetch(
          `${BASE_URL}/data/events/all?format=json`
        )
        const jsonE = (await resE.json()) as {
          data: RawRow<RawEvent>[]
        }
        // extrae solo el `.data`
        const rawEvents = jsonE.data.map(r => r.data)
        // mapea a tu tipo Event
        const allEvents: Event[] = rawEvents.map(e => ({
          id: String(e.id),
          name: e.titulo,
          description: e.descripcion,
          category: e.tema as any,
          date: e.fecha,
          time: `${e.hora_inicio} - ${e.hora_fin}`,
          location: e.location,
          imageUrl: e.imageUrl,
          rating: 0,              // si no lo tienes en DB, ajusta
          ratingCount: e.suscritos
        }))
        const ev = allEvents.find(e => e.id === id) || null
        setEvent(ev)

        // --- Puente event_speakers ---
        const resRel = await fetch(
          `${BASE_URL}/data/event_speakers/all?format=json`
        )
        const jsonRel = (await resRel.json()) as {
          data: RawRow<RawEventSpeaker>[]
        }
        const rels = jsonRel.data.map(r => r.data)
        // Eliminar duplicados usando Set
        const speakerIds = [...new Set(
          rels
            .filter(r => String(r.event_id) === id)
            .map(r => r.speaker_id)
        )]

        // --- Speakers ---
        const resS = await fetch(
          `${BASE_URL}/data/speakers/all?format=json`
        )
        const jsonS = (await resS.json()) as {
          data: RawRow<{ id: number; name: string }>[]
        }
        const rawSpeakers = jsonS.data.map(r => r.data)
        
        // Crear un Map para evitar speakers duplicados por ID
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
        
        const uniqueSpeakers: Speaker[] = Array.from(speakerMap.values())
        setSpeakers(uniqueSpeakers)

        // --- Feedback ---
        const resF = await fetch(
          `${BASE_URL}/data/feedbacks/all?format=json`
        )
        const jsonF = (await resF.json()) as {
          data: RawRow<RawFeedback>[]
        }
        const rawFb = jsonF.data.map(r => r.data)
        const allFb: Feedback[] = rawFb.map(f => ({
          id: String(f.id),
          eventId: String(f.event_id),
          eventName: ev?.name ?? '',
          rating: f.rating,
          comment: f.comment,
          date: f.created_at ?? ''
        }))
        setFeedback(
          allFb.filter(fb => fb.eventId === id)
        )
      } catch (err) {
        console.error(err)
      } finally {
        setIsLoading(false)
      }
    }
    fetchEventDetails()
  }, [id])

  const deleteEvent = async () => {
    const res = await fetch(
      `${BASE_URL}/data/events/delete/${id}`,
      { method: 'DELETE' }
    )
    return res.ok
  }

  return { event, speakers, feedback, isLoading, deleteEvent }
}
