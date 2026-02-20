import React, { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import ReactMarkdown from 'react-markdown';
import { X, Bot, User, Sparkles, MessageCircle, ChevronRight } from 'lucide-react';
import { askChatbot } from '../lib/api';
import type { AxiosError } from 'axios';
import '../index.css';

interface Message {
  id: string;
  text: string;
  sender: 'user' | 'bot';
  timestamp: Date;
  buttons?: ButtonOption[];
}

interface ButtonOption {
  label: string;
  action: 'navigate' | 'help';
}

const Chatbot: React.FC = () => {
  const navigate = useNavigate();
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      text: "Hello! I'm your AgriPredict AI assistant. Ask me about any crop name and get insights?",
      sender: 'bot',
      timestamp: new Date(),
    },
  ]);
  const [inputValue, setInputValue] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [, setCurrentCrop] = useState<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleButtonClick = (button: ButtonOption) => {
    if (button.action === 'navigate') {
      // Navigate to farm guide page
      navigate("/dashboard/farm-guide");
      setIsOpen(false); // Close chatbot when navigating
    } else if (button.action === 'help') {
      // Add user's button click as a message
      const userMessage: Message = {
        id: Date.now().toString(),
        text: button.label,
        sender: 'user',
        timestamp: new Date(),
      };
      setMessages((prev) => [...prev, userMessage]);

      // Show help message
      const helpMessage: Message = {
        id: (Date.now() + 1).toString(),
        text: "If you need assistance or have any questions, feel free to reach out to our support team at supporteam@gmail.com, or check out our detailed user guide for more information.",
        sender: 'bot',
        timestamp: new Date(),
      };
      setMessages((prev) => [...prev, helpMessage]);
    }
  };

  const fetchCropIntroduction = async (cropName: string) => {
    setIsLoading(true);
    setCurrentCrop(cropName);

    try {
      const data = await askChatbot(cropName);

      if (data.success) {
        // Format the introduction with crop name
        const cropDisplayName = cropName.charAt(0).toUpperCase() + cropName.slice(1);
        const introText = `**What is ${cropDisplayName}?**\n\n${data.introduction}`;

        const botMessage: Message = {
          id: (Date.now() + 1).toString(),
          text: introText,
          sender: 'bot',
          timestamp: new Date(),
          buttons: [
            { label: 'Would you like to know more?', action: 'navigate' },
            { label: 'Help', action: 'help' }
          ]
        };

        setMessages((prev) => [...prev, botMessage]);
      } else {
        const errorMessage: Message = {
          id: (Date.now() + 1).toString(),
          text: `Sorry, I couldn't find information about "${cropName}". Please try another crop name or check our Farming Guide section.`,
          sender: 'bot',
          timestamp: new Date(),
        };
        setMessages((prev) => [...prev, errorMessage]);
        setCurrentCrop(null);
      }
    } catch (error) {
      const axiosError = error as AxiosError<{ error?: string; message?: string }>;
      const errorText =
        axiosError.response?.data?.error ||
        axiosError.response?.data?.message ||
        'Sorry, there was an error connecting to the AI assistant.';

      const errorMessage: Message = {
        id: (Date.now() + 1).toString(),
        text: errorText,
        sender: 'bot',
        timestamp: new Date(),
      };
      setMessages((prev) => [...prev, errorMessage]);
      setCurrentCrop(null);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSendMessage = async () => {
    if (!inputValue.trim()) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      text: inputValue,
      sender: 'user',
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMessage]);
    const currentInput = inputValue;
    setInputValue('');

    // Treat input as a crop query
    await fetchCropIntroduction(currentInput);
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  return (
    <>
      {/* Floating Chat Window */}
      {isOpen && (
        <div className="fixed bottom-24 right-6 w-[440px] h-[600px] bg-white/95 backdrop-blur-xl rounded-3xl shadow-2xl flex flex-col z-50 overflow-hidden border border-gray-200/50 animate-in slide-in-from-bottom-4 duration-300">
          {/* Header */}
          <div className="relative overflow-hidden bg-gradient-to-r from-emerald-500 to-green-600 text-white px-6 py-5 rounded-t-3xl">
            <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full blur-2xl"></div>
            <div className="relative flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="relative">
                  <div className="absolute inset-0 bg-white/30 rounded-xl blur-md"></div>
                  <div className="relative bg-white/20 backdrop-blur-sm p-2.5 rounded-xl">
                    <Bot className="w-5 h-5" />
                  </div>
                </div>
                <div>
                  <span className="font-bold text-lg">AgriPredict AI</span>
                  <div className="flex items-center gap-1.5 text-xs text-emerald-100">
                    <div className="w-1.5 h-1.5 bg-emerald-200 rounded-full animate-pulse"></div>
                    <span>Online</span>
                  </div>
                </div>
              </div>
              <button
                onClick={() => setIsOpen(false)}
                className="hover:bg-white/20 p-2 rounded-xl transition-all duration-200"
                aria-label="Close chat"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* Messages Container */}
          <div className="flex-1 overflow-y-auto p-6 bg-gradient-to-b from-gray-50/50 to-white space-y-4 custom-scrollbar">
            {messages.map((message) => (
              <div key={message.id}>
                <div
                  className={`flex ${
                    message.sender === 'user' ? 'justify-end' : 'justify-start'
                  } animate-in slide-in-from-bottom-2 duration-300`}
                >
                  {message.sender === 'bot' && (
                    <div className="flex items-start gap-3 max-w-[90%]">
                      <div className="flex-shrink-0 bg-gradient-to-br from-emerald-500 to-green-600 p-2 rounded-xl shadow-lg">
                        <Bot className="w-4 h-4 text-white" />
                      </div>
                      <div className="bg-white px-4 py-3 rounded-2xl rounded-tl-md shadow-md border border-gray-100">
                        <div className="text-gray-800 text-sm leading-relaxed prose prose-sm max-w-none">
                          <ReactMarkdown
                            components={{
                              p: ({ children }) => (
                                <p className="mb-2 last:mb-0">{children}</p>
                              ),
                              strong: ({ children }) => (
                                <strong className="font-bold text-emerald-700">{children}</strong>
                              ),
                              ul: ({ children }) => (
                                <ul className="list-disc pl-5 space-y-1 my-2">{children}</ul>
                              ),
                              li: ({ children }) => (
                                <li className="text-sm text-gray-700">{children}</li>
                              ),
                            }}
                          >
                            {message.text}
                          </ReactMarkdown>
                        </div>
                        <span className="text-[10px] text-gray-400 mt-1 block">
                          {message.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </span>
                      </div>
                    </div>
                  )}
                  {message.sender === 'user' && (
                    <div className="flex items-start gap-3 max-w-[90%]">
                      <div className="bg-gradient-to-br from-emerald-500 to-green-600 px-4 py-3 rounded-2xl rounded-tr-md shadow-md">
                        <p className="text-white text-sm leading-relaxed">
                          {message.text}
                        </p>
                        <span className="text-[10px] text-emerald-100 mt-1 block text-right">
                          {message.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </span>
                      </div>
                      <div className="flex-shrink-0 bg-gray-100 p-2 rounded-xl shadow-md">
                        <User className="w-4 h-4 text-gray-700" />
                      </div>
                    </div>
                  )}
                </div>

                {/* Interactive Buttons */}
                {message.buttons && message.buttons.length > 0 && (
                  <div className="ml-12 mt-3 flex flex-wrap gap-2">
                    {message.buttons.map((button, idx) => (
                      <button
                        key={idx}
                        onClick={() => handleButtonClick(button)}
                        className="group bg-white hover:bg-gradient-to-r hover:from-emerald-500 hover:to-green-600 border-2 border-emerald-500 text-emerald-600 hover:text-white px-4 py-2.5 rounded-xl font-semibold text-sm transition-all duration-200 shadow-md hover:shadow-lg flex items-center gap-2"
                      >
                        <span>{button.label}</span>
                        {button.action === 'navigate' && (
                          <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                        )}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            ))}

            {isLoading && (
              <div className="flex items-start gap-3 animate-in slide-in-from-bottom-2 duration-300">
                <div className="flex-shrink-0 bg-gradient-to-br from-emerald-500 to-green-600 p-2 rounded-xl shadow-lg">
                  <Bot className="w-4 h-4 text-white" />
                </div>
                <div className="bg-white px-4 py-3 rounded-2xl rounded-tl-md shadow-md border border-gray-100">
                  <div className="flex gap-1.5">
                    <div className="w-2 h-2 bg-emerald-500 rounded-full animate-bounce"></div>
                    <div className="w-2 h-2 bg-emerald-500 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                    <div className="w-2 h-2 bg-emerald-500 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                  </div>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Input Area */}
          <div className="bg-white/80 backdrop-blur-sm border-t border-gray-200/50 p-4">
            <div className="flex items-center gap-2 bg-gray-50 rounded-2xl p-2 border border-gray-200 focus-within:border-emerald-500 focus-within:ring-2 focus-within:ring-emerald-200 transition-all duration-200">
              <input
                type="text"
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder="Please enter the crop name or type..."
                className="flex-1 px-3 py-2.5 bg-transparent focus:outline-none text-sm placeholder-gray-400 text-gray-900"
                disabled={isLoading}
              />
              <button
                onClick={handleSendMessage}
                disabled={!inputValue.trim() || isLoading}
                className="bg-gradient-to-r from-emerald-500 to-green-600 text-white px-4 py-2.5 rounded-xl hover:from-emerald-600 hover:to-green-700 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex-shrink-0 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 font-semibold text-sm"
                aria-label="Send message"
              >
                Send
              </button>
            </div>
            <p className="text-[10px] text-gray-400 mt-2 text-center">
              Powered by AgriPredict AI © {new Date().getFullYear()}
            </p>
          </div>
        </div>
      )}

      {/* Floating Toggle Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="fixed bottom-6 right-6 bg-gradient-to-r from-emerald-500 to-green-600 text-white p-4 rounded-2xl shadow-2xl hover:from-emerald-600 hover:to-green-700 transition-all duration-200 hover:scale-110 z-50 group"
        aria-label={isOpen ? 'Close chat' : 'Open chat'}
      >
        {isOpen ? (
          <X className="w-6 h-6" />
        ) : (
          <div className="relative">
            <MessageCircle className="w-6 h-6" />
            <div className="absolute -top-1 -right-1">
              <Sparkles className="w-3 h-3 text-yellow-300 animate-pulse" />
            </div>
          </div>
        )}
        {!isOpen && (
          <div className="absolute -top-2 -right-2 w-4 h-4 bg-red-500 rounded-full animate-pulse border-2 border-white"></div>
        )}
      </button>

    </>
  );
};

export default Chatbot;