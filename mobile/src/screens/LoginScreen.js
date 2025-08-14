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

export default function LoginScreen({ navigation }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  
  const { login } = useAuth();

  const handleLogin = async () => {
    if (!email || !password) {
      Alert.alert('Erro', 'Por favor, preencha todos os campos');
      return;
    }

    setLoading(true);
    
    try {
      const result = await login(email, password);
      
      if (result.success) {
        console.log('Login realizado com sucesso');
      } else {
        Alert.alert('Erro no Login', result.message || 'Credenciais inválidas');
      }
    } catch (error) {
      Alert.alert('Erro', 'Erro de conexão. Verifique sua internet.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      {/* Background gradient - exatamente como no CSS */}
      <LinearGradient
        colors={['#1e3a8a', '#3b82f6', '#60a5fa']}
        style={styles.gradient}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
      />
      
      {/* Partículas flutuantes - como no CSS */}
      <View style={styles.particles} />
      
      {/* Logo marca d'água - colorida como no original */}
      <View style={styles.watermarkContainer}>
        <Image
          source={require('../../assets/ibva-logo.png')}
          style={styles.watermark}
          resizeMode="contain"
        />
      </View>

      <KeyboardAvoidingView 
        style={styles.keyboardContainer}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        <ScrollView 
          contentContainerStyle={styles.scrollContainer}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          {/* Card de login glassy - exatamente como no CSS */}
          <View style={styles.loginCard}>
            <BlurView intensity={15} style={styles.blurContainer}>
              <View style={styles.loginForm}>
                <Title style={styles.title}>Login</Title>
                
                <View style={styles.inputContainer}>
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
                        placeholder: 'rgba(255, 255, 255, 0.65)',
                        outline: 'rgba(255, 255, 255, 0.3)',
                      },
                    }}
                    outlineStyle={styles.inputOutline}
                    contentStyle={styles.inputContent}
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
                        placeholder: 'rgba(255, 255, 255, 0.65)',
                        outline: 'rgba(255, 255, 255, 0.3)',
                      },
                    }}
                    outlineStyle={styles.inputOutline}
                    contentStyle={styles.inputContent}
                  />
                </View>

                <GradientButton
                  title="Entrar"
                  onPress={handleLogin}
                  loading={loading}
                  disabled={loading}
                  style={styles.loginButton}
                />
              </View>
            </BlurView>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#1e3a8a',
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
  watermarkContainer: {
    position: 'absolute',
    top: '50%',
    left: '50%',
    transform: [{ translateX: -width * 0.4 }, { translateY: -width * 0.4 }],
    width: width * 0.8,
    height: width * 0.8,
    zIndex: 1,
    pointerEvents: 'none',
  },
  watermark: {
    width: '100%',
    height: '100%',
    opacity: 0.4,
  },
  keyboardContainer: {
    flex: 1,
    zIndex: 2,
  },
  scrollContainer: {
    flexGrow: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
    minHeight: height,
  },
  loginCard: {
    maxWidth: 420,
    width: '100%',
    marginBottom: 30,
    zIndex: 2,
    backgroundColor: 'rgba(255, 255, 255, 0)',
  },
  blurContainer: {
    borderRadius: 24,
    overflow: 'hidden',
    borderWidth: 2,
    borderColor: 'rgba(255, 255, 255, 0.2)',
    borderTopColor: 'rgba(255, 255, 255, 0.4)',
    borderLeftColor: 'rgba(255, 255, 255, 0.3)',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.3,
    shadowRadius: 32,
    elevation: 8,
  },
  loginForm: {
    padding: 45,
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0)',
  },
  title: {
    fontSize: 30,
    fontWeight: '700',
    color: '#ffffff',
    marginBottom: 32,
    textAlign: 'center',
    textShadowColor: 'rgba(0, 0, 0, 0.4)',
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 8,
    letterSpacing: -0.5,
  },
  inputContainer: {
    width: '100%',
    marginBottom: 20,
  },
  input: {
    marginBottom: 18,
    backgroundColor: 'transparent',
    fontSize: 16,
    fontWeight: '500',
  },
  inputOutline: {
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.3)',
  },
  inputContent: {
    backgroundColor: 'transparent',
    paddingVertical: 16,
    paddingHorizontal: 20,
  },
  loginButton: {
    marginTop: 12,
  },
});
