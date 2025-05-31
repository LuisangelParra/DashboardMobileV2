import { useState, useEffect } from 'react'
import Constants from 'expo-constants'

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
  fecha: string
  hora_inicio: string
  hora_fin: string
  location: string
  imageUrl: string
  suscritos: number
}

type RawSpeaker = {
  id: number
  name: string
}

type RawFeedback = {
  id: number
  event_id: number
  rating: number
  comment: string
  created_at?: string
}

type RawEventSpeaker = {
  event_id: number
  speaker_id: number
}

export type DashboardStats = {
  totalEvents: number
  totalSpeakers: number
  totalFeedbacks: number
  averageRating: number
  upcomingEvents: number
  pastEvents: number
  eventsByCategory: Record<string, number>
  recentActivity: number
}

export function useDashboard() {
  const [stats, setStats] = useState<DashboardStats>({
    totalEvents: 0,
    totalSpeakers: 0,
    totalFeedbacks: 0,
    averageRating: 0,
    upcomingEvents: 0,
    pastEvents: 0,
    eventsByCategory: {},
    recentActivity: 0
  })
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const fetchDashboardData = async () => {
      setIsLoading(true)
      try {
        // Fetch events
        const resE = await fetch(`${BASE_URL}/data/events/all?format=json`)
        const jsonE = await resE.json()
        const rawEvents: RawRow<RawEvent>[] = Array.isArray(jsonE?.data) ? jsonE.data : []
        const baseEvents = rawEvents.map(r => r.data)

        // Fetch speakers
        const resS = await fetch(`${BASE_URL}/data/speakers/all?format=json`)
        const jsonS = await resS.json()
        const rawSpeakers: RawRow<RawSpeaker>[] = Array.isArray(jsonS?.data) ? jsonS.data : []
        const baseSpeakers = rawSpeakers.map(r => r.data)

        // Fetch feedbacks
        const resF = await fetch(`${BASE_URL}/data/feedbacks/all?format=json`)
        const jsonF = await resF.json()
        const rawFeedbacks: RawRow<RawFeedback>[] = Array.isArray(jsonF?.data) ? jsonF.data : []
        const feedbacks = rawFeedbacks.map(r => r.data)

        // ✅ ELIMINAR DUPLICADOS CON MAP (IGUAL QUE EN LOS OTROS HOOKS)
        
        // Eventos únicos
        const eventMap = new Map<number, RawEvent>()
        baseEvents.forEach(e => {
          if (!eventMap.has(e.id)) {
            eventMap.set(e.id, e)
          }
        })

        // Speakers únicos
        const speakerMap = new Map<number, RawSpeaker>()
        baseSpeakers.forEach(s => {
          if (!speakerMap.has(s.id)) {
            speakerMap.set(s.id, s)
          }
        })

        const uniqueEvents = Array.from(eventMap.values())
        const uniqueSpeakers = Array.from(speakerMap.values())

        console.log(`🔍 DASHBOARD useDashboard.ts - Raw: events ${baseEvents.length}, speakers ${baseSpeakers.length}`)
        console.log(`📊 DASHBOARD useDashboard.ts - Únicos: events ${uniqueEvents.length}, speakers ${uniqueSpeakers.length}`)

        // Calculate stats usando eventos únicos
        const today = new Date()
        const upcomingEvents = uniqueEvents.filter(e => new Date(e.fecha) >= today).length
        const pastEvents = uniqueEvents.filter(e => new Date(e.fecha) < today).length

        // Average rating
        const validRatings = feedbacks.filter(f => f.rating > 0)
        const averageRating = validRatings.length > 0 
          ? validRatings.reduce((sum, f) => sum + f.rating, 0) / validRatings.length 
          : 0

        // Events by category usando eventos únicos
        const eventsByCategory = uniqueEvents.reduce((acc, event) => {
          const category = event.tema || 'Other'
          acc[category] = (acc[category] || 0) + 1
          return acc
        }, {} as Record<string, number>)

        // Recent activity (feedbacks from last 7 days)
        const weekAgo = new Date()
        weekAgo.setDate(weekAgo.getDate() - 7)
        const recentActivity = feedbacks.filter(f => 
          f.created_at && new Date(f.created_at) >= weekAgo
        ).length

        setStats({
          totalEvents: uniqueEvents.length,        // ✅ Usando eventos únicos
          totalSpeakers: uniqueSpeakers.length,    // ✅ Usando speakers únicos
          totalFeedbacks: feedbacks.length,
          averageRating,
          upcomingEvents,
          pastEvents,
          eventsByCategory,
          recentActivity
        })

      } catch (error) {
        console.error('Error fetching dashboard data:', error)
      } finally {
        setIsLoading(false)
      }
    }

    fetchDashboardData()
  }, [])

  return { stats, isLoading }
}