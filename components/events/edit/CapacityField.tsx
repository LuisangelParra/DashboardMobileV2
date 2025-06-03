import React from 'react';
import { View, Text, TextInput, useColorScheme, Pressable, ActivityIndicator } from 'react-native';
import styles from './editEvent.styles';

interface CapacityFieldProps {
  currentSubscribers: number;
  maxParticipants: string;
  onMaxParticipantsChange: (text: string) => void;
  onRefresh: () => void;
  isLoading: boolean;
}

export const CapacityField: React.FC<CapacityFieldProps> = ({
  currentSubscribers,
  maxParticipants,
  onMaxParticipantsChange,
  onRefresh,
  isLoading
}) => {
  const isDark = useColorScheme() === 'dark';

  const maxValue = parseInt(maxParticipants) || 0;
  const isNearCapacity = maxValue > 0 && currentSubscribers / maxValue >= 0.8;
  const isAtCapacity = maxValue > 0 && currentSubscribers >= maxValue;
  const percentage = maxValue > 0 ? Math.min((currentSubscribers / maxValue) * 100, 100) : 0;

  const getCapacityColor = () => {
    if (isAtCapacity) return '#FF3B30'; // Rojo
    if (isNearCapacity) return '#FF9500'; // Naranja
    return '#34C759'; // Verde
  };

  const getCapacityText = () => {
    if (isAtCapacity) return 'FULL';
    if (isNearCapacity) return 'ALMOST FULL';
    return 'AVAILABLE';
  };

  return (
    <View style={styles.inputContainer}>
      <View style={styles.capacityHeader}>
        <Text style={[styles.label, { color: isDark ? '#FFF' : '#000' }]}>
          Event Capacity
        </Text>
        <Pressable
          onPress={onRefresh}
          style={styles.refreshButton}
          disabled={isLoading}
        >
          {isLoading ? (
            <ActivityIndicator size="small" color="#0A84FF" />
          ) : (
            <Text style={styles.refreshButtonText}>🔄 Refresh</Text>
          )}
        </Pressable>
      </View>

      {/* Indicador visual de capacidad */}
      <View style={[styles.capacityIndicator, { borderColor: isDark ? '#2C2C2E' : '#E5E5EA' }]}>
        <View style={styles.capacityInfo}>
          <Text style={[styles.capacityNumbers, { color: isDark ? '#FFF' : '#000' }]}>
            <Text style={{ fontWeight: 'bold', color: getCapacityColor() }}>
              {currentSubscribers}
            </Text>
            {maxValue > 0 && (
              <>
                <Text style={{ color: isDark ? '#8E8E93' : '#6D6D70' }}> of </Text>
                <Text style={{ fontWeight: 'bold' }}>{maxValue}</Text>
              </>
            )}
            <Text style={{ color: isDark ? '#8E8E93' : '#6D6D70' }}> subscribers</Text>
          </Text>
          <Text style={[styles.capacityStatus, { color: getCapacityColor() }]}>
            {getCapacityText()}
          </Text>
        </View>

        {maxValue > 0 && (
          <View style={styles.progressBarContainer}>
            <View 
              style={[
                styles.progressBar,
                { backgroundColor: isDark ? '#2C2C2E' : '#E5E5EA' }
              ]}
            >
              <View
                style={[
                  styles.progressBarFill,
                  {
                    width: `${percentage}%`,
                    backgroundColor: getCapacityColor(),
                  }
                ]}
              />
            </View>
            <Text style={[styles.percentageText, { color: isDark ? '#8E8E93' : '#6D6D70' }]}>
              {Math.round(percentage)}%
            </Text>
          </View>
        )}
      </View>

      {/* Campo para modificar capacidad máxima */}
      <View style={styles.maxCapacityField}>
        <Text style={[styles.sublabel, { color: isDark ? '#8E8E93' : '#6D6D70' }]}>
          Maximum Participants
        </Text>
        <TextInput
          style={[
            styles.input,
            {
              backgroundColor: isDark ? '#2C2C2E' : '#F2F2F7',
              color: isDark ? '#FFF' : '#000',
              borderColor: isDark ? '#3A3A3C' : '#C7C7CC',
            }
          ]}
          value={maxParticipants}
          onChangeText={onMaxParticipantsChange}
          placeholder="Enter max participants"
          placeholderTextColor={isDark ? '#8E8E93' : '#6D6D70'}
          keyboardType="numeric"
        />
      </View>

      {/* Alertas de capacidad */}
      {isAtCapacity && (
        <View style={[styles.capacityAlert, { backgroundColor: '#FF3B30' }]}>
          <Text style={styles.capacityAlertText}>
            ⚠️ Event is at full capacity
          </Text>
        </View>
      )}
      
      {isNearCapacity && !isAtCapacity && (
        <View style={[styles.capacityAlert, { backgroundColor: '#FF9500' }]}>
          <Text style={styles.capacityAlertText}>
            📢 Event is almost full ({Math.round(percentage)}% capacity)
          </Text>
        </View>
      )}
    </View>
  );
};