import React from 'react';
import { View, Text, StyleSheet, ScrollView, useColorScheme } from 'react-native';
import { Users, Calendar, TrendingUp } from 'lucide-react-native';
import { EventSubscription } from '@/hooks/useDashboard';

type SubscriptionsTableProps = {
  subscriptions: EventSubscription[];
  isLoading?: boolean;
};

export function SubscriptionsTable({ subscriptions, isLoading = false }: SubscriptionsTableProps) {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';

  const getStatusColor = (status: EventSubscription['status']) => {
    switch (status) {
      case 'full': return '#FF453A';
      case 'almost-full': return '#FF9500';
      case 'available': return '#32D74B';
      default: return '#8E8E93';
    }
  };

  const getStatusText = (status: EventSubscription['status']) => {
    switch (status) {
      case 'full': return 'Lleno';
      case 'almost-full': return 'Casi lleno';
      case 'available': return 'Disponible';
      default: return 'N/A';
    }
  };

  const formatDate = (dateString: string) => {
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString('es-ES', {
        day: '2-digit',
        month: 'short'
      });
    } catch {
      return 'N/A';
    }
  };

  if (isLoading) {
    return (
      <View style={[
        styles.container,
        { backgroundColor: isDark ? '#1C1C1E' : '#FFFFFF' }
      ]}>
        <View style={styles.header}>
          <Users size={20} color="#0A84FF" />
          <Text style={[
            styles.title,
            { color: isDark ? '#FFFFFF' : '#000000' }
          ]}>
            Suscripciones por Evento
          </Text>
        </View>
        <View style={styles.loadingContainer}>
          <Text style={[
            styles.loadingText,
            { color: isDark ? '#8E8E93' : '#6C6C70' }
          ]}>
            Cargando datos...
          </Text>
        </View>
      </View>
    );
  }

  if (subscriptions.length === 0) {
    return (
      <View style={[
        styles.container,
        { backgroundColor: isDark ? '#1C1C1E' : '#FFFFFF' }
      ]}>
        <View style={styles.header}>
          <Users size={20} color="#0A84FF" />
          <Text style={[
            styles.title,
            { color: isDark ? '#FFFFFF' : '#000000' }
          ]}>
            Suscripciones por Evento
          </Text>
        </View>
        <View style={styles.emptyContainer}>
          <Text style={[
            styles.emptyText,
            { color: isDark ? '#8E8E93' : '#6C6C70' }
          ]}>
            No hay eventos disponibles
          </Text>
        </View>
      </View>
    );
  }

  return (
    <View style={[
      styles.container,
      { backgroundColor: isDark ? '#1C1C1E' : '#FFFFFF' }
    ]}>
      {/* Header */}
      <View style={styles.header}>
        <Users size={20} color="#0A84FF" />
        <Text style={[
          styles.title,
          { color: isDark ? '#FFFFFF' : '#000000' }
        ]}>
          Suscripciones por Evento
        </Text>
        <TrendingUp size={16} color="#32D74B" />
      </View>

      {/* Content - Always use card layout for better mobile support */}
      <ScrollView 
        style={styles.content} 
        showsVerticalScrollIndicator={false}
        nestedScrollEnabled={true}
      >
        {subscriptions.slice(0, 8).map((subscription, index) => (
          <View
            key={`subscription-${subscription.id}-${index}`}
            style={[
              styles.eventCard,
              { 
                backgroundColor: isDark ? 'rgba(255, 255, 255, 0.05)' : 'rgba(0, 0, 0, 0.02)',
                borderBottomColor: isDark ? '#3A3A3C' : '#E5E5EA'
              }
            ]}
          >
            {/* Event Info Row */}
            <View style={styles.eventInfo}>
              <View style={styles.eventNameSection}>
                <Text
                  style={[
                    styles.eventName,
                    { color: isDark ? '#FFFFFF' : '#000000' }
                  ]}
                  numberOfLines={2}
                >
                  {subscription.name}
                </Text>
                <View style={styles.dateSection}>
                  <Calendar size={12} color={isDark ? '#8E8E93' : '#6C6C70'} />
                  <Text style={[
                    styles.dateText,
                    { color: isDark ? '#8E8E93' : '#6C6C70' }
                  ]}>
                    {formatDate(subscription.date)}
                  </Text>
                </View>
              </View>
            </View>

            {/* Stats Row */}
            <View style={styles.statsRow}>
              {/* Subscribers */}
              <View style={styles.statItem}>
                <Text style={[
                  styles.statValue,
                  { color: isDark ? '#FFFFFF' : '#000000' }
                ]}>
                  {subscription.subscribers}
                </Text>
                <Text style={[
                  styles.statLabel,
                  { color: isDark ? '#8E8E93' : '#6C6C70' }
                ]}>
                  suscritos
                </Text>
              </View>

              {/* Capacity */}
              <View style={styles.statItem}>
                <Text style={[
                  styles.statValue,
                  { color: isDark ? '#FFFFFF' : '#000000' }
                ]}>
                  {subscription.maxParticipants || 'N/A'}
                </Text>
                <Text style={[
                  styles.statLabel,
                  { color: isDark ? '#8E8E93' : '#6C6C70' }
                ]}>
                  capacidad
                </Text>
              </View>

              {/* Percentage */}
              <View style={styles.statItem}>
                <Text style={[
                  styles.statValue,
                  { color: getStatusColor(subscription.status) }
                ]}>
                  {subscription.occupancyRate}%
                </Text>
                <Text style={[
                  styles.statLabel,
                  { color: isDark ? '#8E8E93' : '#6C6C70' }
                ]}>
                  ocupación
                </Text>
              </View>

              {/* Status */}
              <View style={styles.statusSection}>
                <View style={[
                  styles.statusBadge,
                  { backgroundColor: `${getStatusColor(subscription.status)}20` }
                ]}>
                  <Text style={[
                    styles.statusText,
                    { color: getStatusColor(subscription.status) }
                  ]}>
                    {getStatusText(subscription.status)}
                  </Text>
                </View>
              </View>
            </View>
          </View>
        ))}
      </ScrollView>

      {/* Summary */}
      <View style={[
        styles.summary,
        { borderTopColor: isDark ? '#48484A' : '#E5E5EA' }
      ]}>
        <Text style={[
          styles.summaryText,
          { color: isDark ? '#8E8E93' : '#6C6C70' }
        ]}>
          Total suscripciones: {subscriptions.reduce((sum, event) => sum + event.subscribers, 0)}
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    borderRadius: 12,
    marginHorizontal: 20,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
    maxHeight: 400,
    minHeight: 200,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    gap: 8,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(0, 0, 0, 0.1)',
  },
  title: {
    fontSize: 18,
    fontWeight: '600',
    flex: 1,
  },
  content: {
    flex: 1,
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  eventCard: {
    paddingVertical: 12,
    paddingHorizontal: 8,
    marginVertical: 4,
    borderRadius: 8,
    borderBottomWidth: 1,
  },
  eventInfo: {
    marginBottom: 8,
  },
  eventNameSection: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  eventName: {
    fontSize: 14,
    fontWeight: '600',
    flex: 1,
    marginRight: 12,
    lineHeight: 18,
  },
  dateSection: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginTop: 2,
  },
  dateText: {
    fontSize: 11,
    fontWeight: '500',
  },
  statsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: 4,
  },
  statItem: {
    alignItems: 'center',
    flex: 1,
  },
  statValue: {
    fontSize: 16,
    fontWeight: '700',
    marginBottom: 2,
  },
  statLabel: {
    fontSize: 10,
    fontWeight: '500',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  statusSection: {
    flex: 1,
    alignItems: 'center',
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 10,
    minWidth: 60,
    alignItems: 'center',
  },
  statusText: {
    fontSize: 9,
    fontWeight: '700',
    textTransform: 'uppercase',
    textAlign: 'center',
  },
  summary: {
    borderTopWidth: 1,
    padding: 12,
    alignItems: 'center',
  },
  summaryText: {
    fontSize: 12,
    fontWeight: '500',
  },
  loadingContainer: {
    padding: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  loadingText: {
    fontSize: 14,
  },
  emptyContainer: {
    padding: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  emptyText: {
    fontSize: 14,
    textAlign: 'center',
  },
});