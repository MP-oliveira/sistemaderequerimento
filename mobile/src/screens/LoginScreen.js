import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ImageBackground,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Alert,
  Dimensions,
} from 'react-native';
import { TextInput, Title, Paragraph } from 'react-native-paper';
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
      {/* Background gradient */}
      <LinearGradient
        colors={['#1e3a8a', '#3b82f6', '#60a5fa']}
        style={styles.gradient}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
      />
      
      {/* Logo marca d'água */}
      <View style={styles.watermarkContainer}>
        <View style={styles.watermark}>
          <Text style={styles.watermarkText}>IBVA</Text>
        </View>
      </View>

      {/* Partículas flutuantes */}
      <View style={styles.particles}>
        <View style={[styles.particle, styles.particle1]} />
        <View style={[styles.particle, styles.particle2]} />
        <View style={[styles.particle, styles.particle3]} />
        <View style={[styles.particle, styles.particle4]} />
        <View style={[styles.particle, styles.particle5]} />
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
          {/* Card de login glassy */}
          <View style={styles.loginCard}>
            <BlurView intensity={20} style={styles.blurContainer}>
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

          {/* Informações adicionais */}
          <View style={styles.footer}>
            <Paragraph style={styles.footerText}>
              Sistema de Requisições da Igreja Batista Vida Abundante
            </Paragraph>
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
  watermarkContainer: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 1,
  },
  watermark: {
    width: width * 0.8,
    height: width * 0.8,
    justifyContent: 'center',
    alignItems: 'center',
    opacity: 0.4,
  },
  watermarkText: {
    fontSize: width * 0.3,
    fontWeight: 'bold',
    color: 'rgba(255, 255, 255, 0.3)',
    textAlign: 'center',
  },
  particles: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    zIndex: 1,
  },
  particle: {
    position: 'absolute',
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 50,
  },
  particle1: {
    width: 4,
    height: 4,
    top: '20%',
    left: '20%',
  },
  particle2: {
    width: 6,
    height: 6,
    top: '80%',
    left: '80%',
  },
  particle3: {
    width: 3,
    height: 3,
    top: '40%',
    left: '60%',
  },
  particle4: {
    width: 5,
    height: 5,
    top: '60%',
    left: '40%',
  },
  particle5: {
    width: 4,
    height: 4,
    top: '30%',
    left: '70%',
  },
  keyboardContainer: {
    flex: 1,
    zIndex: 2,
  },
  scrollContainer: {
    flexGrow: 1,
    justifyContent: 'center',
    padding: 20,
    minHeight: height,
  },
  loginCard: {
    maxWidth: 420,
    width: '100%',
    alignSelf: 'center',
    marginBottom: 30,
  },
  blurContainer: {
    borderRadius: 24,
    overflow: 'hidden',
    borderWidth: 2,
    borderColor: 'rgba(255, 255, 255, 0.2)',
    borderTopColor: 'rgba(255, 255, 255, 0.4)',
    borderLeftColor: 'rgba(255, 255, 255, 0.3)',
  },
  loginForm: {
    padding: 45,
    alignItems: 'center',
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
  loginButton: {
    marginTop: 12,
  },
  footer: {
    alignItems: 'center',
  },
  footerText: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.8)',
    textAlign: 'center',
  },
});
