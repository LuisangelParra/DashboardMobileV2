import { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, Pressable, useColorScheme, Image, Alert, Platform, ActivityIndicator } from 'react-native';
import { router } from 'expo-router';
import { X, ImagePlus } from 'lucide-react-native';
import { EventCategory } from '@/types';
import { TextField } from '@/components/events/edit/TextField';
import { TextAreaField } from '@/components/events/edit/TextAreaField';
import { DateTimeFields } from '@/components/events/edit/DateTimeFields';
import { LocationField } from '@/components/events/edit/LocationField';
import { SpeakerPicker } from '@/components/events/edit/SpeakerPicker';
import { MultiSpeakerPicker } from '@/components/events/edit/MultiSpeakerPicker';
import { CategorySelector } from '@/components/events/edit/CategorySelector';
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

export default function CreateEventScreen() {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';
  
  // Estados del formulario
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
  
  // Estados para opciones
  const [speakerOptions, setSpeakerOptions] = useState<SpeakerOption[]>([]);
  const [allTracks, setAllTracks] = useState<string[]>([]);
  const [trackNameToId, setTrackNameToId] = useState<Record<string, number>>({});
  
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const modalityOptions: ModalityType[] = ['Presencial', 'Virtual', 'Hibrida'];

  // Función helper para formatear fecha automáticamente
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

  // Función helper para formatear hora automáticamente
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

  // Validación mejorada de fecha
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

  // Validación mejorada de hora
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

  // Validación de rango de tiempo
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

  // Cargar datos iniciales
  useEffect(() => {
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

  const handleSubmit = async () => {
    console.log('🚀 Submit button pressed');
    
    const isValid = validateForm();
    if (!isValid) {
      console.log('❌ Form validation failed - please check the form fields above');
      return;
    }
    
    setIsSubmitting(true);
    console.log('📝 Starting event creation...');
    
    try {
      // 1. Generar ID único para el evento
      const timestamp = Date.now();
      const randomId = Math.floor(Math.random() * 1000);
      const eventId = parseInt(`${timestamp.toString().slice(-8)}${randomId}`);
      
      console.log('🆔 Generated event ID:', eventId);

      // 2. Preparar datos del evento según la estructura real de la BD
      const eventData = {
        id: eventId,
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
        suscritos: 0,
        imageUrl: formData.imageUrl
      };

      console.log('📤 Sending event data:', eventData);

      // 3. Crear el evento en la base de datos
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

      console.log('📡 Event creation response status:', eventResponse.status);

      if (!eventResponse.ok) {
        const errorText = await eventResponse.text();
        console.error('❌ Event creation failed:', errorText);
        throw new Error(`Failed to create event: ${eventResponse.status} - ${errorText}`);
      }

      const eventResult = await eventResponse.json();
      console.log('✅ Event created successfully:', eventResult);
      
      // 4. Usar el ID que generamos para las relaciones
      const finalEventId = eventResult.id || eventId;
      console.log('🆔 Final event ID for relationships:', finalEventId);

      // 5. Crear relación event_tracks para la categoría seleccionada
      if (formData.tema && finalEventId) {
        console.log('🏷️ Creating track relationship for selected category...');
        
        const trackId = trackNameToId[formData.tema];
        if (trackId) {
          console.log(`📌 Creating track relation: event ${finalEventId} -> track ${trackId} (${formData.tema})`);
          
          try {
            const trackResponse = await fetch(`${BASE_URL}/data/store`, {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
              },
              body: JSON.stringify({
                table_name: 'event_tracks',
                data: {
                  event_id: finalEventId,
                  track_id: trackId
                }
              }),
            });

            if (!trackResponse.ok) {
              console.warn(`⚠️ Failed to create track relationship for ${formData.tema}`);
            } else {
              console.log(`✅ Track relationship created for ${formData.tema}`);
            }
          } catch (trackError) {
            console.warn('⚠️ Error creating track relationship:', trackError);
            // No interrumpir el flujo principal por este error
          }
        } else {
          console.warn(`⚠️ Track ID not found for: ${formData.tema}`);
        }
      }

      // 6. Mostrar mensaje de éxito
      const successMessage = `Evento "${formData.titulo}" creado exitosamente!`;
      console.log('🎉', successMessage);
      
      if (Platform.OS === 'web') {
        window.alert(successMessage);
      } else {
        Alert.alert('Éxito', successMessage);
      }
      
      // 7. Navegar de vuelta a la lista de eventos
      console.log('🔄 Redirecting to events list...');
      router.replace('/(tabs)/events');
      
    } catch (error) {
      console.error('❌ Error creating event:', error);
      
      const errorMessage = error instanceof Error 
        ? `Error: ${error.message}` 
        : 'Error al crear el evento. Por favor intenta de nuevo.';
      
      setErrors({ submit: errorMessage });
      
      if (Platform.OS === 'web') {
        window.alert(errorMessage);
      } else {
        Alert.alert('Error', errorMessage);
      }
    } finally {
      setIsSubmitting(false);
      console.log('🔚 Event creation process finished');
    }
  };

  const toggleGuest = (name: string) => {
    if (!name.trim()) return;
    setInvitadosEspeciales(prev =>
      prev.includes(name) ? prev.filter(g => g !== name) : [...prev, name]
    );
    // Si el invitado era el ponente principal, limpiarlo
    if (ponente === name) {
      setPonente('');
    }
  };

  const handleSpeakerSelect = (name: string) => {
    setPonente(name);
    // Si estaba en invitados, quitarlo
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
        
        {/* Category - Using tracks from database */}
        <View style={styles.inputContainer}>
          <Text style={[
            styles.label,
            { color: isDark ? '#FFFFFF' : '#000000' }
          ]}>
            Categoría *
          </Text>
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

        {/* Platform (only for Virtual events) */}
        {formData.modalidad === 'Virtual' && (
          <TextField
            label="Plataforma *"
            value={formData.plataforma}
            placeholder="ej: Zoom, Google Meet, Teams"
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
        
        {/* Date and Time with improved validation and formatting */}
        <View style={styles.inputContainer}>
          <Text style={[
            styles.label,
            { color: isDark ? '#FFFFFF' : '#000000' }
          ]}>
            Fecha del Evento *
          </Text>
          <TextField
            value={formData.fecha}
            placeholder="YYYY-MM-DD (ej: 2024-12-25)"
            onChange={(text) => {
              const formatted = formatDateInput(text);
              setFormData(prev => ({ ...prev, fecha: formatted }));
            }}
            error={errors.fecha}
            keyboardType="numeric"
            label=''
          />
        </View>

        <View style={styles.timeFieldsContainer}>
          <View style={[styles.inputContainer, { flex: 1, marginRight: 8 }]}>
            <Text style={[
              styles.label,
              { color: isDark ? '#FFFFFF' : '#000000' }
            ]}>
              Hora de Inicio *
            </Text>
            <TextField
              value={formData.hora_inicio}
              placeholder="HH:MM (ej: 14:30)"
              onChange={(text) => {
                const formatted = formatTimeInput(text);
                setFormData(prev => ({ ...prev, hora_inicio: formatted }));
              }}
              error={errors.hora_inicio}
              keyboardType="numeric"
              label=''
            />
          </View>
          
          <View style={[styles.inputContainer, { flex: 1, marginLeft: 8 }]}>
            <Text style={[
              styles.label,
              { color: isDark ? '#FFFFFF' : '#000000' }
            ]}>
              Hora de Fin *
            </Text>
            <TextField
              value={formData.hora_fin}
              placeholder="HH:MM (ej: 16:00)"
              onChange={(text) => {
                const formatted = formatTimeInput(text);
                setFormData(prev => ({ ...prev, hora_fin: formatted }));
              }}
              error={errors.hora_fin}
              keyboardType="numeric"
              label=''
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
    </ScrollView>
  );
}

// Agregar al StyleSheet existente:
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
});