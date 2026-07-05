
import React, { useState } from 'react';
import { View, Alert, Text, TextInput, TouchableOpacity, ScrollView, Platform, KeyboardAvoidingView } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';

import { useAuth } from '@/providers/AuthProvider';


const authform = () => {
  const [activeTab, setActiveTab] = useState<"signup" | "signin">("signup");
  const [name, setName] = useState("");
  const [password, setPassword] = useState("");
  const [email, setEmail] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const [username, setUsername] = useState("");
  const loading = false;
  const { signIn, signUp } = useAuth()

  const handleSignIn = async() => {
try {
      await signIn(email, password);

      Alert.alert("Logged in successfully!");
      
      router.replace('/(tabs)')
    } catch (error) {
      console.log(error)
    }
  };

  const handleSignUp = async() => {
    try {
      await signUp(email, password, username, name)
      Alert.alert("Sign Up successfully!");
      router.replace('/(tabs)')
    } catch (error: any) {
       if (error){
        Alert.alert(error.message)
        return
      }
    }
  };

  return (
    <KeyboardAvoidingView 
      className="flex-1 bg-black"
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <ScrollView 
        contentContainerStyle={{ flexGrow: 1 }} 
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        <View className="w-full max-w-md mx-auto p-4 flex-1 justify-center">
          <View className='mt-10'>
            
            {/* Header */}
            <View className="flex-row items-center justify-between mb-8">
              <View className="flex-row bg-black/30 rounded-full p-1 border border-white/10 relative">
                <TouchableOpacity 
                  onPress={() => setActiveTab('signup')}
                  className={`px-6 py-2 rounded-full z-10 ${activeTab === 'signup' ? 'bg-white/20' : ''}`}
                >
                  <Text className={`text-sm font-medium ${activeTab === 'signup' ? 'text-white' : 'text-white/60'}`}>Sign up</Text>
                </TouchableOpacity>
                <TouchableOpacity 
                  onPress={() => setActiveTab('signin')}
                  className={`px-6 py-2 rounded-full z-10 ${activeTab === 'signin' ? 'bg-white/20' : ''}`}
                >
                  <Text className={`text-sm font-medium ${activeTab === 'signin' ? 'text-white' : 'text-white/60'}`}>Sign in</Text>
                </TouchableOpacity>
              </View>

              <TouchableOpacity onPress={() => router.replace('/(tabs)')} className="w-10 h-10 bg-black/30 rounded-full items-center justify-center border border-white/10">
                <Ionicons name="close" size={20} color="rgba(255,255,255,0.8)" />
              </TouchableOpacity>
            </View>

            <Text className="text-3xl font-normal text-white mb-8">
              {activeTab === 'signup' ? 'Create an account' : 'Welcome back'}
            </Text>

            {/* Form */}
            {activeTab === 'signup' ? (
              <View className="gap-4">
                <View className="flex-row gap-4">
                  <View className="flex-1 relative">
                    <View className="absolute left-4 top-4 z-10">
                    <Ionicons name="person-outline" size={20} color="rgba(255,255,255,0.4)" />
                  </View>
                    <TextInput
                      value={name}
                      onChangeText={setName}
                      className="bg-black/20 border border-white/10 rounded-2xl h-14 text-white px-4 pl-12 text-base"
                      placeholder="Enter your name"
                      placeholderTextColor="rgba(255,255,255,0.4)"
                    />
                  </View>
                </View>

                <View className="relative justify-center">
                  <View className="absolute left-4 z-10">
                    <Ionicons name="person-outline" size={20} color="rgba(255,255,255,0.4)" />
                  </View>
                  <TextInput
                    value={username}
                    onChangeText={setUsername}
                    className="bg-black/20 border border-white/10 rounded-2xl h-14 text-white pl-12 pr-4 text-base"
                    placeholder="Username"
                    placeholderTextColor="rgba(255,255,255,0.4)"
                  />
                </View>

                <View className="relative justify-center">
                  <View className="absolute left-4 z-10">
                    <Ionicons name="mail-outline" size={20} color="rgba(255,255,255,0.4)" />
                  </View>
                  <TextInput
                    value={email}
                    onChangeText={setEmail}
                    keyboardType="email-address"
                    autoCapitalize="none"
                    className="bg-black/20 border border-white/10 rounded-2xl h-14 text-white pl-12 pr-4 text-base"
                    placeholder="Enter your email"
                    placeholderTextColor="rgba(255,255,255,0.4)"
                  />
                </View>
                <View className="relative justify-center">
                  <TextInput
                    value={password}
                    onChangeText={setPassword}
                    secureTextEntry={!showPassword}
                    className="bg-black/20 border border-white/10 rounded-2xl h-14 text-white pl-4 pr-12 text-base"
                    placeholder="Enter your password"
                    placeholderTextColor="rgba(255,255,255,0.4)"
                  />
                  <TouchableOpacity 
                    onPress={() => setShowPassword(!showPassword)}
                    className="absolute right-4 z-10"
                  >
                    <Ionicons name={showPassword ? "eye-off-outline" : "eye-outline"} size={20} color="rgba(255,255,255,0.4)" />
                  </TouchableOpacity>
                </View>

                <TouchableOpacity 
                  onPress={handleSignUp}
                  disabled={loading}
                  className="w-full bg-white/20 border border-white/20 rounded-2xl h-14 mt-4 items-center justify-center active:opacity-80"
                >
                  <Text className="text-white font-medium text-base">
                    {loading ? "Creating account..." : "Create an account"}
                  </Text>
                </TouchableOpacity>
              </View>
            ) : (
              <View className="gap-4">
                <View className="relative justify-center">
                  <View className="absolute left-4 z-10">
                    <Ionicons name="mail-outline" size={20} color="rgba(255,255,255,0.4)" />
                  </View>
                  <TextInput
                    value={email}
                    onChangeText={setEmail}
                    keyboardType="email-address"
                    autoCapitalize="none"
                    className="bg-black/20 border border-white/10 rounded-2xl h-14 text-white pl-12 pr-4 text-base"
                    placeholder="Enter your email"
                    placeholderTextColor="rgba(255,255,255,0.4)"
                  />
                </View>

                <View className="relative justify-center">
                  <TextInput
                    value={password}
                    onChangeText={setPassword}
                    secureTextEntry={!showPassword}
                    className="bg-black/20 border border-white/10 rounded-2xl h-14 text-white pl-4 pr-12 text-base"
                    placeholder="Enter your password"
                    placeholderTextColor="rgba(255,255,255,0.4)"
                  />
                  <TouchableOpacity 
                    onPress={() => setShowPassword(!showPassword)}
                    className="absolute right-4 z-10"
                  >
                    <Ionicons name={showPassword ? "eye-off-outline" : "eye-outline"} size={20} color="rgba(255,255,255,0.4)" />
                  </TouchableOpacity>
                </View>

                <View className="flex-row items-center justify-between mt-2">
                  <TouchableOpacity 
                    onPress={() => setRememberMe(!rememberMe)}
                    className="flex-row items-center gap-2"
                  >
                    <View className={`w-5 h-5 rounded border border-white/20 items-center justify-center ${rememberMe ? 'bg-white/20' : 'bg-black/20'}`}>
                      {rememberMe && <Ionicons name="checkmark" size={14} color="white" />}
                    </View>
                    <Text className="text-white/60 text-sm">Remember me</Text>
                  </TouchableOpacity>
                  
                  <TouchableOpacity>
                    <Text className="text-white/60 text-sm">Forgot password?</Text>
                  </TouchableOpacity>
                </View>

                <TouchableOpacity 
                  onPress={handleSignIn}
                  disabled={loading}
                  className="w-full bg-white/20 border border-white/20 rounded-2xl h-14 mt-4 items-center justify-center active:opacity-80"
                >
                  <Text className="text-white font-medium text-base">
                    {loading ? "Signing in..." : "Sign in"}
                  </Text>
                </TouchableOpacity>
              </View>
            )}

            {/* Divider */}
            <View className="flex-row items-center my-8">
               <View className="flex-1 h-px bg-white/10" />
               <Text className="px-4 text-white/40 text-sm font-medium">
                 {activeTab === 'signup' ? 'OR SIGN IN WITH' : 'OR CONTINUE WITH'}
               </Text>
               <View className="flex-1 h-px bg-white/10" />
             </View>
 
             {/* Social Buttons */}
             <View className="flex-row gap-4">
               <TouchableOpacity className="flex-1 bg-black/20 border border-white/10 rounded-2xl h-14 items-center justify-center active:opacity-80">
                 <Ionicons name="logo-google" size={24} color="#EA4335" />
               </TouchableOpacity>
               <TouchableOpacity className="flex-1 bg-black/20 border border-white/10 rounded-2xl h-14 items-center justify-center active:opacity-80">
                 <Ionicons name="logo-apple" size={24} color="white" />
               </TouchableOpacity>
             </View>
 
             <Text className="text-center text-white/40 text-sm mt-8 pb-10">
               {activeTab === 'signup' 
                 ? 'By creating an account, you agree to our Terms & Service'
                 : 'By signing in, you agree to our Terms & Service'}
             </Text>
 
           </View>
         </View>
       </ScrollView>
     </KeyboardAvoidingView>
   )
 }

export default authform



