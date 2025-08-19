// Script para testar as novas categorias
// Execute este script no console do navegador

console.log('🧪 Testando novas categorias do inventário...');

// Verificar se as categorias estão disponíveis
import { INVENTORY_CATEGORIES, isDecoracaoCategory, isEsportesCategory } from './src/utils/inventoryCategories.js';

console.log('📋 Categorias disponíveis:', INVENTORY_CATEGORIES);

// Testar funções de verificação
console.log('🎨 É categoria de decoração?', isDecoracaoCategory('DECORACAO')); // true
console.log('⚽ É categoria de esportes?', isEsportesCategory('ESPORTES')); // true
console.log('🎵 É categoria de esportes?', isEsportesCategory('AUDIO_VIDEO')); // false

console.log('✅ Teste das novas categorias concluído!');
