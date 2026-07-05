import { Ionicons } from '@expo/vector-icons'
import { useState, useRef } from 'react'
import { View, TextInput, TouchableOpacity, Text, Animated } from 'react-native'
import axios from 'axios'
import { useAuth } from '@/providers/AuthProvider'
import { useRouter } from 'expo-router'

const AddContacts = () => {
    const [searchQuery, setSearchQuery] = useState('')
    const [results, setResults] = useState([])
    const [isFocused, setIsFocused] = useState(false)
    const { session } = useAuth()
    const router = useRouter()

    const searchUsers = async (query: string) => {
        setSearchQuery(query)
        if (query.trim().length === 0) {
            setResults([])
            return
        }
        try {
            const API_URL = process.env.EXPO_PUBLIC_API_URL || 'http://172.20.10.3:3008';
            const res = await axios.get(`${API_URL}/chatapp/users/search?q=${query}`, {
                headers: { Authorization: `Bearer ${session}` }
            })
            setResults(res.data.users)
        } catch (error) {
            console.error('Search error', error)
        }
    }

    const startChat = async (userId: string) => {
        try {
            const API_URL = process.env.EXPO_PUBLIC_API_URL || 'http://172.20.10.3:3008';
            const res = await axios.post(`${API_URL}/chatapp/conversations`, {
                targetUserId: userId
            }, {
                headers: { Authorization: `Bearer ${session}` }
            })
            setSearchQuery('')
            setResults([])
            router.push(`/chat/${res.data.conversation.id}`)
        } catch (error) {
            console.error('Start chat error', error)
        }
    }

  return (
     <View className="w-full relative z-50 mb-1">
        <View className="flex-row items-center gap-3">
            {/* Search input */}
            <View className={`flex-1 flex-row items-center rounded-2xl bg-white/8 border px-4 h-11 ${isFocused ? 'border-white/20' : 'border-white/8'}`}>
              <Ionicons name="search" size={16} color="rgba(255,255,255,0.35)" />
              <TextInput
                placeholder="Search people..."
                value={searchQuery}
                onChangeText={searchUsers}
                onFocus={() => setIsFocused(true)}
                onBlur={() => setIsFocused(false)}
                className="flex-1 text-white text-[15px] ml-2.5"
                placeholderTextColor="rgba(255,255,255,0.25)"
                returnKeyType="search"
              />
              {searchQuery.length > 0 && (
                <TouchableOpacity onPress={() => { setSearchQuery(''); setResults([]); }}>
                  <Ionicons name="close-circle" size={17} color="rgba(255,255,255,0.3)" />
                </TouchableOpacity>
              )}
            </View>

            {/* New chat button */}
            <TouchableOpacity className="w-11 h-11 rounded-2xl bg-white/8 border border-white/10 items-center justify-center">
               <Ionicons name="create-outline" size={20} color="rgba(255,255,255,0.8)" />
            </TouchableOpacity>
        </View>

        {/* Search results dropdown */}
        {results.length > 0 && (
            <View className="absolute top-[48px] left-0 right-14 bg-[#1c1c1e] rounded-2xl border border-white/10 overflow-hidden z-50 shadow-2xl">
                {results.map((user: any, index: number) => (
                    <TouchableOpacity
                        key={user.id}
                        className={`px-4 py-3.5 flex-row items-center ${index !== results.length - 1 ? 'border-b border-white/5' : ''}`}
                        onPress={() => startChat(user.id)}
                        activeOpacity={0.7}
                    >
                        <View className="w-9 h-9 rounded-full bg-white/15 items-center justify-center mr-3">
                            <Text className="text-white font-bold text-sm">
                              {user.username.charAt(0).toUpperCase()}
                            </Text>
                        </View>
                        <View>
                            <Text className="text-white font-semibold text-[14px]">{user.full_name}</Text>
                            <Text className="text-white/40 text-[12px] mt-0.5">@{user.username}</Text>
                        </View>
                    </TouchableOpacity>
                ))}
            </View>
        )}
     </View>
  )
}

export default AddContacts