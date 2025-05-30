import React from 'react';
import { View, Text, StyleSheet, Pressable, useColorScheme } from 'react-native';
import { ChevronRight } from 'lucide-react-native';
import { Speaker } from '@/types';

type SpeakerRowProps = {
  speaker: Speaker;
  onPress: () => void;
};

export function SpeakerRow({ speaker, onPress }: SpeakerRowProps) {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';

  return (
    <Pressable
      style={[
        styles.container,
        { backgroundColor: isDark ? '#1C1C1E' : '#FFFFFF' }
      ]}
      onPress={onPress}
    >
      <View style={styles.speakerInfo}>
        <View style={styles.speakerImagePlaceholder}>
          <Text style={styles.speakerInitials}>
            {speaker.name.split(' ').map(n => n[0]).join('')}
          </Text>
        </View>
        
        <View style={styles.speakerDetails}>
          <Text
            style={[
              styles.speakerName,
              { color: isDark ? '#FFFFFF' : '#000000' }
            ]}
            numberOfLines={1}
          >
            {speaker.name}
          </Text>
          
          <Text
            style={[
              styles.speakerRole,
              { color: isDark ? '#EBEBF5' : '#3C3C43' }
            ]}
            numberOfLines={1}
          >
            {speaker.role}
          </Text>
        </View>
      </View>
      
      <ChevronRight size={20} color={isDark ? '#8E8E93' : '#C7C7CC'} />
    </Pressable>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 12,
    borderRadius: 12,
    marginBottom: 8,
  },
  speakerInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  speakerImagePlaceholder: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#5E5CE6',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  speakerInitials: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
  speakerDetails: {
    flex: 1,
  },
  speakerName: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 2,
  },
  speakerRole: {
    fontSize: 14,
  },
});