import { View, Text, ScrollView, TouchableOpacity, Switch } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useState } from 'react';

type SettingItemProps = {
  icon: any;
  iconBg?: string;
  title: string;
  subtitle?: string;
  onPress?: () => void;
  hasSwitch?: boolean;
  switchValue?: boolean;
  onSwitchChange?: (v: boolean) => void;
  isLast?: boolean;
  destructive?: boolean;
};

const SettingItem = ({
  icon,
  iconBg = 'bg-white/10',
  title,
  subtitle,
  onPress,
  hasSwitch = false,
  switchValue = false,
  onSwitchChange,
  isLast = false,
  destructive = false,
}: SettingItemProps) => (
  <TouchableOpacity
    onPress={!hasSwitch ? onPress : undefined}
    disabled={hasSwitch}
    activeOpacity={0.7}
    className={`flex-row items-center py-3.5 ${!isLast ? 'border-b border-white/5' : ''}`}
  >
    <View className={`w-8 h-8 rounded-xl ${iconBg} items-center justify-center mr-3.5`}>
      <Ionicons name={icon} size={16} color={destructive ? '#ef4444' : '#ffffff'} />
    </View>
    <View className="flex-1">
      <Text className={`text-[15px] font-medium ${destructive ? 'text-red-500' : 'text-white/90'}`}>
        {title}
      </Text>
      {subtitle && (
        <Text className="text-white/35 text-[12px] mt-0.5 leading-4">{subtitle}</Text>
      )}
    </View>

    {hasSwitch ? (
      <Switch
        value={switchValue}
        onValueChange={onSwitchChange}
        trackColor={{ false: "#27272a", true: "#e4e4e7" }}
        thumbColor={switchValue ? "#000000" : "#71717a"}
        ios_backgroundColor="#27272a"
      />
    ) : (
      <Ionicons name="chevron-forward" size={16} color="#3f3f46" />
    )}
  </TouchableOpacity>
);

const SectionHeader = ({ title }: { title: string }) => (
  <Text className="text-white/30 text-[11px] font-bold uppercase tracking-widest mb-2 ml-1 mt-2">
    {title}
  </Text>
);

const Settings = () => {
  const [notifications, setNotifications] = useState(true);
  const [readReceipts, setReadReceipts] = useState(true);
  const [onlineStatus, setOnlineStatus] = useState(true);

  return (
    <ScrollView
      className="flex-1 bg-[#09090b]"
      contentContainerStyle={{ paddingBottom: 48 }}
      showsVerticalScrollIndicator={false}
    >
      <View className="px-5 pt-4">

        {/* Account */}
        <SectionHeader title="Account" />
        <View className="bg-[#111113] rounded-2xl px-4 mb-5">
          <SettingItem icon="person-outline" title="Personal Information" />
          <SettingItem icon="lock-closed-outline" title="Privacy & Security" />
          <SettingItem icon="key-outline" title="Change Password" isLast />
        </View>

        {/* Preferences */}
        <SectionHeader title="Preferences" />
        <View className="bg-[#111113] rounded-2xl px-4 mb-5">
          <SettingItem
            icon="notifications-outline"
            title="Push Notifications"
            hasSwitch
            switchValue={notifications}
            onSwitchChange={setNotifications}
          />
          <SettingItem
            icon="checkmark-done-outline"
            title="Read Receipts"
            subtitle="Let others know when you've read their messages"
            hasSwitch
            switchValue={readReceipts}
            onSwitchChange={setReadReceipts}
          />
          <SettingItem
            icon="eye-outline"
            title="Show Online Status"
            hasSwitch
            switchValue={onlineStatus}
            onSwitchChange={setOnlineStatus}
            isLast
          />
        </View>

        {/* Appearance */}
        <SectionHeader title="Appearance" />
        <View className="bg-[#111113] rounded-2xl px-4 mb-5">
          <SettingItem icon="contrast-outline" title="Theme" subtitle="Dark" isLast />
        </View>

        {/* Support */}
        <SectionHeader title="Support" />
        <View className="bg-[#111113] rounded-2xl px-4 mb-5">
          <SettingItem icon="help-buoy-outline" title="Help Center" />
          <SettingItem icon="document-text-outline" title="Terms of Service" />
          <SettingItem
            icon="information-circle-outline"
            title="About"
            subtitle="Version 1.0.0"
            isLast
          />
        </View>

        {/* App version footer */}
        <Text className="text-white/15 text-[12px] text-center mt-2">
          Made with ♥ · v1.0.0
        </Text>

      </View>
    </ScrollView>
  );
};

export default Settings;
