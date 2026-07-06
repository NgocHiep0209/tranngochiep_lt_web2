import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import postService from '../../services/postService';

function PostsPage() {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    postService.getActive()
      .then((res) => setPosts(res))
      .catch((err) => console.error(err))
      .finally(() => setLoading(false));
  }, []);

  const formatDate = (dateStr) => {
    if (!dateStr) return '';
    return new Date(dateStr).toLocaleDateString('vi-VN', {
      day: '2-digit', month: '2-digit', year: 'numeric',
    });
  };

  return (
    <div className="posts-page">
      <div className="posts-hero">
        <h1>📰 Bài Viết & Tin Tức</h1>
        <p>Cập nhật xu hướng thời trang mới nhất, bí quyết phối đồ và nhiều hơn nữa</p>
      </div>

      <div className="posts-container">
        {loading ? (
          <div className="loading-spinner">
            <div className="spinner"></div>
            <p>Đang tải bài viết...</p>
          </div>
        ) : posts.length === 0 ? (
          <div className="posts-empty">
            <span>📭</span>
            <p>Chưa có bài viết nào. Hãy quay lại sau!</p>
            <Link to="/" className="btn btn-primary">Về trang chủ</Link>
          </div>
        ) : (
          <div className="posts-grid">
            {posts.map((post) => (
              <Link key={post.id} to={`/posts/${post.id}`} className="post-card">
                <div className="post-card-img">
                  <img
                    src={post.imageUrl || 'https://placehold.co/400x220/1a1a2e/ffffff?text=Fashion+Blog'}
                    alt={post.title}
                    onError={(e) => { e.target.src = 'https://placehold.co/400x220/1a1a2e/ffffff?text=Blog'; }}
                  />
                </div>
                <div className="post-card-body">
                  <div className="post-card-meta">
                    <span className="post-date">📅 {formatDate(post.createdAt)}</span>
                    {post.author && <span className="post-author">✍️ {post.author}</span>}
                  </div>
                  <h3 className="post-card-title">{post.title}</h3>
                  {post.summary && <p className="post-card-summary">{post.summary}</p>}
                  <span className="post-read-more">Đọc tiếp →</span>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export default PostsPage;
