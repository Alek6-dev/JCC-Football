import { BottomTabBarButtonProps } from '@react-navigation/bottom-tabs';
import * as Haptics from 'expo-haptics';
import { Pressable } from 'react-native';

export function HapticTab(props: BottomTabBarButtonProps) {
  const { style, onPressIn, ref: _ref, href: _href, ...rest } = props as BottomTabBarButtonProps & {
    href?: string;
    ref?: unknown;
  };

  return (
    <Pressable
      {...rest}
      accessibilityRole="button"
      style={({ pressed }) => [
        style,
        pressed && {
          opacity: 0.82,
          transform: [{ scale: 0.94 }],
        },
      ]}
      onPressIn={(ev) => {
        if (process.env.EXPO_OS === 'ios') {
          // Add a soft haptic feedback when pressing down on the tabs.
          Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
        }
        onPressIn?.(ev);
      }}
    />
  );
}
