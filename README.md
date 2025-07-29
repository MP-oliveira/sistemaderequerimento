# 🏛️ Sistema de Requisições e Inventário - Igreja IBVA

Sistema completo para gestão de requisições, inventário, eventos e usuários da Igreja Batista Vida Abundante (IBVA), desenvolvido com Node.js, React e Supabase.

## 🚀 Funcionalidades Implementadas

### 🔐 **Sistema de Autenticação e Usuários**
- ✅ **Login seguro** com JWT e criptografia bcrypt
- ✅ **Controle de papéis**: ADM, PASTOR, SEC, AUDIOVISUAL, LIDER, USER
- ✅ **Permissões granulares** por funcionalidade
- ✅ **Gestão de usuários** (criar, editar, deletar)
- ✅ **Proteção de rotas** baseada em papéis
- ✅ **Sessões seguras** com expiração automática
- ✅ **Logout automático** e limpeza de tokens

### 📋 **Gestão de Requisições**
- ✅ **Criação de requisições** com formulário completo
- ✅ **Sistema de prioridades**: Alta, Média, Baixa
- ✅ **Sistema de aprovação** por pastores/administradores
- ✅ **Execução de requisições** por audiovisual/secretaria
- ✅ **Finalização com devolução** de itens
- ✅ **Rejeição de requisições** com motivo obrigatório
- ✅ **Busca e filtros** avançados (status, departamento, data)
- ✅ **Detecção de conflitos** de agenda automática
- ✅ **Histórico completo** de alterações
- ✅ **Edição e exclusão** de requisições
- ✅ **Status em tempo real**: PENDENTE, APTO, EXECUTADO, FINALIZADO, REJEITADO, PENDENTE_CONFLITO

### 📎 **Sistema de Comprovantes**
- ✅ **Upload de arquivos** (PDF, imagens, documentos)
- ✅ **Visualização de comprovantes** por requisição
- ✅ **Download de arquivos** enviados
- ✅ **Remoção de comprovantes** (com permissões)
- ✅ **Validação de tipos** de arquivo
- ✅ **Armazenamento seguro** no servidor
- ✅ **Limite de tamanho** (10MB por arquivo)

### 📦 **Gestão de Inventário**
- ✅ **CRUD completo** de itens de inventário
- ✅ **Controle de estoque** automático
- ✅ **Alertas de estoque baixo** (≤ 2 itens)
- ✅ **Histórico de atividades** por item
- ✅ **Exportação em PDF/Excel** com formatação profissional
- ✅ **Status de disponibilidade**: DISPONIVEL, RESERVADO, MANUTENCAO, INDISPONIVEL
- ✅ **Filtros avançados** (nome, categoria, status, localização)
- ✅ **Integração automática** com requisições
- ✅ **Validação de quantidade** (não permite valores negativos)
- ✅ **Logs detalhados** de movimentações

### 📅 **Gestão de Eventos**
- ✅ **Criação de eventos** com data/hora e local
- ✅ **Detecção de conflitos** de agenda
- ✅ **Calendário visual** no dashboard
- ✅ **Histórico de alterações** por evento
- ✅ **Integração com requisições** (criação automática)
- ✅ **Status de eventos**: AGENDADO, EM_ANDAMENTO, CONCLUIDO, CANCELADO
- ✅ **Filtros de busca** por nome, local, status, datas

### 📊 **Dashboard Inteligente**
- ✅ **Dashboard personalizado** por papel de usuário
- ✅ **Dashboard Admin** para pastores e administradores
- ✅ **Dashboard Audiovisual** para equipe técnica
- ✅ **Dashboard padrão** para usuários comuns
- ✅ **Calendário interativo** com eventos e requisições
- ✅ **Estatísticas em tempo real**
- ✅ **Alertas de estoque baixo**
- ✅ **Atividades recentes** em tempo real
- ✅ **Indicadores visuais** de status
- ✅ **Ações rápidas** para tarefas comuns

### 📧 **Sistema de Notificações**
- ✅ **Notificações automáticas** para nova requisição
- ✅ **E-mails de aprovação/rejeição** para solicitantes
- ✅ **Notificações por papel** (pastores, audiovisual, secretaria)
- ✅ **Integração com Supabase**
- ✅ **Toast notifications** para ações
- ✅ **Mensagens de sucesso/erro**
- ✅ **Confirmações** para ações críticas
- ✅ **Feedback em tempo real**

### 🎨 **Interface do Usuário**
- ✅ **Design responsivo** para mobile/desktop
- ✅ **Componentes reutilizáveis** e consistentes
- ✅ **Cores da marca IBVA** (#174ea6, #ffd600)
- ✅ **UX intuitiva** e acessível
- ✅ **Modais otimizados** com layout compacto
- ✅ **Inputs uniformes** com altura padronizada
- ✅ **Formulários responsivos** que cabem na tela
- ✅ **Navegação intuitiva** com breadcrumbs

### 📈 **Funcionalidades Avançadas**
- ✅ **Detecção de conflitos** de agenda em tempo real
- ✅ **Prevenção de duplicatas** e sobreposições
- ✅ **Exportação de dados** em PDF e Excel
- ✅ **Relatórios personalizados** por período
- ✅ **Sistema de logs** completo para auditoria
- ✅ **Backup automático** do Supabase
- ✅ **Validação robusta** de dados
- ✅ **Tratamento de erros** abrangente

## 🛠️ Tecnologias Utilizadas

### **Backend**
- **Node.js** com Express
- **Supabase** (PostgreSQL + Auth)
- **Multer** para upload de arquivos
- **JWT** para autenticação
- **Nodemailer** para e-mails
- **bcrypt** para criptografia
- **CORS** para segurança

### **Frontend**
- **React 18** com Vite
- **React Router** para navegação
- **Context API** para gerenciamento de estado
- **jsPDF** e **XLSX** para exportação
- **React Icons** para ícones
- **CSS Modules** para estilização
- **Responsive Design** com media queries

### **Banco de Dados**
- **Supabase PostgreSQL**
- **Tabelas relacionais** otimizadas
- **Triggers** para logs automáticos
- **Políticas de segurança** (RLS)
- **Backup automático**

## 📁 Estrutura do Projeto

```
sistemaderequerimento/
├── backend/
│   ├── src/
│   │   ├── controllers/     # Lógica de negócio
│   │   │   ├── AuthController.js
│   │   │   ├── RequestsController.js
│   │   │   ├── InventoryController.js
│   │   │   ├── UsersController.js
│   │   │   ├── EventsController.js
│   │   │   └── RequestItemsController.js
│   │   ├── routes/         # Rotas da API
│   │   ├── middlewares/    # Autenticação e permissões
│   │   ├── config/         # Configuração Supabase
│   │   ├── utils/          # Utilitários (e-mail, upload)
│   │   └── server.js       # Servidor Express
│   ├── uploads/            # Arquivos enviados
│   └── scripts/            # Scripts de manutenção
├── frontend/
│   ├── src/
│   │   ├── components/     # Componentes React
│   │   │   ├── Button.jsx
│   │   │   ├── Input.jsx
│   │   │   ├── Modal.jsx
│   │   │   ├── Header.jsx
│   │   │   ├── Calendar.jsx
│   │   │   └── ActivityLog.jsx
│   │   ├── pages/          # Páginas da aplicação
│   │   │   ├── Login.jsx
│   │   │   ├── Dashboard.jsx
│   │   │   ├── DashboardAdmin.jsx
│   │   │   ├── AudiovisualDashboard.jsx
│   │   │   ├── Requests.jsx
│   │   │   ├── Inventory.jsx
│   │   │   └── Users.jsx
│   │   ├── services/       # Serviços de API
│   │   ├── context/        # Contexto de autenticação
│   │   └── utils/          # Utilitários
│   └── public/             # Arquivos estáticos
└── README.md
```

## 🔐 Sistema de Permissões

### **Papéis de Usuário e Permissões**

| Funcionalidade | ADM | PASTOR | SEC | AUDIOVISUAL | LIDER | USER |
|----------------|-----|--------|-----|-------------|-------|------|
| **Dashboard Admin** | ✅ | ✅ | ❌ | ❌ | ❌ | ❌ |
| **Dashboard Audiovisual** | ❌ | ❌ | ❌ | ✅ | ❌ | ❌ |
| **Criar Requisições** | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ |
| **Aprovar Requisições** | ✅ | ✅ | ❌ | ❌ | ❌ | ❌ |
| **Executar Requisições** | ❌ | ❌ | ✅ | ✅ | ❌ | ❌ |
| **Gerenciar Inventário** | ✅ | ✅ | ✅ | ❌ | ❌ | ❌ |
| **Criar Eventos** | ✅ | ✅ | ❌ | ❌ | ✅ | ❌ |
| **Gerenciar Usuários** | ✅ | ✅ | ❌ | ❌ | ❌ | ❌ |
| **Visualizar Relatórios** | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ |
| **Upload Comprovantes** | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ |

## 🔧 Instalação e Configuração

### **Pré-requisitos**
- Node.js 18+
- npm ou yarn
- Conta no Supabase

### **1. Clone o repositório**
```bash
git clone <url-do-repositorio>
cd sistemaderequerimento
```

### **2. Configure o Backend**
```bash
cd backend
npm install
```

Crie um arquivo `.env` na pasta `backend`:
```env
SUPABASE_URL=sua_url_do_supabase
SUPABASE_ANON_KEY=sua_chave_anonima
SUPABASE_SERVICE_ROLE_KEY=sua_chave_service_role
JWT_SECRET=seu_jwt_secret
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USER=seu_email@gmail.com
EMAIL_PASS=sua_senha_de_app
PORT=3000
NODE_ENV=development
```

### **3. Configure o Frontend**
```bash
cd frontend
npm install
```

### **4. Execute o projeto**
```bash
# Terminal 1 - Backend
cd backend
npm start

# Terminal 2 - Frontend
cd frontend
npm run dev
```

## 🗄️ Estrutura do Banco de Dados

### **Tabelas Principais**
- `users` - Usuários do sistema
- `requests` - Requisições
- `request_items` - Itens das requisições
- `request_comprovantes` - Comprovantes das requisições
- `inventory` - Itens do inventário
- `inventory_history` - Histórico do inventário
- `events` - Eventos da igreja
- `event_history` - Histórico dos eventos
- `departments` - Departamentos

## 🔄 Fluxo de Requisições

### **1. Criação**
```
Usuário → Nova Requisição → Preenche Formulário → Seleciona Prioridade → Envia
```

### **2. Aprovação**
```
Pastor/ADM → Visualiza → Verifica Conflitos → Aprova/Rejeita → Notifica
```

### **3. Execução**
```
Audiovisual/SEC → Executa → Atualiza Inventário → Notifica
```

### **4. Finalização**
```
Executor → Devolve Itens → Finaliza → Atualiza Inventário
```

## 📊 Relatórios e Exportação

### **Inventário**
- ✅ **PDF profissional** com logo da IBVA
- ✅ **Excel estruturado** com múltiplas abas
- ✅ **Dados completos** (quantidade, status, local)
- ✅ **Formatação automática** de colunas

### **Histórico**
- ✅ **Logs detalhados** por item/evento
- ✅ **Rastreamento temporal** de alterações
- ✅ **Usuários responsáveis** por cada ação
- ✅ **Observações** e motivos

## 🎨 Componentes Principais

### **Button**
```jsx
<Button variant="primary" size="sm" loading={true}>
  Botão Principal
</Button>
```

### **Input**
```jsx
<Input 
  label="Nome" 
  placeholder="Digite seu nome"
  error="Campo obrigatório"
  type="select"
  options={options}
/>
```

### **Modal**
```jsx
<Modal 
  open={showModal} 
  title="Título do Modal"
  onClose={() => setShowModal(false)}
  actions={<Button>Confirmar</Button>}
>
  Conteúdo do modal
</Modal>
```

## 📱 Responsividade

O sistema é totalmente responsivo com breakpoints:
- **Desktop**: > 1024px
- **Tablet**: 768px - 1024px
- **Mobile**: < 768px

## 🚨 Alertas e Notificações

### **Alertas de Estoque**
- ✅ **Estoque baixo** (≤ 2 itens)
- ✅ **Itens indisponíveis** (quantidade = 0)
- ✅ **Notificações visuais** no dashboard
- ✅ **Relatórios automáticos**

### **Notificações do Sistema**
- ✅ **Toast notifications** para ações
- ✅ **Mensagens de sucesso/erro**
- ✅ **Confirmações** para ações críticas
- ✅ **Feedback em tempo real**

## 🔧 Manutenção e Suporte

### **Logs do Sistema**
- ✅ **Logs de erro** detalhados
- ✅ **Logs de acesso** por usuário
- ✅ **Logs de performance** da API
- ✅ **Monitoramento** de uploads

### **Backup e Segurança**
- ✅ **Backup automático** do Supabase
- ✅ **Arquivos seguros** em uploads/
- ✅ **Validação de tipos** de arquivo
- ✅ **Limite de tamanho** (10MB por arquivo)

## 🎯 Funcionalidades Específicas

### **Sistema de Prioridades**
- ✅ **Prioridade Alta**: Para eventos importantes/urgentes
- ✅ **Prioridade Média**: Para eventos regulares (padrão)
- ✅ **Prioridade Baixa**: Para eventos de menor importância

### **Detecção de Conflitos**
- ✅ **Conflitos de agenda** entre eventos
- ✅ **Conflitos de local/horário** em requisições
- ✅ **Alertas em tempo real** durante criação
- ✅ **Prevenção de duplicatas**

### **Dashboard Personalizado**
- ✅ **Dashboard Admin**: Para pastores e administradores
- ✅ **Dashboard Audiovisual**: Para equipe técnica
- ✅ **Dashboard Padrão**: Para usuários comuns
- ✅ **Redirecionamento automático** baseado no papel

## 🚀 Deploy

O projeto está configurado para deploy em qualquer plataforma:
- **Vercel** (Frontend)
- **Netlify** (Frontend)
- **Railway** (Backend)
- **Heroku** (Backend)
- **Servidor próprio**

## 📞 Suporte

### **Contato**
- **Email**: suporte@ibva.com
- **Telefone**: (11) 99999-9999
- **Documentação**: [Wiki do Projeto]

### **FAQ**
- **Como resetar senha?** → Contate o administrador
- **Como adicionar usuário?** → Apenas ADM pode criar usuários
- **Como exportar dados?** → Use os botões de exportação nas páginas
- **Como configurar e-mail?** → Configure as variáveis de ambiente

## 🤝 Contribuição

### **Como Contribuir**
1. Fork o projeto
2. Crie uma branch para sua feature
3. Commit suas mudanças
4. Push para a branch
5. Abra um Pull Request

### **Padrões de Código**
- ✅ **ESLint** para JavaScript/React
- ✅ **Prettier** para formatação
- ✅ **Conventional Commits** para mensagens
- ✅ **TypeScript** (futuro)

---

## 📝 Licença

Este projeto é desenvolvido para uso interno da Igreja Batista Vida Abundante (IBVA). Todos os direitos reservados.

---

**Desenvolvido com ❤️ para a Igreja Batista Vida Abundante** 