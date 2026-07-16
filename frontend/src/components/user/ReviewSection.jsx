import React, { useEffect, useState, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import reviewService from '../../services/reviewService';

function Stars({ value, size = 18, onSelect }) {
  const stars = [1, 2, 3, 4, 5];
  return (
    <span style={{ display: 'inline-flex', gap: 2 }}>
      {stars.map((n) => (
        <span
          key={n}
          onClick={onSelect ? () => onSelect(n) : undefined}
          style={{
            fontSize: size,
            cursor: onSelect ? 'pointer' : 'default',
            color: n <= value ? '#f5a623' : '#d8d8d8',
            lineHeight: 1,
          }}
        >
          ★
        </span>
      ))}
    </span>
  );
}

function ReviewSection({ productId }) {
  const { currentUser, isLoggedIn } = useAuth();
  const [reviews, setReviews] = useState([]);
  const [summary, setSummary] = useState({ average: 0, count: 0 });
  const [loading, setLoading] = useState(true);
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [formError, setFormError] = useState('');
  const [formSuccess, setFormSuccess] = useState('');

  const loadReviews = useCallback(() => {
    setLoading(true);
    Promise.all([
      reviewService.getByProduct(productId),
      reviewService.getSummary(productId),
    ])
      .then(([list, sum]) => {
        setReviews(list || []);
        setSummary(sum || { average: 0, count: 0 });
      })
      .catch((err) => console.error('Lỗi tải đánh giá:', err))
      .finally(() => setLoading(false));
  }, [productId]);

  useEffect(() => {
    loadReviews();
  }, [loadReviews]);

  const hasAlreadyReviewed = isLoggedIn() && reviews.some((r) => r.customerId === currentUser?.id);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setFormError('');
    setFormSuccess('');
    setSubmitting(true);
    try {
      await reviewService.create({ productId: Number(productId), rating, comment });
      setComment('');
      setRating(5);
      setFormSuccess('Cảm ơn bạn đã đánh giá sản phẩm!');
      loadReviews();
    } catch (err) {
      setFormError(
        err.response?.data?.message || 'Không thể gửi đánh giá. Vui lòng thử lại.'
      );
    } finally {
      setSubmitting(false);
    }
  };

  const formatDate = (d) => (d ? new Date(d).toLocaleDateString('vi-VN') : '');

  return (
    <section className="review-section">
      <h3 className="review-section-title">⭐ Đánh giá sản phẩm</h3>

      <div className="review-summary">
        <span className="review-summary-average">{summary.average?.toFixed?.(1) ?? summary.average}</span>
        <div>
          <Stars value={Math.round(summary.average || 0)} />
          <p className="review-summary-count">{summary.count || 0} đánh giá</p>
        </div>
      </div>

      {loading ? (
        <p>Đang tải đánh giá...</p>
      ) : reviews.length === 0 ? (
        <p className="review-empty">Chưa có đánh giá nào cho sản phẩm này. Hãy là người đầu tiên!</p>
      ) : (
        <ul className="review-list">
          {reviews.map((r) => (
            <li key={r.id} className="review-item">
              <div className="review-item-head">
                <strong>{r.customerName || 'Khách hàng'}</strong>
                <span className="review-item-date">{formatDate(r.createdAt)}</span>
              </div>
              <Stars value={r.rating} size={14} />
              {r.comment && <p className="review-item-comment">{r.comment}</p>}
            </li>
          ))}
        </ul>
      )}

      <div className="review-form-wrapper">
        {!isLoggedIn() ? (
          <p className="review-login-prompt">
            <Link to="/login">Đăng nhập</Link> để chia sẻ đánh giá của bạn về sản phẩm này.
          </p>
        ) : hasAlreadyReviewed ? (
          <p className="review-login-prompt">Bạn đã đánh giá sản phẩm này. Cảm ơn bạn!</p>
        ) : (
          <form className="review-form" onSubmit={handleSubmit}>
            <h4>Viết đánh giá của bạn</h4>
            <div className="review-form-row">
              <span>Số sao:</span>
              <Stars value={rating} size={24} onSelect={setRating} />
            </div>
            <textarea
              placeholder="Chia sẻ cảm nhận của bạn về sản phẩm (không bắt buộc)..."
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              rows={3}
            />
            {formError && <p className="form-error">{formError}</p>}
            {formSuccess && <p className="form-success">{formSuccess}</p>}
            <button type="submit" className="btn btn-primary" disabled={submitting}>
              {submitting ? 'Đang gửi...' : 'Gửi đánh giá'}
            </button>
          </form>
        )}
      </div>
    </section>
  );
}

export default ReviewSection;
