import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Image,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Alert,
  Dimensions,
} from 'react-native';
import { TextInput, Title } from 'react-native-paper';
import { useAuth } from '../context/AuthContext';
import { colors } from '../theme/theme';
import { LinearGradient } from 'expo-linear-gradient';
import { BlurView } from 'expo-blur';
import GradientButton from '../components/GradientButton';

const { width, height } = Dimensions.get('window');

// Breakpoints responsivos (mesmos do CSS web)
const isMobile = width <= 480;
const isTablet = width > 480 && width <= 768;
const isTabletPro = width > 768 && width <= 1024;
const isDesktop = width > 1200;

export default function LoginScreen({ navigation }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const { login } = useAuth();

  const handleLogin = async () => {
    if (!email || !password) {
      Alert.alert('Erro', 'Por favor, preencha todos os campos');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const result = await login(email, password);

      if (result.success) {
        console.log('Login realizado com sucesso');
      } else {
        setError(result.message || 'Credenciais inválidas');
      }
    } catch (error) {
      setError('Erro de conexão. Verifique sua internet.');
    } finally {
      setLoading(false);
    }
  };

  return (
    // login-page
    <View style={styles.loginPage}>
      {/* login-bg */}
      <View style={styles.loginBg}>
        {/* Background gradient */}
        <LinearGradient
          colors={['#1e3a8a', '#3b82f6', '#60a5fa']}
          style={styles.gradient}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
        />

        {/* Partículas flutuantes */}
        <View style={styles.particles} />

        {/* login-watermark */}
        <View style={styles.loginWatermark}>
          <Image
            source={require('../../assets/ibva-logo.png')}
            style={styles.watermarkImage}
            resizeMode="contain"
          />
        </View>

        {/* login-card */}
        <View style={styles.loginCard}>
          {/* login-form */}
          <BlurView intensity={15} style={styles.blurContainer}>
            <View style={styles.loginForm}>
              {/* login-form-content */}
              <View style={styles.loginFormContent}>
                <Title style={styles.title}>Login</Title>

                <TextInput
                  label="E-mail"
                  value={email}
                  onChangeText={setEmail}
                  mode="outlined"
                  keyboardType="email-address"
                  autoCapitalize="none"
                  autoCorrect={false}
                  style={styles.input}
                  theme={{
                    colors: {
                      primary: 'rgba(255, 255, 255, 0.8)',
                      background: 'transparent',
                      text: '#ffffff',
                      placeholder: 'rgba(255, 255, 255, 0.65)', // Exatamente como no CSS web
                      outline: 'rgba(255, 255, 255, 0.3)',
                      onSurface: '#ffffff',
                      surface: 'transparent',
                      label: '#ffffff',
                      onSurfaceVariant: 'rgba(255, 255, 255, 0.65)', // Para o label quando focado
                    },
                  }}
                  outlineStyle={styles.inputOutline}
                  contentStyle={styles.inputContent}
                  textColor="#ffffff"
                  placeholderTextColor="rgba(255, 255, 255, 0.65)" // Exatamente como no CSS web
                />

                <TextInput
                  label="Senha"
                  value={password}
                  onChangeText={setPassword}
                  mode="outlined"
                  secureTextEntry={!showPassword}
                  right={
                    <TextInput.Icon
                      icon={showPassword ? 'eye-off' : 'eye'}
                      onPress={() => setShowPassword(!showPassword)}
                      color="rgba(255, 255, 255, 0.8)"
                    />
                  }
                  style={styles.input}
                  theme={{
                    colors: {
                      primary: 'rgba(255, 255, 255, 0.8)',
                      background: 'transparent',
                      text: '#ffffff',
                      placeholder: 'rgba(255, 255, 255, 0.65)', // Exatamente como no CSS web
                      outline: 'rgba(255, 255, 255, 0.3)',
                      onSurface: '#ffffff',
                      surface: 'transparent',
                      label: '#ffffff',
                      onSurfaceVariant: 'rgba(255, 255, 255, 0.65)', // Para o label quando focado
                    },
                  }}
                  outlineStyle={styles.inputOutline}
                  contentStyle={styles.inputContent}
                  textColor="#ffffff"
                  placeholderTextColor="rgba(255, 255, 255, 0.65)" // Exatamente como no CSS web
                />

                {error && (
                  <View style={styles.error}>
                    <Text style={styles.errorText}>{error}</Text>
                  </View>
                )}
              </View>

              {/* login-submit-btn */}
              <GradientButton
                title={loading ? 'Entrando...' : 'Entrar'}
                onPress={handleLogin}
                loading={loading}
                disabled={loading}
                style={styles.loginSubmitBtn}
              />
            </View>
          </BlurView>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  // login-page
  loginPage: {
    flex: 1,
    backgroundColor: '#1e3a8a',
  },
  // login-bg
  loginBg: {
    minHeight: height,
    height: height,
    width: width,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
    overflow: 'hidden',
    margin: 0,
    padding: isMobile ? 8 : isTablet ? 16 : isTabletPro ? 24 : 32, // Responsivo como no web
  },
  gradient: {
    position: 'absolute',
    left: 0,
    right: 0,
    top: 0,
    bottom: 0,
  },
  particles: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'transparent',
    zIndex: 0,
  },
  // login-watermark
  loginWatermark: {
    position: 'absolute',
    top: '50%',
    left: '50%',
    transform: [{ translateX: -500 }, { translateY: -500 }],
    width: 1000,
    height: 1000,
    opacity: 0.4,
    zIndex: 1,
    pointerEvents: 'none',
  },
  watermarkImage: {
    width: '100%',
    height: '100%',
    opacity: 1, // Logo colorida como no original
  },
  // login-card
  loginCard: {
    maxWidth: isMobile ? 350 : isTablet ? 380 : 420, // Responsivo
    width: '100%',
    margin: 0,
    position: 'relative',
    zIndex: 2,
    backgroundColor: 'rgba(255, 255, 255, 0)',
  },
  blurContainer: {
    borderRadius: 24,
    overflow: 'hidden',
  },
  // login-form
  loginForm: {
    backgroundColor: 'rgba(255, 255, 255, 0)',
    borderWidth: 2,
    borderColor: 'rgba(255, 255, 255, 0.2)',
    borderTopColor: 'rgba(255, 255, 255, 0.4)',
    borderLeftColor: 'rgba(255, 255, 255, 0.3)',
    borderRadius: 24,
    padding: isMobile ? 32 : isTablet ? 38 : 45, // Responsivo
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.3,
    shadowRadius: 32,
    elevation: 8,
    position: 'relative',
  },
  // login-form-content
  loginFormContent: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
  },
  title: {
    textAlign: 'center',
    marginBottom: isMobile ? 24 : 32, // Responsivo
    color: '#ffffff',
    fontSize: isMobile ? 24 : isTablet ? 26 : 30, // Responsivo como no web
    fontWeight: '700',
    textShadowColor: 'rgba(0, 0, 0, 0.4)',
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 8,
    letterSpacing: -0.5,
  },
  input: {
    width: '100%',
    marginBottom: isMobile ? 14 : 18, // Responsivo
    backgroundColor: 'transparent',
    fontSize: isMobile ? 16 : 16, // Evita zoom no iOS como no web
    fontWeight: '500',
  },
  inputOutline: {
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.3)',
  },
  inputContent: {
    backgroundColor: 'transparent',
    paddingVertical: isMobile ? 12 : 16, // Responsivo
    paddingHorizontal: isMobile ? 16 : 20, // Responsivo
  },
  error: {
    backgroundColor: 'rgba(239, 68, 68, 0.1)',
    borderRadius: 12,
    paddingVertical: isMobile ? 10 : 12, // Responsivo
    paddingHorizontal: isMobile ? 12 : 16, // Responsivo
    marginBottom: isMobile ? 12 : 16, // Responsivo
    borderWidth: 1,
    borderColor: 'rgba(239, 68, 68, 0.3)',
  },
  errorText: {
    color: '#fecaca',
    fontSize: isMobile ? 13 : 14, // Responsivo
    fontWeight: '500',
    textAlign: 'center',
  },
  // login-submit-btn
  loginSubmitBtn: {
    marginTop: isMobile ? 8 : 12, // Responsivo
  },
});
