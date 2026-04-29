import React, { useState, useEffect } from 'react';
import {
  Modal,
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
} from 'react-native';
import { loadAllLogs, loadTodayLog, getTodayString } from '../utils/storage';

const DAILY_LIMIT = 23;

function formatDay(dateStr) {
  const [year, month, day] = dateStr.split('-').map(Number);
  const d = new Date(year, month - 1, day, 12);
  return {
    weekday: d.toLocaleDateString('en-US', { weekday: 'short' }),
    monthDay: d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
  };
}

function getBarColor(total) {
  if (total > DAILY_LIMIT) return '#C62828';
  if (total >= 19) return '#E65100';
  return '#2E7D32';
}

export default function WeeklyScreen({ visible, onClose }) {
  const [weekData, setWeekData] = useState([]);

  useEffect(() => {
    if (!visible) return;

    async function load() {
      const today = getTodayString();
      const [todayEntries, pastLogs] = await Promise.all([loadTodayLog(), loadAllLogs()]);

      const logMap = {};
      for (const day of pastLogs) {
        logMap[day.date] = day.entries.reduce((sum, e) => sum + e.points, 0);
      }
      logMap[today] = todayEntries.reduce((sum, e) => sum + e.points, 0);

      const days = Array.from({ length: 7 }, (_, i) => {
        const d = new Date();
        d.setDate(d.getDate() - i);
        const dateStr = d.toISOString().split('T')[0];
        return { date: dateStr, total: logMap[dateStr] ?? 0, isToday: i === 0 };
      });

      setWeekData(days);
    }

    load();
  }, [visible]);

  const weekTotal = weekData.reduce((sum, d) => sum + d.total, 0);
  const weekAvg = weekData.length > 0 ? Math.round(weekTotal / weekData.length) : 0;

  return (
    <Modal
      visible={visible}
      animationType="slide"
      presentationStyle="pageSheet"
      onRequestClose={onClose}
    >
      <SafeAreaView style={styles.container}>
        <View style={styles.header}>
          <Text style={styles.headerTitle}>Weekly Summary</Text>
          <TouchableOpacity onPress={onClose} style={styles.closeBtn}>
            <Text style={styles.closeBtnText}>Done</Text>
          </TouchableOpacity>
        </View>

        <ScrollView contentContainerStyle={styles.scroll}>
          <View style={styles.summaryCard}>
            <View style={styles.statBox}>
              <Text style={styles.statValue}>{weekTotal}</Text>
              <Text style={styles.statLabel}>week total</Text>
            </View>
            <View style={styles.statDivider} />
            <View style={styles.statBox}>
              <Text style={styles.statValue}>{weekAvg}</Text>
              <Text style={styles.statLabel}>daily avg</Text>
            </View>
            <View style={styles.statDivider} />
            <View style={styles.statBox}>
              <Text style={styles.statValue}>{DAILY_LIMIT * 7}</Text>
              <Text style={styles.statLabel}>weekly budget</Text>
            </View>
          </View>

          <Text style={styles.sectionLabel}>LAST 7 DAYS</Text>

          {weekData.map((day) => {
            const { weekday, monthDay } = formatDay(day.date);
            const barFill = Math.min(day.total / DAILY_LIMIT, 1);
            const barColor = getBarColor(day.total);
            return (
              <View key={day.date} style={styles.dayRow}>
                <View style={styles.dayLabel}>
                  <Text style={[styles.dayWeekday, day.isToday && styles.todayText]}>
                    {day.isToday ? 'Today' : weekday}
                  </Text>
                  <Text style={styles.dayMonthDay}>{monthDay}</Text>
                </View>
                <View style={styles.barTrack}>
                  {barFill > 0 && (
                    <View
                      style={[
                        styles.barFill,
                        { width: `${Math.round(barFill * 100)}%`, backgroundColor: barColor },
                      ]}
                    />
                  )}
                </View>
                <Text style={[styles.dayPts, { color: barColor }]}>{day.total}</Text>
              </View>
            );
          })}
        </ScrollView>
      </SafeAreaView>
    </Modal>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F5F5',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 14,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#EEEEEE',
  },
  headerTitle: {
    fontSize: 17,
    fontWeight: '600',
    color: '#212121',
  },
  closeBtn: {
    paddingVertical: 4,
    paddingHorizontal: 8,
  },
  closeBtnText: {
    fontSize: 16,
    color: '#2E7D32',
    fontWeight: '600',
  },
  scroll: {
    padding: 16,
    paddingBottom: 40,
  },
  summaryCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 14,
    padding: 20,
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.06,
    shadowRadius: 3,
    elevation: 2,
  },
  statBox: {
    flex: 1,
    alignItems: 'center',
  },
  statValue: {
    fontSize: 22,
    fontWeight: '700',
    color: '#212121',
  },
  statLabel: {
    fontSize: 11,
    color: '#9E9E9E',
    marginTop: 4,
  },
  statDivider: {
    width: 1,
    height: 36,
    backgroundColor: '#EEEEEE',
  },
  sectionLabel: {
    fontSize: 11,
    fontWeight: '600',
    color: '#9E9E9E',
    letterSpacing: 0.8,
    marginBottom: 10,
  },
  dayRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 10,
    paddingHorizontal: 14,
    paddingVertical: 12,
    marginBottom: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.04,
    shadowRadius: 2,
    elevation: 1,
  },
  dayLabel: {
    width: 52,
  },
  dayWeekday: {
    fontSize: 13,
    fontWeight: '600',
    color: '#424242',
  },
  todayText: {
    color: '#2E7D32',
  },
  dayMonthDay: {
    fontSize: 11,
    color: '#9E9E9E',
    marginTop: 1,
  },
  barTrack: {
    flex: 1,
    height: 8,
    backgroundColor: '#F0F0F0',
    borderRadius: 4,
    marginHorizontal: 12,
    overflow: 'hidden',
  },
  barFill: {
    height: '100%',
    borderRadius: 4,
  },
  dayPts: {
    width: 28,
    textAlign: 'right',
    fontSize: 13,
    fontWeight: '600',
  },
});
