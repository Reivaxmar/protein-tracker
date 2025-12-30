import { View, Text, TextInput, TouchableOpacity, StyleSheet, ScrollView, Alert, Modal } from 'react-native';
import { useState, useMemo, useEffect } from 'react';
import { useProteinStore } from '../store/proteinStore';
import { generateUniqueId } from '../utils/helpers';

interface CalculatorIngredient {
  id: string;
  name: string;
  proteinPer100g: number;
  ratio: number; // Percentage ratio (0-100)
}

export default function CalculateAmountsScreen() {
  const targetProtein = useProteinStore((state) => state.targetProtein);
  const todayData = useProteinStore((state) => state.getTodayData());
  
  const [ingredients, setIngredients] = useState<CalculatorIngredient[]>([]);
  const [targetProteinAmount, setTargetProteinAmount] = useState('');
  const [showAddIngredient, setShowAddIngredient] = useState(false);
  const [newIngredientName, setNewIngredientName] = useState('');
  const [newIngredientProtein, setNewIngredientProtein] = useState('');
  const [newIngredientRatio, setNewIngredientRatio] = useState('');

  // Calculate remaining protein on mount
  useEffect(() => {
    const remaining = targetProtein - todayData.totalProtein;
    setTargetProteinAmount(remaining > 0 ? remaining.toFixed(1) : '0');
  }, []);

  const totalRatio = useMemo(() => {
    return ingredients.reduce((sum, ing) => sum + ing.ratio, 0);
  }, [ingredients]);

  const calculatedAmounts = useMemo(() => {
    if (!targetProteinAmount || ingredients.length === 0 || totalRatio === 0) {
      return [];
    }

    const targetProteinValue = parseFloat(targetProteinAmount);
    if (isNaN(targetProteinValue) || targetProteinValue <= 0) {
      return [];
    }

    // For each ingredient, calculate how many grams are needed
    return ingredients.map((ingredient) => {
      // Calculate the protein that should come from this ingredient based on its ratio
      const proteinFromThisIngredient = (ingredient.ratio / totalRatio) * targetProteinValue;
      
      // Calculate grams needed: if proteinPer100g = X, then grams = (proteinFromThisIngredient / X) * 100
      const gramsNeeded = (proteinFromThisIngredient / ingredient.proteinPer100g) * 100;
      
      return {
        ...ingredient,
        proteinAmount: proteinFromThisIngredient,
        gramsNeeded: gramsNeeded,
      };
    });
  }, [ingredients, targetProteinAmount, totalRatio]);

  const handleAddIngredient = () => {
    if (!newIngredientName.trim()) {
      Alert.alert('Error', 'Please enter an ingredient name');
      return;
    }

    const proteinValue = parseFloat(newIngredientProtein);
    if (isNaN(proteinValue) || proteinValue < 0) {
      Alert.alert('Error', 'Please enter a valid protein amount (g/100g)');
      return;
    }

    const ratioValue = parseFloat(newIngredientRatio);
    if (isNaN(ratioValue) || ratioValue <= 0 || ratioValue > 100) {
      Alert.alert('Error', 'Please enter a valid ratio between 1 and 100');
      return;
    }

    const newIngredient: CalculatorIngredient = {
      id: generateUniqueId(),
      name: newIngredientName.trim(),
      proteinPer100g: proteinValue,
      ratio: ratioValue,
    };

    setIngredients([...ingredients, newIngredient]);
    setNewIngredientName('');
    setNewIngredientProtein('');
    setNewIngredientRatio('');
    setShowAddIngredient(false);
    Alert.alert('Success', 'Ingredient added');
  };

  const handleRemoveIngredient = (id: string) => {
    setIngredients(ingredients.filter((ing) => ing.id !== id));
  };

  const handleUpdateRatio = (id: string, newRatio: string) => {
    const ratioValue = parseFloat(newRatio);
    if (isNaN(ratioValue) || ratioValue < 0) {
      return;
    }

    setIngredients(
      ingredients.map((ing) =>
        ing.id === id ? { ...ing, ratio: ratioValue } : ing
      )
    );
  };

  const totalProteinCheck = useMemo(() => {
    if (calculatedAmounts.length === 0) return 0;
    return calculatedAmounts.reduce((sum, item) => sum + item.proteinAmount, 0);
  }, [calculatedAmounts]);

  const totalGramsCheck = useMemo(() => {
    if (calculatedAmounts.length === 0) return 0;
    return calculatedAmounts.reduce((sum, item) => sum + item.gramsNeeded, 0);
  }, [calculatedAmounts]);

  return (
    <ScrollView style={styles.container}>
      <View style={styles.content}>
        <View style={styles.card}>
          <Text style={styles.title}>Protein Calculator</Text>
          <Text style={styles.subtitle}>
            Set a protein target and ingredient ratios to calculate exact amounts needed
          </Text>
        </View>

        <View style={styles.card}>
          <Text style={styles.cardTitle}>Target Protein</Text>
          
          <View style={styles.infoBox}>
            <Text style={styles.infoLabel}>Your Status:</Text>
            <Text style={styles.infoText}>
              Daily Limit: {targetProtein}g • Consumed: {todayData.totalProtein.toFixed(1)}g • Remaining: {Math.max(0, targetProtein - todayData.totalProtein).toFixed(1)}g
            </Text>
          </View>

          <View style={styles.formGroup}>
            <Text style={styles.label}>Protein Amount (g)</Text>
            <TextInput
              style={styles.input}
              placeholder="e.g., 50"
              value={targetProteinAmount}
              onChangeText={setTargetProteinAmount}
              keyboardType="decimal-pad"
              placeholderTextColor="#9ca3af"
            />
            <Text style={styles.hint}>
              Amount of protein you want to consume
            </Text>
          </View>
        </View>

        <View style={styles.card}>
          <Text style={styles.cardTitle}>Ingredients & Ratios</Text>
          
          {ingredients.length === 0 ? (
            <View style={styles.emptyState}>
              <Text style={styles.emptyIcon}>🥗</Text>
              <Text style={styles.emptyText}>No ingredients added yet</Text>
              <Text style={styles.emptyHint}>
                Add ingredients with their protein content and desired ratio
              </Text>
            </View>
          ) : (
            <View>
              {ingredients.map((ingredient) => (
                <View key={ingredient.id} style={styles.ingredientItem}>
                  <View style={styles.ingredientHeader}>
                    <View style={styles.ingredientInfo}>
                      <Text style={styles.ingredientName}>{ingredient.name}</Text>
                      <Text style={styles.ingredientProtein}>
                        {ingredient.proteinPer100g}g protein/100g
                      </Text>
                    </View>
                    <TouchableOpacity
                      onPress={() => handleRemoveIngredient(ingredient.id)}
                      style={styles.removeButton}
                    >
                      <Text style={styles.removeButtonText}>✕</Text>
                    </TouchableOpacity>
                  </View>
                  
                  <View style={styles.ratioInput}>
                    <Text style={styles.ratioLabel}>Ratio:</Text>
                    <TextInput
                      style={styles.ratioTextInput}
                      value={ingredient.ratio.toString()}
                      onChangeText={(text) => handleUpdateRatio(ingredient.id, text)}
                      keyboardType="decimal-pad"
                      placeholderTextColor="#9ca3af"
                    />
                    <Text style={styles.ratioUnit}>%</Text>
                  </View>
                </View>
              ))}

              <View style={styles.ratioSummary}>
                <Text style={styles.ratioSummaryLabel}>Total Ratio:</Text>
                <Text style={[
                  styles.ratioSummaryValue,
                  totalRatio !== 100 && styles.ratioSummaryWarning
                ]}>
                  {totalRatio.toFixed(1)}%
                </Text>
              </View>
              {totalRatio !== 100 && (
                <Text style={styles.ratioWarningText}>
                  💡 Tip: Ratios don't need to equal 100%. They represent relative proportions.
                </Text>
              )}
            </View>
          )}

          <TouchableOpacity
            style={styles.addButton}
            onPress={() => setShowAddIngredient(true)}
          >
            <Text style={styles.addButtonText}>+ Add Ingredient</Text>
          </TouchableOpacity>
        </View>

        {calculatedAmounts.length > 0 && (
          <View style={styles.card}>
            <Text style={styles.cardTitle}>Calculated Amounts</Text>
            
            <View style={styles.resultsContainer}>
              {calculatedAmounts.map((item) => (
                <View key={item.id} style={styles.resultItem}>
                  <View style={styles.resultHeader}>
                    <Text style={styles.resultName}>{item.name}</Text>
                    <Text style={styles.resultGrams}>{item.gramsNeeded.toFixed(1)}g</Text>
                  </View>
                  <View style={styles.resultDetails}>
                    <Text style={styles.resultDetailText}>
                      Provides: {item.proteinAmount.toFixed(1)}g protein
                    </Text>
                    <Text style={styles.resultDetailText}>
                      ({((item.ratio / totalRatio) * 100).toFixed(1)}% of total)
                    </Text>
                  </View>
                </View>
              ))}
            </View>

            <View style={styles.totalSummary}>
              <View style={styles.summaryRow}>
                <Text style={styles.summaryLabel}>Total Grams:</Text>
                <Text style={styles.summaryValue}>{totalGramsCheck.toFixed(1)}g</Text>
              </View>
              <View style={styles.summaryRow}>
                <Text style={styles.summaryLabel}>Total Protein:</Text>
                <Text style={styles.summaryValueProtein}>{totalProteinCheck.toFixed(1)}g</Text>
              </View>
            </View>
          </View>
        )}

        <View style={styles.infoCard}>
          <Text style={styles.infoTitle}>💡 How to Use</Text>
          <Text style={styles.infoCardText}>
            1. Set your target protein amount (defaults to remaining for today){'\n'}
            2. Add ingredients with their protein content per 100g{'\n'}
            3. Set the ratio for each ingredient (e.g., 30% cheese, 30% ham, 40% bacon){'\n'}
            4. See calculated amounts needed of each ingredient{'\n'}
            {'\n'}
            Example: To get 50g protein with 30% cheese (25g/100g) and 70% ham (20g/100g):{'\n'}
            • Cheese: 60g → 15g protein{'\n'}
            • Ham: 175g → 35g protein{'\n'}
            • Total: 235g → 50g protein
          </Text>
        </View>
      </View>

      {/* Add Ingredient Modal */}
      <Modal
        visible={showAddIngredient}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setShowAddIngredient(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Add Ingredient</Text>
              <TouchableOpacity onPress={() => setShowAddIngredient(false)}>
                <Text style={styles.modalCloseText}>✕</Text>
              </TouchableOpacity>
            </View>

            <ScrollView style={styles.modalBody}>
              <View style={styles.formGroup}>
                <Text style={styles.label}>Ingredient Name</Text>
                <TextInput
                  style={styles.input}
                  placeholder="e.g., Chicken Breast"
                  value={newIngredientName}
                  onChangeText={setNewIngredientName}
                  placeholderTextColor="#9ca3af"
                />
              </View>

              <View style={styles.formGroup}>
                <Text style={styles.label}>Protein per 100g</Text>
                <TextInput
                  style={styles.input}
                  placeholder="e.g., 25.5"
                  value={newIngredientProtein}
                  onChangeText={setNewIngredientProtein}
                  keyboardType="decimal-pad"
                  placeholderTextColor="#9ca3af"
                />
              </View>

              <View style={styles.formGroup}>
                <Text style={styles.label}>Ratio (%)</Text>
                <TextInput
                  style={styles.input}
                  placeholder="e.g., 30"
                  value={newIngredientRatio}
                  onChangeText={setNewIngredientRatio}
                  keyboardType="decimal-pad"
                  placeholderTextColor="#9ca3af"
                />
                <Text style={styles.hint}>
                  The proportion of this ingredient (e.g., 30 for 30%)
                </Text>
              </View>

              <TouchableOpacity
                style={styles.modalAddButton}
                onPress={handleAddIngredient}
              >
                <Text style={styles.modalAddButtonText}>Add Ingredient</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.modalCancelButton}
                onPress={() => setShowAddIngredient(false)}
              >
                <Text style={styles.modalCancelButtonText}>Cancel</Text>
              </TouchableOpacity>
            </ScrollView>
          </View>
        </View>
      </Modal>
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
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#1f2937',
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 14,
    color: '#6b7280',
  },
  cardTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#1f2937',
    marginBottom: 16,
  },
  infoBox: {
    backgroundColor: '#eff6ff',
    borderRadius: 8,
    padding: 12,
    marginBottom: 16,
  },
  infoLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1e40af',
    marginBottom: 4,
  },
  infoText: {
    fontSize: 14,
    color: '#3b82f6',
  },
  formGroup: {
    marginBottom: 16,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: '#374151',
    marginBottom: 8,
  },
  input: {
    backgroundColor: '#f9fafb',
    borderWidth: 1,
    borderColor: '#d1d5db',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    color: '#1f2937',
  },
  hint: {
    fontSize: 12,
    color: '#6b7280',
    marginTop: 4,
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: 32,
  },
  emptyIcon: {
    fontSize: 48,
    marginBottom: 12,
  },
  emptyText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#6b7280',
    marginBottom: 4,
  },
  emptyHint: {
    fontSize: 14,
    color: '#9ca3af',
    textAlign: 'center',
  },
  ingredientItem: {
    backgroundColor: '#f9fafb',
    borderRadius: 8,
    padding: 12,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#e5e7eb',
  },
  ingredientHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 8,
  },
  ingredientInfo: {
    flex: 1,
  },
  ingredientName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1f2937',
    marginBottom: 2,
  },
  ingredientProtein: {
    fontSize: 14,
    color: '#6b7280',
  },
  removeButton: {
    padding: 4,
  },
  removeButtonText: {
    fontSize: 20,
    color: '#ef4444',
    fontWeight: 'bold',
  },
  ratioInput: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#ffffff',
    borderRadius: 8,
    padding: 8,
  },
  ratioLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#374151',
    marginRight: 8,
  },
  ratioTextInput: {
    flex: 1,
    borderWidth: 1,
    borderColor: '#d1d5db',
    borderRadius: 6,
    padding: 8,
    fontSize: 16,
    color: '#1f2937',
    backgroundColor: '#f9fafb',
  },
  ratioUnit: {
    fontSize: 14,
    color: '#6b7280',
    marginLeft: 8,
  },
  ratioSummary: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#f3f4f6',
    borderRadius: 8,
    padding: 12,
    marginTop: 8,
    marginBottom: 8,
  },
  ratioSummaryLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: '#374151',
  },
  ratioSummaryValue: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#10b981',
  },
  ratioSummaryWarning: {
    color: '#f59e0b',
  },
  ratioWarningText: {
    fontSize: 12,
    color: '#78350f',
    backgroundColor: '#fef3c7',
    padding: 8,
    borderRadius: 6,
    marginBottom: 8,
  },
  addButton: {
    backgroundColor: '#3b82f6',
    borderRadius: 8,
    padding: 14,
    alignItems: 'center',
    marginTop: 8,
  },
  addButtonText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '600',
  },
  resultsContainer: {
    marginBottom: 16,
  },
  resultItem: {
    backgroundColor: '#f0fdf4',
    borderRadius: 8,
    padding: 12,
    marginBottom: 8,
    borderLeftWidth: 4,
    borderLeftColor: '#10b981',
  },
  resultHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  resultName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1f2937',
  },
  resultGrams: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#10b981',
  },
  resultDetails: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  resultDetailText: {
    fontSize: 12,
    color: '#6b7280',
  },
  totalSummary: {
    backgroundColor: '#eff6ff',
    borderRadius: 8,
    padding: 16,
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  summaryLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1e40af',
  },
  summaryValue: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#374151',
  },
  summaryValueProtein: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#3b82f6',
  },
  infoCard: {
    backgroundColor: '#fef3c7',
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: '#fcd34d',
    marginBottom: 16,
  },
  infoTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#92400e',
    marginBottom: 8,
  },
  infoCardText: {
    fontSize: 13,
    color: '#78350f',
    lineHeight: 20,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    backgroundColor: '#ffffff',
    borderRadius: 12,
    width: '90%',
    maxHeight: '80%',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#1f2937',
  },
  modalCloseText: {
    fontSize: 24,
    color: '#6b7280',
    fontWeight: 'bold',
  },
  modalBody: {
    padding: 20,
  },
  modalAddButton: {
    backgroundColor: '#3b82f6',
    borderRadius: 8,
    padding: 14,
    alignItems: 'center',
    marginBottom: 8,
  },
  modalAddButtonText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '600',
  },
  modalCancelButton: {
    backgroundColor: '#f3f4f6',
    borderRadius: 8,
    padding: 14,
    alignItems: 'center',
  },
  modalCancelButtonText: {
    color: '#374151',
    fontSize: 16,
    fontWeight: '600',
  },
});
