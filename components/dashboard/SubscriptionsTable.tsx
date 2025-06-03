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

      {/* Header de tabla */}
      <View style={[
        styles.tableHeader,
        { borderBottomColor: isDark ? '#48484A' : '#E5E5EA' }
      ]}>
        <Text style={[
          styles.tableHeaderText,
          { color: isDark ? '#8E8E93' : '#6C6C70', flex: 2 }
        ]}>
          Evento
        </Text>
        <Text style={[
          styles.tableHeaderText,
          { color: isDark ? '#8E8E93' : '#6C6C70', flex: 1, textAlign: 'center' }
        ]}>
          Suscriptores
        </Text>
        <Text style={[
          styles.tableHeaderText,
          { color: isDark ? '#8E8E93' : '#6C6C70', flex: 1, textAlign: 'center' }
        ]}>
          Estado
        </Text>
        <Text style={[
          styles.tableHeaderText,
          { color: isDark ? '#8E8E93' : '#6C6C70', flex: 0.8, textAlign: 'center' }
        ]}>
          Fecha
        </Text>
      </View>

      {/* Contenido de tabla */}
      <ScrollView style={styles.tableContent} showsVerticalScrollIndicator={false}>
        {subscriptions.slice(0, 10).map((subscription, index) => (
          <View
            key={subscription.id}
            style={[
              styles.tableRow,
              index % 2 === 0 && {
                backgroundColor: isDark ? 'rgba(255, 255, 255, 0.02)' : 'rgba(0, 0, 0, 0.02)'
              }
            ]}
          >
            {/* Nombre del evento */}
            <View style={{ flex: 2 }}>
              <Text
                style={[
                  styles.eventName,
                  { color: isDark ? '#FFFFFF' : '#000000' }
                ]}
                numberOfLines={1}
              >
                {subscription.name}
              </Text>
              {subscription.maxParticipants > 0 && (
                <Text style={[
                  styles.capacityText,
                  { color: isDark ? '#8E8E93' : '#6C6C70' }
                ]}>
                  Capacidad: {subscription.maxParticipants}
                </Text>
              )}
            </View>

            {/* Número de suscriptores */}
            <View style={{ flex: 1, alignItems: 'center' }}>
              <Text style={[
                styles.subscribersCount,
                { color: isDark ? '#FFFFFF' : '#000000' }
              ]}>
                {subscription.subscribers}
              </Text>
              {subscription.maxParticipants > 0 && (
                <Text style={[
                  styles.percentageText,
                  { color: getStatusColor(subscription.status) }
                ]}>
                  {subscription.occupancyRate}%
                </Text>
              )}
            </View>

            {/* Estado */}
            <View style={{ flex: 1, alignItems: 'center' }}>
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

            {/* Fecha */}
            <View style={{ flex: 0.8, alignItems: 'center' }}>
              <Calendar size={12} color={isDark ? '#8E8E93' : '#6C6C70'} />
              <Text style={[
                styles.dateText,
                { color: isDark ? '#8E8E93' : '#6C6C70' }
              ]}>
                {formatDate(subscription.date)}
              </Text>
            </View>
          </View>
        ))}
      </ScrollView>

      {/* Resumen al final */}
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
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    gap: 8,
  },
  title: {
    fontSize: 18,
    fontWeight: '600',
    flex: 1,
  },
  tableHeader: {
    flexDirection: 'row',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderBottomWidth: 1,
  },
  tableHeaderText: {
    fontSize: 12,
    fontWeight: '600',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  tableContent: {
    flex: 1,
  },
  tableRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 16,
    minHeight: 60,
  },
  eventName: {
    fontSize: 14,
    fontWeight: '500',
    marginBottom: 2,
  },
  capacityText: {
    fontSize: 11,
  },
  subscribersCount: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 2,
  },
  percentageText: {
    fontSize: 11,
    fontWeight: '500',
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  statusText: {
    fontSize: 11,
    fontWeight: '600',
    textTransform: 'uppercase',
  },
  dateText: {
    fontSize: 10,
    marginTop: 2,
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
  },
  loadingText: {
    fontSize: 14,
  },
  emptyContainer: {
    padding: 40,
    alignItems: 'center',
  },
  emptyText: {
    fontSize: 14,
    textAlign: 'center',
  },
});