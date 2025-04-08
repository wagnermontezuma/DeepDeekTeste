import dotenv from 'dotenv';
import path from 'path';
// Removido fileURLToPath pois usaremos process.cwd()
// import { fileURLToPath } from 'url'; 
import express from 'express';
import cors from 'cors';
import { askDeepSeek, humanizeTextWithDeepSeek } from './services/askDeepSeek';

// Configuração explícita do dotenv assumindo execução da raiz
// process.cwd() retorna o diretório de onde o script npm foi iniciado
dotenv.config({ path: path.resolve(process.cwd(), 'backend', '.env') });

const app = express();
// Lê a porta do .env ou usa 3000 como padrão
const port = process.env.PORT || 3000; 

// Middlewares
app.use(cors());
app.use(express.json());

// Rota principal para processar perguntas
app.post('/ask', async (req, res) => {
  try {
    const { question } = req.body;
    
    // Verifica se a chave da API foi carregada
    if (!process.env.OPENROUTER_API_KEY) {
      console.error('Erro Crítico: Variável de ambiente OPENROUTER_API_KEY não encontrada!');
      return res.status(500).json({
        error: 'Erro interno do servidor: Chave da API não configurada.'
      });
    }

    if (!question) {
      return res.status(400).json({ error: 'A pergunta é obrigatória' });
    }

    const answer = await askDeepSeek(question);
    res.json({ answer });
  } catch (error: any) {
    // Log aprimorado
    console.error(`Erro ao processar pergunta: ${error.message}`, error.stack);
    console.error('Detalhes adicionais (se houver):', error.response?.data);

    // Verifica explicitamente por erros de autenticação
    if (error.message.includes('autenticação') || error.message.includes('JWT') || error.message.includes('token-invalid') || error.message.includes('No auth credentials')) {
      return res.status(401).json({ 
        error: 'Erro de autenticação com a API. Verifique a chave em backend/.env.' 
      });
    }

    if (error.message.includes('token limit') || error.message.includes('Limite de tokens')) {
      return res.status(400).json({ 
        error: 'A mensagem excedeu o limite de tokens permitido.' 
      });
    }

    // Retorna o erro genérico para outros casos
    res.status(500).json({ 
      error: 'Desculpe, ocorreu um erro ao processar sua mensagem. Por favor, tente novamente.'
    });
  }
});

// Nova rota para humanizar texto
app.post('/humanize', async (req, res) => {
  try {
    const { text } = req.body;

    if (!text) {
      return res.status(400).json({ error: 'O texto é obrigatório para humanização.' });
    }

    // Verifica a chave da API (boa prática reutilizar a verificação)
    if (!process.env.OPENROUTER_API_KEY) {
      console.error('Erro Crítico (Humanize): Variável de ambiente OPENROUTER_API_KEY não encontrada!');
      return res.status(500).json({
        error: 'Erro interno do servidor: Chave da API não configurada.'
      });
    }

    console.log(`Recebida requisição para humanizar: "${text.substring(0, 50)}..."`);
    const humanizedText = await humanizeTextWithDeepSeek(text);
    console.log(`Texto humanizado: "${humanizedText.substring(0, 50)}..."`);
    
    res.json({ humanizedText });

  } catch (error: any) {
    // Log e tratamento de erro específicos para a humanização
    console.error(`Erro ao humanizar texto: ${error.message}`, error.stack);
    console.error('Detalhes adicionais (Humanize):', error.response?.data);
    
    // Retorna mensagens de erro mais específicas baseadas no erro lançado pela função
    if (error.message.includes('autenticação')) {
        return res.status(401).json({ error: error.message });
    }
    if (error.message.includes('Limite de tokens')) {
        return res.status(400).json({ error: error.message });
    }
    if (error.message.includes('API ao humanizar')) {
         return res.status(502).json({ error: error.message }); // Bad Gateway se a API externa falhou
    }
    
    // Erro genérico
    res.status(500).json({ 
      error: 'Desculpe, ocorreu um erro ao tentar humanizar o texto. Por favor, tente novamente.'
    });
  }
});

// Inicia o servidor
app.listen(port, () => {
  console.log(`Servidor rodando em http://localhost:${port}`);
  if (!process.env.OPENROUTER_API_KEY) {
    console.warn('Atenção: Variável de ambiente OPENROUTER_API_KEY não carregada!');
  }
}); 