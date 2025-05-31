// components/events/edit/SubmitDeleteButtons.tsx

import React from 'react';
import { View, Pressable, Text, useColorScheme } from 'react-native';
import styles from './editEvent.styles';

interface Props {
  isSubmitting: boolean;
  isDeleting: boolean;
  onSubmit: () => void;
  onConfirmDelete: () => void;
}

export function SubmitDeleteButtons({
  isSubmitting,
  isDeleting,
  onSubmit,
  onConfirmDelete
}: Props) {
  // (Ya no existe “onDelete” en el tipo)
  const isDark = useColorScheme() === 'dark';

  return (
    <View>
      <Pressable
        style={styles.submitButton}
        onPress={onSubmit}
        disabled={isSubmitting || isDeleting}
      >
        <Text style={styles.submitButtonText}>
          {isSubmitting ? 'Saving...' : 'Save Changes'}
        </Text>
      </Pressable>

      <Pressable
        style={styles.deleteButton}
        onPress={onConfirmDelete}
        disabled={isSubmitting || isDeleting}
      >
        <Text style={styles.deleteButtonText}>
          {isDeleting ? 'Deleting...' : 'Delete Event'}
        </Text>
      </Pressable>
    </View>
  );
}
