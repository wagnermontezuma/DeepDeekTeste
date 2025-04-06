# JumboIA - Assistente de IA

Interface de chat moderna e responsiva para interação com modelos de linguagem através da API DeepSeek.

## 🚀 Tecnologias

- **Frontend:**
  - React 18 com TypeScript
  - TailwindCSS para estilização
  - Vite como bundler
  - React Icons

- **Backend:**
  - Node.js com Express
  - TypeScript
  - Axios para requisições HTTP
  - CORS habilitado

## 🛠️ Instalação

1. Clone o repositório:
```bash
git clone https://github.com/seu-usuario/jumboia.git
cd jumboia
```

2. Instale as dependências do frontend:
```bash
npm install
```

3. Instale as dependências do backend:
```bash
cd backend
npm install
```

4. Configure as variáveis de ambiente:
- Crie um arquivo `.env` na raiz do diretório `backend`
- Adicione sua chave API:
```env
OPENROUTER_API_KEY=sua-chave-aqui
```

## 🎯 Uso

1. Inicie o backend:
```bash
cd backend
npm run dev
```

2. Em outro terminal, inicie o frontend:
```bash
npm run dev
```

3. Acesse a aplicação em `http://localhost:5173`

## 🌟 Funcionalidades

- Interface moderna e responsiva no estilo dark mode
- Indicador de digitação animado
- Histórico de mensagens persistente
- Botão para limpar conversa
- Suporte a markdown nas respostas
- Design adaptativo para mobile

## 📝 Licença

Este projeto está sob a licença MIT. Veja o arquivo [LICENSE](LICENSE) para mais detalhes.

## 🤝 Contribuindo

Contribuições são sempre bem-vindas! Por favor, leia o [guia de contribuição](CONTRIBUTING.md) primeiro. 