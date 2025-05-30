// useSpeaker.ts
import { useState, useEffect } from 'react'
import Constants from 'expo-constants'
import { Speaker, Event } from '@/types'

const {
  UNIDB_BASE_URL,
  UNIDB_CONTRACT_KEY
} = (Constants.expoConfig!.extra as {
  UNIDB_BASE_URL: string
  UNIDB_CONTRACT_KEY: string
})
const BASE_URL = `${UNIDB_BASE_URL}/${UNIDB_CONTRACT_KEY}`

type RawRow<T> = { entry_id: string; data: T }

type RawSpeaker = {
  id: number
  name: string
}

type RawEventSpeaker = {
  event_id: number
  speaker_id: number
}

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

export function useSpeaker(id: string) {
  const [speaker, setSpeaker] = useState<Speaker | null>(null)
  const [events, setEvents] = useState<Event[]>([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    if (!id) {
      setIsLoading(false)
      return
    }

    const fetchSpeakerDetails = async () => {
      setIsLoading(true)
      try {
        // 1) Traigo todos los speakers
        const resS = await fetch(`${BASE_URL}/data/speakers/all?format=json`)
        const jsonS: any = await resS.json()
        const rawS: RawRow<RawSpeaker>[] = Array.isArray(jsonS?.data)
          ? jsonS.data
          : []

        // Busco el speaker
        const found = rawS.map(r => r.data).find(r => String(r.id) === id)
        if (!found) {
          setSpeaker(null)
          setEvents([])
          setIsLoading(false)
          return
        }
        setSpeaker({
          id: String(found.id),
          name: found.name,
          role: '',
          bio: '',
          eventCount: 0,
          rating: 0
        })

        // 2) Traigo relaciones event_speakers
        const resRel = await fetch(
          `${BASE_URL}/data/event_speakers/all?format=json`
        )
        const jsonRel: any = await resRel.json()
        const rawRel: RawRow<RawEventSpeaker>[] = Array.isArray(jsonRel?.data)
          ? jsonRel.data
          : []
        
        // Eliminar duplicados usando Set
        const eventIds = [...new Set(
          rawRel
            .map(r => r.data)
            .filter(r => String(r.speaker_id) === id)
            .map(r => r.event_id)
        )]

        // 3) Traigo todos los events
        const resE = await fetch(`${BASE_URL}/data/events/all?format=json`)
        const jsonE: any = await resE.json()
        const rawE: RawRow<RawEvent>[] = Array.isArray(jsonE?.data)
          ? jsonE.data
          : []

        // 4) Crear un Map para evitar eventos duplicados por ID
        const eventMap = new Map<number, Event>()
        
        rawE
          .map(r => r.data)
          .filter(e => eventIds.includes(e.id))
          .forEach(e => {
            if (!eventMap.has(e.id)) {
              eventMap.set(e.id, {
                id: String(e.id),
                name: e.titulo,
                description: e.descripcion,
                category: e.tema as any,
                date: e.fecha,
                time: `${e.hora_inicio} - ${e.hora_fin}`,
                location: e.location,
                imageUrl: e.imageUrl,
                rating: 0,
                ratingCount: e.suscritos
              })
            }
          })
        
        const myEvents: Event[] = Array.from(eventMap.values())
        setEvents(myEvents)
      } catch (err) {
        console.error('useSpeaker error:', err)
        setSpeaker(null)
        setEvents([])
      } finally {
        setIsLoading(false)
      }
    }

    fetchSpeakerDetails()
  }, [id])

  return { speaker, events, isLoading }
}
