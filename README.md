# ColoreAI

ColoreAI é uma aplicação web para **coloração automática de fotos em preto e branco com inteligência artificial**. O usuário envia uma imagem P&B, acompanha o processamento e recebe a versão colorida, junto com métricas de qualidade e um mapa de confiança.

> **Status:** a **autenticação** (login, cadastro, recuperação, redefinição e troca de senha) já usa o back-end real, com banco PostgreSQL e envio de e-mail. As demais telas (upload, resultado, histórico e painel administrativo) ainda usam dados simulados em `coloreAI_front/src/data.js` — ainda não há integração com um modelo de IA real.

## Funcionalidades

### Front-end

- **Autenticação integrada à API** — login, cadastro, recuperação de senha por e-mail, redefinição de senha via link (`?token=...`) e troca de senha na tela de perfil.
- **Controle de acesso por perfil** — usuários com papel `admin` são direcionados ao painel administrativo.
- **Upload de imagens** — arrastar e soltar ou selecionar arquivo (JPEG/PNG, até 10 MB), com validação de formato e tamanho.
- **Processamento** — barra de progresso com as etapas do processo.
- **Resultado** — comparação entre a imagem original e a colorida, mapa de confiança e métricas de qualidade (PSNR e SSIM).
- **Histórico** — lista das fotos coloridas anteriormente, com filtros e status de cada sessão.
- **Painel administrativo** — visão geral, gerenciamento de usuários e monitoramento.
- **Identidade visual** — logo e favicon da ColoreAI e tela de autenticação com painel ilustrativo ao lado do formulário.
- **Layout responsivo** — versão dedicada para dispositivos móveis (telas com menos de 768 px).

### Back-end

- **API REST** em Node.js + Express, conectada a um banco **PostgreSQL** (ex.: Supabase).
- **Senhas com hash** usando bcrypt (mínimo de 8 caracteres).
- **Autenticação com JWT** — token válido por 1 dia, enviado no cabeçalho `Authorization: Bearer <token>`.
- **Recuperação de senha por e-mail** (Nodemailer/SMTP, ex.: Gmail) — link de uso único, válido por 1 hora; o token é armazenado apenas como hash SHA-256.
- **Troca de senha** autenticada, exigindo a senha atual.
- **Contas desativadas** (`active = false`) não conseguem entrar nem recuperar a senha.

## Tecnologias

| Front-end                                     | Back-end                                                     |
| --------------------------------------------- | ------------------------------------------------------------ |
| [React 19](https://react.dev/)                | [Node.js](https://nodejs.org/) + [Express 5](https://expressjs.com/) |
| [Vite](https://vite.dev/)                     | [PostgreSQL](https://www.postgresql.org/) (`pg`)             |
| [Tailwind CSS 4](https://tailwindcss.com/)    | [bcrypt](https://www.npmjs.com/package/bcrypt)               |
| [Recharts](https://recharts.org/) (gráficos)  | [jsonwebtoken](https://www.npmjs.com/package/jsonwebtoken) (JWT) |
| [ESLint](https://eslint.org/)                 | [Nodemailer](https://nodemailer.com/) (e-mail)               |
|                                               | [dotenv](https://www.npmjs.com/package/dotenv), [cors](https://www.npmjs.com/package/cors), [nodemon](https://nodemon.io/) |

## Estrutura do projeto

```
coloreAI/
├── coloreAI_back/
│   ├── src/
│   │   ├── config/
│   │   │   └── database.js        # Conexão com o PostgreSQL
│   │   ├── controllers/
│   │   │   └── authController.js  # Regras de cadastro, login e senhas
│   │   ├── middlewares/
│   │   │   └── authMiddleware.js  # Validação do token JWT
│   │   ├── routes/
│   │   │   └── authRoutes.js      # Rotas /api/auth/*
│   │   └── server.js              # Ponto de entrada da API (porta 3000)
│   ├── .env.example               # Modelo das variáveis de ambiente
│   └── package.json
└── coloreAI_front/
    ├── public/                    # Arquivos estáticos (logo, favicon, ícones)
    ├── src/
    │   ├── components/            # Componentes reutilizáveis (Sidebar, ImageCard, BottomNav...)
    │   ├── pages/                 # Telas: Auth, Home, Result, History, Admin, Mobile
    │   ├── App.jsx                # Navegação entre telas e estado global
    │   ├── data.js                # Dados simulados (mock)
    │   ├── index.css              # Estilos globais e tema
    │   └── main.jsx               # Ponto de entrada da aplicação
    ├── index.html
    ├── package.json
    └── vite.config.js
```

## Como rodar o projeto

O projeto tem duas partes que rodam ao mesmo tempo, cada uma em um terminal:

| Parte     | Pasta            | Endereço padrão                                |
| --------- | ---------------- | ---------------------------------------------- |
| Back-end  | `coloreAI_back`  | [http://localhost:3000](http://localhost:3000) |
| Front-end | `coloreAI_front` | [http://localhost:5173](http://localhost:5173) |

### Pré-requisitos

- [Node.js](https://nodejs.org/) **20.19+** ou **22.12+** (exigido pelo Vite 8)
- npm (já vem instalado com o Node.js)
- Um banco **PostgreSQL** acessível (local ou na nuvem, como o [Supabase](https://supabase.com/))
- Uma conta de e-mail com acesso SMTP para a recuperação de senha (no Gmail, use uma [senha de app](https://myaccount.google.com/apppasswords))

Para conferir as versões instaladas:

```bash
node -v
npm -v
```

### 1. Clone o repositório

```bash
git clone https://github.com/m4ite/coloreAI.git
cd coloreAI
```

### 2. Back-end

1. **Entre na pasta do back-end**

   ```bash
   cd coloreAI_back
   ```

2. **Instale as dependências**

   ```bash
   npm install
   ```

3. **Crie o arquivo `.env`** a partir do modelo

   ```bash
   cp .env.example .env
   ```

   No Windows (PowerShell), use `Copy-Item .env.example .env`.

4. **Preencha as variáveis do `.env`**

   | Variável       | Descrição                                                                 |
   | -------------- | ------------------------------------------------------------------------- |
   | `DATABASE_URL` | String de conexão do PostgreSQL (a conexão usa SSL)                       |
   | `JWT_SECRET`   | Chave secreta para assinar os tokens JWT                                  |
   | `FRONTEND_URL` | URL do front-end, usada no link de recuperação de senha                   |
   | `SMTP_HOST`    | Servidor SMTP (ex.: `smtp.gmail.com`)                                     |
   | `SMTP_PORT`    | Porta SMTP (ex.: `587`)                                                   |
   | `SMTP_SECURE`  | `true` para a porta 465, `false` para a 587                               |
   | `SMTP_USER`    | Usuário/e-mail da conta SMTP                                              |
   | `SMTP_PASS`    | Senha (ou senha de app) da conta SMTP                                     |
   | `MAIL_FROM`    | Remetente dos e-mails (se vazio, usa o `SMTP_USER`)                       |

   Para gerar um `JWT_SECRET` seguro:

   ```bash
   node -e "console.log(require('crypto').randomBytes(48).toString('base64url'))"
   ```

   > O arquivo `.env` contém senhas e **não deve ser enviado ao Git** (ele já está no `.gitignore`).

5. **Crie as tabelas no banco**

   Execute o SQL abaixo no seu PostgreSQL (no Supabase, pelo **SQL Editor**):

   ```sql
   CREATE TABLE IF NOT EXISTS users (
     id            SERIAL PRIMARY KEY,
     name          VARCHAR(120) NOT NULL,
     email         VARCHAR(255) NOT NULL UNIQUE,
     password_hash TEXT         NOT NULL,
     role          VARCHAR(20)  NOT NULL DEFAULT 'user',
     active        BOOLEAN      NOT NULL DEFAULT TRUE,
     created_at    TIMESTAMPTZ  NOT NULL DEFAULT NOW()
   );

   CREATE TABLE IF NOT EXISTS password_reset_tokens (
     id         SERIAL PRIMARY KEY,
     user_id    INTEGER     NOT NULL REFERENCES users(id) ON DELETE CASCADE,
     token_hash TEXT        NOT NULL,
     expires_at TIMESTAMPTZ NOT NULL,
     created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
   );
   ```

   Para tornar um usuário administrador:

   ```sql
   UPDATE users SET role = 'admin' WHERE email = 'admin@colorize.ai';
   ```

6. **Inicie o servidor**

   ```bash
   npm run dev     # desenvolvimento, reinicia ao salvar (nodemon)
   # ou
   npm start       # execução simples com Node
   ```

   O terminal deve exibir `Servidor rodando em http://localhost:3000`.

7. **Teste a API**

   - [http://localhost:3000](http://localhost:3000) — confirma que o servidor está no ar.
   - [http://localhost:3000/teste-banco](http://localhost:3000/teste-banco) — confirma a conexão com o banco.

### 3. Front-end

Em **outro terminal**, a partir da raiz do repositório:

1. **Entre na pasta do front-end**

   ```bash
   cd coloreAI_front
   ```

2. **Instale as dependências**

   ```bash
   npm install
   ```

3. **Inicie o servidor de desenvolvimento**

   ```bash
   npm run dev
   ```

4. **Acesse no navegador**

   Abra o endereço exibido no terminal, normalmente [http://localhost:5173](http://localhost:5173).

   > O front-end chama a API em `http://localhost:3000` (definido em `src/pages/Auth.jsx`). Mantenha o back-end rodando para conseguir entrar.

### Acesso de demonstração

Use uma das contas de demonstração abaixo (elas precisam existir na tabela `users` do banco configurado):

| Perfil        | E-mail              | Senha      | Acesso                             |
| ------------- | ------------------- | ---------- | ---------------------------------- |
| Usuário comum | `user@colorize.ai`  | `demo1234` | Upload, resultados e histórico     |
| Administrador | `admin@colorize.ai` | `demo1234` | Tudo acima + painel administrativo |

Também é possível criar uma nova conta pela tela de cadastro.

## Rotas da API

Todas as rotas de autenticação ficam em `/api/auth`. As marcadas com 🔒 exigem o cabeçalho `Authorization: Bearer <token>`.

| Método | Rota                           | Corpo (JSON)                         | Descrição                                   |
| ------ | ------------------------------ | ------------------------------------ | ------------------------------------------- |
| POST   | `/api/auth/register`           | `name`, `email`, `password`          | Cria um usuário                             |
| POST   | `/api/auth/login`              | `email`, `password`                  | Retorna o token JWT e os dados do usuário   |
| GET    | `/api/auth/me` 🔒              | —                                    | Retorna os dados do usuário logado          |
| POST   | `/api/auth/forgot-password`    | `email`                              | Envia o link de recuperação por e-mail      |
| POST   | `/api/auth/reset-password`     | `token`, `password`                  | Define uma nova senha a partir do link      |
| POST   | `/api/auth/change-password` 🔒 | `currentPassword`, `newPassword`     | Altera a senha do usuário logado            |

## Scripts disponíveis

### Back-end (`coloreAI_back`)

| Comando       | Descrição                                               |
| ------------- | ------------------------------------------------------- |
| `npm run dev` | Inicia a API com nodemon (reinicia ao salvar arquivos)  |
| `npm start`   | Inicia a API com Node                                   |

### Front-end (`coloreAI_front`)

| Comando           | Descrição                                                   |
| ----------------- | ----------------------------------------------------------- |
| `npm run dev`     | Inicia o servidor de desenvolvimento com recarga automática |
| `npm run build`   | Gera a versão de produção na pasta `dist/`                  |
| `npm run preview` | Serve localmente a versão gerada pelo `build`               |
| `npm run lint`    | Analisa o código com o ESLint                               |
