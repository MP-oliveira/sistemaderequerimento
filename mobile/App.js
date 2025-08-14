import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { Provider as PaperProvider } from 'react-native-paper';
import { StatusBar } from 'expo-status-bar';

// Importar telas
import LoginScreen from './src/screens/LoginScreen';
import DashboardScreen from './src/screens/DashboardScreen';
import RequestsScreen from './src/screens/RequestsScreen';
import InventoryScreen from './src/screens/InventoryScreen';
import UsersScreen from './src/screens/UsersScreen';

// Importar contexto de autenticação
import { AuthProvider, useAuth } from './src/context/AuthContext';

// Tema personalizado baseado nas cores da IBVA
import { theme } from './src/theme/theme';

const Stack = createStackNavigator();

function NavigationContent() {
  const { isAuthenticated, loading } = useAuth();

  if (loading) {
    return null; // Ou um componente de loading
  }

  return (
    <Stack.Navigator
      initialRouteName={isAuthenticated() ? "Dashboard" : "Login"}
      screenOptions={{
        headerStyle: {
          backgroundColor: '#174ea6',
        },
        headerTintColor: '#fff',
        headerTitleStyle: {
          fontWeight: 'bold',
        },
      }}
    >
      {!isAuthenticated() ? (
        <Stack.Screen 
          name="Login" 
          component={LoginScreen} 
          options={{ headerShown: false }}
        />
      ) : (
        <>
          <Stack.Screen 
            name="Dashboard" 
            component={DashboardScreen}
            options={{ title: 'Dashboard' }}
          />
          <Stack.Screen 
            name="Requests" 
            component={RequestsScreen}
            options={{ title: 'Requisições' }}
          />
          <Stack.Screen 
            name="Inventory" 
            component={InventoryScreen}
            options={{ title: 'Inventário' }}
          />
          <Stack.Screen 
            name="Users" 
            component={UsersScreen}
            options={{ title: 'Usuários' }}
          />
        </>
      )}
    </Stack.Navigator>
  );
}

export default function App() {
  return (
    <PaperProvider theme={theme}>
      <AuthProvider>
        <NavigationContainer>
          <StatusBar style="light" backgroundColor="#174ea6" />
          <NavigationContent />
        </NavigationContainer>
      </AuthProvider>
    </PaperProvider>
  );
}
