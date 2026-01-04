import { View, Text, TextInput, TouchableOpacity, StyleSheet, ScrollView, Alert } from 'react-native';
import { useState } from 'react';
import { useProteinStore } from '../store/proteinStore';
import { useLanguageStore } from '../store/languageStore';
import { useTagStore, DEFAULT_TAGS } from '../store/tagStore';
import { Language } from '../translations';

export default function SettingsScreen() {
  const targetProtein = useProteinStore((state) => state.targetProtein);
  const setTargetProtein = useProteinStore((state) => state.setTargetProtein);
  const language = useLanguageStore((state) => state.language);
  const setLanguage = useLanguageStore((state) => state.setLanguage);
  const t = useLanguageStore((state) => state.translations);
  const tags = useTagStore((state) => state.tags);
  const addTag = useTagStore((state) => state.addTag);
  const removeTag = useTagStore((state) => state.removeTag);
  const [inputValue, setInputValue] = useState(targetProtein.toString());
  const [newTagValue, setNewTagValue] = useState('');

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

  const handleAddTag = () => {
    const trimmedTag = newTagValue.trim();
    if (!trimmedTag) {
      Alert.alert(t.error, 'Please enter a tag name');
      return;
    }
    if (tags.some(t => t.toLowerCase() === trimmedTag.toLowerCase())) {
      Alert.alert(t.error, 'This tag already exists');
      return;
    }
    addTag(trimmedTag);
    setNewTagValue('');
    Alert.alert(t.success, 'Tag added successfully');
  };

  const handleRemoveTag = (tag: string) => {
    if (DEFAULT_TAGS.includes(tag.toLowerCase())) {
      Alert.alert(t.error, 'Cannot remove default tags');
      return;
    }
    Alert.alert(
      'Remove Tag',
      `Are you sure you want to remove the "${tag}" tag?`,
      [
        { text: t.cancel, style: 'cancel' },
        {
          text: 'Remove',
          style: 'destructive',
          onPress: () => {
            removeTag(tag);
            Alert.alert(t.success, 'Tag removed successfully');
          },
        },
      ]
    );
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

        <View style={styles.card}>
          <Text style={styles.title}>Meal Tags</Text>
          
          <View style={styles.formGroup}>
            <Text style={styles.label}>Current Tags</Text>
            <View style={styles.tagsContainer}>
              {tags.map((tag) => (
                <View key={tag} style={styles.tagItem}>
                  <Text style={styles.tagName}>{tag.charAt(0).toUpperCase() + tag.slice(1).toLowerCase()}</Text>
                  <TouchableOpacity
                    onPress={() => handleRemoveTag(tag)}
                    style={styles.removeTagButton}
                  >
                    <Text style={styles.removeTagText}>✕</Text>
                  </TouchableOpacity>
                </View>
              ))}
            </View>
          </View>

          <View style={styles.formGroup}>
            <Text style={styles.label}>Add New Tag</Text>
            <View style={styles.addTagContainer}>
              <TextInput
                style={styles.addTagInput}
                placeholder="e.g., snack, dessert"
                value={newTagValue}
                onChangeText={setNewTagValue}
                placeholderTextColor="#9ca3af"
              />
              <TouchableOpacity
                style={styles.addTagButton}
                onPress={handleAddTag}
              >
                <Text style={styles.addTagButtonText}>Add</Text>
              </TouchableOpacity>
            </View>
            <Text style={styles.hint}>
              Create custom tags to categorize your meals. Default tags (breakfast, lunch, dinner) cannot be removed.
            </Text>
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
  tagsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginBottom: 8,
  },
  tagItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#eff6ff',
    borderWidth: 1,
    borderColor: '#3b82f6',
    borderRadius: 20,
    paddingLeft: 16,
    paddingRight: 8,
    paddingVertical: 8,
  },
  tagName: {
    fontSize: 14,
    color: '#3b82f6',
    fontWeight: '500',
    marginRight: 8,
  },
  removeTagButton: {
    padding: 4,
  },
  removeTagText: {
    fontSize: 14,
    color: '#ef4444',
    fontWeight: 'bold',
  },
  addTagContainer: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 8,
  },
  addTagInput: {
    flex: 1,
    backgroundColor: '#f9fafb',
    borderWidth: 1,
    borderColor: '#d1d5db',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    color: '#1f2937',
  },
  addTagButton: {
    backgroundColor: '#10b981',
    borderRadius: 8,
    paddingHorizontal: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  addTagButtonText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '600',
  },
});
