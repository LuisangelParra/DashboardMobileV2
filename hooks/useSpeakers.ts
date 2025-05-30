// useSpeakers.ts
import { useState, useEffect } from 'react'
import Constants from 'expo-constants'
import { Speaker } from '@/types'

const {
  UNIDB_BASE_URL,
  UNIDB_CONTRACT_KEY
} = (Constants.expoConfig!.extra as {
  UNIDB_BASE_URL: string
  UNIDB_CONTRACT_KEY: string
})
const BASE_URL = `${UNIDB_BASE_URL}/${UNIDB_CONTRACT_KEY}`

type RawRow<T> = { entry_id: string; data: T }
type RawSpeaker = { id: number; name: string }
type RawEventSpeaker = { event_id: number; speaker_id: number }

export function useSpeakers(params: { search?: string } = {}) {
  const [speakers, setSpeakers] = useState<Speaker[]>([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const fetchSpeakers = async () => {
      setIsLoading(true)
      try {
        // all speakers
        const resS = await fetch(
          `${BASE_URL}/data/speakers/all?format=json`
        )
        const { data: rawS } = (await resS.json()) as {
          data: RawRow<RawSpeaker>[]
        }
        const base = rawS.map(r => r.data)

        // puente para contar eventos
        const resRel = await fetch(
          `${BASE_URL}/data/event_speakers/all?format=json`
        )
        const { data: rawRel } = (await resRel.json()) as {
          data: RawRow<RawEventSpeaker>[]
        }
        const rels = rawRel.map(r => r.data)

        // map a tipo Speaker
        let list: Speaker[] = base.map(s => {
          const count = rels.filter(r => r.speaker_id === s.id).length
          return {
            id: String(s.id),
            name: s.name,
            role: '',
            bio: '',
            eventCount: count,
            rating: 0
          }
        })

        if (params.search) {
          const term = params.search.toLowerCase()
          list = list.filter(
            s =>
              s.name.toLowerCase().includes(term)
          )
        }

        setSpeakers(list)
      } catch (err) {
        console.error('useSpeakers error:', err)
      } finally {
        setIsLoading(false)
      }
    }
    fetchSpeakers()
  }, [params.search])

  return { speakers, isLoading }
}
