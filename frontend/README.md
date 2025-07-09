# Sistema de Requisições - Frontend

## 📋 Descrição

Frontend moderno e responsivo para o Sistema de Requisições, Inventário e Eventos da Igreja, desenvolvido com React e Vite. O design segue o padrão visual da IBVA (Igreja Batista Vida Abundante), utilizando as mesmas cores, fontes e elementos visuais.

## 🎨 Design System

### Cores Oficiais IBVA
- **Azul Principal**: `#174ea6`
- **Azul Escuro**: `#123a7b`
- **Amarelo**: `#ffd600`
- **Cinza de Fundo**: `#f5f6fa`
- **Branco**: `#fff`

### Tipografia
- **Fonte Principal**: Montserrat (400, 600, 700)
- **Família de Fallback**: Arial, sans-serif

### Componentes Visuais
- **Cards**: Bordas arredondadas (16px), sombras suaves
- **Botões**: Variações (primary, yellow, secondary, danger)
- **Inputs**: Estilo moderno com foco azul
- **Tabelas**: Responsivas com hover effects

## 🚀 Tecnologias

- **React 18** - Biblioteca principal
- **Vite** - Build tool e dev server
- **CSS Modules** - Estilização organizada
- **React Router** - Navegação
- **Context API** - Gerenciamento de estado

## 📁 Estrutura do Projeto

```
frontend/
├── src/
│   ├── components/          # Componentes reutilizáveis
│   │   ├── Button.jsx      # Botões com variantes
│   │   ├── Input.jsx       # Campos de entrada
│   │   ├── Table.jsx       # Tabelas responsivas
│   │   ├── Modal.jsx       # Modais interativos
│   │   ├── Header.jsx      # Header com logo IBVA
│   │   ├── Sidebar.jsx     # Menu lateral
│   │   └── Layout.jsx      # Layout principal
│   ├── pages/              # Páginas da aplicação
│   │   ├── Login.jsx       # Página de login
│   │   ├── Dashboard.jsx   # Dashboard com calendário
│   │   ├── Users.jsx       # Gestão de usuários
│   │   ├── Inventory.jsx   # Controle de inventário
│   │   └── Requests.jsx    # Sistema de requisições
│   ├── services/           # Serviços de API
│   │   ├── authService.js  # Autenticação
│   │   ├── usersService.js # Usuários
│   │   ├── inventoryService.js # Inventário
│   │   ├── requestsService.js  # Requisições
│   │   └── eventsService.js    # Eventos
│   ├── context/            # Contextos React
│   │   └── AuthContext.jsx # Contexto de autenticação
│   └── assets/             # Recursos estáticos
```

## 🎯 Funcionalidades

### 🔐 Autenticação
- Login com e-mail e senha
- Token JWT para sessões
- Proteção de rotas
- Logout automático

### 📊 Dashboard
- **Calendário Visual** igual ao da IBVA
- Estatísticas em tempo real
- Navegação entre meses
- Eventos marcados nos dias
- Design responsivo

### 👥 Gestão de Usuários
- Cadastro de novos usuários
- Definição de papéis (admin, user)
- Lista de usuários ativos
- Validação de formulários

### 📦 Inventário
- Cadastro de itens
- Controle de quantidade
- Status (Disponível, Reservado, Manutenção, Indisponível)
- Lista organizada

### 📝 Requisições
- Formulário complexo com múltiplos itens
- Modal para adicionar itens
- Data de uso
- Status de aprovação
- Histórico de requisições

## 🎨 Componentes Principais

### Button
```jsx
<Button variant="yellow" size="lg" loading={true}>
  Botão Principal
</Button>
```

### Input
```jsx
<Input 
  label="Nome" 
  placeholder="Digite seu nome"
  error="Campo obrigatório"
/>
```

### Table
```jsx
<Table 
  columns={[
    { key: 'nome', label: 'Nome' },
    { key: 'email', label: 'E-mail' }
  ]}
  data={usuarios}
/>
```

## 🔧 Instalação e Uso

### Pré-requisitos
- Node.js 16+
- npm ou yarn

### Instalação
```bash
cd frontend
npm install
```

### Desenvolvimento
```bash
npm run dev
```

### Build para Produção
```bash
npm run build
```

## 🔌 Integração com Backend

### Endpoints Utilizados
- `POST /api/auth/login` - Autenticação
- `GET /api/users` - Listar usuários
- `POST /api/users` - Criar usuário
- `GET /api/inventory` - Listar inventário
- `POST /api/inventory` - Criar item
- `GET /api/requests` - Listar requisições
- `POST /api/requests` - Criar requisição
- `GET /api/events` - Listar eventos

### Autenticação
Todas as requisições incluem o header:
```
Authorization: Bearer <token>
```

## 📱 Responsividade

O sistema é totalmente responsivo com breakpoints:
- **Desktop**: > 900px
- **Tablet**: 600px - 900px
- **Mobile**: < 600px

## 🎨 Calendário IBVA

O calendário do Dashboard replica fielmente o design da IBVA:
- Navegação entre meses
- Eventos marcados com pontos
- Destaque do dia atual
- Cores e tipografia oficiais
- Responsivo para todos os dispositivos

## 🔒 Segurança

- Autenticação JWT em todas as requisições
- Proteção de rotas sensíveis
- Validação de formulários
- Tratamento de erros robusto

## 🚀 Deploy

O projeto está configurado para deploy em qualquer plataforma:
- Vercel
- Netlify
- GitHub Pages
- Servidor próprio

## 📞 Suporte

Para dúvidas ou problemas, consulte a documentação do backend ou entre em contato com a equipe de desenvolvimento.

---

**Desenvolvido com ❤️ seguindo o padrão visual da IBVA**
