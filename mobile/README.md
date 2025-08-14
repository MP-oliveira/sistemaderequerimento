# Sistema de Requisições - Mobile App

## 📱 Descrição

Aplicativo móvel do Sistema de Requisições da Igreja Batista Vida Abundante (IBVA), desenvolvido com React Native e Expo. O app oferece acesso móvel a todas as funcionalidades do sistema web, mantendo a mesma identidade visual e experiência do usuário.

## 🚀 Tecnologias

- **React Native** - Framework principal
- **Expo** - Plataforma de desenvolvimento
- **React Navigation** - Navegação entre telas
- **React Native Paper** - Componentes de UI
- **AsyncStorage** - Armazenamento local
- **Expo Vector Icons** - Ícones

## 🎨 Design System

### Cores Oficiais IBVA
- **Azul Principal**: `#174ea6`
- **Azul Escuro**: `#123a7b`
- **Amarelo**: `#ffd600`
- **Cinza de Fundo**: `#f5f6fa`
- **Branco**: `#fff`

### Componentes
- **Cards**: Elevação suave, bordas arredondadas
- **Botões**: Variações (contained, outlined, text)
- **Chips**: Status e roles com cores específicas
- **FAB**: Ações principais flutuantes

## 📁 Estrutura do Projeto

```
mobile/
├── src/
│   ├── screens/           # Telas da aplicação
│   │   ├── LoginScreen.js
│   │   ├── DashboardScreen.js
│   │   ├── RequestsScreen.js
│   │   ├── InventoryScreen.js
│   │   └── UsersScreen.js
│   ├── context/           # Contextos React
│   │   └── AuthContext.js
│   ├── services/          # Serviços de API
│   │   └── authService.js
│   └── theme/             # Tema e estilos
│       └── theme.js
├── App.js                 # Componente principal
└── package.json
```

## 🔧 Funcionalidades

### ✅ Implementadas
- **Autenticação**: Login/logout com persistência
- **Dashboard**: Visão geral com estatísticas
- **Requisições**: Lista e visualização
- **Inventário**: Gestão de itens
- **Usuários**: Lista de usuários (admin)
- **Navegação**: Entre telas com React Navigation
- **Tema**: Design consistente com o web

### 🚧 Em Desenvolvimento
- **Nova Requisição**: Formulário de criação
- **Edição**: Modificar requisições existentes
- **Câmera**: Comprovantes fotográficos
- **Notificações**: Push notifications
- **Modo Offline**: Sincronização offline

## 🚀 Como Executar

### Pré-requisitos
- Node.js 16+
- Expo CLI
- Expo Go (para testes)

### Instalação
```bash
# Instalar dependências
npm install

# Iniciar o projeto
npm start
```

### Testes
```bash
# Android
npm run android

# iOS
npm run ios

# Web (desenvolvimento)
npm run web
```

## 📱 Teste no Dispositivo

### Expo Go (Mais Fácil)
1. Baixe o Expo Go na App Store/Play Store
2. Execute `npm start`
3. Escaneie o QR code com o app
4. O app carregará automaticamente

### APK Direto (Android)
1. Execute `expo build:android`
2. Baixe o APK gerado
3. Instale no dispositivo
4. Habilite "Fontes desconhecidas"

## 🔗 Integração com Backend

O app se conecta ao mesmo backend do sistema web:
- **URL Base**: `https://sistema-requerimento.vercel.app/api`
- **Autenticação**: JWT Token
- **APIs**: Mesmas rotas do sistema web

## 📊 Compatibilidade

- **Android**: 6.0+ (API 23+)
- **iOS**: 12.0+
- **Expo SDK**: 50+

## 🎯 Próximos Passos

1. **Implementar formulários** de criação/edição
2. **Adicionar funcionalidades mobile** (câmera, GPS)
3. **Implementar notificações push**
4. **Otimizar performance** e UX
5. **Preparar para App Store/Play Store**

## 🤝 Contribuição

Para contribuir com o desenvolvimento:
1. Mantenha o padrão de código
2. Use o design system estabelecido
3. Teste em diferentes dispositivos
4. Documente novas funcionalidades

## 📞 Suporte

Para dúvidas ou problemas:
- Verifique a documentação do Expo
- Consulte os logs do Metro bundler
- Teste no Expo Go primeiro

---

**Desenvolvido para a Igreja Batista Vida Abundante** 🏛️
