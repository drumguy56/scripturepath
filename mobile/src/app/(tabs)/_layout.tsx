import type { ColorValue } from 'react-native';
import { Tabs } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { colors } from '../../lib/theme';

type IconName = React.ComponentProps<typeof Ionicons>['name'];

function tab(title: string, icon: IconName) {
  return {
    title,
    tabBarIcon: ({ color, size }: { color: ColorValue; size: number }) => <Ionicons name={icon} color={color as string} size={size} />,
  };
}

export default function TabsLayout() {
  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: colors.primary,
        tabBarInactiveTintColor: colors.muted,
        tabBarStyle: { backgroundColor: colors.card },
        headerStyle: { backgroundColor: colors.background },
        headerTintColor: colors.ink,
      }}
    >
      <Tabs.Screen name="index" options={tab('Home', 'home-outline')} />
      <Tabs.Screen name="read" options={tab('Read', 'book-outline')} />
      <Tabs.Screen name="library" options={tab('Library', 'library-outline')} />
      <Tabs.Screen name="journal" options={tab('Journal', 'create-outline')} />
      <Tabs.Screen name="groups" options={tab('Groups', 'people-outline')} />
    </Tabs>
  );
}
