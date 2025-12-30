import { View, Text, TextInput, TouchableOpacity, StyleSheet, ScrollView, Alert, Modal, PanResponder, Animated } from 'react-native';
import React, { useState, useMemo, useRef } from 'react';
import { useProteinStore } from '../store/proteinStore';
import { generateUniqueId, getTodayDateString } from '../utils/helpers';

interface CalculatorIngredient {
  id: string;
  name: string;
  proteinPer100g: number;
}

export default function CalculateAmountsScreen() {
  const [ingredients, setIngredients] = useState<CalculatorIngredient[]>([]);
  const [sliderPoints, setSliderPoints] = useState<number[]>([]); // Positions from 0 to 100
  const [targetProteinAmount, setTargetProteinAmount] = useState('50'); // Default to 50g
  const [showAddIngredient, setShowAddIngredient] = useState(false);
  const [newIngredientName, setNewIngredientName] = useState('');
  const [newIngredientProtein, setNewIngredientProtein] = useState('');
  
  const totalProteinToday = 0; // Hardcoded for now
  const targetProtein = 150; // Hardcoded for now

  // Calculate ratios from slider points
  const ingredientRatios = useMemo(() => {
    if (ingredients.length === 0) return [];
    if (ingredients.length === 1) return [100];
    
    const ratios: number[] = [];
    const points = [0, ...sliderPoints, 100];
    
    for (let i = 0; i < points.length - 1; i++) {
      ratios.push(points[i + 1] - points[i]);
    }
    
    return ratios;
  }, [ingredients.length, sliderPoints]);

  const totalRatio = useMemo(() => {
    return ingredientRatios.reduce((sum, ratio) => sum + ratio, 0);
  }, [ingredientRatios]);

  const calculatedAmounts = useMemo(() => {
    if (!targetProteinAmount || ingredients.length === 0 || totalRatio === 0) {
      return [];
    }

    const targetProteinValue = parseFloat(targetProteinAmount);
    if (isNaN(targetProteinValue) || targetProteinValue <= 0) {
      return [];
    }

    // For each ingredient, calculate how many grams are needed
    return ingredients.map((ingredient, index) => {
      const ratio = ingredientRatios[index] || 0;
      // Calculate the protein that should come from this ingredient based on its ratio
      const proteinFromThisIngredient = (ratio / totalRatio) * targetProteinValue;
      
      // Calculate grams needed: if proteinPer100g = X, then grams = (proteinFromThisIngredient / X) * 100
      const gramsNeeded = (proteinFromThisIngredient / ingredient.proteinPer100g) * 100;
      
      return {
        ...ingredient,
        ratio,
        proteinAmount: proteinFromThisIngredient,
        gramsNeeded: gramsNeeded,
      };
    });
  }, [ingredients, ingredientRatios, targetProteinAmount, totalRatio]);

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

    const newIngredient: CalculatorIngredient = {
      id: generateUniqueId(),
      name: newIngredientName.trim(),
      proteinPer100g: proteinValue,
    };

    const newIngredients = [...ingredients, newIngredient];
    setIngredients(newIngredients);
    
    // Initialize slider points evenly distributed
    if (newIngredients.length > 1) {
      const numPoints = newIngredients.length - 1;
      const newPoints: number[] = [];
      for (let i = 1; i <= numPoints; i++) {
        newPoints.push((i / (numPoints + 1)) * 100);
      }
      setSliderPoints(newPoints);
    }
    
    setNewIngredientName('');
    setNewIngredientProtein('');
    setShowAddIngredient(false);
    Alert.alert('Success', 'Ingredient added');
  };

  const handleRemoveIngredient = (id: string) => {
    const newIngredients = ingredients.filter((ing) => ing.id !== id);
    setIngredients(newIngredients);
    
    // Recalculate slider points
    if (newIngredients.length > 1) {
      const numPoints = newIngredients.length - 1;
      const newPoints: number[] = [];
      for (let i = 1; i <= numPoints; i++) {
        newPoints.push((i / (numPoints + 1)) * 100);
      }
      setSliderPoints(newPoints);
    } else {
      setSliderPoints([]);
    }
  };

  const handleSliderPointMove = (pointIndex: number, newPosition: number) => {
    const newPoints = [...sliderPoints];
    
    // Clamp position between 0 and 100
    let clampedPosition = Math.max(0, Math.min(100, newPosition));
    
    // Ensure point stays after previous point
    if (pointIndex > 0 && clampedPosition <= sliderPoints[pointIndex - 1]) {
      clampedPosition = sliderPoints[pointIndex - 1] + 0.1;
    }
    
    // Ensure point stays before next point
    if (pointIndex < sliderPoints.length - 1 && clampedPosition >= sliderPoints[pointIndex + 1]) {
      clampedPosition = sliderPoints[pointIndex + 1] - 0.1;
    }
    
    // Also clamp against boundaries (0 and 100)
    if (pointIndex === 0) {
      clampedPosition = Math.max(0.1, clampedPosition);
    }
    if (pointIndex === sliderPoints.length - 1) {
      clampedPosition = Math.min(99.9, clampedPosition);
    }
    
    newPoints[pointIndex] = clampedPosition;
    setSliderPoints(newPoints);
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
              Daily Limit: {targetProtein}g • Consumed: {totalProteinToday.toFixed(1)}g • Remaining: {Math.max(0, targetProtein - totalProteinToday).toFixed(1)}g
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
                Add ingredients and use the slider to set ratios
              </Text>
            </View>
          ) : (
            <View>
              {/* List ingredients */}
              {ingredients.map((ingredient, index) => (
                <View key={ingredient.id} style={styles.ingredientItem}>
                  <View style={styles.ingredientHeader}>
                    <View style={styles.ingredientInfo}>
                      <Text style={styles.ingredientName}>
                        {index + 1}. {ingredient.name}
                      </Text>
                      <Text style={styles.ingredientProtein}>
                        {ingredient.proteinPer100g}g protein/100g
                      </Text>
                      <Text style={styles.ingredientRatioDisplay}>
                        Ratio: {ingredientRatios[index]?.toFixed(1) || 0}%
                      </Text>
                    </View>
                    <TouchableOpacity
                      onPress={() => handleRemoveIngredient(ingredient.id)}
                      style={styles.removeButton}
                    >
                      <Text style={styles.removeButtonText}>✕</Text>
                    </TouchableOpacity>
                  </View>
                </View>
              ))}

              {/* Visual slider for ratios (only if 2+ ingredients) */}
              {ingredients.length > 1 && (
                <View style={styles.sliderContainer}>
                  <Text style={styles.sliderTitle}>Adjust Ratios</Text>
                  <Text style={styles.sliderHint}>
                    Drag the points to adjust the proportion of each ingredient
                  </Text>
                  
                  <View style={styles.sliderWrapper}>
                    {/* Slider line */}
                    <View style={styles.sliderLine} />
                    
                    {/* Ingredient sections */}
                    {ingredients.map((ingredient, index) => {
                      const startPos = index === 0 ? 0 : sliderPoints[index - 1];
                      const endPos = index === ingredients.length - 1 ? 100 : sliderPoints[index];
                      const ratio = ingredientRatios[index] || 0;
                      
                      return (
                        <View
                          key={`section-${ingredient.id}`}
                          style={[
                            styles.sliderSection,
                            {
                              left: `${startPos}%`,
                              width: `${endPos - startPos}%`,
                            },
                          ]}
                        >
                          <Text style={styles.sliderSectionLabel} numberOfLines={1}>
                            {ingredient.name}
                          </Text>
                          <Text style={styles.sliderSectionRatio}>
                            {ratio.toFixed(0)}%
                          </Text>
                        </View>
                      );
                    })}
                    
                    {/* Draggable points */}
                    {sliderPoints.map((point, index) => (
                      <View
                        key={`point-${index}`}
                        style={[styles.sliderPoint, { left: `${point}%` }]}
                        onStartShouldSetResponder={() => true}
                        onResponderMove={(evt) => {
                          const locationX = evt.nativeEvent.locationX;
                          const sliderWidth = 300; // Approximate width
                          const newPosition = (locationX / sliderWidth) * 100;
                          handleSliderPointMove(index, point + (newPosition - point) * 0.1);
                        }}
                      >
                        <View style={styles.sliderPointHandle} />
                      </View>
                    ))}
                  </View>
                </View>
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
            3. Use the visual slider to adjust the ratio of each ingredient{'\n'}
            4. Drag the points on the slider to change proportions{'\n'}
            5. See calculated amounts needed of each ingredient{'\n'}
            {'\n'}
            The slider divides ingredients into sections - drag points to adjust!
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
                <Text style={styles.hint}>
                  Ratios will be set using the slider after adding
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
  ingredientRatioDisplay: {
    fontSize: 12,
    color: '#3b82f6',
    fontWeight: '600',
    marginTop: 2,
  },
  sliderContainer: {
    marginTop: 16,
    marginBottom: 16,
    padding: 16,
    backgroundColor: '#f9fafb',
    borderRadius: 8,
  },
  sliderTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#374151',
    marginBottom: 4,
  },
  sliderHint: {
    fontSize: 12,
    color: '#6b7280',
    marginBottom: 16,
  },
  sliderWrapper: {
    height: 80,
    position: 'relative',
    marginVertical: 20,
  },
  sliderLine: {
    position: 'absolute',
    top: 40,
    left: 0,
    right: 0,
    height: 4,
    backgroundColor: '#d1d5db',
    borderRadius: 2,
  },
  sliderSection: {
    position: 'absolute',
    top: 0,
    height: 70,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 4,
  },
  sliderSectionLabel: {
    fontSize: 11,
    color: '#374151',
    fontWeight: '500',
    textAlign: 'center',
    marginBottom: 2,
  },
  sliderSectionRatio: {
    fontSize: 13,
    color: '#3b82f6',
    fontWeight: 'bold',
    textAlign: 'center',
  },
  sliderPoint: {
    position: 'absolute',
    top: 30,
    width: 24,
    height: 24,
    marginLeft: -12,
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 10,
  },
  sliderPointHandle: {
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: '#3b82f6',
    borderWidth: 3,
    borderColor: '#ffffff',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3,
    elevation: 5,
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
