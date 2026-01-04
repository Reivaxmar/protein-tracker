import { View, Text, TextInput, TouchableOpacity, StyleSheet, ScrollView, Alert } from 'react-native';
import { useState } from 'react';
import { useProteinStore } from '../store/proteinStore';
import { useLanguageStore } from '../store/languageStore';
import { Language } from '../translations';

export default function SettingsScreen() {
  const targetProtein = useProteinStore((state) => state.targetProtein);
  const setTargetProtein = useProteinStore((state) => state.setTargetProtein);
  const language = useLanguageStore((state) => state.language);
  const setLanguage = useLanguageStore((state) => state.setLanguage);
  const t = useLanguageStore((state) => state.translations);
  const [inputValue, setInputValue] = useState(targetProtein.toString());

  const handleSave = () => {
    const newTarget = parseFloat(inputValue);
    if (isNaN(newTarget) || newTarget <= 0) {
      Alert.alert(t.error, t.settings.errorMessage);
      return;
    }
    setTargetProtein(newTarget);
    Alert.alert(t.success, t.settings.successMessage);
  };

  const handleLanguageChange = (newLanguage: Language) => {
    setLanguage(newLanguage);
  };

  return (
    <ScrollView style={styles.container}>
      <View style={styles.content}>
        <View style={styles.card}>
          <Text style={styles.title}>{t.settings.dailyProteinLimit}</Text>
          
          <View style={styles.formGroup}>
            <Text style={styles.label}>{t.settings.maximumProtein}</Text>
            <TextInput
              style={styles.input}
              placeholder={t.settings.placeholder}
              value={inputValue}
              onChangeText={setInputValue}
              keyboardType="decimal-pad"
              placeholderTextColor="#9ca3af"
            />
            <Text style={styles.hint}>
              {t.settings.hint}
            </Text>
          </View>

          <TouchableOpacity
            style={styles.button}
            onPress={handleSave}
          >
            <Text style={styles.buttonText}>{t.settings.saveLimit}</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.card}>
          <Text style={styles.title}>{t.settings.language}</Text>
          
          <View style={styles.formGroup}>
            <Text style={styles.label}>{t.settings.selectLanguage}</Text>
            <View style={styles.languageButtons}>
              <TouchableOpacity
                style={[
                  styles.languageButton,
                  language === 'en' && styles.languageButtonActive,
                ]}
                onPress={() => handleLanguageChange('en')}
              >
                <Text
                  style={[
                    styles.languageButtonText,
                    language === 'en' && styles.languageButtonTextActive,
                  ]}
                >
                  English
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[
                  styles.languageButton,
                  language === 'es' && styles.languageButtonActive,
                ]}
                onPress={() => handleLanguageChange('es')}
              >
                <Text
                  style={[
                    styles.languageButtonText,
                    language === 'es' && styles.languageButtonTextActive,
                  ]}
                >
                  Español
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>

        <View style={styles.infoCard}>
          <Text style={styles.infoTitle}>{t.settings.aboutTitle}</Text>
          <Text style={styles.infoText}>
            {t.settings.aboutText}
          </Text>
        </View>

        <View style={styles.infoCard}>
          <Text style={styles.infoTitle}>{t.settings.featuresTitle}</Text>
          <Text style={styles.infoText}>
            {t.settings.featuresText}
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
  languageButtons: {
    flexDirection: 'row',
    gap: 12,
  },
  languageButton: {
    flex: 1,
    backgroundColor: '#f3f4f6',
    borderWidth: 2,
    borderColor: '#d1d5db',
    borderRadius: 8,
    padding: 16,
    alignItems: 'center',
  },
  languageButtonActive: {
    backgroundColor: '#eff6ff',
    borderColor: '#3b82f6',
  },
  languageButtonText: {
    color: '#6b7280',
    fontSize: 16,
    fontWeight: '600',
  },
  languageButtonTextActive: {
    color: '#3b82f6',
  },
});
