// hooks/useEvent.ts
import { useState, useEffect, useCallback } from 'react'
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

  // Función que realmente hace el fetch y mapea todo
  const fetchEventDetails = useCallback(async () => {
    if (!id) return
    setIsLoading(true)
    try {
      // --- 1) Leer eventos
      const resE = await fetch(`${BASE_URL}/data/events/all?format=json`)
      const { data: rawE } = (await resE.json()) as { data: RawRow<RawEvent>[] }
      const rawEvents = rawE.map(r => r.data)
      const rawEv = rawEvents.find(e => String(e.id) === id)
      if (!rawEv) {
        setEvent(null)
        setIsLoading(false)
        return
      }

      // --- 2) Leer relaciones event_speakers
      const resRel = await fetch(`${BASE_URL}/data/event_speakers/all?format=json`)
      const { data: rawRel } = (await resRel.json()) as { data: RawRow<RawEventSpeaker>[] }
      const rels = rawRel.map(r => r.data)
      const speakerIds = Array.from(
        new Set(
          rels.filter(r => String(r.event_id) === id).map(r => r.speaker_id)
        )
      )

      // --- 3) Leer speakers
      const resS = await fetch(`${BASE_URL}/data/speakers/all?format=json`)
      const { data: rawS } = (await resS.json()) as { data: RawRow<{ id: number; name: string }>[] }
      const rawSpeakers = rawS.map(r => r.data)
      const speakerMap = new Map<number, Speaker>()
      rawSpeakers
        .filter(s => speakerIds.includes(s.id))
        .forEach(s => {
          speakerMap.set(s.id, {
            id: String(s.id),
            name: s.name,
            role: '',
            bio: '',
            eventCount: 0,
            rating: 0
          })
        })
      setSpeakers(Array.from(speakerMap.values()))

      // --- 4) Leer feedbacks
      const resF = await fetch(`${BASE_URL}/data/feedbacks/all?format=json`)
      const { data: rawF } = (await resF.json()) as { data: RawRow<RawFeedback>[] }
      const allFb = rawF.map(r => r.data)
      const fList = allFb.filter(f => String(f.event_id) === id)
      setFeedback(
        fList.map(f => ({
          id: String(f.id),
          eventId: String(f.event_id),
          eventName: rawEv.titulo,
          rating: f.rating,
          comment: f.comment,
          date: f.created_at ?? ''
        }))
      )

      // --- 5) Calcular rating promedio y conteo
      const ratingCount = fList.length
      const rating =
        ratingCount > 0
          ? fList.reduce((sum, x) => sum + x.rating, 0) / ratingCount
          : 0

      // --- 6) Mapear Event
      setEvent({
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
      })
    } catch (err) {
      console.error('useEvent error:', err)
    } finally {
      setIsLoading(false)
    }
  }, [id])

  // Llamamos a la carga inicial
  useEffect(() => {
    fetchEventDetails()
  }, [fetchEventDetails])

  const deleteEvent = useCallback(async () => {
    try {
      // 1) eliminar relaciones event_speakers
      const relS = await fetch(`${BASE_URL}/data/event_speakers/all?format=json`)
      const { data: rawRelS } = (await relS.json()) as { data: RawRow<RawEventSpeaker>[] }
      for (const r of rawRelS.filter(r => String(r.data.event_id) === id)) {
        await fetch(`${BASE_URL}/data/event_speakers/delete/${r.entry_id}`, { method: 'DELETE' })
      }
      // 2) eliminar el evento
      const res = await fetch(`${BASE_URL}/data/events/delete/${id}`, { method: 'DELETE' })
      return res.ok
    } catch {
      return false
    }
  }, [id])

  // Exponemos reload para que, al volver de la edición, puedas recargar
  return {
    event,
    speakers,
    feedback,
    isLoading,
    deleteEvent,
    reload: fetchEventDetails
  }
}
