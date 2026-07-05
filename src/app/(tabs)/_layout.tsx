import { Tabs } from 'expo-router'
import { Ionicons } from '@expo/vector-icons'

const TabLayout = () => {
  return (
    <Tabs screenOptions={{
      tabBarStyle: {
        backgroundColor: '#0a0a0c',
        borderTopColor: 'rgba(255,255,255,0.06)',
        borderTopWidth: 0.5,
        height: 56,
        paddingBottom: 8,
        paddingTop: 8,
      },
      tabBarActiveTintColor: '#ffffff',
      tabBarInactiveTintColor: '#52525b',
      tabBarLabelStyle: {
        fontSize: 10,
        fontWeight: '600',
        letterSpacing: 0.3,
      },
      headerStyle: {
        backgroundColor: '#09090b',
        shadowColor: 'transparent',
        borderBottomWidth: 0,
      },
      headerShadowVisible: false,
      headerTintColor: '#ffffff',
      headerTitleStyle: {
        fontWeight: '700',
        fontSize: 17,
        color: '#ffffff',
      },
    }}>
      <Tabs.Screen
        name="index"
        options={{
          title: 'Chats',
          headerTitle: 'Messages',
          tabBarIcon: ({ color, focused }) => (
            <Ionicons name={focused ? "chatbubbles" : "chatbubbles-outline"} size={22} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          title: 'Profile',
          tabBarIcon: ({ color, focused }) => (
            <Ionicons name={focused ? "person" : "person-outline"} size={22} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="settings"
        options={{
          title: 'Settings',
          tabBarIcon: ({ color, focused }) => (
            <Ionicons name={focused ? "settings" : "settings-outline"} size={22} color={color} />
          ),
        }}
      />
    </Tabs>
  )
}

export default TabLayout