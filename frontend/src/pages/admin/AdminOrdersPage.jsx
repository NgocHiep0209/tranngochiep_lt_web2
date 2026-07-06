import React, { useEffect, useMemo, useState } from 'react';
import * as XLSX from 'xlsx';
import orderService from '../../services/orderService';
import AdminSidebar from '../../components/admin/AdminSidebar';

// Đồng bộ đúng với danh sách trạng thái backend chấp nhận
// (OrderService.VALID_STATUSES: pending, confirmed, shipping, completed, cancelled)
const STATUS_LABELS = {
  pending: { label: 'Chờ xử lý', className: 'status-pending' },
  confirmed: { label: 'Đã xác nhận', className: 'status-processing' },
  shipping: { label: 'Đang giao', className: 'status-processing' },
  completed: { label: 'Hoàn thành', className: 'status-completed' },
  cancelled: { label: 'Đã hủy', className: 'status-cancelled' },
};

const PAGE_SIZE = 10;

function AdminOrdersPage() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [keyword, setKeyword] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [page, setPage] = useState(0);

  useEffect(() => {
    orderService.getAll()
      .then((orders) => setOrders(orders))
      .catch((err) => console.error(err))
      .finally(() => setLoading(false));
  }, []);

  const handleStatusChange = async (orderId, newStatus) => {
    try {
      const res = await orderService.updateStatus(orderId, newStatus);
      setOrders((prev) =>
        prev.map((o) => (o.id === orderId ? { ...o, status: res.status } : o))
      );
    } catch (err) {
      alert('Cập nhật trạng thái thất bại!');
    }
  };

  const formatPrice = (price) =>
    new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(price || 0);

  const formatDate = (dateStr) => {
    if (!dateStr) return '-';
    const d = new Date(dateStr);
    return d.toLocaleString('vi-VN');
  };

  // Lọc theo từ khóa (mã đơn, tên KH, SĐT) và trạng thái
  const filtered = useMemo(() => {
    const kw = keyword.trim().toLowerCase();
    return orders.filter((o) => {
      const matchKeyword =
        !kw ||
        String(o.id).includes(kw) ||
        o.customerName?.toLowerCase().includes(kw) ||
        o.customerPhone?.toLowerCase().includes(kw);
      const matchStatus = !statusFilter || o.status === statusFilter;
      return matchKeyword && matchStatus;
    });
  }, [orders, keyword, statusFilter]);

  useEffect(() => {
    setPage(0);
  }, [keyword, statusFilter]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const paginated = filtered.slice(page * PAGE_SIZE, page * PAGE_SIZE + PAGE_SIZE);

  // ===== Xuất Excel (toàn bộ danh sách đã lọc, không chỉ trang hiện tại) =====
  const handleExportExcel = () => {
    const rows = filtered.map((o) => ({
      'Mã đơn': o.id,
      'Khách hàng': o.customerName,
      'Số điện thoại': o.customerPhone,
      'Địa chỉ': o.customerAddress,
      'Ngày đặt': formatDate(o.orderDate),
      'Tổng tiền (VNĐ)': o.totalAmount,
      'Trạng thái': STATUS_LABELS[o.status]?.label || o.status,
      'Ghi chú': o.note || '',
    }));
    const worksheet = XLSX.utils.json_to_sheet(rows);
    worksheet['!cols'] = [
      { wch: 8 }, { wch: 22 }, { wch: 14 }, { wch: 30 },
      { wch: 18 }, { wch: 16 }, { wch: 14 }, { wch: 24 },
    ];
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Đơn hàng');
    const today = new Date().toISOString().slice(0, 10);
    XLSX.writeFile(workbook, `don-hang-${today}.xlsx`);
  };

  // ===== Xuất PDF: mở cửa sổ in với bảng đã định dạng, dùng "Save as PDF" của trình duyệt =====
  const handleExportPdf = () => {
    const rowsHtml = filtered.map((o) => `
      <tr>
        <td>#${o.id}</td>
        <td>${o.customerName || ''}</td>
        <td>${o.customerPhone || ''}</td>
        <td>${o.customerAddress || ''}</td>
        <td>${formatDate(o.orderDate)}</td>
        <td style="text-align:right">${formatPrice(o.totalAmount)}</td>
        <td>${STATUS_LABELS[o.status]?.label || o.status}</td>
      </tr>
    `).join('');

    const html = `
      <html>
        <head>
          <title>Danh sách đơn hàng</title>
          <meta charset="utf-8" />
          <style>
            body { font-family: Arial, sans-serif; padding: 24px; color: #222; }
            h1 { font-size: 20px; margin-bottom: 4px; }
            p.meta { color: #666; margin-top: 0; margin-bottom: 16px; font-size: 13px; }
            table { width: 100%; border-collapse: collapse; font-size: 12px; }
            th, td { border: 1px solid #ccc; padding: 6px 8px; text-align: left; }
            th { background: #f2f2f2; }
          </style>
        </head>
        <body>
          <h1>Fashion Store — Danh sách đơn hàng</h1>
          <p class="meta">Xuất ngày ${new Date().toLocaleString('vi-VN')} — Tổng ${filtered.length} đơn</p>
          <table>
            <thead>
              <tr>
                <th>Mã đơn</th><th>Khách hàng</th><th>SĐT</th><th>Địa chỉ</th>
                <th>Ngày đặt</th><th>Tổng tiền</th><th>Trạng thái</th>
              </tr>
            </thead>
            <tbody>${rowsHtml}</tbody>
          </table>
        </body>
      </html>
    `;

    const printWindow = window.open('', '_blank');
    if (!printWindow) {
      alert('Trình duyệt đã chặn cửa sổ in. Vui lòng cho phép popup để xuất PDF.');
      return;
    }
    printWindow.document.write(html);
    printWindow.document.close();
    printWindow.focus();
    // Đợi nội dung render xong rồi mới gọi in, để trình duyệt hiện hộp thoại "Save as PDF"
    setTimeout(() => printWindow.print(), 300);
  };

  return (
    <div className="admin-layout">
      <AdminSidebar />
      <main className="admin-main">
        <div className="admin-page-header">
          <h1>Quản Lý Đơn Hàng</h1>
          <div style={{ display: 'flex', gap: 8 }}>
            <button className="btn btn-outline" onClick={handleExportExcel}>📊 Xuất Excel</button>
            <button className="btn btn-outline" onClick={handleExportPdf}>🧾 Xuất PDF</button>
          </div>
        </div>

        <div className="admin-toolbar">
          <form onSubmit={(e) => e.preventDefault()} className="admin-search">
            <input
              type="text"
              placeholder="Tìm theo mã đơn, tên khách hàng, SĐT..."
              value={keyword}
              onChange={(e) => setKeyword(e.target.value)}
            />
            <select
              className="status-select"
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
            >
              <option value="">Tất cả trạng thái</option>
              <option value="pending">Chờ xử lý</option>
              <option value="confirmed">Đã xác nhận</option>
              <option value="shipping">Đang giao</option>
              <option value="completed">Hoàn thành</option>
              <option value="cancelled">Đã hủy</option>
            </select>
          </form>
          <span className="record-count">{filtered.length} đơn hàng</span>
        </div>

        {loading ? (
          <div className="loading-spinner">
            <div className="spinner"></div>
            <p>Đang tải...</p>
          </div>
        ) : (
          <>
            <div className="admin-table-wrapper">
              <table className="admin-table">
                <thead>
                  <tr>
                    <th>#</th>
                    <th>Khách hàng</th>
                    <th>Số điện thoại</th>
                    <th>Địa chỉ</th>
                    <th>Ngày đặt</th>
                    <th>Tổng tiền</th>
                    <th>Trạng thái</th>
                    <th>Cập nhật</th>
                  </tr>
                </thead>
                <tbody>
                  {paginated.length === 0 ? (
                    <tr>
                      <td colSpan="8" style={{ textAlign: 'center', padding: '40px' }}>
                        Không tìm thấy đơn hàng nào
                      </td>
                    </tr>
                  ) : (
                    paginated.map((order) => (
                      <tr key={order.id}>
                        <td>#{order.id}</td>
                        <td>
                          <strong>{order.customerName}</strong>
                          {order.note && (
                            <p style={{ color: '#999', fontSize: '12px', margin: '2px 0 0' }}>
                              📝 {order.note}
                            </p>
                          )}
                        </td>
                        <td>{order.customerPhone}</td>
                        <td style={{ maxWidth: '180px', wordBreak: 'break-word' }}>
                          {order.customerAddress}
                        </td>
                        <td>{formatDate(order.orderDate)}</td>
                        <td>
                          <strong style={{ color: '#e55' }}>
                            {formatPrice(order.totalAmount)}
                          </strong>
                        </td>
                        <td>
                          <span className={`status-badge ${STATUS_LABELS[order.status]?.className || ''}`}>
                            {STATUS_LABELS[order.status]?.label || order.status}
                          </span>
                        </td>
                        <td>
                          <select
                            className="status-select"
                            value={order.status}
                            onChange={(e) => handleStatusChange(order.id, e.target.value)}
                          >
                            <option value="pending">Chờ xử lý</option>
                            <option value="confirmed">Đã xác nhận</option>
                            <option value="shipping">Đang giao</option>
                            <option value="completed">Hoàn thành</option>
                            <option value="cancelled">Đã hủy</option>
                          </select>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>

            {totalPages > 1 && (
              <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: 8, marginTop: 24 }}>
                <button
                  className="btn btn-outline"
                  disabled={page === 0}
                  onClick={() => setPage((p) => p - 1)}
                >
                  ← Trước
                </button>
                <span style={{ padding: '0 8px' }}>Trang {page + 1} / {totalPages}</span>
                <button
                  className="btn btn-outline"
                  disabled={page >= totalPages - 1}
                  onClick={() => setPage((p) => p + 1)}
                >
                  Sau →
                </button>
              </div>
            )}
          </>
        )}
      </main>
    </div>
  );
}

export default AdminOrdersPage;
