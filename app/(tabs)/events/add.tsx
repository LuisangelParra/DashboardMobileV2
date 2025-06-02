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
  const [selectedTracks, setSelectedTracks] = useState<string[]>([]);
  
  // Estados para opciones
  const [speakerOptions, setSpeakerOptions] = useState<SpeakerOption[]>([]);
  const [allTracks, setAllTracks] = useState<string[]>([]);
  const [trackNameToId, setTrackNameToId] = useState<Record<string, number>>({});
  
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const categories: EventCategory[] = [
    'Workshop', 'Presentation', 'Panel', 'Networking', 'Other'
  ];
  
  const modalityOptions: ModalityType[] = ['Presencial', 'Virtual', 'Hibrida'];

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
    
    console.log('🔍 Validating form data:', {
      titulo: formData.titulo,
      descripcion: formData.descripcion,
      tema: formData.tema,
      fecha: formData.fecha,
      hora_inicio: formData.hora_inicio,
      hora_fin: formData.hora_fin,
      modalidad: formData.modalidad,
      ponente: ponente,
      max_participantes: formData.max_participantes,
      imageUrl: formData.imageUrl,
      lugar: formData.lugar,
      plataforma: formData.plataforma
    });
    
    if (!formData.titulo.trim()) newErrors.titulo = 'Event title is required';
    if (!formData.descripcion.trim()) newErrors.descripcion = 'Description is required';
    if (!formData.tema.trim()) newErrors.tema = 'Category is required';
    if (!formData.fecha.trim()) newErrors.fecha = 'Date is required';
    if (!formData.hora_inicio.trim()) newErrors.hora_inicio = 'Start time is required';
    if (!formData.hora_fin.trim()) newErrors.hora_fin = 'End time is required';
    if (!formData.modalidad) newErrors.modalidad = 'Modality is required';
    if (!ponente.trim()) newErrors.ponente = 'Main speaker is required';
    if (!formData.max_participantes.trim()) newErrors.max_participantes = 'Max participants is required';
    if (!formData.imageUrl.trim()) newErrors.imageUrl = 'Image is required';
    
    // Validaciones específicas por modalidad
    if (formData.modalidad === 'Virtual' && !formData.plataforma.trim()) {
      newErrors.plataforma = 'Platform is required for virtual events';
    }
    if ((formData.modalidad === 'Presencial' || formData.modalidad === 'Hibrida') && !formData.lugar.trim()) {
      newErrors.lugar = 'Location is required for in-person events';
    }
    
    // Validar número de participantes
    const maxParticipants = parseInt(formData.max_participantes);
    if (isNaN(maxParticipants) || maxParticipants <= 0) {
      newErrors.max_participantes = 'Max participants must be a positive number';
    }
    
    console.log('📋 Validation errors found:', newErrors);
    console.log('✅ Validation passed:', Object.keys(newErrors).length === 0);
    
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

      // 5. Crear relaciones event_tracks si hay tracks seleccionados
      if (selectedTracks.length > 0 && finalEventId) {
        console.log('🏷️ Creating track relationships...');
        
        for (const trackName of selectedTracks) {
          const trackId = trackNameToId[trackName];
          if (trackId) {
            console.log(`📌 Creating track relation: event ${finalEventId} -> track ${trackId} (${trackName})`);
            
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
              console.warn(`⚠️ Failed to create track relationship for ${trackName}`);
            } else {
              console.log(`✅ Track relationship created for ${trackName}`);
            }
          }
        }
      }

      // 6. Mostrar mensaje de éxito
      const successMessage = `Event "${formData.titulo}" created successfully with ID: ${finalEventId}!`;
      console.log('🎉', successMessage);
      
      if (Platform.OS === 'web') {
        window.alert(successMessage);
      } else {
        Alert.alert('Success', successMessage);
      }
      
      // 4. Navegar de vuelta a la lista de eventos (esto forzará la recarga)
      console.log('🔄 Redirecting to events list...');
      router.replace('/(tabs)/events');
      
    } catch (error) {
      console.error('❌ Error creating event:', error);
      
      const errorMessage = error instanceof Error 
        ? error.message 
        : 'Failed to create event. Please try again.';
      
      setErrors({ submit: errorMessage });
      
      if (Platform.OS === 'web') {
        window.alert(`Error: ${errorMessage}`);
      } else {
        Alert.alert('Error', errorMessage);
      }
    } finally {
      setIsSubmitting(false);
      console.log('🔚 Event creation process finished');
    }
  };

  const toggleTrack = (track: string) => {
    setSelectedTracks(prev =>
      prev.includes(track) ? prev.filter(t => t !== track) : [...prev, track]
    );
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
              Add Event Image
            </Text>
          </Pressable>
        )}
        
        {/* Event Title */}
        <TextField
          label="Event Title *"
          value={formData.titulo}
          placeholder="Enter event title"
          onChange={(text) => setFormData(prev => ({ ...prev, titulo: text }))}
          error={errors.titulo}
        />
        
        {/* Description */}
        <TextAreaField
          label="Description *"
          value={formData.descripcion}
          placeholder="Enter event description"
          onChange={(text) => setFormData(prev => ({ ...prev, descripcion: text }))}
          error={errors.descripcion}
        />
        
        {/* Category */}
        <View style={styles.inputContainer}>
          <Text style={[
            styles.label,
            { color: isDark ? '#FFFFFF' : '#000000' }
          ]}>
            Category *
          </Text>
          <View style={styles.categoryContainer}>
            {categories.map(category => (
              <Pressable
                key={category}
                style={[
                  styles.categoryChip,
                  { 
                    backgroundColor: formData.tema === category 
                      ? '#0A84FF' 
                      : isDark ? '#2C2C2E' : '#F2F2F7'
                  }
                ]}
                onPress={() => setFormData(prev => ({ ...prev, tema: category }))}
              >
                <Text style={[
                  styles.categoryChipText,
                  { 
                    color: formData.tema === category 
                      ? '#FFFFFF' 
                      : isDark ? '#FFFFFF' : '#000000'
                  }
                ]}>
                  {category}
                </Text>
              </Pressable>
            ))}
          </View>
          {errors.tema && <Text style={styles.errorText}>{errors.tema}</Text>}
        </View>

        {/* Tracks */}
        {allTracks.length > 0 && (
          <CategorySelector
            label="Tracks"
            options={allTracks}
            selected={selectedTracks}
            onSelect={toggleTrack}
          />
        )}

        {/* Main Speaker */}
        <SpeakerPicker
          label="Main Speaker *"
          options={speakerOptions}
          selected={ponente}
          onSelect={handleSpeakerSelect}
          error={errors.ponente}
        />

        {/* Special Guests */}
        <MultiSpeakerPicker
          label="Special Guests"
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
            Modality *
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
            label="Platform *"
            value={formData.plataforma}
            placeholder="e.g., Zoom, Google Meet, Teams"
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
        
        {/* Date and Time */}
        <DateTimeFields
          date={formData.fecha}
          startTime={formData.hora_inicio}
          endTime={formData.hora_fin}
          onDateChange={(date) => setFormData(prev => ({ ...prev, fecha: date }))}
          onStartTimeChange={(time) => setFormData(prev => ({ ...prev, hora_inicio: time }))}
          onEndTimeChange={(time) => setFormData(prev => ({ ...prev, hora_fin: time }))}
          errors={{
            date: errors.fecha,
            startTime: errors.hora_inicio,
            endTime: errors.hora_fin
          }}
        />

        {/* Max Participants */}
        <TextField
          label="Max Participants *"
          value={formData.max_participantes}
          placeholder="Enter maximum number of participants"
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
                Creating Event...
              </Text>
            </View>
          ) : (
            <Text style={styles.submitButtonText}>
              Create Event
            </Text>
          )}
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
});