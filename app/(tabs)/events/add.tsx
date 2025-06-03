import { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, Pressable, useColorScheme, Image, Alert, Platform, ActivityIndicator, Modal, TextInput } from 'react-native';
import { router } from 'expo-router';
import { X, ImagePlus, Plus, Check, Trash2 } from 'lucide-react-native';
import { EventCategory } from '@/types';
import { TextField } from '@/components/events/edit/TextField';
import { TextAreaField } from '@/components/events/edit/TextAreaField';
import { DatePickerField } from '@/components/events/edit/DatePickerField';
import { TimePickerField } from '@/components/events/edit/TimePickerField';
import { LocationField } from '@/components/events/edit/LocationField';
import { PlatformField } from '@/components/events/edit/PlatformField';
import { SpeakerPicker } from '@/components/events/edit/SpeakerPicker';
import { MultiSpeakerPicker } from '@/components/events/edit/MultiSpeakerPicker';
import Constants from 'expo-constants';

const {
  UNIDB_BASE_URL,
  UNIDB_CONTRACT_KEY
} = (Constants.expoConfig!.extra as {
  UNIDB_BASE_URL: string;
  UNIDB_CONTRACT_KEY: string;
});
const BASE_URL = `${UNIDB_BASE_URL}/${UNIDB_CONTRACT_KEY}`;

type SpeakerOption = { id: string; name: string };
type ModalityType = 'Presencial' | 'Virtual' | 'Hibrida';

// ✅ NUEVO TIPO: Para manejo completo de tracks
type TrackData = {
  id: number;
  nombre: string;
  entryId: string;
};

export default function CreateEventScreen() {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';
  
  // Estados del formulario
  const [formData, setFormData] = useState({
    titulo: '',
    descripcion: '',
    categorias: [] as string[],
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
  
  // Estados para opciones
  const [speakerOptions, setSpeakerOptions] = useState<SpeakerOption[]>([]);
  const [allTracks, setAllTracks] = useState<string[]>([]);
  const [trackNameToId, setTrackNameToId] = useState<Record<string, number>>({});
  
  // ✅ NUEVO ESTADO: Para datos completos de tracks
  const [tracksData, setTracksData] = useState<TrackData[]>([]);
  
  // Estados para modal de nueva categoría
  const [showNewCategoryModal, setShowNewCategoryModal] = useState(false);
  const [newCategoryName, setNewCategoryName] = useState('');
  const [isCreatingCategory, setIsCreatingCategory] = useState(false);
  const [newCategoryError, setNewCategoryError] = useState('');
  
  // ✅ NUEVOS ESTADOS: Para modal de borrar categorías
  const [showDeleteCategoryModal, setShowDeleteCategoryModal] = useState(false);
  const [selectedTracksToDelete, setSelectedTracksToDelete] = useState<string[]>([]);
  const [isDeletingTracks, setIsDeletingTracks] = useState(false);
  
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const modalityOptions: ModalityType[] = ['Presencial', 'Virtual', 'Hibrida'];

  // ✅ FUNCIÓN MEJORADA: Generar ID random en lugar de secuencial
  const generateRandomTrackId = (): number => {
    // Generar ID random único combinando timestamp y número aleatorio
    const timestamp = Date.now();
    const random = Math.floor(Math.random() * 10000);
    return parseInt(`${timestamp.toString().slice(-6)}${random}`);
  };

  // Validaciones existentes
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

  const handleStartTimeChange = (time: string) => {
    setFormData(prev => ({ ...prev, hora_inicio: time }));
    
    if (errors.hora_inicio) {
      setErrors(prev => ({ ...prev, hora_inicio: '' }));
    }
    
    if (time && formData.hora_fin && validateTime(time) === null && validateTime(formData.hora_fin) === null) {
      const rangeError = validateTimeRange(time, formData.hora_fin);
      if (rangeError) {
        setErrors(prev => ({ ...prev, hora_fin: rangeError }));
      } else {
        setErrors(prev => ({ ...prev, hora_fin: '' }));
      }
    }
  };

  const handleEndTimeChange = (time: string) => {
    setFormData(prev => ({ ...prev, hora_fin: time }));
    
    if (errors.hora_fin) {
      setErrors(prev => ({ ...prev, hora_fin: '' }));
    }
    
    if (time && formData.hora_inicio && validateTime(formData.hora_inicio) === null && validateTime(time) === null) {
      const rangeError = validateTimeRange(formData.hora_inicio, time);
      if (rangeError) {
        setErrors(prev => ({ ...prev, hora_fin: rangeError }));
      }
    }
  };

  const toggleCategoria = (categoria: string) => {
    setFormData(prev => ({
      ...prev,
      categorias: prev.categorias.includes(categoria)
        ? prev.categorias.filter(c => c !== categoria)
        : [...prev.categorias, categoria]
    }));
    
    if (errors.categorias) {
      setErrors(prev => ({ ...prev, categorias: '' }));
    }
  };

  const validateNewCategoryName = (name: string): string | null => {
    const trimmedName = name.trim();
    
    if (!trimmedName) {
      return 'El nombre de la categoría es requerido';
    }
    
    if (trimmedName.length < 2) {
      return 'El nombre debe tener al menos 2 caracteres';
    }
    
    if (trimmedName.length > 50) {
      return 'El nombre no puede exceder 50 caracteres';
    }
    
    if (allTracks.some(track => track.toLowerCase() === trimmedName.toLowerCase())) {
      return 'Esta categoría ya existe';
    }
    
    const validPattern = /^[a-zA-ZáéíóúñÁÉÍÓÚÑ0-9\s\-&_.]+$/;
    if (!validPattern.test(trimmedName)) {
      return 'El nombre contiene caracteres no válidos';
    }
    
    return null;
  };

  // ✅ FUNCIÓN CORREGIDA: Crear nueva categoría con ID random
  const handleCreateNewCategory = async () => {
    const trimmedName = newCategoryName.trim();
    const validationError = validateNewCategoryName(trimmedName);
    
    if (validationError) {
      setNewCategoryError(validationError);
      return;
    }
    
    setIsCreatingCategory(true);
    setNewCategoryError('');
    
    try {
      const randomId = generateRandomTrackId();
      console.log('🏷️ Creating new category:', trimmedName, 'with random ID:', randomId);
      
      const trackData = {
        id: randomId,
        nombre: trimmedName
      };
      
      const response = await fetch(`${BASE_URL}/data/store`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Cache-Control': 'no-cache',
        },
        body: JSON.stringify({
          table_name: 'tracks',
          data: trackData
        }),
      });
      
      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Failed to create category: ${response.status}`);
      }
      
      const result = await response.json();
      console.log('✅ New category created successfully:', result);
      
      // ✅ ACTUALIZAR TODOS LOS ESTADOS NECESARIOS
      const newTrackData: TrackData = {
        id: randomId,
        nombre: trimmedName,
        entryId: result.entry_id || `temp-${randomId}`
      };
      
      setAllTracks(prev => [...prev, trimmedName]);
      setTrackNameToId(prev => ({ ...prev, [trimmedName]: randomId }));
      setTracksData(prev => [...prev, newTrackData]);
      
      // Seleccionar automáticamente la nueva categoría
      setFormData(prev => ({
        ...prev,
        categorias: [...prev.categorias, trimmedName]
      }));
      
      // Cerrar modal y limpiar
      setShowNewCategoryModal(false);
      setNewCategoryName('');
      
      const successMessage = `Categoría "${trimmedName}" creada exitosamente!`;
      
      if (Platform.OS === 'web') {
        setTimeout(() => alert(successMessage), 100);
      } else {
        Alert.alert('Éxito', successMessage);
      }
      
    } catch (error) {
      console.error('❌ Error creating new category:', error);
      setNewCategoryError(error instanceof Error ? error.message : 'Error al crear la categoría');
    } finally {
      setIsCreatingCategory(false);
    }
  };

  // ✅ NUEVAS FUNCIONES: Para manejo de eliminación de tracks
  const handleOpenDeleteCategoryModal = () => {
    if (allTracks.length === 0) {
      if (Platform.OS === 'web') {
        alert('No hay categorías para eliminar');
      } else {
        Alert.alert('Información', 'No hay categorías para eliminar');
      }
      return;
    }
    
    setShowDeleteCategoryModal(true);
    setSelectedTracksToDelete([]);
  };

  const handleCloseDeleteCategoryModal = () => {
    setShowDeleteCategoryModal(false);
    setSelectedTracksToDelete([]);
  };

  const toggleTrackForDeletion = (trackName: string) => {
    setSelectedTracksToDelete(prev =>
      prev.includes(trackName)
        ? prev.filter(name => name !== trackName)
        : [...prev, trackName]
    );
  };

  const handleDeleteSelectedTracks = async () => {
    if (selectedTracksToDelete.length === 0) {
      Alert.alert('Información', 'Selecciona al menos una categoría para eliminar');
      return;
    }

    const confirmMessage = `¿Estás seguro de que deseas eliminar ${selectedTracksToDelete.length} categoría(s)?\n\nEsto también eliminará todas las relaciones con eventos existentes.`;
    
    const confirmDeletion = () => performTracksDeletion();
    
    if (Platform.OS === 'web') {
      if (window.confirm(confirmMessage)) {
        confirmDeletion();
      }
    } else {
      Alert.alert(
        'Confirmar Eliminación',
        confirmMessage,
        [
          { text: 'Cancelar', style: 'cancel' },
          { text: 'Eliminar', style: 'destructive', onPress: confirmDeletion }
        ]
      );
    }
  };

  const performTracksDeletion = async () => {
    setIsDeletingTracks(true);
    
    try {
      console.log('🗑️ Starting deletion of tracks:', selectedTracksToDelete);
      
      // ✅ OBTENER DATOS ACTUALIZADOS DE TRACKS Y RELACIONES
      const [tracksResponse, relationsResponse] = await Promise.all([
        fetch(`${BASE_URL}/data/tracks/all?format=json&t=${Date.now()}`),
        fetch(`${BASE_URL}/data/event_tracks/all?format=json&t=${Date.now()}`)
      ]);
      
      const tracksData = await tracksResponse.json();
      const relationsData = await relationsResponse.json();
      
      // ✅ ELIMINAR RELACIONES PRIMERO
      if (relationsData?.data) {
        for (const trackName of selectedTracksToDelete) {
          const trackId = trackNameToId[trackName];
          if (trackId) {
            const relationsToDelete = relationsData.data.filter((rel: any) => 
              rel.data && rel.data.track_id === trackId
            );
            
            for (const relation of relationsToDelete) {
              try {
                await fetch(`${BASE_URL}/data/event_tracks/delete/${relation.entry_id}`, {
                  method: 'DELETE'
                });
                console.log(`✅ Deleted relation for track ${trackName}`);
              } catch (error) {
                console.warn(`⚠️ Failed to delete relation for track ${trackName}:`, error);
              }
            }
          }
        }
      }
      
      // ✅ ELIMINAR TRACKS
      if (tracksData?.data) {
        for (const trackName of selectedTracksToDelete) {
          const trackEntry = tracksData.data.find((entry: any) => 
            entry.data && entry.data.nombre === trackName
          );
          
          if (trackEntry) {
            try {
              await fetch(`${BASE_URL}/data/tracks/delete/${trackEntry.entry_id}`, {
                method: 'DELETE'
              });
              console.log(`✅ Deleted track: ${trackName}`);
            } catch (error) {
              console.warn(`⚠️ Failed to delete track ${trackName}:`, error);
            }
          }
        }
      }
      
      // ✅ ACTUALIZAR ESTADOS LOCALES
      setAllTracks(prev => prev.filter(track => !selectedTracksToDelete.includes(track)));
      setTrackNameToId(prev => {
        const updated = { ...prev };
        selectedTracksToDelete.forEach(track => delete updated[track]);
        return updated;
      });
      setTracksData(prev => prev.filter(track => !selectedTracksToDelete.includes(track.nombre)));
      
      // ✅ REMOVER TRACKS ELIMINADOS DEL FORMULARIO
      setFormData(prev => ({
        ...prev,
        categorias: prev.categorias.filter(cat => !selectedTracksToDelete.includes(cat))
      }));
      
      // ✅ CERRAR MODAL
      setShowDeleteCategoryModal(false);
      setSelectedTracksToDelete([]);
      
      const successMessage = `${selectedTracksToDelete.length} categoría(s) eliminada(s) exitosamente`;
      
      if (Platform.OS === 'web') {
        setTimeout(() => alert(successMessage), 100);
      } else {
        Alert.alert('Éxito', successMessage);
      }
      
    } catch (error) {
      console.error('❌ Error deleting tracks:', error);
      
      const errorMessage = 'Error al eliminar categorías. Algunas pueden no haberse eliminado correctamente.';
      
      if (Platform.OS === 'web') {
        alert(errorMessage);
      } else {
        Alert.alert('Error', errorMessage);
      }
    } finally {
      setIsDeletingTracks(false);
    }
  };

  const handleOpenNewCategoryModal = () => {
    setShowNewCategoryModal(true);
    setNewCategoryName('');
    setNewCategoryError('');
  };

  const handleCloseNewCategoryModal = () => {
    setShowNewCategoryModal(false);
    setNewCategoryName('');
    setNewCategoryError('');
  };

  // ✅ FUNCIÓN MEJORADA: Cargar datos con información completa de tracks
  useEffect(() => {
    const loadData = async () => {
      try {
        console.log('🔄 Loading speakers and tracks...');
        
        // Cargar speakers
        const speakersRes = await fetch(`${BASE_URL}/data/speakers/all?format=json&t=${Date.now()}`);
        const speakersData = await speakersRes.json();
        
        if (speakersData?.data) {
          const speakers: SpeakerOption[] = speakersData.data.map((entry: any) => ({
            id: String(entry.data.id),
            name: entry.data.name
          }));
          setSpeakerOptions(speakers);
          console.log('✅ Loaded speakers:', speakers.length);
        }

        // ✅ CARGAR TRACKS CON DATOS COMPLETOS
        const tracksRes = await fetch(`${BASE_URL}/data/tracks/all?format=json&t=${Date.now()}`);
        const tracksData = await tracksRes.json();
        
        if (tracksData?.data) {
          const tracks: string[] = [];
          const nameToId: Record<string, number> = {};
          const completeTracksData: TrackData[] = [];
          
          tracksData.data.forEach((entry: any) => {
            if (entry.data && entry.data.nombre) {
              tracks.push(entry.data.nombre);
              
              if (entry.data.id) {
                nameToId[entry.data.nombre] = entry.data.id;
                completeTracksData.push({
                  id: entry.data.id,
                  nombre: entry.data.nombre,
                  entryId: entry.entry_id
                });
              }
            }
          });
          
          setAllTracks(tracks);
          setTrackNameToId(nameToId);
          setTracksData(completeTracksData);
          
          console.log('✅ Loaded tracks:', tracks.length);
          console.log('🗂️ Complete tracks data:', completeTracksData);
        }
      } catch (error) {
        console.error('❌ Error loading initial data:', error);
      }
    };

    loadData();
  }, []);

  const validateForm = () => {
    const newErrors: Record<string, string> = {};
    
    if (!formData.titulo.trim()) newErrors.titulo = 'El título del evento es requerido';
    if (!formData.descripcion.trim()) newErrors.descripcion = 'La descripción es requerida';
    if (formData.categorias.length === 0) newErrors.categorias = 'Selecciona al menos una categoría';
    if (!formData.modalidad) newErrors.modalidad = 'La modalidad es requerida';
    if (!ponente.trim()) newErrors.ponente = 'El ponente principal es requerido';
    if (!formData.max_participantes.trim()) newErrors.max_participantes = 'El máximo de participantes es requerido';
    if (!formData.imageUrl.trim()) newErrors.imageUrl = 'La imagen es requerida';
    
    if (formData.modalidad === 'Virtual' && !formData.plataforma.trim()) {
      newErrors.plataforma = 'La plataforma es requerida para eventos virtuales';
    }
    if ((formData.modalidad === 'Presencial' || formData.modalidad === 'Hibrida') && !formData.lugar.trim()) {
      newErrors.lugar = 'La ubicación es requerida para eventos presenciales';
    }
    
    const dateError = validateDate(formData.fecha);
    if (dateError) newErrors.fecha = dateError;
    
    const startTimeError = validateTime(formData.hora_inicio);
    if (startTimeError) newErrors.hora_inicio = startTimeError;
    
    const endTimeError = validateTime(formData.hora_fin);
    if (endTimeError) newErrors.hora_fin = endTimeError;
    
    if (!startTimeError && !endTimeError) {
      const timeRangeError = validateTimeRange(formData.hora_inicio, formData.hora_fin);
      if (timeRangeError) newErrors.hora_fin = timeRangeError;
    }
    
    const maxParticipants = parseInt(formData.max_participantes);
    if (isNaN(maxParticipants) || maxParticipants <= 0) {
      newErrors.max_participantes = 'El máximo de participantes debe ser un número positivo';
    } else if (maxParticipants > 10000) {
      newErrors.max_participantes = 'El máximo de participantes no puede exceder 10,000';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async () => {
    console.log('🚀 Submit button pressed');
    
    const isValid = validateForm();
    if (!isValid) {
      console.log('❌ Form validation failed');
      return;
    }
    
    setIsSubmitting(true);
    
    try {
      const timestamp = Date.now();
      const randomId = Math.floor(Math.random() * 1000);
      const eventId = parseInt(`${timestamp.toString().slice(-8)}${randomId}`);
      
      const eventData = {
        id: eventId,
        titulo: formData.titulo.trim(),
        descripcion: formData.descripcion.trim(),
        tema: formData.categorias[0],
        ponente: ponente.trim(),
        invitados_especiales: invitadosEspeciales.filter(g => g.trim()),
        modalidad: formData.modalidad,
        lugar: formData.modalidad === 'Virtual' ? null : formData.lugar.trim(),
        plataforma: formData.modalidad === 'Virtual' ? formData.plataforma.trim() : null,
        fecha: formData.fecha,
        hora_inicio: formData.hora_inicio,
        hora_fin: formData.hora_fin,
        max_participantes: parseInt(formData.max_participantes),
        suscritos: 0,
        imageUrl: formData.imageUrl
      };

      const eventResponse = await fetch(`${BASE_URL}/data/store`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Cache-Control': 'no-cache',
        },
        body: JSON.stringify({
          table_name: 'events',
          data: eventData
        }),
      });

      if (!eventResponse.ok) {
        throw new Error(`Failed to create event: ${eventResponse.status}`);
      }

      const eventResult = await eventResponse.json();
      const finalEventId = eventResult.id || eventId;

      // Crear relaciones para todas las categorías
      if (formData.categorias.length > 0) {
        for (const categoria of formData.categorias) {
          const trackId = trackNameToId[categoria];
          if (trackId) {
            try {
              await fetch(`${BASE_URL}/data/store`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                  table_name: 'event_tracks',
                  data: { event_id: finalEventId, track_id: trackId }
                }),
              });
            } catch (trackError) {
              console.warn('⚠️ Error creating track relationship:', trackError);
            }
          }
        }
      }

      const successMessage = `Evento "${formData.titulo}" creado exitosamente!`;
      
      if (Platform.OS === 'web') {
        window.alert(successMessage);
      } else {
        Alert.alert('Éxito', successMessage);
      }
      
      router.replace('/(tabs)/events');
      
    } catch (error) {
      console.error('❌ Error creating event:', error);
      const errorMessage = error instanceof Error ? error.message : 'Error al crear el evento';
      setErrors({ submit: errorMessage });
      
      if (Platform.OS === 'web') {
        window.alert(errorMessage);
      } else {
        Alert.alert('Error', errorMessage);
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const toggleGuest = (name: string) => {
    if (!name.trim()) return;
    setInvitadosEspeciales(prev =>
      prev.includes(name) ? prev.filter(g => g !== name) : [...prev, name]
    );
    if (ponente === name) {
      setPonente('');
    }
  };

  const handleSpeakerSelect = (name: string) => {
    setPonente(name);
    if (invitadosEspeciales.includes(name)) {
      toggleGuest(name);
    }
  };

  return (
    <ScrollView
      style={[
        styles.container,
        { backgroundColor: isDark ? '#000000' : '#F2F2F7' }
      ]}
      contentContainerStyle={styles.contentContainer}
    >
      <View style={[
        styles.formContainer,
        { backgroundColor: isDark ? '#1C1C1E' : '#FFFFFF' }
      ]}>
        {/* Image Upload */}
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
              <X size={20} color="#FFFFFF" />
            </Pressable>
          </View>
        ) : (
          <Pressable
            style={[
              styles.imageUploadButton,
              { backgroundColor: isDark ? '#2C2C2E' : '#F2F2F7' }
            ]}
            onPress={() => {
              setFormData(prev => ({
                ...prev,
                imageUrl: 'https://images.pexels.com/photos/2774556/pexels-photo-2774556.jpeg',
              }));
            }}
          >
            <ImagePlus size={32} color={isDark ? '#FFFFFF' : '#000000'} />
            <Text style={[
              styles.imageUploadText,
              { color: isDark ? '#FFFFFF' : '#000000' }
            ]}>
              Agregar Imagen del Evento
            </Text>
          </Pressable>
        )}
        
        {/* Event Title */}
        <TextField
          label="Título del Evento *"
          value={formData.titulo}
          placeholder="Ingresa el título del evento"
          onChange={(text) => setFormData(prev => ({ ...prev, titulo: text }))}
          error={errors.titulo}
        />
        
        {/* Description */}
        <TextAreaField
          label="Descripción *"
          value={formData.descripcion}
          placeholder="Ingresa la descripción del evento"
          onChange={(text) => setFormData(prev => ({ ...prev, descripcion: text }))}
          error={errors.descripcion}
        />
        
        {/* ✅ SECCIÓN MEJORADA: Categorías con botones Nueva y Borrar */}
        <View style={styles.inputContainer}>
          <View style={styles.categoryHeaderContainer}>
            <Text style={[
              styles.label,
              { color: isDark ? '#FFFFFF' : '#000000' }
            ]}>
              Categorías * (selecciona al menos una)
            </Text>
            
            {/* ✅ BOTONES NUEVA Y BORRAR */}
            <View style={styles.categoryButtonsContainer}>
              <Pressable
                style={[
                  styles.categoryActionButton,
                  { backgroundColor: '#0A84FF' }
                ]}
                onPress={handleOpenNewCategoryModal}
              >
                <Plus size={14} color="#FFFFFF" />
                <Text style={styles.categoryActionButtonText}>Nueva</Text>
              </Pressable>
              
              <Pressable
                style={[
                  styles.categoryActionButton,
                  { backgroundColor: '#FF453A' }
                ]}
                onPress={handleOpenDeleteCategoryModal}
              >
                <Trash2 size={14} color="#FFFFFF" />
                <Text style={styles.categoryActionButtonText}>Borrar</Text>
              </Pressable>
            </View>
          </View>
          
          {allTracks.length === 0 ? (
            <View style={[
              styles.categoryContainer,
              { justifyContent: 'center', alignItems: 'center', padding: 20 }
            ]}>
              <ActivityIndicator size="small" color={isDark ? '#FFFFFF' : '#000000'} />
              <Text style={[
                { color: isDark ? '#FFFFFF' : '#000000', marginTop: 8 }
              ]}>
                Cargando categorías...
              </Text>
            </View>
          ) : (
            <View style={styles.categoryContainer}>
              {allTracks.map(track => {
                const isSelected = formData.categorias.includes(track);
                return (
                  <Pressable
                    key={track}
                    style={[
                      styles.categoryChip,
                      { 
                        backgroundColor: isSelected
                          ? '#0A84FF' 
                          : isDark ? '#2C2C2E' : '#F2F2F7',
                        borderWidth: isSelected ? 2 : 1,
                        borderColor: isSelected ? '#0A84FF' : 'transparent'
                      }
                    ]}
                    onPress={() => toggleCategoria(track)}
                  >
                    <Text style={[
                      styles.categoryChipText,
                      { 
                        color: isSelected
                          ? '#FFFFFF' 
                          : isDark ? '#FFFFFF' : '#000000'
                      }
                    ]}>
                      {track}
                    </Text>
                  </Pressable>
                );
              })}
            </View>
          )}
          
          {formData.categorias.length > 0 && (
            <View style={styles.selectedCategoriesContainer}>
              <Text style={[
                styles.selectedCategoriesLabel,
                { color: isDark ? '#8E8E93' : '#666666' }
              ]}>
                Seleccionadas ({formData.categorias.length}):
              </Text>
              <Text style={[
                styles.selectedCategoriesText,
                { color: isDark ? '#0A84FF' : '#0A84FF' }
              ]}>
                {formData.categorias.join(', ')}
              </Text>
            </View>
          )}
          
          {errors.categorias && <Text style={styles.errorText}>{errors.categorias}</Text>}
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
          <Text style={[
            styles.label,
            { color: isDark ? '#FFFFFF' : '#000000' }
          ]}>
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

        {/* Platform and Location */}
        {formData.modalidad === 'Virtual' && (
          <PlatformField
            value={formData.plataforma}
            onChange={(text) => setFormData(prev => ({ ...prev, plataforma: text }))}
            error={errors.plataforma}
          />
        )}

        {(formData.modalidad === 'Presencial' || formData.modalidad === 'Hibrida') && (
          <LocationField
            value={formData.lugar}
            onChange={(text) => setFormData(prev => ({ ...prev, lugar: text }))}
            error={errors.lugar}
          />
        )}
        
        {/* Date and Time */}
        <DatePickerField
          label="Fecha del Evento *"
          value={formData.fecha}
          onChange={(date) => setFormData(prev => ({ ...prev, fecha: date }))}
          error={errors.fecha}
          minimumDate={new Date()}
        />

        <View style={styles.timeFieldsContainer}>
          <View style={{ flex: 1, marginRight: 8 }}>
            <TimePickerField
              label="Hora de Inicio *"
              value={formData.hora_inicio}
              onChange={handleStartTimeChange}
              error={errors.hora_inicio}
            />
          </View>
          
          <View style={{ flex: 1, marginLeft: 8 }}>
            <TimePickerField
              label="Hora de Fin *"
              value={formData.hora_fin}
              onChange={handleEndTimeChange}
              error={errors.hora_fin}
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
        
        {errors.submit && (
          <Text style={[styles.errorText, styles.submitError]}>
            {errors.submit}
          </Text>
        )}
        
        {/* Submit Button */}
        <Pressable
          style={[
            styles.submitButton,
            { 
              backgroundColor: isSubmitting ? '#999999' : '#0A84FF',
              opacity: isSubmitting ? 0.6 : 1
            }
          ]}
          onPress={handleSubmit}
          disabled={isSubmitting}
        >
          {isSubmitting ? (
            <View style={styles.submitButtonContent}>
              <ActivityIndicator size="small" color="#FFFFFF" />
              <Text style={[styles.submitButtonText, { marginLeft: 8 }]}>
                Creando Evento...
              </Text>
            </View>
          ) : (
            <Text style={styles.submitButtonText}>
              Crear Evento
            </Text>
          )}
        </Pressable>
      </View>

      {/* Modal para nueva categoría */}
      <Modal
        visible={showNewCategoryModal}
        transparent={true}
        animationType="fade"
        onRequestClose={handleCloseNewCategoryModal}
      >
        <View style={styles.modalOverlay}>
          <View style={[
            styles.modalContainer,
            { backgroundColor: isDark ? '#2C2C2E' : '#FFFFFF' }
          ]}>
            <View style={styles.modalHeader}>
              <Text style={[
                styles.modalTitle,
                { color: isDark ? '#FFFFFF' : '#000000' }
              ]}>
                Nueva Categoría
              </Text>
              <Pressable
                style={styles.modalCloseButton}
                onPress={handleCloseNewCategoryModal}
              >
                <X size={24} color={isDark ? '#FFFFFF' : '#000000'} />
              </Pressable>
            </View>
            
            <View style={styles.modalContent}>
              <Text style={[
                styles.modalInputLabel,
                { color: isDark ? '#FFFFFF' : '#000000' }
              ]}>
                Nombre de la categoría *
              </Text>
              
              <TextInput
                style={[
                  styles.modalInput,
                  { 
                    backgroundColor: isDark ? '#1C1C1E' : '#F2F2F7',
                    color: isDark ? '#FFFFFF' : '#000000',
                    borderColor: newCategoryError ? '#FF453A' : (isDark ? '#3C3C43' : '#C7C7CC')
                  }
                ]}
                placeholder="Ej: Inteligencia Artificial, Marketing Digital..."
                placeholderTextColor={isDark ? '#8E8E93' : '#3C3C43'}
                value={newCategoryName}
                onChangeText={(text) => {
                  setNewCategoryName(text);
                  if (newCategoryError) {
                    setNewCategoryError('');
                  }
                }}
                autoFocus
                maxLength={50}
                onSubmitEditing={handleCreateNewCategory}
              />
              
              {newCategoryError ? (
                <Text style={styles.modalErrorText}>
                  {newCategoryError}
                </Text>
              ) : null}
              
              <Text style={[
                styles.modalHelpText,
                { color: isDark ? '#8E8E93' : '#666666' }
              ]}>
                La nueva categoría se creará con un ID único y estará disponible inmediatamente.
              </Text>
            </View>
            
            <View style={styles.modalActions}>
              <Pressable
                style={[
                  styles.modalActionButton,
                  styles.modalCancelButton,
                  { backgroundColor: isDark ? '#1C1C1E' : '#F2F2F7' }
                ]}
                onPress={handleCloseNewCategoryModal}
              >
                <Text style={[
                  styles.modalActionButtonText,
                  { color: isDark ? '#FFFFFF' : '#000000' }
                ]}>
                  Cancelar
                </Text>
              </Pressable>
              
              <Pressable
                style={[
                  styles.modalActionButton,
                  styles.modalCreateButton,
                  { 
                    backgroundColor: isCreatingCategory ? '#999999' : '#0A84FF',
                    opacity: isCreatingCategory || !newCategoryName.trim() ? 0.6 : 1
                  }
                ]}
                onPress={handleCreateNewCategory}
                disabled={isCreatingCategory || !newCategoryName.trim()}
              >
                {isCreatingCategory ? (
                  <View style={styles.modalButtonContent}>
                    <ActivityIndicator size="small" color="#FFFFFF" />
                    <Text style={[styles.modalActionButtonText, { marginLeft: 8 }]}>
                      Creando...
                    </Text>
                  </View>
                ) : (
                  <View style={styles.modalButtonContent}>
                    <Check size={16} color="#FFFFFF" />
                    <Text style={[styles.modalActionButtonText, { marginLeft: 4 }]}>
                      Crear
                    </Text>
                  </View>
                )}
              </Pressable>
            </View>
          </View>
        </View>
      </Modal>

      {/* ✅ NUEVO MODAL: Para borrar categorías */}
      <Modal
        visible={showDeleteCategoryModal}
        transparent={true}
        animationType="fade"
        onRequestClose={handleCloseDeleteCategoryModal}
      >
        <View style={styles.modalOverlay}>
          <View style={[
            styles.modalContainer,
            { backgroundColor: isDark ? '#2C2C2E' : '#FFFFFF' }
          ]}>
            <View style={styles.modalHeader}>
              <Text style={[
                styles.modalTitle,
                { color: isDark ? '#FFFFFF' : '#000000' }
              ]}>
                Eliminar Categorías
              </Text>
              <Pressable
                style={styles.modalCloseButton}
                onPress={handleCloseDeleteCategoryModal}
              >
                <X size={24} color={isDark ? '#FFFFFF' : '#000000'} />
              </Pressable>
            </View>
            
            <View style={styles.modalContent}>
              <Text style={[
                styles.modalInputLabel,
                { color: isDark ? '#FFFFFF' : '#000000' }
              ]}>
                Selecciona las categorías a eliminar:
              </Text>
              
              <ScrollView style={styles.deleteTracksList} nestedScrollEnabled>
                {allTracks.map(track => (
                  <Pressable
                    key={track}
                    style={[
                      styles.deleteTrackItem,
                      { 
                        backgroundColor: selectedTracksToDelete.includes(track)
                          ? 'rgba(255, 69, 58, 0.1)'
                          : isDark ? '#1C1C1E' : '#F2F2F7',
                        borderColor: selectedTracksToDelete.includes(track)
                          ? '#FF453A'
                          : 'transparent'
                      }
                    ]}
                    onPress={() => toggleTrackForDeletion(track)}
                  >
                    <Text style={[
                      styles.deleteTrackItemText,
                      { 
                        color: selectedTracksToDelete.includes(track)
                          ? '#FF453A'
                          : isDark ? '#FFFFFF' : '#000000'
                      }
                    ]}>
                      {track}
                    </Text>
                    {selectedTracksToDelete.includes(track) && (
                      <Check size={16} color="#FF453A" />
                    )}
                  </Pressable>
                ))}
              </ScrollView>
              
              {selectedTracksToDelete.length > 0 && (
                <Text style={[
                  styles.modalHelpText,
                  { color: '#FF453A', fontWeight: '600' }
                ]}>
                  ⚠️ Se eliminarán {selectedTracksToDelete.length} categoría(s) y todas sus relaciones con eventos.
                </Text>
              )}
            </View>
            
            <View style={styles.modalActions}>
              <Pressable
                style={[
                  styles.modalActionButton,
                  styles.modalCancelButton,
                  { backgroundColor: isDark ? '#1C1C1E' : '#F2F2F7' }
                ]}
                onPress={handleCloseDeleteCategoryModal}
              >
                <Text style={[
                  styles.modalActionButtonText,
                  { color: isDark ? '#FFFFFF' : '#000000' }
                ]}>
                  Cancelar
                </Text>
              </Pressable>
              
              <Pressable
                style={[
                  styles.modalActionButton,
                  { 
                    backgroundColor: isDeletingTracks ? '#999999' : '#FF453A',
                    opacity: isDeletingTracks || selectedTracksToDelete.length === 0 ? 0.6 : 1
                  }
                ]}
                onPress={handleDeleteSelectedTracks}
                disabled={isDeletingTracks || selectedTracksToDelete.length === 0}
              >
                {isDeletingTracks ? (
                  <View style={styles.modalButtonContent}>
                    <ActivityIndicator size="small" color="#FFFFFF" />
                    <Text style={[styles.modalActionButtonText, { marginLeft: 8 }]}>
                      Eliminando...
                    </Text>
                  </View>
                ) : (
                  <View style={styles.modalButtonContent}>
                    <Trash2 size={16} color="#FFFFFF" />
                    <Text style={[styles.modalActionButtonText, { marginLeft: 4 }]}>
                      Eliminar ({selectedTracksToDelete.length})
                    </Text>
                  </View>
                )}
              </Pressable>
            </View>
          </View>
        </View>
      </Modal>
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
  categoryHeaderContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  
  // ✅ NUEVOS ESTILOS: Para contenedor de botones
  categoryButtonsContainer: {
    flexDirection: 'row',
    gap: 8,
  },
  categoryActionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 14,
    gap: 4,
  },
  categoryActionButtonText: {
    color: '#FFFFFF',
    fontSize: 11,
    fontWeight: '600',
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
  selectedCategoriesContainer: {
    marginTop: 12,
    padding: 12,
    backgroundColor: 'rgba(10, 132, 255, 0.1)',
    borderRadius: 8,
    borderLeftWidth: 4,
    borderLeftColor: '#0A84FF',
  },
  selectedCategoriesLabel: {
    fontSize: 12,
    fontWeight: '600',
    marginBottom: 4,
  },
  selectedCategoriesText: {
    fontSize: 14,
    fontWeight: '500',
    lineHeight: 20,
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
  submitButtonContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  timeFieldsContainer: {
    flexDirection: 'row',
    marginBottom: 16,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  modalContainer: {
    width: '100%',
    maxWidth: 400,
    borderRadius: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(0, 0, 0, 0.1)',
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: '600',
  },
  modalCloseButton: {
    padding: 4,
  },
  modalContent: {
    padding: 20,
  },
  modalInputLabel: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 8,
  },
  modalInput: {
    height: 44,
    borderRadius: 8,
    paddingHorizontal: 12,
    fontSize: 16,
    borderWidth: 1,
    marginBottom: 8,
    ...Platform.select({
      web: {
        outlineStyle: 'none',
      },
    }),
  },
  modalErrorText: {
    color: '#FF453A',
    fontSize: 14,
    marginBottom: 8,
  },
  modalHelpText: {
    fontSize: 14,
    lineHeight: 20,
    fontStyle: 'italic',
  },
  
  // ✅ NUEVOS ESTILOS: Para lista de tracks a eliminar
  deleteTracksList: {
    maxHeight: 200,
    marginVertical: 12,
  },
  deleteTrackItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 12,
    borderRadius: 8,
    marginBottom: 8,
    borderWidth: 2,
  },
  deleteTrackItemText: {
    fontSize: 14,
    fontWeight: '500',
  },
  
  modalActions: {
    flexDirection: 'row',
    padding: 20,
    gap: 12,
    borderTopWidth: 1,
    borderTopColor: 'rgba(0, 0, 0, 0.1)',
  },
  modalActionButton: {
    flex: 1,
    height: 44,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  modalCancelButton: {
    borderWidth: 1,
    borderColor: 'rgba(0, 0, 0, 0.2)',
  },
  modalCreateButton: {},
  modalActionButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  modalButtonContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
});