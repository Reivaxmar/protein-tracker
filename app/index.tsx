import { View, Text, ScrollView, StyleSheet } from 'react-native';
import { useProteinStore } from '../store/proteinStore';
import { formatProtein, formatDate, getTodayDateString } from '../utils/helpers';
import { useMemo } from 'react';

export default function HomeScreen() {
  const today = getTodayDateString();
  // Select the stored data only (avoid constructing a new object inside selector)
  const storedTodayData = useProteinStore((state) => state.dailyProteinData[today]);
  const targetProtein = useProteinStore((state) => state.targetProtein);

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

  return (
    <ScrollView style={styles.container}>
      <View style={styles.content}>
        <View style={styles.header}>
          <Text style={styles.headerTitle}>Protein Tracker</Text>
          <Text style={styles.dateText}>{formatDate(todayData.date)}</Text>
        </View>

        <View style={styles.card}>
          <Text style={styles.cardTitle}>Today's Progress</Text>
          
          <View style={styles.statsContainer}>
            <View style={styles.statBox}>
              <Text style={styles.statValue}>{formatProtein(todayData.totalProtein)}</Text>
              <Text style={styles.statLabel}>Consumed</Text>
            </View>
            
            <View style={styles.statBox}>
              <Text style={[styles.statValue, remaining < 0 && styles.statValueOver]}>
                {formatProtein(Math.abs(remaining))}
              </Text>
              <Text style={styles.statLabel}>{remaining >= 0 ? 'Below Limit' : 'Over Limit'}</Text>
            </View>
            
            <View style={styles.statBox}>
              <Text style={styles.statValue}>{formatProtein(targetProtein)}</Text>
              <Text style={styles.statLabel}>Daily Limit</Text>
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
              {percentage.toFixed(0)}% of Daily Limit
              {isOverLimit && ' (Over Limit!)'}
            </Text>
          </View>
        </View>

        <View style={styles.card}>
          <Text style={styles.cardTitle}>Today's Meals</Text>
          {todayData.meals.length === 0 ? (
            <Text style={styles.emptyText}>No meals added yet today</Text>
          ) : (
            todayData.meals.map((meal) => (
              <View key={meal.id} style={styles.mealItem}>
                <View style={styles.mealInfo}>
                  <Text style={styles.mealName}>{meal.name}</Text>
                  <Text style={styles.mealDetails}>
                    {meal.gramsEaten}g ({meal.proteinPer100g}g protein/100g)
                  </Text>
                </View>
                <Text style={styles.mealProtein}>{formatProtein(meal.totalProtein)}</Text>
              </View>
            ))
          )}
        </View>
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
  mealName: {
    fontSize: 16,
    fontWeight: '500',
    color: '#1f2937',
    marginBottom: 4,
  },
  mealDetails: {
    fontSize: 12,
    color: '#6b7280',
  },
  mealProtein: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#3b82f6',
    marginLeft: 12,
  },
});
