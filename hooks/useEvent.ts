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

// ✅ ACTUALIZADO: Incluir campos de capacidad
type RawEvent = {
  id: number
  titulo: string
  descripcion: string
  tema: string
  fecha: string
  hora_inicio: string
  hora_fin: string
  lugar: string
  imageUrl: string
  suscritos: number
  max_participantes: number
}

type RawEventSpeaker = {
  event_id: number
  speaker_id: number
}

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

  const fetchEventDetails = useCallback(async () => {
    if (!id) return
    setIsLoading(true)
    try {
      // ✅ AGREGAR TIMESTAMP PARA DATOS EN TIEMPO REAL
      const timestamp = Date.now()
      
      // --- 1) Leer todos los eventos ---
      const resE = await fetch(`${BASE_URL}/data/events/all?format=json&t=${timestamp}`, {
        headers: {
          'Cache-Control': 'no-cache',
          'Pragma': 'no-cache'
        }
      })
      const { data: rawE } = (await resE.json()) as { data: RawRow<RawEvent>[] }
      const rawEvents = rawE.map(r => r.data)

      // Buscar el RawEvent concreto
      const rawEv = rawEvents.find(e => String(e.id) === id)
      if (!rawEv) {
        setEvent(null)
        setIsLoading(false)
        return
      }

      // --- 2) Leer relaciones event_speakers ---
      const resRel = await fetch(`${BASE_URL}/data/event_speakers/all?format=json&t=${timestamp}`)
      const { data: rawRel } = (await resRel.json()) as { data: RawRow<RawEventSpeaker>[] }
      const rels = rawRel.map(r => r.data)
      const speakerIds = Array.from(
        new Set(
          rels.filter(r => String(r.event_id) === id).map(r => r.speaker_id)
        )
      )

      // --- 3) Leer todos los speakers ---
      const resS = await fetch(`${BASE_URL}/data/speakers/all?format=json&t=${timestamp}`)
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

      // --- 4) Leer todos los feedbacks ---
      const resF = await fetch(`${BASE_URL}/data/feedbacks/all?format=json&t=${timestamp}`)
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

      // --- 5) Calcular rating promedio y conteo ---
      const ratingCount = fList.length
      const rating = ratingCount > 0
        ? fList.reduce((sum, x) => sum + x.rating, 0) / ratingCount
        : 0

      // --- 6) Mapear a nuestro tipo Event (INCLUYENDO CAPACIDAD) ---
      setEvent({
        id: String(rawEv.id),
        name: rawEv.titulo,
        description: rawEv.descripcion,
        category: rawEv.tema as EventCategory,
        date: rawEv.fecha,
        time: `${rawEv.hora_inicio} - ${rawEv.hora_fin}`,
        location: rawEv.lugar,
        imageUrl: rawEv.imageUrl,
        rating,
        ratingCount,
        tracks: [],
        // ✅ NUEVOS CAMPOS DE CAPACIDAD
        currentCapacity: rawEv.suscritos || 0,
        maxCapacity: rawEv.max_participantes || 0
      })
    } catch (err) {
      console.error('useEvent error:', err)
    } finally {
      setIsLoading(false)
    }
  }, [id])

  // ✅ POLLING CADA 30 SEGUNDOS PARA DATOS EN TIEMPO REAL
  useEffect(() => {
    fetchEventDetails()
    
    const interval = setInterval(() => {
      fetchEventDetails()
    }, 30000) // Actualizar cada 30 segundos
    
    return () => clearInterval(interval)
  }, [fetchEventDetails])

  // Eliminar evento (y sus relaciones en event_speakers) basándose en el id
  const deleteEvent = useCallback(async () => {
    try {
      // 1) Eliminar relaciones event_speakers
      const relS = await fetch(`${BASE_URL}/data/event_speakers/all?format=json`)
      const { data: rawRelS } = (await relS.json()) as { data: RawRow<RawEventSpeaker>[] }
      for (const r of rawRelS.filter(r => String(r.data.event_id) === id)) {
        await fetch(`${BASE_URL}/data/event_speakers/delete/${r.entry_id}`, { method: 'DELETE' })
      }
      // 2) Eliminar el evento
      const res = await fetch(`${BASE_URL}/data/events/delete/${id}`, { method: 'DELETE' })
      return res.ok
    } catch {
      return false
    }
  }, [id])

  return {
    event,
    speakers,
    feedback,
    isLoading,
    deleteEvent,
    reload: fetchEventDetails
  }
}