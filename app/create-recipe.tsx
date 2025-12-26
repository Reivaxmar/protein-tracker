import { View, Text, TextInput, TouchableOpacity, StyleSheet, ScrollView, Alert, ActivityIndicator, FlatList } from 'react-native';
import { useState, useMemo } from 'react';
import { useProteinStore } from '../store/proteinStore';
import { searchProducts, OpenFoodFactsProduct } from '../utils/api';
import { RecipeIngredient } from '../types';
import { useRouter } from 'expo-router';
import { generateUniqueId } from '../utils/helpers';

export default function CreateRecipeScreen() {
  const [recipeName, setRecipeName] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [searchResults, setSearchResults] = useState<OpenFoodFactsProduct[]>([]);
  const [searching, setSearching] = useState(false);
  const [ingredients, setIngredients] = useState<RecipeIngredient[]>([]);
  const [selectedProduct, setSelectedProduct] = useState<OpenFoodFactsProduct | null>(null);
  const [gramsForIngredient, setGramsForIngredient] = useState('');
  const addRecipe = useProteinStore((state) => state.addRecipe);
  const router = useRouter();

  const calculatedProteinForIngredient = useMemo(() => {
    if (!gramsForIngredient || !selectedProduct?.nutriments?.proteins_100g) {
      return null;
    }
    const grams = parseFloat(gramsForIngredient);
    if (isNaN(grams) || grams <= 0) {
      return null;
    }
    return ((selectedProduct.nutriments.proteins_100g * grams) / 100).toFixed(1);
  }, [gramsForIngredient, selectedProduct]);

  const handleSearch = async () => {
    if (!searchTerm.trim()) {
      Alert.alert('Error', 'Please enter a search term');
      return;
    }

    setSearching(true);
    try {
      const results = await searchProducts(searchTerm, 1, 10);
      setSearchResults(results);
      if (results.length === 0) {
        Alert.alert('No Results', 'No products found for your search term');
      }
    } catch (error) {
      Alert.alert('Error', 'Failed to search for products');
    } finally {
      setSearching(false);
    }
  };

  const handleSelectProduct = (product: OpenFoodFactsProduct) => {
    setSelectedProduct(product);
    setSearchResults([]);
    setSearchTerm('');
  };

  const handleAddIngredient = () => {
    if (!selectedProduct) {
      Alert.alert('Error', 'No product selected');
      return;
    }

    if (!selectedProduct.nutriments?.proteins_100g) {
      Alert.alert('Error', 'This product does not have protein information');
      return;
    }

    if (!gramsForIngredient || parseFloat(gramsForIngredient) <= 0) {
      Alert.alert('Error', 'Please enter a valid amount in grams');
      return;
    }

    const grams = parseFloat(gramsForIngredient);
    const proteinPer100g = selectedProduct.nutriments.proteins_100g;
    const totalProtein = (proteinPer100g * grams) / 100;

    const newIngredient: RecipeIngredient = {
      id: generateUniqueId(),
      name: selectedProduct.product_name || 'Unknown Product',
      proteinPer100g,
      gramsInRecipe: grams,
      totalProtein,
    };

    setIngredients([...ingredients, newIngredient]);
    setSelectedProduct(null);
    setGramsForIngredient('');
    Alert.alert('Success', 'Ingredient added to recipe');
  };

  const handleRemoveIngredient = (id: string) => {
    setIngredients(ingredients.filter((ing) => ing.id !== id));
  };

  const calculateTotalProtein = () => {
    return ingredients.reduce((sum, ing) => sum + ing.totalProtein, 0);
  };

  const calculateTotalGrams = () => {
    return ingredients.reduce((sum, ing) => sum + ing.gramsInRecipe, 0);
  };

  const handleSaveRecipe = () => {
    if (!recipeName.trim()) {
      Alert.alert('Error', 'Please enter a recipe name');
      return;
    }

    if (ingredients.length === 0) {
      Alert.alert('Error', 'Please add at least one ingredient');
      return;
    }

    addRecipe({
      name: recipeName.trim(),
      ingredients,
      totalProtein: calculateTotalProtein(),
      totalGrams: calculateTotalGrams(),
    });

    Alert.alert('Success', 'Recipe saved successfully!', [
      {
        text: 'OK',
        onPress: () => {
          setRecipeName('');
          setIngredients([]);
          router.push('/recipes');
        },
      },
    ]);
  };

  return (
    <ScrollView style={styles.container}>
      <View style={styles.content}>
        <View style={styles.card}>
          <Text style={styles.title}>Create New Recipe</Text>
          
          <View style={styles.formGroup}>
            <Text style={styles.label}>Recipe Name</Text>
            <TextInput
              style={styles.input}
              placeholder="e.g., Protein Sandwich"
              value={recipeName}
              onChangeText={setRecipeName}
              placeholderTextColor="#9ca3af"
            />
          </View>
        </View>

        <View style={styles.card}>
          <Text style={styles.cardTitle}>Search Ingredients</Text>
          
          <View style={styles.searchContainer}>
            <TextInput
              style={styles.searchInput}
              placeholder="Search for food..."
              value={searchTerm}
              onChangeText={setSearchTerm}
              placeholderTextColor="#9ca3af"
              onSubmitEditing={handleSearch}
            />
            <TouchableOpacity
              style={styles.searchButton}
              onPress={handleSearch}
              disabled={searching}
            >
              {searching ? (
                <ActivityIndicator size="small" color="#fff" />
              ) : (
                <Text style={styles.searchButtonText}>Search</Text>
              )}
            </TouchableOpacity>
          </View>

          {searchResults.length > 0 && (
            <View style={styles.resultsContainer}>
              <Text style={styles.resultsTitle}>Search Results:</Text>
              {searchResults.map((product, index) => (
                <TouchableOpacity
                  key={index}
                  style={styles.resultItem}
                  onPress={() => handleSelectProduct(product)}
                >
                  <View style={styles.resultInfo}>
                    <Text style={styles.resultName}>
                      {product.product_name || 'Unknown Product'}
                    </Text>
                    {product.brands && (
                      <Text style={styles.resultBrand}>{product.brands}</Text>
                    )}
                    {product.nutriments?.proteins_100g !== undefined && (
                      <Text style={styles.resultProtein}>
                        Protein: {product.nutriments.proteins_100g.toFixed(1)}g/100g
                      </Text>
                    )}
                  </View>
                </TouchableOpacity>
              ))}
            </View>
          )}

          {selectedProduct && (
            <View style={styles.selectedProductContainer}>
              <Text style={styles.selectedProductTitle}>Selected Product:</Text>
              <Text style={styles.selectedProductName}>
                {selectedProduct.product_name || 'Unknown Product'}
              </Text>
              {selectedProduct.nutriments?.proteins_100g !== undefined && (
                <Text style={styles.selectedProductProtein}>
                  Protein: {selectedProduct.nutriments.proteins_100g.toFixed(1)}g/100g
                </Text>
              )}
              
              <View style={styles.formGroup}>
                <Text style={styles.label}>Amount (grams)</Text>
                <TextInput
                  style={styles.input}
                  placeholder="e.g., 100"
                  value={gramsForIngredient}
                  onChangeText={setGramsForIngredient}
                  keyboardType="decimal-pad"
                  placeholderTextColor="#9ca3af"
                />
              </View>

              {calculatedProteinForIngredient && (
                <View style={styles.calculatedProtein}>
                  <Text style={styles.calculatedLabel}>Protein in this amount:</Text>
                  <Text style={styles.calculatedValue}>
                    {calculatedProteinForIngredient}g
                  </Text>
                </View>
              )}

              <TouchableOpacity
                style={styles.addIngredientButton}
                onPress={handleAddIngredient}
              >
                <Text style={styles.addIngredientButtonText}>Add to Recipe</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.cancelButton}
                onPress={() => {
                  setSelectedProduct(null);
                  setGramsForIngredient('');
                }}
              >
                <Text style={styles.cancelButtonText}>Cancel</Text>
              </TouchableOpacity>
            </View>
          )}
        </View>

        {ingredients.length > 0 && (
          <View style={styles.card}>
            <Text style={styles.cardTitle}>Recipe Ingredients</Text>
            {ingredients.map((ingredient) => (
              <View key={ingredient.id} style={styles.ingredientItem}>
                <View style={styles.ingredientInfo}>
                  <Text style={styles.ingredientName}>{ingredient.name}</Text>
                  <Text style={styles.ingredientDetails}>
                    {ingredient.gramsInRecipe}g ({ingredient.proteinPer100g}g protein/100g)
                  </Text>
                </View>
                <View style={styles.ingredientRight}>
                  <Text style={styles.ingredientProtein}>
                    {ingredient.totalProtein.toFixed(1)}g
                  </Text>
                  <TouchableOpacity
                    onPress={() => handleRemoveIngredient(ingredient.id)}
                  >
                    <Text style={styles.removeButton}>✕</Text>
                  </TouchableOpacity>
                </View>
              </View>
            ))}

            <View style={styles.totalContainer}>
              <Text style={styles.totalLabel}>Total Recipe:</Text>
              <View>
                <Text style={styles.totalValue}>
                  {calculateTotalProtein().toFixed(1)}g protein
                </Text>
                <Text style={styles.totalGrams}>
                  {calculateTotalGrams()}g total
                </Text>
              </View>
            </View>

            <TouchableOpacity
              style={styles.saveButton}
              onPress={handleSaveRecipe}
            >
              <Text style={styles.saveButtonText}>Save Recipe</Text>
            </TouchableOpacity>
          </View>
        )}

        <View style={styles.infoCard}>
          <Text style={styles.infoTitle}>💡 Tips</Text>
          <Text style={styles.infoText}>
            • Search for ingredients by name{'\n'}
            • Add multiple ingredients to build your recipe{'\n'}
            • Once saved, you can quickly log the recipe as a meal
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
    marginBottom: 16,
  },
  cardTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#1f2937',
    marginBottom: 16,
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
  searchContainer: {
    flexDirection: 'row',
    marginBottom: 16,
    gap: 8,
  },
  searchInput: {
    flex: 1,
    backgroundColor: '#f9fafb',
    borderWidth: 1,
    borderColor: '#d1d5db',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    color: '#1f2937',
  },
  searchButton: {
    backgroundColor: '#3b82f6',
    borderRadius: 8,
    paddingHorizontal: 20,
    justifyContent: 'center',
    alignItems: 'center',
    minWidth: 80,
  },
  searchButtonText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '600',
  },
  resultsContainer: {
    marginTop: 8,
  },
  resultsTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#374151',
    marginBottom: 8,
  },
  resultItem: {
    backgroundColor: '#f9fafb',
    borderWidth: 1,
    borderColor: '#e5e7eb',
    borderRadius: 8,
    padding: 12,
    marginBottom: 8,
  },
  resultInfo: {
    flex: 1,
  },
  resultName: {
    fontSize: 16,
    fontWeight: '500',
    color: '#1f2937',
    marginBottom: 4,
  },
  resultBrand: {
    fontSize: 14,
    color: '#6b7280',
    marginBottom: 4,
  },
  resultProtein: {
    fontSize: 14,
    fontWeight: '600',
    color: '#3b82f6',
  },
  selectedProductContainer: {
    backgroundColor: '#eff6ff',
    borderRadius: 8,
    padding: 16,
    marginTop: 16,
  },
  selectedProductTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1e40af',
    marginBottom: 8,
  },
  selectedProductName: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1f2937',
    marginBottom: 4,
  },
  selectedProductProtein: {
    fontSize: 14,
    color: '#3b82f6',
    marginBottom: 16,
  },
  calculatedProtein: {
    backgroundColor: '#dbeafe',
    borderRadius: 8,
    padding: 12,
    marginTop: 8,
    marginBottom: 16,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  calculatedLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1e40af',
  },
  calculatedValue: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#3b82f6',
  },
  addIngredientButton: {
    backgroundColor: '#3b82f6',
    borderRadius: 8,
    padding: 12,
    alignItems: 'center',
    marginBottom: 8,
  },
  addIngredientButtonText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '600',
  },
  cancelButton: {
    backgroundColor: '#f3f4f6',
    borderRadius: 8,
    padding: 12,
    alignItems: 'center',
  },
  cancelButtonText: {
    color: '#374151',
    fontSize: 16,
    fontWeight: '600',
  },
  ingredientItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
  },
  ingredientInfo: {
    flex: 1,
  },
  ingredientName: {
    fontSize: 16,
    fontWeight: '500',
    color: '#1f2937',
    marginBottom: 4,
  },
  ingredientDetails: {
    fontSize: 12,
    color: '#6b7280',
  },
  ingredientRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  ingredientProtein: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#3b82f6',
  },
  removeButton: {
    fontSize: 20,
    color: '#ef4444',
    fontWeight: 'bold',
    paddingHorizontal: 8,
  },
  totalContainer: {
    backgroundColor: '#eff6ff',
    borderRadius: 8,
    padding: 16,
    marginTop: 16,
    marginBottom: 16,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  totalLabel: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1e40af',
  },
  totalValue: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#3b82f6',
    textAlign: 'right',
  },
  totalGrams: {
    fontSize: 14,
    color: '#6b7280',
    textAlign: 'right',
  },
  saveButton: {
    backgroundColor: '#10b981',
    borderRadius: 8,
    padding: 16,
    alignItems: 'center',
  },
  saveButtonText: {
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
});
