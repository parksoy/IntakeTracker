import React, { useState, useEffect } from 'react';
import {
  Modal,
  View,
  Text,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
} from 'react-native';
import { loadAllLogs } from '../utils/storage';

const DAILY_LIMIT = 23;

function formatDate(dateStr) {
  // Parse as local noon to avoid timezone-shift issues
  const [year, month, day] = dateStr.split('-').map(Number);
  const d = new Date(year, month - 1, day, 12);
  return d.toLocaleDateString('en-US', { weekday: 'long', month: 'short', day: 'numeric' });
}

function getBadgeStyle(total) {
  if (total > DAILY_LIMIT) return { bg: '#FFEBEE', text: '#C62828' };
  if (total >= 19) return { bg: '#FFF3E0', text: '#E65100' };
  return { bg: '#E8F5E9', text: '#2E7D32' };
}

export default function HistoryScreen({ visible, onClose }) {
  const [days, setDays] = useState([]);
  const [expanded, setExpanded] = useState(null);

  useEffect(() => {
    if (visible) {
      setExpanded(null);
      loadAllLogs().then(setDays);
    }
  }, [visible]);

  function renderDay({ item }) {
    const total = item.entries.reduce((sum, e) => sum + e.points, 0);
    const isExpanded = expanded === item.date;
    const badge = getBadgeStyle(total);
    const count = item.entries.length;

    return (
      <TouchableOpacity
        style={styles.dayCard}
        onPress={() => setExpanded(isExpanded ? null : item.date)}
        activeOpacity={0.75}
      >
        <View style={styles.dayHeader}>
          <View style={styles.dayLeft}>
            <Text style={styles.dayDate}>{formatDate(item.date)}</Text>
            <Text style={styles.dayCount}>
              {count} item{count !== 1 ? 's' : ''}
            </Text>
          </View>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
            <View style={[styles.totalBadge, { backgroundColor: badge.bg }]}>
              <Text style={[styles.totalBadgeText, { color: badge.text }]}>
                {total} / {DAILY_LIMIT} pts
              </Text>
            </View>
            <Text style={styles.chevron}>{isExpanded ? '▲' : '▼'}</Text>
          </View>
        </View>

        {isExpanded && (
          <View style={styles.entryList}>
            {item.entries.map((e) => (
              <View key={e.id} style={styles.entryRow}>
                <Text style={styles.entryName} numberOfLines={1}>
                  {e.name}
                </Text>
                <Text style={styles.entryMeta}>
                  {e.time}
                  {'  '}
                  <Text style={e.points === 0 ? styles.entryFree : styles.entryPts}>
                    {e.points === 0 ? 'FREE' : `${e.points} pts`}
                  </Text>
                </Text>
              </View>
            ))}
          </View>
        )}
      </TouchableOpacity>
    );
  }

  return (
    <Modal
      visible={visible}
      animationType="slide"
      presentationStyle="pageSheet"
      onRequestClose={onClose}
    >
      <SafeAreaView style={styles.container}>
        <View style={styles.header}>
          <Text style={styles.headerTitle}>History</Text>
          <TouchableOpacity onPress={onClose} style={styles.closeBtn}>
            <Text style={styles.closeBtnText}>Done</Text>
          </TouchableOpacity>
        </View>

        <FlatList
          data={days}
          keyExtractor={(item) => item.date}
          renderItem={renderDay}
          contentContainerStyle={styles.listContent}
          ListEmptyComponent={
            <View style={styles.emptyContainer}>
              <Text style={styles.emptyEmoji}>📅</Text>
              <Text style={styles.emptyTitle}>No history yet</Text>
              <Text style={styles.emptySubtitle}>Past days will appear here</Text>
            </View>
          }
        />
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
  listContent: {
    padding: 16,
    paddingBottom: 40,
  },
  dayCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    marginBottom: 10,
    paddingHorizontal: 14,
    paddingVertical: 14,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.06,
    shadowRadius: 3,
    elevation: 2,
  },
  dayHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  dayLeft: {
    flex: 1,
    marginRight: 10,
  },
  dayDate: {
    fontSize: 15,
    fontWeight: '600',
    color: '#212121',
  },
  dayCount: {
    fontSize: 12,
    color: '#9E9E9E',
    marginTop: 2,
  },
  totalBadge: {
    borderRadius: 12,
    paddingHorizontal: 10,
    paddingVertical: 4,
  },
  totalBadgeText: {
    fontSize: 12,
    fontWeight: '600',
  },
  chevron: {
    fontSize: 10,
    color: '#BDBDBD',
  },
  entryList: {
    marginTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#F0F0F0',
    paddingTop: 10,
    gap: 8,
  },
  entryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  entryName: {
    flex: 1,
    fontSize: 14,
    color: '#424242',
    marginRight: 10,
  },
  entryMeta: {
    fontSize: 13,
    color: '#9E9E9E',
  },
  entryFree: {
    color: '#2E7D32',
    fontWeight: '600',
  },
  entryPts: {
    color: '#E65100',
    fontWeight: '600',
  },
  emptyContainer: {
    alignItems: 'center',
    paddingTop: 60,
  },
  emptyEmoji: {
    fontSize: 48,
    marginBottom: 12,
  },
  emptyTitle: {
    fontSize: 17,
    fontWeight: '600',
    color: '#757575',
  },
  emptySubtitle: {
    fontSize: 14,
    color: '#BDBDBD',
    marginTop: 6,
  },
});
