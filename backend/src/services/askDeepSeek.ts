import axios from 'axios';

interface Message {
  role: string;
  content: string;
}

interface ChatResponse {
  choices: Array<{
    message: {
      content: string;
    };
  }>;
}

/**
 * Função principal para interagir com o modelo DeepSeek via OpenRouter
 * @param question - A pergunta do usuário
 * @returns Promise com a resposta do modelo
 * @throws Error em caso de falha na comunicação ou resposta inválida
 */
export async function askDeepSeek(question: string): Promise<string> {
  try {
    console.log('Iniciando requisição para a OpenRouter...');
    
    const data = {
      model: 'deepseek/deepseek-chat-v3-0324:free',
      messages: [
        {
          role: 'user',
          content: question
        }
      ],
      temperature: 0.7,
      max_tokens: 500
    };

    console.log('Dados da requisição:', JSON.stringify(data, null, 2));

    const response = await axios.post(
      'https://openrouter.ai/api/v1/chat/completions',
      data,
      {
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${process.env.OPENROUTER_API_KEY}`,
          'HTTP-Referer': 'http://localhost:3000',
          'X-Title': 'DeepSeek Assistant API'
        }
      }
    );

    console.log('Resposta recebida:', JSON.stringify(response.data, null, 2));

    if (!response.data?.choices?.[0]?.message?.content) {
      console.error('Resposta inválida:', response.data);
      throw new Error('Resposta inválida do modelo');
    }

    return response.data.choices[0].message.content;

  } catch (error: any) {
    console.error('Erro ao comunicar com OpenRouter:', error);

    if (error.response?.data?.error) {
      console.log('Detalhes do erro:', JSON.stringify(error.response.data, null, 2));
      const errorMessage = error.response.data.error.message;
      
      if (errorMessage.includes('credits') || errorMessage.includes('max_tokens')) {
        throw new Error('Limite de tokens excedido. Por favor, tente uma mensagem mais curta.');
      }
      
      if (errorMessage.includes('JWT') || errorMessage.includes('token-invalid')) {
        throw new Error('Erro de autenticação. Por favor, verifique a chave da API.');
      }

      if (errorMessage.includes('model')) {
        throw new Error('Modelo indisponível no momento. Por favor, tente novamente mais tarde.');
      }

      throw new Error(errorMessage);
    }

    throw new Error('Não foi possível obter uma resposta. Por favor, tente novamente mais tarde.');
  }
}

/**
 * Função para humanizar um texto usando o modelo DeepSeek
 * @param textToHumanize - O texto original a ser humanizado
 * @returns Promise com o texto humanizado
 * @throws Error em caso de falha na comunicação ou resposta inválida
 */
export async function humanizeTextWithDeepSeek(textToHumanize: string): Promise<string> {
  try {
    console.log('Iniciando requisição para HUMANIZAR texto via OpenRouter...');
    
    const systemPrompt = "Você é um assistente especialista em reescrever textos para soarem mais naturais e humanos. Seu objetivo é tornar a comunicação menos formal e mais calorosa, mantendo o significado original. Evite jargões excessivos e prefira uma linguagem coloquial e amigável.";
    
    const data = {
      model: 'deepseek/deepseek-chat-v3-0324:free', // Podemos usar o mesmo modelo
      messages: [
        {
          role: 'system',
          content: systemPrompt
        },
        {
          role: 'user',
          content: `Por favor, humanize o seguinte texto:\n\n"${textToHumanize}"`
        }
      ],
      temperature: 0.75, // Um pouco mais de criatividade pode ser bom aqui
      max_tokens: Math.max(50, textToHumanize.length + 100) // Garante espaço suficiente
    };

    console.log('Dados da requisição (Humanize):', JSON.stringify(data, null, 2));

    const response = await axios.post<ChatResponse>(
      'https://openrouter.ai/api/v1/chat/completions',
      data,
      {
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${process.env.OPENROUTER_API_KEY}`,
          'HTTP-Referer': 'http://localhost:3000', // Ou a URL da sua aplicação implantada
          'X-Title': 'JumboIA Humanizer' // Título específico
        }
      }
    );

    console.log('Resposta recebida (Humanize):', JSON.stringify(response.data, null, 2));

    const humanizedText = response.data?.choices?.[0]?.message?.content;

    if (!humanizedText) {
      console.error('Resposta inválida (Humanize):', response.data);
      throw new Error('Resposta inválida do modelo ao humanizar');
    }

    // Limpeza básica (remover aspas extras que o modelo pode adicionar)
    return humanizedText.trim().replace(/^"|"$/g, '');

  } catch (error: any) {
    // Reutiliza o tratamento de erro, mas com contexto diferente
    console.error('Erro ao comunicar com OpenRouter (Humanize):', error);
    if (error.response?.data?.error) {
      console.log('Detalhes do erro (Humanize):', JSON.stringify(error.response.data, null, 2));
      const errorMessage = error.response.data.error.message || 'Erro desconhecido da API';
       // Adapta as mensagens de erro se necessário
      if (errorMessage.includes('credits') || errorMessage.includes('max_tokens')) {
        throw new Error('Erro ao humanizar: Limite de tokens excedido.');
      }
      if (errorMessage.includes('JWT') || errorMessage.includes('token-invalid') || errorMessage.includes('No auth credentials')) {
        throw new Error('Erro de autenticação ao humanizar. Verifique a chave.');
      }
       throw new Error(`Erro da API ao humanizar: ${errorMessage}`);
    }
    throw new Error('Não foi possível humanizar o texto. Tente novamente.');
  }
} 