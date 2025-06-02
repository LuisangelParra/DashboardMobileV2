import { Stack } from 'expo-router';
import { useColorScheme } from 'react-native';

export default function FeedbackLayout() {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';

  return (
    <Stack
      screenOptions={{
        headerShown: false, // ✅ QUITAR HEADER DUPLICADO
        headerStyle: {
          backgroundColor: isDark ? '#1C1C1E' : '#FFFFFF',
        },
        headerTintColor: isDark ? '#FFFFFF' : '#000000',
        headerTitleStyle: {
          fontWeight: '600',
        },
        contentStyle: {
          backgroundColor: isDark ? '#000000' : '#F2F2F7',
        },
      }}
    >
      <Stack.Screen
        name="index"
        options={{
          title: 'Feedback',
        }}
      />
    </Stack>
  );
}