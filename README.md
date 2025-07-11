# 🏛️ Sistema de Requisições e Inventário - Igreja

Sistema completo para gestão de requisições, inventário e eventos de uma igreja, desenvolvido com Node.js, React e Supabase.

## 🚀 Funcionalidades Implementadas

### 📋 **Gestão de Requisições**
- ✅ **Criação de requisições** com departamento, descrição e data
- ✅ **Sistema de aprovação** por pastores/administradores
- ✅ **Execução de requisições** por audiovisual/secretaria
- ✅ **Finalização com devolução** de itens
- ✅ **Rejeição de requisições** com motivo obrigatório
- ✅ **Controle de permissões** por papel de usuário
- ✅ **Busca e filtros** avançados
- ✅ **Detecção de conflitos** de agenda

### 📎 **Sistema de Comprovantes**
- ✅ **Upload de arquivos** (PDF, imagens, documentos)
- ✅ **Visualização de comprovantes** por requisição
- ✅ **Download de arquivos** enviados
- ✅ **Remoção de comprovantes** (com permissões)
- ✅ **Validação de tipos** de arquivo
- ✅ **Armazenamento seguro** no servidor

### 📦 **Gestão de Inventário**
- ✅ **Cadastro de itens** com categoria e quantidade
- ✅ **Controle de estoque** automático
- ✅ **Alertas de estoque baixo** (≤ 2 itens)
- ✅ **Histórico de atividades** por item
- ✅ **Exportação em PDF/Excel**
- ✅ **Status de disponibilidade** (Disponível, Reservado, Manutenção, Indisponível)

### 📅 **Gestão de Eventos**
- ✅ **Criação de eventos** com data/hora e local
- ✅ **Detecção de conflitos** de agenda
- ✅ **Calendário visual** no dashboard
- ✅ **Histórico de alterações** por evento
- ✅ **Integração com requisições**

### 👥 **Sistema de Usuários e Permissões**
- ✅ **Controle por papel**: ADM, PASTOR, SEC, AUDIOVISUAL, LIDER
- ✅ **Autenticação segura** com JWT
- ✅ **Permissões granulares** por funcionalidade
- ✅ **Logs de atividades** por usuário

### 📧 **Notificações por E-mail**
- ✅ **Notificações automáticas** para nova requisição
- ✅ **E-mails de aprovação/rejeição** para solicitantes
- ✅ **Notificações por papel** (pastores, audiovisual, secretaria)
- ✅ **Integração com Supabase**

### 📊 **Dashboard Inteligente**
- ✅ **Visão geral** com estatísticas
- ✅ **Calendário de eventos** interativo
- ✅ **Alertas de estoque baixo**
- ✅ **Atividades recentes** em tempo real
- ✅ **Indicadores visuais** de status

## 🛠️ Tecnologias Utilizadas

### **Backend**
- **Node.js** com Express
- **Supabase** (PostgreSQL + Auth)
- **Multer** para upload de arquivos
- **JWT** para autenticação
- **Nodemailer** para e-mails

### **Frontend**
- **React** com Vite
- **React Router** para navegação
- **React Hot Toast** para notificações
- **jsPDF** e **XLSX** para exportação
- **CSS Modules** para estilização

### **Banco de Dados**
- **Supabase PostgreSQL**
- **Tabelas relacionais** otimizadas
- **Triggers** para logs automáticos
- **Políticas de segurança** (RLS)

## 📁 Estrutura do Projeto

```
sistemaderequerimento/
├── backend/
│   ├── src/
│   │   ├── controllers/     # Lógica de negócio
│   │   ├── routes/         # Rotas da API
│   │   ├── middlewares/    # Autenticação e permissões
│   │   ├── config/         # Configuração Supabase
│   │   ├── utils/          # Utilitários (e-mail, upload)
│   │   └── server.js       # Servidor Express
│   └── uploads/            # Arquivos enviados
├── frontend/
│   ├── src/
│   │   ├── components/     # Componentes React
│   │   ├── pages/          # Páginas da aplicação
│   │   ├── services/       # Serviços de API
│   │   ├── context/        # Contexto de autenticação
│   │   └── utils/          # Utilitários
│   └── public/             # Arquivos estáticos
└── README.md
```

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

## 🔐 Sistema de Permissões

### **Papéis de Usuário**
- **ADM**: Acesso total ao sistema
- **PASTOR**: Aprova/rejeita requisições, gerencia eventos
- **SEC**: Executa requisições, gerencia inventário
- **AUDIOVISUAL**: Executa requisições, gerencia equipamentos
- **LIDER**: Gerencia eventos e requisições básicas

### **Controle de Acesso**
- ✅ **Autenticação obrigatória** em todas as rotas
- ✅ **Validação de permissões** por funcionalidade
- ✅ **Logs de atividades** para auditoria
- ✅ **Sessões seguras** com JWT

## 📈 Funcionalidades Avançadas

### **Detecção de Conflitos**
- ✅ **Conflitos de agenda** entre eventos
- ✅ **Conflitos de local/horário** em requisições
- ✅ **Alertas em tempo real** durante criação
- ✅ **Prevenção de duplicatas**

### **Exportação de Dados**
- ✅ **Relatórios em PDF** do inventário
- ✅ **Planilhas Excel** com dados completos
- ✅ **Formatação profissional** dos documentos
- ✅ **Dados estruturados** e organizados

### **Sistema de Logs**
- ✅ **Histórico completo** de todas as ações
- ✅ **Rastreamento por usuário** e item
- ✅ **Logs de inventário** com quantidades
- ✅ **Logs de eventos** com alterações

## 🎨 Interface do Usuário

### **Design Responsivo**
- ✅ **Layout adaptativo** para mobile/desktop
- ✅ **Componentes reutilizáveis** e consistentes
- ✅ **Cores da marca** da igreja
- ✅ **UX intuitiva** e acessível

### **Componentes Principais**
- **Modal**: Para formulários e confirmações
- **Table**: Para listagens com ações
- **Button**: Com variantes (primary, success, danger, etc.)
- **Input**: Com validação e labels
- **Comprovantes**: Upload e visualização de arquivos

## 📧 Sistema de E-mails

### **Notificações Automáticas**
- ✅ **Nova requisição** → Pastores
- ✅ **Requisição aprovada** → Solicitante + Audiovisual
- ✅ **Requisição rejeitada** → Solicitante + Secretaria
- ✅ **Requisição executada** → Solicitante

### **Configuração de E-mail**
```javascript
// Exemplo de configuração
const emailConfig = {
  host: 'smtp.gmail.com',
  port: 587,
  secure: false,
  auth: {
    user: 'seu_email@gmail.com',
    pass: 'sua_senha_de_app'
  }
}
```

## 🔄 Fluxo de Requisições

### **1. Criação**
```
Usuário → Nova Requisição → Seleciona Itens → Envia
```

### **2. Aprovação**
```
Pastor/ADM → Visualiza → Aprova/Rejeita → Notifica
```

### **3. Execução**
```
Audiovisual/SEC → Executa → Atualiza Inventário → Notifica
```

### **4. Finalização**
```
Executor → Devolve Itens → Finaliza → Atualiza Inventário
```

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

## 📊 Relatórios e Exportação

### **Inventário**
- ✅ **PDF profissional** com logo da igreja
- ✅ **Excel estruturado** com múltiplas abas
- ✅ **Dados completos** (quantidade, status, local)
- ✅ **Formatação automática** de colunas

### **Histórico**
- ✅ **Logs detalhados** por item/evento
- ✅ **Rastreamento temporal** de alterações
- ✅ **Usuários responsáveis** por cada ação
- ✅ **Observações** e motivos

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

## 🎯 Próximas Funcionalidades

### **Planejadas**
- 📅 **Agenda compartilhada** entre departamentos
- 📊 **Dashboard analítico** com gráficos
- 📱 **App mobile** para notificações
- 🔔 **Sistema de notificações** push
- 📋 **Relatórios personalizados** por período
- 🎨 **Temas personalizáveis** por igreja

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

## 📞 Suporte

### **Contato**
- **Email**: suporte@igreja.com
- **Telefone**: (11) 99999-9999
- **Documentação**: [Wiki do Projeto]

### **FAQ**
- **Como resetar senha?** → Contate o administrador
- **Como adicionar usuário?** → Apenas ADM pode criar usuários
- **Como exportar dados?** → Use os botões de exportação nas páginas
- **Como configurar e-mail?** → Configure as variáveis de ambiente

---

## 📝 Licença

Este projeto é desenvolvido para uso interno da igreja. Todos os direitos reservados.

---

**Desenvolvido com ❤️ para a Igreja** 