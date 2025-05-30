import { useState } from 'react';
import { View, Text, StyleSheet, FlatList, Pressable, useColorScheme, TextInput, ActivityIndicator } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { Search, Plus, Filter, LayoutGrid, List } from 'lucide-react-native';
import { useSpeakers } from '@/hooks/useSpeakers';
import { SpeakerCard } from '@/components/speakers/SpeakerCard';

export default function SpeakersScreen() {
  const insets = useSafeAreaInsets();
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';
  const [searchQuery, setSearchQuery] = useState('');
  const [isGridView, setIsGridView] = useState(true);
  
  const { speakers, isLoading } = useSpeakers({
    search: searchQuery,
  });

  return (
    <View style={[
      styles.container,
      { backgroundColor: isDark ? '#000000' : '#F2F2F7' }
    ]}>
      <View style={styles.header}>
        <View style={[
          styles.searchInputContainer,
          { backgroundColor: isDark ? '#1C1C1E' : '#FFFFFF' }
        ]}>
          <Search size={20} color={isDark ? '#8E8E93' : '#3C3C43'} />
          <TextInput
            style={[
              styles.searchInput,
              { color: isDark ? '#FFFFFF' : '#000000' }
            ]}
            placeholder="Search speakers..."
            placeholderTextColor={isDark ? '#8E8E93' : '#3C3C43'}
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
        </View>
        
        <Pressable
          style={[
            styles.viewToggleButton,
            { backgroundColor: isDark ? '#1C1C1E' : '#FFFFFF' }
          ]}
          onPress={() => setIsGridView(!isGridView)}
        >
          {isGridView ? (
            <LayoutGrid size={20} color={isDark ? '#FFFFFF' : '#000000'} />
          ) : (
            <List size={20} color={isDark ? '#FFFFFF' : '#000000'} />
          )}
        </Pressable>
      </View>
      
      {isLoading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#0A84FF" />
        </View>
      ) : (
        <FlatList
          data={speakers}
          renderItem={({ item }) => (
            <SpeakerCard
              speaker={{
                ...item,
                expertise: ['AI/ML', 'Cloud Computing', 'Web Development'],
                social: {
                  linkedin: 'https://linkedin.com',
                  twitter: 'https://twitter.com',
                  website: 'https://example.com',
                },
              }}
              onPress={() => router.push(`/speakers/${item.id}`)}
            />
          )}
          keyExtractor={item => item.id}
          contentContainerStyle={[
            styles.listContent,
            { paddingBottom: insets.bottom + 20 }
          ]}
          numColumns={isGridView ? 2 : 1}
          key={isGridView ? 'grid' : 'list'}
          columnWrapperStyle={isGridView ? styles.gridColumns : undefined}
          ListEmptyComponent={() => (
            <View style={styles.emptyContainer}>
              <Text style={[
                styles.emptyText,
                { color: isDark ? '#FFFFFF' : '#000000' }
              ]}>
                No speakers found
              </Text>
            </View>
          )}
        />
      )}
      
      <Pressable
        style={[
          styles.addButton,
          { bottom: insets.bottom + 16 }
        ]}
        onPress={() => router.push('/speakers/add')}
      >
        <Plus size={24} color="#FFFFFF" />
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    padding: 16,
    gap: 8,
  },
  searchInputContainer: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 10,
    paddingHorizontal: 12,
    height: 44,
  },
  searchInput: {
    flex: 1,
    marginLeft: 8,
    fontSize: 16,
  },
  viewToggleButton: {
    width: 44,
    height: 44,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  listContent: {
    padding: 16,
  },
  gridColumns: {
    justifyContent: 'space-between',
  },
  addButton: {
    position: 'absolute',
    right: 16,
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: '#0A84FF',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 4,
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