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

type RawTrack = {
  id: number
  nombre: string
}

type RawEventTrack = {
  event_id: number
  track_id: number
}

export type DashboardStats = {
  totalEvents: number
  totalSpeakers: number
  totalFeedbacks: number
  averageRating: number
  upcomingEvents: number
  pastEvents: number
  eventsByCategory: Record<string, number> // Ahora será por tracks reales
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
        console.log('📊 Fetching dashboard data with real tracks...')
        
        // Agregar timestamp para evitar cache
        const timestamp = Date.now()

        // 1. Fetch events
        const resE = await fetch(`${BASE_URL}/data/events/all?format=json&t=${timestamp}`)
        const jsonE = await resE.json()
        const rawEvents: RawRow<RawEvent>[] = Array.isArray(jsonE?.data) ? jsonE.data : []
        const baseEvents = rawEvents.map(r => r.data)

        // 2. Fetch speakers
        const resS = await fetch(`${BASE_URL}/data/speakers/all?format=json&t=${timestamp}`)
        const jsonS = await resS.json()
        const rawSpeakers: RawRow<RawSpeaker>[] = Array.isArray(jsonS?.data) ? jsonS.data : []
        const baseSpeakers = rawSpeakers.map(r => r.data)

        // 3. Fetch feedbacks
        const resF = await fetch(`${BASE_URL}/data/feedbacks/all?format=json&t=${timestamp}`)
        const jsonF = await resF.json()
        const rawFeedbacks: RawRow<RawFeedback>[] = Array.isArray(jsonF?.data) ? jsonF.data : []
        const feedbacks = rawFeedbacks.map(r => r.data)

        // 4. Fetch tracks
        const resT = await fetch(`${BASE_URL}/data/tracks/all?format=json&t=${timestamp}`)
        const jsonT = await resT.json()
        const rawTracks: RawRow<RawTrack>[] = Array.isArray(jsonT?.data) ? jsonT.data : []
        const tracks = rawTracks.map(r => r.data)

        // 5. Fetch event-track relationships
        const resET = await fetch(`${BASE_URL}/data/event_tracks/all?format=json&t=${timestamp}`)
        const jsonET = await resET.json()
        const rawEventTracks: RawRow<RawEventTrack>[] = Array.isArray(jsonET?.data) ? jsonET.data : []
        const eventTracks = rawEventTracks.map(r => r.data)

        console.log(`🔍 Raw data loaded:`, {
          events: baseEvents.length,
          speakers: baseSpeakers.length,
          feedbacks: feedbacks.length,
          tracks: tracks.length,
          eventTracks: eventTracks.length
        })

        // 6. Eliminar duplicados con Map (igual que en otros hooks)
        const eventMap = new Map<number, RawEvent>()
        baseEvents.forEach(e => {
          if (!eventMap.has(e.id)) {
            eventMap.set(e.id, e)
          }
        })

        const speakerMap = new Map<number, RawSpeaker>()
        baseSpeakers.forEach(s => {
          if (!speakerMap.has(s.id)) {
            speakerMap.set(s.id, s)
          }
        })

        const uniqueEvents = Array.from(eventMap.values())
        const uniqueSpeakers = Array.from(speakerMap.values())

        console.log(`📊 Unique data:`, {
          events: uniqueEvents.length,
          speakers: uniqueSpeakers.length
        })

        // 7. Crear mapa de trackId → nombre
        const trackMap: Record<number, string> = {}
        tracks.forEach(track => {
          trackMap[track.id] = track.nombre
        })

        // 8. Crear mapa de eventId → trackIds
        const eventToTracksMap: Record<number, number[]> = {}
        eventTracks.forEach(relation => {
          const { event_id, track_id } = relation
          if (!eventToTracksMap[event_id]) {
            eventToTracksMap[event_id] = []
          }
          eventToTracksMap[event_id].push(track_id)
        })

        // 9. Calcular estadísticas básicas
        const today = new Date()
        today.setHours(0, 0, 0, 0)

        const upcomingEvents = uniqueEvents.filter(e => {
          try {
            const eventDate = new Date(e.fecha)
            eventDate.setHours(0, 0, 0, 0)
            return eventDate >= today
          } catch {
            return false
          }
        }).length

        const pastEvents = uniqueEvents.filter(e => {
          try {
            const eventDate = new Date(e.fecha)
            eventDate.setHours(0, 0, 0, 0)
            return eventDate < today
          } catch {
            return false
          }
        }).length

        // 10. Calcular rating promedio
        const validRatings = feedbacks.filter(f => f.rating > 0 && f.rating <= 5)
        const averageRating = validRatings.length > 0 
          ? validRatings.reduce((sum, f) => sum + f.rating, 0) / validRatings.length 
          : 0

        // 11. Calcular eventos por track (la parte importante)
        const eventsByTrack: Record<string, number> = {}

        // Inicializar todos los tracks con 0
        tracks.forEach(track => {
          eventsByTrack[track.nombre] = 0
        })

        // Contar eventos por track usando las relaciones reales
        uniqueEvents.forEach(event => {
          const trackIds = eventToTracksMap[event.id] || []
          
          if (trackIds.length === 0) {
            // Si no tiene tracks asignados, contarlo como "Sin categoría"
            eventsByTrack['Sin categoría'] = (eventsByTrack['Sin categoría'] || 0) + 1
          } else {
            // Contar el evento para cada track asignado
            trackIds.forEach(trackId => {
              const trackName = trackMap[trackId]
              if (trackName) {
                eventsByTrack[trackName] = (eventsByTrack[trackName] || 0) + 1
              }
            })
          }
        })

        // Filtrar tracks que tienen al menos 1 evento
        const filteredEventsByTrack = Object.fromEntries(
          Object.entries(eventsByTrack).filter(([_, count]) => count > 0)
        )

        console.log('📈 Events by track:', filteredEventsByTrack)

        // 12. Calcular actividad reciente (feedbacks de últimos 7 días)
        const weekAgo = new Date()
        weekAgo.setDate(weekAgo.getDate() - 7)
        const recentActivity = feedbacks.filter(f => 
          f.created_at && new Date(f.created_at) >= weekAgo
        ).length

        // 13. Actualizar estado
        setStats({
          totalEvents: uniqueEvents.length,
          totalSpeakers: uniqueSpeakers.length,
          totalFeedbacks: feedbacks.length,
          averageRating: Number(averageRating.toFixed(1)),
          upcomingEvents,
          pastEvents,
          eventsByCategory: filteredEventsByTrack, // Ahora usa tracks reales
          recentActivity
        })

        console.log('✅ Dashboard stats updated with real tracks')

      } catch (error) {
        console.error('❌ Error fetching dashboard data:', error)
        setStats({
          totalEvents: 0,
          totalSpeakers: 0,
          totalFeedbacks: 0,
          averageRating: 0,
          upcomingEvents: 0,
          pastEvents: 0,
          eventsByCategory: {},
          recentActivity: 0
        })
      } finally {
        setIsLoading(false)
      }
    }

    fetchDashboardData()
  }, [])

  return { stats, isLoading }
}