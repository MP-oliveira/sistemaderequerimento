import React, { useState, useEffect } from 'react';
import {
  View,
  StyleSheet,
  ScrollView,
  RefreshControl,
  Alert,
} from 'react-native';
import { Card, Title, Paragraph, FAB, Chip, Searchbar } from 'react-native-paper';
import { colors } from '../theme/theme';
import { MaterialCommunityIcons } from '@expo/vector-icons';

export default function InventoryScreen({ navigation }) {
  const [refreshing, setRefreshing] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [inventory, setInventory] = useState([]);

  // Simular dados do inventário
  const mockInventory = [
    {
      id: 1,
      name: 'Projetor Epson',
      category: 'Audiovisual',
      status: 'DISPONIVEL',
      quantity: 2,
      location: 'Sala Técnica',
    },
    {
      id: 2,
      name: 'Microfone Sem Fio',
      category: 'Audiovisual',
      status: 'EM_USO',
      quantity: 1,
      location: 'Templo Principal',
    },
    {
      id: 3,
      name: 'Cadeiras Plásticas',
      category: 'Mobiliário',
      status: 'DISPONIVEL',
      quantity: 50,
      location: 'Depósito',
    },
  ];

  useEffect(() => {
    loadInventory();
  }, []);

  const loadInventory = async () => {
    try {
      setInventory(mockInventory);
    } catch (error) {
      console.error('Erro ao carregar inventário:', error);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await loadInventory();
    setRefreshing(false);
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'DISPONIVEL':
        return colors.success;
      case 'EM_USO':
        return colors.warning;
      case 'MANUTENCAO':
        return colors.error;
      default:
        return colors.gray;
    }
  };

  const getStatusText = (status) => {
    switch (status) {
      case 'DISPONIVEL':
        return 'Disponível';
      case 'EM_USO':
        return 'Em Uso';
      case 'MANUTENCAO':
        return 'Manutenção';
      default:
        return status;
    }
  };

  const InventoryCard = ({ item }) => (
    <Card style={styles.inventoryCard} onPress={() => Alert.alert('Detalhes', `Item: ${item.name}`)}>
      <Card.Content>
        <View style={styles.itemHeader}>
          <Title style={styles.itemTitle}>{item.name}</Title>
          <Chip 
            mode="outlined" 
            style={[styles.statusChip, { borderColor: getStatusColor(item.status) }]}
            textStyle={{ color: getStatusColor(item.status) }}
          >
            {getStatusText(item.status)}
          </Chip>
        </View>
        
        <View style={styles.itemDetails}>
          <View style={styles.detailRow}>
            <MaterialCommunityIcons name="tag" size={16} color={colors.gray} />
            <Paragraph style={styles.detailText}>{item.category}</Paragraph>
          </View>
          
          <View style={styles.detailRow}>
            <MaterialCommunityIcons name="numeric" size={16} color={colors.gray} />
            <Paragraph style={styles.detailText}>Quantidade: {item.quantity}</Paragraph>
          </View>
          
          <View style={styles.detailRow}>
            <MaterialCommunityIcons name="map-marker" size={16} color={colors.gray} />
            <Paragraph style={styles.detailText}>{item.location}</Paragraph>
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
            placeholder="Buscar itens..."
            onChangeText={setSearchQuery}
            value={searchQuery}
            style={styles.searchBar}
          />
        </View>

        {/* Lista do inventário */}
        <View style={styles.inventoryContainer}>
          {inventory.length > 0 ? (
            inventory.map((item) => (
              <InventoryCard key={item.id} item={item} />
            ))
          ) : (
            <Card style={styles.emptyCard}>
              <Card.Content style={styles.emptyContent}>
                <MaterialCommunityIcons name="package-variant-outline" size={48} color={colors.gray} />
                <Title style={styles.emptyTitle}>Nenhum item encontrado</Title>
                <Paragraph style={styles.emptyText}>
                  Clique no botão + para adicionar um novo item
                </Paragraph>
              </Card.Content>
            </Card>
          )}
        </View>
      </ScrollView>

      {/* FAB para adicionar item */}
      <FAB
        style={styles.fab}
        icon="plus"
        onPress={() => Alert.alert('Novo Item', 'Funcionalidade em desenvolvimento!')}
        label="Novo Item"
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
  inventoryContainer: {
    paddingHorizontal: 16,
    paddingBottom: 80,
  },
  inventoryCard: {
    marginBottom: 12,
    elevation: 2,
  },
  itemHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  itemTitle: {
    fontSize: 16,
    flex: 1,
    marginRight: 8,
  },
  statusChip: {
    height: 24,
  },
  itemDetails: {
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
