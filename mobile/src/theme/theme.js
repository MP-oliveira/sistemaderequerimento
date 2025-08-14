import { DefaultTheme } from 'react-native-paper';

// Cores exatas do CSS do desktop web
export const colors = {
  // Gradiente de fundo (exato do CSS)
  gradient: {
    primary: '#1e3a8a',    // Azul escuro
    secondary: '#3b82f6',  // Azul médio  
    tertiary: '#60a5fa',   // Azul claro
  },
  
  // Cores do form (exatas do CSS)
  form: {
    background: 'rgba(59, 130, 246, 0.12)', // Um pouquinho mais branco
    border: {
      default: 'rgba(255, 255, 255, 0.2)',
      top: 'rgba(255, 255, 255, 0.4)',
      left: 'rgba(255, 255, 255, 0.3)',
    },
    shadow: {
      color: '#000',
      opacity: 0.3,
      offset: { width: 0, height: 8 },
      radius: 32,
    },
    insetShadow: {
      top: 'rgba(255, 255, 255, 0.2)',
      left: 'rgba(255, 255, 255, 0.1)',
    },
  },
  
  // Cores dos inputs (exatas do CSS)
  input: {
    background: 'transparent',
    border: 'rgba(255, 255, 255, 0.3)',
    borderFocused: 'rgba(255, 255, 255, 0.5)',
    backgroundFocused: 'rgba(255, 255, 255, 0.05)',
    text: '#ffffff',
    placeholder: 'rgba(255, 255, 255, 0.65)',
    shadow: {
      color: '#000',
      opacity: 0.1,
      offset: { width: 0, height: 2 },
      radius: 4,
    },
    shadowFocused: {
      color: '#000',
      opacity: 0.15,
      offset: { width: 0, height: 4 },
      radius: 8,
    },
  },
  
  // Cores do botão (exatas do CSS)
  button: {
    gradient: {
      primary: ['#2563eb', '#3b82f6'],
      hover: ['#1d4ed8', '#2563eb'],
      disabled: ['#64748b', '#94a3b8'],
    },
    text: '#ffffff',
    shadow: {
      primary: {
        color: '#2563eb',
        opacity: 0.3,
        offset: { width: 0, height: 4 },
        radius: 15,
      },
      hover: {
        color: '#2563eb',
        opacity: 0.4,
        offset: { width: 0, height: 8 },
        radius: 25,
      },
      disabled: {
        color: '#64748b',
        opacity: 0.3,
        offset: { width: 0, height: 4 },
        radius: 15,
      },
    },
  },
  
  // Cores do erro (exatas do CSS)
  error: {
    background: 'rgba(239, 68, 68, 0.1)',
    border: 'rgba(239, 68, 68, 0.3)',
    text: '#fecaca',
    shadow: {
      color: '#ef4444',
      opacity: 0.1,
      offset: { width: 0, height: 2 },
      radius: 8,
    },
  },
  
  // Cores do título (exatas do CSS)
  title: {
    text: '#ffffff',
    shadow: {
      color: 'rgba(0, 0, 0, 0.4)',
      offset: { width: 0, height: 2 },
      radius: 8,
    },
  },
  
  // Cores do loading (exatas do CSS)
  loading: {
    background: 'transparent',
    border: 'rgba(255, 255, 255, 0.2)',
    borderTop: 'rgba(255, 255, 255, 0.4)',
    text: '#ffffff',
    shadow: {
      color: '#000',
      opacity: 0.3,
      offset: { width: 0, height: 8 },
      radius: 32,
    },
  },
  
  // Cores do watermark (exatas do CSS)
  watermark: {
    opacity: 0.4,
    filter: {
      brightness: 1.4,
      contrast: 1.3,
      saturate: 1.2,
    },
  },
  
  // Cores base
  primary: '#174ea6',
  primaryDark: '#123a7b',
  secondary: '#ffd600',
  background: '#f5f6fa',
  white: '#ffffff',
  black: '#000000',
  gray: '#666666',
  lightGray: '#e0e0e0',
  success: '#4caf50',
  errorBase: '#f44336', // Renomeado para evitar conflito
  warning: '#ff9800',
  info: '#2196f3',
};

// Breakpoints responsivos (mesmos do CSS web)
export const breakpoints = {
  mobile: 480,
  tablet: 768,
  tabletPro: 1024,
  desktop: 1200,
};

// Função para verificar breakpoints
export const isMobile = (width) => width <= breakpoints.mobile;
export const isTablet = (width) => width > breakpoints.mobile && width <= breakpoints.tablet;
export const isTabletPro = (width) => width > breakpoints.tablet && width <= breakpoints.tabletPro;
export const isDesktop = (width) => width > breakpoints.desktop;

// Theme do React Native Paper
export const theme = {
  ...DefaultTheme,
  colors: {
    ...DefaultTheme.colors,
    primary: colors.primary,
    accent: colors.secondary,
    background: colors.background,
    surface: colors.white,
    text: colors.black,
    error: colors.errorBase,
    success: colors.success,
    warning: colors.warning,
    info: colors.info,
  },
  fonts: {
    ...DefaultTheme.fonts,
    regular: {
      fontFamily: 'Montserrat',
      fontWeight: '400',
    },
    medium: {
      fontFamily: 'Montserrat-Medium',
      fontWeight: '600',
    },
    bold: {
      fontFamily: 'Montserrat-Bold',
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

// Configurações do gradiente (exatas do CSS)
export const gradientConfig = {
  colors: [colors.gradient.primary, colors.gradient.secondary, colors.gradient.tertiary],
  start: { x: 0, y: 1 }, // 135deg
  end: { x: 1, y: 0 },
  locations: [0, 0.5, 1], // 0%, 50%, 100%
};

// Configurações do blur (exatas do CSS)
export const blurConfig = {
  intensity: 15, // backdrop-filter: blur(15px)
  brightness: 1.1, // brightness(1.1)
  // Ajuste para simular o brightness no React Native
  tintColor: 'rgba(255, 255, 255, 0.1)', // Simula brightness(1.1)
};
