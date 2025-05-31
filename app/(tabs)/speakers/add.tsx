// AddSpeakerScreen.tsx

import { useState } from 'react';
import { View, Text, StyleSheet, TextInput, Pressable, Alert, ScrollView, useColorScheme, ActivityIndicator } from 'react-native';
import { router } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { ArrowLeft, Save, User } from 'lucide-react-native';
import Constants from 'expo-constants';

const {
  UNIDB_BASE_URL,
  UNIDB_CONTRACT_KEY
} = (Constants.expoConfig!.extra as {
  UNIDB_BASE_URL: string;
  UNIDB_CONTRACT_KEY: string;
});
const BASE_URL = `${UNIDB_BASE_URL}/${UNIDB_CONTRACT_KEY}`;

export default function AddSpeakerScreen() {
  const insets = useSafeAreaInsets();
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';
  
  const [speakerName, setSpeakerName] = useState('');
  const [loading, setLoading] = useState(false);

  const validateForm = () => {
    if (!speakerName.trim()) {
      Alert.alert('Error', 'Speaker name is required');
      return false;
    }
    
    if (speakerName.trim().length < 2) {
      Alert.alert('Error', 'Speaker name must be at least 2 characters long');
      return false;
    }
    
    return true;
  };

  const handleSave = async () => {
    if (!validateForm()) return;
    
    setLoading(true);
    
    try {
      console.log('💾 Creating new speaker...');
      
      // ✅ GENERAR ID TEMPORAL PARA UPDATE OPTIMISTA
      const tempId = Date.now().toString();
      const speakerData = {
        id: tempId,
        name: speakerName.trim(),
        email: null,
        company: null,
        phone: null,
        bio: 'No bio available',
        role: 'Speaker',
        expertise: [],
        social: {},
        rating: 4.5,
        imageUrl: null,
      };
      
      console.log('📤 Speaker data to create:', speakerData);
      
      // ✅ NAVEGACIÓN INMEDIATA CON DATOS OPTIMISTAS
      console.log('🚀 Navigating immediately with new speaker data...');
      
      // ✅ CREAR EL SPEAKER EN BACKGROUND Y NAVEGAR INMEDIATAMENTE
      const createPromise = fetch(`${BASE_URL}/data/store`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          table_name: "speakers",
          data: { name: speakerName.trim() }
        }),
      });
      
      // ✅ NAVEGAR INMEDIATAMENTE A LA LISTA CON EL NUEVO SPEAKER
      router.replace({
        pathname: '/(tabs)/speakers',
        params: { 
          newSpeaker: JSON.stringify(speakerData),
          _timestamp: Date.now().toString()
        }
      });
      
      // ✅ COMPLETAR LA CREACIÓN EN BACKGROUND
      const response = await createPromise;
      
      console.log('📡 Create Response status:', response.status);
      
      if (!response.ok) {
        const errorText = await response.text();
        console.error('❌ Create Response error:', errorText);
        // ✅ SI FALLA, MOSTRAR ERROR PERO NO INTERRUMPIR LA NAVEGACIÓN
        setTimeout(() => {
          Alert.alert('Warning', 'Speaker was added locally but may not be saved to server. Please refresh to verify.');
        }, 1000);
        return;
      }
      
      const result = await response.json();
      console.log('✅ Speaker created successfully:', result);
      
    } catch (error) {
      console.error('❌ Error creating speaker:', error);
      // ✅ MOSTRAR ERROR DESPUÉS DE UN DELAY PARA NO INTERRUMPIR LA EXPERIENCIA
      setTimeout(() => {
        Alert.alert('Warning', 'Speaker was added locally but may not be saved to server. Please refresh to verify.');
      }, 1000);
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={[styles.container, { backgroundColor: isDark ? '#000000' : '#F2F2F7' }]}>
      {/* Header */}
      <View style={[styles.header, { paddingTop: insets.top + 8 }]}>
        <Pressable style={styles.backButton} onPress={() => router.back()}>
          <ArrowLeft size={24} color={isDark ? '#FFFFFF' : '#000000'} />
        </Pressable>
        
        <Text style={[styles.headerTitle, { color: isDark ? '#FFFFFF' : '#000000' }]}>
          Add Speaker
        </Text>
        
        <Pressable 
          style={[styles.saveButton, { opacity: loading ? 0.6 : 1 }]} 
          onPress={handleSave}
          disabled={loading}
        >
          <Save size={20} color="#007AFF" />
        </Pressable>
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Speaker Info */}
        <View style={[styles.section, { backgroundColor: isDark ? '#1C1C1E' : '#FFFFFF' }]}>
          <View style={styles.sectionHeader}>
            <User size={24} color="#007AFF" />
            <Text style={[styles.sectionTitle, { color: isDark ? '#FFFFFF' : '#000000' }]}>
              Speaker Information
            </Text>
          </View>
          
          <View style={styles.field}>
            <Text style={[styles.label, { color: isDark ? '#FFFFFF' : '#000000' }]}>
              Full Name *
            </Text>
            <TextInput
              style={[
                styles.input,
                { 
                  backgroundColor: isDark ? '#2C2C2E' : '#F2F2F7',
                  color: isDark ? '#FFFFFF' : '#000000'
                }
              ]}
              placeholder="Enter speaker's full name"
              placeholderTextColor={isDark ? '#8E8E93' : '#3C3C43'}
              value={speakerName}
              onChangeText={setSpeakerName}
              autoFocus
              returnKeyType="done"
              onSubmitEditing={handleSave}
            />
            <Text style={[styles.helpText, { color: isDark ? '#8E8E93' : '#8E8E93' }]}>
              Examples: "Dr. María González", "Ing. Carlos Pérez", "Ana Torres"
            </Text>
          </View>
        </View>

        {/* Quick Add Notice */}
        <View style={[styles.noticeSection, { backgroundColor: 'rgba(0, 122, 255, 0.1)' }]}>
          <Text style={[styles.noticeTitle, { color: '#007AFF' }]}>
            🚀 Quick Add
          </Text>
          <Text style={[styles.noticeText, { color: '#007AFF' }]}>
            You can add more details later by editing the speaker profile.
          </Text>
        </View>

        {/* Save Button */}
        <View style={styles.buttonContainer}>
          <Pressable 
            style={[
              styles.primaryButton,
              { 
                backgroundColor: loading ? '#999999' : '#007AFF',
                opacity: !speakerName.trim() ? 0.5 : 1
              }
            ]} 
            onPress={handleSave}
            disabled={loading || !speakerName.trim()}
          >
            <Text style={styles.primaryButtonText}>
              {loading ? 'Creating...' : 'Create Speaker'}
            </Text>
          </Pressable>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingBottom: 8,
  },
  backButton: {
    padding: 8,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '600',
  },
  saveButton: {
    padding: 8,
  },
  content: {
    flex: 1,
  },
  section: {
    margin: 16,
    padding: 24,
    borderRadius: 16,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
    gap: 12,
  },
  sectionTitle: {
    fontSize: 22,
    fontWeight: '600',
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
  },
  primaryButtonText: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: '600',
  },
});
