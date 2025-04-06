import { DeepSeekConfig, DeepSeekError, DeepSeekMessage } from '../types/deepseek';

declare global {
  function mcp_deepseek_chat_completion(params: {
    message?: string;
    messages?: DeepSeekMessage[];
    model?: string;
    temperature?: number;
    max_tokens?: number;
  }): Promise<string>;
}

/**
 * Função principal para interagir com o modelo DeepSeek via MCP
 * @param question - A pergunta do usuário
 * @returns Promise com a resposta do modelo
 * @throws DeepSeekError em caso de falha na comunicação ou resposta inválida
 */
export async function askDeepSeek(question: string): Promise<string> {
  try {
    // Configuração padrão para a chamada
    const config: DeepSeekConfig = {
      messages: [
        {
          role: 'user',
          content: question
        }
      ],
      model: 'deepseek-chat',
      temperature: 0.7,
      max_tokens: 2000
    };

    // Chamada ao serviço MCP
    const response = await mcp_deepseek_chat_completion({
      message: question,
      model: config.model,
      temperature: config.temperature,
      max_tokens: config.max_tokens,
      messages: config.messages
    });

    // Verifica se a resposta é válida
    if (!response || typeof response !== 'string') {
      throw new DeepSeekError('Resposta inválida do modelo');
    }

    return response;
  } catch (error) {
    // Log do erro para debugging
    console.error('Erro ao comunicar com DeepSeek:', error);

    // Retorna um erro mais amigável para o usuário
    throw new DeepSeekError(
      'Não foi possível obter uma resposta. Por favor, tente novamente mais tarde.'
    );
  }
} 