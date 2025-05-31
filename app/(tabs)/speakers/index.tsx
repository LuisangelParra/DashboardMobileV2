import { useState, useCallback, useEffect, useMemo } from 'react';
import { View, Text, StyleSheet, FlatList, Pressable, useColorScheme, TextInput, ActivityIndicator, RefreshControl, Alert, Platform, Dimensions } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { router, useLocalSearchParams } from 'expo-router';
import { useFocusEffect } from '@react-navigation/native';
import { Search, Plus, Filter, LayoutGrid, List, SortAsc, SortDesc } from 'lucide-react-native'; // ✅ AGREGAR ICONOS DE SORT
import { useSpeakers } from '@/hooks/useSpeakers';
import { SpeakerCard } from '@/components/speakers/SpeakerCard';
import Constants from 'expo-constants';

// ✅ CONSTANTES RESPONSIVAS MEJORADAS
const getScreenInfo = () => {
  const { width: screenWidth, height: screenHeight } = Dimensions.get('window');
  return {
    screenWidth,
    screenHeight,
    isTablet: screenWidth >= 768,
    isDesktop: screenWidth >= 1024,
    isSmallMobile: screenWidth < 375,
    isLandscape: screenWidth > screenHeight
  };
};

// ✅ CONFIGURACIÓN RESPONSIVA DE GRID MEJORADA
const getNumColumns = (isGridView: boolean, screenInfo: ReturnType<typeof getScreenInfo>) => {
  if (!isGridView) return 1;
  
  const { isDesktop, isTablet, isLandscape, screenWidth } = screenInfo;
  
  if (isDesktop) return 4;
  if (isTablet) {
    return isLandscape ? 4 : 3;
  }
  if (isLandscape && screenWidth >= 600) return 3;
  return 2;
};

// ✅ CONFIGURACIÓN RESPONSIVA DE PADDING
const getResponsivePadding = (screenInfo: ReturnType<typeof getScreenInfo>) => {
  const { isDesktop, isTablet, isSmallMobile } = screenInfo;
  if (isDesktop) return 24;
  if (isTablet) return 20;
  if (isSmallMobile) return 12;
  return 16;
};

const {
  UNIDB_BASE_URL,
  UNIDB_CONTRACT_KEY
} = (Constants.expoConfig!.extra as {
  UNIDB_BASE_URL: string;
  UNIDB_CONTRACT_KEY: string;
});
const BASE_URL = `${UNIDB_BASE_URL}/${UNIDB_CONTRACT_KEY}`;

// ✅ TIPOS DE ORDENAMIENTO
type SortOption = 'name' | 'company' | 'date' | 'none';
type SortDirection = 'asc' | 'desc';

export default function SpeakersScreen() {
  const { newSpeaker, updatedSpeaker, speakerId, _timestamp } = useLocalSearchParams<{ 
    newSpeaker?: string; 
    updatedSpeaker?: string;
    speakerId?: string;
    _timestamp?: string; 
  }>();
  
  const insets = useSafeAreaInsets();
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';
  
  const { speakers, isLoading, error, refetch } = useSpeakers();
  
  // ✅ ESTADO LOCAL PARA SPEAKERS OPTIMISTAS
  const [optimisticSpeakers, setOptimisticSpeakers] = useState<any[]>([]);
  const [updatedSpeakers, setUpdatedSpeakers] = useState<any[]>([]);
  const [refreshing, setRefreshing] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [deletedSpeakers, setDeletedSpeakers] = useState<string[]>([]);
  const [dimensions, setDimensions] = useState(Dimensions.get('window'));
  
  // ✅ NUEVOS ESTADOS PARA ORDENAMIENTO Y VISTA
  const [sortBy, setSortBy] = useState<SortOption>('name');
  const [sortDirection, setSortDirection] = useState<SortDirection>('asc');
  const [showFilters, setShowFilters] = useState(false);

  // ✅ CALCULAR INFO DE PANTALLA
  const screenInfo = useMemo(() => getScreenInfo(), [dimensions]);
  
  // ✅ DETERMINAR VISTA GRID INICIAL BASADA EN PANTALLA
  const [isGridView, setIsGridView] = useState(() => {
    const info = getScreenInfo();
    return info.isTablet || info.isDesktop;
  });

  // ✅ ESCUCHAR CAMBIOS DE ORIENTACIÓN/TAMAÑO MEJORADO
  useEffect(() => {
    const subscription = Dimensions.addEventListener('change', ({ window }) => {
      setDimensions(window);
      
      // ✅ AUTO-CAMBIAR A GRID EN PANTALLAS GRANDES
      const newScreenInfo = {
        ...window,
        isTablet: window.width >= 768,
        isDesktop: window.width >= 1024,
        isSmallMobile: window.width < 375,
        isLandscape: window.width > window.height
      };
      
      if (newScreenInfo.isTablet || newScreenInfo.isDesktop) {
        setIsGridView(true);
      }
    });

    return () => subscription?.remove();
  }, []);

  // ✅ CALCULAR NÚMERO DE COLUMNAS DINÁMICAMENTE
  const numColumns = useMemo(() => {
    return getNumColumns(isGridView, screenInfo);
  }, [isGridView, screenInfo]);

  // ✅ CALCULAR PADDING RESPONSIVO
  const responsivePadding = useMemo(() => {
    return getResponsivePadding(screenInfo);
  }, [screenInfo]);

  // ✅ FUNCIÓN DE ORDENAMIENTO MEJORADA
  const sortSpeakers = useCallback((speakersList: any[]) => {
    if (sortBy === 'none') return speakersList;
    
    return [...speakersList].sort((a, b) => {
      let aValue = '';
      let bValue = '';
      
      switch (sortBy) {
        case 'name':
          aValue = a.name?.toLowerCase() || '';
          bValue = b.name?.toLowerCase() || '';
          break;
        case 'company':
          aValue = a.company?.toLowerCase() || '';
          bValue = b.company?.toLowerCase() || '';
          break;
        case 'date':
          aValue = a.createdAt || a.created_at || '';
          bValue = b.createdAt || b.created_at || '';
          break;
        default:
          return 0;
      }
      
      const comparison = aValue.localeCompare(bValue);
      return sortDirection === 'asc' ? comparison : -comparison;
    });
  }, [sortBy, sortDirection]);

  // ✅ MANEJAR NUEVO SPEAKER OPTIMISTA
  useEffect(() => {
    if (newSpeaker) {
      try {
        const speakerData = JSON.parse(newSpeaker);
        console.log('🎯 Received new speaker:', speakerData.name);
        
        setOptimisticSpeakers(prev => {
          const exists = prev.some(s => s.id === speakerData.id);
          if (exists) return prev;
          return [speakerData, ...prev];
        });
        
        const timeoutId = setTimeout(() => {
          console.log('🔄 Syncing with database after optimistic add...');
          refetch();
        }, 2000);
        
        return () => clearTimeout(timeoutId);
      } catch (error) {
        console.error('❌ Error parsing new speaker:', error);
      }
    }
  }, [newSpeaker, refetch]);

  // ✅ MANEJAR SPEAKER ACTUALIZADO OPTIMISTA
  useEffect(() => {
    if (updatedSpeaker && speakerId) {
      try {
        const speakerData = JSON.parse(updatedSpeaker);
        console.log('🎯 Received updated speaker:', speakerData.name);
        
        setUpdatedSpeakers(prev => {
          const filtered = prev.filter(s => s.id !== speakerData.id);
          return [...filtered, speakerData];
        });
        
        const timeoutId = setTimeout(() => {
          console.log('🔄 Syncing with database after optimistic update...');
          refetch();
        }, 2000);
        
        return () => clearTimeout(timeoutId);
      } catch (error) {
        console.error('❌ Error parsing updated speaker:', error);
      }
    }
  }, [updatedSpeaker, speakerId, refetch]);

  // ✅ LIMPIAR SPEAKERS OPTIMISTAS CUANDO LLEGAN DATOS REALES
  useEffect(() => {
    if (speakers && speakers.length > 0 && !newSpeaker && !updatedSpeaker) {
      setOptimisticSpeakers([]);
      setUpdatedSpeakers([]);
      setDeletedSpeakers([]);
    }
  }, [speakers, newSpeaker, updatedSpeaker]);

  // ✅ COMBINAR SPEAKERS: REALES + OPTIMISTAS + ACTUALIZADOS - ELIMINADOS
  const displaySpeakers = useMemo(() => {
    let result = [...(speakers || [])];
    
    result = result.filter(speaker => !deletedSpeakers.includes(speaker.id?.toString()));
    
    updatedSpeakers.forEach(updatedSpeaker => {
      const index = result.findIndex(s => s.id === updatedSpeaker.id);
      if (index !== -1) {
        result[index] = updatedSpeaker;
      }
    });
    
    const newSpeakersToAdd = optimisticSpeakers.filter(
      speaker => !deletedSpeakers.includes(speaker.id?.toString())
    );
    result = [...newSpeakersToAdd, ...result];
    
    return result;
  }, [speakers, optimisticSpeakers, updatedSpeakers, deletedSpeakers]);

  // ✅ FILTRAR Y ORDENAR SPEAKERS
  const filteredAndSortedSpeakers = useMemo(() => {
    let filtered = displaySpeakers;
    
    // ✅ APLICAR FILTRO DE BÚSQUEDA
    if (searchQuery) {
      filtered = filtered.filter(speaker =>
        speaker.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        speaker.company?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        speaker.role?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        speaker.expertise?.some((skill: string) => 
          skill.toLowerCase().includes(searchQuery.toLowerCase())
        )
      );
    }
    
    // ✅ APLICAR ORDENAMIENTO
    return sortSpeakers(filtered);
  }, [displaySpeakers, searchQuery, sortSpeakers]);

  // ✅ MANEJAR CAMBIO DE ORDENAMIENTO
  const handleSortChange = useCallback((newSortBy: SortOption) => {
    if (sortBy === newSortBy) {
      setSortDirection(prev => prev === 'asc' ? 'desc' : 'asc');
    } else {
      setSortBy(newSortBy);
      setSortDirection('asc');
    }
  }, [sortBy]);

  // ✅ RECARGAR DATOS CUANDO LA PANTALLA RECIBE FOCUS
  useFocusEffect(
    useCallback(() => {
      if (!newSpeaker && !updatedSpeaker) {
        console.log('🎯 Speakers screen focused, refreshing data...');
        if (refetch) {
          refetch();
        }
      }
    }, [refetch, newSpeaker, updatedSpeaker])
  );

  const handleRefresh = useCallback(async () => {
    setRefreshing(true);
    setOptimisticSpeakers([]);
    setUpdatedSpeakers([]);
    setDeletedSpeakers([]);
    await refetch();
    setRefreshing(false);
  }, [refetch]);

  // ✅ FUNCIÓN PARA MANEJAR CONFIRMACIÓN MULTIPLATAFORMA
  const showDeleteConfirmation = useCallback((speakerToDelete: any, onConfirm: () => void) => {
    if (Platform.OS === 'web') {
      const confirmed = window.confirm(`Are you sure you want to delete "${speakerToDelete.name}"?`);
      if (confirmed) {
        onConfirm();
      } else {
        console.log('❌ User cancelled deletion (web)');
      }
    } else {
      Alert.alert(
        'Delete Speaker',
        `Are you sure you want to delete "${speakerToDelete.name}"?`,
        [
          { 
            text: 'Cancel', 
            style: 'cancel',
            onPress: () => {
              console.log('❌ User cancelled deletion (mobile)');
            }
          },
          { 
            text: 'Delete', 
            style: 'destructive', 
            onPress: onConfirm
          }
        ]
      );
    }
  }, []);

  // ✅ FUNCIÓN PARA MOSTRAR RESULTADO MULTIPLATAFORMA
  const showResult = useCallback((title: string, message: string) => {
    if (Platform.OS === 'web') {
      window.alert(`${title}\n\n${message}`);
    } else {
      Alert.alert(title, message, [{ text: 'OK' }]);
    }
  }, []);

  const handleSpeakerDelete = useCallback(async (speakerToDelete: any) => {
    console.log('🔥 handleSpeakerDelete STARTED');
    console.log('🆔 Speaker to delete:', JSON.stringify(speakerToDelete, null, 2));
    
    const performDeletion = async () => {
      console.log('🗑️ User confirmed deletion - STARTING ACTUAL DELETION');
      
      try {
        console.log('🗑️ Starting optimistic deletion...');
        
        const speakerIdString = speakerToDelete.id?.toString();
        console.log('📝 Speaker ID to add to deletedSpeakers:', speakerIdString);
        
        setDeletedSpeakers(prev => {
          const newDeleted = [...prev, speakerIdString];
          console.log('📝 deletedSpeakers updated from:', prev, 'to:', newDeleted);
          return newDeleted;
        });
        
        showResult(
          'Speaker Deleted',
          `"${speakerToDelete.name}" has been removed from your speakers list.`
        );
        
        console.log('🔍 Fetching all speakers to find entry_id...');
        const allSpeakers = await fetch(`${BASE_URL}/data/speakers/all?format=json&t=${Date.now()}`, {
          headers: {
            'Cache-Control': 'no-cache',
            'Pragma': 'no-cache'
          }
        });
        
        if (!allSpeakers.ok) {
          throw new Error(`Failed to fetch speakers: ${allSpeakers.status}`);
        }
        
        const speakersData = await allSpeakers.json();
        console.log('📡 Fetched speakers data structure:', Object.keys(speakersData));
        
        let speakerEntryId = null;
        
        if (speakersData && Array.isArray(speakersData.data)) {
          console.log('🔍 Searching through', speakersData.data.length, 'entries');
          
          const foundEntry = speakersData.data.find((entry: any) => {
            if (entry.data) {
              const entryId = entry.data.id || entry.entry_id;
              console.log('🔍 Checking entry:', entryId, 'against target:', speakerToDelete.id);
              return String(entryId) === String(speakerToDelete.id);
            }
            return false;
          });
          
          if (foundEntry) {
            speakerEntryId = foundEntry.entry_id;
            console.log('✅ Found entry_id:', speakerEntryId);
          } else {
            console.log('❌ No matching entry found');
          }
        }
        
        if (!speakerEntryId) {
          throw new Error(`Speaker entry ID not found for speaker: ${speakerToDelete.name} (ID: ${speakerToDelete.id})`);
        }
        
        console.log('📡 Making DELETE request to:', `${BASE_URL}/data/speakers/delete/${speakerEntryId}`);
        
        const response = await fetch(`${BASE_URL}/data/speakers/delete/${speakerEntryId}`, {
          method: 'DELETE',
          headers: {
            'Content-Type': 'application/json',
          },
        });
        
        console.log('📡 Delete Response status:', response.status);
        console.log('📡 Delete Response ok:', response.ok);
        
        if (!response.ok) {
          const errorText = await response.text();
          console.error('❌ Delete Response error:', errorText);
          
          setDeletedSpeakers(prev => {
            const restored = prev.filter(id => id !== speakerIdString);
            console.log('↩️ Restoring speaker, deletedSpeakers from:', prev, 'to:', restored);
            return restored;
          });
          
          setTimeout(() => {
            showResult(
              'Delete Failed',
              `Failed to delete speaker from server (${response.status}). The speaker has been restored.`
            );
          }, 500);
          return;
        }
        
        const result = await response.json();
        console.log('✅ Speaker deleted successfully from server:', result);
        
        setTimeout(() => {
          console.log('🔄 Syncing with database after successful delete...');
          refetch();
        }, 1500);
        
      } catch (error) {
        console.error('❌ Error in delete process:', error);
        
        setDeletedSpeakers(prev => {
          const restored = prev.filter(id => id !== speakerToDelete.id?.toString());
          console.log('↩️ Error recovery, deletedSpeakers from:', prev, 'to:', restored);
          return restored;
        });
        
        setTimeout(() => {
          showResult(
            'Delete Failed',
            error instanceof Error ? error.message : 'Failed to delete speaker. Please try again.'
          );
        }, 500);
      }
    };

    showDeleteConfirmation(speakerToDelete, performDeletion);
    
    console.log('🚨 Confirmation dialog shown, waiting for user interaction...');
  }, [refetch, showDeleteConfirmation, showResult]);

  const renderSpeaker = ({ item, index }: { item: any; index: number }) => {
    const isNewOptimistic = optimisticSpeakers.some(s => s.id === item.id);
    const isUpdatedOptimistic = updatedSpeakers.some(s => s.id === item.id);
    const isBeingDeleted = deletedSpeakers.includes(item.id?.toString());
    
    return (
      <SpeakerCard
        speaker={{
          ...item,
          expertise: item.expertise || [],
          social: item.social || {},
        }}
        onPress={() => {
          if (isNewOptimistic || isUpdatedOptimistic) {
            router.push({
              pathname: '/(tabs)/speakers/[id]',
              params: { 
                id: item.id,
                optimisticData: JSON.stringify(item),
                _timestamp: Date.now().toString()
              }
            });
          } else {
            router.push(`/(tabs)/speakers/${item.id}`);
          }
        }}
        onDelete={() => handleSpeakerDelete(item)}
        isGridView={isGridView}
        isNewOptimistic={isNewOptimistic}
        isUpdatedOptimistic={isUpdatedOptimistic}
        isBeingDeleted={isBeingDeleted}
        // ✅ PASAR PROPS RESPONSIVOS
        screenWidth={dimensions.width}
        numColumns={numColumns}
      />
    );
  };

  if (isLoading && displaySpeakers.length === 0) {
    return (
      <View style={[styles.container, styles.centered, { backgroundColor: isDark ? '#000000' : '#F2F2F7' }]}>
        <ActivityIndicator size="large" color="#0A84FF" />
        <Text style={[styles.loadingText, { color: isDark ? '#FFFFFF' : '#000000' }]}>
          Loading speakers...
        </Text>
      </View>
    );
  }

  if (error && displaySpeakers.length === 0) {
    return (
      <View style={[styles.container, styles.centered, { backgroundColor: isDark ? '#000000' : '#F2F2F7' }]}>
        <Text style={[styles.errorText, { color: isDark ? '#FFFFFF' : '#000000' }]}>
          {error}
        </Text>
        <Pressable style={styles.retryButton} onPress={refetch}>
          <Text style={styles.retryButtonText}>Try Again</Text>
        </Pressable>
      </View>
    );
  }

  return (
    <View style={[styles.container, { backgroundColor: isDark ? '#000000' : '#F2F2F7' }]}>
      {/* ✅ HEADER RESPONSIVO */}
      <View style={[
        styles.header, 
        { 
          paddingTop: insets.top + (screenInfo.isSmallMobile ? 4 : 8),
          paddingHorizontal: responsivePadding,
          flexDirection: screenInfo.isSmallMobile ? 'column' : 'row',
          alignItems: screenInfo.isSmallMobile ? 'flex-start' : 'center',
          gap: screenInfo.isSmallMobile ? 8 : 0
        }
      ]}>
        <View style={[styles.headerLeft, { flex: screenInfo.isSmallMobile ? 0 : 1 }]}>
          <Text style={[
            styles.headerTitle, 
            { 
              color: isDark ? '#FFFFFF' : '#000000',
              fontSize: screenInfo.isSmallMobile ? 24 : screenInfo.isTablet ? 32 : 28
            }
          ]}>
            Speakers
          </Text>
          <Text style={[
            styles.headerSubtitle, 
            { 
              color: isDark ? '#8E8E93' : '#3C3C43',
              fontSize: screenInfo.isSmallMobile ? 12 : 14
            }
          ]}>
            {filteredAndSortedSpeakers.length} 
            {searchQuery ? ` of ${displaySpeakers.length}` : ''} speakers
            {(optimisticSpeakers.length > 0 || updatedSpeakers.length > 0 || deletedSpeakers.length > 0) && 
              ` (${optimisticSpeakers.length + updatedSpeakers.length + deletedSpeakers.length} syncing)`
            }
          </Text>
        </View>
        
        <Pressable 
          style={[
            styles.addButton,
            {
              width: screenInfo.isSmallMobile ? 40 : 44,
              height: screenInfo.isSmallMobile ? 40 : 44,
              borderRadius: screenInfo.isSmallMobile ? 20 : 22,
            }
          ]}
          onPress={() => router.push('/(tabs)/speakers/add')}
        >
          <Plus size={screenInfo.isSmallMobile ? 20 : 24} color="#FFFFFF" />
        </Pressable>
      </View>

      {/* ✅ SEARCH, FILTERS AND VIEW TOGGLE RESPONSIVO */}
      <View style={[
        styles.searchHeader,
        { 
          paddingHorizontal: responsivePadding,
          flexDirection: 'column',
          gap: 12
        }
      ]}>
        {/* ✅ PRIMERA FILA: SEARCH Y VIEW TOGGLE */}
        <View style={[
          styles.searchRow,
          { 
            flexDirection: screenInfo.isSmallMobile ? 'column' : 'row',
            gap: screenInfo.isSmallMobile ? 8 : 12
          }
        ]}>
          <View style={[
            styles.searchInputContainer,
            { 
              backgroundColor: isDark ? '#1C1C1E' : '#FFFFFF',
              flex: screenInfo.isSmallMobile ? 0 : 1,
              height: screenInfo.isSmallMobile ? 40 : 44
            }
          ]}>
            <Search size={screenInfo.isSmallMobile ? 18 : 20} color={isDark ? '#8E8E93' : '#3C3C43'} />
            <TextInput
              style={[
                styles.searchInput,
                { 
                  color: isDark ? '#FFFFFF' : '#000000',
                  fontSize: screenInfo.isSmallMobile ? 14 : 16
                }
              ]}
              placeholder="Search speakers..."
              placeholderTextColor={isDark ? '#8E8E93' : '#3C3C43'}
              value={searchQuery}
              onChangeText={setSearchQuery}
            />
            {searchQuery.length > 0 && (
              <Pressable onPress={() => setSearchQuery('')}>
                <Text style={{ color: isDark ? '#8E8E93' : '#3C3C43', fontSize: 18 }}>×</Text>
              </Pressable>
            )}
          </View>
          
          <View style={styles.headerActions}>
            {/* ✅ FILTROS BUTTON */}
            <Pressable
              style={[
                styles.actionButton,
                {
                  backgroundColor: showFilters ? '#007AFF' : (isDark ? '#1C1C1E' : '#FFFFFF'),
                  width: screenInfo.isSmallMobile ? 40 : 44,
                  height: screenInfo.isSmallMobile ? 40 : 44,
                  borderRadius: screenInfo.isSmallMobile ? 8 : 10,
                  marginRight: 8
                }
              ]}
              onPress={() => setShowFilters(!showFilters)}
            >
              <Filter 
                size={screenInfo.isSmallMobile ? 18 : 20} 
                color={showFilters ? '#FFFFFF' : (isDark ? '#FFFFFF' : '#000000')} 
              />
            </Pressable>
            
            {/* ✅ VIEW TOGGLE BUTTON */}
            <Pressable
              style={[
                styles.actionButton,
                {
                  backgroundColor: isDark ? '#1C1E2E' : '#FFFFFF',
                  width: screenInfo.isSmallMobile ? 40 : 44,
                  height: screenInfo.isSmallMobile ? 40 : 44,
                  borderRadius: screenInfo.isSmallMobile ? 8 : 10,
                }
              ]}
              onPress={() => setIsGridView(!isGridView)}
            >
              {isGridView ? (
                <List size={screenInfo.isSmallMobile ? 18 : 20} color={isDark ? '#FFFFFF' : '#000000'} />
              ) : (
                <LayoutGrid size={screenInfo.isSmallMobile ? 18 : 20} color={isDark ? '#FFFFFF' : '#000000'} />
              )}
            </Pressable>
          </View>
        </View>

        {/* ✅ SEGUNDA FILA: SORT OPTIONS (SI ESTÁN VISIBLES) */}
        {showFilters && (
          <View style={[
            styles.filtersRow,
            { 
              backgroundColor: isDark ? '#1C1C1E' : '#FFFFFF',
              borderRadius: 12,
              padding: 12
            }
          ]}>
            <Text style={[
              styles.filtersTitle,
              { 
                color: isDark ? '#FFFFFF' : '#000000',
                fontSize: screenInfo.isSmallMobile ? 14 : 16,
                marginBottom: 8
              }
            ]}>
              Sort by:
            </Text>
            <View style={[
              styles.sortButtons,
              { 
                flexDirection: screenInfo.isSmallMobile ? 'column' : 'row',
                gap: 8
              }
            ]}>
              {(['name', 'company', 'date'] as SortOption[]).map((option) => (
                <Pressable
                  key={option}
                  style={[
                    styles.sortButton,
                    {
                      backgroundColor: sortBy === option ? '#007AFF' : (isDark ? '#2C2C2E' : '#F2F2F7'),
                      paddingHorizontal: 12,
                      paddingVertical: 8,
                      borderRadius: 8,
                      flexDirection: 'row',
                      alignItems: 'center',
                      gap: 4,
                      flex: screenInfo.isSmallMobile ? 0 : 1
                    }
                  ]}
                  onPress={() => handleSortChange(option)}
                >
                  <Text style={[
                    styles.sortButtonText,
                    { 
                      color: sortBy === option ? '#FFFFFF' : (isDark ? '#FFFFFF' : '#000000'),
                      fontSize: screenInfo.isSmallMobile ? 12 : 14
                    }
                  ]}>
                    {option.charAt(0).toUpperCase() + option.slice(1)}
                  </Text>
                  {sortBy === option && (
                    sortDirection === 'asc' ? 
                      <SortAsc size={14} color="#FFFFFF" /> : 
                      <SortDesc size={14} color="#FFFFFF" />
                  )}
                </Pressable>
              ))}
            </View>
          </View>
        )}
      </View>
      
      {/* ✅ SPEAKERS LIST RESPONSIVO */}
      <FlatList
        data={filteredAndSortedSpeakers}
        renderItem={renderSpeaker}
        keyExtractor={(item, index) => `speaker-${item.id}-${index}`}
        contentContainerStyle={[
          styles.listContent,
          { 
            paddingHorizontal: responsivePadding,
            paddingBottom: insets.bottom + 80,
            paddingTop: screenInfo.isSmallMobile ? 8 : 16
          }
        ]}
        numColumns={numColumns}
        key={`${isGridView ? 'grid' : 'list'}-${numColumns}-${sortBy}-${sortDirection}`}
        refreshControl={
          <RefreshControl 
            refreshing={refreshing} 
            onRefresh={handleRefresh}
            tintColor={isDark ? '#FFFFFF' : '#000000'}
          />
        }
        ListEmptyComponent={() => (
          <View style={[
            styles.emptyContainer,
            { paddingHorizontal: responsivePadding }
          ]}>
            <Text style={[
              styles.emptyText,
              { 
                color: isDark ? '#FFFFFF' : '#000000',
                fontSize: screenInfo.isSmallMobile ? 16 : 18
              }
            ]}>
              {searchQuery ? `No speakers found for "${searchQuery}"` : 'No speakers found'}
            </Text>
            <Text style={[
              styles.emptySubText,
              { 
                color: isDark ? '#8E8E93' : '#3C3C43',
                fontSize: screenInfo.isSmallMobile ? 12 : 14
              }
            ]}>
              {searchQuery ? 'Try adjusting your search terms' : 'Add your first speaker to get started'}
            </Text>
          </View>
        )}
        // ✅ OPTIMIZACIONES PARA LISTAS GRANDES
        maxToRenderPerBatch={numColumns * 3}
        windowSize={10}
        initialNumToRender={numColumns * 2}
        removeClippedSubviews={true}
        getItemLayout={isGridView ? undefined : (data, index) => ({
          length: 80,
          offset: 80 * index,
          index
        })}
      />
    </View>
  );
}

// ✅ ESTILOS RESPONSIVOS ACTUALIZADOS
const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  centered: {
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  header: {
    justifyContent: 'space-between',
    paddingBottom: 8,
  },
  headerLeft: {},
  headerTitle: {
    fontWeight: '700',
    marginBottom: 2,
  },
  headerSubtitle: {},
  searchHeader: {
    padding: 16,
  },
  searchRow: {},
  searchInputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    borderRadius: 10,
    ...Platform.select({
      web: {
        outlineStyle: 'none',
      },
    }),
  },
  searchInput: {
    flex: 1,
    marginLeft: 8,
    ...Platform.select({
      web: {
        outlineStyle: 'none',
      },
    }),
  },
  headerActions: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  actionButton: {
    alignItems: 'center',
    justifyContent: 'center',
    ...Platform.select({
      web: {
        cursor: 'pointer',
      },
    }),
  },
  filtersRow: {},
  filtersTitle: {
    fontWeight: '600',
  },
  sortButtons: {},
  sortButton: {
    ...Platform.select({
      web: {
        cursor: 'pointer',
      },
    }),
  },
  sortButtonText: {
    fontWeight: '500',
  },
  listContent: {
    flexGrow: 1,
  },
  addButton: {
    backgroundColor: '#007AFF',
    alignItems: 'center',
    justifyContent: 'center',
    ...Platform.select({
      web: {
        cursor: 'pointer',
      },
    }),
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 64,
  },
  emptyText: {
    fontWeight: '600',
    marginBottom: 8,
    textAlign: 'center',
  },
  emptySubText: {
    textAlign: 'center',
    lineHeight: 20,
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
  },
  errorText: {
    fontSize: 16,
    textAlign: 'center',
    marginBottom: 16,
  },
  retryButton: {
    backgroundColor: '#007AFF',
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 8,
    ...Platform.select({
      web: {
        cursor: 'pointer',
      },
    }),
  },
  retryButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
});