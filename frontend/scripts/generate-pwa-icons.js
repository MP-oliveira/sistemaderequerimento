// Script para gerar ícones PWA
// Este script copia o logo existente para os tamanhos necessários do PWA

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

console.log('🎨 Gerando ícones PWA...');

// Caminhos dos arquivos
const sourceLogo = path.join(__dirname, '../public/ibva-logo.png');
const publicDir = path.join(__dirname, '../public');

// Lista de ícones necessários
const requiredIcons = [
  { name: 'pwa-icon-192x192.png', size: '192x192' },
  { name: 'pwa-icon-512x512.png', size: '512x512' },
  { name: 'shortcut-new-96x96.png', size: '96x96' },
  { name: 'shortcut-dashboard-96x96.png', size: '96x96' },
  { name: 'shortcut-inventory-96x96.png', size: '96x96' }
];

// Verificar se o logo fonte existe
if (!fs.existsSync(sourceLogo)) {
  console.error('❌ Logo fonte não encontrado:', sourceLogo);
  process.exit(1);
}

// Copiar logo para os tamanhos necessários
requiredIcons.forEach(icon => {
  const targetPath = path.join(publicDir, icon.name);
  
  try {
    // Copiar o arquivo
    fs.copyFileSync(sourceLogo, targetPath);
    console.log(`✅ Criado: ${icon.name} (${icon.size})`);
  } catch (error) {
    console.error(`❌ Erro ao criar ${icon.name}:`, error.message);
  }
});

// Criar screenshots placeholder (serão substituídos por screenshots reais)
const screenshots = [
  { name: 'screenshot-mobile-1.png', description: 'Mobile screenshot' },
  { name: 'screenshot-desktop-1.png', description: 'Desktop screenshot' }
];

screenshots.forEach(screenshot => {
  const targetPath = path.join(publicDir, screenshot.name);
  
  try {
    // Copiar o logo como placeholder
    fs.copyFileSync(sourceLogo, targetPath);
    console.log(`📱 Criado placeholder: ${screenshot.name} (${screenshot.description})`);
  } catch (error) {
    console.error(`❌ Erro ao criar ${screenshot.name}:`, error.message);
  }
});

console.log('🎉 Ícones PWA gerados com sucesso!');
console.log('📝 Nota: Os screenshots são placeholders. Substitua por screenshots reais do app.');
