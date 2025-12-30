import { View, Text, TextInput, TouchableOpacity, StyleSheet, ScrollView, Alert, ActivityIndicator, FlatList, Modal } from 'react-native';
import { useState, useMemo } from 'react';
import { useProteinStore } from '../store/proteinStore';
import { searchProducts, OpenFoodFactsProduct, fetchProductByBarcode, ProductSearchFilters } from '../utils/api';
import { RecipeIngredient } from '../types';
import { useRouter } from 'expo-router';
import { generateUniqueId } from '../utils/helpers';
import { CameraView, Camera } from 'expo-camera';

const SEARCH_PAGE_SIZE = 10;
const SEARCH_PAGE_NUMBER = 1;

// Common food categories
const FOOD_CATEGORIES = [
  { label: 'All', value: '' },
  { label: 'Meats', value: 'meats' },
  { label: 'Dairy', value: 'dairies' },
  { label: 'Fish', value: 'fish' },
  { label: 'Vegetables', value: 'vegetables' },
  { label: 'Fruits', value: 'fruits' },
  { label: 'Grains', value: 'cereals-and-potatoes' },
  { label: 'Legumes', value: 'legumes' },
];

export default function CreateRecipeScreen() {
  const router = useRouter();
  
  const [recipeName, setRecipeName] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [searchResults, setSearchResults] = useState<OpenFoodFactsProduct[]>([]);
  const [searching, setSearching] = useState(false);
  const [ingredients, setIngredients] = useState<RecipeIngredient[]>([]);
  const [selectedProduct, setSelectedProduct] = useState<OpenFoodFactsProduct | null>(null);
  const [gramsForIngredient, setGramsForIngredient] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [minProtein, setMinProtein] = useState('');
  const [brandFilter, setBrandFilter] = useState('');
  const [showFilters, setShowFilters] = useState(false);
  const [showScanner, setShowScanner] = useState(false);
  const [hasPermission, setHasPermission] = useState<boolean | null>(null);
  const [scanned, setScanned] = useState(false);
  const [scanLoading, setScanLoading] = useState(false);
  const [showCustomIngredient, setShowCustomIngredient] = useState(false);
  const [customIngredientName, setCustomIngredientName] = useState('');
  const [customIngredientProtein, setCustomIngredientProtein] = useState('');
  const [customIngredientGrams, setCustomIngredientGrams] = useState('');
  
  const addRecipe = useProteinStore((state) => state.addRecipe);

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

  const handleBarcodeScanned = async (barcode: string) => {
    setScanLoading(true);
    setScanned(true);
    
    try {
      const productData = await fetchProductByBarcode(barcode);
      
      if (productData) {
        setSelectedProduct(productData);
        setShowScanner(false);
        setScanned(false);
        setScanLoading(false);
      } else {
        setScanLoading(false);
        Alert.alert(
          'Product Not Found',
          `No product information found for barcode: ${barcode}`,
          [
            {
              text: 'Try Again',
              onPress: () => setScanned(false),
            },
            {
              text: 'Cancel',
              onPress: () => {
                setShowScanner(false);
                setScanned(false);
              },
            },
          ]
        );
      }
    } catch (error) {
      setScanLoading(false);
      Alert.alert('Error', 'Failed to fetch product information. Please try again.', [
        {
          text: 'OK',
          onPress: () => setScanned(false),
        },
      ]);
    }
  };

  const openScanner = async () => {
    const { status } = await Camera.requestCameraPermissionsAsync();
    setHasPermission(status === 'granted');
    
    if (status === 'granted') {
      setShowScanner(true);
      setScanned(false);
    } else {
      Alert.alert('Permission Required', 'Camera permission is required to scan barcodes.');
    }
  };

  const handleSearch = async () => {
    if (!searchTerm.trim()) {
      Alert.alert('Error', 'Please enter a search term');
      return;
    }

    setSearching(true);
    try {
      const filters: ProductSearchFilters = {};
      
      if (selectedCategory) {
        filters.category = selectedCategory;
      }
      
      if (minProtein && parseFloat(minProtein) > 0) {
        filters.minProtein = parseFloat(minProtein);
      }
      
      if (brandFilter && brandFilter.trim()) {
        filters.brand = brandFilter.trim();
      }
      
      const results = await searchProducts(searchTerm, SEARCH_PAGE_NUMBER, SEARCH_PAGE_SIZE, filters);
      setSearchResults(results);
      if (results.length === 0) {
        Alert.alert('No Results', 'No products found matching your criteria');
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

  const handleAddCustomIngredient = () => {
    if (!customIngredientName.trim()) {
      Alert.alert('Error', 'Please enter an ingredient name');
      return;
    }

    if (!customIngredientProtein || parseFloat(customIngredientProtein) < 0) {
      Alert.alert('Error', 'Please enter a valid protein amount (g/100g)');
      return;
    }

    if (!customIngredientGrams || parseFloat(customIngredientGrams) <= 0) {
      Alert.alert('Error', 'Please enter a valid amount in grams');
      return;
    }

    const grams = parseFloat(customIngredientGrams);
    const proteinPer100g = parseFloat(customIngredientProtein);
    const totalProtein = (proteinPer100g * grams) / 100;

    const newIngredient: RecipeIngredient = {
      id: generateUniqueId(),
      name: customIngredientName.trim(),
      proteinPer100g,
      gramsInRecipe: grams,
      totalProtein,
    };

    setIngredients([...ingredients, newIngredient]);
    setCustomIngredientName('');
    setCustomIngredientProtein('');
    setCustomIngredientGrams('');
    setShowCustomIngredient(false);
    Alert.alert('Success', 'Custom ingredient added to recipe');
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

          <View style={styles.actionButtons}>
            <TouchableOpacity
              style={styles.filterButton}
              onPress={() => setShowFilters(!showFilters)}
            >
              <Text style={styles.filterButtonText}>
                {showFilters ? '▼ Filters' : '▶ Filters'}
              </Text>
            </TouchableOpacity>
            
            <TouchableOpacity
              style={styles.scanButton}
              onPress={openScanner}
            >
              <Text style={styles.scanButtonText}>📷 Scan Barcode</Text>
            </TouchableOpacity>
          </View>

          <TouchableOpacity
            style={styles.customIngredientButton}
            onPress={() => setShowCustomIngredient(true)}
          >
            <Text style={styles.customIngredientButtonText}>➕ Add Custom Ingredient</Text>
          </TouchableOpacity>

          {showFilters && (
            <View style={styles.filtersContainer}>
              <Text style={styles.filterLabel}>Category</Text>
              <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.categoryScroll}>
                {FOOD_CATEGORIES.map((category) => (
                  <TouchableOpacity
                    key={category.value}
                    style={[
                      styles.categoryChip,
                      selectedCategory === category.value && styles.categoryChipActive
                    ]}
                    onPress={() => setSelectedCategory(category.value)}
                  >
                    <Text style={[
                      styles.categoryChipText,
                      selectedCategory === category.value && styles.categoryChipTextActive
                    ]}>
                      {category.label}
                    </Text>
                  </TouchableOpacity>
                ))}
              </ScrollView>
              
              <Text style={styles.filterLabel}>Minimum Protein (g/100g)</Text>
              <TextInput
                style={styles.filterInput}
                placeholder="e.g., 10"
                value={minProtein}
                onChangeText={setMinProtein}
                keyboardType="decimal-pad"
                placeholderTextColor="#9ca3af"
              />
              
              <Text style={styles.filterLabel}>Brand / Manufacturer</Text>
              <TextInput
                style={styles.filterInput}
                placeholder="e.g., Nestle, Danone"
                value={brandFilter}
                onChangeText={setBrandFilter}
                placeholderTextColor="#9ca3af"
              />
            </View>
          )}

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
            • Use filters to narrow down results (category, brand, protein){'\n'}
            • Scan barcodes to quickly add packaged foods{'\n'}
            • Add custom ingredients with your own protein values{'\n'}
            • Add multiple ingredients to build your recipe{'\n'}
            • Once saved, you can quickly log the recipe as a meal
          </Text>
        </View>
      </View>

      {/* Custom Ingredient Modal */}
      <Modal
        visible={showCustomIngredient}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setShowCustomIngredient(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Add Custom Ingredient</Text>
              <TouchableOpacity onPress={() => setShowCustomIngredient(false)}>
                <Text style={styles.modalCloseText}>✕</Text>
              </TouchableOpacity>
            </View>

            <ScrollView style={styles.modalBody}>
              <View style={styles.formGroup}>
                <Text style={styles.label}>Ingredient Name</Text>
                <TextInput
                  style={styles.input}
                  placeholder="e.g., Grilled Chicken"
                  value={customIngredientName}
                  onChangeText={setCustomIngredientName}
                  placeholderTextColor="#9ca3af"
                />
              </View>

              <View style={styles.formGroup}>
                <Text style={styles.label}>Protein per 100g</Text>
                <TextInput
                  style={styles.input}
                  placeholder="e.g., 25.5"
                  value={customIngredientProtein}
                  onChangeText={setCustomIngredientProtein}
                  keyboardType="decimal-pad"
                  placeholderTextColor="#9ca3af"
                />
              </View>

              <View style={styles.formGroup}>
                <Text style={styles.label}>Amount (grams)</Text>
                <TextInput
                  style={styles.input}
                  placeholder="e.g., 150"
                  value={customIngredientGrams}
                  onChangeText={setCustomIngredientGrams}
                  keyboardType="decimal-pad"
                  placeholderTextColor="#9ca3af"
                />
              </View>

              {customIngredientProtein && customIngredientGrams && 
               parseFloat(customIngredientProtein) >= 0 && parseFloat(customIngredientGrams) > 0 && (
                <View style={styles.calculatedProtein}>
                  <Text style={styles.calculatedLabel}>Total Protein:</Text>
                  <Text style={styles.calculatedValue}>
                    {((parseFloat(customIngredientProtein) * parseFloat(customIngredientGrams)) / 100).toFixed(1)}g
                  </Text>
                </View>
              )}

              <TouchableOpacity
                style={styles.addIngredientButton}
                onPress={handleAddCustomIngredient}
              >
                <Text style={styles.addIngredientButtonText}>Add to Recipe</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.cancelButton}
                onPress={() => setShowCustomIngredient(false)}
              >
                <Text style={styles.cancelButtonText}>Cancel</Text>
              </TouchableOpacity>
            </ScrollView>
          </View>
        </View>
      </Modal>

      {/* Barcode Scanner Modal */}
      <Modal
        visible={showScanner}
        animationType="slide"
        onRequestClose={() => setShowScanner(false)}
      >
        <View style={styles.scannerContainer}>
          {hasPermission === false ? (
            <View style={styles.permissionDenied}>
              <Text style={styles.permissionText}>Camera permission is required</Text>
              <TouchableOpacity
                style={styles.closeButton}
                onPress={() => setShowScanner(false)}
              >
                <Text style={styles.closeButtonText}>Close</Text>
              </TouchableOpacity>
            </View>
          ) : (
            <>
              <CameraView
                style={styles.camera}
                onBarcodeScanned={scanned ? undefined : ({ data }) => handleBarcodeScanned(data)}
                barcodeScannerSettings={{
                  barcodeTypes: ['ean13', 'ean8', 'upc_a', 'upc_e', 'code128', 'code39'],
                }}
              >
                <View style={styles.scannerOverlay}>
                  <View style={styles.scannerHeader}>
                    <Text style={styles.scannerTitle}>Scan Product Barcode</Text>
                    <TouchableOpacity
                      style={styles.closeScannerButton}
                      onPress={() => setShowScanner(false)}
                    >
                      <Text style={styles.closeScannerText}>✕</Text>
                    </TouchableOpacity>
                  </View>
                  
                  <View style={styles.scannerMiddle}>
                    <View style={styles.scanArea}>
                      <View style={[styles.corner, styles.topLeftCorner]} />
                      <View style={[styles.corner, styles.topRightCorner]} />
                      <View style={[styles.corner, styles.bottomLeftCorner]} />
                      <View style={[styles.corner, styles.bottomRightCorner]} />
                    </View>
                  </View>
                  
                  <View style={styles.scannerBottom}>
                    {scanLoading && (
                      <View style={styles.scanLoadingContainer}>
                        <ActivityIndicator size="large" color="#3b82f6" />
                        <Text style={styles.scanLoadingText}>Fetching product info...</Text>
                      </View>
                    )}
                    {scanned && !scanLoading && (
                      <TouchableOpacity
                        style={styles.scanAgainButton}
                        onPress={() => setScanned(false)}
                      >
                        <Text style={styles.scanAgainText}>Tap to Scan Again</Text>
                      </TouchableOpacity>
                    )}
                  </View>
                </View>
              </CameraView>
            </>
          )}
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
    marginBottom: 8,
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
  actionButtons: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 8,
  },
  filterButton: {
    flex: 1,
    backgroundColor: '#f3f4f6',
    borderWidth: 1,
    borderColor: '#d1d5db',
    borderRadius: 8,
    padding: 12,
    alignItems: 'center',
  },
  filterButtonText: {
    color: '#374151',
    fontSize: 14,
    fontWeight: '600',
  },
  scanButton: {
    flex: 1,
    backgroundColor: '#10b981',
    borderRadius: 8,
    padding: 12,
    alignItems: 'center',
  },
  scanButtonText: {
    color: '#ffffff',
    fontSize: 14,
    fontWeight: '600',
  },
  customIngredientButton: {
    backgroundColor: '#8b5cf6',
    borderRadius: 8,
    padding: 12,
    alignItems: 'center',
    marginTop: 8,
    marginBottom: 8,
  },
  customIngredientButtonText: {
    color: '#ffffff',
    fontSize: 14,
    fontWeight: '600',
  },
  filtersContainer: {
    backgroundColor: '#f9fafb',
    borderRadius: 8,
    padding: 12,
    marginTop: 8,
    marginBottom: 8,
  },
  filterLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#374151',
    marginBottom: 8,
    marginTop: 8,
  },
  categoryScroll: {
    marginBottom: 8,
  },
  categoryChip: {
    backgroundColor: '#ffffff',
    borderWidth: 1,
    borderColor: '#d1d5db',
    borderRadius: 16,
    paddingHorizontal: 16,
    paddingVertical: 8,
    marginRight: 8,
  },
  categoryChipActive: {
    backgroundColor: '#3b82f6',
    borderColor: '#3b82f6',
  },
  categoryChipText: {
    fontSize: 14,
    color: '#374151',
  },
  categoryChipTextActive: {
    color: '#ffffff',
    fontWeight: '600',
  },
  filterInput: {
    backgroundColor: '#ffffff',
    borderWidth: 1,
    borderColor: '#d1d5db',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    color: '#1f2937',
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
  scannerContainer: {
    flex: 1,
    backgroundColor: '#000',
  },
  permissionDenied: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#1f2937',
    padding: 20,
  },
  permissionText: {
    fontSize: 18,
    color: '#fff',
    textAlign: 'center',
    marginBottom: 20,
  },
  closeButton: {
    backgroundColor: '#3b82f6',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
  },
  closeButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  camera: {
    flex: 1,
  },
  scannerOverlay: {
    flex: 1,
    backgroundColor: 'transparent',
  },
  scannerHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    paddingTop: 50,
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
  },
  scannerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#fff',
  },
  closeScannerButton: {
    padding: 8,
  },
  closeScannerText: {
    fontSize: 24,
    color: '#fff',
    fontWeight: 'bold',
  },
  scannerMiddle: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  scanArea: {
    width: 250,
    height: 250,
    position: 'relative',
  },
  corner: {
    position: 'absolute',
    width: 40,
    height: 40,
    borderColor: '#3b82f6',
    borderWidth: 4,
  },
  topLeftCorner: {
    top: 0,
    left: 0,
    borderBottomWidth: 0,
    borderRightWidth: 0,
  },
  topRightCorner: {
    top: 0,
    right: 0,
    borderBottomWidth: 0,
    borderLeftWidth: 0,
  },
  bottomLeftCorner: {
    bottom: 0,
    left: 0,
    borderTopWidth: 0,
    borderRightWidth: 0,
  },
  bottomRightCorner: {
    bottom: 0,
    right: 0,
    borderTopWidth: 0,
    borderLeftWidth: 0,
  },
  scannerBottom: {
    padding: 20,
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
    minHeight: 100,
    justifyContent: 'center',
    alignItems: 'center',
  },
  scanLoadingContainer: {
    alignItems: 'center',
  },
  scanLoadingText: {
    color: '#d1d5db',
    fontSize: 14,
    marginTop: 12,
  },
  scanAgainButton: {
    backgroundColor: '#3b82f6',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
  },
  scanAgainText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
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
});
