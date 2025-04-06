/**
 * Interface para a mensagem enviada ao DeepSeek
 */
export interface DeepSeekMessage {
  role: 'system' | 'user' | 'assistant';
  content: string;
}

/**
 * Interface para os parâmetros de configuração da chamada ao DeepSeek
 */
export interface DeepSeekConfig {
  messages: DeepSeekMessage[];
  model?: string;
  temperature?: number;
  max_tokens?: number;
}

/**
 * Interface para erros personalizados do DeepSeek
 */
export class DeepSeekError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'DeepSeekError';
  }
} 