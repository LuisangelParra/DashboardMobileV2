import React from 'react';
import { View, StyleSheet } from 'react-native';
import { useEventTracks } from '@/hooks/useTracks';
import { CategoryBadge } from '@/components/events/CategoryBadge';

export function EventBadges({ eventId }: { eventId: string }) {
  const { tracks, isLoading } = useEventTracks(eventId);
  if (isLoading || tracks.length === 0) return null;
  return (
    <View style={styles.container}>
      {tracks.map(t => (
        <CategoryBadge key={t.id} category={t.name as any} />
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginBottom: 8 }
});
