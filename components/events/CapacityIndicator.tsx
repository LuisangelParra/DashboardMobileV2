import React from 'react';
import { View, Text, StyleSheet, useColorScheme } from 'react-native';
import { Users, AlertTriangle, CheckCircle2 } from 'lucide-react-native';

interface CapacityIndicatorProps {
  currentCapacity: number;
  maxCapacity: number;
  showLabel?: boolean;
  size?: 'small' | 'medium' | 'large';
}

export function CapacityIndicator({ 
  currentCapacity, 
  maxCapacity, 
  showLabel = true,
  size = 'medium'
}: CapacityIndicatorProps) {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';
  
  // ✅ CÁLCULOS DE CAPACIDAD
  const percentage = maxCapacity > 0 ? (currentCapacity / maxCapacity) * 100 : 0;
  const availableSpots = Math.max(0, maxCapacity - currentCapacity);
  const isFull = currentCapacity >= maxCapacity;
  const isNearlyFull = percentage >= 80;
  
  // ✅ COLORES DINÁMICOS SEGÚN CAPACIDAD
  const getStatusColor = () => {
    if (isFull) return '#FF453A'; // Rojo - Lleno
    if (isNearlyFull) return '#FF9500'; // Naranja - Casi lleno
    return '#30D158'; // Verde - Disponible
  };
  
  const getStatusIcon = () => {
    if (isFull) return <AlertTriangle size={16} color="#FF453A" />;
    if (isNearlyFull) return <Users size={16} color="#FF9500" />;
    return <CheckCircle2 size={16} color="#30D158" />;
  };
  
  const getStatusText = () => {
    if (isFull) return 'Sold Out';
    if (isNearlyFull) return 'Nearly Full';
    return 'Available';
  };
  
  // ✅ ESTILOS RESPONSIVOS
  const getSizeStyles = () => {
    switch (size) {
      case 'small':
        return {
          container: { padding: 8 },
          progressBar: { height: 4 },
          text: { fontSize: 12 },
          label: { fontSize: 10 }
        };
      case 'large':
        return {
          container: { padding: 20 },
          progressBar: { height: 8 },
          text: { fontSize: 18 },
          label: { fontSize: 14 }
        };
      default:
        return {
          container: { padding: 12 },
          progressBar: { height: 6 },
          text: { fontSize: 16 },
          label: { fontSize: 12 }
        };
    }
  };
  
  const sizeStyles = getSizeStyles();
  const statusColor = getStatusColor();
  
  return (
    <View style={[
      styles.container,
      { backgroundColor: isDark ? '#1C1C1E' : '#F8F9FA' },
      sizeStyles.container
    ]}>
      {/* ✅ HEADER CON ICONO Y ESTADO */}
      <View style={styles.header}>
        <View style={styles.statusContainer}>
          {getStatusIcon()}
          <Text style={[
            styles.statusText,
            { color: statusColor },
            sizeStyles.label
          ]}>
            {getStatusText()}
          </Text>
        </View>
        
        <Text style={[
          styles.capacityText,
          { color: isDark ? '#FFFFFF' : '#000000' },
          sizeStyles.text
        ]}>
          {currentCapacity}/{maxCapacity}
        </Text>
      </View>
      
      {/* ✅ BARRA DE PROGRESO */}
      <View style={[
        styles.progressBarContainer,
        { backgroundColor: isDark ? '#2C2C2E' : '#E5E5EA' }
      ]}>
        <View
          style={[
            styles.progressBarFill,
            {
              width: `${Math.min(percentage, 100)}%`,
              backgroundColor: statusColor,
              height: sizeStyles.progressBar.height
            }
          ]}
        />
      </View>
      
      {/* ✅ ETIQUETAS INFORMATIVAS */}
      {showLabel && (
        <View style={styles.labelsContainer}>
          <Text style={[
            styles.label,
            { color: isDark ? '#8E8E93' : '#6C6C70' },
            sizeStyles.label
          ]}>
            {percentage.toFixed(0)}% Full
          </Text>
          
          {!isFull && (
            <Text style={[
              styles.label,
              { color: isDark ? '#8E8E93' : '#6C6C70' },
              sizeStyles.label
            ]}>
              {availableSpots} spots left
            </Text>
          )}
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'rgba(0,0,0,0.1)',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  statusContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  statusText: {
    fontWeight: '600',
  },
  capacityText: {
    fontWeight: '700',
  },
  progressBarContainer: {
    height: 6,
    borderRadius: 3,
    overflow: 'hidden',
    marginBottom: 8,
  },
  progressBarFill: {
    borderRadius: 3,
    transition: 'width 0.3s ease',
  },
  labelsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  label: {
    fontWeight: '500',
  },
});