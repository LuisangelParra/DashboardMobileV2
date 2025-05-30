import React from 'react';
import { View, Text, StyleSheet, ScrollView, Pressable, useColorScheme, Dimensions } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { 
  Users, 
  CalendarDays, 
  MessageSquare, 
  TrendingUp, 
  Award, 
  Clock 
} from 'lucide-react-native';
import { DashboardMetricCard } from '@/components/dashboard/DashboardMetricCard';
import { SectionHeader } from '@/components/ui/SectionHeader';
import { UpcomingEventCard } from '@/components/events/UpcomingEventCard';
import { useDashboardData } from '@/hooks/useDashboardData';

const { width } = Dimensions.get('window');
const isTablet = width >= 768;

export default function DashboardScreen() {
  const insets = useSafeAreaInsets();
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';
  const { metrics, upcomingEvents, topSpeakers } = useDashboardData();

  return (
    <ScrollView
      style={[
        styles.container,
        { backgroundColor: isDark ? '#000000' : '#F2F2F7' }
      ]}
      contentContainerStyle={{ paddingBottom: insets.bottom + 20 }}
    >
      <View style={styles.header}>
        <Text style={[styles.headerTitle, { color: isDark ? '#FFFFFF' : '#000000' }]}>
          Conference Dashboard
        </Text>
        <Text style={[styles.headerSubtitle, { color: isDark ? '#EBEBF5' : '#3C3C43' }]}>
          Welcome back, Admin
        </Text>
      </View>

      <View style={styles.metricsContainer}>
        <DashboardMetricCard
          title="Total Events"
          value={metrics.totalEvents}
          icon={<CalendarDays size={24} color="#0A84FF" />}
          trend={metrics.eventsTrend}
          onPress={() => router.push('/events')}
        />
        <DashboardMetricCard
          title="Total Speakers"
          value={metrics.totalSpeakers}
          icon={<Users size={24} color="#5E5CE6" />}
          trend={metrics.speakersTrend}
          onPress={() => router.push('/speakers')}
        />
        <DashboardMetricCard
          title="Feedback"
          value={metrics.totalFeedback}
          icon={<MessageSquare size={24} color="#FF9500" />}
          trend={metrics.feedbackTrend}
          onPress={() => router.push('/feedback')}
        />
        <DashboardMetricCard
          title="Avg. Rating"
          value={metrics.averageRating.toFixed(1)}
          icon={<Award size={24} color="#30D158" />}
          trend={metrics.ratingTrend}
        />
      </View>

      <SectionHeader
        title="Upcoming Events"
        actionText="View all"
        onActionPress={() => router.push('/events')}
      />

      <ScrollView 
        horizontal 
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.upcomingEventsContainer}
      >
        {upcomingEvents.map(event => (
          <UpcomingEventCard 
            key={event.id} 
            event={event} 
            onPress={() => router.push(`/events/${event.id}`)}
          />
        ))}
      </ScrollView>

      <SectionHeader
        title="Top Speakers"
        actionText="View all"
        onActionPress={() => router.push('/speakers')}
      />

      <View style={styles.topSpeakersContainer}>
        {topSpeakers.map(speaker => (
          <Pressable
            key={speaker.id}
            style={[
              styles.speakerCard,
              { 
                backgroundColor: isDark ? '#1C1C1E' : '#FFFFFF',
                width: isTablet ? '48%' : '100%'
              }
            ]}
            onPress={() => router.push(`/speakers/${speaker.id}`)}
          >
            <View style={styles.speakerInfo}>
              <View style={styles.speakerImagePlaceholder}>
                <Text style={styles.speakerInitials}>
                  {speaker.name.split(' ').map(n => n[0]).join('')}
                </Text>
              </View>
              <View style={styles.speakerDetails}>
                <Text 
                  style={[styles.speakerName, { color: isDark ? '#FFFFFF' : '#000000' }]}
                  numberOfLines={1}
                >
                  {speaker.name}
                </Text>
                <Text 
                  style={[styles.speakerRole, { color: isDark ? '#EBEBF5' : '#3C3C43' }]}
                  numberOfLines={1}
                >
                  {speaker.role}
                </Text>
              </View>
            </View>
            <View style={styles.speakerStats}>
              <View style={styles.speakerStat}>
                <CalendarDays size={14} color={isDark ? '#8E8E93' : '#3C3C43'} />
                <Text style={[styles.speakerStatText, { color: isDark ? '#8E8E93' : '#3C3C43' }]}>
                  {speaker.eventCount} Events
                </Text>
              </View>
              <View style={styles.speakerStat}>
                <TrendingUp size={14} color={isDark ? '#8E8E93' : '#3C3C43'} />
                <Text style={[styles.speakerStatText, { color: isDark ? '#8E8E93' : '#3C3C43' }]}>
                  {speaker.rating.toFixed(1)} Rating
                </Text>
              </View>
            </View>
          </Pressable>
        ))}
      </View>

      <SectionHeader
        title="Recent Activity"
        actionText="View all"
      />

      <View style={[
        styles.activityContainer, 
        { backgroundColor: isDark ? '#1C1C1E' : '#FFFFFF' }
      ]}>
        {[1, 2, 3].map(i => (
          <View key={i} style={styles.activityItem}>
            <View style={[
              styles.activityIconContainer,
              { backgroundColor: isDark ? '#2C2C2E' : '#F2F2F7' }
            ]}>
              <Clock size={16} color="#0A84FF" />
            </View>
            <View style={styles.activityContent}>
              <Text style={[
                styles.activityText,
                { color: isDark ? '#FFFFFF' : '#000000' }
              ]}>
                New feedback received for "Introduction to AI"
              </Text>
              <Text style={[
                styles.activityTime,
                { color: isDark ? '#8E8E93' : '#3C3C43' }
              ]}>
                2 hours ago
              </Text>
            </View>
          </View>
        ))}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    padding: 16,
    paddingTop: 20,
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: '700',
    marginBottom: 4,
  },
  headerSubtitle: {
    fontSize: 16,
    opacity: 0.7,
  },
  metricsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    padding: 8,
    justifyContent: 'space-between',
  },
  upcomingEventsContainer: {
    paddingHorizontal: 16,
    paddingBottom: 16,
  },
  topSpeakersContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    padding: 16,
    paddingTop: 0,
    justifyContent: 'space-between',
  },
  speakerCard: {
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  speakerInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  speakerImagePlaceholder: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#0A84FF',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  speakerInitials: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
  speakerDetails: {
    flex: 1,
  },
  speakerName: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 2,
  },
  speakerRole: {
    fontSize: 14,
  },
  speakerStats: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  speakerStat: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  speakerStatText: {
    fontSize: 12,
    marginLeft: 4,
  },
  activityContainer: {
    marginHorizontal: 16,
    borderRadius: 12,
    overflow: 'hidden',
    marginBottom: 16,
  },
  activityItem: {
    flexDirection: 'row',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E5EA',
  },
  activityIconContainer: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  activityContent: {
    flex: 1,
    justifyContent: 'center',
  },
  activityText: {
    fontSize: 14,
    fontWeight: '500',
    marginBottom: 4,
  },
  activityTime: {
    fontSize: 12,
  },
});