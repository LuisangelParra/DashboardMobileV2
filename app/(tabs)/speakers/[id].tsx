import { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, Pressable, useColorScheme, Image, Linking, ActivityIndicator } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { router, useLocalSearchParams } from 'expo-router';
import { Linkedin, Twitter, Globe, Calendar, Star, TrendingUp, ChevronLeft, Share } from 'lucide-react-native';
import { useSpeaker } from '@/hooks/useSpeaker';

export default function SpeakerDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const insets = useSafeAreaInsets();
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';
  
  const { speaker, events, isLoading } = useSpeaker(id);

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

  if (!speaker) {
    return (
      <View style={[
        styles.errorContainer,
        { backgroundColor: isDark ? '#000000' : '#F2F2F7' }
      ]}>
        <Text style={[
          styles.errorText,
          { color: isDark ? '#FFFFFF' : '#000000' }
        ]}>
          Speaker not found
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

  const handleSocialLink = (url: string) => {
    Linking.openURL(url).catch((err) => console.error('Error opening URL:', err));
  };

  return (
    <ScrollView 
      style={[
        styles.container,
        { backgroundColor: isDark ? '#000000' : '#F2F2F7' }
      ]}
      contentContainerStyle={{ paddingBottom: insets.bottom + 20 }}
    >
      <View style={[
        styles.header,
        { backgroundColor: isDark ? '#1C1C1E' : '#FFFFFF' }
      ]}>
        <View style={styles.headerActions}>
          <Pressable 
            style={[
              styles.headerActionButton,
              { backgroundColor: isDark ? 'rgba(0,0,0,0.5)' : 'rgba(255,255,255,0.5)' }
            ]}
            onPress={() => router.back()}
          >
            <ChevronLeft size={24} color={isDark ? '#FFFFFF' : '#000000'} />
          </Pressable>
          
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

        {speaker.imageUrl ? (
          <Image
            source={{ uri: speaker.imageUrl }}
            style={styles.profileImage}
            resizeMode="cover"
          />
        ) : (
          <View style={[
            styles.profileImagePlaceholder,
            { backgroundColor: isDark ? '#2C2C2E' : '#F2F2F7' }
          ]}>
            <Text style={[
              styles.profileImageInitials,
              { color: isDark ? '#FFFFFF' : '#000000' }
            ]}>
              {speaker.name.split(' ').map(n => n[0]).join('')}
            </Text>
          </View>
        )}

        <Text style={[
          styles.name,
          { color: isDark ? '#FFFFFF' : '#000000' }
        ]}>
          {speaker.name}
        </Text>
        
        <Text style={[
          styles.role,
          { color: isDark ? '#EBEBF5' : '#3C3C43' }
        ]}>
          {speaker.role}
        </Text>
        
        {speaker.company && (
          <Text style={[
            styles.company,
            { color: isDark ? '#8E8E93' : '#6C6C70' }
          ]}>
            {speaker.company}
          </Text>
        )}

        {speaker.social && (
          <View style={styles.socialLinks}>
            {speaker.social.linkedin && (
              <Pressable
                style={[
                  styles.socialButton,
                  { backgroundColor: isDark ? '#2C2C2E' : '#F2F2F7' }
                ]}
                onPress={() => handleSocialLink(speaker.social.linkedin!)}
              >
                <Linkedin size={20} color={isDark ? '#FFFFFF' : '#000000'} />
              </Pressable>
            )}
            
            {speaker.social.twitter && (
              <Pressable
                style={[
                  styles.socialButton,
                  { backgroundColor: isDark ? '#2C2C2E' : '#F2F2F7' }
                ]}
                onPress={() => handleSocialLink(speaker.social.twitter!)}
              >
                <Twitter size={20} color={isDark ? '#FFFFFF' : '#000000'} />
              </Pressable>
            )}
            
            {speaker.social.website && (
              <Pressable
                style={[
                  styles.socialButton,
                  { backgroundColor: isDark ? '#2C2C2E' : '#F2F2F7' }
                ]}
                onPress={() => handleSocialLink(speaker.social.website!)}
              >
                <Globe size={20} color={isDark ? '#FFFFFF' : '#000000'} />
              </Pressable>
            )}
          </View>
        )}
      </View>

      <View style={styles.stats}>
        <View style={[
          styles.statCard,
          { backgroundColor: isDark ? '#1C1C1E' : '#FFFFFF' }
        ]}>
          <Calendar size={24} color="#0A84FF" />
          <Text style={[
            styles.statValue,
            { color: isDark ? '#FFFFFF' : '#000000' }
          ]}>
            {speaker.eventCount}
          </Text>
          <Text style={[
            styles.statLabel,
            { color: isDark ? '#8E8E93' : '#3C3C43' }
          ]}>
            Events
          </Text>
        </View>

        <View style={[
          styles.statCard,
          { backgroundColor: isDark ? '#1C1C1E' : '#FFFFFF' }
        ]}>
          <Star size={24} color="#FF9500" />
          <Text style={[
            styles.statValue,
            { color: isDark ? '#FFFFFF' : '#000000' }
          ]}>
            {speaker.rating.toFixed(1)}
          </Text>
          <Text style={[
            styles.statLabel,
            { color: isDark ? '#8E8E93' : '#3C3C43' }
          ]}>
            Rating
          </Text>
        </View>

        <View style={[
          styles.statCard,
          { backgroundColor: isDark ? '#1C1C1E' : '#FFFFFF' }
        ]}>
          <TrendingUp size={24} color="#30D158" />
          <Text style={[
            styles.statValue,
            { color: isDark ? '#FFFFFF' : '#000000' }
          ]}>
            {speaker.expertise.length}
          </Text>
          <Text style={[
            styles.statLabel,
            { color: isDark ? '#8E8E93' : '#3C3C43' }
          ]}>
            Skills
          </Text>
        </View>
      </View>

      <View style={[
        styles.section,
        { backgroundColor: isDark ? '#1C1C1E' : '#FFFFFF' }
      ]}>
        <Text style={[
          styles.sectionTitle,
          { color: isDark ? '#FFFFFF' : '#000000' }
        ]}>
          About
        </Text>
        <Text style={[
          styles.bio,
          { color: isDark ? '#EBEBF5' : '#3C3C43' }
        ]}>
          {speaker.bio}
        </Text>
      </View>

      <View style={[
        styles.section,
        { backgroundColor: isDark ? '#1C1C1E' : '#FFFFFF' }
      ]}>
        <Text style={[
          styles.sectionTitle,
          { color: isDark ? '#FFFFFF' : '#000000' }
        ]}>
          Expertise
        </Text>
        <View style={styles.expertiseContainer}>
          {speaker.expertise.map((skill, index) => (
            <View
              key={index}
              style={[
                styles.expertiseTag,
                { backgroundColor: isDark ? '#2C2C2E' : '#F2F2F7' }
              ]}
            >
              <Text style={[
                styles.expertiseText,
                { color: isDark ? '#FFFFFF' : '#000000' }
              ]}>
                {skill}
              </Text>
            </View>
          ))}
        </View>
      </View>

      {events.length > 0 && (
        <View style={[
          styles.section,
          { backgroundColor: isDark ? '#1C1C1E' : '#FFFFFF' }
        ]}>
          <Text style={[
            styles.sectionTitle,
            { color: isDark ? '#FFFFFF' : '#000000' }
          ]}>
            Events
          </Text>
          {events.map(event => (
            <Pressable
              key={event.id}
              style={[
                styles.eventCard,
                { backgroundColor: isDark ? '#2C2C2E' : '#F2F2F7' }
              ]}
              onPress={() => router.push(`/events/${event.id}`)}
            >
              <Image
                source={{ uri: event.imageUrl }}
                style={styles.eventImage}
                resizeMode="cover"
              />
              <View style={styles.eventInfo}>
                <Text style={[
                  styles.eventName,
                  { color: isDark ? '#FFFFFF' : '#000000' }
                ]}>
                  {event.name}
                </Text>
                <Text style={[
                  styles.eventDate,
                  { color: isDark ? '#8E8E93' : '#3C3C43' }
                ]}>
                  {event.date} • {event.time}
                </Text>
              </View>
            </Pressable>
          ))}
        </View>
      )}
    </ScrollView>
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
  header: {
    padding: 20,
    alignItems: 'center',
    borderRadius: 12,
    margin: 16,
  },
  headerActions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%',
    marginBottom: 16,
  },
  headerActionButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  profileImage: {
    width: 120,
    height: 120,
    borderRadius: 60,
    marginBottom: 16,
  },
  profileImagePlaceholder: {
    width: 120,
    height: 120,
    borderRadius: 60,
    marginBottom: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  profileImageInitials: {
    fontSize: 36,
    fontWeight: '600',
  },
  name: {
    fontSize: 24,
    fontWeight: '700',
    marginBottom: 4,
    textAlign: 'center',
  },
  role: {
    fontSize: 16,
    marginBottom: 4,
    textAlign: 'center',
  },
  company: {
    fontSize: 14,
    marginBottom: 16,
    textAlign: 'center',
  },
  socialLinks: {
    flexDirection: 'row',
    gap: 12,
  },
  socialButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
  },
  stats: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    marginBottom: 16,
    gap: 12,
  },
  statCard: {
    flex: 1,
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
  },
  statValue: {
    fontSize: 20,
    fontWeight: '700',
    marginTop: 8,
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 12,
    fontWeight: '500',
  },
  section: {
    margin: 16,
    marginTop: 0,
    padding: 16,
    borderRadius: 12,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 12,
  },
  bio: {
    fontSize: 15,
    lineHeight: 22,
  },
  expertiseContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  expertiseTag: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
  },
  expertiseText: {
    fontSize: 14,
    fontWeight: '500',
  },
  eventCard: {
    flexDirection: 'row',
    borderRadius: 12,
    overflow: 'hidden',
    marginBottom: 12,
  },
  eventImage: {
    width: 80,
    height: 80,
  },
  eventInfo: {
    flex: 1,
    padding: 12,
    justifyContent: 'center',
  },
  eventName: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 4,
  },
  eventDate: {
    fontSize: 14,
  },
});