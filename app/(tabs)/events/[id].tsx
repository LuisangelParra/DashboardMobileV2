import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  Pressable,
  useColorScheme,
  ActivityIndicator,
  Alert,
  Platform,
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
import { SpeakerPicker } from '@/components/events/edit/SpeakerPicker';
import { MultiSpeakerPicker } from '@/components/events/edit/MultiSpeakerPicker';

const {
  UNIDB_BASE_URL,
  UNIDB_CONTRACT_KEY,
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
  lugar: string;
  imageUrl: string;
  ponente: string | null;
  invitados_especiales: string[];
};

type RawTrack = { id: number; nombre: string };
type RawEventTrack = { event_id: number; track_id: number };

export default function EditEventScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const isDark = useColorScheme() === 'dark';

  const { event, isLoading: loadingEvent } = useEvent(id);

  const [entryId, setEntryId] = useState('');
  const [trackNameToId, setTrackNameToId] = useState<Record<string, number>>({});
  const [allTracks, setAllTracks] = useState<string[]>([]);
  const [selectedTracks, setSelectedTracks] = useState<string[]>([]);
  
  type SpeakerOption = { id: string; name: string };
  const [speakerOptions, setSpeakerOptions] = useState<SpeakerOption[]>([]);
  const [mainSpeakerName, setMainSpeakerName] = useState<string>('');
  const [guestNames, setGuestNames] = useState<string[]>([]);

  const [formData, setFormData] = useState({
    name: '',
    description: '',
    date: '',
    startTime: '',
    endTime: '',
    location: '',
    imageUrl: '',
  });

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  // Cargar entry_id del evento
  useEffect(() => {
    if (!id) return;
    
    const loadEntryId = async () => {
      try {
        const res = await fetch(`${BASE_URL}/data/events/all?format=json`);
        const { data } = (await res.json()) as { data: RawRow<RawEvent>[] };
        const row = data.find(r => String(r.data.id) === id);
        if (row) {
          setEntryId(row.entry_id);
          console.log('✅ Entry ID encontrado:', row.entry_id);
        }
      } catch (e) {
        console.error('❌ Error cargando entry_id:', e);
      }
    };
    
    loadEntryId();
  }, [id]);

  // Cargar tracks, speakers y relaciones
  useEffect(() => {
    if (!id) return;

    const loadData = async () => {
      try {
        console.log('📊 Cargando datos para evento:', id);

        // Cargar tracks
        const resT = await fetch(`${BASE_URL}/data/tracks/all?format=json`);
        const { data: rawT } = (await resT.json()) as { data: RawRow<RawTrack>[] };
        const map: Record<string, number> = {};
        const names: string[] = [];
        rawT.forEach(r => {
          map[r.data.nombre] = r.data.id;
          names.push(r.data.nombre);
        });
        setTrackNameToId(map);
        setAllTracks(names);

        // Cargar tracks seleccionados para este evento
        const resET = await fetch(`${BASE_URL}/data/event_tracks/all?format=json`);
        const { data: rawET } = (await resET.json()) as { data: RawRow<RawEventTrack>[] };
        const trackIds = rawET
          .filter(r => String(r.data.event_id) === id)
          .map(r => r.data.track_id);
        const trackNames = trackIds
          .map(tid => names.find(n => map[n] === tid))
          .filter((n): n is string => !!n);
        setSelectedTracks(trackNames);
        console.log('✅ Tracks seleccionados:', trackNames);

        // Cargar speakers
        const resS = await fetch(`${BASE_URL}/data/speakers/all?format=json`);
        const { data: rawS } = (await resS.json()) as { data: RawRow<{ id: number; name: string }>[] };
        const opts: SpeakerOption[] = rawS.map(r => ({
          id: String(r.data.id),
          name: r.data.name,
        }));
        setSpeakerOptions(opts);

        // Cargar ponente e invitados del evento
        const rowEvResponse = await fetch(`${BASE_URL}/data/events/all?format=json`);
        const { data: allRows } = (await rowEvResponse.json()) as { data: RawRow<RawEvent>[] };
        const rawEv = allRows.find(r => String(r.data.id) === id)?.data;

        if (rawEv?.ponente) {
          setMainSpeakerName(rawEv.ponente);
          console.log('✅ Ponente principal:', rawEv.ponente);
        }
        if (rawEv?.invitados_especiales && Array.isArray(rawEv.invitados_especiales)) {
          const validGuests = rawEv.invitados_especiales.filter(guest => guest != null && guest.trim() !== '');
          setGuestNames(validGuests);
          console.log('✅ Invitados especiales:', validGuests);
        }
      } catch (err) {
        console.error('❌ Error cargando datos:', err);
        Alert.alert('Error', 'Error loading event data. Please try again.');
      }
    };

    loadData();
  }, [id]);

  // Precargar datos del formulario cuando llega el evento
  useEffect(() => {
    if (!event) return;

    console.log('📊 Precargando formulario con evento:', event.name);

    // Parseamos la fecha que viene en formato "Dec 15, 2024" a "YYYY-MM-DD"
    let formattedDate = '';
    try {
      if (event.date) {
        const parsedDate = new Date(event.date);
        if (!isNaN(parsedDate.getTime())) {
          formattedDate = parsedDate.toISOString().split('T')[0];
        }
      }
    } catch (e) {
      console.warn('⚠️ Error parseando fecha:', event.date);
    }

    // Parseamos el tiempo que viene como "09:00 - 11:00"
    const [startTime, endTime] = (event.time || '').split(' - ');

    setFormData({
      name: event.name || '',
      description: event.description || '',
      date: formattedDate,
      startTime: startTime?.trim() || '',
      endTime: endTime?.trim() || '',
      location: event.location || '',
      imageUrl: event.imageUrl || '',
    });

    console.log('✅ Formulario precargado:', {
      name: event.name,
      date: formattedDate,
      startTime: startTime?.trim(),
      endTime: endTime?.trim(),
    });
  }, [event]);

  // Helpers
  const toggleTrack = (track: string) => {
    setSelectedTracks(prev =>
      prev.includes(track) ? prev.filter(t => t !== track) : [...prev, track]
    );
  };

  const toggleGuest = (name: string) => {
    if (!name || !name.trim()) return;

    setGuestNames(prev =>
      prev.includes(name) ? prev.filter(g => g !== name) : [...prev, name]
    );
    if (mainSpeakerName === name) {
      setMainSpeakerName('');
    }
  };

  const validateForm = () => {
    const newErrors: Record<string, string> = {};
    
    if (!formData.name?.trim()) {
      newErrors.name = 'Event name is required';
    }
    if (!formData.description?.trim()) {
      newErrors.description = 'Description is required';
    }
    if (!formData.date?.trim()) {
      newErrors.date = 'Date is required';
    } else {
      // Validar formato de fecha YYYY-MM-DD
      const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
      if (!dateRegex.test(formData.date)) {
        newErrors.date = 'Date must be in YYYY-MM-DD format';
      }
    }
    if (!formData.startTime?.trim()) {
      newErrors.startTime = 'Start time is required';
    } else {
      // Validar formato de hora HH:MM
      const timeRegex = /^([01]?[0-9]|2[0-3]):[0-5][0-9]$/;
      if (!timeRegex.test(formData.startTime)) {
        newErrors.startTime = 'Start time must be in HH:MM format';
      }
    }
    if (!formData.endTime?.trim()) {
      newErrors.endTime = 'End time is required';
    } else {
      const timeRegex = /^([01]?[0-9]|2[0-3]):[0-5][0-9]$/;
      if (!timeRegex.test(formData.endTime)) {
        newErrors.endTime = 'End time must be in HH:MM format';
      }
    }
    if (!formData.location?.trim()) {
      newErrors.location = 'Location is required';
    }
    if (!formData.imageUrl?.trim()) {
      newErrors.imageUrl = 'Image URL is required';
    }
    if (selectedTracks.length === 0) {
      newErrors.tracks = 'Select at least one track';
    }
    if (!mainSpeakerName?.trim()) {
      newErrors.mainSpeaker = 'Select main speaker';
    }
    
    setErrors(newErrors);
    
    if (Object.keys(newErrors).length > 0) {
      console.log('❌ Errores de validación:', newErrors);
      return false;
    }
    
    console.log('✅ Validación exitosa');
    return true;
  };

  const handleSubmit = async () => {
    console.log('📤 Iniciando envío del formulario...');
    
    if (!validateForm() || !entryId) {
      if (!entryId) {
        Alert.alert('Error', 'Event entry ID not found. Please try again.');
      }
      return;
    }
    
    setIsSubmitting(true);
    
    try {
      // 1. Obtener datos originales del evento
      const resAll = await fetch(`${BASE_URL}/data/events/all?format=json`);
      const { data } = (await resAll.json()) as { data: RawRow<RawEvent>[] };
      const row = data.find(r => r.entry_id === entryId);
      if (!row) {
        throw new Error('Original event not found');
      }

      // 2. Actualizar evento en la base de datos
      const payload = {
        data: {
          ...row.data,
          titulo: formData.name.trim(),
          descripcion: formData.description.trim(),
          fecha: formData.date.trim(),
          hora_inicio: formData.startTime.trim(),
          hora_fin: formData.endTime.trim(),
          lugar: formData.location.trim(),
          imageUrl: formData.imageUrl.trim(),
          ponente: mainSpeakerName.trim() || null,
          invitados_especiales: guestNames.filter(g => g && g.trim() !== ''),
        },
      };

      console.log('📤 Enviando payload:', payload);

      const putRes = await fetch(`${BASE_URL}/data/events/update/${entryId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      if (!putRes.ok) {
        const errorText = await putRes.text();
        console.error('❌ Error en PUT:', errorText);
        throw new Error(`Failed to update event: ${putRes.status}`);
      }

      console.log('✅ Evento actualizado exitosamente');

      // 3. Sincronizar tracks del evento
      const relRes = await fetch(`${BASE_URL}/data/event_tracks/all?format=json`);
      const { data: relRows } = (await relRes.json()) as { data: RawRow<RawEventTrack>[] };
      const oldRows = relRows.filter(r => String(r.data.event_id) === id);
      
      // Eliminar tracks anteriores
      for (const r of oldRows) {
        await fetch(`${BASE_URL}/data/event_tracks/delete/${r.entry_id}`, { method: 'DELETE' });
      }
      
      // Agregar nuevos tracks
      for (const trkName of selectedTracks) {
        const trkId = trackNameToId[trkName];
        if (!trkId) continue;
        await fetch(`${BASE_URL}/data/store`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            table_name: 'event_tracks',
            data: { event_id: Number(id), track_id: trkId },
          }),
        });
      }

      console.log('✅ Tracks sincronizados exitosamente');

      // Mostrar mensaje de éxito
      if (Platform.OS === 'web') {
        alert('Event updated successfully!');
      } else {
        Alert.alert('Success', 'Event updated successfully!');
      }

      // Regresar a la pantalla anterior
      router.back();
      
    } catch (err) {
      console.error('❌ Error en envío:', err);
      const errorMessage = err instanceof Error ? err.message : 'Failed to update event';
      
      if (Platform.OS === 'web') {
        alert(`Error: ${errorMessage}`);
      } else {
        Alert.alert('Error', errorMessage);
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const confirmDelete = () => {
    const message = 'Are you sure you want to delete this event and all its relations?';
    
    if (Platform.OS === 'web') {
      if (window.confirm(message)) {
        handleDelete();
      }
    } else {
      Alert.alert(
        'Delete Event',
        message,
        [
          { text: 'Cancel', style: 'cancel' },
          { text: 'Delete', style: 'destructive', onPress: handleDelete },
        ]
      );
    }
  };

  const handleDelete = async () => {
    if (!entryId) return;
    setIsDeleting(true);
    
    try {
      // Borrar relaciones event_tracks
      const rel = await fetch(`${BASE_URL}/data/event_tracks/all?format=json`);
      const { data: rT } = (await rel.json()) as { data: RawRow<RawEventTrack>[] };
      for (const r of rT.filter(r => String(r.data.event_id) === id)) {
        await fetch(`${BASE_URL}/data/event_tracks/delete/${r.entry_id}`, { method: 'DELETE' });
      }
      
      // Borrar evento
      const del = await fetch(`${BASE_URL}/data/events/delete/${entryId}`, { method: 'DELETE' });
      if (!del.ok) throw new Error('Delete failed');

      router.back();
    } catch (err) {
      console.error('❌ Error eliminando evento:', err);
      Alert.alert('Error', 'Failed to delete event.');
    } finally {
      setIsDeleting(false);
    }
  };

  // Renderizado de estados de carga y error
  if (loadingEvent) {
    return (
      <View style={[styles.loadingContainer, { backgroundColor: isDark ? '#000' : '#F2F2F7' }]}>
        <ActivityIndicator size="large" color="#0A84FF" />
        <Text style={[styles.errorText, { color: isDark ? '#FFF' : '#000', fontSize: 16 }]}>
          Loading event...
        </Text>
      </View>
    );
  }

  if (!event) {
    return (
      <View style={[styles.errorContainer, { backgroundColor: isDark ? '#000' : '#F2F2F7' }]}>
        <Text style={[styles.errorText, { color: isDark ? '#FFF' : '#000', fontSize: 18 }]}>
          Event not found
        </Text>
        <Pressable style={styles.backButton} onPress={() => router.back()}>
          <Text style={styles.backButtonText}>Go Back</Text>
        </Pressable>
      </View>
    );
  }

  return (
    <ScrollView style={[styles.container, { backgroundColor: isDark ? '#000' : '#F2F2F7' }]}>
      <View style={[styles.formContainer, { backgroundColor: isDark ? '#1C1C1E' : '#FFF' }]}>
        
        {/* Campo de imagen */}
        <ImagePickerField
          imageUrl={formData.imageUrl}
          onImageChange={uri => setFormData(p => ({ ...p, imageUrl: uri }))}
        />

        {/* Nombre del evento */}
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

        {/* Tracks */}
        <CategorySelector
          label="Tracks *"
          options={allTracks}
          selected={selectedTracks}
          onSelect={toggleTrack}
          error={errors.tracks}
        />

        {/* Ponente principal */}
        <SpeakerPicker
          label="Main Speaker *"
          options={speakerOptions}
          selected={mainSpeakerName}
          onSelect={name => {
            setMainSpeakerName(name);
            if (guestNames.includes(name)) {
              toggleGuest(name);
            }
          }}
          error={errors.mainSpeaker}
        />

        {/* Invitados especiales */}
        <MultiSpeakerPicker
          label="Special Guests"
          options={speakerOptions.filter(s => s.name !== mainSpeakerName)}
          selected={guestNames}
          onSelect={toggleGuest}
        />

        {/* Fecha y hora */}
        <DateTimeFields
          date={formData.date}
          startTime={formData.startTime}
          endTime={formData.endTime}
          onDateChange={d => setFormData(p => ({ ...p, date: d }))}
          onStartTimeChange={t => setFormData(p => ({ ...p, startTime: t }))}
          onEndTimeChange={t => setFormData(p => ({ ...p, endTime: t }))}
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

        {/* Error general */}
        {errors.submit && <Text style={[styles.errorText, styles.submitError]}>{errors.submit}</Text>}

        {/* Botones */}
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