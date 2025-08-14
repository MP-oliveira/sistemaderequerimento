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
import { 
  colors, 
  breakpoints, 
  isMobile, 
  isTablet, 
  isTabletPro, 
  isDesktop,
  gradientConfig,
  blurConfig 
} from '../theme/theme';

const { width, height } = Dimensions.get('window');

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
          colors={gradientConfig.colors}
          style={styles.gradient}
          start={gradientConfig.start}
          end={gradientConfig.end}
          locations={gradientConfig.locations}
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
          colors={gradientConfig.colors}
          style={styles.gradient}
          start={gradientConfig.start}
          end={gradientConfig.end}
          locations={gradientConfig.locations}
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
          <View style={styles.blurContainer}>
            {/* Overlay para simular o efeito glassy */}
            <View style={styles.glassyOverlay} />
            <View style={styles.formContainer}>
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
                  placeholderTextColor={colors.input.placeholder}
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
                    placeholderTextColor={colors.input.placeholder}
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
                  colors={loading ? colors.button.gradient.disabled : colors.button.gradient.primary}
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
              </View>
            </View>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  // login-page
  loginPage: {
    flex: 1,
    backgroundColor: colors.gradient.primary,
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
    opacity: colors.watermark.opacity,
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
    maxWidth: isMobile(width) ? 350 : isTablet(width) ? 380 : 420,
    width: '100%',
    margin: 0,
    position: 'relative',
    zIndex: 2,
    backgroundColor: colors.form.background,
  },
  
  blurContainer: {
    borderRadius: 24,
    overflow: 'visible', // Mudou para visible para a sombra aparecer
    position: 'relative',
    margin: 16, // Margem para a sombra aparecer
  },
  
  // Overlay para simular efeito glassy
  glassyOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(59, 130, 245, 0.2)', // Menos branco
    borderRadius: 24,
    zIndex: 1,
  },
  
  // Container interno para manter overflow hidden
  formContainer: {
    borderRadius: 24,
    overflow: 'hidden',
    position: 'relative',
  },
  
  // login-form
  loginForm: {
    backgroundColor: colors.form.background,
    borderWidth: 2,
    borderColor: colors.form.border.default,
    borderTopColor: colors.form.border.top,
    borderLeftColor: colors.form.border.left,
    borderRadius: 24,
    padding: isMobile(width) ? 32 : isTablet(width) ? 38 : 45,
    shadowColor: colors.form.shadow.color,
    shadowOffset: colors.form.shadow.offset,
    shadowOpacity: colors.form.shadow.opacity,
    shadowRadius: colors.form.shadow.radius,
    elevation: 8,
    position: 'relative',
    zIndex: 2,
  },
  
  // Sombras internas simuladas
  insetShadowTop: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: 1,
    backgroundColor: colors.form.insetShadow.top,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
  },
  
  insetShadowLeft: {
    position: 'absolute',
    top: 0,
    left: 0,
    bottom: 0,
    width: 1,
    backgroundColor: colors.form.insetShadow.left,
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
    marginBottom: isMobile(width) ? 24 : 32,
    color: colors.title.text,
    fontSize: isMobile(width) ? 24 : isTablet(width) ? 26 : 30,
    fontWeight: '700',
    textShadowColor: colors.title.shadow.color,
    textShadowOffset: colors.title.shadow.offset,
    textShadowRadius: colors.title.shadow.radius,
    letterSpacing: -0.5,
  },
  
  input: {
    width: '100%',
    paddingVertical: isMobile(width) ? 12 : 16,
    paddingHorizontal: isMobile(width) ? 16 : 20,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: colors.input.border,
    marginBottom: isMobile(width) ? 14 : 18,
    fontSize: isMobile(width) ? 16 : 16,
    backgroundColor: colors.input.background,
    color: colors.input.text,
    fontWeight: '500',
    shadowColor: colors.input.shadow.color,
    shadowOffset: colors.input.shadow.offset,
    shadowOpacity: colors.input.shadow.opacity,
    shadowRadius: colors.input.shadow.radius,
    elevation: 1,
  },
  
  inputFocused: {
    borderColor: colors.input.borderFocused,
    backgroundColor: colors.input.backgroundFocused,
    shadowColor: colors.input.shadowFocused.color,
    shadowOffset: colors.input.shadowFocused.offset,
    shadowOpacity: colors.input.shadowFocused.opacity,
    shadowRadius: colors.input.shadowFocused.radius,
    elevation: 2,
  },
  
  passwordContainer: {
    width: '100%',
    position: 'relative',
    marginBottom: isMobile(width) ? 14 : 18,
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
    backgroundColor: colors.error.background,
    borderRadius: 12,
    paddingVertical: isMobile(width) ? 10 : 12,
    paddingHorizontal: isMobile(width) ? 12 : 16,
    marginBottom: isMobile(width) ? 12 : 16,
    borderWidth: 1,
    borderColor: colors.error.border,
    shadowColor: colors.error.shadow.color,
    shadowOffset: colors.error.shadow.offset,
    shadowOpacity: colors.error.shadow.opacity,
    shadowRadius: colors.error.shadow.radius,
    elevation: 1,
  },
  
  errorText: {
    color: colors.error.text,
    fontSize: isMobile(width) ? 13 : 14,
    fontWeight: '500',
    textAlign: 'center',
  },
  
  button: {
    width: '100%',
    marginTop: isMobile(width) ? 8 : 12,
    borderRadius: 16,
    overflow: 'hidden',
    shadowColor: colors.button.shadow.primary.color,
    shadowOffset: colors.button.shadow.primary.offset,
    shadowOpacity: colors.button.shadow.primary.opacity,
    shadowRadius: colors.button.shadow.primary.radius,
    elevation: 4,
  },
  
  buttonGradient: {
    paddingVertical: isMobile(width) ? 12 : 16,
    paddingHorizontal: isMobile(width) ? 16 : 20,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  
  buttonText: {
    color: colors.button.text,
    fontSize: isMobile(width) ? 16 : 16,
    fontWeight: '600',
  },
  
  buttonDisabled: {
    shadowColor: colors.button.shadow.disabled.color,
    shadowOpacity: colors.button.shadow.disabled.opacity,
    elevation: 2,
  },
  
  loginLoading: {
    backgroundColor: colors.loading.background,
    borderWidth: 2,
    borderColor: colors.loading.border,
    borderTopColor: colors.loading.borderTop,
    borderRadius: 16,
    paddingVertical: isMobile(width) ? 20 : 24,
    paddingHorizontal: isMobile(width) ? 24 : 32,
    shadowColor: colors.loading.shadow.color,
    shadowOffset: colors.loading.shadow.offset,
    shadowOpacity: colors.loading.shadow.opacity,
    shadowRadius: colors.loading.shadow.radius,
    elevation: 8,
  },
  
  loginLoadingText: {
    color: colors.loading.text,
    fontWeight: '500',
    textAlign: 'center',
    fontSize: isMobile(width) ? 18 : 20,
    textShadowColor: 'rgba(0, 0, 0, 0.5)',
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 8,
  },
});
