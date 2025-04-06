/**
 * Interface para a mensagem enviada à OpenRouter
 */
export interface Message {
  role: 'system' | 'user' | 'assistant';
  content: string;
}

/**
 * Interface para a requisição à OpenRouter
 */
export interface OpenRouterRequest {
  model: string;
  messages: Message[];
  temperature?: number;
  max_tokens?: number;
}

/**
 * Interface para a resposta da OpenRouter
 */
export interface OpenRouterResponse {
  choices: Array<{
    message: {
      content: string;
    };
  }>;
}

/**
 * Interface para o corpo da requisição à nossa API
 */
export interface AskRequest {
  question: string;
}

/**
 * Interface para a resposta da nossa API
 */
export interface AskResponse {
  answer: string;
} 