import { useState, useRef, useEffect } from 'react';
import { FiSend, FiTrash2 } from 'react-icons/fi';
import { ChatMessage } from './types/chat';

const API_URL = 'http://localhost:3000';

// SVG do logo JumboIA (elefante estilizado)
const JumboLogo = () => (
  <div className="flex items-center space-x-2">
    <svg 
      xmlns="http://www.w3.org/2000/svg" 
      viewBox="0 0 24 24" 
      fill="#7BC96F" 
      className="w-6 h-6"
    >
      <path d="M15.75 5h-7.5C7.56 5 7 5.56 7 6.25v3.542c0 .438.237.837.62 1.047l1.314.724c.326.179.516.529.516.898v3.789c0 .414.336.75.75.75h4.6c.414 0 .75-.336.75-.75v-3.79c0-.368.19-.718.516-.897l1.314-.724A1.25 1.25 0 0017 9.792V6.25c0-.69-.56-1.25-1.25-1.25zm-7.5-1.5h7.5C17.019 3.5 18.25 4.731 18.25 6.25v3.542c0 .877-.474 1.674-1.239 2.094l-1.314.724v3.64c0 1.242-1.008 2.25-2.25 2.25h-4.6c-1.242 0-2.25-1.008-2.25-2.25v-3.64l-1.314-.724A2.75 2.75 0 014 9.792V6.25C4 4.731 5.231 3.5 6.75 3.5h1.5zm9.75 8.25h1.5c.414 0 .75.336.75.75s-.336.75-.75.75h-1.5v-1.5zm-12 0H4.5c-.414 0-.75.336-.75.75s.336.75.75.75H6v-1.5z"/>
      <path d="M12 16.5c-.414 0-.75-.336-.75-.75v-6c0-.414.336-.75.75-.75s.75.336.75.75v6c0 .414-.336.75-.75.75z"/>
      <path d="M9 12.75c-.414 0-.75-.336-.75-.75v-3c0-.414.336-.75.75-.75s.75.336.75.75v3c0 .414-.336.75-.75.75zm6 0c-.414 0-.75-.336-.75-.75v-3c0-.414.336-.75.75-.75s.75.336.75.75v3c0 .414-.336.75-.75.75z"/>
    </svg>
    <span className="text-green-600 text-xl font-semibold">JumboIA</span>
  </div>
);

// Componente para o indicador de digitação
const TypingIndicator = () => (
  <div className="flex space-x-2 p-3">
    <div className="w-2 h-2 bg-jumbo/60 rounded-full animate-typing"></div>
    <div className="w-2 h-2 bg-jumbo/60 rounded-full animate-typing [animation-delay:0.2s]"></div>
    <div className="w-2 h-2 bg-jumbo/60 rounded-full animate-typing [animation-delay:0.4s]"></div>
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
    <div className="flex flex-col h-screen bg-white text-gray-800 font-sans">
      {/* Header com sombra sutil */}
      <header className="bg-white shadow-sm border-b border-gray-100 p-4">
        <div className="flex items-center justify-between max-w-4xl mx-auto">
          <JumboLogo />
          <button
            onClick={clearChat}
            className="p-2 text-gray-400 hover:text-jumbo transition-colors duration-300"
            title="Limpar conversa"
          >
            <FiTrash2 className="w-5 h-5" />
          </button>
        </div>
      </header>

      {/* Área de mensagens com fundo branco */}
      <main className="flex-1 overflow-y-auto p-4 space-y-4 bg-white">
        <div className="max-w-4xl mx-auto space-y-6">
          {messages.map((message) => (
            <div
              key={message.id}
              className={`flex ${message.sender === 'user' ? 'justify-end' : 'justify-start'} animate-message-in`}
            >
              <div
                className={`flex items-start space-x-2 max-w-[80%] ${
                  message.sender === 'user' ? 'flex-row-reverse space-x-reverse' : ''
                }`}
              >
                {message.sender === 'bot' && (
                  <div className="w-8 h-8 rounded-full bg-jumbo/10 flex items-center justify-center">
                    <JumboLogo />
                  </div>
                )}
                <div
                  className={`p-4 rounded-2xl ${
                    message.sender === 'user'
                      ? 'bg-gray-100 border border-gray-200'
                      : 'bg-white shadow-md border-l-4 border-l-jumbo'
                  }`}
                >
                  <p className="whitespace-pre-wrap">{message.text}</p>
                  <span className="text-xs text-gray-500 mt-2 block">
                    {new Date(message.timestamp).toLocaleTimeString()}
                  </span>
                </div>
              </div>
            </div>
          ))}
          
          {isLoading && (
            <div className="flex items-start space-x-2 animate-fade-in">
              <div className="w-8 h-8 rounded-full bg-jumbo/10 flex items-center justify-center">
                <JumboLogo />
              </div>
              <div className="bg-white shadow-md border-l-4 border-l-jumbo rounded-2xl">
                <div className="text-sm text-jumbo px-4 py-2">
                  JumboIA está digitando...
                </div>
                <TypingIndicator />
              </div>
            </div>
          )}

          {error && (
            <div className="bg-red-50 border-l-4 border-l-red-500 text-red-600 px-4 py-3 rounded-lg animate-fade-in">
              {error}
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>
      </main>

      {/* Input fixo com fundo branco */}
      <footer className="bg-white border-t border-gray-100 p-4 shadow-sm">
        <form onSubmit={handleSubmit} className="max-w-4xl mx-auto">
          <div className="flex gap-2">
            <input
              type="text"
              value={inputMessage}
              onChange={(e) => setInputMessage(e.target.value)}
              placeholder="Digite sua mensagem..."
              className="flex-1 p-3 rounded-xl bg-white border border-gray-200 focus:border-jumbo focus:ring-1 focus:ring-jumbo text-gray-800 placeholder-gray-400 transition-all duration-300 outline-none"
              disabled={isLoading}
            />
            <button
              type="submit"
              disabled={isLoading || !inputMessage.trim()}
              className="p-3 bg-jumbo hover:bg-jumbo-dark text-white rounded-xl transition-colors duration-300 disabled:opacity-50 disabled:cursor-not-allowed hover:shadow-md"
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