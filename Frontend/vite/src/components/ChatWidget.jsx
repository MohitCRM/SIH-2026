import { useState, useRef, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { MessageCircle, X, Send, Bot } from 'lucide-react';

export default function ChatWidget() {
  const { t, i18n } = useTranslation();
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const scrollRef = useRef(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, isOpen]);

  const sendMessage = async () => {
    const trimmed = input.trim();
    if (!trimmed || loading) return;

    const userMessage = { role: 'user', content: trimmed };
    const nextMessages = [...messages, userMessage];
    setMessages(nextMessages);
    setInput('');
    setLoading(true);

    // The current message goes in `message`, so history is prior turns only, and must start with a user turn.
    let history = messages.slice(-6);
    if (history[0]?.role === 'assistant') history = history.slice(1);

    try {
      const res = await fetch('/api/chatbot/message', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: trimmed,
          language: i18n.language,
          history,
        }),
      });

      if (!res.ok) throw new Error('Request failed');

      const data = await res.json();
      setMessages((prev) => [...prev, { role: 'assistant', content: data.reply }]);
    } catch (err) {
      setMessages((prev) => [...prev, { role: 'assistant', content: t('chatWidget.error') }]);
    } finally {
      setLoading(false);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  return (
    <div className="fixed bottom-4 right-4 z-50">
      <style>{`
        @keyframes breathe {
          0%, 100% { transform: scale(1); }
          50% { transform: scale(1.08); }
        }
        .breathing { animation: breathe 1.8s ease-in-out infinite; }
      `}</style>

      {isOpen && (
        <div className="mb-3 w-80 sm:w-96 h-[28rem] bg-base-200 rounded-2xl shadow-2xl border border-base-300 flex flex-col overflow-hidden animate-in fade-in slide-in-from-bottom-4 duration-200">
          <div className="bg-primary text-primary-content px-4 py-3 flex items-center gap-3">
            <div className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center flex-shrink-0">
              <Bot size={18} />
            </div>
            <div className="flex-1">
              <div className="font-semibold text-sm">{t('chatWidget.title')}</div>
              <div className="text-xs opacity-80 flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-green-400"></span>
                {t('chatWidget.online')}
              </div>
            </div>
            <button onClick={() => setIsOpen(false)} className="btn btn-ghost btn-xs btn-circle">
              <X size={16} />
            </button>
          </div>

          <div ref={scrollRef} className="flex-1 overflow-y-auto p-3 space-y-3">
            {messages.length === 0 && (
              <div className="flex gap-2 items-end">
                <div className="w-6 h-6 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                  <Bot size={13} className="text-primary" />
                </div>
                <div className="chat-bubble chat-bubble-secondary rounded-tl-sm max-w-[80%]">
                  {t('chatWidget.greeting')}
                </div>
              </div>
            )}
            {messages.map((m, i) =>
              m.role === 'user' ? (
                <div key={i} className="chat chat-end">
                  <div className="chat-bubble chat-bubble-primary rounded-br-sm">{m.content}</div>
                </div>
              ) : (
                <div key={i} className="flex gap-2 items-end">
                  <div className="w-6 h-6 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                    <Bot size={13} className="text-primary" />
                  </div>
                  <div className="chat-bubble chat-bubble-secondary rounded-tl-sm max-w-[80%]">
                    {m.content}
                  </div>
                </div>
              )
            )}
            {loading && (
              <div className="flex gap-2 items-end">
                <div className="w-6 h-6 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                  <Bot size={13} className="text-primary" />
                </div>
                <div className="chat-bubble chat-bubble-secondary rounded-tl-sm">
                  <span className="loading loading-dots loading-sm"></span>
                </div>
              </div>
            )}
          </div>

          <div className="p-2 border-t border-base-300 flex gap-2">
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder={t('chatWidget.placeholder')}
              className="input input-bordered input-sm flex-1 rounded-full"
              disabled={loading}
            />
            <button onClick={sendMessage} disabled={loading || !input.trim()} className="btn btn-primary btn-sm btn-circle">
              <Send size={15} />
            </button>
          </div>
        </div>
      )}

      <button
        onClick={() => setIsOpen(!isOpen)}
        className={`btn btn-primary btn-circle w-14 h-14 shadow-lg ${!isOpen ? 'breathing' : ''}`}
      >
        {isOpen ? <X size={24} /> : <MessageCircle size={24} />}
      </button>
    </div>
  );
}