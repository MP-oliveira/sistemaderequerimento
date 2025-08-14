import { DefaultTheme } from 'react-native-paper';

// Cores oficiais da IBVA
export const colors = {
  primary: '#174ea6',      // Azul principal
  primaryDark: '#123a7b',  // Azul escuro
  secondary: '#ffd600',    // Amarelo
  background: '#f5f6fa',   // Cinza de fundo
  white: '#ffffff',
  black: '#000000',
  gray: '#666666',
  lightGray: '#e0e0e0',
  success: '#4caf50',
  error: '#f44336',
  warning: '#ff9800',
  info: '#2196f3',
};

// Tema personalizado do React Native Paper
export const theme = {
  ...DefaultTheme,
  colors: {
    ...DefaultTheme.colors,
    primary: colors.primary,
    accent: colors.secondary,
    background: colors.background,
    surface: colors.white,
    text: colors.black,
    error: colors.error,
    success: colors.success,
    warning: colors.warning,
    info: colors.info,
  },
  fonts: {
    ...DefaultTheme.fonts,
    regular: {
      fontFamily: 'System',
      fontWeight: '400',
    },
    medium: {
      fontFamily: 'System',
      fontWeight: '600',
    },
    bold: {
      fontFamily: 'System',
      fontWeight: '700',
    },
  },
  roundness: 8,
};

// Estilos globais
export const globalStyles = {
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  card: {
    backgroundColor: colors.white,
    borderRadius: 12,
    padding: 16,
    marginVertical: 8,
    marginHorizontal: 16,
    shadowColor: colors.black,
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  button: {
    borderRadius: 8,
    paddingVertical: 12,
    paddingHorizontal: 24,
  },
  input: {
    backgroundColor: colors.white,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: colors.lightGray,
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
};
