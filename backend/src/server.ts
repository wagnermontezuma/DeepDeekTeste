import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import { askDeepSeek } from './services/askDeepSeek';

const app = express();
const port = process.env.PORT || 3000;

// Middlewares
app.use(cors());
app.use(express.json());

// Rota principal para processar perguntas
app.post('/ask', async (req, res) => {
  try {
    const { question } = req.body;
    
    if (!question) {
      return res.status(400).json({ error: 'A pergunta é obrigatória' });
    }

    const answer = await askDeepSeek(question);
    res.json({ answer });
  } catch (error: any) {
    console.error('Erro ao processar pergunta:', error);

    if (error.message.includes('token limit')) {
      return res.status(400).json({ 
        error: 'A mensagem excedeu o limite de tokens permitido' 
      });
    }

    if (error.message.includes('authentication')) {
      return res.status(401).json({ 
        error: 'Erro de autenticação com a API' 
      });
    }

    res.status(500).json({ 
      error: 'Desculpe, ocorreu um erro ao processar sua mensagem. Por favor, tente novamente.'
    });
  }
});

// Inicia o servidor
app.listen(port, () => {
  console.log(`Servidor rodando em http://localhost:${port}`);
}); 