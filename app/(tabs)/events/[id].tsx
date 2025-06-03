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

import styles from '@/components/events/edit/editEvent.styles';

export default function EventDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const insets = useSafeAreaInsets();
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';
  
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
      console.log('🎫 Registration action:', isRegistered ? 'Cancel' : 'Register');
      setIsRegistered(!isRegistered);
      
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
        
        <View style={styles.registerSection}>
          <Text style={[
            styles.registerNote,
            { color: isDark ? '#8E8E93' : '#6C6C70' }
          ]}>
            Last updated: {new Date().toLocaleTimeString()}
          </Text>
        </View>
      </ScrollView>
    </View>
  );
}