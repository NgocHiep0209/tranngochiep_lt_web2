import React, { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import AdminSidebar from '../../components/admin/AdminSidebar';
import productService from '../../services/productService';
import orderService from '../../services/orderService';
import customerService from '../../services/customerService';
import bannerService from '../../services/bannerService';

// Đồng bộ đúng với danh sách trạng thái backend chấp nhận
// (OrderService.VALID_STATUSES: pending, confirmed, shipping, completed, cancelled)
const STATUS_LABELS = {
  pending: { label: 'Chờ xử lý', className: 'status-pending' },
  confirmed: { label: 'Đã xác nhận', className: 'status-processing' },
  shipping: { label: 'Đang giao', className: 'status-processing' },
  completed: { label: 'Hoàn thành', className: 'status-completed' },
  cancelled: { label: 'Đã hủy', className: 'status-cancelled' },
};

function AdminDashboardPage() {
  const [stats, setStats] = useState({
    products: 0,
    orders: 0,
    customers: 0,
    banners: 0,
    revenue: 0,
    pendingOrders: 0,
  });
  const [allOrders, setAllOrders] = useState([]);
  const [recentOrders, setRecentOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [chartMode, setChartMode] = useState('day'); // 'day' | 'month'

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const [products, orders, customers, banners] = await Promise.all([
          productService.getAll(),
          orderService.getAll(),
          customerService.getAll(),
          bannerService.getAll(),
        ]);
        const revenue = orders
          .filter((o) => o.status === 'completed')
          .reduce((sum, o) => sum + (o.totalAmount || 0), 0);
        const pendingOrders = orders.filter((o) => o.status === 'pending').length;
        setStats({
          products: products.length,
          orders: orders.length,
          customers: customers.length,
          banners: banners.length,
          revenue,
          pendingOrders,
        });
        setAllOrders(orders);
        setRecentOrders(
          [...orders]
            .sort((a, b) => new Date(b.orderDate) - new Date(a.orderDate))
            .slice(0, 5)
        );
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchStats();
  }, []);

  const formatPrice = (price) =>
    new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(price || 0);

  const formatPriceShort = (price) => {
    if (!price) return '0';
    if (price >= 1_000_000) return `${(price / 1_000_000).toFixed(1)}tr`;
    if (price >= 1_000) return `${(price / 1_000).toFixed(0)}k`;
    return String(price);
  };

  // Đơn hàng đã hủy không tính vào doanh thu / sản phẩm bán chạy
  const validOrders = useMemo(
    () => allOrders.filter((o) => o.status !== 'cancelled'),
    [allOrders]
  );

  // ===== Doanh thu theo ngày (14 ngày gần nhất) hoặc theo tháng (6 tháng gần nhất) =====
  const revenueChartData = useMemo(() => {
    if (chartMode === 'day') {
      const days = [];
      for (let i = 13; i >= 0; i--) {
        const d = new Date();
        d.setDate(d.getDate() - i);
        days.push(d);
      }
      return days.map((d) => {
        const key = d.toISOString().slice(0, 10);
        const total = validOrders
          .filter((o) => o.orderDate && o.orderDate.slice(0, 10) === key)
          .reduce((sum, o) => sum + (o.totalAmount || 0), 0);
        return { label: `${d.getDate()}/${d.getMonth() + 1}`, value: total };
      });
    }
    // chartMode === 'month'
    const months = [];
    for (let i = 5; i >= 0; i--) {
      const d = new Date();
      d.setMonth(d.getMonth() - i);
      months.push(d);
    }
    return months.map((d) => {
      const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
      const total = validOrders
        .filter((o) => o.orderDate && o.orderDate.slice(0, 7) === key)
        .reduce((sum, o) => sum + (o.totalAmount || 0), 0);
      return { label: `Th${d.getMonth() + 1}/${d.getFullYear()}`, value: total };
    });
  }, [validOrders, chartMode]);

  const maxRevenue = Math.max(1, ...revenueChartData.map((d) => d.value));

  // ===== Top 5 sản phẩm bán chạy (theo số lượng đã bán, tính từ orderDetails) =====
  const topProducts = useMemo(() => {
    const map = new Map();
    validOrders.forEach((order) => {
      (order.orderDetails || []).forEach((detail) => {
        const key = detail.productId;
        const prev = map.get(key) || { name: detail.productName, quantity: 0, revenue: 0 };
        prev.quantity += detail.quantity || 0;
        prev.revenue += (detail.quantity || 0) * (detail.unitPrice || 0);
        map.set(key, prev);
      });
    });
    return Array.from(map.values())
      .sort((a, b) => b.quantity - a.quantity)
      .slice(0, 5);
  }, [validOrders]);

  const maxQuantity = Math.max(1, ...topProducts.map((p) => p.quantity));

  const statCards = [
    { icon: '📦', label: 'Sản phẩm', value: stats.products, link: '/admin/products', color: '#6c63ff' },
    { icon: '🛒', label: 'Đơn hàng', value: stats.orders, link: '/admin/orders', color: '#f59e0b' },
    { icon: '👥', label: 'Thành viên', value: stats.customers, link: '/admin/customers', color: '#10b981' },
    { icon: '⏳', label: 'Chờ xử lý', value: stats.pendingOrders, link: '/admin/orders', color: '#ef4444' },
    { icon: '🖼️', label: 'Banner', value: stats.banners, link: '/admin/banners', color: '#3b82f6' },
    { icon: '💰', label: 'Doanh thu', value: formatPrice(stats.revenue), link: '/admin/orders', color: '#8b5cf6' },
  ];

  return (
    <div className="admin-layout">
      <AdminSidebar />
      <main className="admin-main">
        <div className="admin-page-header">
          <h1>📊 Tổng Quan</h1>
          <span className="record-count">Bảng điều khiển</span>
        </div>

        {loading ? (
          <div className="loading-spinner">
            <div className="spinner"></div>
            <p>Đang tải...</p>
          </div>
        ) : (
          <>
            {/* Stat Cards */}
            <div className="dashboard-stats">
              {statCards.map((card) => (
                <Link to={card.link} key={card.label} className="stat-card" style={{ '--card-color': card.color }}>
                  <div className="stat-card-icon">{card.icon}</div>
                  <div className="stat-card-info">
                    <span className="stat-card-value">{card.value}</span>
                    <span className="stat-card-label">{card.label}</span>
                  </div>
                </Link>
              ))}
            </div>

            {/* Charts */}
            <div className="dashboard-charts">
              {/* Revenue chart */}
              <div className="chart-card">
                <div className="chart-card-header">
                  <h2>Doanh thu {chartMode === 'day' ? '14 ngày gần nhất' : '6 tháng gần nhất'}</h2>
                  <div className="chart-toggle">
                    <button
                      className={`btn ${chartMode === 'day' ? 'btn-primary' : 'btn-outline'}`}
                      onClick={() => setChartMode('day')}
                    >
                      Theo ngày
                    </button>
                    <button
                      className={`btn ${chartMode === 'month' ? 'btn-primary' : 'btn-outline'}`}
                      onClick={() => setChartMode('month')}
                    >
                      Theo tháng
                    </button>
                  </div>
                </div>

                {revenueChartData.every((d) => d.value === 0) ? (
                  <p style={{ color: '#888', padding: '20px 0' }}>Chưa có dữ liệu doanh thu trong giai đoạn này.</p>
                ) : (
                  <div className="bar-chart">
                    {revenueChartData.map((d) => (
                      <div className="bar-chart-col" key={d.label} title={`${d.label}: ${formatPrice(d.value)}`}>
                        <div className="bar-chart-value">{d.value > 0 ? formatPriceShort(d.value) : ''}</div>
                        <div
                          className="bar-chart-bar"
                          style={{ height: `${Math.max(4, (d.value / maxRevenue) * 100)}%` }}
                        />
                        <div className="bar-chart-label">{d.label}</div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Top selling products */}
              <div className="chart-card">
                <div className="chart-card-header">
                  <h2>🏆 Top sản phẩm bán chạy</h2>
                </div>
                {topProducts.length === 0 ? (
                  <p style={{ color: '#888', padding: '20px 0' }}>Chưa có dữ liệu bán hàng.</p>
                ) : (
                  <div className="top-products-list">
                    {topProducts.map((p, i) => (
                      <div className="top-product-item" key={p.name + i}>
                        <span className="top-product-rank">#{i + 1}</span>
                        <div className="top-product-info">
                          <div className="top-product-name">{p.name}</div>
                          <div className="top-product-bar-track">
                            <div
                              className="top-product-bar-fill"
                              style={{ width: `${(p.quantity / maxQuantity) * 100}%` }}
                            />
                          </div>
                        </div>
                        <div className="top-product-qty">
                          <strong>{p.quantity}</strong> đã bán
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* Quick Links */}
            <div className="dashboard-quick">
              <h2>Thao tác nhanh</h2>
              <div className="quick-links">
                <Link to="/admin/products/create" className="quick-link">+ Thêm sản phẩm</Link>
                <Link to="/admin/categories/create" className="quick-link">+ Thêm danh mục</Link>
                <Link to="/admin/posts/create" className="quick-link">+ Thêm bài viết</Link>
                <Link to="/admin/banners/create" className="quick-link">+ Thêm banner</Link>
              </div>
            </div>

            {/* Recent Orders */}
            <div className="dashboard-recent">
              <div className="dashboard-recent-header">
                <h2>Đơn hàng gần đây</h2>
                <Link to="/admin/orders" className="section-link">Xem tất cả →</Link>
              </div>
              {recentOrders.length === 0 ? (
                <p style={{ color: '#888', padding: '20px 0' }}>Chưa có đơn hàng nào.</p>
              ) : (
                <div className="admin-table-wrapper">
                  <table className="admin-table">
                    <thead>
                      <tr>
                        <th>#</th>
                        <th>Khách hàng</th>
                        <th>Tổng tiền</th>
                        <th>Trạng thái</th>
                      </tr>
                    </thead>
                    <tbody>
                      {recentOrders.map((order) => (
                        <tr key={order.id}>
                          <td>#{order.id}</td>
                          <td><strong>{order.customerName}</strong></td>
                          <td><strong style={{ color: '#e55' }}>{formatPrice(order.totalAmount)}</strong></td>
                          <td>
                            <span className={`status-badge ${STATUS_LABELS[order.status]?.className || ''}`}>
                              {STATUS_LABELS[order.status]?.label || order.status}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </>
        )}
      </main>
    </div>
  );
}

export default AdminDashboardPage;
