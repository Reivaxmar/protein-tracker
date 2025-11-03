import { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Alert, Modal, TextInput, ScrollView, ActivityIndicator } from 'react-native';
import { CameraView, Camera } from 'expo-camera';
import { fetchProductByBarcode, OpenFoodFactsProduct } from '../utils/api';
import { useProteinStore } from '../store/proteinStore';
import { getTodayDateString } from '../utils/helpers';
import { useRouter } from 'expo-router';

export default function ScanScreen() {
  const [hasPermission, setHasPermission] = useState<boolean | null>(null);
  const [scanned, setScanned] = useState(false);
  const [loading, setLoading] = useState(false);
  const [product, setProduct] = useState<OpenFoodFactsProduct | null>(null);
  const [showProductModal, setShowProductModal] = useState(false);
  const [gramsEaten, setGramsEaten] = useState('');
  const addMeal = useProteinStore((state) => state.addMeal);
  const router = useRouter();

  useEffect(() => {
    (async () => {
      const { status } = await Camera.requestCameraPermissionsAsync();
      setHasPermission(status === 'granted');
    })();
  }, []);

  const handleBarCodeScanned = async ({ type, data }: { type: string; data: string }) => {
    setScanned(true);
    setLoading(true);
    
    try {
      const productData = await fetchProductByBarcode(data);
      
      if (productData) {
        setProduct(productData);
        setShowProductModal(true);
        setLoading(false);
      } else {
        setLoading(false);
        Alert.alert(
          'Product Not Found',
          `No product information found for barcode: ${data}\n\nThe product may not be in the OpenFoodFacts database.`,
          [
            {
              text: 'Scan Again',
              onPress: () => setScanned(false),
            },
            {
              text: 'OK',
              onPress: () => setScanned(false),
            },
          ]
        );
      }
    } catch (error) {
      setLoading(false);
      Alert.alert(
        'Error',
        'Failed to fetch product information. Please try again.',
        [
          {
            text: 'OK',
            onPress: () => setScanned(false),
          },
        ]
      );
    }
  };

  const handleAddMeal = () => {
    if (!product || !product.nutriments?.proteins_100g) {
      Alert.alert('Error', 'Product does not have protein information');
      return;
    }

    if (!gramsEaten || parseFloat(gramsEaten) <= 0) {
      Alert.alert('Error', 'Please enter a valid quantity in grams');
      return;
    }

    const productName = product.product_name || 'Unknown Product';
    const proteinPer100g = product.nutriments.proteins_100g;

    addMeal({
      name: productName,
      proteinPer100g,
      gramsEaten: parseFloat(gramsEaten),
      date: getTodayDateString(),
    });

    Alert.alert('Success', 'Meal added successfully!');
    setShowProductModal(false);
    setProduct(null);
    setGramsEaten('');
    setScanned(false);
    router.push('/');
  };

  const handleCloseModal = () => {
    setShowProductModal(false);
    setProduct(null);
    setGramsEaten('');
    setScanned(false);
  };

  if (hasPermission === null) {
    return (
      <View style={styles.container}>
        <Text style={styles.message}>Requesting camera permission...</Text>
      </View>
    );
  }

  if (hasPermission === false) {
    return (
      <View style={styles.container}>
        <Text style={styles.message}>No access to camera</Text>
        <Text style={styles.subMessage}>
          Please enable camera permissions in your device settings to use the barcode scanner.
        </Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <CameraView
        style={styles.camera}
        onBarcodeScanned={scanned ? undefined : handleBarCodeScanned}
        barcodeScannerSettings={{
          barcodeTypes: ['ean13', 'ean8', 'upc_a', 'upc_e', 'code128', 'code39'],
        }}
      >
        <View style={styles.overlay}>
          <View style={styles.topOverlay} />
          <View style={styles.middleOverlay}>
            <View style={styles.sideOverlay} />
            <View style={styles.scanArea}>
              <View style={[styles.corner, styles.topLeftCorner]} />
              <View style={[styles.corner, styles.topRightCorner]} />
              <View style={[styles.corner, styles.bottomLeftCorner]} />
              <View style={[styles.corner, styles.bottomRightCorner]} />
            </View>
            <View style={styles.sideOverlay} />
          </View>
          <View style={styles.bottomOverlay}>
            <View style={styles.instructionContainer}>
              <Text style={styles.instructionTitle}>Scan Barcode</Text>
              <Text style={styles.instructionText}>
                Position the barcode within the frame
              </Text>
              {scanned && loading && (
                <View style={styles.loadingContainer}>
                  <ActivityIndicator size="large" color="#3b82f6" />
                  <Text style={styles.loadingText}>Fetching product info...</Text>
                </View>
              )}
              {scanned && !loading && (
                <TouchableOpacity
                  style={styles.scanAgainButton}
                  onPress={() => setScanned(false)}
                >
                  <Text style={styles.scanAgainText}>Tap to Scan Again</Text>
                </TouchableOpacity>
              )}
            </View>
          </View>
        </View>
      </CameraView>

      {/* Product Information Modal */}
      <Modal
        visible={showProductModal}
        animationType="slide"
        transparent={true}
        onRequestClose={handleCloseModal}
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <ScrollView style={styles.modalScroll}>
              <Text style={styles.modalTitle}>Product Information</Text>
              
              {product && (
                <>
                  <View style={styles.productInfoSection}>
                    <Text style={styles.productName}>
                      {product.product_name || 'Unknown Product'}
                    </Text>
                    {product.brands && (
                      <Text style={styles.productBrand}>{product.brands}</Text>
                    )}
                    {product.quantity && (
                      <Text style={styles.productQuantity}>{product.quantity}</Text>
                    )}
                  </View>

                  {product.nutriments && (
                    <View style={styles.nutrientsSection}>
                      <Text style={styles.sectionTitle}>Nutritional Information (per 100g)</Text>
                      
                      {product.nutriments.proteins_100g !== undefined && (
                        <View style={styles.nutrientRow}>
                          <Text style={styles.nutrientLabel}>Protein</Text>
                          <Text style={styles.nutrientValue}>
                            {product.nutriments.proteins_100g.toFixed(1)}g
                          </Text>
                        </View>
                      )}
                      
                      {product.nutriments['energy-kcal_100g'] !== undefined && (
                        <View style={styles.nutrientRow}>
                          <Text style={styles.nutrientLabel}>Energy</Text>
                          <Text style={styles.nutrientValue}>
                            {product.nutriments['energy-kcal_100g'].toFixed(0)} kcal
                          </Text>
                        </View>
                      )}
                      
                      {product.nutriments.carbohydrates_100g !== undefined && (
                        <View style={styles.nutrientRow}>
                          <Text style={styles.nutrientLabel}>Carbohydrates</Text>
                          <Text style={styles.nutrientValue}>
                            {product.nutriments.carbohydrates_100g.toFixed(1)}g
                          </Text>
                        </View>
                      )}
                      
                      {product.nutriments.sugars_100g !== undefined && (
                        <View style={styles.nutrientRow}>
                          <Text style={styles.nutrientLabel}>  - Sugars</Text>
                          <Text style={styles.nutrientValue}>
                            {product.nutriments.sugars_100g.toFixed(1)}g
                          </Text>
                        </View>
                      )}
                      
                      {product.nutriments.fat_100g !== undefined && (
                        <View style={styles.nutrientRow}>
                          <Text style={styles.nutrientLabel}>Fat</Text>
                          <Text style={styles.nutrientValue}>
                            {product.nutriments.fat_100g.toFixed(1)}g
                          </Text>
                        </View>
                      )}
                      
                      {product.nutriments.fiber_100g !== undefined && (
                        <View style={styles.nutrientRow}>
                          <Text style={styles.nutrientLabel}>Fiber</Text>
                          <Text style={styles.nutrientValue}>
                            {product.nutriments.fiber_100g.toFixed(1)}g
                          </Text>
                        </View>
                      )}
                      
                      {product.nutriments.salt_100g !== undefined && (
                        <View style={styles.nutrientRow}>
                          <Text style={styles.nutrientLabel}>Salt</Text>
                          <Text style={styles.nutrientValue}>
                            {product.nutriments.salt_100g.toFixed(2)}g
                          </Text>
                        </View>
                      )}
                    </View>
                  )}

                  {!product.nutriments?.proteins_100g && (
                    <View style={styles.warningBox}>
                      <Text style={styles.warningText}>
                        ⚠️ This product does not have protein information available.
                      </Text>
                    </View>
                  )}

                  {product.nutriments?.proteins_100g !== undefined && (
                    <View style={styles.quantitySection}>
                      <Text style={styles.sectionTitle}>Add to Meal</Text>
                      <Text style={styles.inputLabel}>Quantity eaten (grams)</Text>
                      <TextInput
                        style={styles.quantityInput}
                        placeholder="e.g., 150"
                        value={gramsEaten}
                        onChangeText={setGramsEaten}
                        keyboardType="decimal-pad"
                        placeholderTextColor="#9ca3af"
                      />
                      
                      {gramsEaten && (() => {
                        const grams = parseFloat(gramsEaten);
                        return !isNaN(grams) && grams > 0 && (
                          <View style={styles.calculatedProtein}>
                            <Text style={styles.calculatedLabel}>Total Protein:</Text>
                            <Text style={styles.calculatedValue}>
                              {((product.nutriments.proteins_100g * grams) / 100).toFixed(1)}g
                            </Text>
                          </View>
                        );
                      })()}
                    </View>
                  )}
                </>
              )}
            </ScrollView>

            <View style={styles.modalButtons}>
              {product?.nutriments?.proteins_100g !== undefined && (
                <TouchableOpacity
                  style={styles.addButton}
                  onPress={handleAddMeal}
                >
                  <Text style={styles.addButtonText}>Add to Meal</Text>
                </TouchableOpacity>
              )}
              <TouchableOpacity
                style={styles.cancelButton}
                onPress={handleCloseModal}
              >
                <Text style={styles.cancelButtonText}>
                  {product?.nutriments?.proteins_100g !== undefined ? 'Cancel' : 'Close'}
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000',
    justifyContent: 'center',
    alignItems: 'center',
  },
  message: {
    fontSize: 18,
    fontWeight: '600',
    color: '#fff',
    textAlign: 'center',
    paddingHorizontal: 20,
  },
  subMessage: {
    fontSize: 14,
    color: '#9ca3af',
    textAlign: 'center',
    paddingHorizontal: 20,
    marginTop: 8,
  },
  camera: {
    flex: 1,
    width: '100%',
  },
  overlay: {
    flex: 1,
  },
  topOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
  },
  middleOverlay: {
    flexDirection: 'row',
    height: 250,
  },
  sideOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
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
  bottomOverlay: {
    flex: 2,
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  instructionContainer: {
    alignItems: 'center',
    paddingHorizontal: 20,
  },
  instructionTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 8,
  },
  instructionText: {
    fontSize: 14,
    color: '#d1d5db',
    textAlign: 'center',
  },
  scanAgainButton: {
    backgroundColor: '#3b82f6',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
    marginTop: 20,
  },
  scanAgainText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  loadingContainer: {
    alignItems: 'center',
    marginTop: 20,
  },
  loadingText: {
    color: '#d1d5db',
    fontSize: 14,
    marginTop: 12,
  },
  modalContainer: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: '#fff',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    maxHeight: '90%',
    paddingTop: 20,
  },
  modalScroll: {
    paddingHorizontal: 20,
  },
  modalTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#1f2937',
    marginBottom: 20,
  },
  productInfoSection: {
    marginBottom: 24,
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
  },
  productName: {
    fontSize: 20,
    fontWeight: '600',
    color: '#1f2937',
    marginBottom: 8,
  },
  productBrand: {
    fontSize: 16,
    color: '#6b7280',
    marginBottom: 4,
  },
  productQuantity: {
    fontSize: 14,
    color: '#9ca3af',
  },
  nutrientsSection: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1f2937',
    marginBottom: 12,
  },
  nutrientRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#f3f4f6',
  },
  nutrientLabel: {
    fontSize: 14,
    color: '#374151',
  },
  nutrientValue: {
    fontSize: 14,
    fontWeight: '600',
    color: '#3b82f6',
  },
  warningBox: {
    backgroundColor: '#fef3c7',
    padding: 16,
    borderRadius: 8,
    marginBottom: 24,
    borderWidth: 1,
    borderColor: '#fcd34d',
  },
  warningText: {
    fontSize: 14,
    color: '#92400e',
  },
  quantitySection: {
    marginBottom: 20,
  },
  inputLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#374151',
    marginBottom: 8,
  },
  quantityInput: {
    backgroundColor: '#f9fafb',
    borderWidth: 1,
    borderColor: '#d1d5db',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    color: '#1f2937',
  },
  calculatedProtein: {
    backgroundColor: '#eff6ff',
    borderRadius: 8,
    padding: 16,
    marginTop: 12,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  calculatedLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1e40af',
  },
  calculatedValue: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#3b82f6',
  },
  modalButtons: {
    padding: 20,
    paddingBottom: 30,
    borderTopWidth: 1,
    borderTopColor: '#e5e7eb',
    gap: 12,
  },
  addButton: {
    backgroundColor: '#3b82f6',
    borderRadius: 8,
    padding: 16,
    alignItems: 'center',
  },
  addButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  cancelButton: {
    backgroundColor: '#f3f4f6',
    borderRadius: 8,
    padding: 16,
    alignItems: 'center',
  },
  cancelButtonText: {
    color: '#374151',
    fontSize: 16,
    fontWeight: '600',
  },
});
