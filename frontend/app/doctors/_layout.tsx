import { Stack } from 'expo-router';
import { useColorScheme } from '../../hooks/use-color-scheme';
import { Colors } from '../../constants/theme';

export default function DoctorsLayout() {
  const colorScheme = useColorScheme();

  return (
    <Stack
      screenOptions={{
        headerShown: false,
        animationEnabled: true,
        cardStyle: {
          backgroundColor: Colors[colorScheme ?? 'light'].background,
        },
      }}
    >
      <Stack.Screen
        name="map"
        options={{
          title: 'Doctors Map',
        }}
      />
      <Stack.Screen
        name="list"
        options={{
          title: 'Find Doctors',
        }}
      />
      <Stack.Screen
        name="[id]"
        options={{
          title: 'Doctor Profile',
        }}
      />
      <Stack.Screen
        name="book"
        options={{
          title: 'Book Appointment',
        }}
      />
    </Stack>
  );
}
