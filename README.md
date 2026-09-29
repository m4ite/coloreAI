# ColoreAI

ColoreAI é uma aplicação web para **coloração automática de fotos em preto e branco com inteligência artificial**. O usuário envia uma imagem P&B, acompanha o processamento e recebe a versão colorida, junto com métricas de qualidade e um mapa de confiança.

> **Status:** este repositório contém o **front-end** do projeto. No momento, os dados (usuários, sessões e resultados) são simulados localmente em `src/data.js` — ainda não há integração com um back-end ou modelo de IA real.

## Funcionalidades

- **Autenticação** — login, cadastro, recuperação e redefinição de senha, edição de perfil.
- **Upload de imagens** — arrastar e soltar ou selecionar arquivo (JPEG/PNG, até 10 MB), com validação de formato e tamanho.
- **Processamento** — barra de progresso com as etapas do processo.
- **Resultado** — comparação entre a imagem original e a colorida, mapa de confiança e métricas de qualidade (PSNR e SSIM).
- **Histórico** — lista das fotos coloridas anteriormente, com filtros e status de cada sessão.
- **Painel administrativo** — visão geral, gerenciamento de usuários e monitoramento.
- **Layout responsivo** — versão dedicada para dispositivos móveis (telas com menos de 768 px).

## Tecnologias

- [React 19](https://react.dev/)
- [Vite](https://vite.dev/)
- [Tailwind CSS 4](https://tailwindcss.com/)
- [Recharts](https://recharts.org/) (gráficos)
- [ESLint](https://eslint.org/)

## Estrutura do projeto

```
coloreAI/
└── coloreAI_front/
    ├── public/              # Arquivos estáticos (favicon, ícones)
    ├── src/
    │   ├── components/      # Componentes reutilizáveis (Sidebar, ImageCard, BottomNav...)
    │   ├── pages/           # Telas: Auth, Home, Result, History, Admin, Mobile
    │   ├── App.jsx          # Navegação entre telas e estado global
    │   ├── data.js          # Dados simulados (mock)
    │   ├── index.css        # Estilos globais e tema
    │   └── main.jsx         # Ponto de entrada da aplicação
    ├── index.html
    ├── package.json
    └── vite.config.js
```

## Como rodar o projeto

### Pré-requisitos

- [Node.js](https://nodejs.org/) **20.19+** ou **22.12+** (exigido pelo Vite 8)
- npm (já vem instalado com o Node.js)

Para conferir as versões instaladas:

```bash
node -v
npm -v
```

### Passo a passo

1. **Clone o repositório**

   ```bash
   git clone https://github.com/m4ite/coloreAI.git
   cd coloreAI
   ```

2. **Entre na pasta do front-end**

   ```bash
   cd coloreAI_front
   ```

3. **Instale as dependências**

   ```bash
   npm install
   ```

4. **Inicie o servidor de desenvolvimento**

   ```bash
   npm run dev
   ```

5. **Acesse no navegador**

   Abra o endereço exibido no terminal, normalmente [http://localhost:5173](http://localhost:5173).

### Acesso de demonstração

Como a autenticação é simulada, use uma das contas de demonstração abaixo:

| Perfil        | E-mail              | Senha     | Acesso                                   |
| ------------- | ------------------- | --------- | ---------------------------------------- |
| Usuário comum | `user@colorize.ai`  | `demo123` | Upload, resultados e histórico           |
| Administrador | `admin@colorize.ai` | `demo123` | Tudo acima + painel administrativo       |

## Scripts disponíveis

Execute os comandos dentro da pasta `coloreAI_front`:

| Comando           | Descrição                                                   |
| ----------------- | ----------------------------------------------------------- |
| `npm run dev`     | Inicia o servidor de desenvolvimento com recarga automática |
| `npm run build`   | Gera a versão de produção na pasta `dist/`                  |
| `npm run preview` | Serve localmente a versão gerada pelo `build`               |
| `npm run lint`    | Analisa o código com o ESLint                               |
