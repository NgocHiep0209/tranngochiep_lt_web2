import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import couponService from '../../services/couponService';

function formatVnd(amount) {
  return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(amount || 0);
}

function formatDiscount(v) {
  if (v.discountType === 'PERCENT') {
    return `Giảm ${v.discountValue}%` + (v.maxDiscountAmount ? ` (tối đa ${formatVnd(v.maxDiscountAmount)})` : '');
  }
  return `Giảm ${formatVnd(v.discountValue)}`;
}

function VoucherCenterModal({ onClose }) {
  const currentUser = (() => {
    try {
      return JSON.parse(localStorage.getItem('currentUser') || 'null');
    } catch {
      return null;
    }
  })();

  const [vouchers, setVouchers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [claimingId, setClaimingId] = useState(null);
  const [error, setError] = useState('');

  const loadVouchers = () => {
    setLoading(true);
    couponService
      .getAvailable(currentUser?.id)
      .then(setVouchers)
      .catch(() => setError('Không tải được danh sách voucher'))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    loadVouchers();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleClaim = async (voucher) => {
    if (!currentUser) return;
    setClaimingId(voucher.couponId);
    setError('');
    try {
      await couponService.claim(currentUser.id, voucher.couponId);
      setVouchers((prev) =>
        prev.map((v) => (v.couponId === voucher.couponId ? { ...v, claimed: true, used: false } : v))
      );
    } catch (err) {
      setError(err.response?.data?.message || 'Không thể nhận voucher này');
    } finally {
      setClaimingId(null);
    }
  };

  return (
    <div className="voucher-modal-overlay" onClick={onClose}>
      <div className="voucher-modal" onClick={(e) => e.stopPropagation()}>
        <div className="voucher-modal-header">
          <h3>🎟️ Kho Voucher</h3>
          <button className="voucher-modal-close" onClick={onClose}>✕</button>
        </div>

        <div className="voucher-modal-body">
          {!currentUser && (
            <div className="voucher-modal-guest-note">
              <Link to="/login" onClick={onClose}>Đăng nhập</Link> để nhận voucher về ví và sử dụng khi thanh toán.
            </div>
          )}

          {error && <div className="alert-error" style={{ marginBottom: 12 }}>{error}</div>}

          {loading ? (
            <div className="loading-spinner">
              <div className="spinner"></div>
            </div>
          ) : vouchers.length === 0 ? (
            <p style={{ color: 'var(--text-light)', textAlign: 'center', padding: '24px 0' }}>
              Hiện chưa có voucher nào khả dụng.
            </p>
          ) : (
            <div className="voucher-list">
              {vouchers.map((v) => (
                <div className="voucher-card" key={v.couponId}>
                  <div className="voucher-card-left">
                    <span className="voucher-card-value">{formatDiscount(v)}</span>
                    <span className="voucher-card-code">{v.code}</span>
                  </div>
                  <div className="voucher-card-right">
                    <p className="voucher-card-desc">{v.description}</p>
                    {v.minOrderAmount ? (
                      <p className="voucher-card-condition">Đơn tối thiểu {formatVnd(v.minOrderAmount)}</p>
                    ) : null}
                    {v.endDate && (
                      <p className="voucher-card-condition">
                        HSD: {new Date(v.endDate).toLocaleDateString('vi-VN')}
                      </p>
                    )}
                    {!currentUser ? (
                      <button className="btn btn-outline voucher-card-btn" disabled>
                        Đăng nhập để nhận
                      </button>
                    ) : v.claimed ? (
                      <button className="btn voucher-card-btn voucher-card-btn-claimed" disabled>
                        ✓ Đã nhận
                      </button>
                    ) : (
                      <button
                        className="btn btn-primary voucher-card-btn"
                        onClick={() => handleClaim(v)}
                        disabled={claimingId === v.couponId}
                      >
                        {claimingId === v.couponId ? 'Đang nhận...' : 'Nhận voucher'}
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default VoucherCenterModal;
