import React, { useState, useRef, useEffect } from 'react';
import { 
  View, Text, TextInput, TouchableOpacity, FlatList, 
  KeyboardAvoidingView, Platform, ListRenderItem, Image
} from 'react-native';
import { Stack, useLocalSearchParams, useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useSocket } from '@/providers/SocketProvider';
import { useAuth } from '@/providers/AuthProvider';
import axios from 'axios';
import * as ImagePicker from 'expo-image-picker';
import * as FileSystem from 'expo-file-system';
import { useAudioRecorder, AudioModule, setAudioModeAsync } from 'expo-audio';
import { useUploadThing } from '@/utils/uploadthing';
import AudioBubble from '@/components/AudioBubble';

type Message = {
  id: string;
  sender_id: string;
  text: string | null;
  type: string;
  media_url: string | null;
  is_read: boolean;
  created_at: string;
};

export default function ChatScreen() {
  const { id: conversationId, name } = useLocalSearchParams();
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { socket, isConnected, onlineUsers } = useSocket();
  const { session, user } = useAuth();
  
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputText, setInputText] = useState('');
  const [isOtherTyping, setIsOtherTyping] = useState(false);
  const flatListRef = useRef<FlatList>(null);
  const typingTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Audio Recording States
  const recorder = useAudioRecorder({});

  const { startUpload: startAudioUpload, isUploading: isAudioUploading } = useUploadThing("audioUploader", {
    onClientUploadComplete: (res: any) => {
      if (res && res[0]) {
        socket?.emit('send_message', {
          conversationId,
          text: '',
          type: 'AUDIO',
          mediaUrl: res[0].url
        });
      }
    },
    onUploadError: (e:any) => {
      console.error("Audio Upload Error", e);
      alert("Failed to upload voice note");
    },
  });

  const { startUpload, isUploading } = useUploadThing("imageUploader", {
    onClientUploadComplete: (res: any) => {
      if (res && res[0]) {
        socket?.emit('send_message', {
          conversationId,
          text: '',
          type: 'IMAGE',
          mediaUrl: res[0].url
        });
      }
    },
    onUploadError: (e:any) => {
      console.error("Upload Error", e);
      alert("Failed to upload image");
    },
  });

  const pickImage = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      quality: 0.8,
    });

    if (!result.canceled) {
      const asset = result.assets[0];
      const name = asset.fileName || asset.uri.split('/').pop() || 'image.jpg';
      const type = asset.mimeType || 'image/jpeg';
      const size = asset.fileSize || 0;
      
      const fileObj = {
        uri: asset.uri,
        name,
        type,
        size
      } as any;
      
      startUpload([fileObj]);
    }
  };

  const startRecording = async () => {
    try {
      const permission = await AudioModule.requestRecordingPermissionsAsync();
      if (permission.granted) {
        await setAudioModeAsync({
          allowsRecording: true,
          playsInSilentMode: true,
        });
        await recorder.record();
      } else {
        alert("Microphone permission denied");
      }
    } catch (err) {
      console.error('Failed to start recording', err);
    }
  };

  const stopRecording = async () => {
    if (!recorder.isRecording) return;

    try {
      await recorder.stop();
      const uri = recorder.uri;

      if (uri) {
        const fileInfo = await FileSystem.getInfoAsync(uri);
        const name = uri.split('/').pop() || 'voicenote.m4a';
        const type = 'audio/mp4'; 
        
        const fileObj = {
          uri,
          name,
          type,
          size: fileInfo.exists ? fileInfo.size : 1024
        } as any;
        
        startAudioUpload([fileObj]);
      }
    } catch (err) {
      console.error('Failed to stop recording', err);
    }
  };

  const avatarUrl = `https://i.pravatar.cc/150?u=${conversationId}`;
  const contactName = name || "Chat";

  useEffect(() => {
    if (!session || !conversationId) return;

    const fetchMessages = async () => {
      try {
        const API_URL = process.env.EXPO_PUBLIC_API_URL || 'http://172.20.10.3:3008';
        const res = await axios.get(`${API_URL}/chatapp/conversations/${conversationId}/messages`, {
          headers: { Authorization: `Bearer ${session}` }
        });
        setMessages(res.data.messages.reverse()); 
      } catch (error: any) {
        console.error("Failed to fetch messages", error.response?.data || error);
      }
    };

    fetchMessages();
  }, [conversationId, session]);

  useEffect(() => {
    if (!socket || !isConnected || !conversationId) return;

    socket.emit('join_room', conversationId);

    const handleReceiveMessage = (newMessage: Message) => {
      setMessages((prev) => [newMessage, ...prev]);
      // Mark as read if the chat is open
      if (newMessage.sender_id !== user?.id) {
        socket.emit('mark_read', conversationId);
      }
    };

    const handleTyping = () => setIsOtherTyping(true);
    const handleStopTyping = () => setIsOtherTyping(false);

    const handleMessagesRead = ({ byUserId }: { byUserId: string }) => {
      if (byUserId !== user?.id) {
        setMessages(prev => prev.map(msg => 
          msg.sender_id === user?.id && !msg.is_read 
            ? { ...msg, is_read: true } 
            : msg
        ));
      }
    };

    socket.on('receive_message', handleReceiveMessage);
    socket.on('typing', handleTyping);
    socket.on('stop_typing', handleStopTyping);
    socket.on('messages_read', handleMessagesRead);

    // Initial mark read
    socket.emit('mark_read', conversationId);
    
    // Update local state to mark messages as read when fetched
    setMessages(prev => prev.map(msg => {
      if (msg.sender_id === conversationId && !msg.is_read) {
        return { ...msg, is_read: true };
      }
      return msg;
    }));

    return () => {
      socket.off('receive_message', handleReceiveMessage);
      socket.off('typing');
      socket.off('stop_typing');
      socket.off('messages_read');
    };
  }, [socket, isConnected, conversationId]);

  const sendMessage = () => {
    if (inputText.trim() === '' || !socket || !isConnected) return;

    socket.emit('send_message', {
      conversationId,
      text: inputText.trim()
    });

    setInputText('');
    socket.emit('stop_typing', conversationId);
  };

  const handleInputChange = (text: string) => {
    setInputText(text);

    if (socket && isConnected) {
      socket.emit('typing', conversationId);

      if (typingTimeoutRef.current) {
        clearTimeout(typingTimeoutRef.current);
      }

      typingTimeoutRef.current = setTimeout(() => {
        socket.emit('stop_typing', conversationId);
      }, 1500);
    }
  };

  const renderMessage: ListRenderItem<Message> = ({ item, index }) => {
    const isMe = item.sender_id === user?.id;
    const isNextMessageSameSender = index > 0 && messages[index - 1].sender_id === item.sender_id;
    const time = new Date(item.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

    return (
      <View className={`flex-row w-full my-1 ${isMe ? 'justify-end' : 'justify-start'}`}>
        {!isMe && (!isNextMessageSameSender) && (
           <Image source={{ uri: `https://i.pravatar.cc/150?u=${item.sender_id}` }} className="w-6 h-6 rounded-full mr-2 self-end mb-1 bg-white/10" />
        )}
        {!isMe && isNextMessageSameSender && (
           <View className="w-6 mr-2" /> 
        )}
        
        <View 
          className={`
            max-w-[78%] px-[16px] py-[10px] border
            ${isMe ? 'bg-[#2a2a2a] border-white/20' : 'bg-[#1b1b1b] border-white/10'}
            ${isMe ? 'rounded-tl-3xl rounded-tr-3xl rounded-bl-3xl' : 'rounded-tr-3xl rounded-tl-3xl rounded-br-3xl'}
            ${isMe && !isNextMessageSameSender ? 'rounded-br-sm' : ''}
            ${!isMe && !isNextMessageSameSender ? 'rounded-bl-sm' : ''}
            ${item.type === 'IMAGE' ? 'p-1' : ''}
          `}
        >
          {item.type === 'IMAGE' && item.media_url ? (
            <Image source={{ uri: item.media_url }} className="w-48 h-48 rounded-xl bg-white/10" />
          ) : item.type === 'AUDIO' && item.media_url ? (
            <AudioBubble uri={item.media_url} isMe={isMe} />
          ) : (
            <Text className={`text-[16px] leading-[22px] font-semibold ${isMe ? 'text-white' : 'text-white/90'}`}>
              {item.text}
            </Text>
          )}
          <View className="flex-row items-center self-end mt-1">
            <Text className={`text-[10px] font-semibold mr-1 ${isMe ? 'text-white/70' : 'text-white/40'}`}>
              {time}
            </Text>
            {isMe && (
              <Ionicons 
                name={item.is_read ? "checkmark-done" : "checkmark"} 
                size={14} 
                color={item.is_read ? "#3b82f6" : "rgba(255,255,255,0.4)"} 
              />
            )}
          </View>
        </View>
      </View>
    );
  };

  return (
    <KeyboardAvoidingView 
      className="flex-1 bg-[#09090b]" 
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      keyboardVerticalOffset={Platform.OS === 'ios' ? 90 : 0} 
    >
      <Stack.Screen 
        options={{
          headerTitle: "",
          headerStyle: { backgroundColor: '#09090b' },
          headerTintColor: '#fff',
          headerShadowVisible: false,
          headerLeft: () => (
            <View className="flex-row items-center h-auto p-3">
              <TouchableOpacity onPress={() => router.back()} className="mr-3">
                <Ionicons name="chevron-back" size={28} color="#ffffff" />
              </TouchableOpacity>
              <View className="relative">
                <Image source={{ uri: avatarUrl }} className="w-9 h-9 rounded-full mr-3 border border-white/20" />
                {onlineUsers.includes(conversationId as string) && (
                  <View className="absolute bottom-0 right-3 w-3 h-3 bg-green-500 rounded-full border border-[#09090b]" />
                )}
              </View>
              <View>
                <Text className="text-white font-semibold text-base">{contactName}</Text>
                <Text className={isConnected ? "text-green-400 text-xs font-medium" : "text-yellow-400 text-xs font-medium"}>
                  {isConnected ? (isOtherTyping ? "typing..." : (onlineUsers.includes(conversationId as string) ? "Online" : "Offline")) : "Connecting..."}
                </Text>
              </View>
            </View>
          ),
          headerRight: () => (
            <View className="flex-row items-center gap-4 px-2">
              <TouchableOpacity className="p-1">
                <Ionicons name="call-outline" size={24} color="#ffffff" />
              </TouchableOpacity>
              <TouchableOpacity className="p-1">
                <Ionicons name="videocam-outline" size={24} color="#ffffff" />
              </TouchableOpacity>
            </View>
          )
        }} 
      />

      <FlatList
        ref={flatListRef}
        data={messages}
        keyExtractor={(item) => item.id}
        renderItem={renderMessage}
        inverted 
        contentContainerStyle={{ paddingHorizontal: 16, paddingBottom: 16, paddingTop: 16 }}
        showsVerticalScrollIndicator={false}
      />

      {/* Input Area */}
      <View 
        className="flex-row items-end border-t border-white/5 bg-[#09090b] px-3 pt-3"
        style={{ paddingBottom: Math.max(insets.bottom, 12) }}
      >
        <TouchableOpacity 
          className="mb-1.5 mr-3 rounded-full bg-white/10 p-2 border border-white/10"
          onPress={pickImage}
          disabled={isUploading || recorder.isRecording}
        >
           <Ionicons name="image-outline" size={22} color={isUploading ? "#71717a" : "#ffffff"} />
        </TouchableOpacity>
        
        {recorder.isRecording ? (
          <View className="flex-1 flex-row items-center bg-white/10 border border-white/20 rounded-full px-4 py-[10px] max-h-32 mb-1.5">
             <View className="w-3 h-3 rounded-full bg-red-500 mr-2 animate-pulse" />
             <Text className="text-white text-[16px] font-semibold">Recording...</Text>
          </View>
        ) : (
          <TextInput
            className="flex-1 bg-white/10 border border-white/20 rounded-full px-4 py-[10px] max-h-32 text-[16px] text-white"
            placeholder="Type a message..."
            placeholderTextColor="#71717a"
            multiline
            value={inputText}
            onChangeText={handleInputChange}
            keyboardAppearance="dark"
          />
        )}
        
        {inputText.trim().length > 0 ? (
          <TouchableOpacity 
            className="ml-3 mb-1.5 w-[38px] h-[38px] rounded-full items-center justify-center bg-white"
            onPress={sendMessage}
          >
            <Ionicons name="send" size={18} color="#000000" style={{ marginLeft: 2 }} />
          </TouchableOpacity>
        ) : (
          <TouchableOpacity 
            className="ml-3 mb-1.5 rounded-full p-2 bg-white/10 border border-white/10"
            onPressIn={startRecording}
            onPressOut={stopRecording}
          >
            <Ionicons name="mic" size={24} color={recorder.isRecording ? "#ef4444" : "#ffffff"} />
          </TouchableOpacity>
        )}
      </View>
    </KeyboardAvoidingView>
  );
}
