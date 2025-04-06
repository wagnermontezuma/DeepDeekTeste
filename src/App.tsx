import { useState, useRef, useEffect } from 'react';
import { FiSend, FiTrash2 } from 'react-icons/fi';
import { ChatMessage } from './types/chat';

const API_URL = 'http://localhost:3000';

// Componente para o indicador de digitação
const TypingIndicator = () => (
  <div className="flex space-x-2 p-3">
    <div className="w-2 h-2 bg-primary-light rounded-full animate-typing"></div>
    <div className="w-2 h-2 bg-primary-light rounded-full animate-typing [animation-delay:0.2s]"></div>
    <div className="w-2 h-2 bg-primary-light rounded-full animate-typing [animation-delay:0.4s]"></div>
  </div>
);

function App() {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [inputMessage, setInputMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Função para rolar para a última mensagem
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  // Rola para baixo quando novas mensagens são adicionadas
  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Função para enviar mensagem para a API
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputMessage.trim() || isLoading) return;

    const newMessage: ChatMessage = {
      id: Date.now().toString(),
      sender: 'user',
      text: inputMessage.trim(),
      timestamp: new Date()
    };

    setMessages(prev => [...prev, newMessage]);
    setInputMessage('');
    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch(`${API_URL}/ask`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ question: newMessage.text }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Erro ao processar sua mensagem');
      }

      const data = await response.json();
      
      const botMessage: ChatMessage = {
        id: (Date.now() + 1).toString(),
        sender: 'bot',
        text: data.answer,
        timestamp: new Date()
      };

      setMessages(prev => [...prev, botMessage]);
    } catch (err: any) {
      setError(err.message || 'Erro ao conectar com o servidor');
      console.error('Erro:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const clearChat = () => {
    setMessages([]);
    setError(null);
  };

  return (
    <div className="flex flex-col h-screen bg-dark text-gray-100">
      {/* Header com gradiente e efeito de vidro */}
      <header className="bg-dark-lighter backdrop-blur-sm border-b border-dark-lightest p-4 shadow-lg">
        <div className="flex items-center justify-between max-w-4xl mx-auto">
          <div className="flex items-center space-x-3">
            <span className="text-2xl">🐘</span>
            <h1 className="text-xl font-bold bg-gradient-to-r from-primary-light to-primary bg-clip-text text-transparent">
              JumboIA
            </h1>
          </div>
          <button
            onClick={clearChat}
            className="p-2 text-gray-400 hover:text-primary-light transition-colors"
            title="Limpar conversa"
          >
            <FiTrash2 className="w-5 h-5" />
          </button>
        </div>
      </header>

      {/* Área de mensagens com fundo escuro */}
      <main className="flex-1 overflow-y-auto p-4 space-y-4 bg-dark">
        <div className="max-w-4xl mx-auto space-y-6">
          {messages.map((message) => (
            <div
              key={message.id}
              className={`flex ${message.sender === 'user' ? 'justify-end' : 'justify-start'} animate-slide-in`}
            >
              <div
                className={`flex items-start space-x-2 max-w-[80%] ${
                  message.sender === 'user' ? 'flex-row-reverse space-x-reverse' : ''
                }`}
              >
                {message.sender === 'bot' && (
                  <div className="w-8 h-8 rounded-full bg-primary-dark flex items-center justify-center text-lg">
                    🐘
                  </div>
                )}
                <div
                  className={`p-4 rounded-2xl shadow-md ${
                    message.sender === 'user'
                      ? 'bg-primary text-white'
                      : 'bg-dark-lighter border border-dark-lightest'
                  }`}
                >
                  <p className="whitespace-pre-wrap">{message.text}</p>
                  <span className="text-xs opacity-75 mt-2 block">
                    {new Date(message.timestamp).toLocaleTimeString()}
                  </span>
                </div>
              </div>
            </div>
          ))}
          
          {isLoading && (
            <div className="flex items-start space-x-2 animate-fade-in">
              <div className="w-8 h-8 rounded-full bg-primary-dark flex items-center justify-center text-lg">
                🐘
              </div>
              <div className="bg-dark-lighter border border-dark-lightest rounded-2xl">
                <div className="text-sm text-primary-light px-4 py-2">
                  JumboIA está digitando...
                </div>
                <TypingIndicator />
              </div>
            </div>
          )}

          {error && (
            <div className="bg-red-900/50 border border-red-500/50 text-red-200 px-4 py-3 rounded-lg animate-fade-in">
              {error}
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>
      </main>

      {/* Input fixo com efeito de vidro */}
      <footer className="bg-dark-lighter backdrop-blur-sm border-t border-dark-lightest p-4 shadow-lg">
        <form onSubmit={handleSubmit} className="max-w-4xl mx-auto">
          <div className="flex gap-2">
            <input
              type="text"
              value={inputMessage}
              onChange={(e) => setInputMessage(e.target.value)}
              placeholder="Digite sua mensagem..."
              className="flex-1 p-3 rounded-xl bg-dark border border-dark-lightest focus:border-primary-light focus:ring-1 focus:ring-primary-light text-gray-100 placeholder-gray-500 transition-all outline-none"
              disabled={isLoading}
            />
            <button
              type="submit"
              disabled={isLoading || !inputMessage.trim()}
              className="p-3 bg-primary hover:bg-primary-dark text-white rounded-xl transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <FiSend className="w-5 h-5" />
            </button>
          </div>
        </form>
      </footer>
    </div>
  );
}

export default App; 