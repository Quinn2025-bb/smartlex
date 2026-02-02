
import React, { useState, useRef, useEffect, useCallback } from 'react';
import { SemanticAnalysis, ChatMessage } from '../types';
import { chatWithAI } from '../geminiService';

import { useStore } from '../contexts/StoreContext';

const ChatSidebar: React.FC = () => {
  const { currentAnalysis } = useStore();
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, isTyping]);

  const handleSend = useCallback(async () => {
    if (!input.trim() || isTyping) return;

    const userMsg: ChatMessage = {
      role: 'user',
      text: input,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

    setMessages(prev => [...prev, userMsg]);
    setInput('');
    setIsTyping(true);

    try {
      const response = await chatWithAI(input, currentAnalysis);
      const aiMsg: ChatMessage = {
        role: 'model',
        text: response || "I'm sorry, I couldn't process that.",
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      };
      setMessages(prev => [...prev, aiMsg]);
    } catch (error) {
      console.error("Chat error:", error);
    } finally {
      setIsTyping(false);
    }
  }, [input, isTyping, currentAnalysis]);

  return (
    <aside className="w-72 md:w-80 flex flex-col bg-white border-l-4 border-black shrink-0 relative z-10 shadow-[-4px_0px_0px_0px_rgba(0,0,0,0.1)]">
      <div className="p-4 border-b-4 border-black flex items-center justify-between bg-yellow-400">
        <div className="flex items-center gap-3">
          <div className="size-10 bg-white border-2 border-black rounded-lg flex items-center justify-center text-black shadow-[2px_2px_0px_0px_#000]">
            <span className="material-symbols-outlined text-2xl font-black">smart_toy</span>
          </div>
          <div>
            <h2 className="font-display font-black text-lg tracking-tighter text-black uppercase italic transform -rotate-2">AI ASSISTANT</h2>
            <div className="flex items-center gap-1.5 ml-1">
              <span className={`size-2 border border-black rounded-full ${isTyping ? 'bg-white animate-bounce' : 'bg-green-500'}`}></span>
              <span className="text-[10px] text-black uppercase font-black tracking-widest bg-white px-1 border border-black rounded shadow-[1px_1px_0px_0px_#000]">
                {isTyping ? 'THINKING...' : 'READY'}
              </span>
            </div>
          </div>
        </div>
        <div className="flex items-center gap-1">
          <button
            onClick={() => setMessages([])}
            className="size-9 flex items-center justify-center text-black bg-white hover:bg-red-400 hover:text-white border-2 border-black rounded-lg transition-all shadow-[2px_2px_0px_0px_#000] active:translate-y-0.5 active:shadow-none"
            title="New Chat"
          >
            <span className="material-symbols-outlined text-lg font-bold">add_comment</span>
          </button>
        </div>
      </div>

      <div ref={scrollRef} className="flex-1 overflow-y-auto custom-scrollbar p-4 space-y-6 bg-[radial-gradient(#e5e7eb_1px,transparent_1px)] [background-size:16px_16px]">
        {messages.length === 0 ? (
          <div className="flex flex-col items-start gap-4">
            <div className="bg-white text-black p-6 rounded-2xl rounded-tl-none text-sm leading-relaxed border-3 border-black shadow-[6px_6px_0px_0px_#000]">
              <p className="mb-4 font-black text-xl italic flex items-center gap-2 transform -rotate-1">
                <span className="material-symbols-outlined text-2xl">waving_hand</span>
                HEY THERE!
              </p>
              <p className="mb-4 font-bold border-l-4 border-blue-500 pl-2">Ready to crack some linguistic codes?</p>
              <ul className="space-y-3">
                <li className="flex gap-3 items-center">
                  <span className="size-6 bg-black text-white rounded-full flex items-center justify-center font-black text-xs">1</span>
                  <span className="font-bold text-xs uppercase">Decoding Metaphors</span>
                </li>
                <li className="flex gap-3 items-center">
                  <span className="size-6 bg-black text-white rounded-full flex items-center justify-center font-black text-xs">2</span>
                  <span className="font-bold text-xs uppercase">Slang & Idioms</span>
                </li>
              </ul>
              {currentAnalysis && (
                <div className="mt-6 p-3 bg-yellow-300 rounded-xl border-2 border-black shadow-[2px_2px_0px_0px_#000] rotate-1">
                  <p className="text-[9px] text-black mb-1 font-black uppercase tracking-widest border-b-2 border-black pb-1">Current Focus:</p>
                  <p className="text-sm font-black italic">"{currentAnalysis.term}"</p>
                </div>
              )}
            </div>
          </div>
        ) : (
          messages.map((msg, i) => (
            <div key={i} className={`flex flex-col ${msg.role === 'user' ? 'items-end' : 'items-start'} gap-2 group`}>
              {msg.role === 'model' && (
                <div className="flex items-center gap-2 mb-1 px-1">
                  <span className="px-2 py-0.5 bg-black text-white text-[9px] font-black uppercase tracking-widest rounded shadow-[2px_2px_0px_0px_rgba(0,0,0,0.2)]">SmartLex AI</span>
                </div>
              )}
              <div className={`p-4 rounded-xl max-w-[90%] text-sm font-medium leading-relaxed border-3 border-black shadow-[4px_4px_0px_0px_#000] transition-all hover:-translate-y-1 hover:shadow-[6px_6px_0px_0px_#000] ${msg.role === 'user'
                ? 'bg-blue-500 text-white rounded-tr-none'
                : 'bg-white text-black rounded-tl-none'
                }`}>
                {msg.text}
              </div>
              <span className="text-[9px] text-gray-500 font-black px-1 uppercase">{msg.timestamp}</span>
            </div>
          ))
        )}
        {isTyping && (
          <div className="flex flex-col items-start gap-2 animate-pulse">
            <div className="bg-white border-2 border-black p-4 rounded-xl rounded-tl-none w-24 h-12 flex items-center justify-center gap-1 shadow-[4px_4px_0px_0px_#000]">
              <div className="size-2 bg-black rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
              <div className="size-2 bg-black rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
              <div className="size-2 bg-black rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
            </div>
          </div>
        )}
      </div>

      <div className="p-4 border-t-4 border-black bg-white">
        <div className="flex items-center gap-2 p-2 bg-white border-3 border-black rounded-xl shadow-[4px_4px_0px_0px_#000] focus-within:shadow-[6px_6px_0px_0px_#000] focus-within:-translate-y-1 transition-all">
          <textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleSend(); } }}
            className="flex-1 w-full bg-transparent border-none focus:ring-0 text-sm font-bold min-h-[48px] max-h-48 py-3 px-2 resize-none placeholder-gray-400 no-scrollbar leading-relaxed outline-none"
            placeholder="Ask anything..."
          />
          <button
            onClick={handleSend}
            disabled={!input.trim() || isTyping}
            className="shrink-0 p-3 bg-red-500 text-white rounded-lg border-2 border-black hover:bg-red-400 transition-all shadow-[2px_2px_0px_0px_#000] active:scale-95 active:shadow-none disabled:opacity-50 disabled:shadow-none disabled:translate-y-0 flex items-center justify-center"
          >
            <span className="material-symbols-outlined text-xl font-black">send</span>
          </button>
        </div>
      </div>
    </aside>
  );
};

export default ChatSidebar;
