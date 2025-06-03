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
import { LocationField } from '@/components/events/edit/LocationField';
import { PlatformField } from '@/components/events/edit/PlatformField';
import { DatePickerField } from '@/components/events/edit/DatePickerField';
import { TimePickerField } from '@/components/events/edit/TimePickerField';
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
type ModalityType = 'Presencial' | 'Virtual' | 'Hibrida';
type SpeakerOption = { id: string; name: string };

type RawEvent = {
  id: number;
  titulo: string;
  descripcion: string;
  tema: string;
  fecha: string;
  hora_inicio: string;
  hora_fin: string;
  lugar: string;
  modalidad: ModalityType;
  plataforma: string;
  max_participantes: number;
  suscritos: number;
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
    modalidad: '' as ModalityType | '',
    plataforma: '',
    max_participantes: '',
    imageUrl: '',
  });

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  const modalityOptions: ModalityType[] = ['Presencial', 'Virtual', 'Hibrida'];

  // ✅ MISMAS VALIDACIONES QUE EN CREATE
  const validateDate = (date: string): string | null => {
    if (!date.trim()) return 'La fecha es requerida';
    
    const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
    if (!dateRegex.test(date)) {
      return 'La fecha debe estar en formato YYYY-MM-DD (ej: 2024-12-25)';
    }
    
    const [year, month, day] = date.split('-').map(Number);
    
    if (year < 2024 || year > 2030) {
      return 'El año debe estar entre 2024 y 2030';
    }
    
    if (month < 1 || month > 12) {
      return 'El mes debe estar entre 01 y 12';
    }
    
    if (day < 1 || day > 31) {
      return 'El día debe estar entre 01 y 31';
    }
    
    const parsedDate = new Date(year, month - 1, day);
    if (parsedDate.getFullYear() !== year || 
        parsedDate.getMonth() !== month - 1 || 
        parsedDate.getDate() !== day) {
      return 'Fecha inválida (día no existe en ese mes)';
    }
    
    // Para edición, permitir fechas pasadas (eventos ya creados)
    return null;
  };

  const validateTime = (time: string): string | null => {
    if (!time.trim()) return 'La hora es requerida';
    
    const timeRegex = /^([01]?[0-9]|2[0-3]):[0-5][0-9]$/;
    if (!timeRegex.test(time)) {
      return 'La hora debe estar en formato HH:MM (ej: 14:30)';
    }
    
    const [hours, minutes] = time.split(':').map(Number);
    
    if (hours > 23) {
      return 'Las horas deben estar entre 00 y 23';
    }
    
    if (minutes > 59) {
      return 'Los minutos deben estar entre 00 y 59';
    }
    
    return null;
  };

  const validateTimeRange = (startTime: string, endTime: string): string | null => {
    const startError = validateTime(startTime);
    const endError = validateTime(endTime);
    
    if (startError || endError) return null;
    
    const [startHour, startMin] = startTime.split(':').map(Number);
    const [endHour, endMin] = endTime.split(':').map(Number);
    
    const startMinutes = startHour * 60 + startMin;
    const endMinutes = endHour * 60 + endMin;
    
    if (endMinutes <= startMinutes) {
      return 'La hora de fin debe ser posterior a la hora de inicio';
    }
    
    if (endMinutes - startMinutes < 30) {
      return 'El evento debe durar al menos 30 minutos';
    }
    
    if (endMinutes - startMinutes > 720) {
      return 'El evento no puede durar más de 12 horas';
    }
    
    return null;
  };

  // ✅ VALIDACIÓN EN TIEMPO REAL PARA HORAS
  const handleStartTimeChange = (time: string) => {
    setFormData(prev => ({ ...prev, startTime: time }));
    
    if (errors.startTime) {
      setErrors(prev => ({ ...prev, startTime: '' }));
    }
    
    if (time && formData.endTime && validateTime(time) === null && validateTime(formData.endTime) === null) {
      const rangeError = validateTimeRange(time, formData.endTime);
      if (rangeError) {
        setErrors(prev => ({ ...prev, endTime: rangeError }));
      } else {
        setErrors(prev => ({ ...prev, endTime: '' }));
      }
    }
  };

  const handleEndTimeChange = (time: string) => {
    setFormData(prev => ({ ...prev, endTime: time }));
    
    if (errors.endTime) {
      setErrors(prev => ({ ...prev, endTime: '' }));
    }
    
    if (time && formData.startTime && validateTime(formData.startTime) === null && validateTime(time) === null) {
      const rangeError = validateTimeRange(formData.startTime, time);
      if (rangeError) {
        setErrors(prev => ({ ...prev, endTime: rangeError }));
      }
    }
  };

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

        // Cargar speakers
        const resS = await fetch(`${BASE_URL}/data/speakers/all?format=json`);
        const { data: rawS } = (await resS.json()) as { data: RawRow<{ id: number; name: string }>[] };
        const opts: SpeakerOption[] = rawS.map(r => ({
          id: String(r.data.id),
          name: r.data.name,
        }));
        setSpeakerOptions(opts);

        // Cargar datos específicos del evento
        const rowEvResponse = await fetch(`${BASE_URL}/data/events/all?format=json`);
        const { data: allRows } = (await rowEvResponse.json()) as { data: RawRow<RawEvent>[] };
        const rawEv = allRows.find(r => String(r.data.id) === id)?.data;

        if (rawEv) {
          setMainSpeakerName(rawEv.ponente || '');
          if (rawEv.invitados_especiales && Array.isArray(rawEv.invitados_especiales)) {
            setGuestNames(rawEv.invitados_especiales.filter(g => g != null && g.trim() !== ''));
          }
          
          // ✅ CARGAR DATOS DE MODALIDAD
          setFormData(prev => ({
            ...prev,
            modalidad: rawEv.modalidad || 'Presencial',
            plataforma: rawEv.plataforma || '',
            max_participantes: String(rawEv.max_participantes || ''),
          }));
        }
      } catch (err) {
        console.error('❌ Error cargando datos:', err);
      }
    };

    loadData();
  }, [id]);

  // Precargar datos del formulario cuando llega el evento
  useEffect(() => {
    if (!event) return;

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

    const [startTime, endTime] = (event.time || '').split(' - ');

    setFormData(prev => ({
      ...prev,
      name: event.name || '',
      description: event.description || '',
      date: formattedDate,
      startTime: startTime?.trim() || '',
      endTime: endTime?.trim() || '',
      location: event.location || '',
      imageUrl: event.imageUrl || '',
    }));
  }, [event]);

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
    
    if (!formData.name?.trim()) newErrors.name = 'Event name is required';
    if (!formData.description?.trim()) newErrors.description = 'Description is required';
    if (!formData.modalidad) newErrors.modalidad = 'Modality is required';
    if (!mainSpeakerName?.trim()) newErrors.mainSpeaker = 'Select main speaker';
    if (!formData.imageUrl?.trim()) newErrors.imageUrl = 'Image URL is required';
    if (selectedTracks.length === 0) newErrors.tracks = 'Select at least one track';
    
    // Validaciones específicas por modalidad
    if (formData.modalidad === 'Virtual' && !formData.plataforma.trim()) {
      newErrors.plataforma = 'Platform is required for virtual events';
    }
    if ((formData.modalidad === 'Presencial' || formData.modalidad === 'Hibrida') && !formData.location?.trim()) {
      newErrors.location = 'Location is required for in-person events';
    }
    
    // ✅ VALIDACIONES MEJORADAS DE FECHA Y HORA
    const dateError = validateDate(formData.date);
    if (dateError) newErrors.date = dateError;
    
    const startTimeError = validateTime(formData.startTime);
    if (startTimeError) newErrors.startTime = startTimeError;
    
    const endTimeError = validateTime(formData.endTime);
    if (endTimeError) newErrors.endTime = endTimeError;
    
    if (!startTimeError && !endTimeError) {
      const timeRangeError = validateTimeRange(formData.startTime, formData.endTime);
      if (timeRangeError) newErrors.endTime = timeRangeError;
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async () => {
    if (!validateForm() || !entryId) {
      if (!entryId) {
        Alert.alert('Error', 'Event entry ID not found. Please try again.');
      }
      return;
    }
    
    setIsSubmitting(true);
    
    try {
      const resAll = await fetch(`${BASE_URL}/data/events/all?format=json`);
      const { data } = (await resAll.json()) as { data: RawRow<RawEvent>[] };
      const row = data.find(r => r.entry_id === entryId);
      if (!row) {
        throw new Error('Original event not found');
      }

      const payload = {
        data: {
          ...row.data,
          titulo: formData.name.trim(),
          descripcion: formData.description.trim(),
          fecha: formData.date.trim(),
          hora_inicio: formData.startTime.trim(),
          hora_fin: formData.endTime.trim(),
          lugar: formData.modalidad === 'Virtual' ? '' : formData.location?.trim() || '',
          modalidad: formData.modalidad,
          plataforma: formData.modalidad === 'Virtual' ? formData.plataforma.trim() : '',
          max_participantes: parseInt(formData.max_participantes) || row.data.max_participantes,
          imageUrl: formData.imageUrl.trim(),
          ponente: mainSpeakerName.trim() || null,
          invitados_especiales: guestNames.filter(g => g && g.trim() !== ''),
        },
      };

      const putRes = await fetch(`${BASE_URL}/data/events/update/${entryId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      if (!putRes.ok) {
        const errorText = await putRes.text();
        throw new Error(`Failed to update event: ${putRes.status}`);
      }

      // Sincronizar tracks
      const relRes = await fetch(`${BASE_URL}/data/event_tracks/all?format=json`);
      const { data: relRows } = (await relRes.json()) as { data: RawRow<RawEventTrack>[] };
      const oldRows = relRows.filter(r => String(r.data.event_id) === id);
      
      for (const r of oldRows) {
        await fetch(`${BASE_URL}/data/event_tracks/delete/${r.entry_id}`, { method: 'DELETE' });
      }
      
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

      if (Platform.OS === 'web') {
        alert('Event updated successfully!');
      } else {
        Alert.alert('Success', 'Event updated successfully!');
      }

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
      const rel = await fetch(`${BASE_URL}/data/event_tracks/all?format=json`);
      const { data: rT } = (await rel.json()) as { data: RawRow<RawEventTrack>[] };
      for (const r of rT.filter(r => String(r.data.event_id) === id)) {
        await fetch(`${BASE_URL}/data/event_tracks/delete/${r.entry_id}`, { method: 'DELETE' });
      }
      
      const del = await fetch(`${BASE_URL}/data/events/delete/${entryId}`, { method: 'DELETE' });
      if (!del.ok) throw new Error('Delete failed');

      router.back();
    } catch (err) {
      Alert.alert('Error', 'Failed to delete event.');
    } finally {
      setIsDeleting(false);
    }
  };

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
        
        <ImagePickerField
          imageUrl={formData.imageUrl}
          onImageChange={uri => setFormData(p => ({ ...p, imageUrl: uri }))}
        />

        <TextField
          label="Event Name *"
          value={formData.name}
          placeholder="Enter event name"
          onChange={text => setFormData(p => ({ ...p, name: text }))}
          error={errors.name}
        />

        <TextAreaField
          label="Description *"
          value={formData.description}
          placeholder="Enter event description"
          onChange={text => setFormData(p => ({ ...p, description: text }))}
          error={errors.description}
        />

        <View style={styles.inputContainer}>
          <Text style={[styles.label, { color: isDark ? '#FFF' : '#000' }]}>
            Tracks *
          </Text>
          <View style={styles.categoryContainer}>
            {allTracks.map((track, index) => {
              const isSelected = selectedTracks.includes(track);
              return (
                <Pressable
                  key={`track-${track}-${index}`}
                  style={[
                    styles.categoryChip,
                    {
                      backgroundColor: isSelected
                        ? '#0A84FF'
                        : isDark
                        ? '#2C2C2E'
                        : '#F2F2F7',
                    },
                  ]}
                  onPress={() => toggleTrack(track)}
                >
                  <Text
                    style={[
                      styles.categoryChipText,
                      { color: isSelected ? '#FFF' : isDark ? '#FFF' : '#000' },
                    ]}
                  >
                    {track}
                  </Text>
                </Pressable>
              );
            })}
          </View>
          {errors.tracks && <Text style={styles.errorText}>{errors.tracks}</Text>}
        </View>

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

        <MultiSpeakerPicker
          label="Special Guests"
          options={speakerOptions.filter(s => s.name !== mainSpeakerName)}
          selected={guestNames}
          onSelect={toggleGuest}
        />

        {/* ✅ MODALIDAD CON VALIDACIONES */}
        <View style={styles.inputContainer}>
          <Text style={[styles.label, { color: isDark ? '#FFFFFF' : '#000000' }]}>
            Modalidad *
          </Text>
          <View style={styles.categoryContainer}>
            {modalityOptions.map(modality => (
              <Pressable
                key={modality}
                style={[
                  styles.categoryChip,
                  { 
                    backgroundColor: formData.modalidad === modality 
                      ? '#0A84FF' 
                      : isDark ? '#2C2C2E' : '#F2F2F7'
                  }
                ]}
                onPress={() => setFormData(prev => ({ ...prev, modalidad: modality }))}
              >
                <Text style={[
                  styles.categoryChipText,
                  { 
                    color: formData.modalidad === modality 
                      ? '#FFFFFF' 
                      : isDark ? '#FFFFFF' : '#000000'
                  }
                ]}>
                  {modality}
                </Text>
              </Pressable>
            ))}
          </View>
          {errors.modalidad && <Text style={styles.errorText}>{errors.modalidad}</Text>}
        </View>

        {formData.modalidad === 'Virtual' && (
          <PlatformField
            value={formData.plataforma}
            onChange={text => setFormData(p => ({ ...p, plataforma: text }))}
            error={errors.plataforma}
          />
        )}

        {(formData.modalidad === 'Presencial' || formData.modalidad === 'Hibrida') && (
          <LocationField
            value={formData.location}
            onChange={text => setFormData(p => ({ ...p, location: text }))}
            error={errors.location}
          />
        )}

        {/* ✅ DATE AND TIME WITH ENHANCED VALIDATIONS */}
        <DatePickerField
          label="Fecha del Evento *"
          value={formData.date}
          onChange={d => setFormData(p => ({ ...p, date: d }))}
          error={errors.date}
        />

        <View style={styles.timeFieldsContainer || { flexDirection: 'row', gap: 16 }}>
          <View style={{ flex: 1 }}>
            <TimePickerField
              label="Hora de Inicio *"
              value={formData.startTime}
              onChange={handleStartTimeChange} // ✅ Validación en tiempo real
              error={errors.startTime}
            />
          </View>
          <View style={{ flex: 1 }}>
            <TimePickerField
              label="Hora de Fin *"
              value={formData.endTime}
              onChange={handleEndTimeChange} // ✅ Validación en tiempo real
              error={errors.endTime}
            />
          </View>
        </View>

        <TextField
          label="Max Participants"
          value={formData.max_participantes}
          placeholder="Enter max participants"
          onChange={text => setFormData(p => ({ ...p, max_participantes: text }))}
          keyboardType="numeric"
        />

        {errors.submit && <Text style={[styles.errorText, styles.submitError]}>{errors.submit}</Text>}

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