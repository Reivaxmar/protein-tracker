import { View, Text, TextInput, TouchableOpacity, StyleSheet, ScrollView, Alert, ActivityIndicator, FlatList, Modal } from 'react-native';
import { useState, useMemo } from 'react';
import { useProteinStore } from '../store/proteinStore';
import { useLanguageStore } from '../store/languageStore';
import { searchProducts, OpenFoodFactsProduct, fetchProductByBarcode, ProductSearchFilters } from '../utils/api';
import { RecipeIngredient } from '../types';
import { useRouter } from 'expo-router';
import { generateUniqueId } from '../utils/helpers';
import { CameraView, Camera } from 'expo-camera';

const SEARCH_PAGE_SIZE = 10;
const SEARCH_PAGE_NUMBER = 1;

export default function CreateRecipeScreen() {
  const router = useRouter();
  const t = useLanguageStore((state) => state.translations);
  
  // Common food categories - now using translations
  const FOOD_CATEGORIES = [
    { label: t.categories.all, value: '' },
    { label: t.categories.meats, value: 'meats' },
    { label: t.categories.dairy, value: 'dairies' },
    { label: t.categories.fish, value: 'fish' },
    { label: t.categories.vegetables, value: 'vegetables' },
    { label: t.categories.fruits, value: 'fruits' },
    { label: t.categories.grains, value: 'cereals-and-potatoes' },
    { label: t.categories.legumes, value: 'legumes' },
  ];
  
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
  const [showQuickIngredient, setShowQuickIngredient] = useState(false);
  const [savedIngredientsSearch, setSavedIngredientsSearch] = useState('');
  const [customIngredientName, setCustomIngredientName] = useState('');
  const [customIngredientProtein, setCustomIngredientProtein] = useState('');
  const [customIngredientGrams, setCustomIngredientGrams] = useState('');
  const [selectedSavedIngredient, setSelectedSavedIngredient] = useState<string>('');
  const [savedIngredientGrams, setSavedIngredientGrams] = useState('');
  
  const addRecipe = useProteinStore((state) => state.addRecipe);
  const customIngredients = useProteinStore((state) => state.customIngredients);

  const filteredSavedIngredients = useMemo(() => {
    if (!savedIngredientsSearch.trim()) {
      return customIngredients;
    }
    const searchLower = savedIngredientsSearch.toLowerCase();
    return customIngredients.filter(ing => 
      ing.name.toLowerCase().includes(searchLower)
    );
  }, [customIngredients, savedIngredientsSearch]);

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
          t.error,
          `${t.quickMeal.productNotFound} ${barcode}`,
          [
            {
              text: t.quickMeal.tryAgain,
              onPress: () => setScanned(false),
            },
            {
              text: t.cancel,
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
      Alert.alert('Permission Required', t.quickMeal.cameraPermissionRequired);
    }
  };

  const handleSearch = async () => {
    if (!searchTerm.trim()) {
      Alert.alert(t.error, 'Please enter a search term');
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
        Alert.alert('No Results', t.quickMeal.noResults);
      }
    } catch (error) {
      Alert.alert(t.error, 'Failed to search for products');
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
      Alert.alert(t.error, t.quickMeal.errorNoProduct);
      return;
    }

    if (!selectedProduct.nutriments?.proteins_100g) {
      Alert.alert(t.error, t.quickMeal.errorNoProtein);
      return;
    }

    if (!gramsForIngredient || parseFloat(gramsForIngredient) <= 0) {
      Alert.alert(t.error, t.quickMeal.errorInvalidAmount);
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
    Alert.alert(t.success, t.createRecipe.ingredientAdded);
  };

  const handleRemoveIngredient = (id: string) => {
    setIngredients(ingredients.filter((ing) => ing.id !== id));
  };

  const handleAddQuickIngredient = () => {
    if (!customIngredientName.trim()) {
      Alert.alert(t.error, 'Please enter an ingredient name');
      return;
    }

    if (!customIngredientProtein || parseFloat(customIngredientProtein) < 0) {
      Alert.alert(t.error, 'Please enter a valid protein amount (g/100g)');
      return;
    }

    if (!customIngredientGrams || parseFloat(customIngredientGrams) <= 0) {
      Alert.alert(t.error, t.quickMeal.errorInvalidAmount);
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
    setShowQuickIngredient(false);
    Alert.alert(t.success, t.createRecipe.ingredientAdded);
  };

  const handleAddSavedIngredient = () => {
    if (!selectedSavedIngredient) {
      Alert.alert(t.error, 'Please select an ingredient');
      return;
    }

    if (!savedIngredientGrams || parseFloat(savedIngredientGrams) <= 0) {
      Alert.alert(t.error, t.quickMeal.errorInvalidAmount);
      return;
    }

    const savedIngredient = customIngredients.find(i => i.id === selectedSavedIngredient);
    if (!savedIngredient) {
      Alert.alert(t.error, 'Ingredient not found');
      return;
    }

    const grams = parseFloat(savedIngredientGrams);
    const totalProtein = (savedIngredient.proteinPer100g * grams) / 100;

    const newIngredient: RecipeIngredient = {
      id: generateUniqueId(),
      name: savedIngredient.name,
      proteinPer100g: savedIngredient.proteinPer100g,
      gramsInRecipe: grams,
      totalProtein,
    };

    setIngredients([...ingredients, newIngredient]);
    setSelectedSavedIngredient('');
    setSavedIngredientGrams('');
    setSavedIngredientsSearch('');
    setShowCustomIngredient(false);
    Alert.alert(t.success, t.createRecipe.ingredientAdded);
  };

  const calculateTotalProtein = () => {
    return ingredients.reduce((sum, ing) => sum + ing.totalProtein, 0);
  };

  const calculateTotalGrams = () => {
    return ingredients.reduce((sum, ing) => sum + ing.gramsInRecipe, 0);
  };

  const handleSaveRecipe = () => {
    if (!recipeName.trim()) {
      Alert.alert(t.error, t.createRecipe.errorNoName);
      return;
    }

    if (ingredients.length === 0) {
      Alert.alert(t.error, t.createRecipe.errorNoIngredients);
      return;
    }

    addRecipe({
      name: recipeName.trim(),
      ingredients,
      totalProtein: calculateTotalProtein(),
      totalGrams: calculateTotalGrams(),
    });

    Alert.alert(t.success, t.createRecipe.recipeSaved, [
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
          <Text style={styles.title}>{t.createRecipe.title}</Text>
          
          <View style={styles.formGroup}>
            <Text style={styles.label}>{t.createRecipe.recipeName}</Text>
            <TextInput
              style={styles.input}
              placeholder={t.createRecipe.recipeNamePlaceholder}
              value={recipeName}
              onChangeText={setRecipeName}
              placeholderTextColor="#9ca3af"
            />
          </View>
        </View>

        <View style={styles.card}>
          <Text style={styles.cardTitle}>{t.createRecipe.searchIngredients}</Text>
          
          <View style={styles.searchContainer}>
            <TextInput
              style={styles.searchInput}
              placeholder={t.createRecipe.searchPlaceholder}
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
                <Text style={styles.searchButtonText}>{t.createRecipe.search}</Text>
              )}
            </TouchableOpacity>
          </View>

          <View style={styles.actionButtons}>
            <TouchableOpacity
              style={styles.filterButton}
              onPress={() => setShowFilters(!showFilters)}
            >
              <Text style={styles.filterButtonText}>
                {showFilters ? '▼' : '▶'} {t.createRecipe.filters}
              </Text>
            </TouchableOpacity>
            
            <TouchableOpacity
              style={styles.scanButton}
              onPress={openScanner}
            >
              <Text style={styles.scanButtonText}>{t.createRecipe.scanBarcode}</Text>
            </TouchableOpacity>
          </View>

          <TouchableOpacity
            style={styles.customIngredientButton}
            onPress={() => setShowCustomIngredient(true)}
          >
            <Text style={styles.customIngredientButtonText}>{t.createRecipe.addCustomIngredient}</Text>
          </TouchableOpacity>

          {showFilters && (
            <View style={styles.filtersContainer}>
              <Text style={styles.filterLabel}>{t.createRecipe.category}</Text>
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
              
              <Text style={styles.filterLabel}>{t.createRecipe.minProtein}</Text>
              <TextInput
                style={styles.filterInput}
                placeholder="e.g., 10"
                value={minProtein}
                onChangeText={setMinProtein}
                keyboardType="decimal-pad"
                placeholderTextColor="#9ca3af"
              />
              
              <Text style={styles.filterLabel}>{t.createRecipe.brand}</Text>
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
              <Text style={styles.resultsTitle}>{t.createRecipe.searchResults}</Text>
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
              <Text style={styles.selectedProductTitle}>{t.createRecipe.selectedProduct}</Text>
              <Text style={styles.selectedProductName}>
                {selectedProduct.product_name || 'Unknown Product'}
              </Text>
              {selectedProduct.nutriments?.proteins_100g !== undefined && (
                <Text style={styles.selectedProductProtein}>
                  Protein: {selectedProduct.nutriments.proteins_100g.toFixed(1)}g/100g
                </Text>
              )}
              
              <View style={styles.formGroup}>
                <Text style={styles.label}>{t.createRecipe.amount}</Text>
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
                  <Text style={styles.calculatedLabel}>{t.createRecipe.proteinInAmount}</Text>
                  <Text style={styles.calculatedValue}>
                    {calculatedProteinForIngredient}g
                  </Text>
                </View>
              )}

              <TouchableOpacity
                style={styles.addIngredientButton}
                onPress={handleAddIngredient}
              >
                <Text style={styles.addIngredientButtonText}>{t.createRecipe.addToRecipe}</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.cancelButton}
                onPress={() => {
                  setSelectedProduct(null);
                  setGramsForIngredient('');
                }}
              >
                <Text style={styles.cancelButtonText}>{t.cancel}</Text>
              </TouchableOpacity>
            </View>
          )}
        </View>

        {ingredients.length > 0 && (
          <View style={styles.card}>
            <Text style={styles.cardTitle}>{t.createRecipe.recipeIngredients}</Text>
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
              <Text style={styles.totalLabel}>{t.createRecipe.totalRecipe}</Text>
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
              <Text style={styles.saveButtonText}>{t.createRecipe.saveRecipe}</Text>
            </TouchableOpacity>
          </View>
        )}

        <View style={styles.infoCard}>
          <Text style={styles.infoTitle}>{t.createRecipe.tips}</Text>
          <Text style={styles.infoText}>
            {t.createRecipe.tipsText}
          </Text>
        </View>
      </View>

      {/* Saved Custom Ingredients Modal */}
      <Modal
        visible={showCustomIngredient}
        animationType="slide"
        transparent={true}
        onRequestClose={() => {
          setShowCustomIngredient(false);
          setSelectedSavedIngredient('');
          setSavedIngredientGrams('');
          setSavedIngredientsSearch('');
        }}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>{t.createRecipe.selectSavedIngredient}</Text>
              <TouchableOpacity onPress={() => {
                setShowCustomIngredient(false);
                setSelectedSavedIngredient('');
                setSavedIngredientGrams('');
                setSavedIngredientsSearch('');
              }}>
                <Text style={styles.modalCloseText}>✕</Text>
              </TouchableOpacity>
            </View>

            <ScrollView style={styles.modalBody}>
              {/* Search bar */}
              <View style={styles.formGroup}>
                <TextInput
                  style={styles.input}
                  placeholder={t.createRecipe.searchSavedIngredients}
                  value={savedIngredientsSearch}
                  onChangeText={setSavedIngredientsSearch}
                  placeholderTextColor="#9ca3af"
                />
              </View>

              {/* Add Quick Ingredient Button */}
              <TouchableOpacity
                style={styles.quickIngredientButtonInModal}
                onPress={() => {
                  setShowCustomIngredient(false);
                  setShowQuickIngredient(true);
                }}
              >
                <Text style={styles.quickIngredientButtonText}>{t.createRecipe.addQuickIngredient}</Text>
              </TouchableOpacity>

              {/* List of saved ingredients */}
              {filteredSavedIngredients.length === 0 ? (
                <View style={styles.noResultsContainer}>
                  <Text style={styles.noResultsText}>{t.createRecipe.noSavedIngredients}</Text>
                </View>
              ) : (
                <View style={styles.savedIngredientsListContainer}>
                  {filteredSavedIngredients.map((ingredient) => (
                    <TouchableOpacity
                      key={ingredient.id}
                      style={[
                        styles.savedIngredientItem,
                        selectedSavedIngredient === ingredient.id && styles.savedIngredientItemActive
                      ]}
                      onPress={() => setSelectedSavedIngredient(ingredient.id)}
                    >
                      <View style={styles.savedIngredientItemContent}>
                        <Text style={[
                          styles.savedIngredientItemName,
                          selectedSavedIngredient === ingredient.id && styles.savedIngredientItemNameActive
                        ]}>
                          {ingredient.name}
                        </Text>
                        <Text style={[
                          styles.savedIngredientItemProtein,
                          selectedSavedIngredient === ingredient.id && styles.savedIngredientItemProteinActive
                        ]}>
                          {ingredient.proteinPer100g.toFixed(1)}g/100g
                        </Text>
                      </View>
                      {selectedSavedIngredient === ingredient.id && (
                        <Text style={styles.selectedCheckmark}>✓</Text>
                      )}
                    </TouchableOpacity>
                  ))}
                </View>
              )}

              {/* Amount input when ingredient is selected */}
              {selectedSavedIngredient && (
                <>
                  <View style={styles.formGroup}>
                    <Text style={styles.label}>{t.createRecipe.amount}</Text>
                    <TextInput
                      style={styles.input}
                      placeholder="e.g., 150"
                      value={savedIngredientGrams}
                      onChangeText={setSavedIngredientGrams}
                      keyboardType="decimal-pad"
                      placeholderTextColor="#9ca3af"
                    />
                  </View>

                  {savedIngredientGrams && parseFloat(savedIngredientGrams) > 0 && (
                    <View style={styles.calculatedProtein}>
                      <Text style={styles.calculatedLabel}>{t.createRecipe.proteinInAmount}</Text>
                      <Text style={styles.calculatedValue}>
                        {(() => {
                          const savedIng = customIngredients.find(i => i.id === selectedSavedIngredient);
                          if (savedIng) {
                            return ((savedIng.proteinPer100g * parseFloat(savedIngredientGrams)) / 100).toFixed(1);
                          }
                          return '0';
                        })()}g
                      </Text>
                    </View>
                  )}

                  <TouchableOpacity
                    style={styles.addIngredientButton}
                    onPress={handleAddSavedIngredient}
                  >
                    <Text style={styles.addIngredientButtonText}>{t.createRecipe.addToRecipe}</Text>
                  </TouchableOpacity>
                </>
              )}

              <TouchableOpacity
                style={styles.cancelButton}
                onPress={() => {
                  setShowCustomIngredient(false);
                  setSelectedSavedIngredient('');
                  setSavedIngredientGrams('');
                  setSavedIngredientsSearch('');
                }}
              >
                <Text style={styles.cancelButtonText}>{t.cancel}</Text>
              </TouchableOpacity>
            </ScrollView>
          </View>
        </View>
      </Modal>

      {/* Quick Ingredient Modal */}
      <Modal
        visible={showQuickIngredient}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setShowQuickIngredient(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>{t.createRecipe.quickIngredientTitle}</Text>
              <TouchableOpacity onPress={() => setShowQuickIngredient(false)}>
                <Text style={styles.modalCloseText}>✕</Text>
              </TouchableOpacity>
            </View>

            <ScrollView style={styles.modalBody}>
              <View style={styles.formGroup}>
                <Text style={styles.label}>{t.createRecipe.ingredientName}</Text>
                <TextInput
                  style={styles.input}
                  placeholder="e.g., Grilled Chicken"
                  value={customIngredientName}
                  onChangeText={setCustomIngredientName}
                  placeholderTextColor="#9ca3af"
                />
              </View>

              <View style={styles.formGroup}>
                <Text style={styles.label}>{t.createRecipe.proteinPer100g}</Text>
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
                <Text style={styles.label}>{t.createRecipe.amount}</Text>
                <TextInput
                  style={styles.input}
                  placeholder="e.g., 150"
                  value={customIngredientGrams}
                  onChangeText={setCustomIngredientGrams}
                  keyboardType="decimal-pad"
                  placeholderTextColor="#9ca3af"
                />
              </View>

              <View style={styles.calculatedProtein}>
                <Text style={styles.calculatedLabel}>{t.createRecipe.totalProtein}</Text>
                <Text style={styles.calculatedValue}>
                  {(() => {
                    const protein = parseFloat(customIngredientProtein || '0');
                    const grams = parseFloat(customIngredientGrams || '0');
                    if (isNaN(protein) || isNaN(grams) || protein < 0 || grams <= 0) {
                      return '0.0g';
                    }
                    return `${((protein * grams) / 100).toFixed(1)}g`;
                  })()}
                </Text>
              </View>

              <TouchableOpacity
                style={styles.addIngredientButton}
                onPress={handleAddQuickIngredient}
              >
                <Text style={styles.addIngredientButtonText}>{t.createRecipe.addToRecipe}</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.cancelButton}
                onPress={() => setShowQuickIngredient(false)}
              >
                <Text style={styles.cancelButtonText}>{t.cancel}</Text>
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
              <Text style={styles.permissionText}>{t.quickMeal.cameraPermissionRequired}</Text>
              <TouchableOpacity
                style={styles.closeButton}
                onPress={() => setShowScanner(false)}
              >
                <Text style={styles.closeButtonText}>{t.close}</Text>
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
                    <Text style={styles.scannerTitle}>{t.quickMeal.scanTitle}</Text>
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
                        <Text style={styles.scanLoadingText}>{t.quickMeal.fetchingProduct}</Text>
                      </View>
                    )}
                    {scanned && !scanLoading && (
                      <TouchableOpacity
                        style={styles.scanAgainButton}
                        onPress={() => setScanned(false)}
                      >
                        <Text style={styles.scanAgainText}>{t.quickMeal.tapToScanAgain}</Text>
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
  quickIngredientButton: {
    backgroundColor: '#6366f1',
    borderRadius: 8,
    padding: 12,
    alignItems: 'center',
    marginBottom: 8,
  },
  quickIngredientButtonInModal: {
    backgroundColor: '#6366f1',
    borderRadius: 8,
    padding: 12,
    alignItems: 'center',
    marginBottom: 12,
    marginTop: 4,
  },
  quickIngredientButtonText: {
    color: '#ffffff',
    fontSize: 14,
    fontWeight: '600',
  },
  savedIngredientsListContainer: {
    marginVertical: 8,
  },
  savedIngredientItem: {
    backgroundColor: '#f9fafb',
    borderWidth: 1,
    borderColor: '#d1d5db',
    borderRadius: 8,
    padding: 12,
    marginBottom: 8,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  savedIngredientItemActive: {
    backgroundColor: '#dbeafe',
    borderColor: '#3b82f6',
    borderWidth: 2,
  },
  savedIngredientItemContent: {
    flex: 1,
  },
  savedIngredientItemName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1f2937',
    marginBottom: 4,
  },
  savedIngredientItemNameActive: {
    color: '#1e40af',
  },
  savedIngredientItemProtein: {
    fontSize: 14,
    color: '#6b7280',
  },
  savedIngredientItemProteinActive: {
    color: '#3b82f6',
  },
  selectedCheckmark: {
    fontSize: 24,
    color: '#3b82f6',
    fontWeight: 'bold',
  },
  noResultsContainer: {
    padding: 20,
    alignItems: 'center',
  },
  noResultsText: {
    fontSize: 14,
    color: '#6b7280',
    textAlign: 'center',
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
  savedIngredientsContainer: {
    backgroundColor: '#f0fdf4',
    borderRadius: 8,
    padding: 12,
    marginTop: 8,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: '#86efac',
  },
  savedIngredientsTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#166534',
    marginBottom: 8,
  },
  savedIngredientsScroll: {
    marginBottom: 8,
  },
  savedIngredientChip: {
    backgroundColor: '#ffffff',
    borderWidth: 2,
    borderColor: '#86efac',
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 8,
    marginRight: 8,
  },
  savedIngredientChipActive: {
    backgroundColor: '#22c55e',
    borderColor: '#22c55e',
  },
  savedIngredientChipText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#166534',
  },
  savedIngredientChipTextActive: {
    color: '#ffffff',
  },
  savedIngredientChipProtein: {
    fontSize: 11,
    color: '#16a34a',
    marginTop: 2,
  },
  savedIngredientChipProteinActive: {
    color: '#dcfce7',
  },
  savedIngredientForm: {
    marginTop: 8,
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: '#86efac',
  },
});
