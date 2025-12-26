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
      Alert.alert('Error', 'Please enter a valid protein limit value');
      return;
    }
    setTargetProtein(newTarget);
    Alert.alert('Success', 'Protein limit updated successfully!');
  };

  return (
    <ScrollView style={styles.container}>
      <View style={styles.content}>
        <View style={styles.card}>
          <Text style={styles.title}>Daily Protein Limit</Text>
          
          <View style={styles.formGroup}>
            <Text style={styles.label}>Maximum Protein (grams per day)</Text>
            <TextInput
              style={styles.input}
              placeholder="e.g., 150"
              value={inputValue}
              onChangeText={setInputValue}
              keyboardType="decimal-pad"
              placeholderTextColor="#9ca3af"
            />
            <Text style={styles.hint}>
              Set your daily protein limit. The app will track your intake{'\n'}
              and alert you when approaching or exceeding your limit.
            </Text>
          </View>

          <TouchableOpacity
            style={styles.button}
            onPress={handleSave}
          >
            <Text style={styles.buttonText}>Save Limit</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.infoCard}>
          <Text style={styles.infoTitle}>About Protein Tracker</Text>
          <Text style={styles.infoText}>
            Track your daily protein intake to stay within your limit. 
            Add meals manually or scan barcodes to monitor your protein consumption.
          </Text>
        </View>

        <View style={styles.infoCard}>
          <Text style={styles.infoTitle}>Features</Text>
          <Text style={styles.infoText}>
            ✓ Track daily protein intake{'\n'}
            ✓ Add meals with custom protein values{'\n'}
            ✓ Scan barcodes (requires food database integration){'\n'}
            ✓ Monitor remaining allowance below your limit{'\n'}
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
