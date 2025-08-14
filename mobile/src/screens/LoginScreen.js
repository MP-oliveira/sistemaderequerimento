import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Image,
  TextInput,
  TouchableOpacity,
  Dimensions,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Animated,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { BlurView } from 'expo-blur';
import { useAuth } from '../context/AuthContext';
import { useNavigation } from '@react-navigation/native';

const { width, height } = Dimensions.get('window');

// Breakpoints responsivos (mesmos do CSS web)
const isMobile = width <= 480;
const isTablet = width > 480 && width <= 768;
const isTabletPro = width > 768 && width <= 1024;
const isDesktop = width > 1200;

export default function LoginScreen() {
  const { login, loading: loadingAuth, user } = useAuth();
  const navigation = useNavigation();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [focusedInput, setFocusedInput] = useState(null);

  // Animação para partículas flutuantes
  const floatAnimation = new Animated.Value(0);

  useEffect(() => {
    // Animação infinita das partículas
    const startFloatAnimation = () => {
      Animated.sequence([
        Animated.timing(floatAnimation, {
          toValue: 1,
          duration: 10000,
          useNativeDriver: true,
        }),
        Animated.timing(floatAnimation, {
          toValue: 0,
          duration: 10000,
          useNativeDriver: true,
        }),
      ]).start(() => startFloatAnimation());
    };
    startFloatAnimation();
  }, []);

  useEffect(() => {
    if (user) {
      navigation.navigate('Dashboard');
    }
  }, [user, navigation]);

  const handleSubmit = async () => {
    if (!email || !password) {
      setError('Por favor, preencha todos os campos');
      return;
    }

    setLoading(true);
    setError('');

    try {
      await login({ email, password });
    } catch (err) {
      setError(err.message || 'E-mail ou senha inválidos');
    }

    setLoading(false);
  };

  if (loadingAuth) {
    return (
      <View style={styles.loginBg}>
        <LinearGradient
          colors={['#1e3a8a', '#3b82f6', '#60a5fa']}
          style={styles.gradient}
          start={{ x: 0, y: 1 }}
          end={{ x: 1, y: 0 }}
          locations={[0, 0.5, 1]}
        />
        <View style={styles.loginLoading}>
          <Text style={styles.loginLoadingText}>Carregando...</Text>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.loginPage}>
      <View style={styles.loginBg}>
        {/* Background gradient */}
        <LinearGradient
          colors={['#1e3a8a', '#3b82f6', '#60a5fa']}
          style={styles.gradient}
          start={{ x: 0, y: 1 }}
          end={{ x: 1, y: 0 }}
          locations={[0, 0.5, 1]}
        />

        {/* Partículas flutuantes animadas */}
        <Animated.View 
          style={[
            styles.particles,
            {
              transform: [
                {
                  translateX: floatAnimation.interpolate({
                    inputRange: [0, 1],
                    outputRange: [0, 10],
                  }),
                },
                {
                  translateY: floatAnimation.interpolate({
                    inputRange: [0, 1],
                    outputRange: [0, -10],
                  }),
                },
                {
                  rotate: floatAnimation.interpolate({
                    inputRange: [0, 1],
                    outputRange: ['0deg', '120deg'],
                  }),
                },
              ],
            },
          ]}
        />

        {/* Logo watermark */}
        <View style={styles.loginWatermark}>
          <Image
            source={require('../../assets/ibva-logo.png')}
            style={styles.watermarkImage}
            resizeMode="contain"
          />
        </View>

        {/* Login card */}
        <View style={styles.loginCard}>
          <BlurView intensity={15} style={styles.blurContainer}>
            <View style={styles.loginForm}>
              {/* Sombras internas simuladas */}
              <View style={styles.insetShadowTop} />
              <View style={styles.insetShadowLeft} />

              <View style={styles.loginFormContent}>
                <Text style={styles.title}>Login</Text>

                <TextInput
                  style={[
                    styles.input,
                    focusedInput === 'email' && styles.inputFocused,
                  ]}
                  placeholder="E-mail"
                  placeholderTextColor="rgba(255, 255, 255, 0.65)"
                  value={email}
                  onChangeText={setEmail}
                  onFocus={() => setFocusedInput('email')}
                  onBlur={() => setFocusedInput(null)}
                  keyboardType="email-address"
                  autoCapitalize="none"
                  autoCorrect={false}
                  required
                />

                <View style={styles.passwordContainer}>
                  <TextInput
                    style={[
                      styles.input,
                      focusedInput === 'password' && styles.inputFocused,
                    ]}
                    placeholder="Senha"
                    placeholderTextColor="rgba(255, 255, 255, 0.65)"
                    value={password}
                    onChangeText={setPassword}
                    onFocus={() => setFocusedInput('password')}
                    onBlur={() => setFocusedInput(null)}
                    secureTextEntry={!showPassword}
                    required
                  />
                  <TouchableOpacity
                    style={styles.eyeIcon}
                    onPress={() => setShowPassword(!showPassword)}
                  >
                    <Text style={styles.eyeIconText}>
                      {showPassword ? '👁️' : '👁️‍🗨️'}
                    </Text>
                  </TouchableOpacity>
                </View>

                {error && (
                  <View style={styles.error}>
                    <Text style={styles.errorText}>{error}</Text>
                  </View>
                )}
              </View>

              <TouchableOpacity
                style={[styles.button, loading && styles.buttonDisabled]}
                onPress={handleSubmit}
                disabled={loading}
                activeOpacity={0.8}
              >
                <LinearGradient
                  colors={loading ? ['#64748b', '#94a3b8'] : ['#2563eb', '#3b82f6']}
                  style={styles.buttonGradient}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 1 }}
                >
                  <Text style={styles.buttonText}>
                    {loading ? 'Entrando...' : 'Entrar'}
                  </Text>
                </LinearGradient>
              </TouchableOpacity>
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
    padding: 0,
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
    opacity: 1,
  },
  
  // login-card
  loginCard: {
    maxWidth: isMobile ? 350 : isTablet ? 380 : 420,
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
    padding: isMobile ? 32 : isTablet ? 38 : 45,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.3,
    shadowRadius: 32,
    elevation: 8,
    position: 'relative',
  },
  
  // Sombras internas simuladas
  insetShadowTop: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: 1,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
  },
  
  insetShadowLeft: {
    position: 'absolute',
    top: 0,
    left: 0,
    bottom: 0,
    width: 1,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderTopLeftRadius: 24,
    borderBottomLeftRadius: 24,
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
    marginBottom: isMobile ? 24 : 32,
    color: '#ffffff',
    fontSize: isMobile ? 24 : isTablet ? 26 : 30,
    fontWeight: '700',
    textShadowColor: 'rgba(0, 0, 0, 0.4)',
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 8,
    letterSpacing: -0.5,
  },
  
  input: {
    width: '100%',
    paddingVertical: isMobile ? 12 : 16,
    paddingHorizontal: isMobile ? 16 : 20,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.3)',
    marginBottom: isMobile ? 14 : 18,
    fontSize: isMobile ? 16 : 16,
    backgroundColor: 'transparent',
    color: '#ffffff',
    fontWeight: '500',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 1,
  },
  
  inputFocused: {
    borderColor: 'rgba(255, 255, 255, 0.5)',
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 2,
  },
  
  passwordContainer: {
    width: '100%',
    position: 'relative',
    marginBottom: isMobile ? 14 : 18,
  },
  
  eyeIcon: {
    position: 'absolute',
    top: '50%',
    right: 15,
    transform: [{ translateY: -5 }],
    zIndex: 1,
  },
  
  eyeIconText: {
    fontSize: 24,
    color: 'rgba(255, 255, 255, 0.8)',
  },
  
  error: {
    backgroundColor: 'rgba(239, 68, 68, 0.1)',
    borderRadius: 12,
    paddingVertical: isMobile ? 10 : 12,
    paddingHorizontal: isMobile ? 12 : 16,
    marginBottom: isMobile ? 12 : 16,
    borderWidth: 1,
    borderColor: 'rgba(239, 68, 68, 0.3)',
    shadowColor: '#ef4444',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 1,
  },
  
  errorText: {
    color: '#fecaca',
    fontSize: isMobile ? 13 : 14,
    fontWeight: '500',
    textAlign: 'center',
  },
  
  button: {
    width: '100%',
    marginTop: isMobile ? 8 : 12,
    borderRadius: 16,
    overflow: 'hidden',
    shadowColor: '#2563eb',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 15,
    elevation: 4,
  },
  
  buttonGradient: {
    paddingVertical: isMobile ? 12 : 16,
    paddingHorizontal: isMobile ? 16 : 20,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  
  buttonText: {
    color: '#ffffff',
    fontSize: isMobile ? 16 : 16,
    fontWeight: '600',
  },
  
  buttonDisabled: {
    shadowColor: '#64748b',
    shadowOpacity: 0.3,
    elevation: 2,
  },
  
  loginLoading: {
    backgroundColor: 'transparent',
    borderWidth: 2,
    borderColor: 'rgba(255, 255, 255, 0.2)',
    borderTopColor: 'rgba(255, 255, 255, 0.4)',
    borderRadius: 16,
    paddingVertical: isMobile ? 20 : 24,
    paddingHorizontal: isMobile ? 24 : 32,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.3,
    shadowRadius: 32,
    elevation: 8,
  },
  
  loginLoadingText: {
    color: '#ffffff',
    fontWeight: '500',
    textAlign: 'center',
    fontSize: isMobile ? 18 : 20,
    textShadowColor: 'rgba(0, 0, 0, 0.5)',
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 8,
  },
});
