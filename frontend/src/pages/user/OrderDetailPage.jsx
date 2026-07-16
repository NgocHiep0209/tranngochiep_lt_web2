import React, { useEffect, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import orderService from '../../services/orderService';

const STATUS_LABELS = {
  pending: { text: 'Chờ xác nhận', color: '#f0ad4e' },
  confirmed: { text: 'Đã xác nhận', color: '#5bc0de' },
  shipping: { text: 'Đang giao', color: '#337ab7' },
  completed: { text: 'Hoàn thành', color: '#5cb85c' },
  cancelled: { text: 'Đã hủy', color: '#d9534f' },
};

// Thứ tự các bước hợp lệ trong vòng đời đơn hàng, dùng để vẽ timeline trạng thái.
const STATUS_STEPS = ['pending', 'confirmed', 'shipping', 'completed'];

function OrderDetailPage() {
  const { id } = useParams();
  const { isLoggedIn } = useAuth();
  const navigate = useNavigate();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);

  const formatPrice = (price) =>
    new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(price || 0);
  const formatDate = (d) => (d ? new Date(d).toLocaleString('vi-VN') : '');

  useEffect(() => {
    if (!isLoggedIn()) {
      navigate('/login');
      return;
    }
    // Lưu ý: backend hiện chỉ cho phép ADMIN gọi GET /api/orders/{id}. Vì vậy trang này
    // lấy dữ liệu qua /api/orders/my (đã tự lọc đúng khách hàng đang đăng nhập ở backend)
    // rồi tìm đúng đơn hàng theo id ở phía client — vừa an toàn, vừa không cần sửa
    // cấu hình bảo mật hiện có.
    orderService.getMyOrders()
      .then((orders) => {
        const found = orders.find((o) => String(o.id) === String(id));
        if (!found) {
          setNotFound(true);
        } else {
          setOrder(found);
        }
      })
      .catch((err) => console.error(err))
      .finally(() => setLoading(false));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  if (loading) {
    return (
      <div className="loading-spinner" style={{ minHeight: '60vh' }}>
        <div className="spinner"></div>
        <p>Đang tải chi tiết đơn hàng...</p>
      </div>
    );
  }

  if (notFound || !order) {
    return (
      <div className="empty-state" style={{ minHeight: '60vh' }}>
        <span>📦</span>
        <p>Không tìm thấy đơn hàng này, hoặc đơn hàng không thuộc về tài khoản của bạn.</p>
        <Link to="/my-orders" className="btn btn-primary">Về danh sách đơn hàng</Link>
      </div>
    );
  }

  const statusInfo = STATUS_LABELS[order.status] || { text: order.status, color: '#999' };
  const isCancelled = order.status === 'cancelled';
  const currentStepIndex = STATUS_STEPS.indexOf(order.status);
  const itemsTotal = (order.orderDetails || []).reduce(
    (sum, d) => sum + d.unitPrice * d.quantity,
    0
  );

  return (
    <div style={{ maxWidth: 900, margin: '0 auto', padding: '24px 16px' }}>
      <Link to="/my-orders" style={{ display: 'inline-block', marginBottom: 12 }}>← Về danh sách đơn hàng</Link>

      <div className="admin-form-card">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: 12 }}>
          <div>
            <h1 style={{ margin: 0 }}>Đơn hàng #{order.id}</h1>
            <p style={{ color: '#888', margin: '4px 0 0' }}>Đặt lúc {formatDate(order.orderDate)}</p>
          </div>
          <span style={{ background: statusInfo.color, color: '#fff', padding: '6px 14px', borderRadius: 16, fontSize: 13, fontWeight: 600, whiteSpace: 'nowrap' }}>
            {statusInfo.text}
          </span>
        </div>

        {/* Timeline trạng thái - chỉ hiển thị khi đơn chưa bị hủy */}
        {!isCancelled && (
          <div className="order-status-timeline">
            {STATUS_STEPS.map((step, index) => (
              <div key={step} className={`order-status-step ${index <= currentStepIndex ? 'done' : ''}`}>
                <span className="order-status-dot" />
                <span className="order-status-label">{STATUS_LABELS[step].text}</span>
              </div>
            ))}
          </div>
        )}
        {isCancelled && (
          <p style={{ color: STATUS_LABELS.cancelled.color, fontWeight: 600, marginTop: 16 }}>
            ❌ Đơn hàng này đã bị hủy.
          </p>
        )}

        <div style={{ marginTop: 24, borderTop: '1px solid #eee', paddingTop: 16 }}>
          <h3>Thông tin giao hàng</h3>
          <p><strong>Người nhận:</strong> {order.customerName}</p>
          <p><strong>Điện thoại:</strong> {order.customerPhone}</p>
          <p><strong>Địa chỉ:</strong> {order.customerAddress}</p>
          {order.note && <p><strong>Ghi chú:</strong> {order.note}</p>}
          {order.couponCode && (
            <p>
              <strong>Mã giảm giá:</strong>{' '}
              <span style={{ color: '#6c63ff', fontWeight: 600 }}>🎟️ {order.couponCode}</span>
              {' '}(-{formatPrice(order.discountAmount)})
            </p>
          )}
        </div>

        <div style={{ marginTop: 24, borderTop: '1px solid #eee', paddingTop: 16 }}>
          <h3>Sản phẩm đã đặt</h3>
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr>
                <th style={{ textAlign: 'left', padding: '8px 0' }}>Sản phẩm</th>
                <th style={{ textAlign: 'center' }}>Đơn giá</th>
                <th style={{ textAlign: 'center' }}>SL</th>
                <th style={{ textAlign: 'right' }}>Thành tiền</th>
              </tr>
            </thead>
            <tbody>
              {order.orderDetails?.map((d) => (
                <tr key={d.id} style={{ borderTop: '1px solid #f0f0f0' }}>
                  <td style={{ padding: '10px 0' }}>{d.productName}</td>
                  <td style={{ textAlign: 'center' }}>{formatPrice(d.unitPrice)}</td>
                  <td style={{ textAlign: 'center' }}>{d.quantity}</td>
                  <td style={{ textAlign: 'right' }}>{formatPrice(d.unitPrice * d.quantity)}</td>
                </tr>
              ))}
            </tbody>
          </table>

          <div style={{ marginTop: 16, textAlign: 'right' }}>
            <p style={{ margin: '4px 0' }}>Tạm tính: {formatPrice(itemsTotal)}</p>
            {order.couponCode && (
              <p style={{ margin: '4px 0', color: '#10b981' }}>
                Giảm giá ({order.couponCode}): -{formatPrice(order.discountAmount)}
              </p>
            )}
            <p style={{ margin: '4px 0', fontSize: 20, fontWeight: 700 }}>
              Tổng cộng: {formatPrice(order.totalAmount)}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default OrderDetailPage;
