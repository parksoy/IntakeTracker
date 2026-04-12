import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';

export default function FoodLogItem({ item, onDelete }) {
  const isZero = item.points === 0;

  return (
    <View style={styles.row}>
      <View style={styles.info}>
        <Text style={styles.name} numberOfLines={1}>{item.name}</Text>
        <Text style={styles.time}>{item.time}</Text>
      </View>
      <View style={[styles.badge, isZero ? styles.zeroBadge : styles.pointsBadge]}>
        <Text style={[styles.badgeText, isZero ? styles.zeroText : styles.pointsText]}>
          {isZero ? 'FREE' : `${item.points} pts`}
        </Text>
      </View>
      <TouchableOpacity onPress={() => onDelete(item.id)} style={styles.deleteBtn} hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}>
        <Text style={styles.deleteIcon}>✕</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 10,
    paddingVertical: 12,
    paddingHorizontal: 14,
    marginBottom: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.06,
    shadowRadius: 3,
    elevation: 2,
  },
  info: {
    flex: 1,
    marginRight: 10,
  },
  name: {
    fontSize: 15,
    fontWeight: '500',
    color: '#212121',
  },
  time: {
    fontSize: 12,
    color: '#9E9E9E',
    marginTop: 2,
  },
  badge: {
    borderRadius: 12,
    paddingHorizontal: 10,
    paddingVertical: 4,
    marginRight: 10,
  },
  zeroBadge: {
    backgroundColor: '#E8F5E9',
  },
  pointsBadge: {
    backgroundColor: '#FFF3E0',
  },
  badgeText: {
    fontSize: 12,
    fontWeight: '600',
  },
  zeroText: {
    color: '#2E7D32',
  },
  pointsText: {
    color: '#E65100',
  },
  deleteBtn: {
    padding: 4,
  },
  deleteIcon: {
    fontSize: 14,
    color: '#BDBDBD',
    fontWeight: '600',
  },
});
