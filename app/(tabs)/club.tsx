import { StyleSheet, Text, View } from 'react-native';

export default function ClubScreen() {
  return (
    <View style={styles.container}>
      <Text style={styles.text}>Mon Club</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#0f0f0f',
  },
  text: {
    color: '#ffffff',
    fontSize: 18,
    fontWeight: '600',
  },
});
