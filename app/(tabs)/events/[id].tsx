import React, { useState, useCallback } from 'react';
import {
  View,
  Text,
  ScrollView,
  Pressable,
  useColorScheme,
  ActivityIndicator,
  Image,
  Alert,
  Platform,
  RefreshControl,
  Share,
  StyleSheet
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { router, useLocalSearchParams } from 'expo-router';
import { useFocusEffect } from '@react-navigation/native';
import { 
  ArrowLeft, 
  Calendar, 
  Clock, 
  MapPin, 
  Star, 
  Users, 
  Edit3,
  Share2,
  Heart,
  HeartOff
} from 'lucide-react-native';
import { useEvent } from '@/hooks/useEvent';
import { CategoryBadge } from '@/components/events/CategoryBadge';
import { CapacityIndicator } from '@/components/events/CapacityIndicator';
import { SpeakerRow } from '@/components/speakers/SpeakerRow';
import { FeedbackCard } from '@/components/feedback/FeedbackCard';

<<<<<<< HEAD
export default function EventDetailScreen() {
=======
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
import { CapacityField } from '@/components/events/edit/CapacityField';

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
>>>>>>> 0c73e8a477213ba890933d95a722d86538cf231e
  const { id } = useLocalSearchParams<{ id: string }>();
  const insets = useSafeAreaInsets();
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';
  
<<<<<<< HEAD
  const { event, speakers, feedback, isLoading, reload } = useEvent(id);
  const [refreshing, setRefreshing] = useState(false);
  const [isRegistered, setIsRegistered] = useState(false);
  
  // ✅ RECARGAR DATOS CUANDO LA PANTALLA RECIBE FOCUS
  useFocusEffect(
    useCallback(() => {
      console.log('🎯 Event detail screen focused, refreshing data...');
      reload();
    }, [reload])
  );
  
  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await reload();
    setRefreshing(false);
  }, [reload]);
  
  const handleShare = async () => {
=======
  const [speakerOptions, setSpeakerOptions] = useState<SpeakerOption[]>([]);
  const [mainSpeakerName, setMainSpeakerName] = useState<string>('');
  const [guestNames, setGuestNames] = useState<string[]>([]);

  // Estado para la capacidad en tiempo real
  const [currentSubscribers, setCurrentSubscribers] = useState<number>(0);
  const [isLoadingCapacity, setIsLoadingCapacity] = useState(false);

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

  // ✅ FUNCIÓN PARA CARGAR SUSCRIPTORES EN TIEMPO REAL
  const loadCurrentSubscribers = async () => {
    if (!id) return;
    
    setIsLoadingCapacity(true);
    try {
      const response = await fetch(`${BASE_URL}/data/events/all?format=json`);
      const { data } = (await response.json()) as { data: RawRow<RawEvent>[] };
      const eventData = data.find(r => String(r.data.id) === id);
      
      if (eventData) {
        setCurrentSubscribers(eventData.data.suscritos || 0);
        console.log('✅ Suscriptores actualizados:', eventData.data.suscritos);
      }
    } catch (error) {
      console.error('❌ Error cargando suscriptores:', error);
    } finally {
      setIsLoadingCapacity(false);
    }
  };

  // ✅ EFECTO PARA CARGAR SUSCRIPTORES PERIÓDICAMENTE
  useEffect(() => {
    if (!id) return;

    // Cargar inmediatamente
    loadCurrentSubscribers();

    // Actualizar cada 30 segundos
    const interval = setInterval(loadCurrentSubscribers, 30000);

    return () => clearInterval(interval);
  }, [id]);

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
          
          // ✅ CARGAR DATOS DE MODALIDAD Y SUSCRIPTORES
          setFormData(prev => ({
            ...prev,
            modalidad: rawEv.modalidad || 'Presencial',
            plataforma: rawEv.plataforma || '',
            max_participantes: String(rawEv.max_participantes || ''),
          }));
          
          // Establecer suscriptores actuales
          setCurrentSubscribers(rawEv.suscritos || 0);
        }
      } catch (err) {
        console.error('❌ Error cargando datos:', err);
      }
    };

    loadData();
  }, [id]);

  // Precargar datos del formulario cuando llega el evento
  useEffect(() => {
>>>>>>> 0c73e8a477213ba890933d95a722d86538cf231e
    if (!event) return;
    
    const shareContent = {
      title: event.name,
      message: `Check out this event: ${event.name}\n${event.description}`,
      url: Platform.OS === 'web' ? window.location.href : undefined,
    };
    
    try {
      if (Platform.OS === 'web') {
        if (navigator.share) {
          await navigator.share(shareContent);
        } else {
          await navigator.clipboard?.writeText(`${shareContent.message}\n${shareContent.url}`);
        }
      } else {
        await Share.share(shareContent);
      }
    } catch (error) {
      console.error('Error sharing:', error);
    }
  };
  
  const handleRegister = async () => {
    if (!event) return;
    
    try {
<<<<<<< HEAD
      console.log('🎫 Registration action:', isRegistered ? 'Cancel' : 'Register');
      setIsRegistered(!isRegistered);
=======
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
          // Mantener el número actual de suscritos
          suscritos: currentSubscribers,
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
>>>>>>> 0c73e8a477213ba890933d95a722d86538cf231e
      
      // Recargar datos para mostrar cambios
      setTimeout(() => {
        reload();
      }, 1000);
      
    } catch (error) {
      console.error('Registration error:', error);
    }
  };
  
  if (isLoading && !event) {
    return (
      <View style={[
        styles.loadingContainer,
        { backgroundColor: isDark ? '#000000' : '#F2F2F7' }
      ]}>
        <ActivityIndicator size="large" color="#0A84FF" />
        <Text style={[
          styles.loadingText,
          { color: isDark ? '#FFFFFF' : '#000000' }
        ]}>
          Loading event details...
        </Text>
      </View>
    );
  }
  
  if (!event) {
    return (
      <View style={[
        styles.errorContainer,
        { backgroundColor: isDark ? '#000000' : '#F2F2F7' }
      ]}>
        <Text style={[
          styles.errorText,
          { color: isDark ? '#FFFFFF' : '#000000' }
        ]}>
          Event not found
        </Text>
        <Pressable 
          style={styles.backButton}
          onPress={() => router.back()}
        >
          <Text style={styles.backButtonText}>Go Back</Text>
        </Pressable>
      </View>
    );
  }
  
  return (
    <View style={[
      styles.container,
      { backgroundColor: isDark ? '#000000' : '#F2F2F7' }
    ]}>
      {/* ✅ HEADER CON NAVEGACIÓN */}
      <View style={[
        styles.header,
        { paddingTop: insets.top + 8 }
      ]}>
        <Pressable style={styles.headerButton} onPress={() => router.back()}>
          <ArrowLeft size={24} color={isDark ? '#FFFFFF' : '#000000'} />
        </Pressable>
        
        <View style={styles.headerActions}>
          <Pressable style={styles.headerButton} onPress={handleShare}>
            <Share2 size={20} color="#007AFF" />
          </Pressable>
          
          <Pressable 
            style={[styles.headerButton, { marginLeft: 8 }]}
            onPress={() => router.push(`/events/edit/${id}`)}
          >
            <Edit3 size={20} color="#007AFF" />
          </Pressable>
        </View>
      </View>
      
      <ScrollView
        style={styles.content}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor={isDark ? '#FFFFFF' : '#000000'}
          />
        }
        showsVerticalScrollIndicator={false}
      >
        {/* ✅ IMAGEN DEL EVENTO */}
        <View style={styles.imageContainer}>
          <Image
            source={{ uri: event.imageUrl }}
            style={styles.eventImage}
            resizeMode="cover"
          />
          
          {/* ✅ OVERLAY CON CATEGORÍA */}
          <View style={styles.imageOverlay}>
            <CategoryBadge category={event.category} />
          </View>
        </View>
        
        {/* ✅ INFORMACIÓN PRINCIPAL */}
        <View style={[
          styles.mainInfoCard,
          { backgroundColor: isDark ? '#1C1C1E' : '#FFFFFF' }
        ]}>
          <Text style={[
            styles.eventTitle,
            { color: isDark ? '#FFFFFF' : '#000000' }
          ]}>
            {event.name}
          </Text>
          
          <Text style={[
            styles.eventDescription,
            { color: isDark ? '#EBEBF5' : '#3C3C43' }
          ]}>
            {event.description}
          </Text>
          
          {/* ✅ METADATOS DEL EVENTO */}
          <View style={styles.metadataContainer}>
            <View style={styles.metadataItem}>
              <Calendar size={18} color={isDark ? '#8E8E93' : '#6C6C70'} />
              <Text style={[
                styles.metadataText,
                { color: isDark ? '#EBEBF5' : '#3C3C43' }
              ]}>
                {event.date}
              </Text>
            </View>
            
            <View style={styles.metadataItem}>
              <Clock size={18} color={isDark ? '#8E8E93' : '#6C6C70'} />
              <Text style={[
                styles.metadataText,
                { color: isDark ? '#EBEBF5' : '#3C3C43' }
              ]}>
                {event.time}
              </Text>
            </View>
            
            <View style={styles.metadataItem}>
              <MapPin size={18} color={isDark ? '#8E8E93' : '#6C6C70'} />
              <Text style={[
                styles.metadataText,
                { color: isDark ? '#EBEBF5' : '#3C3C43' }
              ]}>
                {event.location}
              </Text>
            </View>
          </View>
          
          {/* ✅ RATING */}
          {event.ratingCount > 0 && (
            <View style={styles.ratingContainer}>
              <Star size={18} color="#FFD60A" fill="#FFD60A" />
              <Text style={[
                styles.ratingText,
                { color: isDark ? '#FFFFFF' : '#000000' }
              ]}>
                {event.rating.toFixed(1)} ({event.ratingCount} reviews)
              </Text>
            </View>
          )}
        </View>
        
        {/* ✅ INDICADOR DE CAPACIDAD EN TIEMPO REAL */}
        <View style={styles.capacitySection}>
          <Text style={[
            styles.sectionTitle,
            { color: isDark ? '#FFFFFF' : '#000000' }
          ]}>
            Event Capacity
          </Text>
          
          <CapacityIndicator
            currentCapacity={event.currentCapacity || 0}
            maxCapacity={event.maxCapacity || 0}
            size="large"
          />
          
          {/* ✅ INFORMACIÓN ADICIONAL DE CAPACIDAD */}
          <View style={[
            styles.capacityDetails,
            { backgroundColor: isDark ? '#1C1C1E' : '#FFFFFF' }
          ]}>
            <View style={styles.capacityDetailItem}>
              <Users size={20} color="#007AFF" />
              <View style={styles.capacityDetailText}>
                <Text style={[
                  styles.capacityDetailValue,
                  { color: isDark ? '#FFFFFF' : '#000000' }
                ]}>
                  {event.currentCapacity || 0}
                </Text>
                <Text style={[
                  styles.capacityDetailLabel,
                  { color: isDark ? '#8E8E93' : '#6C6C70' }
                ]}>
                  Registered
                </Text>
              </View>
            </View>
            
            <View style={styles.capacityDetailItem}>
              <Users size={20} color="#8E8E93" />
              <View style={styles.capacityDetailText}>
                <Text style={[
                  styles.capacityDetailValue,
                  { color: isDark ? '#FFFFFF' : '#000000' }
                ]}>
                  {Math.max(0, (event.maxCapacity || 0) - (event.currentCapacity || 0))}
                </Text>
                <Text style={[
                  styles.capacityDetailLabel,
                  { color: isDark ? '#8E8E93' : '#6C6C70' }
                ]}>
                  Available
                </Text>
              </View>
            </View>
          </View>
        </View>
        
        {/* ✅ SPEAKERS */}
        {speakers.length > 0 && (
          <View style={[
            styles.section,
            { backgroundColor: isDark ? '#1C1C1E' : '#FFFFFF' }
          ]}>
            <Text style={[
              styles.sectionTitle,
              { color: isDark ? '#FFFFFF' : '#000000' }
            ]}>
              Speakers ({speakers.length})
            </Text>
            
            {speakers.map((speaker, index) => (
              <SpeakerRow
                key={`speaker-${speaker.id}-${index}`}
                speaker={speaker}
                onPress={() => router.push(`/speakers/${speaker.id}`)}
              />
            ))}
          </View>
        )}
        
        {/* ✅ FEEDBACK RECIENTE */}
        {feedback.length > 0 && (
          <View style={[
            styles.section,
            { backgroundColor: isDark ? '#1C1C1E' : '#FFFFFF' }
          ]}>
            <Text style={[
              styles.sectionTitle,
              { color: isDark ? '#FFFFFF' : '#000000' }
            ]}>
              Recent Feedback ({feedback.length})
            </Text>
            
            {feedback.slice(0, 3).map((fb, index) => (
              <FeedbackCard
                key={`feedback-${fb.id}-${index}`}
                feedback={fb}
                isDark={isDark}
              />
            ))}
            
            {feedback.length > 3 && (
              <Pressable 
                style={styles.viewAllButton}
                onPress={() => router.push(`/feedback?eventId=${id}`)}
              >
                <Text style={styles.viewAllText}>
                  View all {feedback.length} reviews
                </Text>
              </Pressable>
            )}
          </View>
        )}
<<<<<<< HEAD
        
        {/* ✅ BOTÓN DE REGISTRO */}
        <View style={styles.registerSection}>
          <Pressable
            style={[
              styles.registerButton,
              {
                backgroundColor: (event.currentCapacity || 0) >= (event.maxCapacity || 0)
                  ? '#8E8E93'
                  : isRegistered
                  ? '#FF453A'
                  : '#007AFF',
                opacity: (event.currentCapacity || 0) >= (event.maxCapacity || 0) ? 0.6 : 1
              }
            ]}
            onPress={handleRegister}
            disabled={(event.currentCapacity || 0) >= (event.maxCapacity || 0) && !isRegistered}
          >
            <View style={styles.registerButtonContent}>
              {isRegistered ? (
                <HeartOff size={20} color="#FFFFFF" />
              ) : (
                <Heart size={20} color="#FFFFFF" />
              )}
              
              <Text style={styles.registerButtonText}>
                {(event.currentCapacity || 0) >= (event.maxCapacity || 0) && !isRegistered
                  ? 'Event Full'
                  : isRegistered
                  ? 'Cancel Registration'
                  : 'Register for Event'}
              </Text>
            </View>
          </Pressable>
          
          <Text style={[
            styles.registerNote,
            { color: isDark ? '#8E8E93' : '#6C6C70' }
          ]}>
            Last updated: {new Date().toLocaleTimeString()}
          </Text>
        </View>
      </ScrollView>
    </View>
=======

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
              onChange={handleStartTimeChange}
              error={errors.startTime}
            />
          </View>
          <View style={{ flex: 1 }}>
            <TimePickerField
              label="Hora de Fin *"
              value={formData.endTime}
              onChange={handleEndTimeChange}
              error={errors.endTime}
            />
          </View>
        </View>

        {/* ✅ CAMPO DE CAPACIDAD CON INFORMACIÓN EN TIEMPO REAL */}
        <CapacityField
          currentSubscribers={currentSubscribers}
          maxParticipants={formData.max_participantes}
          onMaxParticipantsChange={text => setFormData(p => ({ ...p, max_participantes: text }))}
          onRefresh={loadCurrentSubscribers}
          isLoading={isLoadingCapacity}
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
>>>>>>> 0c73e8a477213ba890933d95a722d86538cf231e
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  errorText: {
    fontSize: 16,
    textAlign: 'center',
    marginBottom: 16,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingBottom: 8,
  },
  headerButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    ...Platform.select({
      web: {
        cursor: 'pointer',
      },
    }),
  },
  headerActions: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  content: {
    flex: 1,
  },
  imageContainer: {
    height: 240,
    position: 'relative',
  },
  eventImage: {
    width: '100%',
    height: '100%',
  },
  imageOverlay: {
    position: 'absolute',
    top: 16,
    right: 16,
  },
  mainInfoCard: {
    margin: 16,
    padding: 20,
    borderRadius: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  eventTitle: {
    fontSize: 24,
    fontWeight: '700',
    marginBottom: 12,
  },
  eventDescription: {
    fontSize: 16,
    lineHeight: 24,
    marginBottom: 20,
  },
  metadataContainer: {
    gap: 12,
    marginBottom: 16,
  },
  metadataItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  metadataText: {
    fontSize: 16,
    fontWeight: '500',
  },
  ratingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  ratingText: {
    fontSize: 16,
    fontWeight: '600',
  },
  capacitySection: {
    margin: 16,
  },
  capacityDetails: {
    flexDirection: 'row',
    marginTop: 16,
    padding: 16,
    borderRadius: 12,
    justifyContent: 'space-around',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  capacityDetailItem: {
    alignItems: 'center',
    gap: 8,
  },
  capacityDetailText: {
    alignItems: 'center',
  },
  capacityDetailValue: {
    fontSize: 20,
    fontWeight: '700',
  },
  capacityDetailLabel: {
    fontSize: 12,
    fontWeight: '500',
  },
  section: {
    margin: 16,
    padding: 20,
    borderRadius: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '700',
    marginBottom: 16,
  },
  viewAllButton: {
    marginTop: 12,
    padding: 12,
    alignItems: 'center',
  },
  viewAllText: {
    color: '#007AFF',
    fontSize: 16,
    fontWeight: '600',
  },
  registerSection: {
    margin: 16,
    marginBottom: 32,
  },
  registerButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 16,
    borderRadius: 12,
    marginBottom: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
    ...Platform.select({
      web: {
        cursor: 'pointer',
      },
    }),
  },
  registerButtonContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  registerButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
  registerNote: {
    fontSize: 12,
    textAlign: 'center',
    fontStyle: 'italic',
  },
  backButton: {
    backgroundColor: '#007AFF',
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 8,
    ...Platform.select({
      web: {
        cursor: 'pointer',
      },
    }),
  },
  backButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
});