// components/events/EventCard.tsx
import React from 'react'
import { View, Text, Pressable, useColorScheme } from 'react-native'
import { Calendar, MapPin } from 'lucide-react-native'
import { router } from 'expo-router'
import styles from './events.styles'
import { Event } from '@/types'
import { CategoryBadge } from '@/components/events/CategoryBadge'

interface Props {
  item: Event
}

export function EventCard({ item }: Props) {
  const isDark = useColorScheme() === 'dark'

  return (
    <Pressable
      style={[styles.eventCard, { backgroundColor: isDark ? '#1C1C1E' : '#FFFFFF' }]}
      onPress={() => router.push(`/events/${item.id}`)}
    >
      {/* Badges de Tracks */}
      <View style={styles.badgesContainer}>
        {item.tracks.map(track => (
          <CategoryBadge key={track} category={track} />
        ))}
      </View>

      {/* Resto del card */}
      <View style={styles.eventHeader}>
        <Text style={[styles.eventName, { color: isDark ? '#FFFFFF' : '#000000' }]} numberOfLines={1}>
          {item.name}
        </Text>
      </View>
      <Text
        style={[styles.eventDescription, { color: isDark ? '#EBEBF5' : '#3C3C43' }]}
        numberOfLines={2}
      >
        {item.description}
      </Text>
      <View style={styles.eventMeta}>
        <View style={styles.eventMetaItem}>
          <Calendar size={14} color={isDark ? '#8E8E93' : '#3C3C43'} />
          <Text style={[styles.eventMetaText, { color: isDark ? '#8E8E93' : '#3C3C43' }]}>
            {item.date}
          </Text>
        </View>
        <View style={styles.eventMetaItem}>
          <MapPin size={14} color={isDark ? '#8E8E93' : '#3C3C43'} />
          <Text style={[styles.eventMetaText, { color: isDark ? '#8E8E93' : '#3C3C43' }]}>
            {item.location}
          </Text>
        </View>
      </View>
      <View style={styles.ratingContainer}>
        {[1,2,3,4,5].map(star => (
          <Text
            key={`${item.id}-star-${star}`}
            style={[
              styles.ratingStar,
              { color: star <= item.rating ? '#FF9500' : isDark ? '#48484A' : '#E5E5EA' }
            ]}
          >★</Text>
        ))}
        <Text style={[styles.ratingValue, { color: isDark ? '#EBEBF5' : '#3C3C43' }]}>
          ({item.rating.toFixed(1)})
        </Text>
      </View>
    </Pressable>
  )
}
