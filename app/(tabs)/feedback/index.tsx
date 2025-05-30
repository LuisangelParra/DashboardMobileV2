import { useState } from 'react';
import { View, Text, StyleSheet, FlatList, Pressable, useColorScheme, ActivityIndicator, TouchableOpacity } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Filter, SlidersHorizontal, ArrowUp, ArrowDown } from 'lucide-react-native';
import { useFeedback } from '@/hooks/useFeedback';
import { FeedbackCard } from '@/components/feedback/FeedbackCard';

export default function FeedbackScreen() {
  const insets = useSafeAreaInsets();
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';
  const [showFilters, setShowFilters] = useState(false);
  const [sortBy, setSortBy] = useState('date');
  const [sortOrder, setSortOrder] = useState('desc');
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [ratingFilter, setRatingFilter] = useState(null);
  
  const { feedback, events, isLoading } = useFeedback({
    sortBy,
    sortOrder,
    eventId: selectedEvent,
    rating: ratingFilter,
  });

  const toggleSortOrder = () => {
    setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
  };

  const renderFeedbackItem = ({ item }) => (
    <FeedbackCard feedback={item} isDark={isDark} showEvent />
  );

  return (
    <View style={[
      styles.container,
      { backgroundColor: isDark ? '#000000' : '#F2F2F7' }
    ]}>
      <View style={styles.filterContainer}>
        <Pressable
          style={[
            styles.filterButton,
            { backgroundColor: isDark ? '#1C1C1E' : '#FFFFFF' }
          ]}
          onPress={() => setShowFilters(!showFilters)}
        >
          <Filter size={18} color={isDark ? '#FFFFFF' : '#000000'} />
          <Text style={[
            styles.filterButtonText,
            { color: isDark ? '#FFFFFF' : '#000000' }
          ]}>
            Filters
          </Text>
        </Pressable>
        
        <Pressable
          style={[
            styles.sortButton,
            { backgroundColor: isDark ? '#1C1C1E' : '#FFFFFF' }
          ]}
          onPress={toggleSortOrder}
        >
          {sortOrder === 'desc' ? (
            <ArrowDown size={18} color={isDark ? '#FFFFFF' : '#000000'} />
          ) : (
            <ArrowUp size={18} color={isDark ? '#FFFFFF' : '#000000'} />
          )}
        </Pressable>
      </View>
      
      {showFilters && (
        <View style={[
          styles.filtersPanel,
          { backgroundColor: isDark ? '#1C1C1E' : '#FFFFFF' }
        ]}>
          <View style={styles.filterSection}>
            <Text style={[
              styles.filterSectionTitle,
              { color: isDark ? '#FFFFFF' : '#000000' }
            ]}>
              Sort By
            </Text>
            <View style={styles.filterOptions}>
              <TouchableOpacity
                style={[
                  styles.filterOption,
                  sortBy === 'date' && styles.filterOptionSelected
                ]}
                onPress={() => setSortBy('date')}
              >
                <Text style={[
                  styles.filterOptionText,
                  sortBy === 'date' && styles.filterOptionTextSelected
                ]}>
                  Date
                </Text>
              </TouchableOpacity>
              
              <TouchableOpacity
                style={[
                  styles.filterOption,
                  sortBy === 'rating' && styles.filterOptionSelected
                ]}
                onPress={() => setSortBy('rating')}
              >
                <Text style={[
                  styles.filterOptionText,
                  sortBy === 'rating' && styles.filterOptionTextSelected
                ]}>
                  Rating
                </Text>
              </TouchableOpacity>
            </View>
          </View>
          
          <View style={styles.filterSection}>
            <Text style={[
              styles.filterSectionTitle,
              { color: isDark ? '#FFFFFF' : '#000000' }
            ]}>
              Filter by Rating
            </Text>
            <View style={styles.filterOptions}>
              {[null, 5, 4, 3, 2, 1].map((rating) => (
                <TouchableOpacity
                  key={rating === null ? 'all' : rating}
                  style={[
                    styles.filterOption,
                    ratingFilter === rating && styles.filterOptionSelected
                  ]}
                  onPress={() => setRatingFilter(rating)}
                >
                  <Text style={[
                    styles.filterOptionText,
                    ratingFilter === rating && styles.filterOptionTextSelected
                  ]}>
                    {rating === null ? 'All' : `${rating} ★`}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>
          
          <View style={styles.filterSection}>
            <Text style={[
              styles.filterSectionTitle,
              { color: isDark ? '#FFFFFF' : '#000000' }
            ]}>
              Filter by Event
            </Text>
            <View style={styles.filterOptions}>
              <TouchableOpacity
                style={[
                  styles.filterOption,
                  selectedEvent === null && styles.filterOptionSelected
                ]}
                onPress={() => setSelectedEvent(null)}
              >
                <Text style={[
                  styles.filterOptionText,
                  selectedEvent === null && styles.filterOptionTextSelected
                ]}>
                  All Events
                </Text>
              </TouchableOpacity>
              
              {events.map(event => (
                <TouchableOpacity
                  key={event.id}
                  style={[
                    styles.filterOption,
                    selectedEvent === event.id && styles.filterOptionSelected
                  ]}
                  onPress={() => setSelectedEvent(event.id)}
                >
                  <Text style={[
                    styles.filterOptionText,
                    selectedEvent === event.id && styles.filterOptionTextSelected
                  ]}>
                    {event.name}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>
          
          <Pressable
            style={styles.clearFiltersButton}
            onPress={() => {
              setRatingFilter(null);
              setSelectedEvent(null);
              setSortBy('date');
              setSortOrder('desc');
            }}
          >
            <Text style={styles.clearFiltersText}>
              Clear All Filters
            </Text>
          </Pressable>
        </View>
      )}
      
      {isLoading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#0A84FF" />
        </View>
      ) : (
        <FlatList
          data={feedback}
          renderItem={renderFeedbackItem}
          keyExtractor={item => item.id}
          contentContainerStyle={[
            styles.listContent,
            { paddingBottom: insets.bottom + 20 }
          ]}
          ListEmptyComponent={() => (
            <View style={styles.emptyContainer}>
              <Text style={[
                styles.emptyText,
                { color: isDark ? '#FFFFFF' : '#000000' }
              ]}>
                No feedback found
              </Text>
            </View>
          )}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  filterContainer: {
    flexDirection: 'row',
    padding: 16,
    gap: 8,
  },
  filterButton: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 10,
    paddingHorizontal: 12,
    height: 44,
    paddingRight: 16,
  },
  filterButtonText: {
    marginLeft: 8,
    fontSize: 16,
    fontWeight: '500',
  },
  sortButton: {
    width: 44,
    height: 44,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  filtersPanel: {
    marginHorizontal: 16,
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
  },
  filterSection: {
    marginBottom: 16,
  },
  filterSectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 8,
  },
  filterOptions: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  filterOption: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    backgroundColor: '#3C3C4320',
  },
  filterOptionSelected: {
    backgroundColor: '#0A84FF',
  },
  filterOptionText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#3C3C43',
  },
  filterOptionTextSelected: {
    color: '#FFFFFF',
  },
  clearFiltersButton: {
    alignItems: 'center',
    padding: 12,
  },
  clearFiltersText: {
    color: '#0A84FF',
    fontSize: 14,
    fontWeight: '600',
  },
  listContent: {
    padding: 16,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 32,
  },
  emptyText: {
    fontSize: 16,
    textAlign: 'center',
  },
});