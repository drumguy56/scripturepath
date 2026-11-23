import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { AuthProvider, useAuth } from '../lib/auth';
import { Loading } from '../lib/ui';
import { colors } from '../lib/theme';

export default function RootLayout() {
  return (
    <AuthProvider>
      <StatusBar style="dark" />
      <Gate />
    </AuthProvider>
  );
}

function Gate() {
  const { status } = useAuth();
  if (status === 'loading') return <Loading />;
  const signedIn = status === 'signed-in';

  return (
    <Stack screenOptions={{ headerTintColor: colors.ink, headerStyle: { backgroundColor: colors.background }, contentStyle: { backgroundColor: colors.background } }}>
      <Stack.Protected guard={!signedIn}>
        <Stack.Screen name="(auth)" options={{ headerShown: false }} />
      </Stack.Protected>
      <Stack.Protected guard={signedIn}>
        <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
        <Stack.Screen name="study/[id]" options={{ title: 'Study' }} />
        <Stack.Screen name="lesson/[id]" options={{ title: 'Lesson' }} />
        <Stack.Screen name="group/new" options={{ title: 'New group' }} />
        <Stack.Screen name="group/[id]" options={{ title: 'Group' }} />
      </Stack.Protected>
      <Stack.Screen name="index" options={{ headerShown: false }} />
    </Stack>
  );
}
