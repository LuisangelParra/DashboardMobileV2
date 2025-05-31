import React, { useState, useMemo, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  FlatList,
  Pressable,
  useColorScheme,
} from 'react-native';
import styles from './editEvent.styles';

interface SpeakerOption {
  id: string;
  name: string;
}

interface Props {
  label: string;
  options: SpeakerOption[];
  selected: string | null;
  onSelect: (name: string) => void;
  error?: string;
}

export function SpeakerPicker({
  label,
  options,
  selected,
  onSelect,
  error,
}: Props) {
  const isDark = useColorScheme() === 'dark';
  const [query, setQuery] = useState('');
  const [showDropdown, setShowDropdown] = useState(false);

  // Filtrar opciones según query
  const filtered = useMemo(() => {
    const q = query.toLowerCase().trim();
    if (!q) return options;
    return options.filter(o => o.name.toLowerCase().includes(q));
  }, [query, options]);

  // Cuando ya hay seleccionado, reflejarlo en el campo de texto
  useEffect(() => {
    if (selected !== null) {
      setQuery(selected);
    }
  }, [selected]);

  return (
    <View style={styles.inputContainer}>
      <Text style={[styles.label, { color: isDark ? '#FFF' : '#000' }]}>{label}</Text>
      <Pressable
        onPress={() => setShowDropdown(v => !v)}
        style={[
          styles.dropdownInput,
          { backgroundColor: isDark ? '#2C2C2E' : '#F2F2F7' },
        ]}
      >
        <TextInput
          style={[
            styles.input,
            { color: isDark ? '#FFF' : '#000', flex: 1, paddingVertical: 8 },
          ]}
          placeholder="Type to search..."
          placeholderTextColor={isDark ? '#8E8E93' : '#3C3C43'}
          value={query}
          onChangeText={text => {
            setQuery(text);
            setShowDropdown(true);
          }}
        />
      </Pressable>
      {showDropdown && (
        <View
          style={[
            styles.dropdownListContainer,
            { backgroundColor: isDark ? '#1C1C1E' : '#FFF' },
          ]}
        >
          <FlatList
            data={filtered}
            keyExtractor={item => item.id}
            keyboardShouldPersistTaps="handled"
            renderItem={({ item, index }) => (
              <Pressable
                key={`${item.id}-${item.name}-${index}`}
                style={[
                  styles.dropdownItem,
                  { backgroundColor: isDark ? '#2C2C2E' : '#FFF' },
                ]}
                onPress={() => {
                  onSelect(item.name);
                  setShowDropdown(false);
                }}
              >
                <Text style={{ color: isDark ? '#FFF' : '#000' }}>{item.name}</Text>
              </Pressable>
            )}
            ListEmptyComponent={() => (
              <View style={styles.dropdownItem}>
                <Text style={{ color: isDark ? '#FFF' : '#000' }}>No matches</Text>
              </View>
            )}
          />
        </View>
      )}
      {error && <Text style={styles.errorText}>{error}</Text>}
    </View>
  );
}
