import React from 'react';
import { View, Text, StyleSheet, ScrollView, RefreshControl, useColorScheme, ActivityIndicator, Pressable } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { Users, Calendar, MessageCircle, Star, TrendingUp, Clock } from 'lucide-react-native';
import { DashboardMetricCard } from '@/components/dashboard/DashboardMetricCard';
import { useDashboard } from '@/hooks/useDashboard';

export default function DashboardScreen() {
  const insets = useSafeAreaInsets();
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';
  
  const { stats, isLoading } = useDashboard();
  const [refreshing, setRefreshing] = React.useState(false);

  const onRefresh = React.useCallback(async () => {
    setRefreshing(true);
    // The hook will automatically refetch when component remounts
    setTimeout(() => setRefreshing(false), 1000);
  }, []);

  if (isLoading && !refreshing) {
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
          Loading dashboard...
        </Text>
      </View>
    );
  }

  const metrics = [
    {
      title: 'Total Events',
      value: stats.totalEvents,
      icon: <Calendar size={24} color="#0A84FF" />,
      trend: stats.upcomingEvents > stats.pastEvents ? 15 : -5,
      onPress: () => router.push('/(tabs)/events')
    },
    {
      title: 'Speakers',
      value: stats.totalSpeakers,
      icon: <Users size={24} color="#30D158" />,
      trend: 8,
      onPress: () => router.push('/(tabs)/speakers')
    },
    {
      title: 'Feedback',
      value: stats.totalFeedbacks,
      icon: <MessageCircle size={24} color="#FF9500" />,
      trend: stats.recentActivity > 0 ? 12 : 0,
      onPress: () => router.push('/(tabs)/feedback')
    },
    {
      title: 'Avg Rating',
      value: stats.averageRating.toFixed(1),
      icon: <Star size={24} color="#FFD60A" />,
      trend: stats.averageRating > 4 ? 5 : stats.averageRating > 3 ? 0 : -3
    },
    {
      title: 'Upcoming',
      value: stats.upcomingEvents,
      icon: <Clock size={24} color="#5856D6" />,
      trend: stats.upcomingEvents > 0 ? 10 : 0
    },
    {
      title: 'Recent Activity',
      value: stats.recentActivity,
      icon: <TrendingUp size={24} color="#FF453A" />,
      trend: stats.recentActivity > 5 ? 20 : 0
    }
  ];

  return (
    <ScrollView
      style={[
        styles.container,
        { backgroundColor: isDark ? '#000000' : '#F2F2F7' }
      ]}
      contentContainerStyle={{ paddingBottom: insets.bottom + 20 }}
      refreshControl={
        <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
      }
    >
      <View style={[styles.header, { paddingTop: insets.top + 20 }]}>
        <Text style={[
          styles.title,
          { color: isDark ? '#FFFFFF' : '#000000' }
        ]}>
          Conference Dashboard
        </Text>
        <Text style={[
          styles.subtitle,
          { color: isDark ? '#EBEBF5' : '#3C3C43' }
        ]}>
          Event management overview
        </Text>
      </View>

      <View style={styles.metricsContainer}>
        {metrics.map((metric, index) => (
          <DashboardMetricCard
            key={index}
            title={metric.title}
            value={metric.value}
            icon={metric.icon}
            trend={metric.trend}
            onPress={metric.onPress}
          />
        ))}
      </View>

      {/* Categories Overview */}
      <View style={[
        styles.section,
        { backgroundColor: isDark ? '#1C1C1E' : '#FFFFFF' }
      ]}>
        <Text style={[
          styles.sectionTitle,
          { color: isDark ? '#FFFFFF' : '#000000' }
        ]}>
          Events by Category
        </Text>
        
        {Object.entries(stats.eventsByCategory).length > 0 ? (
          Object.entries(stats.eventsByCategory)
            .sort(([,a], [,b]) => b - a)
            .slice(0, 5)
            .map(([category, count]) => (
              <View key={category} style={styles.categoryRow}>
                <Text style={[
                  styles.categoryName,
                  { color: isDark ? '#EBEBF5' : '#3C3C43' }
                ]}>
                  {category}
                </Text>
                <Text style={[
                  styles.categoryCount,
                  { color: isDark ? '#FFFFFF' : '#000000' }
                ]}>
                  {count}
                </Text>
              </View>
            ))
        ) : (
          <Text style={[
            styles.noDataText,
            { color: isDark ? '#8E8E93' : '#6C6C70' }
          ]}>
            No categories available
          </Text>
        )}
      </View>

      {/* Quick Stats */}
      <View style={[
        styles.section,
        { backgroundColor: isDark ? '#1C1C1E' : '#FFFFFF' }
      ]}>
        <Text style={[
          styles.sectionTitle,
          { color: isDark ? '#FFFFFF' : '#000000' }
        ]}>
          Quick Stats
        </Text>
        
        <View style={styles.quickStatsRow}>
          <View style={styles.quickStat}>
            <Text style={[
              styles.quickStatValue,
              { color: isDark ? '#FFFFFF' : '#000000' }
            ]}>
              {stats.pastEvents}
            </Text>
            <Text style={[
              styles.quickStatLabel,
              { color: isDark ? '#8E8E93' : '#6C6C70' }
            ]}>
              Past Events
            </Text>
          </View>
          
          <View style={styles.quickStat}>
            <Text style={[
              styles.quickStatValue,
              { color: isDark ? '#FFFFFF' : '#000000' }
            ]}>
              {((stats.totalFeedbacks / stats.totalEvents || 0) * 100).toFixed(0)}%
            </Text>
            <Text style={[
              styles.quickStatLabel,
              { color: isDark ? '#8E8E93' : '#6C6C70' }
            ]}>
              Feedback Rate
            </Text>
          </View>
        </View>
      </View>
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
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    fontWeight: '500',
  },
  header: {
    paddingHorizontal: 20,
    paddingBottom: 20,
  },
  title: {
    fontSize: 34,
    fontWeight: '700',
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 16,
    fontWeight: '400',
  },
  metricsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    paddingHorizontal: 12,
    justifyContent: 'space-between',
  },
  section: {
    marginHorizontal: 20,
    marginBottom: 20,
    borderRadius: 12,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 16,
  },
  categoryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 8,
  },
  categoryName: {
    fontSize: 16,
    fontWeight: '500',
  },
  categoryCount: {
    fontSize: 16,
    fontWeight: '600',
  },
  noDataText: {
    fontSize: 14,
    fontStyle: 'italic',
    textAlign: 'center',
    paddingVertical: 20,
  },
  quickStatsRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  quickStat: {
    alignItems: 'center',
  },
  quickStatValue: {
    fontSize: 24,
    fontWeight: '700',
    marginBottom: 4,
  },
  quickStatLabel: {
    fontSize: 12,
    fontWeight: '500',
  },
});