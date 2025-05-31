import { useState, useCallback, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, Pressable, useColorScheme, ActivityIndicator, Linking, Platform, Dimensions } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { router, useLocalSearchParams } from 'expo-router';
import { useFocusEffect } from '@react-navigation/native';
import { Linkedin, Twitter, Globe, Calendar, Star, TrendingUp, ChevronLeft, Share, Edit2, Mail, Phone } from 'lucide-react-native';
import { useSpeaker } from '@/hooks/useSpeaker';

export default function SpeakerDetailScreen() {
  const { id, optimisticData, updatedName, _timestamp } = useLocalSearchParams<{ 
    id: string; 
    optimisticData?: string; // ✅ SOPORTE PARA DATOS OPTIMISTAS COMPLETOS
    updatedName?: string; 
    _timestamp?: string; 
  }>();
  
  const insets = useSafeAreaInsets();
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';
  
  // ✅ DETECTAR TAMAÑO DE PANTALLA PARA RESPONSIVIDAD
  const { width: screenWidth } = Dimensions.get('window');
  const isTablet = screenWidth >= 768;
  const isDesktop = screenWidth >= 1024;
  const isSmallMobile = screenWidth < 375;
  
  const { speaker, events, isLoading, error, refetch } = useSpeaker(id);
  
  // ✅ ESTADO LOCAL PARA DATOS OPTIMISTAS MEJORADO
  const [optimisticSpeaker, setOptimisticSpeaker] = useState<any>(null);
  const [isOptimistic, setIsOptimistic] = useState(false);
  
  // Protección contra arrays undefined/null
  const safeEvents = events || [];

  // ✅ MANEJAR DATOS OPTIMISTAS COMPLETOS (DESDE NUEVA CREACIÓN)
  useEffect(() => {
    if (optimisticData) {
      try {
        const parsedData = JSON.parse(optimisticData);
        console.log('🎯 Received optimistic data:', parsedData.name);
        setOptimisticSpeaker(parsedData);
        setIsOptimistic(true);
        
        // ✅ SYNC CON DB DESPUÉS DE UN DELAY
        const timeoutId = setTimeout(() => {
          console.log('🔄 Syncing with database after optimistic creation...');
          refetch();
          setIsOptimistic(false);
        }, 2500);
        
        return () => clearTimeout(timeoutId);
      } catch (error) {
        console.error('❌ Error parsing optimistic data:', error);
      }
    }
  }, [optimisticData, refetch]);

  // ✅ MANEJAR DATOS OPTIMISTAS DE EDICIÓN
  useEffect(() => {
    if (updatedName && speaker) {
      console.log('🎯 Received updated name:', updatedName);
      setOptimisticSpeaker({
        ...speaker,
        name: updatedName
      });
      setIsOptimistic(true);
      
      // ✅ SYNC CON DB DESPUÉS DE UN DELAY
      const timeoutId = setTimeout(() => {
        console.log('🔄 Syncing with database after optimistic update...');
        refetch();
        setIsOptimistic(false);
      }, 2000);
      
      return () => clearTimeout(timeoutId);
    }
  }, [updatedName, speaker, refetch]);

  // ✅ ACTUALIZAR DATOS OPTIMISTAS CUANDO LLEGAN DATOS REALES
  useEffect(() => {
    if (speaker && !updatedName && !optimisticData) {
      setOptimisticSpeaker(speaker);
      setIsOptimistic(false);
    }
  }, [speaker, updatedName, optimisticData]);

  // ✅ RECARGAR DATOS CUANDO LA PANTALLA RECIBE FOCUS
  useFocusEffect(
    useCallback(() => {
      if (!updatedName && !optimisticData) {
        console.log('🎯 Speaker detail screen focused, refreshing data for ID:', id);
        if (refetch) {
          refetch();
        }
      }
    }, [refetch, id, updatedName, optimisticData])
  );

  // ✅ USAR DATOS OPTIMISTAS O REALES
  const displaySpeaker = optimisticSpeaker || speaker;

  // ✅ FUNCIÓN PARA COMPARTIR SPEAKER
  const handleShare = async () => {
    if (!displaySpeaker) return;
    
    const shareText = `Check out ${displaySpeaker.name}${displaySpeaker.company ? ` from ${displaySpeaker.company}` : ''}`;
    
    if (Platform.OS === 'web') {
      if (navigator.share) {
        try {
          await navigator.share({
            title: `Speaker: ${displaySpeaker.name}`,
            text: shareText,
            url: window.location.href,
          });
        } catch (error) {
          // Fallback: copy to clipboard
          navigator.clipboard?.writeText(`${shareText}\n${window.location.href}`);
        }
      } else {
        // Fallback: copy to clipboard
        navigator.clipboard?.writeText(`${shareText}\n${window.location.href}`);
      }
    }
  };

  console.log('🔍 SpeakerDetailScreen - ID:', id, 'Loading:', isLoading, 'Speaker:', displaySpeaker?.name, 'Error:', error, 'Optimistic:', isOptimistic);

  if (isLoading && !displaySpeaker) {
    return (
      <View style={[
        styles.loadingContainer,
        { backgroundColor: isDark ? '#000000' : '#F2F2F7' }
      ]}>
        <ActivityIndicator size="large" color="#0A84FF" />
        <Text style={[
          styles.loadingText, 
          { 
            color: isDark ? '#FFFFFF' : '#000000',
            fontSize: isSmallMobile ? 14 : 16
          }
        ]}>
          Loading speaker...
        </Text>
      </View>
    );
  }

  if ((error || !displaySpeaker) && !isOptimistic) {
    return (
      <View style={[
        styles.errorContainer,
        { backgroundColor: isDark ? '#000000' : '#F2F2F7' }
      ]}>
        <Text style={[
          styles.errorText, 
          { 
            color: isDark ? '#FFFFFF' : '#000000',
            fontSize: isSmallMobile ? 14 : 16
          }
        ]}>
          {error || 'Speaker not found'}
        </Text>
        <Text style={[
          styles.debugText, 
          { 
            color: isDark ? '#8E8E93' : '#666666',
            fontSize: isSmallMobile ? 10 : 12
          }
        ]}>
          Searching for speaker ID: {id}
        </Text>
        <Pressable 
          style={[
            styles.retryButton,
            { 
              paddingHorizontal: isSmallMobile ? 16 : 20,
              paddingVertical: isSmallMobile ? 10 : 12
            }
          ]}
          onPress={() => {
            console.log('🔄 Manual retry for speaker ID:', id);
            refetch();
          }}
        >
          <Text style={[
            styles.retryButtonText,
            { fontSize: isSmallMobile ? 14 : 16 }
          ]}>
            Retry
          </Text>
        </Pressable>
        <Pressable 
          style={styles.backButton} 
          onPress={() => router.back()}
        >
          <Text style={[
            styles.backButtonText,
            { fontSize: isSmallMobile ? 14 : 16 }
          ]}>
            Go Back
          </Text>
        </Pressable>
      </View>
    );
  }

  return (
    <View style={[
      styles.container,
      { backgroundColor: isDark ? '#000000' : '#F2F2F7' }
    ]}>
      {/* ✅ HEADER RESPONSIVO MEJORADO */}
      <View style={[
        styles.header, 
        { 
          paddingTop: insets.top + (isSmallMobile ? 4 : 8),
          paddingHorizontal: isSmallMobile ? 12 : 16
        }
      ]}>
        <Pressable 
          style={[
            styles.headerButton,
            { 
              width: isSmallMobile ? 36 : 40,
              height: isSmallMobile ? 36 : 40
            }
          ]} 
          onPress={() => router.back()}
        >
          <ChevronLeft size={isSmallMobile ? 20 : 24} color={isDark ? '#FFFFFF' : '#000000'} />
        </Pressable>
        
        <Text style={[
          styles.headerTitle, 
          { 
            color: isDark ? '#FFFFFF' : '#000000',
            fontSize: isSmallMobile ? 18 : isTablet ? 24 : 20
          }
        ]}>
          Speaker Details
        </Text>
        
        <View style={styles.headerActions}>
          {/* ✅ BOTÓN COMPARTIR */}
          <Pressable 
            style={[
              styles.headerActionButton,
              { 
                width: isSmallMobile ? 36 : 40,
                height: isSmallMobile ? 36 : 40,
                marginRight: 8
              }
            ]}
            onPress={handleShare}
          >
            <Share size={isSmallMobile ? 18 : 20} color="#007AFF" />
          </Pressable>
          
          {/* ✅ BOTÓN EDITAR MEJORADO */}
          <Pressable 
            style={[
              styles.headerActionButton,
              { 
                backgroundColor: '#007AFF',
                width: isSmallMobile ? 36 : 40,
                height: isSmallMobile ? 36 : 40,
                borderRadius: isSmallMobile ? 18 : 20
              }
            ]}
            onPress={() => router.push(`/(tabs)/speakers/edit/${id}`)}
          >
            <Edit2 size={isSmallMobile ? 16 : 18} color="#FFFFFF" />
          </Pressable>
        </View>
      </View>

      <ScrollView 
        style={styles.content}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ 
          paddingBottom: insets.bottom + 20,
          paddingHorizontal: isSmallMobile ? 12 : 16
        }}
      >
        {/* ✅ SPEAKER INFO CARD RESPONSIVO */}
        <View style={[
          styles.speakerCard,
          { 
            backgroundColor: isDark ? '#1C1C1E' : '#FFFFFF',
            borderRadius: isSmallMobile ? 12 : 16,
            padding: isSmallMobile ? 16 : isTablet ? 28 : 24,
            marginBottom: isSmallMobile ? 12 : 16
          }
        ]}>
          {/* ✅ BANNER OPTIMISTA MEJORADO */}
          {isOptimistic && (
            <View style={[
              styles.optimisticBanner, 
              { 
                backgroundColor: 'rgba(0, 122, 255, 0.1)',
                borderRadius: isSmallMobile ? 8 : 10,
                padding: isSmallMobile ? 10 : 12,
                marginBottom: isSmallMobile ? 12 : 16
              }
            ]}>
              <Text style={[
                styles.optimisticText, 
                { 
                  color: '#007AFF',
                  fontSize: isSmallMobile ? 12 : 14
                }
              ]}>
                {optimisticData ? '✨ New speaker! Syncing with database...' : '⚡ Updated! Syncing with database...'}
              </Text>
            </View>
          )}

          {/* ✅ PROFILE SECTION RESPONSIVO */}
          <View style={[
            styles.profileSection,
            {
              flexDirection: isSmallMobile ? 'column' : 'row',
              alignItems: isSmallMobile ? 'center' : 'center',
              marginBottom: isSmallMobile ? 20 : 24
            }
          ]}>
            <View style={[
              styles.avatarContainer,
              { 
                backgroundColor: isDark ? '#2C2C2E' : '#F2F2F7',
                width: isSmallMobile ? 70 : isTablet ? 100 : 80,
                height: isSmallMobile ? 70 : isTablet ? 100 : 80,
                borderRadius: isSmallMobile ? 35 : isTablet ? 50 : 40,
                marginRight: isSmallMobile ? 0 : 16,
                marginBottom: isSmallMobile ? 16 : 0,
                // ✅ SOMBRA ELEGANTE
                shadowColor: '#000',
                shadowOffset: { width: 0, height: 4 },
                shadowOpacity: 0.1,
                shadowRadius: 8,
                elevation: 4,
              }
            ]}>
              <Text style={[
                styles.avatarText,
                { 
                  color: isDark ? '#FFFFFF' : '#000000',
                  fontSize: isSmallMobile ? 28 : isTablet ? 40 : 32
                }
              ]}>
                {displaySpeaker?.name?.charAt(0)?.toUpperCase() || 'S'}
              </Text>
            </View>
            
            <View style={[
              styles.speakerInfo,
              { alignItems: isSmallMobile ? 'center' : 'flex-start' }
            ]}>
              <Text style={[
                styles.speakerName,
                { 
                  color: isDark ? '#FFFFFF' : '#000000',
                  fontSize: isSmallMobile ? 20 : isTablet ? 28 : 24,
                  textAlign: isSmallMobile ? 'center' : 'left'
                }
              ]}>
                {displaySpeaker?.name || 'Unknown Speaker'}
              </Text>
              
              {displaySpeaker?.company && (
                <Text style={[
                  styles.speakerCompany,
                  { 
                    color: isDark ? '#8E8E93' : '#3C3C43',
                    fontSize: isSmallMobile ? 14 : isTablet ? 18 : 16,
                    textAlign: isSmallMobile ? 'center' : 'left'
                  }
                ]}>
                  {displaySpeaker.company}
                </Text>
              )}
              
              {displaySpeaker?.role && (
                <Text style={[
                  styles.speakerRole,
                  { 
                    color: isDark ? '#8E8E93' : '#3C3C43',
                    fontSize: isSmallMobile ? 12 : isTablet ? 16 : 14,
                    textAlign: isSmallMobile ? 'center' : 'left'
                  }
                ]}>
                  {displaySpeaker.role}
                </Text>
              )}
            </View>
          </View>

          {/* ✅ CONTACT INFO MEJORADO */}
          {(displaySpeaker?.email || displaySpeaker?.phone) && (
            <View style={[
              styles.contactSection,
              { marginBottom: isSmallMobile ? 20 : 24 }
            ]}>
              <Text style={[
                styles.sectionTitle,
                { 
                  color: isDark ? '#FFFFFF' : '#000000',
                  fontSize: isSmallMobile ? 16 : isTablet ? 20 : 18
                }
              ]}>
                Contact Information
              </Text>
              
              {displaySpeaker.email && (
                <Pressable 
                  style={styles.contactItem}
                  onPress={() => Linking.openURL(`mailto:${displaySpeaker.email}`)}
                >
                  <Mail size={isSmallMobile ? 16 : 18} color="#007AFF" />
                  <Text style={[
                    styles.contactText,
                    { 
                      color: '#007AFF',
                      fontSize: isSmallMobile ? 14 : 16
                    }
                  ]}>
                    {displaySpeaker.email}
                  </Text>
                </Pressable>
              )}
              
              {displaySpeaker.phone && (
                <Pressable 
                  style={styles.contactItem}
                  onPress={() => Linking.openURL(`tel:${displaySpeaker.phone}`)}
                >
                  <Phone size={isSmallMobile ? 16 : 18} color="#007AFF" />
                  <Text style={[
                    styles.contactText,
                    { 
                      color: '#007AFF',
                      fontSize: isSmallMobile ? 14 : 16
                    }
                  ]}>
                    {displaySpeaker.phone}
                  </Text>
                </Pressable>
              )}
            </View>
          )}

          {/* ✅ BIO SECTION RESPONSIVO */}
          {displaySpeaker?.bio && displaySpeaker.bio !== 'No bio available' && (
            <View style={[
              styles.bioSection,
              { marginBottom: isSmallMobile ? 20 : 24 }
            ]}>
              <Text style={[
                styles.sectionTitle,
                { 
                  color: isDark ? '#FFFFFF' : '#000000',
                  fontSize: isSmallMobile ? 16 : isTablet ? 20 : 18
                }
              ]}>
                Biography
              </Text>
              <Text style={[
                styles.bioText,
                { 
                  color: isDark ? '#8E8E93' : '#3C3C43',
                  fontSize: isSmallMobile ? 14 : 16,
                  lineHeight: isSmallMobile ? 20 : 24
                }
              ]}>
                {displaySpeaker.bio}
              </Text>
            </View>
          )}

          {/* ✅ EXPERTISE RESPONSIVO */}
          {displaySpeaker?.expertise && displaySpeaker.expertise.length > 0 && (
            <View style={[
              styles.expertiseSection,
              { marginBottom: isSmallMobile ? 20 : 24 }
            ]}>
              <Text style={[
                styles.sectionTitle,
                { 
                  color: isDark ? '#FFFFFF' : '#000000',
                  fontSize: isSmallMobile ? 16 : isTablet ? 20 : 18
                }
              ]}>
                Expertise
              </Text>
              <View style={[
                styles.expertiseTags,
                { gap: isSmallMobile ? 6 : 8 }
              ]}>
                {displaySpeaker.expertise.map((skill, index) => (
                  <View 
                    key={index}
                    style={[
                      styles.expertiseTag,
                      { 
                        backgroundColor: isDark ? '#2C2C2E' : '#F2F2F7',
                        paddingHorizontal: isSmallMobile ? 10 : 12,
                        paddingVertical: isSmallMobile ? 5 : 6,
                        borderRadius: isSmallMobile ? 14 : 16
                      }
                    ]}
                  >
                    <Text style={[
                      styles.expertiseTagText,
                      { 
                        color: isDark ? '#FFFFFF' : '#000000',
                        fontSize: isSmallMobile ? 12 : 14
                      }
                    ]}>
                      {skill}
                    </Text>
                  </View>
                ))}
              </View>
            </View>
          )}

          {/* ✅ SOCIAL LINKS RESPONSIVO */}
          {displaySpeaker?.social && Object.keys(displaySpeaker.social).length > 0 && (
            <View style={styles.socialSection}>
              <Text style={[
                styles.sectionTitle,
                { 
                  color: isDark ? '#FFFFFF' : '#000000',
                  fontSize: isSmallMobile ? 16 : isTablet ? 20 : 18
                }
              ]}>
                Social Links
              </Text>
              <View style={[
                styles.socialLinks,
                { 
                  gap: isSmallMobile ? 8 : 12,
                  flexDirection: isSmallMobile ? 'column' : 'row'
                }
              ]}>
                {displaySpeaker.social.linkedin && (
                  <Pressable 
                    style={[
                      styles.socialButton,
                      { 
                        paddingHorizontal: isSmallMobile ? 10 : 12,
                        paddingVertical: isSmallMobile ? 6 : 8,
                        flex: isSmallMobile ? 0 : 1
                      }
                    ]}
                    onPress={() => Linking.openURL(displaySpeaker.social!.linkedin!)}
                  >
                    <Linkedin size={isSmallMobile ? 16 : 20} color="#0077B5" />
                    <Text style={[
                      styles.socialButtonText,
                      { fontSize: isSmallMobile ? 12 : 14 }
                    ]}>
                      LinkedIn
                    </Text>
                  </Pressable>
                )}
                
                {displaySpeaker.social.twitter && (
                  <Pressable 
                    style={[
                      styles.socialButton,
                      { 
                        paddingHorizontal: isSmallMobile ? 10 : 12,
                        paddingVertical: isSmallMobile ? 6 : 8,
                        flex: isSmallMobile ? 0 : 1
                      }
                    ]}
                    onPress={() => Linking.openURL(displaySpeaker.social!.twitter!)}
                  >
                    <Twitter size={isSmallMobile ? 16 : 20} color="#1DA1F2" />
                    <Text style={[
                      styles.socialButtonText,
                      { fontSize: isSmallMobile ? 12 : 14 }
                    ]}>
                      Twitter
                    </Text>
                  </Pressable>
                )}
                
                {displaySpeaker.social.website && (
                  <Pressable 
                    style={[
                      styles.socialButton,
                      { 
                        paddingHorizontal: isSmallMobile ? 10 : 12,
                        paddingVertical: isSmallMobile ? 6 : 8,
                        flex: isSmallMobile ? 0 : 1
                      }
                    ]}
                    onPress={() => Linking.openURL(displaySpeaker.social!.website!)}
                  >
                    <Globe size={isSmallMobile ? 16 : 20} color="#007AFF" />
                    <Text style={[
                      styles.socialButtonText,
                      { fontSize: isSmallMobile ? 12 : 14 }
                    ]}>
                      Website
                    </Text>
                  </Pressable>
                )}
              </View>
            </View>
          )}
        </View>

        {/* ✅ EVENTOS DEL SPEAKER (SI LOS HAY) */}
        {safeEvents.length > 0 && (
          <View style={[
            styles.eventsCard,
            { 
              backgroundColor: isDark ? '#1C1C1E' : '#FFFFFF',
              borderRadius: isSmallMobile ? 12 : 16,
              padding: isSmallMobile ? 16 : isTablet ? 28 : 24
            }
          ]}>
            <Text style={[
              styles.sectionTitle,
              { 
                color: isDark ? '#FFFFFF' : '#000000',
                fontSize: isSmallMobile ? 16 : isTablet ? 20 : 18,
                marginBottom: isSmallMobile ? 12 : 16
              }
            ]}>
              Events ({safeEvents.length})
            </Text>
            {safeEvents.slice(0, 3).map((event, index) => (
              <View 
                key={index}
                style={[
                  styles.eventItem,
                  { 
                    backgroundColor: isDark ? '#2C2C2E' : '#F2F2F7',
                    borderRadius: isSmallMobile ? 8 : 10,
                    padding: isSmallMobile ? 12 : 16,
                    marginBottom: isSmallMobile ? 8 : 12
                  }
                ]}>
                <Text style={[
                  styles.eventTitle,
                  { 
                    color: isDark ? '#FFFFFF' : '#000000',
                    fontSize: isSmallMobile ? 14 : 16
                  }
                ]}>
                  {event.title || 'Event'}
                </Text>
                {event.date && (
                  <Text style={[
                    styles.eventDate,
                    { 
                      color: isDark ? '#8E8E93' : '#3C3C43',
                      fontSize: isSmallMobile ? 12 : 14
                    }
                  ]}>
                    📅 {event.date}
                  </Text>
                )}
              </View>
            ))}
          </View>
        )}
      </ScrollView>
    </View>
  );
}

// ✅ ESTILOS RESPONSIVOS ACTUALIZADOS
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
    fontWeight: '500',
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  errorText: {
    textAlign: 'center',
    marginBottom: 16,
    fontWeight: '500',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingBottom: 8,
  },
  headerButton: {
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 20,
    ...Platform.select({
      web: {
        cursor: 'pointer',
      },
    }),
  },
  headerTitle: {
    fontWeight: '600',
  },
  headerActions: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  headerActionButton: {
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 20,
    ...Platform.select({
      web: {
        cursor: 'pointer',
      },
    }),
  },
  content: {
    flex: 1,
  },
  speakerCard: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  profileSection: {},
  avatarContainer: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarText: {
    fontWeight: '700',
  },
  speakerInfo: {
    flex: 1,
  },
  speakerName: {
    fontWeight: '700',
    marginBottom: 4,
  },
  speakerCompany: {
    marginBottom: 2,
    fontWeight: '500',
  },
  speakerRole: {
    opacity: 0.8,
  },
  contactSection: {},
  sectionTitle: {
    fontWeight: '600',
    marginBottom: 12,
  },
  contactItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
    gap: 8,
    ...Platform.select({
      web: {
        cursor: 'pointer',
      },
    }),
  },
  contactText: {
    fontWeight: '500',
  },
  bioSection: {},
  bioText: {},
  expertiseSection: {},
  expertiseTags: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  expertiseTag: {},
  expertiseTagText: {
    fontWeight: '500',
  },
  socialSection: {},
  socialLinks: {},
  socialButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(0,122,255,0.1)',
    borderRadius: 8,
    gap: 6,
    ...Platform.select({
      web: {
        cursor: 'pointer',
      },
    }),
  },
  socialButtonText: {
    fontWeight: '500',
    color: '#007AFF',
  },
  backButton: {
    padding: 8,
    ...Platform.select({
      web: {
        cursor: 'pointer',
      },
    }),
  },
  backButtonText: {
    color: '#007AFF',
  },
  debugText: {
    textAlign: 'center',
    marginBottom: 16,
    fontFamily: Platform.select({ ios: 'Courier', android: 'monospace', default: 'monospace' }),
  },
  retryButton: {
    backgroundColor: '#007AFF',
    borderRadius: 8,
    marginBottom: 12,
    ...Platform.select({
      web: {
        cursor: 'pointer',
      },
    }),
  },
  retryButtonText: {
    color: '#FFFFFF',
    fontWeight: '600',
  },
  optimisticBanner: {
    alignItems: 'center',
  },
  optimisticText: {
    fontWeight: '600',
  },
  eventsCard: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  eventItem: {},
  eventTitle: {
    fontWeight: '600',
    marginBottom: 4,
  },
  eventDate: {},
});