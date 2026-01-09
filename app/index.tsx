import { View, Text, ScrollView, StyleSheet, TouchableOpacity, Alert, Modal, TextInput } from 'react-native';
import { useProteinStore } from '../store/proteinStore';
import { useLanguageStore } from '../store/languageStore';
import { formatProtein, formatDate, getTodayDateString, formatNumber } from '../utils/helpers';
import { useMemo, useState } from 'react';

export default function HomeScreen() {
  const today = getTodayDateString();
  const t = useLanguageStore((state) => state.translations);
  const language = useLanguageStore((state) => state.language);
  const deleteMeal = useProteinStore((state) => state.deleteMeal);
  const updateMeal = useProteinStore((state) => state.updateMeal);
  // Select the stored data only (avoid constructing a new object inside selector)
  const storedTodayData = useProteinStore((state) => state.dailyProteinData[today]);
  const targetProtein = useProteinStore((state) => state.targetProtein);

  const [editModalVisible, setEditModalVisible] = useState(false);
  const [editingMeal, setEditingMeal] = useState<any>(null);
  const [editGrams, setEditGrams] = useState('');

  // Create a stable fallback object only when necessary
  const todayData = useMemo(() => {
    if (storedTodayData) return storedTodayData;
    return {
      date: today,
      totalProtein: 0,
      targetProtein,
      meals: [] as any[],
    };
  }, [storedTodayData, today, targetProtein]);

  const remaining = targetProtein - todayData.totalProtein;
  const percentage = Math.min((todayData.totalProtein / targetProtein) * 100, 100);
  const isNearLimit = percentage >= 80;
  const isOverLimit = todayData.totalProtein > targetProtein;

  const handleDeleteMeal = (mealId: string, mealName: string) => {
    Alert.alert(
      'Delete Meal',
      `Are you sure you want to delete "${mealName}"?`,
      [
        {
          text: t.cancel,
          style: 'cancel',
        },
        {
          text: t.delete,
          style: 'destructive',
          onPress: () => {
            deleteMeal(mealId, today);
          },
        },
      ]
    );
  };

  const handleEditMeal = (meal: any) => {
    setEditingMeal(meal);
    setEditGrams(meal.gramsEaten.toString());
    setEditModalVisible(true);
  };

  const handleSaveEdit = () => {
    if (!editingMeal) return;
    
    const newGrams = parseFloat(editGrams);
    if (isNaN(newGrams) || newGrams <= 0) {
      Alert.alert(t.error, 'Please enter a valid amount in grams');
      return;
    }

    updateMeal(editingMeal.id, today, { gramsEaten: newGrams });
    setEditModalVisible(false);
    setEditingMeal(null);
  };

  return (
    <ScrollView style={styles.container}>
      <View style={styles.content}>
        <View style={styles.header}>
          <Text style={styles.headerTitle}>{t.home.title}</Text>
          <Text style={styles.dateText}>{formatDate(todayData.date, language)}</Text>
        </View>

        <View style={styles.card}>
          <Text style={styles.cardTitle}>{t.home.todaysProgress}</Text>
          
          <View style={styles.statsContainer}>
            <View style={styles.statBox}>
              <Text style={styles.statValue}>{formatProtein(todayData.totalProtein)}</Text>
              <Text style={styles.statLabel}>{t.home.consumed}</Text>
            </View>
            
            <View style={styles.statBox}>
              <Text style={[styles.statValue, remaining < 0 && styles.statValueOver]}>
                {formatProtein(Math.abs(remaining))}
              </Text>
              <Text style={styles.statLabel}>{remaining >= 0 ? t.home.belowLimit : t.home.overLimit}</Text>
            </View>
            
            <View style={styles.statBox}>
              <Text style={styles.statValue}>{formatProtein(targetProtein)}</Text>
              <Text style={styles.statLabel}>{t.home.dailyLimit}</Text>
            </View>
          </View>

          <View style={styles.progressBarContainer}>
            <View style={styles.progressBarBackground}>
              <View 
                style={[
                  styles.progressBarFill, 
                  { width: `${percentage}%` },
                  isNearLimit && !isOverLimit && styles.progressBarWarning,
                  isOverLimit && styles.progressBarDanger,
                ]} 
              />
            </View>
            <Text style={styles.progressText}>
              {formatNumber(percentage, 0)}% {t.home.ofDailyLimit}
              {isOverLimit && ` (${t.home.overLimit}!)`}
            </Text>
          </View>
        </View>

        <View style={styles.card}>
          <Text style={styles.cardTitle}>{t.home.todaysMeals}</Text>
          {todayData.meals.length === 0 ? (
            <Text style={styles.emptyText}>{t.home.noMealsYet}</Text>
          ) : (
            todayData.meals.map((meal) => (
              <View key={meal.id} style={styles.mealItem}>
                <View style={styles.mealInfo}>
                  <View style={styles.mealNameRow}>
                    <Text style={styles.mealName}>{meal.name}</Text>
                    {meal.tag && (
                      <View style={styles.mealTag}>
                        <Text style={styles.mealTagText}>{meal.tag}</Text>
                      </View>
                    )}
                  </View>
                  <Text style={styles.mealDetails}>
                    {meal.gramsEaten}g ({formatNumber(meal.proteinPer100g)}{t.home.proteinPer100g})
                  </Text>
                </View>
                <View style={styles.mealActions}>
                  <Text style={styles.mealProtein}>{formatProtein(meal.totalProtein)}</Text>
                  <View style={styles.mealButtons}>
                    <TouchableOpacity
                      onPress={() => handleEditMeal(meal)}
                      style={styles.editButton}
                    >
                      <Text style={styles.editButtonText}>{t.edit}</Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                      onPress={() => handleDeleteMeal(meal.id, meal.name)}
                      style={styles.deleteButton}
                    >
                      <Text style={styles.deleteButtonText}>{t.delete}</Text>
                    </TouchableOpacity>
                  </View>
                </View>
              </View>
            ))
          )}
        </View>

        {/* Edit Meal Modal */}
        <Modal visible={editModalVisible} transparent animationType="fade">
          <View style={styles.modalOverlay}>
            <View style={styles.modalContent}>
              <Text style={styles.modalTitle}>Edit Meal</Text>
              {editingMeal && (
                <>
                  <Text style={styles.modalText}>{editingMeal.name}</Text>
                  <Text style={styles.modalLabel}>Amount (grams):</Text>
                  <TextInput
                    value={editGrams}
                    onChangeText={setEditGrams}
                    keyboardType="numeric"
                    style={styles.modalInput}
                    autoFocus
                  />
                  <Text style={styles.modalCalculation}>
                    Protein: {formatNumber((editingMeal.proteinPer100g * parseFloat(editGrams || '0')) / 100)}g
                  </Text>
                </>
              )}
              <View style={styles.modalButtons}>
                <TouchableOpacity
                  style={styles.modalCancelButton}
                  onPress={() => {
                    setEditModalVisible(false);
                    setEditingMeal(null);
                  }}
                >
                  <Text style={styles.modalCancelText}>{t.cancel}</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={styles.modalSaveButton}
                  onPress={handleSaveEdit}
                >
                  <Text style={styles.modalSaveText}>{t.save}</Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </Modal>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f3f4f6',
  },
  content: {
    padding: 16,
  },
  header: {
    marginBottom: 24,
  },
  headerTitle: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#1f2937',
    marginBottom: 4,
  },
  dateText: {
    fontSize: 14,
    color: '#6b7280',
  },
  card: {
    backgroundColor: '#ffffff',
    borderRadius: 12,
    padding: 20,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  cardTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#1f2937',
    marginBottom: 16,
  },
  statsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 24,
  },
  statBox: {
    alignItems: 'center',
    flex: 1,
  },
  statValue: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#3b82f6',
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 12,
    color: '#6b7280',
    textTransform: 'uppercase',
  },
  progressBarContainer: {
    alignItems: 'center',
  },
  progressBarBackground: {
    width: '100%',
    height: 24,
    backgroundColor: '#e5e7eb',
    borderRadius: 12,
    overflow: 'hidden',
    marginBottom: 8,
  },
  progressBarFill: {
    height: '100%',
    backgroundColor: '#3b82f6',
  },
  progressBarWarning: {
    backgroundColor: '#f59e0b',
  },
  progressBarDanger: {
    backgroundColor: '#ef4444',
  },
  statValueOver: {
    color: '#ef4444',
  },
  progressText: {
    fontSize: 14,
    color: '#6b7280',
    fontWeight: '500',
  },
  emptyText: {
    fontSize: 14,
    color: '#6b7280',
    textAlign: 'center',
    paddingVertical: 20,
  },
  mealItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
  },
  mealInfo: {
    flex: 1,
  },
  mealActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  mealButtons: {
    flexDirection: 'row',
    gap: 4,
  },
  editButton: {
    backgroundColor: '#3b82f6',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 8,
    justifyContent: 'center',
    alignItems: 'center',
  },
  editButtonText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '600',
  },
  deleteButton: {
    backgroundColor: '#ef4444',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 8,
    justifyContent: 'center',
    alignItems: 'center',
  },
  deleteButtonText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '600',
  },
  mealNameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    flexWrap: 'wrap',
    gap: 8,
    marginBottom: 4,
  },
  mealName: {
    fontSize: 16,
    fontWeight: '500',
    color: '#1f2937',
  },
  mealTag: {
    backgroundColor: '#dbeafe',
    borderRadius: 12,
    paddingHorizontal: 10,
    paddingVertical: 3,
  },
  mealTagText: {
    fontSize: 11,
    color: '#3b82f6',
    fontWeight: '600',
    textTransform: 'uppercase',
  },
  mealDetails: {
    fontSize: 12,
    color: '#6b7280',
  },
  mealProtein: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#3b82f6',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    width: '90%',
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#1f2937',
    marginBottom: 12,
  },
  modalText: {
    fontSize: 16,
    color: '#374151',
    marginBottom: 8,
  },
  modalLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#374151',
    marginBottom: 8,
  },
  modalInput: {
    borderWidth: 1,
    borderColor: '#d1d5db',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    marginBottom: 12,
  },
  modalCalculation: {
    fontSize: 14,
    color: '#3b82f6',
    fontWeight: '600',
    marginBottom: 16,
  },
  modalButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 12,
  },
  modalCancelButton: {
    flex: 1,
    backgroundColor: '#f3f4f6',
    borderRadius: 8,
    padding: 12,
    alignItems: 'center',
  },
  modalCancelText: {
    color: '#374151',
    fontSize: 16,
    fontWeight: '600',
  },
  modalSaveButton: {
    flex: 1,
    backgroundColor: '#3b82f6',
    borderRadius: 8,
    padding: 12,
    alignItems: 'center',
  },
  modalSaveText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '600',
  },
});
