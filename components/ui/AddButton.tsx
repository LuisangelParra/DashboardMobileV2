import React from 'react';
import { Pressable } from 'react-native';
import { Plus } from 'lucide-react-native';
import { router } from 'expo-router';
import styles from '@/components/events/events.styles';

export function AddButton() {
  return (
    <Pressable style={styles.addButton} onPress={() => router.push('/events/add')}>
      <Plus size={24} color="#FFFFFF" />
    </Pressable>
  );
}
