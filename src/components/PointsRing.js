import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import Svg, { Circle } from 'react-native-svg';

const DAILY_LIMIT = 23;
const SIZE = 200;
const STROKE_WIDTH = 14;
const RADIUS = (SIZE - STROKE_WIDTH) / 2;
const CIRCUMFERENCE = 2 * Math.PI * RADIUS;

function getRingColor(used) {
  if (used > DAILY_LIMIT) return '#C62828'; // over budget — red
  if (used >= 19) return '#EF6C00'; // caution — orange
  return '#2E7D32'; // safe — green
}

export default function PointsRing({ used }) {
  const capped = Math.max(0, used);
  const progress = Math.min(capped / DAILY_LIMIT, 1);
  const strokeDashoffset = CIRCUMFERENCE * (1 - progress);
  const color = getRingColor(capped);
  const remaining = Math.max(0, DAILY_LIMIT - capped);
  const isOver = capped > DAILY_LIMIT;

  return (
    <View style={styles.container}>
      <Svg width={SIZE} height={SIZE}>
        {/* Background track */}
        <Circle
          cx={SIZE / 2}
          cy={SIZE / 2}
          r={RADIUS}
          stroke="#E0E0E0"
          strokeWidth={STROKE_WIDTH}
          fill="none"
        />
        {/* Progress arc — rotated so it starts at top */}
        <Circle
          cx={SIZE / 2}
          cy={SIZE / 2}
          r={RADIUS}
          stroke={color}
          strokeWidth={STROKE_WIDTH}
          fill="none"
          strokeDasharray={CIRCUMFERENCE}
          strokeDashoffset={strokeDashoffset}
          strokeLinecap="round"
          rotation="-90"
          origin={`${SIZE / 2}, ${SIZE / 2}`}
        />
      </Svg>
      <View style={styles.labelContainer}>
        <Text style={[styles.usedText, { color }]}>{capped}</Text>
        <Text style={styles.limitText}>/ {DAILY_LIMIT} pts</Text>
        {isOver ? (
          <Text style={styles.overText}>over budget!</Text>
        ) : (
          <Text style={styles.remainingText}>{remaining} left</Text>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  labelContainer: {
    position: 'absolute',
    alignItems: 'center',
  },
  usedText: {
    fontSize: 42,
    fontWeight: '700',
    lineHeight: 46,
  },
  limitText: {
    fontSize: 14,
    color: '#757575',
    marginTop: 2,
  },
  remainingText: {
    fontSize: 13,
    color: '#9E9E9E',
    marginTop: 4,
  },
  overText: {
    fontSize: 13,
    color: '#C62828',
    fontWeight: '600',
    marginTop: 4,
  },
});
