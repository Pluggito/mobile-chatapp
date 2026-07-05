import { Stack } from "expo-router";
import './global.css'
import { AuthProvider } from "@/providers/AuthProvider";
import { SocketProvider } from "@/providers/SocketProvider";
import * as SplashScreen from 'expo-splash-screen';

SplashScreen.preventAutoHideAsync();
export default function RootLayout() {
  return (
     <AuthProvider>
      <SocketProvider>
        <Stack>
          <Stack.Screen name="(auth)/authform" options={{ headerShown: false, headerBackButtonDisplayMode: "minimal", presentation: "formSheet", sheetGrabberVisible: true }} />
          <Stack.Screen name="(tabs)" options={{headerShown: false}}/>
        </Stack>
      </SocketProvider>
     </AuthProvider>
    )
}