import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

export default function StreakBadge({ streak }) {
  if (!streak) return null;

  return (
    <View style={styles.badge}>
      <Text style={styles.text}>{streak} day streak</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  badge: {
    backgroundColor: '#E8F5E9',
    paddingHorizontal: 7,
    paddingVertical: 2,
    borderRadius: 6,
  },
  text: {
    fontSize: 12,
    fontWeight: '600',
    color: '#2E7D32',
  },
});
