import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Star, Calendar } from 'lucide-react-native';
import { Feedback } from '@/types';

type FeedbackCardProps = {
  feedback: Feedback;
  isDark: boolean;
  showEvent?: boolean;
};

export function FeedbackCard({ feedback, isDark, showEvent = false }: FeedbackCardProps) {
  return (
    <View
      style={[
        styles.container,
        { backgroundColor: isDark ? '#1C1C1E' : '#FFFFFF' }
      ]}
    >
      {showEvent && (
        <Text
          style={[
            styles.eventName,
            { color: isDark ? '#0A84FF' : '#0A84FF' }
          ]}
          numberOfLines={1}
        >
          {feedback.eventName}
        </Text>
      )}
      
      <View style={styles.ratingContainer}>
        <View style={styles.ratingStars}>
          {[1, 2, 3, 4, 5].map(star => (
            <Star
              key={star}
              size={16}
              color={star <= feedback.rating ? '#FF9500' : isDark ? '#48484A' : '#E5E5EA'}
              fill={star <= feedback.rating ? '#FF9500' : 'none'}
            />
          ))}
        </View>
        
        <View style={styles.dateContainer}>
          <Calendar size={12} color={isDark ? '#8E8E93' : '#3C3C43'} />
          <Text
            style={[
              styles.dateText,
              { color: isDark ? '#8E8E93' : '#3C3C43' }
            ]}
          >
            {feedback.date}
          </Text>
        </View>
      </View>
      
      <Text
        style={[
          styles.comment,
          { color: isDark ? '#EBEBF5' : '#3C3C43' }
        ]}
      >
        {feedback.comment}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  eventName: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 8,
  },
  ratingContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  ratingStars: {
    flexDirection: 'row',
    gap: 2,
  },
  dateContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  dateText: {
    fontSize: 12,
    marginLeft: 4,
  },
  comment: {
    fontSize: 14,
    lineHeight: 20,
  },
});