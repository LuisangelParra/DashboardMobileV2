// app/(tabs)/events/edit/[id].tsx

import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  Pressable,
  useColorScheme,
  ActivityIndicator,
  Alert
} from 'react-native';
import Constants from 'expo-constants';
import { useLocalSearchParams, router } from 'expo-router';
import { useEvent } from '@/hooks/useEvent';
import styles from '@/components/events/edit/editEvent.styles';

import { ImagePickerField } from '@/components/events/edit/ImagePickerField';
import { TextField } from '@/components/events/edit/TextField';
import { TextAreaField } from '@/components/events/edit/TextAreaField';
import { CategorySelector } from '@/components/events/edit/CategorySelector';
import { DateTimeFields } from '@/components/events/edit/DateTimeFields';
import { LocationField } from '@/components/events/edit/LocationField';
import { SubmitDeleteButtons } from '@/components/events/edit/SubmitDeleteButtons';

import { EventCategory } from '@/types';

const {
  UNIDB_BASE_URL,
  UNIDB_CONTRACT_KEY
} = (Constants.expoConfig!.extra as {
  UNIDB_BASE_URL: string;
  UNIDB_CONTRACT_KEY: string;
});
const BASE_URL = `${UNIDB_BASE_URL}/${UNIDB_CONTRACT_KEY}`;

type RawRow<T> = { entry_id: string; data: T & Record<string, any> };
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
  // plus any other fields
};
type RawEventSpeaker = { event_id: number; speaker_id: number };
type RawEventTrack = { event_id: number; track_id: number };

export default function EditEventScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';

  const { event, isLoading: loadingEvent } = useEvent(id);
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
  const [isDeleting, setIsDeleting] = useState(false);

  // 1) Obtener el entry_id correspondiente en UniDB
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

  // 2) Popula el formulario con los datos existentes
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

  // 3) Validación de formulario
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

  // 4) Al presionar “Save Changes”: recupero la fila original, la fusiono y hago PUT
  const handleSubmit = async () => {
    if (!validateForm()) return;
    if (!entryId) {
      setErrors({ submit: 'Unable to identify event in database.' });
      return;
    }
    setIsSubmitting(true);
    try {
      // a) Obtener datos crudos para conservar campos no editables
      const resRow = await fetch(`${BASE_URL}/data/events/all?format=json`);
      const { data: rows } = (await resRow.json()) as { data: RawRow<RawEvent>[] };
      const row = rows.find(r => r.entry_id === entryId);
      if (!row) throw new Error('Original event data not found');
      const original = row.data;

      // b) Fusionar los campos que sí se editaron
      const merged = {
        ...original,
        titulo:      formData.name,
        descripcion: formData.description,
        tema:        formData.category,
        fecha:       formData.date,
        hora_inicio: formData.startTime,
        hora_fin:    formData.endTime,
        location:    formData.location,
        imageUrl:    formData.imageUrl,
        // Dejamos intactos todos los demás campos (ponente, invitados_especiales, modalidad, etc.)
      };

      const payload = { data: merged };

      // c) Enviar PUT a UniDB
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

      // Volver atrás (y, si tienes un reload en useEvent, se refrescará la vista detalle)
      router.back();
    } catch (error) {
      console.error('Error updating event:', error);
      setErrors({ submit: 'Failed to update event. Please try again.' });
    } finally {
      setIsSubmitting(false);
    }
  };

  // 5) Confirmar delete con diálogo nativo
  const confirmDelete = () => {
    Alert.alert(
      'Delete Event',
      'Are you sure you want to delete this event and all its relations?',
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Delete', style: 'destructive', onPress: handleDelete },
      ]
    );
  };

  // 6) Eliminar relaciones y el evento
  const handleDelete = async () => {
    if (!id || !entryId) {
      Alert.alert('Error', 'Missing event identifier.');
      return;
    }
    setIsDeleting(true);
    try {
      // a) Borrar event_speakers
      const relS = await fetch(`${BASE_URL}/data/event_speakers/all?format=json`);
      const { data: rs } = (await relS.json()) as { data: RawRow<RawEventSpeaker>[] };
      for (const r of rs.filter(r => String(r.data.event_id) === id)) {
        await fetch(
          `${BASE_URL}/data/event_speakers/delete/${r.entry_id}`,
          { method: 'DELETE' }
        );
      }

      // b) Borrar event_tracks
      const relT = await fetch(`${BASE_URL}/data/event_tracks/all?format=json`);
      const { data: rt } = (await relT.json()) as { data: RawRow<RawEventTrack>[] };
      for (const r of rt.filter(r => String(r.data.event_id) === id)) {
        await fetch(
          `${BASE_URL}/data/event_tracks/delete/${r.entry_id}`,
          { method: 'DELETE' }
        );
      }

      // c) Borrar el evento
      const resDel = await fetch(
        `${BASE_URL}/data/events/delete/${entryId}`,
        { method: 'DELETE' }
      );
      if (!resDel.ok) throw new Error('Failed to delete event');

      router.back();
    } catch (err) {
      console.error('Error deleting event:', err);
      Alert.alert('Error', 'Failed to delete event. Please try again.');
    } finally {
      setIsDeleting(false);
    }
  };

  // 7) Mostrar indicador mientras carga
  if (loadingEvent) {
    return (
      <View style={[styles.loadingContainer, { backgroundColor: isDark ? '#000' : '#F2F2F7' }]}>
        <ActivityIndicator size="large" color="#0A84FF" />
      </View>
    );
  }

  // 8) Si no existe el evento
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

  // 9) Render del formulario completo, usando los componentes divididos
  return (
    <ScrollView
      style={[styles.container, { backgroundColor: isDark ? '#000' : '#F2F2F7' }]}
      contentContainerStyle={styles.contentContainer}
    >
      <View style={[styles.formContainer, { backgroundColor: isDark ? '#1C1C1E' : '#FFF' }]}>
        {/* Imagen */}
        <ImagePickerField
          imageUrl={formData.imageUrl}
          onImageChange={uri => setFormData(p => ({ ...p, imageUrl: uri }))}
        />

        {/* Nombre */}
        <TextField
          label="Event Name *"
          value={formData.name}
          placeholder="Enter event name"
          onChange={text => setFormData(p => ({ ...p, name: text }))}
          error={errors.name}
        />

        {/* Descripción */}
        <TextAreaField
          label="Description *"
          value={formData.description}
          placeholder="Enter event description"
          onChange={text => setFormData(p => ({ ...p, description: text }))}
          error={errors.description}
        />

        {/* Categoría */}
        <CategorySelector
          label="Category *"
          options={categories}
          selected={formData.category}
          onSelect={opt => setFormData(p => ({ ...p, category: opt }))}
          error={errors.category}
        />

        {/* Fecha y Horario */}
        <DateTimeFields
          date={formData.date}
          startTime={formData.startTime}
          endTime={formData.endTime}
          onDateChange={text => setFormData(p => ({ ...p, date: text }))}
          onStartTimeChange={text => setFormData(p => ({ ...p, startTime: text }))}
          onEndTimeChange={text => setFormData(p => ({ ...p, endTime: text }))}
          errors={{
            date: errors.date,
            startTime: errors.startTime,
            endTime: errors.endTime
          }}
        />

        {/* Ubicación */}
        <LocationField
          value={formData.location}
          onChange={text => setFormData(p => ({ ...p, location: text }))}
          error={errors.location}
        />

        {/* Errores globales de submit */}
        {errors.submit && <Text style={[styles.errorText, styles.submitError]}>{errors.submit}</Text>}

        {/* Botones Guardar / Borrar */}
        <SubmitDeleteButtons
          isSubmitting={isSubmitting}
          isDeleting={isDeleting}
          onSubmit={handleSubmit}
          onConfirmDelete={confirmDelete}
        />
      </View>
    </ScrollView>
  );
}
