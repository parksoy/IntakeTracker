import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
  Alert,
  StatusBar,
} from 'react-native';
import PointsRing from './src/components/PointsRing';
import FoodLogItem from './src/components/FoodLogItem';
import AddFoodModal from './src/components/AddFoodModal';
import HistoryScreen from './src/components/HistoryScreen';
import { loadTodayLog, saveTodayLog, clearTodayLog } from './src/utils/storage';

const DAILY_LIMIT = 23;

export default function App() {
  const [log, setLog] = useState([]);
  const [modalVisible, setModalVisible] = useState(false);
  const [historyVisible, setHistoryVisible] = useState(false);
  const [loading, setLoading] = useState(true);

  // Load today's log on mount (also handles day-reset automatically)
  useEffect(() => {
    loadTodayLog().then(entries => {
      setLog(entries);
      setLoading(false);
    });
  }, []);

  const totalPoints = log.reduce((sum, entry) => sum + entry.points, 0);

  const handleAddFood = useCallback(async (entry) => {
    setLog(prev => {
      const updated = [entry, ...prev];
      saveTodayLog(updated);
      return updated;
    });
  }, []);

  const handleDelete = useCallback(async (id) => {
    setLog(prev => {
      const updated = prev.filter(e => e.id !== id);
      saveTodayLog(updated);
      return updated;
    });
  }, []);

  const handleClearDay = useCallback(() => {
    Alert.alert(
      'Clear Today',
      'Remove all food entries for today?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Clear',
          style: 'destructive',
          onPress: () => {
            setLog([]);
            clearTodayLog();
          },
        },
      ]
    );
  }, []);

  const today = new Date().toLocaleDateString('en-US', {
    weekday: 'long',
    month: 'short',
    day: 'numeric',
  });

  if (loading) {
    return (
      <View style={styles.loading}>
        <Text style={styles.loadingText}>Loading...</Text>
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.safe}>
      <StatusBar barStyle="dark-content" backgroundColor="#F5F5F5" />

      {/* Header */}
      <View style={styles.header}>
        <View>
          <Text style={styles.appName}>IntakeTracker</Text>
          <Text style={styles.dateText}>{today}</Text>
        </View>
        <TouchableOpacity onPress={() => setHistoryVisible(true)} style={styles.historyBtn}>
          <Text style={styles.historyBtnText}>History</Text>
        </TouchableOpacity>
      </View>

      <FlatList
        data={log}
        keyExtractor={item => item.id}
        renderItem={({ item }) => (
          <FoodLogItem item={item} onDelete={handleDelete} />
        )}
        ListHeaderComponent={
          <View>
            {/* Points Ring */}
            <View style={styles.ringSection}>
              <PointsRing used={totalPoints} />
              <Text style={styles.ringSubtitle}>
                {totalPoints > DAILY_LIMIT
                  ? `${totalPoints - DAILY_LIMIT} pts over your daily limit`
                  : 'daily point budget'}
              </Text>
            </View>

            {/* Log header */}
            {log.length > 0 && (
              <View style={styles.logHeader}>
                <Text style={styles.logTitle}>Today's Log</Text>
                <TouchableOpacity onPress={handleClearDay}>
                  <Text style={styles.clearText}>Clear day</Text>
                </TouchableOpacity>
              </View>
            )}
          </View>
        }
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyEmoji}>🍽️</Text>
            <Text style={styles.emptyTitle}>Nothing logged yet</Text>
            <Text style={styles.emptySubtitle}>Tap + to add your first food</Text>
          </View>
        }
        contentContainerStyle={styles.listContent}
      />

      {/* Floating Add Button */}
      <TouchableOpacity
        style={styles.fab}
        onPress={() => setModalVisible(true)}
        activeOpacity={0.85}
      >
        <Text style={styles.fabText}>+</Text>
      </TouchableOpacity>

      <AddFoodModal
        visible={modalVisible}
        onClose={() => setModalVisible(false)}
        onAdd={(entry) => {
          handleAddFood(entry);
          setModalVisible(false);
        }}
      />

      <HistoryScreen
        visible={historyVisible}
        onClose={() => setHistoryVisible(false)}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: '#F5F5F5',
  },
  loading: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#F5F5F5',
  },
  loadingText: {
    color: '#9E9E9E',
    fontSize: 16,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingTop: 12,
    paddingBottom: 8,
  },
  historyBtn: {
    paddingVertical: 6,
    paddingHorizontal: 12,
    backgroundColor: '#E8F5E9',
    borderRadius: 8,
  },
  historyBtnText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#2E7D32',
  },
  appName: {
    fontSize: 22,
    fontWeight: '700',
    color: '#212121',
    letterSpacing: -0.3,
  },
  dateText: {
    fontSize: 13,
    color: '#9E9E9E',
    marginTop: 2,
  },
  ringSection: {
    alignItems: 'center',
    paddingVertical: 24,
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    marginHorizontal: 0,
    marginBottom: 16,
    marginTop: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.07,
    shadowRadius: 6,
    elevation: 3,
  },
  ringSubtitle: {
    fontSize: 13,
    color: '#9E9E9E',
    marginTop: 10,
  },
  logHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  logTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#424242',
  },
  clearText: {
    fontSize: 14,
    color: '#9E9E9E',
  },
  listContent: {
    paddingBottom: 100,
    paddingHorizontal: 16,
  },
  emptyContainer: {
    alignItems: 'center',
    paddingTop: 40,
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
  fab: {
    position: 'absolute',
    bottom: 32,
    right: 24,
    width: 58,
    height: 58,
    borderRadius: 29,
    backgroundColor: '#2E7D32',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#2E7D32',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.4,
    shadowRadius: 8,
    elevation: 6,
  },
  fabText: {
    color: '#FFFFFF',
    fontSize: 30,
    fontWeight: '300',
    lineHeight: 34,
    marginTop: -2,
  },
});
