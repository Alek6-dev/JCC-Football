import { Tabs } from 'expo-router';

import { HapticTab } from '@/components/haptic-tab';
import { IconSymbol } from '@/components/ui/icon-symbol';

export default function TabLayout() {
  return (
    <Tabs
      safeAreaInsets={{ bottom: 0 }}
      screenOptions={{
        headerShown: false,
        tabBarButton: HapticTab,
        tabBarActiveTintColor: '#102033',
        tabBarInactiveTintColor: '#7F8DA1',
        tabBarActiveBackgroundColor: '#EEF7F6',
        tabBarStyle: {
          height: 58,
          paddingTop: 4,
          paddingBottom: 4,
          backgroundColor: 'rgba(248,251,254,0.96)',
          borderTopColor: '#DDE8F2',
          borderTopWidth: 1,
          shadowColor: '#0A1A2C',
          shadowOffset: { width: 0, height: -6 },
          shadowOpacity: 0.08,
          shadowRadius: 14,
          elevation: 12,
        },
        tabBarItemStyle: {
          height: 50,
          marginHorizontal: 2,
          marginVertical: 3,
          borderRadius: 10,
        },
        tabBarLabelStyle: {
          fontSize: 8,
          fontWeight: '800',
        },
      }}>
      <Tabs.Screen
        name="index"
        options={{
          title: 'Accueil',
          tabBarIcon: ({ color }) => <IconSymbol size={22} name="house.fill" color={color} />,
        }}
      />
      <Tabs.Screen
        name="collection"
        options={{
          title: 'Collection',
          tabBarIcon: ({ color }) => <IconSymbol size={22} name="rectangle.stack.fill" color={color} />,
        }}
      />
      <Tabs.Screen
        name="fantasy"
        options={{
          title: 'Fantasy',
          tabBarIcon: ({ color }) => <IconSymbol size={22} name="sportscourt.fill" color={color} />,
        }}
      />
      <Tabs.Screen
        name="club"
        options={{
          title: 'Mon Club',
          tabBarIcon: ({ color }) => <IconSymbol size={22} name="shield.fill" color={color} />,
        }}
      />
      <Tabs.Screen
        name="profil"
        options={{
          title: 'Profil',
          tabBarIcon: ({ color }) => <IconSymbol size={22} name="person.fill" color={color} />,
        }}
      />
      <Tabs.Screen
        name="explore"
        options={{ href: null }}
      />
    </Tabs>
  );
}
