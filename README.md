# Dashboard LimitClean

Um sistema completo de dashboard com NestJS, PostgreSQL e Redis, desenvolvido seguindo as especificações fornecidas.

## 🚀 Características

- **Backend**: NestJS + TypeScript
- **Banco de Dados**: PostgreSQL com Prisma ORM
- **Cache**: Redis para cache e gerenciamento de sessões
- **Autenticação**: JWT (Access + Refresh tokens) com suporte a 2FA (TOTP)
- **Frontend**: HTML5, CSS3, JavaScript vanilla com tema dark neon
- **Segurança**: Helmet, CORS, Rate Limiting, RBAC
- **Infraestrutura**: Docker Compose para desenvolvimento

## 🛠️ Tecnologias Utilizadas

### Backend
- NestJS (Node.js + TypeScript)
- Prisma ORM
- PostgreSQL
- Redis
- JWT + Passport
- Argon2 (hash de senhas)
- Winston (logging)
- Helmet (segurança HTTP)

### Frontend
- HTML5 + CSS3 + JavaScript (sem frameworks)
- Chart.js para gráficos
- Tema dark neon responsivo

### DevOps
- Docker + Docker Compose
- Scripts de desenvolvimento

## 📋 Pré-requisitos

- Docker e Docker Compose
- Node.js 18+ (para desenvolvimento local)
- NPM ou Yarn

## 🚀 Instalação e Configuração

1. **Clone o repositório**
   ```bash
   git clone <repository-url>
   cd dashboard-limitclean
   ```

2. **Configure as variáveis de ambiente**
   ```bash
   cp .env.example .env
   ```
   Edite o arquivo `.env` com suas configurações específicas.

3. **Inicie os serviços com Docker**
   ```bash
   docker compose up -d --build
   ```

4. **Execute as migrações do banco**
   ```bash
   npm run migrate
   ```

5. **Execute o seed para criar o usuário admin**
   ```bash
   npm run seed
   ```

6. **Acesse a aplicação**
   - Aplicação: http://localhost:3000
   - Login Admin: `kalielselhorst@example.com`
   - Senha Admin: `Kaskolk14`

## 📖 Uso

### Login
- Acesse `/login.html`
- Use as credenciais do administrador criadas no seed
- Se habilitado, será solicitado código 2FA

### Dashboard
- Visualização de KPIs e métricas
- Gráficos interativos com Chart.js
- Lista de clientes recentes
- **Clique no nome do cliente** para ver detalhes completos

### Gestão de Usuários
- Criação e edição de usuários
- Controle de papéis (ADMIN, REPRESENTANTE, VENDEDOR, USER)
- Gerenciamento de sessões

## 🔒 Segurança

### Autenticação
- JWT com access token (15min) e refresh token (30 dias)
- Rotação automática de refresh tokens
- 2FA com TOTP (Google Authenticator compatível)
- Hash de senhas com Argon2

### Autorização
- RBAC (Role-Based Access Control)
- Guards personalizados para proteção de rotas
- Validação de ownership de recursos

### Proteções HTTP
- Helmet para headers de segurança
- CORS configurável
- Rate limiting por IP
- Validação rigorosa de entrada (DTOs)

## 📊 Estrutura do Banco

### Principais Entidades
- **users**: Usuários do sistema com diferentes papéis
- **clients**: Clientes com status e evolução automática
- **contracts**: Contratos vinculados a clientes e usuários
- **tickets**: Sistema de suporte
- **audit_logs**: Log de auditoria de todas as ações

### Evolução Automática de Status
- Clientes em `restricao` → `finalizado` após 30 dias
- Clientes `finalizado` → `reprotocolo` após 6 meses
- Jobs automáticos com log de auditoria

## 🎨 Interface

### Tema Dark Neon
- Cores principais: azul neon (#00d4ff) e rosa (#ff3366)
- Fundo escuro com gradientes
- Animações e efeitos de hover
- Totalmente responsivo

### Componentes
- Cards com efeitos de glow
- Tabelas com hover effects
- Modais para detalhes
- Sistema de tabs
- Gráficos interativos

## 🔧 Desenvolvimento

### Scripts Disponíveis
```bash
npm run dev          # Desenvolvimento com hot reload
npm run build        # Build de produção
npm run start        # Iniciar em produção
npm run migrate      # Executar migrações
npm run seed         # Executar seeds
npm run lint         # Linting
npm run test         # Testes
```

### Estrutura de Diretórios
```
src/
├── config/          # Configurações
├── common/          # Guards, decorators, filters
├── infra/           # Prisma, Redis, Crypto, Storage
├── modules/         # Módulos da aplicação
├── jobs/            # Jobs e schedulers
└── public/          # Frontend estático
```

## 📈 Funcionalidades Implementadas

- [x] Autenticação JWT com refresh token
- [x] Sistema de RBAC
- [x] Dashboard com KPIs e gráficos
- [x] Gestão de usuários
- [x] Sistema de clientes básico
- [x] Interface responsiva com tema dark neon
- [x] Modal de detalhes do cliente
- [x] Estrutura completa do banco de dados
- [x] Docker Compose configurado
- [x] Logging estruturado
- [x] Seed de dados inicial

## 🚧 Próximas Implementações

- [ ] Sistema 2FA completo (setup, QR codes, backup codes)
- [ ] Upload de arquivos com criptografia
- [ ] Geração de PDFs para contratos
- [ ] Sistema de tickets completo
- [ ] Página de configurações do usuário (abas)
- [ ] Jobs de evolução de status (30d/6m)
- [ ] Exportação CSV/XLSX/PDF
- [ ] Sistema de notificações
- [ ] Auditoria completa
- [ ] Testes automatizados

## 📝 Licença

Este projeto está sob a licença MIT. Veja o arquivo [LICENSE](LICENSE) para mais detalhes.

## 👥 Contribuição

1. Fork o projeto
2. Crie uma branch para sua feature (`git checkout -b feature/AmazingFeature`)
3. Commit suas mudanças (`git commit -m 'Add some AmazingFeature'`)
4. Push para a branch (`git push origin feature/AmazingFeature`)
5. Abra um Pull Request

## 📞 Suporte

Para suporte, entre em contato através do e-mail ou abra uma issue no GitHub.