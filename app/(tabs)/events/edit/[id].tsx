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

/* ---------- tipos crudos ---------- */
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
type RawEventSpeaker = { event_id: number; speaker_id: number };

export default function EditEventScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const isDark = useColorScheme() === 'dark';

  /* ---------- datos base del evento ---------- */
  const { event, isLoading: loadingEvent } = useEvent(id);

  /* ---------- entry_id de la tabla events ---------- */
  const [entryId, setEntryId] = useState('');
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

  /* ---------- tracks disponibles & seleccionados ---------- */
  const [trackNameToId, setTrackNameToId] = useState<Record<string, number>>({});
  const [allTracks, setAllTracks] = useState<string[]>([]);
  const [selectedTracks, setSelectedTracks] = useState<string[]>([]);

  /* ---------- ponente principal e invitados ---------- */
  type SpeakerOption = { id: string; name: string };
  const [speakerOptions, setSpeakerOptions] = useState<SpeakerOption[]>([]);
  const [mainSpeakerName, setMainSpeakerName] = useState<string | null>(null);
  const [guestNames, setGuestNames] = useState<string[]>([]);

  /* ---------- formulario ---------- */
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

  /* ---------- cargar tracks + speakers + ponente/invitados ---------- */
  useEffect(() => {
    if (!id) return;

    const loadData = async () => {
      try {
        /* --- tracks --- */
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

        /* selected tracks del evento */
        const resET = await fetch(`${BASE_URL}/data/event_tracks/all?format=json`);
        const { data: rawET } = (await resET.json()) as { data: RawRow<RawEventTrack>[] };
        const trackIds = rawET
          .filter(r => String(r.data.event_id) === id)
          .map(r => r.data.track_id);
        const trackNames = trackIds
          .map(tid => names.find(n => map[n] === tid))
          .filter((n): n is string => !!n);
        setSelectedTracks(trackNames);

        /* --- speakers --- */
        const resS = await fetch(`${BASE_URL}/data/speakers/all?format=json`);
        const { data: rawS } = (await resS.json()) as { data: RawRow<{ id: number; name: string }>[] };
        const opts: SpeakerOption[] = rawS.map(r => ({
          id: String(r.data.id),
          name: r.data.name,
        }));
        setSpeakerOptions(opts);

        /* ponente / invitados guardados (nombres) */
        const rowEvResponse = await fetch(`${BASE_URL}/data/events/all?format=json`);
        const { data: allRows } = (await rowEvResponse.json()) as { data: RawRow<RawEvent>[] };
        const rawEv = allRows.find(r => String(r.data.id) === id)?.data;
        if (rawEv?.ponente) setMainSpeakerName(rawEv.ponente);
        if (rawEv?.invitados_especiales) setGuestNames(rawEv.invitados_especiales);
      } catch (err) {
        console.error('load tracks/speakers error:', err);
      }
    };

    loadData();
  }, [id]);

  /* ---------- precargar datos cuando llega el evento ---------- */
  useEffect(() => {
    if (!event) return;
    const [startTime, endTime] = event.time.split(' - ');
    setFormData({
      name: event.name,
      description: event.description,
      date: event.date,
      startTime,
      endTime,
      location: event.location,
      imageUrl: event.imageUrl,
    });
  }, [event]);

  /* ---------- helpers ---------- */
  const toggleTrack = (track: string) => {
    setSelectedTracks(prev =>
      prev.includes(track) ? prev.filter(t => t !== track) : [...prev, track]
    );
  };

  const toggleGuest = (name: string) => {
    setGuestNames(prev =>
      prev.includes(name) ? prev.filter(g => g !== name) : [...prev, name]
    );
    if (mainSpeakerName === name) {
      setMainSpeakerName(null);
    }
  };

  const validateForm = () => {
    const e: Record<string, string> = {};
    if (!formData.name.trim()) e.name = 'Event name is required';
    if (!formData.description.trim()) e.description = 'Description is required';
    if (!formData.date.trim()) e.date = 'Date is required';
    if (!formData.startTime.trim()) e.startTime = 'Start time is required';
    if (!formData.endTime.trim()) e.endTime = 'End time is required';
    if (!formData.location.trim()) e.location = 'Location is required';
    if (!formData.imageUrl.trim()) e.imageUrl = 'Image URL is required';
    if (selectedTracks.length === 0) e.tracks = 'Select at least one track';
    if (!mainSpeakerName) e.mainSpeaker = 'Select main speaker';
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  /* ---------- submit ---------- */
  const handleSubmit = async () => {
    if (!validateForm() || !entryId) return;
    setIsSubmitting(true);
    try {
      /* a) conservar resto de campos */
      const resAll = await fetch(`${BASE_URL}/data/events/all?format=json`);
      const { data } = (await resAll.json()) as { data: RawRow<RawEvent>[] };
      const row = data.find(r => r.entry_id === entryId);
      if (!row) throw new Error('Original event not found');

      /* b) PUT a events */
      const payload = {
        data: {
          ...row.data,
          titulo:               formData.name,
          descripcion:          formData.description,
          fecha:                formData.date,
          hora_inicio:          formData.startTime,
          hora_fin:             formData.endTime,
          lugar:                formData.location,
          imageUrl:             formData.imageUrl,
          ponente:              mainSpeakerName,
          invitados_especiales: guestNames,
        },
      };
      const putRes = await fetch(
        `${BASE_URL}/data/events/update/${entryId}`,
        {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
        }
      );
      if (!putRes.ok) throw new Error('PUT failed');

      /* c) sincronizar event_tracks */
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

      router.back(); // el detalle se refresca con useEvent.reload
    } catch (err) {
      console.error('submit error:', err);
      Alert.alert('Error', 'Failed to update event.');
    } finally {
      setIsSubmitting(false);
    }
  };

  /* ---------- eliminar ---------- */
  const confirmDelete = () =>
    Alert.alert(
      'Delete Event',
      'Are you sure you want to delete this event and all its relations?',
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Delete', style: 'destructive', onPress: handleDelete },
      ]
    );

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
      Alert.alert('Error', 'Failed to delete event.');
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
          Event not found
        </Text>
        <Pressable style={styles.backButton} onPress={() => router.back()}>
          <Text style={styles.backButtonText}>Go Back</Text>
        </Pressable>
      </View>
    );

  /* ---------- render ---------- */
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

        {/* TRACKS */}
        <CategorySelector
          label="Tracks *"
          options={allTracks}
          selected={selectedTracks}
          onSelect={toggleTrack}
          error={errors.tracks}
        />

        {/* PONENTE PRINCIPAL */}
        <SpeakerPicker
          label="Main Speaker *"
          options={speakerOptions}
          selected={mainSpeakerName}
          onSelect={name => {
            setMainSpeakerName(name);
            // si estaba en invitados, quitarlo
            if (guestNames.includes(name)) toggleGuest(name);
          }}
          error={errors.mainSpeaker}
        />

        {/* INVITADOS ESPECIALES */}
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
          errors={{ date: errors.date, startTime: errors.startTime, endTime: errors.endTime }}
        />

        {/* Ubicación */}
        <LocationField
          value={formData.location}
          onChange={text => setFormData(p => ({ ...p, location: text }))}
          error={errors.location}
        />

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
