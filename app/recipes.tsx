import { View, Text, TouchableOpacity, StyleSheet, ScrollView, Alert, Modal, TextInput, Button } from 'react-native';
import { useState } from 'react';
import { useProteinStore } from '../store/proteinStore';
import { Recipe } from '../types';
import { useRouter } from 'expo-router';

export default function RecipesScreen() {
  const recipes = useProteinStore((state) => state.recipes);
  const deleteRecipe = useProteinStore((state) => state.deleteRecipe);
  const addMealFromRecipe = useProteinStore((state) => state.addMealFromRecipe);
  const router = useRouter();
  const [expandedRecipe, setExpandedRecipe] = useState<string | null>(null);
  const [promptVisible, setPromptVisible] = useState(false);
  const [promptValue, setPromptValue] = useState('1');
  const [promptRecipe, setPromptRecipe] = useState<Recipe | null>(null);

  const handleDeleteRecipe = (recipeId: string, recipeName: string) => {
    Alert.alert(
      'Delete Recipe',
      `Are you sure you want to delete "${recipeName}"?`,
      [
        {
          text: 'Cancel',
          style: 'cancel',
        },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: () => {
            deleteRecipe(recipeId);
            Alert.alert('Success', 'Recipe deleted');
          },
        },
      ]
    );
  };

  const handleLogRecipe = (recipe: Recipe) => {
    if (typeof (Alert as any).prompt === 'function') {
      Alert.prompt(
        'Log Recipe',
        `How many servings of "${recipe.name}" did you eat?`,
        [
          {
            text: 'Cancel',
            style: 'cancel',
          },
          {
            text: 'Log',
            onPress: (servings?: string) => handleSubmitPrompt(servings, recipe),
          },
        ],
        'plain-text',
        '1'
      );
    } else {
      setPromptRecipe(recipe);
      setPromptValue('1');
      setPromptVisible(true);
    }
  };

  const handleSubmitPrompt = (servingsInput?: string | null, recipeParam?: Recipe | null) => {
    const recipeToUse = recipeParam || promptRecipe;
    const servingsStr = typeof servingsInput === 'string' ? servingsInput : promptValue;
    if (!recipeToUse) return;
    const servingCount = parseFloat(servingsStr || '1');
    if (isNaN(servingCount) || servingCount <= 0) {
      Alert.alert('Error', 'Please enter a valid number of servings');
      return;
    }
    addMealFromRecipe(recipeToUse.id, servingCount);
    setPromptVisible(false);
    setPromptRecipe(null);
    Alert.alert(
      'Success',
      `Added ${servingCount} serving${servingCount > 1 ? 's' : ''} of ${recipeToUse.name} (${(recipeToUse.totalProtein * servingCount).toFixed(1)}g protein)`,
      [
        {
          text: 'View Home',
          onPress: () => router.push('/'),
        },
        {
          text: 'OK',
        },
      ]
    );
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
            <Text style={styles.emptyTitle}>No Recipes Yet</Text>
            <Text style={styles.emptyText}>
              Create your first recipe to quickly log meals with multiple ingredients
            </Text>
            <TouchableOpacity
              style={styles.createButton}
              onPress={() => router.push('/create-recipe')}
            >
              <Text style={styles.createButtonText}>Create Recipe</Text>
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
            <Text style={styles.modalTitle}>Log Recipe</Text>
            <Text style={styles.modalText}>How many servings of "{promptRecipe?.name}" did you eat?</Text>
            <TextInput
              value={promptValue}
              onChangeText={setPromptValue}
              keyboardType="numeric"
              style={styles.modalInput}
            />
            <View style={styles.modalButtons}>
              <Button
                title="Cancel"
                onPress={() => {
                  setPromptVisible(false);
                  setPromptRecipe(null);
                }}
              />
              <Button
                title="Log"
                onPress={() => handleSubmitPrompt(promptValue, promptRecipe || undefined)}
              />
            </View>
          </View>
        </View>
      </Modal>
      <View style={styles.content}>
        <View style={styles.header}>
          <Text style={styles.headerTitle}>My Recipes</Text>
          <Text style={styles.headerSubtitle}>
            {recipes.length} recipe{recipes.length !== 1 ? 's' : ''} saved
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
                      {recipe.ingredients.length} ingredient{recipe.ingredients.length !== 1 ? 's' : ''}
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
                    <Text style={styles.ingredientsTitle}>Ingredients:</Text>
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
                      <Text style={styles.logButtonText}>Log as Meal</Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                      style={styles.deleteButton}
                      onPress={() => handleDeleteRecipe(recipe.id, recipe.name)}
                    >
                      <Text style={styles.deleteButtonText}>Delete</Text>
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
          <Text style={styles.addRecipeButtonText}>+ Create New Recipe</Text>
        </TouchableOpacity>

        <View style={styles.infoCard}>
          <Text style={styles.infoTitle}>💡 Quick Tip</Text>
          <Text style={styles.infoText}>
            Tap on a recipe to see details and log it as a meal. You can specify multiple servings when logging!
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
