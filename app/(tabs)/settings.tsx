import React from 'react';
import { View, Text, StyleSheet, ScrollView, Switch, Pressable, useColorScheme } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Bell, Moon, Shield, CircleHelp as HelpCircle, LogOut, ChevronRight, Languages } from 'lucide-react-native';

export default function SettingsScreen() {
  const insets = useSafeAreaInsets();
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';
  
  const [notificationsEnabled, setNotificationsEnabled] = React.useState(true);
  const [darkModeEnabled, setDarkModeEnabled] = React.useState(isDark);
  
  const SettingItem = ({ icon, title, isSwitch, value, onValueChange, onPress }) => (
    <Pressable
      style={[
        styles.settingItem,
        { backgroundColor: isDark ? '#1C1C1E' : '#FFFFFF' }
      ]}
      onPress={onPress}
      disabled={isSwitch}
    >
      <View style={styles.settingContent}>
        <View style={[
          styles.settingIconContainer,
          { backgroundColor: isDark ? '#2C2C2E' : '#F2F2F7' }
        ]}>
          {icon}
        </View>
        <Text style={[
          styles.settingTitle,
          { color: isDark ? '#FFFFFF' : '#000000' }
        ]}>
          {title}
        </Text>
      </View>
      
      {isSwitch ? (
        <Switch
          value={value}
          onValueChange={onValueChange}
          trackColor={{ false: '#767577', true: '#0A84FF' }}
          thumbColor={'#FFFFFF'}
        />
      ) : (
        <ChevronRight size={20} color={isDark ? '#8E8E93' : '#C7C7CC'} />
      )}
    </Pressable>
  );
  
  return (
    <ScrollView
      style={[
        styles.container,
        { backgroundColor: isDark ? '#000000' : '#F2F2F7' }
      ]}
      contentContainerStyle={{ paddingBottom: insets.bottom + 20 }}
    >
      <View style={styles.header}>
        <Text style={[
          styles.headerTitle,
          { color: isDark ? '#FFFFFF' : '#000000' }
        ]}>
          Settings
        </Text>
      </View>

      <View style={styles.section}>
        <Text style={[
          styles.sectionTitle,
          { color: isDark ? '#8E8E93' : '#3C3C43' }
        ]}>
          PREFERENCES
        </Text>
        
        <SettingItem
          icon={<Bell size={22} color="#0A84FF" />}
          title="Notifications"
          isSwitch={true}
          value={notificationsEnabled}
          onValueChange={setNotificationsEnabled}
        />
        
        <SettingItem
          icon={<Moon size={22} color="#5E5CE6" />}
          title="Dark Mode"
          isSwitch={true}
          value={darkModeEnabled}
          onValueChange={setDarkModeEnabled}
        />
        
        <SettingItem
          icon={<Languages size={22} color="#FF9500" />}
          title="Language"
          onPress={() => {}}
        />
      </View>
      
      <View style={styles.section}>
        <Text style={[
          styles.sectionTitle,
          { color: isDark ? '#8E8E93' : '#3C3C43' }
        ]}>
          SUPPORT
        </Text>
        
        <SettingItem
          icon={<HelpCircle size={22} color="#30D158" />}
          title="Help & Support"
          onPress={() => {}}
        />
        
        <SettingItem
          icon={<Shield size={22} color="#FF453A" />}
          title="Privacy & Security"
          onPress={() => {}}
        />
      </View>
      
      <Pressable
        style={[
          styles.logoutButton,
          { backgroundColor: isDark ? '#1C1C1E' : '#FFFFFF' }
        ]}
        onPress={() => {}}
      >
        <LogOut size={22} color="#FF453A" />
        <Text style={styles.logoutText}>Log Out</Text>
      </Pressable>
      
      <Text style={styles.versionText}>
        Version 1.0.0
      </Text>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    padding: 16,
    paddingTop: 20,
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: '700',
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 13,
    fontWeight: '600',
    marginLeft: 16,
    marginBottom: 8,
  },
  settingItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 12,
    paddingHorizontal: 16,
    marginBottom: 1,
  },
  settingContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  settingIconContainer: {
    width: 36,
    height: 36,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  settingTitle: {
    fontSize: 16,
    fontWeight: '500',
  },
  logoutButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 16,
    marginHorizontal: 16,
    borderRadius: 12,
    marginBottom: 24,
  },
  logoutText: {
    color: '#FF453A',
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 8,
  },
  versionText: {
    textAlign: 'center',
    fontSize: 13,
    color: '#8E8E93',
  },
});