import { useEffect } from 'react';
import { Redirect } from 'expo-router';
import { Text, View, StyleSheet } from 'react-native';

export default function Index() {
  return <Redirect href="/(tabs)" />;
}