// app/(tabs)/events/index.tsx

import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  Pressable,
  useColorScheme,
  TextInput,
  ActivityIndicator
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useIsFocused } from '@react-navigation/native';
import { router } from 'expo-router';
import { Search, Plus, Filter, Calendar, MapPin } from 'lucide-react-native';
import { useEvents } from '@/hooks/useEvents';
import { useEventTracks } from '@/hooks/useTracks';
import { CategoryBadge } from '@/components/events/CategoryBadge';
import { EventCategory } from '@/types';

export default function EventsScreen() {
  const insets = useSafeAreaInsets();
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<EventCategory | null>(null);
  const [showFilters, setShowFilters] = useState(false);

  // extraemos refresh de useEvents
  const { events, isLoading, refresh } = useEvents({
    search: searchQuery,
    category: selectedCategory,
  });

  // detectamos cuando recuperamos el foco
  const isFocused = useIsFocused();
  useEffect(() => {
    if (isFocused) {
      refresh();
    }
  }, [isFocused, refresh]);

  const renderEvent = ({ item }: { item: typeof events[0] }) => (
    <Pressable
      style={[
        styles.eventCard,
        { backgroundColor: isDark ? '#1C1C1E' : '#FFFFFF' }
      ]}
      onPress={() => router.push(`/events/${item.id}`)}
    >
      <View style={styles.eventHeader}>
        <Text
          style={[
            styles.eventName,
            { color: isDark ? '#FFFFFF' : '#000000' }
          ]}
          numberOfLines={1}
        >
          {item.name}
        </Text>
      </View>

      {/* Badges dinámicos de tracks */}
      <EventBadges eventId={item.id} />

      <Text
        style={[
          styles.eventDescription,
          { color: isDark ? '#EBEBF5' : '#3C3C43' }
        ]}
        numberOfLines={2}
      >
        {item.description}
      </Text>

      <View style={styles.eventMeta}>
        <View style={styles.eventMetaItem}>
          <Calendar size={14} color={isDark ? '#8E8E93' : '#3C3C43'} />
          <Text
            style={[
              styles.eventMetaText,
              { color: isDark ? '#8E8E93' : '#3C3C43' }
            ]}
          >
            {item.date}
          </Text>
        </View>

        <View style={styles.eventMetaItem}>
          <MapPin size={14} color={isDark ? '#8E8E93' : '#3C3C43'} />
          <Text
            style={[
              styles.eventMetaText,
              { color: isDark ? '#8E8E93' : '#3C3C43' }
            ]}
          >
            {item.location}
          </Text>
        </View>
      </View>

      <View style={styles.ratingContainer}>
        <Text
          style={[
            styles.ratingLabel,
            { color: isDark ? '#8E8E93' : '#3C3C43' }
          ]}
        >
          Rating:
        </Text>
        <View style={styles.ratingStars}>
          {[1, 2, 3, 4, 5].map(star => (
            <Text
              key={`${item.id}-star-${star}`}
              style={[
                styles.ratingStar,
                { color: star <= item.rating ? '#FF9500' : isDark ? '#48484A' : '#E5E5EA' }
              ]}
            >
              ★
            </Text>
          ))}
          <Text
            style={[
              styles.ratingValue,
              { color: isDark ? '#EBEBF5' : '#3C3C43' }
            ]}
          >
            ({item.rating.toFixed(1)})
          </Text>
        </View>
      </View>
    </Pressable>
  );

  return (
    <View style={[
      styles.container,
      { backgroundColor: isDark ? '#000000' : '#F2F2F7' }
    ]}>
      <View style={styles.searchContainer}>
        <View style={[
          styles.searchInputContainer,
          { backgroundColor: isDark ? '#1C1C1E' : '#FFFFFF' }
        ]}>
          <Search size={20} color={isDark ? '#8E8E93' : '#3C3C43'} />
          <TextInput
            style={[
              styles.searchInput,
              { color: isDark ? '#FFFFFF' : '#000000' }
            ]}
            placeholder="Search events..."
            placeholderTextColor={isDark ? '#8E8E93' : '#3C3C43'}
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
        </View>

        <Pressable
          style={[
            styles.filterButton,
            { backgroundColor: isDark ? '#1C1C1E' : '#FFFFFF' }
          ]}
          onPress={() => setShowFilters(!showFilters)}
        >
          <Filter size={20} color={isDark ? '#FFFFFF' : '#000000'} />
        </Pressable>
      </View>

      {showFilters && (
        <View style={[
          styles.filtersContainer,
          { backgroundColor: isDark ? '#1C1C1E' : '#FFFFFF' }
        ]}>
          <View style={styles.filterHeader}>
            <Text style={[
              styles.filterTitle,
              { color: isDark ? '#FFFFFF' : '#000000' }
            ]}>
              Filter by Category
            </Text>
            <Pressable
              onPress={() => setSelectedCategory(null)}
              style={styles.clearFilterButton}
            >
              <Text style={styles.clearFilterText}>Clear</Text>
            </Pressable>
          </View>

          {/* Aquí podrías listar dinámicamente todos los tracks 
              usando useTracks() si quieres filtrar por track */}
        </View>
      )}

      {isLoading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#0A84FF" />
        </View>
      ) : (
        <FlatList
          data={events}
          renderItem={renderEvent}
          keyExtractor={item => item.id}
          contentContainerStyle={[
            styles.listContent,
            { paddingBottom: insets.bottom + 20 }
          ]}
          ListEmptyComponent={() => (
            <View style={styles.emptyContainer}>
              <Text style={[
                styles.emptyText,
                { color: isDark ? '#FFFFFF' : '#000000' }
              ]}>
                No events found
              </Text>
            </View>
          )}
        />
      )}

      <Pressable
        style={[styles.addButton, { bottom: insets.bottom + 16 }]}
        onPress={() => router.push('/events/add')}
      >
        <Plus size={24} color="#FFFFFF" />
      </Pressable>
    </View>
  );
}

// componente auxiliar para mostrar badges de tracks
function EventBadges({ eventId }: { eventId: string }) {
  const { tracks, isLoading } = useEventTracks(eventId);
  if (isLoading || tracks.length === 0) return null;
  return (
    <View style={styles.badgesContainer}>
      {tracks.map(t => (
        <CategoryBadge key={t.id} category={t.name as EventCategory} />
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  searchContainer: {
    flexDirection: 'row',
    padding: 16,
    gap: 8,
  },
  searchInputContainer: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 10,
    paddingHorizontal: 12,
    height: 44,
  },
  searchInput: {
    flex: 1,
    marginLeft: 8,
    fontSize: 16,
  },
  filterButton: {
    width: 44,
    height: 44,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  filtersContainer: {
    marginHorizontal: 16,
    borderRadius: 12,
    padding: 16,
    marginBottom: 8,
  },
  filterHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  filterTitle: {
    fontSize: 16,
    fontWeight: '600',
  },
  clearFilterButton: {
    padding: 4,
  },
  clearFilterText: {
    color: '#0A84FF',
    fontSize: 14,
    fontWeight: '500',
  },
  categoriesContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  categoryChip: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
  },
  categoryChipText: {
    fontSize: 14,
    fontWeight: '500',
  },
  listContent: {
    padding: 16,
  },
  eventCard: {
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  eventHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  eventName: {
    fontSize: 18,
    fontWeight: '600',
    flex: 1,
    marginRight: 8,
  },
  eventDescription: {
    fontSize: 14,
    marginBottom: 12,
    lineHeight: 20,
  },
  badgesContainer: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginBottom: 8 },
  
  eventMeta: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  eventMetaItem: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  eventMetaText: {
    fontSize: 13,
    marginLeft: 4,
  },
  ratingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  ratingLabel: {
    fontSize: 13,
    marginRight: 8,
  },
  ratingStars: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  ratingStar: {
    fontSize: 16,
    marginRight: 2,
  },
  ratingValue: {
    fontSize: 13,
    marginLeft: 4,
  },
  addButton: {
    position: 'absolute',
    right: 16,
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: '#0A84FF',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 4,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 32,
  },
  emptyText: {
    fontSize: 16,
    textAlign: 'center',
  },
});