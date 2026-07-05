import { createContext, useContext, useEffect, useState } from 'react';
import { useRouter, useSegments } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from 'axios';
import * as SplashScreen from 'expo-splash-screen';

type User = {
  id: string;
  email: string;
  username: string;
  full_name: string;
};

type AuthContextType = {
  session: string | null;
  user: User | null;
  loading: boolean;
  signUp: (email: string, password: string, username: string, fullName: string) => Promise<void>;
  signIn: (email: string, password: string) => Promise<void>;
  signOut: () => Promise<void>;
};

const AuthContext = createContext<AuthContextType>({
  session: null,
  user: null,
  loading: true,
  signUp: async () => {},
  signIn: async () => {},
  signOut: async () => {},
});

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [session, setSession] = useState<string | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const segments = useSegments();
  const router = useRouter();

  useEffect(() => {
    const loadSession = async () => {
      try {
        const token = await AsyncStorage.getItem('jwt_token');
        if (token) {
          const res = await axios.get(`${process.env.EXPO_PUBLIC_API_URL}/chatapp/auth/me`, {
            headers: {
              Authorization: `Bearer ${token}`
            }
          });
          setSession(token);
          setUser(res.data.user);
        }
      } catch (error) {
        console.error('Failed to load session', error);
        await AsyncStorage.removeItem('jwt_token');
      } finally {
        setLoading(false);
      }
    };

    loadSession();
  }, []);

  useEffect(() => {
    if (loading) return;

    SplashScreen.hideAsync();

    const inAuthGroup = segments[0] === '(auth)';
    const isIndex = segments.length === 0;

    if (!session && !inAuthGroup && !isIndex) {
      router.push('/(auth)/authform');
    } else if (session && (inAuthGroup || isIndex)) {
      router.replace('/(tabs)');
    }
  }, [session, loading, segments]);

  const signUp = async (email: string, password: string, username: string, fullName: string) => {
    try {
      const res = await axios.post(`${process.env.EXPO_PUBLIC_API_URL}/chatapp/auth/register`, {
        email, password, username, full_name: fullName
      });

      const { token, user: newUser } = res.data;
      await AsyncStorage.setItem('jwt_token', token);
      setSession(token);
      setUser(newUser);
    } catch (error) {
      console.error('SignUp error:', error);
      throw error;
    }
  };

  const signIn = async (email: string, password: string) => {
    try {
      const res = await axios.post(`${process.env.EXPO_PUBLIC_API_URL}/chatapp/auth/login`, {
        email, password
      });

      const { token, user: loggedUser } = res.data;
      await AsyncStorage.setItem('jwt_token', token);
      setSession(token);
      setUser(loggedUser);
    } catch (error) {
      console.error('SignIn error:', error);
      throw error;
    }
  };

  const signOut = async () => {
    try {
      await AsyncStorage.removeItem('jwt_token');
      setSession(null);
      setUser(null);
    } catch (error) {
      console.error('SignOut error:', error);
      throw error;
    }
  };

  return (
    <AuthContext.Provider value={{ session, user, loading, signUp, signIn, signOut }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
