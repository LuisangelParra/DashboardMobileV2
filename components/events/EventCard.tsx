// components/events/EventCard.tsx
import React from 'react'
import { View, Text, Pressable, useColorScheme, StyleSheet } from 'react-native'
import { Calendar, MapPin, Users } from 'lucide-react-native'
import { router } from 'expo-router'
import { Event } from '@/types'
import { CategoryBadge } from '@/components/events/CategoryBadge'

interface Props {
  item: Event
}

export function EventCard({ item }: Props) {
  const isDark = useColorScheme() === 'dark'
  
  // ✅ CALCULAR ESTADO DE CAPACIDAD
  const capacityPercentage = item.maxCapacity > 0 
    ? (item.currentCapacity / item.maxCapacity) * 100 
    : 0
  const isFull = item.currentCapacity >= item.maxCapacity
  const isNearlyFull = capacityPercentage >= 80

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
      
      {/* ✅ CAPACIDAD COMPACTA */}
      <View style={styles.eventCapacity}>
        <View style={styles.capacityItem}>
          <Users 
            size={14} 
            color={isFull ? '#FF453A' : isNearlyFull ? '#FF9500' : '#30D158'} 
          />
          <Text style={[
            styles.capacityText, 
            { 
              color: isFull ? '#FF453A' : isNearlyFull ? '#FF9500' : '#30D158',
              fontWeight: '600'
            }
          ]}>
            {item.currentCapacity}/{item.maxCapacity}
          </Text>
        </View>
        
        {isFull && (
          <Text style={[styles.capacityStatus, { color: '#FF453A' }]}>
            FULL
          </Text>
        )}
        {isNearlyFull && !isFull && (
          <Text style={[styles.capacityStatus, { color: '#FF9500' }]}>
            {Math.round(capacityPercentage)}% FULL
          </Text>
        )}
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

const styles = StyleSheet.create({
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
  badgesContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginBottom: 8,
  },
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
  eventCapacity: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 8,
    backgroundColor: 'rgba(142, 142, 147, 0.1)',
  },
  capacityItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  capacityText: {
    fontSize: 14,
    fontWeight: '600',
  },
  capacityStatus: {
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 0.5,
  },
  ratingContainer: {
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
});