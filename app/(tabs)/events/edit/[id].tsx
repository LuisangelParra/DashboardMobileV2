// app/(tabs)/events/edit/[id].tsx

import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  ScrollView,
  Pressable,
  useColorScheme,
  Image,
  ActivityIndicator
} from 'react-native';
import Constants from 'expo-constants';
import { useLocalSearchParams, router } from 'expo-router';
import { Calendar, Clock, MapPin, ImagePlus, X } from 'lucide-react-native';
import { EventCategory } from '@/types';
import { useEvent } from '@/hooks/useEvent';

const {
  UNIDB_BASE_URL,
  UNIDB_CONTRACT_KEY
} = (Constants.expoConfig!.extra as {
  UNIDB_BASE_URL: string;
  UNIDB_CONTRACT_KEY: string;
});
const BASE_URL = `${UNIDB_BASE_URL}/${UNIDB_CONTRACT_KEY}`;

type RawRow<T> = { entry_id: string; data: T };
type RawEvent = {
  id: number;
  titulo: string;
  descripcion: string;
  tema: string;
  fecha: string;
  hora_inicio: string;
  hora_fin: string;
  location: string;
  imageUrl: string;
  suscritos: number;
};

export default function EditEventScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';

  // get parsed event fields
  const { event, isLoading: loadingEvent } = useEvent(id);

  // store the DB entry_id so we can PUT to the correct row
  const [entryId, setEntryId] = useState<string>('');

  const [formData, setFormData] = useState({
    name: '',
    description: '',
    category: '' as EventCategory,
    date: '',
    startTime: '',
    endTime: '',
    location: '',
    imageUrl: '',
  });

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  // fetch the raw entry_id for this event
  useEffect(() => {
    if (!id) return;
    (async () => {
      try {
        const res = await fetch(`${BASE_URL}/data/events/all?format=json`);
        const json = (await res.json()) as { data: RawRow<RawEvent>[] };
        const row = json.data.find(r => String(r.data.id) === id);
        if (row) setEntryId(row.entry_id);
      } catch (err) {
        console.error('Error fetching entryId:', err);
      }
    })();
  }, [id]);

  // once we have the Event object, populate the form
  useEffect(() => {
    if (!event) return;
    const [startTime, endTime] = event.time.split(' - ');
    setFormData({
      name: event.name,
      description: event.description,
      category: event.category,
      date: event.date,
      startTime,
      endTime,
      location: event.location,
      imageUrl: event.imageUrl,
    });
  }, [event]);

  const categories: EventCategory[] = [
    'Workshop',
    'Presentation',
    'Panel',
    'Networking',
    'Other',
  ];

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.name.trim()) newErrors.name = 'Event name is required';
    if (!formData.description.trim()) newErrors.description = 'Description is required';
    if (!formData.category) newErrors.category = 'Category is required';
    if (!formData.date.trim()) newErrors.date = 'Date is required';
    if (!formData.startTime.trim()) newErrors.startTime = 'Start time is required';
    if (!formData.endTime.trim()) newErrors.endTime = 'End time is required';
    if (!formData.location.trim()) newErrors.location = 'Location is required';
    if (!formData.imageUrl.trim()) newErrors.imageUrl = 'Image URL is required';

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async () => {
    if (!validateForm()) return;
    if (!entryId) {
      setErrors({ submit: 'Unable to identify event in database.' });
      return;
    }

    setIsSubmitting(true);
    try {
      const payload = {
        data: {
          titulo: formData.name,
          descripcion: formData.description,
          tema: formData.category,
          fecha: formData.date,
          hora_inicio: formData.startTime,
          hora_fin: formData.endTime,
          location: formData.location,
          imageUrl: formData.imageUrl,
        }
      };

      const res = await fetch(
        `${BASE_URL}/data/events/update/${entryId}`,
        {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
        }
      );

      if (!res.ok) {
        const err = await res.json();
        throw new Error(JSON.stringify(err));
      }

      router.back();
    } catch (error) {
      console.error('Error updating event:', error);
      setErrors({ submit: 'Failed to update event. Please try again.' });
    } finally {
      setIsSubmitting(false);
    }
  };

  if (loadingEvent) {
    return (
      <View style={[styles.loadingContainer, { backgroundColor: isDark ? '#000' : '#F2F2F7' }]}>
        <ActivityIndicator size="large" color="#0A84FF" />
      </View>
    );
  }

  if (!event) {
    return (
      <View style={[styles.errorContainer, { backgroundColor: isDark ? '#000' : '#F2F2F7' }]}>
        <Text style={[styles.errorText, { color: isDark ? '#FFF' : '#000' }]}>
          Event not found
        </Text>
        <Pressable style={styles.backButton} onPress={() => router.back()}>
          <Text style={styles.backButtonText}>Go Back</Text>
        </Pressable>
      </View>
    );
  }

  return (
    <ScrollView
      style={[styles.container, { backgroundColor: isDark ? '#000' : '#F2F2F7' }]}
      contentContainerStyle={styles.contentContainer}
    >
      <View style={[styles.formContainer, { backgroundColor: isDark ? '#1C1C1E' : '#FFF' }]}>
        {/* Image */}
        {formData.imageUrl ? (
          <View style={styles.imagePreviewContainer}>
            <Image
              source={{ uri: formData.imageUrl }}
              style={styles.imagePreview}
              resizeMode="cover"
            />
            <Pressable
              style={styles.removeImageButton}
              onPress={() => setFormData(prev => ({ ...prev, imageUrl: '' }))}
            >
              <X size={20} color="#FFF" />
            </Pressable>
          </View>
        ) : (
          <Pressable
            style={[styles.imageUploadButton, { backgroundColor: isDark ? '#2C2C2E' : '#F2F2F7' }]}
            onPress={() =>
              setFormData(prev => ({
                ...prev,
                imageUrl:
                  'https://images.pexels.com/photos/2774556/pexels-photo-2774556.jpeg',
              }))
            }
          >
            <ImagePlus size={32} color={isDark ? '#FFF' : '#000'} />
            <Text style={[styles.imageUploadText, { color: isDark ? '#FFF' : '#000' }]}>
              Change Event Image
            </Text>
          </Pressable>
        )}

        {/* Name */}
        <View style={styles.inputContainer}>
          <Text style={[styles.label, { color: isDark ? '#FFF' : '#000' }]}>Event Name *</Text>
          <TextInput
            style={[
              styles.input,
              { backgroundColor: isDark ? '#2C2C2E' : '#F2F2F7', color: isDark ? '#FFF' : '#000' },
            ]}
            placeholder="Enter event name"
            placeholderTextColor={isDark ? '#8E8E93' : '#3C3C43'}
            value={formData.name}
            onChangeText={text => setFormData(prev => ({ ...prev, name: text }))}
          />
          {errors.name && <Text style={styles.errorText}>{errors.name}</Text>}
        </View>

        {/* Description */}
        <View style={styles.inputContainer}>
          <Text style={[styles.label, { color: isDark ? '#FFF' : '#000' }]}>Description *</Text>
          <TextInput
            style={[
              styles.input,
              styles.textArea,
              { backgroundColor: isDark ? '#2C2C2E' : '#F2F2F7', color: isDark ? '#FFF' : '#000' },
            ]}
            placeholder="Enter event description"
            placeholderTextColor={isDark ? '#8E8E93' : '#3C3C43'}
            multiline
            numberOfLines={4}
            value={formData.description}
            onChangeText={text => setFormData(prev => ({ ...prev, description: text }))}
          />
          {errors.description && <Text style={styles.errorText}>{errors.description}</Text>}
        </View>

        {/* Category */}
        <View style={styles.inputContainer}>
          <Text style={[styles.label, { color: isDark ? '#FFF' : '#000' }]}>Category *</Text>
          <View style={styles.categoryContainer}>
            {categories.map(cat => (
              <Pressable
                key={cat}
                style={[
                  styles.categoryChip,
                  {
                    backgroundColor:
                      formData.category === cat ? '#0A84FF' : isDark ? '#2C2C2E' : '#F2F2F7',
                  },
                ]}
                onPress={() => setFormData(prev => ({ ...prev, category: cat }))}
              >
                <Text
                  style={[
                    styles.categoryChipText,
                    { color: formData.category === cat ? '#FFF' : isDark ? '#FFF' : '#000' },
                  ]}
                >
                  {cat}
                </Text>
              </Pressable>
            ))}
          </View>
          {errors.category && <Text style={styles.errorText}>{errors.category}</Text>}
        </View>

        {/* Date */}
        <View style={styles.inputContainer}>
          <Text style={[styles.label, { color: isDark ? '#FFF' : '#000' }]}>Date *</Text>
          <View style={styles.iconInput}>
            <Calendar size={20} color={isDark ? '#8E8E93' : '#3C3C43'} />
            <TextInput
              style={[
                styles.input,
                { backgroundColor: isDark ? '#2C2C2E' : '#F2F2F7', color: isDark ? '#FFF' : '#000' },
              ]}
              placeholder="YYYY-MM-DD"
              placeholderTextColor={isDark ? '#8E8E93' : '#3C3C43'}
              value={formData.date}
              onChangeText={text => setFormData(prev => ({ ...prev, date: text }))}
            />
          </View>
          {errors.date && <Text style={styles.errorText}>{errors.date}</Text>}
        </View>

        {/* Time */}
        <View style={[styles.row, { marginBottom: 16 }]}>
          <View style={[styles.inputContainer, styles.flex1]}>
            <Text style={[styles.label, { color: isDark ? '#FFF' : '#000' }]}>Start Time *</Text>
            <View style={styles.iconInput}>
              <Clock size={20} color={isDark ? '#8E8E93' : '#3C3C43'} />
              <TextInput
                style={[
                  styles.input,
                  { backgroundColor: isDark ? '#2C2C2E' : '#F2F2F7', color: isDark ? '#FFF' : '#000' },
                ]}
                placeholder="HH:MM"
                placeholderTextColor={isDark ? '#8E8E93' : '#3C3C43'}
                value={formData.startTime}
                onChangeText={text => setFormData(prev => ({ ...prev, startTime: text }))}
              />
            </View>
            {errors.startTime && <Text style={styles.errorText}>{errors.startTime}</Text>}
          </View>

          <View style={[styles.inputContainer, styles.flex1]}>
            <Text style={[styles.label, { color: isDark ? '#FFF' : '#000' }]}>End Time *</Text>
            <View style={styles.iconInput}>
              <Clock size={20} color={isDark ? '#8E8E93' : '#3C3C43'} />
              <TextInput
                style={[
                  styles.input,
                  { backgroundColor: isDark ? '#2C2C2E' : '#F2F2F7', color: isDark ? '#FFF' : '#000' },
                ]}
                placeholder="HH:MM"
                placeholderTextColor={isDark ? '#8E8E93' : '#3C3C43'}
                value={formData.endTime}
                onChangeText={text => setFormData(prev => ({ ...prev, endTime: text }))}
              />
            </View>
            {errors.endTime && <Text style={styles.errorText}>{errors.endTime}</Text>}
          </View>
        </View>

        {/* Location */}
        <View style={styles.inputContainer}>
          <Text style={[styles.label, { color: isDark ? '#FFF' : '#000' }]}>Location *</Text>
          <View style={styles.iconInput}>
            <MapPin size={20} color={isDark ? '#8E8E93' : '#3C3C43'} />
            <TextInput
              style={[
                styles.input,
                { backgroundColor: isDark ? '#2C2C2E' : '#F2F2F7', color: isDark ? '#FFF' : '#000' },
              ]}
              placeholder="Enter location"
              placeholderTextColor={isDark ? '#8E8E93' : '#3C3C43'}
              value={formData.location}
              onChangeText={text => setFormData(prev => ({ ...prev, location: text }))}
            />
          </View>
          {errors.location && <Text style={styles.errorText}>{errors.location}</Text>}
        </View>

        {errors.submit && <Text style={[styles.errorText, styles.submitError]}>{errors.submit}</Text>}

        <Pressable
          style={styles.submitButton}
          onPress={handleSubmit}
          disabled={isSubmitting}
        >
          <Text style={styles.submitButtonText}>
            {isSubmitting ? 'Saving...' : 'Save Changes'}
          </Text>
        </Pressable>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  contentContainer: {
    padding: 16,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  errorText: {
    fontSize: 18,
    marginBottom: 16,
  },
  backButton: {
    padding: 12,
    backgroundColor: '#0A84FF',
    borderRadius: 8,
  },
  backButtonText: {
    color: '#FFFFFF',
    fontWeight: '600',
  },
  formContainer: {
    borderRadius: 12,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  imagePreviewContainer: {
    height: 200,
    borderRadius: 12,
    overflow: 'hidden',
    marginBottom: 16,
    position: 'relative',
  },
  imagePreview: {
    width: '100%',
    height: '100%',
  },
  removeImageButton: {
    position: 'absolute',
    top: 8,
    right: 8,
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  imageUploadButton: {
    height: 200,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
  },
  imageUploadText: {
    marginTop: 8,
    fontSize: 16,
    fontWeight: '500',
  },
  inputContainer: {
    marginBottom: 16,
  },
  label: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 8,
  },
  input: {
    height: 44,
    borderRadius: 8,
    paddingHorizontal: 12,
    fontSize: 16,
    flex: 1,
  },
  textArea: {
    height: 100,
    paddingTop: 12,
    paddingBottom: 12,
    textAlignVertical: 'top',
  },
  categoryContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  categoryChip: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
  },
  categoryChipText: {
    fontSize: 14,
    fontWeight: '500',
  },
  row: {
    flexDirection: 'row',
    gap: 16,
  },
  flex1: {
    flex: 1,
  },
  iconInput: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: '#2C2C2E',
    borderRadius: 8,
    paddingHorizontal: 12,
  },
  errorText: {
    color: '#FF453A',
    fontSize: 14,
    marginTop: 4,
  },
  submitError: {
    textAlign: 'center',
    marginBottom: 16,
  },
  submitButton: {
    backgroundColor: '#0A84FF',
    height: 50,
    borderRadius: 25,
    alignItems: 'center',
    justifyContent: 'center',
  },
  submitButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
});