import React, { useEffect, useRef, useState } from 'react';
import AdminSidebar from '../../components/admin/AdminSidebar';
import chatService from '../../services/chatService';

function AdminChatPage() {
  const [conversations, setConversations] = useState([]);
  const [selected, setSelected] = useState(null);
  const [messages, setMessages] = useState([]);
  const [text, setText] = useState('');
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const bottomRef = useRef(null);
  const selectedRef = useRef(null);

  useEffect(() => {
    selectedRef.current = selected;
  }, [selected]);

  const fetchConversations = async () => {
    try {
      const res = await chatService.getConversations();
      setConversations(res);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const fetchMessages = async (customerId) => {
    try {
      const res = await chatService.getCustomerMessages(customerId);
      setMessages(res);
    } catch (err) {
      console.error(err);
    }
  };

  // Danh sách hội thoại: tải lần đầu + tự làm mới mỗi 6 giây
  useEffect(() => {
    fetchConversations();
    const interval = setInterval(fetchConversations, 6000);
    return () => clearInterval(interval);
  }, []);

  // Khi chọn 1 hội thoại: tải tin nhắn, đánh dấu đã đọc, tự làm mới mỗi 4 giây
  useEffect(() => {
    if (!selected) return;
    fetchMessages(selected);
    chatService.markCustomerRead(selected).then(fetchConversations).catch(() => {});
    const interval = setInterval(() => fetchMessages(selected), 4000);
    return () => clearInterval(interval);
  }, [selected]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages.length]);

  const handleSelect = (customerId) => {
    setSelected(customerId);
  };

  const handleSend = async (e) => {
    e.preventDefault();
    if (!text.trim() || !selected || sending) return;
    setSending(true);
    try {
      const msg = await chatService.sendToCustomer(selected, text.trim());
      setMessages((prev) => [...prev, msg]);
      setText('');
      fetchConversations();
    } catch (err) {
      alert('Gửi tin nhắn thất bại, vui lòng thử lại!');
      console.error(err);
    } finally {
      setSending(false);
    }
  };

  const formatTime = (iso) =>
    new Date(iso).toLocaleString('vi-VN', {
      hour: '2-digit',
      minute: '2-digit',
      day: '2-digit',
      month: '2-digit',
    });

  const selectedConversation = conversations.find((c) => c.customerId === selected);

  return (
    <div className="admin-layout">
      <AdminSidebar />
      <main className="admin-main">
        <div className="admin-page-header">
          <h1>💬 Chat với khách hàng</h1>
        </div>

        <div className="admin-chat-layout">
          <div className="admin-chat-list">
            {loading ? (
              <div className="loading-spinner">
                <div className="spinner"></div>
              </div>
            ) : conversations.length === 0 ? (
              <p className="chat-empty">Chưa có cuộc trò chuyện nào</p>
            ) : (
              conversations.map((c) => (
                <div
                  key={c.customerId}
                  className={`admin-chat-item ${selected === c.customerId ? 'active' : ''}`}
                  onClick={() => handleSelect(c.customerId)}
                >
                  <div className="admin-chat-item-top">
                    <strong>{c.customerName}</strong>
                    {c.unreadCount > 0 && <span className="chat-badge">{c.unreadCount}</span>}
                  </div>
                  <p className="admin-chat-preview">
                    {c.lastSenderRole === 'ADMIN' ? 'Bạn: ' : ''}
                    {c.lastMessage}
                  </p>
                  <span className="admin-chat-time">{formatTime(c.lastMessageAt)}</span>
                </div>
              ))
            )}
          </div>

          <div className="admin-chat-window">
            {!selected ? (
              <div className="chat-empty-state">Chọn một cuộc trò chuyện để bắt đầu</div>
            ) : (
              <>
                <div className="admin-chat-window-header">
                  <strong>{selectedConversation?.customerName}</strong>
                  {selectedConversation?.customerEmail && (
                    <span> · {selectedConversation.customerEmail}</span>
                  )}
                </div>
                <div className="chat-widget-body admin-chat-body">
                  {messages.map((m) => (
                    <div
                      key={m.id}
                      className={`chat-bubble ${m.senderRole === 'ADMIN' ? 'chat-bubble-me' : 'chat-bubble-other'}`}
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
                    placeholder="Nhập tin nhắn trả lời..."
                    disabled={sending}
                  />
                  <button type="submit" disabled={sending || !text.trim()}>Gửi</button>
                </form>
              </>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}

export default AdminChatPage;
