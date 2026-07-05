import React, { useEffect } from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { useAudioPlayer } from 'expo-audio';
import { Ionicons } from '@expo/vector-icons';

type AudioBubbleProps = {
  uri: string;
  isMe: boolean;
};

export default function AudioBubble({ uri, isMe }: AudioBubbleProps) {
  const player = useAudioPlayer(uri);

  const togglePlayback = () => {
    if (player.playing) {
      player.pause();
    } else {
      player.play();
    }
  };

  const formatTime = (millis: number) => {
    const totalSeconds = Math.floor(millis / 1000);
    const minutes = Math.floor(totalSeconds / 60);
    const seconds = totalSeconds % 60;
    return `${minutes}:${seconds < 10 ? '0' : ''}${seconds}`;
  };

  const durationMillis = player.duration || 0;
  const positionMillis = player.currentTime || 0;

  return (
    <View className={`flex-row items-center w-48 ${isMe ? 'opacity-100' : 'opacity-90'}`}>
      <TouchableOpacity onPress={togglePlayback} className="mr-3">
        <Ionicons name={player.playing ? "pause-circle" : "play-circle"} size={36} color={isMe ? "#ffffff" : "#3b82f6"} />
      </TouchableOpacity>
      <View className="flex-1">
        <View className="h-1 bg-white/20 rounded-full w-full overflow-hidden">
          <View 
            className={`h-full ${isMe ? 'bg-white' : 'bg-[#3b82f6]'}`} 
            style={{ width: `${durationMillis > 0 ? (positionMillis / durationMillis) * 100 : 0}%` }}
          />
        </View>
        <Text className={`text-[10px] mt-1 font-medium ${isMe ? 'text-white/70' : 'text-white/60'}`}>
          {formatTime(positionMillis > 0 ? positionMillis : durationMillis)}
        </Text>
      </View>
    </View>
  );
}
