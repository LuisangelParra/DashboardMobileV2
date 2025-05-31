// app/(tabs)/events/index.tsx

import React, { useState, useEffect, useMemo } from 'react';
import {
  View,
  FlatList,
  ActivityIndicator,
  Text,
  useColorScheme,
  TextInput,
  Pressable
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useIsFocused } from '@react-navigation/native';
import { router } from 'expo-router';
import { Search, Plus, Filter } from 'lucide-react-native';
import styles from '@/components/events/events.styles';
import { useEvents } from '@/hooks/useEvents';
import { EventCard } from '@/components/events/EventCard';
import Constants from 'expo-constants';

const {
  UNIDB_BASE_URL,
  UNIDB_CONTRACT_KEY
} = (Constants.expoConfig!.extra as {
  UNIDB_BASE_URL: string;
  UNIDB_CONTRACT_KEY: string;
});
const BASE_URL = `${UNIDB_BASE_URL}/${UNIDB_CONTRACT_KEY}`;

// Tipos para raw
type RawRow<T> = { entry_id: string; data: T };
type RawTrack = { id: number; nombre: string };
type RawEventTrack = { event_id: number; track_id: number };

export default function EventsScreen() {
  const insets = useSafeAreaInsets();
  const isFocused = useIsFocused();
  const isDark = useColorScheme() === 'dark';

  const [search, setSearch] = useState('');
  const [showFilters, setShowFilters] = useState(false);
  // tracks seleccionados (multi-select)
  const [selectedTracks, setSelectedTracks] = useState<string[]>([]);

  // Lista de eventos (filtrada por search en useEvents)
  const { events, isLoading: loadingEvents, refresh } = useEvents({ search, category: null });

  // Traemos tabla tracks
  const [tracks, setTracks] = useState<{ id: string; nombre: string }[]>([]);
  const [loadingTracks, setLoadingTracks] = useState(true);
  useEffect(() => {
    (async () => {
      try {
        const res = await fetch(`${BASE_URL}/data/tracks/all?format=json`);
        const json = (await res.json()) as { data: RawRow<RawTrack>[] };
        setTracks(json.data.map(r => ({
          id: String(r.data.id),
          nombre: r.data.nombre
        })));
      } catch (err) {
        console.error('Error loading tracks', err);
      } finally {
        setLoadingTracks(false);
      }
    })();
  }, []);

  // Traemos relaciones event_tracks
  const [eventTracks, setEventTracks] = useState<RawEventTrack[]>([]);
  const [loadingRel, setLoadingRel] = useState(true);
  useEffect(() => {
    (async () => {
      try {
        const res = await fetch(`${BASE_URL}/data/event_tracks/all?format=json`);
        const json = (await res.json()) as { data: RawRow<RawEventTrack>[] };
        setEventTracks(json.data.map(r => r.data));
      } catch (err) {
        console.error('Error loading event_tracks', err);
      } finally {
        setLoadingRel(false);
      }
    })();
  }, []);

  // Refresca al volver al foco
  useEffect(() => {
    if (isFocused) refresh();
  }, [isFocused, refresh]);

  // Mapa de evento → lista de track IDs
  const eventTracksMap = useMemo(() => {
    const map: Record<string, string[]> = {};
    eventTracks.forEach(r => {
      const eid = String(r.event_id);
      const tid = String(r.track_id);
      if (!map[eid]) map[eid] = [];
      map[eid].push(tid);
    });
    return map;
  }, [eventTracks]);

  // Aplica filtro por tracks seleccionados
  const filteredEvents = useMemo(() => {
    if (selectedTracks.length === 0) return events;
    return events.filter(ev => {
      const evT = eventTracksMap[ev.id] || [];
      // si al menos uno coincide
      return selectedTracks.some(tid => evT.includes(tid));
    });
  }, [events, selectedTracks, eventTracksMap]);

  const handleToggleTrack = (trackId: string) => {
    setSelectedTracks(prev =>
      prev.includes(trackId)
        ? prev.filter(id => id !== trackId)
        : [...prev, trackId]
    );
  };

  return (
    <View style={[styles.container, { backgroundColor: isDark ? '#000' : '#F2F2F7' }]}>
      {/* Search + Filter button */}
      <View style={styles.searchContainer}>
        <View style={[styles.searchInputContainer, { backgroundColor: isDark ? '#1C1C1E' : '#FFF' }]}>
          <Search size={20} color={isDark ? '#8E8E93' : '#3C3C43'} />
          <TextInput
            style={[styles.searchInput, { color: isDark ? '#FFF' : '#000' }]}
            placeholder="Search events..."
            placeholderTextColor={isDark ? '#8E8E93' : '#3C3C43'}
            value={search}
            onChangeText={setSearch}
          />
        </View>
        <Pressable
          style={[styles.filterButton, { backgroundColor: isDark ? '#1C1C1E' : '#FFF' }]}
          onPress={() => setShowFilters(v => !v)}
        >
          <Filter size={20} color={isDark ? '#FFF' : '#000'} />
        </Pressable>
      </View>

      {/* Panel de filtro por tracks */}
      {showFilters && (
        <View style={[styles.filtersContainer, { backgroundColor: isDark ? '#1C1C1E' : '#FFF' }]}>
          <View style={styles.filterHeader}>
            <Text style={[styles.filterTitle, { color: isDark ? '#FFF' : '#000' }]}>
              Filter by Track
            </Text>
            <Pressable onPress={() => setSelectedTracks([])} style={styles.clearFilterButton}>
              <Text style={styles.clearFilterText}>Clear</Text>
            </Pressable>
          </View>
          <View style={styles.categoriesContainer}>
            {loadingTracks
              ? <ActivityIndicator size="small" color="#0A84FF" />
              : tracks.map(track => {
                const selected = selectedTracks.includes(track.id);
                return (
                  <Pressable
                    key={track.id}
                    style={[
                      styles.categoryChip,
                      {
                        backgroundColor: selected
                          ? '#0A84FF'
                          : isDark
                            ? '#2C2C2E'
                            : '#E5E5EA'
                      }
                    ]}
                    onPress={() => handleToggleTrack(track.id)}
                  >
                    <Text
                      style={[
                        styles.categoryChipText,
                        {
                          color: selected ? '#FFF' : (isDark ? '#FFF' : '#000')
                        }
                      ]}
                    >
                      {track.nombre}
                    </Text>
                  </Pressable>
                );
              })
            }
          </View>
        </View>
      )}

      {/* Listado */}
      {(loadingEvents || loadingRel) ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#0A84FF" />
        </View>
      ) : (
        <FlatList
          data={filteredEvents}
          renderItem={({ item }) => <EventCard item={item} />}
          keyExtractor={item => item.id}
          contentContainerStyle={[styles.listContent, { paddingBottom: insets.bottom + 20 }]}
          ListEmptyComponent={() => (
            <View style={styles.emptyContainer}>
              <Text style={[styles.emptyText, { color: isDark ? '#FFF' : '#000' }]}>
                No events found
              </Text>
            </View>
          )}
        />
      )}

      {/* Botón + */}
      <Pressable
        style={[styles.addButton, { bottom: insets.bottom + 16 }]}
        onPress={() => router.push('/events/add')}
      >
        <Plus size={24} color="#FFF" />
      </Pressable>
    </View>
  );
}
