import React from 'react';
import { View, Text, StyleSheet, Pressable, useColorScheme } from 'react-native';
import { TrendingUp, TrendingDown } from 'lucide-react-native';
import { Dimensions } from 'react-native';

const { width } = Dimensions.get('window');
const isTablet = width >= 768;

type DashboardMetricCardProps = {
  title: string;
  value: string | number;
  icon: React.ReactNode;
  trend?: number;
  onPress?: () => void;
};

export function DashboardMetricCard({ 
  title, 
  value, 
  icon, 
  trend, 
  onPress 
}: DashboardMetricCardProps) {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';
  
  return (
    <Pressable
      style={[
        styles.card,
        { 
          backgroundColor: isDark ? '#1C1C1E' : '#FFFFFF',
          width: isTablet ? '23.5%' : '48%'
        }
      ]}
      onPress={onPress}
      android_ripple={{ color: isDark ? '#333333' : '#E0E0E0' }}
    >
      <View style={styles.iconContainer}>
        {icon}
      </View>
      
      <Text
        style={[
          styles.value,
          { color: isDark ? '#FFFFFF' : '#000000' }
        ]}
        numberOfLines={1}
        adjustsFontSizeToFit
      >
        {typeof value === 'number' && value > 999 
          ? `${(value / 1000).toFixed(1)}k` 
          : value}
      </Text>
      
      <Text
        style={[
          styles.title,
          { color: isDark ? '#EBEBF5' : '#3C3C43' }
        ]}
        numberOfLines={1}
      >
        {title}
      </Text>
      
      {trend !== undefined && trend !== 0 && (
        <View style={styles.trendContainer}>
          {trend > 0 ? (
            <>
              <TrendingUp size={12} color="#30D158" />
              <Text style={[styles.trendText, styles.trendPositive]}>
                +{trend}%
              </Text>
            </>
          ) : (
            <>
              <TrendingDown size={12} color="#FF453A" />
              <Text style={[styles.trendText, styles.trendNegative]}>
                {trend}%
              </Text>
            </>
          )}
        </View>
      )}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: {
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    marginHorizontal: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
    minHeight: 120,
  },
  iconContainer: {
    marginBottom: 12,
  },
  value: {
    fontSize: 24,
    fontWeight: '700',
    marginBottom: 4,
  },
  title: {
    fontSize: 14,
    fontWeight: '500',
  },
  trendContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 8,
  },
  trendText: {
    fontSize: 12,
    fontWeight: '500',
    marginLeft: 4,
  },
  trendPositive: {
    color: '#30D158',
  },
  trendNegative: {
    color: '#FF453A',
  },
});