import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  RefreshControl,
  Alert,
} from 'react-native';
import { Card, Title, Paragraph, Button, FAB, Chip } from 'react-native-paper';
import { useAuth } from '../context/AuthContext';
import { colors, globalStyles } from '../theme/theme';
import { MaterialCommunityIcons } from '@expo/vector-icons';

export default function DashboardScreen({ navigation }) {
  const { user, logout } = useAuth();
  const [refreshing, setRefreshing] = useState(false);
  const [stats, setStats] = useState({
    activeRequests: 0,
    pendingRequests: 0,
    availableItems: 0,
    totalEvents: 0,
  });

  // Carregar dados do dashboard
  const loadDashboardData = async () => {
    try {
      // Aqui você faria as chamadas para a API
      // Por enquanto, vamos simular dados
      setStats({
        activeRequests: 5,
        pendingRequests: 3,
        availableItems: 25,
        totalEvents: 8,
      });
    } catch (error) {
      console.error('Erro ao carregar dados:', error);
    }
  };

  // Função de refresh
  const onRefresh = async () => {
    setRefreshing(true);
    await loadDashboardData();
    setRefreshing(false);
  };

  useEffect(() => {
    loadDashboardData();
  }, []);

  // Função de logout
  const handleLogout = () => {
    Alert.alert(
      'Sair',
      'Tem certeza que deseja sair?',
      [
        { text: 'Cancelar', style: 'cancel' },
        { text: 'Sair', onPress: logout, style: 'destructive' },
      ]
    );
  };

  // Cards de estatísticas
  const StatCard = ({ title, value, icon, color, onPress }) => (
    <Card style={[styles.statCard, { borderLeftColor: color }]} onPress={onPress}>
      <Card.Content style={styles.statCardContent}>
        <View style={styles.statIconContainer}>
          <MaterialCommunityIcons name={icon} size={24} color={color} />
        </View>
        <View style={styles.statTextContainer}>
          <Title style={styles.statValue}>{value}</Title>
          <Paragraph style={styles.statTitle}>{title}</Paragraph>
        </View>
      </Card.Content>
    </Card>
  );

  // Ações rápidas
  const QuickAction = ({ title, icon, onPress, color = colors.primary }) => (
    <Button
      mode="outlined"
      onPress={onPress}
      style={[styles.quickActionButton, { borderColor: color }]}
      labelStyle={[styles.quickActionLabel, { color }]}
      icon={icon}
    >
      {title}
    </Button>
  );

  return (
    <View style={styles.container}>
      <ScrollView
        style={styles.scrollView}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        {/* Header com informações do usuário */}
        <Card style={styles.userCard}>
          <Card.Content>
            <View style={styles.userInfo}>
              <View style={styles.userAvatar}>
                <MaterialCommunityIcons name="account" size={32} color={colors.white} />
              </View>
              <View style={styles.userDetails}>
                <Title style={styles.userName}>
                  {user?.nome || 'Usuário'}
                </Title>
                <Chip mode="outlined" style={styles.roleChip}>
                  {user?.role || 'USER'}
                </Chip>
              </View>
              <Button
                mode="text"
                onPress={handleLogout}
                icon="logout"
                style={styles.logoutButton}
              >
                Sair
              </Button>
            </View>
          </Card.Content>
        </Card>

        {/* Estatísticas */}
        <View style={styles.statsSection}>
          <Title style={styles.sectionTitle}>Estatísticas</Title>
          <View style={styles.statsGrid}>
            <StatCard
              title="Requisições Ativas"
              value={stats.activeRequests}
              icon="file-document"
              color={colors.success}
              onPress={() => navigation.navigate('Requests')}
            />
            <StatCard
              title="Pendentes"
              value={stats.pendingRequests}
              icon="clock"
              color={colors.warning}
              onPress={() => navigation.navigate('Requests')}
            />
            <StatCard
              title="Itens Disponíveis"
              value={stats.availableItems}
              icon="package-variant"
              color={colors.info}
              onPress={() => navigation.navigate('Inventory')}
            />
            <StatCard
              title="Eventos"
              value={stats.totalEvents}
              icon="calendar"
              color={colors.secondary}
              onPress={() => navigation.navigate('Requests')}
            />
          </View>
        </View>

        {/* Ações Rápidas */}
        <View style={styles.quickActionsSection}>
          <Title style={styles.sectionTitle}>Ações Rápidas</Title>
          <View style={styles.quickActionsGrid}>
            <QuickAction
              title="Nova Requisição"
              icon="plus"
              onPress={() => navigation.navigate('Requests')}
            />
            <QuickAction
              title="Inventário"
              icon="package-variant"
              onPress={() => navigation.navigate('Inventory')}
            />
            {user?.role === 'ADM' || user?.role === 'PASTOR' ? (
              <QuickAction
                title="Usuários"
                icon="account-group"
                onPress={() => navigation.navigate('Users')}
              />
            ) : null}
            <QuickAction
              title="Relatórios"
              icon="chart-line"
              onPress={() => Alert.alert('Em desenvolvimento', 'Funcionalidade em breve!')}
            />
          </View>
        </View>
      </ScrollView>

      {/* FAB para nova requisição */}
      <FAB
        style={styles.fab}
        icon="plus"
        onPress={() => navigation.navigate('Requests')}
        label="Nova Requisição"
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  scrollView: {
    flex: 1,
  },
  userCard: {
    margin: 16,
    elevation: 2,
  },
  userInfo: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  userAvatar: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  userDetails: {
    flex: 1,
  },
  userName: {
    fontSize: 18,
    marginBottom: 4,
  },
  roleChip: {
    alignSelf: 'flex-start',
  },
  logoutButton: {
    marginLeft: 'auto',
  },
  statsSection: {
    marginHorizontal: 16,
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 20,
    marginBottom: 16,
    color: colors.primary,
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  statCard: {
    width: '48%',
    marginBottom: 12,
    borderLeftWidth: 4,
  },
  statCardContent: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
  },
  statIconContainer: {
    marginRight: 12,
  },
  statTextContainer: {
    flex: 1,
  },
  statValue: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  statTitle: {
    fontSize: 12,
    color: colors.gray,
  },
  quickActionsSection: {
    marginHorizontal: 16,
    marginBottom: 24,
  },
  quickActionsGrid: {
    gap: 12,
  },
  quickActionButton: {
    marginBottom: 8,
    borderRadius: 8,
  },
  quickActionLabel: {
    fontSize: 16,
  },
  fab: {
    position: 'absolute',
    margin: 16,
    right: 0,
    bottom: 0,
    backgroundColor: colors.primary,
  },
});
