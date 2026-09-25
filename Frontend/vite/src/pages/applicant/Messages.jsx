import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { MessageSquare, ExternalLink, Loader2, AlertCircle } from 'lucide-react';

const Messages = () => {
  const { t } = useTranslation();
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const user = JSON.parse(localStorage.getItem('user') || '{}');
  const applicantId = user._id || "64a7c2f1b2a3d4e5f6a7b8c9"; // Fallback

  useEffect(() => {
    fetchMessages();
  }, []);

  const fetchMessages = async () => {
    try {
      setLoading(true);
      const response = await fetch(`/api/applicant/messages/${applicantId}`);
      if (!response.ok) throw new Error(t('messages.errors.fetchFailed'));
      const data = await response.json();
      setMessages(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto fade-in p-8">
      <header className="mb-10 flex justify-between items-center border-b border-base-200 pb-6">
        <div>
          <h1 className="text-3xl font-bold mb-1 text-primary">{t('messages.title')}</h1>
          <p className="text-base-content/60 font-medium">{t('messages.subtitle')}</p>
        </div>
        <div className="p-4 bg-primary/10 text-primary rounded-xl">
          <MessageSquare size={32} />
        </div>
      </header>

      {loading ? (
        <div className="flex justify-center py-20">
          <Loader2 className="animate-spin text-primary" size={48} />
        </div>
      ) : error ? (
        <div className="alert alert-error shadow-sm mb-6">
          <AlertCircle size={20} />
          <span>{error}</span>
          <button className="btn btn-sm btn-outline" onClick={fetchMessages}>{t('messages.retry')}</button>
        </div>
      ) : messages.length === 0 ? (
        <div className="card bg-base-100 border-dashed border-2 border-base-300 p-10 text-center fade-in">
          <MessageSquare className="mx-auto text-base-content/20 mb-4" size={48} />
          <h3 className="text-lg font-bold text-base-content/80 mb-1">{t('messages.emptyTitle')}</h3>
          <p className="text-sm text-base-content/50 font-medium">{t('messages.emptyDesc')}</p>
        </div>
      ) : (
        <div className="space-y-4">
          {messages.map((msg) => (
            <div key={msg._id} className="card bg-base-100 shadow-sm border border-base-200 hover:shadow-md transition-shadow">
              <div className="card-body">
                <div className="flex justify-between items-start mb-2">
                  <h3 className="card-title text-lg text-base-content">{msg.title}</h3>
                  <span className="text-xs text-base-content/50 font-medium whitespace-nowrap">
                    {t('messages.dateAt', {
                      date: new Date(msg.createdAt).toLocaleDateString(),
                      time: new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
                    })}
                  </span>
                </div>
                
                <p className="text-base-content/70">{msg.body}</p>
                
                {msg.actionUrl && (
                  <div className="card-actions justify-end mt-4 pt-4 border-t border-base-100">
                    <a href={msg.actionUrl} target="_blank" rel="noopener noreferrer" className="btn btn-primary btn-sm gap-2">
                      <ExternalLink size={16} /> {t('messages.openSanctionLetter')}
                    </a>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default Messages;
