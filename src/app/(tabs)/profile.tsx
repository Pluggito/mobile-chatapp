import { View, Text, TextInput, TouchableOpacity, Image, ScrollView, Alert } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '@/providers/AuthProvider';
import { useState } from 'react';

const Profile = () => {
  const { user, signOut } = useAuth();

  const nameParts = user?.full_name?.split(' ') || ['John', 'Doe'];
  const initialFirstName = nameParts[0] || 'John';
  const initialLastName = nameParts.length > 1 ? nameParts.slice(1).join(' ') : 'Doe';

  const [firstName, setFirstName] = useState(initialFirstName);
  const [lastName, setLastName] = useState(initialLastName);
  const [username, setUsername] = useState(user?.username || 'johndoe');

  const handleSignOut = async () => {
    Alert.alert("Sign Out", "Are you sure you want to sign out?", [
      { text: "Cancel", style: "cancel" },
      { text: "Sign Out", style: "destructive", onPress: signOut }
    ]);
  };

  const handleUpdate = () => {
    Alert.alert("Profile Updated", "Your profile has been saved successfully.");
  };

  const avatarInitials = `${firstName.charAt(0)}${lastName.charAt(0)}`.toUpperCase();

  return (
    <ScrollView
      className="flex-1 bg-[#09090b]"
      contentContainerStyle={{ paddingBottom: 48 }}
      showsVerticalScrollIndicator={false}
    >
      {/* Header / Avatar */}
      <View className="items-center pt-10 pb-8 px-5">
        <View className="relative mb-4">
          {/* Glow ring */}
          <View className="absolute inset-0 rounded-full bg-white/5 scale-110" />
          <Image
            source={{ uri: 'https://i.pravatar.cc/150?img=11' }}
            className="w-24 h-24 rounded-full border border-white/15"
          />
          <TouchableOpacity
            className="absolute bottom-0.5 right-0.5 bg-white w-8 h-8 rounded-full items-center justify-center border-2 border-[#09090b]"
          >
            <Ionicons name="camera" size={14} color="#000000" />
          </TouchableOpacity>
        </View>
        <Text className="text-white text-[20px] font-bold">{firstName} {lastName}</Text>
        <Text className="text-white/40 text-[14px] mt-0.5">@{username}</Text>
      </View>

      {/* Divider */}
      <View className="h-px bg-white/5 mx-5 mb-6" />

      {/* Form Fields */}
      <View className="px-5 gap-4">
        <InputField
          label="First Name"
          value={firstName}
          onChangeText={setFirstName}
          placeholder="First name"
        />
        <InputField
          label="Last Name"
          value={lastName}
          onChangeText={setLastName}
          placeholder="Last name"
        />
        <InputField
          label="Username"
          value={username}
          onChangeText={setUsername}
          placeholder="Username"
          prefix="@"
        />

        {/* Email (read-only) */}
        <View>
          <Text className="text-white/40 text-[12px] font-semibold uppercase tracking-wider mb-2 ml-1">Email</Text>
          <View className="w-full bg-white/4 border border-white/8 rounded-2xl px-4 py-3.5 flex-row items-center">
            <Ionicons name="mail-outline" size={16} color="rgba(255,255,255,0.25)" />
            <Text className="text-white/40 text-[15px] ml-3">{user?.email || 'john.doe@example.com'}</Text>
          </View>
        </View>

        {/* Save Button */}
        <TouchableOpacity
          onPress={handleUpdate}
          className="w-full bg-white py-4 rounded-2xl mt-2 items-center justify-center flex-row gap-2"
          activeOpacity={0.85}
        >
          <Ionicons name="checkmark" size={18} color="#000" />
          <Text className="text-black font-bold text-[15px]">Save Changes</Text>
        </TouchableOpacity>

        {/* Sign Out Button */}
        <TouchableOpacity
          onPress={handleSignOut}
          className="w-full bg-red-500/8 border border-red-500/15 py-4 rounded-2xl items-center justify-center flex-row gap-2"
          activeOpacity={0.85}
        >
          <Ionicons name="log-out-outline" size={18} color="#ef4444" />
          <Text className="text-red-500 font-semibold text-[15px]">Sign Out</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
};

const InputField = ({
  label,
  value,
  onChangeText,
  placeholder,
  prefix,
}: {
  label: string;
  value: string;
  onChangeText: (t: string) => void;
  placeholder?: string;
  prefix?: string;
}) => (
  <View>
    <Text className="text-white/40 text-[12px] font-semibold uppercase tracking-wider mb-2 ml-1">{label}</Text>
    <View className="flex-row items-center bg-white/5 border border-white/10 rounded-2xl px-4 py-3.5">
      {prefix && <Text className="text-white/40 text-[15px] mr-1">{prefix}</Text>}
      <TextInput
        className="flex-1 text-white text-[15px]"
        value={value}
        onChangeText={onChangeText}
        placeholder={placeholder}
        placeholderTextColor="#52525b"
        keyboardAppearance="dark"
      />
    </View>
  </View>
);

export default Profile;