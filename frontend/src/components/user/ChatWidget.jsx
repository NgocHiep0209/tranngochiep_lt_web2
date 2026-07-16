import React, { useEffect, useRef, useState } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import chatService from '../../services/chatService';

function ChatWidget() {
  const { currentUser, isLoggedIn, isAdmin } = useAuth();
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState([]);
  const [text, setText] = useState('');
  const [unreadCount, setUnreadCount] = useState(0);
  const [sending, setSending] = useState(false);
  const bottomRef = useRef(null);
  const openRef = useRef(open);

  useEffect(() => {
    openRef.current = open;
  }, [open]);

  const fetchMessages = async () => {
    try {
      const res = await chatService.getMyMessages();
      setMessages(res);
      if (!openRef.current) {
        const unread = res.filter((m) => m.senderRole === 'ADMIN' && !m.readByCustomer).length;
        setUnreadCount(unread);
      }
    } catch (err) {
      console.error(err);
    }
  };

  // Poll tin nhắn mới mỗi 5 giây khi khách đã đăng nhập (không phải admin)
  useEffect(() => {
    if (!isLoggedIn() || isAdmin()) return;
    fetchMessages();
    const interval = setInterval(fetchMessages, 5000);
    return () => clearInterval(interval);
  }, [currentUser]);

  // Khi mở khung chat -> đánh dấu đã đọc + cuộn xuống cuối
  useEffect(() => {
    if (open) {
      chatService.markMyRead().then(() => setUnreadCount(0)).catch(() => {});
    }
  }, [open]);

  useEffect(() => {
    if (open) {
      bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages.length, open]);

  if (!isLoggedIn() || isAdmin()) return null;

  const handleSend = async (e) => {
    e.preventDefault();
    if (!text.trim() || sending) return;
    setSending(true);
    try {
      const msg = await chatService.sendMyMessage(text.trim());
      setMessages((prev) => [...prev, msg]);
      setText('');
    } catch (err) {
      alert('Gửi tin nhắn thất bại, vui lòng thử lại!');
      console.error(err);
    } finally {
      setSending(false);
    }
  };

  const formatTime = (iso) =>
    new Date(iso).toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' });

  return (
    <div className="chat-widget">
      {open && (
        <div className="chat-widget-panel">
          <div className="chat-widget-header">
            <span>💬 Hỗ trợ khách hàng</span>
            <button type="button" onClick={() => setOpen(false)}>✕</button>
          </div>
          <div className="chat-widget-body">
            {messages.length === 0 && (
              <p className="chat-empty">Gửi tin nhắn cho chúng tôi, đội ngũ hỗ trợ sẽ phản hồi sớm nhất!</p>
            )}
            {messages.map((m) => (
              <div
                key={m.id}
                className={`chat-bubble ${m.senderRole === 'USER' ? 'chat-bubble-me' : 'chat-bubble-other'}`}
              >
                <p>{m.content}</p>
                <span className="chat-time">{formatTime(m.createdAt)}</span>
              </div>
            ))}
            <div ref={bottomRef} />
          </div>
          <form className="chat-widget-input" onSubmit={handleSend}>
            <input
              type="text"
              value={text}
              onChange={(e) => setText(e.target.value)}
              placeholder="Nhập tin nhắn..."
              disabled={sending}
            />
            <button type="submit" disabled={sending || !text.trim()}>Gửi</button>
          </form>
        </div>
      )}

      <button type="button" className="chat-widget-toggle" onClick={() => setOpen((o) => !o)}>
        {open ? '✕' : '💬'}
        {!open && unreadCount > 0 && <span className="chat-badge">{unreadCount}</span>}
      </button>
    </div>
  );
}

export default ChatWidget;
