// app/(tabs)/events/index.tsx
import React, { useState, useEffect } from 'react';
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
import { EventCategory } from '@/types';
import { EventCard } from '@/components/events/EventCard';

export default function EventsScreen() {
  const insets = useSafeAreaInsets();
  const isFocused = useIsFocused();
  const isDark = useColorScheme() === 'dark';

  const [search, setSearch] = useState('');
  const [category, setCategory] = useState<EventCategory | null>(null);
  const [showFilters, setShowFilters] = useState(false);

  const { events, isLoading, refresh } = useEvents({ search, category });

  useEffect(() => {
    if (isFocused) refresh();
  }, [isFocused, refresh]);

  const categories: EventCategory[] = [
    'Workshop', 'Presentation', 'Panel', 'Networking', 'Other'
  ];

  return (
    <View style={[styles.container, { backgroundColor: isDark ? '#000' : '#F2F2F7' }]}>
      {/* Search & Filter */}
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

      {showFilters && (
        <View style={[styles.filtersContainer, { backgroundColor: isDark ? '#1C1C1E' : '#FFF' }]}>
          <View style={styles.filterHeader}>
            <Text style={[styles.filterTitle, { color: isDark ? '#FFF' : '#000' }]}>
              Filter by Track
            </Text>
            <Pressable onPress={() => setCategory(null)} style={styles.clearFilterButton}>
              <Text style={styles.clearFilterText}>Clear</Text>
            </Pressable>
          </View>
          <View style={styles.categoriesContainer}>
            {categories.map(cat => (
              <Pressable
                key={cat}
                style={[
                  styles.categoryChip,
                  { backgroundColor: category === cat ? '#0A84FF' : isDark ? '#2C2C2E' : '#E5E5EA' }
                ]}
                onPress={() => setCategory(c => c === cat ? null : cat)}
              >
                <Text
                  style={[
                    styles.categoryChipText,
                    { color: category === cat ? '#FFF' : isDark ? '#FFF' : '#000' }
                  ]}
                >
                  {cat}
                </Text>
              </Pressable>
            ))}
          </View>
        </View>
      )}

      {isLoading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#0A84FF" />
        </View>
      ) : (
        <FlatList
          data={events}
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

      {/* + */}
      <Pressable style={[styles.addButton, { bottom: insets.bottom + 16 }]} onPress={() => router.push('/events/add')}>
        <Plus size={24} color="#FFF" />
      </Pressable>
    </View>
  )
}
