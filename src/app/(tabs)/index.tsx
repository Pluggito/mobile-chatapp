import { router, useFocusEffect } from "expo-router";
import { Text, View, TouchableOpacity, FlatList, Image, StatusBar } from "react-native";
import { useCallback, useState } from "react";
import { useAuth } from "@/providers/AuthProvider";
import AddContacts from "@/components/addContacts";
import { Ionicons } from "@expo/vector-icons";
import axios from 'axios';

type Conversation = {
  id: string;
  is_group: boolean;
  name: string | null;
  participants: any[];
  lastMessage: any | null;
  created_at: string;
  unread_count?: number;
}

export default function ChatList() {
  const { session } = useAuth();
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [loading, setLoading] = useState(true);

  useFocusEffect(
    useCallback(() => {
      if (!session) return;
      const fetchConversations = async () => {
        try {
          const API_URL = process.env.EXPO_PUBLIC_API_URL || 'http://172.20.10.3:3008';
          const res = await axios.get(`${API_URL}/chatapp/conversations`, {
            headers: { Authorization: `Bearer ${session}` }
          });
          setConversations(res.data.conversations);
        } catch (error) {
          console.error("Error fetching conversations:", error);
        } finally {
          setLoading(false);
        }
      };
      fetchConversations();
    }, [session])
  );

  const openChat = (id: string, name: string) => {
    router.push({ pathname: "/chat/[id]", params: { id, name } });
  };

  const renderChatItem = ({ item }: { item: Conversation }) => {
    let chatName = item.name || "Unknown";
    let avatarUrl = "https://i.pravatar.cc/150";
    if (!item.is_group && item.participants.length > 0) {
      chatName = item.participants[0].full_name;
      avatarUrl = `https://i.pravatar.cc/150?u=${item.participants[0].id}`;
    }

    const lastMsg = item.lastMessage;
    const lastMsgText = !lastMsg
      ? "No messages yet"
      : lastMsg.type === 'AUDIO'
      ? "🎤  Voice message"
      : lastMsg.type === 'IMAGE'
      ? "📷  Photo"
      : (lastMsg.text || "");

    const time = lastMsg
      ? new Date(lastMsg.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      : new Date(item.created_at).toLocaleDateString();

    const hasUnread = (item.unread_count ?? 0) > 0;

    return (
      <TouchableOpacity
        onPress={() => openChat(item.id, chatName)}
        className="flex-row items-center px-4 active:bg-white/5"
        activeOpacity={0.7}
      >
        <View className="relative mr-3.5">
          <Image source={{ uri: avatarUrl }} className="w-[52px] h-[52px] rounded-full bg-white/10" />
          {item.is_group && (
            <View className="absolute -bottom-0.5 -right-0.5 bg-[#09090b] rounded-full p-0.5">
              <Ionicons name="people" size={11} color="#71717a" />
            </View>
          )}
        </View>

        <View className="flex-1 flex-row items-center border-b border-white/5 py-3.5">
          <View className="flex-1 mr-2">
            <Text
              className={`text-[15px] mb-0.5 ${hasUnread ? 'text-white font-bold' : 'text-white/90 font-semibold'}`}
              numberOfLines={1}
            >
              {chatName}
            </Text>
            <Text
              className={`text-[13px] ${hasUnread ? 'text-white/70 font-medium' : 'text-white/35'}`}
              numberOfLines={1}
            >
              {lastMsgText}
            </Text>
          </View>

          <View className="items-end gap-1.5">
            <Text className={`text-[11px] ${hasUnread ? 'text-white/70 font-semibold' : 'text-white/25'}`}>
              {time}
            </Text>
            {hasUnread && (
              <View className="bg-white rounded-full min-w-[18px] h-[18px] items-center justify-center px-1">
                <Text className="text-black text-[10px] font-bold">
                  {(item.unread_count ?? 0) > 9 ? '9+' : item.unread_count}
                </Text>
              </View>
            )}
          </View>
        </View>
      </TouchableOpacity>
    );
  };

  const renderSkeleton = () => (
    <View className="px-4 pt-2">
      {[1, 2, 3, 4, 5].map(i => (
        <View key={i} className="flex-row items-center py-3.5 border-b border-white/5">
          <View className="w-[52px] h-[52px] rounded-full bg-white/8 mr-3.5" />
          <View className="flex-1">
            <View className="h-[14px] bg-white/8 rounded-full w-2/5 mb-2.5" />
            <View className="h-[12px] bg-white/5 rounded-full w-3/5" />
          </View>
          <View className="h-[10px] bg-white/8 rounded-full w-8 ml-2" />
        </View>
      ))}
    </View>
  );

  return (
    <View className="flex-1 bg-[#09090b]">
      <StatusBar barStyle="light-content" />
      <View className="px-3 pt-1 pb-1">
        <AddContacts />
      </View>

      {loading ? (
        renderSkeleton()
      ) : conversations.length === 0 ? (
        <View className="flex-1 items-center justify-center px-10 pb-16">
          <View className="w-[72px] h-[72px] rounded-full bg-white/5 border border-white/8 items-center justify-center mb-5">
            <Ionicons name="chatbubbles-outline" size={32} color="rgba(255,255,255,0.18)" />
          </View>
          <Text className="text-white/60 font-semibold text-[17px] mb-2">No conversations yet</Text>
          <Text className="text-white/25 text-[13px] text-center leading-5">
            Search for someone above to start your first conversation.
          </Text>
        </View>
      ) : (
        <FlatList
          data={conversations}
          keyExtractor={(item) => item.id}
          renderItem={renderChatItem}
          contentContainerStyle={{ paddingBottom: 24 }}
          showsVerticalScrollIndicator={false}
        />
      )}
    </View>
  );
}
