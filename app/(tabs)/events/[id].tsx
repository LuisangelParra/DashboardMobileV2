import { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, Image, Pressable, useColorScheme, ActivityIndicator } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { router, useLocalSearchParams } from 'expo-router';
import { Calendar, Clock, MapPin, CreditCard as Edit2, Trash2, Star, ChevronLeft, Share } from 'lucide-react-native';
import { useEvent } from '@/hooks/useEvent';
import { CategoryBadge } from '@/components/events/CategoryBadge';
import { SpeakerRow } from '@/components/speakers/SpeakerRow';
import { FeedbackCard } from '@/components/feedback/FeedbackCard';
import { ConfirmationDialog } from '@/components/ui/ConfirmationDialog';

export default function EventDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const insets = useSafeAreaInsets();
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';
  const [showDeleteConfirmation, setShowDeleteConfirmation] = useState(false);
  
  const { event, speakers, feedback, isLoading, deleteEvent } = useEvent(id);

  if (isLoading) {
    return (
      <View style={[
        styles.loadingContainer,
        { backgroundColor: isDark ? '#000000' : '#F2F2F7' }
      ]}>
        <ActivityIndicator size="large" color="#0A84FF" />
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
          <Text style={styles.backButtonText}>
            Go Back
          </Text>
        </Pressable>
      </View>
    );
  }

  const handleDeleteEvent = async () => {
    await deleteEvent();
    router.back();
  };

  return (
    <>
      <ScrollView 
        style={[
          styles.container,
          { backgroundColor: isDark ? '#000000' : '#F2F2F7' }
        ]}
        contentContainerStyle={{ paddingBottom: insets.bottom + 20 }}
      >
        <View style={styles.imageContainer}>
          <Image
            source={{ uri: event.imageUrl }}
            style={styles.eventImage}
            resizeMode="cover"
          />
          <View style={[
            styles.backButtonContainer,
            { backgroundColor: isDark ? 'rgba(0,0,0,0.5)' : 'rgba(255,255,255,0.5)' }
          ]}>
            <Pressable onPress={() => router.back()}>
              <ChevronLeft size={24} color={isDark ? '#FFFFFF' : '#000000'} />
            </Pressable>
          </View>
          <View style={styles.headerActions}>
            <Pressable 
              style={[
                styles.headerActionButton,
                { backgroundColor: isDark ? 'rgba(0,0,0,0.5)' : 'rgba(255,255,255,0.5)' }
              ]}
              onPress={() => {/* Share functionality */}}
            >
              <Share size={20} color={isDark ? '#FFFFFF' : '#000000'} />
            </Pressable>
          </View>
        </View>

        <View style={styles.contentContainer}>
          <View style={styles.titleContainer}>
            <Text style={[
              styles.eventTitle,
              { color: isDark ? '#FFFFFF' : '#000000' }
            ]}>
              {event.name}
            </Text>
            <CategoryBadge category={event.category} />
          </View>

          <View style={styles.metadataContainer}>
            <View style={styles.metadataItem}>
              <Calendar size={16} color={isDark ? '#8E8E93' : '#3C3C43'} />
              <Text style={[
                styles.metadataText,
                { color: isDark ? '#EBEBF5' : '#3C3C43' }
              ]}>
                {event.date}
              </Text>
            </View>
            
            <View style={styles.metadataItem}>
              <Clock size={16} color={isDark ? '#8E8E93' : '#3C3C43'} />
              <Text style={[
                styles.metadataText,
                { color: isDark ? '#EBEBF5' : '#3C3C43' }
              ]}>
                {event.time}
              </Text>
            </View>
            
            <View style={styles.metadataItem}>
              <MapPin size={16} color={isDark ? '#8E8E93' : '#3C3C43'} />
              <Text style={[
                styles.metadataText,
                { color: isDark ? '#EBEBF5' : '#3C3C43' }
              ]}>
                {event.location}
              </Text>
            </View>
          </View>

          <View style={styles.ratingContainer}>
            <Text style={[
              styles.sectionTitle,
              { color: isDark ? '#FFFFFF' : '#000000' }
            ]}>
              Rating
            </Text>
            <View style={styles.ratingContent}>
              <View style={styles.ratingStars}>
                {[1, 2, 3, 4, 5].map(star => (
                  <Star
                    key={star}
                    size={18}
                    color={star <= event.rating ? '#FF9500' : isDark ? '#48484A' : '#E5E5EA'}
                    fill={star <= event.rating ? '#FF9500' : 'none'}
                  />
                ))}
              </View>
              <Text style={[
                styles.ratingText,
                { color: isDark ? '#EBEBF5' : '#3C3C43' }
              ]}>
                {event.rating.toFixed(1)} ({event.ratingCount} ratings)
              </Text>
            </View>
          </View>

          <View style={styles.descriptionContainer}>
            <Text style={[
              styles.sectionTitle,
              { color: isDark ? '#FFFFFF' : '#000000' }
            ]}>
              Description
            </Text>
            <Text style={[
              styles.descriptionText,
              { color: isDark ? '#EBEBF5' : '#3C3C43' }
            ]}>
              {event.description}
            </Text>
          </View>

          {speakers.length > 0 && (
            <View style={styles.speakersContainer}>
              <Text style={[
                styles.sectionTitle,
                { color: isDark ? '#FFFFFF' : '#000000' }
              ]}>
                Speakers
              </Text>
              
              {speakers.map(speaker => (
                <SpeakerRow
                  key={speaker.id}
                  speaker={speaker}
                  onPress={() => router.push(`/speakers/${speaker.id}`)}
                />
              ))}
            </View>
          )}

          {feedback.length > 0 && (
            <View style={styles.feedbackContainer}>
              <View style={styles.feedbackHeader}>
                <Text style={[
                  styles.sectionTitle,
                  { color: isDark ? '#FFFFFF' : '#000000' }
                ]}>
                  Feedback
                </Text>
                <Pressable onPress={() => {/* View all feedback */}}>
                  <Text style={styles.viewAllText}>
                    View All
                  </Text>
                </Pressable>
              </View>
              
              {feedback.slice(0, 3).map(item => (
                <FeedbackCard 
                  key={item.id} 
                  feedback={item} 
                  isDark={isDark} 
                />
              ))}
            </View>
          )}
        </View>
      </ScrollView>

      <View style={[
        styles.actionsContainer,
        { 
          backgroundColor: isDark ? '#1C1C1E' : '#FFFFFF',
          paddingBottom: insets.bottom || 16
        }
      ]}>
        <Pressable
          style={[
            styles.actionButton,
            styles.deleteButton,
            { backgroundColor: isDark ? '#2C2C2E' : '#F2F2F7' }
          ]}
          onPress={() => setShowDeleteConfirmation(true)}
        >
          <Trash2 size={20} color="#FF453A" />
        </Pressable>
        
        <Pressable
          style={[
            styles.actionButton,
            styles.editButton,
          ]}
          onPress={() => router.push(`/events/edit/${id}`)}
        >
          <Edit2 size={20} color="#FFFFFF" />
          <Text style={styles.editButtonText}>
            Edit Event
          </Text>
        </Pressable>
      </View>

      <ConfirmationDialog
        visible={showDeleteConfirmation}
        title="Delete Event"
        message="Are you sure you want to delete this event? This action cannot be undone."
        confirmText="Delete"
        cancelText="Cancel"
        onConfirm={handleDeleteEvent}
        onCancel={() => setShowDeleteConfirmation(false)}
        isDanger
      />
    </>
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
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  errorText: {
    fontSize: 18,
    marginBottom: 16,
  },
  backButton: {
    padding: 12,
    backgroundColor: '#0A84FF',
    borderRadius: 8,
  },
  backButtonText: {
    color: '#FFFFFF',
    fontWeight: '600',
  },
  imageContainer: {
    height: 240,
    position: 'relative',
  },
  eventImage: {
    width: '100%',
    height: '100%',
  },
  backButtonContainer: {
    position: 'absolute',
    top: 12,
    left: 12,
    borderRadius: 20,
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerActions: {
    position: 'absolute',
    top: 12,
    right: 12,
    flexDirection: 'row',
  },
  headerActionButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: 8,
  },
  contentContainer: {
    padding: 16,
  },
  titleContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  eventTitle: {
    fontSize: 24,
    fontWeight: '700',
    flex: 1,
    marginRight: 8,
  },
  metadataContainer: {
    marginBottom: 16,
  },
  metadataItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  metadataText: {
    fontSize: 15,
    marginLeft: 8,
  },
  ratingContainer: {
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 8,
  },
  ratingContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  ratingStars: {
    flexDirection: 'row',
    marginRight: 8,
  },
  ratingText: {
    fontSize: 14,
  },
  descriptionContainer: {
    marginBottom: 24,
  },
  descriptionText: {
    fontSize: 15,
    lineHeight: 22,
  },
  speakersContainer: {
    marginBottom: 24,
  },
  feedbackContainer: {
    marginBottom: 16,
  },
  feedbackHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  viewAllText: {
    color: '#0A84FF',
    fontSize: 14,
    fontWeight: '500',
  },
  actionsContainer: {
    flexDirection: 'row',
    padding: 16,
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: '#3C3C4333',
  },
  actionButton: {
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
    flexDirection: 'row',
  },
  deleteButton: {
    width: 48,
    marginRight: 12,
  },
  editButton: {
    flex: 1,
    backgroundColor: '#0A84FF',
  },
  editButtonText: {
    color: '#FFFFFF',
    fontWeight: '600',
    marginLeft: 8,
  },
});