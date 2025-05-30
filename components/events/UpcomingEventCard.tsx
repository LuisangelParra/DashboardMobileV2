import React from 'react';
import { View, Text, StyleSheet, Pressable, Image, useColorScheme } from 'react-native';
import { Calendar, Clock, MapPin } from 'lucide-react-native';
import { CategoryBadge } from './CategoryBadge';
import { Event } from '@/types';

type UpcomingEventCardProps = {
  event: Event;
  onPress: () => void;
};

export function UpcomingEventCard({ event, onPress }: UpcomingEventCardProps) {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';
  
  return (
    <Pressable
      style={[
        styles.card,
        { backgroundColor: isDark ? '#1C1C1E' : '#FFFFFF' }
      ]}
      onPress={onPress}
    >
      <Image
        source={{ uri: event.imageUrl }}
        style={styles.image}
        resizeMode="cover"
      />
      
      <View style={styles.content}>
        <View style={styles.header}>
          <Text
            style={[
              styles.title,
              { color: isDark ? '#FFFFFF' : '#000000' }
            ]}
            numberOfLines={1}
          >
            {event.name}
          </Text>
          <CategoryBadge category={event.category} />
        </View>
        
        <View style={styles.metadata}>
          <View style={styles.metadataItem}>
            <Calendar size={14} color={isDark ? '#8E8E93' : '#3C3C43'} />
            <Text
              style={[
                styles.metadataText,
                { color: isDark ? '#EBEBF5' : '#3C3C43' }
              ]}
            >
              {event.date}
            </Text>
          </View>
          
          <View style={styles.metadataItem}>
            <Clock size={14} color={isDark ? '#8E8E93' : '#3C3C43'} />
            <Text
              style={[
                styles.metadataText,
                { color: isDark ? '#EBEBF5' : '#3C3C43' }
              ]}
            >
              {event.time}
            </Text>
          </View>
          
          <View style={styles.metadataItem}>
            <MapPin size={14} color={isDark ? '#8E8E93' : '#3C3C43'} />
            <Text
              style={[
                styles.metadataText,
                { color: isDark ? '#EBEBF5' : '#3C3C43' }
              ]}
              numberOfLines={1}
            >
              {event.location}
            </Text>
          </View>
        </View>
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: {
    width: 300,
    borderRadius: 12,
    overflow: 'hidden',
    marginRight: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  image: {
    width: '100%',
    height: 150,
  },
  content: {
    padding: 12,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 8,
  },
  title: {
    fontSize: 16,
    fontWeight: '600',
    flex: 1,
    marginRight: 8,
  },
  metadata: {
    gap: 6,
  },
  metadataItem: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  metadataText: {
    fontSize: 12,
    marginLeft: 4,
  },
});