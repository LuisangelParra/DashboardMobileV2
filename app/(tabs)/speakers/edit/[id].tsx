import { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TextInput, Pressable, Alert, ScrollView, useColorScheme, ActivityIndicator, Platform } from 'react-native';
import { router, useLocalSearchParams } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { ArrowLeft, Save } from 'lucide-react-native';
import { useSpeaker } from '@/hooks/useSpeaker';
import Constants from 'expo-constants';

const {
  UNIDB_BASE_URL,
  UNIDB_CONTRACT_KEY
} = (Constants.expoConfig!.extra as {
  UNIDB_BASE_URL: string;
  UNIDB_CONTRACT_KEY: string;
});
const BASE_URL = `${UNIDB_BASE_URL}/${UNIDB_CONTRACT_KEY}`;

export default function EditSpeakerScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const insets = useSafeAreaInsets();
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';
  
  const { speaker, speakerEntryId, isLoading: initialLoading, error: loadError } = useSpeaker(id || null);
  
  const [speakerName, setSpeakerName] = useState('');
  const [loading, setLoading] = useState(false);
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false); // ✅ TRACK CHANGES

  useEffect(() => {
    if (speaker) {
      setSpeakerName(speaker.name || '');
    }
  }, [speaker]);

  // ✅ DETECTAR CAMBIOS NO GUARDADOS
  useEffect(() => {
    if (speaker) {
      setHasUnsavedChanges(speakerName.trim() !== speaker.name?.trim());
    }
  }, [speakerName, speaker]);

  const validateForm = () => {
    if (!speakerName.trim()) {
      // ✅ USAR ALERT MULTIPLATAFORMA
      if (Platform.OS === 'web') {
        window.alert('Speaker name is required');
      } else {
        Alert.alert('Error', 'Speaker name is required');
      }
      return false;
    }
    
    if (speakerName.trim().length < 2) {
      if (Platform.OS === 'web') {
        window.alert('Speaker name must be at least 2 characters long');
      } else {
        Alert.alert('Error', 'Speaker name must be at least 2 characters long');
      }
      return false;
    }
    
    return true;
  };

  const handleSave = async () => {
    if (!validateForm()) return;
    if (!speakerEntryId) {
      const errorMsg = 'Speaker entry ID not found';
      if (Platform.OS === 'web') {
        window.alert(errorMsg);
      } else {
        Alert.alert('Error', errorMsg);
      }
      return;
    }
    
    setLoading(true);
    
    try {
      console.log('💾 Updating speaker...');
      console.log('🆔 Using entry_id:', speakerEntryId);
      
      const speakerData = {
        name: speakerName.trim()
      };
      
      console.log('📤 Speaker data to update:', speakerData);
      
      // ✅ CREAR DATOS OPTIMISTAS DEL SPEAKER ACTUALIZADO
      const updatedSpeakerOptimistic = {
        ...speaker,
        name: speakerName.trim(),
        id: speaker?.id || id, // ✅ ASEGURAR QUE TENGA ID
      };
      
      console.log('🚀 Navigating immediately with updated speaker data...');
      
      // ✅ HACER EL UPDATE EN BACKGROUND Y NAVEGAR INMEDIATAMENTE
      const updatePromise = fetch(`${BASE_URL}/data/speakers/update/${speakerEntryId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Cache-Control': 'no-cache', // ✅ EVITAR CACHE
        },
        body: JSON.stringify({
          data: speakerData
        }),
      });
      
      // ✅ NAVEGAR INMEDIATAMENTE A LA LISTA CON EL SPEAKER ACTUALIZADO
      router.replace({
        pathname: '/(tabs)/speakers',
        params: { 
          updatedSpeaker: JSON.stringify(updatedSpeakerOptimistic),
          speakerId: id,
          _timestamp: Date.now().toString()
        }
      });
      
      // ✅ COMPLETAR EL UPDATE EN BACKGROUND
      const response = await updatePromise;
      
      console.log('📡 Update Response status:', response.status);
      console.log('📡 Update Response ok:', response.ok);
      
      if (!response.ok) {
        const errorText = await response.text();
        console.error('❌ Update Response error:', errorText);
        // ✅ SI FALLA, MOSTRAR ERROR PERO NO INTERRUMPIR LA NAVEGACIÓN
        setTimeout(() => {
          const warningMsg = 'Speaker was updated locally but may not be saved to server. Please refresh to verify.';
          if (Platform.OS === 'web') {
            window.alert(`Warning\n\n${warningMsg}`);
          } else {
            Alert.alert('Warning', warningMsg);
          }
        }, 1000);
        return;
      }
      
      const result = await response.json();
      console.log('✅ Speaker updated successfully:', result);
      
    } catch (error) {
      console.error('❌ Error updating speaker:', error);
      // ✅ MOSTRAR ERROR DESPUÉS DE UN DELAY PARA NO INTERRUMPIR LA EXPERIENCIA
      setTimeout(() => {
        const warningMsg = 'Speaker was updated locally but may not be saved to server. Please refresh to verify.';
        if (Platform.OS === 'web') {
          window.alert(`Warning\n\n${warningMsg}`);
        } else {
          Alert.alert('Warning', warningMsg);
        }
      }, 1000);
    } finally {
      setLoading(false);
    }
  };

  // ✅ MANEJAR NAVEGACIÓN HACIA ATRÁS CON CAMBIOS NO GUARDADOS
  const handleBack = () => {
    if (hasUnsavedChanges) {
      const confirmMsg = 'You have unsaved changes. Are you sure you want to go back?';
      if (Platform.OS === 'web') {
        const confirmed = window.confirm(confirmMsg);
        if (confirmed) {
          router.back();
        }
      } else {
        Alert.alert(
          'Unsaved Changes',
          confirmMsg,
          [
            { text: 'Cancel', style: 'cancel' },
            { text: 'Discard Changes', style: 'destructive', onPress: () => router.back() }
          ]
        );
      }
    } else {
      router.back();
    }
  };

  if (initialLoading) {
    return (
      <View style={[styles.container, styles.centered, { backgroundColor: isDark ? '#000000' : '#F2F2F7' }]}>
        <ActivityIndicator size="large" color="#0A84FF" />
        <Text style={[styles.loadingText, { color: isDark ? '#FFFFFF' : '#000000' }]}>
          Loading speaker...
        </Text>
      </View>
    );
  }

  if (loadError || !speaker) {
    return (
      <View style={[styles.container, styles.centered, { backgroundColor: isDark ? '#000000' : '#F2F2F7' }]}>
        <Text style={[styles.errorText, { color: isDark ? '#FFFFFF' : '#000000' }]}>
          {loadError || 'Speaker not found'}
        </Text>
        <Pressable style={styles.backButton} onPress={() => router.back()}>
          <Text style={styles.backButtonText}>Go Back</Text>
        </Pressable>
      </View>
    );
  }

  return (
    <View style={[styles.container, { backgroundColor: isDark ? '#000000' : '#F2F2F7' }]}>
      {/* ✅ HEADER MEJORADO */}
      <View style={[styles.header, { paddingTop: insets.top + 8 }]}>
        <Pressable style={styles.headerButton} onPress={handleBack}>
          <ArrowLeft size={24} color={isDark ? '#FFFFFF' : '#000000'} />
        </Pressable>
        
        <View style={styles.headerCenter}>
          <Text style={[styles.headerTitle, { color: isDark ? '#FFFFFF' : '#000000' }]}>
            Edit Speaker
          </Text>
          {hasUnsavedChanges && (
            <Text style={[styles.unsavedIndicator, { color: '#FF9500' }]}>
              • Unsaved changes
            </Text>
          )}
        </View>
        
        <Pressable 
          style={[
            styles.headerButton, 
            { 
              opacity: (loading || !hasUnsavedChanges) ? 0.6 : 1,
              backgroundColor: hasUnsavedChanges ? '#007AFF' : 'transparent',
              borderRadius: 8,
            }
          ]} 
          onPress={handleSave}
          disabled={loading || !hasUnsavedChanges}
        >
          <Save size={20} color={hasUnsavedChanges ? '#FFFFFF' : '#007AFF'} />
        </Pressable>
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* ✅ SPEAKER INFO MEJORADA */}
        <View style={[styles.section, { backgroundColor: isDark ? '#1C1C1E' : '#FFFFFF' }]}>
          <Text style={[styles.sectionTitle, { color: isDark ? '#FFFFFF' : '#000000' }]}>
            Speaker Information
          </Text>
          
          <View style={styles.field}>
            <Text style={[styles.label, { color: isDark ? '#FFFFFF' : '#000000' }]}>
              Full Name *
            </Text>
            <TextInput
              style={[
                styles.input,
                { 
                  backgroundColor: isDark ? '#2C2C2E' : '#F2F2F7',
                  color: isDark ? '#FFFFFF' : '#000000',
                  borderWidth: hasUnsavedChanges ? 2 : 0,
                  borderColor: hasUnsavedChanges ? '#007AFF' : 'transparent',
                }
              ]}
              placeholder="Enter speaker's full name"
              placeholderTextColor={isDark ? '#8E8E93' : '#3C3C43'}
              value={speakerName}
              onChangeText={setSpeakerName}
              autoFocus
              returnKeyType="done"
              onSubmitEditing={handleSave}
              maxLength={100} // ✅ LIMITAR LONGITUD
            />
            <Text style={[styles.helpText, { color: isDark ? '#8E8E93' : '#8E8E93' }]}>
              Examples: "Dr. María González", "Ing. Carlos Pérez", "Ana Torres"
            </Text>
          </View>
        </View>

        {/* ✅ QUICK UPDATE NOTICE MEJORADA */}
        <View style={[styles.noticeSection, { backgroundColor: 'rgba(0, 122, 255, 0.1)' }]}>
          <Text style={[styles.noticeTitle, { color: '#007AFF' }]}>
            ⚡ Quick Update
          </Text>
          <Text style={[styles.noticeText, { color: '#007AFF' }]}>
            Changes will be visible immediately while saving in the background.
          </Text>
        </View>

        {/* ✅ SAVE BUTTON MEJORADO */}
        <View style={styles.buttonContainer}>
          <Pressable 
            style={[
              styles.primaryButton,
              { 
                backgroundColor: loading ? '#999999' : 
                               !hasUnsavedChanges ? '#E5E5EA' : '#007AFF',
                opacity: !speakerName.trim() ? 0.5 : 1
              }
            ]} 
            onPress={handleSave}
            disabled={loading || !speakerName.trim() || !hasUnsavedChanges}
          >
            <Text style={[
              styles.primaryButtonText,
              { color: !hasUnsavedChanges ? '#8E8E93' : '#FFFFFF' }
            ]}>
              {loading ? 'Updating...' : 
               !hasUnsavedChanges ? 'No Changes' : 'Update Speaker'}
            </Text>
          </Pressable>
        </View>
      </ScrollView>
    </View>
  );
}

// ✅ ESTILOS ACTUALIZADOS
const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  centered: {
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingBottom: 8,
  },
  headerButton: {
    padding: 8,
    ...Platform.select({
      web: {
        cursor: 'pointer',
      },
    }),
  },
  headerCenter: {
    flex: 1,
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '600',
  },
  unsavedIndicator: {
    fontSize: 12,
    fontWeight: '500',
    marginTop: 2,
  },
  content: {
    flex: 1,
  },
  section: {
    margin: 16,
    padding: 24,
    borderRadius: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  sectionTitle: {
    fontSize: 22,
    fontWeight: '600',
    marginBottom: 20,
  },
  field: {
    marginBottom: 16,
  },
  label: {
    fontSize: 18,
    fontWeight: '500',
    marginBottom: 12,
  },
  input: {
    height: 52,
    borderRadius: 12,
    paddingHorizontal: 16,
    fontSize: 18,
    marginBottom: 8,
    ...Platform.select({
      web: {
        outlineStyle: 'none',
      },
    }),
  },
  helpText: {
    fontSize: 14,
    fontStyle: 'italic',
  },
  noticeSection: {
    margin: 16,
    marginTop: 8,
    padding: 16,
    borderRadius: 12,
  },
  noticeTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 4,
  },
  noticeText: {
    fontSize: 14,
    lineHeight: 20,
  },
  buttonContainer: {
    margin: 16,
    marginTop: 8,
  },
  primaryButton: {
    height: 52,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    ...Platform.select({
      web: {
        cursor: 'pointer',
      },
    }),
  },
  primaryButtonText: {
    fontSize: 18,
    fontWeight: '600',
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
  },
  errorText: {
    fontSize: 16,
    textAlign: 'center',
    marginBottom: 16,
  },
  backButton: {
    padding: 8,
    ...Platform.select({
      web: {
        cursor: 'pointer',
      },
    }),
  },
  backButtonText: {
    color: '#007AFF',
    fontSize: 16,
  },
});