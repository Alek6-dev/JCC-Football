import { LinearGradient } from 'expo-linear-gradient';
import { StyleSheet, View } from 'react-native';
import Svg, { Path } from 'react-native-svg';

export default function HomeBackground() {
  return (
    <View style={StyleSheet.absoluteFill} pointerEvents="none">
      <LinearGradient
        colors={['#0D1622', '#123238', '#17142A']}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.heroBand}
      />
      <Svg width="100%" height={280} viewBox="0 0 390 280" style={styles.backgroundSvg}>
        <Path
          d="M0 188 C66 222 126 188 190 208 C263 232 318 194 390 216 L390 280 L0 280 Z"
          fill="#F2F6FA"
        />
        <Path
          d="M0 148 C70 174 121 134 190 160 C258 184 320 146 390 174 L390 218 C318 194 263 232 190 208 C126 188 66 222 0 188 Z"
          fill="#1A4650"
          opacity={0.48}
        />
      </Svg>
    </View>
  );
}

const styles = StyleSheet.create({
  heroBand: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: 470,
  },
  backgroundSvg: {
    position: 'absolute',
    top: 230,
    left: 0,
    right: 0,
  },
});
