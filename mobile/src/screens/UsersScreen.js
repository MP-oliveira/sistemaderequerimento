import React, { useState, useEffect } from 'react';
import {
  View,
  StyleSheet,
  ScrollView,
  RefreshControl,
  Alert,
} from 'react-native';
import { Card, Title, Paragraph, FAB, Chip, Searchbar, Avatar } from 'react-native-paper';
import { colors } from '../theme/theme';
import { MaterialCommunityIcons } from '@expo/vector-icons';

export default function UsersScreen({ navigation }) {
  const [refreshing, setRefreshing] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [users, setUsers] = useState([]);

  // Simular dados de usuários
  const mockUsers = [
    {
      id: 1,
      nome: 'João Silva',
      email: 'joao@ibva.com',
      role: 'ADM',
      department: 'Administração',
      status: 'ATIVO',
    },
    {
      id: 2,
      nome: 'Maria Santos',
      email: 'maria@ibva.com',
      role: 'LIDER',
      department: 'Audiovisual',
      status: 'ATIVO',
    },
    {
      id: 3,
      nome: 'Pedro Costa',
      email: 'pedro@ibva.com',
      role: 'USER',
      department: 'Serviço Geral',
      status: 'INATIVO',
    },
  ];

  useEffect(() => {
    loadUsers();
  }, []);

  const loadUsers = async () => {
    try {
      setUsers(mockUsers);
    } catch (error) {
      console.error('Erro ao carregar usuários:', error);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await loadUsers();
    setRefreshing(false);
  };

  const getRoleColor = (role) => {
    switch (role) {
      case 'ADM':
        return colors.error;
      case 'PASTOR':
        return colors.primary;
      case 'LIDER':
        return colors.warning;
      case 'USER':
        return colors.success;
      default:
        return colors.gray;
    }
  };

  const getRoleText = (role) => {
    switch (role) {
      case 'ADM':
        return 'Administrador';
      case 'PASTOR':
        return 'Pastor';
      case 'LIDER':
        return 'Líder';
      case 'USER':
        return 'Usuário';
      default:
        return role;
    }
  };

  const getStatusColor = (status) => {
    return status === 'ATIVO' ? colors.success : colors.error;
  };

  const getInitials = (name) => {
    return name
      .split(' ')
      .map(word => word.charAt(0))
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  const UserCard = ({ user }) => (
    <Card style={styles.userCard} onPress={() => Alert.alert('Detalhes', `Usuário: ${user.nome}`)}>
      <Card.Content>
        <View style={styles.userHeader}>
          <View style={styles.userInfo}>
            <Avatar.Text 
              size={40} 
              label={getInitials(user.nome)}
              style={{ backgroundColor: colors.primary }}
            />
            <View style={styles.userDetails}>
              <Title style={styles.userName}>{user.nome}</Title>
              <Paragraph style={styles.userEmail}>{user.email}</Paragraph>
            </View>
          </View>
          <View style={styles.userStatus}>
            <Chip 
              mode="outlined" 
              style={[styles.roleChip, { borderColor: getRoleColor(user.role) }]}
              textStyle={{ color: getRoleColor(user.role) }}
            >
              {getRoleText(user.role)}
            </Chip>
            <Chip 
              mode="outlined" 
              style={[styles.statusChip, { borderColor: getStatusColor(user.status) }]}
              textStyle={{ color: getStatusColor(user.status) }}
            >
              {user.status}
            </Chip>
          </View>
        </View>
        
        <View style={styles.userDetails}>
          <View style={styles.detailRow}>
            <MaterialCommunityIcons name="account-group" size={16} color={colors.gray} />
            <Paragraph style={styles.detailText}>{user.department}</Paragraph>
          </View>
        </View>
      </Card.Content>
    </Card>
  );

  return (
    <View style={styles.container}>
      <ScrollView
        style={styles.scrollView}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        {/* Barra de pesquisa */}
        <View style={styles.searchContainer}>
          <Searchbar
            placeholder="Buscar usuários..."
            onChangeText={setSearchQuery}
            value={searchQuery}
            style={styles.searchBar}
          />
        </View>

        {/* Lista de usuários */}
        <View style={styles.usersContainer}>
          {users.length > 0 ? (
            users.map((user) => (
              <UserCard key={user.id} user={user} />
            ))
          ) : (
            <Card style={styles.emptyCard}>
              <Card.Content style={styles.emptyContent}>
                <MaterialCommunityIcons name="account-group-outline" size={48} color={colors.gray} />
                <Title style={styles.emptyTitle}>Nenhum usuário encontrado</Title>
                <Paragraph style={styles.emptyText}>
                  Clique no botão + para adicionar um novo usuário
                </Paragraph>
              </Card.Content>
            </Card>
          )}
        </View>
      </ScrollView>

      {/* FAB para adicionar usuário */}
      <FAB
        style={styles.fab}
        icon="plus"
        onPress={() => Alert.alert('Novo Usuário', 'Funcionalidade em desenvolvimento!')}
        label="Novo Usuário"
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
  searchContainer: {
    padding: 16,
  },
  searchBar: {
    elevation: 2,
  },
  usersContainer: {
    paddingHorizontal: 16,
    paddingBottom: 80,
  },
  userCard: {
    marginBottom: 12,
    elevation: 2,
  },
  userHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  userInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  userDetails: {
    marginLeft: 12,
    flex: 1,
  },
  userName: {
    fontSize: 16,
    marginBottom: 4,
  },
  userEmail: {
    fontSize: 14,
    color: colors.gray,
  },
  userStatus: {
    alignItems: 'flex-end',
    gap: 4,
  },
  roleChip: {
    height: 24,
  },
  statusChip: {
    height: 24,
  },
  detailRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  detailText: {
    marginLeft: 8,
    fontSize: 14,
    color: colors.gray,
  },
  emptyCard: {
    marginTop: 40,
    elevation: 1,
  },
  emptyContent: {
    alignItems: 'center',
    paddingVertical: 40,
  },
  emptyTitle: {
    fontSize: 18,
    marginTop: 16,
    marginBottom: 8,
    color: colors.gray,
  },
  emptyText: {
    textAlign: 'center',
    color: colors.gray,
  },
  fab: {
    position: 'absolute',
    margin: 16,
    right: 0,
    bottom: 0,
    backgroundColor: colors.primary,
  },
});
