import React from 'react';
import { View, Text, useColorScheme } from 'react-native';
import { Users } from 'lucide-react-native';

interface CapacityIndicatorProps {
  subscribedCount: number;
  maxParticipants: number;
  showIcon?: boolean;
  compact?: boolean;
}

export function CapacityIndicator({ 
  subscribedCount, 
  maxParticipants, 
  showIcon = true, 
  compact = false 
}: CapacityIndicatorProps) {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';
  
  const percentage = Math.min((subscribedCount / maxParticipants) * 100, 100);
  const isNearCapacity = percentage >= 80;
  const isFull = subscribedCount >= maxParticipants;

  const getStatusColor = () => {
    if (isFull) return '#FF453A';
    if (isNearCapacity) return '#FF9500';
    return '#32D74B';
  };

  const getStatusText = () => {
    if (isFull) return 'Full';
    if (isNearCapacity) return 'Almost Full';
    return 'Available';
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        {showIcon && (
          <Users 
            size={compact ? 16 : 20} 
            color={isDark ? '#8E8E93' : '#3C3C43'} 
          />
        )}
        <Text style={[
          compact ? styles.compactText : styles.capacityText,
          { color: isDark ? '#EBEBF5' : '#3C3C43' }
        ]}>
          {subscribedCount} / {maxParticipants} participants
        </Text>
        <Text style={[
          compact ? styles.compactStatusText : styles.statusText,
          { color: getStatusColor() }
        ]}>
          {getStatusText()}
        </Text>
      </View>
      
      <View style={[
        styles.progressBar,
        { backgroundColor: isDark ? '#2C2C2E' : '#E5E5EA' }
      ]}>
        <View style={[
          styles.progressFill,
          { 
            width: `${percentage}%`,
            backgroundColor: getStatusColor()
          }
        ]} />
      </View>
    </View>
  );
}

const styles = {
  container: {
    gap: 8,
  },
  header: {
    flexDirection: 'row' as const,
    alignItems: 'center' as const,
    gap: 8,
  },
  capacityText: {
    fontSize: 16,
    flex: 1,
  },
  compactText: {
    fontSize: 14,
    flex: 1,
  },
  statusText: {
    fontSize: 14,
    fontWeight: '600' as const,
  },
  compactStatusText: {
    fontSize: 12,
    fontWeight: '600' as const,
  },
  progressBar: {
    height: 6,
    borderRadius: 3,
    overflow: 'hidden' as const,
  },
  progressFill: {
    height: '100%',
    borderRadius: 3,
  },
};