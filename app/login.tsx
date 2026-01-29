import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Alert,
} from 'react-native';
import { useAuthStore } from '../store/authStore';
import { useLanguageStore } from '../store/languageStore';

export default function LoginScreen() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isRegisterMode, setIsRegisterMode] = useState(false);
  const { login, register, loading, error } = useAuthStore();
  const t = useLanguageStore((state) => state.translations);

  const handleSubmit = async () => {
    if (!email || !password) {
      Alert.alert(t.error, t.auth.enterBothFields);
      return;
    }

    if (!email.includes('@')) {
      Alert.alert(t.error, t.auth.invalidEmail);
      return;
    }

    try {
      if (isRegisterMode) {
        await register(email, password);
        Alert.alert(t.success, t.auth.accountCreated);
      } else {
        await login(email, password);
      }
    } catch (error: any) {
      Alert.alert(t.error, error.message || 'Authentication failed');
    }
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={styles.container}
    >
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        keyboardShouldPersistTaps="handled"
      >
        <View style={styles.content}>
          <View style={styles.header}>
            <Text style={styles.title}>{t.auth.appTitle}</Text>
            <Text style={styles.subtitle}>
              {isRegisterMode ? t.auth.createAccount : t.auth.welcomeBack}
            </Text>
          </View>

          <View style={styles.form}>
            <View style={styles.inputContainer}>
              <Text style={styles.label}>{t.auth.email}</Text>
              <TextInput
                style={styles.input}
                placeholder={t.auth.enterEmail}
                value={email}
                onChangeText={setEmail}
                autoCapitalize="none"
                keyboardType="email-address"
                editable={!loading}
              />
            </View>

            <View style={styles.inputContainer}>
              <Text style={styles.label}>{t.auth.password}</Text>
              <TextInput
                style={styles.input}
                placeholder={t.auth.enterPassword}
                value={password}
                onChangeText={setPassword}
                secureTextEntry
                editable={!loading}
              />
            </View>

            {error && <Text style={styles.errorText}>{error}</Text>}

            <TouchableOpacity
              style={[styles.button, loading && styles.buttonDisabled]}
              onPress={handleSubmit}
              disabled={loading}
            >
              {loading ? (
                <ActivityIndicator color="#fff" />
              ) : (
                <Text style={styles.buttonText}>
                  {isRegisterMode ? t.auth.register : t.auth.login}
                </Text>
              )}
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.switchButton}
              onPress={() => {
                setIsRegisterMode(!isRegisterMode);
                useAuthStore.setState({ error: null });
              }}
              disabled={loading}
            >
              <Text style={styles.switchButtonText}>
                {isRegisterMode
                  ? t.auth.alreadyHaveAccount
                  : t.auth.noAccount}
              </Text>
            </TouchableOpacity>
          </View>

          <View style={styles.footer}>
            <Text style={styles.footerText}>
              {isRegisterMode
                ? t.auth.createAccountInfo
                : t.auth.loginToSync}
            </Text>
          </View>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  scrollContent: {
    flexGrow: 1,
    justifyContent: 'center',
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    padding: 20,
  },
  header: {
    alignItems: 'center',
    marginBottom: 40,
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#3b82f6',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 18,
    color: '#6b7280',
  },
  form: {
    width: '100%',
    maxWidth: 400,
    alignSelf: 'center',
  },
  inputContainer: {
    marginBottom: 16,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: '#374151',
    marginBottom: 8,
  },
  input: {
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#d1d5db',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
  },
  button: {
    backgroundColor: '#3b82f6',
    padding: 16,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 8,
  },
  buttonDisabled: {
    opacity: 0.5,
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  switchButton: {
    marginTop: 16,
    alignItems: 'center',
    padding: 8,
  },
  switchButtonText: {
    color: '#3b82f6',
    fontSize: 14,
  },
  errorText: {
    color: '#ef4444',
    fontSize: 14,
    marginTop: 8,
    textAlign: 'center',
  },
  footer: {
    marginTop: 40,
    paddingHorizontal: 20,
  },
  footerText: {
    fontSize: 12,
    color: '#6b7280',
    textAlign: 'center',
    lineHeight: 18,
  },
});
