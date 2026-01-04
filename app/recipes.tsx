import { View, Text, TouchableOpacity, StyleSheet, ScrollView, Alert, Modal, TextInput, Button } from 'react-native';
import { useState } from 'react';
import { useProteinStore } from '../store/proteinStore';
import { useLanguageStore } from '../store/languageStore';
import { Recipe } from '../types';
import { useRouter } from 'expo-router';

export default function RecipesScreen() {
  const recipes = useProteinStore((state) => state.recipes);
  const deleteRecipe = useProteinStore((state) => state.deleteRecipe);
  const addMealFromRecipe = useProteinStore((state) => state.addMealFromRecipe);
  const t = useLanguageStore((state) => state.translations);
  const router = useRouter();
  const [expandedRecipe, setExpandedRecipe] = useState<string | null>(null);
  const [promptVisible, setPromptVisible] = useState(false);
  const [promptValue, setPromptValue] = useState('1');
  const [promptRecipe, setPromptRecipe] = useState<Recipe | null>(null);
  const [promptMode, setPromptMode] = useState<'servings' | 'grams'>('servings');

  const handleDeleteRecipe = (recipeId: string, recipeName: string) => {
    Alert.alert(
      t.recipes.deleteRecipe,
      `${t.recipes.deleteConfirm} "${recipeName}"?`,
      [
        {
          text: t.cancel,
          style: 'cancel',
        },
        {
          text: t.delete,
          style: 'destructive',
          onPress: () => {
            deleteRecipe(recipeId);
            Alert.alert(t.success, t.recipes.recipeDeleted);
          },
        },
      ]
    );
  };

  const handleLogRecipe = (recipe: Recipe) => {
    setPromptRecipe(recipe);
    setPromptValue('1');
    setPromptMode('servings');
    setPromptVisible(true);
  };

  const handleSubmitPrompt = (value: string, recipe?: Recipe) => {
    if (!recipe) return;
    
    if (promptMode === 'servings') {
      const servingCount = parseFloat(value || '1');
      if (isNaN(servingCount) || servingCount <= 0) {
        Alert.alert(t.error, t.recipes.errorInvalidServings);
        return;
      }
      
      setPromptVisible(false);
      addMealFromRecipe(recipe.id, servingCount);
      Alert.alert(
        t.success,
        `${t.recipes.addedRecipe} ${servingCount} ${servingCount > 1 ? t.recipes.servings : t.recipes.serving} of ${recipe.name} (${(recipe.totalProtein * servingCount).toFixed(1)}g protein)`,
        [
          {
            text: t.quickMeal.viewHome,
            onPress: () => router.push('/'),
          },
          {
            text: 'OK',
          },
        ]
      );
    } else {
      const gramsAmount = parseFloat(value || '0');
      if (isNaN(gramsAmount) || gramsAmount <= 0) {
        Alert.alert(t.error, t.recipes.errorInvalidGrams);
        return;
      }
      
      setPromptVisible(false);
      addMealFromRecipe(recipe.id, gramsAmount, true);
      const proteinPer100g = recipe.totalGrams > 0 ? (recipe.totalProtein / recipe.totalGrams) * 100 : 0;
      const proteinAmount = (proteinPer100g * gramsAmount) / 100;
      Alert.alert(
        t.success,
        `${t.recipes.addedRecipe} ${gramsAmount}g of ${recipe.name} (${proteinAmount.toFixed(1)}g protein)`,
        [
          {
            text: t.quickMeal.viewHome,
            onPress: () => router.push('/'),
          },
          {
            text: 'OK',
          },
        ]
      );
    }
  };

  const promptForGrams = (recipe: Recipe) => {
    setPromptRecipe(recipe);
    setPromptValue(recipe.totalGrams.toString());
    setPromptMode('grams');
    setPromptVisible(true);
  };

  const toggleRecipeExpansion = (recipeId: string) => {
    setExpandedRecipe(expandedRecipe === recipeId ? null : recipeId);
  };

  if (recipes.length === 0) {
    return (
      <View style={styles.container}>
        <View style={styles.content}>
          <View style={styles.emptyCard}>
            <Text style={styles.emptyIcon}>📖</Text>
            <Text style={styles.emptyTitle}>{t.recipes.noRecipesTitle}</Text>
            <Text style={styles.emptyText}>
              {t.recipes.noRecipesText}
            </Text>
            <TouchableOpacity
              style={styles.createButton}
              onPress={() => router.push('/create-recipe')}
            >
              <Text style={styles.createButtonText}>{t.recipes.createRecipe}</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container}>
      <Modal visible={promptVisible} transparent animationType="fade">
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>
              {promptMode === 'servings' ? t.recipes.logRecipe : t.recipes.logByWeight}
            </Text>
            <Text style={styles.modalText}>
              {promptMode === 'servings' 
                ? `${t.recipes.howMany} "${promptRecipe?.name}"?`
                : `${t.recipes.howManyGrams} "${promptRecipe?.name}"?\n\n(${t.recipes.totalRecipe} ${promptRecipe?.totalGrams}g)`
              }
            </Text>
            <TextInput
              value={promptValue}
              onChangeText={setPromptValue}
              keyboardType="numeric"
              style={styles.modalInput}
              autoFocus
            />
            <View style={styles.modalButtons}>
              <Button
                title={t.cancel}
                onPress={() => {
                  setPromptVisible(false);
                  setPromptRecipe(null);
                }}
              />
              <Button
                title={t.recipes.log}
                onPress={() => handleSubmitPrompt(promptValue, promptRecipe ?? undefined)}
              />
            </View>
          </View>
        </View>
      </Modal>
      <View style={styles.content}>
        <View style={styles.header}>
          <Text style={styles.headerTitle}>{t.recipes.title}</Text>
          <Text style={styles.headerSubtitle}>
            {recipes.length} {recipes.length !== 1 ? t.recipes.recipeSaved : t.recipes.recipe}
          </Text>
        </View>

        {recipes.map((recipe) => {
          const isExpanded = expandedRecipe === recipe.id;
          return (
            <View key={recipe.id} style={styles.recipeCard}>
              <TouchableOpacity
                onPress={() => toggleRecipeExpansion(recipe.id)}
                activeOpacity={0.7}
              >
                <View style={styles.recipeHeader}>
                  <View style={styles.recipeHeaderLeft}>
                    <Text style={styles.recipeName}>{recipe.name}</Text>
                    <Text style={styles.recipeStats}>
                      {recipe.totalProtein.toFixed(1)}g protein • {recipe.totalGrams}g total
                    </Text>
                    <Text style={styles.recipeIngredientCount}>
                      {recipe.ingredients.length} {recipe.ingredients.length !== 1 ? t.recipes.ingredients : t.recipes.ingredient}
                    </Text>
                  </View>
                  <Text style={styles.expandIcon}>
                    {isExpanded ? '▼' : '▶'}
                  </Text>
                </View>
              </TouchableOpacity>

              {isExpanded && (
                <View style={styles.recipeDetails}>
                  <View style={styles.ingredientsList}>
                    <Text style={styles.ingredientsTitle}>{t.recipes.ingredients}:</Text>
                    {recipe.ingredients.map((ingredient) => (
                      <View key={ingredient.id} style={styles.ingredientRow}>
                        <View style={styles.ingredientLeft}>
                          <Text style={styles.ingredientName}>
                            • {ingredient.name}
                          </Text>
                          <Text style={styles.ingredientAmount}>
                            {ingredient.gramsInRecipe}g
                          </Text>
                        </View>
                        <Text style={styles.ingredientProtein}>
                          {ingredient.totalProtein.toFixed(1)}g
                        </Text>
                      </View>
                    ))}
                  </View>

                  <View style={styles.recipeActions}>
                    <TouchableOpacity
                      style={styles.logButton}
                      onPress={() => handleLogRecipe(recipe)}
                    >
                      <Text style={styles.logButtonText}>{t.recipes.logAsMeal}</Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                      style={styles.deleteButton}
                      onPress={() => handleDeleteRecipe(recipe.id, recipe.name)}
                    >
                      <Text style={styles.deleteButtonText}>{t.delete}</Text>
                    </TouchableOpacity>
                  </View>
                </View>
              )}
            </View>
          );
        })}

        <TouchableOpacity
          style={styles.addRecipeButton}
          onPress={() => router.push('/create-recipe')}
        >
          <Text style={styles.addRecipeButtonText}>+ {t.recipes.createRecipe}</Text>
        </TouchableOpacity>

        <View style={styles.infoCard}>
          <Text style={styles.infoTitle}>{t.recipes.quickTip}</Text>
          <Text style={styles.infoText}>
            {t.recipes.quickTipText}
          </Text>
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
  headerSubtitle: {
    fontSize: 14,
    color: '#6b7280',
  },
  emptyCard: {
    backgroundColor: '#ffffff',
    borderRadius: 12,
    padding: 40,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  emptyIcon: {
    fontSize: 64,
    marginBottom: 16,
  },
  emptyTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#1f2937',
    marginBottom: 8,
  },
  emptyText: {
    fontSize: 16,
    color: '#6b7280',
    textAlign: 'center',
    marginBottom: 24,
    lineHeight: 24,
  },
  createButton: {
    backgroundColor: '#3b82f6',
    borderRadius: 8,
    paddingHorizontal: 24,
    paddingVertical: 12,
  },
  createButtonText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '600',
  },
  recipeCard: {
    backgroundColor: '#ffffff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  recipeHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  recipeHeaderLeft: {
    flex: 1,
  },
  recipeName: {
    fontSize: 20,
    fontWeight: '600',
    color: '#1f2937',
    marginBottom: 4,
  },
  recipeStats: {
    fontSize: 16,
    fontWeight: '600',
    color: '#3b82f6',
    marginBottom: 4,
  },
  recipeIngredientCount: {
    fontSize: 14,
    color: '#6b7280',
  },
  expandIcon: {
    fontSize: 16,
    color: '#9ca3af',
    marginLeft: 12,
  },
  recipeDetails: {
    marginTop: 16,
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: '#e5e7eb',
  },
  ingredientsList: {
    marginBottom: 16,
  },
  ingredientsTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#374151',
    marginBottom: 12,
  },
  ingredientRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 8,
    paddingLeft: 8,
  },
  ingredientLeft: {
    flex: 1,
  },
  ingredientName: {
    fontSize: 14,
    color: '#1f2937',
    marginBottom: 2,
  },
  ingredientAmount: {
    fontSize: 12,
    color: '#6b7280',
  },
  ingredientProtein: {
    fontSize: 14,
    fontWeight: '600',
    color: '#3b82f6',
    marginLeft: 12,
  },
  recipeActions: {
    flexDirection: 'row',
    gap: 8,
  },
  logButton: {
    flex: 1,
    backgroundColor: '#10b981',
    borderRadius: 8,
    padding: 12,
    alignItems: 'center',
  },
  logButtonText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '600',
  },
  deleteButton: {
    backgroundColor: '#ef4444',
    borderRadius: 8,
    paddingHorizontal: 16,
    justifyContent: 'center',
  },
  deleteButtonText: {
    color: '#ffffff',
    fontSize: 14,
    fontWeight: '600',
  },
  addRecipeButton: {
    backgroundColor: '#3b82f6',
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    marginTop: 8,
    marginBottom: 16,
  },
  addRecipeButtonText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '600',
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
  infoText: {
    fontSize: 14,
    color: '#78350f',
    lineHeight: 20,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.4)',
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
    shadowOpacity: 0.2,
    shadowRadius: 6,
    elevation: 5,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '700',
    marginBottom: 8,
  },
  modalText: {
    fontSize: 14,
    color: '#374151',
    marginBottom: 12,
  },
  modalInput: {
    borderWidth: 1,
    borderColor: '#e5e7eb',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 8,
    marginBottom: 12,
  },
  modalButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
});
