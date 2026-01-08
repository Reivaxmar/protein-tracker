import { View, Text, TouchableOpacity, StyleSheet, ScrollView, Alert, Modal, TextInput } from 'react-native';
import { useState } from 'react';
import { useProteinStore } from '../store/proteinStore';
import { useLanguageStore } from '../store/languageStore';
import { CustomIngredient } from '../types';

export default function IngredientsScreen() {
  const customIngredients = useProteinStore((state) => state.customIngredients);
  const addCustomIngredient = useProteinStore((state) => state.addCustomIngredient);
  const deleteCustomIngredient = useProteinStore((state) => state.deleteCustomIngredient);
  const updateCustomIngredient = useProteinStore((state) => state.updateCustomIngredient);
  const t = useLanguageStore((state) => state.translations);
  
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [editingIngredient, setEditingIngredient] = useState<CustomIngredient | null>(null);
  const [ingredientName, setIngredientName] = useState('');
  const [ingredientProtein, setIngredientProtein] = useState('');

  const handleAddIngredient = () => {
    if (!ingredientName.trim()) {
      Alert.alert(t.error, 'Please enter an ingredient name');
      return;
    }

    if (!ingredientProtein || parseFloat(ingredientProtein) < 0) {
      Alert.alert(t.error, 'Please enter a valid protein amount (g/100g)');
      return;
    }

    addCustomIngredient({
      name: ingredientName.trim(),
      proteinPer100g: parseFloat(ingredientProtein),
    });

    setIngredientName('');
    setIngredientProtein('');
    setShowAddModal(false);
    Alert.alert(t.success, 'Ingredient added successfully!');
  };

  const handleEditIngredient = (ingredient: CustomIngredient) => {
    setEditingIngredient(ingredient);
    setIngredientName(ingredient.name);
    setIngredientProtein(ingredient.proteinPer100g.toString());
    setShowEditModal(true);
  };

  const handleSaveEdit = () => {
    if (!editingIngredient) return;

    if (!ingredientName.trim()) {
      Alert.alert(t.error, 'Please enter an ingredient name');
      return;
    }

    if (!ingredientProtein || parseFloat(ingredientProtein) < 0) {
      Alert.alert(t.error, 'Please enter a valid protein amount (g/100g)');
      return;
    }

    updateCustomIngredient(editingIngredient.id, {
      name: ingredientName.trim(),
      proteinPer100g: parseFloat(ingredientProtein),
    });

    setIngredientName('');
    setIngredientProtein('');
    setShowEditModal(false);
    setEditingIngredient(null);
    Alert.alert(t.success, 'Ingredient updated successfully!');
  };

  const handleDeleteIngredient = (ingredientId: string, ingredientName: string) => {
    Alert.alert(
      'Delete Ingredient',
      `Are you sure you want to delete "${ingredientName}"?`,
      [
        {
          text: t.cancel,
          style: 'cancel',
        },
        {
          text: t.delete,
          style: 'destructive',
          onPress: () => {
            deleteCustomIngredient(ingredientId);
            Alert.alert(t.success, 'Ingredient deleted');
          },
        },
      ]
    );
  };

  const openAddModal = () => {
    setIngredientName('');
    setIngredientProtein('');
    setShowAddModal(true);
  };

  if (customIngredients.length === 0) {
    return (
      <>
        <View style={styles.container}>
          <View style={styles.content}>
            <View style={styles.emptyCard}>
              <Text style={styles.emptyIcon}>🥗</Text>
              <Text style={styles.emptyTitle}>No Custom Ingredients Yet</Text>
              <Text style={styles.emptyText}>
                Create custom ingredients to quickly add them to your recipes
              </Text>
              <TouchableOpacity
                style={styles.createButton}
                onPress={openAddModal}
              >
                <Text style={styles.createButtonText}>Create Ingredient</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>

        {/* Add Ingredient Modal */}
        <Modal visible={showAddModal} transparent animationType="fade">
          <View style={styles.modalOverlay}>
            <View style={styles.modalContent}>
              <Text style={styles.modalTitle}>Add Custom Ingredient</Text>
              
              <View style={styles.formGroup}>
                <Text style={styles.label}>Ingredient Name</Text>
                <TextInput
                  style={styles.input}
                  placeholder="e.g., Grilled Chicken"
                  value={ingredientName}
                  onChangeText={setIngredientName}
                  placeholderTextColor="#9ca3af"
                  autoFocus
                />
              </View>

              <View style={styles.formGroup}>
                <Text style={styles.label}>Protein per 100g</Text>
                <TextInput
                  style={styles.input}
                  placeholder="e.g., 25.5"
                  value={ingredientProtein}
                  onChangeText={setIngredientProtein}
                  keyboardType="decimal-pad"
                  placeholderTextColor="#9ca3af"
                />
              </View>

              <View style={styles.modalButtons}>
                <TouchableOpacity
                  style={styles.modalCancelButton}
                  onPress={() => setShowAddModal(false)}
                >
                  <Text style={styles.modalCancelText}>{t.cancel}</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={styles.modalSaveButton}
                  onPress={handleAddIngredient}
                >
                  <Text style={styles.modalSaveText}>Add</Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </Modal>

        {/* Edit Ingredient Modal */}
        <Modal visible={showEditModal} transparent animationType="fade">
          <View style={styles.modalOverlay}>
            <View style={styles.modalContent}>
              <Text style={styles.modalTitle}>Edit Ingredient</Text>
              
              <View style={styles.formGroup}>
                <Text style={styles.label}>Ingredient Name</Text>
                <TextInput
                  style={styles.input}
                  placeholder="e.g., Grilled Chicken"
                  value={ingredientName}
                  onChangeText={setIngredientName}
                  placeholderTextColor="#9ca3af"
                  autoFocus
                />
              </View>

              <View style={styles.formGroup}>
                <Text style={styles.label}>Protein per 100g</Text>
                <TextInput
                  style={styles.input}
                  placeholder="e.g., 25.5"
                  value={ingredientProtein}
                  onChangeText={setIngredientProtein}
                  keyboardType="decimal-pad"
                  placeholderTextColor="#9ca3af"
                />
              </View>

              <View style={styles.modalButtons}>
                <TouchableOpacity
                  style={styles.modalCancelButton}
                  onPress={() => {
                    setShowEditModal(false);
                    setEditingIngredient(null);
                  }}
                >
                  <Text style={styles.modalCancelText}>{t.cancel}</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={styles.modalSaveButton}
                  onPress={handleSaveEdit}
                >
                  <Text style={styles.modalSaveText}>{t.save}</Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </Modal>
      </>
    );
  }

  return (
    <ScrollView style={styles.container}>
      <View style={styles.content}>
        <View style={styles.header}>
          <Text style={styles.headerTitle}>Custom Ingredients</Text>
          <Text style={styles.headerSubtitle}>
            {customIngredients.length} {customIngredients.length !== 1 ? 'ingredients' : 'ingredient'} saved
          </Text>
        </View>

        {customIngredients.map((ingredient) => (
          <View key={ingredient.id} style={styles.ingredientCard}>
            <View style={styles.ingredientInfo}>
              <Text style={styles.ingredientName}>{ingredient.name}</Text>
              <Text style={styles.ingredientProtein}>
                {ingredient.proteinPer100g.toFixed(1)}g protein/100g
              </Text>
            </View>
            <View style={styles.ingredientActions}>
              <TouchableOpacity
                style={styles.editButton}
                onPress={() => handleEditIngredient(ingredient)}
              >
                <Text style={styles.editButtonText}>{t.edit}</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.deleteButton}
                onPress={() => handleDeleteIngredient(ingredient.id, ingredient.name)}
              >
                <Text style={styles.deleteButtonText}>{t.delete}</Text>
              </TouchableOpacity>
            </View>
          </View>
        ))}

        <TouchableOpacity
          style={styles.addButton}
          onPress={openAddModal}
        >
          <Text style={styles.addButtonText}>+ Create Ingredient</Text>
        </TouchableOpacity>

        <View style={styles.infoCard}>
          <Text style={styles.infoTitle}>💡 About Custom Ingredients</Text>
          <Text style={styles.infoText}>
            • Create ingredients you use frequently{'\n'}
            • Set their protein content per 100g{'\n'}
            • Use them when creating recipes{'\n'}
            • Edit or delete them anytime
          </Text>
        </View>
      </View>

      {/* Add Ingredient Modal */}
      <Modal visible={showAddModal} transparent animationType="fade">
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Add Custom Ingredient</Text>
            
            <View style={styles.formGroup}>
              <Text style={styles.label}>Ingredient Name</Text>
              <TextInput
                style={styles.input}
                placeholder="e.g., Grilled Chicken"
                value={ingredientName}
                onChangeText={setIngredientName}
                placeholderTextColor="#9ca3af"
                autoFocus
              />
            </View>

            <View style={styles.formGroup}>
              <Text style={styles.label}>Protein per 100g</Text>
              <TextInput
                style={styles.input}
                placeholder="e.g., 25.5"
                value={ingredientProtein}
                onChangeText={setIngredientProtein}
                keyboardType="decimal-pad"
                placeholderTextColor="#9ca3af"
              />
            </View>

            <View style={styles.modalButtons}>
              <TouchableOpacity
                style={styles.modalCancelButton}
                onPress={() => setShowAddModal(false)}
              >
                <Text style={styles.modalCancelText}>{t.cancel}</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.modalSaveButton}
                onPress={handleAddIngredient}
              >
                <Text style={styles.modalSaveText}>Add</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* Edit Ingredient Modal */}
      <Modal visible={showEditModal} transparent animationType="fade">
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Edit Ingredient</Text>
            
            <View style={styles.formGroup}>
              <Text style={styles.label}>Ingredient Name</Text>
              <TextInput
                style={styles.input}
                placeholder="e.g., Grilled Chicken"
                value={ingredientName}
                onChangeText={setIngredientName}
                placeholderTextColor="#9ca3af"
                autoFocus
              />
            </View>

            <View style={styles.formGroup}>
              <Text style={styles.label}>Protein per 100g</Text>
              <TextInput
                style={styles.input}
                placeholder="e.g., 25.5"
                value={ingredientProtein}
                onChangeText={setIngredientProtein}
                keyboardType="decimal-pad"
                placeholderTextColor="#9ca3af"
              />
            </View>

            <View style={styles.modalButtons}>
              <TouchableOpacity
                style={styles.modalCancelButton}
                onPress={() => {
                  setShowEditModal(false);
                  setEditingIngredient(null);
                }}
              >
                <Text style={styles.modalCancelText}>{t.cancel}</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.modalSaveButton}
                onPress={handleSaveEdit}
              >
                <Text style={styles.modalSaveText}>{t.save}</Text>
              </TouchableOpacity>
            </View>
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
  ingredientCard: {
    backgroundColor: '#ffffff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  ingredientInfo: {
    flex: 1,
  },
  ingredientName: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1f2937',
    marginBottom: 4,
  },
  ingredientProtein: {
    fontSize: 16,
    fontWeight: '600',
    color: '#3b82f6',
  },
  ingredientActions: {
    flexDirection: 'row',
    gap: 8,
  },
  editButton: {
    backgroundColor: '#3b82f6',
    borderRadius: 8,
    paddingHorizontal: 16,
    paddingVertical: 8,
  },
  editButtonText: {
    color: '#ffffff',
    fontSize: 14,
    fontWeight: '600',
  },
  deleteButton: {
    backgroundColor: '#ef4444',
    borderRadius: 8,
    paddingHorizontal: 16,
    paddingVertical: 8,
  },
  deleteButtonText: {
    color: '#ffffff',
    fontSize: 14,
    fontWeight: '600',
  },
  addButton: {
    backgroundColor: '#3b82f6',
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    marginTop: 8,
    marginBottom: 16,
  },
  addButtonText: {
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
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
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
  modalButtons: {
    flexDirection: 'row',
    gap: 8,
    marginTop: 8,
  },
  modalCancelButton: {
    flex: 1,
    backgroundColor: '#f3f4f6',
    borderRadius: 8,
    padding: 12,
    alignItems: 'center',
  },
  modalCancelText: {
    color: '#374151',
    fontSize: 16,
    fontWeight: '600',
  },
  modalSaveButton: {
    flex: 1,
    backgroundColor: '#3b82f6',
    borderRadius: 8,
    padding: 12,
    alignItems: 'center',
  },
  modalSaveText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '600',
  },
});
