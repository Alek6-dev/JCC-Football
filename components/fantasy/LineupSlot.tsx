import { Pressable, StyleSheet, Text, View } from 'react-native';
import Svg, { Path } from 'react-native-svg';

type Props = {
  label?: string;
  size: 'starter' | 'bench';
  style?: object;
};

const SLOT = {
  starter: { width: 54, height: 72, notch: 8 },
  bench: { width: 38, height: 50, notch: 6 },
} as const;

export default function LineupSlot({ label, size, style }: Props) {
  const dimensions = SLOT[size];
  const path = makeNotchedPath(dimensions.width, dimensions.height, dimensions.notch);

  return (
    <View style={[styles.wrapper, style]}>
      <Pressable
        style={[
          styles.slot,
          {
            width: dimensions.width,
            height: dimensions.height,
          },
        ]}
      >
        <Svg width={dimensions.width} height={dimensions.height} style={StyleSheet.absoluteFill}>
          <Path d={path} fill="rgba(7, 12, 14, 0.56)" stroke="rgba(255, 255, 255, 0.92)" strokeWidth={1.3} />
          <Path d={path} fill="none" stroke="rgba(0, 0, 0, 0.42)" strokeWidth={3.4} opacity={0.7} />
        </Svg>
        <Text style={[styles.plus, size === 'bench' && styles.benchPlus]}>+</Text>
      </Pressable>
      {label && <Text style={styles.label}>{label}</Text>}
    </View>
  );
}

function makeNotchedPath(width: number, height: number, notch: number) {
  return [
    `M ${notch} 0`,
    `L ${width - notch} 0`,
    `L ${width - notch} ${notch * 0.55}`,
    `L ${width} ${notch * 0.55}`,
    `L ${width} ${height - notch}`,
    `L ${width - notch * 0.55} ${height - notch}`,
    `L ${width - notch * 0.55} ${height}`,
    `L ${notch} ${height}`,
    `L ${notch} ${height - notch * 0.55}`,
    `L 0 ${height - notch * 0.55}`,
    `L 0 ${notch}`,
    `L ${notch * 0.55} ${notch}`,
    `L ${notch * 0.55} 0`,
    'Z',
  ].join(' ');
}

const styles = StyleSheet.create({
  wrapper: {
    position: 'absolute',
    alignItems: 'center',
  },
  slot: {
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 5 },
    shadowOpacity: 0.42,
    shadowRadius: 5,
    elevation: 8,
  },
  plus: {
    color: '#FFFFFF',
    fontSize: 28,
    fontWeight: '300',
    lineHeight: 30,
    marginTop: -2,
  },
  benchPlus: {
    fontSize: 23,
    lineHeight: 24,
  },
  label: {
    minWidth: 26,
    marginTop: -2,
    paddingHorizontal: 5,
    paddingVertical: 2,
    borderRadius: 3,
    overflow: 'hidden',
    backgroundColor: 'rgba(1, 6, 8, 0.78)',
    color: '#FFFFFF',
    fontSize: 8,
    fontWeight: '900',
    letterSpacing: 0,
    textAlign: 'center',
  },
});
