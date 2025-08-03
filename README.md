# 🏛️ Sistema de Requisições - Igreja Batista Vida Abundante

Sistema completo de gerenciamento de requisições para eventos e controle de inventário da Igreja Batista Vida Abundante.

## 📋 Índice

- [Visão Geral](#visão-geral)
- [Funcionalidades](#funcionalidades)
- [Tecnologias](#tecnologias)
- [Instalação](#instalação)
- [Configuração](#configuração)
- [Uso](#uso)
- [API](#api)
- [Estrutura do Projeto](#estrutura-do-projeto)
- [Contribuição](#contribuição)

## 🎯 Visão Geral

O Sistema de Requisições é uma aplicação web completa desenvolvida para gerenciar requisições de espaços, equipamentos e materiais da Igreja Batista Vida Abundante. O sistema oferece controle de conflitos de horários, gestão de inventário em tempo real e interface intuitiva para diferentes níveis de usuário.

## ✨ Funcionalidades

### 🔐 Sistema de Autenticação e Autorização

- **Login Multi-nível**: Suporte para diferentes tipos de usuário (Líderes, Pastores, Administradores)
- **Controle de Acesso**: Permissões específicas por tipo de usuário
- **Sessões Seguras**: Autenticação JWT com tokens seguros
- **Proteção de Rotas**: Middleware de autenticação em todas as rotas protegidas

### 📅 Gestão de Requisições

#### **Criação de Requisições**
- Formulário completo para criação de requisições
- Seleção de departamento, local, data e horário
- Descrição detalhada do evento
- Estimativa de público esperado
- Sistema de prioridades (NORMAL, ALTA, URGENTE)

#### **Validação em Tempo Real**
- **Verificação de Conflitos**: Detecção automática de conflitos de horário e local
- **Alertas Visuais**: Interface intuitiva com cores e ícones
- **Sugestões Inteligentes**: Horários alternativos sugeridos automaticamente
- **Feedback Imediato**: Validação conforme o usuário digita

#### **Sistema de Conflitos Avançado**
- **Conflitos Diretos**: Impede criação quando há sobreposição total
- **Conflitos de Intervalo**: Marca como `PENDENTE_CONFLITO` quando há menos de 15 minutos entre eventos
- **Regra de Aprovação**: Conflitos só ocorrem com requisições aprovadas (`APTO`, `EXECUTADO`, `FINALIZADO`)
- **Múltiplas Requisições Pendentes**: Permite múltiplas requisições pendentes para o mesmo horário/local

#### **Sugestões de Horários**
- **Sugestão 1**: 1 hora antes até 15 minutos antes do conflito
- **Sugestão 2**: 15 minutos depois do conflito até 22:00
- **Aplicação Automática**: Botão "Usar" para aplicar sugestão automaticamente
- **Validação Inteligente**: Verifica se sugestões são válidas antes de mostrar

### 🏢 Gestão de Locais e Salas

#### **Configuração de Locais**
- **Anexo 1 - Salão**: Capacidade e características específicas
- **Anexo 2 - Salão**: Configurações independentes
- **Templo Principal**: Espaço principal da igreja
- **Sala de Reunião**: Espaço para reuniões menores
- **Área Externa**: Espaços ao ar livre

#### **Controle de Disponibilidade**
- Verificação em tempo real de disponibilidade
- Histórico de uso por local
- Capacidade e limitações por espaço

### 📦 Sistema de Inventário Avançado

#### **Controle de Materiais**
- **Cadastro Completo**: Nome, descrição, categoria, quantidade total
- **Status Automático**: `DISPONIVEL`, `BAIXO_ESTOQUE`, `INDISPONIVEL`
- **Quantidade Disponível**: Controle preciso de unidades disponíveis
- **Categorização**: Organização por tipos (AUDIO, VIDEO, CABOS, etc.)

#### **Reserva Automática de Materiais**
- **Aprovação Inteligente**: Materiais são reservados automaticamente na aprovação
- **Controle de Quantidade**: Apenas a quantidade solicitada é reservada
- **Status Dinâmico**: Atualização automática de status baseada na quantidade
- **Histórico Completo**: Registro de todas as movimentações

#### **Verificação em Tempo Real**
- **Alertas de Indisponibilidade**: Materiais sem quantidade suficiente
- **Alertas de Baixo Estoque**: Materiais que ficarão com ≤ 2 unidades
- **Interface Visual**: Cores e ícones para diferentes tipos de alerta
- **Informações Detalhadas**: Quantidade disponível, solicitada e faltante

#### **Retorno de Materiais**
- **Sistema de Devolução**: Materiais retornam ao estoque após uso
- **Restauração de Status**: Status atualizado automaticamente
- **Histórico de Movimentações**: Registro completo de entrada e saída

### 👥 Gestão de Usuários

#### **Tipos de Usuário**
- **Líderes**: Podem criar requisições e visualizar status
- **Pastores**: Podem aprovar/rejeitar requisições
- **Administradores**: Acesso completo ao sistema
- **Audiovisual**: Controle específico de equipamentos

#### **Perfis e Permissões**
- Controle granular de acesso por funcionalidade
- Interface adaptada por tipo de usuário
- Logs de atividades por usuário

### 📊 Dashboard e Relatórios

#### **Dashboard do Usuário**
- **Requisições Ativas**: Visualização das próprias requisições
- **Status em Tempo Real**: Atualizações automáticas de status
- **Histórico Pessoal**: Todas as requisições do usuário
- **Ações Rápidas**: Botões para ações comuns

#### **Dashboard Administrativo**
- **Visão Geral**: Todas as requisições do sistema
- **Filtros Avançados**: Por status, data, departamento, local
- **Ações em Massa**: Aprovação/rejeição múltipla
- **Estatísticas**: Métricas de uso e ocupação

#### **Dashboard Audiovisual**
- **Controle de Equipamentos**: Gestão específica de materiais
- **Status de Inventário**: Visão detalhada de disponibilidade
- **Retorno de Materiais**: Interface para devolução
- **Relatórios de Uso**: Estatísticas de utilização

##### **Fluxo Completo do Dashboard Audiovisual**

O dashboard audiovisual é o centro de controle para gerenciar todo o ciclo de vida das requisições, desde a preparação até a finalização e devolução dos instrumentos.

###### **🚀 Carregamento Inicial**
- **Requisições**: Todas as requisições do sistema
- **Eventos**: Eventos cadastrados no sistema
- **Materiais do Dia**: Itens para eventos de hoje (status APTO)
- **Materiais para Retorno**: Itens de eventos recentes (status EXECUTADO)

###### **📊 Cards de Estatísticas**
- **Requisições Aprovadas**: Total de requisições no sistema
- **Em Preparação**: Requisições com status `EXECUTADO`
- **Finalizadas**: Requisições com status `FINALIZADO`

###### **⚡ Ações Rápidas**
- **Ver Requisições**: Acesso à página de gerenciamento de requisições audiovisual
- **Gerenciar Inventário**: Acesso ao sistema de inventário

###### **📦 Materiais do Dia (TodayMaterials)**
- **Fonte**: Requisições com status `APTO` para hoje
- **Funcionalidades**:
  - Visualizar materiais necessários para eventos de hoje
  - Separar itens como preparados (✓)
  - Barra de progresso mostrando separação
  - Expandir/recolher detalhes por requisição

###### **🔄 Retorno de Instrumentos (ReturnMaterials)**

**A) Materiais para Despachar (Próximos 7 dias)**
- **Filtro**: Itens não separados de eventos próximos
- **Ação**: Marcar como separado
- **Status**: `APTO` → `EXECUTADO`

**B) Retorno de Instrumentos (Últimos 7 dias)**
- **Filtro**: Itens separados de eventos recentes
- **Ação**: Marcar como retornado
- **Status**: `EXECUTADO` → `FINALIZADO`

###### **📅 Calendário**
- **Eventos Exibidos**: Requisições (APTO, EXECUTADO, FINALIZADO) + Eventos cadastrados
- **Funcionalidades**: Navegação mensal, visualização por dia, modal com detalhes

###### **🔄 Fluxo de Status das Requisições**
```
PENDENTE → APTO → EXECUTADO → FINALIZADO
    ↓         ↓        ↓          ↓
  Aguardando Aprovado Preparando Finalizado
  Aprovação           Material    (Devolvido)
```

###### **🎯 Ações Principais do Audiovisual**

**Preparação de Materiais:**
1. Ver materiais do dia
2. Separar itens necessários
3. Marcar como separado

**Execução de Eventos:**
1. Ver requisições executadas
2. Preparar materiais
3. Executar evento

**Finalização:**
1. Ver materiais para retorno
2. Marcar itens como retornados
3. Finalizar requisição

###### **🔧 Atualizações em Tempo Real**
- Recarregamento automático após ações
- Notificações de sucesso/erro
- Confirmações de ações
- Alertas de conflitos

###### **📱 Responsividade**
- **Desktop**: Layout completo com todas as seções
- **Tablet**: Layout ajustado com seções empilhadas
- **Mobile**: Layout otimizado para toque

### 🔔 Sistema de Notificações

#### **Alertas em Tempo Real**
- **Conflitos de Horário**: Notificações imediatas
- **Indisponibilidade de Materiais**: Alertas visuais
- **Status de Requisições**: Atualizações automáticas
- **Sugestões Inteligentes**: Propostas de horários alternativos

#### **Interface de Validação**
- **Cores Significativas**: Vermelho para erro, laranja para aviso, verde para sucesso
- **Ícones Intuitivos**: Símbolos visuais para diferentes tipos de alerta
- **Informações Detalhadas**: Dados completos sobre conflitos e disponibilidade
- **Ações Rápidas**: Botões para aplicar sugestões ou resolver conflitos

### 📱 Interface Responsiva

#### **Design Moderno**
- **Interface Limpa**: Design minimalista e profissional
- **Responsividade**: Funciona em desktop, tablet e mobile
- **Acessibilidade**: Contraste adequado e navegação por teclado
- **Performance**: Carregamento rápido e interações fluidas

#### **Experiência do Usuário**
- **Feedback Visual**: Confirmações visuais de ações
- **Loading States**: Indicadores de carregamento
- **Validação em Tempo Real**: Verificação conforme digitação
- **Navegação Intuitiva**: Fluxo lógico e fácil de usar

## 🛠️ Tecnologias

### **Backend**
- **Node.js**: Runtime JavaScript
- **Express.js**: Framework web
- **Supabase**: Banco de dados PostgreSQL
- **JWT**: Autenticação e autorização
- **CORS**: Cross-origin resource sharing

### **Frontend**
- **React**: Biblioteca JavaScript
- **Vite**: Build tool e dev server
- **CSS3**: Estilização moderna
- **Fetch API**: Comunicação com backend

### **Banco de Dados**
- **PostgreSQL**: Banco de dados relacional
- **Supabase**: Plataforma de backend-as-a-service
- **Row Level Security**: Segurança em nível de linha

## 🚀 Instalação

### **Pré-requisitos**
- Node.js 18+
- npm ou yarn
- Conta no Supabase

### **1. Clone o Repositório**
```bash
git clone <url-do-repositorio>
cd sistemaderequerimento
```

### **2. Instale as Dependências**
```bash
# Backend
cd backend
npm install

# Frontend
cd ../frontend
npm install
```

### **3. Configure as Variáveis de Ambiente**
```bash
# Backend (.env)
SUPABASE_URL=sua_url_do_supabase
SUPABASE_ANON_KEY=sua_chave_anonima
SUPABASE_SERVICE_ROLE_KEY=sua_chave_service_role
JWT_SECRET=seu_jwt_secret
PORT=3000
NODE_ENV=development

# Frontend (.env)
VITE_API_URL=http://localhost:3000
```

### **4. Configure o Banco de Dados**
Execute os scripts SQL no Supabase:
- `database/create_comprovantes_table.sql`
- Configurações de RLS (Row Level Security)

### **5. Inicie os Servidores**
```bash
# Backend (Terminal 1)
cd backend
npm start

# Frontend (Terminal 2)
cd frontend
npm run dev
```

## ⚙️ Configuração

### **Configuração do Supabase**
1. Crie um projeto no Supabase
2. Configure as tabelas necessárias
3. Configure RLS (Row Level Security)
4. Configure as políticas de acesso

### **Configuração de Usuários**
1. Crie usuários administradores
2. Configure departamentos
3. Defina permissões por tipo de usuário

### **Configuração de Locais**
1. Configure os locais disponíveis
2. Defina capacidades e limitações
3. Configure horários de funcionamento

## 📖 Uso

### **Para Líderes**
1. Faça login no sistema
2. Acesse "Nova Requisição"
3. Preencha os dados do evento
4. Selecione materiais necessários
5. Verifique conflitos em tempo real
6. Envie a requisição

### **Para Pastores**
1. Acesse o dashboard administrativo
2. Visualize requisições pendentes
3. Verifique conflitos e disponibilidade
4. Aprove ou rejeite requisições
5. Monitore o uso de materiais

### **Para Administradores**
1. Gerencie usuários e permissões
2. Configure locais e materiais
3. Visualize relatórios e estatísticas
4. Monitore o sistema completo

## 🔌 API

### **Endpoints de Requisições**

#### **POST /api/requests**
Cria uma nova requisição
```json
{
  "department": "JOVENS",
  "event_name": "Culto de Jovens",
  "date": "2025-01-15",
  "location": "Anexo 1 - Salão",
  "start_datetime": "2025-01-15T19:00",
  "end_datetime": "2025-01-15T22:00",
  "description": "Culto semanal dos jovens",
  "expected_audience": 50,
  "prioridade": "NORMAL"
}
```

#### **GET /api/requests**
Lista todas as requisições (com filtros)

#### **PUT /api/requests/:id/approve**
Aprova uma requisição

#### **PUT /api/requests/:id/reject**
Rejeita uma requisição

#### **POST /api/requests/check-conflicts**
Verifica conflitos de horário
```json
{
  "date": "2025-01-15",
  "location": "Anexo 1 - Salão",
  "start_time": "19:00",
  "end_time": "22:00"
}
```

#### **POST /api/requests/check-inventory-availability**
Verifica disponibilidade de materiais
```json
{
  "itens": [
    {
      "inventory_id": "uuid",
      "quantity_requested": 2
    }
  ]
}
```

### **Endpoints de Inventário**

#### **GET /api/inventory**
Lista todos os itens do inventário

#### **POST /api/inventory**
Cria um novo item

#### **PUT /api/inventory/:id**
Atualiza um item

### **Endpoints de Autenticação**

#### **POST /api/auth/login**
Login de usuário
```json
{
  "email": "usuario@igreja.com",
  "password": "senha123"
}
```

#### **POST /api/auth/register**
Registro de usuário

## 📁 Estrutura do Projeto

```
sistemaderequerimento/
├── backend/
│   ├── src/
│   │   ├── controllers/
│   │   │   ├── RequestsController.js
│   │   │   ├── AuthController.js
│   │   │   └── InventoryController.js
│   │   ├── routes/
│   │   │   ├── requestsRoutes.js
│   │   │   └── authRoutes.js
│   │   ├── middlewares/
│   │   │   ├── authMiddleware.js
│   │   │   └── roleMiddleware.js
│   │   └── config/
│   │       └── supabaseClient.js
│   ├── database/
│   │   └── create_comprovantes_table.sql
│   └── package.json
├── frontend/
│   ├── src/
│   │   ├── pages/
│   │   │   ├── Requests.jsx
│   │   │   ├── RequestsAdmin.jsx
│   │   │   └── Dashboard.jsx
│   │   ├── components/
│   │   │   ├── Modal.jsx
│   │   │   └── Table.jsx
│   │   ├── services/
│   │   │   └── requestsService.js
│   │   └── utils/
│   │       └── dateUtils.js
│   └── package.json
└── README.md
```

## 🤝 Contribuição

### **Como Contribuir**
1. Fork o projeto
2. Crie uma branch para sua feature (`git checkout -b feature/AmazingFeature`)
3. Commit suas mudanças (`git commit -m 'Add some AmazingFeature'`)
4. Push para a branch (`git push origin feature/AmazingFeature`)
5. Abra um Pull Request

### **Padrões de Código**
- Use ESLint para linting
- Siga as convenções de nomenclatura
- Documente funções complexas
- Teste suas mudanças

### **Relatórios de Bug**
- Use o template de issue
- Inclua passos para reproduzir
- Adicione screenshots se relevante
- Especifique ambiente e versões

## 📄 Licença

Este projeto está sob a licença MIT. Veja o arquivo `LICENSE` para mais detalhes.

## 📞 Suporte

Para suporte e dúvidas:
- Email: suporte@igreja.com
- Documentação: [Link para documentação]
- Issues: [GitHub Issues]

---

**Desenvolvido com ❤️ para a Igreja Batista Vida Abundante** 