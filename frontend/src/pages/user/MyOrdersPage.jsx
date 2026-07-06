import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import orderService from '../../services/orderService';

const STATUS_LABELS = {
  pending: { text: 'Chờ xác nhận', color: '#f0ad4e' },
  confirmed: { text: 'Đã xác nhận', color: '#5bc0de' },
  shipping: { text: 'Đang giao', color: '#337ab7' },
  completed: { text: 'Hoàn thành', color: '#5cb85c' },
  cancelled: { text: 'Đã hủy', color: '#d9534f' },
};

function MyOrdersPage() {
  const { isLoggedIn } = useAuth();
  const navigate = useNavigate();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [expandedId, setExpandedId] = useState(null);

  const formatPrice = (price) =>
    new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(price || 0);
  const formatDate = (d) => (d ? new Date(d).toLocaleString('vi-VN') : '');

  useEffect(() => {
    if (!isLoggedIn()) {
      navigate('/login');
      return;
    }
    orderService.getMyOrders()
      .then(setOrders)
      .catch((err) => console.error(err))
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="loading-spinner" style={{ minHeight: '60vh' }}>
        <div className="spinner"></div>
        <p>Đang tải đơn hàng...</p>
      </div>
    );
  }

  return (
    <div style={{ maxWidth: 900, margin: '0 auto', padding: '24px 16px' }}>
      <h1>📦 Đơn hàng của tôi</h1>

      {orders.length === 0 ? (
        <div className="empty-state">
          <span>🛍️</span>
          <p>Bạn chưa có đơn hàng nào</p>
          <Link to="/products" className="btn btn-primary">Mua sắm ngay</Link>
        </div>
      ) : (
        orders.map((order) => {
          const statusInfo = STATUS_LABELS[order.status] || { text: order.status, color: '#999' };
          const isOpen = expandedId === order.id;
          return (
            <div key={order.id} className="admin-form-card" style={{ marginBottom: 16 }}>
              <div
                style={{ display: 'flex', justifyContent: 'space-between', cursor: 'pointer' }}
                onClick={() => setExpandedId(isOpen ? null : order.id)}
              >
                <div>
                  <strong>Đơn hàng #{order.id}</strong>
                  <div style={{ fontSize: 13, color: '#888' }}>{formatDate(order.orderDate)}</div>
                </div>
                <div style={{ textAlign: 'right' }}>
                  <span style={{ background: statusInfo.color, color: '#fff', padding: '4px 10px', borderRadius: 12, fontSize: 12, fontWeight: 600 }}>
                    {statusInfo.text}
                  </span>
                  <div style={{ fontWeight: 700, marginTop: 4 }}>{formatPrice(order.totalAmount)}</div>
                </div>
              </div>

              {isOpen && (
                <div style={{ marginTop: 16, borderTop: '1px solid #eee', paddingTop: 16 }}>
                  <p><strong>Người nhận:</strong> {order.customerName} - {order.customerPhone}</p>
                  <p><strong>Địa chỉ:</strong> {order.customerAddress}</p>
                  {order.note && <p><strong>Ghi chú:</strong> {order.note}</p>}
                  <table style={{ width: '100%', marginTop: 12 }}>
                    <thead>
                      <tr><th style={{ textAlign: 'left' }}>Sản phẩm</th><th>SL</th><th style={{ textAlign: 'right' }}>Giá</th></tr>
                    </thead>
                    <tbody>
                      {order.orderDetails?.map((d) => (
                        <tr key={d.id}>
                          <td>{d.productName}</td>
                          <td style={{ textAlign: 'center' }}>{d.quantity}</td>
                          <td style={{ textAlign: 'right' }}>{formatPrice(d.unitPrice * d.quantity)}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          );
        })
      )}
    </div>
  );
}

export default MyOrdersPage;