import { View, Text, TextInput, TouchableOpacity, StyleSheet, ScrollView, Alert, Modal, PanResponder, Animated } from 'react-native';
import React, { useState, useMemo, useRef, useCallback } from 'react';
import { useProteinStore } from '../store/proteinStore';
import { useLanguageStore } from '../store/languageStore';
import { useTagStore } from '../store/tagStore';
import { generateUniqueId, getTodayDateString, formatNumber } from '../utils/helpers';
import { CustomIngredient } from '../types';
import { useRouter } from 'expo-router';

interface CalculatorIngredient {
  id: string;
  name: string;
  proteinPer100g: number;
}

export default function CalculateAmountsScreen() {
  const router = useRouter();
  const t = useLanguageStore((state) => state.translations);
  const customIngredients = useProteinStore((state) => state.customIngredients);
  const addMeal = useProteinStore((state) => state.addMeal);
  const tags = useTagStore((state) => state.tags);
  
  const [ingredients, setIngredients] = useState<CalculatorIngredient[]>([]);
  const [sliderPoints, setSliderPoints] = useState<number[]>([]); // Positions from 0 to 100
  const [targetProteinAmount, setTargetProteinAmount] = useState('50'); // Default to 50g
  const [showAddIngredient, setShowAddIngredient] = useState(false);
  const [newIngredientName, setNewIngredientName] = useState('');
  const [newIngredientProtein, setNewIngredientProtein] = useState('');
  const [showLogMealModal, setShowLogMealModal] = useState(false);
  const [mealName, setMealName] = useState('');
  const [mealDate, setMealDate] = useState(getTodayDateString());
  const [selectedTag, setSelectedTag] = useState<string>('');
  const sliderWrapperRef = useRef<View>(null);
  const [sliderWidth, setSliderWidth] = useState(300);
  
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

    // The ratios represent the percentage of GRAMS for each ingredient
    // We need to find the total grams such that the protein adds up to targetProteinValue
    // Let's denote:
    // - ratio[i] = percentage of total grams for ingredient i
    // - totalGrams = the total amount of grams we need to find
    // - grams[i] = (ratio[i] / 100) * totalGrams
    // - protein[i] = grams[i] * proteinPer100g[i] / 100
    // - Sum of protein[i] = targetProteinValue
    // 
    // Therefore: Sum((ratio[i] / 100) * totalGrams * proteinPer100g[i] / 100) = targetProteinValue
    // Solving for totalGrams: totalGrams = targetProteinValue * 10000 / Sum(ratio[i] * proteinPer100g[i])
    
    const sumRatioTimesProtein = ingredients.reduce((sum, ingredient, index) => {
      const ratio = ingredientRatios[index] || 0;
      return sum + (ratio * ingredient.proteinPer100g);
    }, 0);
    
    if (sumRatioTimesProtein === 0) {
      return [];
    }
    
    const totalGrams = (targetProteinValue * 10000) / sumRatioTimesProtein;
    
    // For each ingredient, calculate how many grams are needed
    return ingredients.map((ingredient, index) => {
      const ratio = ingredientRatios[index] || 0;
      const gramsNeeded = (ratio / 100) * totalGrams;
      const proteinAmount = (gramsNeeded * ingredient.proteinPer100g) / 100;
      
      return {
        ...ingredient,
        ratio,
        proteinAmount: proteinAmount,
        gramsNeeded: gramsNeeded,
      };
    });
  }, [ingredients, ingredientRatios, targetProteinAmount, totalRatio]);

  const handleSelectCustomIngredient = (customIngredient: Pick<CustomIngredient, 'name' | 'proteinPer100g'>) => {
    setNewIngredientName(customIngredient.name);
    setNewIngredientProtein(customIngredient.proteinPer100g.toString());
  };

  const handleAddIngredient = () => {
    if (!newIngredientName.trim()) {
      Alert.alert(t.error, 'Please enter an ingredient name');
      return;
    }

    const proteinValue = parseFloat(newIngredientProtein);
    if (isNaN(proteinValue) || proteinValue < 0) {
      Alert.alert(t.error, 'Please enter a valid protein amount (g/100g)');
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
    Alert.alert(t.success, t.calculator.ingredientAdded);
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

  const handleSliderPointMove = useCallback((pointIndex: number, newPosition: number) => {
    setSliderPoints((currentPoints) => {
      const newPoints = [...currentPoints];
      
      // Clamp position between 0 and 100
      let clampedPosition = Math.max(0, Math.min(100, newPosition));
      
      // Ensure point stays after previous point
      if (pointIndex > 0 && clampedPosition <= currentPoints[pointIndex - 1]) {
        clampedPosition = currentPoints[pointIndex - 1] + 0.1;
      }
      
      // Ensure point stays before next point
      if (pointIndex < currentPoints.length - 1 && clampedPosition >= currentPoints[pointIndex + 1]) {
        clampedPosition = currentPoints[pointIndex + 1] - 0.1;
      }
      
      // Also clamp against boundaries (0 and 100)
      if (pointIndex === 0) {
        clampedPosition = Math.max(0.1, clampedPosition);
      }
      if (pointIndex === currentPoints.length - 1) {
        clampedPosition = Math.min(99.9, clampedPosition);
      }
      
      newPoints[pointIndex] = clampedPosition;
      return newPoints;
    });
  }, []); // No dependencies needed since we use functional setState

  const panResponders = useMemo(() => {
    return sliderPoints.map((_, pointIndex) => {
      return PanResponder.create({
        onStartShouldSetPanResponder: () => true,
        onMoveShouldSetPanResponder: () => true,
        onPanResponderGrant: () => {
          // Gesture started
        },
        onPanResponderMove: (evt, gestureState) => {
          if (sliderWrapperRef.current && sliderWidth > 0) {
            sliderWrapperRef.current.measure((x, y, width, height, pageX, pageY) => {
              const touchX = evt.nativeEvent.pageX;
              const relativeX = touchX - pageX;
              const percentage = Math.max(0, Math.min(100, (relativeX / width) * 100));
              handleSliderPointMove(pointIndex, percentage);
            });
          }
        },
        onPanResponderRelease: () => {
          // Gesture ended
        },
      });
    });
  }, [sliderPoints.length, sliderWidth, handleSliderPointMove]); // Include handleSliderPointMove in dependencies

  const totalProteinCheck = useMemo(() => {
    if (calculatedAmounts.length === 0) return 0;
    return calculatedAmounts.reduce((sum, item) => sum + item.proteinAmount, 0);
  }, [calculatedAmounts]);

  const totalGramsCheck = useMemo(() => {
    if (calculatedAmounts.length === 0) return 0;
    return calculatedAmounts.reduce((sum, item) => sum + item.gramsNeeded, 0);
  }, [calculatedAmounts]);

  const handleLogAsMeal = () => {
    if (ingredients.length === 0) {
      Alert.alert(t.error, t.calculator.noIngredientsToLog);
      return;
    }

    if (calculatedAmounts.length === 0) {
      Alert.alert(t.error, t.calculator.noCalculatedAmounts);
      return;
    }

    setShowLogMealModal(true);
  };

  const handleConfirmLogMeal = () => {
    if (!mealName.trim()) {
      Alert.alert(t.error, t.calculator.mealNameRequired);
      return;
    }

    const normalizedDate = mealDate.trim();
    const isValidDateFormat = /^\d{4}-\d{2}-\d{2}$/.test(normalizedDate);
    const parsedDate = new Date(normalizedDate);
    const isValidDate = isValidDateFormat && !isNaN(parsedDate.getTime()) && parsedDate.toISOString().split('T')[0] === normalizedDate;

    if (!isValidDate) {
      Alert.alert(t.error, 'Please enter a valid date in YYYY-MM-DD format');
      return;
    }

    const totalGrams = totalGramsCheck;
    const totalProtein = totalProteinCheck;
    const proteinPer100g = totalGrams > 0 ? (totalProtein / totalGrams) * 100 : 0;

    addMeal({
      name: mealName.trim(),
      proteinPer100g,
      gramsEaten: totalGrams,
      date: normalizedDate,
      tag: selectedTag || undefined,
    });

    // Close the modal immediately
    setShowLogMealModal(false);

    Alert.alert(t.success, t.calculator.mealLogged, [
      {
        text: t.quickMeal?.viewHome || 'View Home',
        onPress: () => {
          setIngredients([]);
          setSliderPoints([]);
          setMealName('');
          setMealDate(getTodayDateString());
          setSelectedTag('');
          router.push('/');
        },
      },
      {
        text: t.quickMeal?.addAnother || 'Add Another',
        onPress: () => {
          setIngredients([]);
          setSliderPoints([]);
          setMealName('');
          setMealDate(getTodayDateString());
          setSelectedTag('');
        },
      },
    ]);
  };

  return (
    <ScrollView style={styles.container}>
      <View style={styles.content}>
        <View style={styles.card}>
          <Text style={styles.title}>{t.calculator.title}</Text>
          <Text style={styles.subtitle}>{t.calculator.subtitle}</Text>
        </View>

        <View style={styles.card}>
          <Text style={styles.cardTitle}>{t.calculator.targetProtein}</Text>
          
          <View style={styles.infoBox}>
            <Text style={styles.infoLabel}>{t.calculator.yourStatus}</Text>
            <Text style={styles.infoText}>
              {t.calculator.dailyLimit} {targetProtein}g • {t.calculator.consumed} {formatNumber(totalProteinToday)}g • {t.calculator.remaining} {formatNumber(Math.max(0, targetProtein - totalProteinToday))}g
            </Text>
          </View>

          <View style={styles.formGroup}>
            <Text style={styles.label}>{t.calculator.proteinAmount}</Text>
            <TextInput
              style={styles.input}
              placeholder="e.g., 50"
              value={targetProteinAmount}
              onChangeText={setTargetProteinAmount}
              keyboardType="decimal-pad"
              placeholderTextColor="#9ca3af"
            />
            <Text style={styles.hint}>{t.calculator.hint}</Text>
          </View>
        </View>

        <View style={styles.card}>
          <Text style={styles.cardTitle}>{t.calculator.ingredientsRatios}</Text>
          
          {ingredients.length === 0 ? (
            <View style={styles.emptyState}>
              <Text style={styles.emptyIcon}>🥗</Text>
              <Text style={styles.emptyText}>{t.calculator.noIngredientsYet}</Text>
              <Text style={styles.emptyHint}>{t.calculator.noIngredientsHint}</Text>
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
                        Grams Ratio: {formatNumber(ingredientRatios[index] || 0)}%
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
                  <Text style={styles.sliderTitle}>{t.calculator.adjustGramsRatios}</Text>
                    <Text style={styles.sliderHint}>{t.calculator.adjustHint}</Text>
                  
                  <View 
                    style={styles.sliderWrapper}
                    ref={sliderWrapperRef}
                    onLayout={(event) => {
                      const { width } = event.nativeEvent.layout;
                      setSliderWidth(width);
                    }}
                  >
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
                        {...panResponders[index].panHandlers}
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
            <Text style={styles.addButtonText}>{t.calculator.addIngredient}</Text>
          </TouchableOpacity>
        </View>

        {calculatedAmounts.length > 0 && (
          <View style={styles.card}>
            <Text style={styles.cardTitle}>{t.calculator.calculatedAmounts}</Text>
            
            <View style={styles.resultsContainer}>
              {calculatedAmounts.map((item) => (
                <View key={item.id} style={styles.resultItem}>
                  <View style={styles.resultHeader}>
                    <Text style={styles.resultName}>{item.name}</Text>
                    <Text style={styles.resultGrams}>{formatNumber(item.gramsNeeded)}g</Text>
                  </View>
                  <View style={styles.resultDetails}>
                    <Text style={styles.resultDetailText}>
                      Provides: {formatNumber(item.proteinAmount)}g protein
                    </Text>
                    <Text style={styles.resultDetailText}>
                      ({formatNumber((item.ratio / totalRatio) * 100)}% of total)
                    </Text>
                  </View>
                </View>
              ))}
            </View>

            <View style={styles.totalSummary}>
              <View style={styles.summaryRow}>
                <Text style={styles.summaryLabel}>{t.calculator.totalGrams}</Text>
                <Text style={styles.summaryValue}>{formatNumber(totalGramsCheck)}g</Text>
              </View>
              <View style={styles.summaryRow}>
                <Text style={styles.summaryLabel}>{t.calculator.totalProtein}</Text>
                <Text style={styles.summaryValueProtein}>{formatNumber(totalProteinCheck)}g</Text>
              </View>
            </View>

            <TouchableOpacity
              style={styles.logMealButton}
              onPress={handleLogAsMeal}
            >
              <Text style={styles.logMealButtonText}>{t.calculator.logAsMeal}</Text>
            </TouchableOpacity>
          </View>
        )}

        <View style={styles.infoCard}>
          <Text style={styles.infoTitle}>{t.calculator.howToUse}</Text>
          <Text style={styles.infoCardText}>
            {t.calculator.howToUseText}
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
              <Text style={styles.modalTitle}>{t.calculator.addIngredient}</Text>
              <TouchableOpacity onPress={() => setShowAddIngredient(false)}>
                <Text style={styles.modalCloseText}>✕</Text>
              </TouchableOpacity>
            </View>

            <ScrollView style={styles.modalBody}>
              {customIngredients.length > 0 && (
                <View style={styles.savedIngredientsSection}>
                  <Text style={styles.savedIngredientsTitle}>📋 Saved Custom Ingredients</Text>
                  <Text style={styles.savedIngredientsHint}>Tap to use</Text>
                  <View style={styles.savedIngredientsList}>
                    {customIngredients.map((ingredient) => (
                      <TouchableOpacity
                        key={ingredient.id}
                        style={styles.savedIngredientItem}
                        onPress={() => handleSelectCustomIngredient(ingredient)}
                      >
                        <Text style={styles.savedIngredientName}>{ingredient.name}</Text>
                        <Text style={styles.savedIngredientProtein}>
                          {formatNumber(ingredient.proteinPer100g)}g/100g
                        </Text>
                      </TouchableOpacity>
                    ))}
                  </View>
                  <View style={styles.divider} />
                </View>
              )}

              <View style={styles.formGroup}>
                <Text style={styles.label}>{t.calculator.ingredientName}</Text>
                <TextInput
                  style={styles.input}
                  placeholder="e.g., Chicken Breast"
                  value={newIngredientName}
                  onChangeText={setNewIngredientName}
                  placeholderTextColor="#9ca3af"
                />
              </View>

              <View style={styles.formGroup}>
                <Text style={styles.label}>{t.calculator.proteinPer100g}</Text>
                <TextInput
                  style={styles.input}
                  placeholder="e.g., 25.5"
                  value={newIngredientProtein}
                  onChangeText={setNewIngredientProtein}
                  keyboardType="decimal-pad"
                  placeholderTextColor="#9ca3af"
                />
                <Text style={styles.hint}>{t.calculator.ratiosWillBeSet}</Text>
              </View>

              <TouchableOpacity
                style={styles.modalAddButton}
                onPress={handleAddIngredient}
              >
                <Text style={styles.modalAddButtonText}>{t.calculator.addIngredient}</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.modalCancelButton}
                onPress={() => setShowAddIngredient(false)}
              >
                <Text style={styles.modalCancelButtonText}>{t.cancel}</Text>
              </TouchableOpacity>
            </ScrollView>
          </View>
        </View>
      </Modal>

      {/* Log as Meal Modal */}
      <Modal
        visible={showLogMealModal}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setShowLogMealModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>{t.calculator.logAsMealTitle}</Text>
              <TouchableOpacity onPress={() => setShowLogMealModal(false)}>
                <Text style={styles.modalCloseText}>✕</Text>
              </TouchableOpacity>
            </View>

            <ScrollView style={styles.modalBody}>
              <View style={styles.formGroup}>
                <Text style={styles.label}>{t.calculator.mealNameLabel}</Text>
                <TextInput
                  style={styles.input}
                  placeholder={t.calculator.mealNamePlaceholder}
                  value={mealName}
                  onChangeText={setMealName}
                  placeholderTextColor="#9ca3af"
                />
              </View>

              <View style={styles.formGroup}>
                <Text style={styles.label}>Meal Date</Text>
                <TextInput
                  style={styles.input}
                  placeholder="YYYY-MM-DD"
                  value={mealDate}
                  onChangeText={setMealDate}
                  placeholderTextColor="#9ca3af"
                />
              </View>

              <View style={styles.tagSection}>
                <Text style={styles.tagLabel}>{t.calculator.selectTag}</Text>
                <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.tagScroll}>
                  <TouchableOpacity
                    style={[
                      styles.tagChip,
                      !selectedTag && styles.tagChipActive
                    ]}
                    onPress={() => setSelectedTag('')}
                  >
                    <Text style={[
                      styles.tagChipText,
                      !selectedTag && styles.tagChipTextActive
                    ]}>
                      {t.quickMeal?.tagNone || 'None'}
                    </Text>
                  </TouchableOpacity>
                  {tags.map((tag) => (
                    <TouchableOpacity
                      key={tag}
                      style={[
                        styles.tagChip,
                        selectedTag === tag && styles.tagChipActive
                      ]}
                      onPress={() => setSelectedTag(tag)}
                    >
                      <Text style={[
                        styles.tagChipText,
                        selectedTag === tag && styles.tagChipTextActive
                      ]}>
                        {tag.charAt(0).toUpperCase() + tag.slice(1).toLowerCase()}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </ScrollView>
              </View>

              <View style={styles.mealSummaryBox}>
                <Text style={styles.mealSummaryTitle}>{t.calculator.mealSummaryTitle}</Text>
                <View style={styles.summaryRow}>
                  <Text style={styles.summaryLabel}>{t.calculator.totalProtein}</Text>
                  <Text style={styles.summaryValueProtein}>{formatNumber(totalProteinCheck)}g</Text>
                </View>
                <View style={styles.summaryRow}>
                  <Text style={styles.summaryLabel}>{t.calculator.totalGrams}</Text>
                  <Text style={styles.summaryValue}>{formatNumber(totalGramsCheck)}g</Text>
                </View>
              </View>

              <TouchableOpacity
                style={styles.modalAddButton}
                onPress={handleConfirmLogMeal}
              >
                <Text style={styles.modalAddButtonText}>{t.calculator.logAsMeal}</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.modalCancelButton}
                onPress={() => setShowLogMealModal(false)}
              >
                <Text style={styles.modalCancelButtonText}>{t.cancel}</Text>
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
    marginBottom: 20,
  },
  sliderWrapper: {
    height: 100,
    position: 'relative',
    marginVertical: 20,
    userSelect: 'none',
    width: '100%',
  },
  sliderLine: {
    position: 'absolute',
    top: 48,
    left: 0,
    right: 0,
    height: 4,
    backgroundColor: '#d1d5db',
    borderRadius: 2,
  },
  sliderSection: {
    position: 'absolute',
    top: 0,
    height: 90,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 4,
    userSelect: 'none',
  },
  sliderSectionLabel: {
    fontSize: 11,
    color: '#374151',
    fontWeight: '500',
    textAlign: 'center',
    marginBottom: 2,
    userSelect: 'none',
  },
  sliderSectionRatio: {
    fontSize: 13,
    color: '#3b82f6',
    fontWeight: 'bold',
    textAlign: 'center',
    userSelect: 'none',
  },
  sliderPoint: {
    position: 'absolute',
    top: 20,
    width: 44,
    height: 44,
    marginLeft: -22,
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 10,
  },
  sliderPointHandle: {
    width: 24,
    height: 24,
    borderRadius: 12,
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
  savedIngredientsSection: {
    marginBottom: 20,
  },
  savedIngredientsTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#374151',
    marginBottom: 4,
  },
  savedIngredientsHint: {
    fontSize: 12,
    color: '#6b7280',
    marginBottom: 12,
  },
  savedIngredientsList: {
    gap: 8,
  },
  savedIngredientItem: {
    backgroundColor: '#f0fdf4',
    borderRadius: 8,
    padding: 12,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#bbf7d0',
  },
  savedIngredientName: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1f2937',
    flex: 1,
  },
  savedIngredientProtein: {
    fontSize: 14,
    fontWeight: '600',
    color: '#10b981',
  },
  divider: {
    height: 1,
    backgroundColor: '#e5e7eb',
    marginTop: 16,
  },
  logMealButton: {
    backgroundColor: '#10b981',
    borderRadius: 8,
    padding: 16,
    alignItems: 'center',
    marginTop: 16,
  },
  logMealButtonText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '600',
  },
  tagSection: {
    marginBottom: 16,
  },
  tagLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#374151',
    marginBottom: 8,
  },
  tagScroll: {
    flexDirection: 'row',
  },
  tagChip: {
    backgroundColor: '#ffffff',
    borderWidth: 2,
    borderColor: '#d1d5db',
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingVertical: 8,
    marginRight: 8,
  },
  tagChipActive: {
    backgroundColor: '#3b82f6',
    borderColor: '#3b82f6',
  },
  tagChipText: {
    fontSize: 14,
    color: '#374151',
    fontWeight: '500',
  },
  tagChipTextActive: {
    color: '#ffffff',
    fontWeight: '600',
  },
  mealSummaryBox: {
    backgroundColor: '#eff6ff',
    borderRadius: 8,
    padding: 16,
    marginBottom: 16,
  },
  mealSummaryTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1e40af',
    marginBottom: 12,
  },
});
