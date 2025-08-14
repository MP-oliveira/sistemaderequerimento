import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  RefreshControl,
  Alert,
} from 'react-native';
import { Card, Title, Paragraph, Button, FAB, Chip, Searchbar } from 'react-native-paper';
import { useAuth } from '../context/AuthContext';
import { colors } from '../theme/theme';
import { MaterialCommunityIcons } from '@expo/vector-icons';

export default function RequestsScreen({ navigation }) {
  const { user } = useAuth();
  const [refreshing, setRefreshing] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [requests, setRequests] = useState([]);

  // Simular dados de requisições
  const mockRequests = [
    {
      id: 1,
      event_name: 'Culto de Domingo',
      department: 'Audiovisual',
      status: 'APTO',
      start_datetime: '2024-01-15 09:00:00',
      end_datetime: '2024-01-15 12:00:00',
      location: 'Templo Principal',
    },
    {
      id: 2,
      event_name: 'Reunião de Jovens',
      department: 'Serviço Geral',
      status: 'PENDENTE',
      start_datetime: '2024-01-16 19:00:00',
      end_datetime: '2024-01-16 22:00:00',
      location: 'Sala de Jovens',
    },
    {
      id: 3,
      event_name: 'Ensaio do Coral',
      department: 'Música',
      status: 'REJEITADO',
      start_datetime: '2024-01-17 18:00:00',
      end_datetime: '2024-01-17 20:00:00',
      location: 'Sala de Música',
    },
  ];

  useEffect(() => {
    loadRequests();
  }, []);

  const loadRequests = async () => {
    try {
      // Aqui você faria a chamada para a API
      setRequests(mockRequests);
    } catch (error) {
      console.error('Erro ao carregar requisições:', error);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await loadRequests();
    setRefreshing(false);
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'APTO':
        return colors.success;
      case 'PENDENTE':
        return colors.warning;
      case 'REJEITADO':
        return colors.error;
      default:
        return colors.gray;
    }
  };

  const getStatusText = (status) => {
    switch (status) {
      case 'APTO':
        return 'Aprovado';
      case 'PENDENTE':
        return 'Pendente';
      case 'REJEITADO':
        return 'Rejeitado';
      default:
        return status;
    }
  };

  const formatDateTime = (dateTime) => {
    const date = new Date(dateTime);
    return date.toLocaleDateString('pt-BR') + ' ' + date.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });
  };

  const RequestCard = ({ request }) => (
    <Card style={styles.requestCard} onPress={() => Alert.alert('Detalhes', `Requisição: ${request.event_name}`)}>
      <Card.Content>
        <View style={styles.requestHeader}>
          <Title style={styles.requestTitle}>{request.event_name}</Title>
          <Chip 
            mode="outlined" 
            style={[styles.statusChip, { borderColor: getStatusColor(request.status) }]}
            textStyle={{ color: getStatusColor(request.status) }}
          >
            {getStatusText(request.status)}
          </Chip>
        </View>
        
        <View style={styles.requestDetails}>
          <View style={styles.detailRow}>
            <MaterialCommunityIcons name="account-group" size={16} color={colors.gray} />
            <Paragraph style={styles.detailText}>{request.department}</Paragraph>
          </View>
          
          <View style={styles.detailRow}>
            <MaterialCommunityIcons name="map-marker" size={16} color={colors.gray} />
            <Paragraph style={styles.detailText}>{request.location}</Paragraph>
          </View>
          
          <View style={styles.detailRow}>
            <MaterialCommunityIcons name="clock" size={16} color={colors.gray} />
            <Paragraph style={styles.detailText}>
              {formatDateTime(request.start_datetime)} - {formatDateTime(request.end_datetime)}
            </Paragraph>
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
            placeholder="Buscar requisições..."
            onChangeText={setSearchQuery}
            value={searchQuery}
            style={styles.searchBar}
          />
        </View>

        {/* Lista de requisições */}
        <View style={styles.requestsContainer}>
          {requests.length > 0 ? (
            requests.map((request) => (
              <RequestCard key={request.id} request={request} />
            ))
          ) : (
            <Card style={styles.emptyCard}>
              <Card.Content style={styles.emptyContent}>
                <MaterialCommunityIcons name="file-document-outline" size={48} color={colors.gray} />
                <Title style={styles.emptyTitle}>Nenhuma requisição encontrada</Title>
                <Paragraph style={styles.emptyText}>
                  Clique no botão + para criar uma nova requisição
                </Paragraph>
              </Card.Content>
            </Card>
          )}
        </View>
      </ScrollView>

      {/* FAB para nova requisição */}
      <FAB
        style={styles.fab}
        icon="plus"
        onPress={() => Alert.alert('Nova Requisição', 'Funcionalidade em desenvolvimento!')}
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
  searchContainer: {
    padding: 16,
  },
  searchBar: {
    elevation: 2,
  },
  requestsContainer: {
    paddingHorizontal: 16,
    paddingBottom: 80, // Espaço para o FAB
  },
  requestCard: {
    marginBottom: 12,
    elevation: 2,
  },
  requestHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  requestTitle: {
    fontSize: 16,
    flex: 1,
    marginRight: 8,
  },
  statusChip: {
    height: 24,
  },
  requestDetails: {
    gap: 8,
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
