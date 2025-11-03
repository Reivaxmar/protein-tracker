import { View, Text, TextInput, TouchableOpacity, StyleSheet, ScrollView, Alert } from 'react-native';
import { useState } from 'react';
import { useProteinStore } from '../store/proteinStore';

export default function SettingsScreen() {
  const targetProtein = useProteinStore((state) => state.targetProtein);
  const setTargetProtein = useProteinStore((state) => state.setTargetProtein);
  const [inputValue, setInputValue] = useState(targetProtein.toString());

  const handleSave = () => {
    const newTarget = parseFloat(inputValue);
    if (isNaN(newTarget) || newTarget <= 0) {
      Alert.alert('Error', 'Please enter a valid target protein value');
      return;
    }
    setTargetProtein(newTarget);
    Alert.alert('Success', 'Target protein updated successfully!');
  };

  return (
    <ScrollView style={styles.container}>
      <View style={styles.content}>
        <View style={styles.card}>
          <Text style={styles.title}>Daily Protein Target</Text>
          
          <View style={styles.formGroup}>
            <Text style={styles.label}>Target Protein (grams per day)</Text>
            <TextInput
              style={styles.input}
              placeholder="e.g., 150"
              value={inputValue}
              onChangeText={setInputValue}
              keyboardType="decimal-pad"
              placeholderTextColor="#9ca3af"
            />
            <Text style={styles.hint}>
              Recommended: 0.8-1g per kg of body weight for maintenance,{'\n'}
              1.6-2.2g per kg for muscle building
            </Text>
          </View>

          <TouchableOpacity
            style={styles.button}
            onPress={handleSave}
          >
            <Text style={styles.buttonText}>Save Target</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.infoCard}>
          <Text style={styles.infoTitle}>About Protein Tracker</Text>
          <Text style={styles.infoText}>
            Track your daily protein intake to meet your fitness goals. 
            Add meals manually or scan barcodes to quickly log your protein consumption.
          </Text>
        </View>

        <View style={styles.infoCard}>
          <Text style={styles.infoTitle}>Features</Text>
          <Text style={styles.infoText}>
            ✓ Track daily protein intake{'\n'}
            ✓ Add meals with custom protein values{'\n'}
            ✓ Scan barcodes (requires food database integration){'\n'}
            ✓ View progress and remaining allowance{'\n'}
            ✓ Data persists across app restarts
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
    marginBottom: 8,
  },
  hint: {
    fontSize: 12,
    color: '#6b7280',
    lineHeight: 16,
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
  infoTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1f2937',
    marginBottom: 12,
  },
  infoText: {
    fontSize: 14,
    color: '#6b7280',
    lineHeight: 20,
  },
});
