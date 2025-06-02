/* eslint-disable react-hooks/exhaustive-deps */
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
import { PlatformField } from '@/components/events/edit/PlatformField';
import { SubmitDeleteButtons } from '@/components/events/edit/SubmitDeleteButtons';
import { SpeakerPicker } from '@/components/events/edit/SpeakerPicker';
import { MultiSpeakerPicker } from '@/components/events/edit/MultiSpeakerPicker';
import { DatePickerField } from '@/components/events/edit/DatePickerField';
import { TimePickerField } from '@/components/events/edit/TimePickerField';

const {
  UNIDB_BASE_URL,
  UNIDB_CONTRACT_KEY,
} = (Constants.expoConfig!.extra as {
  UNIDB_BASE_URL: string;
  UNIDB_CONTRACT_KEY: string;
});
const BASE_URL = `${UNIDB_BASE_URL}/${UNIDB_CONTRACT_KEY}`;

/* ---------- tipos ---------- */
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
type RawEventSpeaker = { event_id: number; speaker_id: number };

export default function EditEventScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const isDark = useColorScheme() === 'dark';

  /* ---------- datos base del evento ---------- */
  const { event, isLoading: loadingEvent } = useEvent(id);

  /* ---------- entry_id de la tabla events ---------- */
  const [entryId, setEntryId] = useState('');
  
  /* ---------- formulario completo ---------- */
  const [formData, setFormData] = useState({
    titulo: '',
    descripcion: '',
    tema: '',
    fecha: '',
    hora_inicio: '',
    hora_fin: '',
    lugar: '',
    modalidad: '' as ModalityType | '',
    plataforma: '',
    max_participantes: '',
    imageUrl: '',
  });

  const [ponente, setPonente] = useState<string>('');
  const [invitadosEspeciales, setInvitadosEspeciales] = useState<string[]>([]);

  /* ---------- opciones disponibles ---------- */
  const [speakerOptions, setSpeakerOptions] = useState<SpeakerOption[]>([]);
  const [allTracks, setAllTracks] = useState<string[]>([]);
  const [trackNameToId, setTrackNameToId] = useState<Record<string, number>>({});

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  const modalityOptions: ModalityType[] = ['Presencial', 'Virtual', 'Hibrida'];

  /* ---------- helper functions ---------- */
  const formatDateInput = (input: string): string => {
    const numbers = input.replace(/\D/g, '');
    
    if (numbers.length >= 8) {
      const year = numbers.slice(0, 4);
      const month = numbers.slice(4, 6);
      const day = numbers.slice(6, 8);
      return `${year}-${month}-${day}`;
    } else if (numbers.length >= 6) {
      const year = numbers.slice(0, 4);
      const month = numbers.slice(4, 6);
      const day = numbers.slice(6);
      return `${year}-${month}-${day}`;
    } else if (numbers.length >= 4) {
      const year = numbers.slice(0, 4);
      const month = numbers.slice(4);
      return `${year}-${month}`;
    }
    return numbers;
  };

  const formatTimeInput = (input: string): string => {
    const numbers = input.replace(/\D/g, '');
    
    if (numbers.length >= 4) {
      const hours = numbers.slice(0, 2);
      const minutes = numbers.slice(2, 4);
      return `${hours}:${minutes}`;
    } else if (numbers.length >= 2) {
      const hours = numbers.slice(0, 2);
      const minutes = numbers.slice(2);
      return `${hours}:${minutes}`;
    }
    return numbers;
  };

  const validateDate = (date: string): string | null => {
    if (!date.trim()) return 'La fecha es requerida';
    
    const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
    if (!dateRegex.test(date)) {
      return 'La fecha debe estar en formato YYYY-MM-DD (ej: 2024-12-25)';
    }
    
    const [year, month, day] = date.split('-').map(Number);
    
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
      return 'Fecha inválida';
    }
    
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    parsedDate.setHours(0, 0, 0, 0);
    
    if (parsedDate < today) {
      return 'La fecha no puede ser anterior al día de hoy';
    }
    
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
    if (!startTime || !endTime) return null;
    
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

  /* ---------- cargar entry_id ---------- */
  useEffect(() => {
    if (!id) return;
    (async () => {
      try {
        const res = await fetch(`${BASE_URL}/data/events/all?format=json`);
        const { data } = (await res.json()) as { data: RawRow<RawEvent>[] };
        const row = data.find(r => String(r.data.id) === id);
        if (row) setEntryId(row.entry_id);
      } catch (e) {
        console.error('entry_id error:', e);
      }
    })();
  }, [id]);

  /* ---------- cargar datos iniciales ---------- */
  useEffect(() => {
    if (!id) return;

    const loadData = async () => {
      try {
        console.log('🔄 Loading speakers and tracks...');
        
        // Cargar speakers
        const speakersRes = await fetch(`${BASE_URL}/data/speakers/all?format=json&t=${Date.now()}`);
        const speakersData = await speakersRes.json();
        console.log('👥 Speakers response:', speakersData);
        
        if (speakersData?.data) {
          const speakers: SpeakerOption[] = speakersData.data.map((entry: any) => ({
            id: String(entry.data.id),
            name: entry.data.name
          }));
          setSpeakerOptions(speakers);
          console.log('✅ Loaded speakers:', speakers.length);
        }

        // Cargar tracks
        const tracksRes = await fetch(`${BASE_URL}/data/tracks/all?format=json&t=${Date.now()}`);
        const tracksData = await tracksRes.json();
        console.log('🏷️ Tracks response:', tracksData);
        
        if (tracksData?.data) {
          const tracks: string[] = [];
          const nameToId: Record<string, number> = {};
          tracksData.data.forEach((entry: any) => {
            tracks.push(entry.data.nombre);
            nameToId[entry.data.nombre] = entry.data.id;
          });
          setAllTracks(tracks);
          setTrackNameToId(nameToId);
          console.log('✅ Loaded tracks:', tracks.length);
        }

        // Cargar datos del evento específico
        const eventRes = await fetch(`${BASE_URL}/data/events/all?format=json`);
        const { data: eventData } = (await eventRes.json()) as { data: RawRow<RawEvent>[] };
        const eventRow = eventData.find(r => String(r.data.id) === id);
        
        if (eventRow) {
          const eventInfo = eventRow.data;
          console.log('📄 Loading event data:', eventInfo);
          
          setFormData({
            titulo: eventInfo.titulo || '',
            descripcion: eventInfo.descripcion || '',
            tema: eventInfo.tema || '',
            fecha: eventInfo.fecha || '',
            hora_inicio: eventInfo.hora_inicio || '',
            hora_fin: eventInfo.hora_fin || '',
            lugar: eventInfo.lugar || '',
            modalidad: eventInfo.modalidad || 'Presencial',
            plataforma: eventInfo.plataforma || '',
            max_participantes: String(eventInfo.max_participantes || ''),
            imageUrl: eventInfo.imageUrl || '',
          });
          
          setPonente(eventInfo.ponente || '');
          setInvitadosEspeciales(Array.isArray(eventInfo.invitados_especiales) ? eventInfo.invitados_especiales : []);
        }
      } catch (error) {
        console.error('❌ Error loading initial data:', error);
      }
    };

    loadData();
  }, [id]);

  /* ---------- validaciones ---------- */
  const validateForm = () => {
    const newErrors: Record<string, string> = {};
    
    if (!formData.titulo.trim()) newErrors.titulo = 'El título del evento es requerido';
    if (!formData.descripcion.trim()) newErrors.descripcion = 'La descripción es requerida';
    if (!formData.tema.trim()) newErrors.tema = 'La categoría es requerida';
    if (!formData.modalidad) newErrors.modalidad = 'La modalidad es requerida';
    if (!ponente.trim()) newErrors.ponente = 'El ponente principal es requerido';
    if (!formData.max_participantes.trim()) newErrors.max_participantes = 'El máximo de participantes es requerido';
    if (!formData.imageUrl.trim()) newErrors.imageUrl = 'La imagen es requerida';
    
    // Validaciones específicas por modalidad
    if (formData.modalidad === 'Virtual' && !formData.plataforma.trim()) {
      newErrors.plataforma = 'La plataforma es requerida para eventos virtuales';
    }
    if ((formData.modalidad === 'Presencial' || formData.modalidad === 'Hibrida') && !formData.lugar.trim()) {
      newErrors.lugar = 'La ubicación es requerida para eventos presenciales';
    }
    
    // Validaciones mejoradas de fecha y hora
    const dateError = validateDate(formData.fecha);
    if (dateError) newErrors.fecha = dateError;
    
    const startTimeError = validateTime(formData.hora_inicio);
    if (startTimeError) newErrors.hora_inicio = startTimeError;
    
    const endTimeError = validateTime(formData.hora_fin);
    if (endTimeError) newErrors.hora_fin = endTimeError;
    
    // Validar rango de tiempo solo si ambas horas son válidas
    if (!startTimeError && !endTimeError) {
      const timeRangeError = validateTimeRange(formData.hora_inicio, formData.hora_fin);
      if (timeRangeError) newErrors.hora_fin = timeRangeError;
    }
    
    // Validar número de participantes
    const maxParticipants = parseInt(formData.max_participantes);
    if (isNaN(maxParticipants) || maxParticipants <= 0) {
      newErrors.max_participantes = 'El máximo de participantes debe ser un número positivo';
    } else if (maxParticipants > 10000) {
      newErrors.max_participantes = 'El máximo de participantes no puede exceder 10,000';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  /* ---------- helpers ---------- */
  const handleSpeakerSelect = (name: string) => {
    setPonente(name);
    // Si estaba en invitados, quitarlo
    if (invitadosEspeciales.includes(name)) {
      setInvitadosEspeciales(prev => prev.filter(g => g !== name));
    }
  };

  const toggleGuest = (name: string) => {
    if (!name) return;
    setInvitadosEspeciales(prev =>
      prev.includes(name) ? prev.filter(g => g !== name) : [...prev, name]
    );
    if (ponente === name) {
      setPonente('');
    }
  };

  /* ---------- actualizar evento ---------- */
  const handleSubmit = async () => {
    console.log('🚀 Save changes button pressed');
    
    if (!validateForm() || !entryId) {
      console.log('❌ Form validation failed or no entry ID');
      return;
    }
    
    setIsSubmitting(true);
    console.log('📝 Starting event update...');
    
    try {
      // 1. Obtener datos originales del evento
      const resAll = await fetch(`${BASE_URL}/data/events/all?format=json`);
      const { data } = (await resAll.json()) as { data: RawRow<RawEvent>[] };
      const originalRow = data.find(r => r.entry_id === entryId);
      if (!originalRow) throw new Error('Original event not found');

      console.log('📄 Original event data:', originalRow.data);

      // 2. Preparar datos actualizados del evento
      const eventData = {
        ...originalRow.data,
        titulo: formData.titulo.trim(),
        descripcion: formData.descripcion.trim(),
        tema: formData.tema.trim(),
        ponente: ponente.trim(),
        invitados_especiales: invitadosEspeciales.filter(g => g.trim()),
        modalidad: formData.modalidad,
        lugar: formData.modalidad === 'Virtual' ? null : formData.lugar.trim(),
        plataforma: formData.modalidad === 'Virtual' ? formData.plataforma.trim() : null,
        fecha: formData.fecha,
        hora_inicio: formData.hora_inicio,
        hora_fin: formData.hora_fin,
        max_participantes: parseInt(formData.max_participantes),
        imageUrl: formData.imageUrl
      };

      console.log('📤 Sending updated event data:', eventData);

      // 3. Actualizar el evento en la base de datos
      const eventResponse = await fetch(`${BASE_URL}/data/events/update/${entryId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Cache-Control': 'no-cache',
        },
        body: JSON.stringify({
          data: eventData
        }),
      });

      console.log('📡 Event update response status:', eventResponse.status);

      if (!eventResponse.ok) {
        const errorText = await eventResponse.text();
        console.error('❌ Event update failed:', errorText);
        throw new Error(`Failed to update event: ${eventResponse.status} - ${errorText}`);
      }

      const eventResult = await eventResponse.json();
      console.log('✅ Event updated successfully:', eventResult);

      // 4. Actualizar relación event_tracks si cambió la categoría
      if (formData.tema && originalRow.data.tema !== formData.tema) {
        console.log('🏷️ Category changed, updating track relationship...');
        
        try {
          // 4.1. Eliminar relación anterior
          console.log('🗑️ Removing old track relationship...');
          const relRes = await fetch(`${BASE_URL}/data/event_tracks/all?format=json`);
          const { data: relRows } = (await relRes.json()) as { data: RawRow<RawEventTrack>[] };
          const oldRows = relRows.filter(r => String(r.data.event_id) === id);
          
          for (const r of oldRows) {
            await fetch(`${BASE_URL}/data/event_tracks/delete/${r.entry_id}`, { 
              method: 'DELETE' 
            });
          }
          console.log(`✅ Removed ${oldRows.length} old track relationships`);

          // 4.2. Crear nueva relación
          const trackId = trackNameToId[formData.tema];
          if (trackId) {
            console.log(`📌 Creating new track relation: event ${id} -> track ${trackId} (${formData.tema})`);
            
            const trackResponse = await fetch(`${BASE_URL}/data/store`, {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
              },
              body: JSON.stringify({
                table_name: 'event_tracks',
                data: {
                  event_id: parseInt(id),
                  track_id: trackId
                }
              }),
            });

            if (!trackResponse.ok) {
              console.warn(`⚠️ Failed to create new track relationship for ${formData.tema}`);
            } else {
              console.log(`✅ New track relationship created for ${formData.tema}`);
            }
          } else {
            console.warn(`⚠️ Track ID not found for: ${formData.tema}`);
          }
        } catch (trackError) {
          console.warn('⚠️ Error updating track relationship:', trackError);
          // No interrumpir el flujo principal por este error
        }
      } else if (formData.tema && originalRow.data.tema === formData.tema) {
        console.log('📝 Category unchanged, keeping existing track relationship');
      }

      // 5. Mostrar mensaje de éxito
      const successMessage = `Evento "${formData.titulo}" actualizado exitosamente!`;
      console.log('🎉', successMessage);
      
      if (Platform.OS === 'web') {
        window.alert(successMessage);
      } else {
        Alert.alert('Éxito', successMessage);
      }
      
      // 6. Navegar de vuelta
      console.log('🔄 Redirecting back...');
      router.back();
      
    } catch (error) {
      console.error('❌ Error updating event:', error);
      
      const errorMessage = error instanceof Error 
        ? `Error: ${error.message}` 
        : 'Error al actualizar el evento. Por favor intenta de nuevo.';
      
      setErrors({ submit: errorMessage });
      
      if (Platform.OS === 'web') {
        window.alert(errorMessage);
      } else {
        Alert.alert('Error', errorMessage);
      }
    } finally {
      setIsSubmitting(false);
      console.log('🔚 Event update process finished');
    }
  };

  /* ---------- eliminar ---------- */
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
      // borrar event_tracks
      const rel = await fetch(`${BASE_URL}/data/event_tracks/all?format=json`);
      const { data: rT } = (await rel.json()) as { data: RawRow<RawEventTrack>[] };
      for (const r of rT.filter(r => String(r.data.event_id) === id)) {
        await fetch(`${BASE_URL}/data/event_tracks/delete/${r.entry_id}`, { method: 'DELETE' });
      }
      // borrar event_speakers
      const relS = await fetch(`${BASE_URL}/data/event_speakers/all?format=json`);
      const { data: rS } = (await relS.json()) as { data: RawRow<RawEventSpeaker>[] };
      for (const r of rS.filter(r => String(r.data.event_id) === id)) {
        await fetch(`${BASE_URL}/data/event_speakers/delete/${r.entry_id}`, { method: 'DELETE' });
      }
      // borrar evento
      const del = await fetch(`${BASE_URL}/data/events/delete/${entryId}`, { method: 'DELETE' });
      if (!del.ok) throw new Error('delete failed');

      router.back();
    } catch (err) {
      console.error('delete error:', err);
      Alert.alert('Error', 'Error al eliminar el evento.');
    } finally {
      setIsDeleting(false);
    }
  };

  /* ---------- loading / error ---------- */
  if (loadingEvent)
    return (
      <View style={[styles.loadingContainer, { backgroundColor: isDark ? '#000' : '#F2F2F7' }]}>
        <ActivityIndicator size="large" color="#0A84FF" />
      </View>
    );

  if (!event)
    return (
      <View style={[styles.errorContainer, { backgroundColor: isDark ? '#000' : '#F2F2F7' }]}>
        <Text style={[styles.errorText, { color: isDark ? '#FFF' : '#000' }]}>
          Evento no encontrado
        </Text>
        <Pressable style={styles.backButton} onPress={() => router.back()}>
          <Text style={styles.backButtonText}>Volver</Text>
        </Pressable>
      </View>
    );

  /* ---------- render ---------- */
  return (
    <ScrollView style={[styles.container, { backgroundColor: isDark ? '#000' : '#F2F2F7' }]}>
      <View style={[styles.formContainer, { backgroundColor: isDark ? '#1C1C1E' : '#FFF' }]}>
        
        {/* Image Upload */}
        <ImagePickerField
          imageUrl={formData.imageUrl || ''}
          onImageChange={uri => setFormData(p => ({ ...p, imageUrl: uri || '' }))}
        />

        {/* Event Title */}
        <TextField
          label="Título del Evento *"
          value={formData.titulo || ''}
          placeholder="Ingresa el título del evento"
          onChange={text => setFormData(p => ({ ...p, titulo: text || '' }))}
          error={errors.titulo}
        />

        {/* Description */}
        <TextAreaField
          label="Descripción *"
          value={formData.descripcion || ''}
          placeholder="Ingresa la descripción del evento"
          onChange={text => setFormData(p => ({ ...p, descripcion: text || '' }))}
          error={errors.descripcion}
        />

        {/* Category - Using tracks from database */}
        <View style={styles.inputContainer}>
          <Text style={[styles.label, { color: isDark ? '#FFFFFF' : '#000000' }]}>
            Categoría *
          </Text>
          {allTracks.length === 0 ? (
            <View style={[styles.categoryContainer, { justifyContent: 'center', alignItems: 'center', padding: 20 }]}>
              <ActivityIndicator size="small" color={isDark ? '#FFFFFF' : '#000000'} />
              <Text style={[{ color: isDark ? '#FFFFFF' : '#000000', marginTop: 8 }]}>
                Cargando categorías...
              </Text>
            </View>
          ) : (
            <View style={styles.categoryContainer}>
              {allTracks.map(track => (
                <Pressable
                  key={track}
                  style={[
                    styles.categoryChip,
                    { 
                      backgroundColor: formData.tema === track 
                        ? '#0A84FF' 
                        : isDark ? '#2C2C2E' : '#F2F2F7'
                    }
                  ]}
                  onPress={() => setFormData(prev => ({ ...prev, tema: track }))}
                >
                  <Text style={[
                    styles.categoryChipText,
                    { 
                      color: formData.tema === track 
                        ? '#FFFFFF' 
                        : isDark ? '#FFFFFF' : '#000000'
                    }
                  ]}>
                    {track}
                  </Text>
                </Pressable>
              ))}
            </View>
          )}
          {errors.tema && <Text style={styles.errorText}>{errors.tema}</Text>}
        </View>

        {/* Main Speaker */}
        <SpeakerPicker
          label="Ponente Principal *"
          options={speakerOptions}
          selected={ponente}
          onSelect={handleSpeakerSelect}
          error={errors.ponente}
        />

        {/* Special Guests */}
        <MultiSpeakerPicker
          label="Invitados Especiales"
          options={speakerOptions.filter(s => s.name !== ponente)}
          selected={invitadosEspeciales}
          onSelect={toggleGuest}
        />

        {/* Modality */}
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

        {/* Platform (only for Virtual events) */}
        {formData.modalidad === 'Virtual' && (
          <PlatformField
            value={formData.plataforma}
            onChange={(text) => setFormData(prev => ({ ...prev, plataforma: text }))}
            error={errors.plataforma}
          />
        )}

        {/* Location (for Presencial and Hibrida) */}
        {(formData.modalidad === 'Presencial' || formData.modalidad === 'Hibrida') && (
          <LocationField
            value={formData.lugar}
            onChange={(text) => setFormData(prev => ({ ...prev, lugar: text }))}
            error={errors.lugar}
          />
        )}

        {/* Date and Time with improved UX */}
        <DatePickerField
          label="Fecha del Evento *"
          value={formData.date}
          onChange={(date) => setFormData(p => ({ ...p, date }))}
          error={errors.date}
          minimumDate={new Date()} // No permitir fechas pasadas
        />

        <View style={styles.timeFieldsContainer || { flexDirection: 'row', gap: 16 }}>
          <View style={{ flex: 1 }}>
            <TimePickerField
              label="Hora de Inicio *"
              value={formData.startTime}
              onChange={(time) => setFormData(p => ({ ...p, startTime: time }))}
              error={errors.startTime}
            />
          </View>
          <View style={{ flex: 1 }}>
            <TimePickerField
              label="Hora de Fin *"
              value={formData.endTime}
              onChange={(time) => setFormData(p => ({ ...p, endTime: time }))}
              error={errors.endTime}
            />
          </View>
        </View>

        {/* Max Participants */}
        <TextField
          label="Máximo de Participantes *"
          value={formData.max_participantes}
          placeholder="Ingresa el número máximo de participantes"
          onChange={(text) => setFormData(prev => ({ ...prev, max_participantes: text }))}
          error={errors.max_participantes}
          keyboardType="numeric"
        />

        {/* Submit Error */}
        {errors.submit && (
          <Text style={[styles.errorText, styles.submitError]}>
            {errors.submit}
          </Text>
        )}

        {/* Submit and Delete Buttons */}
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