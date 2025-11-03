import { View, Text, TextInput, TouchableOpacity, StyleSheet, ScrollView, Alert } from 'react-native';
import { useState } from 'react';
import { useProteinStore } from '../store/proteinStore';
import { getTodayDateString } from '../utils/helpers';
import { useRouter } from 'expo-router';

export default function AddMealScreen() {
  const [name, setName] = useState('');
  const [proteinPer100g, setProteinPer100g] = useState('');
  const [gramsEaten, setGramsEaten] = useState('');
  const addMeal = useProteinStore((state) => state.addMeal);
  const router = useRouter();

  const calculateProtein = () => {
    if (!proteinPer100g || !gramsEaten) return 0;
    return (parseFloat(proteinPer100g) * parseFloat(gramsEaten)) / 100;
  };

  const handleSubmit = () => {
    if (!name.trim()) {
      Alert.alert('Error', 'Please enter a food name');
      return;
    }
    if (!proteinPer100g || parseFloat(proteinPer100g) <= 0) {
      Alert.alert('Error', 'Please enter a valid protein per 100g value');
      return;
    }
    if (!gramsEaten || parseFloat(gramsEaten) <= 0) {
      Alert.alert('Error', 'Please enter a valid grams eaten value');
      return;
    }

    addMeal({
      name: name.trim(),
      proteinPer100g: parseFloat(proteinPer100g),
      gramsEaten: parseFloat(gramsEaten),
      date: getTodayDateString(),
    });

    Alert.alert('Success', 'Meal added successfully!');
    setName('');
    setProteinPer100g('');
    setGramsEaten('');
    router.push('/');
  };

  return (
    <ScrollView style={styles.container}>
      <View style={styles.content}>
        <View style={styles.card}>
          <Text style={styles.title}>Add New Meal</Text>
          
          <View style={styles.formGroup}>
            <Text style={styles.label}>Food Name</Text>
            <TextInput
              style={styles.input}
              placeholder="e.g., Chicken Breast"
              value={name}
              onChangeText={setName}
              placeholderTextColor="#9ca3af"
            />
          </View>

          <View style={styles.formGroup}>
            <Text style={styles.label}>Protein per 100g (grams)</Text>
            <TextInput
              style={styles.input}
              placeholder="e.g., 31"
              value={proteinPer100g}
              onChangeText={setProteinPer100g}
              keyboardType="decimal-pad"
              placeholderTextColor="#9ca3af"
            />
          </View>

          <View style={styles.formGroup}>
            <Text style={styles.label}>Grams Eaten</Text>
            <TextInput
              style={styles.input}
              placeholder="e.g., 150"
              value={gramsEaten}
              onChangeText={setGramsEaten}
              keyboardType="decimal-pad"
              placeholderTextColor="#9ca3af"
            />
          </View>

          {proteinPer100g && gramsEaten && (
            <View style={styles.calculatedContainer}>
              <Text style={styles.calculatedLabel}>Total Protein:</Text>
              <Text style={styles.calculatedValue}>
                {calculateProtein().toFixed(1)}g
              </Text>
            </View>
          )}

          <TouchableOpacity
            style={styles.button}
            onPress={handleSubmit}
          >
            <Text style={styles.buttonText}>Add Meal</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.infoCard}>
          <Text style={styles.infoTitle}>💡 Tips</Text>
          <Text style={styles.infoText}>
            • Check food labels for protein content per 100g{'\n'}
            • Use a food scale for accurate measurements{'\n'}
            • Common protein sources: Chicken breast (31g), Greek yogurt (10g), Eggs (13g)
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
    marginBottom: 24,
  },
  formGroup: {
    marginBottom: 20,
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
  calculatedContainer: {
    backgroundColor: '#eff6ff',
    borderRadius: 8,
    padding: 16,
    marginBottom: 20,
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
  button: {
    backgroundColor: '#3b82f6',
    borderRadius: 8,
    padding: 16,
    alignItems: 'center',
  },
  buttonText: {
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
