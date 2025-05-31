// components/events/edit/ImagePickerField.tsx

import React from 'react';
import { View, Text, Pressable, Image, useColorScheme } from 'react-native';
import { ImagePlus, X } from 'lucide-react-native';
import styles from './editEvent.styles';

interface Props {
  imageUrl: string;
  onImageChange: (uri: string) => void;
}

export function ImagePickerField({ imageUrl, onImageChange }: Props) {
  const isDark = useColorScheme() === 'dark';

  return (
    <>
      {imageUrl ? (
        <View style={styles.imagePreviewContainer}>
          <Image
            source={{ uri: imageUrl }}
            style={styles.imagePreview}
            resizeMode="cover"
          />
          <Pressable
            style={styles.removeImageButton}
            onPress={() => onImageChange('')}
          >
            <X size={20} color="#FFF" />
          </Pressable>
        </View>
      ) : (
        <Pressable
          style={[
            styles.imageUploadButton,
            { backgroundColor: isDark ? '#2C2C2E' : '#F2F2F7' }
          ]}
          onPress={() => {
            // Aquí podrías abrir un picker real; por ahora asignamos una URL por defecto:
            onImageChange('https://images.pexels.com/photos/2774556/pexels-photo-2774556.jpeg');
          }}
        >
          <ImagePlus size={32} color={isDark ? '#FFF' : '#000'} />
          <Text style={[styles.imageUploadText, { color: isDark ? '#FFF' : '#000' }]}>
            Change Event Image
          </Text>
        </Pressable>
      )}
    </>
  );
}
