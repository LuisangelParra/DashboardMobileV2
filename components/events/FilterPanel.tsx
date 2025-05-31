// components/events/FilterPanel.tsx
import React from 'react'
import { View, Text, Pressable, useColorScheme } from 'react-native'
import { Filter } from 'lucide-react-native'
import styles from './events.styles'
import { EventCategory } from '@/types'

interface Props {
  visible: boolean
  onToggle: () => void
  tracks: EventCategory[]            // todos los tracks disponibles
  selected: EventCategory[]          // los tracks actualmente seleccionados
  onToggleTrack: (track: EventCategory) => void
  onClear: () => void
}

export function FilterPanel({
  visible,
  onToggle,
  tracks,
  selected,
  onToggleTrack,
  onClear
}: Props) {
  const isDark = useColorScheme() === 'dark'

  // Si no está visible, mostramos solo el icono de filtro
  if (!visible) {
    return (
      <Pressable
        style={[styles.filterButton, { backgroundColor: isDark ? '#1C1C1E' : '#FFFFFF' }]}
        onPress={onToggle}
      >
        <Filter size={20} color={isDark ? '#FFFFFF' : '#000000'} />
      </Pressable>
    )
  }

  // Panel abierto con todos los tracks como chips
  return (
    <View style={[styles.filtersContainer, { backgroundColor: isDark ? '#1C1C1E' : '#FFFFFF' }]}>
      <View style={styles.filterHeader}>
        <Text style={[styles.filterTitle, { color: isDark ? '#FFFFFF' : '#000000' }]}>
          Filtrar por Track
        </Text>
        <Pressable onPress={onClear} style={styles.clearFilterButton}>
          <Text style={styles.clearFilterText}>Limpiar</Text>
        </Pressable>
      </View>

      <View style={styles.categoriesContainer}>
        {tracks.map(track => {
          const isSelected = selected.includes(track)
          return (
            <Pressable
              key={track}
              style={[
                styles.categoryChip,
                {
                  backgroundColor: isSelected
                    ? '#0A84FF'
                    : isDark ? '#2C2C2E' : '#E5E5EA'
                }
              ]}
              onPress={() => onToggleTrack(track)}
            >
              <Text
                style={[
                  styles.categoryChipText,
                  {
                    color: isSelected ? '#FFFFFF' : isDark ? '#FFFFFF' : '#000000'
                  }
                ]}
              >
                {track}
              </Text>
            </Pressable>
          )
        })}
      </View>
    </View>
  )
}
