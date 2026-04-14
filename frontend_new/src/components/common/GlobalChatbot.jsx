import { useState, useRef, useEffect } from 'react';
import { MessageSquare, X, Send, Bot, User as UserIcon } from 'lucide-react';
import useAuthStore from '../../store/authStore';
import { chatAPI } from '../../api/chat.api';

export default function GlobalChatbot() {
  const { user, isLoggedIn } = useAuthStore();
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([]);
  const [inputMsg, setInputMsg] = useState('');
  const [loading, setLoading] = useState(false);
  
  const scrollRef = useRef(null);

  // Initialize greeting based on auth status
  useEffect(() => {
    if (messages.length === 0) {
      if (isLoggedIn()) {
        setMessages([{ 
          id: 1, 
          sender: 'bot', 
          text: `Hi ${user.name}! I'm your QuickOutfit AI Assistant. ${user.role === 'customer' ? 'Looking for style advice based on your body tone?' : 'Need help managing your shop?'}`
        }]);
      } else {
        setMessages([{ id: 1, sender: 'bot', text: "Hello! I'm the QuickOutfit AI Assistant. How can I help you today?" }]);
      }
    }
  }, [isLoggedIn, user, messages.length]);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, isOpen]);

  const handleSend = async (e) => {
    e.preventDefault();
    if (!inputMsg.trim()) return;

    const userMessage = inputMsg;
    setInputMsg('');
    setMessages(prev => [...prev, { id: Date.now(), sender: 'user', text: userMessage }]);
    setLoading(true);

    try {
      // Build context
      const contextData = {};
      if (user?.skinTone) contextData.skinTone = user.skinTone;
      if (user?.measurements?.bodyType) contextData.bodyType = user.measurements.bodyType;

      const { data } = await chatAPI.sendMessage(userMessage, messages, contextData);
      
      setMessages(prev => [...prev, { id: Date.now() + 1, sender: 'bot', text: data.reply }]);
    } catch (error) {
      setMessages(prev => [...prev, { id: Date.now() + 1, sender: 'bot', text: "Sorry, I'm having trouble connecting right now." }]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ position: 'fixed', bottom: 24, right: 24, zIndex: 9999 }}>
      
      {/* Chat Window */}
      {isOpen && (
        <div className="card" style={{ 
          width: 350, 
          height: 500, 
          marginBottom: 16, 
          display: 'flex', 
          flexDirection: 'column', 
          boxShadow: '0 12px 28px rgba(0,0,0,0.15)',
          animation: 'slideUp 0.3s ease',
          overflow: 'hidden',
          background: 'white',
          border: '1px solid var(--border)'
        }}>
          {/* Header */}
          <div style={{ 
            background: 'linear-gradient(135deg, var(--charcoal), var(--rust))', 
            padding: '16px 20px', 
            display: 'flex', 
            justifyContent: 'space-between', 
            alignItems: 'center',
            color: 'white'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <div style={{ width: 32, height: 32, borderRadius: '50%', background: 'rgba(255,255,255,0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <Bot size={20} />
              </div>
              <div>
                <h3 style={{ fontSize: 16, fontWeight: 700, margin: 0 }}>QuickOutfit AI</h3>
                <span style={{ fontSize: 12, opacity: 0.8 }}>Powered by Gemini</span>
              </div>
            </div>
            <button onClick={() => setIsOpen(false)} style={{ background: 'none', border: 'none', color: 'white', cursor: 'pointer' }}>
              <X size={20} />
            </button>
          </div>

          {/* Messages Area */}
          <div ref={scrollRef} style={{ flex: 1, overflowY: 'auto', padding: 20, display: 'flex', flexDirection: 'column', gap: 16, background: '#FAFAFA' }}>
            {messages.map(msg => (
              <div key={msg.id} style={{ 
                alignSelf: msg.sender === 'user' ? 'flex-end' : 'flex-start', 
                maxWidth: '85%',
                display: 'flex',
                gap: 8,
                flexDirection: msg.sender === 'user' ? 'row-reverse' : 'row'
              }}>
                <div style={{ width: 28, height: 28, borderRadius: '50%', background: msg.sender === 'user' ? 'var(--amber-pale)' : 'var(--cream)', border: '1px solid var(--border)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                  {msg.sender === 'user' ? <UserIcon size={14} color="var(--rust)" /> : <Bot size={14} color="var(--charcoal)" />}
                </div>
                
                <div style={{ 
                  padding: '10px 14px', 
                  borderRadius: msg.sender === 'user' ? '16px 4px 16px 16px' : '4px 16px 16px 16px',
                  background: msg.sender === 'user' ? 'var(--charcoal)' : 'white',
                  color: msg.sender === 'user' ? 'white' : 'var(--charcoal)',
                  boxShadow: 'var(--shadow-sm)',
                  fontSize: 14,
                  lineHeight: 1.5,
                  border: msg.sender === 'user' ? 'none' : '1px solid var(--border)',
                  whiteSpace: 'pre-wrap'
                }}>
                  {msg.text}
                </div>
              </div>
            ))}
            
            {loading && (
              <div style={{ alignSelf: 'flex-start', display: 'flex', gap: 8 }}>
                <div style={{ width: 28, height: 28, borderRadius: '50%', background: 'var(--cream)', border: '1px solid var(--border)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <Bot size={14} color="var(--charcoal)" />
                </div>
                <div style={{ padding: '12px 16px', borderRadius: '4px 16px 16px 16px', background: 'white', border: '1px solid var(--border)', display: 'flex', gap: 4 }}>
                  <span className="typing-dot" style={{ width: 6, height: 6, background: 'var(--text-muted)', borderRadius: '50%', animation: 'bounce 1.4s infinite ease-in-out both' }}></span>
                  <span className="typing-dot" style={{ width: 6, height: 6, background: 'var(--text-muted)', borderRadius: '50%', animation: 'bounce 1.4s infinite ease-in-out both', animationDelay: '0.2s' }}></span>
                  <span className="typing-dot" style={{ width: 6, height: 6, background: 'var(--text-muted)', borderRadius: '50%', animation: 'bounce 1.4s infinite ease-in-out both', animationDelay: '0.4s' }}></span>
                </div>
              </div>
            )}
          </div>

          {/* Input Area */}
          <div style={{ padding: 16, background: 'white', borderTop: '1px solid var(--border)' }}>
            <form onSubmit={handleSend} style={{ display: 'flex', gap: 8 }}>
              <input 
                type="text" 
                value={inputMsg}
                onChange={(e) => setInputMsg(e.target.value)}
                placeholder={isLoggedIn() ? "Ask about styles, orders..." : "Login for personalized advice..."}
                disabled={!isLoggedIn()}
                style={{ 
                  flex: 1, 
                  padding: '10px 16px', 
                  borderRadius: 20, 
                  border: '1px solid var(--border)', 
                  outline: 'none',
                  fontSize: 14,
                  background: isLoggedIn() ? 'white' : '#f0f0f0'
                }}
              />
              <button 
                type="submit" 
                disabled={!inputMsg.trim() || !isLoggedIn() || loading}
                style={{ 
                  width: 40, 
                  height: 40, 
                  borderRadius: '50%', 
                  background: inputMsg.trim() && !loading ? 'var(--amber)' : '#E5E7EB', 
                  border: 'none', 
                  color: 'white', 
                  display: 'flex', 
                  alignItems: 'center', 
                  justifyContent: 'center',
                  cursor: inputMsg.trim() && !loading ? 'pointer' : 'not-allowed',
                  transition: 'background 0.2s'
                }}
              >
                <Send size={18} style={{ marginLeft: 2 }} />
              </button>
            </form>
          </div>
        </div>
      )}

      {/* Bubble Button */}
      {!isOpen && (
        <button 
          onClick={() => setIsOpen(true)}
          style={{ 
            width: 60, 
            height: 60, 
            borderRadius: '50%', 
            background: 'var(--charcoal)', 
            color: 'white', 
            border: 'none', 
            boxShadow: '0 8px 16px rgba(0,0,0,0.2)', 
            display: 'flex', 
            alignItems: 'center', 
            justifyContent: 'center',
            cursor: 'pointer',
            transition: 'transform 0.2s',
            ':hover': { transform: 'scale(1.05)' }
          }}
        >
          <MessageSquare size={28} />
        </button>
      )}

      <style>{`
        @keyframes bounce { 0%, 80%, 100% { transform: scale(0); } 40% { transform: scale(1); } }
      `}</style>
    </div>
  );
}
