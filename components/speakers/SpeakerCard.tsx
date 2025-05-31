import React from 'react';
import { View, Text, StyleSheet, Pressable, useColorScheme, ActivityIndicator, Platform, Dimensions } from 'react-native';
import { router } from 'expo-router';
import { Edit, Trash2 } from 'lucide-react-native';

interface SpeakerCardProps {
  speaker: {
    id: string;
    name: string;
    company?: string;
    role?: string;
    email?: string;
    phone?: string;
    bio?: string;
    expertise?: string[];
    social?: any;
    rating?: number;
    imageUrl?: string;
  };
  onPress?: () => void;
  onDelete?: () => void;
  isGridView?: boolean;
  isNewOptimistic?: boolean;
  isUpdatedOptimistic?: boolean;
  isBeingDeleted?: boolean;
  screenWidth?: number;
  numColumns?: number;
}

export function SpeakerCard({ 
  speaker, 
  onPress, 
  onDelete, 
  isGridView = false, 
  isNewOptimistic = false, 
  isUpdatedOptimistic = false,
  isBeingDeleted = false,
  screenWidth = Dimensions.get('window').width,
  numColumns = 1
}: SpeakerCardProps) {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';

  // ✅ CONFIGURACIÓN RESPONSIVA
  const isTablet = screenWidth >= 768;
  const isDesktop = screenWidth >= 1024;
  const isSmallMobile = screenWidth < 375;

  const handleEditPress = () => {
    router.push(`/(tabs)/speakers/edit/${speaker.id}`);
  };

  const handleDeletePress = () => {
    console.log('🗑️ Delete button pressed for speaker:', speaker.name);
    if (onDelete) {
      onDelete();
    } else {
      console.warn('⚠️ onDelete function not provided to SpeakerCard');
    }
  };

  // ✅ MEJORAR CÁLCULO DE ESTILOS DEL CARD
  const getCardStyles = () => {
    if (!isGridView) {
      return {
        width: '100%',
        marginHorizontal: 0,
        marginBottom: isSmallMobile ? 8 : 12,
      };
    }

    // ✅ CÁLCULO MÁS PRECISO PARA GRID
    const horizontalMargin = 6; // Aumentar ligeramente el margen
    const maxWidth = numColumns === 4 ? '23%' : 
                     numColumns === 3 ? '31%' : 
                     numColumns === 2 ? '47%' : '100%';

    return {
      flex: 1,
      marginHorizontal: horizontalMargin,
      marginBottom: isSmallMobile ? 10 : 14,
      maxWidth,
      minHeight: isDesktop ? 180 : isTablet ? 160 : 140, // ✅ ALTURA MÍNIMA CONSISTENTE
    };
  };

  const cardStyles = getCardStyles();

  return (
    <Pressable
      style={[
        styles.container,
        { 
          backgroundColor: isDark ? '#1C1C1E' : '#FFFFFF',
          borderWidth: (isNewOptimistic || isUpdatedOptimistic) ? 2 : 0,
          borderColor: isNewOptimistic ? '#007AFF' : isUpdatedOptimistic ? '#34C759' : 'transparent',
          opacity: isBeingDeleted ? 0.5 : 1,
          borderRadius: isSmallMobile ? 10 : 14, // ✅ BORDES MÁS REDONDEADOS
          ...cardStyles,
        }
      ]}
      onPress={onPress}
    >
      {/* ✅ BADGES CON MEJOR POSICIONAMIENTO */}
      {(isNewOptimistic || isUpdatedOptimistic || isBeingDeleted) && (
        <View style={[
          styles.badge, 
          { 
            backgroundColor: isNewOptimistic ? '#007AFF' : 
                            isUpdatedOptimistic ? '#34C759' : '#FF3B30',
            paddingHorizontal: isSmallMobile ? 6 : 8,
            paddingVertical: isSmallMobile ? 3 : 4,
            borderRadius: isSmallMobile ? 10 : 12,
            top: 10,
            right: 10,
          }
        ]}>
          <Text style={[
            styles.badgeText,
            { fontSize: isSmallMobile ? 9 : 11 }
          ]}>
            {isNewOptimistic ? '✨ New' : 
             isUpdatedOptimistic ? '⚡ Updated' : '🗑️ Deleting'}
          </Text>
        </View>
      )}

      <View style={[
        styles.content,
        {
          padding: isSmallMobile ? 14 : isTablet ? 18 : 16,
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'space-between',
          flex: 1, // ✅ USAR TODO EL ESPACIO DISPONIBLE
        }
      ]}>
        {/* ✅ AVATAR MEJORADO */}
        <View style={[
          styles.avatar,
          { 
            backgroundColor: isDark ? '#2C2C2E' : '#F2F2F7',
            width: isSmallMobile ? 50 : isTablet ? 65 : 58,
            height: isSmallMobile ? 50 : isTablet ? 65 : 58,
            borderRadius: isSmallMobile ? 25 : isTablet ? 32.5 : 29,
            marginBottom: 12,
            // ✅ AGREGAR SOMBRA SUTIL
            shadowColor: '#000',
            shadowOffset: { width: 0, height: 2 },
            shadowOpacity: 0.1,
            shadowRadius: 4,
            elevation: 3,
          }
        ]}>
          <Text style={[
            styles.avatarText,
            { 
              color: isDark ? '#FFFFFF' : '#000000',
              fontSize: isSmallMobile ? 20 : isTablet ? 26 : 23,
            }
          ]}>
            {speaker.name?.charAt(0)?.toUpperCase() || 'S'}
          </Text>
        </View>

        {/* ✅ INFO SECTION MEJORADA */}
        <View style={[
          styles.info,
          {
            alignItems: 'center',
            width: '100%',
            flex: 1,
            justifyContent: 'center',
          }
        ]}>
          <Text 
            style={[
              styles.name,
              { 
                color: isDark ? '#FFFFFF' : '#000000',
                fontSize: isSmallMobile ? 13 : isTablet ? 16 : 14,
                textAlign: 'center',
                lineHeight: isSmallMobile ? 16 : isTablet ? 20 : 18,
                marginBottom: 6,
              }
            ]}
            numberOfLines={2}
          >
            {speaker.name || 'Unknown Speaker'}
          </Text>
          
          {speaker.company && (
            <Text 
              style={[
                styles.company,
                { 
                  color: isDark ? '#8E8E93' : '#3C3C43',
                  fontSize: isSmallMobile ? 11 : isTablet ? 13 : 12,
                  textAlign: 'center',
                  marginBottom: 3,
                }
              ]}
              numberOfLines={1}
            >
              {speaker.company}
            </Text>
          )}
          
          <Text 
            style={[
              styles.role,
              { 
                color: isDark ? '#8E8E93' : '#3C3C43',
                fontSize: isSmallMobile ? 10 : isTablet ? 12 : 11,
                textAlign: 'center',
                opacity: 0.8,
              }
            ]}
            numberOfLines={1}
          >
            {speaker.role || 'Speaker'}
          </Text>
        </View>

        {/* ✅ ACTIONS CON MEJOR ESPACIADO */}
        <View style={[
          styles.actions,
          {
            flexDirection: 'row',
            gap: isSmallMobile ? 6 : 10,
            marginTop: 8,
            justifyContent: 'center',
          }
        ]}>
          {isBeingDeleted ? (
            <ActivityIndicator size="small" color="#FF3B30" />
          ) : (
            <>
              <Pressable
                style={[
                  styles.actionButton,
                  { 
                    backgroundColor: isDark ? '#2C2C2E' : '#F2F2F7',
                    width: isSmallMobile ? 30 : isTablet ? 38 : 34,
                    height: isSmallMobile ? 30 : isTablet ? 38 : 34,
                    borderRadius: isSmallMobile ? 15 : isTablet ? 19 : 17,
                  }
                ]}
                onPress={handleEditPress}
              >
                <Edit size={isSmallMobile ? 14 : isTablet ? 18 : 16} color="#007AFF" />
              </Pressable>

              <Pressable
                style={[
                  styles.actionButton,
                  { 
                    backgroundColor: isDark ? '#2C2C2E' : '#F2F2F7',
                    width: isSmallMobile ? 30 : isTablet ? 38 : 34,
                    height: isSmallMobile ? 30 : isTablet ? 38 : 34,
                    borderRadius: isSmallMobile ? 15 : isTablet ? 19 : 17,
                  }
                ]}
                onPress={handleDeletePress}
              >
                <Trash2 size={isSmallMobile ? 14 : isTablet ? 18 : 16} color="#FF3B30" />
              </Pressable>
            </>
          )}
        </View>
      </View>
    </Pressable>
  );
}

// ✅ ESTILOS MEJORADOS
const styles = StyleSheet.create({
  container: {
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 3,
    ...Platform.select({
      web: {
        cursor: 'pointer',
        transition: 'all 0.2s ease', // ✅ ANIMACIÓN SUAVE EN WEB
      },
    }),
  },
  badge: {
    position: 'absolute',
    zIndex: 1,
  },
  badgeText: {
    color: '#FFFFFF',
    fontWeight: '600',
  },
  content: {},
  avatar: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarText: {
    fontWeight: '700', // ✅ MÁS BOLD
  },
  info: {},
  name: {
    fontWeight: '600',
  },
  company: {},
  role: {},
  actions: {},
  actionButton: {
    alignItems: 'center',
    justifyContent: 'center',
    ...Platform.select({
      web: {
        cursor: 'pointer',
        transition: 'all 0.15s ease',
      },
    }),
  },
});