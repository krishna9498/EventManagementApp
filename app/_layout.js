import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';

export default function RootLayout() {
  return (
    <>
      <Stack screenOptions={{ headerShown: false }}>
        <Stack.Screen name="index" />
        <Stack.Screen name="auth" />
        <Stack.Screen name="tabs" />
        <Stack.Screen 
          name="event-detail" 
          options={{ 
            presentation: 'modal',
            headerShown: true,
            title: 'Event Details',
            headerBackTitle: 'Back'
          }} 
        />
        <Stack.Screen 
          name="edit-event" 
          options={{ 
            presentation: 'modal',
            headerShown: true,
            title: 'Edit Event',
            headerBackTitle: 'Back'
          }} 
        />
      </Stack>
      <StatusBar style="auto" />
    </>
  );
}