import React, { useEffect, useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import postService from '../../services/postService';

function PostDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [post, setPost] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    postService.getById(id)
      .then((res) => setPost(res))
      .catch(() => navigate('/posts'))
      .finally(() => setLoading(false));
  }, [id, navigate]);

  const formatDate = (dateStr) => {
    if (!dateStr) return '';
    return new Date(dateStr).toLocaleDateString('vi-VN', {
      weekday: 'long', day: '2-digit', month: '2-digit', year: 'numeric',
    });
  };

  if (loading) {
    return (
      <div className="loading-spinner" style={{ minHeight: '60vh' }}>
        <div className="spinner"></div>
        <p>Đang tải bài viết...</p>
      </div>
    );
  }

  if (!post) return null;

  return (
    <div className="post-detail-page">
      <div className="post-detail-breadcrumb">
        <Link to="/">Trang chủ</Link>
        <span> / </span>
        <Link to="/posts">Bài viết</Link>
        <span> / </span>
        <span className="active">{post.title}</span>
      </div>

      <article className="post-detail-article">
        {post.imageUrl && (
          <div className="post-detail-hero-img">
            <img
              src={post.imageUrl}
              alt={post.title}
              onError={(e) => { e.target.style.display = 'none'; }}
            />
          </div>
        )}

        <div className="post-detail-content">
          <div className="post-detail-meta">
            {post.author && <span>✍️ {post.author}</span>}
            <span>📅 {formatDate(post.createdAt)}</span>
          </div>

          <h1 className="post-detail-title">{post.title}</h1>

          {post.summary && (
            <p className="post-detail-summary">{post.summary}</p>
          )}

          <div className="post-detail-body">
            {post.content?.split('\n').map((paragraph, i) =>
              paragraph.trim() ? <p key={i}>{paragraph}</p> : <br key={i} />
            )}
          </div>
        </div>
      </article>

      <div className="post-detail-footer">
        <Link to="/posts" className="btn btn-outline">← Xem bài viết khác</Link>
        <Link to="/products" className="btn btn-primary">Mua sắm ngay →</Link>
      </div>
    </div>
  );
}

export default PostDetailPage;
