/**
 * Tipo de remetente da mensagem
 */
export type MessageSender = 'user' | 'bot';

/**
 * Interface para uma mensagem do chat
 */
export interface ChatMessage {
  id: string;
  sender: MessageSender;
  text: string;
  timestamp: Date;
}

/**
 * Interface para a resposta da API
 */
export interface ApiResponse {
  answer?: string;
  error?: string;
} 