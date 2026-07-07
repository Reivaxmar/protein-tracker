import { View, Text, TextInput, TouchableOpacity, StyleSheet, ScrollView, Alert, Modal, Linking } from 'react-native';
import { useState } from 'react';
import { useProteinStore } from '../store/proteinStore';
import { useLanguageStore } from '../store/languageStore';
import { useTagStore, DEFAULT_TAGS } from '../store/tagStore';
import { useAuthStore } from '../store/authStore';
import { Language } from '../translations';
import { exportAsXLSX } from '../utils/exportData';

export default function SettingsScreen() {
  const targetProtein = useProteinStore((state) => state.targetProtein);
  const setTargetProtein = useProteinStore((state) => state.setTargetProtein);
  const meals = useProteinStore((state) => state.meals);
  const dailyProteinData = useProteinStore((state) => state.dailyProteinData);
  const recipes = useProteinStore((state) => state.recipes);
  const customIngredients = useProteinStore((state) => state.customIngredients);
  const clearData = useProteinStore((state) => state.clearData);
  const language = useLanguageStore((state) => state.language);
  const setLanguage = useLanguageStore((state) => state.setLanguage);
  const t = useLanguageStore((state) => state.translations);
  const tags = useTagStore((state) => state.tags);
  const addTag = useTagStore((state) => state.addTag);
  const removeTag = useTagStore((state) => state.removeTag);
  const { user, logout } = useAuthStore();
  const [inputValue, setInputValue] = useState(targetProtein.toString());
  const [newTagValue, setNewTagValue] = useState('');
  const [showExportModal, setShowExportModal] = useState(false);
  const [emailValue, setEmailValue] = useState('');
  const [isExportingSpreadsheet, setIsExportingSpreadsheet] = useState(false);

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

  const formatDataForEmail = () => {
    let emailBody = 'PROTEIN TRACKER DATA EXPORT\n';
    emailBody += '================================\n\n';

    // Daily Meals Section
    emailBody += '📅 DAILY MEALS\n';
    emailBody += '---------------\n\n';
    
    const sortedDates = Object.keys(dailyProteinData).sort().reverse();
    if (sortedDates.length === 0) {
      emailBody += 'No meals recorded yet.\n\n';
    } else {
      sortedDates.forEach((date) => {
        const dayData = dailyProteinData[date];
        emailBody += `Date: ${date}\n`;
        emailBody += `Total Protein: ${dayData.totalProtein.toFixed(1)}g / Target: ${dayData.targetProtein}g\n`;
        emailBody += 'Meals:\n';
        dayData.meals.forEach((meal) => {
          emailBody += `  • ${meal.name}: ${meal.totalProtein.toFixed(1)}g protein (${meal.gramsEaten}g eaten)`;
          if (meal.tag) {
            emailBody += ` [${meal.tag}]`;
          }
          emailBody += '\n';
        });
        emailBody += '\n';
      });
    }

    // Custom Ingredients Section
    emailBody += '\n🥗 CUSTOM INGREDIENTS\n';
    emailBody += '----------------------\n\n';
    
    if (customIngredients.length === 0) {
      emailBody += 'No custom ingredients created yet.\n\n';
    } else {
      customIngredients.forEach((ingredient) => {
        emailBody += `• ${ingredient.name}: ${ingredient.proteinPer100g}g protein per 100g\n`;
      });
      emailBody += '\n';
    }

    // Recipes Section
    emailBody += '\n📝 RECIPES\n';
    emailBody += '-----------\n\n';
    
    if (recipes.length === 0) {
      emailBody += 'No recipes created yet.\n\n';
    } else {
      recipes.forEach((recipe) => {
        emailBody += `Recipe: ${recipe.name}\n`;
        emailBody += `Total: ${recipe.totalProtein.toFixed(1)}g protein, ${recipe.totalGrams}g total\n`;
        emailBody += 'Ingredients:\n';
        recipe.ingredients.forEach((ing) => {
          emailBody += `  • ${ing.name}: ${ing.gramsInRecipe}g (${ing.totalProtein.toFixed(1)}g protein)\n`;
        });
        emailBody += '\n';
      });
    }

    emailBody += '\n================================\n';
    emailBody += 'Exported from Protein Tracker App\n';

    return emailBody;
  };

  const validateEmail = (email: string) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  const handleExportViaEmail = async () => {
    if (!emailValue.trim()) {
      Alert.alert(t.error, t.settings.emailRequired || 'Please enter an email address');
      return;
    }

    if (!validateEmail(emailValue.trim())) {
      Alert.alert(t.error, t.settings.invalidEmail || 'Please enter a valid email address');
      return;
    }

    const emailBody = formatDataForEmail();
    const subject = encodeURIComponent('Protein Tracker - Data Export');
    const body = encodeURIComponent(emailBody);
    const mailtoUrl = `mailto:${emailValue.trim()}?subject=${subject}&body=${body}`;

    try {
      const supported = await Linking.canOpenURL(mailtoUrl);
      if (supported) {
        await Linking.openURL(mailtoUrl);
        setShowExportModal(false);
        setEmailValue('');
      } else {
        Alert.alert(t.error, t.settings.noEmailApp || 'No email app available on this device');
      }
    } catch (error) {
      console.error('Error opening email:', error);
      Alert.alert(t.error, t.settings.exportError);
    }
  };

  const handleExportSpreadsheet = async () => {
    if (!Array.isArray(meals) || meals.length === 0) {
      Alert.alert(t.error, t.settings.noDataToExport);
      return;
    }

    setIsExportingSpreadsheet(true);
    try {
      await exportAsXLSX({ meals, dailyProteinData });
      Alert.alert(t.success, t.settings.exportSuccess);
    } catch (error: any) {
      const message = error?.message === 'No data to export'
        ? t.settings.noDataToExport
        : t.settings.exportError;
      Alert.alert(t.error, message);
    } finally {
      setIsExportingSpreadsheet(false);
    }
  };

  const handleLogout = () => {
    Alert.alert(
      t.settings.logoutConfirmation,
      t.settings.logoutMessage,
      [
        { text: t.cancel, style: 'cancel' },
        {
          text: t.settings.logout,
          style: 'destructive',
          onPress: async () => {
            try {
              await logout();
              // Clear local data after logout to prevent data leakage
              clearData();
            } catch (error: any) {
              Alert.alert(t.error, error.message || 'Failed to logout');
            }
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

        <View style={styles.card}>
          <Text style={styles.title}>{t.settings.exportData}</Text>
          
          <View style={styles.formGroup}>
            <Text style={styles.hint}>
              {t.settings.exportDescription}
            </Text>
          </View>

          <TouchableOpacity
            style={styles.exportButton}
            onPress={handleExportSpreadsheet}
            disabled={isExportingSpreadsheet}
          >
            <Text style={styles.exportButtonText}>
              {isExportingSpreadsheet ? '⏳' : '📊'} {t.settings.exportXLSX}
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.exportSecondaryButton}
            onPress={() => setShowExportModal(true)}
          >
            <Text style={styles.exportButtonText}>📧 {t.settings.exportViaEmail || 'Export via Email'}</Text>
          </TouchableOpacity>
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

        {user && (
          <View style={styles.card}>
            <Text style={styles.title}>{t.settings.account}</Text>
            <View style={styles.formGroup}>
              <Text style={styles.label}>{t.settings.loggedInAs}</Text>
              <Text style={styles.userEmail}>{user.email}</Text>
              <Text style={styles.hint}>
                {t.settings.syncInfo}
              </Text>
            </View>
            <TouchableOpacity
              style={styles.logoutButton}
              onPress={handleLogout}
            >
              <Text style={styles.logoutButtonText}>{t.settings.logout}</Text>
            </TouchableOpacity>
          </View>
        )}
      </View>

      <Modal
        visible={showExportModal}
        transparent={true}
        animationType="slide"
        onRequestClose={() => setShowExportModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>{t.settings.exportViaEmail || 'Export via Email'}</Text>
            
            <Text style={styles.modalDescription}>
              {t.settings.exportEmailPrompt || 'Enter your email address to receive your data export:'}
            </Text>
            
            <TextInput
              style={styles.emailInput}
              placeholder={t.settings.emailPlaceholder || 'your@email.com'}
              value={emailValue}
              onChangeText={setEmailValue}
              keyboardType="email-address"
              autoCapitalize="none"
              autoCorrect={false}
              placeholderTextColor="#9ca3af"
            />
            
            <Text style={styles.modalHint}>
              {t.settings.exportEmailHint || 'This will open your email app with all your data ready to send.'}
            </Text>
            
            <View style={styles.modalButtons}>
              <TouchableOpacity
                style={styles.modalCancelButton}
                onPress={() => {
                  setShowExportModal(false);
                  setEmailValue('');
                }}
              >
                <Text style={styles.modalCancelButtonText}>{t.cancel}</Text>
              </TouchableOpacity>
              
              <TouchableOpacity
                style={styles.modalSendButton}
                onPress={handleExportViaEmail}
              >
                <Text style={styles.modalSendButtonText}>{t.settings.sendExport || 'Send Export'}</Text>
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
  exportButton: {
    backgroundColor: '#8b5cf6',
    borderRadius: 8,
    padding: 16,
    alignItems: 'center',
  },
  exportButtonText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '600',
  },
  exportSecondaryButton: {
    backgroundColor: '#8b5cf6',
    borderRadius: 8,
    padding: 16,
    alignItems: 'center',
    marginTop: 12,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  modalContent: {
    backgroundColor: '#ffffff',
    borderRadius: 16,
    padding: 24,
    width: '100%',
    maxWidth: 400,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 5,
  },
  modalTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#1f2937',
    marginBottom: 12,
    textAlign: 'center',
  },
  modalDescription: {
    fontSize: 14,
    color: '#6b7280',
    marginBottom: 16,
    textAlign: 'center',
  },
  emailInput: {
    backgroundColor: '#f9fafb',
    borderWidth: 1,
    borderColor: '#d1d5db',
    borderRadius: 8,
    padding: 14,
    fontSize: 16,
    color: '#1f2937',
    marginBottom: 12,
  },
  modalHint: {
    fontSize: 12,
    color: '#9ca3af',
    marginBottom: 20,
    textAlign: 'center',
    lineHeight: 16,
  },
  modalButtons: {
    flexDirection: 'row',
    gap: 12,
  },
  modalCancelButton: {
    flex: 1,
    backgroundColor: '#f3f4f6',
    borderRadius: 8,
    padding: 14,
    alignItems: 'center',
  },
  modalCancelButtonText: {
    color: '#6b7280',
    fontSize: 16,
    fontWeight: '600',
  },
  modalSendButton: {
    flex: 1,
    backgroundColor: '#8b5cf6',
    borderRadius: 8,
    padding: 14,
    alignItems: 'center',
  },
  modalSendButtonText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '600',
  },
  userEmail: {
    fontSize: 16,
    color: '#1f2937',
    fontWeight: '500',
    marginBottom: 8,
  },
  logoutButton: {
    backgroundColor: '#ef4444',
    borderRadius: 8,
    padding: 16,
    alignItems: 'center',
  },
  logoutButtonText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '600',
  },
});
