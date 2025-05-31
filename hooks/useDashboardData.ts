import { useState, useEffect } from 'react';
import { Event, Speaker } from '@/types';
import Constants from 'expo-constants';

const {
  UNIDB_BASE_URL,
  UNIDB_CONTRACT_KEY
} = (Constants.expoConfig!.extra as {
  UNIDB_BASE_URL: string;
  UNIDB_CONTRACT_KEY: string;
});
const BASE_URL = `${UNIDB_BASE_URL}/${UNIDB_CONTRACT_KEY}`;

type RawRow<T> = { entry_id: string; data: T };
type RawEvent = { id: number; name: string; date: string; category: string };
type RawSpeaker = { id: number; name: string };
type RawEventSpeaker = { event_id: number; speaker_id: number };

type DashboardMetrics = {
  totalEvents: number;
  totalSpeakers: number;
  totalFeedback: number;
  averageRating: number;
  eventsTrend: number;
  speakersTrend: number;
  feedbackTrend: number;
  ratingTrend: number;
};

export function useDashboardData() {
  const [metrics, setMetrics] = useState<DashboardMetrics>({
    totalEvents: 0,
    totalSpeakers: 0,
    totalFeedback: 0,
    averageRating: 0,
    eventsTrend: 0,
    speakersTrend: 0,
    feedbackTrend: 0,
    ratingTrend: 0,
  });
  
  const [upcomingEvents, setUpcomingEvents] = useState<Event[]>([]);
  const [topSpeakers, setTopSpeakers] = useState<Speaker[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const loadDashboardData = async () => {
      try {
        setIsLoading(true);

        // Obtener eventos
        const eventsRes = await fetch(`${BASE_URL}/data/events/all?format=json`);
        const eventsJson = await eventsRes.json();
        const rawEvents: RawRow<RawEvent>[] = Array.isArray(eventsJson?.data) ? eventsJson.data : [];
        const baseEvents = rawEvents.map(r => r.data);
        
        // Obtener speakers
        const speakersRes = await fetch(`${BASE_URL}/data/speakers/all?format=json`);
        const speakersJson = await speakersRes.json();
        const rawSpeakers: RawRow<RawSpeaker>[] = Array.isArray(speakersJson?.data) ? speakersJson.data : [];
        const baseSpeakers = rawSpeakers.map(r => r.data);
        
        // Obtener relaciones
        const relRes = await fetch(`${BASE_URL}/data/event_speakers/all?format=json`);
        const relJson = await relRes.json();
        const rawRel: RawRow<RawEventSpeaker>[] = Array.isArray(relJson?.data) ? relJson.data : [];
        const rels = rawRel.map(r => r.data);

        console.log(`🔍 DASHBOARD Raw - events: ${baseEvents.length}, speakers: ${baseSpeakers.length}`);

        // Eliminar duplicados con Map (mismo método que useSpeakers y useEvents)
        const eventMap = new Map<number, RawEvent>();
        baseEvents.forEach(e => {
          if (!eventMap.has(e.id)) {
            eventMap.set(e.id, e);
          }
        });

        const speakerMap = new Map<number, RawSpeaker>();
        baseSpeakers.forEach(s => {
          if (!speakerMap.has(s.id)) {
            speakerMap.set(s.id, s);
          }
        });

        const uniqueEventsList = Array.from(eventMap.values());
        const uniqueSpeakersList = Array.from(speakerMap.values());

        console.log(`📊 DASHBOARD Únicos - eventos: ${uniqueEventsList.length}, speakers: ${uniqueSpeakersList.length}`);

        // Preparar eventos para UI
        const eventsList = uniqueEventsList.slice(0, 3).map(e => ({
          id: String(e.id),
          name: e.name,
          description: 'Event description',
          category: e.category || 'General',
          date: e.date || 'TBD',
          time: '10:00 AM - 12:00 PM',
          location: 'Main Hall',
          imageUrl: 'https://images.pexels.com/photos/8386440/pexels-photo-8386440.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1',
          rating: 4.5,
          ratingCount: 20,
        }));

        // Preparar speakers para UI
        const speakersList = uniqueSpeakersList.slice(0, 4).map(s => {
          const uniqueEventIds = new Set(rels.filter(r => r.speaker_id === s.id).map(r => r.event_id));
          const eventCount = uniqueEventIds.size;

          return {
            id: String(s.id),
            name: s.name,
            role: 'Speaker',
            bio: 'Professional speaker',
            eventCount: eventCount,
            rating: 4.5,
          };
        });

        // Actualizar métricas
        setMetrics({
          totalEvents: uniqueEventsList.length,
          totalSpeakers: uniqueSpeakersList.length,
          totalFeedback: 156,
          averageRating: 4.7,
          eventsTrend: 12,
          speakersTrend: 8,
          feedbackTrend: 25,
          ratingTrend: 3,
        });
        
        setUpcomingEvents(eventsList);
        setTopSpeakers(speakersList);
        
      } catch (error) {
        console.error('Error loading dashboard data:', error);
        setMetrics({
          totalEvents: 0,
          totalSpeakers: 0,
          totalFeedback: 0,
          averageRating: 0,
          eventsTrend: 0,
          speakersTrend: 0,
          feedbackTrend: 0,
          ratingTrend: 0,
        });
        setUpcomingEvents([]);
        setTopSpeakers([]);
      } finally {
        setIsLoading(false);
      }
    };

    loadDashboardData();
  }, []);

  return {
    metrics,
    upcomingEvents,
    topSpeakers,
    isLoading,
  };
}