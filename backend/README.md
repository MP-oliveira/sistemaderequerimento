# Sistema de Requisições, Inventário e Eventos

## Visão Geral

Este sistema gerencia requisições de materiais, controle de inventário, cadastro de eventos e usuários, com controle de permissões por papel, histórico de movimentações e integrações automáticas entre módulos. Utiliza Node.js, Express e Supabase como backend e banco de dados.

---

## Funcionalidades Principais

### 1. **Usuários e Autenticação**
- Cadastro, login e autenticação JWT.
- Papéis: ADM, PASTOR, LIDER, SEC, AUDIOVISUAL.
- Permissões por papel em todos os módulos.

### 2. **Inventário**
- CRUD completo de itens de inventário.
- Campos: nome, descrição, categoria, quantidade disponível/total, localização, status, imagem, datas.
- Controle de status: DISPONIVEL, RESERVADO, MANUTENCAO, INDISPONIVEL.
- Histórico detalhado de movimentações (quem, quando, o que mudou).
- Validação de quantidade (não permite valores negativos ou inconsistentes).
- Filtros de busca avançados (nome, categoria, status, localização).
- Upload de imagem (mock, pronto para integração com Supabase Storage).
- Alertas de quantidade baixa.
- Integração automática com requisições (baixa de estoque ao executar requisição).

### 3. **Requisições**
- CRUD completo de requisições.
- Fluxo de aprovação (ADM/PASTOR), execução (SEC/AUDIOVISUAL), rejeição.
- Cada requisição pode ter vários itens vinculados ao inventário.
- Integração automática: ao executar, baixa estoque dos itens e registra histórico.
- Permissões por papel em cada etapa.

### 4. **Eventos**
- CRUD completo de eventos (nome, local, datas, descrição, público esperado, status).
- Status: AGENDADO, EM_ANDAMENTO, CONCLUIDO, CANCELADO.
- Permissões: ADM, PASTOR, LIDER podem criar/editar/cancelar; todos autenticados visualizam.
- Histórico detalhado de alterações (quem, quando, o que mudou).
- Filtros de busca avançados (nome, local, status, datas).
- Relacionamento com requisições (campo event_id).

### 5. **Histórico e Auditoria**
- Toda movimentação relevante (inventário, eventos) é registrada com usuário, data, ação, valores antes/depois e observação.
- Endpoints para consultar histórico de cada item/evento.

### 6. **Validação e Tratamento de Erros**
- Validação de campos obrigatórios e regras de negócio em todos os endpoints.
- Mensagens de erro claras e padronizadas para o frontend.
- Tratamento de erros de permissão, dados inválidos, recursos não encontrados e erros inesperados.

---

## Permissões por Papel (Resumo)

| Módulo      | ADM | PASTOR | LIDER | SEC | AUDIOVISUAL | Outros |
|-------------|-----|--------|-------|-----|-------------|--------|
| Inventário  | ✔️  | ✔️     |      | ✔️  |             | Visualiza |
| Requisições | ✔️  | ✔️     |      | ✔️  | ✔️          | Visualiza/cria próprias |
| Eventos     | ✔️  | ✔️     | ✔️    |     |             | Visualiza |

---

## Exemplos de Uso (curl)

### Criar item de inventário
```bash
curl -X POST http://localhost:3000/api/inventory \
  -H "Authorization: Bearer SEU_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Projetor Epson",
    "description": "Projetor multimídia para eventos",
    "category": "Equipamento",
    "quantity_available": 2,
    "quantity_total": 2,
    "location": "Sala 3"
  }'
```

### Executar requisição
```bash
curl -X PATCH http://localhost:3000/api/requests/ID_DA_REQUISICAO/execute \
  -H "Authorization: Bearer SEU_TOKEN_SEC_OU_AUDIOVISUAL"
```

### Criar evento
```bash
curl -X POST http://localhost:3000/api/events \
  -H "Authorization: Bearer SEU_TOKEN_ADM_OU_PASTOR_OU_LIDER" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Culto Jovem",
    "location": "Templo Central",
    "start_datetime": "2024-07-15T19:00:00Z",
    "end_datetime": "2024-07-15T21:00:00Z",
    "description": "Culto especial para jovens",
    "expected_audience": 120
  }'
```

### Consultar histórico de um item do inventário
```bash
curl -X GET http://localhost:3000/api/inventory/ID_DO_ITEM/history \
  -H "Authorization: Bearer SEU_TOKEN"
```

### Consultar histórico de um evento
```bash
curl -X GET http://localhost:3000/api/events/ID_DO_EVENTO/history \
  -H "Authorization: Bearer SEU_TOKEN"
```

---

## Instruções Básicas

1. **Instale as dependências:**
   ```bash
   cd backend
   npm install
   ```
2. **Configure as variáveis de ambiente:**
   - Crie um arquivo `.env` com as chaves do Supabase e JWT.
3. **Inicie o servidor:**
   ```bash
   npm run dev
   ```
4. **Acesse os endpoints via curl, Postman ou frontend.**

---

## Observações
- O sistema está pronto para integração com frontend moderno (React, Vue, etc).
- Pronto para deploy em ambiente cloud.
- Pronto para evoluir com notificações, uploads reais, integrações externas e mais.

---

## Exemplo de .env

```
SUPABASE_URL=https://xxxx.supabase.co
SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
JWT_SECRET=sua_chave_secreta
PORT=3000
NODE_ENV=development
```

---

## Documentação da API (Swagger)

Você pode gerar uma documentação Swagger/OpenAPI para facilitar a integração e testes dos endpoints. Recomenda-se o uso do pacote [swagger-jsdoc](https://www.npmjs.com/package/swagger-jsdoc) e [swagger-ui-express](https://www.npmjs.com/package/swagger-ui-express).

**Passos básicos:**
1. Instale as dependências:
   ```bash
   npm install swagger-jsdoc swagger-ui-express
   ```
2. Adicione a configuração Swagger no `server.js`.
3. Acesse a documentação em `/api-docs` após iniciar o servidor.

Se quiser, posso gerar o arquivo Swagger para você!

---

## Contato / Suporte

- Dúvidas técnicas, sugestões ou suporte: **mauriciooliveira@exemplo.com**
- WhatsApp: **(xx) xxxxx-xxxx**
- Ou abra uma issue no repositório.

---

**Dúvidas ou sugestões? Fale com o desenvolvedor!**