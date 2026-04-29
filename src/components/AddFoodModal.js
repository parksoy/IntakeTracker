import React, { useState, useMemo, useEffect } from 'react';
import {
  Modal,
  View,
  Text,
  TextInput,
  TouchableOpacity,
  FlatList,
  StyleSheet,
  SafeAreaView,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { ZERO_POINT_FOODS, TRACKED_FOODS } from '../data/foods';
import { loadRecentlyUsed, saveRecentlyUsed } from '../utils/storage';

export default function AddFoodModal({ visible, onClose, onAdd }) {
  const [activeTab, setActiveTab] = useState('zero'); // 'zero' | 'tracked'
  const [search, setSearch] = useState('');
  const [customName, setCustomName] = useState('');
  const [customPoints, setCustomPoints] = useState('');
  const [servings, setServings] = useState(1);
  const [recentlyUsed, setRecentlyUsed] = useState([]); // [{ name, points }, ...]

  useEffect(() => {
    if (visible) {
      setServings(1);
      loadRecentlyUsed().then(setRecentlyUsed);
    }
  }, [visible]);

  const filteredZero = useMemo(() => {
    const q = search.toLowerCase();
    return ZERO_POINT_FOODS.filter((f) => f.name.toLowerCase().includes(q));
  }, [search]);

  const filteredTracked = useMemo(() => {
    const q = search.toLowerCase();
    return TRACKED_FOODS.filter((f) => f.name.toLowerCase().includes(q));
  }, [search]);

  function addEntry(baseName, basePoints) {
    const now = new Date();
    const time = now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    const name = servings > 1 ? `${servings}x ${baseName}` : baseName;
    const points = basePoints * servings;
    const item = { name, points };
    saveRecentlyUsed({ name: baseName, points: basePoints });
    setRecentlyUsed((prev) =>
      [{ name: baseName, points: basePoints }, ...prev.filter((f) => f.name !== baseName)].slice(
        0,
        5
      )
    );
    onAdd({ id: Date.now().toString(), ...item, time });
  }

  function handleAddPreset(food) {
    addEntry(food.name, food.points ?? 0);
  }

  function handleAddCustom() {
    const pts = parseInt(customPoints, 10);
    if (!customName.trim() || isNaN(pts) || pts < 0) return;
    addEntry(customName.trim(), pts);
    setCustomName('');
    setCustomPoints('');
  }

  function handleClose() {
    setSearch('');
    setCustomName('');
    setCustomPoints('');
    onClose();
  }

  function renderZeroItem({ item }) {
    return (
      <TouchableOpacity
        style={styles.listRow}
        onPress={() => handleAddPreset(item)}
        activeOpacity={0.7}
      >
        <View style={styles.listInfo}>
          <Text style={styles.listName}>{item.name}</Text>
          <Text style={styles.listCategory}>{item.category}</Text>
        </View>
        <View style={styles.zeroBadge}>
          <Text style={styles.zeroText}>FREE</Text>
        </View>
      </TouchableOpacity>
    );
  }

  function renderTrackedItem({ item }) {
    return (
      <TouchableOpacity
        style={styles.listRow}
        onPress={() => handleAddPreset(item)}
        activeOpacity={0.7}
      >
        <View style={styles.listInfo}>
          <Text style={styles.listName}>{item.name}</Text>
          <Text style={styles.listCategory}>{item.category}</Text>
        </View>
        <View style={styles.pointsBadge}>
          <Text style={styles.pointsText}>{item.points} pts</Text>
        </View>
      </TouchableOpacity>
    );
  }

  const recentSection =
    recentlyUsed.length > 0 ? (
      <View style={styles.recentSection}>
        <Text style={styles.recentLabel}>Recently Used</Text>
        {recentlyUsed.map((food) => {
          const isZero = food.points === 0;
          return (
            <TouchableOpacity
              key={food.name}
              style={styles.listRow}
              onPress={() => handleAddPreset(food)}
              activeOpacity={0.7}
            >
              <View style={styles.listInfo}>
                <Text style={styles.listName}>{food.name}</Text>
                <Text style={styles.listCategory}>Recently used</Text>
              </View>
              {isZero ? (
                <View style={styles.zeroBadge}>
                  <Text style={styles.zeroText}>FREE</Text>
                </View>
              ) : (
                <View style={styles.pointsBadge}>
                  <Text style={styles.pointsText}>{food.points} pts</Text>
                </View>
              )}
            </TouchableOpacity>
          );
        })}
      </View>
    ) : null;

  return (
    <Modal
      visible={visible}
      animationType="slide"
      presentationStyle="pageSheet"
      onRequestClose={handleClose}
    >
      <SafeAreaView style={styles.container}>
        <KeyboardAvoidingView
          style={{ flex: 1 }}
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        >
          {/* Header */}
          <View style={styles.header}>
            <Text style={styles.headerTitle}>Add Food</Text>
            <TouchableOpacity onPress={handleClose} style={styles.closeBtn}>
              <Text style={styles.closeBtnText}>Done</Text>
            </TouchableOpacity>
          </View>

          {/* Search */}
          <View style={styles.searchContainer}>
            <Text style={styles.searchIcon}>🔍</Text>
            <TextInput
              style={styles.searchInput}
              placeholder="Search foods..."
              placeholderTextColor="#9E9E9E"
              value={search}
              onChangeText={setSearch}
              clearButtonMode="while-editing"
            />
          </View>

          {/* Servings stepper */}
          <View style={styles.servingsRow}>
            <Text style={styles.servingsLabel}>Servings</Text>
            <View style={styles.stepper}>
              {[1, 2, 3].map((n) => (
                <TouchableOpacity
                  key={n}
                  style={[styles.stepperBtn, servings === n && styles.stepperBtnActive]}
                  onPress={() => setServings(n)}
                  activeOpacity={0.7}
                >
                  <Text style={[styles.stepperText, servings === n && styles.stepperTextActive]}>
                    {n}x
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          {/* Tabs */}
          <View style={styles.tabs}>
            <TouchableOpacity
              style={[styles.tab, activeTab === 'zero' && styles.tabActive]}
              onPress={() => setActiveTab('zero')}
            >
              <Text style={[styles.tabText, activeTab === 'zero' && styles.tabTextActive]}>
                Zero Points
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.tab, activeTab === 'tracked' && styles.tabActive]}
              onPress={() => setActiveTab('tracked')}
            >
              <Text style={[styles.tabText, activeTab === 'tracked' && styles.tabTextActive]}>
                Has Points
              </Text>
            </TouchableOpacity>
          </View>

          {/* List */}
          {activeTab === 'zero' ? (
            <FlatList
              data={filteredZero}
              keyExtractor={(item) => item.id}
              renderItem={renderZeroItem}
              contentContainerStyle={styles.listContent}
              keyboardShouldPersistTaps="handled"
              ListHeaderComponent={recentSection}
              ListEmptyComponent={<Text style={styles.emptyText}>No foods found</Text>}
            />
          ) : (
            <FlatList
              data={filteredTracked}
              keyExtractor={(item) => item.id}
              renderItem={renderTrackedItem}
              contentContainerStyle={styles.listContent}
              keyboardShouldPersistTaps="handled"
              ListHeaderComponent={recentSection}
              ListEmptyComponent={<Text style={styles.emptyText}>No foods found</Text>}
              ListFooterComponent={
                <View style={styles.customSection}>
                  <Text style={styles.customLabel}>Add custom food</Text>
                  <View style={styles.customRow}>
                    <TextInput
                      style={[styles.customInput, { flex: 1 }]}
                      placeholder="Food name"
                      placeholderTextColor="#9E9E9E"
                      value={customName}
                      onChangeText={setCustomName}
                      returnKeyType="next"
                    />
                    <TextInput
                      style={[styles.customInput, styles.customPtsInput]}
                      placeholder="Pts"
                      placeholderTextColor="#9E9E9E"
                      value={customPoints}
                      onChangeText={setCustomPoints}
                      keyboardType="number-pad"
                      returnKeyType="done"
                      onSubmitEditing={handleAddCustom}
                    />
                    <TouchableOpacity style={styles.addBtn} onPress={handleAddCustom}>
                      <Text style={styles.addBtnText}>Add</Text>
                    </TouchableOpacity>
                  </View>
                </View>
              }
            />
          )}
        </KeyboardAvoidingView>
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
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    marginHorizontal: 16,
    marginTop: 12,
    marginBottom: 4,
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  searchIcon: {
    fontSize: 14,
    marginRight: 8,
  },
  searchInput: {
    flex: 1,
    fontSize: 15,
    color: '#212121',
  },
  servingsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginHorizontal: 16,
    marginTop: 10,
    marginBottom: 2,
    backgroundColor: '#FFFFFF',
    borderRadius: 10,
    paddingHorizontal: 14,
    paddingVertical: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  servingsLabel: {
    fontSize: 14,
    fontWeight: '500',
    color: '#424242',
  },
  stepper: {
    flexDirection: 'row',
    backgroundColor: '#F0F0F0',
    borderRadius: 8,
    padding: 2,
    gap: 2,
  },
  stepperBtn: {
    paddingHorizontal: 16,
    paddingVertical: 5,
    borderRadius: 6,
  },
  stepperBtnActive: {
    backgroundColor: '#FFFFFF',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  stepperText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#757575',
  },
  stepperTextActive: {
    color: '#2E7D32',
    fontWeight: '600',
  },
  tabs: {
    flexDirection: 'row',
    marginHorizontal: 16,
    marginTop: 10,
    marginBottom: 4,
    backgroundColor: '#E0E0E0',
    borderRadius: 10,
    padding: 3,
  },
  tab: {
    flex: 1,
    paddingVertical: 8,
    alignItems: 'center',
    borderRadius: 8,
  },
  tabActive: {
    backgroundColor: '#FFFFFF',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  tabText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#757575',
  },
  tabTextActive: {
    color: '#2E7D32',
    fontWeight: '600',
  },
  listContent: {
    padding: 16,
    paddingTop: 8,
  },
  recentSection: {
    marginBottom: 8,
  },
  recentLabel: {
    fontSize: 11,
    fontWeight: '600',
    color: '#9E9E9E',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: 6,
    marginLeft: 2,
  },
  listRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 10,
    paddingVertical: 12,
    paddingHorizontal: 14,
    marginBottom: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  listInfo: {
    flex: 1,
    marginRight: 10,
  },
  listName: {
    fontSize: 15,
    fontWeight: '500',
    color: '#212121',
  },
  listCategory: {
    fontSize: 12,
    color: '#9E9E9E',
    marginTop: 2,
  },
  zeroBadge: {
    backgroundColor: '#E8F5E9',
    borderRadius: 12,
    paddingHorizontal: 10,
    paddingVertical: 4,
  },
  zeroText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#2E7D32',
  },
  pointsBadge: {
    backgroundColor: '#FFF3E0',
    borderRadius: 12,
    paddingHorizontal: 10,
    paddingVertical: 4,
  },
  pointsText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#E65100',
  },
  emptyText: {
    textAlign: 'center',
    color: '#9E9E9E',
    marginTop: 40,
    fontSize: 15,
  },
  customSection: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 14,
    marginTop: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  customLabel: {
    fontSize: 13,
    fontWeight: '600',
    color: '#757575',
    marginBottom: 10,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  customRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  customInput: {
    backgroundColor: '#F5F5F5',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 15,
    color: '#212121',
  },
  customPtsInput: {
    width: 60,
    textAlign: 'center',
  },
  addBtn: {
    backgroundColor: '#2E7D32',
    borderRadius: 8,
    paddingHorizontal: 16,
    paddingVertical: 10,
  },
  addBtnText: {
    color: '#FFFFFF',
    fontWeight: '600',
    fontSize: 15,
  },
});
