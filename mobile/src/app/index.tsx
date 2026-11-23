import { Redirect } from 'expo-router';
import { useAuth } from '../lib/auth';

export default function Index() {
  const { status } = useAuth();
  if (status === 'signed-in') return <Redirect href="/(tabs)" />;
  return <Redirect href="/login" />;
}
