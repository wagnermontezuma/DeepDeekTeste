import { useState, useRef, useEffect } from 'react';
import { FiSend, FiTrash2, FiLoader } from 'react-icons/fi';
import { LuBrain } from 'react-icons/lu';
import { ChatMessage, ApiResponse } from './types/chat';

const API_URL = 'http://localhost:3000';
const MAX_INPUT_LENGTH = 5000; // Define o limite de caracteres

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
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [humanizingMessageId, setHumanizingMessageId] = useState<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Função para rolar para a última mensagem
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  // Rola para baixo quando novas mensagens são adicionadas
  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleInputChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    // Verifica o limite antes de atualizar o estado
    if (event.target.value.length <= MAX_INPUT_LENGTH) {
      setInput(event.target.value);
    }
  };

  const sendMessage = async (event?: React.FormEvent<HTMLFormElement>) => {
    if (event) {
      event.preventDefault();
    }
    
    // Verifica o limite e se está vazio/loading
    if (!input.trim() || isLoading || input.length > MAX_INPUT_LENGTH) return; 

    const newMessage: ChatMessage = {
      id: Date.now().toString(),
      role: 'user',
      content: input.trim(),
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

    setMessages(prev => [...prev, newMessage]);
    setInput('');
    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch(`${API_URL}/ask`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ question: newMessage.content }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Erro ao processar sua mensagem');
      }

      const data = await response.json();
      
      const botMessage: ChatMessage = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: data.answer,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
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

  const handleHumanize = async (messageId: string, textToHumanize: string) => {
    if (humanizingMessageId) return;

    setHumanizingMessageId(messageId);
    setError(null);

    try {
      const response = await fetch(`${API_URL}/humanize`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ text: textToHumanize }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Falha ao humanizar o texto.');
      }

      setMessages((prevMessages) =>
        prevMessages.map((msg) =>
          msg.id === messageId ? { ...msg, content: data.humanizedText } : msg
        )
      );

    } catch (err: any) {
      console.error('Erro ao humanizar:', err);
      setError(err.message || 'Erro desconhecido ao humanizar.');
    } finally {
      setHumanizingMessageId(null);
    }
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
          {messages.map((msg) => (
            <div
              key={msg.id}
              className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'} animate-message-in`}
            >
              <div
                className={`relative group flex items-start space-x-2 max-w-[80%] ${
                  msg.role === 'user' ? 'flex-row-reverse space-x-reverse' : ''
                }`}
              >
                {msg.role === 'assistant' && (
                  <div className="w-8 h-8 rounded-full bg-jumbo/10 flex items-center justify-center flex-shrink-0">
                    <JumboLogo />
                  </div>
                )}
                <div
                  className={`p-4 rounded-2xl ${
                    msg.role === 'user'
                      ? 'bg-gray-100 border border-gray-200'
                      : 'bg-white shadow-md border-l-4 border-l-jumbo'
                  }`}
                >
                  <p className="whitespace-pre-wrap">{msg.content}</p>
                  <span className="text-xs text-gray-500 mt-2 block">
                    {msg.timestamp}
                  </span>
                  {msg.role === 'assistant' && (
                    <button
                      onClick={() => handleHumanize(msg.id, msg.content)}
                      disabled={!!humanizingMessageId}
                      className={`absolute -top-2 -right-2 p-1 bg-white rounded-full shadow-md text-gray-500 hover:text-jumbo transition-opacity duration-300 opacity-0 group-hover:opacity-100 disabled:opacity-50 disabled:cursor-not-allowed ${humanizingMessageId === msg.id ? 'animate-pulse' : ''}`}
                      title="Humanizar texto"
                    >
                      {humanizingMessageId === msg.id ? (
                        <FiLoader className="w-4 h-4 animate-spin" />
                      ) : (
                        <LuBrain className="w-4 h-4" />
                      )}
                    </button>
                  )}
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

      {/* Input Footer */}
      <footer className="bg-white border-t border-gray-100 p-4 shadow-sm">
        <form onSubmit={sendMessage} className="max-w-4xl mx-auto">
          <div className="flex gap-2 items-start"> {/* Alterado para items-start para alinhar contador */}
            <div className="flex-1 flex flex-col"> {/* Div para agrupar input e contador */}
              <input
                type="text"
                value={input}
                onChange={handleInputChange}
                placeholder="Digite sua mensagem..."
                className="flex-1 p-3 rounded-xl bg-white border border-gray-200 focus:border-jumbo focus:ring-1 focus:ring-jumbo text-gray-800 placeholder-gray-400 transition-all duration-300 outline-none"
                disabled={isLoading}
                maxLength={MAX_INPUT_LENGTH} // Adiciona atributo HTML para reforçar limite
              />
              {/* Contador de Caracteres */}
              <div className="text-xs text-gray-400 text-right pr-2 pt-1">
                {input.length}/{MAX_INPUT_LENGTH}
              </div>
            </div>
            <button
              type="submit"
              // Desabilita se exceder o limite também
              disabled={isLoading || !input.trim() || input.length > MAX_INPUT_LENGTH} 
              className="p-3 bg-jumbo hover:bg-jumbo-dark text-white rounded-xl transition-colors duration-300 disabled:opacity-50 disabled:cursor-not-allowed hover:shadow-md mt-1" // Adicionado mt-1 para alinhar melhor
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