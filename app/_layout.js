import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';

export default function RootLayout() {
  return (
    <>
      <Stack screenOptions={{ headerShown: false }}>
        <Stack.Screen name="auth" />
        <Stack.Screen name="tabs" />
        <Stack.Screen 
          name="event-detail" 
          options={{ 
            presentation: 'modal',
            headerShown: true,
            title: 'Event Details'
          }} 
        />
      </Stack>
      <StatusBar style="auto" />
    </>
  );
}