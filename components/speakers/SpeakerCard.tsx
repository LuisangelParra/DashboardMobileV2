import React from 'react';
import { View, Text, StyleSheet, Pressable, useColorScheme, Image, Dimensions } from 'react-native';
import { Linkedin, Twitter, Globe, ExternalLink } from 'lucide-react-native';

const { width } = Dimensions.get('window');
const isTablet = width >= 768;

type SpeakerCardProps = {
  speaker: {
    id: string;
    name: string;
    role: string;
    company: string;
    bio: string;
    expertise: string[];
    imageUrl?: string;
    social?: {
      linkedin?: string;
      twitter?: string;
      website?: string;
    };
  };
  onPress: () => void;
};

export function SpeakerCard({ speaker, onPress }: SpeakerCardProps) {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';

  return (
    <Pressable
      style={[
        styles.card,
        { 
          backgroundColor: isDark ? '#1C1C1E' : '#FFFFFF',
          width: isTablet ? '48%' : '100%'
        }
      ]}
      onPress={onPress}
    >
      <View style={styles.header}>
        {speaker.imageUrl ? (
          <Image
            source={{ uri: speaker.imageUrl }}
            style={styles.avatar}
            resizeMode="cover"
            accessibilityLabel={`Profile photo of ${speaker.name}`}
          />
        ) : (
          <View style={[
            styles.avatarPlaceholder,
            { backgroundColor: isDark ? '#2C2C2E' : '#F2F2F7' }
          ]}>
            <Text style={[
              styles.avatarInitials,
              { color: isDark ? '#FFFFFF' : '#000000' }
            ]}>
              {speaker.name.split(' ').map(n => n[0]).join('')}
            </Text>
          </View>
        )}
        
        <View style={styles.headerInfo}>
          <Text 
            style={[
              styles.name,
              { color: isDark ? '#FFFFFF' : '#000000' }
            ]}
            numberOfLines={1}
          >
            {speaker.name}
          </Text>
          
          <Text 
            style={[
              styles.role,
              { color: isDark ? '#EBEBF5' : '#3C3C43' }
            ]}
            numberOfLines={1}
          >
            {speaker.role}
          </Text>
          
          <Text 
            style={[
              styles.company,
              { color: isDark ? '#8E8E93' : '#6C6C70' }
            ]}
            numberOfLines={1}
          >
            {speaker.company}
          </Text>
        </View>
      </View>

      <Text 
        style={[
          styles.bio,
          { color: isDark ? '#EBEBF5' : '#3C3C43' }
        ]}
        numberOfLines={3}
      >
        {speaker.bio}
      </Text>

      <View style={styles.expertiseContainer}>
        {speaker.expertise.map((item, index) => (
          <View
            key={index}
            style={[
              styles.expertiseTag,
              { backgroundColor: isDark ? '#2C2C2E' : '#F2F2F7' }
            ]}
          >
            <Text
              style={[
                styles.expertiseText,
                { color: isDark ? '#FFFFFF' : '#000000' }
              ]}
            >
              {item}
            </Text>
          </View>
        ))}
      </View>

      {speaker.social && (
        <View style={styles.socialLinks}>
          {speaker.social.linkedin && (
            <Pressable
              style={[
                styles.socialButton,
                { backgroundColor: isDark ? '#2C2C2E' : '#F2F2F7' }
              ]}
              onPress={() => {/* Open LinkedIn */}}
              accessibilityLabel={`${speaker.name}'s LinkedIn profile`}
            >
              <Linkedin size={18} color={isDark ? '#FFFFFF' : '#000000'} />
            </Pressable>
          )}
          
          {speaker.social.twitter && (
            <Pressable
              style={[
                styles.socialButton,
                { backgroundColor: isDark ? '#2C2C2E' : '#F2F2F7' }
              ]}
              onPress={() => {/* Open Twitter */}}
              accessibilityLabel={`${speaker.name}'s Twitter profile`}
            >
              <Twitter size={18} color={isDark ? '#FFFFFF' : '#000000'} />
            </Pressable>
          )}
          
          {speaker.social.website && (
            <Pressable
              style={[
                styles.socialButton,
                { backgroundColor: isDark ? '#2C2C2E' : '#F2F2F7' }
              ]}
              onPress={() => {/* Open Website */}}
              accessibilityLabel={`${speaker.name}'s website`}
            >
              <Globe size={18} color={isDark ? '#FFFFFF' : '#000000'} />
            </Pressable>
          )}
        </View>
      )}

      <View style={styles.viewProfileContainer}>
        <Text style={styles.viewProfileText}>
          View Profile
        </Text>
        <ExternalLink size={16} color="#0A84FF" />
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: {
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  header: {
    flexDirection: 'row',
    marginBottom: 12,
  },
  avatar: {
    width: 80,
    height: 80,
    borderRadius: 40,
    marginRight: 16,
  },
  avatarPlaceholder: {
    width: 80,
    height: 80,
    borderRadius: 40,
    marginRight: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarInitials: {
    fontSize: 24,
    fontWeight: '600',
  },
  headerInfo: {
    flex: 1,
    justifyContent: 'center',
  },
  name: {
    fontSize: 20,
    fontWeight: '600',
    marginBottom: 4,
  },
  role: {
    fontSize: 16,
    fontWeight: '500',
    marginBottom: 2,
  },
  company: {
    fontSize: 14,
  },
  bio: {
    fontSize: 15,
    lineHeight: 22,
    marginBottom: 12,
  },
  expertiseContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginBottom: 16,
  },
  expertiseTag: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
  },
  expertiseText: {
    fontSize: 13,
    fontWeight: '500',
  },
  socialLinks: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 12,
  },
  socialButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
  },
  viewProfileContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-end',
  },
  viewProfileText: {
    color: '#0A84FF',
    fontSize: 14,
    fontWeight: '600',
    marginRight: 4,
  },
});